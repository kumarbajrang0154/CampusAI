'use client';

import * as React from 'react';
import { Building } from 'lucide-react';

import { DataTableLayout } from '@/components/layout/data-table-layout';
import { EmptyState } from '@/components/shared/empty-state';

export default function Page() {
  return (
    <DataTableLayout
      title="Departments"
      description="This module is currently under development."
    >
      <EmptyState
        icon={Building}
        title="Not Yet Implemented"
        description="The Departments features are scheduled for development in a future stage."
      />
    </DataTableLayout>
  );
}
