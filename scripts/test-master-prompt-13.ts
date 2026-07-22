import prisma from '../lib/prisma';
import { TimetableService } from '../features/admin/timetable/services/timetable.service';
import { UserRole } from '@prisma/client';

async function main() {
  console.log('--- Testing Master Prompt 13: Admin Smart Timetable ---');

  const service = new TimetableService();

  // 1. Fetch Admin User
  const adminUser = await prisma.user.findFirst({
    where: { role: UserRole.ADMIN, deletedAt: null },
  });

  if (!adminUser) {
    throw new Error('No Admin user found for testing.');
  }

  // 2. Fetch seeded Department, Subjects, Faculty, Classrooms
  const cseDepartment = await prisma.department.findFirst({
    where: { code: 'CSE' },
  });

  if (!cseDepartment) {
    throw new Error('CSE Department not found.');
  }

  const subjects = await prisma.subject.findMany({
    where: { course: { departmentId: cseDepartment.id } },
    take: 2,
  });

  const facultyList = await prisma.faculty.findMany({
    take: 2,
    include: { user: true },
  });

  const classrooms = await prisma.classroom.findMany({
    take: 2,
  });

  if (subjects.length < 2 || facultyList.length < 2 || classrooms.length < 2) {
    console.log('Fewer than 2 subjects/faculty/classrooms found. Fetching fallback items...');
  }

  const subj1 = subjects[0] || await prisma.subject.findFirstOrThrow();
  const subj2 = subjects[1] || subj1;
  const fac1 = facultyList[0] || await prisma.faculty.findFirstOrThrow();
  const fac2 = facultyList[1] || fac1;
  const room1 = classrooms[0] || await prisma.classroom.findFirstOrThrow();
  const room2 = classrooms[1] || room1;

  console.log(`✓ Context loaded:
   - Dept: ${cseDepartment.code} (${cseDepartment.id})
   - Subject 1: ${subj1.code}, Subject 2: ${subj2.code}
   - Faculty 1: ${fac1.user.name || fac1.user.email}, Faculty 2: ${fac2.user.name || fac2.user.email}
   - Room 1: ${room1.roomNumber}, Room 2: ${room2.roomNumber}`);

  // 3. Test Period Templates
  const periods = await service.getPeriodTemplates();
  console.log(`✓ Period Templates loaded: ${periods.length} periods configured.`);

  // Cleanup any old test timetables
  await prisma.timetable.deleteMany({
    where: {
      academicYear: '2025-2026-TEST',
    },
  });

  // 4. Create Timetable A (Section A)
  const ttA = await service.createTimetable(
    {
      departmentId: cseDepartment.id,
      semester: 3,
      section: 'A',
      academicYear: '2025-2026-TEST',
    },
    adminUser.id
  );
  console.log(`✓ Timetable A created (ID: ${ttA.id}, Section A)`);

  // 5. Create Timetable B (Section B)
  const ttB = await service.createTimetable(
    {
      departmentId: cseDepartment.id,
      semester: 3,
      section: 'B',
      academicYear: '2025-2026-TEST',
    },
    adminUser.id
  );
  console.log(`✓ Timetable B created (ID: ${ttB.id}, Section B)`);

  // 6. Assign Slot 1 in Timetable A (Monday, Period 1) with Fac1 and Room1
  const slotA1 = await service.assignSlot(
    {
      timetableId: ttA.id,
      day: 'Monday',
      periodNumber: 1,
      startTime: '09:00',
      endTime: '10:00',
      subjectId: subj1.id,
      facultyId: fac1.id,
      classroomId: room1.id,
    },
    adminUser.id
  );
  console.log(`✓ Slot A1 assigned on Monday Period 1 for Section A`);

  // 7. Test Faculty Conflict: Try assigning Fac1 on Monday Period 1 in Timetable B
  console.log('\nTesting Faculty Conflict Detection...');
  try {
    await service.assignSlot(
      {
        timetableId: ttB.id,
        day: 'Monday',
        periodNumber: 1,
        startTime: '09:00',
        endTime: '10:00',
        subjectId: subj2.id,
        facultyId: fac1.id, // SAME FACULTY!
        classroomId: room2.id,
      },
      adminUser.id
    );
    console.error('❌ FAILED: Faculty conflict was NOT caught!');
    process.exit(1);
  } catch (err: any) {
    console.log(`✓ SUCCESS: Faculty conflict caught -> "${err.message}"`);
  }

  // 8. Test Classroom Conflict: Try assigning Room1 on Monday Period 1 in Timetable B with Fac2
  console.log('\nTesting Classroom Conflict Detection...');
  try {
    await service.assignSlot(
      {
        timetableId: ttB.id,
        day: 'Monday',
        periodNumber: 1,
        startTime: '09:00',
        endTime: '10:00',
        subjectId: subj2.id,
        facultyId: fac2.id, // DIFFERENT FACULTY
        classroomId: room1.id, // SAME CLASSROOM!
      },
      adminUser.id
    );
    console.error('❌ FAILED: Classroom conflict was NOT caught!');
    process.exit(1);
  } catch (err: any) {
    console.log(`✓ SUCCESS: Classroom conflict caught -> "${err.message}"`);
  }

  // 9. Assign non-conflicting slot in Timetable B (Monday, Period 2)
  const slotB1 = await service.assignSlot(
    {
      timetableId: ttB.id,
      day: 'Monday',
      periodNumber: 2,
      startTime: '10:00',
      endTime: '11:00',
      subjectId: subj2.id,
      facultyId: fac2.id,
      classroomId: room2.id,
    },
    adminUser.id
  );
  console.log(`✓ Non-conflicting Slot B1 assigned on Monday Period 2 for Section B`);

  // 10. Test Status Toggle
  const published = await service.toggleStatus(ttA.id, adminUser.id);
  console.log(`✓ Status toggled: ${published.status}`);

  // Cleanup test timetables
  await prisma.timetable.deleteMany({
    where: { academicYear: '2025-2026-TEST' },
  });
  console.log('✓ Cleanup complete.');

  console.log('\n✅ All Master Prompt 13 Verification Checks Passed 100%!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
