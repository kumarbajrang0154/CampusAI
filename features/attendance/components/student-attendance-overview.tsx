'use client';

import * as React from 'react';
import { CalendarCheck, AlertTriangle, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SummaryData {
  totalClasses: number;
  attendedClasses: number;
  overallPercentage: number;
}

interface Props {
  summary: SummaryData;
  threshold?: number; // Configurable threshold (default 75%)
}

export function StudentAttendanceOverview({ summary, threshold = 75 }: Props) {
  const isLowAttendance = summary.overallPercentage < threshold;

  return (
    <div className="space-y-4">
      {/* Warning Banner if below threshold */}
      {isLowAttendance && (
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-900 dark:text-rose-200 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold">Low Attendance Warning</h4>
            <p className="text-xs mt-0.5 text-rose-800 dark:text-rose-300">
              Your overall attendance is <strong>{summary.overallPercentage}%</strong>, which is below the mandatory <strong>{threshold}%</strong> minimum threshold. Please make sure to attend upcoming classes to avoid eligibility restrictions.
            </p>
          </div>
        </div>
      )}

      {/* Main Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Overall Percentage Progress Ring / Card */}
        <Card className="md:col-span-2 border-border/60 shadow-xs relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
              <span>Overall Attendance Score</span>
              <CalendarCheck className="h-4 w-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className={`text-4xl md:text-5xl font-black ${isLowAttendance ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {summary.overallPercentage}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Threshold target: <span className="font-semibold text-foreground">{threshold}%</span>
                </p>
              </div>

              {/* Visual Progress Ring */}
              <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-muted/30 stroke-current"
                    strokeWidth="3.5"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={isLowAttendance ? 'text-rose-500 stroke-current' : 'text-emerald-500 stroke-current'}
                    strokeDasharray={`${summary.overallPercentage}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute font-black text-xs text-foreground">
                  {summary.attendedClasses}/{summary.totalClasses}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Tile 1: Total Classes */}
        <Card className="border-border/60 shadow-xs">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Total Classes Held
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">{summary.totalClasses}</div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-primary" /> Across all subjects
            </p>
          </CardContent>
        </Card>

        {/* Quick Tile 2: Classes Attended */}
        <Card className="border-border/60 shadow-xs">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Classes Attended
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {summary.attendedClasses}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Present + Excused
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
