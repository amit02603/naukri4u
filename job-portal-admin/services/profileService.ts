import { api } from '../lib/axios';
import { ApiResponse } from '../types/api';

/**
 * Profile & Role Selection API Client.
 */

export interface SelectRoleRequest {
  role: 'employer' | 'employee';
}

export interface EmployerProfileData {
  name: string;
  company: string;
  designation?: string;
}

export interface EmployeeProfileData {
  name: string;
  phone?: string;
  skills?: string;
  experience?: string;
  resumeUrl?: string;
}

export interface UserProfileResponse {
  user: {
    id: string;
    phoneNumber: string;
    role: string | null;
    isProfileCompleted: boolean;
  };
  profile: EmployerProfileData | EmployeeProfileData | null;
}

export const profileService = {
  /**
   * Sets role for logged-in user.
   */
  selectRole: async (role: 'employer' | 'employee'): Promise<ApiResponse> => {
    const res = await api.post<ApiResponse>('/users/role', { role });
    return res.data;
  },

  /**
   * Fetches profile for logged-in user.
   */
  getMyProfile: async (): Promise<ApiResponse<UserProfileResponse>> => {
    const res = await api.get<ApiResponse<UserProfileResponse>>('/profiles/me');
    return res.data;
  },

  /**
   * Updates employer profile.
   */
  updateEmployerProfile: async (data: EmployerProfileData): Promise<ApiResponse> => {
    const res = await api.put<ApiResponse>('/profiles/employer', data);
    return res.data;
  },

  /**
   * Updates employee profile.
   */
  updateEmployeeProfile: async (data: EmployeeProfileData): Promise<ApiResponse> => {
    const res = await api.put<ApiResponse>('/profiles/employee', data);
    return res.data;
  },
};

export default profileService;
