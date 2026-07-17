'use client';

import * as React from 'react';
import { Brain } from 'lucide-react';

import { DataTableLayout } from '@/components/layout/data-table-layout';
import { EmptyState } from '@/components/shared/empty-state';

export default function Page() {
  return (
    <DataTableLayout
      title="AI Study Assistant"
      description="This module is currently under development."
    >
      <EmptyState
        icon={Brain}
        title="Not Yet Implemented"
        description="The AI Study Assistant features are scheduled for development in a future stage."
      />
    </DataTableLayout>
  );
}
