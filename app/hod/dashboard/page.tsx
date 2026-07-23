'use client';

import * as React from 'react';
import { Users, GraduationCap, Percent, BarChart } from 'lucide-react';

import { KpiCard } from '@/components/dashboard/kpi-card';
import { LineChartCard } from '@/components/charts/line-chart-card';
import { AiResponseCard } from '@/components/ai/ai-response-card';
import { DashboardCard } from '@/components/dashboard/dashboard-card';

const MOCK_LINE_DATA = [
  { year: '2022', rate: 78 },
  { year: '2023', rate: 82 },
  { year: '2024', rate: 85 },
  { year: '2025', rate: 91 },
  { year: '2026', rate: 94 },
];

export default function HodDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">HOD Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Overview of department academics, staff listings, and student placement rates.
        </p>
      </div>

      {/* KPIs Section */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Students"
          value="480"
          icon={GraduationCap}
        />
        <KpiCard
          title="Faculty Count"
          value="18"
          icon={Users}
        />
        <KpiCard
          title="Department Attendance"
          value="91.4%"
          icon={Percent}
          trend={{ direction: 'up', percentage: 0.8 }}
        />
        <KpiCard
          title="Placement Ratio"
          value="94.2%"
          icon={BarChart}
          trend={{ direction: 'up', percentage: 4.2 }}
        />
      </div>

      {/* AI Center Accent */}
      <AiResponseCard title="AI Departmental Insights">
        <p>
          The Department of Computer Science is displaying a **15% year-on-year increase** in industry placement points, primarily driven by cloud computing electives.
        </p>
        <ul className="list-disc pl-4 mt-2 space-y-1">
          <li>Recommended Elective Expansion: Introduce advanced Kubernetes modules.</li>
          <li>Staff Optimization: 2 faculty members require refresher training in Cyber Security.</li>
        </ul>
      </AiResponseCard>

      {/* Charts Section */}
      <div className="grid gap-6 grid-cols-1">
        <LineChartCard
          title="Historical Placement Percentage"
          description="Departmental placement success rates over the last 5 years."
          data={MOCK_LINE_DATA}
          config={{ rate: { label: 'Placement Rate (%)', color: 'hsl(142.1 76.2% 36.3%)' } }}
          xAxisKey="year"
        />
      </div>

      {/* Department Info widget */}
      <DashboardCard title="Departmental Highlights">
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <div>
              <p className="font-semibold text-sm">Accreditation Audit</p>
              <p className="text-xs text-muted-foreground">Self Study Report submission status</p>
            </div>
            <span className="text-xs font-semibold text-success bg-success/10 px-2.5 py-1 rounded-full">
              Completed
            </span>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-sm">Faculty Research Submissions</p>
              <p className="text-xs text-muted-foreground">8 active research papers in review</p>
            </div>
            <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
              Active
            </span>
          </div>
        </div>
      </DashboardCard>
    </div>
  );
}
