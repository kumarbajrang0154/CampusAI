'use server';

import { requirePermission } from '@/lib/auth-guard';
import { ReportService } from '../services/report.service';
import { customReportFilterSchema, CustomReportFilterInput } from '../schemas/report.schema';

const reportService = new ReportService();

export async function getExecutiveDashboardMetricsAction() {
  try {
    await requirePermission('report.view');
    const metrics = await reportService.getExecutiveDashboardMetrics();

    return {
      success: true,
      data: metrics,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to fetch report metrics.',
    };
  }
}

export async function generateCustomReportCSVAction(filters: CustomReportFilterInput) {
  try {
    await requirePermission('report.generate');
    const validated = customReportFilterSchema.parse(filters);
    const result = await reportService.generateCustomReportCSV(validated);

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to generate custom report.',
      data: { csvString: '', rowCount: 0, filename: 'report.csv' },
    };
  }
}
