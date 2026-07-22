'use client';

import * as React from 'react';
import { CalendarCheck, Clock, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TimetableCoverageCardProps {
  publishedCount: number;
  draftCount: number;
  totalTimetables: number;
  totalDepartments: number;
}

export function TimetableCoverageCard({
  publishedCount,
  draftCount,
  totalTimetables,
  totalDepartments,
}: TimetableCoverageCardProps) {
  const publishedPercentage =
    totalTimetables > 0 ? Math.round((publishedCount / totalTimetables) * 100) : 0;

  return (
    <Card className="shadow-none border">
      <CardHeader className="pb-3 border-b bg-muted/20">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <CalendarCheck className="h-4 w-4 text-indigo-600" /> Timetable Rollout & Coverage
          </CardTitle>
          <Badge variant="outline" className="font-mono text-[10px] bg-indigo-50 text-indigo-700 border-indigo-200">
            {publishedPercentage}% Published
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4 text-xs">
        {/* Coverage Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-foreground">Published Schedule Coverage</span>
            <span className="text-muted-foreground">{publishedCount} / {totalTimetables} Schedules</span>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden flex">
            <div
              className="bg-indigo-600 h-full transition-all duration-500"
              style={{ width: `${publishedPercentage}%` }}
            />
            <div
              className="bg-amber-400 h-full transition-all duration-500"
              style={{ width: `${100 - publishedPercentage}%` }}
            />
          </div>
        </div>

        {/* Breakdown Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-2.5 rounded border bg-muted/30">
            <div className="flex items-center gap-1.5 text-indigo-700 font-semibold text-xs">
              <CalendarCheck className="h-3.5 w-3.5" /> Published Timetables
            </div>
            <div className="text-xl font-bold text-foreground mt-1">{publishedCount}</div>
            <span className="text-[10px] text-muted-foreground">Active for student feeds</span>
          </div>

          <div className="p-2.5 rounded border bg-muted/30">
            <div className="flex items-center gap-1.5 text-amber-700 font-semibold text-xs">
              <Clock className="h-3.5 w-3.5" /> Draft Timetables
            </div>
            <div className="text-xl font-bold text-foreground mt-1">{draftCount}</div>
            <span className="text-[10px] text-muted-foreground">Pending publishing</span>
          </div>

          <div className="p-2.5 rounded border bg-muted/30">
            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-xs">
              <Building2 className="h-3.5 w-3.5" /> Departments Covered
            </div>
            <div className="text-xl font-bold text-foreground mt-1">{totalDepartments}</div>
            <span className="text-[10px] text-muted-foreground">Active departments</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
