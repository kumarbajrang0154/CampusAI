'use client';

import * as React from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
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
import { checkSemesterDeleteBlocksAction, deleteSemesterAction } from '../actions/semester.actions';

interface DeleteSemesterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  semester: {
    id: string;
    name: string;
  } | null;
  onSuccess: () => void;
}

export function DeleteSemesterDialog({
  open,
  onOpenChange,
  semester,
  onSuccess,
}: DeleteSemesterDialogProps) {
  const [checking, setChecking] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [deleteInfo, setDeleteInfo] = React.useState<{ canDelete: boolean; blocks: string[] } | null>(null);

  React.useEffect(() => {
    if (open && semester?.id) {
      setChecking(true);
      checkSemesterDeleteBlocksAction(semester.id).then((res) => {
        if (res.success && res.data) {
          setDeleteInfo(res.data);
        } else {
          toast.error(res.message || 'Failed to check dependencies.');
        }
        setChecking(false);
      });
    } else {
      setDeleteInfo(null);
    }
  }, [open, semester?.id]);

  const handleDelete = async () => {
    if (!semester) return;
    setDeleting(true);
    try {
      const res = await deleteSemesterAction(semester.id);
      if (res.success) {
        toast.success(res.message);
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete semester.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Semester
          </DialogTitle>
          <DialogDescription>
            Confirm deletion for semester <strong className="text-foreground">{semester?.name}</strong>.
          </DialogDescription>
        </DialogHeader>

        {checking ? (
          <div className="flex items-center justify-center py-6 text-xs text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
            Checking linked dependencies...
          </div>
        ) : deleteInfo && !deleteInfo.canDelete ? (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 p-4 space-y-2 text-xs text-destructive">
            <p className="font-bold text-sm">Deletion Blocked by Protective Gate</p>
            <p>This semester cannot be deleted because it has active linked dependencies:</p>
            <ul className="list-disc pl-4 space-y-1 font-medium">
              {deleteInfo.blocks.map((block, idx) => (
                <li key={idx}>{block}</li>
              ))}
            </ul>
            <p className="text-[11px] text-muted-foreground pt-1">
              Please delete or reassign all linked events and records before deleting this semester.
            </p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground py-2">
            This action cannot be undone. Are you sure you want to permanently delete this semester record?
          </p>
        )}

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={deleting}>
            Cancel
          </Button>
          {deleteInfo?.canDelete && (
            <Button variant="destructive" onClick={handleDelete} disabled={deleting || checking}>
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Semester
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
