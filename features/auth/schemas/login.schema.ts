/**
 * features/auth/schemas/login.schema.ts
 * Zod v4 validation schema for the login form.
 */
import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { error: 'Email is required' })
    .email({ error: 'Please enter a valid email address' })
    .toLowerCase(),
  password: z.string().min(1, { error: 'Password is required' }),
});

export type LoginInput = z.infer<typeof loginSchema>;
