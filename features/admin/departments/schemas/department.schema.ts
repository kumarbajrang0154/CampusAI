import { z } from 'zod';

export const createDepartmentSchema = z.object({
  name: z
    .string()
    .min(3, 'Department name must be at least 3 characters long')
    .max(100, 'Department name cannot exceed 100 characters')
    .trim(),
  code: z
    .string()
    .min(2, 'Department code must be at least 2 characters')
    .max(5, 'Department code cannot exceed 5 characters')
    .regex(/^[A-Z]{2,5}$/, 'Department code must contain only 2 to 5 uppercase letters')
    .trim(),
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export const updateDepartmentSchema = createDepartmentSchema;
export type UpdateDepartmentInput = CreateDepartmentInput;
