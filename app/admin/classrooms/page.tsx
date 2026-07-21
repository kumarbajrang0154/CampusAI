'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { 
  Building, 
  Plus, 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  Loader2 
} from 'lucide-react';
import { toast } from 'sonner';
import { ColumnDef } from '@tanstack/react-table';
import { ClassroomType } from '@prisma/client';

import { DataTableLayout } from '@/components/layout/data-table-layout';
import { DataTable } from '@/components/shared/data-table';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmationDialog } from '@/components/shared/confirmation-dialog';

import { ClassroomDialog } from '@/features/admin/classrooms/components/classroom-dialog';
import { 
  listClassroomsAction, 
  deleteClassroomAction 
} from '@/features/admin/classrooms/actions/classroom.actions';

type ClassroomData = {
  id: string;
  roomNumber: string;
  capacity: number;
  type: ClassroomType;
  createdAt: Date;
};

export default function ClassroomsPage() {
  const [classrooms, setClassrooms] = useState<ClassroomData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dialogs state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<ClassroomData | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Fetch classrooms
  const loadClassrooms = async () => {
    setIsLoading(true);
    try {
      const response = await listClassroomsAction({ limit: 100 });
      if (response.success && response.data) {
        setClassrooms(response.data.classrooms as ClassroomData[]);
      } else {
        toast.error(response.message || 'Failed to load classrooms.');
      }
    } catch {
      toast.error('An error occurred while loading classrooms.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClassrooms();
  }, []);

  // Handle delete
  const handleDelete = async () => {
    if (!selectedRoom) return;
    try {
      const response = await deleteClassroomAction(selectedRoom.id);
      if (response.success) {
        toast.success(response.message);
        loadClassrooms();
      } else {
        toast.error(response.message || 'Failed to delete classroom.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete classroom.';
      toast.error(msg);
    } finally {
      setIsDeleteOpen(false);
      setSelectedRoom(null);
    }
  };

  // Columns definition
  const columns: ColumnDef<ClassroomData>[] = [
    {
      accessorKey: 'roomNumber',
      header: 'Room Number',
      cell: ({ row }) => <span className="font-semibold text-foreground">{row.original.roomNumber}</span>,
    },
    {
      accessorKey: 'type',
      header: 'Room Type',
      cell: ({ row }) => {
        const type = row.original.type;
        switch (type) {
          case ClassroomType.LECTURE_HALL:
            return <Badge variant="default">Lecture Hall</Badge>;
          case ClassroomType.LAB:
            return <Badge variant="secondary" className="bg-purple-600 text-white hover:bg-purple-700">Lab Room</Badge>;
          case ClassroomType.SEMINAR_ROOM:
            return <Badge variant="outline">Seminar Room</Badge>;
          default:
            return <Badge variant="outline">{type}</Badge>;
        }
      },
    },
    {
      accessorKey: 'capacity',
      header: 'Capacity (Seats)',
      cell: ({ row }) => <span>{row.original.capacity} Seats</span>,
    },
    {
      accessorKey: 'createdAt',
      header: 'Created On',
      cell: ({ row }) => <span>{new Date(row.original.createdAt).toLocaleDateString()}</span>,
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const room = row.original;
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
                  setSelectedRoom(room);
                  setIsDialogOpen(true);
                }}
                className="gap-2"
              >
                <Edit2 className="h-3.5 w-3.5" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedRoom(room);
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
      title="Classroom Settings"
      description="Manage campus classrooms, lab facilities, seminar spaces, and seating capacities."
      action={
        <Button size="sm" onClick={() => { setSelectedRoom(null); setIsDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Classroom
        </Button>
      }
    >
      {isLoading ? (
        <div className="flex h-[200px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : classrooms.length === 0 ? (
        <EmptyState
          icon={Building}
          title="No Classrooms Found"
          description="Get started by creating your first classroom facility."
          actionLabel="Create Classroom"
          onAction={() => { setSelectedRoom(null); setIsDialogOpen(true); }}
        />
      ) : (
        <DataTable
          columns={columns}
          data={classrooms}
          searchPlaceholder="Search classrooms by room number..."
          searchColumn="roomNumber"
        />
      )}

      <ClassroomDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        classroom={selectedRoom}
        onSuccess={loadClassrooms}
      />

      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Classroom"
        description={`Are you sure you want to delete the room "${selectedRoom?.roomNumber}"? This action is permanent and cannot be undone.`}
        confirmLabel="Delete"
        isDestructive
        onConfirm={handleDelete}
      />
    </DataTableLayout>
  );
}
