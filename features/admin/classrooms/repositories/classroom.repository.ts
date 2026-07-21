import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export class ClassroomRepository {
  async findById(id: string) {
    return prisma.classroom.findUnique({
      where: { id },
    });
  }

  async findByRoomNumber(roomNumber: string) {
    return prisma.classroom.findUnique({
      where: { roomNumber },
    });
  }

  async create(data: Prisma.ClassroomCreateInput) {
    return prisma.classroom.create({
      data,
    });
  }

  async update(id: string, data: Prisma.ClassroomUpdateInput) {
    return prisma.classroom.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.classroom.delete({
      where: { id },
    });
  }

  async list(params: {
    skip?: number;
    take?: number;
    where?: Prisma.ClassroomWhereInput;
    orderBy?: Prisma.ClassroomOrderByWithRelationInput;
  }) {
    return prisma.classroom.findMany({
      skip: params.skip,
      take: params.take,
      where: params.where,
      orderBy: params.orderBy,
    });
  }

  async count(where?: Prisma.ClassroomWhereInput) {
    return prisma.classroom.count({
      where,
    });
  }
}
