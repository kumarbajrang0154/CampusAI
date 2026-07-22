'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Loader2, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  FileText, 
  Layers 
} from 'lucide-react';
import { toast } from 'sonner';
import { ColumnDef } from '@tanstack/react-table';
import { TimetableStatus } from '@prisma/client';

import { DataTableLayout } from '@/components/layout/data-table-layout';
import { DataTable } from '@/components/shared/data-table';
import { EmptyState } from '@/components/shared/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/shared/confirmation-dialog';

import { CreateTimetableDialog } from '@/features/admin/timetable/components/create-timetable-dialog';
import { PeriodSettingsDialog } from '@/features/admin/timetable/components/period-settings-dialog';
import { TimetableGridEditor } from '@/features/admin/timetable/components/timetable-grid-editor';
import { 
  listTimetablesAction, 
  toggleTimetableStatusAction, 
  deleteTimetableAction 
} from '@/features/admin/timetable/actions/timetable.actions';

type TimetableItem = {
  id: string;
  departmentId: string;
  semester: number;
  section: string;
  academicYear: string;
  status: TimetableStatus;
  createdAt: Date;
  department: {
    name: string;
    code: string;
  };
  _count: {
    slots: number;
  };
};

export default function AdminTimetablePage() {
  const [timetables, setTimetables] = useState<TimetableItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTimetableId, setActiveTimetableId] = useState<string | null>(null);

  // Dialog states
  const [periodSettingsOpen, setPeriodSettingsOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TimetableItem | null>(null);

  const loadTimetables = async () => {
    setIsLoading(true);
    try {
      const res = await listTimetablesAction({ limit: 100 });
      if (res.success && res.data) {
        setTimetables(res.data.timetables);
      } else {
        toast.error(res.message || 'Failed to load timetables.');
      }
    } catch {
      toast.error('An error occurred loading timetables.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTimetables();
  }, []);

  const handleToggleStatus = async (item: TimetableItem) => {
    try {
      const res = await toggleTimetableStatusAction(item.id);
      if (res.success) {
        toast.success(res.message);
        loadTimetables();
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error('Failed to change status.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await deleteTimetableAction(deleteTarget.id);
      if (res.success) {
        toast.success('Timetable deleted.');
        loadTimetables();
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error('Failed to delete timetable.');
    } finally {
      setDeleteTarget(null);
    }
  };

  if (activeTimetableId) {
    return (
      <DataTableLayout
        title="Smart Timetable Builder"
        description="Manual grid assignment with real-time faculty and classroom conflict detection."
      >
        <TimetableGridEditor
          timetableId={activeTimetableId}
          onBack={() => {
            setActiveTimetableId(null);
            loadTimetables();
          }}
        />
      </DataTableLayout>
    );
  }

  const columns: ColumnDef<TimetableItem>[] = [
    {
      accessorKey: 'department',
      header: 'Department',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-medium text-foreground">{item.department.name}</span>
            <span className="text-xs text-muted-foreground">Code: {item.department.code}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'semester',
      header: 'Semester & Section',
      cell: ({ row }) => (
        <span className="font-medium">
          Semester {row.original.semester} (Section {row.original.section})
        </span>
      ),
    },
    {
      accessorKey: 'academicYear',
      header: 'Academic Year',
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.academicYear}</span>,
    },
    {
      accessorKey: 'slots',
      header: 'Assigned Slots',
      cell: ({ row }) => (
        <Badge variant="outline" className="gap-1">
          <Layers className="h-3 w-3" />
          {row.original._count.slots} Slots
        </Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        return status === TimetableStatus.PUBLISHED ? (
          <Badge variant="default" className="bg-emerald-600 text-white hover:bg-emerald-700 gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Published
          </Badge>
        ) : (
          <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20 gap-1">
            <FileText className="h-3 w-3" />
            Draft
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="xs"
              onClick={() => setActiveTimetableId(item.id)}
            >
              <Edit3 className="mr-1 h-3.5 w-3.5" />
              Edit Grid
            </Button>

            <Button
              variant="outline"
              size="xs"
              onClick={() => handleToggleStatus(item)}
            >
              {item.status === TimetableStatus.PUBLISHED ? 'Unpublish' : 'Publish'}
            </Button>

            <Button
              variant="ghost"
              size="icon-xs"
              className="text-destructive hover:bg-destructive/10"
              onClick={() => setDeleteTarget(item)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <DataTableLayout
      title="Smart Timetable Management"
      description="Configure period timings, create section timetables, and assign conflict-free period schedules."
      action={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPeriodSettingsOpen(true)}>
            <Clock className="mr-1.5 h-4 w-4" />
            Configure Periods
          </Button>

          <CreateTimetableDialog
            onSuccess={(id) => {
              setActiveTimetableId(id);
              loadTimetables();
            }}
          />
        </div>
      }
    >
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center rounded-md border border-dashed bg-card">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Loading timetables...</span>
          </div>
        ) : timetables.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No Timetables Found"
            description="No timetables have been created yet. Click 'Create Timetable' to build a new draft schedule."
          />
        ) : (
          <DataTable columns={columns} data={timetables} />
        )}
      </div>

      {/* Period Settings Dialog */}
      <PeriodSettingsDialog
        isOpen={periodSettingsOpen}
        onOpenChange={setPeriodSettingsOpen}
        onSuccess={loadTimetables}
      />

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <ConfirmationDialog
          isOpen={true}
          onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
          title="Delete Timetable?"
          description={`Are you sure you want to delete the timetable for ${deleteTarget.department.name} (Semester ${deleteTarget.semester}, Section ${deleteTarget.section})? All assigned period slots will be permanently removed.`}
          confirmLabel="Delete Timetable"
          onConfirm={handleDelete}
          isDestructive={true}
        />
      )}
    </DataTableLayout>
  );
}
