/**
 * lib/permissions.ts
 *
 * RBAC permission resolution utility.
 *
 * Resolution order:
 *   1. Collect all permissions granted by the user's role (RolePermission)
 *   2. Apply per-user overrides (UserPermission):
 *      - granted: true  → add this permission (even if role doesn't have it)
 *      - granted: false → remove this permission (explicit deny, even if role grants it)
 *
 * Performance note:
 *   These functions make DB queries. In production, wrap with React cache() per-request
 *   or store in the session to avoid repeated hits.
 *   Redis caching can be added later by wrapping the DB calls here.
 *
 *   Example with React cache (for Server Components):
 *   import { cache } from 'react';
 *   export const getUserPermissions = cache(_getUserPermissions);
 */

import prisma from '@/lib/prisma';

/**
 * Resolve the full effective permission set for a user.
 * Combines role-default permissions with per-user overrides.
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
  // Fetch user to get their role
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user) return [];

  // 1. Get all permissions granted by the role
  const rolePerms = await prisma.rolePermission.findMany({
    where: { role: user.role },
    include: { permission: { select: { key: true } } },
  });

  const permissionSet = new Set(rolePerms.map((rp) => rp.permission.key));

  // 2. Apply per-user overrides
  const userOverrides = await prisma.userPermission.findMany({
    where: { userId },
    include: { permission: { select: { key: true } } },
  });

  for (const override of userOverrides) {
    if (override.granted) {
      permissionSet.add(override.permission.key);
    } else {
      // Explicit deny — remove even if role grants it
      permissionSet.delete(override.permission.key);
    }
  }

  return Array.from(permissionSet);
}

/**
 * Check if a user has a specific permission key.
 * Returns false for unknown users or permissions.
 */
export async function hasPermission(userId: string, permissionKey: string): Promise<boolean> {
  const permissions = await getUserPermissions(userId);
  return permissions.includes(permissionKey);
}
