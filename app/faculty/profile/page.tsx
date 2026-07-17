'use client';

import * as React from 'react';
import { User } from 'lucide-react';

import { DataTableLayout } from '@/components/layout/data-table-layout';
import { EmptyState } from '@/components/shared/empty-state';

export default function Page() {
  return (
    <DataTableLayout
      title="User Profile"
      description="This module is currently under development."
    >
      <EmptyState
        icon={User}
        title="Not Yet Implemented"
        description="The User Profile features are scheduled for development in a future stage."
      />
    </DataTableLayout>
  );
}
