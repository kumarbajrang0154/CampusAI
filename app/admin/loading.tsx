import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminLoading() {
  return (
    <div className="space-y-6 w-full animate-pulse">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-8 w-64" />
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="border bg-card rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
        <div className="border bg-card rounded-xl p-6 space-y-4 h-[300px]">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-[200px] w-full" />
        </div>
        <div className="border bg-card rounded-xl p-6 space-y-4 h-[300px]">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      </div>
    </div>
  );
}
