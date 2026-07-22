'use client';

import * as React from 'react';
import { Users, Building2, Award, CalendarCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ExecutiveKpiSummaryProps {
  totalUsers: number;
  departmentsCount: number;
  coursesCount: number;
  subjectsCount: number;
  classroomsCount: number;
  selectionRate: number;
  averagePackageLPA: number;
  publishedTimetables: number;
  totalDepartments: number;
  loading?: boolean;
}

export function ExecutiveKpiSummary({
  totalUsers,
  departmentsCount,
  coursesCount,
  subjectsCount,
  classroomsCount,
  selectionRate,
  averagePackageLPA,
  publishedTimetables,
  totalDepartments,
  loading = false,
}: ExecutiveKpiSummaryProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Users */}
      <Card className="shadow-none border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Total Users
          </CardTitle>
          <Users className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {loading ? '...' : totalUsers}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Across 4 CampusAI Roles</p>
        </CardContent>
      </Card>

      {/* Academic Structure */}
      <Card className="shadow-none border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Academic Infrastructure
          </CardTitle>
          <Building2 className="h-4 w-4 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {loading ? '...' : `${departmentsCount} Depts`}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {coursesCount} Courses • {subjectsCount} Subjects • {classroomsCount} Rooms
          </p>
        </CardContent>
      </Card>

      {/* Placement Performance */}
      <Card className="shadow-none border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Placement Selection Rate
          </CardTitle>
          <Award className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {loading ? '...' : `${selectionRate}%`}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Avg Package: {loading ? '...' : `₹${averagePackageLPA} LPA`}
          </p>
        </CardContent>
      </Card>

      {/* Timetable Schedules */}
      <Card className="shadow-none border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Published Timetables
          </CardTitle>
          <CalendarCheck className="h-4 w-4 text-indigo-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {loading ? '...' : publishedTimetables}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Active Published Timetable Grids
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
