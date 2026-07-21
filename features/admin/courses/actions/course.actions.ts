'use server';

import { requirePermission } from '@/lib/auth-guard';
import { CourseService } from '../services/course.service';
import { createCourseSchema } from '../schemas/course.schema';
import { revalidatePath } from 'next/cache';

const courseService = new CourseService();

export async function createCourseAction(data: { name: string; credits: number; semester: number; departmentId: string }) {
  try {
    const session = await requirePermission('course.manage');
    const validated = createCourseSchema.parse(data);
    const newCourse = await courseService.createCourse(validated, session.user.id);

    revalidatePath('/admin/courses');

    return {
      success: true,
      message: 'Course created successfully.',
      data: newCourse,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to create course.',
      errors: error.errors || [],
    };
  }
}

export async function updateCourseAction(
  id: string,
  data: { name: string; credits: number; semester: number; departmentId: string }
) {
  try {
    const session = await requirePermission('course.manage');
    const validated = createCourseSchema.parse(data);
    const updated = await courseService.updateCourse(id, validated, session.user.id);

    revalidatePath('/admin/courses');

    return {
      success: true,
      message: 'Course updated successfully.',
      data: updated,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to update course.',
      errors: error.errors || [],
    };
  }
}

export async function deleteCourseAction(id: string) {
  try {
    const session = await requirePermission('course.manage');
    const deleted = await courseService.deleteCourse(id, session.user.id);

    revalidatePath('/admin/courses');

    return {
      success: true,
      message: 'Course deleted successfully.',
      data: deleted,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to delete course.',
    };
  }
}

export async function listCoursesAction(filters: { departmentId?: string; search?: string; page?: number; limit?: number }) {
  try {
    await requirePermission('course.view');
    const result = await courseService.listCourses(filters);

    return {
      success: true,
      message: 'Courses retrieved successfully.',
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to retrieve courses.',
    };
  }
}
