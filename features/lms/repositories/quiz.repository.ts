import prisma from '@/lib/prisma';
import type { QuizAttemptStatus } from '@prisma/client';

export class QuizRepository {
  /**
   * Create a Quiz with Questions and Options
   */
  static async createQuiz(data: {
    subjectId: string;
    facultyId: string;
    title: string;
    description?: string;
    durationMinutes: number;
    availableFrom: Date;
    availableTo: Date;
    questions: Array<{
      text: string;
      options: string[];
      correctOptionIndex: number;
      marks: number;
    }>;
  }) {
    const totalMarks = data.questions.reduce((sum, q) => sum + q.marks, 0);

    return prisma.quiz.create({
      data: {
        subjectId: data.subjectId,
        facultyId: data.facultyId,
        title: data.title,
        description: data.description ?? null,
        durationMinutes: data.durationMinutes,
        totalMarks: totalMarks > 0 ? totalMarks : 10,
        availableFrom: data.availableFrom,
        availableTo: data.availableTo,
        questions: {
          create: data.questions.map((q, idx) => ({
            text: q.text,
            options: q.options,
            correctOptionIndex: q.correctOptionIndex,
            marks: q.marks,
            order: idx + 1,
          })),
        },
      },
      include: {
        subject: { select: { id: true, name: true, code: true } },
        questions: true,
      },
    });
  }

  /**
   * Get Quizzes created by a faculty member
   */
  static async getFacultyQuizzes(facultyId: string, subjectId?: string) {
    return prisma.quiz.findMany({
      where: {
        facultyId,
        ...(subjectId ? { subjectId } : {}),
      },
      include: {
        subject: { select: { id: true, name: true, code: true } },
        _count: { select: { questions: true, attempts: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get Quizzes for a student's enrolled subjects
   */
  static async getStudentQuizzes(studentId: string) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { departmentId: true },
    });

    if (!student) return [];

    return prisma.quiz.findMany({
      where: {
        subject: { course: { departmentId: student.departmentId } },
      },
      include: {
        subject: { select: { id: true, name: true, code: true } },
        faculty: { include: { user: { select: { name: true } } } },
        questions: {
          select: { id: true, text: true, options: true, marks: true, order: true },
          orderBy: { order: 'asc' },
        },
        attempts: {
          where: { studentId },
          include: { answers: true },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { availableFrom: 'desc' },
    });
  }

  /**
   * Get Quiz details by ID for starting attempt
   */
  static async getQuizById(quizId: string) {
    return prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        subject: { select: { id: true, name: true, code: true, course: { select: { departmentId: true } } } },
        questions: {
          select: { id: true, text: true, options: true, marks: true, order: true },
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  /**
   * Get active or existing attempt for a student
   */
  static async getStudentQuizAttempt(quizId: string, studentId: string) {
    return prisma.quizAttempt.findFirst({
      where: { quizId, studentId },
      orderBy: { createdAt: 'desc' },
      include: {
        answers: true,
      },
    });
  }

  /**
   * Start a new QuizAttempt
   */
  static async startQuizAttempt(quizId: string, studentId: string) {
    return prisma.quizAttempt.create({
      data: {
        quizId,
        studentId,
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      },
    });
  }

  /**
   * Submit and calculate score for a QuizAttempt
   */
  static async submitQuizAttempt(data: {
    attemptId: string;
    status: QuizAttemptStatus;
    terminationReason?: string;
    answers: Array<{ questionId: string; selectedOptionIndex: number }>;
  }) {
    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: data.attemptId },
      include: {
        quiz: {
          include: {
            questions: true,
          },
        },
      },
    });

    if (!attempt || attempt.status !== 'IN_PROGRESS') {
      throw new Error('Attempt not found or already submitted/locked');
    }

    let calculatedScore = 0;
    const answersToCreate: Array<{
      questionId: string;
      selectedOptionIndex: number;
      isCorrect: boolean;
    }> = [];

    for (const q of attempt.quiz.questions) {
      const userAns = data.answers.find((a) => a.questionId === q.id);
      const selectedIndex = userAns ? userAns.selectedOptionIndex : -1;
      const isCorrect = selectedIndex === q.correctOptionIndex;

      if (isCorrect) {
        calculatedScore += q.marks;
      }

      if (selectedIndex >= 0) {
        answersToCreate.push({
          questionId: q.id,
          selectedOptionIndex: selectedIndex,
          isCorrect,
        });
      }
    }

    // Save answers and update attempt in single transaction
    return prisma.$transaction(async (tx) => {
      if (answersToCreate.length > 0) {
        await tx.quizAnswer.createMany({
          data: answersToCreate.map((a) => ({
            attemptId: data.attemptId,
            questionId: a.questionId,
            selectedOptionIndex: a.selectedOptionIndex,
            isCorrect: a.isCorrect,
          })),
        });
      }

      return tx.quizAttempt.update({
        where: { id: data.attemptId },
        data: {
          score: calculatedScore,
          status: data.status,
          terminationReason: data.terminationReason ?? null,
          submittedAt: new Date(),
        },
        include: {
          quiz: { select: { title: true, totalMarks: true } },
          answers: true,
        },
      });
    });
  }
}
