'use client';

import * as React from 'react';
import Link from 'next/link';
import { FolderTree, Calendar, ArrowRight } from 'lucide-react';

import { DataTableLayout } from '@/components/layout/data-table-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminAcademicsPage() {
  return (
    <DataTableLayout
      title="Academic Management"
      description="Central management hub for institution terms, academic calendar events, and curriculum schedules."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <Card className="hover:border-primary/40 transition-all shadow-xs">
          <CardHeader>
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary w-fit mb-2">
              <FolderTree className="h-6 w-6" />
            </div>
            <CardTitle className="text-lg">Semesters Management</CardTitle>
            <CardDescription>
              Configure academic terms, ODD/EVEN terms, date ranges, and mark the active institution semester.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button render={<Link href="/admin/semesters" className="gap-2" />}>
              Manage Semesters <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/40 transition-all shadow-xs">
          <CardHeader>
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary w-fit mb-2">
              <Calendar className="h-6 w-6" />
            </div>
            <CardTitle className="text-lg">Academic Calendar</CardTitle>
            <CardDescription>
              Schedule holidays, exam weeks, orientation dates, and publish calendar events across departments.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button render={<Link href="/admin/academics/calendar" className="gap-2" />}>
              Manage Calendar <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </DataTableLayout>
  );
}
