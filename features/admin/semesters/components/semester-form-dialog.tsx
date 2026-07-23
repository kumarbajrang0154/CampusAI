'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SemesterTerm, SemesterStatus } from '@prisma/client';
import { Loader2 } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { semesterSchema, SemesterFormValues } from '../schemas/semester.schema';
import { createSemesterAction, updateSemesterAction } from '../actions/semester.actions';

interface SemesterFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  semesterToEdit?: {
    id: string;
    name: string;
    academicYear: string;
    term: SemesterTerm;
    startDate: string | Date;
    endDate: string | Date;
    status: SemesterStatus;
    isCurrent: boolean;
  } | null;
  onSuccess: () => void;
}

export function SemesterFormDialog({
  open,
  onOpenChange,
  semesterToEdit,
  onSuccess,
}: SemesterFormDialogProps) {
  const isEditing = !!semesterToEdit;
  const [loading, setLoading] = React.useState(false);

  const form = useForm<SemesterFormValues>({
    resolver: zodResolver(semesterSchema),
    defaultValues: {
      name: '',
      academicYear: '2025-26',
      term: SemesterTerm.ODD,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: SemesterStatus.UPCOMING,
      isCurrent: false,
    },
  });

  React.useEffect(() => {
    if (semesterToEdit) {
      const startStr = typeof semesterToEdit.startDate === 'string'
        ? semesterToEdit.startDate.split('T')[0]
        : semesterToEdit.startDate.toISOString().split('T')[0];

      const endStr = typeof semesterToEdit.endDate === 'string'
        ? semesterToEdit.endDate.split('T')[0]
        : semesterToEdit.endDate.toISOString().split('T')[0];

      form.reset({
        name: semesterToEdit.name,
        academicYear: semesterToEdit.academicYear,
        term: semesterToEdit.term,
        startDate: startStr,
        endDate: endStr,
        status: semesterToEdit.status,
        isCurrent: semesterToEdit.isCurrent,
      });
    } else {
      form.reset({
        name: '',
        academicYear: '2025-26',
        term: SemesterTerm.ODD,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: SemesterStatus.UPCOMING,
        isCurrent: false,
      });
    }
  }, [semesterToEdit, form, open]);

  const onSubmit = async (values: SemesterFormValues) => {
    setLoading(true);
    try {
      let res;
      if (isEditing && semesterToEdit) {
        res = await updateSemesterAction(semesterToEdit.id, values);
      } else {
        res = await createSemesterAction(values);
      }

      if (res.success) {
        toast.success(res.message);
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Semester' : 'Create New Semester'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update academic semester details, status, or date range.'
              : 'Add a new academic term semester to the campus structure.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Semester Name</Label>
            <Input
              id="name"
              placeholder="e.g. Odd Semester 2025-26"
              {...form.register('name')}
            />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="academicYear">Academic Year</Label>
              <Input
                id="academicYear"
                placeholder="e.g. 2025-26"
                {...form.register('academicYear')}
              />
              {form.formState.errors.academicYear && (
                <p className="text-xs text-destructive">{form.formState.errors.academicYear.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="term">Term</Label>
              <Select
                value={form.watch('term')}
                onValueChange={(val) => val && form.setValue('term', val as SemesterTerm)}
              >
                <SelectTrigger id="term">
                  <SelectValue placeholder="Select Term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SemesterTerm.ODD}>ODD (Semester 1, 3, 5, 7)</SelectItem>
                  <SelectItem value={SemesterTerm.EVEN}>EVEN (Semester 2, 4, 6, 8)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                {...form.register('startDate')}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                {...form.register('endDate')}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <Select
              value={form.watch('status')}
              onValueChange={(val) => val && form.setValue('status', val as SemesterStatus)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SemesterStatus.UPCOMING}>Upcoming</SelectItem>
                <SelectItem value={SemesterStatus.ACTIVE}>Active</SelectItem>
                <SelectItem value={SemesterStatus.COMPLETED}>Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2 pt-2 border-t">
            <Checkbox
              id="isCurrent"
              checked={form.watch('isCurrent')}
              onCheckedChange={(checked) => form.setValue('isCurrent', !!checked)}
            />
            <Label htmlFor="isCurrent" className="text-xs leading-none font-medium cursor-pointer">
              Mark as Current Active Semester for the Institution
            </Label>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Create Semester'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
