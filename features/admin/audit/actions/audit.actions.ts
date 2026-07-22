'use server';

import { requirePermission } from '@/lib/auth-guard';
import { AuditService } from '../services/audit.service';
import {
  activityLogFilterSchema,
  loginHistoryFilterSchema,
  ActivityLogFilterInput,
  LoginHistoryFilterInput,
} from '../schemas/audit.schema';

const auditService = new AuditService();

export async function getActivityLogsAction(filters: ActivityLogFilterInput) {
  try {
    await requirePermission('settings.manage');
    const validated = activityLogFilterSchema.parse(filters);
    const result = await auditService.listActivityLogs(validated);

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to fetch activity logs.',
    };
  }
}

export async function getLoginHistoryAction(filters: LoginHistoryFilterInput) {
  try {
    await requirePermission('settings.manage');
    const validated = loginHistoryFilterSchema.parse(filters);
    const result = await auditService.listLoginHistory(validated);

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to fetch login history.',
    };
  }
}

export async function getAuditFilterOptionsAction() {
  try {
    await requirePermission('settings.manage');
    const options = await auditService.getFilterOptions();

    return {
      success: true,
      data: options,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to fetch filter options.',
      data: { actions: [], users: [] },
    };
  }
}
