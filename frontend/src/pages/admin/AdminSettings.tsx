import { 
  Settings, Edit3, Plus, Database, Shield, Lock 
} from 'lucide-react';

const AdminSettings = () => (
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
        
        <div>
          <h3 className="font-medium mb-2">Admin Users</h3>
          <div className="space-y-2">
            {[
              { name: 'John Doe', email: 'john@acna.org', role: 'Super Admin', status: 'Active' },
              { name: 'Jane Smith', email: 'jane@acna.org', role: 'Content Manager', status: 'Active' },
              { name: 'Mike Johnson', email: 'mike@acna.org', role: 'Moderator', status: 'Inactive' },
            ].map((admin, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                <div>
                  <p className="font-medium text-sm">{admin.name}</p>
                  <p className="text-xs text-gray-600">{admin.email} • {admin.role}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    admin.status === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {admin.status}
                  </span>
                  <button className="text-blue-600 hover:text-blue-900">
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-3 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
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
  </div>
);

export default AdminSettings;