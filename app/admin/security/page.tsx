'use client';

import * as React from 'react';
import { ShieldAlert } from 'lucide-react';

import { DataTableLayout } from '@/components/layout/data-table-layout';
import { EmptyState } from '@/components/shared/empty-state';

export default function Page() {
  return (
    <DataTableLayout
      title="Security Logs"
      description="This module is currently under development."
    >
      <EmptyState
        icon={ShieldAlert}
        title="Not Yet Implemented"
        description="The Security Logs features are scheduled for development in a future stage."
      />
    </DataTableLayout>
  );
}
