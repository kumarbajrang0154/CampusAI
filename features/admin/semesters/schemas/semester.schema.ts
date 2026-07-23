import { z } from 'zod';
import { SemesterTerm, SemesterStatus } from '@prisma/client';

export const semesterSchema = z.object({
  name: z.string().min(2, 'Semester name must be at least 2 characters'),
  academicYear: z.string().min(4, 'Academic year must be specified (e.g., 2025-26)'),
  term: z.nativeEnum(SemesterTerm),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  status: z.nativeEnum(SemesterStatus),
  isCurrent: z.boolean(),
});

export type SemesterFormValues = z.infer<typeof semesterSchema>;
