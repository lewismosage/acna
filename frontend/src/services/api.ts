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
  // Skip adding Authorization header for registration and other unauthenticated endpoints
  if (config.url && (
    config.url.includes('/users/register/') || 
    config.url.includes('/users/verify-email/') ||
    config.url.includes('/users/resend-verification/') ||
    config.url.includes('/payments/membership-search/')
  )) {
    return config;
  }

  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Export API functions
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

export default api;