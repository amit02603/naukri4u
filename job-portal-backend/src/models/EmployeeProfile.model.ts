import mongoose, { Schema } from 'mongoose';
import { IEmployeeProfile } from '../interfaces/profile.interface';

/**
 * EmployeeProfiles collection schema.
 *
 * Stores profile data for users with role=employee.
 * One-to-one relationship with User via userId.
 */
const employeeProfileSchema = new Schema<IEmployeeProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    skills: {
      type: String,
      default: '',
      trim: true,
    },
    experience: {
      type: String,
      default: '',
      trim: true,
    },
    resumeUrl: {
      type: String,
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
        return ret;
      },
    },
  },
);

export const EmployeeProfile = mongoose.model<IEmployeeProfile>('EmployeeProfile', employeeProfileSchema);
