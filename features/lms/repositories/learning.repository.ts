import prisma from '@/lib/prisma';
import type { ResourceType, NotesRequestStatus } from '@prisma/client';

export class LearningRepository {
  /**
   * Get subjects taught by a faculty member
   */
  static async getFacultySubjects(facultyId: string) {
    return prisma.subject.findMany({
      where: { facultyId },
      include: {
        course: {
          select: { name: true, department: { select: { code: true, name: true } } },
        },
      },
      orderBy: { code: 'asc' },
    });
  }

  /**
   * Create a new LearningResource
   */
  static async createLearningResource(data: {
    subjectId: string;
    facultyId?: string | null;
    title: string;
    description?: string;
    type: ResourceType;
    fileUrl: string;
  }) {
    return prisma.learningResource.create({
      data: {
        subjectId: data.subjectId,
        facultyId: data.facultyId ?? null,
        title: data.title,
        description: data.description ?? null,
        type: data.type,
        fileUrl: data.fileUrl,
      },
      include: {
        subject: { select: { id: true, name: true, code: true } },
      },
    });
  }

  /**
   * Get learning resources uploaded by a faculty member
   */
  static async getFacultyResources(facultyId: string, subjectId?: string) {
    return prisma.learningResource.findMany({
      where: {
        facultyId,
        ...(subjectId ? { subjectId } : {}),
      },
      include: {
        subject: { select: { id: true, name: true, code: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Delete a learning resource owned by a faculty member
   */
  static async deleteLearningResource(resourceId: string, facultyId: string) {
    const resource = await prisma.learningResource.findUnique({
      where: { id: resourceId },
    });

    if (!resource || resource.facultyId !== facultyId) {
      throw new Error('Resource not found or unauthorized to delete');
    }

    return prisma.learningResource.delete({
      where: { id: resourceId },
    });
  }

  /**
   * Get NotesRequests for a faculty member's subjects
   */
  static async getFacultyNotesRequests(facultyId: string) {
    return prisma.notesRequest.findMany({
      where: {
        OR: [
          { facultyId },
          { subject: { facultyId } },
        ],
      },
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        subject: { select: { id: true, name: true, code: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Resolve a NotesRequest (FULFILLED or DECLINED)
   */
  static async resolveNotesRequest(requestId: string, status: NotesRequestStatus) {
    return prisma.notesRequest.update({
      where: { id: requestId },
      data: {
        status,
        resolvedAt: new Date(),
      },
    });
  }

  /**
   * Get enrolled subjects for a student
   */
  static async getStudentEnrolledSubjects(studentId: string) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { departmentId: true },
    });

    if (!student) return [];

    return prisma.subject.findMany({
      where: { course: { departmentId: student.departmentId } },
      include: {
        faculty: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { code: 'asc' },
    });
  }

  /**
   * Get learning resources for a student's enrolled subjects
   */
  static async getStudentLearningResources(studentId: string, subjectId?: string, typeFilter?: ResourceType) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { departmentId: true },
    });

    if (!student) return [];

    return prisma.learningResource.findMany({
      where: {
        subject: { course: { departmentId: student.departmentId } },
        ...(subjectId ? { subjectId } : {}),
        ...(typeFilter ? { type: typeFilter } : {}),
      },
      include: {
        subject: { select: { id: true, name: true, code: true } },
        faculty: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Create a NotesRequest and send in-app Notification to target faculty
   */
  static async createNotesRequest(data: {
    studentId: string;
    subjectId: string;
    facultyId?: string;
    message: string;
  }) {
    const request = await prisma.notesRequest.create({
      data: {
        studentId: data.studentId,
        subjectId: data.subjectId,
        facultyId: data.facultyId ?? null,
        message: data.message,
        status: 'PENDING',
      },
      include: {
        student: { include: { user: { select: { id: true, name: true } } } },
        subject: { select: { name: true, code: true } },
        faculty: { include: { user: { select: { id: true } } } },
      },
    });

    // Send in-app notification to target faculty user if available
    const targetUserId = request.faculty?.user?.id;

    if (targetUserId) {
      await prisma.notification.create({
        data: {
          userId: targetUserId,
          senderId: request.student.user.id,
          title: `Notes Requested: ${request.subject.code}`,
          message: `${request.student.user.name || 'A student'} requested notes for ${request.subject.name}: "${data.message}"`,
          type: 'ANNOUNCEMENT',
        },
      });
    }

    return request;
  }
}
