import type { Metadata } from 'next';
import './globals.css';

import { AppSessionProvider } from '@/components/shared/session-provider';

export const metadata: Metadata = {
  title: {
    default: 'CampusAI — Smart Campus Management Platform',
    template: '%s | CampusAI',
  },
  description:
    'AI-Powered Smart Campus Management & Placement Intelligence Platform for students, faculty, HODs, and administrators.',
  keywords: ['campus management', 'AI', 'placement', 'attendance', 'LMS'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {/* AppSessionProvider makes useSession() available throughout the app */}
        <AppSessionProvider>{children}</AppSessionProvider>
      </body>
    </html>
  );
}

