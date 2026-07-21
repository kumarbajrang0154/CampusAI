import { PrismaClient } from '@prisma/client';
import { DepartmentService } from '../features/admin/departments/services/department.service';
import { CourseService } from '../features/admin/courses/services/course.service';
import { SubjectService } from '../features/admin/subjects/services/subject.service';
import { ClassroomService } from '../features/admin/classrooms/services/classroom.service';

const prisma = new PrismaClient();

const departmentService = new DepartmentService();
const courseService = new CourseService();
const subjectService = new SubjectService();
const classroomService = new ClassroomService();

async function runVerification() {
  console.log('=== STARTING FUNCTIONAL VERIFICATION ===\n');

  // Find an admin user in the system to use as the creator/modifier actor for audit logging
  const adminUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });

  if (!adminUser) {
    console.error('No admin user found in database to run actions. Please run seed script first.');
    process.exit(1);
  }
  const adminId = adminUser.id;
  console.log(`Using Admin User ID: ${adminId} (${adminUser.email}) for audit logging.`);

  // ----------------------------------------------------
  // 1. CLASSROOM CRUD VERIFICATION
  // ----------------------------------------------------
  console.log('\n--- Verifying Classroom CRUD ---');
  // Create
  const newClassroom = await classroomService.createClassroom({
    roomNumber: 'VERIFY-101',
    capacity: 45,
    type: 'LECTURE_HALL'
  }, adminId);
  console.log(`Created Classroom ID: ${newClassroom.id}, Room: ${newClassroom.roomNumber}`);

  // Query Atlas
  const queriedRoom = await prisma.classroom.findUnique({ where: { id: newClassroom.id } });
  console.log(`Query Atlas Check: Room exists: ${!!queriedRoom}, Capacity matches: ${queriedRoom?.capacity === 45}`);

  // Edit
  const updatedRoom = await classroomService.updateClassroom(newClassroom.id, {
    roomNumber: 'VERIFY-101',
    capacity: 60,
    type: 'LAB'
  }, adminId);
  console.log(`Updated Classroom Capacity: ${updatedRoom.capacity}, Type: ${updatedRoom.type}`);

  // Confirm change
  const queriedRoomUpdated = await prisma.classroom.findUnique({ where: { id: newClassroom.id } });
  console.log(`Query Atlas Check After Edit: Capacity matches: ${queriedRoomUpdated?.capacity === 60}`);

  // Delete
  await classroomService.deleteClassroom(newClassroom.id, adminId);
  console.log(`Deleted Classroom: ${newClassroom.id}`);

  // Confirm deleted
  const queriedRoomDeleted = await prisma.classroom.findUnique({ where: { id: newClassroom.id } });
  console.log(`Query Atlas Check After Delete: Room is null: ${queriedRoomDeleted === null}`);


  // ----------------------------------------------------
  // 2. DEPARTMENT CRUD VERIFICATION
  // ----------------------------------------------------
  console.log('\n--- Verifying Department CRUD ---');
  // Create
  const newDept = await departmentService.createDepartment({
    name: 'Verification Department',
    code: 'VDEPT'
  }, adminId);
  console.log(`Created Department ID: ${newDept.id}, Code: ${newDept.code}`);

  // Query Atlas
  const queriedDept = await prisma.department.findUnique({ where: { id: newDept.id } });
  console.log(`Query Atlas Check: Dept exists: ${!!queriedDept}, Code matches: ${queriedDept?.code === 'VDEPT'}`);

  // Edit
  const updatedDept = await departmentService.updateDepartment(newDept.id, {
    name: 'Verification Dept Edited',
    code: 'VDEPT'
  }, adminId);
  console.log(`Updated Department Name: ${updatedDept.name}`);

  // Confirm change
  const queriedDeptUpdated = await prisma.department.findUnique({ where: { id: newDept.id } });
  console.log(`Query Atlas Check After Edit: Name matches: ${queriedDeptUpdated?.name === 'Verification Dept Edited'}`);

  // Delete
  await departmentService.deleteDepartment(newDept.id, adminId);
  console.log(`Deleted Department: ${newDept.id}`);

  // Confirm deleted
  const queriedDeptDeleted = await prisma.department.findUnique({ where: { id: newDept.id } });
  console.log(`Query Atlas Check After Delete: Dept is null: ${queriedDeptDeleted === null}`);


  // ----------------------------------------------------
  // 3. COURSE CRUD VERIFICATION
  // ----------------------------------------------------
  console.log('\n--- Verifying Course CRUD ---');
  // We need a temporary department first to attach the course
  const tempDept = await departmentService.createDepartment({
    name: 'Temp Dept For Course',
    code: 'TDEPT'
  }, adminId);

  // Create Course
  const newCourse = await courseService.createCourse({
    name: 'Verification Course',
    credits: 4,
    semester: 3,
    departmentId: tempDept.id
  }, adminId);
  console.log(`Created Course ID: ${newCourse.id}, Name: ${newCourse.name}`);

  // Query Atlas
  const queriedCourse = await prisma.course.findUnique({ where: { id: newCourse.id } });
  console.log(`Query Atlas Check: Course exists: ${!!queriedCourse}, Credits matches: ${queriedCourse?.credits === 4}`);

  // Edit Course
  const updatedCourse = await courseService.updateCourse(newCourse.id, {
    name: 'Verification Course Edited',
    credits: 5,
    semester: 3,
    departmentId: tempDept.id
  }, adminId);
  console.log(`Updated Course Name: ${updatedCourse.name}, Credits: ${updatedCourse.credits}`);

  // Confirm change
  const queriedCourseUpdated = await prisma.course.findUnique({ where: { id: newCourse.id } });
  console.log(`Query Atlas Check After Edit: Credits matches: ${queriedCourseUpdated?.credits === 5}`);

  // Delete Course
  await courseService.deleteCourse(newCourse.id, adminId);
  console.log(`Deleted Course: ${newCourse.id}`);

  // Confirm deleted
  const queriedCourseDeleted = await prisma.course.findUnique({ where: { id: newCourse.id } });
  console.log(`Query Atlas Check After Delete: Course is null: ${queriedCourseDeleted === null}`);

  // Clean up temporary department
  await departmentService.deleteDepartment(tempDept.id, adminId);


  // ----------------------------------------------------
  // 4. SUBJECT CRUD VERIFICATION
  // ----------------------------------------------------
  console.log('\n--- Verifying Subject CRUD ---');
  // Temp department & course
  const tempDeptSub = await departmentService.createDepartment({
    name: 'Temp Dept For Subject',
    code: 'TDSUB'
  }, adminId);
  const tempCourseSub = await courseService.createCourse({
    name: 'Temp Course For Subject',
    credits: 3,
    semester: 2,
    departmentId: tempDeptSub.id
  }, adminId);

  // Create Subject
  const newSubject = await subjectService.createSubject({
    name: 'Verification Subject',
    code: 'VSUB-101',
    courseId: tempCourseSub.id,
    facultyId: null
  }, adminId);
  console.log(`Created Subject ID: ${newSubject.id}, Code: ${newSubject.code}`);

  // Query Atlas
  const queriedSubject = await prisma.subject.findUnique({ where: { id: newSubject.id } });
  console.log(`Query Atlas Check: Subject exists: ${!!queriedSubject}, Code matches: ${queriedSubject?.code === 'VSUB-101'}`);

  // Edit Subject
  const updatedSubject = await subjectService.updateSubject(newSubject.id, {
    name: 'Verification Subject Edited',
    code: 'VSUB-101',
    courseId: tempCourseSub.id,
    facultyId: null
  }, adminId);
  console.log(`Updated Subject Name: ${updatedSubject.name}`);

  // Confirm change
  const queriedSubjectUpdated = await prisma.subject.findUnique({ where: { id: newSubject.id } });
  console.log(`Query Atlas Check After Edit: Name matches: ${queriedSubjectUpdated?.name === 'Verification Subject Edited'}`);

  // Delete Subject
  await subjectService.deleteSubject(newSubject.id, adminId);
  console.log(`Deleted Subject: ${newSubject.id}`);

  // Confirm deleted
  const queriedSubjectDeleted = await prisma.subject.findUnique({ where: { id: newSubject.id } });
  console.log(`Query Atlas Check After Delete: Subject is null: ${queriedSubjectDeleted === null}`);

  // Clean up course & dept
  await courseService.deleteCourse(tempCourseSub.id, adminId);
  await departmentService.deleteDepartment(tempDeptSub.id, adminId);


  // ----------------------------------------------------
  // 5. DELETION GATE VERIFICATION
  // ----------------------------------------------------
  console.log('\n--- Verifying Deletion Gates (Error Handling) ---');

  // Attempt to delete the seeded CSE Department (which has linked students, faculty, courses, and HOD)
  const cseDept = await prisma.department.findUnique({ where: { code: 'CSE' } });
  if (cseDept) {
    try {
      console.log(`Attempting to delete department "CSE" (ID: ${cseDept.id})...`);
      await departmentService.deleteDepartment(cseDept.id, adminId);
      console.error('FAIL: Managed to delete CSE department when it should be blocked!');
    } catch (err: any) {
      console.log(`SUCCESS: Deletion blocked as expected! Exact error message: "${err.message}"`);
    }
  } else {
    console.warn('Seeded CSE department not found to test deletion gate.');
  }

  // Attempt to delete a Course with a linked subject
  // Let's create a temp course and link a subject to it, then try to delete the course
  const tempDeptForGate = await departmentService.createDepartment({
    name: 'Temp Dept For Gate',
    code: 'TDG'
  }, adminId);
  const tempCourseForGate = await courseService.createCourse({
    name: 'Temp Course For Gate',
    credits: 3,
    semester: 1,
    departmentId: tempDeptForGate.id
  }, adminId);
  const tempSubForGate = await subjectService.createSubject({
    name: 'Temp Sub For Gate',
    code: 'TSG-101',
    courseId: tempCourseForGate.id,
    facultyId: null
  }, adminId);

  try {
    console.log(`Attempting to delete course "${tempCourseForGate.name}" (ID: ${tempCourseForGate.id}) with linked subject...`);
    await courseService.deleteCourse(tempCourseForGate.id, adminId);
    console.error('FAIL: Managed to delete course with linked subject when it should be blocked!');
  } catch (err: any) {
    console.log(`SUCCESS: Deletion blocked as expected! Exact error message: "${err.message}"`);
  }

  // Attempt to delete a Subject (should succeed because there are no modules/assignments/quizzes linked)
  try {
    console.log(`Attempting to delete subject "${tempSubForGate.name}" (ID: ${tempSubForGate.id}) with no modules/assignments/quizzes...`);
    await subjectService.deleteSubject(tempSubForGate.id, adminId);
    console.log('SUCCESS: Deleted subject successfully since no LMS items are linked.');
  } catch (err: any) {
    console.error(`FAIL: Failed to delete subject with no LMS items: ${err.message}`);
  }

  // Clean up
  await courseService.deleteCourse(tempCourseForGate.id, adminId);
  await departmentService.deleteDepartment(tempDeptForGate.id, adminId);

  console.log('\n=== VERIFICATION FINISHED ===');
}

runVerification()
  .catch((err) => {
    console.error('Unexpected error running verification:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
