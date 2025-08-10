import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import AlertModal from '../../components/common/AlertModal';

interface MembershipUpgradeOption {
  key: string;
  name: string;
  fee: number;
  description?: string;
  benefits?: string[];
  upgrade_cost: number;
}

interface MembershipRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  membershipType: string;
  membershipClass: string;
  membershipStatus: 'Active' | 'Expired' | 'Expiring Soon';
  expiryDate: string;
  joinDate: string;
  currentFee: number;
  paidAmount: number;
  availableUpgrades: MembershipUpgradeOption[];
  membershipId: string;
}

interface MembershipTier {
  key: string;
  name: string;
  fee: number;
  description: string;
  benefits: string[];
  color: string;
  badgeColor: string;
}

const MembershipUpgrade = () => {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: ''
  })

  const [membershipRecord, setMembershipRecord] = useState<MembershipRecord | null>(null);
  const [selectedUpgrade, setSelectedUpgrade] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'error' as 'info' | 'success' | 'warning' | 'error'
  });

  const membershipTiers: MembershipTier[] = [
    {
      key: 'student', 
      name: 'Trainee / Student Member',
      fee: 15,
      description: 'For students and trainees in medical programs',
      benefits: ['Mentorship programs', 'Student travel grants', 'E-learning access', 'Career development'],
      color: 'bg-yellow-50 border-yellow-200',
      badgeColor: 'bg-yellow-600'
    },
    {
      key: 'associate', 
      name: 'Associate Member',
      fee: 40,
      description: 'For allied health professionals',
      benefits: ['Special interest groups', 'Monthly newsletters', 'Event discounts', 'Professional networking'],
      color: 'bg-green-50 border-green-200',
      badgeColor: 'bg-green-600'
    },
    {
      key: 'affiliate',
      name: 'Affiliate Member',
      fee: 50,
      description: 'For non-clinical stakeholders and international supporters',
      benefits: ['Quarterly reports', 'International workshops', 'Friend of ACNA recognition', 'Knowledge sharing'],
      color: 'bg-indigo-50 border-indigo-200',
      badgeColor: 'bg-indigo-600'
    },
    {
      key: 'full_professional',
      name: 'Full / Professional Member',
      fee: 80,
      description: 'For licensed pediatric neurologists and medical professionals',
      benefits: ['Full voting rights', 'Committee eligibility', 'Premium resources', 'Research collaboration'],
      color: 'bg-blue-50 border-blue-200',
      badgeColor: 'bg-blue-600'
    },
    {
      key: 'institutional', 
      name: 'Institutional Member',
      fee: 300,
      description: 'For institutions, hospitals, and organizations',
      benefits: ['Group access (5 members)', 'Institutional recognition', 'Collaborative projects', 'Exhibition discounts'],
      color: 'bg-purple-50 border-purple-200',
      badgeColor: 'bg-purple-600'
    },
    {
      key: 'corporate', 
      name: 'Corporate / Partner Member',
      fee: 500,
      description: 'For companies and private sector entities',
      benefits: ['Brand visibility', 'Corporate speaking slots', 'Strategic roundtables', 'Program co-development'],
      color: 'bg-rose-50 border-rose-200',
      badgeColor: 'bg-rose-600'
    },
    {
      key: 'lifetime',
      name: 'Lifetime Member',
      fee: 500,
      description: 'One-time payment for lifetime benefits',
      benefits: ['All Full Member benefits', 'No renewal fees', 'Lifetime certificate', 'Priority invitations'],
      color: 'bg-emerald-50 border-emerald-200',
      badgeColor: 'bg-emerald-600'
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchData(prev => ({
      ...prev,
      [name]: value
    }));
    setSearchError('');
  };

  const handleFindRecord = async () => {
    setIsSearching(true);
    setSearchError('');
    setSelectedUpgrade('');

    try {
      const response = await api.post('/payments/membership-search/', {
        firstName: searchData.firstName.trim(),
        lastName: searchData.lastName.trim(),
        email: searchData.email.trim(),
        phone: searchData.phone.trim(),
        isOrganization: false
      });

      if (response.data) {
        setMembershipRecord({
          ...response.data,
          currentFee: response.data.renewalFee,
          paidAmount: response.data.renewalFee,
          membershipId: response.data.membershipId
        });
      } else {
        throw new Error('No matching membership record found');
      }
    } catch (error: any) {
      console.error('Search error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.detail || 
                          error.message || 
                          'Failed to find membership record. Please check your details and try again.';
      
      setSearchError(errorMessage);
      setAlertModal({
        isOpen: true,
        title: 'Record Not Found',
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setIsSearching(false);
    }
  };

  const getAvailableUpgrades = (): MembershipTier[] => {
    if (!membershipRecord) return [];
    
    return membershipTiers.filter(tier => {
      // Don't show current membership or lower tiers
      if (tier.name === membershipRecord.membershipType) return false;
      if (tier.fee <= (membershipRecord.currentFee || 0)) return false;
      
      // Special logic for Lifetime Member
      if (tier.key === 'lifetime' && membershipRecord.membershipType !== 'Full / Professional Member') {
        return false;
      }
      
      return true;
    });
  };

  const calculateUpgradeCost = (targetTier?: MembershipTier): number => {
    if (!targetTier || !membershipRecord) return 0;
    return targetTier.fee - (membershipRecord.paidAmount || 0);
  };

  const getSelectedTierInfo = (): MembershipTier | undefined => {
    return membershipTiers.find(tier => tier.key === selectedUpgrade);
  };

  const handleUpgrade = () => {
    if (!selectedUpgrade || !membershipRecord) return;
    
    const selectedTier = getSelectedTierInfo();
    if (!selectedTier) return;
    
    navigate('/payment', {
      state: {
        paymentType: 'upgrade',
        membershipType: selectedTier.key,
        membershipData: {
          id: membershipRecord.id, 
          userId: membershipRecord.id,
          email: membershipRecord.email,
          name: `${membershipRecord.firstName} ${membershipRecord.lastName}`,
          amount: selectedTier.fee - (membershipRecord.paidAmount || 0),
          newMembershipClass: selectedTier.key,
          membershipId: membershipRecord.membershipId,
          currentMembershipClass: membershipRecord.membershipClass 
        }
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800 border-green-200';
      case 'Expired': return 'bg-red-100 text-red-800 border-red-200';
      case 'Expiring Soon': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="py-12 md:py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 mb-4 sm:mb-6">
            Upgrade Your ACNA Membership
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-700 font-light max-w-3xl mx-auto">
            Enhance your professional journey by upgrading to a higher membership tier and unlock additional benefits and opportunities.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Left Sidebar - Find Membership Record */}
            <div className="lg:w-2/5">
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 sticky top-6">
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 flex items-center">
                    <span className="bg-orange-600 text-white rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-xs sm:text-sm font-bold mr-2 sm:mr-3">
                      1
                    </span>
                    Find My Membership Record
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Enter your details below to locate your membership record and see available upgrade options.
                  </p>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={searchData.firstName}
                      onChange={handleInputChange}
                      placeholder="Enter your first name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={searchData.lastName}
                      onChange={handleInputChange}
                      placeholder="Enter your last name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={searchData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email address"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={searchData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  {searchError && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <p className="text-red-600 text-sm">{searchError}</p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleFindRecord}
                    disabled={isSearching}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSearching ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Searching...
                      </span>
                    ) : (
                      'Find My Record'
                    )}
                  </button>
                </div>

                {/* Smart Pricing Info */}
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                    💡 Smart Upgrade Pricing
                  </h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-blue-800 text-sm">
                      You only pay the difference between your current membership and the new tier. Your previous payment is credited towards the upgrade!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Membership Record & Upgrade Options */}
            <div className="lg:w-3/5">
              {!membershipRecord ? (
                <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Ready to Upgrade?</h3>
                  <p className="text-gray-600 mb-4 sm:mb-6">
                    Enter your details in the search form to locate your ACNA membership record and explore upgrade options with smart pricing.
                  </p>
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4 sm:p-6">
                    <h4 className="font-medium text-orange-900 mb-2 sm:mb-3">Why Upgrade Your Membership?</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-left">
                      <ul className="text-orange-800 text-sm space-y-1 sm:space-y-2">
                        <li>🔥 Enhanced networking opportunities</li>
                        <li>📚 Access to premium resources</li>
                        <li>🎯 Specialized training programs</li>
                      </ul>
                      <ul className="text-orange-800 text-sm space-y-1 sm:space-y-2">
                        <li>🗳️ Voting rights and governance</li>
                        <li>💼 Leadership opportunities</li>
                        <li>🌟 Greater professional recognition</li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {/* Current Membership Display */}
                  <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="bg-orange-600 text-white p-4 sm:p-6">
                      <h2 className="text-xl sm:text-2xl font-bold mb-2 flex items-center">
                        <span className="bg-green-600 text-white rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-xs sm:text-sm font-bold mr-2 sm:mr-3">
                          ✓
                        </span>
                        Current Membership Record
                      </h2>
                      <p className="text-white-300 text-sm sm:text-base">Member ID: {membershipRecord.membershipId}</p>
                    </div>

                    <div className="p-4 sm:p-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2 sm:mb-4">Personal Information</h3>
                          <div className="space-y-2 sm:space-y-3">
                            <div>
                              <span className="text-xs sm:text-sm text-gray-500">Name:</span>
                              <p className="font-medium text-sm sm:text-base">{membershipRecord.firstName} {membershipRecord.lastName}</p>
                            </div>
                            <div>
                              <span className="text-xs sm:text-sm text-gray-500">Email:</span>
                              <p className="font-medium text-sm sm:text-base">{membershipRecord.email}</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2 sm:mb-4">Current Membership</h3>
                          <div className="space-y-2 sm:space-y-3">
                            <div>
                              <span className="text-xs sm:text-sm text-gray-500">Type:</span>
                              <p className="font-medium text-sm sm:text-base">{membershipRecord.membershipType}</p>
                            </div>
                            <div>
                              <span className="text-xs sm:text-sm text-gray-500">Status:</span>
                              <span className={`inline-block px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium border ${getStatusColor(membershipRecord.membershipStatus)}`}>
                                {membershipRecord.membershipStatus}
                              </span>
                            </div>
                            <div>
                              <span className="text-xs sm:text-sm text-gray-500">Paid Amount:</span>
                              <p className="font-medium text-green-600 text-sm sm:text-base">USD ${membershipRecord.paidAmount}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Upgrade Options */}
                  <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
                      <span className="bg-orange-600 text-white rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-xs sm:text-sm font-bold mr-2 sm:mr-3">
                        2
                      </span>
                      Choose Your Upgrade
                    </h3>

                    <div className="grid gap-3 sm:gap-4">
                    {getAvailableUpgrades().map((tier, index) => {
                      const upgradeCost = calculateUpgradeCost(tier);
                      const isSelected = selectedUpgrade === tier.key;
                        
                        return (
                          <div 
                            key={index} 
                            className={`border-2 rounded-lg p-4 sm:p-6 cursor-pointer transition-all duration-200 ${
                              isSelected 
                                ? 'border-orange-500 bg-orange-50' 
                                : `${tier.color} hover:shadow-md`
                            }`}
                            onClick={() => setSelectedUpgrade(tier.key)}
                          >
                            <div className="flex flex-col sm:flex-row justify-between items-start mb-3 sm:mb-4 gap-3">
                              <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center mb-1 sm:mb-2 gap-1 sm:gap-3">
                                  <h4 className="text-lg sm:text-xl font-bold text-gray-900">{tier.name}</h4>
                                  <span className={`${tier.badgeColor} text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium`}>
                                    USD ${tier.fee}
                                  </span>
                                </div>
                                <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3">{tier.description}</p>
                                <div className="flex flex-wrap gap-1 sm:gap-2">
                                  {tier.benefits.slice(0, 2).map((benefit, idx) => (
                                    <span key={idx} className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded text-xs">
                                      {benefit}
                                    </span>
                                  ))}
                                  {tier.benefits.length > 2 && (
                                    <span className="text-gray-500 text-xs">+{tier.benefits.length - 2} more</span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="w-full sm:w-auto">
                                <div className="bg-green-100 text-green-800 px-2 py-1 sm:px-3 sm:py-2 rounded-lg border border-green-200">
                                  <p className="text-xs sm:text-sm font-medium">Upgrade Cost</p>
                                  <p className="text-lg sm:text-2xl font-bold">USD ${upgradeCost}</p>
                                  <p className="text-xxs sm:text-xs">Only pay the difference!</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center">
                              <input
                                type="radio"
                                name="upgrade"
                                value={tier.name}
                                checked={isSelected}
                                onChange={() => setSelectedUpgrade(tier.key)} 
                                className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                              />
                              <label className="ml-2 text-xs sm:text-sm font-medium text-gray-700">
                                Select this upgrade
                              </label>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Upgrade Summary */}
                    {selectedUpgrade && (
                      <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 sm:p-6 border border-green-200">
                        <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Upgrade Summary</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                          <div>
                            <div className="space-y-2 sm:space-y-3">
                              <div className="flex justify-between">
                                <span className="text-xs sm:text-sm text-gray-600">Current Membership:</span>
                                <span className="font-medium text-xs sm:text-sm">{membershipRecord.membershipType}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs sm:text-sm text-gray-600">Amount Paid:</span>
                                <span className="font-medium text-xs sm:text-sm">USD ${membershipRecord.paidAmount}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs sm:text-sm text-gray-600">Upgrading to:</span>
                                <span className="font-medium text-xs sm:text-sm">{selectedUpgrade}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs sm:text-sm text-gray-600">New Tier Cost:</span>
                                <span className="font-medium text-xs sm:text-sm">USD ${getSelectedTierInfo()?.fee}</span>
                              </div>
                              <hr className="my-1 sm:my-2" />
                              <div className="flex justify-between text-base sm:text-lg font-bold">
                                <span className="text-green-700">You Pay:</span>
                                <span className="text-green-700">USD ${calculateUpgradeCost(getSelectedTierInfo())}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h5 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">New Benefits:</h5>
                            <ul className="text-xs sm:text-sm text-gray-700 space-y-1">
                              {getSelectedTierInfo()?.benefits.map((benefit, idx) => (
                                <li key={idx} className="flex items-center">
                                  <span className="text-green-500 mr-1 sm:mr-2">✓</span>
                                  {benefit}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        <button
                          onClick={handleUpgrade}
                          className="w-full mt-4 sm:mt-6 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-2 sm:py-3 px-4 sm:px-8 rounded-lg transition-all duration-300 text-sm sm:text-lg shadow-md hover:shadow-lg"
                        >
                          Upgrade Now - Pay Only USD ${calculateUpgradeCost(getSelectedTierInfo()!)}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits of Upgrading Section */}
      <section className="py-12 sm:py-16 bg-orange-600">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">Why Upgrade Your Membership?</h2>
            <p className="text-white text-sm sm:text-base max-w-2xl mx-auto">
              Upgrading your ACNA membership opens doors to enhanced opportunities and greater impact in child neurology.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-2 sm:mb-4">
                <span className="text-xl sm:text-2xl">🌟</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">Enhanced Access</h3>
              <p className="text-white text-xs sm:text-sm">
                Get access to premium resources, exclusive events, and advanced learning materials.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-2 sm:mb-4">
                <span className="text-xl sm:text-2xl">🤝</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">Greater Influence</h3>
              <p className="text-white text-xs sm:text-sm">
                Gain voting rights, committee participation, and leadership opportunities within ACNA.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-2 sm:mb-4">
                <span className="text-xl sm:text-2xl">💰</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">Smart Pricing</h3>
              <p className="text-white text-xs sm:text-sm">
                Only pay the difference between tiers - your previous payment is fully credited.
              </p>
            </div>
          </div>
        </div>
      </section>

      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </div>
  );
};

export default MembershipUpgrade;