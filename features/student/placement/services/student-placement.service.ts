import { StudentPlacementRepository } from '../repositories/student-placement.repository';
import { DSAProblemStatus } from '@prisma/client';

export class StudentPlacementService {
  private repository: StudentPlacementRepository;

  constructor() {
    this.repository = new StudentPlacementRepository();
  }

  async getStudentIdByUserId(userId: string) {
    const student = await this.repository.getStudentByUserId(userId);
    return student.id;
  }

  async getPlacementProfile(studentId: string) {
    return this.repository.getPlacementProfile(studentId);
  }

  async selectDomainAndGenerateRoadmap(studentId: string, domainId: string) {
    return this.repository.setDomainAndGenerateRoadmap(studentId, domainId);
  }

  async toggleStageCompletion(studentId: string, stageId: string) {
    return this.repository.toggleStageCompletion(studentId, stageId);
  }

  async listDomainDSAProblems(studentId: string, domainId: string) {
    return this.repository.listDomainDSAProblems(studentId, domainId);
  }

  async updateProblemProgress(studentId: string, problemId: string, status: DSAProblemStatus) {
    return this.repository.updateProblemProgress(studentId, problemId, status);
  }

  async listActiveDomains() {
    return this.repository.listActiveDomains();
  }
}
