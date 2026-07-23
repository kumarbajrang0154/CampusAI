'use server';

import { requirePermission } from '@/lib/auth-guard';
import { AcademicCalendarService } from '../services/academic-calendar.service';
import { academicCalendarSchema, AcademicCalendarFormValues } from '../schemas/academic-calendar.schema';
import { revalidatePath } from 'next/cache';

const calendarService = new AcademicCalendarService();

export async function createCalendarEntryAction(data: AcademicCalendarFormValues) {
  try {
    const session = await requirePermission('course.manage');
    const validated = academicCalendarSchema.parse(data);
    const result = await calendarService.createEntry(validated, session.user.id);

    revalidatePath('/admin/academic/calendar');

    return {
      success: true,
      message: 'Calendar event created successfully.',
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to create calendar event.',
      errors: error.errors || [],
    };
  }
}

export async function updateCalendarEntryAction(id: string, data: AcademicCalendarFormValues) {
  try {
    const session = await requirePermission('course.manage');
    const validated = academicCalendarSchema.parse(data);
    const result = await calendarService.updateEntry(id, validated, session.user.id);

    revalidatePath('/admin/academic/calendar');

    return {
      success: true,
      message: 'Calendar event updated successfully.',
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to update calendar event.',
      errors: error.errors || [],
    };
  }
}

export async function toggleCalendarPublishAction(id: string) {
  try {
    const session = await requirePermission('course.manage');
    const result = await calendarService.togglePublish(id, session.user.id);

    revalidatePath('/admin/academic/calendar');

    return {
      success: true,
      message: `Event "${result.title}" ${result.isPublished ? 'published' : 'unpublished'}.`,
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to update publication status.',
    };
  }
}

export async function deleteCalendarEntryAction(id: string) {
  try {
    const session = await requirePermission('course.manage');
    const result = await calendarService.deleteEntry(id, session.user.id);

    revalidatePath('/admin/academic/calendar');

    return {
      success: true,
      message: 'Calendar event deleted successfully.',
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to delete calendar event.',
    };
  }
}

export async function listCalendarEntriesAction(filters: { search?: string; semesterId?: string; eventType?: any; isPublished?: boolean; page?: number; limit?: number }) {
  try {
    await requirePermission('course.view');
    const result = await calendarService.listEntries(filters);

    return {
      success: true,
      message: 'Calendar events retrieved successfully.',
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to retrieve calendar events.',
    };
  }
}
