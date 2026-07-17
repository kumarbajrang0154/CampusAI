// app/(public)/layout.tsx — Public Layout
import type { ReactNode } from 'react';
import { PublicTopbar } from '@/components/layout/public-topbar';
import { PublicFooter } from '@/components/public/public-footer';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicTopbar />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
