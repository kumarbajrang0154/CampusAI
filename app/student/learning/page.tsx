'use client';

import * as React from 'react';
import {
  BookOpen,
  FileText,
  FileCode,
  Video,
  ExternalLink,
  Send,
  MessageSquare,
  Filter,
  Clock,
  Loader2,
  RefreshCw,
  HelpCircle,
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
  getStudentLearningDataAction,
  requestNotesAction,
} from '@/features/lms/actions/learning.actions';
import type { ResourceType } from '@prisma/client';

export default function StudentLearningPage() {
  const [data, setData] = React.useState<Awaited<ReturnType<typeof getStudentLearningDataAction>> | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [typeFilter, setTypeFilter] = React.useState<string>('ALL');

  // Request Modal State
  const [requestSubject, setRequestSubject] = React.useState<{ id: string; name: string; code: string } | null>(null);
  const [requestMessage, setRequestMessage] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const fetchData = React.useCallback(async (type?: string) => {
    setIsLoading(true);
    try {
      const typeParam = type && type !== 'ALL' ? (type as ResourceType) : undefined;
      const res = await getStudentLearningDataAction(undefined, typeParam);
      setData(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load learning resources';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData(typeFilter);
  }, [fetchData, typeFilter]);

  const handleOpenRequestModal = (subject: { id: string; name: string; code: string }) => {
    setRequestSubject(subject);
    setRequestMessage(`Please upload lecture notes and study material for ${subject.name} (${subject.code}).`);
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestSubject) return;

    if (!requestMessage.trim()) {
      toast.error('Please enter a message for the request');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await requestNotesAction({
        subjectId: requestSubject.id,
        message: requestMessage,
      });

      if (res.success) {
        toast.success('Notes request submitted! The faculty member has received an in-app notification.');
        setRequestSubject(null);
        fetchData(typeFilter);
      } else {
        toast.error(res.error || 'Failed to send request');
      }
    } catch {
      toast.error('Error submitting notes request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeIcon = (type: ResourceType) => {
    switch (type) {
      case 'PDF':
        return <FileText className="h-4 w-4 text-rose-500" />;
      case 'DOC':
      case 'DOCUMENT':
        return <FileCode className="h-4 w-4 text-blue-500" />;
      case 'PPT':
        return <BookOpen className="h-4 w-4 text-amber-500" />;
      case 'YOUTUBE_LINK':
      case 'VIDEO':
      case 'LINK':
        return <Video className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-primary" />
            Learning & Notes Hub
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Access lecture notes, presentation slides, reference PDFs, and video lectures for your enrolled subjects.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchData(typeFilter)}
          disabled={isLoading}
          className="gap-2 text-xs font-medium self-start md:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1 shrink-0">
          <Filter className="h-3.5 w-3.5" /> Type Filter:
        </span>
        {[
          { key: 'ALL', label: 'All Resources' },
          { key: 'PDF', label: 'PDF Documents' },
          { key: 'DOC', label: 'Word / DOC' },
          { key: 'PPT', label: 'PPT Slides' },
          { key: 'YOUTUBE_LINK', label: 'YouTube Lectures' },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setTypeFilter(item.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all shrink-0 ${
              typeFilter === item.key
                ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                : 'bg-background text-muted-foreground border-input hover:bg-muted'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Subject-Grouped Resources Section */}
      <div className="space-y-6">
        {data?.enrolledSubjects && data.enrolledSubjects.length > 0 ? (
          data.enrolledSubjects.map((subj) => {
            const subjResources = data.resources?.filter((r) => r.subject.id === subj.id) || [];
            const hasPendingRequest = data.pendingRequests?.some(
              (r) => r.subjectId === subj.id && r.status === 'PENDING'
            );

            return (
              <Card key={subj.id} className="border-border/60 shadow-xs">
                <CardHeader className="flex flex-row items-start justify-between pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs font-bold">
                        {subj.code}
                      </Badge>
                      <CardTitle className="text-base font-bold text-foreground">
                        {subj.name}
                      </CardTitle>
                    </div>
                    {subj.faculty?.user?.name && (
                      <CardDescription className="text-xs mt-0.5">
                        Faculty Instructor: <span className="font-semibold text-foreground">{subj.faculty.user.name}</span>
                      </CardDescription>
                    )}
                  </div>

                  <Badge variant="secondary" className="text-xs font-semibold">
                    {subjResources.length} Materials
                  </Badge>
                </CardHeader>

                <CardContent>
                  {subjResources.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {subjResources.map((res) => (
                        <div
                          key={res.id}
                          className="p-3.5 rounded-lg border border-border/60 bg-card hover:bg-muted/30 transition-all flex flex-col justify-between space-y-3"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <Badge variant="outline" className="text-[10px] gap-1 font-bold">
                                {getTypeIcon(res.type)}
                                {res.type}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground">
                                {new Date(res.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <h4 className="font-bold text-sm text-foreground line-clamp-1">
                              {res.title}
                            </h4>
                            {res.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {res.description}
                              </p>
                            )}
                          </div>

                          <div className="pt-2 flex justify-end">
                            <a
                              href={res.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                            >
                              Open / View <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* EMPTY STATE FOR SUBJECT WITH ZERO RESOURCES */
                    <div className="p-6 rounded-lg border border-dashed text-center bg-muted/20 space-y-3">
                      <div className="space-y-1">
                        <HelpCircle className="h-8 w-8 text-muted-foreground mx-auto" />
                        <h4 className="font-bold text-sm text-foreground">No Notes Uploaded Yet</h4>
                        <p className="text-xs text-muted-foreground max-w-md mx-auto">
                          There are currently no uploaded learning resources or lecture slides for {subj.name}.
                        </p>
                      </div>

                      <div className="pt-1">
                        {hasPendingRequest ? (
                          <Badge variant="outline" className="bg-amber-500/15 text-amber-700 border-amber-500/30 gap-1 text-xs">
                            <Clock className="h-3.5 w-3.5" /> Request Sent to Faculty (Pending)
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleOpenRequestModal({ id: subj.id, name: subj.name, code: subj.code })}
                            className="gap-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white"
                          >
                            <MessageSquare className="h-3.5 w-3.5" /> Request Notes from Faculty
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="p-8 text-center text-muted-foreground text-sm">
            No enrolled subjects found.
          </Card>
        )}
      </div>

      {/* REQUEST NOTES MODAL */}
      {requestSubject && (
        <Dialog open={Boolean(requestSubject)} onOpenChange={() => setRequestSubject(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                <MessageSquare className="h-5 w-5 text-amber-500" />
                Request Notes for {requestSubject.code}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Send a request to the faculty instructor. An in-app notification will be delivered immediately.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleRequestSubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                  Request Message <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  rows={3}
                  required
                  className="w-full p-3 text-sm rounded-md border border-input bg-background focus:outline-hidden focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRequestSubject(null)}
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
                  Send Request
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
