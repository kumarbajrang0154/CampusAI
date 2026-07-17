'use client';

import * as React from 'react';
import { CalendarCheck } from 'lucide-react';

import { DataTableLayout } from '@/components/layout/data-table-layout';
import { EmptyState } from '@/components/shared/empty-state';

export default function Page() {
  return (
    <DataTableLayout
      title="Attendance"
      description="This module is currently under development."
    >
      <EmptyState
        icon={CalendarCheck}
        title="Not Yet Implemented"
        description="The Attendance features are scheduled for development in a future stage."
      />
    </DataTableLayout>
  );
}
