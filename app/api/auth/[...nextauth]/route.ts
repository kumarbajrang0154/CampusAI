/**
 * app/api/auth/[...nextauth]/route.ts
 *
 * NextAuth v4 catch-all route handler for App Router.
 * Handles all /api/auth/* endpoints:
 *   - GET  /api/auth/session
 *   - GET  /api/auth/csrf
 *   - GET  /api/auth/providers
 *   - POST /api/auth/signin/credentials
 *   - POST /api/auth/signout
 *   etc.
 */

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
