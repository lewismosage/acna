import { useState } from 'react';
import { X, Mail, MapPin, Building } from 'lucide-react';
import defaultProfileImage from '../../../../assets/default Profile Image.png';

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  mobile_number: string;
  country: string;
  membership_class: string;
  institution?: string;
  specialization?: string;
  is_active_member: boolean;
  membership_valid_until?: string;
  profile_photo?: string;
}

interface ViewProfileProps {
  member: Member;
  onClose: () => void;
  onMessage: () => void;
}

const ViewProfile = ({ member, onClose, onMessage }: ViewProfileProps) => {
  const [activeSection, setActiveSection] = useState('about');
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [aboutText, setAboutText] = useState(
    "This member hasn't added any information about themselves yet."
  );

  // Helper function to get member status
  const getMemberStatus = (): 'Active' | 'Expired' | 'Expiring Soon' => {
    if (!member.is_active_member) return 'Expired';
    
    if (member.membership_valid_until) {
      const expiryDate = new Date(member.membership_valid_until);
      const today = new Date();
      const oneMonthFromNow = new Date();
      oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
      
      if (expiryDate < today) return 'Expired';
      if (expiryDate < oneMonthFromNow) return 'Expiring Soon';
    }
    
    return 'Active';
  };

  const status = getMemberStatus();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 p-6 flex justify-between items-start">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <img
                src={member.profile_photo || defaultProfileImage}
                alt={`${member.first_name} ${member.last_name}`}
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {member.first_name} {member.last_name}
              </h2>
              <p className="text-blue-600 font-medium">{member.specialization}</p>
              <p className="text-gray-600 mt-1">{member.institution}</p>
              
              <div className="mt-4 flex gap-2">
                <button 
                  onClick={onMessage}
                  className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700"
                >
                  Message
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          <button
            onClick={() => setActiveSection('about')}
            className={`px-4 py-3 font-medium ${activeSection === 'about' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
          >
            About
          </button>
          <button
            onClick={() => setActiveSection('details')}
            className={`px-4 py-3 font-medium ${activeSection === 'details' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Details
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* About Section */}
          {activeSection === 'about' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">About</h3>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-gray-700 whitespace-pre-line">{aboutText}</p>
              </div>
            </div>
          )}

          {/* Details Section */}
          {activeSection === 'details' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Professional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    {member.institution && (
                      <div className="flex items-center">
                        <Building className="w-5 h-5 mr-2 text-gray-400" />
                        <span className="text-gray-700">{member.institution}</span>
                      </div>
                    )}
                    {member.specialization && (
                      <div className="flex items-center">
                        <span className="w-5 h-5 mr-2 text-gray-400">•</span>
                        <span className="text-gray-700">{member.specialization}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="w-5 h-5 mr-2 text-gray-400">•</span>
                      <span className="text-gray-700">{member.membership_class}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-5 h-5 mr-2 text-gray-400">•</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : status === 'Expired' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Mail className="w-5 h-5 mr-2 text-gray-400" />
                      <span className="text-gray-700">{member.email}</span>
                    </div>
                    {member.mobile_number && (
                      <div className="flex items-center">
                        <span className="w-5 h-5 mr-2 text-gray-400">•</span>
                        <span className="text-gray-700">{member.mobile_number}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-gray-400" />
                      <span className="text-gray-700">
                        {member.country}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* About Edit Modal (only shown if member is viewing their own profile) */}
        {isAboutModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Edit About</h3>
                <button 
                  onClick={() => setIsAboutModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <textarea
                value={aboutText}
                onChange={(e) => setAboutText(e.target.value)}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-end pt-4">
                <button 
                  onClick={() => setIsAboutModalOpen(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewProfile;