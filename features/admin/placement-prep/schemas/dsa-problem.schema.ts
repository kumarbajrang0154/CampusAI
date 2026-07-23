import { z } from 'zod';
import { DSADifficulty, DSAPlatform } from '@prisma/client';

export const dsaProblemSchema = z.object({
  title: z.string().min(2, 'Problem title must be at least 2 characters'),
  domainId: z.string().min(1, 'Please select a primary domain'),
  difficulty: z.nativeEnum(DSADifficulty),
  platform: z.nativeEnum(DSAPlatform),
  problemUrl: z.string().url('Please enter a valid LeetCode or HackerRank URL'),
  solutionVideoUrl: z.string().url('Please enter a valid YouTube video URL').optional().nullable().or(z.literal('')),
  codeSolution: z.string().optional().nullable(),
  dryRunExplanation: z.string().optional().nullable(),
  order: z.number().int(),
});

export type DSAProblemFormValues = z.infer<typeof dsaProblemSchema>;
