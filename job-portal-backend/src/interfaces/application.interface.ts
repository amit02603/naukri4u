import { Document, Types } from 'mongoose';
import { ISoftDeletable, ITimestamps } from './common.interface';

/**
 * Possible application statuses.
 */
export enum ApplicationStatus {
  APPLIED = 'applied',
  SHORTLISTED = 'shortlisted',
  REJECTED = 'rejected',
  HIRED = 'hired',
}

/**
 * Application document interface for the Applications collection.
 */
export interface IApplication extends Document, ISoftDeletable, ITimestamps {
  _id: Types.ObjectId;
  applicant: Types.ObjectId;
  job: Types.ObjectId;
  status: ApplicationStatus;
  resumeUrl: string | null;
}

/**
 * Fields allowed when creating a new application.
 */
export interface ICreateApplication {
  applicant: Types.ObjectId | string;
  job: Types.ObjectId | string;
  status?: ApplicationStatus;
  resumeUrl?: string;
}
