'use client';

import * as React from 'react';
import {
  HelpCircle,
  PlusCircle,
  Clock,
  Trash2,
  RefreshCw,
  Loader2,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  createQuizAction,
  getFacultyQuizzesDataAction,
} from '@/features/lms/actions/quiz.actions';

interface QuestionDraft {
  id: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
  marks: number;
}

export default function FacultyQuizCreatePage() {
  const [data, setData] = React.useState<Awaited<ReturnType<typeof getFacultyQuizzesDataAction>> | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Quiz Form fields
  const [subjectId, setSubjectId] = React.useState('');
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [durationMinutes, setDurationMinutes] = React.useState('15');
  const [availableFrom, setAvailableFrom] = React.useState('');
  const [availableTo, setAvailableTo] = React.useState('');

  // Questions Draft
  const [questions, setQuestions] = React.useState<QuestionDraft[]>([
    {
      id: 'q1',
      text: 'Which data structure follows the Last In First Out (LIFO) principle?',
      options: ['Queue', 'Stack', 'Linked List', 'Tree'],
      correctOptionIndex: 1,
      marks: 2,
    },
  ]);

  // Filter
  const [subjectFilter, setSubjectFilter] = React.useState('');

  const fetchData = React.useCallback(async (filter?: string) => {
    setIsLoading(true);
    try {
      const res = await getFacultyQuizzesDataAction(filter);
      setData(res);
      if (!subjectId && res.subjects.length > 0) {
        setSubjectId(res.subjects[0].id);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch quizzes';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [subjectId]);

  React.useEffect(() => {
    fetchData(subjectFilter);
  }, [fetchData, subjectFilter]);

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: `q_${Date.now()}`,
        text: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
        marks: 1,
      },
    ]);
  };

  const handleRemoveQuestion = (id: string) => {
    if (questions.length <= 1) {
      toast.error('Quiz must have at least one question');
      return;
    }
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleQuestionChange = (id: string, field: keyof QuestionDraft, value: string | number | string[]) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  const handleOptionChange = (qId: string, optIndex: number, val: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;
        const newOpts = [...q.options];
        newOpts[optIndex] = val;
        return { ...q, options: newOpts };
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subjectId) {
      toast.error('Please select a subject');
      return;
    }
    if (!title.trim() || !durationMinutes || !availableFrom || !availableTo) {
      toast.error('Title, Duration, Available From, and Available To dates are required');
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        toast.error(`Question ${i + 1} text is empty`);
        return;
      }
      if (q.options.some((opt) => !opt.trim())) {
        toast.error(`Question ${i + 1} has blank options. All 4 options must be filled`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const res = await createQuizAction({
        subjectId,
        title,
        description,
        durationMinutes: parseInt(durationMinutes, 10),
        availableFrom,
        availableTo,
        questions: questions.map((q) => ({
          text: q.text,
          options: q.options,
          correctOptionIndex: q.correctOptionIndex,
          marks: q.marks,
        })),
      });

      if (res.success) {
        toast.success(`Quiz "${title}" created successfully with ${questions.length} questions!`);
        setTitle('');
        setDescription('');
        setAvailableFrom('');
        setAvailableTo('');
        fetchData(subjectFilter);
      } else {
        toast.error(res.error || 'Failed to create quiz');
      }
    } catch {
      toast.error('An error occurred while creating quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            <HelpCircle className="h-7 w-7 text-primary" />
            Faculty Quiz & MCQ Builder
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Create online multiple-choice quizzes with timed availability windows and automated scoring.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchData(subjectFilter)}
          disabled={isLoading}
          className="gap-2 text-xs font-medium self-start md:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-xs">
          <TabsTrigger value="create" className="gap-2 text-xs font-bold">
            <PlusCircle className="h-4 w-4" /> Create Quiz
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-2 text-xs font-bold">
            <BookOpen className="h-4 w-4" /> Quizzes ({data?.quizzes?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: CREATE QUIZ FORM */}
        <TabsContent value="create" className="mt-6">
          <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
            {/* Quiz General Info Card */}
            <Card className="border-border/60 shadow-xs">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Quiz Settings & Availability Window
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Subject Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                    Select Subject <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    required
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-primary"
                  >
                    <option value="">-- Select Assigned Subject --</option>
                    {data?.subjects?.map((s) => (
                      <option key={s.id} value={s.id}>
                        [{s.code}] {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Title & Duration */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                      Quiz Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Midterm Practice Quiz - Data Structures"
                      required
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                      Duration (Minutes) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(e.target.value)}
                      min="1"
                      required
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm font-medium focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                    Description / Instructions
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Instructions for students (e.g. 1 attempt allowed, strict time limit)..."
                    rows={2}
                    className="w-full p-3 rounded-md border border-input bg-background text-sm focus:outline-hidden"
                  />
                </div>

                {/* Available From / Available To */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                      Available From <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={availableFrom}
                      onChange={(e) => setAvailableFrom(e.target.value)}
                      required
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm font-medium focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                      Available Until <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={availableTo}
                      onChange={(e) => setAvailableTo(e.target.value)}
                      required
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm font-medium focus:outline-hidden"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* MCQ Builder Card */}
            <Card className="border-border/60 shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-amber-500" />
                    Inline MCQ Question Builder ({questions.length})
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Add question text, 4 choices, mark the correct option radio button, and assign marks per question.
                  </CardDescription>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddQuestion}
                  className="gap-1.5 text-xs font-bold"
                >
                  <PlusCircle className="h-3.5 w-3.5" /> Add Question
                </Button>
              </CardHeader>

              <CardContent className="space-y-6">
                {questions.map((q, qIndex) => (
                  <div key={q.id} className="p-4 rounded-lg border border-border/70 bg-card/60 space-y-3 relative">
                    <div className="flex items-center justify-between gap-2 border-b pb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-xs font-bold">
                          Q{qIndex + 1}
                        </Badge>
                        <span className="text-xs font-bold text-muted-foreground">Question Item</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-[11px] font-bold text-muted-foreground">Marks:</label>
                        <input
                          type="number"
                          value={q.marks}
                          onChange={(e) => handleQuestionChange(q.id, 'marks', parseInt(e.target.value, 10) || 1)}
                          min="1"
                          className="w-16 h-7 px-2 rounded-md border border-input text-xs font-bold text-center"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveQuestion(q.id)}
                          className="h-7 w-7 p-0 text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Question text */}
                    <div className="space-y-1">
                      <input
                        type="text"
                        value={q.text}
                        onChange={(e) => handleQuestionChange(q.id, 'text', e.target.value)}
                        placeholder={`Enter text for Question ${qIndex + 1}...`}
                        required
                        className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm font-semibold focus:outline-hidden"
                      />
                    </div>

                    {/* Options list */}
                    <div className="space-y-2 pt-1">
                      <span className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">
                        Options (Select Radio for Correct Answer)
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {q.options.map((optVal, optIdx) => (
                          <div
                            key={optIdx}
                            className={`flex items-center gap-2 p-2 rounded-md border ${
                              q.correctOptionIndex === optIdx
                                ? 'border-emerald-500/50 bg-emerald-500/10'
                                : 'border-input bg-background'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`correct_${q.id}`}
                              checked={q.correctOptionIndex === optIdx}
                              onChange={() => handleQuestionChange(q.id, 'correctOptionIndex', optIdx)}
                              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="text-xs font-mono font-bold text-muted-foreground w-4">
                              {String.fromCharCode(65 + optIdx)}.
                            </span>
                            <input
                              type="text"
                              value={optVal}
                              onChange={(e) => handleOptionChange(q.id, optIdx, e.target.value)}
                              placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                              required
                              className="w-full text-xs font-medium bg-transparent border-none focus:outline-hidden"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                <div className="pt-2 flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="gap-2 font-bold bg-primary text-primary-foreground"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
                    Publish Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </TabsContent>

        {/* TAB 2: LIST VIEW */}
        <TabsContent value="list" className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="max-w-xs w-full">
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs font-semibold focus:outline-hidden"
              >
                <option value="">All Taught Subjects</option>
                {data?.subjects?.map((s) => (
                  <option key={s.id} value={s.id}>
                    [{s.code}] {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Card className="border-border/60 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Created Quizzes</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {!data?.quizzes || data.quizzes.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  No quizzes created yet for the selected subject.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left border-t border-border">
                    <thead className="bg-muted/50 text-xs uppercase text-muted-foreground font-semibold">
                      <tr>
                        <th className="px-4 py-3">Subject</th>
                        <th className="px-4 py-3">Quiz Title</th>
                        <th className="px-4 py-3">Duration</th>
                        <th className="px-4 py-3">Availability Window</th>
                        <th className="px-4 py-3">Questions</th>
                        <th className="px-4 py-3">Attempts</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {data.quizzes.map((q) => (
                        <tr key={q.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-semibold text-xs font-mono">
                            {q.subject.code}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-bold text-foreground">{q.title}</div>
                            <div className="text-xs text-muted-foreground line-clamp-1">
                              {q.description}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs font-bold whitespace-nowrap">
                            {q.durationMinutes} mins
                          </td>
                          <td className="px-4 py-3 text-xs whitespace-nowrap">
                            {new Date(q.availableFrom).toLocaleDateString()} - {new Date(q.availableTo).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-xs font-bold">
                            {q._count.questions} questions ({q.totalMarks} pts)
                          </td>
                          <td className="px-4 py-3 text-xs">
                            <Badge variant="secondary" className="font-bold">
                              {q._count.attempts} Attempts
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
