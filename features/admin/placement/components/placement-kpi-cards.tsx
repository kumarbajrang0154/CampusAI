'use client';

import * as React from 'react';
import { Briefcase, Users, Award, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPlacementOverviewStatsAction } from '../actions/placement.actions';

export interface PlacementStats {
  activeDrivesCount: number;
  totalApplicationsCount: number;
  offersReleasedCount: number;
  selectedCount: number;
  placementRate: number;
}

interface PlacementKpiCardsProps {
  stats?: PlacementStats | null;
  loading?: boolean;
}

export function PlacementKpiCards({ stats: propStats, loading: propLoading }: PlacementKpiCardsProps) {
  const [internalStats, setInternalStats] = React.useState<PlacementStats | null>(null);
  const [internalLoading, setInternalLoading] = React.useState(false);

  React.useEffect(() => {
    if (!propStats) {
      setInternalLoading(true);
      getPlacementOverviewStatsAction()
        .then((res) => {
          if (res.success && res.data) {
            setInternalStats(res.data);
          }
        })
        .finally(() => setInternalLoading(false));
    }
  }, [propStats]);

  const stats = propStats || internalStats;
  const isLoading = propLoading || internalLoading;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Active Drives */}
      <Card className="shadow-none border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Active Drives
          </CardTitle>
          <Briefcase className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {isLoading ? '...' : stats?.activeDrivesCount ?? 0}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Upcoming & Ongoing Drives</p>
        </CardContent>
      </Card>

      {/* Total Applications */}
      <Card className="shadow-none border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Total Applications
          </CardTitle>
          <Users className="h-4 w-4 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {isLoading ? '...' : stats?.totalApplicationsCount ?? 0}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Student Drive Registrations</p>
        </CardContent>
      </Card>

      {/* Offers Released */}
      <Card className="shadow-none border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Offers Released
          </CardTitle>
          <Award className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {isLoading ? '...' : stats?.offersReleasedCount ?? 0}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Official Company Offers</p>
        </CardContent>
      </Card>

      {/* Placement Selection Rate */}
      <Card className="shadow-none border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Selection Rate
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-indigo-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {isLoading ? '...' : `${stats?.placementRate ?? 0}%`}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Selected / Applied Ratio</p>
        </CardContent>
      </Card>
    </div>
  );
}
