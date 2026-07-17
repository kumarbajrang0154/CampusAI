'use client';

import * as React from 'react';
import { Calendar } from 'lucide-react';

import { DataTableLayout } from '@/components/layout/data-table-layout';
import { EmptyState } from '@/components/shared/empty-state';

export default function Page() {
  return (
    <DataTableLayout
      title="Timetable"
      description="This module is currently under development."
    >
      <EmptyState
        icon={Calendar}
        title="Not Yet Implemented"
        description="The Timetable features are scheduled for development in a future stage."
      />
    </DataTableLayout>
  );
}
