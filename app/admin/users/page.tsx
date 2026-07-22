'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Users, 
  Trash2, 
  UserX, 
  UserCheck, 
  MoreHorizontal, 
  Loader2, 
  ShieldAlert,
  GraduationCap,
  Briefcase,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';
import { ColumnDef } from '@tanstack/react-table';
import { UserRole, UserStatus } from '@prisma/client';

import { DataTableLayout } from '@/components/layout/data-table-layout';
import { DataTable } from '@/components/shared/data-table';
import { EmptyState } from '@/components/shared/empty-state';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import { ConfirmationDialog } from '@/components/shared/confirmation-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { UserOverrideManager } from '@/features/admin/roles/components/user-override-manager';

import { AddUserDialog } from '@/features/admin/users/components/add-user-dialog';
import { 
  listUsersAction, 
  updateUserRoleAction, 
  toggleUserStatusAction, 
  deleteUserAction 
} from '@/features/admin/users/actions/user.actions';

type UserData = {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
};

export default function UserManagementPage() {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Confirmation dialogs state
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [dialogType, setDialogType] = useState<'toggle' | 'delete' | 'override' | null>(null);

  // Fetch users
  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await listUsersAction({ limit: 1000 });
      if (response.success && response.data) {
        setUsers(response.data.users);
      } else {
        toast.error(response.message || 'Failed to load users.');
      }
    } catch {
      toast.error('An error occurred while loading users.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Handle status toggle
  const handleToggleStatus = async () => {
    if (!selectedUser) return;
    if (selectedUser.id === currentUserId) {
      toast.error('You cannot deactivate your own account.');
      setDialogType(null);
      setSelectedUser(null);
      return;
    }
    try {
      const response = await toggleUserStatusAction(selectedUser.id);
      if (response.success) {
        toast.success(response.message);
        loadUsers();
      } else {
        toast.error(response.message);
      }
    } catch {
      toast.error('Failed to change user status.');
    } finally {
      setDialogType(null);
      setSelectedUser(null);
    }
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    if (selectedUser.id === currentUserId) {
      toast.error('You cannot delete your own account.');
      setDialogType(null);
      setSelectedUser(null);
      return;
    }
    try {
      const response = await deleteUserAction(selectedUser.id);
      if (response.success) {
        toast.success(response.message);
        loadUsers();
      } else {
        toast.error(response.message);
      }
    } catch {
      toast.error('Failed to delete user.');
    } finally {
      setDialogType(null);
      setSelectedUser(null);
    }
  };

  // Handle role change
  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (userId === currentUserId) {
      toast.error('You cannot modify your own role.');
      return;
    }
    try {
      const response = await updateUserRoleAction(userId, newRole);
      if (response.success) {
        toast.success(response.message);
        loadUsers();
      } else {
        toast.error(response.message);
      }
    } catch {
      toast.error('Failed to update user role.');
    }
  };

  // Filtered users array
  const filteredUsers = users.filter((u) => {
    const nameStr = u.name || '';
    const matchesSearch =
      !search ||
      nameStr.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Table Columns Definition
  const columns: ColumnDef<UserData>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => {
        const user = row.original;
        const isSelf = user.id === currentUserId;
        const emailLocalPart = user.email.split('@')[0];
        const isPending = !user.name || user.name === emailLocalPart;

        return (
          <div className="flex flex-col">
            <span className="font-medium text-foreground flex items-center gap-1.5">
              {user.name || emailLocalPart}
              {isSelf && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-primary/20">
                  You
                </Badge>
              )}
            </span>
            {isPending && (
              <span className="text-[10px] text-amber-500 font-medium">
                Pending first sign-in
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'email',
      header: 'Email Address',
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.email}</span>,
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => {
        const role = row.original.role;
        switch (role) {
          case UserRole.ADMIN:
            return (
              <Badge variant="destructive" className="gap-1">
                <Shield className="h-3 w-3" />
                Admin
              </Badge>
            );
          case UserRole.HOD:
            return (
              <Badge variant="default" className="gap-1 bg-sky-600 text-white hover:bg-sky-700">
                <ShieldAlert className="h-3 w-3" />
                HOD
              </Badge>
            );
          case UserRole.FACULTY:
            return (
              <Badge variant="secondary" className="gap-1">
                <Briefcase className="h-3 w-3" />
                Faculty
              </Badge>
            );
          case UserRole.STUDENT:
            return (
              <Badge variant="outline" className="gap-1 border-muted-foreground/30 text-muted-foreground">
                <GraduationCap className="h-3 w-3" />
                Student
              </Badge>
            );
          default:
            return <Badge variant="outline">{role}</Badge>;
        }
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        if (status === UserStatus.ACTIVE) {
          return (
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-2.5 py-0.5 rounded-full">
              Active
            </Badge>
          );
        } else {
          return (
            <Badge variant="outline" className="bg-muted text-muted-foreground border-muted px-2.5 py-0.5 rounded-full">
              Inactive
            </Badge>
          );
        }
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created Date',
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt);
        return <span className="text-muted-foreground text-sm">{date.toLocaleDateString()}</span>;
      },
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const user = row.original;
        const isSelf = user.id === currentUserId;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-colors cursor-pointer outline-none">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              
              <DropdownMenuSub>
                <DropdownMenuSubTrigger disabled={isSelf}>Change Role</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => handleRoleChange(user.id, UserRole.STUDENT)} disabled={user.role === UserRole.STUDENT}>
                    Student
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleRoleChange(user.id, UserRole.FACULTY)} disabled={user.role === UserRole.FACULTY}>
                    Faculty
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleRoleChange(user.id, UserRole.HOD)} disabled={user.role === UserRole.HOD}>
                    HOD
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleRoleChange(user.id, UserRole.ADMIN)} disabled={user.role === UserRole.ADMIN}>
                    Admin
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuItem
                disabled={isSelf}
                onClick={() => {
                  if (isSelf) {
                    toast.error('You cannot deactivate your own account.');
                    return;
                  }
                  setSelectedUser(user);
                  setDialogType('toggle');
                }}
              >
                {user.status === UserStatus.ACTIVE ? (
                  <>
                    <UserX className="mr-2 h-4 w-4 text-amber-500" />
                    Deactivate Account
                  </>
                ) : (
                  <>
                    <UserCheck className="mr-2 h-4 w-4 text-emerald-500" />
                    Activate Account
                  </>
                )}
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  setSelectedUser(user);
                  setDialogType('override');
                }}
              >
                <Shield className="mr-2 h-4 w-4 text-primary" />
                Manage Overrides
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                variant="destructive"
                disabled={isSelf}
                onClick={() => {
                  if (isSelf) {
                    toast.error('You cannot delete your own account.');
                    return;
                  }
                  setSelectedUser(user);
                  setDialogType('delete');
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <DataTableLayout
      title="User Management"
      description="Pre-provision, manage, and audit CampusAI platform accounts."
      action={<AddUserDialog onSuccess={loadUsers} />}
    >
      <div className="space-y-4">
        {/* Search & Custom Filter Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:max-w-xs"
          />

          <div className="flex flex-wrap items-center gap-2">
            <Select value={roleFilter} onValueChange={(val) => setRoleFilter(val ?? 'ALL')}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Roles</SelectItem>
                <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                <SelectItem value={UserRole.HOD}>HOD</SelectItem>
                <SelectItem value={UserRole.FACULTY}>Faculty</SelectItem>
                <SelectItem value={UserRole.STUDENT}>Student</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val ?? 'ALL')}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value={UserStatus.ACTIVE}>Active</SelectItem>
                <SelectItem value={UserStatus.INACTIVE}>Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* User Table */}
        {isLoading ? (
          <div className="flex h-48 items-center justify-center rounded-md border border-dashed bg-card">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Loading users...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No Users Found"
            description={
              search || roleFilter !== 'ALL' || statusFilter !== 'ALL'
                ? "No pre-provisioned user accounts match your current filters."
                : "No pre-provisioned accounts are available. Click 'Add User' to register one."
            }
          />
        ) : (
          <DataTable columns={columns} data={filteredUsers} />
        )}
      </div>

      {/* Confirmation Dialog for Status Toggle */}
      {dialogType === 'toggle' && selectedUser && (
        <ConfirmationDialog
          isOpen={true}
          onOpenChange={(open) => { if (!open) setDialogType(null); }}
          title={selectedUser.status === UserStatus.ACTIVE ? 'Deactivate Account?' : 'Activate Account?'}
          description={
            selectedUser.status === UserStatus.ACTIVE
              ? `Are you sure you want to deactivate ${selectedUser.name || selectedUser.email}? This will immediately block their ability to sign in to the platform.`
              : `Are you sure you want to activate ${selectedUser.name || selectedUser.email}? They will be able to sign in via Google OAuth immediately.`
          }
          confirmLabel={selectedUser.status === UserStatus.ACTIVE ? 'Deactivate' : 'Activate'}
          onConfirm={handleToggleStatus}
          isDestructive={selectedUser.status === UserStatus.ACTIVE}
        />
      )}

      {/* Confirmation Dialog for Delete (Soft Delete) */}
      {dialogType === 'delete' && selectedUser && (
        <ConfirmationDialog
          isOpen={true}
          onOpenChange={(open) => { if (!open) setDialogType(null); }}
          title="Delete User Account?"
          description={`Are you sure you want to delete ${selectedUser.name || selectedUser.email}? This action soft-deletes the record, rendering it inaccessible but preserving logs. This cannot be undone.`}
          confirmLabel="Delete User"
          onConfirm={handleDeleteUser}
          isDestructive={true}
        />
      )}

      {/* Dialog for User Overrides */}
      {dialogType === 'override' && selectedUser && (
        <Dialog open={true} onOpenChange={(open) => { if (!open) setDialogType(null); }}>
          <DialogContent className="sm:max-w-[750px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Manage Permission Overrides</DialogTitle>
              <DialogDescription>
                Grant or revoke specific permission overrides for {selectedUser.name || selectedUser.email}.
              </DialogDescription>
            </DialogHeader>
            <UserOverrideManager initialUserId={selectedUser.id} />
          </DialogContent>
        </Dialog>
      )}
    </DataTableLayout>
  );
}
