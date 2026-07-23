/**
 * prisma/seed.ts — CampusAI Stage 1 & 2 Auth + Academic Core Seed
 *
 * Seeds:
 * 1. Granular permissions
 * 2. RolePermission mappings
 * 3. Default ADMIN user
 * 4. Academic Core structure (Department, Course, Classroom, Users + Profiles HOD/Faculty/Students, Subjects)
 *
 * Run: npx tsx prisma/seed.ts
 */

import 'dotenv/config';
import { 
  PrismaClient, 
  UserRole, 
  ClassroomType 
} from '@prisma/client';

const prisma = new PrismaClient();

const permissions: Array<{ key: string; description: string; group: string }> = [
  // User Management
  { key: 'user.manage', description: 'Create, update, and deactivate user accounts', group: 'User Management' },
  { key: 'user.view', description: 'View user profiles and account details', group: 'User Management' },
  { key: 'role.manage', description: 'Assign and modify user roles', group: 'User Management' },

  // Academic
  { key: 'course.manage', description: 'Create and manage courses and subjects', group: 'Academic' },
  { key: 'course.view', description: 'View course and subject information', group: 'Academic' },
  { key: 'timetable.manage', description: 'Create and modify timetables', group: 'Academic' },
  { key: 'timetable.view', description: 'View timetable schedules', group: 'Academic' },

  // Attendance
  { key: 'MARK_ATTENDANCE', description: 'Mark student attendance and manage attendance queries', group: 'Attendance' },
  { key: 'attendance.write', description: 'Mark and update attendance records', group: 'Attendance' },
  { key: 'attendance.read', description: 'View attendance records', group: 'Attendance' },
  { key: 'attendance.report', description: 'Generate attendance reports', group: 'Attendance' },

  // Assignments
  { key: 'assignment.create', description: 'Create and publish assignments', group: 'Assignments' },
  { key: 'assignment.grade', description: 'Grade and provide feedback on submissions', group: 'Assignments' },
  { key: 'assignment.submit', description: 'Submit assignment responses', group: 'Assignments' },
  { key: 'assignment.view', description: 'View assignments', group: 'Assignments' },

  // Quiz
  { key: 'quiz.create', description: 'Create and publish quizzes', group: 'Quiz' },
  { key: 'quiz.attempt', description: 'Attempt quizzes', group: 'Quiz' },
  { key: 'quiz.view', description: 'View quiz details and results', group: 'Quiz' },

  // Placement
  { key: 'placement.manage', description: 'Manage placement drives and opportunities', group: 'Placement' },
  { key: 'placement.view', description: 'View placement opportunities and results', group: 'Placement' },

  // AI
  { key: 'ai.use', description: 'Use AI features (chat, study planner, resume builder)', group: 'AI' },
  { key: 'ai.configure', description: 'Configure and manage AI feature settings', group: 'AI' },

  // Reports
  { key: 'report.view', description: 'View reports and analytics dashboards', group: 'Reports' },
  { key: 'report.generate', description: 'Generate and export reports', group: 'Reports' },

  // Settings
  { key: 'settings.manage', description: 'Manage system-wide settings and configurations', group: 'Settings' },
  { key: 'notification.manage', description: 'Send and manage notifications', group: 'Settings' },
];

const rolePermissions: Record<UserRole, string[]> = {
  ADMIN: permissions.map((p) => p.key),

  HOD: [
    'user.view',
    'course.view',
    'timetable.view',
    'attendance.read',
    'attendance.report',
    'assignment.view',
    'quiz.view',
    'placement.manage',
    'placement.view',
    'ai.use',
    'report.view',
    'report.generate',
  ],

  FACULTY: [
    'course.view',
    'timetable.view',
    'attendance.write',
    'attendance.read',
    'attendance.report',
    'assignment.create',
    'assignment.grade',
    'assignment.view',
    'quiz.create',
    'quiz.view',
    'placement.view',
    'ai.use',
    'report.view',
  ],

  STUDENT: [
    'course.view',
    'timetable.view',
    'attendance.read',
    'assignment.submit',
    'assignment.view',
    'quiz.attempt',
    'quiz.view',
    'placement.view',
    'ai.use',
  ],
};

