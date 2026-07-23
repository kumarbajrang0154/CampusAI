'use client';

import * as React from 'react';
import { CheckCircle2, Circle, Clock, Sparkles, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toggleRoadmapStageAction } from '../actions/student-placement.actions';

export interface RoadmapStageItem {
  id: string;
  order: number;
  title: string;
  description: string;
  durationLabel: string;
  isCompleted: boolean;
}

interface RoadmapTimelineProps {
  stages: RoadmapStageItem[];
  domainName: string;
  onChangeDomain: () => void;
  onRefresh: () => void;
}

export function RoadmapTimeline({
  stages,
  domainName,
  onChangeDomain,
  onRefresh,
}: RoadmapTimelineProps) {
  const [togglingId, setTogglingId] = React.useState<string | null>(null);

  const completedCount = stages.filter((s) => s.isCompleted).length;
  const totalCount = stages.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleToggle = async (stageId: string) => {
    setTogglingId(stageId);
    try {
      const res = await toggleRoadmapStageAction(stageId);
      if (res.success) {
        onRefresh();
      } else {
        toast.error(res.message);
      }
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to toggle stage status.');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <Card className="shadow-xs border bg-card">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-4 border-b">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="brand" className="gap-1 text-[11px]">
              <Sparkles className="h-3 w-3" /> AI Generated
            </Badge>
            <span className="text-xs text-muted-foreground">Target Domain:</span>
            <span className="font-bold text-sm text-foreground">{domainName}</span>
          </div>
          <CardTitle className="text-lg">Preparation Roadmap Checklist</CardTitle>
          <CardDescription className="text-xs">
            Follow this structured roadmap step-by-step. Mark completed stages as you progress.
          </CardDescription>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-muted-foreground">Progress:</span>
            <span className="text-primary text-sm font-mono font-bold">{progressPercent}%</span>
            <span className="text-muted-foreground font-normal text-[11px]">
              ({completedCount}/{totalCount} Completed)
            </span>
          </div>

          <div className="w-full sm:w-44 bg-muted h-2 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground mt-1" onClick={onChangeDomain}>
            <RefreshCw className="h-3.5 w-3.5 mr-1" /> Change Track
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-border">
          {stages.map((stage) => {
            const isToggling = togglingId === stage.id;

            return (
              <div key={stage.id} className="relative flex items-start gap-4 group">
                {/* Node icon */}
                <button
                  type="button"
                  onClick={() => handleToggle(stage.id)}
                  disabled={isToggling}
                  className="absolute -left-[31px] sm:-left-[35px] top-0 bg-background rounded-full transition-transform hover:scale-110 disabled:opacity-50"
                  title={stage.isCompleted ? 'Mark as incomplete' : 'Mark stage complete'}
                >
                  {stage.isCompleted ? (
                    <CheckCircle2 className="h-6 w-6 text-success fill-success/20" />
                  ) : (
                    <Circle className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  )}
                </button>

                <div className="flex-1 rounded-lg border bg-muted/20 p-4 transition-all hover:bg-muted/40">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <h3 className={`font-semibold text-sm ${stage.isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      Stage {stage.order}: {stage.title}
                    </h3>
                    <Badge variant="outline" className="w-fit text-[10px] font-mono gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" /> {stage.durationLabel}
                    </Badge>
                  </div>
                  <p className={`text-xs leading-relaxed ${stage.isCompleted ? 'text-muted-foreground/70' : 'text-muted-foreground'}`}>
                    {stage.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
