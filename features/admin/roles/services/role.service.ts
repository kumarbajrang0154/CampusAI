import { RoleRepository } from '../repositories/role.repository';
import { UserRole, Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';

const repository = new RoleRepository();

export class RoleService {
  private repository = repository;

  async getRolePermissionMatrix() {
    const [permissions, rolePermissions] = await Promise.all([
      this.repository.listAllPermissions(),
      this.repository.listRolePermissions(),
    ]);

    // Build active set: key = `${role}_${permissionId}`
    const activeSet = new Set<string>();
    for (const rp of rolePermissions) {
      activeSet.add(`${rp.role}_${rp.permissionId}`);
    }

    // Group permissions by category
    const groupedMap = new Map<string, typeof permissions>();
    for (const perm of permissions) {
      const groupName = perm.group || 'General';
      if (!groupedMap.has(groupName)) {
        groupedMap.set(groupName, []);
      }
      groupedMap.get(groupName)!.push(perm);
    }

    const categories = Array.from(groupedMap.entries()).map(([group, items]) => ({
      group,
      permissions: items,
    }));

    return {
      categories,
      permissions,
      activeSet: Array.from(activeSet),
    };
  }

  async toggleRolePermission(role: UserRole, permissionId: string, enabled: boolean, adminUserId: string) {
    // 1. SAFETY GUARD: Protect Admin core permissions
    if (role === UserRole.ADMIN && !enabled) {
      const perm = await prisma.permission.findUnique({ where: { id: permissionId } });
      if (perm && (perm.key === 'role.manage' || perm.key === 'user.manage')) {
        throw new Error(`Safety Violation: Core security permission "${perm.key}" cannot be revoked from the Admin role.`);
      }
    }

    if (enabled) {
      await this.repository.addRolePermission(role, permissionId);
    } else {
      await this.repository.removeRolePermission(role, permissionId);
    }

    // Audit log
    const perm = await prisma.permission.findUnique({ where: { id: permissionId } });
    await prisma.activityLog.create({
      data: {
        userId: adminUserId,
        action: 'ROLE_PERMISSION_UPDATED',
        details: {
          role,
          permissionKey: perm?.key,
          enabled,
        } as Prisma.InputJsonValue,
      },
    });

    return { role, permissionId, enabled };
  }

  async getUserPermissionsDetail(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) {
      throw new Error('User not found.');
    }

    const [allPermissions, rolePermissions, userOverrides] = await Promise.all([
      this.repository.listAllPermissions(),
      prisma.rolePermission.findMany({
        where: { role: user.role },
        select: { permissionId: true },
      }),
      this.repository.listUserOverrides(userId),
    ]);

    const rolePermIds = new Set(rolePermissions.map((rp) => rp.permissionId));
    const overrideMap = new Map<string, boolean>();
    for (const ov of userOverrides) {
      overrideMap.set(ov.permissionId, ov.granted);
    }

    const items = allPermissions.map((perm) => {
      const isRoleDefault = rolePermIds.has(perm.id);
      const overrideStatus = overrideMap.has(perm.id) ? overrideMap.get(perm.id) : null;
      let isEffective = isRoleDefault;
      if (overrideStatus === true) isEffective = true;
      if (overrideStatus === false) isEffective = false;

      return {
        permission: perm,
        isRoleDefault,
        overrideStatus, // true = Granted, false = Revoked, null = Reset/None
        isEffective,
      };
    });

    return {
      user,
      permissions: items,
    };
  }

  async setUserOverride(userId: string, permissionId: string, granted: boolean | null, adminUserId: string) {
    // SAFETY GUARD: Prevent revoking core permissions from an Admin user account
    if (granted === false) {
      const [targetUser, perm] = await Promise.all([
        prisma.user.findUnique({ where: { id: userId }, select: { role: true } }),
        prisma.permission.findUnique({ where: { id: permissionId } }),
      ]);

      if (targetUser?.role === UserRole.ADMIN && perm && (perm.key === 'role.manage' || perm.key === 'user.manage')) {
        throw new Error(`Safety Violation: Core security permission "${perm.key}" cannot be explicitly revoked from an Admin user account.`);
      }
    }

    await this.repository.setUserOverride(userId, permissionId, granted);

    const perm = await prisma.permission.findUnique({ where: { id: permissionId } });
    await prisma.activityLog.create({
      data: {
        userId: adminUserId,
        action: 'USER_PERMISSION_OVERRIDE_UPDATED',
        details: {
          targetUserId: userId,
          permissionKey: perm?.key,
          granted,
        } as Prisma.InputJsonValue,
      },
    });

    return { userId, permissionId, granted };
  }
}
