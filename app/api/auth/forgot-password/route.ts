/**
 * app/api/auth/forgot-password/route.ts
 *
 * Password reset request API handler.
 * Generates a verification token and stubs the email sending process.
 * Always returns a generic success message to prevent email enumeration.
 */

import { NextResponse } from 'next/server';
import crypto from 'node:crypto';

import prisma from '@/lib/prisma';
import { forgotPasswordSchema } from '@/features/auth/schemas/reset-password.schema';
import { handleApiError } from '@/lib/errors';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Validate request body
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid email address.', errors: parsed.error.format() },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    // 2. Check if user exists
    const user = await prisma.user.findUnique({
      where: { email, deletedAt: null },
    });

    if (user) {
      // 3. Generate token
      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

      // Save verification token in DB (upsert so only one active token exists per email)
      await prisma.verificationToken.upsert({
        where: { identifier_token: { identifier: email, token } },
        update: { expires },
        create: {
          identifier: email,
          token,
          expires,
        },
      });

      // 4. Log the simulated email sending
      console.log(`\n======================================================`);
      console.log(`📬 [SIMULATED EMAIL] Password Reset Requested`);
      console.log(`   To:       ${email}`);
      console.log(`   Link:     http://localhost:3000/reset-password?token=${token}`);
      console.log(`   Expires:  ${expires.toISOString()}`);
      console.log(`======================================================\n`);
    } else {
      console.log(`📬 [SIMULATED EMAIL] Forgot password requested for non-existent email: ${email}`);
    }

    // 5. Always return success to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, we have sent a password reset link.',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
