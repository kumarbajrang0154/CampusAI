import { TimetableRepository } from '../repositories/timetable.repository';
import { TimetableStatus, Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { AssignSlotInput, CreateTimetableInput, PeriodTemplateInput } from '../schemas/timetable.schema';

const timetableRepository = new TimetableRepository();

// Default period templates if none exist
const DEFAULT_PERIODS = [
  { periodNumber: 1, startTime: '09:00', endTime: '10:00', isBreak: false },
  { periodNumber: 2, startTime: '10:00', endTime: '11:00', isBreak: false },
  { periodNumber: 3, startTime: '11:00', endTime: '11:15', isBreak: true, breakLabel: 'Tea Break' },
  { periodNumber: 4, startTime: '11:15', endTime: '12:15', isBreak: false },
  { periodNumber: 5, startTime: '12:15', endTime: '01:15', isBreak: false },
  { periodNumber: 6, startTime: '01:15', endTime: '02:00', isBreak: true, breakLabel: 'Lunch Break' },
  { periodNumber: 7, startTime: '02:00', endTime: '03:00', isBreak: false },
  { periodNumber: 8, startTime: '03:00', endTime: '04:00', isBreak: false },
];

export class TimetableService {
  private repository = timetableRepository;

  async createTimetable(input: CreateTimetableInput, adminUserId: string) {
    // Check if duplicate section timetable exists for department & semester
    const existing = await prisma.timetable.findFirst({
      where: {
        departmentId: input.departmentId,
        semester: input.semester,
        section: input.section.trim().toUpperCase(),
        academicYear: input.academicYear.trim(),
      },
    });

    if (existing) {
      throw new Error(
        `A timetable already exists for Department (Sem ${input.semester}, Section ${input.section.toUpperCase()}) in Academic Year ${input.academicYear}.`
      );
    }

    const timetable = await prisma.$transaction(async (tx) => {
      const created = await tx.timetable.create({
        data: {
          departmentId: input.departmentId,
          semester: input.semester,
          section: input.section.trim().toUpperCase(),
          academicYear: input.academicYear.trim(),
          status: TimetableStatus.DRAFT,
        },
        include: { department: true },
      });

      await tx.activityLog.create({
        data: {
          userId: adminUserId,
          action: 'TIMETABLE_CREATED',
          details: { timetableId: created.id, departmentId: created.departmentId, section: created.section } as Prisma.InputJsonValue,
        },
      });

      return created;
    });

    return timetable;
  }

  async listTimetables(filters: {
    departmentId?: string;
    semester?: number;
    section?: string;
    status?: TimetableStatus;
    page?: number;
    limit?: number;
  } = {}) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.TimetableWhereInput = {};

    if (filters.departmentId) where.departmentId = filters.departmentId;
    if (filters.semester) where.semester = filters.semester;
    if (filters.section) where.section = filters.section;
    if (filters.status) where.status = filters.status;

    const [timetables, total] = await Promise.all([
      this.repository.list({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: 'desc' },
      }),
      this.repository.count(where),
    ]);

    return {
      timetables,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTimetableById(id: string) {
    const timetable = await this.repository.findById(id);
    if (!timetable) {
      throw new Error('Timetable not found.');
    }
    return timetable;
  }

  async assignSlot(input: AssignSlotInput, adminUserId: string) {
    const timetable = await this.repository.findById(input.timetableId);
    if (!timetable) {
      throw new Error('Target timetable not found.');
    }

    // 1. CONFLICT CHECK A: Faculty Conflict
    const facultyConflict = await this.repository.findConflictingFacultySlot(
      input.day,
      input.periodNumber,
      input.facultyId,
      input.slotId
    );

    if (facultyConflict) {
      const facName = facultyConflict.faculty.user.name || facultyConflict.faculty.user.email;
      const subjCode = facultyConflict.subject.code;
      const deptCode = facultyConflict.timetable.department.code;
      const sec = facultyConflict.timetable.section;
      throw new Error(
        `Faculty conflict: ${facName} is already assigned to teach ${subjCode} in Department ${deptCode} (Section ${sec}) at Period ${input.periodNumber} on ${input.day}.`
      );
    }

    // 2. CONFLICT CHECK B: Classroom Conflict
    const classroomConflict = await this.repository.findConflictingClassroomSlot(
      input.day,
      input.periodNumber,
      input.classroomId,
      input.slotId
    );

    if (classroomConflict) {
      const roomNum = classroomConflict.classroom.roomNumber;
      const deptCode = classroomConflict.timetable.department.code;
      const sec = classroomConflict.timetable.section;
      throw new Error(
        `Classroom conflict: Room ${roomNum} is already booked for Department ${deptCode} (Section ${sec}) at Period ${input.periodNumber} on ${input.day}.`
      );
    }

    // Save slot
    const slot = await this.repository.upsertSlot(input);

    await prisma.activityLog.create({
      data: {
        userId: adminUserId,
        action: 'TIMETABLE_SLOT_ASSIGNED',
        details: { slotId: slot.id, timetableId: input.timetableId, day: input.day, period: input.periodNumber } as Prisma.InputJsonValue,
      },
    });

    return slot;
  }

  async deleteSlot(slotId: string, adminUserId: string) {
    const deleted = await this.repository.deleteSlot(slotId);
    await prisma.activityLog.create({
      data: {
        userId: adminUserId,
        action: 'TIMETABLE_SLOT_REMOVED',
        details: { slotId } as Prisma.InputJsonValue,
      },
    });
    return deleted;
  }

  async toggleStatus(timetableId: string, adminUserId: string) {
    const timetable = await this.repository.findById(timetableId);
    if (!timetable) {
      throw new Error('Timetable not found.');
    }

    const newStatus = timetable.status === TimetableStatus.DRAFT ? TimetableStatus.PUBLISHED : TimetableStatus.DRAFT;
    const updated = await this.repository.updateStatus(timetableId, newStatus);

    await prisma.activityLog.create({
      data: {
        userId: adminUserId,
        action: newStatus === TimetableStatus.PUBLISHED ? 'TIMETABLE_PUBLISHED' : 'TIMETABLE_UNPUBLISHED',
        details: { timetableId, newStatus } as Prisma.InputJsonValue,
      },
    });

    return updated;
  }

  async deleteTimetable(timetableId: string, adminUserId: string) {
    const timetable = await this.repository.findById(timetableId);
    if (!timetable) {
      throw new Error('Timetable not found.');
    }

    const deleted = await this.repository.delete(timetableId);
    await prisma.activityLog.create({
      data: {
        userId: adminUserId,
        action: 'TIMETABLE_DELETED',
        details: { timetableId } as Prisma.InputJsonValue,
      },
    });

    return deleted;
  }

  async getPeriodTemplates() {
    let periods = await this.repository.listPeriodTemplates();
    if (periods.length === 0) {
      // Auto-initialize default period templates if empty
      periods = await this.repository.savePeriodTemplates(DEFAULT_PERIODS);
    }
    return periods;
  }

  async savePeriodTemplates(templates: PeriodTemplateInput[], adminUserId: string) {
    if (templates.length === 0) {
      throw new Error('At least one period template must be configured.');
    }

    const updated = await this.repository.savePeriodTemplates(templates);

    await prisma.activityLog.create({
      data: {
        userId: adminUserId,
        action: 'PERIOD_TEMPLATES_UPDATED',
        details: { count: updated.length } as Prisma.InputJsonValue,
      },
    });

    return updated;
  }
}
