import prisma from '../lib/prisma';
import { SemesterTerm, SemesterStatus, AcademicEventType } from '@prisma/client';
import { SemesterRepository } from '../features/admin/semesters/repositories/semester.repository';
import { AcademicCalendarRepository } from '../features/admin/academic-calendar/repositories/academic-calendar.repository';

async function main() {
  console.log('--- Verification Script: Semesters & Academic Calendar CRUD ---');

  const semesterRepo = new SemesterRepository();
  const calendarRepo = new AcademicCalendarRepository();

  // 1. Seed / Create Semesters
  console.log('1. Creating test semesters...');
  const oddSem = await semesterRepo.createSemester({
    name: 'Odd Semester 2025-26',
    academicYear: '2025-26',
    term: SemesterTerm.ODD,
    startDate: new Date('2025-08-01'),
    endDate: new Date('2025-12-24'),
    status: SemesterStatus.ACTIVE,
    isCurrent: true,
  });
  console.log('   Created Odd Semester:', oddSem.id, 'isCurrent:', oddSem.isCurrent);

  const evenSem = await semesterRepo.createSemester({
    name: 'Even Semester 2025-26',
    academicYear: '2025-26',
    term: SemesterTerm.EVEN,
    startDate: new Date('2026-01-05'),
    endDate: new Date('2026-05-30'),
    status: SemesterStatus.UPCOMING,
    isCurrent: false,
  });
  console.log('   Created Even Semester:', evenSem.id, 'isCurrent:', evenSem.isCurrent);

  // 2. Test setAsCurrent
  console.log('2. Testing setAsCurrent transaction...');
  const currentSem = await semesterRepo.setAsCurrent(oddSem.id);
  console.log('   Confirmed Current Semester:', currentSem.name, 'isCurrent:', currentSem.isCurrent);

  // 3. Create Academic Calendar Events
  console.log('3. Creating Academic Calendar events...');
  const event1 = await calendarRepo.createEntry({
    title: 'Orientation & Student Registration',
    description: 'Welcoming new student batch & course enrollment.',
    eventType: AcademicEventType.REGISTRATION,
    startDate: new Date('2025-08-02'),
    endDate: new Date('2025-08-05'),
    semesterId: oddSem.id,
    isPublished: true,
  });

  const event2 = await calendarRepo.createEntry({
    title: 'Mid-Term Examinations',
    description: 'Departmental mid-term evaluation week.',
    eventType: AcademicEventType.EXAM,
    startDate: new Date('2025-10-15'),
    endDate: new Date('2025-10-22'),
    semesterId: oddSem.id,
    isPublished: true,
  });

  const event3 = await calendarRepo.createEntry({
    title: 'National Holiday — Independence Day',
    description: 'Campus closed.',
    eventType: AcademicEventType.HOLIDAY,
    startDate: new Date('2025-08-15'),
    endDate: new Date('2025-08-15'),
    semesterId: oddSem.id,
    isPublished: true,
  });

  console.log('   Created Calendar Events:', [event1.title, event2.title, event3.title]);

  // 4. Test Protective Delete Gate
  console.log('4. Testing Protective Delete Gate on Semester with linked events...');
  const deleteCheck = await semesterRepo.checkDeleteBlocks(oddSem.id);
  console.log('   Delete Gate Result:', deleteCheck);
  if (!deleteCheck.canDelete) {
    console.log('   SUCCESS: Protective delete gate blocked deletion as expected!');
    console.log('   Blocks listing:', deleteCheck.blocks);
  } else {
    console.error('   FAILURE: Delete gate failed to block deletion.');
  }

  // 5. Verify list queries
  const semList = await semesterRepo.listSemesters();
  console.log('5. Listed total semesters:', semList.total);

  const calList = await calendarRepo.listEntries({ semesterId: oddSem.id });
  console.log('   Listed total calendar entries for Odd Semester:', calList.total);

  console.log('--- Semesters & Academic Calendar Verification Completed Successfully ---');
}

main()
  .catch((e) => {
    console.error('Verification failed with error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
