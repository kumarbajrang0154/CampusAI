import * as React from 'react';
import { BreadcrumbNav } from './breadcrumb-nav';

interface DataTableLayoutProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export function DataTableLayout({ title, description, action, children }: DataTableLayoutProps) {
  return (
    <div className="space-y-6">
      {/* Header section with breadcrumbs and action */}
      <div className="space-y-1">
        <BreadcrumbNav />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
          {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
        </div>
      </div>

      {/* Main Table section */}
      <div className="w-full">
        {children}
      </div>
    </div>
  );
}
