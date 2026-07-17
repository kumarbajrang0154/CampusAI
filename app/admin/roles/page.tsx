'use client';

import * as React from 'react';
import { Shield } from 'lucide-react';

import { DataTableLayout } from '@/components/layout/data-table-layout';
import { EmptyState } from '@/components/shared/empty-state';

export default function Page() {
  return (
    <DataTableLayout
      title="Roles & RBAC"
      description="This module is currently under development."
    >
      <EmptyState
        icon={Shield}
        title="Not Yet Implemented"
        description="The Roles & RBAC features are scheduled for development in a future stage."
      />
    </DataTableLayout>
  );
}
