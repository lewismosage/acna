import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, 
});

api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', {
      url: error.config.url,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.config.headers
    });
    return Promise.reject(error);
  }
);

// User API
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
    // Ensure token is stored if returned
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
