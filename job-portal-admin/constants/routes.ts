/**
 * Frontend route paths.
 */
export const ROUTES = {
  // Public Auth Routes
  LOGIN: '/login',
  VERIFY: '/verify',

  // Protected Dashboard Routes
  DASHBOARD: '/',
  USERS: '/users',
  RECRUITERS: '/recruiters',
  EMPLOYEES: '/employees',
  JOBS: '/jobs',
  APPLICATIONS: '/applications',
} as const;

export type RoutePath = typeof ROUTES[keyof typeof ROUTES];
