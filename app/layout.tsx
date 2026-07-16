import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

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
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {/* TODO: Add global providers (QueryClientProvider, SessionProvider, etc.) */}
        {children}
      </body>
    </html>
  );
}
