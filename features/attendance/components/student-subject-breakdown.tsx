'use client';

import * as React from 'react';
import { BookOpen, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SubjectBreakdownItem {
  subjectId: string;
  name: string;
  code: string;
  classesHeld: number;
  classesAttended: number;
  percentage: number;
}

interface Props {
  breakdown: SubjectBreakdownItem[];
  threshold?: number;
  onSelectSubject?: (subjectId: string) => void;
  selectedSubjectId?: string;
}

export function StudentSubjectBreakdown({
  breakdown,
  threshold = 75,
  onSelectSubject,
  selectedSubjectId,
}: Props) {
  if (breakdown.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        No enrolled subjects found for attendance tracking.
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-base font-bold text-foreground flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-primary" />
        Subject-wise Attendance Breakdown
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {breakdown.map((item) => {
          const isLow = item.percentage < threshold;
          const isSelected = selectedSubjectId === item.subjectId;

          return (
            <Card
              key={item.subjectId}
              onClick={() => onSelectSubject?.(item.subjectId)}
              className={`cursor-pointer transition-all duration-200 border-border/60 ${
                isSelected
                  ? 'ring-2 ring-primary bg-primary/5 shadow-md'
                  : 'hover:border-primary/40 hover:shadow-xs bg-card'
              }`}
            >
              <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
                <div>
                  <Badge variant="outline" className="text-[10px] font-mono mb-1">
                    {item.code}
                  </Badge>
                  <CardTitle className="text-sm font-bold line-clamp-1 text-foreground">
                    {item.name}
                  </CardTitle>
                </div>

                <Badge
                  variant="outline"
                  className={`text-xs font-bold ${
                    isLow
                      ? 'bg-rose-500/15 text-rose-700 border-rose-500/30'
                      : 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30'
                  }`}
                >
                  {item.percentage}%
                </Badge>
              </CardHeader>

              <CardContent className="pt-2">
                {/* Progress bar */}
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isLow ? 'bg-rose-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(item.percentage, 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                  <span>Attended: <strong className="text-foreground">{item.classesAttended}</strong></span>
                  <span>Held: <strong className="text-foreground">{item.classesHeld}</strong></span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
