import prisma from '../lib/prisma';

async function check() {
  const t = await prisma.timetable.count();
  const s = await prisma.timetableSlot.count();
  console.log({ timetables: t, slots: s });
}

check().finally(() => prisma.$disconnect());
