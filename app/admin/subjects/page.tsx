'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { 
  BookOpen, 
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

import { SubjectDialog } from '@/features/admin/subjects/components/subject-dialog';
import { 
  listSubjectsAction, 
  deleteSubjectAction,
  assignFacultyAction,
  listFacultyAction
} from '@/features/admin/subjects/actions/subject.actions';
import { listCoursesAction } from '@/features/admin/courses/actions/course.actions';

type SubjectData = {
  id: string;
  name: string;
  code: string;
  courseId: string;
  facultyId: string | null;
  createdAt: Date;
  course: {
    id: string;
    name: string;
  };
  faculty: {
    id: string;
    employeeId: string;
    user: {
      name: string | null;
      email: string;
    };
  } | null;
};

type CourseData = {
  id: string;
  name: string;
};

type FacultyData = {
  id: string;
  employeeId: string;
  user: {
    name: string | null;
    email: string;
  };
};

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [facultyList, setFacultyList] = useState<FacultyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const [courseFilter, setCourseFilter] = useState<string>('ALL');

  // Dialogs state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<SubjectData | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Load initial data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [coursesResponse, facultyResponse, subjectsResponse] = await Promise.all([
        listCoursesAction({ limit: 100 }),
        listFacultyAction(),
        listSubjectsAction({ limit: 1000 }),
      ]);

      if (coursesResponse.success && coursesResponse.data) {
        setCourses(coursesResponse.data.courses as CourseData[]);
      }

      if (facultyResponse.success && facultyResponse.data) {
        setFacultyList(facultyResponse.data as FacultyData[]);
      }

      if (subjectsResponse.success && subjectsResponse.data) {
        setSubjects(subjectsResponse.data.subjects as SubjectData[]);
      } else {
        toast.error(subjectsResponse.message || 'Failed to load subjects.');
      }
    } catch {
      toast.error('An error occurred while loading subjects.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle delete
  const handleDelete = async () => {
    if (!selectedSubject) return;
    try {
      const response = await deleteSubjectAction(selectedSubject.id);
      if (response.success) {
        toast.success(response.message);
        // Refresh only subjects
        const subjectsResponse = await listSubjectsAction({ limit: 1000 });
        if (subjectsResponse.success && subjectsResponse.data) {
          setSubjects(subjectsResponse.data.subjects as SubjectData[]);
        }
      } else {
        toast.error(response.message || 'Failed to delete subject.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete subject.';
      toast.error(msg);
    } finally {
      setIsDeleteOpen(false);
      setSelectedSubject(null);
    }
  };

  // Handle inline faculty assignment
  const handleAssignFaculty = async (subjectId: string, facultyId: string) => {
    const finalFacultyId = facultyId === 'UNASSIGNED' ? null : facultyId;
    try {
      const response = await assignFacultyAction(subjectId, finalFacultyId);
      if (response.success) {
        toast.success(response.message);
        // Refresh subjects list
        const subjectsResponse = await listSubjectsAction({ limit: 1000 });
        if (subjectsResponse.success && subjectsResponse.data) {
          setSubjects(subjectsResponse.data.subjects as SubjectData[]);
        }
      } else {
        toast.error(response.message || 'Failed to assign teacher.');
      }
    } catch {
      toast.error('An error occurred during assignment.');
    }
  };

  // Filtered subjects
  const filteredSubjects = subjects.filter((s) => {
    return courseFilter === 'ALL' || s.courseId === courseFilter;
  });

  // Columns definition
  const columns: ColumnDef<SubjectData>[] = [
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => <span className="font-semibold text-foreground">{row.original.code}</span>,
    },
    {
      accessorKey: 'name',
      header: 'Subject Name',
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: 'course.name',
      header: 'Course',
      cell: ({ row }) => <span>{row.original.course.name}</span>,
    },
    {
      accessorKey: 'facultyId',
      header: 'Assigned Teacher (Inline Edit)',
      cell: ({ row }) => {
        const sub = row.original;
        return (
          <div className="w-[200px]">
            <Select
              value={sub.facultyId || 'UNASSIGNED'}
              onValueChange={(val) => handleAssignFaculty(sub.id, val || 'UNASSIGNED')}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="No Teacher Assigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UNASSIGNED">No Teacher Assigned</SelectItem>
                {facultyList.map((fac) => (
                  <SelectItem key={fac.id} value={fac.id}>
                    {fac.user.name || fac.user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created On',
      cell: ({ row }) => <span>{new Date(row.original.createdAt).toLocaleDateString()}</span>,
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const sub = row.original;
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
                  setSelectedSubject(sub);
                  setIsDialogOpen(true);
                }}
                className="gap-2"
              >
                <Edit2 className="h-3.5 w-3.5" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedSubject(sub);
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
      title="Subjects"
      description="Manage subject course curriculums, code structures, and assign teachers to study modules."
      action={
        <Button size="sm" onClick={() => { setSelectedSubject(null); setIsDialogOpen(true); }} disabled={courses.length === 0}>
          <Plus className="mr-2 h-4 w-4" />
          Add Subject
        </Button>
      }
    >
      <div className="mb-4 flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">Filter by Course:</span>
        <Select value={courseFilter} onValueChange={(val) => setCourseFilter(val || 'ALL')}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Courses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Courses</SelectItem>
            {courses.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name.length > 30 ? c.name.slice(0, 30) + '...' : c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex h-[200px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredSubjects.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No Subjects Found"
          description="Get started by creating your first subject curriculum."
          actionLabel="Create Subject"
          onAction={() => { setSelectedSubject(null); setIsDialogOpen(true); }}
        />
      ) : (
        <DataTable
          columns={columns}
          data={filteredSubjects}
          searchPlaceholder="Search subjects by name or code..."
          searchColumn="name"
        />
      )}

      <SubjectDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        subject={selectedSubject}
        courses={courses}
        facultyList={facultyList}
        onSuccess={loadData}
      />

      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Subject"
        description={`Are you sure you want to delete the subject "${selectedSubject?.name}"? This action is permanent and cannot be undone.`}
        confirmLabel="Delete"
        isDestructive
        onConfirm={handleDelete}
      />
    </DataTableLayout>
  );
}
