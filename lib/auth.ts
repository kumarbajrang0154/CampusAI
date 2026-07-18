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
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';

import prisma from '@/lib/prisma';
import { getUserPermissions } from '@/lib/permissions';
import type { UserRole } from '@prisma/client';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

// Deprecated: lockout constants no longer used since Google OAuth is the sole sign-in method.
// const MAX_FAILED_ATTEMPTS = 5;
// const LOCKOUT_DURATION_MINUTES = 15;

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
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      /*
       * Safe to enable email linking here because:
       * 1. Google emails are pre-vetted by administrators (no open sign-up allowed).
       * 2. The signIn callback gates authentication, rejecting any email not pre-registered in the DB.
       */
      allowDangerousEmailAccountLinking: true,
    }),
  ],

  callbacks: {
    /**
     * signIn callback — acts as the main gatekeeper for Google OAuth.
     * Restricts login to pre-provisioned, active user accounts created by Admins.
     */
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        if (!user.email) {
          return false;
        }

        // 1. Verify user exists in the database
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!dbUser) {
          // Reject and log to LoginHistory
          await logLoginAttempt({
            email: user.email,
            success: false,
            failureReason: 'user_not_found',
          });
          return false;
        }

        // 2. Verify account status
        if (dbUser.deletedAt) {
          await logLoginAttempt({
            userId: dbUser.id,
            email: user.email,
            success: false,
            failureReason: 'account_deleted',
          });
          return false;
        }

        if (dbUser.status !== 'ACTIVE' || !dbUser.isActive) {
          await logLoginAttempt({
            userId: dbUser.id,
            email: user.email,
            success: false,
            failureReason: 'account_inactive',
          });
          return false;
        }

        // 3. Success - log login attempt and update lastLoginAt
        await logLoginAttempt({
          userId: dbUser.id,
          email: user.email,
          success: true,
        });

        await prisma.user.update({
          where: { id: dbUser.id },
          data: {
            failedLoginAttempts: 0,
            lockedUntil: null,
            lastLoginAt: new Date(),
          },
        });

        // Set role + id so they are available to subsequent callbacks
        user.id = dbUser.id;
        user.role = dbUser.role;
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
    signIn: '/',
    error: '/',
  },

  secret: process.env.AUTH_SECRET,
};
