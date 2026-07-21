import { z } from 'zod';
import { ClassroomType } from '@prisma/client';

export const createClassroomSchema = z.object({
  roomNumber: z
    .string()
    .min(1, 'Room number is required')
    .max(20, 'Room number cannot exceed 20 characters')
    .trim(),
  capacity: z
    .coerce
    .number()
    .int('Capacity must be an integer')
    .positive('Capacity must be a positive number')
    .max(500, 'Capacity cannot exceed 500 seats'),
  type: z.nativeEnum(ClassroomType, {
    errorMap: () => ({ message: 'Invalid classroom type' }),
  }),
});

export type CreateClassroomInput = z.infer<typeof createClassroomSchema>;
export const updateClassroomSchema = createClassroomSchema;
export type UpdateClassroomInput = CreateClassroomInput;
