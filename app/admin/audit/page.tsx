'use client';

import * as React from 'react';
import { ShieldCheck, LogIn, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ActivityLogTable } from '@/features/admin/audit/components/activity-log-table';
import { LoginHistoryTable } from '@/features/admin/audit/components/login-history-table';

export default function AdminAuditPage() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="border-b pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" /> Audit Logs & Security Trail
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Inspect full activity audit trails, system modifications, administrative actions, and user login history.
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList className="bg-muted/60 p-1">
          <TabsTrigger value="activity" className="gap-2 text-xs font-semibold">
            <FileText className="h-4 w-4" /> Activity Audit Trail
          </TabsTrigger>
          <TabsTrigger value="login-history" className="gap-2 text-xs font-semibold">
            <LogIn className="h-4 w-4" /> User Login History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="m-0">
          <ActivityLogTable />
        </TabsContent>

        <TabsContent value="login-history" className="m-0">
          <LoginHistoryTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
