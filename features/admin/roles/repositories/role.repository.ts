import prisma from '@/lib/prisma';
import { UserRole } from '@prisma/client';

export class RoleRepository {
  async listAllPermissions() {
    return prisma.permission.findMany({
      orderBy: [
        { group: 'asc' },
        { key: 'asc' },
      ],
    });
  }

  async listRolePermissions() {
    return prisma.rolePermission.findMany({
      include: {
        permission: true,
      },
    });
  }

  async addRolePermission(role: UserRole, permissionId: string) {
    return prisma.rolePermission.upsert({
      where: {
        role_permissionId: { role, permissionId },
      },
      create: {
        role,
        permissionId,
      },
      update: {},
    });
  }

  async removeRolePermission(role: UserRole, permissionId: string) {
    return prisma.rolePermission.deleteMany({
      where: {
        role,
        permissionId,
      },
    });
  }

  async listUserOverrides(userId: string) {
    return prisma.userPermission.findMany({
      where: { userId },
      include: { permission: true },
    });
  }

  async setUserOverride(userId: string, permissionId: string, granted: boolean | null) {
    if (granted === null) {
      // Delete override -> reset to role default
      return prisma.userPermission.deleteMany({
        where: {
          userId,
          permissionId,
        },
      });
    }

    return prisma.userPermission.upsert({
      where: {
        userId_permissionId: { userId, permissionId },
      },
      create: {
        userId,
        permissionId,
        granted,
      },
      update: {
        granted,
      },
    });
  }
}
