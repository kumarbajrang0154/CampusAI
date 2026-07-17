import * as React from 'react';
import { BreadcrumbNav } from './breadcrumb-nav';

interface FormLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions: React.ReactNode; // e.g. Cancel and Save row
}

export function FormLayout({ title, description, children, actions }: FormLayoutProps) {
  return (
    <div className="space-y-6">
      {/* Header section with breadcrumbs */}
      <div className="space-y-1">
        <BreadcrumbNav />
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>

      {/* Form stack card container - max-width 720px per design system */}
      <div className="max-w-[720px] w-full border bg-card text-card-foreground rounded-xl shadow-xs p-6 space-y-6">
        <div className="space-y-6">
          {children}
        </div>
        
        {/* Save/Cancel button actions row */}
        <div className="border-t pt-6 flex items-center justify-end gap-3">
          {actions}
        </div>
      </div>
    </div>
  );
}
