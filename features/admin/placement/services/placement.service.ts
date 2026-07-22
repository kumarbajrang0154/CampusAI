import { PlacementRepository } from '../repositories/placement.repository';
import {
  CreateCompanyInput,
  UpdateCompanyInput,
  CreatePlacementDriveInput,
  UpdatePlacementDriveInput,
  ScheduleInterviewInput,
  ReleaseOfferInput,
} from '../schemas/placement.schema';
import { PlacementDriveStatus, ApplicationStatus } from '@prisma/client';
import prisma from '@/lib/prisma';

export class PlacementService {
  private repository: PlacementRepository;

  constructor() {
    this.repository = new PlacementRepository();
  }

  // Company Services
  async createCompany(data: CreateCompanyInput, actorUserId?: string) {
    const company = await this.repository.createCompany(data);
    if (actorUserId) {
      await prisma.activityLog.create({
        data: {
          userId: actorUserId,
          action: 'COMPANY_CREATE',
          details: { companyId: company.id, name: company.name, industry: company.industry },
        },
      });
    }
    return company;
  }

  async getCompanyById(id: string) {
    const company = await this.repository.getCompanyById(id);
    if (!company) {
      throw new Error('Company not found.');
    }
    return company;
  }

  async listCompanies(params: { search?: string; page?: number; limit?: number }) {
    return this.repository.listCompanies(params);
  }

  async updateCompany(id: string, data: UpdateCompanyInput, actorUserId?: string) {
    await this.getCompanyById(id);
    const updated = await this.repository.updateCompany(id, data);
    if (actorUserId) {
      await prisma.activityLog.create({
        data: {
          userId: actorUserId,
          action: 'COMPANY_UPDATE',
          details: { companyId: id, name: updated.name },
        },
      });
    }
    return updated;
  }

  async deleteCompany(id: string, actorUserId?: string) {
    const company = await this.getCompanyById(id);
    const result = await this.repository.deleteCompany(id);
    if (actorUserId) {
      await prisma.activityLog.create({
        data: {
          userId: actorUserId,
          action: 'COMPANY_DELETE',
          details: { companyId: id, name: company.name },
        },
      });
    }
    return result;
  }

  // Placement Drive Services
  async createDrive(data: CreatePlacementDriveInput, actorUserId?: string) {
    const drive = await this.repository.createDrive(data);
    if (actorUserId) {
      await prisma.activityLog.create({
        data: {
          userId: actorUserId,
          action: 'PLACEMENT_DRIVE_CREATE',
          details: { driveId: drive.id, companyId: drive.companyId, packageOffered: drive.packageOffered },
        },
      });
    }
    return drive;
  }

  async getDriveById(id: string) {
    const drive = await this.repository.getDriveById(id);
    if (!drive) {
      throw new Error('Placement drive not found.');
    }
    return drive;
  }

  async listDrives(params: {
    status?: PlacementDriveStatus;
    companyId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    return this.repository.listDrives(params);
  }

  async updateDrive(id: string, data: UpdatePlacementDriveInput, actorUserId?: string) {
    await this.getDriveById(id);
    const updated = await this.repository.updateDrive(id, data);
    if (actorUserId) {
      await prisma.activityLog.create({
        data: {
          userId: actorUserId,
          action: 'PLACEMENT_DRIVE_UPDATE',
          details: { driveId: id, status: updated.status, packageOffered: updated.packageOffered },
        },
      });
    }
    return updated;
  }

  async deleteDrive(id: string, actorUserId?: string) {
    await this.getDriveById(id);
    const result = await this.repository.deleteDrive(id);
    if (actorUserId) {
      await prisma.activityLog.create({
        data: {
          userId: actorUserId,
          action: 'PLACEMENT_DRIVE_DELETE',
          details: { driveId: id },
        },
      });
    }
    return result;
  }

  // Application Pipeline Services
  async listDriveApplications(driveId: string) {
    await this.getDriveById(driveId);
    return this.repository.listDriveApplications(driveId);
  }

  async updateApplicationStatus(applicationId: string, status: ApplicationStatus, actorUserId?: string) {
    const updated = await this.repository.updateApplicationStatus(applicationId, status);
    if (actorUserId) {
      await prisma.activityLog.create({
        data: {
          userId: actorUserId,
          targetUserId: updated.student.userId,
          action: 'PLACEMENT_APPLICATION_STATUS_UPDATE',
          details: { applicationId, newStatus: status, studentName: updated.student.user.name },
        },
      });
    }
    return updated;
  }

  async scheduleInterview(data: ScheduleInterviewInput, actorUserId?: string) {
    const interview = await this.repository.upsertInterview(data);
    if (actorUserId) {
      await prisma.activityLog.create({
        data: {
          userId: actorUserId,
          action: 'PLACEMENT_INTERVIEW_SCHEDULE',
          details: { applicationId: data.applicationId, mode: data.mode, scheduledAt: data.scheduledAt },
        },
      });
    }
    return interview;
  }

  async releaseOffer(data: ReleaseOfferInput, actorUserId?: string) {
    const offer = await this.repository.upsertOffer(data);
    if (actorUserId) {
      await prisma.activityLog.create({
        data: {
          userId: actorUserId,
          action: 'PLACEMENT_OFFER_RELEASE',
          details: { applicationId: data.applicationId, packageOffered: data.packageOffered, status: data.status },
        },
      });
    }
    return offer;
  }

  async createApplication(driveId: string, studentId: string) {
    return this.repository.createApplication(driveId, studentId);
  }

  // Placement KPI Stats
  async getPlacementStats() {
    return this.repository.getPlacementStats();
  }
}
