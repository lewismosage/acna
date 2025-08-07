import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// User API
export const registerUser = async (userData: any) => {
  try {
    const response = await api.post('/users/register/', userData);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

export const verifyEmail = async (email: string, code: string) => {
  try {
    const response = await api.post('/users/verify-email/', { email, code });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

export const resendVerification = async (email: string) => {
  try {
    const response = await api.post('/users/resend-verification/', { email });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};
