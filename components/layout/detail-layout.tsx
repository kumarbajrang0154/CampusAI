import * as React from 'react';
import { BreadcrumbNav } from './breadcrumb-nav';

interface DetailLayoutProps {
  title: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  infoSection: React.ReactNode; // e.g. Left/Top main detail view
  tabsSection: React.ReactNode; // e.g. Bottom/Related details tabs
  timelineSection?: React.ReactNode; // e.g. Right sidebar timeline/activity
}

export function DetailLayout({
  title,
  badge,
  action,
  infoSection,
  tabsSection,
  timelineSection,
}: DetailLayoutProps) {
  return (
    <div className="space-y-6">
      {/* Dynamic breadcrumb trail */}
      <div className="space-y-1">
        <BreadcrumbNav />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {badge && <div className="mt-0.5">{badge}</div>}
          </div>
          {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
        </div>
      </div>

      {/* Grid containing main section and optional timeline sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Info section */}
          <div className="w-full">{infoSection}</div>
          
          {/* Related items tabs/content */}
          <div className="w-full">{tabsSection}</div>
        </div>

        {/* Timeline / Activity Logs sidebar (if provided) */}
        {timelineSection && (
          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-20">{timelineSection}</div>
          </div>
        )}
      </div>
    </div>
  );
}
