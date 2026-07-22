'use client';

import * as React from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { Shield, LogOut, Loader2, RefreshCw, KeyRound, Clock } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getActiveSessionsAction, revokeSessionAction } from '../actions/security.actions';

export interface ActiveSessionItem {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    image?: string | null;
  };
}

export function ActiveSessionsTable() {
  const [loading, setLoading] = React.useState(true);
  const [sessions, setSessions] = React.useState<ActiveSessionItem[]>([]);
  const [revokingId, setRevokingId] = React.useState<string | null>(null);

  const fetchSessions = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await getActiveSessionsAction();
      if (res.success && res.data) {
        setSessions(res.data as ActiveSessionItem[]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleRevokeSession = async (session: ActiveSessionItem) => {
    if (!confirm(`Are you sure you want to force-revoke session for "${session.user.email}"?`)) {
      return;
    }

    setRevokingId(session.id);
    try {
      const res = await revokeSessionAction(session.id);
      if (res.success) {
        toast.success(res.message);
        fetchSessions();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to revoke session.');
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-primary" /> Active User Sessions
          </h2>
          <p className="text-xs text-muted-foreground">
            View active database session tokens and force-revoke access if suspicious activity occurs.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchSessions} disabled={loading} className="gap-1.5 text-xs">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead>User / Account</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Session Token (CUID)</TableHead>
              <TableHead>Expires In</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" /> Loading active sessions...
                  </div>
                </TableCell>
              </TableRow>
            ) : sessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <Shield className="h-8 w-8 text-muted-foreground/40 mb-1" />
                    <p className="font-medium text-foreground text-sm">No active sessions found</p>
                    <p className="text-xs">Active sessions will appear here when users sign in.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sessions.map((sess) => {
                const initials = (sess.user.name || 'User')
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase();

                const isExpired = new Date(sess.expires) < new Date();

                return (
                  <TableRow key={sess.id} className="hover:bg-muted/30 text-xs">
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={sess.user.image || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-foreground">{sess.user.name || 'Unnamed User'}</div>
                          <div className="text-[11px] text-muted-foreground">{sess.user.email}</div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className="text-[10px] font-mono font-semibold">
                        {sess.user.role}
                      </Badge>
                    </TableCell>

                    <TableCell className="font-mono text-[11px] text-muted-foreground">
                      <span className="truncate max-w-[180px] block" title={sess.sessionToken}>
                        {sess.sessionToken}
                      </span>
                    </TableCell>

                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {isExpired ? (
                        <span className="text-rose-600 font-semibold text-[11px]">Expired</span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px]">
                          <Clock className="h-3 w-3 text-emerald-600" />
                          {formatDistanceToNow(new Date(sess.expires), { addSuffix: true })}
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={revokingId === sess.id}
                        onClick={() => handleRevokeSession(sess)}
                        className="h-7 px-2 text-[11px] gap-1"
                      >
                        {revokingId === sess.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <LogOut className="h-3 w-3" />
                        )}
                        Revoke Session
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
