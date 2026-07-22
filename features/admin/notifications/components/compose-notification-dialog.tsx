'use client';

import * as React from 'react';
import { NotificationType, UserRole } from '@prisma/client';
import { Send, Loader2, Search, X, Check, Users } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  sendNotificationAction,
  getNotificationComposeOptionsAction,
  searchUsersForNotificationAction,
} from '../actions/notification.actions';
import { AudienceType } from '../schemas/notification.schema';

interface ComposeNotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface UserOption {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
}

export function ComposeNotificationDialog({
  open,
  onOpenChange,
  onSuccess,
}: ComposeNotificationDialogProps) {
  const [loading, setLoading] = React.useState(false);
  const [fetchingOptions, setFetchingOptions] = React.useState(false);
  
  // Form State
  const [title, setTitle] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [type, setType] = React.useState<NotificationType>('GENERAL');
  const [audienceType, setAudienceType] = React.useState<AudienceType>('ALL');
  const [targetRole, setTargetRole] = React.useState<UserRole>('STUDENT');
  const [targetDepartmentId, setTargetDepartmentId] = React.useState<string>('');

  // Department options
  const [departments, setDepartments] = React.useState<Array<{ id: string; name: string; code: string }>>([]);

  // User search & selection
  const [userQuery, setUserQuery] = React.useState('');
  const [userSearchResults, setUserSearchResults] = React.useState<UserOption[]>([]);
  const [searchingUsers, setSearchingUsers] = React.useState(false);
  const [selectedUsers, setSelectedUsers] = React.useState<UserOption[]>([]);

  // Fetch departments when dialog opens
  React.useEffect(() => {
    if (open) {
      setFetchingOptions(true);
      getNotificationComposeOptionsAction()
        .then((res) => {
          if (res.success && res.data?.departments) {
            setDepartments(res.data.departments);
            if (res.data.departments.length > 0) {
              setTargetDepartmentId(res.data.departments[0].id);
            }
          }
        })
        .finally(() => setFetchingOptions(false));
    }
  }, [open]);

  // Handle User Search with debounce
  React.useEffect(() => {
    if (audienceType !== 'USERS' || !userQuery.trim()) {
      setUserSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      setSearchingUsers(true);
      searchUsersForNotificationAction(userQuery.trim())
        .then((res) => {
          if (res.success && res.data) {
            setUserSearchResults(res.data as UserOption[]);
          }
        })
        .finally(() => setSearchingUsers(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [userQuery, audienceType]);

  const handleSelectUser = (user: UserOption) => {
    if (!selectedUsers.some((u) => u.id === user.id)) {
      setSelectedUsers((prev) => [...prev, user]);
    }
    setUserQuery('');
    setUserSearchResults([]);
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !message.trim()) {
      toast.error('Please fill in both title and message.');
      return;
    }

    if (audienceType === 'USERS' && selectedUsers.length === 0) {
      toast.error('Please select at least one recipient user.');
      return;
    }

    setLoading(true);

    try {
      const res = await sendNotificationAction({
        title: title.trim(),
        message: message.trim(),
        type,
        audienceType,
        targetRole: audienceType === 'ROLE' ? targetRole : undefined,
        targetDepartmentId: audienceType === 'DEPARTMENT' ? targetDepartmentId : undefined,
        targetUserIds: audienceType === 'USERS' ? selectedUsers.map((u) => u.id) : undefined,
      });

      if (res.success) {
        toast.success(res.message);
        // Reset form
        setTitle('');
        setMessage('');
        setType('GENERAL');
        setAudienceType('ALL');
        setSelectedUsers([]);
        onOpenChange(false);
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred while sending notification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" /> Compose Notification
          </DialogTitle>
          <DialogDescription>
            Send an in-app alert and email notification to users across CampusAI.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="notif-title">Title *</Label>
            <Input
              id="notif-title"
              placeholder="e.g. End Semester Exam Schedule Announced"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Type & Audience Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category Type */}
            <div className="space-y-1.5">
              <Label>Notification Category</Label>
              <Select value={type} onValueChange={(val) => val && setType(val as NotificationType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GENERAL">General Alert</SelectItem>
                  <SelectItem value="ANNOUNCEMENT">Announcement</SelectItem>
                  <SelectItem value="ASSIGNMENT">Assignment</SelectItem>
                  <SelectItem value="QUIZ">Quiz</SelectItem>
                  <SelectItem value="PLACEMENT">Placement</SelectItem>
                  <SelectItem value="TIMETABLE">Timetable</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Audience Type */}
            <div className="space-y-1.5">
              <Label>Target Audience</Label>
              <Select
                value={audienceType}
                onValueChange={(val) => val && setAudienceType(val as AudienceType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Everyone (Broadcast)</SelectItem>
                  <SelectItem value="ROLE">By Specific Role</SelectItem>
                  <SelectItem value="DEPARTMENT">By Department</SelectItem>
                  <SelectItem value="USERS">Specific User(s)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dynamic Audience Sub-controls */}
          {audienceType === 'ROLE' && (
            <div className="space-y-1.5 p-3 rounded-lg border bg-muted/30">
              <Label>Select Role</Label>
              <Select
                value={targetRole}
                onValueChange={(val) => val && setTargetRole(val as UserRole)}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STUDENT">All Students</SelectItem>
                  <SelectItem value="FACULTY">All Faculty</SelectItem>
                  <SelectItem value="HOD">All HODs</SelectItem>
                  <SelectItem value="ADMIN">All Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {audienceType === 'DEPARTMENT' && (
            <div className="space-y-1.5 p-3 rounded-lg border bg-muted/30">
              <Label>Select Department</Label>
              {fetchingOptions ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading departments...
                </div>
              ) : (
                <Select
                  value={targetDepartmentId}
                  onValueChange={(val) => setTargetDepartmentId(val || '')}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {audienceType === 'USERS' && (
            <div className="space-y-2 p-3 rounded-lg border bg-muted/30">
              <Label>Select Specific Users</Label>
              
              {/* Selected Users Chips */}
              {selectedUsers.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2 max-h-24 overflow-y-auto p-1">
                  {selectedUsers.map((user) => (
                    <Badge
                      key={user.id}
                      variant="secondary"
                      className="flex items-center gap-1 text-xs py-1 px-2"
                    >
                      <span>{user.name || user.email}</span>
                      <span className="text-[10px] opacity-70">({user.role})</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveUser(user.id)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* User Search Input */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Type name or email to search users..."
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  className="pl-9 bg-background"
                />
                {searchingUsers && (
                  <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>

              {/* Search Results Dropdown */}
              {userSearchResults.length > 0 && (
                <div className="border rounded-md bg-background shadow-md max-h-40 overflow-y-auto divide-y text-xs">
                  {userSearchResults.map((u) => {
                    const isSelected = selectedUsers.some((sel) => sel.id === u.id);
                    return (
                      <div
                        key={u.id}
                        onClick={() => !isSelected && handleSelectUser(u)}
                        className={`p-2 flex items-center justify-between cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-muted opacity-60 cursor-not-allowed'
                            : 'hover:bg-muted/60'
                        }`}
                      >
                        <div>
                          <p className="font-medium text-foreground">{u.name || 'Unnamed'}</p>
                          <p className="text-muted-foreground text-[11px]">{u.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">
                            {u.role}
                          </Badge>
                          {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Message Body */}
          <div className="space-y-1.5">
            <Label htmlFor="notif-message">Message *</Label>
            <Textarea
              id="notif-message"
              placeholder="Enter the full notification message here..."
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" /> Send Notification
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
