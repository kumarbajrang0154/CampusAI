import { z } from 'zod';

export const activityLogFilterSchema = z.object({
  userId: z.string().optional(),
  action: z.string().optional(),
  search: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.number().default(1),
  limit: z.number().default(15),
});

export const loginHistoryFilterSchema = z.object({
  userId: z.string().optional(),
  success: z.boolean().optional(),
  search: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.number().default(1),
  limit: z.number().default(15),
});

export type ActivityLogFilterInput = z.infer<typeof activityLogFilterSchema>;
export type LoginHistoryFilterInput = z.infer<typeof loginHistoryFilterSchema>;
