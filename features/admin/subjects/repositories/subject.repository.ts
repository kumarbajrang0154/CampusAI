import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export class SubjectRepository {
  async findById(id: string) {
    return prisma.subject.findUnique({
      where: { id },
      include: { 
        course: true,
        faculty: { include: { user: true } }
      },
    });
  }

  async findByCode(code: string) {
    return prisma.subject.findUnique({
      where: { code: code.toUpperCase() },
    });
  }

  async create(data: Prisma.SubjectCreateInput) {
    return prisma.subject.create({
      data,
    });
  }

  async update(id: string, data: Prisma.SubjectUpdateInput) {
    return prisma.subject.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.subject.delete({
      where: { id },
    });
  }

  async list(params: {
    skip?: number;
    take?: number;
    where?: Prisma.SubjectWhereInput;
    orderBy?: Prisma.SubjectOrderByWithRelationInput;
  }) {
    return prisma.subject.findMany({
      skip: params.skip,
      take: params.take,
      where: params.where,
      orderBy: params.orderBy,
      include: { 
        course: true,
        faculty: { include: { user: true } }
      },
    });
  }

  async count(where?: Prisma.SubjectWhereInput) {
    return prisma.subject.count({
      where,
    });
  }
}
