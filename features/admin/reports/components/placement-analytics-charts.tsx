'use client';

import * as React from 'react';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { BarChartCard } from '@/components/charts/bar-chart-card';

interface PlacementAnalyticsChartsProps {
  funnelData: Array<{ step: string; count: number }>;
  offersByDepartment: Array<{ department: string; offersCount: number }>;
  totalOffers: number;
  averagePackageLPA: number;
  selectionRate: number;
}

export function PlacementAnalyticsCharts({
  funnelData,
  offersByDepartment,
  totalOffers,
  averagePackageLPA,
  selectionRate,
}: PlacementAnalyticsChartsProps) {
  const funnelConfig = React.useMemo(
    () => ({
      count: {
        label: 'Applications Count',
        color: '#7c3aed', // Purple
      },
    }),
    []
  );

  const deptConfig = React.useMemo(
    () => ({
      offersCount: {
        label: 'Offers Released',
        color: '#059669', // Emerald
      },
    }),
    []
  );

  const handleExportCSV = () => {
    const headers = ['Category', 'Stage / Department', 'Count / Metric'];
    const rows: string[][] = [];

    funnelData.forEach((f) => {
      rows.push(['Application Pipeline Funnel', `"${f.step}"`, String(f.count)]);
    });

    offersByDepartment.forEach((o) => {
      rows.push(['Offers by Department', `"${o.department}"`, String(o.offersCount)]);
    });

    rows.push(['Summary Metric', '"Total Offers Released"', String(totalOffers)]);
    rows.push(['Summary Metric', '"Average Package Offered (LPA)"', `₹${averagePackageLPA} LPA`]);
    rows.push(['Summary Metric', '"Placement Selection Rate"', `${selectionRate}%`]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Placement_Analytics_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Placement analytics exported to CSV.');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Placement & Recruitment Analytics</h2>
          <p className="text-xs text-muted-foreground">Application pipeline progression funnel and department offer release metrics.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5 text-xs">
          <Download className="h-3.5 w-3.5" /> Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BarChartCard
          title="Application Pipeline Funnel"
          description="Progression from Applied to Selection"
          data={funnelData}
          config={funnelConfig}
          xAxisKey="step"
        />

        <BarChartCard
          title="Offers by Department"
          description="Total official job offers released per department"
          data={offersByDepartment}
          config={deptConfig}
          xAxisKey="department"
        />
      </div>
    </div>
  );
}
