'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { 
  BookOpenCheck, 
  Plus, 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  Loader2 
} from 'lucide-react';
import { toast } from 'sonner';
import { ColumnDef } from '@tanstack/react-table';

import { DataTableLayout } from '@/components/layout/data-table-layout';
import { DataTable } from '@/components/shared/data-table';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConfirmationDialog } from '@/components/shared/confirmation-dialog';

import { CourseDialog } from '@/features/admin/courses/components/course-dialog';
import { 
  listCoursesAction, 
  deleteCourseAction 
} from '@/features/admin/courses/actions/course.actions';
import { listDepartmentsAction } from '@/features/admin/departments/actions/department.actions';

type CourseData = {
  id: string;
  name: string;
  credits: number;
  semester: number;
  departmentId: string;
  createdAt: Date;
  department: {
    id: string;
    name: string;
    code: string;
  };
};

type DepartmentData = {
  id: string;
  name: string;
  code: string;
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const [deptFilter, setDeptFilter] = useState<string>('ALL');

  // Dialogs state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseData | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Load initial data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [deptsResponse, coursesResponse] = await Promise.all([
        listDepartmentsAction({ limit: 100 }),
        listCoursesAction({ limit: 1000 }),
      ]);

      if (deptsResponse.success && deptsResponse.data) {
        setDepartments(deptsResponse.data.departments as DepartmentData[]);
      }

      if (coursesResponse.success && coursesResponse.data) {
        setCourses(coursesResponse.data.courses as CourseData[]);
      } else {
        toast.error(coursesResponse.message || 'Failed to load courses.');
      }
    } catch {
      toast.error('An error occurred while loading courses.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle delete
  const handleDelete = async () => {
    if (!selectedCourse) return;
    try {
      const response = await deleteCourseAction(selectedCourse.id);
      if (response.success) {
        toast.success(response.message);
        // Refresh only courses
        const coursesResponse = await listCoursesAction({ limit: 1000 });
        if (coursesResponse.success && coursesResponse.data) {
          setCourses(coursesResponse.data.courses as CourseData[]);
        }
      } else {
        toast.error(response.message || 'Failed to delete course.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete course.';
      toast.error(msg);
    } finally {
      setIsDeleteOpen(false);
      setSelectedCourse(null);
    }
  };

  // Filtered courses
  const filteredCourses = courses.filter((c) => {
    return deptFilter === 'ALL' || c.departmentId === deptFilter;
  });

  // Columns definition
  const columns: ColumnDef<CourseData>[] = [
    {
      accessorKey: 'name',
      header: 'Course Name',
      cell: ({ row }) => <span className="font-semibold text-foreground">{row.original.name}</span>,
    },
    {
      accessorKey: 'department.name',
      header: 'Department',
      cell: ({ row }) => (
        <span>
          {row.original.department.name} ({row.original.department.code})
        </span>
      ),
    },
    {
      accessorKey: 'credits',
      header: 'Credits',
      cell: ({ row }) => <span>{row.original.credits} XP</span>,
    },
    {
      accessorKey: 'semester',
      header: 'Semesters Count',
      cell: ({ row }) => <span>{row.original.semester} Semesters</span>,
    },
    {
      accessorKey: 'createdAt',
      header: 'Created On',
      cell: ({ row }) => <span>{new Date(row.original.createdAt).toLocaleDateString()}</span>,
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const course = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setSelectedCourse(course);
                  setIsDialogOpen(true);
                }}
                className="gap-2"
              >
                <Edit2 className="h-3.5 w-3.5" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedCourse(course);
                  setIsDeleteOpen(true);
                }}
                className="text-destructive gap-2 focus:text-destructive focus:bg-destructive/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <DataTableLayout
      title="Courses"
      description="Define academic programs and courses, assign program credits, and track course semesters."
      action={
        <Button size="sm" onClick={() => { setSelectedCourse(null); setIsDialogOpen(true); }} disabled={departments.length === 0}>
          <Plus className="mr-2 h-4 w-4" />
          Add Course
        </Button>
      }
    >
      <div className="mb-4 flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">Filter by Department:</span>
        <Select value={deptFilter} onValueChange={(val) => setDeptFilter(val || 'ALL')}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Departments</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.code}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex h-[200px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredCourses.length === 0 ? (
        <EmptyState
          icon={BookOpenCheck}
          title="No Courses Found"
          description="Get started by creating your first academic course."
          actionLabel="Create Course"
          onAction={() => { setSelectedCourse(null); setIsDialogOpen(true); }}
        />
      ) : (
        <DataTable
          columns={columns}
          data={filteredCourses}
          searchPlaceholder="Search courses by name..."
          searchColumn="name"
        />
      )}

      <CourseDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        course={selectedCourse}
        departments={departments}
        onSuccess={loadData}
      />

      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Course"
        description={`Are you sure you want to delete the course "${selectedCourse?.name}"? This action is permanent and cannot be undone.`}
        confirmLabel="Delete"
        isDestructive
        onConfirm={handleDelete}
      />
    </DataTableLayout>
  );
}
