'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Shield, ShieldAlert, GraduationCap, Briefcase, Lock, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { UserRole } from '@prisma/client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { getRolePermissionMatrixAction, toggleRolePermissionAction } from '../actions/role.actions';

const ROLES: Array<{ role: UserRole; label: string; icon: any; badgeClass: string }> = [
  { role: UserRole.STUDENT, label: 'Student', icon: GraduationCap, badgeClass: 'border-muted-foreground/30 text-muted-foreground' },
  { role: UserRole.FACULTY, label: 'Faculty', icon: Briefcase, badgeClass: 'bg-secondary text-secondary-foreground' },
  { role: UserRole.HOD, label: 'HOD', icon: ShieldAlert, badgeClass: 'bg-sky-600 text-white' },
  { role: UserRole.ADMIN, label: 'Admin', icon: Shield, badgeClass: 'bg-destructive text-destructive-foreground' },
];

export function RoleMatrixTable() {
  const [categories, setCategories] = useState<any[]>([]);
  const [activeSet, setActiveSet] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [pendingToggles, setPendingToggles] = useState<Set<string>>(new Set());

  const loadMatrix = async () => {
    setIsLoading(true);
    try {
      const res = await getRolePermissionMatrixAction();
      if (res.success && res.data) {
        setCategories(res.data.categories);
        setActiveSet(new Set(res.data.activeSet));
      } else {
        toast.error(res.message || 'Failed to load permission matrix.');
      }
    } catch {
      toast.error('An error occurred loading permissions matrix.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMatrix();
  }, []);

  const handleToggle = async (role: UserRole, permissionId: string, currentEnabled: boolean, permKey: string) => {
    // Lock check for Admin + core security permissions
    if (role === UserRole.ADMIN && currentEnabled && (permKey === 'role.manage' || permKey === 'user.manage')) {
      toast.error(`Safety Violation: Core security permission "${permKey}" cannot be revoked from the Admin role.`);
      return;
    }

    const toggleKey = `${role}_${permissionId}`;
    setPendingToggles((prev) => new Set(prev).add(toggleKey));

    const newEnabled = !currentEnabled;

    // Optimistic UI update
    setActiveSet((prev) => {
      const next = new Set(prev);
      if (newEnabled) {
        next.add(toggleKey);
      } else {
        next.delete(toggleKey);
      }
      return next;
    });

    try {
      const res = await toggleRolePermissionAction({
        role,
        permissionId,
        enabled: newEnabled,
      });

      if (res.success) {
        toast.success(`Updated ${role} permission: ${permKey}`);
      } else {
        toast.error(res.message);
        // Rollback
        setActiveSet((prev) => {
          const next = new Set(prev);
          if (currentEnabled) {
            next.add(toggleKey);
          } else {
            next.delete(toggleKey);
          }
          return next;
        });
      }
    } catch {
      toast.error('Failed to update permission.');
      loadMatrix();
    } finally {
      setPendingToggles((prev) => {
        const next = new Set(prev);
        next.delete(toggleKey);
        return next;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed bg-card">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading permission matrix...</span>
      </div>
    );
  }

  return (
    <Card className="overflow-x-auto p-4">
      <table className="w-full border-collapse min-w-[800px] text-sm">
        <thead>
          <tr className="bg-muted/50 border-b">
            <th className="p-3 text-left font-semibold text-xs text-muted-foreground w-1/3">
              Permission & Scope
            </th>
            {ROLES.map(({ role, label, icon: Icon, badgeClass }) => (
              <th key={role} className="p-3 text-center font-semibold text-xs">
                <div className="flex flex-col items-center gap-1">
                  <Badge variant="outline" className={`gap-1 px-2.5 py-0.5 ${badgeClass}`}>
                    <Icon className="h-3 w-3" />
                    {label}
                  </Badge>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {categories.map(({ group, permissions }) => (
            <React.Fragment key={group}>
              {/* Category Section Header */}
              <tr className="bg-muted/30 border-y">
                <td colSpan={5} className="p-2.5 px-3 font-bold text-xs uppercase tracking-wider text-primary">
                  {group} ({permissions.length})
                </td>
              </tr>

              {permissions.map((perm: any) => (
                <tr key={perm.id} className="border-b hover:bg-muted/20 transition-colors">
                  <td className="p-3">
                    <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                      {perm.description}
                    </div>
                    <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
                      {perm.key}
                    </div>
                  </td>

                  {ROLES.map(({ role }) => {
                    const toggleKey = `${role}_${perm.id}`;
                    const isEnabled = activeSet.has(toggleKey);
                    const isPending = pendingToggles.has(toggleKey);
                    const isLockedAdminCore = role === UserRole.ADMIN && (perm.key === 'role.manage' || perm.key === 'user.manage');

                    return (
                      <td key={role} className="p-3 text-center align-middle">
                        <div className="flex items-center justify-center">
                          {isLockedAdminCore ? (
                            <div className="flex items-center gap-1 text-[11px] font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded-full border border-destructive/20" title="Core Security Permission — Locked for Admin">
                              <Lock className="h-3 w-3" />
                              Required
                            </div>
                          ) : isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          ) : (
                            <Checkbox
                              checked={isEnabled}
                              onCheckedChange={() => handleToggle(role, perm.id, isEnabled, perm.key)}
                              className="h-4 w-4"
                            />
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
