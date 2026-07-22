import prisma from '@/lib/prisma';
import { NotificationType, UserRole } from '@prisma/client';

export interface CreateNotificationBatchInput {
  title: string;
  message: string;
  type: NotificationType;
  batchId: string;
  audienceType: string;
  audienceTarget: string;
  senderId: string;
  recipients: Array<{ userId: string }>;
}

export class NotificationRepository {
  async createNotificationBatch(input: CreateNotificationBatchInput) {
    const records = input.recipients.map((recipient) => ({
      userId: recipient.userId,
      title: input.title,
      message: input.message,
      type: input.type,
      batchId: input.batchId,
      audienceType: input.audienceType,
      audienceTarget: input.audienceTarget,
      senderId: input.senderId,
      isRead: false,
    }));

    return prisma.notification.createMany({
      data: records,
    });
  }

  async getAdminNotificationLogs(params: { page?: number; limit?: number }) {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = params.limit && params.limit > 0 ? params.limit : 10;
    const skip = (page - 1) * limit;

    // Fetch distinct batch IDs ordered by newest
    const groupedBatches = await prisma.notification.groupBy({
      by: ['batchId', 'title', 'message', 'type', 'audienceType', 'audienceTarget', 'senderId', 'createdAt'],
      where: {
        batchId: { not: null },
      },
      _count: {
        id: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    const totalGroupCount = await prisma.notification.groupBy({
      by: ['batchId'],
      where: {
        batchId: { not: null },
      },
    });
    const totalCount = totalGroupCount.length;

    // Fetch sender info for each batch
    const senderIds = Array.from(
      new Set(groupedBatches.map((b) => b.senderId).filter((id): id is string => !!id))
    );
    const senders = await prisma.user.findMany({
      where: { id: { in: senderIds } },
      select: { id: true, name: true, email: true },
    });
    const senderMap = new Map(senders.map((s) => [s.id, s.name || s.email]));

    const logs = groupedBatches.map((batch) => ({
      batchId: batch.batchId!,
      title: batch.title,
      message: batch.message,
      type: batch.type,
      audienceType: batch.audienceType || 'ALL',
      audienceTarget: batch.audienceTarget || 'Everyone',
      sentAt: batch.createdAt,
      recipientCount: batch._count.id,
      senderName: batch.senderId ? senderMap.get(batch.senderId) || 'System Admin' : 'System Admin',
    }));

    return {
      logs,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
    };
  }

  async getBatchRecipients(batchId: string) {
    const notifications = await prisma.notification.findMany({
      where: { batchId },
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return notifications.map((n) => ({
      notificationId: n.id,
      userId: n.user.id,
      name: n.user.name || 'Unknown User',
      email: n.user.email,
      role: n.user.role,
      isRead: n.isRead,
      createdAt: n.createdAt,
    }));
  }

  async getUserNotifications(userId: string, limit = 10) {
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      prisma.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    return {
      notifications,
      unreadCount,
    };
  }

  async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        isRead: true,
      },
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }

  // Audience resolution helpers
  async getTargetRecipients(params: {
    audienceType: 'ALL' | 'ROLE' | 'DEPARTMENT' | 'USERS';
    targetRole?: UserRole;
    targetDepartmentId?: string;
    targetUserIds?: string[];
  }) {
    if (params.audienceType === 'ALL') {
      return prisma.user.findMany({
        where: { isActive: true, deletedAt: null },
        select: { id: true, email: true, name: true, role: true },
      });
    }

    if (params.audienceType === 'ROLE' && params.targetRole) {
      return prisma.user.findMany({
        where: { role: params.targetRole, isActive: true, deletedAt: null },
        select: { id: true, email: true, name: true, role: true },
      });
    }

    if (params.audienceType === 'DEPARTMENT' && params.targetDepartmentId) {
      return prisma.user.findMany({
        where: {
          isActive: true,
          deletedAt: null,
          OR: [
            { student: { departmentId: params.targetDepartmentId } },
            { faculty: { departmentId: params.targetDepartmentId } },
            { hod: { departmentId: params.targetDepartmentId } },
          ],
        },
        select: { id: true, email: true, name: true, role: true },
      });
    }

    if (params.audienceType === 'USERS' && params.targetUserIds && params.targetUserIds.length > 0) {
      return prisma.user.findMany({
        where: {
          id: { in: params.targetUserIds },
          isActive: true,
          deletedAt: null,
        },
        select: { id: true, email: true, name: true, role: true },
      });
    }

    return [];
  }
}