async function main() {
  console.log('🌱 Starting CampusAI Stage 1 & 2 seed...\n');

  // 1. Upsert all permissions
  console.log('📋 Seeding permissions...');
  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { key: perm.key },
      update: { description: perm.description, group: perm.group },
      create: perm,
    });
  }
  console.log(`   ✓ ${permissions.length} permissions seeded\n`);

  // 2. Seed RolePermission mappings
  console.log('🔐 Seeding role permissions...');
  for (const [role, keys] of Object.entries(rolePermissions) as [UserRole, string[]][]) {
    for (const key of keys) {
      const permission = await prisma.permission.findUnique({ where: { key } });
      if (!permission) {
        console.warn(`   ⚠ Permission not found: ${key}`);
        continue;
      }
      await prisma.rolePermission.upsert({
        where: { role_permissionId: { role, permissionId: permission.id } },
        update: {},
        create: { role, permissionId: permission.id },
      });
    }
    console.log(`   ✓ ${role}: ${keys.length} permissions assigned`);
  }
  console.log();

  // 3. Seed default ADMIN user
  console.log('👤 Seeding default admin user...');
  await prisma.user.upsert({
    where: { email: 'kumarbajrang325@gmail.com' },
    update: {},
    create: {
      name: 'System Administrator',
      email: 'kumarbajrang325@gmail.com',
      role: UserRole.ADMIN,
      status: 'ACTIVE',
      isActive: true,
      emailVerified: new Date(),
    },
  });
  console.log('   ✓ Admin user created: kumarbajrang325@gmail.com (Google OAuth only)\n');

  // 4. Seed Department
  console.log('🏢 Seeding department...');
  const cseDept = await prisma.department.upsert({
    where: { code: 'CSE' },
    update: { name: 'Computer Science & Engineering' },
    create: {
      name: 'Computer Science & Engineering',
      code: 'CSE',
    },
  });
  console.log('   ✓ Department CSE seeded\n');

  // 5. Seed Courses
  console.log('📚 Seeding courses...');
  const btechCourse = await prisma.course.upsert({
    where: { id: '60c72b2f9b1d8e1f88888881' },
    update: {},
    create: {
      id: '60c72b2f9b1d8e1f88888881',
      name: 'Bachelor of Technology in CSE',
      credits: 160,
      semester: 8,
      departmentId: cseDept.id,
    },
  });

  const mtechCourse = await prisma.course.upsert({
    where: { id: '60c72b2f9b1d8e1f88888882' },
    update: {},
    create: {
      id: '60c72b2f9b1d8e1f88888882',
      name: 'Master of Technology in CSE',
      credits: 80,
      semester: 4,
      departmentId: cseDept.id,
    },
  });
  console.log('   ✓ Courses seeded\n');

  // 6. Seed Classrooms
  console.log('🏫 Seeding classrooms...');
  const classroomLh101 = await prisma.classroom.upsert({
    where: { roomNumber: 'LH-101' },
    update: {},
    create: {
      roomNumber: 'LH-101',
      capacity: 60,
      type: ClassroomType.LECTURE_HALL,
    },
  });

  const classroomLab202 = await prisma.classroom.upsert({
    where: { roomNumber: 'Lab-202' },
    update: {},
    create: {
      roomNumber: 'Lab-202',
      capacity: 30,
      type: ClassroomType.LAB,
    },
  });
  console.log('   ✓ Classrooms seeded\n');

  // 7. Seed Academic Users & Profiles (HOD, Faculty, Students)
  console.log('👤 Seeding academic users & profiles...');

  // HOD User & Profile
  const hodUser = await prisma.user.upsert({
    where: { email: 'cse.hod.campusai@gmail.com' },
    update: {},
    create: {
      name: 'Dr. Ramesh Chandra (HOD CSE)',
      email: 'cse.hod.campusai@gmail.com',
      role: UserRole.HOD,
      status: 'ACTIVE',
      isActive: true,
      emailVerified: new Date(),
    },
  });
  const hodProfile = await prisma.hOD.upsert({
    where: { userId: hodUser.id },
    update: { departmentId: cseDept.id, office: 'HOD Block CSE, Room 102' },
    create: {
      userId: hodUser.id,
      departmentId: cseDept.id,
      office: 'HOD Block CSE, Room 102',
    },
  });

  // Faculty Users & Profiles
  const fac1User = await prisma.user.upsert({
    where: { email: 'fac1.campusai@gmail.com' },
    update: {},
    create: {
      name: 'Dr. Amit Sharma',
      email: 'fac1.campusai@gmail.com',
      role: UserRole.FACULTY,
      status: 'ACTIVE',
      isActive: true,
      emailVerified: new Date(),
    },
  });
  const fac1Profile = await prisma.faculty.upsert({
    where: { userId: fac1User.id },
    update: {
      employeeId: 'EMP-CSE-001',
      departmentId: cseDept.id,
      designation: 'Associate Professor',
      specialization: 'Machine Learning & Artificial Intelligence',
    },
    create: {
      userId: fac1User.id,
      employeeId: 'EMP-CSE-001',
      departmentId: cseDept.id,
      designation: 'Associate Professor',
      specialization: 'Machine Learning & Artificial Intelligence',
    },
  });

  const fac2User = await prisma.user.upsert({
    where: { email: 'fac2.campusai@gmail.com' },
    update: {},
    create: {
      name: 'Prof. Sunita Verma',
      email: 'fac2.campusai@gmail.com',
      role: UserRole.FACULTY,
      status: 'ACTIVE',
      isActive: true,
      emailVerified: new Date(),
    },
  });
  const fac2Profile = await prisma.faculty.upsert({
    where: { userId: fac2User.id },
    update: {
      employeeId: 'EMP-CSE-002',
      departmentId: cseDept.id,
      designation: 'Assistant Professor',
      specialization: 'Systems & Computer Networks',
    },
    create: {
      userId: fac2User.id,
      employeeId: 'EMP-CSE-002',
      departmentId: cseDept.id,
      designation: 'Assistant Professor',
      specialization: 'Systems & Computer Networks',
    },
  });

  // Student Users & Profiles
  const std1User = await prisma.user.upsert({
    where: { email: 'student1.campusai@gmail.com' },
    update: {},
    create: {
      name: 'Aditya Sen',
      email: 'student1.campusai@gmail.com',
      role: UserRole.STUDENT,
      status: 'ACTIVE',
      isActive: true,
      emailVerified: new Date(),
    },
  });
  const std1Profile = await prisma.student.upsert({
    where: { userId: std1User.id },
    update: {
      enrollmentNo: 'ENROLL-CSE-001',
      departmentId: cseDept.id,
      semester: 6,
      section: 'A',
      cgpa: 8.7,
      batchYear: 2023,
    },
    create: {
      userId: std1User.id,
      enrollmentNo: 'ENROLL-CSE-001',
      departmentId: cseDept.id,
      semester: 6,
      section: 'A',
      cgpa: 8.7,
      batchYear: 2023,
    },
  });

  const std2User = await prisma.user.upsert({
    where: { email: 'student2.campusai@gmail.com' },
    update: {},
    create: {
      name: 'Pooja Hegde',
      email: 'student2.campusai@gmail.com',
      role: UserRole.STUDENT,
      status: 'ACTIVE',
      isActive: true,
      emailVerified: new Date(),
    },
  });
  const std2Profile = await prisma.student.upsert({
    where: { userId: std2User.id },
    update: {
      enrollmentNo: 'ENROLL-CSE-002',
      departmentId: cseDept.id,
      semester: 6,
      section: 'A',
      cgpa: 9.2,
      batchYear: 2023,
    },
    create: {
      userId: std2User.id,
      enrollmentNo: 'ENROLL-CSE-002',
      departmentId: cseDept.id,
      semester: 6,
      section: 'A',
      cgpa: 9.2,
      batchYear: 2023,
    },
  });

  const std3User = await prisma.user.upsert({
    where: { email: 'student3.campusai@gmail.com' },
    update: {},
    create: {
      name: 'Rohan Mehra',
      email: 'student3.campusai@gmail.com',
      role: UserRole.STUDENT,
      status: 'ACTIVE',
      isActive: true,
      emailVerified: new Date(),
    },
  });
  const std3Profile = await prisma.student.upsert({
    where: { userId: std3User.id },
    update: {
      enrollmentNo: 'ENROLL-CSE-003',
      departmentId: cseDept.id,
      semester: 4,
      section: 'B',
      cgpa: 7.5,
      batchYear: 2024,
    },
    create: {
      userId: std3User.id,
      enrollmentNo: 'ENROLL-CSE-003',
      departmentId: cseDept.id,
      semester: 4,
      section: 'B',
      cgpa: 7.5,
      batchYear: 2024,
    },
  });
  console.log('   ✓ HOD, 2 Faculty, and 3 Students profiles seeded\n');

  // 8. Seed Subjects
  console.log('📖 Seeding subjects...');
  await prisma.subject.upsert({
    where: { code: 'CSE-DSA' },
    update: { facultyId: fac2Profile.id },
    create: {
      name: 'Data Structures and Algorithms',
      code: 'CSE-DSA',
      courseId: btechCourse.id,
      facultyId: fac2Profile.id,
    },
  });

  await prisma.subject.upsert({
    where: { code: 'CSE-DBMS' },
    update: { facultyId: fac2Profile.id },
    create: {
      name: 'Database Management Systems',
      code: 'CSE-DBMS',
      courseId: btechCourse.id,
      facultyId: fac2Profile.id,
    },
  });

  await prisma.subject.upsert({
    where: { code: 'CSE-OS' },
    update: { facultyId: fac2Profile.id },
    create: {
      name: 'Operating Systems',
      code: 'CSE-OS',
      courseId: btechCourse.id,
      facultyId: fac2Profile.id,
    },
  });

  await prisma.subject.upsert({
    where: { code: 'CSE-AML' },
    update: { facultyId: fac1Profile.id },
    create: {
      name: 'Advanced Machine Learning',
      code: 'CSE-AML',
      courseId: mtechCourse.id,
      facultyId: fac1Profile.id,
    },
  });

  await prisma.subject.upsert({
    where: { code: 'CSE-DS' },
    update: { facultyId: fac1Profile.id },
    create: {
      name: 'Distributed Systems',
      code: 'CSE-DS',
      courseId: mtechCourse.id,
      facultyId: fac1Profile.id,
    },
  });
  console.log('   ✓ Subjects seeded\n');

  // Summary
  const counts = {
    permissions: await prisma.permission.count(),
    rolePermissions: await prisma.rolePermission.count(),
    departments: await prisma.department.count(),
    courses: await prisma.course.count(),
    subjects: await prisma.subject.count(),
    classrooms: await prisma.classroom.count(),
    users: await prisma.user.count(),
    students: await prisma.student.count(),
    faculty: await prisma.faculty.count(),
    hods: await prisma.hOD.count(),
  };

  console.log('📊 Seed summary:');
  console.log(`   Permissions:     ${counts.permissions}`);
  console.log(`   RolePermissions: ${counts.rolePermissions}`);
  console.log(`   Departments:     ${counts.departments}`);
  console.log(`   Courses:         ${counts.courses}`);
  console.log(`   Subjects:        ${counts.subjects}`);
  console.log(`   Classrooms:      ${counts.classrooms}`);
  console.log(`   Users:           ${counts.users}`);
  console.log(`   Students:        ${counts.students}`);
  console.log(`   Faculty:         ${counts.faculty}`);
  console.log(`   HODs:            ${counts.hods}`);
  console.log('\n✅ Academic and Auth seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
