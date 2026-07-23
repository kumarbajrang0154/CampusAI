'use client';

import * as React from 'react';
import { Calendar, MapPin, User, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getStudentTimetableAction } from '@/features/lms/actions/learning.actions';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const PERIOD_TIMES = [
  { period: 1, time: '09:00 AM - 10:00 AM' },
  { period: 2, time: '10:00 AM - 11:00 AM' },
  { period: 3, time: '11:15 AM - 12:15 PM' },
  { period: 4, time: '12:15 PM - 01:15 PM' },
  { period: 5, time: '02:00 PM - 03:00 PM' },
  { period: 6, time: '03:00 PM - 04:00 PM' },
  { period: 7, time: '04:00 PM - 05:00 PM' },
];

export default function StudentTimetablePage() {
  const [data, setData] = React.useState<Awaited<ReturnType<typeof getStudentTimetableAction>> | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchTimetable = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getStudentTimetableAction();
      setData(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch timetable';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchTimetable();
  }, [fetchTimetable]);

  const getCurrentPeriodInfo = () => {
    const now = new Date();
    const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const currentDay = dayNames[now.getDay()];
    const currentHour = now.getHours();

    // Estimate current period (09:00 to 17:00)
    let currentPeriod = 0;
    if (currentHour === 9) currentPeriod = 1;
    else if (currentHour === 10) currentPeriod = 2;
    else if (currentHour === 11) currentPeriod = 3;
    else if (currentHour === 12) currentPeriod = 4;
    else if (currentHour === 14) currentPeriod = 5;
    else if (currentHour === 15) currentPeriod = 6;
    else if (currentHour === 16) currentPeriod = 7;

    return { currentDay, currentPeriod };
  };

  const { currentDay, currentPeriod } = getCurrentPeriodInfo();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
              <Calendar className="h-7 w-7 text-primary" />
              Smart Timetable
            </h1>
            {data?.studentInfo && (
              <Badge variant="outline" className="font-bold text-xs bg-primary/10 text-primary border-primary/20">
                {data.studentInfo.deptCode} • Sem {data.studentInfo.semester} - Sec {data.studentInfo.section}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Weekly class schedule, period times, subject faculty, and assigned lecture halls.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchTimetable}
          disabled={isLoading}
          className="gap-2 text-xs font-medium self-start md:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {/* Weekly Grid View */}
      <Card className="border-border/60 shadow-xs">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold">Class Schedule Grid</CardTitle>
            <CardDescription className="text-xs">
              Showing Monday to Saturday period timetable for your section.
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs font-semibold">
            {data?.timetable?.academicYear || 'Academic Year 2025-2026'}
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-t border-border border-collapse">
              <thead>
                <tr className="bg-muted/60 text-muted-foreground uppercase font-bold text-[11px] border-b">
                  <th className="p-3 border-r text-center w-28 shrink-0">Period / Time</th>
                  {DAYS.map((day) => {
                    const isToday = day === currentDay;
                    return (
                      <th
                        key={day}
                        className={`p-3 border-r min-w-[150px] text-center ${
                          isToday ? 'bg-primary/15 text-primary font-black' : ''
                        }`}
                      >
                        {day}
                        {isToday && <span className="block text-[9px] text-primary uppercase font-bold">Today</span>}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y border-b">
                {PERIOD_TIMES.map((p) => (
                  <tr key={p.period} className="hover:bg-muted/20 transition-colors">
                    {/* Period Label */}
                    <td className="p-2.5 border-r font-mono text-center bg-muted/30 whitespace-nowrap">
                      <div className="font-bold text-foreground">Period {p.period}</div>
                      <div className="text-[10px] text-muted-foreground">{p.time}</div>
                    </td>

                    {/* Day Cells */}
                    {DAYS.map((day) => {
                      const slot = data?.timetable?.slots.find(
                        (s) => s.day === day && s.periodNumber === p.period
                      );
                      const isLive = day === currentDay && p.period === currentPeriod;

                      return (
                        <td
                          key={day}
                          className={`p-2.5 border-r vertical-top transition-all ${
                            isLive
                              ? 'bg-emerald-500/10 border-emerald-500/30 ring-1 ring-emerald-500/40'
                              : slot
                              ? 'bg-card'
                              : 'bg-muted/10 text-muted-foreground/60'
                          }`}
                        >
                          {slot ? (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between gap-1">
                                <Badge variant="outline" className="font-mono text-[10px] font-bold">
                                  {slot.subject.code}
                                </Badge>
                                {isLive && (
                                  <Badge className="bg-emerald-600 text-white text-[9px] font-extrabold px-1.5 py-0 animate-pulse">
                                    LIVE NOW
                                  </Badge>
                                )}
                              </div>
                              <h5 className="font-bold text-xs text-foreground line-clamp-1">
                                {slot.subject.name}
                              </h5>
                              <div className="text-[11px] text-muted-foreground space-y-0.5 pt-0.5">
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3 text-primary shrink-0" />
                                  <span className="truncate">{slot.faculty.user.name || 'Faculty'}</span>
                                </div>
                                <div className="flex items-center gap-1 text-[10px]">
                                  <MapPin className="h-3 w-3 text-emerald-500 shrink-0" />
                                  <span>{slot.classroom.roomNumber} ({slot.classroom.type})</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="h-full flex items-center justify-center py-4 text-center">
                              <span className="text-[11px] italic text-muted-foreground/60">
                                {p.period === 4 ? 'Lunch / Break' : 'Free Period'}
                              </span>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
