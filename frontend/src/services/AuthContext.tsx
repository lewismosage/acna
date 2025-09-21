import { createContext, useContext, useState, ReactNode } from 'react';
import api, { logoutUser } from '../services/api';
import { adminLogin as adminApiLogin, adminLogout as adminApiLogout } from './adminApi';

// Define custom error interface for API errors
interface ApiError extends Error {
  response?: {
    status: number;
    data: {
      detail?: string;
      message?: string;
    };
  };
  request?: any;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  admin: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    is_admin: boolean;
  } | null;
  login: (email: string, password: string) => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<any>;
  logout: () => boolean;
  user?: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to safely parse localStorage items
const safeParse = (key: string, defaultValue: any = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error parsing ${key} from localStorage`, error);
    return defaultValue;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('isAuthenticated') === 'true'
  );

  const [isAdmin, setIsAdmin] = useState(
    localStorage.getItem('is_admin') === 'true'
  );

  const [admin, setAdmin] = useState<{
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    is_admin: boolean;
  } | null>(safeParse('admin_data'));

  const [user, setUser] = useState<any>(safeParse('acna_user'));

  const login = async (email: string, password: string) => {
    try {
      const resp = await api.post('/users/login/', { email, password });
      const { access, refresh, user: userData } = resp.data;

      localStorage.setItem('token', access);
      localStorage.setItem('refresh', refresh);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('acna_user', JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);
    } catch (err: any) {
      console.error('Login error in AuthContext:', err);
      
      // If it's an Axios error with response, preserve the original error
      if (err.response) {
        // Re-throw the original error to preserve status codes and response data
        throw err;
      }
      
      // If it's a request error (network issue)
      if (err.request) {
        const networkError = new Error('Unable to connect to the server. Please check your internet connection.');
        networkError.name = 'NetworkError';
        throw networkError;
      }
      
      // For any other error, preserve the original message or provide a fallback
      throw new Error(err.message || 'An unexpected error occurred during login.');
    }
  };

  const adminLogin = async (email: string, password: string) => {
    try {
      const response = await adminApiLogin({ email, password });
      
      // Check if we got the expected response structure
      if (!response || !response.access || !response.admin) {
        throw new Error('Invalid admin response structure');
      }
  
      const adminData = {
        id: response.admin.id,
        email: response.admin.email,
        first_name: response.admin.first_name,
        last_name: response.admin.last_name,
        is_admin: true
      };
  
      localStorage.setItem('is_admin', 'true');
      localStorage.setItem('admin_data', JSON.stringify(adminData));
  
      setAdmin(adminData);
      setIsAdmin(true);
  
      return response;
    } catch (err: any) {
      console.error('Admin login error in AuthContext:', err);
      console.error('Error details:', {
        hasResponse: !!err.response,
        hasRequest: !!err.request,
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
      
      // Check if this is an error thrown by adminApiLogin (which might be a plain object)
      if ((err.detail || err.message) && !err.response) {
        // Create an ApiError with proper structure
        const apiError = new Error(err.message || err.detail) as ApiError;
        
        // Add response-like structure for consistent handling
        apiError.response = {
          status: err.status || 401,
          data: {
            detail: err.detail || err.message || 'Authentication failed'
          }
        };
        
        throw apiError;
      }
      
      // If it's an Axios error with response, preserve the original error
      if (err.response) {
        throw err;
      }
      
      // If it's a request error (network issue)
      if (err.request) {
        const networkError = new Error('Unable to connect to the server. Please check your internet connection.');
        (networkError as any).name = 'NetworkError';
        throw networkError;
      }
      
      // For any other error, provide a more specific fallback
      const fallbackError = new Error('Authentication failed. Please check your credentials and try again.') as ApiError;
      fallbackError.response = {
        status: 401,
        data: {
          detail: 'Authentication failed. Please check your credentials and try again.'
        }
      };
      throw fallbackError;
    }
  };

  const logout = () => {
    const wasAdmin = isAdmin;
    
    try {
      if (wasAdmin) {
        adminApiLogout();
      } else {
        logoutUser();
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with cleanup even if logout API call fails
    }
  
    // Clear all storage
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('acna_user');
    localStorage.removeItem('is_admin');
    localStorage.removeItem('admin_data');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_refresh');
  
    // Reset state
    setIsAuthenticated(false);
    setIsAdmin(false);
    setUser(null);
    setAdmin(null);
  
    return wasAdmin;
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isAdmin,
        admin,
        login,
        adminLogin,
        logout,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};