'use client';

import * as React from 'react';
import { Calendar, CheckCircle2, UserCheck, AlertCircle, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { markAttendanceAction } from '../actions/attendance.actions';
import type { AttendanceStatus } from '@prisma/client';

interface SubjectItem {
  id: string;
  name: string;
  code: string;
  course: {
    name: string;
    department: {
      code: string;
    };
  };
}

interface StudentItem {
  id: string;
  enrollmentNo: string;
  semester: number;
  section: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface ExistingRecord {
  id: string;
  studentId: string;
  status: AttendanceStatus;
  period?: number | null;
}

interface Props {
  subjects: SubjectItem[];
  selectedSubjectId: string;
  onSubjectChange: (subjectId: string) => void;
  selectedDate: string;
  onDateChange: (dateStr: string) => void;
  selectedPeriod: string;
  onPeriodChange: (periodStr: string) => void;
  students: StudentItem[];
  existingRecords: ExistingRecord[];
  onRefresh: () => void;
}

export function CoordinatorMarkingView({
  subjects,
  selectedSubjectId,
  onSubjectChange,
  selectedDate,
  onDateChange,
  selectedPeriod,
  onPeriodChange,
  students,
  existingRecords,
  onRefresh,
}: Props) {
  const [attendanceMap, setAttendanceMap] = React.useState<Record<string, AttendanceStatus>>({});
  const [isSaving, setIsSaving] = React.useState(false);

  // Sync existing records into state when subject/date/period or records change
  React.useEffect(() => {
    const newMap: Record<string, AttendanceStatus> = {};
    // Default all enrolled students to PRESENT if no existing record
    students.forEach((std) => {
      const rec = existingRecords.find((r) => r.studentId === std.id);
      newMap[std.id] = rec ? rec.status : 'PRESENT';
    });
    setAttendanceMap(newMap);
  }, [students, existingRecords]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    const updated: Record<string, AttendanceStatus> = {};
    students.forEach((std) => {
      updated[std.id] = status;
    });
    setAttendanceMap(updated);
    toast.info(`Marked all ${students.length} students as ${status}`);
  };

  const handleSave = async () => {
    if (!selectedSubjectId) {
      toast.error('Please select a subject');
      return;
    }

    setIsSaving(true);
    try {
      const recordsToSave = Object.entries(attendanceMap).map(([studentId, status]) => ({
        studentId,
        status,
      }));

      const periodNumber = selectedPeriod !== 'ALL' ? parseInt(selectedPeriod, 10) : undefined;

      const res = await markAttendanceAction({
        subjectId: selectedSubjectId,
        dateStr: selectedDate,
        period: periodNumber,
        records: recordsToSave,
      });

      if (res.success) {
        toast.success(`Successfully saved attendance for ${res.count} students!`);
        onRefresh();
      } else {
        toast.error(res.error || 'Failed to save attendance');
      }
    } catch {
      toast.error('An unexpected error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const stats = React.useMemo(() => {
    const values = Object.values(attendanceMap);
    return {
      present: values.filter((v) => v === 'PRESENT').length,
      absent: values.filter((v) => v === 'ABSENT').length,
      late: values.filter((v) => v === 'LATE').length,
      excused: values.filter((v) => v === 'EXCUSED').length,
    };
  }, [attendanceMap]);

  return (
    <div className="space-y-6">
      {/* Control Strip */}
      <Card className="border-border/60 bg-card shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            Attendance Marking Controls
          </CardTitle>
          <CardDescription>
            Select subject, date, and period to mark student attendance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Subject Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Subject
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => onSubjectChange(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-primary"
              >
                <option value="">-- Select Subject --</option>
                {subjects.map((subj) => (
                  <option key={subj.id} value={subj.id}>
                    [{subj.code}] {subj.name} ({subj.course.department.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Date Picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => onDateChange(e.target.value)}
                  className="w-full h-10 px-3 pr-8 rounded-md border border-input bg-background text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-primary"
                />
                <Calendar className="h-4 w-4 absolute right-2.5 top-3 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Period Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Period
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => onPeriodChange(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-primary"
              >
                <option value="ALL">All Day / Daily Aggregate</option>
                {[1, 2, 3, 4, 5, 6, 7].map((p) => (
                  <option key={p} value={p}>
                    Period {p}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {!selectedSubjectId ? (
        <Card className="border-dashed border-2 p-8 text-center bg-muted/20">
          <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground font-medium">
            Please select a subject above to load student enrollment list.
          </p>
        </Card>
      ) : students.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-sm text-muted-foreground">No students enrolled in this subject's department.</p>
        </Card>
      ) : (
        <Card className="border-border/60 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base font-bold">
                Student Roster ({students.length} Enrolled)
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Summary: <span className="text-emerald-6-00 font-semibold">{stats.present} Present</span>,{' '}
                <span className="text-rose-600 font-semibold">{stats.absent} Absent</span>,{' '}
                <span className="text-amber-600 font-semibold">{stats.late} Late</span>,{' '}
                <span className="text-blue-600 font-semibold">{stats.excused} Excused</span>
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMarkAll('PRESENT')}
                className="text-xs"
              >
                Mark All Present
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="gap-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Attendance
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-t border-border">
                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground font-semibold">
                  <tr>
                    <th className="px-4 py-3">Enrollment No</th>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3">Section</th>
                    <th className="px-4 py-3 text-center">Status Selection</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {students.map((student) => {
                    const currentStatus = attendanceMap[student.id] || 'PRESENT';
                    return (
                      <tr key={student.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs font-medium">{student.enrollmentNo}</td>
                        <td className="px-4 py-3 font-medium text-foreground">
                          {student.user.name || 'Unnamed Student'}
                          <div className="text-[11px] text-muted-foreground">{student.user.email}</div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-[11px]">
                            Sem {student.semester} - {student.section}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1.5">
                            {[
                              { label: 'PRESENT', color: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30' },
                              { label: 'ABSENT', color: 'bg-rose-500/15 text-rose-700 border-rose-500/30' },
                              { label: 'LATE', color: 'bg-amber-500/15 text-amber-700 border-amber-500/30' },
                              { label: 'EXCUSED', color: 'bg-blue-500/15 text-blue-700 border-blue-500/30' },
                            ].map((st) => {
                              const isSelected = currentStatus === st.label;
                              return (
                                <button
                                  key={st.label}
                                  type="button"
                                  onClick={() => handleStatusChange(student.id, st.label as AttendanceStatus)}
                                  className={`px-3 py-1 text-xs font-semibold rounded-md border transition-all ${
                                    isSelected
                                      ? `${st.color} shadow-xs ring-1 ring-primary/20 scale-105`
                                      : 'bg-background text-muted-foreground border-input hover:bg-muted'
                                  }`}
                                >
                                  {st.label}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
