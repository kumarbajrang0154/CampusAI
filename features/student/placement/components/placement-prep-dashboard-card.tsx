'use client';

import * as React from 'react';
import Link from 'next/link';
import { Briefcase, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  getStudentPlacementProfileInfoAction,
  getDomainDSAProblemsAction,
} from '../actions/student-placement.actions';

export function PlacementPrepDashboardCard() {
  const [data, setData] = React.useState<{
    domainName: string | null;
    roadmapPercent: number;
    completedStages: number;
    totalStages: number;
    solvedProblems: number;
    totalProblems: number;
  } | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadStats() {
      try {
        const resProfile = await getStudentPlacementProfileInfoAction();
        if (resProfile.success && resProfile.data) {
          const prof = resProfile.data;
          const stages = prof.roadmapStages || [];
          const totalStages = stages.length;
          const completedStages = stages.filter((s: { isCompleted: boolean }) => s.isCompleted).length;
          const roadmapPercent = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;

          let solvedProblems = 0;
          let totalProblems = 0;

          if (prof.domainId) {
            const resProbs = await getDomainDSAProblemsAction(prof.domainId);
            if (resProbs.success && resProbs.data) {
              totalProblems = resProbs.data.length;
              solvedProblems = resProbs.data.filter((p: { userStatus: string }) => p.userStatus === 'SOLVED').length;
            }
          }

          setData({
            domainName: prof.domain?.name || null,
            roadmapPercent,
            completedStages,
            totalStages,
            solvedProblems,
            totalProblems,
          });
        }
      } catch (e) {
        console.error('Failed to load placement stats:', e);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  if (loading) return null;

  return (
    <Card className="shadow-xs border bg-card hover:border-primary/40 transition-all">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-primary font-semibold">
            <Sparkles className="h-3.5 w-3.5" /> Placement Prep Progress
          </div>
          <CardTitle className="text-base font-bold text-foreground">
            {data?.domainName ? data.domainName : 'Target Domain: Not Selected'}
          </CardTitle>
          <CardDescription className="text-xs">
            {data?.domainName
              ? 'Your active placement preparation roadmap and DSA problem stats.'
              : 'Choose a target placement track to generate your AI roadmap.'}
          </CardDescription>
        </div>
        <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
          <Briefcase className="h-5 w-5" />
        </div>
      </CardHeader>

      <CardContent className="pt-2 space-y-4">
        {data?.domainName ? (
          <div className="grid grid-cols-2 gap-4 bg-muted/30 p-3 rounded-md border">
            <div>
              <p className="text-[11px] text-muted-foreground font-medium">Roadmap Progress</p>
              <p className="text-lg font-bold font-mono text-foreground flex items-center gap-1.5">
                <span>{data.roadmapPercent}%</span>
                <span className="text-xs font-normal text-muted-foreground">
                  ({data.completedStages}/{data.totalStages})
                </span>
              </p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-medium">DSA Problems Solved</p>
              <p className="text-lg font-bold font-mono text-success flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                <span>{data.solvedProblems} / {data.totalProblems}</span>
              </p>
            </div>
          </div>
        ) : (
          <Badge variant="outline" className="text-xs border-dashed">
            Action Needed: Select Domain Track
          </Badge>
        )}

        <Button render={<Link href="/student/placement" className="w-full justify-between gap-2 text-xs" />}>
          {data?.domainName ? 'Continue Placement Prep' : 'Select Target Domain Track'} <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </CardContent>
    </Card>
  );
}
