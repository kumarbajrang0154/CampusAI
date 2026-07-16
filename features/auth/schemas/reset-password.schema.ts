/**
 * features/auth/schemas/reset-password.schema.ts
 * Zod v4 validation schema for the password reset form.
 */
import { z } from 'zod';

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { error: 'Email is required' })
    .email({ error: 'Please enter a valid email address' }),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, { error: 'Reset token is required' }),
    password: z
      .string()
      .min(8, { error: 'Password must be at least 8 characters' })
      .regex(/[A-Z]/, { error: 'Password must contain at least one uppercase letter' })
      .regex(/[0-9]/, { error: 'Password must contain at least one number' }),
    confirmPassword: z.string().min(1, { error: 'Please confirm your password' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
