import { z } from 'zod';

export const createCourseSchema = z.object({
  name: z
    .string()
    .min(3, 'Course name must be at least 3 characters long')
    .max(100, 'Course name cannot exceed 100 characters')
    .trim(),
  credits: z
    .coerce
    .number()
    .int('Credits must be an integer')
    .positive('Credits must be a positive number')
    .max(20, 'Credits cannot exceed 20'),
  semester: z
    .coerce
    .number()
    .int('Semester must be an integer')
    .min(1, 'Semester must be between 1 and 8')
    .max(8, 'Semester must be between 1 and 8'),
  departmentId: z
    .string()
    .min(1, 'Department is required')
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid department ID format'),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export const updateCourseSchema = createCourseSchema;
export type UpdateCourseInput = CreateCourseInput;
