'use client';

import * as React from 'react';
import { Users } from 'lucide-react';

import { DataTableLayout } from '@/components/layout/data-table-layout';
import { EmptyState } from '@/components/shared/empty-state';

export default function Page() {
  return (
    <DataTableLayout
      title="User Accounts"
      description="This module is currently under development."
    >
      <EmptyState
        icon={Users}
        title="Not Yet Implemented"
        description="The User Accounts features are scheduled for development in a future stage."
      />
    </DataTableLayout>
  );
}
