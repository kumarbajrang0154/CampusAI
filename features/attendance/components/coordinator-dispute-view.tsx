'use client';

import * as React from 'react';
import { MessageSquare, CheckCircle2, XCircle, Clock, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { respondToQueryAction } from '../actions/attendance.actions';
import type { AttendanceQueryStatus } from '@prisma/client';

interface QueryItem {
  id: string;
  message: string;
  status: AttendanceQueryStatus;
  response?: string | null;
  createdAt: Date;
  resolvedAt?: Date | null;
  student: {
    enrollmentNo: string;
    user: {
      name: string | null;
      email: string;
    };
  };
  attendanceRecord: {
    id: string;
    date: Date;
    period?: number | null;
    status: string;
    subject: {
      name: string;
      code: string;
    };
  };
}

interface Props {
  queries: QueryItem[];
  onRefresh: () => void;
}

export function CoordinatorDisputeView({ queries, onRefresh }: Props) {
  const [selectedQueryId, setSelectedQueryId] = React.useState<string | null>(null);
  const [responseText, setResponseText] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const activeQuery = queries.find((q) => q.id === selectedQueryId) || queries[0];

  const handleResolve = async (status: AttendanceQueryStatus) => {
    if (!activeQuery) return;

    setIsSubmitting(true);
    try {
      const res = await respondToQueryAction({
        queryId: activeQuery.id,
        status,
        response: responseText,
      });

      if (res.success) {
        toast.success(`Query marked as ${status}!`);
        setResponseText('');
        onRefresh();
      } else {
        toast.error(res.error || 'Failed to update query');
      }
    } catch {
      toast.error('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: AttendanceQueryStatus) => {
    switch (status) {
      case 'OPEN':
        return (
          <Badge variant="outline" className="bg-amber-500/15 text-amber-700 border-amber-500/30 gap-1">
            <Clock className="h-3 w-3" /> Open
          </Badge>
        );
      case 'RESOLVED':
        return (
          <Badge variant="outline" className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30 gap-1">
            <CheckCircle2 className="h-3 w-3" /> Resolved
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge variant="outline" className="bg-rose-500/15 text-rose-700 border-rose-500/30 gap-1">
            <XCircle className="h-3 w-3" /> Rejected
          </Badge>
        );
    }
  };

  if (queries.length === 0) {
    return (
      <Card className="p-8 text-center bg-muted/20 border-dashed border-2">
        <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm font-semibold text-foreground">No Attendance Disputes</p>
        <p className="text-xs text-muted-foreground mt-1">
          There are currently no attendance queries submitted by students.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Query List */}
      <div className="lg:col-span-1 space-y-3">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          Dispute Queue ({queries.length})
        </h3>
        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
          {queries.map((q) => {
            const isSelected = activeQuery?.id === q.id;
            return (
              <div
                key={q.id}
                onClick={() => setSelectedQueryId(q.id)}
                className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-xs'
                    : 'border-border bg-card hover:bg-muted/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-xs text-foreground truncate">
                    {q.student.user.name || 'Student'}
                  </span>
                  {getStatusBadge(q.status)}
                </div>
                <div className="text-xs text-muted-foreground mt-1 truncate">
                  [{q.attendanceRecord.subject.code}] {q.attendanceRecord.subject.name}
                </div>
                <div className="text-[11px] text-muted-foreground/80 mt-1 flex justify-between">
                  <span>{new Date(q.attendanceRecord.date).toLocaleDateString()}</span>
                  <span>{new Date(q.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Query Detail & Response Form */}
      <div className="lg:col-span-2">
        {activeQuery ? (
          <Card className="border-border/60 shadow-xs">
            <CardHeader className="border-b pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-foreground">
                    Query from {activeQuery.student.user.name} ({activeQuery.student.enrollmentNo})
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    Registered Email: <span className="font-medium text-foreground">{activeQuery.student.user.email}</span>
                  </CardDescription>
                </div>
                <div>{getStatusBadge(activeQuery.status)}</div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Record Summary Box */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-muted/40 rounded-lg text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Subject</span>
                  <span className="font-bold">{activeQuery.attendanceRecord.subject.code}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Class Date</span>
                  <span className="font-medium">
                    {new Date(activeQuery.attendanceRecord.date).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Period</span>
                  <span className="font-medium">
                    {activeQuery.attendanceRecord.period ? `Period ${activeQuery.attendanceRecord.period}` : 'Daily'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Marked Status</span>
                  <Badge variant="outline" className="text-[10px] mt-0.5">
                    {activeQuery.attendanceRecord.status}
                  </Badge>
                </div>
              </div>

              {/* Message Box */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                  Student Complaint Message
                </label>
                <div className="p-4 bg-muted/20 border border-border rounded-lg text-sm text-foreground italic whitespace-pre-wrap">
                  "{activeQuery.message}"
                </div>
              </div>

              {/* Response & Resolution Form */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                  Coordinator Response / Notes
                </label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Enter response message to student..."
                  rows={3}
                  className="w-full p-3 text-sm rounded-md border border-input bg-background focus:outline-hidden focus:ring-2 focus:ring-primary"
                />

                {activeQuery.response && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-xs">
                    <span className="font-bold text-emerald-800 dark:text-emerald-300 block mb-1">
                      Previous Response:
                    </span>
                    <p className="text-foreground">{activeQuery.response}</p>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => handleResolve('REJECTED')}
                    disabled={isSubmitting}
                    className="text-rose-600 border-rose-500/30 hover:bg-rose-50 gap-1.5 text-xs font-semibold"
                  >
                    <XCircle className="h-4 w-4" /> Reject Query
                  </Button>

                  <Button
                    onClick={() => handleResolve('RESOLVED')}
                    disabled={isSubmitting}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs font-semibold"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    Mark Resolved
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
