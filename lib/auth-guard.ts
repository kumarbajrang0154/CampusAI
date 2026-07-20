/**
 * lib/auth-guard.ts — Server-Side Authentication & Permission Guards
 *
 * Use these in Server Components, Server Actions, and API Route Handlers
 * to enforce authentication and permissions AFTER the middleware has done
 * lightweight cookie-based route gating.
 *
 * These guards use auth() which validates against the DB/session context —
 * providing real security (not just cookie presence checks).
 */

import { auth } from '@/lib/auth';
import type { Session } from 'next-auth';
import type { UserRole } from '@prisma/client';

import { hasPermission } from '@/lib/permissions';
import { AuthError, ForbiddenError } from '@/lib/errors';

// ---------------------------------------------------------------------------
// requireAuth — ensure user is logged in
// ---------------------------------------------------------------------------

/**
 * Verifies that the current request has a valid session.
 * Throws AuthError (401) if not authenticated.
 * Returns the full session object on success.
 */
export async function requireAuth(): Promise<Session> {
  const session = await auth();

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
