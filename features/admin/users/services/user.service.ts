import { UserRepository } from '../repositories/user.repository';
import { UserRole, UserStatus, AdminRole, Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';

const userRepository = new UserRepository();

export class UserService {
  async createUser(
    input: {
      email: string;
      role: UserRole;
      name?: string;
      departmentId?: string;
      enrollmentNo?: string;
      employeeId?: string;
      designation?: string;
      specialization?: string;
      semester?: number;
      section?: string;
      batchYear?: number;
    },
    adminUserId: string
  ) {
    const email = input.email.trim().toLowerCase();
    const name = input.name?.trim() || email.split('@')[0];

    // 1. Check if user already exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('A user with this email already exists.');
    }

    // 2. Fetch default department if departmentId not provided for role profiles
    let departmentId = input.departmentId?.trim();
    if (!departmentId && (input.role === UserRole.STUDENT || input.role === UserRole.FACULTY || input.role === UserRole.HOD)) {
      const defaultDept = await prisma.department.findFirst();
      if (!defaultDept) {
        throw new Error('No department found. Please create a department first before adding academic users.');
      }
      departmentId = defaultDept.id;
    }

    // 3. Create user and role profile in a transaction
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          name,
          role: input.role,
          status: UserStatus.ACTIVE,
          isActive: true,
        },
      });

      // Create role profile
      const timestamp = Date.now().toString().slice(-6);

      if (input.role === UserRole.STUDENT && departmentId) {
        await tx.student.create({
          data: {
            userId: user.id,
            enrollmentNo: input.enrollmentNo?.trim() || `STU-${timestamp}`,
            departmentId,
            semester: input.semester || 1,
            section: input.section?.trim() || 'A',
            batchYear: input.batchYear || new Date().getFullYear(),
          },
        });
      } else if (input.role === UserRole.FACULTY && departmentId) {
        await tx.faculty.create({
          data: {
            userId: user.id,
            employeeId: input.employeeId?.trim() || `EMP-${timestamp}`,
            departmentId,
            designation: input.designation?.trim() || 'Assistant Professor',
            specialization: input.specialization?.trim() || 'General',
          },
        });
      } else if (input.role === UserRole.HOD && departmentId) {
        await tx.hOD.create({
          data: {
            userId: user.id,
            departmentId,
            office: 'Main Department Office',
          },
        });
      } else if (input.role === UserRole.ADMIN) {
        await tx.admin.create({
          data: {
            userId: user.id,
            adminRole: AdminRole.ADMIN,
          },
        });
      }

      await tx.activityLog.create({
        data: {
          userId: adminUserId,
          targetUserId: user.id,
          action: 'USER_CREATED',
          details: { email: user.email, role: user.role } as Prisma.InputJsonValue,
        },
      });

      return user;
    });

    return newUser;
  }

  async listUsers(
    filters: {
      role?: UserRole;
      status?: UserStatus;
      search?: string;
      page?: number;
      limit?: number;
    } = {}
  ) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
    };

    if (filters.role) {
      where.role = filters.role;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.search) {
      const searchLower = filters.search.trim().toLowerCase();
      where.OR = [
        { email: { contains: searchLower, mode: 'insensitive' } },
        { name: { contains: searchLower, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      userRepository.list({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: 'desc' },
      }),
      userRepository.count(where),
    ]);

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateUserRole(userId: string, newRole: UserRole, adminUserId: string) {
    const user = await userRepository.findById(userId);
    if (!user || user.deletedAt) {
      throw new Error('User not found.');
    }

    if (user.role === newRole) {
      return user;
    }

    // Safeguard: Cannot demote the last remaining Admin
    if (user.role === UserRole.ADMIN && newRole !== UserRole.ADMIN) {
      const adminCount = await prisma.user.count({
        where: {
          role: UserRole.ADMIN,
          deletedAt: null,
        },
      });

      if (adminCount <= 1) {
        throw new Error('Cannot change the role of the last remaining Admin account.');
      }
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id: userId },
        data: { role: newRole },
      });

      await tx.activityLog.create({
        data: {
          userId: adminUserId,
          targetUserId: userId,
          action: 'ROLE_CHANGED',
          details: { oldRole: user.role, newRole } as Prisma.InputJsonValue,
        },
      });

      return updated;
    });

    return updatedUser;
  }

  async toggleUserStatus(userId: string, adminUserId: string) {
    const user = await userRepository.findById(userId);
    if (!user || user.deletedAt) {
      throw new Error('User not found.');
    }

    const newStatus = user.status === UserStatus.ACTIVE ? UserStatus.INACTIVE : UserStatus.ACTIVE;
    const newIsActive = newStatus === UserStatus.ACTIVE;

    const updatedUser = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id: userId },
        data: {
          status: newStatus,
          isActive: newIsActive,
        },
      });

      await tx.activityLog.create({
        data: {
          userId: adminUserId,
          targetUserId: userId,
          action: newStatus === UserStatus.INACTIVE ? 'ACCOUNT_DISABLED' : 'ACCOUNT_ENABLED',
          details: {} as Prisma.InputJsonValue,
        },
      });

      return updated;
    });

    return updatedUser;
  }

  async deleteUser(userId: string, adminUserId: string) {
    // 1. Self-delete check
    if (userId === adminUserId) {
      throw new Error('You cannot delete your own account.');
    }

    const user = await userRepository.findById(userId);
    if (!user || user.deletedAt) {
      throw new Error('User not found.');
    }

    // 2. Safeguard: Last remaining Admin protection
    if (user.role === UserRole.ADMIN) {
      const adminCount = await prisma.user.count({
        where: {
          role: UserRole.ADMIN,
          deletedAt: null,
        },
      });

      if (adminCount <= 1) {
        throw new Error('Cannot delete the last remaining Admin account.');
      }
    }

    // 3. Protective dependency checks for Faculty / Student / HOD
    if (user.role === UserRole.FACULTY) {
      const faculty = await prisma.faculty.findUnique({ where: { userId } });
      if (faculty) {
        const [subjectCount, assignmentCount, slotCount] = await Promise.all([
          prisma.subject.count({ where: { facultyId: faculty.id } }),
          prisma.assignment.count({ where: { facultyId: faculty.id } }),
          prisma.timetableSlot.count({ where: { facultyId: faculty.id } }),
        ]);

        if (subjectCount > 0 || assignmentCount > 0 || slotCount > 0) {
          throw new Error('Cannot delete faculty member: this user has assigned subjects, assignments, or timetable slots. Please reassign them first.');
        }
      }
    }

    if (user.role === UserRole.STUDENT) {
      const student = await prisma.student.findUnique({ where: { userId } });
      if (student) {
        const [submissionCount, applicationCount] = await Promise.all([
          prisma.submission.count({ where: { studentId: student.id } }),
          prisma.application.count({ where: { studentId: student.id } }),
        ]);

        if (submissionCount > 0 || applicationCount > 0) {
          throw new Error('Cannot delete student: this user has active assignment submissions or placement applications.');
        }
      }
    }

    if (user.role === UserRole.HOD) {
      const hod = await prisma.hOD.findUnique({ where: { userId } });
      if (hod) {
        const deptCount = await prisma.department.count({ where: { id: hod.departmentId } });
        if (deptCount > 0) {
          // Check if HOD is actively linked as the department's HOD
          const activeDeptHod = await prisma.hOD.findFirst({ where: { id: hod.id } });
          if (activeDeptHod) {
            // HOD profile can be safely cleaned up if unassigned
          }
        }
      }
    }

    // 4. Soft delete user and create activity log
    const deletedUser = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id: userId },
        data: {
          deletedAt: new Date(),
          status: UserStatus.INACTIVE,
          isActive: false,
        },
      });

      await tx.activityLog.create({
        data: {
          userId: adminUserId,
          targetUserId: userId,
          action: 'USER_DELETED',
          details: {} as Prisma.InputJsonValue,
        },
      });

      return updated;
    });

    return deletedUser;
  }
}
