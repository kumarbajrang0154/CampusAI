import prisma from '@/lib/prisma';
import { CustomReportFilterInput } from '../schemas/report.schema';
import { format } from 'date-fns';

export class ReportRepository {
  // 1. User & Role Distribution
  async getUserDistributionStats() {
    const [roleCounts, studentDeptCounts, facultyDeptCounts, hodDeptCounts, departments] =
      await Promise.all([
        prisma.user.groupBy({
          by: ['role'],
          where: { deletedAt: null },
          _count: { id: true },
        }),
        prisma.student.groupBy({
          by: ['departmentId'],
          where: { user: { deletedAt: null } },
          _count: { id: true },
        }),
        prisma.faculty.groupBy({
          by: ['departmentId'],
          where: { user: { deletedAt: null } },
          _count: { id: true },
        }),
        prisma.hOD.groupBy({
          by: ['departmentId'],
          where: { user: { deletedAt: null } },
          _count: { id: true },
        }),
        prisma.department.findMany({
          select: { id: true, name: true, code: true },
        }),
      ]);

    // Map role counts
    const rolesMap: Record<string, number> = {
      STUDENT: 0,
      FACULTY: 0,
      HOD: 0,
      ADMIN: 0,
    };
    roleCounts.forEach((r) => {
      rolesMap[r.role] = r._count.id;
    });

    // Map department counts
    const deptCountMap = new Map<string, number>();
    studentDeptCounts.forEach((s) => {
      deptCountMap.set(s.departmentId, (deptCountMap.get(s.departmentId) || 0) + s._count.id);
    });
    facultyDeptCounts.forEach((f) => {
      deptCountMap.set(f.departmentId, (deptCountMap.get(f.departmentId) || 0) + f._count.id);
    });
    hodDeptCounts.forEach((h) => {
      deptCountMap.set(h.departmentId, (deptCountMap.get(h.departmentId) || 0) + h._count.id);
    });

    const departmentDistribution = departments.map((d) => ({
      name: d.code || d.name,
      fullName: d.name,
      usersCount: deptCountMap.get(d.id) || 0,
    }));

    return {
      roleDistribution: [
        { name: 'Students', value: rolesMap.STUDENT, role: 'STUDENT' },
        { name: 'Faculty', value: rolesMap.FACULTY, role: 'FACULTY' },
        { name: 'HODs', value: rolesMap.HOD, role: 'HOD' },
        { name: 'Admins', value: rolesMap.ADMIN, role: 'ADMIN' },
      ],
      departmentDistribution,
      totalUsers: Object.values(rolesMap).reduce((a, b) => a + b, 0),
    };
  }

  // 2. Academic Structure Summary
  async getAcademicStructureSummary() {
    const [departmentsCount, coursesCount, subjectsCount, classroomsCount] = await Promise.all([
      prisma.department.count(),
      prisma.course.count(),
      prisma.subject.count(),
      prisma.classroom.count(),
    ]);

    return {
      departmentsCount,
      coursesCount,
      subjectsCount,
      classroomsCount,
    };
  }

  // 3. Placement Analytics
  async getPlacementAnalytics() {
    const [statusCounts, offers, avgOfferPackageResult, totalApplications, totalSelected] =
      await Promise.all([
        prisma.application.groupBy({
          by: ['status'],
          _count: { id: true },
        }),
        prisma.offer.findMany({
          include: {
            application: {
              include: {
                student: {
                  include: {
                    department: {
                      select: { name: true, code: true },
                    },
                  },
                },
                drive: {
                  include: {
                    company: {
                      select: { name: true },
                    },
                  },
                },
              },
            },
          },
        }),
        prisma.offer.aggregate({
          _avg: { packageOffered: true },
        }),
        prisma.application.count(),
        prisma.application.count({ where: { status: 'SELECTED' } }),
      ]);

    const statusMap: Record<string, number> = {
      APPLIED: 0,
      SHORTLISTED: 0,
      INTERVIEW: 0,
      SELECTED: 0,
      REJECTED: 0,
    };

    statusCounts.forEach((s) => {
      statusMap[s.status] = s._count.id;
    });

    const funnelData = [
      { step: 'Applied', count: statusMap.APPLIED },
      { step: 'Shortlisted', count: statusMap.SHORTLISTED },
      { step: 'Interview', count: statusMap.INTERVIEW },
      { step: 'Selected', count: statusMap.SELECTED },
      { step: 'Rejected', count: statusMap.REJECTED },
    ];

    // Department offer counts
    const deptOffersMap = new Map<string, number>();
    offers.forEach((offer) => {
      const deptCode = offer.application.student.department?.code || 'Other';
      deptOffersMap.set(deptCode, (deptOffersMap.get(deptCode) || 0) + 1);
    });

    const offersByDepartment = Array.from(deptOffersMap.entries()).map(([dept, count]) => ({
      department: dept,
      offersCount: count,
    }));

    const averagePackageLPA = avgOfferPackageResult._avg.packageOffered
      ? parseFloat(avgOfferPackageResult._avg.packageOffered.toFixed(2))
      : 0;

    const selectionRate =
      totalApplications > 0 ? Math.round((totalSelected / totalApplications) * 100) : 0;

    return {
      funnelData,
      offersByDepartment,
      totalOffers: offers.length,
      averagePackageLPA,
      selectionRate,
      totalApplications,
    };
  }

