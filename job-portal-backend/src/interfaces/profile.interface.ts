import { Document, Types } from 'mongoose';
import { ITimestamps } from './common.interface';

/**
 * Recruiter profile document interface.
 * One-to-one relationship with User (role=employer).
 */
export interface IRecruiterProfile extends Document, ITimestamps {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  company: string;
  designation: string;
}

/**
 * Employee profile document interface.
 * One-to-one relationship with User (role=employee).
 */
export interface IEmployeeProfile extends Document, ITimestamps {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  phone: string;
  skills: string;
  experience: string;
  resumeUrl: string | null;
}
