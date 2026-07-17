'use client';

/**
 * components/layout/public-topbar.tsx
 *
 * Minimal top bar for the public landing page.
 * Shows: Logo (left) | Theme Toggle (right)
 * No authentication-specific elements.
 */

import * as React from 'react';
import Link from 'next/link';

import { ThemeToggle } from '@/components/shared/theme-toggle';

export function PublicTopbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black text-xl transition-transform group-hover:scale-105">
            C
          </div>
          <span className="font-bold text-lg tracking-tight">CampusAI</span>
        </Link>

        {/* Right: Theme toggle */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
