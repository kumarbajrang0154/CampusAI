'use client';

import * as React from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { Eye, Bell, Send, RefreshCw, Layers } from 'lucide-react';
import { NotificationType } from '@prisma/client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BatchRecipientsDialog } from './batch-recipients-dialog';
import { getAdminNotificationLogsAction } from '../actions/notification.actions';

export interface NotificationLogItem {
  batchId: string;
  title: string;
  message: string;
  type: NotificationType;
  audienceType: string;
  audienceTarget: string;
  sentAt: Date;
  recipientCount: number;
  senderName: string;
}

const TYPE_BADGE_VARIANTS: Record<NotificationType, string> = {
  GENERAL: 'bg-slate-100 text-slate-800 border-slate-200',
  ANNOUNCEMENT: 'bg-purple-100 text-purple-800 border-purple-200',
  ASSIGNMENT: 'bg-blue-100 text-blue-800 border-blue-200',
  QUIZ: 'bg-amber-100 text-amber-800 border-amber-200',
  PLACEMENT: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  TIMETABLE: 'bg-indigo-100 text-indigo-800 border-indigo-200',
};

interface NotificationHistoryTableProps {
  onRefreshTrigger?: (fn: () => void) => void;
}

export function NotificationHistoryTable({ onRefreshTrigger }: NotificationHistoryTableProps) {
  const [loading, setLoading] = React.useState(true);
  const [logs, setLogs] = React.useState<NotificationLogItem[]>([]);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);

  // Inspector Dialog State
  const [selectedBatch, setSelectedBatch] = React.useState<{ id: string; title: string } | null>(null);

  const fetchLogs = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminNotificationLogsAction({ page, limit: 10 });
      if (res.success && res.data) {
        setLogs(res.data.logs as NotificationLogItem[]);
        setTotalPages(res.data.pagination.totalPages);
      }
    } finally {
      setLoading(false);
    }
  }, [page]);

  React.useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  React.useEffect(() => {
    if (onRefreshTrigger) {
      onRefreshTrigger(fetchLogs);
    }
  }, [onRefreshTrigger, fetchLogs]);

  return (
    <div className="space-y-4">
      {/* Table Section */}
      <div className="rounded-md border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-[300px]">Notification Title & Details</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Audience Summary</TableHead>
              <TableHead>Recipients</TableHead>
              <TableHead>Sent Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin text-primary" /> Loading notification logs...
                  </div>
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <Bell className="h-8 w-8 text-muted-foreground/40 mb-1" />
                    <p className="font-medium text-foreground text-sm">No notifications sent yet</p>
                    <p className="text-xs">Click &quot;Compose Notification&quot; to send your first message.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.batchId} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="font-medium text-foreground">{log.title}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1 max-w-[280px]">
                      {log.message}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] font-semibold ${TYPE_BADGE_VARIANTS[log.type]}`}>
                      {log.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-medium text-foreground/90">
                      {log.audienceTarget}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {log.recipientCount} user{log.recipientCount > 1 ? 's' : ''}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    <div title={format(new Date(log.sentAt), 'PPP p')}>
                      {formatDistanceToNow(new Date(log.sentAt), { addSuffix: true })}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedBatch({ id: log.batchId, title: log.title })}
                      className="h-8 px-2 text-xs gap-1"
                    >
                      <Eye className="h-3.5 w-3.5" /> View Recipients
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Batch Recipients Inspector Modal */}
      <BatchRecipientsDialog
        batchId={selectedBatch?.id || null}
        title={selectedBatch?.title || null}
        open={!!selectedBatch}
        onOpenChange={(open) => {
          if (!open) setSelectedBatch(null);
        }}
      />
    </div>
  );
}
