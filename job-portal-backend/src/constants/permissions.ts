import { ROLES, RoleName } from './roles';

/**
 * Granular permission identifiers.
 * Format: resource:action
 */
export const PERMISSIONS = {
  // User management
  USER_VIEW: 'user:view',
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_BLOCK: 'user:block',
  USER_LIST: 'user:list',

  // Employer profile management
  EMPLOYER_PROFILE_VIEW: 'employer_profile:view',
  EMPLOYER_PROFILE_CREATE: 'employer_profile:create',
  EMPLOYER_PROFILE_UPDATE: 'employer_profile:update',
  EMPLOYER_PROFILE_APPROVE: 'employer_profile:approve',

  // Employee profile management
  EMPLOYEE_PROFILE_VIEW: 'employee_profile:view',
  EMPLOYEE_PROFILE_CREATE: 'employee_profile:create',
  EMPLOYEE_PROFILE_UPDATE: 'employee_profile:update',

  // Job management
  JOB_VIEW: 'job:view',
  JOB_CREATE: 'job:create',
  JOB_UPDATE: 'job:update',
  JOB_DELETE: 'job:delete',
  JOB_PUBLISH: 'job:publish',
  JOB_APPROVE: 'job:approve',
  JOB_LIST: 'job:list',

  // Application management
  APPLICATION_VIEW: 'application:view',
  APPLICATION_CREATE: 'application:create',
  APPLICATION_UPDATE: 'application:update',
  APPLICATION_DELETE: 'application:delete',
  APPLICATION_SHORTLIST: 'application:shortlist',
  APPLICATION_REJECT: 'application:reject',
  APPLICATION_HIRE: 'application:hire',
  APPLICATION_LIST: 'application:list',

  // Saved jobs
  SAVED_JOB_VIEW: 'saved_job:view',
  SAVED_JOB_CREATE: 'saved_job:create',
  SAVED_JOB_DELETE: 'saved_job:delete',

  // Notifications
  NOTIFICATION_VIEW: 'notification:view',
  NOTIFICATION_MANAGE: 'notification:manage',

  // Admin-specific
  ADMIN_DASHBOARD: 'admin:dashboard',
  ADMIN_ANALYTICS: 'admin:analytics',
  ADMIN_AUDIT_LOG: 'admin:audit_log',
  ADMIN_APPROVE_RECRUITER: 'admin:approve_recruiter',
  ADMIN_SETTINGS: 'admin:settings',
} as const;

export type PermissionName = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/**
 * Permissions matrix — maps each role to the set of permissions it holds.
 * Admin has ALL permissions.
 * Employer and Employee have scoped permissions.
 */
export const ROLE_PERMISSIONS: Record<RoleName, PermissionName[]> = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS),

  [ROLES.EMPLOYER]: [
    // Profile
    PERMISSIONS.EMPLOYER_PROFILE_VIEW,
    PERMISSIONS.EMPLOYER_PROFILE_CREATE,
    PERMISSIONS.EMPLOYER_PROFILE_UPDATE,

    // Jobs — full lifecycle
    PERMISSIONS.JOB_VIEW,
    PERMISSIONS.JOB_CREATE,
    PERMISSIONS.JOB_UPDATE,
    PERMISSIONS.JOB_DELETE,
    PERMISSIONS.JOB_PUBLISH,
    PERMISSIONS.JOB_LIST,

    // Applicants — review and manage
    PERMISSIONS.APPLICATION_VIEW,
    PERMISSIONS.APPLICATION_LIST,
    PERMISSIONS.APPLICATION_SHORTLIST,
    PERMISSIONS.APPLICATION_REJECT,
    PERMISSIONS.APPLICATION_HIRE,

    // Notifications
    PERMISSIONS.NOTIFICATION_VIEW,

    // View employee profiles (for reviewing applicants)
    PERMISSIONS.EMPLOYEE_PROFILE_VIEW,
  ],

  [ROLES.EMPLOYEE]: [
    // Profile
    PERMISSIONS.EMPLOYEE_PROFILE_VIEW,
    PERMISSIONS.EMPLOYEE_PROFILE_CREATE,
    PERMISSIONS.EMPLOYEE_PROFILE_UPDATE,

    // Jobs — view and search
    PERMISSIONS.JOB_VIEW,
    PERMISSIONS.JOB_LIST,

    // Applications — apply, view own, withdraw
    PERMISSIONS.APPLICATION_VIEW,
    PERMISSIONS.APPLICATION_CREATE,
    PERMISSIONS.APPLICATION_DELETE,
    PERMISSIONS.APPLICATION_LIST,

    // Saved jobs
    PERMISSIONS.SAVED_JOB_VIEW,
    PERMISSIONS.SAVED_JOB_CREATE,
    PERMISSIONS.SAVED_JOB_DELETE,

    // Notifications
    PERMISSIONS.NOTIFICATION_VIEW,

    // View employer profiles (for job details)
    PERMISSIONS.EMPLOYER_PROFILE_VIEW,
  ],
};

/**
 * Gets the permissions array for a given role.
 * Returns an empty array for unknown roles (fail-safe).
 */
export function getPermissionsForRole(role: string): PermissionName[] {
  return ROLE_PERMISSIONS[role as RoleName] || [];
}
