'use client';

import * as React from 'react';
import {
  Users,
  Loader2,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  Video,
  Building,
  Plus,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ApplicationStatus, InterviewMode, OfferStatus } from '@prisma/client';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  listDriveApplicationsAction,
  updateApplicationStatusAction,
  scheduleInterviewAction,
  releaseOfferAction,
} from '../actions/placement.actions';

interface DriveApplicationsDialogProps {
  driveId: string | null;
  companyName: string | null;
  packageOffered: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChanged?: () => void;
}

export interface ApplicationItem {
  id: string;
  driveId: string;
  studentId: string;
  status: ApplicationStatus;
  appliedAt: Date;
  student: {
    id: string;
    cgpa?: number | null;
    user: {
      id: string;
      name: string | null;
      email: string;
    };
    department?: {
      id: string;
      name: string;
      code: string;
    } | null;
  };
  interview?: {
    id: string;
    scheduledAt: Date;
    mode: InterviewMode;
    result?: string | null;
  } | null;
  offer?: {
    id: string;
    packageOffered: number;
    status: OfferStatus;
  } | null;
}

const STATUS_BADGE_STYLES: Record<ApplicationStatus, string> = {
  APPLIED: 'bg-blue-50 text-blue-700 border-blue-200',
  SHORTLISTED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  INTERVIEW: 'bg-amber-50 text-amber-700 border-amber-200',
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
  SELECTED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export function DriveApplicationsDialog({
  driveId,
  companyName,
  packageOffered,
  open,
  onOpenChange,
  onStatusChanged,
}: DriveApplicationsDialogProps) {
  const [loading, setLoading] = React.useState(false);
  const [applications, setApplications] = React.useState<ApplicationItem[]>([]);

  // Sub-modals for Schedule Interview & Release Offer
  const [interviewModalApp, setInterviewModalApp] = React.useState<ApplicationItem | null>(null);
  const [scheduledAt, setScheduledAt] = React.useState<string>('');
  const [interviewMode, setInterviewMode] = React.useState<InterviewMode>('ONLINE');
  const [interviewNotes, setInterviewNotes] = React.useState<string>('');
  const [submittingInterview, setSubmittingInterview] = React.useState(false);

  const [offerModalApp, setOfferModalApp] = React.useState<ApplicationItem | null>(null);
  const [offerPackage, setOfferPackage] = React.useState<number>(packageOffered || 10);
  const [offerStatus, setOfferStatus] = React.useState<OfferStatus>('RELEASED');
  const [submittingOffer, setSubmittingOffer] = React.useState(false);

  const fetchApplications = React.useCallback(async () => {
    if (!driveId) return;
    setLoading(true);
    try {
      const res = await listDriveApplicationsAction(driveId);
      if (res.success && res.data) {
        setApplications(res.data as ApplicationItem[]);
      }
    } finally {
      setLoading(false);
    }
  }, [driveId]);

  React.useEffect(() => {
    if (open && driveId) {
      fetchApplications();
    }
  }, [open, driveId, fetchApplications]);

  const handleStatusChange = async (appId: string, newStatus: ApplicationStatus) => {
    try {
      const res = await updateApplicationStatusAction(appId, newStatus);
      if (res.success) {
        toast.success(res.message);
        fetchApplications();
        if (onStatusChanged) onStatusChanged();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update application status.');
    }
  };

  const handleOpenInterviewModal = (app: ApplicationItem) => {
    setInterviewModalApp(app);
    // Default to tomorrow 10:00 AM if not set
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    setScheduledAt(app.interview?.scheduledAt ? new Date(app.interview.scheduledAt).toISOString().slice(0, 16) : tomorrow.toISOString().slice(0, 16));
    setInterviewMode(app.interview?.mode || 'ONLINE');
    setInterviewNotes(app.interview?.result || '');
  };

  const handleScheduleInterviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interviewModalApp || !scheduledAt) {
      toast.error('Scheduled date and time is required.');
      return;
    }

    setSubmittingInterview(true);
    try {
      const res = await scheduleInterviewAction({
        applicationId: interviewModalApp.id,
        scheduledAt: new Date(scheduledAt),
        mode: interviewMode,
        result: interviewNotes.trim() || undefined,
      });

      if (res.success) {
        toast.success(res.message);
        setInterviewModalApp(null);
        fetchApplications();
        if (onStatusChanged) onStatusChanged();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to schedule interview.');
    } finally {
      setSubmittingInterview(false);
    }
  };

  const handleOpenOfferModal = (app: ApplicationItem) => {
    setOfferModalApp(app);
    setOfferPackage(app.offer?.packageOffered || packageOffered || 10);
    setOfferStatus(app.offer?.status || 'RELEASED');
  };

  const handleReleaseOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerModalApp || offerPackage <= 0) {
      toast.error('Valid package offered is required.');
      return;
    }

    setSubmittingOffer(true);
    try {
      const res = await releaseOfferAction({
        applicationId: offerModalApp.id,
        packageOffered: offerPackage,
        status: offerStatus,
      });

      if (res.success) {
        toast.success(res.message);
        setOfferModalApp(null);
        fetchApplications();
        if (onStatusChanged) onStatusChanged();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to release offer.');
    } finally {
      setSubmittingOffer(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> Placement Drive Applications
            </DialogTitle>
            <DialogDescription className="font-medium text-foreground">
              {companyName ? `${companyName} (${packageOffered} LPA Drive)` : 'Drive Applicants'}
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading drive applications...
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-3 pt-2">
              {/* Summary stats */}
              <div className="flex items-center justify-between text-xs bg-muted/40 p-2.5 rounded-lg border">
                <div>
                  <span className="font-semibold text-foreground">{applications.length}</span> Total Applicants
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-blue-600 font-medium">
                    {applications.filter((a) => a.status === 'APPLIED').length} Applied
                  </span>
                  <span className="text-indigo-600 font-medium">
                    {applications.filter((a) => a.status === 'SHORTLISTED').length} Shortlisted
                  </span>
                  <span className="text-amber-600 font-medium">
                    {applications.filter((a) => a.status === 'INTERVIEW').length} Interview
                  </span>
                  <span className="text-emerald-600 font-medium">
                    {applications.filter((a) => a.status === 'SELECTED').length} Selected
                  </span>
                </div>
              </div>

              {/* Applicant Rows */}
              <div className="border rounded-md divide-y">
                {applications.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground">
                    No student applications submitted for this placement drive yet.
                  </div>
                ) : (
                  applications.map((app) => (
                    <div
                      key={app.id}
                      className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/20 transition-colors text-xs"
                    >
                      {/* Left: Student Info */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-foreground">
                            {app.student.user.name || 'Unnamed Student'}
                          </span>
                          <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-mono">
                            {app.student.department?.code || 'Dept'}
                          </Badge>
                          <span className="text-muted-foreground text-[11px] font-medium">
                            CGPA: {app.student.cgpa !== null && app.student.cgpa !== undefined ? app.student.cgpa : 'N/A'}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-[11px]">{app.student.user.email}</p>
                        
                        {/* Interview Details if any */}
                        {app.interview && (
                          <div className="mt-1 inline-flex items-center gap-1.5 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                            <Video className="h-3 w-3" />
                            <span>
                              Interview: {format(new Date(app.interview.scheduledAt), 'MMM d, h:mm a')} ({app.interview.mode})
                            </span>
                          </div>
                        )}

                        {/* Offer Details if any */}
                        {app.offer && (
                          <div className="mt-1 inline-flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                            <Award className="h-3 w-3" />
                            <span>
                              Offer Released: {app.offer.packageOffered} LPA ({app.offer.status})
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Right: Status Pill & Pipeline Actions */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={`font-semibold ${STATUS_BADGE_STYLES[app.status]}`}>
                          {app.status}
                        </Badge>

                        {/* Pipeline Actions Menu */}
                        <div className="flex items-center gap-1">
                          {app.status === 'APPLIED' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusChange(app.id, 'SHORTLISTED')}
                              className="h-7 text-[11px] px-2 text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                            >
                              Shortlist
                            </Button>
                          )}

                          {(app.status === 'APPLIED' || app.status === 'SHORTLISTED' || app.status === 'INTERVIEW') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenInterviewModal(app)}
                              className="h-7 text-[11px] px-2 text-amber-700 border-amber-200 hover:bg-amber-50"
                            >
                              Schedule Interview
                            </Button>
                          )}

                          {(app.status === 'INTERVIEW' || app.status === 'SHORTLISTED' || app.status === 'SELECTED') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenOfferModal(app)}
                              className="h-7 text-[11px] px-2 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                            >
                              Release Offer
                            </Button>
                          )}

                          {app.status !== 'REJECTED' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusChange(app.id, 'REJECTED')}
                              className="h-7 text-[11px] px-2 text-rose-600 hover:bg-rose-50"
                            >
                              Reject
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Sub-modal: Schedule Interview */}
      {interviewModalApp && (
        <Dialog open={!!interviewModalApp} onOpenChange={(o) => !o && setInterviewModalApp(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-amber-700">
                <Video className="h-5 w-5" /> Schedule Interview
              </DialogTitle>
              <DialogDescription>
                Schedule an interview round for {interviewModalApp.student.user.name || 'Student'}.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleScheduleInterviewSubmit} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="interview-date">Interview Date & Time *</Label>
                <Input
                  id="interview-date"
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Interview Mode *</Label>
                <Select
                  value={interviewMode}
                  onValueChange={(val) => val && setInterviewMode(val as InterviewMode)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ONLINE">Online (Google Meet / Zoom)</SelectItem>
                    <SelectItem value="OFFLINE">Offline (Campus Premises)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="interview-notes">Notes / Instructions (Optional)</Label>
                <Textarea
                  id="interview-notes"
                  placeholder="e.g. Technical Round 1 - Bring updated resume copy"
                  rows={3}
                  value={interviewNotes}
                  onChange={(e) => setInterviewNotes(e.target.value)}
                />
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setInterviewModalApp(null)}
                  disabled={submittingInterview}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submittingInterview} className="bg-amber-600 hover:bg-amber-700">
                  {submittingInterview ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Scheduling...
                    </>
                  ) : (
                    'Confirm Schedule'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Sub-modal: Release Offer */}
      {offerModalApp && (
        <Dialog open={!!offerModalApp} onOpenChange={(o) => !o && setOfferModalApp(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-emerald-700">
                <Award className="h-5 w-5" /> Release Offer Letter
              </DialogTitle>
              <DialogDescription>
                Release a placement offer for {offerModalApp.student.user.name || 'Student'}.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleReleaseOfferSubmit} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="offer-package">Package Offered (LPA) *</Label>
                <Input
                  id="offer-package"
                  type="number"
                  step="0.1"
                  min="0"
                  value={offerPackage}
                  onChange={(e) => setOfferPackage(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Offer Status *</Label>
                <Select
                  value={offerStatus}
                  onValueChange={(val) => val && setOfferStatus(val as OfferStatus)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RELEASED">Released (Pending Acceptance)</SelectItem>
                    <SelectItem value="ACCEPTED">Accepted by Student</SelectItem>
                    <SelectItem value="DECLINED">Declined by Student</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOfferModalApp(null)}
                  disabled={submittingOffer}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submittingOffer} className="bg-emerald-600 hover:bg-emerald-700">
                  {submittingOffer ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Releasing...
                    </>
                  ) : (
                    'Release Offer'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
