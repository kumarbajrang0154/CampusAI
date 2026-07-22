'use server';

import { requirePermission } from '@/lib/auth-guard';
import { PlacementService } from '../services/placement.service';
import {
  createCompanySchema,
  updateCompanySchema,
  createPlacementDriveSchema,
  updatePlacementDriveSchema,
  updateApplicationStatusSchema,
  scheduleInterviewSchema,
  releaseOfferSchema,
  CreateCompanyInput,
  UpdateCompanyInput,
  CreatePlacementDriveInput,
  UpdatePlacementDriveInput,
  ScheduleInterviewInput,
  ReleaseOfferInput,
} from '../schemas/placement.schema';
import { PlacementDriveStatus, ApplicationStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const placementService = new PlacementService();

// ==================== Company Actions ====================

export async function createCompanyAction(data: CreateCompanyInput) {
  try {
    const session = await requirePermission('placement.manage');
    const validated = createCompanySchema.parse(data);
    const company = await placementService.createCompany(validated, session.user.id);

    revalidatePath('/admin/placement');

    return {
      success: true,
      message: 'Company created successfully.',
      data: company,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to create company.',
    };
  }
}

export async function updateCompanyAction(id: string, data: UpdateCompanyInput) {
  try {
    const session = await requirePermission('placement.manage');
    const validated = updateCompanySchema.parse(data);
    const company = await placementService.updateCompany(id, validated, session.user.id);

    revalidatePath('/admin/placement');

    return {
      success: true,
      message: 'Company updated successfully.',
      data: company,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to update company.',
    };
  }
}

export async function deleteCompanyAction(id: string) {
  try {
    const session = await requirePermission('placement.manage');
    await placementService.deleteCompany(id, session.user.id);

    revalidatePath('/admin/placement');

    return {
      success: true,
      message: 'Company deleted successfully.',
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to delete company.',
    };
  }
}

export async function listCompaniesAction(params: { search?: string; page?: number; limit?: number }) {
  try {
    await requirePermission('placement.view');
    const result = await placementService.listCompanies(params);

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to fetch companies.',
    };
  }
}

// ==================== Drive Actions ====================

export async function createDriveAction(data: CreatePlacementDriveInput) {
  try {
    const session = await requirePermission('placement.manage');
    const validated = createPlacementDriveSchema.parse(data);
    const drive = await placementService.createDrive(validated, session.user.id);

    revalidatePath('/admin/placement');

    return {
      success: true,
      message: 'Placement drive created successfully.',
      data: drive,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to create placement drive.',
    };
  }
}

export async function updateDriveAction(id: string, data: UpdatePlacementDriveInput) {
  try {
    const session = await requirePermission('placement.manage');
    const validated = updatePlacementDriveSchema.parse(data);
    const drive = await placementService.updateDrive(id, validated, session.user.id);

    revalidatePath('/admin/placement');

    return {
      success: true,
      message: 'Placement drive updated successfully.',
      data: drive,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to update placement drive.',
    };
  }
}

export async function deleteDriveAction(id: string) {
  try {
    const session = await requirePermission('placement.manage');
    await placementService.deleteDrive(id, session.user.id);

    revalidatePath('/admin/placement');

    return {
      success: true,
      message: 'Placement drive deleted successfully.',
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to delete placement drive.',
    };
  }
}

export async function listDrivesAction(params: {
  status?: PlacementDriveStatus;
  companyId?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  try {
    await requirePermission('placement.view');
    const result = await placementService.listDrives(params);

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to fetch placement drives.',
    };
  }
}

// ==================== Application Pipeline Actions ====================

export async function listDriveApplicationsAction(driveId: string) {
  try {
    await requirePermission('placement.view');
    const applications = await placementService.listDriveApplications(driveId);

    return {
      success: true,
      data: applications,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to fetch applications.',
    };
  }
}

export async function updateApplicationStatusAction(applicationId: string, status: ApplicationStatus) {
  try {
    const session = await requirePermission('placement.manage');
    const validated = updateApplicationStatusSchema.parse({ applicationId, status });
    const updated = await placementService.updateApplicationStatus(
      validated.applicationId,
      validated.status,
      session.user.id
    );

    revalidatePath('/admin/placement');

    return {
      success: true,
      message: `Application status updated to ${status}.`,
      data: updated,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to update application status.',
    };
  }
}

export async function scheduleInterviewAction(data: ScheduleInterviewInput) {
  try {
    const session = await requirePermission('placement.manage');
    const validated = scheduleInterviewSchema.parse(data);
    const interview = await placementService.scheduleInterview(validated, session.user.id);

    revalidatePath('/admin/placement');

    return {
      success: true,
      message: 'Interview scheduled successfully.',
      data: interview,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to schedule interview.',
    };
  }
}

export async function releaseOfferAction(data: ReleaseOfferInput) {
  try {
    const session = await requirePermission('placement.manage');
    const validated = releaseOfferSchema.parse(data);
    const offer = await placementService.releaseOffer(validated, session.user.id);

    revalidatePath('/admin/placement');

    return {
      success: true,
      message: 'Offer released successfully.',
      data: offer,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to release offer.',
    };
  }
}

export async function adminCreateApplicationAction(driveId: string, studentId: string) {
  try {
    await requirePermission('placement.manage');
    const application = await placementService.createApplication(driveId, studentId);

    revalidatePath('/admin/placement');

    return {
      success: true,
      message: 'Student application created successfully.',
      data: application,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to create student application.',
    };
  }
}

// ==================== KPI Overview Action ====================

export async function getPlacementOverviewStatsAction() {
  try {
    await requirePermission('placement.view');
    const stats = await placementService.getPlacementStats();

    return {
      success: true,
      data: stats,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to fetch placement stats.',
      data: {
        activeDrivesCount: 0,
        totalApplicationsCount: 0,
        offersReleasedCount: 0,
        selectedCount: 0,
        placementRate: 0,
      },
    };
  }
}
