import { z } from 'zod';
import { NotificationType, UserRole } from '@prisma/client';

export const AudienceTypeEnum = z.enum(['ALL', 'ROLE', 'DEPARTMENT', 'USERS']);
export type AudienceType = z.infer<typeof AudienceTypeEnum>;

export const sendNotificationSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(200, 'Title cannot exceed 200 characters'),
  message: z
    .string()
    .trim()
    .min(1, 'Message is required'),
  type: z.nativeEnum(NotificationType),
  audienceType: AudienceTypeEnum,
  targetRole: z.nativeEnum(UserRole).optional(),
  targetDepartmentId: z.string().optional(),
  targetUserIds: z.array(z.string()).optional(),
}).refine(
  (data) => {
    if (data.audienceType === 'ROLE') {
      return !!data.targetRole;
    }
    if (data.audienceType === 'DEPARTMENT') {
      return !!data.targetDepartmentId;
    }
    if (data.audienceType === 'USERS') {
      return Array.isArray(data.targetUserIds) && data.targetUserIds.length > 0;
    }
    return true;
  },
  {
    message: 'Please complete all required fields for the selected audience.',
    path: ['audienceType'],
  }
);

export type SendNotificationInput = z.infer<typeof sendNotificationSchema>;
