export interface User {
  id: string;
  firebaseUid: string;
  phoneNumber: string;
  role: 'admin' | 'employer' | 'employee' | null;
  status: 'active' | 'blocked' | 'deleted';
  isProfileCompleted: boolean;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

export interface LoginResponseData {
  user: User;
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
}

export interface RefreshResponseData {
  accessToken: string;
  refreshToken: string;
}
