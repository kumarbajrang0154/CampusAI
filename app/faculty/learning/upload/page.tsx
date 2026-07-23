'use client';

import * as React from 'react';
import {
  BookOpen,
  Upload,
  FileText,
  FileCode,
  Video,
  Link as LinkIcon,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  PlusCircle,
  MessageSquare,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  getFacultyLearningDataAction,
  uploadLearningResourceAction,
  deleteLearningResourceAction,
  resolveNotesRequestAction,
} from '@/features/lms/actions/learning.actions';
import type { ResourceType, NotesRequestStatus } from '@prisma/client';

export default function FacultyLearningUploadPage() {
  const [data, setData] = React.useState<Awaited<ReturnType<typeof getFacultyLearningDataAction>> | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isUploading, setIsUploading] = React.useState(false);

  // Form states
  const [subjectId, setSubjectId] = React.useState('');
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [resourceType, setResourceType] = React.useState<ResourceType>('PDF');
  const [youtubeUrl, setYoutubeUrl] = React.useState('');
  const [file, setFile] = React.useState<File | null>(null);

  // Filter state for list
  const [subjectFilter, setSubjectFilter] = React.useState('');

  const fetchData = React.useCallback(async (filter?: string) => {
    setIsLoading(true);
    try {
      const res = await getFacultyLearningDataAction(filter);
      setData(res);
      if (!subjectId && res.subjects.length > 0) {
        setSubjectId(res.subjects[0].id);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load faculty learning data';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [subjectId]);

  React.useEffect(() => {
    fetchData(subjectFilter);
  }, [fetchData, subjectFilter]);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subjectId) {
      toast.error('Please select a subject');
      return;
    }
    if (!title.trim()) {
      toast.error('Please enter a resource title');
      return;
    }

    if (resourceType === 'YOUTUBE_LINK' && !youtubeUrl.trim()) {
      toast.error('Please enter a YouTube video URL');
      return;
    }

    if (resourceType !== 'YOUTUBE_LINK' && !file) {
      toast.error(`Please select a ${resourceType} file to upload`);
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('subjectId', subjectId);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('resourceType', resourceType);

      if (resourceType === 'YOUTUBE_LINK') {
        formData.append('youtubeUrl', youtubeUrl);
      } else if (file) {
        formData.append('file', file);
      }

      const res = await uploadLearningResourceAction(formData);

      if (res.success) {
        toast.success(`Resource "${title}" successfully uploaded!`);
        setTitle('');
        setDescription('');
        setYoutubeUrl('');
        setFile(null);
        fetchData(subjectFilter);
      } else {
        toast.error(res.error || 'Failed to upload resource');
      }
    } catch {
      toast.error('An unexpected error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (resourceId: string, resourceTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${resourceTitle}"?`)) return;

    try {
      const res = await deleteLearningResourceAction(resourceId);
      if (res.success) {
        toast.success('Resource deleted successfully');
        fetchData(subjectFilter);
      } else {
        toast.error(res.error || 'Failed to delete resource');
      }
    } catch {
      toast.error('Error deleting resource');
    }
  };

  const handleResolveRequest = async (requestId: string, status: NotesRequestStatus) => {
    try {
      const res = await resolveNotesRequestAction(requestId, status);
      if (res.success) {
        toast.success(`Notes request marked as ${status}!`);
        fetchData(subjectFilter);
      } else {
        toast.error(res.error || 'Failed to update request');
      }
    } catch {
      toast.error('Error resolving notes request');
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

  const pendingCount = data?.notesRequests?.filter((r) => r.status === 'PENDING').length || 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
              <Upload className="h-7 w-7 text-primary" />
              Faculty Learning & Notes Manager
            </h1>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Upload course lecture notes, slides, PDFs, and YouTube references to Cloudinary for student access.
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

      {/* Main Tabs */}
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
          <TabsTrigger value="upload" className="gap-2 text-xs font-bold">
            <PlusCircle className="h-4 w-4" /> Upload Material
          </TabsTrigger>
          <TabsTrigger value="manage" className="gap-2 text-xs font-bold">
            <BookOpen className="h-4 w-4" /> My Resources ({data?.resources?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="requests" className="gap-2 text-xs font-bold relative">
            <MessageSquare className="h-4 w-4" /> Student Requests
            {pendingCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[10px] font-extrabold bg-rose-600 text-white rounded-full">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: UPLOAD FORM */}
        <TabsContent value="upload" className="mt-6">
          <Card className="border-border/60 shadow-xs max-w-2xl">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Upload Course Notes / Learning Resource
              </CardTitle>
              <CardDescription className="text-xs">
                Select your assigned subject and upload PDF/DOC/PPT files or attach a YouTube lecture link.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUploadSubmit} className="space-y-4">
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
                    <option value="">-- Select Subject --</option>
                    {data?.subjects?.map((subj) => (
                      <option key={subj.id} value={subj.id}>
                        [{subj.code}] {subj.name} ({subj.course.department.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                    Resource Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Unit 3 Lecture Slides - Dynamic Programming"
                    required
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                    Description (Optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description or chapter reference..."
                    rows={2}
                    className="w-full p-3 rounded-md border border-input bg-background text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Resource Type Segmented Toggle */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                    Resource Type <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { type: 'PDF', label: 'PDF File', icon: FileText },
                      { type: 'DOC', label: 'DOC/Word', icon: FileCode },
                      { type: 'PPT', label: 'PPT Slides', icon: BookOpen },
                      { type: 'YOUTUBE_LINK', label: 'YouTube Video', icon: Video },
                    ].map((item) => (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => setResourceType(item.type as ResourceType)}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-bold transition-all gap-1 ${
                          resourceType === item.type
                            ? 'border-primary bg-primary/10 text-primary shadow-xs'
                            : 'border-input bg-background text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* File Upload Input vs YouTube URL */}
                {resourceType === 'YOUTUBE_LINK' ? (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                      YouTube URL <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        required
                        className="w-full h-10 px-3 pl-9 rounded-md border border-input bg-background text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-primary"
                      />
                      <LinkIcon className="h-4 w-4 absolute left-3 top-3 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                      Attach {resourceType} File <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="file"
                      accept={
                        resourceType === 'PDF'
                          ? '.pdf'
                          : resourceType === 'DOC'
                          ? '.doc,.docx'
                          : '.ppt,.pptx'
                      }
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      required
                      className="w-full h-10 p-1.5 rounded-md border border-input bg-background text-sm focus:outline-hidden"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      File will be uploaded to Cloudinary secure storage.
                    </p>
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <Button
                    type="submit"
                    disabled={isUploading}
                    className="gap-2 font-bold bg-primary text-primary-foreground"
                  >
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    Upload to Cloudinary
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: MY RESOURCES LIST */}
        <TabsContent value="manage" className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="max-w-xs w-full">
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs font-semibold focus:outline-hidden"
              >
                <option value="">All Taught Subjects</option>
                {data?.subjects?.map((subj) => (
                  <option key={subj.id} value={subj.id}>
                    [{subj.code}] {subj.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Card className="border-border/60 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Uploaded Learning Materials</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {!data?.resources || data.resources.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  No uploaded learning resources found for the selected subject.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left border-t border-border">
                    <thead className="bg-muted/50 text-xs uppercase text-muted-foreground font-semibold">
                      <tr>
                        <th className="px-4 py-3">Subject</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Resource Title</th>
                        <th className="px-4 py-3">Upload Date</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {data.resources.map((res) => (
                        <tr key={res.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-semibold text-xs font-mono">
                            {res.subject.code}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className="text-[10px] gap-1 font-bold">
                              {getTypeIcon(res.type)}
                              {res.type}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-bold text-foreground">{res.title}</div>
                            {res.description && (
                              <div className="text-xs text-muted-foreground truncate max-w-xs">
                                {res.description}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(res.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-right space-x-2">
                            <a
                              href={res.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                            >
                              Open <ExternalLink className="h-3 w-3" />
                            </a>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(res.id, res.title)}
                              className="h-8 w-8 p-0 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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

        {/* TAB 3: STUDENT REQUESTS INBOX */}
        <TabsContent value="requests" className="mt-6">
          <Card className="border-border/60 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Student Notes Requests ({data?.notesRequests?.length || 0})
              </CardTitle>
              <CardDescription className="text-xs">
                Inbound requests submitted by students for missing subject notes or reference materials.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {!data?.notesRequests || data.notesRequests.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  No notes requests from students at this time.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {data.notesRequests.map((req) => (
                    <div key={req.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs font-bold">
                            {req.subject.code}
                          </Badge>
                          <span className="font-bold text-sm text-foreground">
                            {req.student.user.name || 'Student'} ({req.student.enrollmentNo})
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${
                              req.status === 'PENDING'
                                ? 'bg-amber-500/15 text-amber-700 border-amber-500/30'
                                : req.status === 'FULFILLED'
                                ? 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-700 border-rose-500/30'
                            }`}
                          >
                            {req.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-foreground italic bg-muted/40 p-2 rounded-md">
                          &quot;{req.message}&quot;
                        </p>
                        <div className="text-[11px] text-muted-foreground">
                          Requested on {new Date(req.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      {req.status === 'PENDING' && (
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResolveRequest(req.id, 'DECLINED')}
                            className="text-xs text-rose-600 border-rose-500/30 hover:bg-rose-50"
                          >
                            <XCircle className="h-3.5 w-3.5 mr-1" /> Decline
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleResolveRequest(req.id, 'FULFILLED')}
                            className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Mark Fulfilled
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
