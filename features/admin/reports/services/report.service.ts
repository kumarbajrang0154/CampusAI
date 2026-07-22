import { ReportRepository } from '../repositories/report.repository';
import { CustomReportFilterInput } from '../schemas/report.schema';

export class ReportService {
  private repository: ReportRepository;

  constructor() {
    this.repository = new ReportRepository();
  }

  async getExecutiveDashboardMetrics() {
    const [
      userDist,
      academicSummary,
      placementAnalytics,
      timetableCoverage,
      activityTrend,
    ] = await Promise.all([
      this.repository.getUserDistributionStats(),
      this.repository.getAcademicStructureSummary(),
      this.repository.getPlacementAnalytics(),
      this.repository.getTimetableCoverageStats(),
      this.repository.getSystemActivityTrend(14),
    ]);

    return {
      userDist,
      academicSummary,
      placementAnalytics,
      timetableCoverage,
      activityTrend,
    };
  }

  async generateCustomReportCSV(filters: CustomReportFilterInput) {
    const records = await this.repository.getCustomReportExportData(filters);

    if (!records || records.length === 0) {
      return {
        csvString: '',
        rowCount: 0,
        filename: `${filters.domain.toLowerCase()}_report_empty.csv`,
      };
    }

    const headers = Object.keys(records[0]);
    const csvRows = records.map((row: Record<string, any>) =>
      headers
        .map((field) => {
          const val = row[field];
          if (val === null || val === undefined) return '""';
          const stringVal = String(val).replace(/"/g, '""');
          return `"${stringVal}"`;
        })
        .join(',')
    );

    const csvString = [headers.join(','), ...csvRows].join('\n');
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `CampusAI_${filters.domain.toLowerCase()}_report_${dateStr}.csv`;

    return {
      csvString,
      rowCount: records.length,
      filename,
    };
  }
}
