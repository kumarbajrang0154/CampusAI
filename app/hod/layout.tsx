import type { ReactNode } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

export default function HodLayout({ children }: { children: ReactNode }) {
  return <DashboardLayout role="HOD">{children}</DashboardLayout>;
}
