'use client';

import * as React from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { Search, Download, RefreshCw, ShieldAlert, User, Calendar, Filter } from 'lucide-react';
import { toast } from 'sonner';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  getActivityLogsAction,
  getAuditFilterOptionsAction,
} from '../actions/audit.actions';

export interface ActivityLogItem {
  id: string;
  userId: string;
  targetUserId?: string | null;
  action: string;
  details?: any;
  ipAddress?: string | null;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  };
}

export function ActivityLogTable() {
  const [loading, setLoading] = React.useState(true);
  const [logs, setLogs] = React.useState<ActivityLogItem[]>([]);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);

  // Filters State
  const [search, setSearch] = React.useState('');
  const [actionFilter, setActionFilter] = React.useState('ALL');
  const [userFilter, setUserFilter] = React.useState('ALL');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');

  // Options State
  const [availableActions, setAvailableActions] = React.useState<string[]>([]);
  const [availableUsers, setAvailableUsers] = React.useState<Array<{ id: string; name: string | null; email: string }>>([]);

  React.useEffect(() => {
    getAuditFilterOptionsAction().then((res) => {
      if (res.success && res.data) {
        setAvailableActions(res.data.actions || []);
        setAvailableUsers(res.data.users || []);
      }
    });
  }, []);

  const fetchLogs = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await getActivityLogsAction({
        search: search.trim() || undefined,
        action: actionFilter !== 'ALL' ? actionFilter : undefined,
        userId: userFilter !== 'ALL' ? userFilter : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page,
        limit: 15,
      });

      if (res.success && res.data) {
        setLogs(res.data.logs as ActivityLogItem[]);
        setTotalPages(res.data.pagination.totalPages);
      }
    } finally {
      setLoading(false);
    }
  }, [search, actionFilter, userFilter, startDate, endDate, page]);

  React.useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Export CSV Handler
  const handleExportCSV = () => {
    if (logs.length === 0) {
      toast.error('No activity log data available to export.');
      return;
    }

    const headers = ['Timestamp', 'Actor Name', 'Actor Email', 'Role', 'Action', 'Details', 'IP Address'];
    const rows = logs.map((log) => [
      format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss'),
      `"${log.user.name || 'Unknown'}"`,
      `"${log.user.email}"`,
      log.user.role,
      `"${log.action}"`,
      `"${log.details ? JSON.stringify(log.details).replace(/"/g, '""') : ''}"`,
      log.ipAddress || 'N/A',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CampusAI_Activity_Logs_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Activity logs exported to CSV successfully.');
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Controls */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search action, user name, or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>

          <Button variant="outline" onClick={handleExportCSV} className="gap-2 shrink-0">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
          {/* Action Filter */}
          <Select
            value={actionFilter}
            onValueChange={(val) => {
              if (val) {
                setActionFilter(val);
                setPage(1);
              }
            }}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="All Actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Actions</SelectItem>
              {availableActions.map((act) => (
                <SelectItem key={act} value={act}>
                  {act}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* User Filter */}
          <Select
            value={userFilter}
            onValueChange={(val) => {
              if (val) {
                setUserFilter(val);
                setPage(1);
              }
            }}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="All Users" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Users</SelectItem>
              {availableUsers.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name || u.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Start Date */}
          <div className="relative">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="h-9 text-xs"
              placeholder="Start Date"
            />
          </div>

          {/* End Date */}
          <div className="relative">
            <Input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="h-9 text-xs"
              placeholder="End Date"
            />
          </div>
        </div>
      </div>

      {/* Activity Log Data Table */}
      <div className="rounded-md border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-[180px]">Timestamp</TableHead>
              <TableHead>Actor / User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Target / Details Payload</TableHead>
              <TableHead className="text-right">IP Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-36 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin text-primary" /> Loading activity audit trail...
                  </div>
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-36 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <ShieldAlert className="h-8 w-8 text-muted-foreground/40 mb-1" />
                    <p className="font-medium text-foreground text-sm">No activity logs recorded</p>
                    <p className="text-xs">Adjust your search or filter parameters to view logs.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id} className="hover:bg-muted/30 text-xs">
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    <div title={format(new Date(log.createdAt), 'PPP p')}>
                      {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="font-medium text-foreground">{log.user.name || 'Unknown'}</div>
                    <div className="text-[11px] text-muted-foreground">{log.user.email}</div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className="font-mono text-[10px] font-semibold bg-primary/5 text-primary border-primary/20">
                      {log.action}
                    </Badge>
                  </TableCell>

                  <TableCell className="max-w-[320px]">
                    {log.details ? (
                      <div className="text-[11px] text-muted-foreground bg-muted/40 p-1.5 rounded font-mono truncate">
                        {typeof log.details === 'object' ? JSON.stringify(log.details) : String(log.details)}
                      </div>
                    ) : (
                      <span className="text-muted-foreground/60 italic text-[11px]">No extra details</span>
                    )}
                  </TableCell>

                  <TableCell className="text-right font-mono text-[11px] text-muted-foreground">
                    {log.ipAddress || 'Internal'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
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
    </div>
  );
}
