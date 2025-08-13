import { useState, useEffect } from 'react';
import { 
  Users, Plus, Download, Eye, Trash2, Search, Clock, UserCheck,
  X, Mail, Phone, Calendar, MapPin, Award, CreditCard, Shield,
  MessageCircle, Ban, RotateCcw, ChevronDown, AlertTriangle
} from 'lucide-react';
import api from '../../services/api';
import { format, parseISO, isValid } from 'date-fns';

// Helper function to safely parse and format dates
const safeFormatDate = (dateString: string | null | undefined, formatStr = 'yyyy-MM-dd') => {
  if (!dateString) return 'N/A';
  
  try {
    const date = parseISO(dateString);
    return isValid(date) ? format(date, formatStr) : 'Invalid date';
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

// Types based on backend models
interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  mobile_number: string;
  membership_class: string;
  is_active_member: boolean;
  membership_valid_until: string | null;
  institution: string;
  specialization: string;
  profile_photo: string | null;
  country: string;
  date_joined: string;
  is_admin: boolean;
  roles: string[];
  membership_id: string;
}

interface Payment {
  id: number;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  payment_type: string;
  membership_type: string;
}

const MembersManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [members, setMembers] = useState<User[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  // Fetch members from backend
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const response = await api.get('/users/members/');
        setMembers(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch members');
        setLoading(false);
        console.error('Error fetching members:', err);
      }
    };
    
    fetchMembers();
  }, []);

  // Fetch payments when member is selected
  useEffect(() => {
    const fetchPayments = async () => {
      if (!selectedMember) return;
      
      try {
        const response = await api.get(`/payments/?user_id=${selectedMember.id}`);
        setPayments(response.data);
      } catch (err) {
        console.error('Failed to fetch payments', err);
      }
    };
    
    if (showModal && selectedMember && activeTab === 'payments') {
      fetchPayments();
    }
  }, [selectedMember, showModal, activeTab]);

  const openMemberModal = (member: User) => {
    setSelectedMember(member);
    setShowModal(true);
    setActiveTab('profile');
    setShowRoleDropdown(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedMember(null);
    setShowRoleDropdown(false);
  };

  const getStatus = (user: User) => {
    if (!user.is_active_member) return 'Inactive';
    
    if (!user.membership_valid_until) return 'Active';
    
    try {
      const expiryDate = new Date(user.membership_valid_until);
      const today = new Date();
      
      if (isNaN(expiryDate.getTime())) return 'Active';
      
      if (expiryDate < today) return 'Expired';
      
      // Check if expiring within 30 days
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      if (expiryDate < thirtyDaysFromNow) return 'Expiring Soon';
      
      return 'Active';
    } catch (error) {
      console.error('Error calculating status:', error);
      return 'Active';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Expiring Soon': return 'bg-orange-100 text-orange-800';
      case 'Inactive': return 'bg-gray-100 text-gray-800';
      case 'Expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAssignRole = async (role: string) => {
    if (!selectedMember) return;
    
    try {
      // Update user roles on backend
      const updatedRoles = selectedMember.roles.includes(role)
        ? selectedMember.roles.filter(r => r !== role)
        : [...selectedMember.roles, role];
      
      await api.patch(`/users/admin/update-roles/${selectedMember.id}/`, { roles: updatedRoles });
      
      // Update local state
      setSelectedMember({ ...selectedMember, roles: updatedRoles });
      setMembers(members.map(m => 
        m.id === selectedMember.id ? { ...m, roles: updatedRoles } : m
      ));
      
      setShowRoleDropdown(false);
    } catch (err) {
      console.error('Failed to assign role', err);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedMember) return;
    
    try {
      let payload = {};
      
      switch(newStatus) {
        case 'Active':
          payload = { is_active_member: true };
          break;
        case 'Suspended':
        case 'Banned':
          payload = { is_active_member: false };
          break;
      }
      
      await api.patch(`/users/admin/update/${selectedMember.id}/`, payload);
      
      // Update local state
      const updatedMember = { 
        ...selectedMember, 
        is_active_member: newStatus === 'Active' 
      };
      
      setSelectedMember(updatedMember);
      setMembers(members.map(m => 
        m.id === selectedMember.id ? updatedMember : m
      ));
    } catch (err) {
      console.error('Failed to change status', err);
    }
  };

  const handleSendMessage = () => {
    if (!selectedMember) return;
    console.log('Sending message to:', selectedMember.email);
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      `${member.first_name} ${member.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.specialization && member.specialization.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = 
      filterStatus === 'all' || 
      getStatus(member).toLowerCase().includes(filterStatus.toLowerCase());
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading members...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-300 rounded-lg p-4">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-300 rounded-lg">
      <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <h2 className="font-semibold text-gray-800 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Members Management
          </h2>
          <div className="flex items-center space-x-2 mt-2 md:mt-0">
            <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center">
              <Download className="w-4 h-4 mr-1" />
              Export
            </button>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
          </select>
          <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">All Types</option>
            <option value="full_professional">Full / Professional</option>
            <option value="associate">Associate</option>
            <option value="student">Student</option>
            <option value="institutional">Institutional</option>
          </select>
        </div>
      </div>

      {/* Members Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredMembers.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {member.first_name} {member.last_name}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{member.email}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {member.membership_class || 'N/A'}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(getStatus(member))}`}>
                    {getStatus(member)}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {member.membership_id || 'N/A'}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => openMemberModal(member)}
                    className="text-green-600 hover:text-green-900 font-medium"
                  >
                    View Profile
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Member Profile Modal */}
      {showModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                  {selectedMember.profile_photo ? (
                    <img 
                      src={selectedMember.profile_photo} 
                      alt="Profile" 
                      className="w-16 h-16 rounded-full object-cover" 
                    />
                  ) : (
                    <span className="text-2xl font-bold text-gray-600">
                      {selectedMember.first_name?.[0]}{selectedMember.last_name?.[0]}
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedMember.first_name} {selectedMember.last_name}
                  </h2>
                  <p className="text-gray-600">{selectedMember.specialization || 'N/A'}</p>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(getStatus(selectedMember))}`}>
                    {getStatus(selectedMember)}
                  </span>
                </div>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'profile', label: 'Profile', icon: Users },
                  { id: 'payments', label: 'Payments', icon: CreditCard },
                  { id: 'actions', label: 'Actions', icon: Shield }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id 
                        ? 'border-blue-500 text-blue-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Member Information</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Full Name</label>
                        <p className="text-gray-900">{selectedMember.first_name} {selectedMember.last_name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <p className="text-gray-900">{selectedMember.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Phone</label>
                        <p className="text-gray-900">{selectedMember.mobile_number || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Member ID</label>
                        <p className="text-gray-900">{selectedMember.membership_id || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Membership Type</label>
                        <p className="text-gray-900">{selectedMember.membership_class || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Join Date</label>
                        <p className="text-gray-900">
                          {safeFormatDate(selectedMember.date_joined)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Membership Expires</label>
                        <p className="text-gray-900">
                          {safeFormatDate(selectedMember.membership_valid_until)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Institution</label>
                        <p className="text-gray-900">{selectedMember.institution || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Specialization</label>
                      <p className="text-gray-900 mt-1">{selectedMember.specialization || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Country</label>
                      <p className="text-gray-900 mt-1">{selectedMember.country || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Payments Tab */}
              {activeTab === 'payments' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Payment History</h3>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-medium">Current Payment Status</span>
                      <span className={`px-3 py-1 rounded text-sm font-medium ${
                        getStatus(selectedMember) === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {getStatus(selectedMember)}
                      </span>
                    </div>
                    
                    {selectedMember.membership_valid_until && (
                      <div className="mb-2 text-sm">
                        <span className="font-medium">Membership Expires:</span>{' '}
                        {safeFormatDate(selectedMember.membership_valid_until, 'MMMM dd, yyyy')}
                      </div>
                    )}
                    
                    {payments.length > 0 ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-5 font-medium border-b pb-2">
                          <div>Date</div>
                          <div>Type</div>
                          <div>Membership Type</div>
                          <div>Amount</div>
                          <div>Status</div>
                        </div>
                        {payments.map(payment => (
                          <div key={payment.id} className="grid grid-cols-5 py-2 border-b">
                            <div>{safeFormatDate(payment.created_at, 'MMM dd, yyyy')}</div>
                            <div>{payment.payment_type}</div>
                            <div>{payment.membership_type}</div>
                            <div>${payment.amount} {payment.currency}</div>
                            <div className={`font-medium ${
                              payment.status === 'succeeded' 
                                ? 'text-green-600' 
                                : 'text-red-600'
                            }`}>
                              {payment.status}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No payment history found</p>
                    )}
                  </div>
                </div>
              )}

              {/* Actions Tab */}
              {activeTab === 'actions' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Member Actions</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Account Actions */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Account Management</h4>
                      <div className="relative">
                        <button 
                          onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                          className="w-full text-left px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 flex items-center justify-between"
                        >
                          <div className="flex items-center">
                            <Shield className="w-4 h-4 mr-3" />
                            Assign Role
                          </div>
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        
                        {showRoleDropdown && (
                          <div className="absolute mt-1 w-full bg-white border border-gray-200 rounded shadow-lg z-10">
                            <button 
                              onClick={() => handleAssignRole('Tutor')}
                              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                            >
                              Tutor
                            </button>
                            <button 
                              onClick={() => handleAssignRole('Moderator')}
                              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                            >
                              Moderator
                            </button>
                            <button 
                              onClick={() => handleAssignRole('Admin')}
                              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                            >
                              Admin
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status Actions */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Status Management</h4>
                      <div className="space-y-2">
                        <button 
                          onClick={() => handleStatusChange('Active')}
                          className="w-full text-left px-4 py-2 border border-green-300 rounded hover:bg-green-50 flex items-center text-green-700"
                        >
                          <UserCheck className="w-4 h-4 mr-3" />
                          Activate Account
                        </button>
                        <button 
                          onClick={() => handleStatusChange('Suspended')}
                          className="w-full text-left px-4 py-2 border border-orange-300 rounded hover:bg-orange-50 flex items-center text-orange-700"
                        >
                          <AlertTriangle className="w-4 h-4 mr-3" />
                          Suspend Account
                        </button>
                        <button 
                          onClick={() => handleStatusChange('Banned')}
                          className="w-full text-left px-4 py-2 border border-red-300 rounded hover:bg-red-50 flex items-center text-red-700"
                        >
                          <Ban className="w-4 h-4 mr-3" />
                          Ban Account
                        </button>
                      </div>
                    </div>

                    {/* Communication */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Communication</h4>
                      <div className="space-y-2">
                        <button 
                          onClick={handleSendMessage}
                          className="w-full text-left px-4 py-2 border border-blue-300 rounded hover:bg-blue-50 flex items-center text-blue-700"
                        >
                          <MessageCircle className="w-4 h-4 mr-3" />
                          Send Message
                        </button>
                        <button className="w-full text-left px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 flex items-center">
                          <Mail className="w-4 h-4 mr-3" />
                          Send Email
                        </button>
                      </div>
                    </div>

                    {/* Recovery */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Account Recovery</h4>
                      <div className="space-y-2">
                        <button className="w-full text-left px-4 py-2 border border-green-300 rounded hover:bg-green-50 flex items-center text-green-700">
                          <RotateCcw className="w-4 h-4 mr-3" />
                          Restore Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembersManagement;