// lib/auth.ts — NextAuth v4 Configuration Placeholder
// TODO: Implement full NextAuth configuration with providers, callbacks, etc.

import type { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
  // TODO: Add providers (Credentials, OAuth, etc.)
  providers: [],

  // TODO: Configure session strategy
  session: {
    strategy: 'jwt',
  },

  // TODO: Add callbacks (jwt, session, signIn, redirect)
  callbacks: {},

  // TODO: Configure pages
  pages: {
    signIn: '/login',
    error: '/login',
  },

  secret: process.env.AUTH_SECRET,
};
