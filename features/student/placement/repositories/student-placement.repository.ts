import prisma from '@/lib/prisma';
import { DSAProblemStatus } from '@prisma/client';
import { generatePlacementRoadmap } from '@/lib/ai/ai-gateway';

export class StudentPlacementRepository {
  async getStudentByUserId(userId: string) {
    const student = await prisma.student.findUnique({
      where: { userId },
      select: { id: true, userId: true },
    });
    if (!student) throw new Error('Student profile not found.');
    return student;
  }

  async getPlacementProfile(studentId: string) {
    let profile = await prisma.studentPlacementProfile.findUnique({
      where: { studentId },
      include: {
        domain: true,
        roadmapStages: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!profile) {
      profile = await prisma.studentPlacementProfile.create({
        data: {
          studentId,
        },
        include: {
          domain: true,
          roadmapStages: {
            orderBy: { order: 'asc' },
          },
        },
      });
    }

    return profile;
  }

  async setDomainAndGenerateRoadmap(studentId: string, domainId: string) {
    const domain = await prisma.placementDomain.findUnique({
      where: { id: domainId },
    });

    if (!domain) {
      throw new Error('Selected placement domain not found.');
    }

    // Call real Gemini API (or defensive fallback) for structured stages
    const generatedStages = await generatePlacementRoadmap(domain.name, domain.description);

    // 1. Upsert student placement profile
    const profile = await prisma.studentPlacementProfile.upsert({
      where: { studentId },
      update: {
        domainId: domain.id,
        roadmapGeneratedAt: new Date(),
      },
      create: {
        studentId,
        domainId: domain.id,
        roadmapGeneratedAt: new Date(),
      },
    });

    // 2. Clear previous stages
    await prisma.roadmapStage.deleteMany({
      where: { studentPlacementProfileId: profile.id },
    });

    // 3. Insert new AI roadmap stages
    await prisma.roadmapStage.createMany({
      data: generatedStages.map((stage) => ({
        studentPlacementProfileId: profile.id,
        order: stage.order,
        title: stage.title,
        description: stage.description,
        durationLabel: stage.durationLabel,
        isCompleted: false,
      })),
    });

    // 4. Return complete updated profile
    return prisma.studentPlacementProfile.findUnique({
      where: { id: profile.id },
      include: {
        domain: true,
        roadmapStages: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async toggleStageCompletion(studentId: string, stageId: string) {
    // Ownership check: ensure stage belongs to student's profile
    const stage = await prisma.roadmapStage.findUnique({
      where: { id: stageId },
      include: {
        profile: { select: { studentId: true } },
      },
    });

    if (!stage || stage.profile.studentId !== studentId) {
      throw new Error('Roadmap stage not found or unauthorized.');
    }

    return prisma.roadmapStage.update({
      where: { id: stageId },
      data: {
        isCompleted: !stage.isCompleted,
      },
    });
  }

  async listDomainDSAProblems(studentId: string, domainId: string) {
    const [problems, userProgress] = await Promise.all([
      prisma.dSAProblem.findMany({
        where: { domainId },
        orderBy: { order: 'asc' },
      }),
      prisma.studentProblemProgress.findMany({
        where: { studentId },
      }),
    ]);

    const progressMap = new Map(userProgress.map((p) => [p.problemId, p.status]));

    return problems.map((prob) => ({
      ...prob,
      userStatus: progressMap.get(prob.id) || DSAProblemStatus.NOT_STARTED,
    }));
  }

  async updateProblemProgress(studentId: string, problemId: string, status: DSAProblemStatus) {
    // Verify problem exists
    const problem = await prisma.dSAProblem.findUnique({ where: { id: problemId } });
    if (!problem) throw new Error('DSA problem not found.');

    return prisma.studentProblemProgress.upsert({
      where: {
        studentId_problemId: {
          studentId,
          problemId,
        },
      },
      update: { status },
      create: {
        studentId,
        problemId,
        status,
      },
    });
  }

  async listActiveDomains() {
    return prisma.placementDomain.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }
}
