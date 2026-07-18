import { UserRepository } from '../repositories/user.repository';
import { UserRole, UserStatus, Prisma } from '@prisma/client';
import prisma from '@/lib/prisma'; // Imported directly for transactions/logging if needed, or we can use repository

const userRepository = new UserRepository();

export class UserService {
  async createUser(
    input: { email: string; role: UserRole; name?: string },
    adminUserId: string
  ) {
    const email = input.email.trim().toLowerCase();
    const name = input.name?.trim() || email.split('@')[0];

    // 1. Check if user already exists (even if soft-deleted, we might want to check)
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('A user with this email already exists.');
    }

    // 2. Create user with dummy password hash to satisfy schema
    const dummyPasswordHash = '$2b$12$DummyHashForSchemaSatisfactionPlaceholder';
    
    // We run the user creation and activity log in a transaction to guarantee atomic operation
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          name,
          role: input.role,
          status: UserStatus.ACTIVE,
          isActive: true,
          passwordHash: dummyPasswordHash,
        },
      });

      await tx.activityLog.create({
        data: {
          userId: adminUserId,
          targetUserId: user.id,
          action: 'USER_CREATED',
          details: { email: user.email, role: user.role } as Prisma.InputJsonValue,
        },
      });

      return user;
    });

    // TODO: Send welcome email notification via Resend in the future stage.
    // resend.emails.send({ ... })

    return newUser;
  }

  async listUsers(
    filters: {
      role?: UserRole;
      status?: UserStatus;
      search?: string;
      page?: number;
      limit?: number;
    } = {}
  ) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      deletedAt: null, // Exclude soft-deleted users
    };

    if (filters.role) {
      where.role = filters.role;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.search) {
      const searchLower = filters.search.trim().toLowerCase();
      where.OR = [
        { email: { contains: searchLower, mode: 'insensitive' } },
        { name: { contains: searchLower, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      userRepository.list({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: 'desc' },
      }),
      userRepository.count(where),
    ]);

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateUserRole(userId: string, newRole: UserRole, adminUserId: string) {
    // 1. Fetch existing user
    const user = await userRepository.findById(userId);
    if (!user || user.deletedAt) {
      throw new Error('User not found.');
    }

    if (user.role === newRole) {
      return user;
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id: userId },
        data: { role: newRole },
      });

      await tx.activityLog.create({
        data: {
          userId: adminUserId,
          targetUserId: userId,
          action: 'ROLE_CHANGED',
          details: { oldRole: user.role, newRole } as Prisma.InputJsonValue,
        },
      });

      return updated;
    });

    return updatedUser;
  }

  async toggleUserStatus(userId: string, adminUserId: string) {
    const user = await userRepository.findById(userId);
    if (!user || user.deletedAt) {
      throw new Error('User not found.');
    }

    const newStatus = user.status === UserStatus.ACTIVE ? UserStatus.INACTIVE : UserStatus.ACTIVE;
    const newIsActive = newStatus === UserStatus.ACTIVE;

    const updatedUser = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id: userId },
        data: {
          status: newStatus,
          isActive: newIsActive,
        },
      });

      await tx.activityLog.create({
        data: {
          userId: adminUserId,
          targetUserId: userId,
          action: newStatus === UserStatus.INACTIVE ? 'ACCOUNT_DISABLED' : 'ACCOUNT_ENABLED',
          details: {} as Prisma.InputJsonValue,
        },
      });

      return updated;
    });

    return updatedUser;
  }

  async deleteUser(userId: string, adminUserId: string) {
    const user = await userRepository.findById(userId);
    if (!user || user.deletedAt) {
      throw new Error('User not found.');
    }

    const deletedUser = await prisma.$transaction(async (tx) => {
      // Soft delete: set deletedAt and set status to INACTIVE
      const updated = await tx.user.update({
        where: { id: userId },
        data: {
          deletedAt: new Date(),
          status: UserStatus.INACTIVE,
          isActive: false,
        },
      });

      await tx.activityLog.create({
        data: {
          userId: adminUserId,
          targetUserId: userId,
          action: 'USER_DELETED',
          details: {} as Prisma.InputJsonValue,
        },
      });

      return updated;
    });

    return deletedUser;
  }
}
