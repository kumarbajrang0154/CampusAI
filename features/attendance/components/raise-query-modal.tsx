'use client';

import * as React from 'react';
import { AlertTriangle, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { raiseAttendanceQueryAction } from '../actions/attendance.actions';

interface AttendanceRecordInfo {
  id: string;
  date: Date | string;
  period?: number | null;
  status: string;
  subject: {
    name: string;
    code: string;
  };
}

interface Props {
  record: AttendanceRecordInfo | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function RaiseQueryModal({ record, isOpen, onClose, onSuccess }: Props) {
  const [message, setMessage] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setMessage('');
    }
  }, [isOpen]);

  if (!record) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Please enter a message explaining the attendance discrepancy.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await raiseAttendanceQueryAction({
        attendanceRecordId: record.id,
        message,
      });

      if (res.success) {
        toast.success('Query raised successfully! Coordinator & HOD notified via email.');
        if (res.warning) {
          toast.warning(res.warning);
        }
        onSuccess();
        onClose();
      } else {
        toast.error(res.error || 'Failed to submit query');
      }
    } catch {
      toast.error('An error occurred while raising query.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedDate = new Date(record.date).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Raise Attendance Discrepancy Query
          </DialogTitle>
          <DialogDescription className="text-xs">
            Submit a dispute query regarding your recorded attendance. The coordinator and department HOD will be notified.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Target Record Card */}
          <div className="p-3 bg-muted/40 rounded-lg border text-xs space-y-1">
            <div className="flex justify-between font-bold">
              <span>{record.subject.code} - {record.subject.name}</span>
              <span className="uppercase text-amber-600 font-extrabold">{record.status}</span>
            </div>
            <div className="text-muted-foreground flex justify-between">
              <span>Date: {formattedDate}</span>
              <span>{record.period ? `Period ${record.period}` : 'Daily Record'}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider">
              Reason / Explanation <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. I was present in class on this date and submitted my offline worksheet. Please verify with period log."
              rows={4}
              required
              className="w-full p-3 text-sm rounded-md border border-input bg-background focus:outline-hidden focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/60"
            />
          </div>

          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-md text-[11px] text-blue-900 dark:text-blue-200">
            <strong>Note:</strong> An email notification will be sent via Resend with your college email as the <strong>Reply-To</strong> address so the coordinator/HOD can contact you directly.
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="gap-2 font-semibold bg-primary text-primary-foreground"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Submit Dispute Query
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
