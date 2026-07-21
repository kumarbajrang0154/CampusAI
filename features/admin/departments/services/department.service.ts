import { DepartmentRepository } from '../repositories/department.repository';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';

const departmentRepository = new DepartmentRepository();

export class DepartmentService {
  async createDepartment(
    input: { name: string; code: string },
    adminUserId: string
  ) {
    const code = input.code.trim().toUpperCase();
    const name = input.name.trim();

    // 1. Check unique name/code
    const existingCode = await departmentRepository.findByCode(code);
    if (existingCode) {
      throw new Error(`A department with code "${code}" already exists.`);
    }

    const existingName = await departmentRepository.findByName(name);
    if (existingName) {
      throw new Error(`A department with name "${name}" already exists.`);
    }

    // Transaction for atomic create + audit log
    return prisma.$transaction(async (tx) => {
      const dept = await tx.department.create({
        data: { name, code },
      });

      await tx.activityLog.create({
        data: {
          userId: adminUserId,
          action: 'DEPARTMENT_CREATED',
          details: { id: dept.id, code: dept.code, name: dept.name } as Prisma.InputJsonValue,
        },
      });

      return dept;
    });
  }

  async updateDepartment(
    id: string,
    input: { name: string; code: string },
    adminUserId: string
  ) {
    const code = input.code.trim().toUpperCase();
    const name = input.name.trim();

    const dept = await departmentRepository.findById(id);
    if (!dept) {
      throw new Error('Department not found.');
    }

    // Check unique code (if changing)
    if (dept.code !== code) {
      const existingCode = await departmentRepository.findByCode(code);
      if (existingCode) {
        throw new Error(`A department with code "${code}" already exists.`);
      }
    }

    // Check unique name (if changing)
    if (dept.name !== name) {
      const existingName = await departmentRepository.findByName(name);
      if (existingName) {
        throw new Error(`A department with name "${name}" already exists.`);
      }
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.department.update({
        where: { id },
        data: { name, code },
      });

      await tx.activityLog.create({
        data: {
          userId: adminUserId,
          action: 'DEPARTMENT_UPDATED',
          details: { id, oldCode: dept.code, newCode: code, oldName: dept.name, newName: name } as Prisma.InputJsonValue,
        },
      });

      return updated;
    });
  }

  async deleteDepartment(id: string, adminUserId: string) {
    const dept = await departmentRepository.findById(id);
    if (!dept) {
      throw new Error('Department not found.');
    }

    // 1. Check linked Students
    const studentCount = await prisma.student.count({
      where: { departmentId: id },
    });
    if (studentCount > 0) {
      throw new Error(`Cannot delete department. There are ${studentCount} students assigned to it.`);
    }

    // 2. Check linked Faculty
    const facultyCount = await prisma.faculty.count({
      where: { departmentId: id },
    });
    if (facultyCount > 0) {
      throw new Error(`Cannot delete department. There are ${facultyCount} faculty members assigned to it.`);
    }

    // 3. Check linked Courses
    const courseCount = await prisma.course.count({
      where: { departmentId: id },
    });
    if (courseCount > 0) {
      throw new Error(`Cannot delete department. There are ${courseCount} courses linked to it.`);
    }

    // 4. Check linked HOD
    const hod = await prisma.hOD.findUnique({
      where: { departmentId: id },
    });
    if (hod) {
      throw new Error('Cannot delete department. An HOD is assigned to it.');
    }

    return prisma.$transaction(async (tx) => {
      const deleted = await tx.department.delete({
        where: { id },
      });

      await tx.activityLog.create({
        data: {
          userId: adminUserId,
          action: 'DEPARTMENT_DELETED',
          details: { id, code: dept.code, name: dept.name } as Prisma.InputJsonValue,
        },
      });

      return deleted;
    });
  }

  async listDepartments(filters: { search?: string; page?: number; limit?: number } = {}) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.DepartmentWhereInput = {};

    if (filters.search) {
      const searchLower = filters.search.trim().toLowerCase();
      where.OR = [
        { code: { contains: searchLower, mode: 'insensitive' } },
        { name: { contains: searchLower, mode: 'insensitive' } },
      ];
    }

    const [departments, total] = await Promise.all([
      prisma.department.findMany({
        skip,
        take: limit,
        where,
        orderBy: { code: 'asc' },
        include: {
          _count: {
            select: {
              students: true,
              faculty: true,
              courses: true,
            },
          },
        },
      }),
      departmentRepository.count(where),
    ]);

    return {
      departments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
