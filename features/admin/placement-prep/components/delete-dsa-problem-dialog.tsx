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
import { deleteDSAProblemAction } from '../actions/dsa-problem.actions';

interface DeleteDSAProblemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  problem: {
    id: string;
    title: string;
  } | null;
  onSuccess: () => void;
}

export function DeleteDSAProblemDialog({
  open,
  onOpenChange,
  problem,
  onSuccess,
}: DeleteDSAProblemDialogProps) {
  const [loading, setLoading] = React.useState(false);

  const handleDelete = async () => {
    if (!problem) return;
    setLoading(true);
    try {
      const res = await deleteDSAProblemAction(problem.id);
      if (res.success) {
        toast.success(res.message);
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(res.message);
      }
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to delete DSA problem.');
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
            Delete DSA Problem
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong className="text-foreground">{problem?.title}</strong>?
          </DialogDescription>
        </DialogHeader>

        <p className="text-xs text-muted-foreground py-2">
          This problem entry will be removed from the placement prep content bank.
        </p>

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Problem
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
