import prisma from '@/lib/prisma';
import type { SubmissionStatus } from '@prisma/client';

export class AssignmentRepository {
  /**
   * Create an assignment
   */
  static async createAssignment(data: {
    subjectId: string;
    facultyId: string;
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    maxMarks: number;
    attachmentUrl?: string;
  }) {
    return prisma.assignment.create({
      data: {
        subjectId: data.subjectId,
        facultyId: data.facultyId,
        title: data.title,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        maxMarks: data.maxMarks,
        attachmentUrl: data.attachmentUrl ?? null,
      },
      include: {
        subject: { select: { id: true, name: true, code: true } },
      },
    });
  }

  /**
   * Get assignments created by a faculty member
   */
  static async getFacultyAssignments(facultyId: string, subjectId?: string) {
    return prisma.assignment.findMany({
      where: {
        facultyId,
        ...(subjectId ? { subjectId } : {}),
      },
      include: {
        subject: { select: { id: true, name: true, code: true } },
        _count: { select: { submissions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get assignments for a student's enrolled department subjects
   */
  static async getStudentAssignments(studentId: string) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { departmentId: true },
    });

    if (!student) return [];

    return prisma.assignment.findMany({
      where: {
        subject: { course: { departmentId: student.departmentId } },
      },
      include: {
        subject: { select: { id: true, name: true, code: true } },
        faculty: {
          include: { user: { select: { name: true } } },
        },
        submissions: {
          where: { studentId },
        },
      },
      orderBy: { endDate: 'asc' },
    });
  }

  /**
   * Upsert a student's submission
   */
  static async submitAssignment(data: {
    assignmentId: string;
    studentId: string;
    fileUrl?: string;
    textContent?: string;
    status: SubmissionStatus;
  }) {
    return prisma.submission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId: data.assignmentId,
          studentId: data.studentId,
        },
      },
      update: {
        fileUrl: data.fileUrl ?? null,
        textContent: data.textContent ?? null,
        status: data.status,
        submittedAt: new Date(),
      },
      create: {
        assignmentId: data.assignmentId,
        studentId: data.studentId,
        fileUrl: data.fileUrl ?? null,
        textContent: data.textContent ?? null,
        status: data.status,
      },
    });
  }
}
