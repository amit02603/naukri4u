import { api } from '../lib/axios';
import { ApiResponse, PaginationMeta } from '../types/api';

/**
 * Application Workflow API Client.
 */

export interface ApplicationItem {
  id: string;
  applicant: { id: string; phoneNumber: string } | string;
  job: { id: string; title: string; company: string } | string;
  status: 'applied' | 'shortlisted' | 'rejected' | 'hired';
  resumeUrl: string | null;
  createdAt: string;
}

export const applicationService = {
  /**
   * Submits a job application for candidate.
   */
  applyToJob: async (jobId: string, resumeUrl?: string): Promise<ApiResponse<ApplicationItem>> => {
    const res = await api.post<ApiResponse<ApplicationItem>>('/applications', { jobId, resumeUrl });
    return res.data;
  },

  /**
   * Fetches applications submitted by logged-in candidate.
   */
  getMyApplications: async (page = 1, limit = 20): Promise<ApiResponse<ApplicationItem[]> & { meta: PaginationMeta }> => {
    const res = await api.get<ApiResponse<ApplicationItem[]> & { meta: PaginationMeta }>('/applications/my', {
      params: { page, limit },
    });
    return res.data;
  },

  /**
   * Fetches candidates who applied for a specific job.
   */
  getJobApplications: async (jobId: string, page = 1, limit = 20): Promise<ApiResponse<ApplicationItem[]> & { meta: PaginationMeta }> => {
    const res = await api.get<ApiResponse<ApplicationItem[]> & { meta: PaginationMeta }>(`/applications/jobs/${jobId}`, {
      params: { page, limit },
    });
    return res.data;
  },

  /**
   * Updates application status.
   */
  updateStatus: async (
    applicationId: string,
    status: 'applied' | 'shortlisted' | 'rejected' | 'hired',
  ): Promise<ApiResponse<ApplicationItem>> => {
    const res = await api.patch<ApiResponse<ApplicationItem>>(`/applications/${applicationId}/status`, { status });
    return res.data;
  },
};

export default applicationService;
