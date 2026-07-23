'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AcademicEventType } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { academicCalendarSchema, AcademicCalendarFormValues } from '../schemas/academic-calendar.schema';
import { createCalendarEntryAction, updateCalendarEntryAction } from '../actions/academic-calendar.actions';

interface AcademicCalendarFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  semesters: Array<{ id: string; name: string }>;
  eventToEdit?: {
    id: string;
    title: string;
    description?: string | null;
    eventType: AcademicEventType;
    startDate: string | Date;
    endDate?: string | Date | null;
    semesterId?: string | null;
    isPublished: boolean;
  } | null;
  onSuccess: () => void;
}

export function AcademicCalendarFormDialog({
  open,
  onOpenChange,
  semesters,
  eventToEdit,
  onSuccess,
}: AcademicCalendarFormDialogProps) {
  const isEditing = !!eventToEdit;
  const [loading, setLoading] = React.useState(false);

  const form = useForm<AcademicCalendarFormValues>({
    resolver: zodResolver(academicCalendarSchema),
    defaultValues: {
      title: '',
      description: '',
      eventType: AcademicEventType.HOLIDAY,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      semesterId: '',
      isPublished: true,
    },
  });

  React.useEffect(() => {
    if (eventToEdit) {
      const startStr = typeof eventToEdit.startDate === 'string'
        ? eventToEdit.startDate.split('T')[0]
        : eventToEdit.startDate.toISOString().split('T')[0];

      const endStr = eventToEdit.endDate
        ? typeof eventToEdit.endDate === 'string'
          ? eventToEdit.endDate.split('T')[0]
          : eventToEdit.endDate.toISOString().split('T')[0]
        : '';

      form.reset({
        title: eventToEdit.title,
        description: eventToEdit.description || '',
        eventType: eventToEdit.eventType,
        startDate: startStr,
        endDate: endStr,
        semesterId: eventToEdit.semesterId || '',
        isPublished: eventToEdit.isPublished,
      });
    } else {
      form.reset({
        title: '',
        description: '',
        eventType: AcademicEventType.HOLIDAY,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        semesterId: semesters[0]?.id || '',
        isPublished: true,
      });
    }
  }, [eventToEdit, form, open, semesters]);

  const onSubmit = async (values: AcademicCalendarFormValues) => {
    setLoading(true);
    try {
      let res;
      if (isEditing && eventToEdit) {
        res = await updateCalendarEntryAction(eventToEdit.id, values);
      } else {
        res = await createCalendarEntryAction(values);
      }

      if (res.success) {
        toast.success(res.message);
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Calendar Event' : 'Create Academic Calendar Event'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update event details, date range, or publication status.'
              : 'Add an academic event, exam date, or holiday to the institution calendar.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="title">Event Title</Label>
            <Input
              id="title"
              placeholder="e.g. Mid-Term Examination Week"
              {...form.register('title')}
            />
            {form.formState.errors.title && (
              <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="eventType">Event Type</Label>
              <Select
                value={form.watch('eventType')}
                onValueChange={(val) => val && form.setValue('eventType', val as AcademicEventType)}
              >
                <SelectTrigger id="eventType">
                  <SelectValue placeholder="Select Event Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={AcademicEventType.HOLIDAY}>HOLIDAY</SelectItem>
                  <SelectItem value={AcademicEventType.EXAM}>EXAM</SelectItem>
                  <SelectItem value={AcademicEventType.REGISTRATION}>REGISTRATION</SelectItem>
                  <SelectItem value={AcademicEventType.ORIENTATION}>ORIENTATION</SelectItem>
                  <SelectItem value={AcademicEventType.RESULT}>RESULT</SelectItem>
                  <SelectItem value={AcademicEventType.OTHER}>OTHER</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="semesterId">Linked Semester</Label>
              <Select
                value={form.watch('semesterId') || 'none'}
                onValueChange={(val) => form.setValue('semesterId', val === 'none' ? null : val)}
              >
                <SelectTrigger id="semesterId">
                  <SelectValue placeholder="General / All Semesters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">General / All Semesters</SelectItem>
                  {semesters.map((sem) => (
                    <SelectItem key={sem.id} value={sem.id}>
                      {sem.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                {...form.register('startDate')}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="endDate">End Date (Optional)</Label>
              <Input
                id="endDate"
                type="date"
                {...form.register('endDate')}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description / Instructions (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Provide event details, room allocations, or instructions..."
              rows={3}
              {...form.register('description')}
            />
          </div>

          <div className="flex items-center space-x-2 pt-2 border-t">
            <Checkbox
              id="isPublished"
              checked={form.watch('isPublished')}
              onCheckedChange={(checked) => form.setValue('isPublished', !!checked)}
            />
            <Label htmlFor="isPublished" className="text-xs leading-none font-medium cursor-pointer">
              Publish Event (Visible to institution portals when published)
            </Label>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Create Event'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
