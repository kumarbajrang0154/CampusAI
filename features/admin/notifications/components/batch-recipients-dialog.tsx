'use client';

import * as React from 'react';
import { Loader2, Users, CheckCircle2, Clock, Mail } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { getBatchRecipientsAction } from '../actions/notification.actions';

interface BatchRecipientsDialogProps {
  batchId: string | null;
  title: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface RecipientItem {
  notificationId: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  isRead: boolean;
  createdAt: Date;
}

export function BatchRecipientsDialog({
  batchId,
  title,
  open,
  onOpenChange,
}: BatchRecipientsDialogProps) {
  const [loading, setLoading] = React.useState(false);
  const [recipients, setRecipients] = React.useState<RecipientItem[]>([]);

  React.useEffect(() => {
    if (open && batchId) {
      setLoading(true);
      getBatchRecipientsAction(batchId)
        .then((res) => {
          if (res.success && res.data) {
            setRecipients(res.data as RecipientItem[]);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [open, batchId]);

  const readCount = recipients.filter((r) => r.isRead).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" /> Recipient Delivery Log
          </DialogTitle>
          <DialogDescription className="truncate font-medium text-foreground">
            {title ? `"${title}"` : 'Batch Notification Details'}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
            <Loader2 className="h-5 w-5 animate-spin mr-2" /> Fetching recipient list...
          </div>
        ) : (
          <div className="flex-1 overflow-hidden flex flex-col space-y-3 pt-2">
            {/* Stats Summary Header */}
            <div className="flex items-center justify-between text-xs bg-muted/40 p-2.5 rounded-lg border">
              <div>
                <span className="font-semibold text-foreground">{recipients.length}</span> Total Recipients
              </div>
              <div className="flex items-center gap-4">
                <span className="text-emerald-600 font-medium">
                  {readCount} Read
                </span>
                <span className="text-amber-600 font-medium">
                  {recipients.length - readCount} Unread
                </span>
              </div>
            </div>

            {/* Recipient List Table */}
            <div className="flex-1 overflow-y-auto border rounded-md divide-y">
              {recipients.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  No recipient records found for this batch.
                </div>
              ) : (
                recipients.map((item) => (
                  <div
                    key={item.notificationId}
                    className="p-3 flex items-center justify-between hover:bg-muted/30 transition-colors text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                        {item.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">{item.name}</p>
                          <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                            {item.role}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground flex items-center gap-1 text-[11px]">
                          <Mail className="h-3 w-3" /> {item.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.isRead ? (
                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 text-[10px]">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Read
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200 gap-1 text-[10px]">
                          <Clock className="h-3 w-3 text-amber-600" /> Unread
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
