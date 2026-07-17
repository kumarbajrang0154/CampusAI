'use client';

import * as React from 'react';
import { Briefcase } from 'lucide-react';

import { DataTableLayout } from '@/components/layout/data-table-layout';
import { EmptyState } from '@/components/shared/empty-state';

export default function Page() {
  return (
    <DataTableLayout
      title="Placement"
      description="This module is currently under development."
    >
      <EmptyState
        icon={Briefcase}
        title="Not Yet Implemented"
        description="The Placement features are scheduled for development in a future stage."
      />
    </DataTableLayout>
  );
}
