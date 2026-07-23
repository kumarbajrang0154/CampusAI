import prisma from '@/lib/prisma';
import { SemesterTerm, SemesterStatus } from '@prisma/client';
import { SemesterFormValues } from '../schemas/semester.schema';

export interface SemesterFilterOptions {
  search?: string;
  status?: SemesterStatus;
  term?: SemesterTerm;
  page?: number;
  limit?: number;
}

export class SemesterRepository {
  async listSemesters(options: SemesterFilterOptions = {}) {
    const { search, status, term, page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { academicYear: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (term) {
      where.term = term;
    }

    const [items, total] = await Promise.all([
      prisma.semester.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isCurrent: 'desc' }, { startDate: 'desc' }],
        include: {
          _count: {
            select: {
              academicCalendars: true,
            },
          },
        },
      }),
      prisma.semester.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getSemesterById(id: string) {
    return prisma.semester.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            academicCalendars: true,
          },
        },
      },
    });
  }

  async createSemester(data: SemesterFormValues) {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    // If marked as current on creation, unset all others in a transaction
    if (data.isCurrent) {
      return prisma.$transaction(async (tx) => {
        await tx.semester.updateMany({
          data: { isCurrent: false },
        });

        return tx.semester.create({
          data: {
            name: data.name,
            academicYear: data.academicYear,
            term: data.term,
            startDate,
            endDate,
            status: data.status,
            isCurrent: true,
          },
        });
      });
    }

    return prisma.semester.create({
      data: {
        name: data.name,
        academicYear: data.academicYear,
        term: data.term,
        startDate,
        endDate,
        status: data.status,
        isCurrent: false,
      },
    });
  }

  async updateSemester(id: string, data: SemesterFormValues) {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (data.isCurrent) {
      return prisma.$transaction(async (tx) => {
        await tx.semester.updateMany({
          where: { id: { not: id } },
          data: { isCurrent: false },
        });

        return tx.semester.update({
          where: { id },
          data: {
            name: data.name,
            academicYear: data.academicYear,
            term: data.term,
            startDate,
            endDate,
            status: data.status,
            isCurrent: true,
          },
        });
      });
    }

    return prisma.semester.update({
      where: { id },
      data: {
        name: data.name,
        academicYear: data.academicYear,
        term: data.term,
        startDate,
        endDate,
        status: data.status,
        isCurrent: false,
      },
    });
  }

  async setAsCurrent(id: string) {
    return prisma.$transaction(async (tx) => {
      // 1. Unset all existing current semesters
      await tx.semester.updateMany({
        data: { isCurrent: false },
      });

      // 2. Set selected semester as current and ACTIVE
      return tx.semester.update({
        where: { id },
        data: {
          isCurrent: true,
          status: SemesterStatus.ACTIVE,
        },
      });
    });
  }

  async checkDeleteBlocks(id: string) {
    const semester = await prisma.semester.findUnique({
      where: { id },
      select: {
        name: true,
        _count: {
          select: {
            academicCalendars: true,
          },
        },
      },
    });

    if (!semester) {
      throw new Error('Semester not found.');
    }

    const blocks: string[] = [];

    if (semester._count.academicCalendars > 0) {
      blocks.push(`${semester._count.academicCalendars} Academic Calendar events linked`);
    }

    return {
      canDelete: blocks.length === 0,
      semesterName: semester.name,
      blocks,
    };
  }

  async deleteSemester(id: string) {
    const deleteGate = await this.checkDeleteBlocks(id);

    if (!deleteGate.canDelete) {
      throw new Error(
        `Cannot delete semester "${deleteGate.semesterName}". It has active dependencies: ${deleteGate.blocks.join(', ')}.`
      );
    }

    return prisma.semester.delete({
      where: { id },
    });
  }
}
