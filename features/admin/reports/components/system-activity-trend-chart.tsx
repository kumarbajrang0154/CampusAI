'use client';

import * as React from 'react';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { LineChartCard } from '@/components/charts/line-chart-card';

interface SystemActivityTrendChartProps {
  activityTrend: Array<{ date: string; actionsCount: number }>;
}

export function SystemActivityTrendChart({ activityTrend }: SystemActivityTrendChartProps) {
  const chartConfig = React.useMemo(
    () => ({
      actionsCount: {
        label: 'System Actions',
        color: '#2563eb', // Blue
      },
    }),
    []
  );

  const handleExportCSV = () => {
    const headers = ['Date', 'System Actions Volume'];
    const rows = activityTrend.map((a) => [`"${a.date}"`, String(a.actionsCount)]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `System_Activity_Trend_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('System activity trend metrics exported to CSV.');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">System & Administrative Activity Volume</h2>
          <p className="text-xs text-muted-foreground">Daily audit log activity volume across all administrative modules over the past 14 days.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5 text-xs">
          <Download className="h-3.5 w-3.5" /> Export CSV
        </Button>
      </div>

      <LineChartCard
        title="14-Day Activity Log Volume"
        description="Daily action frequency recorded in system audit logs"
        data={activityTrend}
        config={chartConfig}
        xAxisKey="date"
      />
    </div>
  );
}
