'use client';

import * as React from 'react';
import {
  FileCheck,
  PlusCircle,
  Upload,
  RefreshCw,
  Loader2,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  createAssignmentAction,
  getFacultyAssignmentsDataAction,
} from '@/features/lms/actions/assignment.actions';

export default function FacultyAssignmentCreatePage() {
  const [data, setData] = React.useState<Awaited<ReturnType<typeof getFacultyAssignmentsDataAction>> | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form fields
  const [subjectId, setSubjectId] = React.useState('');
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [maxMarks, setMaxMarks] = React.useState('100');
  const [attachmentFile, setAttachmentFile] = React.useState<File | null>(null);

  // Filter
  const [subjectFilter, setSubjectFilter] = React.useState('');

  const fetchData = React.useCallback(async (filter?: string) => {
    setIsLoading(true);
    try {
      const res = await getFacultyAssignmentsDataAction(filter);
      setData(res);
      if (!subjectId && res.subjects.length > 0) {
        setSubjectId(res.subjects[0].id);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch assignments';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [subjectId]);

  React.useEffect(() => {
    fetchData(subjectFilter);
  }, [fetchData, subjectFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subjectId) {
      toast.error('Please select a subject');
      return;
    }
    if (!title.trim() || !description.trim()) {
      toast.error('Title and Description are required');
      return;
    }
    if (!endDate) {
      toast.error('Please set a due date');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('subjectId', subjectId);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('startDate', startDate || new Date().toISOString());
      formData.append('endDate', endDate);
      formData.append('maxMarks', maxMarks);
      if (attachmentFile) {
        formData.append('attachmentFile', attachmentFile);
      }

      const res = await createAssignmentAction(formData);

      if (res.success) {
        toast.success(`Assignment "${title}" created successfully!`);
        setTitle('');
        setDescription('');
        setEndDate('');
        setAttachmentFile(null);
        fetchData(subjectFilter);
      } else {
        toast.error(res.error || 'Failed to create assignment');
      }
    } catch {
      toast.error('An error occurred while creating assignment');
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
            <FileCheck className="h-7 w-7 text-primary" />
            Faculty Assignment Manager
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Create coursework assignments for your assigned subjects with deadlines and reference attachments.
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
            <PlusCircle className="h-4 w-4" /> Create Assignment
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-2 text-xs font-bold">
            <BookOpen className="h-4 w-4" /> Assignments ({data?.assignments?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: CREATE FORM */}
        <TabsContent value="create" className="mt-6">
          <Card className="border-border/60 shadow-xs max-w-2xl">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-primary" />
                New Assignment Setup
              </CardTitle>
              <CardDescription className="text-xs">
                Fill in assignment details, total marks, due date, and upload a reference file to Cloudinary.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Subject */}
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

                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                    Assignment Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Assignment 2: B-Tree Indexing Implementation"
                    required
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                    Instructions / Problem Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detailed problem statement, submission format guidelines, etc..."
                    rows={4}
                    required
                    className="w-full p-3 rounded-md border border-input bg-background text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Start Date & End Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                      Start Date
                    </label>
                    <input
                      type="datetime-local"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm font-medium focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                      Due Date & Time <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm font-medium focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Max Marks & Attachment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                      Max Marks <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={maxMarks}
                      onChange={(e) => setMaxMarks(e.target.value)}
                      min="1"
                      required
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm font-medium focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                      Reference File (Optional, Cloudinary)
                    </label>
                    <input
                      type="file"
                      onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
                      className="w-full h-10 p-1.5 rounded-md border border-input bg-background text-xs"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="gap-2 font-bold bg-primary text-primary-foreground"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    Create Assignment
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
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
              <CardTitle className="text-base font-bold">Created Assignments</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {!data?.assignments || data.assignments.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  No assignments created yet for the selected subject.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left border-t border-border">
                    <thead className="bg-muted/50 text-xs uppercase text-muted-foreground font-semibold">
                      <tr>
                        <th className="px-4 py-3">Subject</th>
                        <th className="px-4 py-3">Title</th>
                        <th className="px-4 py-3">Due Date</th>
                        <th className="px-4 py-3">Max Marks</th>
                        <th className="px-4 py-3">Submissions</th>
                        <th className="px-4 py-3 text-right">Reference</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {data.assignments.map((a) => (
                        <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-semibold text-xs font-mono">
                            {a.subject.code}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-bold text-foreground">{a.title}</div>
                            <div className="text-xs text-muted-foreground line-clamp-1">
                              {a.description}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs whitespace-nowrap">
                            {new Date(a.endDate).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-xs font-bold">
                            {a.maxMarks} pts
                          </td>
                          <td className="px-4 py-3 text-xs">
                            <Badge variant="secondary" className="font-bold">
                              {a._count.submissions} Submissions
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {a.attachmentUrl ? (
                              <a
                                href={a.attachmentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                              >
                                File <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : (
                              <span className="text-xs text-muted-foreground">None</span>
                            )}
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
