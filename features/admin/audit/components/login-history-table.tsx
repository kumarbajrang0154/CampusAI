'use client';

import * as React from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { Search, Download, RefreshCw, CheckCircle2, XCircle, LogIn, Laptop, Globe } from 'lucide-react';
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
import { getLoginHistoryAction } from '../actions/audit.actions';

export interface LoginHistoryItem {
  id: string;
  userId?: string | null;
  email: string;
  success: boolean;
  ipAddress?: string | null;
  userAgent?: string | null;
  failureReason?: string | null;
  createdAt: Date;
  user?: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  } | null;
}

export function LoginHistoryTable() {
  const [loading, setLoading] = React.useState(true);
  const [history, setHistory] = React.useState<LoginHistoryItem[]>([]);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);

  // Filters State
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('ALL');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');

  const fetchHistory = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await getLoginHistoryAction({
        search: search.trim() || undefined,
        success: statusFilter === 'SUCCESS' ? true : statusFilter === 'FAILED' ? false : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page,
        limit: 15,
      });

      if (res.success && res.data) {
        setHistory(res.data.history as LoginHistoryItem[]);
        setTotalPages(res.data.pagination.totalPages);
      }
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, startDate, endDate, page]);

  React.useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Export CSV Handler
  const handleExportCSV = () => {
    if (history.length === 0) {
      toast.error('No login history data available to export.');
      return;
    }

    const headers = ['Timestamp', 'Email', 'User Name', 'Status', 'Failure Reason', 'IP Address', 'User Agent'];
    const rows = history.map((item) => [
      format(new Date(item.createdAt), 'yyyy-MM-dd HH:mm:ss'),
      `"${item.email}"`,
      `"${item.user?.name || 'N/A'}"`,
      item.success ? 'SUCCESS' : 'FAILED',
      `"${item.failureReason || ''}"`,
      item.ipAddress || 'N/A',
      `"${(item.userAgent || 'N/A').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CampusAI_Login_History_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Login history exported to CSV successfully.');
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Controls */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search email, failure reason, or IP address..."
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

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          {/* Status Filter */}
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              if (val) {
                setStatusFilter(val);
                setPage(1);
              }
            }}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Login Statuses</SelectItem>
              <SelectItem value="SUCCESS">Success Only</SelectItem>
              <SelectItem value="FAILED">Failed Only</SelectItem>
            </SelectContent>
          </Select>

          {/* Start Date */}
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

          {/* End Date */}
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

      {/* Login History Table */}
      <div className="rounded-md border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-[180px]">Timestamp</TableHead>
              <TableHead>User / Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Failure Reason / Notes</TableHead>
              <TableHead>Device / User-Agent</TableHead>
              <TableHead className="text-right">IP Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-36 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin text-primary" /> Loading login history...
                  </div>
                </TableCell>
              </TableRow>
            ) : history.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-36 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <LogIn className="h-8 w-8 text-muted-foreground/40 mb-1" />
                    <p className="font-medium text-foreground text-sm">No login attempts recorded</p>
                    <p className="text-xs">Adjust your search or filter parameters to view history.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              history.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/30 text-xs">
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    <div title={format(new Date(item.createdAt), 'PPP p')}>
                      {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="font-medium text-foreground">
                      {item.user?.name || 'Google OAuth User'}
                    </div>
                    <div className="text-[11px] text-muted-foreground">{item.email}</div>
                  </TableCell>

                  <TableCell>
                    {item.success ? (
                      <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 text-[10px]">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Success
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 gap-1 text-[10px]">
                        <XCircle className="h-3 w-3 text-rose-600" /> Failed
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell className="max-w-[220px]">
                    {item.failureReason ? (
                      <span className="text-rose-600 text-[11px] font-medium">{item.failureReason}</span>
                    ) : (
                      <span className="text-muted-foreground/60 text-[11px]">Authenticated via OAuth</span>
                    )}
                  </TableCell>

                  <TableCell className="max-w-[200px]">
                    <span className="text-[11px] text-muted-foreground truncate block" title={item.userAgent || 'N/A'}>
                      {item.userAgent || 'N/A'}
                    </span>
                  </TableCell>

                  <TableCell className="text-right font-mono text-[11px] text-muted-foreground">
                    {item.ipAddress || '127.0.0.1'}
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
