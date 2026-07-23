'use client';

import * as React from 'react';
import { CalendarDays, BookOpen, GraduationCap, Award, HelpCircle } from 'lucide-react';

import { KpiCard } from '@/components/dashboard/kpi-card';
import { DashboardCard } from '@/components/dashboard/dashboard-card';
import { LineChartCard } from '@/components/charts/line-chart-card';
import { PieChartCard } from '@/components/charts/pie-chart-card';
import { AiResponseCard } from '@/components/ai/ai-response-card';
import { EmptyState } from '@/components/shared/empty-state';
import { PlacementPrepDashboardCard } from '@/features/student/placement/components/placement-prep-dashboard-card';

const MOCK_LINE_DATA = [
  { month: 'Jan', gpa: 8.1 },
  { month: 'Feb', gpa: 8.3 },
  { month: 'Mar', gpa: 8.2 },
  { month: 'Apr', gpa: 8.5 },
  { month: 'May', gpa: 8.7 },
];

const MOCK_PIE_DATA = [
  { name: 'Completed', value: 72, color: 'hsl(142.1 76.2% 36.3%)' },
  { name: 'In Progress', value: 18, color: 'hsl(221.2 83.2% 53.3%)' },
  { name: 'Pending', value: 10, color: 'hsl(35.2 91.7% 32.9%)' },
];

export default function StudentDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Student Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Welcome back! Here is a summary of your academic progress.
        </p>
      </div>

      {/* KPIs Section */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Attendance"
          value="87.5%"
          icon={CalendarDays}
          trend={{ direction: 'up', percentage: 2.1 }}
        />
        <KpiCard
          title="Pending Assignments"
          value="3"
          icon={BookOpen}
          trend={{ direction: 'down', percentage: 12 }}
        />
        <KpiCard
          title="Avg SGPA"
          value="8.7"
          icon={GraduationCap}
        />
        <KpiCard
          title="Placement Points"
          value="420"
          icon={Award}
          trend={{ direction: 'up', percentage: 15.4 }}
        />
      </div>

      {/* Placement Prep Summary Card */}
      <PlacementPrepDashboardCard />

      {/* AI Center Accent */}
      <AiResponseCard title="AI Career Assistant Recommendations">
        <p>
          Based on your GPA progress and active interest in Software Engineering, we suggest preparing for the upcoming **Placement Mock Drive** next week.
        </p>
        <ul className="list-disc pl-4 mt-2 space-y-1">
          <li>Review **Dynamic Programming** resources.</li>
          <li>Take the **Data Structures mock assessment** in the Quiz tab.</li>
        </ul>
      </AiResponseCard>

      {/* Charts Section */}
      <div className="grid gap-6 grid-cols-1 xl:grid-cols-3">
        <LineChartCard
          title="GPA Trend"
          description="Your academic performance over the last 5 months."
          data={MOCK_LINE_DATA}
          config={{ gpa: { label: 'GPA', color: 'hsl(221.2 83.2% 53.3%)' } }}
          xAxisKey="month"
          className="xl:col-span-2"
        />

        <PieChartCard
          title="Course Completion"
          description="Progress of curriculum modules."
          data={MOCK_PIE_DATA}
          className="xl:col-span-1"
        />
      </div>

      {/* Recent Activity List / Empty state demonstrate */}
      <DashboardCard title="Recent Notifications">
        <EmptyState
          icon={HelpCircle}
          title="No new alerts"
          description="You are all caught up! Check back later for system announcements."
        />
      </DashboardCard>
    </div>
  );
}
