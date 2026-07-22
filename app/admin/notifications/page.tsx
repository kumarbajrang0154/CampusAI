'use client';

import * as React from 'react';
import { Plus, Bell, Send, Users, ShieldCheck, MailCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ComposeNotificationDialog } from '@/features/admin/notifications/components/compose-notification-dialog';
import { NotificationHistoryTable } from '@/features/admin/notifications/components/notification-history-table';

export default function AdminNotificationsPage() {
  const [composeOpen, setComposeOpen] = React.useState(false);
  const refreshRef = React.useRef<(() => void) | null>(null);

  const handleSuccess = () => {
    if (refreshRef.current) {
      refreshRef.current();
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" /> Notification Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Compose and broadcast in-app alerts and email notifications across CampusAI roles and departments.
          </p>
        </div>
        <Button onClick={() => setComposeOpen(true)} className="gap-2 self-start sm:self-auto shadow-sm">
          <Plus className="h-4 w-4" /> Compose Notification
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-none border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Channels Active
            </CardTitle>
            <Send className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">In-App + Email</div>
            <p className="text-xs text-muted-foreground mt-1">Resend Email & Portal Feed</p>
          </CardContent>
        </Card>

        <Card className="shadow-none border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Audience Targeting
            </CardTitle>
            <Users className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">4 Selector Modes</div>
            <p className="text-xs text-muted-foreground mt-1">Role, Dept, User, Broadcast</p>
          </CardContent>
        </Card>

        <Card className="shadow-none border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Security & RBAC
            </CardTitle>
            <ShieldCheck className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">Admin Only</div>
            <p className="text-xs text-muted-foreground mt-1">Key: notification.manage</p>
          </CardContent>
        </Card>

        <Card className="shadow-none border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Resend Delivery
            </CardTitle>
            <MailCheck className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">Isolated</div>
            <p className="text-xs text-muted-foreground mt-1">Safe DB & Email Dispatch</p>
          </CardContent>
        </Card>
      </div>

      {/* History Log Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Sent Notification History
          </h2>
        </div>
        
        <NotificationHistoryTable
          onRefreshTrigger={(fn) => {
            refreshRef.current = fn;
          }}
        />
      </div>

      {/* Compose Modal */}
      <ComposeNotificationDialog
        open={composeOpen}
        onOpenChange={setComposeOpen}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
