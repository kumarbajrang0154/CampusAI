'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { FileQuestion, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const { data: session } = useSession();
  
  const dashboardLink = React.useMemo(() => {
    if (!session?.user?.role) return '/login';
    const role = session.user.role as string;
    return `/${role.toLowerCase()}/dashboard`;
  }, [session]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <div className="max-w-md space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <FileQuestion className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">404 — Page Not Found</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The page you are looking for does not exist or has been moved. Check the URL or click the button below to return to your dashboard.
          </p>
        </div>
        <div className="flex justify-center">
          <Button render={<Link href={dashboardLink} />} nativeButton={false} className="gap-2">
            <Home className="h-4 w-4" />
            {session?.user?.role ? 'Go to Dashboard' : 'Back to Login'}
          </Button>
        </div>
      </div>
    </div>
  );
}
