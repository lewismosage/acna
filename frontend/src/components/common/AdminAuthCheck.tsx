// AdminAuthCheck.tsx
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../services/AuthContext';

const AdminAuthCheck = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const adminToken = localStorage.getItem('admin_token');
      const isAdminRoute = location.pathname.startsWith('/admin');

      if (isAdminRoute && !adminToken) {
        navigate('/admin/login', { replace: true });
      }

      if (location.pathname === '/admin/login' && adminToken) {
        navigate('/admin/dashboard', { replace: true });
      }
    };

    checkAuth();
  }, [isAdmin, navigate, location.pathname]);

  return null;
};

export default AdminAuthCheck;