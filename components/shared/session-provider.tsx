'use client';

/**
 * components/shared/session-provider.tsx
 *
 * Wraps NextAuth's SessionProvider for use in the App Router.
 * Must be a Client Component since SessionProvider uses React context.
 */

import { SessionProvider } from 'next-auth/react';
import type { Session } from 'next-auth';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  session?: Session | null;
}

export function AppSessionProvider({ children, session }: Props) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
