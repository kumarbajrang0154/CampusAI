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
import { createSubjectSchema, CreateSubjectInput } from '../schemas/subject.schema';
import { createSubjectAction, updateSubjectAction } from '../actions/subject.actions';

interface SubjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject?: { id: string; name: string; code: string; courseId: string; facultyId: string | null } | null;
  courses: Array<{ id: string; name: string }>;
  facultyList: Array<{ id: string; employeeId: string; user: { name: string | null; email: string } }>;
  onSuccess?: () => void;
}

export function SubjectDialog({
  open,
  onOpenChange,
  subject,
  courses,
  facultyList,
  onSuccess,
}: SubjectDialogProps) {
  const [isPending, setIsPending] = useState(false);
  const isEdit = !!subject;

  const form = useForm<CreateSubjectInput>({
    resolver: zodResolver(createSubjectSchema),
    defaultValues: {
      name: '',
      code: '',
      courseId: '',
      facultyId: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (subject) {
        form.reset({
          name: subject.name,
          code: subject.code,
          courseId: subject.courseId,
          facultyId: subject.facultyId || '',
        });
      } else {
        form.reset({
          name: '',
          code: '',
          courseId: courses[0]?.id || '',
          facultyId: '',
        });
      }
    }
  }, [open, subject, courses, form]);

  const onSubmit = async (values: CreateSubjectInput) => {
    setIsPending(true);
    // Map empty string facultyId to null for Prisma compat
    const payload = {
      ...values,
      facultyId: values.facultyId === '' ? null : values.facultyId,
    };

    try {
      let response;
      if (isEdit && subject) {
        response = await updateSubjectAction(subject.id, payload);
      } else {
        response = await createSubjectAction(payload);
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
          <DialogTitle>{isEdit ? 'Edit Subject' : 'Add Subject'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the subject details below.'
              : 'Add a new subject/module linked to a course and faculty teacher.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Data Structures and Algorithms" {...field} />
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
                  <FormLabel>Subject Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. CSE-DSA"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="courseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Course" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.name}
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
              name="facultyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned Teacher (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ''}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="No Teacher Assigned" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">No Teacher Assigned</SelectItem>
                      {facultyList.map((fac) => (
                        <SelectItem key={fac.id} value={fac.id}>
                          {fac.user.name || fac.user.email} ({fac.employeeId})
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
                {isEdit ? 'Save Changes' : 'Create Subject'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
