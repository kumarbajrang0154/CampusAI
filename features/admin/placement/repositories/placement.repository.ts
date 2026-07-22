import prisma from '@/lib/prisma';
import {
  PlacementDriveStatus,
  ApplicationStatus,
  InterviewMode,
  OfferStatus,
  Prisma,
} from '@prisma/client';

export class PlacementRepository {
  // ==================== Company CRUD ====================

  async createCompany(data: { name: string; website: string; industry: string }) {
    return prisma.company.create({
      data: {
        name: data.name,
        website: data.website,
        industry: data.industry,
      },
    });
  }

  async getCompanyById(id: string) {
    return prisma.company.findUnique({
      where: { id },
      include: {
        _count: {
          select: { drives: true },
        },
      },
    });
  }

  async listCompanies(params: { search?: string; page?: number; limit?: number }) {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = params.limit && params.limit > 0 ? params.limit : 10;
    const skip = (page - 1) * limit;

    const where: Prisma.CompanyWhereInput = params.search
      ? {
          OR: [
            { name: { contains: params.search, mode: 'insensitive' } },
            { industry: { contains: params.search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        include: {
          _count: {
            select: { drives: true },
          },
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.company.count({ where }),
    ]);

    return {
      companies,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async updateCompany(id: string, data: { name?: string; website?: string; industry?: string }) {
    return prisma.company.update({
      where: { id },
      data,
    });
  }

  async deleteCompany(id: string) {
    // Protective delete gate check
    const driveCount = await prisma.placementDrive.count({
      where: { companyId: id },
    });

    if (driveCount > 0) {
      throw new Error(
        `Cannot delete company with ${driveCount} linked placement drive(s). Delete or reassign the drives first.`
      );
    }

    return prisma.company.delete({
      where: { id },
    });
  }

  // ==================== Placement Drive CRUD ====================

  async createDrive(data: {
    companyId: string;
    packageOffered: number;
    eligibilityCGPA: number;
    allowedDepartments: string[];
    driveDate: Date;
    status: PlacementDriveStatus;
  }) {
    return prisma.placementDrive.create({
      data: {
        companyId: data.companyId,
        packageOffered: data.packageOffered,
        eligibilityCGPA: data.eligibilityCGPA,
        allowedDepartments: data.allowedDepartments,
        driveDate: data.driveDate,
        status: data.status,
      },
      include: {
        company: true,
      },
    });
  }

  async getDriveById(id: string) {
    return prisma.placementDrive.findUnique({
      where: { id },
      include: {
        company: true,
        _count: {
          select: { applications: true },
        },
      },
    });
  }

  async listDrives(params: {
    status?: PlacementDriveStatus;
    companyId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = params.limit && params.limit > 0 ? params.limit : 10;
    const skip = (page - 1) * limit;

    const where: Prisma.PlacementDriveWhereInput = {
      ...(params.status ? { status: params.status } : {}),
      ...(params.companyId ? { companyId: params.companyId } : {}),
      ...(params.search
        ? {
            company: {
              name: { contains: params.search, mode: 'insensitive' },
            },
          }
        : {}),
    };

    const [drives, total] = await Promise.all([
      prisma.placementDrive.findMany({
        where,
        include: {
          company: {
            select: { id: true, name: true, industry: true, website: true },
          },
          _count: {
            select: { applications: true },
          },
        },
        orderBy: { driveDate: 'desc' },
        skip,
        take: limit,
      }),
      prisma.placementDrive.count({ where }),
    ]);

    return {
      drives,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async updateDrive(
    id: string,
    data: {
      companyId?: string;
      packageOffered?: number;
      eligibilityCGPA?: number;
      allowedDepartments?: string[];
      driveDate?: Date;
      status?: PlacementDriveStatus;
    }
  ) {
    return prisma.placementDrive.update({
      where: { id },
      data,
      include: {
        company: true,
      },
    });
  }

  async deleteDrive(id: string) {
    return prisma.placementDrive.delete({
      where: { id },
    });
  }

  // ==================== Application Pipeline Operations ====================

  async listDriveApplications(driveId: string) {
    return prisma.application.findMany({
      where: { driveId },
      include: {
        student: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true },
            },
            department: {
              select: { id: true, name: true, code: true },
            },
          },
        },
        interview: true,
        offer: true,
      },
      orderBy: { appliedAt: 'desc' },
    });
  }

  async updateApplicationStatus(applicationId: string, status: ApplicationStatus) {
    return prisma.application.update({
      where: { id: applicationId },
      data: { status },
      include: {
        student: {
          include: { user: true },
        },
        interview: true,
        offer: true,
      },
    });
  }

  async upsertInterview(data: {
    applicationId: string;
    scheduledAt: Date;
    mode: InterviewMode;
    result?: string;
  }) {
    // Ensure application status is set to INTERVIEW
    await prisma.application.update({
      where: { id: data.applicationId },
      data: { status: 'INTERVIEW' },
    });

    return prisma.interview.upsert({
      where: { applicationId: data.applicationId },
      create: {
        applicationId: data.applicationId,
        scheduledAt: data.scheduledAt,
        mode: data.mode,
        result: data.result || null,
      },
      update: {
        scheduledAt: data.scheduledAt,
        mode: data.mode,
        result: data.result || null,
      },
    });
  }

  async upsertOffer(data: {
    applicationId: string;
    packageOffered: number;
    status: OfferStatus;
  }) {
    // Ensure application status is set to SELECTED
    await prisma.application.update({
      where: { id: data.applicationId },
      data: { status: 'SELECTED' },
    });

    return prisma.offer.upsert({
      where: { applicationId: data.applicationId },
      create: {
        applicationId: data.applicationId,
        packageOffered: data.packageOffered,
        status: data.status,
      },
      update: {
        packageOffered: data.packageOffered,
        status: data.status,
      },
    });
  }

  async createApplication(driveId: string, studentId: string) {
    // Check if application already exists
    const existing = await prisma.application.findFirst({
      where: { driveId, studentId },
    });

    if (existing) {
      return existing;
    }

    return prisma.application.create({
      data: {
        driveId,
        studentId,
        status: 'APPLIED',
      },
    });
  }

  // ==================== KPI Overview Stats ====================

  async getPlacementStats() {
    const [activeDrivesCount, totalApplicationsCount, offersReleasedCount, selectedCount] =
      await Promise.all([
        prisma.placementDrive.count({
          where: {
            status: { in: ['UPCOMING', 'ONGOING'] },
          },
        }),
        prisma.application.count(),
        prisma.offer.count({
          where: { status: 'RELEASED' },
        }),
        prisma.application.count({
          where: { status: 'SELECTED' },
        }),
      ]);

    const placementRate =
      totalApplicationsCount > 0
        ? Math.round((selectedCount / totalApplicationsCount) * 100)
        : 0;

    return {
      activeDrivesCount,
      totalApplicationsCount,
      offersReleasedCount,
      selectedCount,
      placementRate,
    };
  }
}
