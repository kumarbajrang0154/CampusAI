import { SubjectRepository } from '../repositories/subject.repository';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';

const subjectRepository = new SubjectRepository();

export class SubjectService {
  async createSubject(
    input: { name: string; code: string; courseId: string; facultyId?: string | null },
    adminUserId: string
  ) {
    const code = input.code.trim().toUpperCase();
    const name = input.name.trim();

    // 1. Verify Unique Code
    const existingCode = await subjectRepository.findByCode(code);
    if (existingCode) {
      throw new Error(`A subject with code "${code}" already exists.`);
    }

    // 2. Verify Course exists
    const course = await prisma.course.findUnique({
      where: { id: input.courseId },
    });
    if (!course) {
      throw new Error('Associated course not found.');
    }

    // 3. Verify Faculty exists (if provided)
    if (input.facultyId) {
      const faculty = await prisma.faculty.findUnique({
        where: { id: input.facultyId },
      });
      if (!faculty) {
        throw new Error('Associated faculty not found.');
      }
    }

    return prisma.$transaction(async (tx) => {
      const subject = await tx.subject.create({
        data: {
          name,
          code,
          courseId: input.courseId,
          facultyId: input.facultyId || null,
        },
      });

      await tx.activityLog.create({
        data: {
          userId: adminUserId,
          action: 'SUBJECT_CREATED',
          details: { id: subject.id, code: subject.code, name: subject.name } as Prisma.InputJsonValue,
        },
      });

      return subject;
    });
  }

  async updateSubject(
    id: string,
    input: { name: string; code: string; courseId: string; facultyId?: string | null },
    adminUserId: string
  ) {
    const code = input.code.trim().toUpperCase();
    const name = input.name.trim();

    const subject = await subjectRepository.findById(id);
    if (!subject) {
      throw new Error('Subject not found.');
    }

    // Verify unique code if changing
    if (subject.code !== code) {
      const existingCode = await subjectRepository.findByCode(code);
      if (existingCode) {
        throw new Error(`A subject with code "${code}" already exists.`);
      }
    }

    // Verify Course exists
    if (subject.courseId !== input.courseId) {
      const course = await prisma.course.findUnique({
        where: { id: input.courseId },
      });
      if (!course) {
        throw new Error('Associated course not found.');
      }
    }

    // Verify Faculty exists
    if (input.facultyId && subject.facultyId !== input.facultyId) {
      const faculty = await prisma.faculty.findUnique({
        where: { id: input.facultyId },
      });
      if (!faculty) {
        throw new Error('Associated faculty not found.');
      }
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.subject.update({
        where: { id },
        data: {
          name,
          code,
          courseId: input.courseId,
          facultyId: input.facultyId || null,
        },
      });

      await tx.activityLog.create({
        data: {
          userId: adminUserId,
          action: 'SUBJECT_UPDATED',
          details: { id, oldCode: subject.code, newCode: code, oldName: subject.name, newName: name } as Prisma.InputJsonValue,
        },
      });

      return updated;
    });
  }

  async deleteSubject(id: string, adminUserId: string) {
    const subject = await subjectRepository.findById(id);
    if (!subject) {
      throw new Error('Subject not found.');
    }

    // 1. Check linked Modules
    const moduleCount = await prisma.module.count({
      where: { subjectId: id },
    });
    if (moduleCount > 0) {
      throw new Error(`Cannot delete subject. There are ${moduleCount} learning modules linked to it.`);
    }

    // 2. Check linked Assignments
    const assignmentCount = await prisma.assignment.count({
      where: { subjectId: id },
    });
    if (assignmentCount > 0) {
      throw new Error(`Cannot delete subject. There are ${assignmentCount} assignments linked to it.`);
    }

    // 3. Check linked Quizzes
    const quizCount = await prisma.quiz.count({
      where: { subjectId: id },
    });
    if (quizCount > 0) {
      throw new Error(`Cannot delete subject. There are ${quizCount} quizzes linked to it.`);
    }

    return prisma.$transaction(async (tx) => {
      const deleted = await tx.subject.delete({
        where: { id },
      });

      await tx.activityLog.create({
        data: {
          userId: adminUserId,
          action: 'SUBJECT_DELETED',
          details: { id, code: subject.code, name: subject.name } as Prisma.InputJsonValue,
        },
      });

      return deleted;
    });
  }

  async assignFaculty(id: string, facultyId: string | null, adminUserId: string) {
    const subject = await subjectRepository.findById(id);
    if (!subject) {
      throw new Error('Subject not found.');
    }

    let facultyName = 'Unassigned';
    if (facultyId) {
      const faculty = await prisma.faculty.findUnique({
        where: { id: facultyId },
        include: { user: true },
      });
      if (!faculty) {
        throw new Error('Faculty not found.');
      }
      facultyName = faculty.user.name || faculty.user.email;
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.subject.update({
        where: { id },
        data: { facultyId },
      });

      await tx.activityLog.create({
        data: {
          userId: adminUserId,
          action: 'SUBJECT_FACULTY_ASSIGNED',
          details: { id, code: subject.code, facultyId, facultyName } as Prisma.InputJsonValue,
        },
      });

      return updated;
    });
  }

  async listSubjects(filters: { courseId?: string; facultyId?: string; search?: string; page?: number; limit?: number } = {}) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.SubjectWhereInput = {};

    if (filters.courseId && filters.courseId !== 'ALL') {
      where.courseId = filters.courseId;
    }

    if (filters.facultyId && filters.facultyId !== 'ALL') {
      where.facultyId = filters.facultyId;
    }

    if (filters.search) {
      const searchLower = filters.search.trim().toLowerCase();
      where.OR = [
        { name: { contains: searchLower, mode: 'insensitive' } },
        { code: { contains: searchLower, mode: 'insensitive' } },
      ];
    }

    const [subjects, total] = await Promise.all([
      subjectRepository.list({
        skip,
        take: limit,
        where,
        orderBy: { code: 'asc' },
      }),
      subjectRepository.count(where),
    ]);

    return {
      subjects,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
