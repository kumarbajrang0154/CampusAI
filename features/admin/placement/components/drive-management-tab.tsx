'use client';

import * as React from 'react';
import { Plus, Search, Calendar, Briefcase, Pencil, Trash2, Loader2, Users, Eye, Check } from 'lucide-react';
import { format } from 'date-fns';
import { PlacementDriveStatus } from '@prisma/client';
import { toast } from 'sonner';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  listDrivesAction,
  createDriveAction,
  updateDriveAction,
  deleteDriveAction,
  listCompaniesAction,
} from '../actions/placement.actions';
import { DriveApplicationsDialog } from './drive-applications-dialog';

export interface PlacementDriveItem {
  id: string;
  companyId: string;
  packageOffered: number;
  eligibilityCGPA: number;
  allowedDepartments: string[];
  driveDate: Date;
  status: PlacementDriveStatus;
  company: {
    id: string;
    name: string;
    industry: string;
  };
  _count?: {
    applications: number;
  };
}

const DRIVE_STATUS_STYLES: Record<PlacementDriveStatus, string> = {
  UPCOMING: 'bg-blue-50 text-blue-700 border-blue-200',
  ONGOING: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CLOSED: 'bg-slate-100 text-slate-700 border-slate-200',
};

const DEFAULT_DEPARTMENTS = ['CSE', 'ECE', 'ME', 'CE', 'EE', 'IT', 'AI-DS'];

