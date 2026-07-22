import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { ActivityLogFilterInput, LoginHistoryFilterInput } from '../schemas/audit.schema';

export class AuditRepository {
  // Activity Log Queries
  async listActivityLogs(filters: ActivityLogFilterInput) {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 15;
    const skip = (page - 1) * limit;

    const where: Prisma.ActivityLogWhereInput = {
      ...(filters.userId ? { userId: filters.userId } : {}),
      ...(filters.action ? { action: filters.action } : {}),
      ...(filters.search
        ? {
            OR: [
              { action: { contains: filters.search, mode: 'insensitive' } },
              { user: { name: { contains: filters.search, mode: 'insensitive' } } },
              { user: { email: { contains: filters.search, mode: 'insensitive' } } },
            ],
          }
        : {}),
      ...(filters.startDate || filters.endDate
        ? {
            createdAt: {
              ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
              ...(filters.endDate ? { lte: new Date(filters.endDate) } : {}),
            },
          }
        : {}),
    };

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.activityLog.count({ where }),
    ]);

    return {
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  // Login History Queries
  async listLoginHistory(filters: LoginHistoryFilterInput) {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 15;
    const skip = (page - 1) * limit;

    const where: Prisma.LoginHistoryWhereInput = {
      ...(filters.userId ? { userId: filters.userId } : {}),
      ...(filters.success !== undefined ? { success: filters.success } : {}),
      ...(filters.search
        ? {
            OR: [
              { email: { contains: filters.search, mode: 'insensitive' } },
              { failureReason: { contains: filters.search, mode: 'insensitive' } },
              { ipAddress: { contains: filters.search, mode: 'insensitive' } },
              { user: { name: { contains: filters.search, mode: 'insensitive' } } },
            ],
          }
        : {}),
      ...(filters.startDate || filters.endDate
        ? {
            createdAt: {
              ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
              ...(filters.endDate ? { lte: new Date(filters.endDate) } : {}),
            },
          }
        : {}),
    };

    const [history, total] = await Promise.all([
      prisma.loginHistory.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.loginHistory.count({ where }),
    ]);

    return {
      history,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  // Fetch unique action types for dropdown filter
  async getUniqueActionTypes() {
    const actions = await prisma.activityLog.groupBy({
      by: ['action'],
      _count: { action: true },
      orderBy: { action: 'asc' },
    });
    return actions.map((a) => a.action);
  }

  // Fetch active users list for filter dropdown
  async getActiveUsersForFilter() {
    return prisma.user.findMany({
      where: { isActive: true, deletedAt: null },
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: 'asc' },
      take: 100,
    });
  }
}
