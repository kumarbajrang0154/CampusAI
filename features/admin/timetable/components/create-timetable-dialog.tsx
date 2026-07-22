'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createTimetableSchema, CreateTimetableInput } from '../schemas/timetable.schema';
import { createTimetableAction } from '../actions/timetable.actions';
import { listDepartmentsAction } from '@/features/admin/departments/actions/department.actions';

interface CreateTimetableDialogProps {
  onSuccess?: (timetableId: string) => void;
}

type DepartmentOption = {
  id: string;
  name: string;
  code: string;
};

export function CreateTimetableDialog({ onSuccess }: CreateTimetableDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);

  const form = useForm<CreateTimetableInput>({
    resolver: zodResolver(createTimetableSchema),
    defaultValues: {
      departmentId: '',
      semester: 1,
      section: 'A',
      academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    },
  });

  useEffect(() => {
    async function loadDepts() {
      try {
        const res = await listDepartmentsAction({ limit: 100 });
        if (res.success && res.data) {
          setDepartments(res.data.departments.map((d: any) => ({ id: d.id, name: d.name, code: d.code })));
          if (res.data.departments.length > 0) {
            form.setValue('departmentId', res.data.departments[0].id);
          }
        }
      } catch {
        // Ignore silent fetch error
      }
    }
    if (open) {
      loadDepts();
    }
  }, [open, form]);

  const onSubmit = async (values: CreateTimetableInput) => {
    setIsPending(true);
    try {
      const response = await createTimetableAction(values);

      if (response.success && response.data) {
        toast.success('Draft timetable created successfully.');
        form.reset();
        setOpen(false);
        if (onSuccess) {
          onSuccess(response.data.id);
        }
      } else {
        toast.error(response.message || 'Failed to create timetable.');
      }
    } catch {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!isPending) setOpen(v); }}>
      <DialogTrigger
        render={
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Create Timetable
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Timetable</DialogTitle>
          <DialogDescription>
            Start a new draft timetable for a department, semester, and section.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="departmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <Select
                    disabled={isPending}
                    onValueChange={field.onChange}
                    value={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departments.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name} ({d.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="semester"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Semester</FormLabel>
                    <Select
                      disabled={isPending}
                      onValueChange={(val) => val && field.onChange(parseInt(val, 10))}
                      value={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Semester" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                          <SelectItem key={sem} value={sem.toString()}>
                            Sem {sem}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="section"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. A" disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="academicYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Academic Year</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 2025-2026" disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Draft'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