export function DriveManagementTab({ onDriveUpdated }: { onDriveUpdated?: () => void }) {
  const [loading, setLoading] = React.useState(true);
  const [drives, setDrives] = React.useState<PlacementDriveItem[]>([]);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('ALL');
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);

  // Companies dropdown options
  const [companies, setCompanies] = React.useState<Array<{ id: string; name: string }>>([]);

  // Create / Edit Dialog State
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingDrive, setEditingDrive] = React.useState<PlacementDriveItem | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  // Form State
  const [companyId, setCompanyId] = React.useState<string>('');
  const [packageOffered, setPackageOffered] = React.useState<number>(12);
  const [eligibilityCGPA, setEligibilityCGPA] = React.useState<number>(7.0);
  const [allowedDepartments, setAllowedDepartments] = React.useState<string[]>(['CSE', 'ECE']);
  const [driveDate, setDriveDate] = React.useState<string>('');
  const [status, setStatus] = React.useState<PlacementDriveStatus>('UPCOMING');

  // View Applications Modal State
  const [viewAppDrive, setViewAppDrive] = React.useState<PlacementDriveItem | null>(null);

  // Delete State
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const fetchDrives = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await listDrivesAction({
        search,
        status: statusFilter !== 'ALL' ? (statusFilter as PlacementDriveStatus) : undefined,
        page,
        limit: 10,
      });
      if (res.success && res.data) {
        setDrives(res.data.drives as PlacementDriveItem[]);
        setTotalPages(res.data.pagination.totalPages);
      }
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  React.useEffect(() => {
    fetchDrives();
  }, [fetchDrives]);

  const loadCompanyOptions = async () => {
    const res = await listCompaniesAction({ limit: 100 });
    if (res.success && res.data) {
      setCompanies(res.data.companies.map((c) => ({ id: c.id, name: c.name })));
    }
  };

  const handleOpenCreate = () => {
    loadCompanyOptions();
    setEditingDrive(null);
    setCompanyId('');
    setPackageOffered(12);
    setEligibilityCGPA(7.0);
    setAllowedDepartments(['CSE', 'ECE']);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    setDriveDate(nextWeek.toISOString().slice(0, 10));
    setStatus('UPCOMING');
    setDialogOpen(true);
  };

  const handleOpenEdit = (drive: PlacementDriveItem) => {
    loadCompanyOptions();
    setEditingDrive(drive);
    setCompanyId(drive.companyId);
    setPackageOffered(drive.packageOffered);
    setEligibilityCGPA(drive.eligibilityCGPA);
    setAllowedDepartments(drive.allowedDepartments || []);
    setDriveDate(new Date(drive.driveDate).toISOString().slice(0, 10));
    setStatus(drive.status);
    setDialogOpen(true);
  };

  const handleToggleDept = (deptCode: string) => {
    setAllowedDepartments((prev) =>
      prev.includes(deptCode) ? prev.filter((d) => d !== deptCode) : [...prev, deptCode]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyId) {
      toast.error('Please select a recruiting company.');
      return;
    }
    if (allowedDepartments.length === 0) {
      toast.error('Please select at least one eligible department.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingDrive) {
        const res = await updateDriveAction(editingDrive.id, {
          companyId,
          packageOffered,
          eligibilityCGPA,
          allowedDepartments,
          driveDate: new Date(driveDate),
          status,
        });
        if (res.success) {
          toast.success(res.message);
          setDialogOpen(false);
          fetchDrives();
          if (onDriveUpdated) onDriveUpdated();
        } else {
          toast.error(res.message);
        }
      } else {
        const res = await createDriveAction({
          companyId,
          packageOffered,
          eligibilityCGPA,
          allowedDepartments,
          driveDate: new Date(driveDate),
          status,
        });
        if (res.success) {
          toast.success(res.message);
          setDialogOpen(false);
          fetchDrives();
          if (onDriveUpdated) onDriveUpdated();
        } else {
          toast.error(res.message);
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (drive: PlacementDriveItem) => {
    if (!confirm(`Are you sure you want to delete the placement drive for "${drive.company.name}"?`)) return;

    setDeletingId(drive.id);
    try {
      const res = await deleteDriveAction(drive.id);
      if (res.success) {
        toast.success(res.message);
        fetchDrives();
        if (onDriveUpdated) onDriveUpdated();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete drive.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-2 flex-1 max-w-lg">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search placement drives by company..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(val) => {
              if (val) {
                setStatusFilter(val);
                setPage(1);
              }
            }}
          >
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="UPCOMING">Upcoming</SelectItem>
              <SelectItem value="ONGOING">Ongoing</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Create Drive
        </Button>
      </div>

      {/* Placement Drives Data Table */}
      <div className="rounded-md border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead>Recruiter & Drive</TableHead>
              <TableHead>Package (LPA)</TableHead>
              <TableHead>Eligibility</TableHead>
              <TableHead>Drive Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Applicants</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" /> Loading placement drives...
                  </div>
                </TableCell>
              </TableRow>
            ) : drives.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <Briefcase className="h-8 w-8 text-muted-foreground/40 mb-1" />
                    <p className="font-medium text-foreground text-sm">No placement drives found</p>
                    <p className="text-xs">Click &quot;Create Drive&quot; to publish a campus drive.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              drives.map((drive) => (
                <TableRow key={drive.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="font-semibold text-foreground">{drive.company.name}</div>
                    <div className="text-xs text-muted-foreground">{drive.company.industry}</div>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-emerald-700 text-sm">
                      ₹{drive.packageOffered} LPA
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-foreground">
                        Min CGPA: {drive.eligibilityCGPA}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {drive.allowedDepartments.map((dept) => (
                          <Badge key={dept} variant="outline" className="text-[9px] py-0 px-1">
                            {dept}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {format(new Date(drive.driveDate), 'MMM d, yyyy')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] font-semibold ${DRIVE_STATUS_STYLES[drive.status]}`}>
                      {drive.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {drive._count?.applications ?? 0} applicant(s)
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewAppDrive(drive)}
                        className="h-8 px-2 text-xs gap-1"
                      >
                        <Eye className="h-3.5 w-3.5" /> Applicants
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEdit(drive)}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={deletingId === drive.id}
                        onClick={() => handleDelete(drive)}
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      >
                        {deletingId === drive.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Create / Edit Placement Drive Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingDrive ? 'Edit Placement Drive' : 'Publish New Placement Drive'}
            </DialogTitle>
            <DialogDescription>
              Define recruiter requirements, package, minimum CGPA, and eligible departments.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            {/* Recruiting Company */}
            <div className="space-y-1.5">
              <Label>Recruiting Company *</Label>
              <Select
                value={companyId}
                onValueChange={(val) => val && setCompanyId(val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Package & Min CGPA Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="package-offered">Package Offered (LPA) *</Label>
                <Input
                  id="package-offered"
                  type="number"
                  step="0.5"
                  min="0"
                  value={packageOffered}
                  onChange={(e) => setPackageOffered(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="eligibility-cgpa">Minimum Eligibility CGPA *</Label>
                <Input
                  id="eligibility-cgpa"
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={eligibilityCGPA}
                  onChange={(e) => setEligibilityCGPA(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
            </div>

            {/* Allowed Departments Multi-Select Checkboxes */}
            <div className="space-y-1.5 p-3 rounded-lg border bg-muted/30">
              <Label className="text-xs font-semibold">Eligible Departments *</Label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
                {DEFAULT_DEPARTMENTS.map((dept) => {
                  const isChecked = allowedDepartments.includes(dept);
                  return (
                    <label
                      key={dept}
                      className={`flex items-center gap-1.5 p-1.5 rounded text-xs cursor-pointer border transition-colors ${
                        isChecked ? 'bg-primary/10 border-primary text-primary font-medium' : 'bg-background hover:bg-muted'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleDept(dept)}
                        className="rounded text-primary focus:ring-primary h-3.5 w-3.5"
                      />
                      <span>{dept}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Drive Date & Status Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="drive-date">Drive Scheduled Date *</Label>
                <Input
                  id="drive-date"
                  type="date"
                  value={driveDate}
                  onChange={(e) => setDriveDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Drive Status *</Label>
                <Select
                  value={status}
                  onValueChange={(val) => val && setStatus(val as PlacementDriveStatus)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UPCOMING">Upcoming</SelectItem>
                    <SelectItem value="ONGOING">Ongoing</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : editingDrive ? (
                  'Update Drive'
                ) : (
                  'Create Drive'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Drive Applications Inspector Modal */}
      <DriveApplicationsDialog
        driveId={viewAppDrive?.id || null}
        companyName={viewAppDrive?.company.name || null}
        packageOffered={viewAppDrive?.packageOffered || null}
        open={!!viewAppDrive}
        onOpenChange={(open) => {
          if (!open) setViewAppDrive(null);
        }}
        onStatusChanged={() => {
          fetchDrives();
          if (onDriveUpdated) onDriveUpdated();
        }}
      />
    </div>
  );
}
