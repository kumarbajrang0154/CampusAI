'use client';

import * as React from 'react';
import { ErrorState } from '@/components/shared/error-state';

export default function HodError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('HOD module error boundary:', error);
  }, [error]);

  return (
    <div className="flex h-[70vh] items-center justify-center p-4">
      <div className="w-full max-w-md">
        <ErrorState
          message={error.message || 'An unexpected error occurred in the HOD Dashboard.'}
          onRetry={reset}
        />
      </div>
    </div>
  );
}
