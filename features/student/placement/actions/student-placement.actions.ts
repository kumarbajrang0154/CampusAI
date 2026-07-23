'use server';

import { requireRole } from '@/lib/auth-guard';
import { StudentPlacementService } from '../services/student-placement.service';
import { DSAProblemStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const placementService = new StudentPlacementService();

export async function getStudentPlacementProfileInfoAction() {
  try {
    const session = await requireRole(['STUDENT']);
    const studentId = await placementService.getStudentIdByUserId(session.user.id);
    const profile = await placementService.getPlacementProfile(studentId);

    return {
      success: true,
      data: profile,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to retrieve placement profile.',
    };
  }
}

export async function selectDomainAndGenerateRoadmapAction(domainId: string) {
  try {
    const session = await requireRole(['STUDENT']);
    const studentId = await placementService.getStudentIdByUserId(session.user.id);
    const updatedProfile = await placementService.selectDomainAndGenerateRoadmap(studentId, domainId);

    revalidatePath('/student/placement');
    revalidatePath('/student/dashboard');

    return {
      success: true,
      message: 'Placement domain selected & AI roadmap generated successfully!',
      data: updatedProfile,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to generate placement roadmap.',
    };
  }
}

export async function toggleRoadmapStageAction(stageId: string) {
  try {
    const session = await requireRole(['STUDENT']);
    const studentId = await placementService.getStudentIdByUserId(session.user.id);
    const updatedStage = await placementService.toggleStageCompletion(studentId, stageId);

    revalidatePath('/student/placement');
    revalidatePath('/student/dashboard');

    return {
      success: true,
      data: updatedStage,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to update stage completion.',
    };
  }
}

export async function getDomainDSAProblemsAction(domainId: string) {
  try {
    const session = await requireRole(['STUDENT']);
    const studentId = await placementService.getStudentIdByUserId(session.user.id);
    const problems = await placementService.listDomainDSAProblems(studentId, domainId);

    return {
      success: true,
      data: problems,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to fetch DSA problems.',
    };
  }
}

export async function updateDSAProblemProgressAction(problemId: string, status: DSAProblemStatus) {
  try {
    const session = await requireRole(['STUDENT']);
    const studentId = await placementService.getStudentIdByUserId(session.user.id);
    const updated = await placementService.updateProblemProgress(studentId, problemId, status);

    revalidatePath('/student/placement');
    revalidatePath('/student/dashboard');

    return {
      success: true,
      message: 'DSA Problem progress updated.',
      data: updated,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to update problem progress.',
    };
  }
}

export async function listPlacementDomainsPublicAction() {
  try {
    await requireRole(['STUDENT']);
    const domains = await placementService.listActiveDomains();

    return {
      success: true,
      data: domains,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to list domains.',
    };
  }
}
