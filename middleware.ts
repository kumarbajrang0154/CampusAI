/**
 * middleware.ts — Next.js 15 Route Protection Middleware
 *
 * Authentication & RBAC Strategy:
 * Reads NextAuth JWT session token via `getToken()` from `next-auth/jwt`.
 * Decodes session token directly in edge middleware (no DB calls required).
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

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

/** Role → Dashboard mapping */
const ROLE_DASHBOARD: Record<string, string> = {
  STUDENT: '/student/dashboard',
  FACULTY: '/faculty/dashboard',
  HOD: '/hod/dashboard',
  ADMIN: '/admin/dashboard',
};

// ---------------------------------------------------------------------------
// Middleware handler
// ---------------------------------------------------------------------------

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read JWT session token directly from NextAuth
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: process.env.NODE_ENV === 'production',
  });

  const isAuthenticated = Boolean(token);
  const userRole = token?.role as string | undefined;

  // 1. Public routes — always allow
  if (PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + '/'))) {
    return NextResponse.next();
  }

  // 2. Auth routes — redirect authenticated users to their role dashboard
  if (AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(route + '/'))) {
    if (isAuthenticated && userRole && ROLE_DASHBOARD[userRole]) {
      return NextResponse.redirect(new URL(ROLE_DASHBOARD[userRole], request.url));
    }
    return NextResponse.next();
  }

  // 3. Protected routes — require authentication
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Shared authenticated routes — any logged-in role
  if (SHARED_AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(route + '/'))) {
    return NextResponse.next();
  }

  // 5. Role-specific routes — check role matches
  for (const [routePrefix, requiredRole] of Object.entries(ROLE_ROUTE_MAP)) {
    if (pathname === routePrefix || pathname.startsWith(routePrefix + '/')) {
      // Role mismatch — show 403
      if (userRole && userRole !== requiredRole) {
        return NextResponse.redirect(new URL('/403', request.url));
      }

      return NextResponse.next();
    }
  }

  // 6. All other routes — allow
  return NextResponse.next();
}

// ---------------------------------------------------------------------------
// Matcher — excludes internal Next.js routes, API routes, and static assets
// ---------------------------------------------------------------------------

export const config = {
  matcher: [
    '/((?!api/|_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
