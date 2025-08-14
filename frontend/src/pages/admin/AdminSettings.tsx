import { 
  Settings, Edit3, Plus, Database, Shield, Lock, X, Check, ChevronDown, ChevronUp 
} from 'lucide-react';
import { useState } from 'react';

const AdminSettings = () => {
  // State for editable admin cards
  const [editingAdmin, setEditingAdmin] = useState<number | null>(null);
  const [adminData, setAdminData] = useState([
    { name: 'John Doe', email: 'john@acna.org', role: 'Super Admin', status: 'Active' },
    { name: 'Jane Smith', email: 'jane@acna.org', role: 'Content Manager', status: 'Active' },
    { name: 'Mike Johnson', email: 'mike@acna.org', role: 'Moderator', status: 'Inactive' },
  ]);

  // State for add admin modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Moderator',
  });

  // Toggle edit mode for admin card
  const toggleEdit = (index: number) => {
    setEditingAdmin(editingAdmin === index ? null : index);
  };

  // Handle input changes for editing admin
  const handleAdminChange = (index: number, field: string, value: string) => {
    const updatedAdmins = [...adminData];
    updatedAdmins[index] = { ...updatedAdmins[index], [field]: value };
    setAdminData(updatedAdmins);
  };

  // Handle input changes for new admin
  const handleNewAdminChange = (field: string, value: string) => {
    setNewAdmin({ ...newAdmin, [field]: value });
  };

  // Save edited admin
  const saveAdmin = (index: number) => {
    // Here you would typically make an API call to save changes
    setEditingAdmin(null);
  };

  // Add new admin
  const addAdmin = () => {
    // Here you would typically make an API call to add the new admin
    setAdminData([
      ...adminData,
      {
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
        status: 'Active'
      }
    ]);
    setShowAddModal(false);
    setNewAdmin({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'Moderator',
    });
  };

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
          
          {/* Admin Users Section - Updated */}
          <div>
            <h3 className="font-medium mb-2">Admin Users</h3>
            <div className="space-y-2">
              {adminData.map((admin, index) => (
                <div key={index} className="border border-gray-200 rounded">
                  <div className="flex items-center justify-between p-3">
                    <div>
                      {editingAdmin === index ? (
                        <input
                          type="text"
                          value={admin.name}
                          onChange={(e) => handleAdminChange(index, 'name', e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1 mb-1 w-full"
                        />
                      ) : (
                        <p className="font-medium text-sm">{admin.name}</p>
                      )}
                      {editingAdmin === index ? (
                        <div className="space-y-1">
                          <input
                            type="email"
                            value={admin.email}
                            onChange={(e) => handleAdminChange(index, 'email', e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 w-full text-xs"
                          />
                          <select
                            value={admin.role}
                            onChange={(e) => handleAdminChange(index, 'role', e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 w-full text-xs"
                          >
                            <option value="Super Admin">Super Admin</option>
                            <option value="Content Manager">Content Manager</option>
                            <option value="Moderator">Moderator</option>
                          </select>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-600">{admin.email} • {admin.role}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        admin.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {admin.status}
                      </span>
                      <button 
                        className={`p-1 rounded ${editingAdmin === index ? 'bg-blue-100 text-blue-800' : 'text-blue-600 hover:text-blue-900'}`}
                        onClick={() => toggleEdit(index)}
                      >
                        {editingAdmin === index ? <Check className="w-4 h-4" onClick={() => saveAdmin(index)} /> : <Edit3 className="w-4 h-4" />}
                      </button>
                      {editingAdmin === index && (
                        <button 
                          className="p-1 rounded bg-red-100 text-red-800"
                          onClick={() => setEditingAdmin(null)}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Expanded edit section */}
                  {editingAdmin === index && (
                    <div className="p-3 border-t border-gray-200 bg-gray-50">
                      <h4 className="text-sm font-medium mb-2">Change Password</h4>
                      <div className="space-y-2">
                        <input
                          type="password"
                          placeholder="New Password"
                          className="border border-gray-300 rounded px-2 py-1 w-full text-xs"
                        />
                        <input
                          type="password"
                          placeholder="Confirm Password"
                          className="border border-gray-300 rounded px-2 py-1 w-full text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button 
              className="mt-3 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="w-4 h-4 inline mr-1" />
              Add Admin User
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

      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add New Admin</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newAdmin.name}
                  onChange={(e) => handleNewAdminChange('name', e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => handleNewAdminChange('email', e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={newAdmin.role}
                  onChange={(e) => handleNewAdminChange('role', e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 w-full"
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Content Manager">Content Manager</option>
                  <option value="Moderator">Moderator</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={newAdmin.password}
                  onChange={(e) => handleNewAdminChange('password', e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={newAdmin.confirmPassword}
                  onChange={(e) => handleNewAdminChange('confirmPassword', e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 w-full"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={addAdmin}
                className="px-4 py-2 bg-blue-600 rounded-md text-sm font-medium text-white hover:bg-blue-700"
              >
                Add Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;