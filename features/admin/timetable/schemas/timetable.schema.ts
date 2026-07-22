import { z } from 'zod';

export const createTimetableSchema = z.object({
  departmentId: z.string().min(1, 'Department is required'),
  semester: z.number().int().min(1, 'Semester must be between 1 and 10').max(10),
  section: z.string().min(1, 'Section is required').max(10),
  academicYear: z.string().min(1, 'Academic year is required'),
});

export type CreateTimetableInput = z.infer<typeof createTimetableSchema>;

export const assignSlotSchema = z.object({
  timetableId: z.string().min(1, 'Timetable ID is required'),
  day: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']),
  periodNumber: z.number().int().min(1),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  subjectId: z.string().min(1, 'Subject is required'),
  facultyId: z.string().min(1, 'Faculty is required'),
  classroomId: z.string().min(1, 'Classroom is required'),
  slotId: z.string().optional(),
});

export type AssignSlotInput = z.infer<typeof assignSlotSchema>;

export const periodTemplateSchema = z.object({
  periodNumber: z.number().int().min(1),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  isBreak: z.boolean().default(false),
  breakLabel: z.string().nullable().optional(),
});

export type PeriodTemplateInput = z.infer<typeof periodTemplateSchema>;
