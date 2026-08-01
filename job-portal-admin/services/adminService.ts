import { api } from '../lib/axios';
import { ApiResponse } from '../types/api';

/**
 * Admin API Client.
 *
 * Provides methods for all admin-only endpoints:
 * dashboard stats, analytics, manual entries, edits, and paginated lists.
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

export interface ComprehensiveAnalytics {
  overview: {
    totalRegistrations: number;
    activeUsers: number;
    totalRecruiters: number;
    totalEmployees: number;
  };
  growth: {
    employeeTrend: Array<{ month: string; count: number }>;
    jobTrend: Array<{ month: string; count: number }>;
  };
  dailyActivity: Array<{ date: string; activeUsers: number; applications: number }>;
  monthlyActivity: Array<{ month: string; count: number }>;
  jobStats: Array<{ status: string; count: number }>;
  applicationStats: Array<{ status: string; count: number }>;
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
   * Fetches comprehensive analytics data.
   */
  getAnalytics: async (): Promise<ApiResponse<ComprehensiveAnalytics>> => {
    const res = await api.get<ApiResponse<ComprehensiveAnalytics>>('/admin/analytics');
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

  /**
   * Manually registers a new Employee.
   */
  createEmployee: async (data: { phoneNumber: string; name: string; skills?: string; experience?: string }): Promise<ApiResponse> => {
    const res = await api.post<ApiResponse>('/admin/employees', data);
    return res.data;
  },

  /**
   * Manually registers a new Recruiter.
   */
  createRecruiter: async (data: { phoneNumber: string; name: string; company: string; designation?: string }): Promise<ApiResponse> => {
    const res = await api.post<ApiResponse>('/admin/recruiters', data);
    return res.data;
  },

  /**
   * Updates an Employee profile.
   */
  updateEmployee: async (id: string, data: { name?: string; phone?: string; skills?: string; experience?: string }): Promise<ApiResponse> => {
    const res = await api.put<ApiResponse>(`/admin/employees/${id}`, data);
    return res.data;
  },

  /**
   * Updates a Recruiter profile.
   */
  updateRecruiter: async (id: string, data: { name?: string; company?: string; designation?: string }): Promise<ApiResponse> => {
    const res = await api.put<ApiResponse>(`/admin/recruiters/${id}`, data);
    return res.data;
  },

  /**
   * Updates user status (active / blocked / deleted).
   */
  updateUserStatus: async (userId: string, status: 'active' | 'blocked' | 'deleted'): Promise<ApiResponse> => {
    const res = await api.patch<ApiResponse>(`/admin/users/${userId}/status`, { status });
    return res.data;
  },

  /**
   * Soft-deletes a user.
   */
  deleteUser: async (userId: string): Promise<ApiResponse> => {
    const res = await api.delete<ApiResponse>(`/admin/users/${userId}`);
    return res.data;
  },
};

export default adminService;
