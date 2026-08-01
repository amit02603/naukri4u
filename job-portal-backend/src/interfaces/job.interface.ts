import { Document, Types } from 'mongoose';
import { ISoftDeletable, ITimestamps } from './common.interface';

/**
 * Possible job posting statuses.
 */
export enum JobStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  CLOSED = 'closed',
}

/**
 * Job document interface for the Jobs collection.
 */
export interface IJob extends Document, ISoftDeletable, ITimestamps {
  _id: Types.ObjectId;
  title: string;
  company: string;
  location: string;
  description: string;
  salary: string;
  status: JobStatus;
  postedBy: Types.ObjectId;
}

/**
 * Fields allowed when creating a new job.
 */
export interface ICreateJob {
  title: string;
  company: string;
  location?: string;
  description?: string;
  salary?: string;
  status?: JobStatus;
  postedBy: Types.ObjectId | string;
}
