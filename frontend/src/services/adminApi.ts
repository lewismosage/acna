// src/services/adminApi.ts
import axios, { AxiosError } from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Storage keys
const ADMIN_TOKEN = 'admin_token';
const ADMIN_REFRESH = 'admin_refresh';
const ADMIN_DATA = 'admin_data';
const IS_ADMIN = 'is_admin';

// --- LocalStorage Helpers ---
const setItem = (key: string, value: string) => localStorage.setItem(key, value);
const getItem = (key: string) => localStorage.getItem(key);
const removeItems = (...keys: string[]) => keys.forEach((key) => localStorage.removeItem(key));

const clearAdminStorage = () => {
  removeItems(ADMIN_TOKEN, ADMIN_REFRESH, ADMIN_DATA, IS_ADMIN);
};

// --- Axios instance ---
const adminApi = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// --- Token Refresh ---
const refreshAdminToken = async (): Promise<string> => {
  const refreshToken = getItem(ADMIN_REFRESH);
  if (!refreshToken) throw new Error('No refresh token');

  const { data } = await axios.post(`${BASE_URL}/users/admin/token/refresh/`, {
    refresh: refreshToken,
  });

  setItem(ADMIN_TOKEN, data.access);
  return data.access;
};

// --- Interceptors ---
adminApi.interceptors.request.use(
  (config) => {
    const token = getItem(ADMIN_TOKEN);
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

adminApi.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshAdminToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return adminApi(originalRequest);
      } catch (refreshError) {
        clearAdminStorage();
        if (!window.location.pathname.includes('/admin/login')) {
          window.location.href = '/admin/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// --- Auth Functions ---
export const adminLogin = async (credentials: { email: string; password: string }) => {
  try {
    const { data } = await adminApi.post('/users/admin/login/', credentials);

    if (data.access) setItem(ADMIN_TOKEN, data.access);
    if (data.refresh) setItem(ADMIN_REFRESH, data.refresh);
    if (data.admin) {
      setItem(ADMIN_DATA, JSON.stringify(data.admin));
      setItem(IS_ADMIN, 'true');
    }

    return data; // Return the full response data
  } catch (error: any) {
    clearAdminStorage();
    throw error.response?.data || error.message;
  }
};

export const adminSignUp = async (adminData: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}) => {
  try {
    const { data } = await adminApi.post('/users/admin/signup/', adminData);
    return data; // Return the full response data
  } catch (error: any) {
    // Don't clear storage on signup errors since user isn't logged in yet
    console.error('Admin signup error:', error);
    
    // Handle different error structures
    if (error.response) {
      // Axios error with response
      throw error;
    } else if (error.message) {
      // Custom error message
      throw error;
    } else {
      // Fallback error
      throw new Error('Admin registration failed. Please try again.');
    }
  }
};

export const adminLogout = async () => {
  try {
    await adminApi.post('/users/admin/logout/');
  } finally {
    clearAdminStorage();
  }
};

// --- Dashboard ---
export const getAdminDashboardData = async () => {
  const { data } = await adminApi.get('/users/admin/dashboard/');
  return data;
};

// --- User Management ---
export const getAllUsers = async (params?: {
  search?: string;
  status?: string;
  page?: number;
}) => {
  const { data } = await adminApi.get('/users/admin/users/', { params });
  return data;
};

export const updateUserStatus = async (userId: number, status: string) => {
  const { data } = await adminApi.patch(`/users/admin/users/${userId}/`, { status });
  return data;
};

// --- Content Management ---
export const createContent = async (contentType: string, formData: FormData) => {
  const { data } = await adminApi.post(`/content/admin/${contentType}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const updateContent = async (contentType: string, id: number, formData: FormData) => {
  const { data } = await adminApi.patch(`/content/admin/${contentType}/${id}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const deleteContent = async (contentType: string, id: number) => {
  await adminApi.delete(`/content/admin/${contentType}/${id}/`);
};

// --- Admin Password Reset ---
export const sendAdminPasswordReset = async (email: string) => {
  const { data } = await adminApi.post('/users/admin/forgot-password/', { email });
  return data;
};

export const resetAdminPassword = async (token: string, newPassword: string, confirmPassword: string) => {
  const { data } = await adminApi.post(`/users/reset-password/${token}/`, {
    new_password: newPassword,
    confirm_password: confirmPassword
  });
  return data;
};

// --- Admin Management ---
export const getAdminUsers = async () => {
  const { data } = await adminApi.get('/users/admin/users/');
  return data;
};

export const sendAdminInvite = async (email: string) => {
  const { data } = await adminApi.post('/users/admin/invite/', { email });
  return data;
};

export const getAdminInvites = async () => {
  const { data } = await adminApi.get('/users/admin/invites/');
  return data;
};

export const removeAdminUser = async (adminId: number) => {
  const { data } = await adminApi.delete(`/users/admin/users/${adminId}/remove/`);
  return data;
};

// --- Admin Signup with Invite ---
export const adminSignUpWithInvite = async (signUpData: {
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
  invite_token: string;
}) => {
  const { data } = await adminApi.post('/users/admin/signup/', signUpData);
  return data;
};

export default adminApi;