'use server';

import { requirePermission } from '@/lib/auth-guard';
import { DepartmentService } from '../services/department.service';
import { createDepartmentSchema } from '../schemas/department.schema';
import { revalidatePath } from 'next/cache';

const departmentService = new DepartmentService();

export async function createDepartmentAction(data: { name: string; code: string }) {
  try {
    const session = await requirePermission('course.manage');
    const validated = createDepartmentSchema.parse(data);
    const newDept = await departmentService.createDepartment(validated, session.user.id);

    revalidatePath('/admin/departments');

    return {
      success: true,
      message: 'Department created successfully.',
      data: newDept,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to create department.',
      errors: error.errors || [],
    };
  }
}

export async function updateDepartmentAction(id: string, data: { name: string; code: string }) {
  try {
    const session = await requirePermission('course.manage');
    const validated = createDepartmentSchema.parse(data);
    const updated = await departmentService.updateDepartment(id, validated, session.user.id);

    revalidatePath('/admin/departments');

    return {
      success: true,
      message: 'Department updated successfully.',
      data: updated,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to update department.',
      errors: error.errors || [],
    };
  }
}

export async function deleteDepartmentAction(id: string) {
  try {
    const session = await requirePermission('course.manage');
    const deleted = await departmentService.deleteDepartment(id, session.user.id);

    revalidatePath('/admin/departments');

    return {
      success: true,
      message: 'Department deleted successfully.',
      data: deleted,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to delete department.',
    };
  }
}

export async function listDepartmentsAction(filters: { search?: string; page?: number; limit?: number }) {
  try {
    await requirePermission('course.view');
    const result = await departmentService.listDepartments(filters);

    return {
      success: true,
      message: 'Departments retrieved successfully.',
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to retrieve departments.',
    };
  }
}
