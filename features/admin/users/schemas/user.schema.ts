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
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

/**
 * FUTURE ENHANCEMENT:
 * Creating a user with the ADMIN role is a highly sensitive action.
 * In a future phase, we should add an extra step of validation,
 * such as requiring confirmation or an multi-factor approval flow,
 * to prevent accidental creation of unauthorized administrator accounts.
 */
