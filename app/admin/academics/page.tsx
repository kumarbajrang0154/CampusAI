'use client';

import * as React from 'react';
import { GraduationCap } from 'lucide-react';

import { DataTableLayout } from '@/components/layout/data-table-layout';
import { EmptyState } from '@/components/shared/empty-state';

export default function Page() {
  return (
    <DataTableLayout
      title="Academics"
      description="This module is currently under development."
    >
      <EmptyState
        icon={GraduationCap}
        title="Not Yet Implemented"
        description="The Academics features are scheduled for development in a future stage."
      />
    </DataTableLayout>
  );
}
