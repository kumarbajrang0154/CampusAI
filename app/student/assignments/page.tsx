'use client';

import * as React from 'react';
import { FileText } from 'lucide-react';

import { DataTableLayout } from '@/components/layout/data-table-layout';
import { EmptyState } from '@/components/shared/empty-state';

export default function Page() {
  return (
    <DataTableLayout
      title="Assignments"
      description="This module is currently under development."
    >
      <EmptyState
        icon={FileText}
        title="Not Yet Implemented"
        description="The Assignments features are scheduled for development in a future stage."
      />
    </DataTableLayout>
  );
}
