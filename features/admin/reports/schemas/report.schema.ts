import { z } from 'zod';

export const ReportDomainEnum = z.enum(['USERS', 'PLACEMENT', 'ACADEMICS', 'AUDIT']);
export type ReportDomain = z.infer<typeof ReportDomainEnum>;

export const customReportFilterSchema = z.object({
  domain: ReportDomainEnum,
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  roleFilter: z.string().optional(),
  departmentIdFilter: z.string().optional(),
});

export type CustomReportFilterInput = z.infer<typeof customReportFilterSchema>;
