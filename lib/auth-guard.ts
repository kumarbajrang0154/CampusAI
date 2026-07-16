/**
 * lib/auth-guard.ts — Server-Side Authentication & Permission Guards
 *
 * Use these in Server Components, Server Actions, and API Route Handlers
 * to enforce authentication and permissions AFTER the proxy has done
 * lightweight cookie-based route gating.
 *
 * These guards use getServerSession() which validates against the DB —
 * providing real security (not just cookie presence checks).
 *
 * Usage examples:
 *
 *   // In an API route handler:
 *   export async function POST(req: Request) {
 *     try {
 *       const session = await requireAuth();
 *       // session.user.id, session.user.role, session.user.permissions available
 *     } catch (error) {
 *       return handleApiError(error);
 *     }
 *   }
 *
 *   // Require a specific role:
 *   const session = await requireRole(['ADMIN', 'HOD']);
 *
 *   // Require a specific permission:
 *   const session = await requirePermission('attendance.write');
 */

import { getServerSession } from 'next-auth';
import type { Session } from 'next-auth';
import type { UserRole } from '@prisma/client';

import { authOptions } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { AuthError, ForbiddenError } from '@/lib/errors';

// ---------------------------------------------------------------------------
// requireAuth — ensure user is logged in
// ---------------------------------------------------------------------------

/**
 * Verifies that the current request has a valid server-side session.
 * Throws AuthError (401) if not authenticated.
 * Returns the full session object on success.
 */
export async function requireAuth(): Promise<Session> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    throw new AuthError();
  }

  return session;
}

// ---------------------------------------------------------------------------
// requireRole — ensure user has one of the allowed roles
// ---------------------------------------------------------------------------

/**
 * Verifies that the authenticated user has one of the specified roles.
 * Throws AuthError (401) if not authenticated.
 * Throws ForbiddenError (403) if authenticated but wrong role.
 * Returns the session on success.
 */
export async function requireRole(allowedRoles: UserRole[]): Promise<Session> {
  const session = await requireAuth();

  if (!allowedRoles.includes(session.user.role)) {
    throw new ForbiddenError(
      `This action requires one of the following roles: ${allowedRoles.join(', ')}`
    );
  }

  return session;
}

// ---------------------------------------------------------------------------
// requirePermission — ensure user has a specific permission key
// ---------------------------------------------------------------------------

/**
 * Verifies that the authenticated user has a specific permission.
 * Combines role-default permissions with per-user overrides (see lib/permissions.ts).
 * Throws AuthError (401) if not authenticated.
 * Throws ForbiddenError (403) if permission is missing or explicitly denied.
 * Returns the session on success.
 */
export async function requirePermission(permissionKey: string): Promise<Session> {
  const session = await requireAuth();

  const permitted = await hasPermission(session.user.id, permissionKey);

  if (!permitted) {
    throw new ForbiddenError(`Missing required permission: ${permissionKey}`);
  }

  return session;
}
