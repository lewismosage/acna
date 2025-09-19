import { useState, useEffect } from 'react';
import { Search, MapPin, Mail, Filter, Users, Building, X } from 'lucide-react';
import ViewProfile from '../portal/communications/ViewProfile'; 
import MessagingModal from './communications/MessagingModal';
import api from '../../../services/api'; 
import defaultProfileImage from '../../../assets/default Profile Image.png';

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  mobile_number: string;
  country: string;
  county?: string;
  membership_class: string;
  profession?: string;
  institution?: string;
  specialization?: string;
  is_active_member: boolean;
  membership_valid_until?: string;
  profile_photo?: string;
}

const DirectoryTabContent = () => {
  const [viewedProfile, setViewedProfile] = useState<Member | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Helper function to mask email addresses
  const maskEmail = (email: string): string => {
    if (!email) return '';
    
    const [localPart, domain] = email.split('@');
    if (!localPart || !domain) return email;
    
    // Show first 2 characters of local part, mask the rest before @
    const visibleLocalPart = localPart.slice(0, 2);
    const maskedLocalPart = '*'.repeat(Math.max(0, localPart.length - 2));
    
    return `${visibleLocalPart}${maskedLocalPart}@${domain}`;
  };

  // Fetch members from API
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const response = await api.get('/users/members/'); 
        // Filter to only include active members
        const activeMembers = response.data.filter((member: Member) => member.is_active_member);
        setMembers(activeMembers);
        setError('');
      } catch (err) {
        setError('Failed to load members. Please try again later.');
        console.error('Error fetching members:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  // Extract unique countries and specializations for filters
  const countries = Array.from(new Set(members.map(m => m.country).filter(Boolean)));
  const specializations = Array.from(new Set(members.map(m => m.specialization).filter(Boolean)));

  const filteredMembers = members.filter(member => {
    const fullName = `${member.first_name} ${member.last_name}`.toLowerCase();
    const matchesSearch = 
      fullName.includes(searchTerm.toLowerCase()) ||
      (member.profession && member.profession.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (member.institution && member.institution.toLowerCase().includes(searchTerm.toLowerCase()));
    
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
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <X className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

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
          Showing {filteredMembers.length} of {members.length} active members
        </span>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          <span>{members.length} Active</span>
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">No active members found</h3>
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
                  <div className="flex-shrink-0">
                    <img 
                      src={member.profile_photo || defaultProfileImage} 
                      alt={`${member.first_name} ${member.last_name}`}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-gray-900">
                          {member.first_name} {member.last_name}
                        </h3>
                        <p className="text-sm text-blue-600">
                          {member.specialization || member.profession || 'Member'}
                        </p>
                      </div>
                      <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  {member.institution && (
                    <div className="flex items-center">
                      <Building className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{member.institution}</span>
                    </div>
                  )}
                  {member.country && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{member.country}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="truncate">{maskEmail(member.email)}</span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button 
                    onClick={() => setViewedProfile(member)}
                    className="flex-1 bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700"
                  >
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

      {viewedProfile && (
        <ViewProfile
          member={viewedProfile}
          onClose={() => setViewedProfile(null)}
          onMessage={() => {
            setViewedProfile(null);
            setSelectedMember(viewedProfile);
          }}
        />
      )}

      {/* Updated Messaging Modal with real backend integration */}
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