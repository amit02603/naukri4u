import mongoose, { Schema } from 'mongoose';
import { IUser, UserRole, UserStatus } from '../interfaces/user.interface';

/**
 * Users collection schema.
 *
 * Stores ONLY authentication and account management data.
 * Profile data (company info, resume, skills, etc.) lives in
 * separate EmployerProfile / EmployeeProfile collections.
 *
 * Soft-delete enabled: `isDeleted` flag + `deletedAt` timestamp.
 * Queries in the repository layer automatically exclude soft-deleted records.
 */
const userSchema = new Schema<IUser>(
  {
    firebaseUid: {
      type: String,
      required: [true, 'Firebase UID is required'],
      unique: true,
      index: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      index: true,
      trim: true,
    },
    role: {
      type: String,
      enum: {
        values: Object.values(UserRole),
        message: 'Role must be one of: admin, employer, employee',
      },
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: Object.values(UserStatus),
        message: 'Status must be one of: active, blocked, deleted',
      },
      default: UserStatus.ACTIVE,
    },
    isProfileCompleted: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
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
    toObject: {
      transform(_doc: unknown, ret: Record<string, unknown>) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Compound index for common query patterns
userSchema.index({ status: 1, role: 1 });
userSchema.index({ isDeleted: 1, status: 1 });

export const User = mongoose.model<IUser>('User', userSchema);
