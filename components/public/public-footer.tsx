/**
 * components/public/public-footer.tsx
 *
 * Simple public landing page footer.
 * Server component — static content.
 */

import * as React from 'react';
import Link from 'next/link';
import { CampusLogoMark } from '@/components/shared/campus-logo-mark';

const FOOTER_LINKS = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'AI Center', href: '#ai' },
    { label: 'How It Works', href: '#how-it-works' },
  ],
  Roles: [
    { label: 'For Students', href: '#roles' },
    { label: 'For Faculty', href: '#roles' },
    { label: 'For Admins', href: '#roles' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Features Overview', href: '/features' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
  ],
};

export function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30 mt-0">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr]">
          {/* Brand column */}
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <CampusLogoMark size="sm" />
              <span className="font-sans font-bold text-base tracking-tight">Campus<span className="text-primary">AI</span></span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[220px]">
              The intelligent campus platform that unifies ERP, LMS, Placement, and AI — purpose-built for higher education.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group}>
              <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
                {group}
              </p>
              <ul className="space-y-2">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {year} CampusAI. All rights reserved.</p>
          <p>Built with Next.js · Powered by Google Gemini</p>
        </div>
      </div>
    </footer>
  );
}
