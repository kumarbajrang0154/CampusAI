/**
 * prisma/seed.ts — CampusAI Stage 1 Auth Seed
 *
 * Seeds:
 * 1. All Permission records (25 permissions across 9 groups)
 * 2. RolePermission mappings (ADMIN, HOD, FACULTY, STUDENT)
 * 3. One default ADMIN user
 *
 * ⚠️  IMPORTANT: Change the default admin password IMMEDIATELY after first deploy.
 *     The password below is only for initial setup / local development.
 *
 * Run: npx tsx prisma/seed.ts
 */

import 'dotenv/config';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Permission definitions
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Role → Permission mapping
// ---------------------------------------------------------------------------

const rolePermissions: Record<UserRole, string[]> = {
  ADMIN: permissions.map((p) => p.key), // All permissions

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

// ---------------------------------------------------------------------------
// Main seed function
// ---------------------------------------------------------------------------

async function main() {
  console.log('🌱 Starting CampusAI Stage 1 seed...\n');

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

  console.log('   ✓ Admin user created: kumarbajrang325@gmail.com (Google OAuth only)');
  console.log('   ⚠️  Configure the admin email address to a real Google account you control before testing locally.\n');

  // Summary
  const counts = {
    permissions: await prisma.permission.count(),
    rolePermissions: await prisma.rolePermission.count(),
    users: await prisma.user.count(),
  };

  console.log('📊 Seed summary:');
  console.log(`   Permissions:     ${counts.permissions}`);
  console.log(`   RolePermissions: ${counts.rolePermissions}`);
  console.log(`   Users:           ${counts.users}`);
  console.log('\n✅ Stage 1 seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
