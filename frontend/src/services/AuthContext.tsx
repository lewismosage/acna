import React, { createContext, useContext, useState, ReactNode } from 'react';
import api, { logoutUser } from '../services/api';
import { adminLogin as adminApiLogin, adminLogout as adminApiLogout } from './adminApi';

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
      if (err.response) {
        const status = err.response.status;
        const detail = err.response.data?.detail || 'Login failed';
        if (status === 401) throw new Error('invalid_credentials');
        if (status === 403) throw new Error('membership_inactive');
        throw new Error(detail);
      }
      throw new Error('Network error');
    }
  };

  const adminLogin = async (email: string, password: string) => {
    try {
      const response = await adminApiLogin({ email, password });
      
      // Check if we got the expected response structure
      if (!response || !response.access || !response.admin) {
        throw new Error('Invalid admin response');
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
      if (err.response) {
        const status = err.response.status;
        const detail = err.response.data?.detail || 'Admin login failed';
        if (status === 401) throw new Error('invalid_credentials');
        if (status === 403) throw new Error('admin_privileges_required');
        throw new Error(detail);
      }
      throw new Error(err.message || 'Network error');
    }
  };

  const logout = () => {
    const wasAdmin = isAdmin;
    
    if (wasAdmin) {
      adminApiLogout();
    } else {
      logoutUser();
    }
  
    // Clear all storage
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('acna_user');
    localStorage.removeItem('is_admin');
    localStorage.removeItem('admin_data');
  
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