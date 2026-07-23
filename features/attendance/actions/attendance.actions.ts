'use server';

import { auth } from '@/lib/auth';
import { AttendanceRepository } from '../repositories/attendance.repository';
import { sendDisputeNotificationEmail } from '../services/dispute-email.service';
import type { AttendanceStatus, AttendanceQueryStatus } from '@prisma/client';
import prisma from '@/lib/prisma';

/**
 * Check if the logged-in user has the MARK_ATTENDANCE permission
 */
async function checkCoordinatorPermission() {
  const session = await auth();
  if (!session?.user?.id) {
    return { authorized: false, reason: 'Unauthorized: Not logged in' };
  }

  const permissions = session.user.permissions ?? [];
  const isAuthorized = permissions.includes('MARK_ATTENDANCE') || session.user.role === 'ADMIN';

  if (!isAuthorized) {
    return { authorized: false, reason: 'Forbidden: Missing MARK_ATTENDANCE permission' };
  }

  return { authorized: true, user: session.user };
}

/**
 * Get data for the Attendance Coordinator marking screen
 */
export async function getCoordinatorDataAction(subjectId?: string, dateStr?: string, period?: number) {
  const perm = await checkCoordinatorPermission();
  if (!perm.authorized) {
    throw new Error(perm.reason);
  }

  const subjects = await AttendanceRepository.getSubjects();

  let enrolledStudents: Awaited<ReturnType<typeof AttendanceRepository.getStudentsForSubject>> = [];
  let existingRecords: Awaited<ReturnType<typeof AttendanceRepository.getAttendanceRecords>> = [];

  if (subjectId) {
    enrolledStudents = await AttendanceRepository.getStudentsForSubject(subjectId);
    const queryDate = dateStr ? new Date(dateStr) : new Date();
    existingRecords = await AttendanceRepository.getAttendanceRecords(subjectId, queryDate, period);
  }

  const queries = await AttendanceRepository.getCoordinatorQueries(perm.user!.id);

  return {
    subjects,
    enrolledStudents,
    existingRecords,
    queries,
  };
}

/**
 * Submit bulk attendance records as an Attendance Coordinator
 */
export async function markAttendanceAction(data: {
  subjectId: string;
  dateStr: string;
  period?: number;
  records: Array<{ studentId: string; status: AttendanceStatus }>;
}) {
  const perm = await checkCoordinatorPermission();
  if (!perm.authorized) {
    return { success: false, error: perm.reason };
  }

  const date = new Date(data.dateStr);

  const formattedRecords = data.records.map((r) => ({
    studentId: r.studentId,
    subjectId: data.subjectId,
    date,
    status: r.status,
    period: data.period,
  }));

  try {
    const saved = await AttendanceRepository.saveAttendanceRecords(formattedRecords, perm.user!.id);
    return { success: true, count: saved.length };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to mark attendance';
    return { success: false, error: msg };
  }
}

/**
 * Get attendance overview for the logged-in student (Enforces strict student isolation)
 */
export async function getStudentAttendanceOverviewAction(subjectIdFilter?: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  // Fetch student profile for logged-in user
  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
  });

  if (!student) {
    throw new Error('Student profile not found for current user');
  }

  const summary = await AttendanceRepository.getStudentAttendanceSummary(student.id);
  const logs = await AttendanceRepository.getStudentAttendanceLogs(student.id, subjectIdFilter);

  return {
    summary,
    logs,
    studentId: student.id,
  };
}

/**
 * Raise a query/dispute for an attendance record (Student action)
 */
export async function raiseAttendanceQueryAction(data: {
  attendanceRecordId: string;
  message: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
    include: {
      user: true,
    },
  });

  if (!student) {
    return { success: false, error: 'Student profile not found' };
  }

  // Security check: verify the attendance record belongs to this student
  const record = await prisma.attendance.findUnique({
    where: { id: data.attendanceRecordId },
    include: {
      subject: true,
      markedBy: true,
    },
  });

  if (!record || record.studentId !== student.id) {
    return { success: false, error: 'Attendance record not found or access denied' };
  }

  try {
    const query = await AttendanceRepository.createAttendanceQuery({
      attendanceRecordId: data.attendanceRecordId,
      studentId: student.id,
      markedById: record.markedById ?? undefined,
      message: data.message,
    });

    // Resolve coordinator & HOD emails
    let coordinatorEmail = record.markedBy?.email ?? null;
    let hodEmail: string | null = null;

    const deptHod = await prisma.hOD.findFirst({
      where: { departmentId: student.departmentId },
      include: { user: { select: { email: true } } },
    });

    if (deptHod?.user?.email) {
      hodEmail = deptHod.user.email;
    }

    const dateFormatted = new Date(record.date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    // Send email with Reply-To
    const emailResult = await sendDisputeNotificationEmail({
      queryId: query.id,
      studentName: student.user.name || 'Student',
      studentEmail: student.user.email,
      enrollmentNo: student.enrollmentNo,
      subjectName: record.subject.name,
      subjectCode: record.subject.code,
      dateStr: dateFormatted,
      period: record.period,
      message: data.message,
      coordinatorEmail,
      hodEmail,
    });

    return {
      success: true,
      queryId: query.id,
      emailSent: emailResult.success,
      warning: emailResult.error
        ? `Query submitted successfully, but email dispatch notice: ${emailResult.error}`
        : null,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to submit query';
    return { success: false, error: msg };
  }
}

/**
 * Coordinator action to respond and resolve/reject a dispute
 */
export async function respondToQueryAction(data: {
  queryId: string;
  status: AttendanceQueryStatus;
  response?: string;
}) {
  const perm = await checkCoordinatorPermission();
  if (!perm.authorized) {
    return { success: false, error: perm.reason };
  }

  try {
    const updated = await AttendanceRepository.resolveAttendanceQuery(
      data.queryId,
      data.status,
      data.response
    );
    return { success: true, updated };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to resolve query';
    return { success: false, error: msg };
  }
}
