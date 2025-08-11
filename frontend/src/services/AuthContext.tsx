import React, { createContext, useContext, useState, ReactNode } from 'react';
import api from '../services/api'; 

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  user?: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  const [user, setUser] = useState<any>(() => {
    const u = localStorage.getItem('acna_user');
    return u ? JSON.parse(u) : null;
  });

  const login = async (email: string, password: string) => {
    try {
      const resp = await api.post('/users/login/', { email, password });
      const { access, refresh, user: userData } = resp.data;

      // Store tokens & user
      localStorage.setItem('token', access);
      localStorage.setItem('refresh', refresh);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('acna_user', JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);
    } catch (err: any) {
      // Normalize error to throw back to UI
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

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('acna_user');
    setIsAuthenticated(false);
    setUser(undefined);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user }}>
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
