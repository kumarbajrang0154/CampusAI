'use server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { QuizRepository } from '../repositories/quiz.repository';
import type { QuizAttemptStatus } from '@prisma/client';

/**
 * Faculty action: Create a new Quiz with MCQ questions
 */
export async function createQuizAction(data: {
  subjectId: string;
  title: string;
  description?: string;
  durationMinutes: number;
  availableFrom: string;
  availableTo: string;
  questions: Array<{
    text: string;
    options: string[];
    correctOptionIndex: number;
    marks: number;
  }>;
}) {
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

  if (!data.subjectId || !data.title || !data.durationMinutes || !data.availableFrom || !data.availableTo) {
    return { success: false, error: 'Subject, Title, Duration, and Availability window are required' };
  }

  if (!data.questions || data.questions.length === 0) {
    return { success: false, error: 'Please add at least one question to the quiz' };
  }

  // RBAC Enforcement: Faculty can ONLY create quizzes for subjects they teach
  const subject = await prisma.subject.findUnique({ where: { id: data.subjectId } });
  if (!subject) {
    return { success: false, error: 'Subject not found' };
  }

  if (faculty && subject.facultyId !== faculty.id && session.user.role !== 'ADMIN') {
    return { success: false, error: 'Forbidden: You are not assigned to teach this subject' };
  }

  try {
    const quiz = await QuizRepository.createQuiz({
      subjectId: data.subjectId,
      facultyId: faculty?.id || '',
      title: data.title,
      description: data.description,
      durationMinutes: Number(data.durationMinutes),
      availableFrom: new Date(data.availableFrom),
      availableTo: new Date(data.availableTo),
      questions: data.questions,
    });

    return { success: true, quiz };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create quiz';
    return { success: false, error: msg };
  }
}

/**
 * Faculty action: Fetch quizzes created by faculty
 */
export async function getFacultyQuizzesDataAction(subjectFilter?: string) {
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

  const quizzes = await QuizRepository.getFacultyQuizzes(facultyId, subjectFilter);

  return { subjects, quizzes };
}

/**
 * Student action: Fetch quizzes for enrolled subjects with availability and attempt status
 */
export async function getStudentQuizzesDataAction() {
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

  const quizzes = await QuizRepository.getStudentQuizzes(student.id);

  return { quizzes };
}

/**
 * Student action: Start a quiz attempt (Enforces window & 1-attempt RBAC)
 */
export async function startQuizAttemptAction(quizId: string) {
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

  const quiz = await QuizRepository.getQuizById(quizId);
  if (!quiz) {
    return { success: false, error: 'Quiz not found' };
  }

  // RBAC: Verify quiz belongs to student's enrolled department
  if (quiz.subject.course.departmentId !== student.departmentId) {
    return { success: false, error: 'Forbidden: You can only attempt quizzes for your enrolled department subjects' };
  }

  // Window check
  const now = new Date();
  if (now < quiz.availableFrom) {
    return { success: false, error: 'Forbidden: Quiz is not open yet' };
  }
  if (now > quiz.availableTo) {
    return { success: false, error: 'Forbidden: Quiz availability window has closed' };
  }

  // Existing attempt check
  const existingAttempt = await QuizRepository.getStudentQuizAttempt(quizId, student.id);
  if (existingAttempt) {
    if (existingAttempt.status !== 'IN_PROGRESS') {
      return { success: false, error: 'Forbidden: You have already completed or locked your attempt for this quiz' };
    }
    // Return existing in-progress attempt
    return { success: true, attempt: existingAttempt, quiz };
  }

  try {
    const newAttempt = await QuizRepository.startQuizAttempt(quizId, student.id);
    return { success: true, attempt: newAttempt, quiz };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to start quiz attempt';
    return { success: false, error: msg };
  }
}

/**
 * Student action: Submit quiz attempt (Manual submit, Tab switch, Window blur, Screenshot attempt, or Time up)
 */
export async function submitQuizAttemptAction(data: {
  attemptId: string;
  status: QuizAttemptStatus;
  terminationReason?: string;
  answers: Array<{ questionId: string; selectedOptionIndex: number }>;
}) {
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

  try {
    const updatedAttempt = await QuizRepository.submitQuizAttempt({
      attemptId: data.attemptId,
      status: data.status,
      terminationReason: data.terminationReason,
      answers: data.answers,
    });

    return { success: true, attempt: updatedAttempt };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to submit quiz attempt';
    return { success: false, error: msg };
  }
}
