'use client';

import * as React from 'react';
import { FolderTree } from 'lucide-react';

import { DataTableLayout } from '@/components/layout/data-table-layout';
import { EmptyState } from '@/components/shared/empty-state';

export default function Page() {
  return (
    <DataTableLayout
      title="Semesters"
      description="This module is currently under development."
    >
      <EmptyState
        icon={FolderTree}
        title="Not Yet Implemented"
        description="The Semesters features are scheduled for development in a future stage."
      />
    </DataTableLayout>
  );
}
