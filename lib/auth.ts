import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { cookies } from 'next/headers';

import prisma from '@/lib/prisma';
import { getUserPermissions } from '@/lib/permissions';
import type { UserRole } from '@prisma/client';

const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

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

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: SESSION_MAX_AGE,
    updateAge: 24 * 60 * 60, // 24 hours
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        if (!user.email) {
          return '/?error=NoAccount';
        }

        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (!dbUser) {
            await logLoginAttempt({
              email: user.email,
              success: false,
              failureReason: 'user_not_found',
            });
            return '/?error=NoAccount';
          }

          if (dbUser.deletedAt) {
            await logLoginAttempt({
              userId: dbUser.id,
              email: user.email,
              success: false,
              failureReason: 'account_deleted',
            });
            return '/?error=AccountInactive';
          }

          if (dbUser.status !== 'ACTIVE' || !dbUser.isActive) {
            await logLoginAttempt({
              userId: dbUser.id,
              email: user.email,
              success: false,
              failureReason: 'account_inactive',
            });
            return '/?error=AccountInactive';
          }

          await logLoginAttempt({
            userId: dbUser.id,
            email: user.email,
            success: true,
          });

          const emailLocalPart = dbUser.email.split('@')[0];
          const hasPlaceholderName =
            !dbUser.name ||
            dbUser.name === 'Pending Name' ||
            dbUser.name === emailLocalPart;

          const updateData: Record<string, unknown> = {
            failedLoginAttempts: 0,
            lockedUntil: null,
            lastLoginAt: new Date(),
          };

          if (hasPlaceholderName && user.name) {
            updateData.name = user.name;
          }
          if (!dbUser.image && user.image) {
            updateData.image = user.image;
          }

          await prisma.user.update({
            where: { id: dbUser.id },
            data: updateData,
          });

          user.id = dbUser.id;
          user.role = dbUser.role;

          return true;
        } catch (error) {
          console.error('[signIn callback error]', error);
          return '/?error=ServerError';
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user && user.id) {
        token.id = user.id;
        token.role = user.role;
        token.permissions = await getUserPermissions(user.id);

        // Set the lightweight role cookie for middleware gating
        const cookieStore = await cookies();
        cookieStore.set('campusai-role', user.role as string, {
          path: '/',
          maxAge: 30 * 24 * 60 * 60, // 30 days
          sameSite: 'lax',
        });
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.permissions = (token.permissions ?? []) as string[];
      }
      return session;
    },
  },
  events: {
    async signOut(message) {
      const userId =
        ('session' in message && message.session && 'userId' in message.session && message.session.userId) ||
        ('token' in message && message.token && message.token.id);

      if (userId) {
        await prisma.activityLog.create({
          data: {
            userId: userId as string,
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
});
