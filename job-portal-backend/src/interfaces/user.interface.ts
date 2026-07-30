import { Document, Types } from 'mongoose';
import { ISoftDeletable, ITimestamps } from './common.interface';

/**
 * Possible user roles in the system.
 */
export enum UserRole {
  ADMIN = 'admin',
  EMPLOYER = 'employer',
  EMPLOYEE = 'employee',
}

/**
 * Possible user account statuses.
 */
export enum UserStatus {
  ACTIVE = 'active',
  BLOCKED = 'blocked',
  DELETED = 'deleted',
}

/**
 * Core user document interface for the Users collection.
 * Contains only authentication and account management data.
 * Profile data lives in separate EmployerProfile / EmployeeProfile collections.
 */
export interface IUser extends Document, ISoftDeletable, ITimestamps {
  _id: Types.ObjectId;
  firebaseUid: string;
  phoneNumber: string;
  role: UserRole | null;
  status: UserStatus;
  isProfileCompleted: boolean;
  lastLogin: Date;
}

/**
 * Fields allowed when creating a new user.
 */
export interface ICreateUser {
  firebaseUid: string;
  phoneNumber: string;
  role?: UserRole | null;
  status?: UserStatus;
}

/**
 * Fields allowed when updating a user.
 */
export interface IUpdateUser {
  role?: UserRole;
  status?: UserStatus;
  isProfileCompleted?: boolean;
  lastLogin?: Date;
}
