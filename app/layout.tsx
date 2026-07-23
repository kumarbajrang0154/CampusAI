import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

import { ThemeProvider } from '@/components/providers/theme-provider';
import { AppSessionProvider } from '@/components/shared/session-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';

const sansFont = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const monoFont = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
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
    <html
      lang="en"
      className={`h-full antialiased ${sansFont.variable} ${monoFont.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground" suppressHydrationWarning>
        {/*
          Global Provider Stack Order:
          1. ThemeProvider (next-themes) - manages client/system light/dark modes
          2. AppSessionProvider (next-auth) - wraps app in auth sessions context
          3. QueryProvider (react-query) - client cache and queries provider
          4. TooltipProvider (shadcn ui) - primitive accessibility tooltip context
          5. Toaster (sonner) - renders toast banners globally
        */}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AppSessionProvider>
            <QueryProvider>
              <TooltipProvider>
                {children}
                <Toaster />
              </TooltipProvider>
            </QueryProvider>
          </AppSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}


