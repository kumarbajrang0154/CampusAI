'use client';

import * as React from 'react';
import { ListChecks } from 'lucide-react';

import { DataTableLayout } from '@/components/layout/data-table-layout';
import { EmptyState } from '@/components/shared/empty-state';

export default function Page() {
  return (
    <DataTableLayout
      title="Quizzes"
      description="This module is currently under development."
    >
      <EmptyState
        icon={ListChecks}
        title="Not Yet Implemented"
        description="The Quizzes features are scheduled for development in a future stage."
      />
    </DataTableLayout>
  );
}
