'use client';

import * as React from 'react';
import { BarChart3, FileSpreadsheet, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExecutiveKpiSummary } from '@/features/admin/reports/components/executive-kpi-summary';
import { UserDistributionCharts } from '@/features/admin/reports/components/user-distribution-charts';
import { PlacementAnalyticsCharts } from '@/features/admin/reports/components/placement-analytics-charts';
import { TimetableCoverageCard } from '@/features/admin/reports/components/timetable-coverage-card';
import { SystemActivityTrendChart } from '@/features/admin/reports/components/system-activity-trend-chart';
import { PendingModulesNotice } from '@/features/admin/reports/components/pending-modules-notice';
import { CustomReportBuilderDialog } from '@/features/admin/reports/components/custom-report-builder-dialog';
import { getExecutiveDashboardMetricsAction } from '@/features/admin/reports/actions/report.actions';

interface ExecutiveMetricsData {
  userDist: {
    roleDistribution: Array<{ name: string; value: number; role: string }>;
    departmentDistribution: Array<{ name: string; fullName: string; usersCount: number }>;
    totalUsers: number;
  };
  academicSummary: {
    departmentsCount: number;
    coursesCount: number;
    subjectsCount: number;
    classroomsCount: number;
  };
  placementAnalytics: {
    funnelData: Array<{ step: string; count: number }>;
    offersByDepartment: Array<{ department: string; offersCount: number }>;
    totalOffers: number;
    averagePackageLPA: number;
    selectionRate: number;
    totalApplications: number;
  };
  timetableCoverage: {
    publishedCount: number;
    draftCount: number;
    totalTimetables: number;
    totalDepartments: number;
  };
  activityTrend: Array<{ date: string; actionsCount: number }>;
}

export default function AdminReportsPage() {
  const [loading, setLoading] = React.useState(true);
  const [metrics, setMetrics] = React.useState<ExecutiveMetricsData | null>(null);
  const [customReportDialogOpen, setCustomReportDialogOpen] = React.useState(false);

  const fetchMetrics = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await getExecutiveDashboardMetricsAction();
      if (res.success && res.data) {
        setMetrics(res.data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="border-b pb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" /> Reports & Executive Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time computed system metrics across user demographics, placement pipeline, timetable schedules, and system activity.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={fetchMetrics} disabled={loading} className="gap-1.5 text-xs">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Data
          </Button>

          <Button
            size="sm"
            onClick={() => setCustomReportDialogOpen(true)}
            className="gap-2 text-xs"
          >
            <FileSpreadsheet className="h-4 w-4" /> Custom Report Builder
          </Button>
        </div>
      </div>

      {/* Top Executive KPI Summary Cards */}
      <ExecutiveKpiSummary
        totalUsers={metrics?.userDist?.totalUsers ?? 0}
        departmentsCount={metrics?.academicSummary?.departmentsCount ?? 0}
        coursesCount={metrics?.academicSummary?.coursesCount ?? 0}
        subjectsCount={metrics?.academicSummary?.subjectsCount ?? 0}
        classroomsCount={metrics?.academicSummary?.classroomsCount ?? 0}
        selectionRate={metrics?.placementAnalytics?.selectionRate ?? 0}
        averagePackageLPA={metrics?.placementAnalytics?.averagePackageLPA ?? 0}
        publishedTimetables={metrics?.timetableCoverage?.publishedCount ?? 0}
        totalDepartments={metrics?.timetableCoverage?.totalDepartments ?? 0}
        loading={loading}
      />

      {/* User & Role Demographics */}
      <UserDistributionCharts
        roleDistribution={metrics?.userDist?.roleDistribution || []}
        departmentDistribution={metrics?.userDist?.departmentDistribution || []}
      />

      {/* Placement & Recruitment Funnel */}
      <PlacementAnalyticsCharts
        funnelData={metrics?.placementAnalytics?.funnelData || []}
        offersByDepartment={metrics?.placementAnalytics?.offersByDepartment || []}
        totalOffers={metrics?.placementAnalytics?.totalOffers || 0}
        averagePackageLPA={metrics?.placementAnalytics?.averagePackageLPA || 0}
        selectionRate={metrics?.placementAnalytics?.selectionRate || 0}
      />

      {/* Timetable Coverage Progress */}
      <TimetableCoverageCard
        publishedCount={metrics?.timetableCoverage?.publishedCount || 0}
        draftCount={metrics?.timetableCoverage?.draftCount || 0}
        totalTimetables={metrics?.timetableCoverage?.totalTimetables || 0}
        totalDepartments={metrics?.timetableCoverage?.totalDepartments || 0}
      />

      {/* 14-Day System Activity Volume Trend */}
      <SystemActivityTrendChart
        activityTrend={metrics?.activityTrend || []}
      />

      {/* Pending Modules Notice (Attendance & LMS) */}
      <PendingModulesNotice />

      {/* Custom Report Builder Modal Dialog */}
      <CustomReportBuilderDialog
        open={customReportDialogOpen}
        onOpenChange={setCustomReportDialogOpen}
      />
    </div>
  );
}
