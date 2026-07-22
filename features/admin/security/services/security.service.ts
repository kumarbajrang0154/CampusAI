import { SecurityRepository } from '../repositories/security.repository';
import prisma from '@/lib/prisma';

export class SecurityService {
  private repository: SecurityRepository;

  constructor() {
    this.repository = new SecurityRepository();
  }

  async listActiveSessions() {
    return this.repository.listActiveSessions();
  }

  async revokeSession(sessionId: string, actorUserId: string) {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });

    const result = await this.repository.revokeSession(sessionId);

    // Audit log for session revocation
    await prisma.activityLog.create({
      data: {
        userId: actorUserId,
        targetUserId: session?.userId,
        action: 'SESSION_REVOKE',
        details: {
          revokedSessionId: sessionId,
          targetUserEmail: session?.user.email,
        },
      },
    });

    return result;
  }

  async getLoginSecuritySummary() {
    return this.repository.getLoginSecuritySummary();
  }

  async getOAuthHealth() {
    return this.repository.getOAuthHealth();
  }
}