  // 4. Timetable Coverage Stats
  async getTimetableCoverageStats() {
    const [publishedCount, draftCount, totalDepartments] = await Promise.all([
      prisma.timetable.count({ where: { status: 'PUBLISHED' } }),
      prisma.timetable.count({ where: { status: 'DRAFT' } }),
      prisma.department.count(),
    ]);

    return {
      publishedCount,
      draftCount,
      totalTimetables: publishedCount + draftCount,
      totalDepartments,
    };
  }

  // 5. System Activity Trend (Past 14 Days)
  async getSystemActivityTrend(days = 14) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await prisma.activityLog.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      select: {
        createdAt: true,
      },
    });

    // Group logs by YYYY-MM-DD
    const countsByDate = new Map<string, number>();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = format(d, 'MMM dd');
      countsByDate.set(key, 0);
    }

    logs.forEach((log) => {
      const key = format(new Date(log.createdAt), 'MMM dd');
      if (countsByDate.has(key)) {
        countsByDate.set(key, countsByDate.get(key)! + 1);
      }
    });

    return Array.from(countsByDate.entries()).map(([date, count]) => ({
      date,
      actionsCount: count,
    }));
  }

  // Custom Report Exporter Data Query
  async getCustomReportExportData(filters: CustomReportFilterInput) {
    const startDate = filters.startDate ? new Date(filters.startDate) : undefined;
    const endDate = filters.endDate ? new Date(filters.endDate) : undefined;

    if (filters.domain === 'USERS') {
      const users = await prisma.user.findMany({
        where: {
          deletedAt: null,
          ...(filters.roleFilter ? { role: filters.roleFilter as any } : {}),
          ...(startDate || endDate
            ? {
                createdAt: {
                  ...(startDate ? { gte: startDate } : {}),
                  ...(endDate ? { lte: endDate } : {}),
                },
              }
            : {}),
        },
        include: {
          student: { include: { department: true } },
          faculty: { include: { department: true } },
          hod: { include: { department: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      return users.map((u) => {
        const dept =
          u.student?.department?.name ||
          u.faculty?.department?.name ||
          u.hod?.department?.name ||
          'N/A';
        return {
          ID: u.id,
          Name: u.name || 'Unnamed',
          Email: u.email,
          Role: u.role,
          Department: dept,
          Status: u.status,
          CreatedAt: format(new Date(u.createdAt), 'yyyy-MM-dd HH:mm:ss'),
        };
      });
    }

    if (filters.domain === 'PLACEMENT') {
      const applications = await prisma.application.findMany({
        where: {
          ...(startDate || endDate
            ? {
                appliedAt: {
                  ...(startDate ? { gte: startDate } : {}),
                  ...(endDate ? { lte: endDate } : {}),
                },
              }
            : {}),
        },
        include: {
          student: { include: { user: true, department: true } },
          drive: { include: { company: true } },
          offer: true,
          interview: true,
        },
        orderBy: { appliedAt: 'desc' },
      });

      return applications.map((app) => ({
        ApplicationID: app.id,
        StudentName: app.student.user.name || 'Unnamed',
        StudentEmail: app.student.user.email,
        Department: app.student.department?.name || 'N/A',
        CGPA: app.student.cgpa !== null && app.student.cgpa !== undefined ? app.student.cgpa : 'N/A',
        Company: app.drive.company.name,
        DrivePackageLPA: app.drive.packageOffered,
        ApplicationStatus: app.status,
        InterviewScheduledAt: app.interview
          ? format(new Date(app.interview.scheduledAt), 'yyyy-MM-dd HH:mm')
          : 'None',
        OfferPackageLPA: app.offer ? app.offer.packageOffered : 'None',
        OfferStatus: app.offer ? app.offer.status : 'None',
        AppliedAt: format(new Date(app.appliedAt), 'yyyy-MM-dd HH:mm:ss'),
      }));
    }

    if (filters.domain === 'ACADEMICS') {
      const departments = await prisma.department.findMany({
        include: {
          courses: {
            include: {
              subjects: true,
            },
          },
          _count: { select: { students: true, faculty: true } },
        },
      });

      return departments.map((d) => {
        const totalSubjectsCount = d.courses.reduce((sum, c) => sum + (c.subjects?.length || 0), 0);
        return {
          DepartmentID: d.id,
          Name: d.name,
          Code: d.code,
          CoursesCount: d.courses.length,
          SubjectsCount: totalSubjectsCount,
          StudentsCount: d._count.students,
          FacultyCount: d._count.faculty,
          CreatedAt: format(new Date(d.createdAt), 'yyyy-MM-dd HH:mm:ss'),
        };
      });
    }

    if (filters.domain === 'AUDIT') {
      const logs = await prisma.activityLog.findMany({
        where: {
          ...(startDate || endDate
            ? {
                createdAt: {
                  ...(startDate ? { gte: startDate } : {}),
                  ...(endDate ? { lte: endDate } : {}),
                },
              }
            : {}),
        },
        include: {
          user: { select: { name: true, email: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 500,
      });

      return logs.map((l) => ({
        LogID: l.id,
        ActorName: l.user.name || 'Unknown',
        ActorEmail: l.user.email,
        Role: l.user.role,
        Action: l.action,
        Details: l.details ? JSON.stringify(l.details) : '',
        IPAddress: l.ipAddress || 'Internal',
        Timestamp: format(new Date(l.createdAt), 'yyyy-MM-dd HH:mm:ss'),
      }));
    }

    return [];
  }
}
