import { DSAProblemRepository, DSAProblemFilterOptions } from '../repositories/dsa-problem.repository';
import { DSAProblemFormValues } from '../schemas/dsa-problem.schema';
import prisma from '@/lib/prisma';

export class DSAProblemService {
  private repository: DSAProblemRepository;

  constructor() {
    this.repository = new DSAProblemRepository();
  }

  async listProblems(options: DSAProblemFilterOptions) {
    return this.repository.listProblems(options);
  }

  async getProblemById(id: string) {
    return this.repository.getProblemById(id);
  }

  async createProblem(data: DSAProblemFormValues, adminUserId: string) {
    const problem = await this.repository.createProblem(data);

    await prisma.activityLog.create({
      data: {
        userId: adminUserId,
        action: 'CREATE_DSA_PROBLEM',
        details: {
          problemId: problem.id,
          title: problem.title,
          difficulty: problem.difficulty,
          platform: problem.platform,
        },
      },
    });

    return problem;
  }

  async updateProblem(id: string, data: DSAProblemFormValues, adminUserId: string) {
    const updated = await this.repository.updateProblem(id, data);

    await prisma.activityLog.create({
      data: {
        userId: adminUserId,
        action: 'UPDATE_DSA_PROBLEM',
        details: {
          problemId: updated.id,
          title: updated.title,
        },
      },
    });

    return updated;
  }

  async deleteProblem(id: string, adminUserId: string) {
    const deleted = await this.repository.deleteProblem(id);

    await prisma.activityLog.create({
      data: {
        userId: adminUserId,
        action: 'DELETE_DSA_PROBLEM',
        details: {
          problemId: id,
          title: deleted.title,
        },
      },
    });

    return deleted;
  }

  async listDomains() {
    return this.repository.listDomains();
  }
}
