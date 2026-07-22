'use server';

import { requirePermission } from '@/lib/auth-guard';
import { UserService } from '../services/user.service';
import { createUserSchema, CreateUserInput } from '../schemas/user.schema';
import { UserRole, UserStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const userService = new UserService();

export async function createUserAction(data: CreateUserInput) {
  try {
    const session = await requirePermission('user.manage');
    const validated = createUserSchema.parse(data);
    const newUser = await userService.createUser(validated, session.user.id);

    revalidatePath('/admin/users');

    return {
      success: true,
      message: 'User account pre-provisioned successfully.',
      data: newUser,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to create user.',
      errors: error.errors || [],
    };
  }
}

export async function listUsersAction(filters: {
  role?: UserRole;
  status?: UserStatus;
  search?: string;
  page?: number;
  limit?: number;
}) {
  try {
    await requirePermission('user.manage');
    const result = await userService.listUsers(filters);

    return {
      success: true,
      message: 'Users retrieved successfully.',
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to retrieve users.',
    };
  }
}

export async function updateUserRoleAction(userId: string, newRole: UserRole) {
  try {
    const session = await requirePermission('user.manage');

    if (userId === session.user.id) {
      return {
        success: false,
        message: 'You cannot modify your own role.',
      };
    }

    const updatedUser = await userService.updateUserRole(userId, newRole, session.user.id);

    revalidatePath('/admin/users');

    return {
      success: true,
      message: 'User role updated successfully.',
      data: updatedUser,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to update user role.',
    };
  }
}

export async function toggleUserStatusAction(userId: string) {
  try {
    const session = await requirePermission('user.manage');

    if (userId === session.user.id) {
      return {
        success: false,
        message: 'You cannot deactivate your own account.',
      };
    }

    const updatedUser = await userService.toggleUserStatus(userId, session.user.id);

    revalidatePath('/admin/users');

    return {
      success: true,
      message: `User account is now ${updatedUser.status.toLowerCase()}.`,
      data: updatedUser,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to toggle user status.',
    };
  }
}

export async function deleteUserAction(userId: string) {
  try {
    const session = await requirePermission('user.manage');

    if (userId === session.user.id) {
      return {
        success: false,
        message: 'You cannot delete your own account.',
      };
    }

    const deletedUser = await userService.deleteUser(userId, session.user.id);

    revalidatePath('/admin/users');

    return {
      success: true,
      message: 'User deleted successfully.',
      data: deletedUser,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to delete user.',
    };
  }
}
