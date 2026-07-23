'use server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { AssignmentRepository } from '../repositories/assignment.repository';
import { uploadToCloudinary } from '../services/cloudinary.service';

/**
 * Faculty action: Create a new assignment with optional reference file attachment
 */
export async function createAssignmentAction(formData: FormData) {
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
  const description = formData.get('description') as string;
  const startDateStr = formData.get('startDate') as string;
  const endDateStr = formData.get('endDate') as string;
  const maxMarksStr = formData.get('maxMarks') as string;

  if (!subjectId || !title || !description || !endDateStr) {
    return { success: false, error: 'Subject, Title, Description, and Due Date are required' };
  }

  // RBAC Enforcement: Faculty can ONLY create assignments for subjects they teach
  const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
  if (!subject) {
    return { success: false, error: 'Subject not found' };
  }

  if (faculty && subject.facultyId !== faculty.id && session.user.role !== 'ADMIN') {
    return { success: false, error: 'Forbidden: You are not assigned to teach this subject' };
  }

  let attachmentUrl: string | undefined = undefined;
  const file = formData.get('attachmentFile') as File | null;

  if (file && file.size > 0) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const uploadResult = await uploadToCloudinary(buffer, file.name, 'campusai_assignment_attachments');
      attachmentUrl = uploadResult.url;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Attachment file upload failed';
      return { success: false, error: msg };
    }
  }

  try {
    const assignment = await AssignmentRepository.createAssignment({
      subjectId,
      facultyId: faculty?.id || '',
      title,
      description,
      startDate: startDateStr ? new Date(startDateStr) : new Date(),
      endDate: new Date(endDateStr),
      maxMarks: maxMarksStr ? parseInt(maxMarksStr, 10) : 100,
      attachmentUrl,
    });

    return { success: true, assignment };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create assignment';
    return { success: false, error: msg };
  }
}

/**
 * Faculty action: Fetch assignments created by faculty
 */
export async function getFacultyAssignmentsDataAction(subjectFilter?: string) {
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

  const subjects = await prisma.subject.findMany({
    where: { facultyId },
    select: { id: true, name: true, code: true },
  });

  const assignments = await AssignmentRepository.getFacultyAssignments(facultyId, subjectFilter);

  return { subjects, assignments };
}

/**
 * Student action: Fetch assignments for enrolled subjects
 */
export async function getStudentAssignmentsDataAction() {
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

  const assignments = await AssignmentRepository.getStudentAssignments(student.id);

  return { assignments };
}

/**
 * Student action: Submit work for an assignment (File upload or Text box)
 */
export async function submitAssignmentAction(formData: FormData) {
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

  const assignmentId = formData.get('assignmentId') as string;
  const textContent = (formData.get('textContent') as string) || undefined;
  const file = formData.get('file') as File | null;

  if (!assignmentId) {
    return { success: false, error: 'Assignment ID is required' };
  }

  // RBAC Enforcement: Check that assignment belongs to student's enrolled department
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: { subject: { include: { course: true } } },
  });

  if (!assignment || assignment.subject.course.departmentId !== student.departmentId) {
    return { success: false, error: 'Forbidden: You can only submit assignments for your enrolled subjects' };
  }

  if ((!file || file.size === 0) && (!textContent || !textContent.trim())) {
    return { success: false, error: 'Please provide either a file attachment or written text response' };
  }

  let fileUrl: string | undefined = undefined;
  if (file && file.size > 0) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const uploadResult = await uploadToCloudinary(buffer, file.name, 'campusai_student_submissions');
      fileUrl = uploadResult.url;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Submission file upload failed';
      return { success: false, error: msg };
    }
  }

  // Determine submission status: LATE if now > assignment.endDate
  const now = new Date();
  const status = now > new Date(assignment.endDate) ? 'LATE' : 'SUBMITTED';

  try {
    const submission = await AssignmentRepository.submitAssignment({
      assignmentId,
      studentId: student.id,
      fileUrl,
      textContent,
      status,
    });

    return { success: true, submission, status };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to submit assignment';
    return { success: false, error: msg };
  }
}
