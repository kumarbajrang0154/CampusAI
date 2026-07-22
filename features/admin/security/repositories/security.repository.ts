import prisma from '@/lib/prisma';

export class SecurityRepository {
  async listActiveSessions() {
    return prisma.session.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true,
          },
        },
      },
      orderBy: { expires: 'desc' },
    });
  }

  async revokeSession(sessionId: string) {
    return prisma.session.delete({
      where: { id: sessionId },
    });
  }

  async getLoginSecuritySummary() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [total7Days, success7Days, failed7Days, recentFailedLogins] = await Promise.all([
      prisma.loginHistory.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      }),
      prisma.loginHistory.count({
        where: { createdAt: { gte: sevenDaysAgo }, success: true },
      }),
      prisma.loginHistory.count({
        where: { createdAt: { gte: sevenDaysAgo }, success: false },
      }),
      prisma.loginHistory.findMany({
        where: { success: false },
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    return {
      total7Days,
      success7Days,
      failed7Days,
      recentFailedLogins,
    };
  }

  async getOAuthHealth() {
    const hasGoogleId = !!(process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID);
    const hasGoogleSecret = !!(process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET);
    const hasNextAuthSecret = !!process.env.NEXTAUTH_SECRET;
    const appUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const googleIdSnippet = (process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID || '')
      .slice(0, 12)
      .concat('...');

    return {
      provider: 'Google OAuth 2.0',
      isHealthy: hasGoogleId && hasGoogleSecret && hasNextAuthSecret,
      hasGoogleId,
      hasGoogleSecret,
      hasNextAuthSecret,
      googleIdSnippet: hasGoogleId ? googleIdSnippet : 'Not Configured',
      callbackUrl: `${appUrl}/api/auth/callback/google`,
    };
  }
}
