'use client';

import * as React from 'react';
import { Calendar, CheckSquare, GraduationCap } from 'lucide-react';

import { KpiCard } from '@/components/dashboard/kpi-card';
import { BarChartCard } from '@/components/charts/bar-chart-card';
import { AiResponseCard } from '@/components/ai/ai-response-card';
import { DashboardCard } from '@/components/dashboard/dashboard-card';

const MOCK_BAR_DATA = [
  { course: 'CS101', average: 78 },
  { course: 'CS202', average: 84 },
  { course: 'CS303', average: 92 },
  { course: 'CS404', average: 81 },
];

export default function FacultyDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Faculty Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Manage your courses, grading rosters, and student academic performance.
        </p>
      </div>

      {/* KPIs Section */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          title="Today's Lectures"
          value="4"
          icon={Calendar}
        />
        <KpiCard
          title="Pending Evaluatons"
          value="24"
          icon={CheckSquare}
          trend={{ direction: 'up', percentage: 8 }}
        />
        <KpiCard
          title="Average Class Performance"
          value="83.7%"
          icon={GraduationCap}
          trend={{ direction: 'up', percentage: 1.4 }}
        />
      </div>

      {/* AI Center Accent */}
      <AiResponseCard title="AI Curriculum Planner Recommendations">
        <p>
          Students in your **CS202 Object Oriented Programming** course are demonstrating lower performance in **Polymorphism quizzes**.
        </p>
        <ul className="list-disc pl-4 mt-2 space-y-1">
          <li>Consider dedicating the next laboratory lecture to dynamic binding live coding.</li>
          <li>Generate an AI-assisted practice workbook for polymorphism.</li>
        </ul>
      </AiResponseCard>

      {/* Charts Section */}
      <div className="grid gap-6 grid-cols-1">
        <BarChartCard
          title="Course Average Grades"
          description="Comparison of performance averages across active courses."
          data={MOCK_BAR_DATA}
          config={{ average: { label: 'Average Score (%)', color: 'hsl(262.1 83.3% 57.8%)' } }}
          xAxisKey="course"
        />
      </div>

      {/* Recent classes list */}
      <DashboardCard title="Upcoming Lectures for Today">
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <div>
              <p className="font-semibold text-sm">Object Oriented Programming (CS202)</p>
              <p className="text-xs text-muted-foreground">Classroom 302 &middot; 10:00 AM</p>
            </div>
            <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
              Upcoming
            </span>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-sm">Advanced Web Technologies (CS303)</p>
              <p className="text-xs text-muted-foreground">Laboratory 2 &middot; 02:00 PM</p>
            </div>
            <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
              Upcoming
            </span>
          </div>
        </div>
      </DashboardCard>
    </div>
  );
}
