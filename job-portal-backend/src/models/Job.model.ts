import mongoose, { Schema } from 'mongoose';
import { IJob, JobStatus } from '../interfaces/job.interface';

/**
 * Jobs collection schema.
 *
 * Stores job postings created by recruiters/employers.
 * Soft-delete enabled.
 */
const jobSchema = new Schema<IJob>(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    location: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    salary: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: Object.values(JobStatus),
        message: 'Status must be one of: active, pending, closed',
      },
      default: JobStatus.ACTIVE,
      index: true,
    },
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'PostedBy user is required'],
      index: true,
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

jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ postedBy: 1, status: 1 });

export const Job = mongoose.model<IJob>('Job', jobSchema);
