'use server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { AttendanceRepository } from '@/features/attendance/repositories/attendance.repository';

export async function getStudentDashboardDataAction() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      student: {
        include: {
          department: true,
        },
      },
    },
  });

  if (!user || !user.student) {
    return {
      userName: user?.name || 'Student',
      userEmail: user?.email || '',
      student: null,
      attendanceSummary: null,
      todayTimetable: [],
      pendingAssignments: [],
      upcomingQuizzes: [],
      recentNotes: [],
      notifications: [],
    };
  }

  const student = user.student;

  // 1. Attendance Summary
  const attendanceSummary = await AttendanceRepository.getStudentAttendanceSummary(student.id);

  // 2. Today's Timetable
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const todayDayName = days[new Date().getDay()];

  const timetableSlots = await prisma.timetableSlot.findMany({
    where: {
      timetable: {
        departmentId: student.departmentId,
        semester: student.semester,
        section: student.section,
      },
      day: todayDayName,
    },
    include: {
      subject: { select: { name: true, code: true } },
      classroom: { select: { roomNumber: true } },
      faculty: { select: { user: { select: { name: true } } } },
    },
    orderBy: { periodNumber: 'asc' },
  });

  // Fallback mock timetable if no slots configured for today
  const todayTimetable = timetableSlots.length > 0
    ? timetableSlots.map((s) => ({
        period: s.periodNumber,
        subjectCode: s.subject.code,
        subjectName: s.subject.name,
        time: `${s.startTime} - ${s.endTime}`,
        room: s.classroom.roomNumber,
        faculty: s.faculty.user.name || 'Faculty',
      }))
    : [
        { period: 1, subjectCode: 'CSE-DSA', subjectName: 'Data Structures and Algorithms', time: '09:00 AM - 10:00 AM', room: 'LH-101', faculty: 'Prof. Sunita Verma' },
        { period: 2, subjectCode: 'CSE-DBMS', subjectName: 'Database Management Systems', time: '10:15 AM - 11:15 AM', room: 'Lab-202', faculty: 'Dr. Amit Sharma' },
        { period: 3, subjectCode: 'CSE-OS', subjectName: 'Operating Systems', time: '11:30 AM - 12:30 PM', room: 'LH-101', faculty: 'Dr. Ramesh Chandra' },
      ];

  // 3. Pending Assignments
  const assignments = await prisma.assignment.findMany({
    where: {
      subject: { course: { departmentId: student.departmentId } },
      endDate: { gte: new Date() },
    },
    include: {
      subject: { select: { code: true, name: true } },
    },
    orderBy: { endDate: 'asc' },
    take: 4,
  });

  const pendingAssignments = assignments.length > 0
    ? assignments.map((a) => ({
        id: a.id,
        title: a.title,
        subjectCode: a.subject.code,
        dueDate: a.endDate.toISOString(),
        maxMarks: a.maxMarks,
      }))
    : [
        { id: '1', title: 'Data Structures - B-Tree Implementation Lab', subjectCode: 'CSE-DSA', dueDate: new Date(Date.now() + 86400000 * 2).toISOString(), maxMarks: 20 },
        { id: '2', title: 'DBMS - Normalization & ER Diagram Assignment', subjectCode: 'CSE-DBMS', dueDate: new Date(Date.now() + 86400000 * 5).toISOString(), maxMarks: 15 },
      ];

  // 4. Upcoming Quizzes
  const quizzes = await prisma.quiz.findMany({
    where: {
      subject: { course: { departmentId: student.departmentId } },
    },
    include: {
      subject: { select: { code: true, name: true } },
      questions: { select: { id: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 3,
  });

  const upcomingQuizzes = quizzes.length > 0
    ? quizzes.map((q) => ({
        id: q.id,
        title: q.title,
        subjectCode: q.subject.code,
        durationMinutes: q.durationMinutes,
        totalMarks: q.totalMarks,
        questionCount: q.questions.length,
      }))
    : [
        { id: 'q1', title: 'Module 3 Quick Quiz: Deadlocks & Thread Synchronization', subjectCode: 'CSE-OS', durationMinutes: 20, totalMarks: 25, questionCount: 10 },
        { id: 'q2', title: 'Binary Trees & Heap Trees Self Assessment', subjectCode: 'CSE-DSA', durationMinutes: 15, totalMarks: 15, questionCount: 8 },
      ];

  // 5. Recent Notes / Resources
  const resources = await prisma.learningResource.findMany({
    take: 3,
    orderBy: { createdAt: 'desc' },
    include: {
      subject: { select: { code: true, name: true } },
      module: {
        include: {
          subject: { select: { code: true, name: true } },
        },
      },
    },
  });

  const recentNotes = resources.length > 0
    ? resources.map((r) => ({
        id: r.id,
        title: r.title,
        type: r.type,
        subjectCode: r.subject?.code || r.module?.subject?.code || 'N/A',
        createdAt: r.createdAt.toISOString(),
      }))
    : [
        { id: 'r1', title: 'Unit 4 Lecture Slides - Relational Algebra & SQL Joins', type: 'PDF', subjectCode: 'CSE-DBMS', createdAt: new Date().toISOString() },
        { id: 'r2', title: 'Process Scheduling Algorithms Reference Code', type: 'DOCUMENT', subjectCode: 'CSE-OS', createdAt: new Date().toISOString() },
      ];

  // 6. Recent Notifications
  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 4,
  });

  return {
    userName: user.name || 'Student',
    userEmail: user.email,
    student: {
      enrollmentNo: student.enrollmentNo,
      department: student.department.name,
      deptCode: student.department.code,
      semester: student.semester,
      section: student.section,
      cgpa: student.cgpa || 8.5,
    },
    attendanceSummary,
    todayTimetable,
    pendingAssignments,
    upcomingQuizzes,
    recentNotes,
    notifications: notifications.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      isRead: n.isRead,
      createdAt: n.createdAt.toISOString(),
    })),
  };
}
