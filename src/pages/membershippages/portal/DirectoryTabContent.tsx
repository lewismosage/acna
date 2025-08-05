import { useState, useEffect } from 'react';
import { Search, MapPin, Mail, Filter, Users, Building, X, Send } from 'lucide-react';

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  county: string;
  membershipType: string;
  profession: string;
  institution: string;
  specialization: string;
  yearsOfExperience: string;
  status: 'Active' | 'Expired' | 'Expiring Soon';
  profileImage?: string;
}

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isCurrentUser: boolean;
}

const MessagingModal = ({ member, onClose }: { member: Member; onClose: () => void }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: member.firstName,
      content: 'Hi there, I would like to be part of your network as we are in similar disciplines',
      timestamp: '11:49 AM',
      isCurrentUser: false,
    },
    {
      id: '2',
      sender: 'You',
      content: 'Hello! I would be happy to connect and discuss potential collaborations.',
      timestamp: '11:52 AM',
      isCurrentUser: true,
    },
  ]);

  const handleSendMessage = () => {
    if (message.trim() === '') return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'You',
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isCurrentUser: true,
    };

    setMessages([...messages, newMessage]);
    setMessage('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img
              src={member.profileImage || 'https://via.placeholder.com/40'}
              alt={`${member.firstName} ${member.lastName}`}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h3 className="font-semibold text-gray-900">
                {member.firstName} {member.lastName}
              </h3>
              <p className="text-xs text-gray-500">{member.profession}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${
                  msg.isCurrentUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p>{msg.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    msg.isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                  }`}
                >
                  {msg.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Write a message..."
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSendMessage}
              disabled={message.trim() === ''}
              className={`p-2 rounded-full ${
                message.trim() === ''
                  ? 'text-gray-400'
                  : 'text-blue-600 hover:bg-blue-50'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DirectoryTabContent = () => {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data - in a real app, this would come from an API
  useEffect(() => {
    const mockMembers: Member[] = [
      {
        id: 'ACNA-2024-001',
        firstName: 'Dr. Sarah',
        lastName: 'Kimani',
        email: 'sarah.kimani@hospital.co.ke',
        phone: '+254 712 345 678',
        country: 'Kenya',
        county: 'Nairobi',
        membershipType: 'Professional Member',
        profession: 'Pediatric Neurologist',
        institution: 'Kenyatta National Hospital',
        specialization: 'Epilepsy',
        yearsOfExperience: '8-12 years',
        status: 'Active',
        profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80'
      },
      // Add more mock members as needed...
    ];

    setTimeout(() => {
      setMembers(mockMembers);
      setLoading(false);
    }, 800);
  }, []);

  const countries = ['Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'Egypt', 'Nigeria', 'Ghana', 'South Africa'];
  const specializations = ['Epilepsy', 'Cerebral Palsy', 'Developmental Disorders', 'Neuroinfections'];

  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.profession.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.institution.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCountry = !selectedCountry || member.country === selectedCountry;
    const matchesSpecialization = !selectedSpecialization || member.specialization === selectedSpecialization;
    
    return matchesSearch && matchesCountry && matchesSpecialization;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCountry('');
    setSelectedSpecialization('');
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">All Countries</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
              <select
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">All Specializations</option>
                {specializations.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-200"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center text-sm text-gray-600 px-2">
        <span>
          Showing {filteredMembers.length} of {members.length} members
        </span>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          <span>{members.filter(m => m.status === 'Active').length} Active</span>
        </div>
      </div>

      {/* Members Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="text-gray-400 mb-4">
            <Search className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No members found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
          <button
            onClick={clearFilters}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map(member => (
            <div key={member.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex items-start gap-4 mb-4">
                  {/* Member Profile Image */}
                  <div className="flex-shrink-0">
                    <img 
                      src={member.profileImage || 'https://via.placeholder.com/80'} 
                      alt={`${member.firstName} ${member.lastName}`}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                    />
                  </div>
                  
                  {/* Member Info */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-gray-900">
                          {member.firstName} {member.lastName}
                        </h3>
                        <p className="text-sm text-blue-600">{member.profession}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded ${
                        member.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : member.status === 'Expired' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {member.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Building className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{member.institution}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{member.country}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="truncate">{member.email}</span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button className="flex-1 bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700">
                    View Profile
                  </button>
                  <button 
                    onClick={() => setSelectedMember(member)}
                    className="flex-1 border border-gray-300 text-gray-700 py-2 rounded text-sm font-medium hover:bg-gray-50"
                  >
                    Message
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Messaging Modal */}
      {selectedMember && (
        <MessagingModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </div>
  );
};

export default DirectoryTabContent;