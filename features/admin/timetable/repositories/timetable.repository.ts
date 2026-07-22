import prisma from '@/lib/prisma';
import { TimetableStatus, Prisma } from '@prisma/client';

export class TimetableRepository {
  async create(data: {
    departmentId: string;
    semester: number;
    section: string;
    academicYear: string;
    status: TimetableStatus;
  }) {
    return prisma.timetable.create({
      data,
      include: {
        department: true,
        slots: {
          include: {
            subject: true,
            faculty: {
              include: {
                user: true,
              },
            },
            classroom: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    return prisma.timetable.findUnique({
      where: { id },
      include: {
        department: true,
        slots: {
          include: {
            subject: true,
            faculty: {
              include: {
                user: true,
              },
            },
            classroom: true,
          },
          orderBy: [
            { day: 'asc' },
            { periodNumber: 'asc' },
          ],
        },
      },
    });
  }

  async list(params: {
    skip?: number;
    take?: number;
    where?: Prisma.TimetableWhereInput;
    orderBy?: Prisma.TimetableOrderByWithRelationInput;
  }) {
    return prisma.timetable.findMany({
      skip: params.skip,
      take: params.take,
      where: params.where,
      orderBy: params.orderBy || { createdAt: 'desc' },
      include: {
        department: true,
        _count: {
          select: { slots: true },
        },
      },
    });
  }

  async count(where?: Prisma.TimetableWhereInput) {
    return prisma.timetable.count({ where });
  }

  async updateStatus(id: string, status: TimetableStatus) {
    return prisma.timetable.update({
      where: { id },
      data: { status },
      include: { department: true },
    });
  }

  async delete(id: string) {
    return prisma.timetable.delete({
      where: { id },
    });
  }

  async upsertSlot(data: {
    timetableId: string;
    day: string;
    periodNumber: number;
    startTime: string;
    endTime: string;
    subjectId: string;
    facultyId: string;
    classroomId: string;
    slotId?: string;
  }) {
    if (data.slotId) {
      return prisma.timetableSlot.update({
        where: { id: data.slotId },
        data: {
          day: data.day,
          periodNumber: data.periodNumber,
          startTime: data.startTime,
          endTime: data.endTime,
          subjectId: data.subjectId,
          facultyId: data.facultyId,
          classroomId: data.classroomId,
        },
        include: {
          subject: true,
          faculty: { include: { user: true } },
          classroom: true,
        },
      });
    }

    return prisma.timetableSlot.create({
      data: {
        timetableId: data.timetableId,
        day: data.day,
        periodNumber: data.periodNumber,
        startTime: data.startTime,
        endTime: data.endTime,
        subjectId: data.subjectId,
        facultyId: data.facultyId,
        classroomId: data.classroomId,
      },
      include: {
        subject: true,
        faculty: { include: { user: true } },
        classroom: true,
      },
    });
  }

  async deleteSlot(slotId: string) {
    return prisma.timetableSlot.delete({
      where: { id: slotId },
    });
  }

  /**
   * Conflict Detection Queries:
   * Finds if the given faculty member is already teaching at the same Day + Period in ANY timetable slot
   */
  async findConflictingFacultySlot(
    day: string,
    periodNumber: number,
    facultyId: string,
    excludeSlotId?: string
  ) {
    return prisma.timetableSlot.findFirst({
      where: {
        day,
        periodNumber,
        facultyId,
        id: excludeSlotId ? { not: excludeSlotId } : undefined,
      },
      include: {
        subject: true,
        faculty: { include: { user: true } },
        classroom: true,
        timetable: {
          include: { department: true },
        },
      },
    });
  }

  /**
   * Conflict Detection Queries:
   * Finds if the given classroom is already booked at the same Day + Period in ANY timetable slot
   */
  async findConflictingClassroomSlot(
    day: string,
    periodNumber: number,
    classroomId: string,
    excludeSlotId?: string
  ) {
    return prisma.timetableSlot.findFirst({
      where: {
        day,
        periodNumber,
        classroomId,
        id: excludeSlotId ? { not: excludeSlotId } : undefined,
      },
      include: {
        subject: true,
        faculty: { include: { user: true } },
        classroom: true,
        timetable: {
          include: { department: true },
        },
      },
    });
  }

  async listPeriodTemplates() {
    return prisma.periodTemplate.findMany({
      orderBy: { periodNumber: 'asc' },
    });
  }

  async savePeriodTemplates(templates: Array<{
    periodNumber: number;
    startTime: string;
    endTime: string;
    isBreak: boolean;
    breakLabel?: string | null;
  }>) {
    return prisma.$transaction(async (tx) => {
      // Clear existing templates and recreate
      await tx.periodTemplate.deleteMany({});
      
      const created = [];
      for (const t of templates) {
        const item = await tx.periodTemplate.create({
          data: {
            periodNumber: t.periodNumber,
            startTime: t.startTime,
            endTime: t.endTime,
            isBreak: t.isBreak,
            breakLabel: t.breakLabel || null,
          },
        });
        created.push(item);
      }

      return created;
    });
  }
}
