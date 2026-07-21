'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { createDepartmentSchema, CreateDepartmentInput } from '../schemas/department.schema';
import { createDepartmentAction, updateDepartmentAction } from '../actions/department.actions';

interface DepartmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department?: { id: string; name: string; code: string } | null;
  onSuccess?: () => void;
}

export function DepartmentDialog({
  open,
  onOpenChange,
  department,
  onSuccess,
}: DepartmentDialogProps) {
  const [isPending, setIsPending] = useState(false);
  const isEdit = !!department;

  const form = useForm<CreateDepartmentInput>({
    resolver: zodResolver(createDepartmentSchema),
    defaultValues: {
      name: '',
      code: '',
    },
  });

  // Reset form when dialog opens/changes or department changes
  useEffect(() => {
    if (open) {
      if (department) {
        form.reset({
          name: department.name,
          code: department.code,
        });
      } else {
        form.reset({
          name: '',
          code: '',
        });
      }
    }
  }, [open, department, form]);

  const onSubmit = async (values: CreateDepartmentInput) => {
    setIsPending(true);
    try {
      let response;
      if (isEdit && department) {
        response = await updateDepartmentAction(department.id, values);
      } else {
        response = await createDepartmentAction(values);
      }

      if (response.success) {
        toast.success(response.message);
        form.reset();
        onOpenChange(false);
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error(response.message || 'An error occurred.');
      }
    } catch {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!isPending) onOpenChange(v); }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Department' : 'Add Department'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the department details below.'
              : 'Enter a name and code to register a new academic department.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Computer Science & Engineering" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. CSE"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? 'Save Changes' : 'Create Department'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
