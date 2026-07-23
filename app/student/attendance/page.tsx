'use client';

import * as React from 'react';
import { RefreshCw, CalendarCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StudentAttendanceOverview } from '@/features/attendance/components/student-attendance-overview';
import { StudentSubjectBreakdown } from '@/features/attendance/components/student-subject-breakdown';
import { StudentAttendanceLog } from '@/features/attendance/components/student-attendance-log';
import { getStudentAttendanceOverviewAction } from '@/features/attendance/actions/attendance.actions';
import { toast } from 'sonner';

export default function StudentAttendancePage() {
  const [selectedSubjectId, setSelectedSubjectId] = React.useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = React.useState(true);
  const [data, setData] = React.useState<Awaited<ReturnType<typeof getStudentAttendanceOverviewAction>> | null>(null);

  const fetchData = React.useCallback(async (subjectFilter?: string) => {
    setIsLoading(true);
    try {
      const res = await getStudentAttendanceOverviewAction(subjectFilter);
      setData(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch attendance records';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData(selectedSubjectId);
  }, [fetchData, selectedSubjectId]);

  const handleSelectSubject = (subjectId: string) => {
    if (selectedSubjectId === subjectId) {
      setSelectedSubjectId(undefined); // Toggle off filter
    } else {
      setSelectedSubjectId(subjectId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            <CalendarCheck className="h-7 w-7 text-primary" />
            My Attendance Record
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track your class attendance percentage, review subject breakdown, and raise dispute queries.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchData(selectedSubjectId)}
          disabled={isLoading}
          className="gap-2 text-xs font-medium self-start md:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {/* 1. Overall Summary Ring & KPIs */}
      {data?.summary && <StudentAttendanceOverview summary={data.summary} threshold={75} />}

      {/* 2. Per-Subject Breakdown */}
      {data?.summary?.subjectBreakdown && (
        <StudentSubjectBreakdown
          breakdown={data.summary.subjectBreakdown}
          threshold={75}
          selectedSubjectId={selectedSubjectId}
          onSelectSubject={handleSelectSubject}
        />
      )}

      {/* Filter Reset Badge if filtering */}
      {selectedSubjectId && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Filtering by selected subject.</span>
          <button
            onClick={() => setSelectedSubjectId(undefined)}
            className="text-primary underline font-semibold hover:text-primary/80"
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* 3 & 4. Detailed Log + Raise Query */}
      <StudentAttendanceLog
        logs={data?.logs || []}
        onRefresh={() => fetchData(selectedSubjectId)}
      />
    </div>
  );
}
