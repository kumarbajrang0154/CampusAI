import { z } from 'zod';
import { UserRole } from '@prisma/client';

export const toggleRolePermissionSchema = z.object({
  role: z.nativeEnum(UserRole),
  permissionId: z.string().min(1, 'Permission ID is required'),
  enabled: z.boolean(),
});

export type ToggleRolePermissionInput = z.infer<typeof toggleRolePermissionSchema>;

export const setUserOverrideSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  permissionId: z.string().min(1, 'Permission ID is required'),
  granted: z.boolean().nullable(), // true = Grant, false = Revoke, null = Reset to Role Default
});

export type SetUserOverrideInput = z.infer<typeof setUserOverrideSchema>;
