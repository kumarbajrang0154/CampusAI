'use client';

import * as React from 'react';
import { useState } from 'react';
import { Shield, UserCheck } from 'lucide-react';

import { DataTableLayout } from '@/components/layout/data-table-layout';
import { RoleMatrixTable } from '@/features/admin/roles/components/role-matrix-table';
import { UserOverrideManager } from '@/features/admin/roles/components/user-override-manager';

export default function AdminRolesPage() {
  const [activeTab, setActiveTab] = useState<'matrix' | 'overrides'>('matrix');

  return (
    <DataTableLayout
      title="Roles & Permission Management"
      description="Configure role-default permission matrices and manage per-user access overrides."
    >
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'matrix'
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Shield className="h-4 w-4" />
            Role Permission Matrix
          </button>

          <button
            onClick={() => setActiveTab('overrides')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'overrides'
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <UserCheck className="h-4 w-4" />
            Per-User Permission Overrides
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'matrix' ? (
          <RoleMatrixTable />
        ) : (
          <UserOverrideManager />
        )}
      </div>
    </DataTableLayout>
  );
}
