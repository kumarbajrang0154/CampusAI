import * as React from 'react';
import Link from 'next/link';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4 dark:bg-zinc-950">
      <div className="w-full max-w-md space-y-6">
        {/* Logo Section */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black text-2xl shadow-sm">
            C
          </div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">CampusAI</h2>
        </div>

        {/* Content Card container */}
        <div className="bg-card text-card-foreground border rounded-xl shadow-sm overflow-hidden">
          {children}
        </div>

        {/* Footer links */}
        <footer className="text-center text-xs text-muted-foreground space-x-4">
          <Link href="/help" className="hover:underline">
            Help
          </Link>
          <span>&middot;</span>
          <Link href="/privacy" className="hover:underline">
            Privacy
          </Link>
          <span>&middot;</span>
          <Link href="/terms" className="hover:underline">
            Terms
          </Link>
        </footer>
      </div>
    </div>
  );
}
