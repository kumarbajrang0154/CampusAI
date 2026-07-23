import prisma from '../lib/prisma';

async function seedTimetableSlots() {
  console.log('🌱 Seeding Timetable and TimetableSlots for Student View...');

  const cseDept = await prisma.department.findUnique({ where: { code: 'CSE' } });
  if (!cseDept) {
    console.error('❌ Department CSE not found');
    return;
  }

  const sectionsToSeed = [
    { semester: 1, section: 'A' },
    { semester: 6, section: 'A' },
  ];

  const subjects = await prisma.subject.findMany({
    where: { course: { departmentId: cseDept.id } },
    include: { faculty: true },
  });

  const classrooms = await prisma.classroom.findMany();
  const fac1 = await prisma.faculty.findFirst();

  if (subjects.length === 0 || classrooms.length === 0) {
    console.error('❌ Subjects or Classrooms missing');
    return;
  }

  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const periodTimes = [
    { period: 1, start: '09:00 AM', end: '10:00 AM' },
    { period: 2, start: '10:00 AM', end: '11:00 AM' },
    { period: 3, start: '11:15 AM', end: '12:15 PM' },
    { period: 4, start: '12:15 PM', end: '01:15 PM' },
    { period: 5, start: '02:00 PM', end: '03:00 PM' },
    { period: 6, start: '03:00 PM', end: '04:00 PM' },
    { period: 7, start: '04:00 PM', end: '05:00 PM' },
  ];

  for (const sTarget of sectionsToSeed) {
    let timetable = await prisma.timetable.findFirst({
      where: {
        departmentId: cseDept.id,
        semester: sTarget.semester,
        section: sTarget.section,
      },
    });

    if (!timetable) {
      timetable = await prisma.timetable.create({
        data: {
          departmentId: cseDept.id,
          semester: sTarget.semester,
          section: sTarget.section,
          academicYear: '2025-2026',
          status: 'PUBLISHED',
        },
      });
    } else if (timetable.status !== 'PUBLISHED') {
      timetable = await prisma.timetable.update({
        where: { id: timetable.id },
        data: { status: 'PUBLISHED' },
      });
    }

    let createdCount = 0;

    for (const day of days) {
      for (const p of periodTimes) {
        if (p.period === 4 && (day === 'WEDNESDAY' || day === 'SATURDAY')) {
          continue; // Free / Lunch
        }

        const subj = subjects[(p.period + days.indexOf(day)) % subjects.length];
        const room = classrooms[(p.period) % classrooms.length];
        const facultyId = subj.facultyId || fac1?.id;

        if (!facultyId) continue;

        const existingSlot = await prisma.timetableSlot.findFirst({
          where: {
            timetableId: timetable.id,
            day,
            periodNumber: p.period,
          },
        });

        if (!existingSlot) {
          await prisma.timetableSlot.create({
            data: {
              timetableId: timetable.id,
              day,
              startTime: p.start,
              endTime: p.end,
              subjectId: subj.id,
              facultyId,
              classroomId: room.id,
              periodNumber: p.period,
            },
          });
          createdCount++;
        }
      }
    }

    const totalSlots = await prisma.timetableSlot.count({ where: { timetableId: timetable.id } });
    console.log(`✅ Timetable slots seeded for CSE Sem ${sTarget.semester} Sec ${sTarget.section}: ${totalSlots} total slots (New: ${createdCount})`);
  }
}

seedTimetableSlots()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
