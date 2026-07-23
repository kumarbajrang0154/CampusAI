'use client';

import * as React from 'react';
import {
  HelpCircle,
  Clock,
  ShieldAlert,
  Lock,
  CheckCircle2,
  RefreshCw,
  Loader2,
  Maximize2,
  Send,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  getStudentQuizzesDataAction,
  startQuizAttemptAction,
  submitQuizAttemptAction,
} from '@/features/lms/actions/quiz.actions';
import type { QuizAttemptStatus } from '@prisma/client';

interface StudentQuizQuestionItem {
  id: string;
  text: string;
  options: string[];
  marks: number;
  order: number;
}

interface StudentQuizAttemptItem {
  id: string;
  quizId: string;
  studentId: string;
  score: number;
  status: QuizAttemptStatus;
  terminationReason?: string | null;
  createdAt: Date | string;
  answers?: Array<{ questionId: string; selectedOptionIndex: number }>;
}

interface StudentQuizItem {
  id: string;
  title: string;
  description?: string | null;
  durationMinutes: number;
  totalMarks: number;
  availableFrom: Date | string;
  availableTo: Date | string;
  subject: { id: string; name: string; code: string };
  faculty?: { user?: { name?: string | null } } | null;
  questions: StudentQuizQuestionItem[];
  attempts?: StudentQuizAttemptItem[];
}

