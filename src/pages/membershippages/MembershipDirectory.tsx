import React, { useState, useEffect } from 'react';
import { Search, MapPin, Mail, Phone, Filter, Users, Award, Building } from 'lucide-react';

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
  joinDate: string;
  status: 'Active' | 'Expired' | 'Expiring Soon';
  profileImage?: string;
  bio?: string;
}

const MembershipDirectory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedMembership, setSelectedMembership] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data - in real app, this would come from API
  const mockMembers: Member[] = [
    {
      id: 'ACNA-2024-001',
      firstName: 'Dr. Sarah',
      lastName: 'Kimani',
      email: 'sarah.kimani@hospital.co.ke',
      phone: '+254 712 345 678',
      country: 'Kenya',
      county: 'Nairobi',
      membershipType: 'Full / Professional Member',
      profession: 'Pediatric Neurologist',
      institution: 'Kenyatta National Hospital',
      specialization: 'Epilepsy',
      yearsOfExperience: '8-12 years',
      joinDate: '2020-03-15',
      status: 'Active',
      bio: 'Specialized in pediatric epilepsy with focus on early intervention and family support programs.'
    },
    {
      id: 'ACNA-2024-002',
      firstName: 'Dr. James',
      lastName: 'Mutua',
      email: 'j.mutua@research.ac.ug',
      phone: '+256 701 234 567',
      country: 'Uganda',
      county: 'Kampala',
      membershipType: 'Associate Member',
      profession: 'Neuropsychologist',
      institution: 'Makerere University',
      specialization: 'Developmental Disorders',
      yearsOfExperience: '5-7 years',
      joinDate: '2021-07-22',
      status: 'Active',
      bio: 'Research focus on autism spectrum disorders and developmental interventions in East Africa.'
    },
    {
      id: 'ACNA-2024-003',
      firstName: 'Prof. Mary',
      lastName: 'Ochieng',
      email: 'mary.ochieng@medschool.ac.ke',
      phone: '+254 722 987 654',
      country: 'Kenya',
      county: 'Kisumu',
      membershipType: 'Full / Professional Member',
      profession: 'Pediatric Neurologist',
      institution: 'University of Nairobi',
      specialization: 'Cerebral Palsy',
      yearsOfExperience: '15+ years',
      joinDate: '2018-01-10',
      status: 'Active',
      bio: 'Leading researcher in cerebral palsy rehabilitation and community-based therapy programs.'
    },
    {
      id: 'ACNA-2024-004',
      firstName: 'Dr. Peter',
      lastName: 'Nyong',
      email: 'peter.nyong@clinic.org',
      phone: '+255 754 321 098',
      country: 'Tanzania',
      county: 'Dar es Salaam',
      membershipType: 'Trainee / Student Member',
      profession: 'Medical Student',
      institution: 'Muhimbili University',
      specialization: 'General Neurology',
      yearsOfExperience: '1-2 years',
      joinDate: '2023-09-05',
      status: 'Active',
      bio: 'Final year medical student with interest in pediatric neurology and rural healthcare delivery.'
    },
    {
      id: 'ACNA-2024-005',
      firstName: 'Dr. Grace',
      lastName: 'Uwimana',
      email: 'g.uwimana@hospital.rw',
      phone: '+250 788 123 456',
      country: 'Rwanda',
      county: 'Kigali',
      membershipType: 'Associate Member',
      profession: 'Physiotherapist',
      institution: 'King Faisal Hospital',
      specialization: 'Pediatric Rehabilitation',
      yearsOfExperience: '3-5 years',
      joinDate: '2022-05-18',
      status: 'Expiring Soon',
      bio: 'Specialized in pediatric rehabilitation with focus on neurological conditions and mobility support.'
    },
    {
      id: 'ACNA-2024-006',
      firstName: 'Dr. Ahmed',
      lastName: 'Hassan',
      email: 'ahmed.hassan@medical.eg',
      phone: '+20 100 234 5678',
      country: 'Egypt',
      county: 'Cairo',
      membershipType: 'Institutional Member',
      profession: 'Department Head',
      institution: 'Cairo Children\'s Hospital',
      specialization: 'Neuroinfections',
      yearsOfExperience: '12-15 years',
      joinDate: '2019-11-30',
      status: 'Active',
      bio: 'Leading pediatric neurology department with focus on infectious neurological conditions.'
    }
  ];

  const countries = ['Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'Egypt', 'Nigeria', 'Ghana', 'South Africa'];
  const membershipTypes = [
    'Trainee / Student Member',
    'Associate Member',
    'Affiliate Member',
    'Full / Professional Member',
    'Institutional Member',
    'Corporate / Partner Member',
    'Lifetime Member'
  ];
  const specializations = [
    'Epilepsy',
    'Cerebral Palsy',
    'Developmental Disorders',
    'Neuroinfections',
    'General Neurology',
    'Pediatric Rehabilitation',
    'Neuropsychology',
    'Neurosurgery'
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setMembers(mockMembers);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.profession.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCountry = !selectedCountry || member.country === selectedCountry;
    const matchesMembership = !selectedMembership || member.membershipType === selectedMembership;
    const matchesSpecialization = !selectedSpecialization || member.specialization === selectedSpecialization;
    
    return matchesSearch && matchesCountry && matchesMembership && matchesSpecialization;
  });

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
      'Trainee / Student Member': 'bg-yellow-100 text-yellow-800',
      'Associate Member': 'bg-green-100 text-green-800',
      'Affiliate Member': 'bg-indigo-100 text-indigo-800',
      'Full / Professional Member': 'bg-blue-100 text-blue-800',
      'Institutional Member': 'bg-purple-100 text-purple-800',
      'Corporate / Partner Member': 'bg-rose-100 text-rose-800',
      'Lifetime Member': 'bg-emerald-100 text-emerald-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCountry('');
    setSelectedMembership('');
    setSelectedSpecialization('');
  };

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
                placeholder="Search by name, profession, institution, or specialization..."
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
                    {countries.map(country => (
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
                    {membershipTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
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
                    {specializations.map(spec => (
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
              Showing {filteredMembers.length} of {members.length} members
            </span>
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {members.filter(m => m.status === 'Active').length} Active Members
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Directory Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading directory...</p>
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
              {filteredMembers.map(member => (
                <div key={member.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-bold">
                          {member.firstName} {member.lastName}
                        </h3>
                        <p className="text-orange-100 text-sm">{member.profession}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(member.status)}`}>
                        {member.status}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="space-y-3">
                      {/* Institution */}
                      <div className="flex items-center text-sm text-gray-600">
                        <Building className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{member.institution}</span>
                      </div>

                      {/* Location */}
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{member.county}, {member.country}</span>
                      </div>

                      {/* Contact Info */}
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{member.email}</span>
                      </div>

                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{member.phone}</span>
                      </div>

                      {/* Bio */}
                      {member.bio && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-sm text-gray-700 line-clamp-3">{member.bio}</p>
                        </div>
                      )}

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMembershipColor(member.membershipType)}`}>
                          {member.membershipType}
                        </span>
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                          {member.specialization}
                        </span>
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                          {member.yearsOfExperience}
                        </span>
                      </div>

                      {/* Member Since */}
                      <div className="text-xs text-gray-500 mt-2">
                        Member since {new Date(member.joinDate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long' 
                        })}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 pt-4 border-t border-gray-100 flex space-x-2">
                      <button className="flex-1 bg-orange-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-orange-700 transition-colors duration-300">
                        Connect
                      </button>
                      <button className="flex-1 border border-gray-300 text-gray-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors duration-300">
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Join Our Growing Community
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            Connect with healthcare professionals across Africa and be part of the movement to improve pediatric neurological care.
          </p>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Network & Collaborate</h3>
              <p className="text-gray-600">Connect with peers and build professional relationships across the continent.</p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-6 border border-green-200">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Share Knowledge</h3>
              <p className="text-gray-600">Exchange expertise and learn from fellow healthcare professionals.</p>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Make Impact</h3>
              <p className="text-gray-600">Work together to improve healthcare outcomes for children across Africa.</p>
            </div>
          </div>
          
          <div className="space-x-4">
            <button className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300">
              Join ACNA Today
            </button>
            <button className="border-2 border-orange-600 text-orange-600 font-bold py-3 px-8 rounded-lg hover:bg-orange-50 transition-colors duration-300">
              Learn More
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MembershipDirectory;