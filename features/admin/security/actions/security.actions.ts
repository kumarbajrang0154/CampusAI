'use server';

import { requirePermission } from '@/lib/auth-guard';
import { SecurityService } from '../services/security.service';
import { revokeSessionSchema } from '../schemas/security.schema';
import { revalidatePath } from 'next/cache';

const securityService = new SecurityService();

export async function getActiveSessionsAction() {
  try {
    await requirePermission('settings.manage');
    const sessions = await securityService.listActiveSessions();

    return {
      success: true,
      data: sessions,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to fetch active sessions.',
      data: [],
    };
  }
}

export async function revokeSessionAction(sessionId: string) {
  try {
    const session = await requirePermission('settings.manage');
    const validated = revokeSessionSchema.parse({ sessionId });

    await securityService.revokeSession(validated.sessionId, session.user.id);

    revalidatePath('/admin/security');

    return {
      success: true,
      message: 'Session revoked successfully.',
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to revoke session.',
    };
  }
}

export async function getLoginSecuritySummaryAction() {
  try {
    await requirePermission('settings.manage');
    const summary = await securityService.getLoginSecuritySummary();

    return {
      success: true,
      data: summary,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to fetch security summary.',
    };
  }
}

export async function getOAuthHealthCheckAction() {
  try {
    await requirePermission('settings.manage');
    const health = await securityService.getOAuthHealth();

    return {
      success: true,
      data: health,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to fetch OAuth health.',
    };
  }
}
