import 'dotenv/config';
import prisma from '../lib/prisma';
import { AttendanceRepository } from '../features/attendance/repositories/attendance.repository';
import { sendDisputeNotificationEmail } from '../features/attendance/services/dispute-email.service';
import { getUserPermissions } from '../lib/permissions';

async function testMasterPrompt14() {
  console.log('=== TEST MASTER PROMPT 14: ATTENDANCE & DISPUTE FLOW ===\n');

  // 1. Verify Permission Key MARK_ATTENDANCE
  console.log('1. Verifying MARK_ATTENDANCE permission key...');
  const perm = await prisma.permission.findUnique({
    where: { key: 'MARK_ATTENDANCE' },
  });
  console.log('   MARK_ATTENDANCE Permission:', perm ? '✅ FOUND' : '❌ MISSING', perm);

  // 2. Grant MARK_ATTENDANCE to a test user via UserPermission override
  console.log('\n2. Testing per-user permission override mechanism...');
  const facUser = await prisma.user.findFirst({
    where: { role: 'FACULTY' },
  });

  if (facUser && perm) {
    await prisma.userPermission.upsert({
      where: {
        userId_permissionId: {
          userId: facUser.id,
          permissionId: perm.id,
        },
      },
      update: { granted: true },
      create: {
        userId: facUser.id,
        permissionId: perm.id,
        granted: true,
      },
    });

    const userPerms = await getUserPermissions(facUser.id);
    console.log(`   User ${facUser.email} permissions:`, userPerms.includes('MARK_ATTENDANCE') ? '✅ MARK_ATTENDANCE granted via override' : '❌ DENIED');
  }

  // 3. Seed test attendance records for a student
  console.log('\n3. Creating attendance records for student...');
  const student = await prisma.student.findFirst({
    include: { user: true, department: true },
  });
  const subject = await prisma.subject.findFirst();

  if (!student || !subject) {
    console.error('❌ Student or Subject missing in database');
    return;
  }

  const dateToday = new Date();
  const dateYesterday = new Date(Date.now() - 86400000);

  const saveResults = await AttendanceRepository.saveAttendanceRecords(
    [
      {
        studentId: student.id,
        subjectId: subject.id,
        date: dateToday,
        status: 'PRESENT',
        period: 1,
      },
      {
        studentId: student.id,
        subjectId: subject.id,
        date: dateYesterday,
        status: 'ABSENT',
        period: 2,
      },
    ],
    facUser?.id || 'system'
  );

  console.log(`   Saved ${saveResults.length} attendance records.`);

  // 4. Test Student Summary & Logs
  console.log('\n4. Fetching Student Attendance Summary & Logs...');
  const summary = await AttendanceRepository.getStudentAttendanceSummary(student.id);
  const logs = await AttendanceRepository.getStudentAttendanceLogs(student.id);

  console.log('   Overall Attendance %:', summary?.overallPercentage, '%');
  console.log('   Subject Breakdown:', summary?.subjectBreakdown);
  console.log('   Logs count:', logs.length);

  // 5. Test Raise Attendance Query & Resend Email Flow
  console.log('\n5. Raising Dispute Query & Sending Resend Email...');
  const absentRecord = logs.find((l) => l.status === 'ABSENT') || logs[0];

  if (absentRecord) {
    const query = await AttendanceRepository.createAttendanceQuery({
      attendanceRecordId: absentRecord.id,
      studentId: student.id,
      markedById: facUser?.id,
      message: 'I was present in Period 2 yesterday. Attached proof of class notebook.',
    });

    console.log('   AttendanceQuery created with ID:', query.id);

    // Get HOD email
    const hod = await prisma.hOD.findFirst({
      where: { departmentId: student.departmentId },
      include: { user: true },
    });

    const emailResult = await sendDisputeNotificationEmail({
      queryId: query.id,
      studentName: student.user.name || 'Student',
      studentEmail: student.user.email,
      enrollmentNo: student.enrollmentNo,
      subjectName: absentRecord.subject.name,
      subjectCode: absentRecord.subject.code,
      dateStr: new Date(absentRecord.date).toLocaleDateString(),
      period: absentRecord.period,
      message: query.message,
      coordinatorEmail: facUser?.email,
      hodEmail: hod?.user?.email,
    });

    console.log('   Resend Email Result:', emailResult);

    // 6. Test Resolving Query
    console.log('\n6. Resolving Dispute Query...');
    const resolved = await AttendanceRepository.resolveAttendanceQuery(
      query.id,
      'RESOLVED',
      'Verified with class attendance register. Marked as PRESENT.'
    );
    console.log('   Resolved Query status:', resolved.status, 'Response:', resolved.response);
  }

  console.log('\n✅ ALL MASTER PROMPT 14 TESTS EXECUTED SUCCESSFULLY!');
}

testMasterPrompt14()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
