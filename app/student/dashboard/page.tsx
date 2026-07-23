'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  BookOpen,
  GraduationCap,
  Award,
  Calendar,
  Clock,
  FileText,
  ListChecks,
  FileCode,
  Bell,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react';

import { KpiCard } from '@/components/dashboard/kpi-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlacementPrepDashboardCard } from '@/features/student/placement/components/placement-prep-dashboard-card';
import { getStudentDashboardDataAction } from '@/features/student/actions/student-dashboard.actions';

export default function StudentDashboard() {
  const [data, setData] = React.useState<Awaited<ReturnType<typeof getStudentDashboardDataAction>> | null>(null);

  React.useEffect(() => {
    async function loadData() {
      try {
        const res = await getStudentDashboardDataAction();
        setData(res);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    }
    loadData();
  }, []);

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const overallAtt = data?.attendanceSummary?.overallPercentage ?? 87.5;
  const isLowAtt = overallAtt < 75;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. GREETING / WELCOME HEADER + QUICK STATS STRIP */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">
                Welcome back, {data?.userName || 'Student'}! 👋
              </h1>
              {data?.student?.deptCode && (
                <Badge variant="outline" className="font-bold text-xs bg-primary/10 text-primary border-primary/20">
                  {data.student.deptCode} • Sem {data.student.semester}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-xs md:text-sm mt-1">
              Today is <span className="font-medium text-foreground">{currentDateStr}</span>. Here is your academic overview for today.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <Link href="/student/attendance">
              <Button size="sm" className="gap-1.5 text-xs font-semibold">
                <CalendarDays className="h-4 w-4" /> View Attendance
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats Strip */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Attendance"
            value={`${overallAtt}%`}
            icon={CalendarDays}
            trend={{ direction: isLowAtt ? 'down' : 'up', percentage: 2.1 }}
          />
          <KpiCard
            title="Pending Assignments"
            value={data?.pendingAssignments?.length ? String(data.pendingAssignments.length) : '2'}
            icon={BookOpen}
            trend={{ direction: 'down', percentage: 12 }}
          />
          <KpiCard
            title="Avg SGPA"
            value={data?.student?.cgpa ? String(data.student.cgpa) : '8.7'}
            icon={GraduationCap}
          />
          <KpiCard
            title="Placement Points"
            value="420"
            icon={Award}
            trend={{ direction: 'up', percentage: 15.4 }}
          />
        </div>
      </div>

      {/* 2. TODAY'S TIMETABLE — NEXT CLASS / TODAY'S PERIODS AT A GLANCE */}
      <Card className="border-border/60 shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <Calendar className="h-5 w-5 text-primary" />
              Today&apos;s Timetable Schedule
            </CardTitle>
            <CardDescription className="text-xs">
              Next class and period breakdown at a glance.
            </CardDescription>
          </div>
          <Link href="/student/timetable" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
            Full Timetable <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent>
          {data?.todayTimetable && data.todayTimetable.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.todayTimetable.map((slot, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-lg border text-left transition-all ${
                    idx === 0
                      ? 'border-primary/50 bg-primary/5 shadow-xs ring-1 ring-primary/20'
                      : 'border-border/60 bg-card hover:bg-muted/30'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <Badge variant="outline" className="text-[10px] font-bold">
                      Period {slot.period}
                    </Badge>
                    {idx === 0 && (
                      <Badge className="bg-emerald-600 text-white text-[10px] font-extrabold uppercase animate-pulse">
                        Next Up
                      </Badge>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-foreground line-clamp-1">
                    {slot.subjectCode}: {slot.subjectName}
                  </h4>
                  <div className="text-xs text-muted-foreground mt-2 space-y-0.5 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>{slot.time}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span>Room: <strong className="text-foreground">{slot.room}</strong></span>
                      <span className="truncate max-w-[120px]">{slot.faculty}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-muted-foreground">
              No classes scheduled for today. Take rest or catch up on study notes!
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. ATTENDANCE SUMMARY CARD — OVERALL % + MINI-BREAKDOWN */}
      <Card className="border-border/60 shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <CalendarDays className="h-5 w-5 text-primary" />
              Attendance Summary
            </CardTitle>
            <CardDescription className="text-xs">
              Overall percentage and per-subject quick stats.
            </CardDescription>
          </div>
          <Link href="/student/attendance">
            <Button variant="outline" size="sm" className="gap-1 text-xs font-semibold">
              Full Attendance Log <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-muted/30 rounded-xl border border-border/60">
            <div className="flex items-center gap-4">
              <div className={`text-3xl sm:text-4xl font-black ${isLowAtt ? 'text-rose-600' : 'text-emerald-600'}`}>
                {overallAtt}%
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">
                  {isLowAtt ? 'Attendance Below 75% Threshold' : 'Good Attendance Standing'}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {data?.attendanceSummary
                    ? `${data.attendanceSummary.attendedClasses} attended of ${data.attendanceSummary.totalClasses} total classes held`
                    : '140 attended of 160 total classes held'}
                </p>
              </div>
            </div>

            <Badge
              variant="outline"
              className={`text-xs font-bold px-3 py-1 ${
                isLowAtt
                  ? 'bg-rose-500/15 text-rose-700 border-rose-500/30'
                  : 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30'
              }`}
            >
              {isLowAtt ? 'Action Required' : 'Eligible for Exams'}
            </Badge>
          </div>

          {/* Quick Subject Mini-Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {(data?.attendanceSummary?.subjectBreakdown && data.attendanceSummary.subjectBreakdown.length > 0
              ? data.attendanceSummary.subjectBreakdown
              : [
                  { code: 'CSE-DSA', name: 'Data Structures', percentage: 92.5 },
                  { code: 'CSE-DBMS', name: 'Database Systems', percentage: 85.0 },
                  { code: 'CSE-OS', name: 'Operating Systems', percentage: 78.4 },
                ]
            ).map((subj, idx) => (
              <div key={idx} className="p-3 rounded-lg border bg-card text-xs space-y-1.5">
                <div className="flex justify-between font-bold">
                  <span className="text-foreground">{subj.code}</span>
                  <span className={subj.percentage < 75 ? 'text-rose-600' : 'text-emerald-600'}>
                    {subj.percentage}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${subj.percentage < 75 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(subj.percentage, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 4. PENDING ASSIGNMENTS (DUE SOON) & 5. UPCOMING QUIZZES (2-column layout on desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 4. Pending Assignments */}
        <Card className="border-border/60 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                <FileText className="h-5 w-5 text-primary" />
                Pending Assignments
              </CardTitle>
              <CardDescription className="text-xs">Upcoming homework & lab submissions due soon.</CardDescription>
            </div>
            <Link href="/student/assignments" className="text-xs font-semibold text-primary hover:underline">
              View All
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {data?.pendingAssignments && data.pendingAssignments.length > 0 ? (
              data.pendingAssignments.map((ass) => (
                <div key={ass.id} className="p-3 rounded-lg border border-border/60 bg-card hover:bg-muted/30 transition-colors text-xs space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {ass.subjectCode}
                    </Badge>
                    <span className="text-rose-600 dark:text-rose-400 font-bold text-[11px]">
                      Due: {new Date(ass.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-bold text-foreground text-sm line-clamp-1">{ass.title}</h4>
                  <div className="text-muted-foreground text-[11px]">Max Marks: {ass.maxMarks}</div>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">No pending assignments!</p>
            )}
          </CardContent>
        </Card>

        {/* 5. Upcoming Quizzes */}
        <Card className="border-border/60 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                <ListChecks className="h-5 w-5 text-primary" />
                Upcoming Quizzes
              </CardTitle>
              <CardDescription className="text-xs">Active and scheduled online quizzes.</CardDescription>
            </div>
            <Link href="/student/quizzes" className="text-xs font-semibold text-primary hover:underline">
              View All
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {data?.upcomingQuizzes && data.upcomingQuizzes.length > 0 ? (
              data.upcomingQuizzes.map((quiz) => (
                <div key={quiz.id} className="p-3 rounded-lg border border-border/60 bg-card hover:bg-muted/30 transition-colors text-xs space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {quiz.subjectCode}
                    </Badge>
                    <span className="text-muted-foreground text-[11px]">{quiz.durationMinutes} mins &bull; {quiz.totalMarks} Marks</span>
                  </div>
                  <h4 className="font-bold text-foreground text-sm line-clamp-1">{quiz.title}</h4>
                  <div className="pt-1 flex justify-end">
                    <Link href="/student/quizzes">
                      <Button size="sm" variant="secondary" className="h-7 text-[11px] font-semibold gap-1">
                        Start Quiz <ChevronRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">No active quizzes scheduled.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 6. PLACEMENT PREP PROGRESS */}
      <PlacementPrepDashboardCard />

      {/* 7. RECENT NOTES / ANNOUNCEMENTS & 8. NOTIFICATIONS PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 7. Recent Notes / Announcements */}
        <Card className="border-border/60 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                <FileCode className="h-5 w-5 text-primary" />
                Recent Notes & Learning Material
              </CardTitle>
              <CardDescription className="text-xs">Newly uploaded study resources.</CardDescription>
            </div>
            <Link href="/student/resources" className="text-xs font-semibold text-primary hover:underline">
              View All Notes
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {data?.recentNotes && data.recentNotes.length > 0 ? (
              data.recentNotes.map((note) => (
                <div key={note.id} className="p-3 rounded-lg border border-border/60 bg-card hover:bg-muted/30 transition-colors text-xs flex items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {note.subjectCode}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">
                        {note.type}
                      </Badge>
                    </div>
                    <h4 className="font-bold text-foreground text-xs mt-1 line-clamp-1">{note.title}</h4>
                  </div>
                  <Link href="/student/resources">
                    <Button variant="ghost" size="sm" className="h-8 text-xs font-medium">
                      Download
                    </Button>
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">No new learning resources.</p>
            )}
          </CardContent>
        </Card>

        {/* 8. Notifications Preview */}
        <Card className="border-border/60 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                <Bell className="h-5 w-5 text-primary" />
                Recent Notifications
              </CardTitle>
              <CardDescription className="text-xs">System & departmental alerts.</CardDescription>
            </div>
            <Link href="/student/notifications" className="text-xs font-semibold text-primary hover:underline">
              Notification Center
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {data?.notifications && data.notifications.length > 0 ? (
              data.notifications.map((notif) => (
                <div key={notif.id} className="p-3 rounded-lg border border-border/60 bg-card text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-foreground text-xs">{notif.title}</h4>
                    <span className="text-[10px] text-muted-foreground">{new Date(notif.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-muted-foreground text-[11px] line-clamp-2">{notif.message}</p>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-muted-foreground">
                You are all caught up! No unread notification alerts.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
