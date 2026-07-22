import { NotificationRepository } from '../repositories/notification.repository';
import { SendNotificationInput } from '../schemas/notification.schema';
import { resend } from '@/lib/resend';
import prisma from '@/lib/prisma';

export class NotificationService {
  private repository: NotificationRepository;

  constructor() {
    this.repository = new NotificationRepository();
  }

  async sendNotification(input: SendNotificationInput, senderId: string) {
    // 1. Resolve recipients
    const recipients = await this.repository.getTargetRecipients({
      audienceType: input.audienceType,
      targetRole: input.targetRole,
      targetDepartmentId: input.targetDepartmentId,
      targetUserIds: input.targetUserIds,
    });

    if (!recipients || recipients.length === 0) {
      throw new Error('No active recipients found for the selected audience.');
    }

    // 2. Format human-readable audience target summary
    let audienceTargetSummary = 'Everyone';
    if (input.audienceType === 'ROLE' && input.targetRole) {
      audienceTargetSummary = `Role: ${input.targetRole}`;
    } else if (input.audienceType === 'DEPARTMENT' && input.targetDepartmentId) {
      const dept = await prisma.department.findUnique({
        where: { id: input.targetDepartmentId },
        select: { name: true, code: true },
      });
      audienceTargetSummary = dept ? `Dept: ${dept.code || dept.name}` : 'Department';
    } else if (input.audienceType === 'USERS') {
      audienceTargetSummary = `${recipients.length} Selected User${recipients.length > 1 ? 's' : ''}`;
    }

    // 3. Create batch ID
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // 4. Create in-app Notification records in DB
    const batchResult = await this.repository.createNotificationBatch({
      title: input.title,
      message: input.message,
      type: input.type,
      batchId,
      audienceType: input.audienceType,
      audienceTarget: audienceTargetSummary,
      senderId,
      recipients: recipients.map((r) => ({ userId: r.id })),
    });

    // Audit log
    if (senderId) {
      await prisma.activityLog.create({
        data: {
          userId: senderId,
          action: 'NOTIFICATION_SEND',
          details: {
            title: input.title,
            type: input.type,
            audienceType: input.audienceType,
            audienceTarget: audienceTargetSummary,
            recipientCount: batchResult.count,
            batchId,
          },
        },
      });
    }

    // 5. Send Email via Resend in isolated try-catch block per recipient
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'CampusAI <onboarding@resend.dev>';
    const appUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Dispatch emails asynchronously in background / non-blocking
    Promise.allSettled(
      recipients.map(async (recipient) => {
        try {
          await resend.emails.send({
            from: fromEmail,
            to: [recipient.email],
            subject: `CampusAI: ${input.title}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
                <div style="border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 20px;">
                  <h2 style="color: #1e293b; margin: 0; font-size: 20px;">CampusAI Alert</h2>
                  <span style="display: inline-block; background-color: #dbeafe; color: #1e40af; font-size: 11px; font-weight: bold; padding: 2px 8px; border-radius: 12px; margin-top: 6px;">
                    ${input.type}
                  </span>
                </div>
                
                <h3 style="color: #0f172a; margin-top: 0;">${input.title}</h3>
                <p style="color: #334155; line-height: 1.6; white-space: pre-wrap;">${input.message}</p>
                
                <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center;">
                  <a href="${appUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; font-weight: bold; padding: 10px 20px; border-radius: 6px; font-size: 14px;">
                    Open CampusAI App
                  </a>
                </div>
                
                <p style="color: #94a3b8; font-size: 11px; margin-top: 24px; text-align: center;">
                  This is an automated notification from CampusAI. Please do not reply directly to this email.
                </p>
              </div>
            `,
          });
        } catch (emailError) {
          // Failure isolation: log error but DO NOT throw or crash batch creation
          console.error(`[Resend Email Error] Failed to send email to ${recipient.email}:`, emailError);
        }
      })
    ).catch((err) => {
      console.error('[Resend Batch Dispatch Error]', err);
    });

    return {
      batchId,
      recipientCount: batchResult.count,
      audienceSummary: audienceTargetSummary,
    };
  }

  async getAdminNotificationLogs(params: { page?: number; limit?: number }) {
    return this.repository.getAdminNotificationLogs(params);
  }

  async getBatchRecipients(batchId: string) {
    return this.repository.getBatchRecipients(batchId);
  }

  async getUserNotifications(userId: string, limit = 10) {
    return this.repository.getUserNotifications(userId, limit);
  }

  async markAsRead(notificationId: string, userId: string) {
    return this.repository.markAsRead(notificationId, userId);
  }

  async markAllAsRead(userId: string) {
    return this.repository.markAllAsRead(userId);
  }
}
