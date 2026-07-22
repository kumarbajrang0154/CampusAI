'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserRole } from '@prisma/client';
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
  FormDescription,
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
import { createUserSchema, CreateUserInput } from '../schemas/user.schema';
import { createUserAction } from '../actions/user.actions';
import { listDepartmentsAction } from '@/features/admin/departments/actions/department.actions';

interface AddUserDialogProps {
  onSuccess?: () => void;
}

type DepartmentOption = {
  id: string;
  name: string;
  code: string;
};

export function AddUserDialog({ onSuccess }: AddUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);

  const form = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      role: UserRole.STUDENT,
      name: '',
      departmentId: '',
      enrollmentNo: '',
      employeeId: '',
      designation: 'Assistant Professor',
      specialization: 'General',
      semester: 1,
      section: 'A',
      batchYear: new Date().getFullYear(),
    },
  });

  const selectedRole = form.watch('role');

  useEffect(() => {
    async function loadDepts() {
      try {
        const res = await listDepartmentsAction({ limit: 100 });
        if (res.success && res.data) {
          setDepartments(res.data.departments.map((d: any) => ({ id: d.id, name: d.name, code: d.code })));
        }
      } catch {
        // Silently catch department load error
      }
    }
    if (open) {
      loadDepts();
    }
  }, [open]);

  const onSubmit = async (values: CreateUserInput) => {
    setIsPending(true);
    try {
      const response = await createUserAction(values);

      if (response.success) {
        toast.success(response.message || 'User account pre-provisioned successfully.');
        form.reset();
        setOpen(false);
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error(response.message || 'Failed to pre-provision user.');
      }
    } catch {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsPending(false);
    }
  };

  const showDepartment = selectedRole === UserRole.STUDENT || selectedRole === UserRole.FACULTY || selectedRole === UserRole.HOD;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!isPending) setOpen(v); }}>
      <DialogTrigger
        render={
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Pre-provision User Account</DialogTitle>
          <DialogDescription>
            Add an email address and assign a role with profile details. Pre-provisioned users can sign in using Google OAuth with this email.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address *</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="e.g. user@gmail.com"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Role *</FormLabel>
                  <Select
                    disabled={isPending}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={UserRole.STUDENT}>Student</SelectItem>
                      <SelectItem value={UserRole.FACULTY}>Faculty</SelectItem>
                      <SelectItem value={UserRole.HOD}>Head of Department (HOD)</SelectItem>
                      <SelectItem value={UserRole.ADMIN}>Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showDepartment && (
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
                          <SelectValue placeholder="Select department (default CSE)" />
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
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. John Doe"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Leave blank to automatically fill using their Google profile on first login.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedRole === UserRole.STUDENT && (
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="enrollmentNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Enrollment No (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Auto-generated if empty" disabled={isPending} {...field} />
                      </FormControl>
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
                        <Input placeholder="A" disabled={isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {selectedRole === UserRole.FACULTY && (
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="employeeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employee ID (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Auto-generated if empty" disabled={isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="designation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Designation</FormLabel>
                      <FormControl>
                        <Input placeholder="Assistant Professor" disabled={isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

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
                    Saving...
                  </>
                ) : (
                  'Create User'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
