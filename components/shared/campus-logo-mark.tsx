import * as React from 'react';
import { cn } from '@/lib/utils';

interface CampusLogoMarkProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function CampusLogoMark({ className, size = 'md' }: CampusLogoMarkProps) {
  const sizeClasses = {
    sm: 'h-6 w-6 text-sm',
    md: 'h-8 w-8 text-base',
    lg: 'h-10 w-10 text-xl',
    xl: 'h-12 w-12 text-2xl',
  };

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground font-black tracking-tighter shadow-sm transition-transform duration-200 hover:scale-105 select-none shrink-0',
        sizeClasses[size],
        className
      )}
    >
      {/* Abstracted Geometric Mortarboard Cap + Sparkle SVG Overlay */}
      <svg
        className="absolute inset-0 h-full w-full p-1 opacity-20 pointer-events-none"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
      <span className="relative z-10 font-sans">C</span>
    </div>
  );
}
