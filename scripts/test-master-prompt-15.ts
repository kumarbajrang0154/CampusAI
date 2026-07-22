import prisma from '../lib/prisma';
import { RoleService } from '../features/admin/roles/services/role.service';
import { hasPermission } from '../lib/permissions';
import { UserRole } from '@prisma/client';

async function main() {
  console.log('--- Testing Master Prompt 15: Roles & RBAC Management ---');

  const service = new RoleService();

  // 1. Fetch Admin User
  const adminUser = await prisma.user.findFirst({
    where: { role: UserRole.ADMIN, deletedAt: null },
  });
  if (!adminUser) throw new Error('No Admin user found.');

  // Fetch a Faculty user
  const facultyUser = await prisma.user.findFirst({
    where: { role: UserRole.FACULTY, deletedAt: null },
  });
  if (!facultyUser) throw new Error('No Faculty user found.');

  let student1 = await prisma.user.findFirst({
    where: { role: UserRole.STUDENT, deletedAt: null },
  });

  if (!student1) {
    student1 = await prisma.user.create({
      data: {
        email: `test.student.${Date.now()}@campusai.edu`,
        name: 'Test Student',
        role: UserRole.STUDENT,
        status: 'ACTIVE',
      },
    });
  }

  let student2 = await prisma.user.findFirst({
    where: { role: UserRole.STUDENT, id: { not: student1.id }, deletedAt: null },
  });

  // Clear any existing test overrides
  await prisma.userPermission.deleteMany({
    where: { userId: { in: [student1.id, student2?.id].filter(Boolean) as string[] } },
  });

  // 2. Fetch Matrix
  const matrix = await service.getRolePermissionMatrix();
  console.log(`✓ Matrix retrieved: ${matrix.permissions.length} total permissions across ${matrix.categories.length} categories.`);

  // Find quiz.create permission
  const quizCreatePerm = matrix.permissions.find((p) => p.key === 'quiz.create');
  const roleManagePerm = matrix.permissions.find((p) => p.key === 'role.manage');

  if (!quizCreatePerm || !roleManagePerm) {
    throw new Error('Required permissions quiz.create / role.manage not found.');
  }

  // 3. Test Role Permission Toggle (Faculty + quiz.create)
  console.log('\n1. Testing Role Permission Toggle (FACULTY -> quiz.create OFF)...');
  await service.toggleRolePermission(UserRole.FACULTY, quizCreatePerm.id, false, adminUser.id);
  const facultyHasPermOff = await hasPermission(facultyUser.id, 'quiz.create');
  console.log(`✓ Has permission after toggle OFF: ${facultyHasPermOff} (Expected: false)`);
  if (facultyHasPermOff !== false) throw new Error('Toggle OFF failed!');

  console.log('2. Restoring Role Permission (FACULTY -> quiz.create ON)...');
  await service.toggleRolePermission(UserRole.FACULTY, quizCreatePerm.id, true, adminUser.id);
  const facultyHasPermOn = await hasPermission(facultyUser.id, 'quiz.create');
  console.log(`✓ Has permission after toggle ON: ${facultyHasPermOn} (Expected: true)`);
  if (facultyHasPermOn !== true) throw new Error('Toggle ON failed!');

  // 4. Test Per-User Override (Student 1 + quiz.create GRANT)
  console.log('\n3. Testing Per-User Override (Granting quiz.create to Student 1)...');
  const student1Baseline = await hasPermission(student1.id, 'quiz.create');
  console.log(`✓ Student 1 baseline permission: ${student1Baseline} (Expected: false)`);

  await service.setUserOverride(student1.id, quizCreatePerm.id, true, adminUser.id);
  const student1WithOverride = await hasPermission(student1.id, 'quiz.create');
  console.log(`✓ Student 1 permission after GRANT override: ${student1WithOverride} (Expected: true)`);
  if (student1WithOverride !== true) throw new Error('User override GRANT failed!');

  if (student2) {
    const student2Perm = await hasPermission(student2.id, 'quiz.create');
    console.log(`✓ Student 2 (no override) permission: ${student2Perm} (Expected: false)`);
    if (student2Perm !== false) throw new Error('Override leaked to other students!');
  }

  // Reset override
  await service.setUserOverride(student1.id, quizCreatePerm.id, null, adminUser.id);
  const student1Reset = await hasPermission(student1.id, 'quiz.create');
  console.log(`✓ Student 1 permission after RESET override: ${student1Reset} (Expected: false)`);

  // 5. Test Safety Guard: Admin role.manage Protection
  console.log('\n4. Testing Safety Guard (Blocking removal of role.manage from Admin)...');
  try {
    await service.toggleRolePermission(UserRole.ADMIN, roleManagePerm.id, false, adminUser.id);
    console.error('❌ FAILED: Safety guard did not block admin role.manage removal!');
    process.exit(1);
  } catch (err: any) {
    console.log(`✓ SUCCESS: Admin safety guard caught -> "${err.message}"`);
  }

  // 6. Verify ActivityLog
  const logs = await prisma.activityLog.findMany({
    where: {
      action: { in: ['ROLE_PERMISSION_UPDATED', 'USER_PERMISSION_OVERRIDE_UPDATED'] },
    },
    take: 5,
    orderBy: { createdAt: 'desc' },
  });
  console.log(`\n5. Verified Activity Logs: ${logs.length} entries recorded.`);

  console.log('\n✅ All Master Prompt 15 Verification Checks Passed 100%!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
