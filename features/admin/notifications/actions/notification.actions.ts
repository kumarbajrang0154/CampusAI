'use server';

import { requireAuth, requirePermission } from '@/lib/auth-guard';
import { NotificationService } from '../services/notification.service';
import { sendNotificationSchema, SendNotificationInput } from '../schemas/notification.schema';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';

const notificationService = new NotificationService();

export async function sendNotificationAction(data: SendNotificationInput) {
  try {
    const session = await requirePermission('notification.manage');
    const validated = sendNotificationSchema.parse(data);

    const result = await notificationService.sendNotification(validated, session.user.id);

    revalidatePath('/admin/notifications');

    return {
      success: true,
      message: `Notification sent successfully to ${result.recipientCount} recipient(s).`,
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to send notification.',
    };
  }
}

export async function getAdminNotificationLogsAction(params: { page?: number; limit?: number }) {
  try {
    await requirePermission('notification.manage');
    const logsData = await notificationService.getAdminNotificationLogs(params);

    return {
      success: true,
      data: logsData,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to fetch notification logs.',
    };
  }
}

export async function getBatchRecipientsAction(batchId: string) {
  try {
    await requirePermission('notification.manage');
    const recipients = await notificationService.getBatchRecipients(batchId);

    return {
      success: true,
      data: recipients,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to fetch recipient details.',
    };
  }
}

export async function getUserNotificationsAction(limit = 10) {
  try {
    const session = await requireAuth();
    const result = await notificationService.getUserNotifications(session.user.id, limit);

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to fetch user notifications.',
      data: { notifications: [], unreadCount: 0 },
    };
  }
}

export async function markNotificationAsReadAction(notificationId: string) {
  try {
    const session = await requireAuth();
    await notificationService.markAsRead(notificationId, session.user.id);

    revalidatePath('/', 'layout');

    return {
      success: true,
      message: 'Notification marked as read.',
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to mark notification as read.',
    };
  }
}

export async function markAllNotificationsAsReadAction() {
  try {
    const session = await requireAuth();
    await notificationService.markAllAsRead(session.user.id);

    revalidatePath('/', 'layout');

    return {
      success: true,
      message: 'All notifications marked as read.',
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to mark all notifications as read.',
    };
  }
}

export async function getNotificationComposeOptionsAction() {
  try {
    await requirePermission('notification.manage');
    const departments = await prisma.department.findMany({
      select: { id: true, name: true, code: true },
      orderBy: { name: 'asc' },
    });

    return {
      success: true,
      data: { departments },
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to fetch options.',
      data: { departments: [] },
    };
  }
}

export async function searchUsersForNotificationAction(query: string) {
  try {
    await requirePermission('notification.manage');
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      take: 20,
      orderBy: { name: 'asc' },
    });

    return {
      success: true,
      data: users,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to search users.',
      data: [],
    };
  }
}
