import prisma from '@/lib/prisma';
import { DSADifficulty, DSAPlatform } from '@prisma/client';
import { DSAProblemFormValues } from '../schemas/dsa-problem.schema';

export interface DSAProblemFilterOptions {
  search?: string;
  domainId?: string;
  difficulty?: DSADifficulty;
  platform?: DSAPlatform;
  page?: number;
  limit?: number;
}

export class DSAProblemRepository {
  async listProblems(options: DSAProblemFilterOptions = {}) {
    const { search, domainId, difficulty, platform, page = 1, limit = 50 } = options;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    if (domainId) {
      where.domainId = domainId;
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (platform) {
      where.platform = platform;
    }

    const [items, total] = await Promise.all([
      prisma.dSAProblem.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ domainId: 'asc' }, { order: 'asc' }],
        include: {
          domain: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      prisma.dSAProblem.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getProblemById(id: string) {
    return prisma.dSAProblem.findUnique({
      where: { id },
      include: {
        domain: true,
      },
    });
  }

  async createProblem(data: DSAProblemFormValues) {
    return prisma.dSAProblem.create({
      data: {
        title: data.title,
        domainId: data.domainId,
        difficulty: data.difficulty,
        platform: data.platform,
        problemUrl: data.problemUrl,
        solutionVideoUrl: data.solutionVideoUrl || null,
        codeSolution: data.codeSolution || null,
        dryRunExplanation: data.dryRunExplanation || null,
        order: data.order || 1,
      },
    });
  }

  async updateProblem(id: string, data: DSAProblemFormValues) {
    return prisma.dSAProblem.update({
      where: { id },
      data: {
        title: data.title,
        domainId: data.domainId,
        difficulty: data.difficulty,
        platform: data.platform,
        problemUrl: data.problemUrl,
        solutionVideoUrl: data.solutionVideoUrl || null,
        codeSolution: data.codeSolution || null,
        dryRunExplanation: data.dryRunExplanation || null,
        order: data.order || 1,
      },
    });
  }

  async deleteProblem(id: string) {
    return prisma.dSAProblem.delete({
      where: { id },
    });
  }

  async listDomains() {
    return prisma.placementDomain.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }
}
