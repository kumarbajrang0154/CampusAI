'use client';

import * as React from 'react';
import { Calendar, AlertCircle, AlertTriangle, CheckCircle2, Clock, XCircle, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RaiseQueryModal } from './raise-query-modal';

interface QueryInfo {
  id: string;
  message: string;
  status: 'OPEN' | 'RESOLVED' | 'REJECTED';
  response?: string | null;
  createdAt: Date;
  resolvedAt?: Date | null;
}

interface AttendanceLogItem {
  id: string;
  date: Date;
  period?: number | null;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  subject: {
    id: string;
    name: string;
    code: string;
  };
  markedBy?: {
    name: string | null;
    email: string;
  } | null;
  queries?: QueryInfo[];
}

interface Props {
  logs: AttendanceLogItem[];
  onRefresh: () => void;
}

export function StudentAttendanceLog({ logs, onRefresh }: Props) {
  const [selectedRecord, setSelectedRecord] = React.useState<AttendanceLogItem | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleOpenQueryModal = (record: AttendanceLogItem) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return (
          <Badge variant="outline" className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30 gap-1 font-bold">
            <CheckCircle2 className="h-3 w-3" /> PRESENT
          </Badge>
        );
      case 'ABSENT':
        return (
          <Badge variant="outline" className="bg-rose-500/15 text-rose-700 border-rose-500/30 gap-1 font-bold">
            <XCircle className="h-3 w-3" /> ABSENT
          </Badge>
        );
      case 'LATE':
        return (
          <Badge variant="outline" className="bg-amber-500/15 text-amber-700 border-amber-500/30 gap-1 font-bold">
            <Clock className="h-3 w-3" /> LATE
          </Badge>
        );
      case 'EXCUSED':
        return (
          <Badge variant="outline" className="bg-blue-500/15 text-blue-700 border-blue-500/30 gap-1 font-bold">
            <HelpCircle className="h-3 w-3" /> EXCUSED
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="border-border/60 shadow-xs">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          Detailed Attendance Log ({logs.length} Records)
        </CardTitle>
        <CardDescription className="text-xs">
          Date-wise log of your classes. If you spot an error, click <strong>Raise Query</strong> to notify the Attendance Coordinator and HOD.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No attendance records found for this view.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-t border-border">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground font-semibold">
                <tr>
                  <th className="px-4 py-3">Date & Time</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Period</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Query Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((record) => {
                  const latestQuery = record.queries && record.queries.length > 0 ? record.queries[0] : null;

                  return (
                    <tr key={record.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-foreground font-medium whitespace-nowrap">
                        {new Date(record.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-semibold text-foreground">{record.subject.code}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {record.subject.name}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-xs">
                        {record.period ? (
                          <Badge variant="outline" className="text-[11px]">
                            Period {record.period}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">Daily</span>
                        )}
                      </td>

                      <td className="px-4 py-3">{getStatusBadge(record.status)}</td>

                      <td className="px-4 py-3">
                        {latestQuery ? (
                          <div className="space-y-0.5">
                            <Badge
                              variant="outline"
                              className={`text-[10px] uppercase ${
                                latestQuery.status === 'OPEN'
                                  ? 'bg-amber-500/15 text-amber-700 border-amber-500/30'
                                  : latestQuery.status === 'RESOLVED'
                                  ? 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30'
                                  : 'bg-rose-500/15 text-rose-700 border-rose-500/30'
                              }`}
                            >
                              Query: {latestQuery.status}
                            </Badge>
                            {latestQuery.response && (
                              <div className="text-[11px] text-muted-foreground italic truncate max-w-[180px]">
                                Resp: "{latestQuery.response}"
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenQueryModal(record)}
                          className="h-8 text-xs text-amber-700 hover:text-amber-800 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/40 gap-1 font-semibold"
                        >
                          <AlertTriangle className="h-3.5 w-3.5" />
                          {latestQuery ? 'View / Raise' : 'Raise Query'}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      <RaiseQueryModal
        record={selectedRecord}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={onRefresh}
      />
    </Card>
  );
}
