'use client';

import * as React from 'react';
import { Users, Server, Brain, Activity } from 'lucide-react';

import { KpiCard } from '@/components/dashboard/kpi-card';
import { LineChartCard } from '@/components/charts/line-chart-card';
import { AiResponseCard } from '@/components/ai/ai-response-card';
import { DashboardCard } from '@/components/dashboard/dashboard-card';

const MOCK_LINE_DATA = [
  { hour: '09:00', requests: 120 },
  { hour: '12:00', requests: 450 },
  { hour: '15:00', requests: 380 },
  { hour: '18:00', requests: 190 },
  { hour: '21:00', requests: 90 },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Admin Console</h1>
        <p className="text-muted-foreground text-sm">
          Control center for platform operations, user registrations, and system monitoring.
        </p>
      </div>

      {/* KPIs Section */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Platform Users"
          value="1,240"
          icon={Users}
          trend={{ direction: 'up', percentage: 4.8 }}
        />
        <KpiCard
          title="Active Sessions"
          value="142"
          icon={Activity}
        />
        <KpiCard
          title="AI Inferences Today"
          value="2,840"
          icon={Brain}
          trend={{ direction: 'up', percentage: 22.4 }}
        />
        <KpiCard
          title="System Status"
          value="Healthy"
          icon={Server}
        />
      </div>

      {/* AI Center Accent */}
      <AiResponseCard title="AI Platform Assistant Monitoring">
        <p>
          System performance is optimal. Database query latency has dropped by **8ms** following indexing updates applied in Stage 1 database migration.
        </p>
        <ul className="list-disc pl-4 mt-2 space-y-1">
          <li>Recommend enabling session auto-pruning.</li>
          <li>Token consumption: Gemini API utilization is within 34% of daily quota limit.</li>
        </ul>
      </AiResponseCard>

      {/* Charts Section */}
      <div className="grid gap-6 grid-cols-1">
        <LineChartCard
          title="Hourly AI Request Load"
          description="API transaction counts logged today."
          data={MOCK_LINE_DATA}
          config={{ requests: { label: 'Requests', color: 'hsl(199 89% 48%)' } }}
          xAxisKey="hour"
        />
      </div>

      {/* Active system services status */}
      <DashboardCard title="Core Microservices Status">
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <div>
              <p className="font-semibold text-sm">Authentication Service</p>
              <p className="text-xs text-muted-foreground">NextAuth instance and token adapters</p>
            </div>
            <span className="text-xs font-semibold text-success bg-success/10 px-2.5 py-1 rounded-full">
              Online
            </span>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-sm">AI Gateway Service</p>
              <p className="text-xs text-muted-foreground">Gemini API provider proxy</p>
            </div>
            <span className="text-xs font-semibold text-success bg-success/10 px-2.5 py-1 rounded-full">
              Online
            </span>
          </div>
        </div>
      </DashboardCard>
    </div>
  );
}
