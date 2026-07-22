'use client';

import * as React from 'react';
import { ShieldAlert } from 'lucide-react';
import { ActiveSessionsTable } from '@/features/admin/security/components/active-sessions-table';
import { LoginSecuritySummary } from '@/features/admin/security/components/login-security-summary';
import { OAuthHealthPanel } from '@/features/admin/security/components/oauth-health-panel';
import { SecurityConfigPanel } from '@/features/admin/security/components/security-config-panel';

export default function AdminSecurityPage() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="border-b pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-primary" /> Security & Access Management
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor active user sessions, force-revoke session tokens, review login security metrics, and check OAuth health.
        </p>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Sessions List (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <ActiveSessionsTable />
        </div>

        {/* Login Security Summary (1 Col) */}
        <div className="space-y-4">
          <LoginSecuritySummary />
        </div>
      </div>

      {/* Bottom Health & Policy Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        <OAuthHealthPanel />
        <SecurityConfigPanel />
      </div>
    </div>
  );
}
