'use server';

import { requirePermission } from '@/lib/auth-guard';
import { ClassroomService } from '../services/classroom.service';
import { createClassroomSchema } from '../schemas/classroom.schema';
import { ClassroomType } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const classroomService = new ClassroomService();

export async function createClassroomAction(data: { roomNumber: string; capacity: number; type: ClassroomType }) {
  try {
    const session = await requirePermission('course.manage');
    const validated = createClassroomSchema.parse(data);
    const newRoom = await classroomService.createClassroom(validated, session.user.id);

    revalidatePath('/admin/classrooms');

    return {
      success: true,
      message: 'Classroom created successfully.',
      data: newRoom,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to create classroom.',
      errors: error.errors || [],
    };
  }
}

export async function updateClassroomAction(
  id: string,
  data: { roomNumber: string; capacity: number; type: ClassroomType }
) {
  try {
    const session = await requirePermission('course.manage');
    const validated = createClassroomSchema.parse(data);
    const updated = await classroomService.updateClassroom(id, validated, session.user.id);

    revalidatePath('/admin/classrooms');

    return {
      success: true,
      message: 'Classroom updated successfully.',
      data: updated,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to update classroom.',
      errors: error.errors || [],
    };
  }
}

export async function deleteClassroomAction(id: string) {
  try {
    const session = await requirePermission('course.manage');
    const deleted = await classroomService.deleteClassroom(id, session.user.id);

    revalidatePath('/admin/classrooms');

    return {
      success: true,
      message: 'Classroom deleted successfully.',
      data: deleted,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to delete classroom.',
    };
  }
}

export async function listClassroomsAction(filters: { search?: string; page?: number; limit?: number }) {
  try {
    await requirePermission('course.view');
    const result = await classroomService.listClassrooms(filters);

    return {
      success: true,
      message: 'Classrooms retrieved successfully.',
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to retrieve classrooms.',
    };
  }
}
