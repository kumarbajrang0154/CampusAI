import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export class DepartmentRepository {
  async findById(id: string) {
    return prisma.department.findUnique({
      where: { id },
    });
  }

  async findByCode(code: string) {
    return prisma.department.findUnique({
      where: { code: code.toUpperCase() },
    });
  }

  async findByName(name: string) {
    return prisma.department.findUnique({
      where: { name },
    });
  }

  async create(data: Prisma.DepartmentCreateInput) {
    return prisma.department.create({
      data,
    });
  }

  async update(id: string, data: Prisma.DepartmentUpdateInput) {
    return prisma.department.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.department.delete({
      where: { id },
    });
  }

  async list(params: {
    skip?: number;
    take?: number;
    where?: Prisma.DepartmentWhereInput;
    orderBy?: Prisma.DepartmentOrderByWithRelationInput;
  }) {
    return prisma.department.findMany({
      skip: params.skip,
      take: params.take,
      where: params.where,
      orderBy: params.orderBy,
    });
  }

  async count(where?: Prisma.DepartmentWhereInput) {
    return prisma.department.count({
      where,
    });
  }
}
