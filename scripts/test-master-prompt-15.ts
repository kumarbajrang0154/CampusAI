import 'dotenv/config';
import prisma from '../lib/prisma';
import { uploadToCloudinary } from '../features/lms/services/cloudinary.service';
import { LearningRepository } from '../features/lms/repositories/learning.repository';

async function testMasterPrompt15() {
  console.log('=== TEST MASTER PROMPT 15: STUDENT TIMETABLE + LEARNING/NOTES MODULE ===\n');

  // 1. Cloudinary File Upload Test
  console.log('1. Testing Cloudinary File Upload Service...');
  const samplePdfBuffer = Buffer.from('%PDF-1.4 sample pdf document content for campusai learning resources testing');
  const uploadResult = await uploadToCloudinary(samplePdfBuffer, 'unit_3_dsa_notes.pdf', 'campusai_learning_resources');

  console.log('   Cloudinary Upload Result:', uploadResult);
  console.log('   Resulting Cloudinary HTTPS URL:', uploadResult.url);

  // 2. Fetch Student & Subject Data
  console.log('\n2. Fetching test Student & Faculty profiles...');
  const student = await prisma.student.findFirst({
    include: { user: true, department: true },
  });

  const faculty = await prisma.faculty.findFirst({
    include: { user: true },
  });

  const subject = await prisma.subject.findFirst({
    where: { course: { departmentId: student?.departmentId } },
  });

  if (!student || !faculty || !subject) {
    console.error('❌ Student, Faculty, or Subject missing in database');
    return;
  }

  console.log(`   Student: ${student.user.name} (${student.enrollmentNo}, Dept: ${student.department.code})`);
  console.log(`   Faculty: ${faculty.user.name}`);
  console.log(`   Subject: ${subject.name} (${subject.code})`);

  // 3. Test Faculty Resource Upload (Cloudinary PDF & YouTube Link)
  console.log('\n3. Creating Learning Resources (Cloudinary PDF + YouTube Link)...');
  const pdfResource = await LearningRepository.createLearningResource({
    subjectId: subject.id,
    facultyId: faculty.id,
    title: 'Unit 3 Lecture Slides - Trees & Heaps',
    description: 'Comprehensive lecture slides covering binary search trees and heap sorting.',
    type: 'PDF',
    fileUrl: uploadResult.url,
  });

  const ytResource = await LearningRepository.createLearningResource({
    subjectId: subject.id,
    facultyId: faculty.id,
    title: 'Advanced Dynamic Programming Video Lecture',
    description: 'Video walkthrough of knapsack problem and memoization techniques.',
    type: 'YOUTUBE_LINK',
    fileUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  });

  console.log('   PDF Resource Created:', pdfResource.id, pdfResource.title, pdfResource.fileUrl);
  console.log('   YouTube Resource Created:', ytResource.id, ytResource.title, ytResource.fileUrl);

  // 4. Test Student Timetable Query
  console.log('\n4. Verifying Student Timetable query for section...');
  const timetable = await prisma.timetable.findFirst({
    where: {
      departmentId: student.departmentId,
      semester: student.semester,
      section: student.section,
    },
    include: {
      slots: {
        include: {
          subject: true,
          classroom: true,
        },
      },
    },
  });

  console.log(`   Timetable for ${student.department.code} Sem ${student.semester} Sec ${student.section}:`, timetable ? '✅ FOUND' : '❌ NOT FOUND');
  console.log(`   Total Slots in Weekly Grid: ${timetable?.slots.length}`);

  // 5. Test Student Learning Consumption & Filter
  console.log('\n5. Fetching Student Learning Resources & Filtering...');
  const enrolledResources = await LearningRepository.getStudentLearningResources(student.id);
  const pdfOnly = await LearningRepository.getStudentLearningResources(student.id, undefined, 'PDF');

  console.log(`   Total Enrolled Resources: ${enrolledResources.length}`);
  console.log(`   PDF Filtered Resources: ${pdfOnly.length}`);

  // 6. Test NotesRequest Creation & In-App Notification Delivery
  console.log('\n6. Testing NotesRequest Creation & In-App Notification...');
  const targetSubject = await prisma.subject.findFirst({
    where: { course: { departmentId: student.departmentId } },
    include: { faculty: { include: { user: true } } },
  });

  if (!targetSubject) {
    console.error('❌ Target subject missing');
    return;
  }

  const notesReq = await LearningRepository.createNotesRequest({
    studentId: student.id,
    subjectId: targetSubject.id,
    facultyId: targetSubject.facultyId ?? faculty.id,
    message: `Please upload notes for ${targetSubject.code}. Midterm exams are approaching.`,
  });

  console.log('   NotesRequest Created with ID:', notesReq.id, 'Status:', notesReq.status);

  // Check target faculty's in-app notification
  const targetFacultyUserId = targetSubject.faculty?.user?.id || faculty.user.id;
  const notifications = await prisma.notification.findMany({
    where: { userId: targetFacultyUserId },
    orderBy: { createdAt: 'desc' },
    take: 2,
  });

  console.log(`   In-App Notifications for Faculty (${targetFacultyUserId}):`, notifications.length > 0 ? '✅ DELIVERED' : '❌ NONE');
  if (notifications.length > 0) {
    console.log('   Latest Notification:', notifications[0]);
  }

  // 7. Resolve Notes Request
  console.log('\n7. Resolving NotesRequest as Faculty...');
  const resolvedReq = await LearningRepository.resolveNotesRequest(notesReq.id, 'FULFILLED');
  console.log('   Resolved Request Status:', resolvedReq.status, 'Resolved At:', resolvedReq.resolvedAt);

  console.log('\n✅ ALL MASTER PROMPT 15 TESTS EXECUTED SUCCESSFULLY!');
}

testMasterPrompt15()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
