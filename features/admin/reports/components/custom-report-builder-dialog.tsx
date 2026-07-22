'use client';

import * as React from 'react';
import { FileSpreadsheet, Loader2, Calendar, Filter, Download } from 'lucide-react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { generateCustomReportCSVAction } from '../actions/report.actions';
import { ReportDomain } from '../schemas/report.schema';

interface CustomReportBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomReportBuilderDialog({
  open,
  onOpenChange,
}: CustomReportBuilderDialogProps) {
  const [loading, setLoading] = React.useState(false);
  const [domain, setDomain] = React.useState<ReportDomain>('USERS');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState('ALL');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      const res = await generateCustomReportCSVAction({
        domain,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        roleFilter: roleFilter !== 'ALL' ? roleFilter : undefined,
      });

      if (res.success && res.data) {
        if (!res.data.csvString || res.data.rowCount === 0) {
          toast.error('No matching records found for the selected custom filters.');
          return;
        }

        const csvContent = 'data:text/csv;charset=utf-8,' + res.data.csvString;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', res.data.filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success(`Generated & downloaded ${res.data.rowCount} record(s) to ${res.data.filename}.`);
        onOpenChange(false);
      } else {
        toast.error(res.message || 'Failed to generate custom report.');
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred during report generation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" /> Custom Report Builder
          </DialogTitle>
          <DialogDescription>
            Export customized CSV reports across CampusAI data domains and date ranges.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Select Domain */}
          <div className="space-y-1.5">
            <Label>Data Domain *</Label>
            <Select value={domain} onValueChange={(val) => val && setDomain(val as ReportDomain)}>
              <SelectTrigger>
                <SelectValue placeholder="Select domain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USERS">Users & Account Profiles</SelectItem>
                <SelectItem value="PLACEMENT">Placement & Recruitment Pipeline</SelectItem>
                <SelectItem value="ACADEMICS">Academic Infrastructure (Depts, Courses, Subjects)</SelectItem>
                <SelectItem value="AUDIT">System Activity & Audit Trail</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Conditional Filters */}
          {domain === 'USERS' && (
            <div className="space-y-1.5 p-3 rounded-lg border bg-muted/30">
              <Label>Filter by User Role</Label>
              <Select value={roleFilter} onValueChange={(val) => val && setRoleFilter(val)}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Campus Roles</SelectItem>
                  <SelectItem value="STUDENT">Students Only</SelectItem>
                  <SelectItem value="FACULTY">Faculty Only</SelectItem>
                  <SelectItem value="HOD">HODs Only</SelectItem>
                  <SelectItem value="ADMIN">Admins Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Date Range Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="start-date">Start Date (Optional)</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="end-date">End Date (Optional)</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" /> Export CSV Report
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
