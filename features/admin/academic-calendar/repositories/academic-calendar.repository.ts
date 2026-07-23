import prisma from '@/lib/prisma';
import { AcademicEventType } from '@prisma/client';
import { AcademicCalendarFormValues } from '../schemas/academic-calendar.schema';

export interface CalendarFilterOptions {
  search?: string;
  semesterId?: string;
  eventType?: AcademicEventType;
  isPublished?: boolean;
  page?: number;
  limit?: number;
}

export class AcademicCalendarRepository {
  async listEntries(options: CalendarFilterOptions = {}) {
    const { search, semesterId, eventType, isPublished, page = 1, limit = 50 } = options;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (semesterId) {
      where.semesterId = semesterId;
    }

    if (eventType) {
      where.eventType = eventType;
    }

    if (typeof isPublished === 'boolean') {
      where.isPublished = isPublished;
    }

    const [items, total] = await Promise.all([
      prisma.academicCalendar.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startDate: 'asc' },
        include: {
          semester: {
            select: {
              id: true,
              name: true,
              academicYear: true,
              isCurrent: true,
            },
          },
          department: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      }),
      prisma.academicCalendar.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getEntryById(id: string) {
    return prisma.academicCalendar.findUnique({
      where: { id },
      include: {
        semester: true,
        department: true,
      },
    });
  }

  async createEntry(data: AcademicCalendarFormValues) {
    return prisma.academicCalendar.create({
      data: {
        title: data.title,
        description: data.description || null,
        eventType: data.eventType,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        semesterId: data.semesterId || null,
        departmentId: data.departmentId || null,
        isPublished: data.isPublished,
      },
    });
  }

  async updateEntry(id: string, data: AcademicCalendarFormValues) {
    return prisma.academicCalendar.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description || null,
        eventType: data.eventType,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        semesterId: data.semesterId || null,
        departmentId: data.departmentId || null,
        isPublished: data.isPublished,
      },
    });
  }

  async togglePublish(id: string) {
    const entry = await prisma.academicCalendar.findUnique({ where: { id } });
    if (!entry) throw new Error('Calendar entry not found.');

    return prisma.academicCalendar.update({
      where: { id },
      data: {
        isPublished: !entry.isPublished,
      },
    });
  }

  async deleteEntry(id: string) {
    return prisma.academicCalendar.delete({
      where: { id },
    });
  }
}
