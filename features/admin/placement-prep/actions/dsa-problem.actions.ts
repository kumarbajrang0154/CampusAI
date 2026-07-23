'use server';

import { requirePermission } from '@/lib/auth-guard';
import { DSAProblemService } from '../services/dsa-problem.service';
import { dsaProblemSchema, DSAProblemFormValues } from '../schemas/dsa-problem.schema';
import { revalidatePath } from 'next/cache';

const problemService = new DSAProblemService();

export async function createDSAProblemAction(data: DSAProblemFormValues) {
  try {
    const session = await requirePermission('course.manage');
    const validated = dsaProblemSchema.parse(data);
    const result = await problemService.createProblem(validated, session.user.id);

    revalidatePath('/admin/placement/problems');
    revalidatePath('/student/placement');

    return {
      success: true,
      message: 'DSA Problem added to content bank.',
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to add DSA problem.',
      errors: error.errors || [],
    };
  }
}

export async function updateDSAProblemAction(id: string, data: DSAProblemFormValues) {
  try {
    const session = await requirePermission('course.manage');
    const validated = dsaProblemSchema.parse(data);
    const result = await problemService.updateProblem(id, validated, session.user.id);

    revalidatePath('/admin/placement/problems');
    revalidatePath('/student/placement');

    return {
      success: true,
      message: 'DSA Problem updated successfully.',
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to update DSA problem.',
      errors: error.errors || [],
    };
  }
}

export async function deleteDSAProblemAction(id: string) {
  try {
    const session = await requirePermission('course.manage');
    const result = await problemService.deleteProblem(id, session.user.id);

    revalidatePath('/admin/placement/problems');
    revalidatePath('/student/placement');

    return {
      success: true,
      message: 'DSA Problem deleted successfully.',
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to delete DSA problem.',
    };
  }
}

export async function listDSAProblemsAction(filters: { search?: string; domainId?: string; difficulty?: any; platform?: any; page?: number; limit?: number }) {
  try {
    await requirePermission('course.view');
    const result = await problemService.listProblems(filters);

    return {
      success: true,
      message: 'DSA problems retrieved.',
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to retrieve DSA problems.',
    };
  }
}

export async function listPlacementDomainsAction() {
  try {
    await requirePermission('course.view');
    const domains = await problemService.listDomains();

    return {
      success: true,
      data: domains,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to list placement domains.',
    };
  }
}
