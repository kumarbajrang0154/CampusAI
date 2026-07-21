import { z } from 'zod';

export const createSubjectSchema = z.object({
  name: z
    .string()
    .min(3, 'Subject name must be at least 3 characters long')
    .max(100, 'Subject name cannot exceed 100 characters')
    .trim(),
  code: z
    .string()
    .min(3, 'Subject code must be at least 3 characters')
    .max(10, 'Subject code cannot exceed 10 characters')
    .regex(/^[A-Z0-9-]+$/, 'Subject code must contain only uppercase letters, numbers, and dashes')
    .trim(),
  courseId: z
    .string()
    .min(1, 'Course is required')
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid course ID format'),
  facultyId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid faculty ID format')
    .optional()
    .nullable()
    .or(z.literal('')),
});

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export const updateSubjectSchema = createSubjectSchema;
export type UpdateSubjectInput = CreateSubjectInput;
