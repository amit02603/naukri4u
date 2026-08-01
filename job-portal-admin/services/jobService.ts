import { api } from '../lib/axios';
import { ApiResponse, PaginationMeta } from '../types/api';

/**
 * Job Management API Client.
 */

export interface CreateJobData {
  title: string;
  company: string;
  location?: string;
  description?: string;
  salary?: string;
  status?: 'active' | 'pending' | 'closed';
}

export interface JobItem {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary: string;
  status: string;
  postedBy: string;
  createdAt: string;
}

export interface ListJobsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  company?: string;
}

export const jobService = {
  /**
   * Creates a new job posting.
   */
  createJob: async (data: CreateJobData): Promise<ApiResponse<JobItem>> => {
    const res = await api.post<ApiResponse<JobItem>>('/jobs', data);
    return res.data;
  },

  /**
   * Lists jobs with filters & pagination.
   */
  listJobs: async (params?: ListJobsParams): Promise<ApiResponse<JobItem[]> & { meta: PaginationMeta }> => {
    const res = await api.get<ApiResponse<JobItem[]> & { meta: PaginationMeta }>('/jobs', { params });
    return res.data;
  },

  /**
   * Fetches job details by ID.
   */
  getJobById: async (id: string): Promise<ApiResponse<JobItem>> => {
    const res = await api.get<ApiResponse<JobItem>>(`/jobs/${id}`);
    return res.data;
  },

  /**
   * Updates an existing job posting.
   */
  updateJob: async (id: string, data: Partial<CreateJobData>): Promise<ApiResponse<JobItem>> => {
    const res = await api.put<ApiResponse<JobItem>>(`/jobs/${id}`, data);
    return res.data;
  },

  /**
   * Soft-deletes a job posting.
   */
  deleteJob: async (id: string): Promise<ApiResponse<null>> => {
    const res = await api.delete<ApiResponse<null>>(`/jobs/${id}`);
    return res.data;
  },
};

export default jobService;
