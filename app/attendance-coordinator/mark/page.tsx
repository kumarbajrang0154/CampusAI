'use client';

import * as React from 'react';
import { MessageSquare, RefreshCw, UserCheck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { CoordinatorMarkingView } from '@/features/attendance/components/coordinator-marking-view';
import { CoordinatorDisputeView } from '@/features/attendance/components/coordinator-dispute-view';
import { getCoordinatorDataAction } from '@/features/attendance/actions/attendance.actions';
import { toast } from 'sonner';

export default function CoordinatorMarkPage() {
  const [selectedSubjectId, setSelectedSubjectId] = React.useState<string>('');
  const [selectedDate, setSelectedDate] = React.useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedPeriod, setSelectedPeriod] = React.useState<string>('ALL');

  const [isLoading, setIsLoading] = React.useState(true);
  const [data, setData] = React.useState<Awaited<ReturnType<typeof getCoordinatorDataAction>> | null>(null);

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const periodNum = selectedPeriod !== 'ALL' ? parseInt(selectedPeriod, 10) : undefined;
      const res = await getCoordinatorDataAction(selectedSubjectId, selectedDate, periodNum);
      setData(res);
      // Default to first subject if not set
      if (!selectedSubjectId && res.subjects.length > 0) {
        setSelectedSubjectId(res.subjects[0].id);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error fetching coordinator data';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [selectedSubjectId, selectedDate, selectedPeriod]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">
              Attendance Coordinator Portal
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-primary/10 text-primary rounded-full border border-primary/20">
              MARK_ATTENDANCE
            </span>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Mark class attendance, manage period logs, and resolve student attendance queries.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchData()}
          disabled={isLoading}
          className="gap-2 text-xs font-medium self-start md:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Data
        </Button>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="mark" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="mark" className="gap-2 text-xs font-bold">
            <UserCheck className="h-4 w-4" /> Mark Attendance
          </TabsTrigger>
          <TabsTrigger value="disputes" className="gap-2 text-xs font-bold relative">
            <MessageSquare className="h-4 w-4" /> Student Disputes
            {data?.queries && data.queries.filter((q) => q.status === 'OPEN').length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[10px] font-extrabold bg-rose-600 text-white rounded-full">
                {data.queries.filter((q) => q.status === 'OPEN').length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mark" className="mt-6">
          <CoordinatorMarkingView
            subjects={data?.subjects || []}
            selectedSubjectId={selectedSubjectId}
            onSubjectChange={setSelectedSubjectId}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
            students={data?.enrolledStudents || []}
            existingRecords={data?.existingRecords || []}
            onRefresh={fetchData}
          />
        </TabsContent>

        <TabsContent value="disputes" className="mt-6">
          <CoordinatorDisputeView
            queries={data?.queries || []}
            onRefresh={fetchData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
