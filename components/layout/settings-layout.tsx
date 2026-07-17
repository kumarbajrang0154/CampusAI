'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { BreadcrumbNav } from './breadcrumb-nav';

interface SettingsCategory {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface SettingsLayoutProps {
  title: string;
  description?: string;
  categories: SettingsCategory[];
  activeCategoryId: string;
  onCategoryChange: (id: string) => void;
  children: React.ReactNode;
}

export function SettingsLayout({
  title,
  description,
  categories,
  activeCategoryId,
  onCategoryChange,
  children,
}: SettingsLayoutProps) {
  return (
    <div className="space-y-6">
      {/* Header section with breadcrumbs */}
      <div className="space-y-1">
        <BreadcrumbNav />
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>

      {/* Grid for sidebar category navigation and main forms */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Left-hand Navigation categories */}
        <nav className="md:col-span-1 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 gap-1 border-b md:border-b-0 md:border-r pr-0 md:pr-4">
          {categories.map((cat) => {
            const isActive = cat.id === activeCategoryId;
            return (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors text-left w-full',
                  isActive
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                )}
              >
                {cat.icon && <cat.icon className="h-4 w-4 shrink-0" />}
                {cat.label}
              </button>
            );
          })}
        </nav>

        {/* Right-hand Form container panel */}
        <div className="md:col-span-3 border bg-card text-card-foreground rounded-xl shadow-xs p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
