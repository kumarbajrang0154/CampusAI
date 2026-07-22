import { z } from 'zod';
import {
  PlacementDriveStatus,
  ApplicationStatus,
  InterviewMode,
  OfferStatus,
} from '@prisma/client';

// Company Schemas
export const createCompanySchema = z.object({
  name: z.string().trim().min(1, 'Company name is required').max(100),
  website: z.string().trim().url('Invalid website URL').or(z.string().trim().min(1)),
  industry: z.string().trim().min(1, 'Industry is required'),
});

export const updateCompanySchema = createCompanySchema;

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;

// Placement Drive Schemas
export const createPlacementDriveSchema = z.object({
  companyId: z.string().min(1, 'Company selection is required'),
  packageOffered: z.coerce.number().min(0, 'Package offered must be non-negative'),
  eligibilityCGPA: z.coerce.number().min(0, 'CGPA must be at least 0').max(10, 'CGPA cannot exceed 10'),
  allowedDepartments: z.array(z.string()).min(1, 'Select at least one eligible department'),
  driveDate: z.coerce.date({ invalid_type_error: 'Valid drive date is required' }),
  status: z.nativeEnum(PlacementDriveStatus),
});

export const updatePlacementDriveSchema = createPlacementDriveSchema;

export type CreatePlacementDriveInput = z.infer<typeof createPlacementDriveSchema>;
export type UpdatePlacementDriveInput = z.infer<typeof updatePlacementDriveSchema>;

// Application Status Update Schema
export const updateApplicationStatusSchema = z.object({
  applicationId: z.string().min(1, 'Application ID is required'),
  status: z.nativeEnum(ApplicationStatus),
});

export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>;

// Interview Schedule Schema
export const scheduleInterviewSchema = z.object({
  applicationId: z.string().min(1, 'Application ID is required'),
  scheduledAt: z.coerce.date({ invalid_type_error: 'Valid interview schedule date/time is required' }),
  mode: z.nativeEnum(InterviewMode),
  result: z.string().trim().optional(),
});

export type ScheduleInterviewInput = z.infer<typeof scheduleInterviewSchema>;

// Offer Release Schema
export const releaseOfferSchema = z.object({
  applicationId: z.string().min(1, 'Application ID is required'),
  packageOffered: z.coerce.number().min(0, 'Package offered must be non-negative'),
  status: z.nativeEnum(OfferStatus),
});

export type ReleaseOfferInput = z.infer<typeof releaseOfferSchema>;
