'use client';

import * as React from 'react';
import { AcademicEventType } from '@prisma/client';
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
  AcademicCalendarTable,
  CalendarItem,
} from '@/features/admin/academic-calendar/components/academic-calendar-table';
import { AcademicCalendarFormDialog } from '@/features/admin/academic-calendar/components/academic-calendar-form-dialog';
import { DeleteAcademicCalendarDialog } from '@/features/admin/academic-calendar/components/delete-academic-calendar-dialog';
import {
  listCalendarEntriesAction,
  toggleCalendarPublishAction,
} from '@/features/admin/academic-calendar/actions/academic-calendar.actions';
import { listSemestersAction } from '@/features/admin/semesters/actions/semester.actions';

export default function AdminAcademicCalendarPage() {
  const [entries, setEntries] = React.useState<CalendarItem[]>([]);
  const [semesters, setSemesters] = React.useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [semesterFilter, setSemesterFilter] = React.useState<string>('ALL');
  const [typeFilter, setTypeFilter] = React.useState<string>('ALL');

  // Modal states
  const [formOpen, setFormOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [selectedEntry, setSelectedEntry] = React.useState<CalendarItem | null>(null);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [resEntries, resSemesters] = await Promise.all([
        listCalendarEntriesAction({
          search: search || undefined,
          semesterId: semesterFilter !== 'ALL' ? semesterFilter : undefined,
          eventType: typeFilter !== 'ALL' ? (typeFilter as AcademicEventType) : undefined,
          limit: 200,
        }),
        listSemestersAction({ limit: 100 }),
      ]);

      if (resEntries.success && resEntries.data) {
        setEntries(resEntries.data.items as CalendarItem[]);
      } else {
        toast.error(resEntries.message || 'Failed to load calendar events.');
      }

      if (resSemesters.success && resSemesters.data) {
        setSemesters(resSemesters.data.items.map((s: { id: string; name: string }) => ({ id: s.id, name: s.name })));
      }
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Error loading academic calendar.');
    } finally {
      setLoading(false);
    }
  }, [search, semesterFilter, typeFilter]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = () => {
    setSelectedEntry(null);
    setFormOpen(true);
  };

  const handleEdit = (entry: CalendarItem) => {
    setSelectedEntry(entry);
    setFormOpen(true);
  };

  const handleTogglePublish = async (entry: CalendarItem) => {
    try {
      const res = await toggleCalendarPublishAction(entry.id);
      if (res.success) {
        toast.success(res.message);
        loadData();
      } else {
        toast.error(res.message);
      }
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to toggle publication status.');
    }
  };

  const handleDelete = (entry: CalendarItem) => {
    setSelectedEntry(entry);
    setDeleteOpen(true);
  };

  return (
    <DataTableLayout
      title="Academic Calendar Management"
      description="Manage institution-wide holidays, exam schedules, registration dates, and academic events."
      action={
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Add Event
        </Button>
      }
    >
      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pb-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search calendar events by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={semesterFilter} onValueChange={(val) => val && setSemesterFilter(val)}>
            <SelectTrigger className="h-9 text-xs w-[160px]">
              <SelectValue placeholder="All Semesters" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Semesters</SelectItem>
              {semesters.map((sem) => (
                <SelectItem key={sem.id} value={sem.id}>
                  {sem.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={(val) => val && setTypeFilter(val)}>
            <SelectTrigger className="h-9 text-xs w-[140px]">
              <SelectValue placeholder="All Event Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Event Types</SelectItem>
              <SelectItem value={AcademicEventType.HOLIDAY}>HOLIDAY</SelectItem>
              <SelectItem value={AcademicEventType.EXAM}>EXAM</SelectItem>
              <SelectItem value={AcademicEventType.REGISTRATION}>REGISTRATION</SelectItem>
              <SelectItem value={AcademicEventType.ORIENTATION}>ORIENTATION</SelectItem>
              <SelectItem value={AcademicEventType.RESULT}>RESULT</SelectItem>
              <SelectItem value={AcademicEventType.OTHER}>OTHER</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={loadData}>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* Table / Month Grouped List view */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-xs text-muted-foreground border rounded-md bg-card">
          <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" /> Loading academic calendar...
        </div>
      ) : (
        <AcademicCalendarTable
          data={entries}
          onEdit={handleEdit}
          onTogglePublish={handleTogglePublish}
          onDelete={handleDelete}
        />
      )}

      {/* Dialogs */}
      <AcademicCalendarFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        semesters={semesters}
        eventToEdit={selectedEntry}
        onSuccess={loadData}
      />

      <DeleteAcademicCalendarDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        event={selectedEntry}
        onSuccess={loadData}
      />
    </DataTableLayout>
  );
}
