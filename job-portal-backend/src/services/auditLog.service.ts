import { AuditLogRepository, IAuditLogInput } from '../repositories/auditLog.repository';

/**
 * Audit log service.
 *
 * Thin wrapper around the AuditLogRepository that provides
 * a clean interface for services to log CUD operations.
 *
 * All create, update, and delete actions in the system should
 * call this service to record an audit trail.
 */
export class AuditLogService {
  private auditLogRepository: AuditLogRepository;

  constructor() {
    this.auditLogRepository = new AuditLogRepository();
  }

  /**
   * Logs an audit event.
   *
   * @example
   * await auditLogService.log({
   *   actor: userId,
   *   action: 'job.create',
   *   resource: 'Job',
   *   resourceId: jobId,
   *   details: { title: 'Senior Engineer' },
   *   ipAddress: req.ip,
   *   userAgent: req.headers['user-agent'],
   * });
   */
  async log(input: IAuditLogInput): Promise<void> {
    await this.auditLogRepository.create(input);
  }

  /**
   * Queries audit logs with pagination and filtering.
   * Used by the admin dashboard.
   */
  async getLogs(options: {
    skip: number;
    limit: number;
    sort: Record<string, 1 | -1>;
    actor?: string;
    action?: string;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    return this.auditLogRepository.findMany(options);
  }
}
