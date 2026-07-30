import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * Audit log entry interface.
 */
export interface IAuditLog extends Document {
  _id: Types.ObjectId;
  actor: Types.ObjectId | null;
  action: string;
  resource: string;
  resourceId: Types.ObjectId | string | null;
  details: Record<string, unknown>;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

/**
 * AuditLogs collection schema.
 *
 * Records every CUD (Create, Update, Delete) operation in the system
 * for compliance, security forensics, and debugging.
 *
 * Fields:
 * - actor: The user who performed the action (null for system actions)
 * - action: Namespaced action string (e.g., 'user.login', 'job.create')
 * - resource: The collection/entity affected (e.g., 'User', 'Job')
 * - resourceId: The ID of the specific document affected
 * - details: Arbitrary metadata about the action
 * - ipAddress/userAgent: Client information for forensics
 */
const auditLogSchema = new Schema<IAuditLog>(
  {
    actor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      index: true,
      trim: true,
    },
    resource: {
      type: String,
      required: [true, 'Resource is required'],
      index: true,
      trim: true,
    },
    resourceId: {
      type: Schema.Types.Mixed,
      default: null,
    },
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

// Compound indexes for common query patterns
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1, createdAt: -1 });
auditLogSchema.index({ actor: 1, createdAt: -1 });

// TTL index to auto-delete audit logs older than 365 days (optional, configurable)
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
