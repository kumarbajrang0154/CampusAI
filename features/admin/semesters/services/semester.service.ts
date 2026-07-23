import { SemesterRepository, SemesterFilterOptions } from '../repositories/semester.repository';
import { SemesterFormValues } from '../schemas/semester.schema';
import prisma from '@/lib/prisma';

export class SemesterService {
  private repository: SemesterRepository;

  constructor() {
    this.repository = new SemesterRepository();
  }

  async listSemesters(options: SemesterFilterOptions) {
    return this.repository.listSemesters(options);
  }

  async getSemesterById(id: string) {
    return this.repository.getSemesterById(id);
  }

  async createSemester(data: SemesterFormValues, adminUserId: string) {
    const semester = await this.repository.createSemester(data);

    // Audit log entry
    await prisma.activityLog.create({
      data: {
        userId: adminUserId,
        action: 'CREATE_SEMESTER',
        details: {
          semesterId: semester.id,
          name: semester.name,
          academicYear: semester.academicYear,
          isCurrent: semester.isCurrent,
        },
      },
    });

    return semester;
  }

  async updateSemester(id: string, data: SemesterFormValues, adminUserId: string) {
    const updated = await this.repository.updateSemester(id, data);

    await prisma.activityLog.create({
      data: {
        userId: adminUserId,
        action: 'UPDATE_SEMESTER',
        details: {
          semesterId: updated.id,
          name: updated.name,
          isCurrent: updated.isCurrent,
        },
      },
    });

    return updated;
  }

  async setAsCurrent(id: string, adminUserId: string) {
    const updated = await this.repository.setAsCurrent(id);

    await prisma.activityLog.create({
      data: {
        userId: adminUserId,
        action: 'SET_CURRENT_SEMESTER',
        details: {
          semesterId: updated.id,
          name: updated.name,
        },
      },
    });

    return updated;
  }

  async checkDeleteBlocks(id: string) {
    return this.repository.checkDeleteBlocks(id);
  }

  async deleteSemester(id: string, adminUserId: string) {
    const deleted = await this.repository.deleteSemester(id);

    await prisma.activityLog.create({
      data: {
        userId: adminUserId,
        action: 'DELETE_SEMESTER',
        details: {
          semesterId: id,
          name: deleted.name,
        },
      },
    });

    return deleted;
  }
}
