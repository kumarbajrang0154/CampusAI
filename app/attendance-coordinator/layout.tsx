import * as React from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

export default async function AttendanceCoordinatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const permissions = session.user.permissions ?? [];
  const hasMarkPermission = permissions.includes('MARK_ATTENDANCE') || session.user.role === 'ADMIN';

  if (!hasMarkPermission) {
    redirect('/403');
  }

  return <DashboardLayout role={session.user.role}>{children}</DashboardLayout>;
}
