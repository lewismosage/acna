// src/services/api.ts
import axios, { AxiosError } from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Storage keys
const USER_TOKEN = 'token';
const USER_REFRESH = 'refresh';
const USER_DATA = 'acna_user';
const IS_AUTHENTICATED = 'isAuthenticated';

// --- LocalStorage Helpers ---
const setItem = (key: string, value: string) => localStorage.setItem(key, value);
const getItem = (key: string) => localStorage.getItem(key);
const removeItems = (...keys: string[]) => keys.forEach((key) => localStorage.removeItem(key));

const clearUserStorage = () => {
  removeItems(USER_TOKEN, USER_REFRESH, USER_DATA, IS_AUTHENTICATED);
};

// --- Axios instance ---
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// --- Token Refresh ---
const refreshToken = async (): Promise<string> => {
  const refreshToken = getItem(USER_REFRESH);
  if (!refreshToken) throw new Error('No refresh token');

  const { data } = await axios.post(`${BASE_URL}/users/token/refresh/`, {
    refresh: refreshToken,
  });

  setItem(USER_TOKEN, data.access);
  return data.access;
};

// --- Interceptors ---
api.interceptors.request.use(
  async (config) => {
    // Skip auth for these endpoints
    const skipAuthEndpoints = [
      '/users/login/',
      '/users/register/',
      '/users/verify-email/',
      '/users/resend-verification/',
      '/payments/membership-search/',
      '/payments/create-checkout-session/',
      '/payments/verify-payment/',
      '/payments/download-invoice/',
    ];

    if (skipAuthEndpoints.some(endpoint => config.url?.includes(endpoint))) {
      return config;
    }

    const token = getItem(USER_TOKEN);
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        clearUserStorage();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// --- User Authentication ---
export const registerUser = async (userData: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}) => {
  const { data } = await api.post('/users/register/', userData);
  return data;
};

export const verifyEmail = async (verificationData: { email: string; code: string }) => {
  const { data } = await api.post('/users/verify-email/', verificationData);
  if (data.token) setItem(USER_TOKEN, data.token);
  return data;
};

export const resendVerification = async (emailData: { email: string }) => {
  const { data } = await api.post('/users/resend-verification/', emailData);
  return data;
};

export const loginUser = async (credentials: { email: string; password: string }) => {
  const { data } = await api.post('/users/login/', credentials);
  
  if (data.access) setItem(USER_TOKEN, data.access);
  if (data.refresh) setItem(USER_REFRESH, data.refresh);
  if (data.user) {
    setItem(USER_DATA, JSON.stringify(data.user));
    setItem(IS_AUTHENTICATED, 'true');
  }

  return data.user;
};

export const logoutUser = async () => {
  try {
    const refreshToken = getItem(USER_REFRESH);
    if (refreshToken) {
      await api.post('/users/logout/', { refresh: refreshToken });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    clearUserStorage();
  }
};

// --- User Profile ---
export const getUserProfile = async () => {
  const { data } = await api.get('/users/profile/');
  return data;
};

export const updateUserProfile = async (profileData: FormData) => {
  const { data } = await api.patch('/users/profile/', profileData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const changePassword = async (passwordData: {
  current_password: string;
  new_password: string;
}) => {
  const { data } = await api.post('/users/change-password/', passwordData);
  return data;
};


// --- Newsletter Management ---
export const getSubscribers = async (params?: {
  status?: 'active' | 'inactive';
  search?: string;
  page?: number;
}) => {
  const { data } = await api.get('/newsletter/subscribers/', { params });
  return data;
};

export const sendNewsletter = async (newsletterData: {
  subject: string;
  content: string;
  recipients: 'all' | 'active' | string[];
}) => {
  const { data } = await api.post('/newsletter/send/', newsletterData);
  return data;
};

export const getNewsletterMessages = async (params?: {
  status?: 'sent' | 'draft' | 'scheduled';
  search?: string;
  page?: number;
}) => {
  const { data } = await api.get('/newsletter/messages/', { params });
  return data;
};

export const createNewsletterMessage = async (messageData: {
  subject: string;
  content: string;
  status?: 'draft' | 'scheduled';
  scheduled_at?: string;
}) => {
  const { data } = await api.post('/newsletter/messages/', messageData);
  return data;
};

export const updateNewsletterMessage = async (id: number, updateData: {
  subject?: string;
  content?: string;
  status?: 'draft' | 'scheduled' | 'sent';
  scheduled_at?: string | null;
}) => {
  const { data } = await api.patch(`/newsletter/messages/${id}/`, updateData);
  return data;
};

export const deleteNewsletterMessage = async (id: number) => {
  await api.delete(`/newsletter/messages/${id}/`);
};

// --- Message Management ---
export const getMessages = async (params?: {
  is_read?: boolean;
  responded?: boolean;
  search?: string;
  page?: number;
}) => {
  const { data } = await api.get('/messages/', { params });
  return data;
};

export const getMessageDetails = async (id: number) => {
  const { data } = await api.get(`/messages/${id}/`);
  return data;
};

export const updateMessageStatus = async (id: number, statusData: {
  is_read?: boolean;
  responded?: boolean;
}) => {
  const { data } = await api.patch(`/messages/${id}/`, statusData);
  return data;
};

export const updateMessage = async (id: number, messageData: {
  is_read?: boolean;
  responded?: boolean;
  response_notes?: string;
}) => {
  const { data } = await api.patch(`/messages/${id}/`, messageData);
  return data;
};

export const sendMessageResponse = async (messageId: number, responseData: {
  response: string;
  notes?: string;
}) => {
  const { data } = await api.post(`/messages/${messageId}/respond/`, responseData);
  return data;
};

export const deleteMessage = async (id: number) => {
  await api.delete(`/messages/${id}/`);
};

// --- Members ---
export const getMembers = async (params?: {
  search?: string;
  page?: number;
  membership_class?: string;
}) => {
  const { data } = await api.get('/users/members/', { params });
  return data;
};

export const getMemberDetails = async (id: number) => {
  const { data } = await api.get(`/users/members/${id}/`);
  return data;
};

// --- Payments ---
export const createPaymentSession = async (paymentData: {
  membership_type: string;
  amount: number;
  currency: string;
}) => {
  const { data } = await api.post('/payments/create-checkout-session/', paymentData);
  return data;
};

export const verifyPayment = async (sessionId: string) => {
  const { data } = await api.post('/payments/verify-payment/', { session_id: sessionId });
  return data;
};

export const downloadInvoice = async (paymentId: string) => {
  const response = await api.get(`/payments/download-invoice/${paymentId}/`, {
    responseType: 'blob',
  });
  return response.data;
};

// --- Newsletter ---
export const subscribeNewsletter = async (email: string) => {
  const { data } = await api.post('/newsletter/subscribe/', { email });
  return data;
};

export const sendContactMessage = async (messageData: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) => {
  const { data } = await api.post('/newsletter/contact/', messageData);
  return data;
};

// --- Content ---
export const getNews = async (params?: {
  status?: string;
  featured?: boolean;
  search?: string;
  page?: number;
}) => {
  const { data } = await api.get('/content/news/', { params });
  return data;
};

export const getNewsItem = async (slug: string) => {
  const { data } = await api.get(`/content/news/${slug}/`);
  return data;
};

export const getEvents = async (params?: {
  upcoming?: boolean;
  past?: boolean;
  search?: string;
  page?: number;
}) => {
  const { data } = await api.get('/content/events/', { params });
  return data;
};

export const getEventDetails = async (slug: string) => {
  const { data } = await api.get(`/content/events/${slug}/`);
  return data;
};

export const getResources = async (params?: {
  category?: string;
  type?: string;
  search?: string;
  page?: number;
}) => {
  const { data } = await api.get('/content/resources/', { params });
  return data;
};

export const getGalleryItems = async (params?: {
  category?: string;
  featured?: boolean;
  search?: string;
  page?: number;
}) => {
  const { data } = await api.get('/content/gallery/', { params });
  return data;
};

export const getSuccessStories = async (params?: {
  featured?: boolean;
  condition?: string;
  search?: string;
  page?: number;
}) => {
  const { data } = await api.get('/content/stories/', { params });
  return data;
};

// --- Password Reset ---
export const sendPasswordReset = async (email: string) => {
  const { data } = await api.post('/users/forgot-password/', { email });
  return data;
};

export const resetPassword = async (token: string, newPassword: string, confirmPassword: string) => {
  const { data } = await api.post(`/users/reset-password/${token}/`, {
    new_password: newPassword,
    confirm_password: confirmPassword
  });
  return data;
};

export default api;