import { Types } from 'mongoose';
import { AuditLog, IAuditLog } from '../models/AuditLog.model';
import { auditLogger } from '../config/logger';

/**
 * Input for creating an audit log entry.
 */
export interface IAuditLogInput {
  actor: Types.ObjectId | string | null;
  action: string;
  resource: string;
  resourceId?: Types.ObjectId | string | null;
  details?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/**
 * Repository for the AuditLogs collection.
 *
 * Provides write operations for audit logging.
 * Read operations (for the admin dashboard) will be added
 * when the admin module is implemented.
 *
 * Also writes to the Winston audit logger for file-based audit trail.
 */
export class AuditLogRepository {
  /**
   * Creates an audit log entry in MongoDB AND writes to the audit log file.
   */
  async create(input: IAuditLogInput): Promise<IAuditLog> {
    // Write to MongoDB
    const auditLog = await AuditLog.create({
      actor: input.actor || null,
      action: input.action,
      resource: input.resource,
      resourceId: input.resourceId || null,
      details: input.details || {},
      ipAddress: input.ipAddress || null,
      userAgent: input.userAgent || null,
    });

    // Also write to the file-based audit log
    auditLogger.info('Audit event', {
      actor: input.actor?.toString() || 'system',
      action: input.action,
      resource: input.resource,
      resourceId: input.resourceId?.toString() || null,
      details: input.details,
      ipAddress: input.ipAddress,
      timestamp: new Date().toISOString(),
    });

    return auditLog;
  }

  /**
   * Finds audit logs with pagination and filtering.
   * Used by the admin dashboard to review system activity.
   */
  async findMany(options: {
    skip: number;
    limit: number;
    sort: Record<string, 1 | -1>;
    actor?: string;
    action?: string;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{ logs: IAuditLog[]; total: number }> {
    const filter: Record<string, unknown> = {};

    if (options.actor) {
      filter.actor = new Types.ObjectId(options.actor);
    }
    if (options.action) {
      filter.action = options.action;
    }
    if (options.resource) {
      filter.resource = options.resource;
    }
    if (options.startDate || options.endDate) {
      filter.createdAt = {};
      if (options.startDate) {
        (filter.createdAt as Record<string, unknown>).$gte = options.startDate;
      }
      if (options.endDate) {
        (filter.createdAt as Record<string, unknown>).$lte = options.endDate;
      }
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .sort(options.sort)
        .skip(options.skip)
        .limit(options.limit)
        .populate('actor', 'phoneNumber role')
        .exec(),
      AuditLog.countDocuments(filter).exec(),
    ]);

    return { logs, total };
  }
}
