'use server';

import { requirePermission } from '@/lib/auth-guard';
import { TimetableService } from '../services/timetable.service';
import { 
  createTimetableSchema, 
  assignSlotSchema, 
  CreateTimetableInput, 
  AssignSlotInput,
  PeriodTemplateInput 
} from '../schemas/timetable.schema';
import { TimetableStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const timetableService = new TimetableService();

export async function createTimetableAction(data: CreateTimetableInput) {
  try {
    const session = await requirePermission('timetable.manage');
    const validated = createTimetableSchema.parse(data);
    const timetable = await timetableService.createTimetable(validated, session.user.id);

    revalidatePath('/admin/timetable');

    return {
      success: true,
      message: 'Timetable created successfully.',
      data: timetable,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to create timetable.',
    };
  }
}

export async function listTimetablesAction(filters: {
  departmentId?: string;
  semester?: number;
  section?: string;
  status?: TimetableStatus;
  page?: number;
  limit?: number;
}) {
  try {
    await requirePermission('timetable.view');
    const result = await timetableService.listTimetables(filters);

    return {
      success: true,
      message: 'Timetables retrieved successfully.',
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to retrieve timetables.',
    };
  }
}

export async function getTimetableByIdAction(id: string) {
  try {
    await requirePermission('timetable.view');
    const timetable = await timetableService.getTimetableById(id);

    return {
      success: true,
      data: timetable,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to get timetable details.',
    };
  }
}

export async function assignSlotAction(data: AssignSlotInput) {
  try {
    const session = await requirePermission('timetable.manage');
    const validated = assignSlotSchema.parse(data);
    const slot = await timetableService.assignSlot(validated, session.user.id);

    revalidatePath('/admin/timetable');

    return {
      success: true,
      message: 'Slot assigned successfully.',
      data: slot,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to assign slot.',
    };
  }
}

export async function deleteSlotAction(slotId: string) {
  try {
    const session = await requirePermission('timetable.manage');
    const deleted = await timetableService.deleteSlot(slotId, session.user.id);

    revalidatePath('/admin/timetable');

    return {
      success: true,
      message: 'Slot removed successfully.',
      data: deleted,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to remove slot.',
    };
  }
}

export async function toggleTimetableStatusAction(timetableId: string) {
  try {
    const session = await requirePermission('timetable.manage');
    const updated = await timetableService.toggleStatus(timetableId, session.user.id);

    revalidatePath('/admin/timetable');

    return {
      success: true,
      message: `Timetable status changed to ${updated.status}.`,
      data: updated,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to toggle timetable status.',
    };
  }
}

export async function deleteTimetableAction(timetableId: string) {
  try {
    const session = await requirePermission('timetable.manage');
    const deleted = await timetableService.deleteTimetable(timetableId, session.user.id);

    revalidatePath('/admin/timetable');

    return {
      success: true,
      message: 'Timetable deleted successfully.',
      data: deleted,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to delete timetable.',
    };
  }
}

export async function getPeriodTemplatesAction() {
  try {
    await requirePermission('timetable.view');
    const templates = await timetableService.getPeriodTemplates();

    return {
      success: true,
      data: templates,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to fetch period templates.',
    };
  }
}

export async function savePeriodTemplatesAction(templates: PeriodTemplateInput[]) {
  try {
    const session = await requirePermission('timetable.manage');
    const updated = await timetableService.savePeriodTemplates(templates, session.user.id);

    revalidatePath('/admin/timetable');

    return {
      success: true,
      message: 'Period configuration saved successfully.',
      data: updated,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to save period configuration.',
    };
  }
}
