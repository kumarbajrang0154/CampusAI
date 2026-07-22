'use server';

import { requirePermission } from '@/lib/auth-guard';
import { RoleService } from '../services/role.service';
import { toggleRolePermissionSchema, setUserOverrideSchema } from '../schemas/role.schema';
import { UserRole } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const roleService = new RoleService();

export async function getRolePermissionMatrixAction() {
  try {
    await requirePermission('role.manage');
    const data = await roleService.getRolePermissionMatrix();

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to fetch permission matrix.',
    };
  }
}

export async function toggleRolePermissionAction(data: { role: UserRole; permissionId: string; enabled: boolean }) {
  try {
    const session = await requirePermission('role.manage');
    const validated = toggleRolePermissionSchema.parse(data);
    const result = await roleService.toggleRolePermission(
      validated.role,
      validated.permissionId,
      validated.enabled,
      session.user.id
    );

    revalidatePath('/admin/roles');

    return {
      success: true,
      message: 'Role permission updated.',
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to update role permission.',
    };
  }
}

export async function getUserPermissionsDetailAction(userId: string) {
  try {
    await requirePermission('role.manage');
    const data = await roleService.getUserPermissionsDetail(userId);

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to fetch user permissions.',
    };
  }
}

export async function setUserOverrideAction(data: { userId: string; permissionId: string; granted: boolean | null }) {
  try {
    const session = await requirePermission('role.manage');
    const validated = setUserOverrideSchema.parse(data);
    const result = await roleService.setUserOverride(
      validated.userId,
      validated.permissionId,
      validated.granted,
      session.user.id
    );

    revalidatePath('/admin/roles');
    revalidatePath('/admin/users');

    return {
      success: true,
      message: 'User permission override updated.',
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to update user permission override.',
    };
  }
}
