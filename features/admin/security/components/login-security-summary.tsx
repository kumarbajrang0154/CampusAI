'use client';

import * as React from 'react';
import { ShieldAlert, CheckCircle2, XCircle, LogIn, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getLoginSecuritySummaryAction } from '../actions/security.actions';

export interface SecuritySummaryData {
  total7Days: number;
  success7Days: number;
  failed7Days: number;
  recentFailedLogins: Array<{
    id: string;
    email: string;
    ipAddress?: string | null;
    failureReason?: string | null;
    createdAt: Date;
    user?: {
      name: string | null;
      email: string;
    } | null;
  }>;
}

export function LoginSecuritySummary() {
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<SecuritySummaryData | null>(null);

  React.useEffect(() => {
    getLoginSecuritySummaryAction().then((res) => {
      if (res.success && res.data) {
        setData(res.data as SecuritySummaryData);
      }
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Logins */}
        <Card className="shadow-none border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              7-Day Logins
            </CardTitle>
            <LogIn className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? '...' : data?.total7Days ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total Authentication Requests</p>
          </CardContent>
        </Card>

        {/* Successful Logins */}
        <Card className="shadow-none border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Successful
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {loading ? '...' : data?.success7Days ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">OAuth Sign-ins Granted</p>
          </CardContent>
        </Card>

        {/* Failed Attempts */}
        <Card className="shadow-none border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Failed Attempts
            </CardTitle>
            <XCircle className={`h-4 w-4 ${(data?.failed7Days ?? 0) > 0 ? 'text-rose-600' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">
              {loading ? '...' : data?.failed7Days ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Blocked / Invalid Attempts</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Failed Logins Breakdown */}
      <div className="rounded-lg border bg-card p-4 space-y-3 shadow-sm">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
          <AlertTriangle className="h-4 w-4 text-amber-500" /> Recent Failed Login Attempts
        </h3>

        {!data || data.recentFailedLogins.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground">
            No failed login attempts detected recently.
          </div>
        ) : (
          <div className="border rounded-md divide-y text-xs">
            {data.recentFailedLogins.map((item) => (
              <div key={item.id} className="p-2.5 flex items-center justify-between hover:bg-muted/30">
                <div>
                  <p className="font-semibold text-foreground">{item.email}</p>
                  <p className="text-[11px] text-rose-600">{item.failureReason || 'Authentication Rejected'}</p>
                </div>

                <div className="text-right text-[11px] text-muted-foreground">
                  <div>{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</div>
                  <span className="font-mono">{item.ipAddress || '127.0.0.1'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
