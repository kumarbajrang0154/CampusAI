'use client';

import * as React from 'react';
import { BookOpenCheck } from 'lucide-react';

import { DataTableLayout } from '@/components/layout/data-table-layout';
import { EmptyState } from '@/components/shared/empty-state';

export default function Page() {
  return (
    <DataTableLayout
      title="Courses"
      description="This module is currently under development."
    >
      <EmptyState
        icon={BookOpenCheck}
        title="Not Yet Implemented"
        description="The Courses features are scheduled for development in a future stage."
      />
    </DataTableLayout>
  );
}
