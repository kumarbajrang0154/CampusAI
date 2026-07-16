// middleware.ts — Next.js Middleware Placeholder
// TODO: Implement route protection, role-based access control, and session validation

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(_request: NextRequest) {
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
