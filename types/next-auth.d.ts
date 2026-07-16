/**
 * types/next-auth.d.ts
 *
 * Extends NextAuth's default TypeScript types to include:
 * - user.id (string)
 * - user.role (UserRole enum)
 * - user.permissions (string[])
 *
 * These are populated in the session callback in lib/auth.ts.
 */

import type { UserRole } from '@prisma/client';
import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      permissions: string[];
    } & DefaultSession['user'];
  }

  interface User {
    role?: UserRole;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: UserRole;
    permissions?: string[];
  }
}
