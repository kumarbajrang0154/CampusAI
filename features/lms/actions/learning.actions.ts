'use server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { LearningRepository } from '../repositories/learning.repository';
import { uploadToCloudinary } from '../services/cloudinary.service';
import type { ResourceType, NotesRequestStatus } from '@prisma/client';

/**
 * Faculty action: Upload a new learning resource (Cloudinary file or YouTube Link)
 */
export async function uploadLearningResourceAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== 'FACULTY' && session.user.role !== 'ADMIN')) {
    return { success: false, error: 'Unauthorized: Faculty role required' };
  }

  const faculty = await prisma.faculty.findUnique({
    where: { userId: session.user.id },
  });

  if (!faculty && session.user.role !== 'ADMIN') {
    return { success: false, error: 'Faculty profile not found' };
  }

  const subjectId = formData.get('subjectId') as string;
  const title = formData.get('title') as string;
  const description = (formData.get('description') as string) || undefined;
  const resourceType = formData.get('resourceType') as ResourceType;

  if (!subjectId || !title || !resourceType) {
    return { success: false, error: 'Subject, Title, and Resource Type are required' };
  }

  // RBAC Enforcement: Faculty can ONLY upload to subjects they teach
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
  });

  if (!subject) {
    return { success: false, error: 'Selected subject does not exist' };
  }

  if (faculty && subject.facultyId !== faculty.id && session.user.role !== 'ADMIN') {
    return { success: false, error: 'Forbidden: You are not assigned to teach this subject' };
  }

  let finalFileUrl = '';

  if (resourceType === 'YOUTUBE_LINK') {
    const rawUrl = (formData.get('youtubeUrl') as string) || '';
    if (!rawUrl || (!rawUrl.includes('youtube.com') && !rawUrl.includes('youtu.be'))) {
      return { success: false, error: 'Please enter a valid YouTube URL (e.g. https://www.youtube.com/watch?v=...)' };
    }
    finalFileUrl = rawUrl.trim();
  } else {
    // File upload (PDF, DOC, PPT)
    const file = formData.get('file') as File | null;
    if (!file || file.size === 0) {
      return { success: false, error: `Please attach a valid ${resourceType} file to upload` };
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const uploadResult = await uploadToCloudinary(buffer, file.name);
      finalFileUrl = uploadResult.url;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'File upload failed';
      return { success: false, error: msg };
    }
  }

  try {
    const resource = await LearningRepository.createLearningResource({
      subjectId,
      facultyId: faculty?.id ?? null,
      title,
      description,
      type: resourceType,
      fileUrl: finalFileUrl,
    });

    return { success: true, resource };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to save learning resource';
    return { success: false, error: msg };
  }
}

/**
 * Faculty action: Fetch data for Faculty Learning Upload screen
 */
export async function getFacultyLearningDataAction(subjectFilter?: string) {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== 'FACULTY' && session.user.role !== 'ADMIN')) {
    throw new Error('Unauthorized');
  }

  const faculty = await prisma.faculty.findUnique({
    where: { userId: session.user.id },
  });

  if (!faculty && session.user.role !== 'ADMIN') {
    throw new Error('Faculty profile not found');
  }

  const facultyId = faculty?.id || '';

  const subjects = await LearningRepository.getFacultySubjects(facultyId);
  const resources = await LearningRepository.getFacultyResources(facultyId, subjectFilter);
  const notesRequests = await LearningRepository.getFacultyNotesRequests(facultyId);

  return {
    subjects,
    resources,
    notesRequests,
  };
}

/**
 * Faculty action: Delete a resource
 */
export async function deleteLearningResourceAction(resourceId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  const faculty = await prisma.faculty.findUnique({
    where: { userId: session.user.id },
  });

  if (!faculty && session.user.role !== 'ADMIN') {
    return { success: false, error: 'Faculty profile not found' };
  }

  try {
    await LearningRepository.deleteLearningResource(resourceId, faculty?.id || '');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete resource';
    return { success: false, error: msg };
  }
}

/**
 * Faculty action: Respond to notes request (FULFILLED or DECLINED)
 */
export async function resolveNotesRequestAction(requestId: string, status: NotesRequestStatus) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const updated = await LearningRepository.resolveNotesRequest(requestId, status);
    return { success: true, updated };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update request';
    return { success: false, error: msg };
  }
}

/**
 * Student action: Fetch timetable (Strictly isolated to student's department, semester, section)
 */
export async function getStudentTimetableAction() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
    include: {
      department: true,
    },
  });

  if (!student) {
    throw new Error('Student profile not found');
  }

  // Fetch timetable for student's exact department, semester, section
  const timetable = await prisma.timetable.findFirst({
    where: {
      departmentId: student.departmentId,
      semester: student.semester,
      section: student.section,
    },
    include: {
      slots: {
        include: {
          subject: { select: { id: true, name: true, code: true } },
          classroom: { select: { id: true, roomNumber: true, type: true } },
          faculty: {
            include: {
              user: { select: { name: true } },
            },
          },
        },
        orderBy: [{ day: 'asc' }, { periodNumber: 'asc' }],
      },
    },
  });

  return {
    studentInfo: {
      departmentName: student.department.name,
      deptCode: student.department.code,
      semester: student.semester,
      section: student.section,
    },
    timetable,
  };
}

/**
 * Student action: Fetch learning resources & enrolled subjects
 */
export async function getStudentLearningDataAction(subjectFilter?: string, typeFilter?: ResourceType) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
  });

  if (!student) {
    throw new Error('Student profile not found');
  }

  const enrolledSubjects = await LearningRepository.getStudentEnrolledSubjects(student.id);
  const resources = await LearningRepository.getStudentLearningResources(student.id, subjectFilter, typeFilter);

  // Get student's pending requests
  const pendingRequests = await prisma.notesRequest.findMany({
    where: { studentId: student.id },
    select: { id: true, subjectId: true, status: true },
  });

  return {
    enrolledSubjects,
    resources,
    pendingRequests,
  };
}

/**
 * Student action: Request notes for an enrolled subject
 */
export async function requestNotesAction(data: { subjectId: string; message: string }) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
  });

  if (!student) {
    return { success: false, error: 'Student profile not found' };
  }

  // RBAC Enforcement: Check that the subject belongs to student's enrolled department
  const subject = await prisma.subject.findUnique({
    where: { id: data.subjectId },
    include: { course: true, faculty: true },
  });

  if (!subject || subject.course.departmentId !== student.departmentId) {
    return { success: false, error: 'Forbidden: You can only request notes for your enrolled subjects' };
  }

  try {
    const request = await LearningRepository.createNotesRequest({
      studentId: student.id,
      subjectId: data.subjectId,
      facultyId: subject.facultyId ?? undefined,
      message: data.message,
    });

    return { success: true, requestId: request.id };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create notes request';
    return { success: false, error: msg };
  }
}
