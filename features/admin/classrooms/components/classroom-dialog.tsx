'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ClassroomType } from '@prisma/client';
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
import { createClassroomSchema, CreateClassroomInput } from '../schemas/classroom.schema';
import { createClassroomAction, updateClassroomAction } from '../actions/classroom.actions';

interface ClassroomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classroom?: { id: string; roomNumber: string; capacity: number; type: ClassroomType } | null;
  onSuccess?: () => void;
}

export function ClassroomDialog({
  open,
  onOpenChange,
  classroom,
  onSuccess,
}: ClassroomDialogProps) {
  const [isPending, setIsPending] = useState(false);
  const isEdit = !!classroom;

  const form = useForm<CreateClassroomInput>({
    resolver: zodResolver(createClassroomSchema),
    defaultValues: {
      roomNumber: '',
      capacity: 30,
      type: ClassroomType.LECTURE_HALL,
    },
  });

  useEffect(() => {
    if (open) {
      if (classroom) {
        form.reset({
          roomNumber: classroom.roomNumber,
          capacity: classroom.capacity,
          type: classroom.type,
        });
      } else {
        form.reset({
          roomNumber: '',
          capacity: 30,
          type: ClassroomType.LECTURE_HALL,
        });
      }
    }
  }, [open, classroom, form]);

  const onSubmit = async (values: CreateClassroomInput) => {
    setIsPending(true);
    try {
      let response;
      if (isEdit && classroom) {
        response = await updateClassroomAction(classroom.id, values);
      } else {
        response = await createClassroomAction(values);
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
          <DialogTitle>{isEdit ? 'Edit Classroom' : 'Add Classroom'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the classroom details below.'
              : 'Add a new classroom or lab configuration to the campus directory.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="roomNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. LH-101 or Lab-202" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Seating Capacity</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={500} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Classroom Type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={ClassroomType.LECTURE_HALL}>Lecture Hall</SelectItem>
                      <SelectItem value={ClassroomType.LAB}>Lab Room</SelectItem>
                      <SelectItem value={ClassroomType.SEMINAR_ROOM}>Seminar Room</SelectItem>
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
                {isEdit ? 'Save Changes' : 'Create Classroom'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
