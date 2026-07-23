'use client';

import * as React from 'react';
import Link from 'next/link';
import { Briefcase, Building2, Code2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PlacementKpiCards } from '@/features/admin/placement/components/placement-kpi-cards';
import { DriveManagementTab } from '@/features/admin/placement/components/drive-management-tab';
import { CompanyManagementTab } from '@/features/admin/placement/components/company-management-tab';

export default function AdminPlacementPage() {
  const [statsRefreshKey, setStatsRefreshKey] = React.useState(0);

  const handleDriveUpdated = () => {
    setStatsRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header & Overview */}
      <div className="border-b pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" /> Placement Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage corporate recruiters, publish campus drives, track applicant pipelines, and manage DSA problem bank.
          </p>
        </div>
        <Button render={<Link href="/admin/placement/problems" className="gap-2 text-xs" />} variant="outline">
          <Code2 className="h-4 w-4" /> DSA Problem Bank
        </Button>
      </div>

      {/* KPI Overview Cards */}
      <PlacementKpiCards key={statsRefreshKey} />

      {/* Module Tabs: Placement Drives & Companies */}
      <Tabs defaultValue="drives" className="space-y-4">
        <TabsList className="bg-muted/60 p-1">
          <TabsTrigger value="drives" className="gap-2 text-xs font-semibold">
            <Briefcase className="h-4 w-4" /> Placement Drives
          </TabsTrigger>
          <TabsTrigger value="companies" className="gap-2 text-xs font-semibold">
            <Building2 className="h-4 w-4" /> Recruiting Companies
          </TabsTrigger>
        </TabsList>

        <TabsContent value="drives" className="m-0">
          <DriveManagementTab onDriveUpdated={handleDriveUpdated} />
        </TabsContent>

        <TabsContent value="companies" className="m-0">
          <CompanyManagementTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
