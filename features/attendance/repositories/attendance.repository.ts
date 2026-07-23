import prisma from '@/lib/prisma';
import type { AttendanceStatus, AttendanceQueryStatus } from '@prisma/client';

export class AttendanceRepository {
  /**
   * Get all subjects available for marking attendance
   */
  static async getSubjects() {
    return prisma.subject.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        course: {
          select: {
            id: true,
            name: true,
            department: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
      orderBy: { code: 'asc' },
    });
  }

  /**
   * Get enrolled students for a specific subject
   */
  static async getStudentsForSubject(subjectId: string) {
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      select: { courseId: true, course: { select: { departmentId: true } } },
    });

    if (!subject) return [];

    return prisma.student.findMany({
      where: {
        departmentId: subject.course.departmentId,
      },
      select: {
        id: true,
        enrollmentNo: true,
        semester: true,
        section: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { enrollmentNo: 'asc' },
    });
  }

  /**
   * Get attendance records for a specific subject, date, and optional period
   */
  static async getAttendanceRecords(subjectId: string, date: Date, period?: number) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return prisma.attendance.findMany({
      where: {
        subjectId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        ...(period !== undefined && period !== null ? { period } : {}),
      },
      select: {
        id: true,
        studentId: true,
        status: true,
        period: true,
        markedById: true,
      },
    });
  }

  /**
   * Bulk save/upsert attendance records
   */
  static async saveAttendanceRecords(
    records: Array<{
      studentId: string;
      subjectId: string;
      date: Date;
      status: AttendanceStatus;
      period?: number;
    }>,
    markedById: string
  ) {
    const results = [];
    for (const record of records) {
      const startOfDay = new Date(record.date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(record.date);
      endOfDay.setHours(23, 59, 59, 999);

      const existing = await prisma.attendance.findFirst({
        where: {
          studentId: record.studentId,
          subjectId: record.subjectId,
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
          period: record.period ?? null,
        },
      });

      if (existing) {
        const updated = await prisma.attendance.update({
          where: { id: existing.id },
          data: {
            status: record.status,
            markedById,
            updatedAt: new Date(),
          },
        });
        results.push(updated);
      } else {
        const created = await prisma.attendance.create({
          data: {
            studentId: record.studentId,
            subjectId: record.subjectId,
            date: record.date,
            status: record.status,
            period: record.period ?? null,
            markedById,
          },
        });
        results.push(created);
      }
    }
    return results;
  }

  /**
   * Get student overall and per-subject attendance statistics
   */
  static async getStudentAttendanceSummary(studentId: string) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        departmentId: true,
        department: { select: { id: true, name: true, code: true } },
      },
    });

    if (!student) return null;

    const subjects = await prisma.subject.findMany({
      where: { course: { departmentId: student.departmentId } },
      select: { id: true, name: true, code: true },
    });

    const allRecords = await prisma.attendance.findMany({
      where: { studentId },
      select: { id: true, subjectId: true, status: true, date: true },
    });

    const totalClasses = allRecords.length;
    const attendedClasses = allRecords.filter(
      (r) => r.status === 'PRESENT' || r.status === 'EXCUSED'
    ).length;
    const overallPercentage = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 100;

    const subjectBreakdown = subjects.map((subj) => {
      const subjRecords = allRecords.filter((r) => r.subjectId === subj.id);
      const held = subjRecords.length;
      const attended = subjRecords.filter(
        (r) => r.status === 'PRESENT' || r.status === 'EXCUSED'
      ).length;
      const percentage = held > 0 ? (attended / held) * 100 : 100;

      return {
        subjectId: subj.id,
        name: subj.name,
        code: subj.code,
        classesHeld: held,
        classesAttended: attended,
        percentage: Math.round(percentage * 10) / 10,
      };
    });

    return {
      totalClasses,
      attendedClasses,
      overallPercentage: Math.round(overallPercentage * 10) / 10,
      subjectBreakdown,
    };
  }

  /**
   * Get detailed date-wise attendance log for a student
   */
  static async getStudentAttendanceLogs(studentId: string, subjectId?: string) {
    return prisma.attendance.findMany({
      where: {
        studentId,
        ...(subjectId ? { subjectId } : {}),
      },
      include: {
        subject: {
          select: { id: true, name: true, code: true },
        },
        markedBy: {
          select: { id: true, name: true, email: true },
        },
        queries: {
          select: {
            id: true,
            message: true,
            status: true,
            response: true,
            createdAt: true,
            resolvedAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: [{ date: 'desc' }, { period: 'desc' }],
    });
  }

  /**
   * Create an AttendanceQuery (dispute)
   */
  static async createAttendanceQuery(data: {
    attendanceRecordId: string;
    studentId: string;
    markedById?: string;
    message: string;
  }) {
    return prisma.attendanceQuery.create({
      data: {
        attendanceRecordId: data.attendanceRecordId,
        studentId: data.studentId,
        markedById: data.markedById,
        message: data.message,
        status: 'OPEN',
      },
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } },
            department: {
              include: {
                hod: {
                  include: {
                    user: { select: { name: true, email: true } },
                  },
                },
              },
            },
          },
        },
        attendanceRecord: {
          include: {
            subject: true,
            markedBy: true,
          },
        },
      },
    });
  }

  /**
   * Get queries assigned to coordinator or all open queries
   */
  static async getCoordinatorQueries(markedById?: string) {
    return prisma.attendanceQuery.findMany({
      where: markedById ? { OR: [{ markedById }, { markedById: null }] } : {},
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        attendanceRecord: {
          include: {
            subject: { select: { id: true, name: true, code: true } },
          },
        },
        markedBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Resolve or Reject an AttendanceQuery
   */
  static async resolveAttendanceQuery(
    queryId: string,
    status: AttendanceQueryStatus,
    response?: string
  ) {
    return prisma.attendanceQuery.update({
      where: { id: queryId },
      data: {
        status,
        response: response ?? null,
        resolvedAt: new Date(),
      },
    });
  }
}
