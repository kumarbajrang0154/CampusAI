'use client';

import * as React from 'react';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { PieChartCard } from '@/components/charts/pie-chart-card';
import { BarChartCard } from '@/components/charts/bar-chart-card';
import { format } from 'date-fns';

interface UserDistributionChartsProps {
  roleDistribution: Array<{ name: string; value: number; role: string }>;
  departmentDistribution: Array<{ name: string; fullName: string; usersCount: number }>;
}

const ROLE_COLORS: Record<string, string> = {
  STUDENT: '#2563eb', // Blue
  FACULTY: '#059669', // Emerald
  HOD: '#7c3aed',     // Purple
  ADMIN: '#d97706',   // Amber
};

export function UserDistributionCharts({
  roleDistribution,
  departmentDistribution,
}: UserDistributionChartsProps) {
  const pieData = React.useMemo(() => {
    return roleDistribution.map((r) => ({
      name: r.name,
      value: r.value,
      color: ROLE_COLORS[r.role] || '#64748b',
    }));
  }, [roleDistribution]);

  const barConfig = React.useMemo(
    () => ({
      usersCount: {
        label: 'Users Count',
        color: '#2563eb',
      },
    }),
    []
  );

  const handleExportCSV = () => {
    const headers = ['Category', 'Type / Name', 'Count'];
    const rows: string[][] = [];

    roleDistribution.forEach((r) => {
      rows.push(['Role Distribution', `"${r.name}"`, String(r.value)]);
    });

    departmentDistribution.forEach((d) => {
      rows.push(['Department Distribution', `"${d.fullName} (${d.name})"`, String(d.usersCount)]);
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `User_Distribution_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('User distribution metrics exported to CSV.');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">User & Role Demographics</h2>
          <p className="text-xs text-muted-foreground">Distribution of active accounts across campus roles and academic departments.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5 text-xs">
          <Download className="h-3.5 w-3.5" /> Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PieChartCard
          title="User Role Distribution"
          description="Breakdown of system users by role"
          data={pieData}
        />

        <BarChartCard
          title="Department User Counts"
          description="Total students & faculty assigned per department"
          data={departmentDistribution}
          config={barConfig}
          xAxisKey="name"
        />
      </div>
    </div>
  );
}
