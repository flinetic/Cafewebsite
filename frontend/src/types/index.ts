// Staff/User types
export interface Staff {
  id: string;
  _id?: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  phone?: string;
  role: 'admin' | 'chef' | 'staff';
  profileImage?: string;
  department?: string;
  employeeId?: string;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    staff: Staff;
    tokens: AuthTokens;
  };
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    staff: Staff;
    tokens: AuthTokens;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  role?: 'admin' | 'chef' | 'staff';
}
