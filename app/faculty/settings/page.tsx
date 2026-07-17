'use client';

import * as React from 'react';
import { Settings } from 'lucide-react';

import { DataTableLayout } from '@/components/layout/data-table-layout';
import { EmptyState } from '@/components/shared/empty-state';

export default function Page() {
  return (
    <DataTableLayout
      title="Settings"
      description="This module is currently under development."
    >
      <EmptyState
        icon={Settings}
        title="Not Yet Implemented"
        description="The Settings features are scheduled for development in a future stage."
      />
    </DataTableLayout>
  );
}
