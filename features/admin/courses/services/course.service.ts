import { CourseRepository } from '../repositories/course.repository';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';

const courseRepository = new CourseRepository();

export class CourseService {
  async createCourse(
    input: { name: string; credits: number; semester: number; departmentId: string },
    adminUserId: string
  ) {
    const name = input.name.trim();

    // 1. Verify Department exists
    const dept = await prisma.department.findUnique({
      where: { id: input.departmentId },
    });
    if (!dept) {
      throw new Error('Associated department not found.');
    }

    return prisma.$transaction(async (tx) => {
      const course = await tx.course.create({
        data: {
          name,
          credits: input.credits,
          semester: input.semester,
          departmentId: input.departmentId,
        },
      });

      await tx.activityLog.create({
        data: {
          userId: adminUserId,
          action: 'COURSE_CREATED',
          details: { id: course.id, name: course.name, department: dept.code } as Prisma.InputJsonValue,
        },
      });

      return course;
    });
  }

  async updateCourse(
    id: string,
    input: { name: string; credits: number; semester: number; departmentId: string },
    adminUserId: string
  ) {
    const name = input.name.trim();

    const course = await courseRepository.findById(id);
    if (!course) {
      throw new Error('Course not found.');
    }

    // Verify Department exists (if changing)
    let deptCode = course.department?.code;
    if (course.departmentId !== input.departmentId) {
      const dept = await prisma.department.findUnique({
        where: { id: input.departmentId },
      });
      if (!dept) {
        throw new Error('Associated department not found.');
      }
      deptCode = dept.code;
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.course.update({
        where: { id },
        data: {
          name,
          credits: input.credits,
          semester: input.semester,
          departmentId: input.departmentId,
        },
      });

      await tx.activityLog.create({
        data: {
          userId: adminUserId,
          action: 'COURSE_UPDATED',
          details: { id, oldName: course.name, newName: name, department: deptCode } as Prisma.InputJsonValue,
        },
      });

      return updated;
    });
  }

  async deleteCourse(id: string, adminUserId: string) {
    const course = await courseRepository.findById(id);
    if (!course) {
      throw new Error('Course not found.');
    }

    // 1. Check linked Subjects
    const subjectCount = await prisma.subject.count({
      where: { courseId: id },
    });
    if (subjectCount > 0) {
      throw new Error(`Cannot delete course. There are ${subjectCount} subjects linked to it.`);
    }

    return prisma.$transaction(async (tx) => {
      const deleted = await tx.course.delete({
        where: { id },
      });

      await tx.activityLog.create({
        data: {
          userId: adminUserId,
          action: 'COURSE_DELETED',
          details: { id, name: course.name } as Prisma.InputJsonValue,
        },
      });

      return deleted;
    });
  }

  async listCourses(filters: { departmentId?: string; search?: string; page?: number; limit?: number } = {}) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.CourseWhereInput = {};

    if (filters.departmentId && filters.departmentId !== 'ALL') {
      where.departmentId = filters.departmentId;
    }

    if (filters.search) {
      const searchLower = filters.search.trim().toLowerCase();
      where.name = { contains: searchLower, mode: 'insensitive' };
    }

    const [courses, total] = await Promise.all([
      courseRepository.list({
        skip,
        take: limit,
        where,
        orderBy: { name: 'asc' },
      }),
      courseRepository.count(where),
    ]);

    return {
      courses,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
