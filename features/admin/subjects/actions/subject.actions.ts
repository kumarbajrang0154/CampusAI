'use server';

import { requirePermission } from '@/lib/auth-guard';
import { SubjectService } from '../services/subject.service';
import { createSubjectSchema } from '../schemas/subject.schema';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';

const subjectService = new SubjectService();

export async function createSubjectAction(data: { name: string; code: string; courseId: string; facultyId?: string | null }) {
  try {
    const session = await requirePermission('course.manage');
    const validated = createSubjectSchema.parse(data);
    const newSubject = await subjectService.createSubject(validated, session.user.id);

    revalidatePath('/admin/subjects');

    return {
      success: true,
      message: 'Subject created successfully.',
      data: newSubject,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to create subject.',
      errors: error.errors || [],
    };
  }
}

export async function updateSubjectAction(
  id: string,
  data: { name: string; code: string; courseId: string; facultyId?: string | null }
) {
  try {
    const session = await requirePermission('course.manage');
    const validated = createSubjectSchema.parse(data);
    const updated = await subjectService.updateSubject(id, validated, session.user.id);

    revalidatePath('/admin/subjects');

    return {
      success: true,
      message: 'Subject updated successfully.',
      data: updated,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to update subject.',
      errors: error.errors || [],
    };
  }
}

export async function deleteSubjectAction(id: string) {
  try {
    const session = await requirePermission('course.manage');
    const deleted = await subjectService.deleteSubject(id, session.user.id);

    revalidatePath('/admin/subjects');

    return {
      success: true,
      message: 'Subject deleted successfully.',
      data: deleted,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to delete subject.',
    };
  }
}

export async function assignFacultyAction(id: string, facultyId: string | null) {
  try {
    const session = await requirePermission('course.manage');
    const updated = await subjectService.assignFaculty(id, facultyId, session.user.id);

    revalidatePath('/admin/subjects');

    return {
      success: true,
      message: 'Faculty assigned successfully.',
      data: updated,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to assign faculty.',
    };
  }
}

export async function listSubjectsAction(filters: { courseId?: string; facultyId?: string; search?: string; page?: number; limit?: number }) {
  try {
    await requirePermission('course.view');
    const result = await subjectService.listSubjects(filters);

    return {
      success: true,
      message: 'Subjects retrieved successfully.',
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to retrieve subjects.',
    };
  }
}

export async function listFacultyAction() {
  try {
    await requirePermission('course.view');
    const faculty = await prisma.faculty.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        employeeId: 'asc',
      },
    });

    return {
      success: true,
      message: 'Faculty retrieved successfully.',
      data: faculty,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to retrieve faculty.',
    };
  }
}
