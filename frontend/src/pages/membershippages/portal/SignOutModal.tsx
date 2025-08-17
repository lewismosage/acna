import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../services/AuthContext';

export const SignOutModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    const wasAdmin = logout();
    onClose();
    navigate(wasAdmin ? '/admin/login' : '/login');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Sign Out</h2>
        <p className="mb-6">Are you sure you want to sign out of your account?</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Confirm Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};