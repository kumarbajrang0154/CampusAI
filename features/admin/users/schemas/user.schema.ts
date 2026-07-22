import { z } from 'zod';
import { UserRole } from '@prisma/client';

export const createUserSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .toLowerCase(),
  role: z.nativeEnum(UserRole),
  name: z
    .string()
    .max(50, 'Name cannot exceed 50 characters')
    .optional()
    .or(z.literal('')),
  departmentId: z.string().optional().or(z.literal('')),
  enrollmentNo: z.string().optional().or(z.literal('')),
  employeeId: z.string().optional().or(z.literal('')),
  designation: z.string().optional().or(z.literal('')),
  specialization: z.string().optional().or(z.literal('')),
  semester: z.number().int().min(1).max(10).optional(),
  section: z.string().optional().or(z.literal('')),
  batchYear: z.number().int().min(2000).max(2100).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
