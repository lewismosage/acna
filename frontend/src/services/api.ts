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

// Add request interceptor to include token
api.interceptors.request.use((config) => {
  // --- Admin route token handling ---
  const isAdminRoute = config.url?.includes('/admin/');
  if (isAdminRoute) {
    const adminToken = localStorage.getItem('admin_token');
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
    return config;
  }

  // Skip adding Authorization header for registration and other unauthenticated endpoints
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

  // Regular token handling
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

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
  recipients: string; // 'all' or specific group
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
