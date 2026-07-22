'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { 
  User, 
  Search, 
  Loader2, 
  Check, 
  X, 
  RotateCcw, 
  Shield, 
  ShieldAlert, 
  GraduationCap, 
  Briefcase 
} from 'lucide-react';
import { toast } from 'sonner';
import { UserRole } from '@prisma/client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { listUsersAction } from '@/features/admin/users/actions/user.actions';
import { getUserPermissionsDetailAction, setUserOverrideAction } from '../actions/role.actions';

interface UserOverrideManagerProps {
  initialUserId?: string;
}

type UserOption = {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
};

export function UserOverrideManager({ initialUserId }: UserOverrideManagerProps) {
  const [users, setUsers] = useState<UserOption[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>(initialUserId || '');
  const [userDetail, setUserDetail] = useState<any>(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    async function loadUsers() {
      setIsLoadingUsers(true);
      try {
        const res = await listUsersAction({ limit: 200 });
        if (res.success && res.data) {
          const fetched = res.data.users;
          setUsers(fetched);
          if (!selectedUserId && fetched.length > 0) {
            setSelectedUserId(fetched[0].id);
          }
        }
      } catch {
        toast.error('Failed to load users list.');
      } finally {
        setIsLoadingUsers(false);
      }
    }
    loadUsers();
  }, []);

  const loadUserDetail = async (userId: string) => {
    if (!userId) return;
    setIsLoadingDetail(true);
    try {
      const res = await getUserPermissionsDetailAction(userId);
      if (res.success && res.data) {
        setUserDetail(res.data);
      } else {
        toast.error(res.message || 'Failed to fetch user permissions.');
      }
    } catch {
      toast.error('An error occurred fetching user permission detail.');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  useEffect(() => {
    if (selectedUserId) {
      loadUserDetail(selectedUserId);
    }
  }, [selectedUserId]);

  const handleSetOverride = async (permissionId: string, granted: boolean | null, permKey: string) => {
    if (!selectedUserId) return;

    if (userDetail?.user?.role === UserRole.ADMIN && granted === false && (permKey === 'role.manage' || permKey === 'user.manage')) {
      toast.error(`Safety Violation: Cannot revoke core permission "${permKey}" from an Admin account.`);
      return;
    }

    setPendingIds((prev) => new Set(prev).add(permissionId));

    try {
      const res = await setUserOverrideAction({
        userId: selectedUserId,
        permissionId,
        granted,
      });

      if (res.success) {
        toast.success(
          granted === true
            ? `Granted permission override: ${permKey}`
            : granted === false
            ? `Revoked permission override: ${permKey}`
            : `Reset permission override to role default: ${permKey}`
        );
        loadUserDetail(selectedUserId);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error('Failed to update user override.');
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(permissionId);
        return next;
      });
    }
  };

  const filteredUsers = users.filter((u) => {
    const term = userSearch.toLowerCase();
    return !term || (u.name || '').toLowerCase().includes(term) || u.email.toLowerCase().includes(term);
  });

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return <Badge variant="destructive" className="gap-1"><Shield className="h-3 w-3" /> Admin</Badge>;
      case UserRole.HOD:
        return <Badge variant="default" className="bg-sky-600 text-white gap-1"><ShieldAlert className="h-3 w-3" /> HOD</Badge>;
      case UserRole.FACULTY:
        return <Badge variant="secondary" className="gap-1"><Briefcase className="h-3 w-3" /> Faculty</Badge>;
      default:
        return <Badge variant="outline" className="gap-1"><GraduationCap className="h-3 w-3" /> Student</Badge>;
    }
  };

  // Group permissions by category
  const groupedCategories = React.useMemo(() => {
    if (!userDetail?.permissions) return [];
    const map = new Map<string, any[]>();
    for (const item of userDetail.permissions) {
      const g = item.permission.group || 'General';
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(item);
    }
    return Array.from(map.entries()).map(([group, items]) => ({ group, items }));
  }, [userDetail]);

  return (
    <div className="space-y-4">
      {/* Target User Selector Header */}
      <Card className="p-4 bg-card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 w-full sm:w-auto">
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">
              Select User to Manage Individual Permission Overrides
            </label>
            <div className="flex gap-2">
              <Select value={selectedUserId} onValueChange={(val) => val && setSelectedUserId(val)}>
                <SelectTrigger className="w-full sm:max-w-md">
                  <SelectValue placeholder="Select a user..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredUsers.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name || u.email.split('@')[0]} ({u.email}) — [{u.role}]
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {userDetail?.user && (
            <div className="flex items-center gap-3 bg-muted/40 p-2.5 rounded-lg border w-full sm:w-auto">
              <User className="h-5 w-5 text-primary" />
              <div>
                <div className="font-semibold text-sm flex items-center gap-2">
                  {userDetail.user.name || userDetail.user.email}
                  {getRoleBadge(userDetail.user.role)}
                </div>
                <div className="text-xs text-muted-foreground">{userDetail.user.email}</div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Permissions Detail & Override List */}
      {isLoadingDetail ? (
        <div className="flex h-48 items-center justify-center rounded-lg border border-dashed bg-card">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Loading user overrides...</span>
        </div>
      ) : !userDetail ? (
        <div className="p-8 text-center text-muted-foreground">
          Select a user to view and manage their permission overrides.
        </div>
      ) : (
        <Card className="p-4 overflow-x-auto">
          <table className="w-full border-collapse min-w-[700px] text-sm">
            <thead>
              <tr className="bg-muted/50 border-b">
                <th className="p-3 text-left font-semibold text-xs text-muted-foreground">Permission</th>
                <th className="p-3 text-center font-semibold text-xs text-muted-foreground">Role Default</th>
                <th className="p-3 text-center font-semibold text-xs text-muted-foreground">Effective Status</th>
                <th className="p-3 text-right font-semibold text-xs text-muted-foreground">Override Actions</th>
              </tr>
            </thead>
            <tbody>
              {groupedCategories.map(({ group, items }) => (
                <React.Fragment key={group}>
                  <tr className="bg-muted/30 border-y">
                    <td colSpan={4} className="p-2.5 px-3 font-bold text-xs uppercase tracking-wider text-primary">
                      {group}
                    </td>
                  </tr>

                  {items.map(({ permission, isRoleDefault, overrideStatus, isEffective }) => {
                    const isPending = pendingIds.has(permission.id);
                    const isLockedAdminCore = userDetail.user.role === UserRole.ADMIN && (permission.key === 'role.manage' || permission.key === 'user.manage');

                    return (
                      <tr key={permission.id} className="border-b hover:bg-muted/20 transition-colors">
                        <td className="p-3">
                          <div className="font-semibold text-xs text-foreground">{permission.description}</div>
                          <div className="text-[11px] font-mono text-muted-foreground mt-0.5">{permission.key}</div>
                        </td>

                        <td className="p-3 text-center align-middle">
                          {isRoleDefault ? (
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">
                              Granted by Role
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-muted text-muted-foreground text-[10px]">
                              Not in Role
                            </Badge>
                          )}
                        </td>

                        <td className="p-3 text-center align-middle">
                          {overrideStatus === true ? (
                            <Badge variant="default" className="bg-emerald-600 text-white gap-1 text-[10px]">
                              <Check className="h-3 w-3" />
                              Override: Granted
                            </Badge>
                          ) : overrideStatus === false ? (
                            <Badge variant="destructive" className="gap-1 text-[10px]">
                              <X className="h-3 w-3" />
                              Override: Revoked
                            </Badge>
                          ) : isEffective ? (
                            <Badge variant="secondary" className="text-[10px]">
                              Active (Role Default)
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground text-[10px]">
                              Inactive (Role Default)
                            </Badge>
                          )}
                        </td>

                        <td className="p-3 text-right align-middle">
                          <div className="flex items-center justify-end gap-1.5">
                            {isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            ) : isLockedAdminCore ? (
                              <span className="text-[11px] text-destructive font-medium">Locked for Admin</span>
                            ) : (
                              <>
                                <Button
                                  variant={overrideStatus === true ? 'default' : 'outline'}
                                  size="xs"
                                  onClick={() => handleSetOverride(permission.id, true, permission.key)}
                                >
                                  Grant
                                </Button>
                                <Button
                                  variant={overrideStatus === false ? 'destructive' : 'outline'}
                                  size="xs"
                                  onClick={() => handleSetOverride(permission.id, false, permission.key)}
                                >
                                  Revoke
                                </Button>
                                {overrideStatus !== null && (
                                  <Button
                                    variant="ghost"
                                    size="xs"
                                    onClick={() => handleSetOverride(permission.id, null, permission.key)}
                                    title="Reset to role default"
                                  >
                                    <RotateCcw className="h-3 w-3 mr-1" />
                                    Reset
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
