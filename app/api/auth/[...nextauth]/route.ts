// app/api/auth/[...nextauth]/route.ts — NextAuth v4 API Route
// TODO: This will handle all NextAuth authentication endpoints

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
