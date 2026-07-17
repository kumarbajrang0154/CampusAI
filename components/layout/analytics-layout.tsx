import * as React from 'react';
import { BreadcrumbNav } from './breadcrumb-nav';

interface AnalyticsLayoutProps {
  title: string;
  description?: string;
  kpis: React.ReactNode; // KPI cards row
  charts: React.ReactNode; // Charts grid
  tableSection?: React.ReactNode; // Data table
}

export function AnalyticsLayout({ title, description, kpis, charts, tableSection }: AnalyticsLayoutProps) {
  return (
    <div className="space-y-6">
      {/* Header section with breadcrumbs */}
      <div className="space-y-1">
        <BreadcrumbNav />
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>

      {/* KPI stats section */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {kpis}
      </div>

      {/* Recharts Grid section */}
      <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
        {charts}
      </div>

      {/* Table analysis section (if provided) */}
      {tableSection && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">Detailed Breakdown</h2>
          <div className="w-full">{tableSection}</div>
        </div>
      )}
    </div>
  );
}
