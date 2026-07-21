import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export class CourseRepository {
  async findById(id: string) {
    return prisma.course.findUnique({
      where: { id },
      include: { department: true },
    });
  }

  async create(data: Prisma.CourseCreateInput) {
    return prisma.course.create({
      data,
    });
  }

  async update(id: string, data: Prisma.CourseUpdateInput) {
    return prisma.course.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.course.delete({
      where: { id },
    });
  }

  async list(params: {
    skip?: number;
    take?: number;
    where?: Prisma.CourseWhereInput;
    orderBy?: Prisma.CourseOrderByWithRelationInput;
  }) {
    return prisma.course.findMany({
      skip: params.skip,
      take: params.take,
      where: params.where,
      orderBy: params.orderBy,
      include: { department: true },
    });
  }

  async count(where?: Prisma.CourseWhereInput) {
    return prisma.course.count({
      where,
    });
  }
}