export default function StudentQuizzesPage() {
  const [data, setData] = React.useState<Awaited<ReturnType<typeof getStudentQuizzesDataAction>> | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Quiz Attempt Flow States
  const [selectedQuiz, setSelectedQuiz] = React.useState<StudentQuizItem | null>(null);
  const [activeAttempt, setActiveAttempt] = React.useState<StudentQuizAttemptItem | null>(null);
  const [viewState, setViewState] = React.useState<'CATALOG' | 'PRE_START' | 'IN_PROGRESS' | 'RESULT'>('CATALOG');

  // Answers draft: map questionId -> selectedOptionIndex
  const [userAnswers, setUserAnswers] = React.useState<Record<string, number>>({});
  const [secondsRemaining, setSecondsRemaining] = React.useState<number>(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const fetchQuizzes = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getStudentQuizzesDataAction();
      setData(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch quizzes';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  // Handle Quiz Selection from Catalog
  const handleSelectQuiz = (quiz: StudentQuizItem) => {
    setSelectedQuiz(quiz);
    const existingAttempt = quiz.attempts?.[0];

    if (existingAttempt && existingAttempt.status !== 'IN_PROGRESS') {
      setActiveAttempt(existingAttempt);
      setViewState('RESULT');
    } else if (existingAttempt && existingAttempt.status === 'IN_PROGRESS') {
      setActiveAttempt(existingAttempt);
      // Populate previous answers if any
      const ansMap: Record<string, number> = {};
      existingAttempt.answers?.forEach((a) => {
        ansMap[a.questionId] = a.selectedOptionIndex;
      });
      setUserAnswers(ansMap);
      setViewState('IN_PROGRESS');
    } else {
      setViewState('PRE_START');
    }
  };

  // Start Quiz Attempt Trigger
  const handleStartAttempt = async () => {
    if (!selectedQuiz) return;
    setIsSubmitting(true);
    try {
      const res = await startQuizAttemptAction(selectedQuiz.id);
      if (res.success && res.attempt) {
        setActiveAttempt(res.attempt);
        setUserAnswers({});
        setViewState('IN_PROGRESS');

        // Request Fullscreen
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }

        // Initialize Countdown Timer
        const totalSecs = (selectedQuiz.durationMinutes || 15) * 60;
        setSecondsRemaining(totalSecs);
        toast.success('Quiz started! Anti-cheat surveillance is ACTIVE.');
      } else {
        toast.error(res.error || 'Failed to start quiz attempt');
      }
    } catch {
      toast.error('An error occurred starting quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Quiz Submission (Manual or Anti-Cheat Auto Submit)
  const executeSubmission = React.useCallback(
    async (status: QuizAttemptStatus, terminationReason?: string) => {
      if (!activeAttempt || isSubmitting) return;

      setIsSubmitting(true);

      const formattedAnswers = Object.entries(userAnswers).map(([qId, optIdx]) => ({
        questionId: qId,
        selectedOptionIndex: optIdx,
      }));

      try {
        const res = await submitQuizAttemptAction({
          attemptId: activeAttempt.id,
          status,
          terminationReason,
          answers: formattedAnswers,
        });

        if (res.success && res.attempt) {
          setActiveAttempt(res.attempt);
          setViewState('RESULT');

          if (status === 'SUBMITTED') {
            toast.success('Quiz submitted successfully!');
          } else {
            toast.error(`Quiz auto-submitted and locked: ${terminationReason}`);
          }
          fetchQuizzes();
        } else {
          toast.error(res.error || 'Submission error');
        }
      } catch {
        toast.error('Error auto-submitting quiz');
      } finally {
        setIsSubmitting(false);
      }
    },
    [activeAttempt, isSubmitting, userAnswers, fetchQuizzes]
  );

  // Timer Countdown Effect during IN_PROGRESS
  React.useEffect(() => {
    if (viewState !== 'IN_PROGRESS' || secondsRemaining <= 0) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          executeSubmission('AUTO_SUBMITTED_TIME_UP', 'Quiz duration expired.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [viewState, secondsRemaining, executeSubmission]);

  // Anti-Cheat Event Listeners Effect (Visibility Change, Window Blur, Screenshot Hotkeys)
  React.useEffect(() => {
    if (viewState !== 'IN_PROGRESS') return;

    // 1. Tab Switch / Window Minimize (Page Visibility API)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const remainingStr = formatTimer(secondsRemaining);
        executeSubmission(
          'AUTO_SUBMITTED_TAB_SWITCH',
          `Anti-cheat trigger: Student switched tabs/windows at ${remainingStr} remaining.`
        );
      }
    };

    // 2. Window Blur (Losing focus to another application)
    const handleWindowBlur = () => {
      const remainingStr = formatTimer(secondsRemaining);
      executeSubmission(
        'AUTO_SUBMITTED_WINDOW_BLUR',
        `Anti-cheat trigger: Student lost window focus to another application at ${remainingStr} remaining.`
      );
    };

    // 3. Best-Effort Screenshot Shortcut Keydown Listener
    const handleKeyDown = (e: KeyboardEvent) => {
      // PrintScreen key or Cmd+Shift+3/4/5 or Win+Shift+S
      const isPrintScreen = e.key === 'PrintScreen';
      const isCmdShift345 =
        (e.metaKey || e.ctrlKey) && e.shiftKey && ['3', '4', '5', 's', 'S'].includes(e.key);

      if (isPrintScreen || isCmdShift345) {
        e.preventDefault();
        executeSubmission(
          'AUTO_SUBMITTED_SCREENSHOT_ATTEMPT',
          'Anti-cheat trigger: Detected screenshot hotkey combination.'
        );
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [viewState, secondsRemaining, executeSubmission]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            <HelpCircle className="h-7 w-7 text-primary" />
            Online Quizzes & Assessments
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Attempt assigned MCQ quizzes with proctored window-focus surveillance and instant scoring.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchQuizzes}
          disabled={isLoading || viewState === 'IN_PROGRESS'}
          className="gap-2 text-xs font-medium self-start md:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {/* STATE 1: QUIZ CATALOG */}
      {viewState === 'CATALOG' && (
        <div className="space-y-4">
          {!data?.quizzes || data.quizzes.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground text-sm">
              No active online quizzes available for your enrolled subjects at this time.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.quizzes.map((quiz) => {
                const attempt = quiz.attempts?.[0];
                const isCompleted = attempt && attempt.status !== 'IN_PROGRESS';
                const isInProgress = attempt && attempt.status === 'IN_PROGRESS';
                const now = new Date();
                const isOpen = now >= new Date(quiz.availableFrom) && now <= new Date(quiz.availableTo);

                return (
                  <Card key={quiz.id} className="border-border/60 shadow-xs flex flex-col justify-between">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="outline" className="font-mono text-xs font-bold">
                          {quiz.subject.code}
                        </Badge>
                        {isCompleted ? (
                          <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30 text-[10px] font-bold">
                            Completed ({attempt.score}/{quiz.totalMarks})
                          </Badge>
                        ) : isInProgress ? (
                          <Badge className="bg-amber-500/15 text-amber-700 border-amber-500/30 text-[10px] font-bold">
                            In Progress
                          </Badge>
                        ) : isOpen ? (
                          <Badge className="bg-blue-500/15 text-blue-700 border-blue-500/30 text-[10px] font-bold">
                            Available Now
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">
                            Closed
                          </Badge>
                        )}
                      </div>

                      <CardTitle className="text-base font-bold text-foreground mt-1">
                        {quiz.title}
                      </CardTitle>
                      {quiz.description && (
                        <CardDescription className="text-xs line-clamp-2 mt-0.5">
                          {quiz.description}
                        </CardDescription>
                      )}
                    </CardHeader>

                    <CardContent className="space-y-3 pt-0">
                      <div className="text-xs text-muted-foreground space-y-1 bg-muted/30 p-2.5 rounded-md">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 font-semibold">
                            <Clock className="h-3.5 w-3.5 text-primary" /> Duration:
                          </span>
                          <span className="font-bold text-foreground">{quiz.durationMinutes} mins</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 font-semibold">
                            <HelpCircle className="h-3.5 w-3.5 text-amber-500" /> Total Questions:
                          </span>
                          <span className="font-bold text-foreground">{quiz.questions.length} ({quiz.totalMarks} pts)</span>
                        </div>
                      </div>

                      <Button
                        onClick={() => handleSelectQuiz(quiz)}
                        disabled={!isOpen && !isCompleted && !isInProgress}
                        className={`w-full gap-1.5 text-xs font-bold ${
                          isCompleted
                            ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                            : 'bg-primary text-primary-foreground'
                        }`}
                      >
                        {isCompleted ? 'View Quiz Result' : isInProgress ? 'Resume Quiz Attempt' : 'Enter Quiz Setup'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* STATE 2: PRE-START WARNING SCREEN */}
      {viewState === 'PRE_START' && selectedQuiz && (
        <Card className="border-border/60 shadow-xs max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs font-bold">
                {selectedQuiz.subject.code}
              </Badge>
              <CardTitle className="text-lg font-bold">{selectedQuiz.title}</CardTitle>
            </div>
            <CardDescription className="text-xs mt-1">
              Please read the anti-cheat guidelines carefully before starting your attempt.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 bg-muted/40 p-3 rounded-md text-xs">
              <div>
                <span className="text-muted-foreground">Duration:</span>{' '}
                <strong className="text-foreground">{selectedQuiz.durationMinutes} Minutes</strong>
              </div>
              <div>
                <span className="text-muted-foreground">Questions:</span>{' '}
                <strong className="text-foreground">{selectedQuiz.questions.length} Questions</strong>
              </div>
              <div>
                <span className="text-muted-foreground">Total Marks:</span>{' '}
                <strong className="text-foreground">{selectedQuiz.totalMarks} Points</strong>
              </div>
              <div>
                <span className="text-muted-foreground">Attempts Allowed:</span>{' '}
                <strong className="text-foreground">1 Strict Attempt</strong>
              </div>
            </div>

            {/* Anti-Cheat Warning Alert Banner */}
            <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0" />
                STRICT ANTI-CHEAT SURVEILLANCE ACTIVE
              </div>
              <p className="text-xs leading-relaxed">
                By starting this quiz, you enter a proctored environment. Tab switching, minimizing browser windows, losing window focus, or attempting screenshot keyboard shortcuts will <strong>IMMEDIATELY AUTO-SUBMIT and LOCK</strong> your quiz attempt permanently with the exact timestamp recorded.
              </p>
              <p className="text-[11px] opacity-80 italic">
                * Note: In-browser surveillance reliably detects tab/window focus switches. Screenshot shortcut detection operates on best-effort hotkey matching.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewState('CATALOG')}
                disabled={isSubmitting}
              >
                Back to Quizzes
              </Button>
              <Button
                onClick={handleStartAttempt}
                disabled={isSubmitting}
                className="gap-2 font-bold bg-primary text-primary-foreground"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Maximize2 className="h-4 w-4" />}
                I Understand, Start Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STATE 3: LIVE IN-PROGRESS QUIZ ATTEMPT INTERFACE */}
      {viewState === 'IN_PROGRESS' && selectedQuiz && (
        <div className="space-y-4 max-w-4xl mx-auto select-none" onContextMenu={(e) => e.preventDefault()}>
          {/* Top Bar: Timer & Anti-Cheat Status */}
          <div className="sticky top-14 z-20 flex items-center justify-between p-3.5 rounded-lg border border-border/80 bg-background/95 backdrop-blur-xs shadow-sm">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs font-bold">
                {selectedQuiz.subject.code}
              </Badge>
              <span className="font-bold text-sm text-foreground truncate max-w-xs md:max-w-md">
                {selectedQuiz.title}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Proctored Badge */}
              <Badge className="bg-rose-600 text-white text-[10px] font-extrabold gap-1 animate-pulse">
                <ShieldAlert className="h-3 w-3" /> PROCTORED
              </Badge>

              {/* Countdown Timer */}
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-md border font-mono font-bold text-sm ${
                secondsRemaining <= 120 ? 'bg-rose-500/20 text-rose-600 border-rose-500/40 animate-bounce' : 'bg-muted text-foreground'
              }`}>
                <Clock className="h-4 w-4 text-primary" />
                <span>{formatTimer(secondsRemaining)}</span>
              </div>
            </div>
          </div>

          {/* Anti-Cheat Active Warning Pill */}
          <div className="p-2.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-semibold flex items-center gap-2">
            <Lock className="h-4 w-4 shrink-0" />
            Do NOT switch tabs or change windows! Leaving this page will auto-submit and lock your attempt.
          </div>

          {/* Questions Container */}
          <div
            className="space-y-4"
            onCopy={(e) => e.preventDefault()}
            onCut={(e) => e.preventDefault()}
            onPaste={(e) => e.preventDefault()}
          >
            {selectedQuiz.questions.map((q, qIdx: number) => {
              const selectedOpt = userAnswers[q.id];

              return (
                <Card key={q.id} className="border-border/60 shadow-xs">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="font-mono text-xs font-bold">
                        Question {qIdx + 1} of {selectedQuiz.questions.length}
                      </Badge>
                      <span className="text-xs font-bold text-muted-foreground">{q.marks} pts</span>
                    </div>
                    <CardTitle className="text-base font-bold text-foreground mt-2">
                      {q.text}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {q.options.map((optText: string, optIdx: number) => {
                        const isSelected = selectedOpt === optIdx;

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() =>
                              setUserAnswers((prev) => ({ ...prev, [q.id]: optIdx }))
                            }
                            className={`flex items-center gap-3 p-3 rounded-lg border text-left text-xs font-semibold transition-all ${
                              isSelected
                                ? 'border-primary bg-primary/10 text-primary shadow-xs'
                                : 'border-input bg-card text-foreground hover:bg-muted'
                            }`}
                          >
                            <span className={`h-6 w-6 rounded-full flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                              isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                            }`}>
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{optText}</span>
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Submit Action */}
          <div className="p-4 rounded-lg bg-card border flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-semibold">
              Answered {Object.keys(userAnswers).length} of {selectedQuiz.questions.length} questions
            </span>

            <Button
              onClick={() => executeSubmission('SUBMITTED')}
              disabled={isSubmitting}
              className="gap-2 font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Submit Quiz
            </Button>
          </div>
        </div>
      )}

      {/* STATE 4: LOCKED / RESULT VIEW */}
      {viewState === 'RESULT' && activeAttempt && (
        <Card className="border-border/60 shadow-xs max-w-2xl mx-auto">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto h-12 w-12 rounded-full flex items-center justify-center bg-primary/10 mb-2">
              {activeAttempt.status === 'SUBMITTED' ? (
                <CheckCircle2 className="h-7 w-7 text-emerald-600" />
              ) : (
                <XCircle className="h-7 w-7 text-rose-600" />
              )}
            </div>
            <CardTitle className="text-xl font-bold">Quiz Attempt Summary</CardTitle>
            <CardDescription className="text-xs">
              Attempt completed on {new Date(activeAttempt.createdAt).toLocaleString()}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Auto-Submit / Anti-Cheat Lock Alert Banner */}
            {activeAttempt.status !== 'SUBMITTED' && (
              <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 space-y-1">
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
                  <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0" />
                  Quiz Closed by Anti-Cheat System
                </div>
                <p className="text-xs font-semibold italic bg-rose-500/10 p-2 rounded-md">
                  &quot;{activeAttempt.terminationReason || 'Attempt terminated due to security violation.'}&quot;
                </p>
              </div>
            )}

            {/* Score Card */}
            <div className="p-6 rounded-xl bg-muted/40 text-center space-y-2">
              <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                Final Score Achieved
              </span>
              <div className="text-4xl font-black text-foreground">
                {activeAttempt.score} <span className="text-lg text-muted-foreground font-normal">/ {selectedQuiz?.totalMarks || 10} pts</span>
              </div>
              <Badge variant="outline" className="font-bold text-xs">
                Status: {activeAttempt.status}
              </Badge>
            </div>

            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedQuiz(null);
                  setActiveAttempt(null);
                  setViewState('CATALOG');
                }}
              >
                Return to Quiz Catalog
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
