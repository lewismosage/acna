import { useState, useEffect } from 'react';
import { Search, MapPin, Mail, Phone, Filter, Users, Building } from 'lucide-react';
import { Link } from 'react-router-dom';
import api, { getMembers } from '../../services/api'; 
import  DefaultPicture from '../../assets/default Profile Image.png';
import LoadingSpinner from '../../components/common/LoadingSpinner';

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  mobile_number: string;
  country: string;
  membership_class: string;
  institution: string;
  specialization: string;
  is_active_member: boolean;
  membership_valid_until: string | null;
  profile_photo: string | null;
  membership_id: string | null;
  date_joined: string;
}

const MembershipDirectory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedMembership, setSelectedMembership] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  // Initialize as empty array to prevent filter errors
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMembers();
        
        // Ensure data is an array before setting
        if (Array.isArray(data)) {
          setMembers(data);
        } else {
          // Handle case where API returns non-array data
          console.warn('API returned non-array data:', data);
          setMembers([]);
          setError('Invalid data format received from server.');
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load members. Please try again later.');
        console.error('Error fetching members:', err);
        // Ensure members remains an empty array on error
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  // Add safety check to ensure members is always an array
  const safeMembers = Array.isArray(members) ? members : [];

  const filteredMembers = safeMembers.filter(member => {
    // Add null/undefined checks for member properties
    const firstName = member?.first_name || '';
    const lastName = member?.last_name || '';
    const specialization = member?.specialization || '';
    const institution = member?.institution || '';
    const country = member?.country || '';
    const membershipClass = member?.membership_class || '';

    const matchesSearch = 
      firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      institution.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCountry = !selectedCountry || country === selectedCountry;
    const matchesMembership = !selectedMembership || membershipClass === selectedMembership;
    const matchesSpecialization = !selectedSpecialization || specialization === selectedSpecialization;
    
    return matchesSearch && matchesCountry && matchesMembership && matchesSpecialization;
  });

  // Helper function to determine membership status based on active status and expiry
  const getMembershipStatus = (member: Member): 'Active' | 'Expired' | 'Expiring Soon' => {
    if (!member?.is_active_member) return 'Expired';
    
    if (member.membership_valid_until) {
      const expiryDate = new Date(member.membership_valid_until);
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);
      
      if (expiryDate < today) return 'Expired';
      if (expiryDate <= thirtyDaysFromNow) return 'Expiring Soon';
    }
    
    return 'Active';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800 border-green-200';
      case 'Expired': return 'bg-red-100 text-red-800 border-red-200';
      case 'Expiring Soon': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getMembershipColor = (type: string) => {
    const colors = {
      'student': 'bg-yellow-100 text-yellow-800',
      'associate': 'bg-green-100 text-green-800',
      'affiliate': 'bg-indigo-100 text-indigo-800',
      'full_professional': 'bg-blue-100 text-blue-800',
      'institutional': 'bg-purple-100 text-purple-800',
      'corporate': 'bg-rose-100 text-rose-800',
      'lifetime': 'bg-emerald-100 text-emerald-800',
      'honorary': 'bg-gray-100 text-gray-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Helper to convert membership class key to display name
  const getMembershipDisplayName = (membershipClass: string) => {
    const displayNames = {
      'full_professional': 'Full / Professional Member',
      'associate': 'Associate Member',
      'student': 'Trainee / Student Member',
      'institutional': 'Institutional Member',
      'affiliate': 'Affiliate Member',
      'honorary': 'Honorary Member',
      'corporate': 'Corporate / Partner Member',
      'lifetime': 'Lifetime Member',
    };
    return displayNames[membershipClass as keyof typeof displayNames] || membershipClass;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCountry('');
    setSelectedMembership('');
    setSelectedSpecialization('');
  };

  const obfuscateEmail = (email: string) => {
    if (!email) return 'Not provided';
    const [name, domain] = email.split('@');
    if (!name || !domain) return 'Invalid email';
    return `${name.substring(0, 3)}****@${domain}`;
  };

  const obfuscatePhone = (phone: string) => {
    if (!phone) return 'Not provided';
    if (phone.length <= 6) return phone; // Don't obfuscate very short numbers
    return `${phone.substring(0, 3)}****${phone.substring(phone.length - 2)}`;
  };

  // Extract unique values for filter dropdowns with safety checks
  const availableCountries = Array.from(
    new Set(
      safeMembers
        .map(member => member?.country)
        .filter(Boolean)
    )
  ).sort();

  const availableMembershipTypes = Array.from(
    new Set(
      safeMembers
        .map(member => member?.membership_class)
        .filter(Boolean)
    )
  );

  const availableSpecializations = Array.from(
    new Set(
      safeMembers
        .map(member => member?.specialization)
        .filter(Boolean)
    )
  ).sort();

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-6">
            African Healthcare Professionals Directory
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 font-light max-w-3xl mx-auto">
            Connect with pediatric neurology professionals across Africa. Find colleagues, collaborators, and experts in your field.
          </p>
        </div>
      </section>

      {/* Search and Filters Section */}
      <section className="py-8 bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, institution, or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter Toggle */}
          <div className="flex justify-center mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 bg-white border-2 border-orange-600 text-orange-600 px-6 py-2 rounded-lg hover:bg-orange-50 transition-colors duration-300"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              <span className="text-sm">({Object.values({selectedCountry, selectedMembership, selectedSpecialization}).filter(Boolean).length})</span>
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">All Countries</option>
                    {availableCountries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Membership Type</label>
                  <select
                    value={selectedMembership}
                    onChange={(e) => setSelectedMembership(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">All Memberships</option>
                    {availableMembershipTypes.map(type => (
                      <option key={type} value={type}>{getMembershipDisplayName(type)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                  <select
                    value={selectedSpecialization}
                    onChange={(e) => setSelectedSpecialization(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">All Specializations</option>
                    {availableSpecializations.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors duration-300"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Results Summary */}
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>
              Showing {filteredMembers.length} of {safeMembers.length} members
            </span>
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {safeMembers.filter(m => m?.is_active_member).length} Active Members
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Directory Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          {error ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Directory</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors duration-300"
              >
                Try Again
              </button>
            </div>
          ) : loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <LoadingSpinner />
              </div>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No Members Found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search terms or filters to find more members.
              </p>
              <button
                onClick={clearFilters}
                className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors duration-300"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMembers.map(member => {
                // Add safety check for member object
                if (!member) return null;
                
                const membershipStatus = getMembershipStatus(member);
                return (
                  <div key={member.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-4">
                      <div className="flex items-start gap-4">
                        <img 
                          src={member.profile_photo || DefaultPicture} 
                          alt={`${member.first_name || ''} ${member.last_name || ''}`}
                          className="w-16 h-16 rounded-full object-cover border-2 border-white"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = DefaultPicture;
                          }}
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-lg font-bold">
                                {member.first_name || ''} {member.last_name || ''}
                              </h3>
                              <p className="text-orange-100 text-sm">
                                {member.specialization || 'Healthcare Professional'}
                              </p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(membershipStatus)}`}>
                              {membershipStatus}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="space-y-3">
                        {/* Institution */}
                        <div className="flex items-center text-sm text-gray-600">
                          <Building className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{member.institution || 'Not specified'}</span>
                        </div>

                        {/* Location */}
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>{member.country || 'Not specified'}</span>
                        </div>

                        {/* Contact Info */}
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{obfuscateEmail(member.email)}</span>
                        </div>

                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>{obfuscatePhone(member.mobile_number)}</span>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          {member.membership_class && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMembershipColor(member.membership_class)}`}>
                              {getMembershipDisplayName(member.membership_class)}
                            </span>
                          )}
                        </div>

                        {/* Member Details */}
                        <div className="text-xs text-gray-500 mt-2 space-y-1">
                          <div>
                            Member since {member.date_joined ? new Date(member.date_joined).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long' 
                            }) : 'Unknown'}
                          </div>
                          {member.membership_id && (
                            <div>ID: {member.membership_id}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Join Our Professional Network
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            Become part of Africa's leading pediatric neurology community
          </p>
          <Link
            to="/membership-categories"
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300">
            Learn About Membership
          </Link>
        </div>
      </section>
    </div>
  );
};

export default MembershipDirectory;