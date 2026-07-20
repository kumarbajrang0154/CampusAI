/**
 * app/api/auth/[...nextauth]/route.ts
 *
 * Auth.js v5 route handlers.
 */

import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;
