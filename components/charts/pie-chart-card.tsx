'use client';

import * as React from 'react';
import { Cell, Pie, PieChart, Legend } from 'recharts';
import { BarChart2 } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { EmptyState } from '@/components/shared/empty-state';

interface PieChartCardProps {
  title: string;
  description?: string;
  data: Array<{ name: string; value: number; color: string }>;
  className?: string;
}

export function PieChartCard({ title, description, data, className }: PieChartCardProps) {
  const chartConfig = React.useMemo(() => {
    const formattedConfig: ChartConfig = {};
    data.forEach((item) => {
      formattedConfig[item.name] = {
        label: item.name,
        theme: {
          light: item.color,
          dark: item.color,
        },
      };
    });
    return formattedConfig;
  }, [data]);

  const isEmpty = !data || data.length === 0;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="pb-4">
        {isEmpty ? (
          <EmptyState
            icon={BarChart2}
            title="No data available"
            description="There is no data to display for this chart currently."
          />
        ) : (
          <ChartContainer config={chartConfig} className="aspect-video max-h-[300px] w-full">
            <PieChart>
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Legend verticalAlign="top" height={36} />
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
