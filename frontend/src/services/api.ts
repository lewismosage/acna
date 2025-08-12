// api.ts
import axios from 'axios';

// Create the axios instance first
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// --- Helper: Refresh admin token ---
const refreshAdminToken = async () => {
  try {
    const refreshToken = localStorage.getItem('admin_refresh');
    if (!refreshToken) throw new Error('No refresh token');

    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/users/admin/token/refresh/`,
      { refresh: refreshToken }
    );

    localStorage.setItem('admin_token', response.data.access);
    return response.data.access;
  } catch (error) {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_refresh');
    localStorage.removeItem('admin_data');
    localStorage.removeItem('is_admin');
    throw error;
  }
};

// --- Request interceptor ---
api.interceptors.request.use(
  async (config) => {
    // Skip auth handling for these endpoints
    const skipAuthEndpoints = [
      '/users/admin/login/',
      '/users/admin/token/refresh/'
    ];
    
    if (skipAuthEndpoints.some(endpoint => config.url?.includes(endpoint))) {
      return config; 
      
    }

    // Skip adding Authorization header for public endpoints
    if (
      config.url &&
      (
        config.url.includes('/users/register/') || 
        config.url.includes('/users/verify-email/') ||
        config.url.includes('/users/resend-verification/') ||
        config.url.includes('/users/members/') ||
        config.url.includes('/payments/membership-search/') ||
        config.url.includes('/payments/create-checkout-session/') ||
        config.url.includes('/payments/verify-payment/') ||
        config.url.includes('/payments/download-invoice/') ||
        config.url.includes('/newsletter/')
      )
    ) {
      return config;
    }

    // Regular user token handling
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// --- Response interceptor ---
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 on admin route, try refresh once
    if (
      error.response?.status === 401 &&
      originalRequest.url?.includes('/admin/') &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshAdminToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        window.location.href = '/admin/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// --- API functions ---

export const registerUser = async (userData: any) => {
  try {
    const response = await api.post('/users/register/', userData);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

export const verifyEmail = async (data: { email: string; code: string }) => {
  try {
    const response = await api.post('/users/verify-email/', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

export const resendVerification = async (data: { email: string }) => {
  try {
    const response = await api.post('/users/resend-verification/', data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

export const getSubscribers = async () => {
  try {
    const response = await api.get('/newsletter/subscribers/');
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

export const sendNewsletter = async (newsletterData: {
  subject: string;
  content: string;
  recipients: string;
}) => {
  try {
    const response = await api.post('/newsletter/send-newsletter/', newsletterData);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

// --- Admin-specific API functions ---
export const adminLogin = async (credentials: { email: string; password: string }) => {
  try {
    const response = await api.post('/users/admin/login/', credentials);
    if (response.data.admin_token) {
      localStorage.setItem('admin_token', response.data.admin_token);
    }
    if (response.data.admin_refresh) {
      localStorage.setItem('admin_refresh', response.data.admin_refresh);
    }
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

export const getAdminDashboardData = async () => {
  try {
    const response = await api.get('/users/admin/dashboard/');
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

export default api;
