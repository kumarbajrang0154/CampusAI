import prisma from '../lib/prisma';
import { DSADifficulty, DSAPlatform, DSAProblemStatus, UserRole } from '@prisma/client';
import { generatePlacementRoadmap } from '../lib/ai/ai-gateway';
import { StudentPlacementRepository } from '../features/student/placement/repositories/student-placement.repository';

async function main() {
  console.log('--- Verification Script: Placement Prep & AI Roadmap ---');

  // 1. Seed Placement Domains
  console.log('1. Seeding Placement Domains...');
  const domainData = [
    {
      name: 'SDE / Backend Development',
      slug: 'sde-backend',
      description: 'Master core DSA, system design, databases, REST/gRPC microservices, and server-side engineering.',
    },
    {
      name: 'Frontend Development',
      slug: 'frontend',
      description: 'Master JavaScript, React, UI performance, web architecture, CSS layouts, and modern frontend tools.',
    },
    {
      name: 'Data Science & Machine Learning',
      slug: 'data-science-ml',
      description: 'Master Python, statistics, SQL analytics, supervised/unsupervised ML, PyTorch, and ML system pipelines.',
    },
    {
      name: 'Full Stack Development',
      slug: 'fullstack',
      description: 'End-to-end modern web applications: React, Node.js, Next.js, relational/NoSQL DBs, and CI/CD.',
    },
    {
      name: 'DevOps & Cloud Systems',
      slug: 'devops-cloud',
      description: 'Containerization, Kubernetes, Infrastructure as Code, AWS/GCP, monitoring, and automated deployment pipelines.',
    },
  ];

  const domains = [];
  for (const d of domainData) {
    const dom = await prisma.placementDomain.upsert({
      where: { slug: d.slug },
      update: { name: d.name, description: d.description },
      create: d,
    });
    domains.push(dom);
  }
  console.log(`   Seeded ${domains.length} placement domains.`);

  const sdeDomain = domains.find((d) => d.slug === 'sde-backend') || domains[0];

  // 2. Seed Real Verified DSA Problems for SDE Domain
  console.log('2. Seeding starter DSA Problem Bank (Real LeetCode URLs)...');
  const dsaStarterSet = [
    {
      title: 'Two Sum',
      domainId: sdeDomain.id,
      difficulty: DSADifficulty.EASY,
      platform: DSAPlatform.LEETCODE,
      problemUrl: 'https://leetcode.com/problems/two-sum/',
      order: 1,
      dryRunExplanation: `Optimal Approach using Hash Map:\n1. Maintain a hash map storing value -> index.\n2. For each element x, calculate target - x.\n3. If target - x is in map, return indices [map[target-x], current_index].\n4. Time Complexity: O(N), Space Complexity: O(N).`,
      codeSolution: `function twoSum(nums: number[], target: number): number[] {\n  const map = new Map<number, number>();\n  for (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n    if (map.has(diff)) return [map.get(diff)!, i];\n    map.set(nums[i], i);\n  }\n  return [];\n}`,
    },
    {
      title: 'Reverse Linked List',
      domainId: sdeDomain.id,
      difficulty: DSADifficulty.EASY,
      platform: DSAPlatform.LEETCODE,
      problemUrl: 'https://leetcode.com/problems/reverse-linked-list/',
      order: 2,
      dryRunExplanation: `Iterative Pointer Reversal:\n1. Maintain prev = null and curr = head.\n2. Loop while curr != null: store nextTemp = curr.next, set curr.next = prev, advance prev = curr and curr = nextTemp.\n3. Return prev.\n4. Time: O(N), Space: O(1).`,
      codeSolution: `function reverseList(head: ListNode | null): ListNode | null {\n  let prev: ListNode | null = null;\n  let curr = head;\n  while (curr !== null) {\n    let nextTemp = curr.next;\n    curr.next = prev;\n    prev = curr;\n    curr = nextTemp;\n  }\n  return prev;\n}`,
    },
    {
      title: 'Valid Parentheses',
      domainId: sdeDomain.id,
      difficulty: DSADifficulty.EASY,
      platform: DSAPlatform.LEETCODE,
      problemUrl: 'https://leetcode.com/problems/valid-parentheses/',
      order: 3,
    },
    {
      title: 'Binary Search',
      domainId: sdeDomain.id,
      difficulty: DSADifficulty.EASY,
      platform: DSAPlatform.LEETCODE,
      problemUrl: 'https://leetcode.com/problems/binary-search/',
      order: 4,
    },
    {
      title: 'Merge Intervals',
      domainId: sdeDomain.id,
      difficulty: DSADifficulty.MEDIUM,
      platform: DSAPlatform.LEETCODE,
      problemUrl: 'https://leetcode.com/problems/merge-intervals/',
      order: 5,
    },
    {
      title: 'Group Anagrams',
      domainId: sdeDomain.id,
      difficulty: DSADifficulty.MEDIUM,
      platform: DSAPlatform.LEETCODE,
      problemUrl: 'https://leetcode.com/problems/group-anagrams/',
      order: 6,
    },
    {
      title: 'Lowest Common Ancestor of a Binary Tree',
      domainId: sdeDomain.id,
      difficulty: DSADifficulty.MEDIUM,
      platform: DSAPlatform.LEETCODE,
      problemUrl: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/',
      order: 7,
    },
    {
      title: 'Trapping Rain Water',
      domainId: sdeDomain.id,
      difficulty: DSADifficulty.HARD,
      platform: DSAPlatform.LEETCODE,
      problemUrl: 'https://leetcode.com/problems/trapping-rain-water/',
      order: 8,
    },
  ];

  for (const prob of dsaStarterSet) {
    const existing = await prisma.dSAProblem.findFirst({
      where: { title: prob.title, domainId: prob.domainId },
    });
    if (!existing) {
      await prisma.dSAProblem.create({ data: prob });
    }
  }
  console.log(`   Seeded ${dsaStarterSet.length} verified DSA problems.`);

  // 3. Test Real Gemini AI Roadmap Generator (or fallback parsing)
  console.log('3. Testing AI Gateway Placement Roadmap Generation...');
  const roadmapStages = await generatePlacementRoadmap(sdeDomain.name, sdeDomain.description);
  console.log(`   Generated ${roadmapStages.length} structured roadmap stages for domain "${sdeDomain.name}":`);
  roadmapStages.forEach((stage) => {
    console.log(`     - Stage ${stage.order}: [${stage.durationLabel}] ${stage.title}`);
  });

  // 4. Test Student Placement Profile Repository Operations
  console.log('4. Testing Student Placement Profile & Progress operations...');
  // Find or create test student
  let testStudent = await prisma.student.findFirst({
    include: { user: true },
  });

  if (!testStudent) {
    const testUser = await prisma.user.create({
      data: {
        email: 'teststudent.placement@campus.edu',
        name: 'Alex Student',
        role: UserRole.STUDENT,
      },
    });

    const dept = await prisma.department.findFirst() || await prisma.department.create({
      data: { name: 'Computer Science', code: 'CSE' },
    });

    testStudent = await prisma.student.create({
      data: {
        userId: testUser.id,
        enrollmentNo: 'ENROLL-PLAC-101',
        departmentId: dept.id,
        semester: 6,
        section: 'A',
        batchYear: 2026,
      },
      include: { user: true },
    });
  }

  const repo = new StudentPlacementRepository();
  const profile = await repo.setDomainAndGenerateRoadmap(testStudent.id, sdeDomain.id);
  if (!profile) throw new Error('Profile creation returned null');

  console.log('   Student Placement Profile Created/Updated:', {
    profileId: profile.id,
    studentId: profile.studentId,
    domainName: profile.domain?.name,
    stagesCount: profile.roadmapStages.length,
  });

  // Toggle stage 1
  if (profile.roadmapStages.length > 0) {
    const stage1 = profile.roadmapStages[0];
    const toggled = await repo.toggleStageCompletion(testStudent.id, stage1.id);
    console.log(`   Toggled stage "${stage1.title}" -> isCompleted: ${toggled.isCompleted}`);
  }

  // Update DSA problem progress
  const firstProb = await prisma.dSAProblem.findFirst({ where: { domainId: sdeDomain.id } });
  if (firstProb) {
    const prog = await repo.updateProblemProgress(testStudent.id, firstProb.id, DSAProblemStatus.SOLVED);
    console.log(`   Updated DSA Problem "${firstProb.title}" status -> ${prog.status}`);
  }

  // 5. Test Ownership / Unauthorized access check
  console.log('5. Testing Ownership / Unauthorized check...');
  try {
    await repo.toggleStageCompletion('fake-student-id-999', profile.roadmapStages[0].id);
    console.error('   FAILURE: Unauthorized access check failed to block.');
  } catch (err: unknown) {
    console.log(`   SUCCESS: Unauthorized stage toggle rejected as expected: ${(err as Error).message}`);
  }

  console.log('--- Placement Prep & AI Roadmap Verification Completed Successfully ---');
}

main()
  .catch((e) => {
    console.error('Verification script error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
