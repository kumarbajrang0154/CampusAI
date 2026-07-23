'use client';

import * as React from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
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
import { setAsCurrentSemesterAction } from '../actions/semester.actions';

interface SetCurrentSemesterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  semester: {
    id: string;
    name: string;
  } | null;
  onSuccess: () => void;
}

export function SetCurrentSemesterDialog({
  open,
  onOpenChange,
  semester,
  onSuccess,
}: SetCurrentSemesterDialogProps) {
  const [loading, setLoading] = React.useState(false);

  const handleSetCurrent = async () => {
    if (!semester) return;
    setLoading(true);
    try {
      const res = await setAsCurrentSemesterAction(semester.id);
      if (res.success) {
        toast.success(res.message);
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update active semester.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <CheckCircle2 className="h-5 w-5" />
            Set as Current Active Semester
          </DialogTitle>
          <DialogDescription>
            Make <strong className="text-foreground">{semester?.name}</strong> the active institution-wide semester.
          </DialogDescription>
        </DialogHeader>

        <p className="text-xs text-muted-foreground py-2">
          This will set <strong className="text-foreground">{semester?.name}</strong> as the current active semester for all academic modules and automatically mark all other semesters as non-current.
        </p>

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSetCurrent} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Set as Current
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
