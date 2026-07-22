'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Coffee, 
  Loader2, 
  CheckCircle2, 
  FileText, 
  BookOpen, 
  User, 
  MapPin, 
  Edit2, 
  Trash2 
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  getTimetableByIdAction, 
  getPeriodTemplatesAction, 
  toggleTimetableStatusAction,
  deleteSlotAction 
} from '../actions/timetable.actions';
import { AssignSlotDialog } from './assign-slot-dialog';
import { PeriodTemplateInput } from '../schemas/timetable.schema';

interface TimetableGridEditorProps {
  timetableId: string;
  onBack: () => void;
}

const DAYS: Array<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'> = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export function TimetableGridEditor({ timetableId, onBack }: TimetableGridEditorProps) {
  const [timetable, setTimetable] = useState<any>(null);
  const [periods, setPeriods] = useState<PeriodTemplateInput[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);

  // Dialog state for slot assignment
  const [slotDialogOpen, setSlotDialogOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{
    day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
    periodNumber: number;
    startTime: string;
    endTime: string;
    existingSlot?: any;
  } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [ttRes, pRes] = await Promise.all([
        getTimetableByIdAction(timetableId),
        getPeriodTemplatesAction(),
      ]);

      if (ttRes.success && ttRes.data) {
        setTimetable(ttRes.data);
      } else {
        toast.error(ttRes.message || 'Failed to load timetable details.');
      }

      if (pRes.success && pRes.data) {
        setPeriods(pRes.data);
      }
    } catch {
      toast.error('An error occurred loading timetable grid.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [timetableId]);

  const handleToggleStatus = async () => {
    setIsPublishing(true);
    try {
      const res = await toggleTimetableStatusAction(timetableId);
      if (res.success) {
        toast.success(res.message);
        loadData();
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error('Failed to update status.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCellClick = (
    day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday',
    period: PeriodTemplateInput,
    existingSlot?: any
  ) => {
    if (period.isBreak) return;
    setSelectedCell({
      day,
      periodNumber: period.periodNumber,
      startTime: period.startTime,
      endTime: period.endTime,
      existingSlot,
    });
    setSlotDialogOpen(true);
  };

  const handleDeleteSlot = async (slotId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await deleteSlotAction(slotId);
      if (res.success) {
        toast.success('Period slot unassigned.');
        loadData();
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error('Failed to unassign slot.');
    }
  };

  if (isLoading || !timetable) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed bg-card">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading timetable grid...</span>
      </div>
    );
  }

  // Create slot lookup map: key = `${day}_${periodNumber}`
  const slotMap = new Map<string, any>();
  if (timetable.slots) {
    for (const slot of timetable.slots) {
      slotMap.set(`${slot.day}_${slot.periodNumber}`, slot);
    }
  }

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 rounded-lg border shadow-xs">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to Timetables
          </Button>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              {timetable.department.name} ({timetable.department.code})
              <Badge
                variant={timetable.status === 'PUBLISHED' ? 'default' : 'secondary'}
                className={
                  timetable.status === 'PUBLISHED'
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                }
              >
                {timetable.status === 'PUBLISHED' ? (
                  <>
                    <CheckCircle2 className="mr-1 h-3 w-3" /> Published
                  </>
                ) : (
                  <>
                    <FileText className="mr-1 h-3 w-3" /> Draft
                  </>
                )}
              </Badge>
            </h2>
            <p className="text-xs text-muted-foreground">
              Semester {timetable.semester} | Section {timetable.section} | Academic Year {timetable.academicYear}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={timetable.status === 'PUBLISHED' ? 'outline' : 'default'}
            size="sm"
            disabled={isPublishing}
            onClick={handleToggleStatus}
          >
            {isPublishing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : timetable.status === 'PUBLISHED' ? (
              'Unpublish Timetable'
            ) : (
              'Publish Timetable'
            )}
          </Button>
        </div>
      </div>

      {/* Timetable Grid Table */}
      <Card className="overflow-x-auto p-2">
        <table className="w-full border-collapse min-w-[900px] text-sm">
          <thead>
            <tr className="bg-muted/50 border-b">
              <th className="p-3 text-left font-semibold text-xs text-muted-foreground w-28">
                Time / Day
              </th>
              {DAYS.map((day) => (
                <th key={day} className="p-3 text-center font-semibold text-xs text-foreground">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {periods.map((period) => {
              if (period.isBreak) {
                return (
                  <tr key={period.periodNumber} className="bg-amber-500/10 border-b">
                    <td className="p-2 font-mono text-xs text-amber-700 font-semibold border-r">
                      {period.startTime} – {period.endTime}
                    </td>
                    <td
                      colSpan={6}
                      className="p-2 text-center text-xs font-semibold text-amber-700 uppercase tracking-wider"
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <Coffee className="h-3.5 w-3.5" />
                        {period.breakLabel || 'Break'} ({period.startTime} – {period.endTime})
                      </span>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={period.periodNumber} className="border-b hover:bg-muted/20 transition-colors">
                  <td className="p-2 font-mono text-xs text-muted-foreground font-medium border-r bg-muted/20">
                    <div className="font-semibold text-foreground">Period {period.periodNumber}</div>
                    <div className="text-[11px] text-muted-foreground">{period.startTime} – {period.endTime}</div>
                  </td>

                  {DAYS.map((day) => {
                    const slotKey = `${day}_${period.periodNumber}`;
                    const slot = slotMap.get(slotKey);

                    return (
                      <td
                        key={day}
                        onClick={() => handleCellClick(day, period, slot)}
                        className="p-1.5 border-r border-border h-24 align-top cursor-pointer hover:bg-accent/40 transition-colors relative group"
                      >
                        {slot ? (
                          <div className="h-full w-full p-2 rounded-md bg-primary/5 border border-primary/20 flex flex-col justify-between relative">
                            <div>
                              <div className="font-semibold text-xs text-primary flex items-center gap-1 line-clamp-1">
                                <BookOpen className="h-3 w-3 shrink-0" />
                                {slot.subject.code}
                              </div>
                              <div className="text-[11px] font-medium text-foreground line-clamp-1">
                                {slot.subject.name}
                              </div>
                              <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1 line-clamp-1">
                                <User className="h-3 w-3 shrink-0 text-muted-foreground/70" />
                                {slot.faculty.user.name || slot.faculty.user.email}
                              </div>
                            </div>

                            <div className="flex items-center justify-between mt-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                              <span className="flex items-center gap-0.5">
                                <MapPin className="h-3 w-3" />
                                Room {slot.classroom.roomNumber}
                              </span>

                              {/* Actions on hover */}
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCellClick(day, period, slot);
                                  }}
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5 p-0 text-destructive hover:text-destructive"
                                  onClick={(e) => handleDeleteSlot(slot.id, e)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="h-full w-full border border-dashed border-muted-foreground/20 rounded-md flex flex-col items-center justify-center text-muted-foreground/40 hover:border-primary/50 hover:text-primary transition-all">
                            <Plus className="h-4 w-4" />
                            <span className="text-[10px] font-medium mt-0.5">Assign</span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {/* Assign Slot Dialog */}
      {selectedCell && (
        <AssignSlotDialog
          isOpen={slotDialogOpen}
          onOpenChange={setSlotDialogOpen}
          timetableId={timetableId}
          departmentId={timetable.departmentId}
          day={selectedCell.day}
          periodNumber={selectedCell.periodNumber}
          startTime={selectedCell.startTime}
          endTime={selectedCell.endTime}
          existingSlot={selectedCell.existingSlot}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}
