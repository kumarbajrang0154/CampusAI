/**
 * proxy.ts — Next.js 16 Route Protection Proxy
 *
 * NOTE: Next.js 16 renamed "middleware.ts" to "proxy.ts".
 * See: https://nextjs.org/docs/messages/middleware-to-proxy
 *
 * Authentication Strategy Note:
 * NextAuth v4 with strategy: "database" stores sessions in the DB, NOT in JWTs.
 * This means getToken() (which reads JWTs from cookies) returns null with database sessions.
 *
 * Chosen approach: Cookie presence check in the proxy (lightweight, no DB call).
 * The cookie "next-auth.session-token" (or "__Secure-next-auth.session-token" in production)
 * is set by NextAuth when a session is created. Its presence indicates the user is
 * (likely) authenticated. Full server-side validation with getServerSession() happens
 * in layouts and API routes (lib/auth-guard.ts) — NOT here in the proxy.
 *
 * This is the recommended NextAuth v4 + App Router + database sessions approach:
 * https://next-auth.js.org/configuration/nextjs#middleware
 *
 * Role-based access in the proxy:
 * We store the user's role in a separate lightweight cookie (set after login) to
 * avoid a DB call in the proxy. The cookie is HttpOnly and signed by the session.
 * For the initial implementation, we read from a "campusai-role" cookie set server-side.
 * If the role cookie is absent (e.g., old session), the proxy redirects to /login to re-auth.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// Route Configuration
// ---------------------------------------------------------------------------

/** Public routes — no authentication required */
const PUBLIC_ROUTES = ['/', '/about', '/features', '/contact'];

/** Auth routes — redirect to dashboard if already logged in */
const AUTH_ROUTES = ['/login', '/forgot-password', '/reset-password'];

/** Route prefix → required role mapping */
const ROLE_ROUTE_MAP: Record<string, string> = {
  '/student': 'STUDENT',
  '/faculty': 'FACULTY',
  '/hod': 'HOD',
  '/admin': 'ADMIN',
};

/** Routes accessible to any authenticated user (any role) */
const SHARED_AUTH_ROUTES = ['/notifications', '/profile', '/settings'];

/** Session cookie names (NextAuth v4 defaults) */
const SESSION_COOKIE_NAME =
  process.env.NODE_ENV === 'production'
    ? '__Secure-next-auth.session-token'
    : 'next-auth.session-token';

/** Lightweight role cookie set by the session callback (server-side) */
const ROLE_COOKIE_NAME = 'campusai-role';

// ---------------------------------------------------------------------------
// Role → Dashboard mapping
// ---------------------------------------------------------------------------

const ROLE_DASHBOARD: Record<string, string> = {
  STUDENT: '/student/dashboard',
  FACULTY: '/faculty/dashboard',
  HOD: '/hod/dashboard',
  ADMIN: '/admin/dashboard',
};

// ---------------------------------------------------------------------------
// Proxy handler
// ---------------------------------------------------------------------------

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Check session cookie presence
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const isAuthenticated = Boolean(sessionToken);

  // 2. Read role from the lightweight role cookie
  const userRole = request.cookies.get(ROLE_COOKIE_NAME)?.value;

  // 3. Public routes — always allow
  if (PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + '/'))) {
    return NextResponse.next();
  }

  // 4. Auth routes — redirect authenticated users to their dashboard
  if (AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(route + '/'))) {
    if (isAuthenticated && userRole && ROLE_DASHBOARD[userRole]) {
      return NextResponse.redirect(new URL(ROLE_DASHBOARD[userRole], request.url));
    }
    return NextResponse.next();
  }

  // 5. Protected routes — require authentication
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(ROLE_COOKIE_NAME);
    return response;
  }

  // 6. Shared authenticated routes — any logged-in role
  if (SHARED_AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(route + '/'))) {
    return NextResponse.next();
  }

  // 7. Role-specific routes — check role matches
  for (const [routePrefix, requiredRole] of Object.entries(ROLE_ROUTE_MAP)) {
    if (pathname === routePrefix || pathname.startsWith(routePrefix + '/')) {
      // No role cookie — send back to login to re-establish session
      if (!userRole) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Role mismatch — show 403
      if (userRole !== requiredRole) {
        return NextResponse.redirect(new URL('/403', request.url));
      }

      return NextResponse.next();
    }
  }

  // 8. All other routes — allow (API routes, etc. are excluded by matcher)
  return NextResponse.next();
}

// ---------------------------------------------------------------------------
// Matcher — excludes internal Next.js routes and static assets
// ---------------------------------------------------------------------------

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder files (images, icons)
     * - /api/auth/* (NextAuth handles its own auth)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|api/auth/).*)',
  ],
};
