import { AcademicCalendarRepository, CalendarFilterOptions } from '../repositories/academic-calendar.repository';
import { AcademicCalendarFormValues } from '../schemas/academic-calendar.schema';
import prisma from '@/lib/prisma';

export class AcademicCalendarService {
  private repository: AcademicCalendarRepository;

  constructor() {
    this.repository = new AcademicCalendarRepository();
  }

  async listEntries(options: CalendarFilterOptions) {
    return this.repository.listEntries(options);
  }

  async getEntryById(id: string) {
    return this.repository.getEntryById(id);
  }

  async createEntry(data: AcademicCalendarFormValues, adminUserId: string) {
    const entry = await this.repository.createEntry(data);

    await prisma.activityLog.create({
      data: {
        userId: adminUserId,
        action: 'CREATE_CALENDAR_EVENT',
        details: {
          entryId: entry.id,
          title: entry.title,
          eventType: entry.eventType,
          isPublished: entry.isPublished,
        },
      },
    });

    return entry;
  }

  async updateEntry(id: string, data: AcademicCalendarFormValues, adminUserId: string) {
    const updated = await this.repository.updateEntry(id, data);

    await prisma.activityLog.create({
      data: {
        userId: adminUserId,
        action: 'UPDATE_CALENDAR_EVENT',
        details: {
          entryId: updated.id,
          title: updated.title,
          isPublished: updated.isPublished,
        },
      },
    });

    return updated;
  }

  async togglePublish(id: string, adminUserId: string) {
    const updated = await this.repository.togglePublish(id);

    await prisma.activityLog.create({
      data: {
        userId: adminUserId,
        action: 'TOGGLE_CALENDAR_EVENT_PUBLISH',
        details: {
          entryId: updated.id,
          title: updated.title,
          isPublished: updated.isPublished,
        },
      },
    });

    return updated;
  }

  async deleteEntry(id: string, adminUserId: string) {
    const deleted = await this.repository.deleteEntry(id);

    await prisma.activityLog.create({
      data: {
        userId: adminUserId,
        action: 'DELETE_CALENDAR_EVENT',
        details: {
          entryId: id,
          title: deleted.title,
        },
      },
    });

    return deleted;
  }
}
