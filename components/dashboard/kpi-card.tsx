import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    direction: 'up' | 'down';
    percentage: number;
  };
  loading?: boolean;
}

export function KpiCard({ title, value, icon: Icon, trend, loading = false }: KpiCardProps) {
  if (loading) {
    return (
      <Card className="academic-card">
        <CardContent className="p-5">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
          <div className="mt-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="mt-2 h-4 w-32" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="academic-card group transition-all duration-200 hover:shadow-md hover:border-gold/30">
      <CardContent className="p-5">
        <div className="flex items-center justify-between space-y-0 pb-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</span>
          <div className="p-2 rounded-md bg-secondary text-primary group-hover:bg-gold/10 group-hover:text-gold transition-colors">
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold tracking-tight font-serif-heading text-foreground">{value}</div>
          {trend && (
            <p className="mt-1 flex items-center text-xs">
              {trend.direction === 'up' ? (
                <span className="flex items-center text-success font-semibold">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  +{trend.percentage}%
                </span>
              ) : (
                <span className="flex items-center text-destructive font-semibold">
                  <TrendingDown className="mr-1 h-3 w-3" />
                  -{trend.percentage}%
                </span>
              )}
              <span className="ml-1 text-muted-foreground">vs last month</span>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
