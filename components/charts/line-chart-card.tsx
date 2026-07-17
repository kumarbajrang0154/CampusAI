'use client';

import * as React from 'react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Legend } from 'recharts';
import { BarChart2 } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { EmptyState } from '@/components/shared/empty-state';

interface LineChartCardProps {
  title: string;
  description?: string;
  data: Array<Record<string, unknown>>;
  config: Record<string, { label: string; color: string }>;
  xAxisKey: string;
  className?: string;
}

export function LineChartCard({
  title,
  description,
  data,
  config,
  xAxisKey,
  className,
}: LineChartCardProps) {
  const chartConfig = React.useMemo(() => {
    const formattedConfig: ChartConfig = {};
    Object.entries(config).forEach(([key, val]) => {
      formattedConfig[key] = {
        label: val.label,
        theme: {
          light: val.color,
          dark: val.color,
        },
      };
    });
    return formattedConfig;
  }, [config]);

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
            <LineChart
              data={data}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} className="stroke-border/50" />
              <XAxis
                dataKey={xAxisKey}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => String(value)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={30}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Legend verticalAlign="top" height={36} />
              {Object.keys(config).map((key) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={config[key].color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 6,
                  }}
                />
              ))}
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
