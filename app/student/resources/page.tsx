'use client';

import * as React from 'react';
import { BookOpen } from 'lucide-react';

import { DataTableLayout } from '@/components/layout/data-table-layout';
import { EmptyState } from '@/components/shared/empty-state';

export default function Page() {
  return (
    <DataTableLayout
      title="Learning Resources"
      description="This module is currently under development."
    >
      <EmptyState
        icon={BookOpen}
        title="Not Yet Implemented"
        description="The Learning Resources features are scheduled for development in a future stage."
      />
    </DataTableLayout>
  );
}
