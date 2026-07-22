'use client';

import * as React from 'react';
import { Clock, CheckSquare, BookOpen, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function PendingModulesNotice() {
  return (
    <div className="space-y-3 pt-2">
      <div>
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" /> Upcoming & Pending Module Integration Status
        </h2>
        <p className="text-xs text-muted-foreground">
          Analytics for future phases (Attendance, LMS, AI Center Usage) are configured to remain pending until their core database models are rolled out.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Attendance Analytics Pending State */}
        <Card className="shadow-none border border-dashed bg-muted/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <CheckSquare className="h-4 w-4 text-muted-foreground" /> Attendance Analytics
              </CardTitle>
              <Badge variant="outline" className="text-[10px] text-amber-700 bg-amber-50 border-amber-200">
                Pending Module Phase
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground text-xs">No attendance data collected yet</p>
            <p className="text-[11px] leading-relaxed">
              Real-time daily attendance percentage, student absenteeism alerts, and faculty marking trends will automatically surface here once the Attendance Module is deployed.
            </p>
          </CardContent>
        </Card>

        {/* LMS & Course Progress Pending State */}
        <Card className="shadow-none border border-dashed bg-muted/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-muted-foreground" /> LMS & Assignment Tracking
              </CardTitle>
              <Badge variant="outline" className="text-[10px] text-amber-700 bg-amber-50 border-amber-200">
                Pending Module Phase
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground text-xs">No LMS submission data yet</p>
            <p className="text-[11px] leading-relaxed">
              Assignment submission completion rates, quiz score distributions, and course syllabus progress will populate dynamically when the LMS module is active.
            </p>
          </CardContent>
        </Card>

        {/* AI Center Usage Pending State */}
        <Card className="shadow-none border border-dashed bg-muted/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-muted-foreground" /> AI Center Telemetry
              </CardTitle>
              <Badge variant="outline" className="text-[10px] text-amber-700 bg-amber-50 border-amber-200">
                Pending Module Phase
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground text-xs">No AI chat history to analyze</p>
            <p className="text-[11px] leading-relaxed">
              AI study planner generations, resume analysis scores, and prompt token metrics will display here following the AI Module rollout.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
