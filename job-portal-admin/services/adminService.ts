import { api } from '../lib/axios';
import { ApiResponse } from '../types/api';

/**
 * Admin API Client.
 *
 * Provides methods for all admin-only endpoints:
 * dashboard stats, and paginated lists for all entities.
 */

// ─── Response Types ───────────────────────────────────────

export interface DashboardStats {
  stats: {
    totalUsers: number;
    totalRecruiters: number;
    totalJobs: number;
    totalApplications: number;
    totalEmployees: number;
  };
  userDistribution: Array<{ role: string; count: number }>;
  applicationTrend: Array<{ month: string; count: number }>;
  recentActivity: Array<{ message: string; time: string }>;
  recentJobs: Array<{
    id: string;
    title: string;
    company: string;
    status: string;
    createdAt: string;
  }>;
}

export interface AdminUser {
  id: string;
  firebaseUid: string;
  phoneNumber: string;
  role: string | null;
  status: string;
  isProfileCompleted: boolean;
  lastLogin: string;
  createdAt: string;
}

export interface RecruiterProfile {
  id: string;
  userId: string;
  name: string;
  company: string;
  designation: string;
  createdAt: string;
}

export interface EmployeeProfile {
  id: string;
  userId: string;
  name: string;
  phone: string;
  skills: string;
  experience: string;
  createdAt: string;
}

export interface AdminJob {
  id: string;
  title: string;
  company: string;
  location: string;
  status: string;
  createdAt: string;
}

export interface AdminApplication {
  id: string;
  applicant: { id: string; phoneNumber: string } | null;
  job: { id: string; title: string; company: string } | null;
  status: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// ─── Service Methods ───────────────────────────────────────

export const adminService = {
  /**
   * Fetches aggregated dashboard statistics.
   */
  getDashboardStats: async (): Promise<ApiResponse<DashboardStats>> => {
    const res = await api.get<ApiResponse<DashboardStats>>('/admin/dashboard');
    return res.data;
  },

  /**
   * Fetches paginated list of all users.
   */
  getUsers: async (page = 1, limit = 20): Promise<PaginatedResponse<AdminUser>> => {
    const res = await api.get<PaginatedResponse<AdminUser>>('/admin/users', {
      params: { page, limit },
    });
    return res.data;
  },

  /**
   * Fetches paginated list of recruiter profiles.
   */
  getRecruiters: async (page = 1, limit = 20): Promise<PaginatedResponse<RecruiterProfile>> => {
    const res = await api.get<PaginatedResponse<RecruiterProfile>>('/admin/recruiters', {
      params: { page, limit },
    });
    return res.data;
  },

  /**
   * Fetches paginated list of employee profiles.
   */
  getEmployees: async (page = 1, limit = 20): Promise<PaginatedResponse<EmployeeProfile>> => {
    const res = await api.get<PaginatedResponse<EmployeeProfile>>('/admin/employees', {
      params: { page, limit },
    });
    return res.data;
  },

  /**
   * Fetches paginated list of jobs.
   */
  getJobs: async (page = 1, limit = 20): Promise<PaginatedResponse<AdminJob>> => {
    const res = await api.get<PaginatedResponse<AdminJob>>('/admin/jobs', {
      params: { page, limit },
    });
    return res.data;
  },

  /**
   * Fetches paginated list of applications.
   */
  getApplications: async (page = 1, limit = 20): Promise<PaginatedResponse<AdminApplication>> => {
    const res = await api.get<PaginatedResponse<AdminApplication>>('/admin/applications', {
      params: { page, limit },
    });
    return res.data;
  },
};

export default adminService;
