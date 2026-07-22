'use client';

import * as React from 'react';
import { Lock, ShieldCheck, Clock, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function SecurityConfigPanel() {
  return (
    <Card className="shadow-none border">
      <CardHeader className="pb-3 border-b bg-muted/20">
        <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Lock className="h-4 w-4 text-primary" /> Active Security Policy & Session Parameters
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Item 1 */}
        <div className="p-3 rounded border bg-card space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary" /> Session Max Duration
            </span>
            <Badge variant="outline" className="font-mono text-[10px]">30 Days</Badge>
          </div>
          <p className="text-[11px] text-muted-foreground">
            NextAuth database session tokens auto-expire after 30 days of inactivity.
          </p>
        </div>

        {/* Item 2 */}
        <div className="p-3 rounded border bg-card space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5 text-emerald-600" /> Authentication Strategy
            </span>
            <Badge variant="outline" className="text-[10px] text-emerald-700 bg-emerald-50 border-emerald-200">
              Google OAuth Only
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Password authentication is deprecated & disabled. Google SSO enforces multi-factor authentication.
          </p>
        </div>

        {/* Item 3 */}
        <div className="p-3 rounded border bg-card space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" /> Role-Based Access Control
            </span>
            <Badge variant="outline" className="text-[10px] text-indigo-700 bg-indigo-50 border-indigo-200">
              Granular RBAC Enabled
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Route access and server actions require explicit permission keys and role checks via auth-guard.
          </p>
        </div>

        {/* Item 4 */}
        <div className="p-3 rounded border bg-card space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-purple-600" /> Audit Log Enforcement
            </span>
            <Badge variant="outline" className="text-[10px] text-purple-700 bg-purple-50 border-purple-200">
              100% Action Tracing
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground">
            All administrative, academic, notification, and placement actions are logged to ActivityLog.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
