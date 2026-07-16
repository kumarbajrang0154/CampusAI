// app/(public)/layout.tsx — Public Layout Placeholder
// TODO: Implement public layout with navbar and footer

import type { ReactNode } from 'react';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      {/* TODO: Add Navbar */}
      <main>{children}</main>
      {/* TODO: Add Footer */}
    </div>
  );
}
