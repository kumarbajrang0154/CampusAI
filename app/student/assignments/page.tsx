'use client';

import * as React from 'react';
import {
  FileCheck,
  Calendar,
  Paperclip,
  Upload,
  RefreshCw,
  Loader2,
  ExternalLink,
  User,
  AlertTriangle,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  getStudentAssignmentsDataAction,
  submitAssignmentAction,
} from '@/features/lms/actions/assignment.actions';

interface StudentAssignmentItem {
  id: string;
  title: string;
  description: string;
  endDate: Date | string;
  maxMarks: number;
  attachmentUrl?: string | null;
  subject: { code: string; name: string };
  faculty?: { user?: { name?: string | null } } | null;
  submissions?: Array<{ status: string; textContent?: string | null; fileUrl?: string | null; grade?: number | null }>;
}

export default function StudentAssignmentsPage() {
  const [data, setData] = React.useState<Awaited<ReturnType<typeof getStudentAssignmentsDataAction>> | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Selected assignment for submission modal
  const [selectedAssignment, setSelectedAssignment] = React.useState<StudentAssignmentItem | null>(null);
  const [textContent, setTextContent] = React.useState('');
  const [file, setFile] = React.useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const fetchAssignments = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getStudentAssignmentsDataAction();
      setData(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch assignments';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const handleOpenSubmissionModal = (assignment: StudentAssignmentItem) => {
    setSelectedAssignment(assignment);
    const existing = assignment.submissions?.[0];
    setTextContent(existing?.textContent || '');
    setFile(null);
  };

  const handleSubmissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;

    if (!file && !textContent.trim()) {
      toast.error('Please provide either a file attachment or written response');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('assignmentId', selectedAssignment.id);
      if (textContent) formData.append('textContent', textContent);
      if (file) formData.append('file', file);

      const res = await submitAssignmentAction(formData);

      if (res.success) {
        const isLate = res.status === 'LATE';
        toast.success(
          isLate
            ? 'Assignment submitted (Flagged as LATE past deadline).'
            : 'Assignment submitted successfully!'
        );
        setSelectedAssignment(null);
        fetchAssignments();
      } else {
        toast.error(res.error || 'Failed to submit assignment');
      }
    } catch {
      toast.error('An error occurred during submission');
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
            Coursework Assignments
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            View assigned coursework, reference materials, submission deadlines, and submit your work.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchAssignments}
          disabled={isLoading}
          className="gap-2 text-xs font-medium self-start md:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {!data?.assignments || data.assignments.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground text-sm">
            No coursework assignments found for your enrolled subjects.
          </Card>
        ) : (
          data.assignments.map((assignment) => {
            const submission = assignment.submissions?.[0];
            const isSubmitted = Boolean(submission);
            const isPastDue = new Date() > new Date(assignment.endDate);

            return (
              <Card key={assignment.id} className="border-border/60 shadow-xs hover:border-border transition-all">
                <CardHeader className="flex flex-col md:flex-row md:items-start justify-between gap-3 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs font-bold">
                        {assignment.subject.code}
                      </Badge>
                      <CardTitle className="text-base font-bold text-foreground">
                        {assignment.title}
                      </CardTitle>
                    </div>

                    <CardDescription className="text-xs flex flex-wrap items-center gap-3 mt-1">
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5 text-primary" />
                        Instructor: <strong className="text-foreground">{assignment.faculty?.user?.name || 'Faculty'}</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-amber-500" />
                        Due: <strong className="text-foreground">{new Date(assignment.endDate).toLocaleString()}</strong>
                      </span>
                      <span className="flex items-center gap-1 font-bold text-foreground">
                        Max Marks: {assignment.maxMarks} pts
                      </span>
                    </CardDescription>
                  </div>

                  {/* Submission Status Badge */}
                  <div className="flex items-center gap-2 shrink-0">
                    {!isSubmitted ? (
                      isPastDue ? (
                        <Badge variant="outline" className="bg-rose-500/15 text-rose-700 border-rose-500/30 text-xs font-bold">
                          Missing (Past Due)
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-500/15 text-amber-700 border-amber-500/30 text-xs font-bold">
                          Pending Submission
                        </Badge>
                      )
                    ) : submission.status === 'LATE' ? (
                      <Badge variant="outline" className="bg-rose-500/15 text-rose-700 border-rose-500/30 text-xs font-bold">
                        Submitted LATE
                      </Badge>
                    ) : submission.status === 'GRADED' ? (
                      <Badge variant="outline" className="bg-purple-500/15 text-purple-700 border-purple-500/30 text-xs font-bold">
                        Graded ({submission.grade}/{assignment.maxMarks})
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30 text-xs font-bold">
                        Submitted
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-0">
                  <p className="text-xs text-foreground bg-muted/30 p-3 rounded-md leading-relaxed whitespace-pre-line">
                    {assignment.description}
                  </p>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t">
                    <div>
                      {assignment.attachmentUrl ? (
                        <a
                          href={assignment.attachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                        >
                          <Paperclip className="h-3.5 w-3.5" /> Reference Material / Problem Sheet <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">No reference attachment provided</span>
                      )}
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleOpenSubmissionModal(assignment as unknown as StudentAssignmentItem)}
                      className={`gap-1.5 text-xs font-bold ${
                        isSubmitted ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80' : 'bg-primary text-primary-foreground'
                      }`}
                    >
                      <Upload className="h-3.5 w-3.5" />
                      {isSubmitted ? 'View / Update Submission' : 'Submit Assignment'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* SUBMISSION MODAL DIALOG */}
      {selectedAssignment && (
        <Dialog open={Boolean(selectedAssignment)} onOpenChange={() => setSelectedAssignment(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <Upload className="h-5 w-5 text-primary" />
                Submit Assignment: {selectedAssignment.title}
              </DialogTitle>
              <DialogDescription className="text-xs">
                [{selectedAssignment.subject.code}] Due: {new Date(selectedAssignment.endDate).toLocaleString()}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmissionSubmit} className="space-y-4 pt-2">
              {/* Written Response Text */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                  Text Response / Notes (Optional)
                </label>
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Write text response, comments, or repository URL..."
                  rows={3}
                  className="w-full p-3 text-sm rounded-md border border-input bg-background focus:outline-hidden focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* File Attachment Upload */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                  Attach Solution File (PDF, DOC, ZIP - Cloudinary Upload)
                </label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full h-10 p-1.5 rounded-md border border-input bg-background text-xs"
                />
              </div>

              {selectedAssignment.submissions?.[0]?.fileUrl && (
                <div className="text-xs text-muted-foreground bg-muted/40 p-2 rounded-md">
                  Current Submission File:{' '}
                  <a
                    href={selectedAssignment.submissions[0].fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-primary hover:underline inline-flex items-center gap-1"
                  >
                    View File <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}

              {new Date() > new Date(selectedAssignment.endDate) && (
                <div className="p-2.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  Note: Deadline has passed. Submission will be flagged as LATE.
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedAssignment(null)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="gap-2 font-bold bg-primary text-primary-foreground"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Submit Work
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
