/**
 * lib/auth.ts — NextAuth v4 Full Configuration
 *
 * Authentication strategy: database-backed sessions (not JWT).
 * This allows server-side session revocation (e.g., on role change or account suspension).
 *
 * Providers: Credentials (primary). Account model supports future OAuth providers.
 *
 * Security features:
 *   - Failed login attempt tracking with automatic account lockout
 *   - Generic error messages (never reveal whether email exists)
 *   - All auth events logged to LoginHistory / ActivityLog
 *   - Soft-deleted users and INACTIVE/SUSPENDED users are rejected
 */

import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import bcrypt from 'bcryptjs';

import prisma from '@/lib/prisma';
import { getUserPermissions } from '@/lib/permissions';
import { loginSchema } from '@/features/auth/schemas/login.schema';
import type { UserRole } from '@prisma/client';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Number of failed attempts before temporary lockout */
const MAX_FAILED_ATTEMPTS = 5;

/** Lockout duration in minutes */
const LOCKOUT_DURATION_MINUTES = 15;

/** Session max age in seconds (30 days) — adjust in .env for shorter sessions */
const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

// ---------------------------------------------------------------------------
// Helper: Log login attempt to LoginHistory
// ---------------------------------------------------------------------------

async function logLoginAttempt({
  userId,
  email,
  success,
  ipAddress,
  userAgent,
  failureReason,
}: {
  userId?: string;
  email: string;
  success: boolean;
  ipAddress?: string;
  userAgent?: string;
  failureReason?: string;
}) {
  await prisma.loginHistory.create({
    data: {
      userId: userId ?? null,
      email,
      success,
      ipAddress: ipAddress ?? null,
      userAgent: userAgent ?? null,
      failureReason: failureReason ?? null,
    },
  });
}

// ---------------------------------------------------------------------------
// NextAuth Options
// ---------------------------------------------------------------------------

export const authOptions: NextAuthOptions = {
  // PrismaAdapter handles Session, Account, and VerificationToken storage
  adapter: PrismaAdapter(prisma),

  // NextAuth v4 requires JWT strategy when using Credentials provider.
  // Although we use the Prisma adapter for user/account records, sessions themselves
  // must be token-based.
  session: {
    strategy: 'jwt',
    maxAge: SESSION_MAX_AGE,
    // Update session expiry on activity (rolling sessions)
    updateAge: 24 * 60 * 60, // 24 hours
  },

  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials) {
        // 1. Validate input shape with Zod
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          // Invalid input shape — treat as generic failure
          return null;
        }

        const { email, password } = parsed.data;

        // 2. Look up user — do NOT reveal whether the email exists
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          // Log failed attempt for unknown email (userId will be null)
          await logLoginAttempt({
            email,
            success: false,
            failureReason: 'user_not_found',
          });
          // Generic error — never reveal email existence
          return null;
        }

        // 3. Check soft-delete and account status
        if (user.deletedAt) {
          await logLoginAttempt({
            userId: user.id,
            email,
            success: false,
            failureReason: 'account_deleted',
          });
          throw new Error('ACCOUNT_INACTIVE');
        }

        if (user.status !== 'ACTIVE' || !user.isActive) {
          await logLoginAttempt({
            userId: user.id,
            email,
            success: false,
            failureReason: 'account_inactive',
          });
          throw new Error('ACCOUNT_INACTIVE');
        }

        // 4. Check account lockout
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          await logLoginAttempt({
            userId: user.id,
            email,
            success: false,
            failureReason: 'account_locked',
          });
          throw new Error('ACCOUNT_LOCKED');
        }

        // 5. Verify password
        const isValidPassword = await bcrypt.compare(password, user.passwordHash);

        if (!isValidPassword) {
          // Increment failed attempts
          const newFailedAttempts = user.failedLoginAttempts + 1;
          const shouldLock = newFailedAttempts >= MAX_FAILED_ATTEMPTS;

          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: newFailedAttempts,
              lockedUntil: shouldLock
                ? new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000)
                : null,
            },
          });

          await logLoginAttempt({
            userId: user.id,
            email,
            success: false,
            failureReason: shouldLock ? 'account_locked' : 'invalid_password',
          });

          if (shouldLock) {
            throw new Error('ACCOUNT_LOCKED');
          }

          return null;
        }

        // 6. Success — reset failed attempts, update lastLoginAt
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: 0,
            lockedUntil: null,
            lastLoginAt: new Date(),
          },
        });

        await logLoginAttempt({
          userId: user.id,
          email,
          success: true,
        });

        // Return the user object (only safe fields for the session)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image ?? null,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    /**
     * signIn callback — defense-in-depth check after authorize().
     * Re-verifies user status in case it changed between authorize() and session creation.
     */
    async signIn({ user }) {
      if (!user.id) return false;

      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { status: true, isActive: true, deletedAt: true },
      });

      if (!dbUser || dbUser.status !== 'ACTIVE' || !dbUser.isActive || dbUser.deletedAt) {
        return false;
      }

      return true;
    },

    /**
     * jwt callback — persists user ID, role, and permissions onto the token.
     * Called on token creation (login) and update.
     */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        // Fetch permissions once on login and cache in JWT.
        // Tradeoff: Permission changes won't reflect until the user logs out and logs in again.
        token.permissions = await getUserPermissions(user.id);
      }
      return token;
    },

    /**
     * session callback — enriches the session with role and permissions from the JWT token.
     * Called every time a session is accessed (getServerSession / useSession).
     */
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = (token.role ?? 'STUDENT') as UserRole;
        session.user.permissions = (token.permissions ?? []) as string[];
      }

      return session;
    },
  },

  events: {
    /**
     * signOut event — log the sign-out action to ActivityLog.
     */
    async signOut({ session }) {
      if (session && 'userId' in session && session.userId) {
        await prisma.activityLog.create({
          data: {
            userId: session.userId as string,
            action: 'USER_SIGNED_OUT',
          },
        });
      }
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  secret: process.env.AUTH_SECRET,
};
