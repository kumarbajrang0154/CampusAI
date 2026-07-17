/**
 * app/(public)/page.tsx — CampusAI Public Landing Page
 *
 * Server Component shell.
 * - Authenticated users are immediately redirected to their role dashboard.
 * - Unauthenticated users see the full marketing landing page with embedded login.
 */

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';

import { authOptions } from '@/lib/auth';
import { getRoleDashboardPath } from '@/lib/get-role-dashboard-path';
import { HeroSection } from '@/components/public/hero-section';
import { ExplanationSection } from '@/components/public/explanation-section';
import { WorkflowSection } from '@/components/public/workflow-section';
import { FeaturesSection } from '@/components/public/features-section';
import { RoleSection } from '@/components/public/role-section';
import { AiHighlightSection } from '@/components/public/ai-highlight-section';

export const metadata: Metadata = {
  title: 'CampusAI — AI-Powered Smart Campus Management Platform',
  description:
    'CampusAI unifies ERP, LMS, Attendance, Timetable, Placement, and AI-powered academic tools into one intelligent campus platform for students, faculty, and administrators.',
};

export default async function LandingPage() {
  // Server-side auth check: redirect logged-in users to their dashboard
  const session = await getServerSession(authOptions);
  if (session?.user?.role) {
    redirect(getRoleDashboardPath(session.user.role));
  }

  return (
    <>
      <HeroSection />
      <ExplanationSection />
      <WorkflowSection />
      <FeaturesSection />
      <RoleSection />
      <AiHighlightSection />
    </>
  );
}
