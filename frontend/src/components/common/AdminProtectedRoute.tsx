import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../services/AuthContext';

const AdminProtectedRoute = () => {
  const { isAdmin } = useAuth();

  return isAdmin ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

export default AdminProtectedRoute;