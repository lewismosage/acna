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

// Update these functions to match how you're calling them in VerificationPage
export const verifyEmail = async (data: { email: string; code: string }) => {
  try {
    const response = await api.post('/users/verify-email/', data);
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