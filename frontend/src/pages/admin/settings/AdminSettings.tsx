import { 
  Settings, Edit3, Plus, Database, Shield, Lock, X, Check, ChevronDown, ChevronUp, Trash2 
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { getAdminUsers, sendAdminInvite, removeAdminUser } from '../../../services/adminApi';

interface AdminUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  is_admin: boolean;
  is_active: boolean;
  date_joined: string;
  last_login: string | null;
}

const AdminSettings = () => {
  // State for admin data
  const [adminData, setAdminData] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State for invite modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');

  // State for remove admin modal
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [adminToRemove, setAdminToRemove] = useState<AdminUser | null>(null);
  const [removeLoading, setRemoveLoading] = useState(false);

  // Fetch admin users
  const fetchAdminUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getAdminUsers();
      if (response.success) {
        setAdminData(response.admins);
      } else {
        setError('Failed to fetch admin users');
      }
    } catch (err: any) {
      console.error('Error fetching admin users:', err);
      setError('Failed to fetch admin users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Send invite
  const sendInvite = async () => {
    if (!inviteEmail.trim()) {
      setInviteError('Please enter an email address');
      return;
    }

    try {
      setInviteLoading(true);
      setInviteError('');
      const response = await sendAdminInvite(inviteEmail.trim());
      if (response.success) {
        setShowInviteModal(false);
        setInviteEmail('');
        // Optionally refresh the admin list or show success message
      } else {
        setInviteError(response.message || 'Failed to send invitation');
      }
    } catch (err: any) {
      console.error('Error sending admin invite:', err);
      setInviteError(err.response?.data?.errors?.email?.[0] || err.response?.data?.message || 'Failed to send invitation. Please try again.');
    } finally {
      setInviteLoading(false);
    }
  };

  // Remove admin
  const removeAdmin = async () => {
    if (!adminToRemove) return;

    try {
      setRemoveLoading(true);
      const response = await removeAdminUser(adminToRemove.id);
      if (response.success) {
        // Remove from local state
        setAdminData(prev => prev.filter(admin => admin.id !== adminToRemove.id));
        setShowRemoveModal(false);
        setAdminToRemove(null);
      } else {
        setError(response.message || 'Failed to remove admin');
      }
    } catch (err: any) {
      console.error('Error removing admin:', err);
      setError(err.response?.data?.message || 'Failed to remove admin. Please try again.');
    } finally {
      setRemoveLoading(false);
    }
  };

  // Show remove confirmation
  const showRemoveConfirmation = (admin: AdminUser) => {
    setAdminToRemove(admin);
    setShowRemoveModal(true);
  };

  // Load admin users on component mount
  useEffect(() => {
    fetchAdminUsers();
  }, []);

  return (
    <div className="space-y-6">
      {/* Security Settings */}
      <div className="bg-white border border-gray-300 rounded-lg">
        <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
          <h2 className="font-semibold text-gray-800">Security & Access</h2>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Two-Factor Authentication</h3>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Enabled</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">Add an extra layer of security to admin accounts</p>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Manage 2FA
              </button>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Login Monitoring</h3>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Active</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">Monitor admin login attempts and IP addresses</p>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View Logs
              </button>
            </div>
          </div>
          
          {/* Admin Users Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Admin Users</h3>
              {loading && <div className="text-sm text-gray-500">Loading...</div>}
            </div>
            
            {error && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              {adminData.length === 0 && !loading ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No admin users found
                </div>
              ) : (
                adminData.map((admin) => (
                  <div key={admin.id} className="border border-gray-200 rounded">
                    <div className="flex items-center justify-between p-3">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{admin.full_name}</p>
                        <p className="text-xs text-gray-600">{admin.email}</p>
                        <p className="text-xs text-gray-500">
                          Joined: {new Date(admin.date_joined).toLocaleDateString()}
                          {admin.last_login && (
                            <span> • Last login: {new Date(admin.last_login).toLocaleDateString()}</span>
                          )}
                        </p>
                      </div>
                      <button 
                        className="p-1 rounded text-red-600 hover:text-red-800 hover:bg-red-50"
                        onClick={() => showRemoveConfirmation(admin)}
                        title="Remove admin"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <button 
              className="mt-3 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center disabled:opacity-50"
              onClick={() => setShowInviteModal(true)}
              disabled={loading}
            >
              <Plus className="w-4 h-4 inline mr-1" />
              Invite Admin User
            </button>
          </div>
        </div>
      </div>

      {/* Backup & Maintenance */}
      <div className="bg-white border border-gray-300 rounded-lg">
        <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
          <h2 className="font-semibold text-gray-800">Backup & Maintenance</h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center mb-2">
                <Database className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="font-medium">Database Backup</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">Last backup: August 12, 2025 - 02:00 AM</p>
              <div className="flex space-x-2">
                <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                  Backup Now
                </button>
                <button className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700">
                  Schedule
                </button>
              </div>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center mb-2">
                <Shield className="w-5 h-5 text-green-600 mr-2" />
                <h3 className="font-medium">System Status</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">All systems operational</p>
              <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Remove Admin Confirmation Modal */}
      {showRemoveModal && adminToRemove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Remove Admin User</h3>
              <button 
                onClick={() => setShowRemoveModal(false)} 
                className="text-gray-500 hover:text-gray-700"
                disabled={removeLoading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-6">
              <p className="text-gray-700">Are you sure you want to remove this admin user?</p>
              <div className="mt-3 p-3 bg-gray-50 rounded border">
                <p className="font-medium text-sm">{adminToRemove.full_name}</p>
                <p className="text-xs text-gray-600">{adminToRemove.email}</p>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRemoveModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                disabled={removeLoading}
              >
                Cancel
              </button>
              <button
                onClick={removeAdmin}
                className="px-4 py-2 bg-red-600 rounded-md text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 flex items-center"
                disabled={removeLoading}
              >
                {removeLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Removing...
                  </>
                ) : (
                  'Remove Admin'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Admin Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Invite Admin User</h3>
              <button 
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteEmail('');
                  setInviteError('');
                }} 
                className="text-gray-500 hover:text-gray-700"
                disabled={inviteLoading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {inviteError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                {inviteError}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Enter Invite Email</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => {
                    setInviteEmail(e.target.value);
                    if (inviteError) setInviteError('');
                  }}
                  placeholder="admin@example.com"
                  className="border border-gray-300 rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                  disabled={inviteLoading}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteEmail('');
                  setInviteError('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                disabled={inviteLoading}
              >
                Cancel
              </button>
              <button
                onClick={sendInvite}
                disabled={!inviteEmail.trim() || inviteLoading}
                className="px-4 py-2 bg-blue-600 rounded-md text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
              >
                {inviteLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  'Send Invite'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;