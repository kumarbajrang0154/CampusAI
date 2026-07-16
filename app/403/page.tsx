/**
 * app/403/page.tsx — Unauthorized / Forbidden Page
 *
 * Shown when an authenticated user attempts to access a route
 * they do not have permission for (wrong role).
 */

import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '403 — Unauthorized',
  description: 'You do not have permission to access this page.',
};

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="text-8xl font-bold text-muted-foreground">403</div>
      <h1 className="text-2xl font-semibold">Access Denied</h1>
      <p className="max-w-sm text-muted-foreground">
        You do not have permission to access this page. If you believe this is an error, please
        contact your administrator.
      </p>
      <Link
        href="/"
        className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Go to Home
      </Link>
    </div>
  );
}
