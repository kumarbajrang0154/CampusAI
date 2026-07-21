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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createCourseSchema, CreateCourseInput } from '../schemas/course.schema';
import { createCourseAction, updateCourseAction } from '../actions/course.actions';

interface CourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course?: { id: string; name: string; credits: number; semester: number; departmentId: string } | null;
  departments: Array<{ id: string; name: string; code: string }>;
  onSuccess?: () => void;
}

export function CourseDialog({
  open,
  onOpenChange,
  course,
  departments,
  onSuccess,
}: CourseDialogProps) {
  const [isPending, setIsPending] = useState(false);
  const isEdit = !!course;

  const form = useForm<CreateCourseInput>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: {
      name: '',
      credits: 4,
      semester: 1,
      departmentId: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (course) {
        form.reset({
          name: course.name,
          credits: course.credits,
          semester: course.semester,
          departmentId: course.departmentId,
        });
      } else {
        form.reset({
          name: '',
          credits: 4,
          semester: 1,
          departmentId: departments[0]?.id || '',
        });
      }
    }
  }, [open, course, departments, form]);

  const onSubmit = async (values: CreateCourseInput) => {
    setIsPending(true);
    try {
      let response;
      if (isEdit && course) {
        response = await updateCourseAction(course.id, values);
      } else {
        response = await createCourseAction(values);
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
          <DialogTitle>{isEdit ? 'Edit Course' : 'Add Course'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the course details below.'
              : 'Add a new academic course/program linked to a department.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Bachelor of Technology in CSE" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="credits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Credits</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={20} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="semester"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Semesters</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={8} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="departmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name} ({dept.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                {isEdit ? 'Save Changes' : 'Create Course'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
