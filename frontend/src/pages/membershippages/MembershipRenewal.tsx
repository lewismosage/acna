import React, { useState } from 'react';

interface MembershipRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  membershipType: string;
  membershipStatus: 'Active' | 'Expired' | 'Expiring Soon';
  expiryDate: string;
  joinDate: string;
  renewalFee: string;
}

interface OrganizationMembershipRecord {
  id: string;
  organizationName: string;
  organizationEmail: string;
  organizationPhone: string;
  membershipType: string;
  membershipStatus: 'Active' | 'Expired' | 'Expiring Soon';
  expiryDate: string;
  joinDate: string;
  renewalFee: string;
}

const MembershipRenew = () => {
  const [searchData, setSearchData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: ''
  });

  const [organizationSearchData, setOrganizationSearchData] = useState({
    organizationName: '',
    organizationEmail: '',
    organizationPhone: ''
  });

  const [isOrganization, setIsOrganization] = useState(false);
  const [membershipRecord, setMembershipRecord] = useState<MembershipRecord | OrganizationMembershipRecord | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (isOrganization) {
      setOrganizationSearchData(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setSearchData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    setSearchError('');
  };

  const handleFindRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setSearchError('');

    // Simulate API call delay
    setTimeout(() => {
      if (isOrganization) {
        // Mock organization membership record
        if (organizationSearchData.organizationName && organizationSearchData.organizationEmail) {
          const mockRecord: OrganizationMembershipRecord = {
            id: 'ACNA-ORG-2024-00567',
            organizationName: organizationSearchData.organizationName,
            organizationEmail: organizationSearchData.organizationEmail,
            organizationPhone: organizationSearchData.organizationPhone,
            membershipType: 'Organization Member',
            membershipStatus: 'Expiring Soon',
            expiryDate: '2025-09-20',
            joinDate: '2022-09-20',
            renewalFee: 'USD $250'
          };
          setMembershipRecord(mockRecord);
        } else {
          setSearchError('Please fill in organization name and email to find your membership record.');
        }
      } else {
        // Mock individual membership record
        if (searchData.email && searchData.firstName && searchData.lastName) {
          const mockRecord: MembershipRecord = {
            id: 'ACNA-2024-001234',
            firstName: searchData.firstName,
            lastName: searchData.lastName,
            email: searchData.email,
            phone: searchData.phone,
            membershipType: 'Full / Professional Member',
            membershipStatus: 'Expiring Soon',
            expiryDate: '2025-08-15',
            joinDate: '2023-08-15',
            renewalFee: 'USD $80'
          };
          setMembershipRecord(mockRecord);
        } else {
          setSearchError('Please fill in all required fields to find your membership record.');
        }
      }
      setIsSearching(false);
    }, 1500);
  };

  const handleRenewMembership = () => {
    // Handle renewal logic here
    console.log('Renewing membership...');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800 border-green-200';
      case 'Expired': return 'bg-red-100 text-red-800 border-red-200';
      case 'Expiring Soon': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const toggleOrganizationMembership = () => {
    setIsOrganization(!isOrganization);
    setMembershipRecord(null);
    setSearchError('');
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-6">
            {isOrganization ? 'Renew Your Organization Membership' : 'Renew Your ACNA Membership'}
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 font-light max-w-3xl mx-auto">
            {isOrganization 
              ? 'Continue your organization\'s membership with ACNA to access institutional benefits and opportunities.'
              : 'Continue your professional journey with ACNA by renewing your membership to access additional benefits and opportunities.'}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Left Sidebar - Find Membership Record */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                    <span className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                      1
                    </span>
                    {isOrganization ? 'Find Organization Membership' : 'Find My Membership Record'}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {isOrganization
                      ? 'Enter your organization details below to locate your membership record.'
                      : 'Enter your details below to locate your membership record and check renewal status.'}{' '}
                    <button 
                      onClick={toggleOrganizationMembership}
                      className="text-orange-600 font-medium hover:underline focus:outline-none"
                    >
                      {isOrganization ? '← Renew Individual Membership' : 'Renew Organization Membership →'}
                    </button>
                  </p>
                </div>

                <form className="space-y-4">
                  {isOrganization ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Organization Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="organizationName"
                          value={organizationSearchData.organizationName}
                          onChange={handleInputChange}
                          placeholder="Enter organization name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Organization Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="organizationEmail"
                          value={organizationSearchData.organizationEmail}
                          onChange={handleInputChange}
                          placeholder="Enter organization email"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Organization Phone
                        </label>
                        <input
                          type="tel"
                          name="organizationPhone"
                          value={organizationSearchData.organizationPhone}
                          onChange={handleInputChange}
                          placeholder="Enter organization phone"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}

                  {searchError && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <p className="text-red-600 text-sm">{searchError}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    onClick={handleFindRecord}
                    disabled={isSearching}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSearching ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Searching...
                      </span>
                    ) : (
                      `Find ${isOrganization ? 'Organization' : 'My'} Record`
                    )}
                  </button>
                </form>

                {/* Help Section */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-2">Need Help?</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {isOrganization ? (
                      <>
                        <li>• Use the email address your organization registered with</li>
                        <li>• Ensure the organization name matches your membership record</li>
                        <li>• Contact support if you can't find your organization's record</li>
                      </>
                    ) : (
                      <>
                        <li>• Use the email address you registered with</li>
                        <li>• Ensure your name matches your membership record</li>
                        <li>• Contact support if you can't find your record</li>
                      </>
                    )}
                  </ul>
                  <a href="/contact" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
                    Contact Support →
                  </a>
                </div>
              </div>
            </div>

            {/* Right Side - Membership Record & Renewal */}
            <div className="lg:col-span-3">
              {!membershipRecord ? (
                <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {isOrganization ? 'Find Your Organization Membership Record' : 'Find Your Membership Record'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {isOrganization
                      ? 'Enter your organization details in the search form to locate your ACNA membership record and check your renewal status.'
                      : 'Enter your details in the search form to locate your ACNA membership record and check your renewal status.'}
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">What you'll see:</h4>
                    <ul className="text-blue-800 text-sm space-y-1 text-left">
                      <li>• Your current membership status</li>
                      <li>• Membership expiry date</li>
                      <li>• Renewal fee amount</li>
                      <li>• Quick renewal options</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Membership Record Display */}
                  <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="bg-orange-600 text-white p-6">
                      <h2 className="text-2xl font-bold mb-2 flex items-center">
                        <span className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                          ✓
                        </span>
                        {isOrganization ? 'Organization Membership Record Found' : 'Membership Record Found'}
                      </h2>
                      <p className="text-white-300">Member ID: {membershipRecord.id}</p>
                    </div>

                    <div className="p-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-4">
                            {isOrganization ? 'Organization Information' : 'Personal Information'}
                          </h3>
                          <div className="space-y-3">
                            {isOrganization ? (
                              <>
                                <div>
                                  <span className="text-sm text-gray-500">Organization Name:</span>
                                  <p className="font-medium">{(membershipRecord as OrganizationMembershipRecord).organizationName}</p>
                                </div>
                                <div>
                                  <span className="text-sm text-gray-500">Organization Email:</span>
                                  <p className="font-medium">{(membershipRecord as OrganizationMembershipRecord).organizationEmail}</p>
                                </div>
                                <div>
                                  <span className="text-sm text-gray-500">Organization Phone:</span>
                                  <p className="font-medium">{(membershipRecord as OrganizationMembershipRecord).organizationPhone}</p>
                                </div>
                              </>
                            ) : (
                              <>
                                <div>
                                  <span className="text-sm text-gray-500">Name:</span>
                                  <p className="font-medium">{(membershipRecord as MembershipRecord).firstName} {(membershipRecord as MembershipRecord).lastName}</p>
                                </div>
                                <div>
                                  <span className="text-sm text-gray-500">Email:</span>
                                  <p className="font-medium">{(membershipRecord as MembershipRecord).email}</p>
                                </div>
                                <div>
                                  <span className="text-sm text-gray-500">Phone:</span>
                                  <p className="font-medium">{(membershipRecord as MembershipRecord).phone}</p>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold text-gray-900 mb-4">Membership Information</h3>
                          <div className="space-y-3">
                            <div>
                              <span className="text-sm text-gray-500">Membership Type:</span>
                              <p className="font-medium">{membershipRecord.membershipType}</p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-500">Status:</span>
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(membershipRecord.membershipStatus)}`}>
                                {membershipRecord.membershipStatus}
                              </span>
                            </div>
                            <div>
                              <span className="text-sm text-gray-500">Member Since:</span>
                              <p className="font-medium">{new Date(membershipRecord.joinDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-500">Expires:</span>
                              <p className="font-medium text-red-600">{new Date(membershipRecord.expiryDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Renewal Section */}
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                      <span className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                        2
                      </span>
                      Renew Your {isOrganization ? 'Organization ' : ''}Membership
                    </h3>

                    {membershipRecord.membershipStatus === 'Expired' && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center">
                          <span className="text-red-600 text-xl mr-3">⚠️</span>
                          <div>
                            <h4 className="font-medium text-red-900">Membership Expired</h4>
                            <p className="text-red-700 text-sm">Your membership expired on {new Date(membershipRecord.expiryDate).toLocaleDateString()}. Renew now to restore access to all benefits.</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {membershipRecord.membershipStatus === 'Expiring Soon' && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center">
                          <span className="text-yellow-600 text-xl mr-3">⏰</span>
                          <div>
                            <h4 className="font-medium text-yellow-900">Membership Expiring Soon</h4>
                            <p className="text-yellow-700 text-sm">Your membership expires on {new Date(membershipRecord.expiryDate).toLocaleDateString()}. Renew now to avoid interruption.</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">Renewal Fee</h4>
                          <p className="text-gray-600">12 months from renewal date</p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-orange-600">{membershipRecord.renewalFee}</p>
                          <p className="text-sm text-gray-500">per year</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <button
                        onClick={handleRenewMembership}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition-colors duration-300 text-lg"
                      >
                        🔄 Renew {isOrganization ? 'Organization ' : ''}Membership - {membershipRecord.renewalFee}
                      </button>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-2">Renewal Benefits:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {isOrganization ? (
                          <>
                            <li>✓ Institutional access to exclusive resources</li>
                            <li>✓ Multiple staff member access</li>
                            <li>✓ Conference and event discounts for your team</li>
                            <li>✓ Organization listing in member directory</li>
                            <li>✓ Research collaboration opportunities</li>
                          </>
                        ) : (
                          <>
                            <li>✓ Continued access to exclusive resources</li>
                            <li>✓ Conference and event discounts</li>
                            <li>✓ Professional networking opportunities</li>
                            <li>✓ Research collaboration access</li>
                            <li>✓ Monthly newsletters and updates</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Alternative Options Section */}
      <section className="py-16 bg-orange-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">
            {isOrganization ? 'Organization Membership Questions?' : 'Can\'t Find Your Record?'}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-blue-50 rounded p-6 border border-blue-200">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Contact Support</h3>
              <p className="text-gray-600 mb-4">Our team can help locate your membership record</p>
              <a href="/contact" className="text-orange-600 font-medium hover:underline">
                Get Help →
              </a>
            </div>
            
            <div className="bg-blue-50 rounded p-6 border border-blue-200">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {isOrganization ? 'New Organization Member?' : 'New Member?'}
              </h3>
              <p className="text-gray-600 mb-4">
                {isOrganization ? 'Join ACNA as an organization' : 'Join ACNA and start your membership journey'}
              </p>
              <a href="/register" className="text-orange-600 font-medium hover:underline">
                Join Now →
              </a>
            </div>
            
            <div className="bg-blue-50 rounded p-6 border border-blue-200">
              <h3 className="text-xl font-bold text-gray-900 mb-2">View Benefits</h3>
              <p className="text-gray-600 mb-4">Learn about membership types and benefits</p>
              <a 
                href={isOrganization ? "/organization-membership" : "/membership-categories"} 
                className="text-orange-600 font-medium hover:underline"
              >
                Learn More →
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MembershipRenew;