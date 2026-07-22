'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, AlertTriangle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { assignSlotSchema, AssignSlotInput } from '../schemas/timetable.schema';
import { assignSlotAction, deleteSlotAction } from '../actions/timetable.actions';
import { listSubjectsAction } from '@/features/admin/subjects/actions/subject.actions';
import { listUsersAction } from '@/features/admin/users/actions/user.actions';
import { listClassroomsAction } from '@/features/admin/classrooms/actions/classroom.actions';

interface AssignSlotDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  timetableId: string;
  departmentId: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  periodNumber: number;
  startTime: string;
  endTime: string;
  existingSlot?: {
    id: string;
    subjectId: string;
    facultyId: string;
    classroomId: string;
  } | null;
  onSuccess: () => void;
}

type OptionItem = { id: string; label: string };

export function AssignSlotDialog({
  isOpen,
  onOpenChange,
  timetableId,
  departmentId,
  day,
  periodNumber,
  startTime,
  endTime,
  existingSlot,
  onSuccess,
}: AssignSlotDialogProps) {
  const [isPending, setIsPending] = useState(false);
  const [conflictError, setConflictError] = useState<string | null>(null);

  const [subjects, setSubjects] = useState<OptionItem[]>([]);
  const [faculty, setFaculty] = useState<OptionItem[]>([]);
  const [classrooms, setClassrooms] = useState<OptionItem[]>([]);

  const form = useForm<AssignSlotInput>({
    resolver: zodResolver(assignSlotSchema),
    defaultValues: {
      timetableId,
      day,
      periodNumber,
      startTime,
      endTime,
      subjectId: existingSlot?.subjectId || '',
      facultyId: existingSlot?.facultyId || '',
      classroomId: existingSlot?.classroomId || '',
      slotId: existingSlot?.id || undefined,
    },
  });

  useEffect(() => {
    form.reset({
      timetableId,
      day,
      periodNumber,
      startTime,
      endTime,
      subjectId: existingSlot?.subjectId || '',
      facultyId: existingSlot?.facultyId || '',
      classroomId: existingSlot?.classroomId || '',
      slotId: existingSlot?.id || undefined,
    });
    setConflictError(null);
  }, [isOpen, timetableId, day, periodNumber, startTime, endTime, existingSlot, form]);

  useEffect(() => {
    async function loadOptions() {
      try {
        const [subjRes, userRes, roomRes] = await Promise.all([
          listSubjectsAction({ limit: 100 }),
          listUsersAction({ role: 'FACULTY', limit: 100 }),
          listClassroomsAction({ limit: 100 }),
        ]);

        if (subjRes.success && subjRes.data) {
          setSubjects(subjRes.data.subjects.map((s: any) => ({ id: s.id, label: `${s.code} — ${s.name}` })));
        }

        if (userRes.success && userRes.data) {
          // Fetch faculty list
          const facList: OptionItem[] = [];
          for (const u of userRes.data.users) {
            facList.push({ id: u.id, label: u.name || u.email });
          }
          setFaculty(facList);
        }

        if (roomRes.success && roomRes.data) {
          setClassrooms(roomRes.data.classrooms.map((r: any) => ({ id: r.id, label: `Room ${r.roomNumber} (${r.building}, Cap: ${r.capacity})` })));
        }
      } catch {
        // Silently catch option fetch errors
      }
    }
    if (isOpen) {
      loadOptions();
    }
  }, [isOpen, departmentId]);

  const onSubmit = async (values: AssignSlotInput) => {
    setIsPending(true);
    setConflictError(null);
    try {
      const response = await assignSlotAction(values);

      if (response.success) {
        toast.success('Period slot assigned successfully.');
        onOpenChange(false);
        onSuccess();
      } else {
        setConflictError(response.message);
        toast.error(response.message);
      }
    } catch {
      toast.error('An unexpected error occurred.');
    } finally {
      setIsPending(false);
    }
  };

  const handleDeleteSlot = async () => {
    if (!existingSlot?.id) return;
    setIsPending(true);
    try {
      const res = await deleteSlotAction(existingSlot.id);
      if (res.success) {
        toast.success('Period slot unassigned.');
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error('Failed to unassign slot.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => { if (!isPending) onOpenChange(v); }}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {existingSlot ? 'Edit Slot Assignment' : 'Assign Period Slot'}
          </DialogTitle>
          <DialogDescription>
            {day} — Period {periodNumber} ({startTime} – {endTime})
          </DialogDescription>
        </DialogHeader>

        {conflictError && (
          <Alert variant="destructive" className="my-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{conflictError}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="subjectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject *</FormLabel>
                  <Select
                    disabled={isPending}
                    onValueChange={field.onChange}
                    value={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subjects.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="facultyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned Faculty *</FormLabel>
                  <Select
                    disabled={isPending}
                    onValueChange={field.onChange}
                    value={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select faculty" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {faculty.map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="classroomId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Classroom / Room *</FormLabel>
                  <Select
                    disabled={isPending}
                    onValueChange={field.onChange}
                    value={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select classroom" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {classrooms.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between items-center pt-4">
              {existingSlot ? (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={isPending}
                  onClick={handleDeleteSlot}
                >
                  <Trash2 className="mr-1.5 h-4 w-4" />
                  Unassign Slot
                </Button>
              ) : (
                <div />
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Slot'
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
