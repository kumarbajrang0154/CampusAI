// proxy.ts — Next.js 16 Proxy/Middleware Placeholder
// NOTE: Next.js 16 renamed "middleware" to "proxy" (see: https://nextjs.org/docs/messages/middleware-to-proxy)
// TODO: Implement route protection, role-based access control, and session validation

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(_request: NextRequest) {
  // TODO: Add authentication checks and role-based routing
  return NextResponse.next();
}

export const config = {
  // TODO: Define protected route patterns
  matcher: [
    '/(student)/:path*',
    '/(faculty)/:path*',
    '/(hod)/:path*',
    '/(admin)/:path*',
  ],
};
