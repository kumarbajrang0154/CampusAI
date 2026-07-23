'use client';

import * as React from 'react';
import { SemesterTerm, SemesterStatus } from '@prisma/client';
import { Plus, Search, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import { DataTableLayout } from '@/components/layout/data-table-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  SemesterTable,
  SemesterItem,
} from '@/features/admin/semesters/components/semester-table';
import { SemesterFormDialog } from '@/features/admin/semesters/components/semester-form-dialog';
import { SetCurrentSemesterDialog } from '@/features/admin/semesters/components/set-current-semester-dialog';
import { DeleteSemesterDialog } from '@/features/admin/semesters/components/delete-semester-dialog';
import { listSemestersAction } from '@/features/admin/semesters/actions/semester.actions';

export default function AdminSemestersPage() {
  const [semesters, setSemesters] = React.useState<SemesterItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('ALL');
  const [termFilter, setTermFilter] = React.useState<string>('ALL');

  // Modal states
  const [formOpen, setFormOpen] = React.useState(false);
  const [setCurrentOpen, setSetCurrentOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [selectedSemester, setSelectedSemester] = React.useState<SemesterItem | null>(null);

  const loadSemesters = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await listSemestersAction({
        search: search || undefined,
        status: statusFilter !== 'ALL' ? (statusFilter as SemesterStatus) : undefined,
        term: termFilter !== 'ALL' ? (termFilter as SemesterTerm) : undefined,
        limit: 100,
      });

      if (res.success && res.data) {
        setSemesters(res.data.items as SemesterItem[]);
      } else {
        toast.error(res.message || 'Failed to load semesters.');
      }
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Error loading semesters.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, termFilter]);

  React.useEffect(() => {
    loadSemesters();
  }, [loadSemesters]);

  const handleCreate = () => {
    setSelectedSemester(null);
    setFormOpen(true);
  };

  const handleEdit = (semester: SemesterItem) => {
    setSelectedSemester(semester);
    setFormOpen(true);
  };

  const handleSetCurrent = (semester: SemesterItem) => {
    setSelectedSemester(semester);
    setSetCurrentOpen(true);
  };

  const handleDelete = (semester: SemesterItem) => {
    setSelectedSemester(semester);
    setDeleteOpen(true);
  };

  return (
    <DataTableLayout
      title="Semester Management"
      description="Define academic terms, active current semesters, and academic year schedules."
      action={
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Add Semester
        </Button>
      }
    >
      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pb-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search semesters or academic years..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={(val) => val && setStatusFilter(val)}>
            <SelectTrigger className="h-9 text-xs w-[140px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value={SemesterStatus.ACTIVE}>Active</SelectItem>
              <SelectItem value={SemesterStatus.UPCOMING}>Upcoming</SelectItem>
              <SelectItem value={SemesterStatus.COMPLETED}>Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={termFilter} onValueChange={(val) => val && setTermFilter(val)}>
            <SelectTrigger className="h-9 text-xs w-[120px]">
              <SelectValue placeholder="All Terms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Terms</SelectItem>
              <SelectItem value={SemesterTerm.ODD}>ODD</SelectItem>
              <SelectItem value={SemesterTerm.EVEN}>EVEN</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={loadSemesters}>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* Table view */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-xs text-muted-foreground border rounded-md bg-card">
          <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" /> Loading semesters...
        </div>
      ) : (
        <SemesterTable
          data={semesters}
          onEdit={handleEdit}
          onSetCurrent={handleSetCurrent}
          onDelete={handleDelete}
        />
      )}

      {/* Dialogs */}
      <SemesterFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        semesterToEdit={selectedSemester}
        onSuccess={loadSemesters}
      />

      <SetCurrentSemesterDialog
        open={setCurrentOpen}
        onOpenChange={setSetCurrentOpen}
        semester={selectedSemester}
        onSuccess={loadSemesters}
      />

      <DeleteSemesterDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        semester={selectedSemester}
        onSuccess={loadSemesters}
      />
    </DataTableLayout>
  );
}
