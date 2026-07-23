import { z } from 'zod';
import { AcademicEventType } from '@prisma/client';

export const academicCalendarSchema = z.object({
  title: z.string().min(2, 'Event title must be at least 2 characters'),
  description: z.string().optional().nullable(),
  eventType: z.nativeEnum(AcademicEventType),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()).optional().nullable(),
  semesterId: z.string().optional().nullable(),
  departmentId: z.string().optional().nullable(),
  isPublished: z.boolean(),
});

export type AcademicCalendarFormValues = z.infer<typeof academicCalendarSchema>;
