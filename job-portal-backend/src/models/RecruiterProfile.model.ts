import mongoose, { Schema } from 'mongoose';
import { IRecruiterProfile } from '../interfaces/profile.interface';

/**
 * RecruiterProfiles collection schema.
 *
 * Stores profile data for users with role=employer.
 * One-to-one relationship with User via userId.
 */
const recruiterProfileSchema = new Schema<IRecruiterProfile>(
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
    company: {
      type: String,
      required: [true, 'Company is required'],
      trim: true,
    },
    designation: {
      type: String,
      default: '',
      trim: true,
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

export const RecruiterProfile = mongoose.model<IRecruiterProfile>('RecruiterProfile', recruiterProfileSchema);
