/**
 * app/api/auth/reset-password/route.ts
 *
 * Password reset execution API handler.
 * Validates the reset token, updates the user's password,
 * deletes the token, invalidates active sessions, and logs the event.
 */

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

import prisma from '@/lib/prisma';
import { handleApiError } from '@/lib/errors';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { success: false, message: 'Token and password are required.' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    // 1. Find and validate the verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired password reset link.' },
        { status: 400 }
      );
    }

    if (verificationToken.expires < new Date()) {
      // Clean up expired token
      await prisma.verificationToken.delete({ where: { token } }).catch(() => {});
      return NextResponse.json(
        { success: false, message: 'Password reset link has expired.' },
        { status: 400 }
      );
    }

    const email = verificationToken.identifier;

    // 2. Find the user
    const user = await prisma.user.findUnique({
      where: { email, deletedAt: null },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User account not found.' },
        { status: 404 }
      );
    }

    // 3. Hash the new password
    const passwordHash = await bcrypt.hash(password, 12);

    // 4. Perform database updates in a transaction
    await prisma.$transaction([
      // Update password hash and unlock account if it was locked
      prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      }),
      // Delete the used token
      prisma.verificationToken.delete({
        where: { token },
      }),
      // Delete all active sessions for the user to force re-login on all devices
      prisma.session.deleteMany({
        where: { userId: user.id },
      }),
      // Log reset activity
      prisma.activityLog.create({
        data: {
          userId: user.id,
          targetUserId: user.id,
          action: 'PASSWORD_RESET',
          details: { reason: 'user_reset_request' },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Your password has been successfully reset.',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
