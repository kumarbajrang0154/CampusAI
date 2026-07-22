import { AuditRepository } from '../repositories/audit.repository';
import { ActivityLogFilterInput, LoginHistoryFilterInput } from '../schemas/audit.schema';

export class AuditService {
  private repository: AuditRepository;

  constructor() {
    this.repository = new AuditRepository();
  }

  async listActivityLogs(filters: ActivityLogFilterInput) {
    return this.repository.listActivityLogs(filters);
  }

  async listLoginHistory(filters: LoginHistoryFilterInput) {
    return this.repository.listLoginHistory(filters);
  }

  async getFilterOptions() {
    const [actions, users] = await Promise.all([
      this.repository.getUniqueActionTypes(),
      this.repository.getActiveUsersForFilter(),
    ]);

    return {
      actions,
      users,
    };
  }
}
