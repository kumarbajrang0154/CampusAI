'use client';

import * as React from 'react';
import { Activity } from 'lucide-react';

import { DataTableLayout } from '@/components/layout/data-table-layout';
import { EmptyState } from '@/components/shared/empty-state';

export default function Page() {
  return (
    <DataTableLayout
      title="Audit Logs"
      description="This module is currently under development."
    >
      <EmptyState
        icon={Activity}
        title="Not Yet Implemented"
        description="The Audit Logs features are scheduled for development in a future stage."
      />
    </DataTableLayout>
  );
}
