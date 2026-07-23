'use server';

import { requirePermission } from '@/lib/auth-guard';
import { SemesterService } from '../services/semester.service';
import { semesterSchema, SemesterFormValues } from '../schemas/semester.schema';
import { revalidatePath } from 'next/cache';

const semesterService = new SemesterService();

export async function createSemesterAction(data: SemesterFormValues) {
  try {
    const session = await requirePermission('course.manage');
    const validated = semesterSchema.parse(data);
    const result = await semesterService.createSemester(validated, session.user.id);

    revalidatePath('/admin/semesters');
    revalidatePath('/admin/academic/calendar');

    return {
      success: true,
      message: 'Semester created successfully.',
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to create semester.',
      errors: error.errors || [],
    };
  }
}

export async function updateSemesterAction(id: string, data: SemesterFormValues) {
  try {
    const session = await requirePermission('course.manage');
    const validated = semesterSchema.parse(data);
    const result = await semesterService.updateSemester(id, validated, session.user.id);

    revalidatePath('/admin/semesters');
    revalidatePath('/admin/academic/calendar');

    return {
      success: true,
      message: 'Semester updated successfully.',
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to update semester.',
      errors: error.errors || [],
    };
  }
}

export async function setAsCurrentSemesterAction(id: string) {
  try {
    const session = await requirePermission('course.manage');
    const result = await semesterService.setAsCurrent(id, session.user.id);

    revalidatePath('/admin/semesters');

    return {
      success: true,
      message: `"${result.name}" set as current semester.`,
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to set active current semester.',
    };
  }
}

export async function checkSemesterDeleteBlocksAction(id: string) {
  try {
    await requirePermission('course.manage');
    const result = await semesterService.checkDeleteBlocks(id);

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to check delete dependencies.',
    };
  }
}

export async function deleteSemesterAction(id: string) {
  try {
    const session = await requirePermission('course.manage');
    const result = await semesterService.deleteSemester(id, session.user.id);

    revalidatePath('/admin/semesters');

    return {
      success: true,
      message: 'Semester deleted successfully.',
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to delete semester.',
    };
  }
}

export async function listSemestersAction(filters: { search?: string; status?: any; term?: any; page?: number; limit?: number }) {
  try {
    await requirePermission('course.view');
    const result = await semesterService.listSemesters(filters);

    return {
      success: true,
      message: 'Semesters retrieved successfully.',
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to retrieve semesters.',
    };
  }
}
