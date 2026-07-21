import { ClassroomRepository } from '../repositories/classroom.repository';
import { Prisma, ClassroomType } from '@prisma/client';
import prisma from '@/lib/prisma';

const classroomRepository = new ClassroomRepository();

export class ClassroomService {
  async createClassroom(
    input: { roomNumber: string; capacity: number; type: ClassroomType },
    adminUserId: string
  ) {
    const roomNumber = input.roomNumber.trim();

    // 1. Verify Unique roomNumber
    const existing = await classroomRepository.findByRoomNumber(roomNumber);
    if (existing) {
      throw new Error(`A classroom with room number "${roomNumber}" already exists.`);
    }

    return prisma.$transaction(async (tx) => {
      const room = await tx.classroom.create({
        data: {
          roomNumber,
          capacity: input.capacity,
          type: input.type,
        },
      });

      await tx.activityLog.create({
        data: {
          userId: adminUserId,
          action: 'CLASSROOM_CREATED',
          details: { id: room.id, roomNumber: room.roomNumber, type: room.type } as Prisma.InputJsonValue,
        },
      });

      return room;
    });
  }

  async updateClassroom(
    id: string,
    input: { roomNumber: string; capacity: number; type: ClassroomType },
    adminUserId: string
  ) {
    const roomNumber = input.roomNumber.trim();

    const room = await classroomRepository.findById(id);
    if (!room) {
      throw new Error('Classroom not found.');
    }

    // Verify unique roomNumber if changing
    if (room.roomNumber !== roomNumber) {
      const existing = await classroomRepository.findByRoomNumber(roomNumber);
      if (existing) {
        throw new Error(`A classroom with room number "${roomNumber}" already exists.`);
      }
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.classroom.update({
        where: { id },
        data: {
          roomNumber,
          capacity: input.capacity,
          type: input.type,
        },
      });

      await tx.activityLog.create({
        data: {
          userId: adminUserId,
          action: 'CLASSROOM_UPDATED',
          details: { id, oldRoomNumber: room.roomNumber, newRoomNumber: roomNumber, type: input.type } as Prisma.InputJsonValue,
        },
      });

      return updated;
    });
  }

  async deleteClassroom(id: string, adminUserId: string) {
    const room = await classroomRepository.findById(id);
    if (!room) {
      throw new Error('Classroom not found.');
    }

    // Defensive check: no timetable linkage check required in this phase, but we can do a standard delete
    return prisma.$transaction(async (tx) => {
      const deleted = await tx.classroom.delete({
        where: { id },
      });

      await tx.activityLog.create({
        data: {
          userId: adminUserId,
          action: 'CLASSROOM_DELETED',
          details: { id, roomNumber: room.roomNumber } as Prisma.InputJsonValue,
        },
      });

      return deleted;
    });
  }

  async listClassrooms(filters: { search?: string; page?: number; limit?: number } = {}) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ClassroomWhereInput = {};

    if (filters.search) {
      const searchLower = filters.search.trim().toLowerCase();
      where.roomNumber = { contains: searchLower, mode: 'insensitive' };
    }

    const [classrooms, total] = await Promise.all([
      classroomRepository.list({
        skip,
        take: limit,
        where,
        orderBy: { roomNumber: 'asc' },
      }),
      classroomRepository.count(where),
    ]);

    return {
      classrooms,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
