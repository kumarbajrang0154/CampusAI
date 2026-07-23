'use client';

import * as React from 'react';
import { Loader2, Trash2 } from 'lucide-react';
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
import { deleteCalendarEntryAction } from '../actions/academic-calendar.actions';

interface DeleteAcademicCalendarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: {
    id: string;
    title: string;
  } | null;
  onSuccess: () => void;
}

export function DeleteAcademicCalendarDialog({
  open,
  onOpenChange,
  event,
  onSuccess,
}: DeleteAcademicCalendarDialogProps) {
  const [loading, setLoading] = React.useState(false);

  const handleDelete = async () => {
    if (!event) return;
    setLoading(true);
    try {
      const res = await deleteCalendarEntryAction(event.id);
      if (res.success) {
        toast.success(res.message);
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete event.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Delete Calendar Event
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong className="text-foreground">{event?.title}</strong>?
          </DialogDescription>
        </DialogHeader>

        <p className="text-xs text-muted-foreground py-2">
          This event entry will be permanently removed from the academic calendar.
        </p>

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Event
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
