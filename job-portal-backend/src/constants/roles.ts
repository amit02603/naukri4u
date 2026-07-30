/**
 * Application roles.
 */
export const ROLES = {
  ADMIN: 'admin',
  EMPLOYER: 'employer',
  EMPLOYEE: 'employee',
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

/**
 * All valid role values as an array (used for validation).
 */
export const ALL_ROLES: RoleName[] = Object.values(ROLES);
