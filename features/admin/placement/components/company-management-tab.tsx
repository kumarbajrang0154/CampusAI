'use client';

import * as React from 'react';
import { Plus, Search, Globe, Building2, Pencil, Trash2, Loader2, ExternalLink } from 'lucide-react';
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
  listCompaniesAction,
  createCompanyAction,
  updateCompanyAction,
  deleteCompanyAction,
} from '../actions/placement.actions';

export interface CompanyItem {
  id: string;
  name: string;
  website: string;
  industry: string;
  createdAt: Date;
  _count?: {
    drives: number;
  };
}

export function CompanyManagementTab() {
  const [loading, setLoading] = React.useState(true);
  const [companies, setCompanies] = React.useState<CompanyItem[]>([]);
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);

  // Dialog States
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingCompany, setEditingCompany] = React.useState<CompanyItem | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  // Form State
  const [name, setName] = React.useState('');
  const [website, setWebsite] = React.useState('');
  const [industry, setIndustry] = React.useState('');

  // Delete State
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const fetchCompanies = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await listCompaniesAction({ search, page, limit: 10 });
      if (res.success && res.data) {
        setCompanies(res.data.companies as CompanyItem[]);
        setTotalPages(res.data.pagination.totalPages);
      }
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  React.useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleOpenCreate = () => {
    setEditingCompany(null);
    setName('');
    setWebsite('');
    setIndustry('');
    setDialogOpen(true);
  };

  const handleOpenEdit = (company: CompanyItem) => {
    setEditingCompany(company);
    setName(company.name);
    setWebsite(company.website);
    setIndustry(company.industry);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !website.trim() || !industry.trim()) {
      toast.error('All fields are required.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingCompany) {
        const res = await updateCompanyAction(editingCompany.id, {
          name: name.trim(),
          website: website.trim(),
          industry: industry.trim(),
        });
        if (res.success) {
          toast.success(res.message);
          setDialogOpen(false);
          fetchCompanies();
        } else {
          toast.error(res.message);
        }
      } else {
        const res = await createCompanyAction({
          name: name.trim(),
          website: website.trim(),
          industry: industry.trim(),
        });
        if (res.success) {
          toast.success(res.message);
          setDialogOpen(false);
          fetchCompanies();
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

  const handleDelete = async (company: CompanyItem) => {
    if (!confirm(`Are you sure you want to delete "${company.name}"?`)) return;

    setDeletingId(company.id);
    try {
      const res = await deleteCompanyAction(company.id);
      if (res.success) {
        toast.success(res.message);
        fetchCompanies();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete company.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Search & Create Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search companies by name or industry..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Add Company
        </Button>
      </div>

      {/* Companies Table */}
      <div className="rounded-md border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead>Company Name</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Website</TableHead>
              <TableHead>Linked Drives</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" /> Loading companies...
                  </div>
                </TableCell>
              </TableRow>
            ) : companies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <Building2 className="h-8 w-8 text-muted-foreground/40 mb-1" />
                    <p className="font-medium text-foreground text-sm">No companies found</p>
                    <p className="text-xs">Click &quot;Add Company&quot; to register a new recruiting company.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              companies.map((company) => (
                <TableRow key={company.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="font-semibold text-foreground flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary shrink-0" />
                      {company.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs font-normal">
                      {company.industry}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <a
                      href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                    >
                      <Globe className="h-3 w-3" />
                      <span className="truncate max-w-[180px]">{company.website}</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {company._count?.drives ?? 0} drive(s)
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEdit(company)}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={deletingId === company.id}
                        onClick={() => handleDelete(company)}
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      >
                        {deletingId === company.id ? (
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

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCompany ? 'Edit Company Details' : 'Register New Company'}
            </DialogTitle>
            <DialogDescription>
              {editingCompany
                ? 'Update the company information below.'
                : 'Add a new corporate recruiter for upcoming placement drives.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="company-name">Company Name *</Label>
              <Input
                id="company-name"
                placeholder="e.g. Google India"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="company-website">Website URL *</Label>
              <Input
                id="company-website"
                placeholder="e.g. https://careers.google.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="company-industry">Industry / Domain *</Label>
              <Input
                id="company-industry"
                placeholder="e.g. Software & Technology, Finance, Consulting"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                required
              />
            </div>

            <DialogFooter className="pt-3">
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
                ) : editingCompany ? (
                  'Update Company'
                ) : (
                  'Create Company'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
