import mongoose, { Schema } from 'mongoose';
import { IApplication, ApplicationStatus } from '../interfaces/application.interface';

/**
 * Applications collection schema.
 *
 * Stores job applications submitted by employees/candidates.
 * References both the Job and User (applicant) collections.
 * Soft-delete enabled.
 */
const applicationSchema = new Schema<IApplication>(
  {
    applicant: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Applicant is required'],
      index: true,
    },
    job: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job is required'],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: Object.values(ApplicationStatus),
        message: 'Status must be one of: applied, shortlisted, rejected, hired',
      },
      default: ApplicationStatus.APPLIED,
      index: true,
    },
    resumeUrl: {
      type: String,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc: unknown, ret: Record<string, unknown>) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.isDeleted;
        delete ret.deletedAt;
        return ret;
      },
    },
  },
);

applicationSchema.index({ applicant: 1, job: 1 }, { unique: true });
applicationSchema.index({ status: 1, createdAt: -1 });

export const Application = mongoose.model<IApplication>('Application', applicationSchema);
