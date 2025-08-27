import { useState, useEffect } from 'react';
import { User, Camera, X } from 'lucide-react';
import Chats from '../../membershippages/portal/communications/Chats'; 
import MessagingModal from '../../membershippages/portal/communications/MessagingModal';
import api from '../../../services/api';
import defaultProfileImage from '../../../assets/default Profile Image.png';
import AlertModal from '../../../components/common/AlertModal';

interface MemberData {
  id: number;
  name: string;
  email: string;
  membershipStatus: string;
  membership_class: string;
  membership_valid_until: string;
  membership_id: string;
  institution?: string;
  specialization?: string;
  member_since: string;
  profile_photo?: string;
  about?: string;
  cpdProgress?: {
    enrolledCourses: number;
    completedHours: number;
    requiredHours: number;
    certificationsEarned: number;
  };
}

interface Message {
  id: number;
  sender: string;
  preview: string;
  time: string;
  unread: boolean;
  profile_photo?: string;
}

const ProfileTabContent = ({ memberData, onProfileUpdate }: { 
  memberData: MemberData;
  onProfileUpdate: (updatedData: Partial<MemberData>) => void;
}) => {
  const [activeSection, setActiveSection] = useState('about');
  const [aboutText, setAboutText] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedChat, setSelectedChat] = useState<{name: string, profile_photo?: string} | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'info' | 'success' | 'warning' | 'error'>('info');

  // Form state for profile editing
  const [formData, setFormData] = useState({
    firstName: memberData.name.split(' ')[0] || '',
    lastName: memberData.name.split(' ').slice(1).join(' ') || '',
    institution: memberData.institution || '',
    specialization: memberData.specialization || '',
    profilePhoto: null as File | null,
    previewUrl: memberData.profile_photo || defaultProfileImage
  });

  useEffect(() => {
    // Initialize about text if available
    if (memberData.about) {
      setAboutText(memberData.about);
    }
  }, [memberData]);

  const handleSelectChat = (message: Message) => {
    setSelectedChat({
      name: message.sender,
      profile_photo: message.profile_photo
    });
  };

  const handleCloseModal = () => {
    setSelectedChat(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({
        ...formData,
        profilePhoto: file,
        previewUrl: URL.createObjectURL(file)
      });
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
  
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('first_name', formData.firstName);
      formDataToSend.append('last_name', formData.lastName);
      
      // Include specialization in the update - this was missing!
      if (formData.specialization) {
        formDataToSend.append('specialization', formData.specialization);
      }
      
      // Only append institution if it exists
      if (formData.institution) {
        formDataToSend.append('institution', formData.institution);
      }
      
      if (formData.profilePhoto) {
        formDataToSend.append('profile_photo', formData.profilePhoto);
      }
  
      console.log("Sending form data:", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        institution: formData.institution,
        specialization: formData.specialization, // Add this to debug log
        hasProfilePhoto: !!formData.profilePhoto
      });
  
      const response = await api.put('/users/profile/', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      // Update local state with all fields including specialization
      const updatedData = {
        name: `${formData.firstName} ${formData.lastName}`,
        institution: formData.institution,
        specialization: formData.specialization, // Make sure this is included
        profile_photo: response.data.profile_photo || memberData.profile_photo
      };
      onProfileUpdate(updatedData);
      
      setIsProfileModalOpen(false);
    } catch (err: any) {
      console.error('Full profile update error:', err);
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
      
      // Log detailed error information
      if (err.response) {
        console.error('Error response data:', err.response.data);
        console.error('Error status:', err.response.status);
        console.error('Error headers:', err.response.headers);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
  
    try {
      const response = await api.post('/users/change-password/', {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword
      });
  
      // Show success modal
      setAlertTitle('Success');
      setAlertMessage('Password changed successfully!');
      setAlertType('success');
      setIsAlertOpen(true);
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAboutUpdate = async () => {
    try {
      const response = await api.post('/users/update-about/', {
        about_text: aboutText
      });
      setIsAboutModalOpen(false);
    } catch (err) {
      console.error('Failed to update about text:', err);
    }
  };

  const getProfileImageUrl = (url: string | undefined) => {
    if (!url) return defaultProfileImage;
    
    if (url.startsWith('http')) return url;
    
    const backendBaseUrl = process.env.REACT_APP_BACKEND_URL;
    return `${backendBaseUrl}${url}`;
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 min-h-screen bg-gray-50 p-4">
      {/* Main Content */}
      <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
        {/* Profile Header */}
        <div className="border-b border-gray-200 pb-6">
          <div className="flex justify-between items-start">
            {/* Profile Image */}
            <div className="flex-shrink-0 mr-6">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              <img 
                src={getProfileImageUrl(memberData.profile_photo)} 
                alt="Profile"
                className="w-full h-full object-cover"
              />
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{memberData.name}</h1>
                {memberData.specialization && (
                  <p className="text-blue-600 text-sm font-medium mt-1">
                    {memberData.specialization}</p>
                )}
                {memberData.institution && (
                  <p className="text-gray-500 text-sm mt-2">{memberData.institution}</p>
                )}
              </div>
              <button 
                onClick={() => setIsProfileModalOpen(true)}
                className="text-gray-500 hover:text-gray-700 p-2"
                aria-label="Edit profile"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Member Status Table */}
          <div className="mt-6 bg-blue-50 p-4 rounded-lg">
            <table className="w-full text-xs md:text-sm">
              <tbody>
                <tr className="border-b">
                  <td className="py-2 text-gray-600">Status:</td>
                  <td className="py-2">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                      {memberData.membershipStatus || 'Active'}
                    </span>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 text-gray-600">Membership Tier:</td>
                  <td className="py-2 font-medium">{memberData.membership_class || 'Member'}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 text-gray-600">Member ID:</td>
                  <td className="py-2 font-medium">{memberData.membership_id || 'Not assigned'}</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-600">Member Since:</td>
                  <td className="py-2">{memberData.member_since}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 mt-4">
          <button
            onClick={() => setActiveSection('about')}
            className={`px-4 py-3 font-medium ${activeSection === 'about' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
          >
            About
          </button>
          <button
            onClick={() => setActiveSection('account')}
            className={`px-4 py-3 font-medium ${activeSection === 'account' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Account Settings
          </button>
        </div>

        {/* About Section */}
        {activeSection === 'about' && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">About</h2>
              <button 
                onClick={() => setIsAboutModalOpen(true)}
                className="text-gray-500 hover:text-gray-700 p-2"
                aria-label="Edit about section"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            </div>
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <p className="text-gray-700 whitespace-pre-line">
                {aboutText || "No information provided yet."}
              </p>
            </div>
          </div>
        )}

        {/* Account Settings Section */}
        {activeSection === 'account' && (
          <div className="mt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Change Password</h2>
            {error && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 text-sm rounded">
                {error}
              </div>
            )}
            <form onSubmit={handlePasswordChange} className="max-w-md space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Right Sidebar - Chats Component */}
      <Chats onSelectChat={handleSelectChat} />

      {/* Profile Edit Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-lg font-bold">Edit Profile</h3>
              <button 
                onClick={() => setIsProfileModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
                disabled={isLoading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-4 bg-red-100 text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleProfileUpdate} className="p-4 space-y-4">
              <div className="flex flex-col items-center">
                <div className="relative w-24 h-24 rounded-full bg-gray-200 mb-4 overflow-hidden">
                  <img 
                    src={formData.previewUrl} 
                    alt="Profile preview" 
                    className="w-full h-full object-cover"
                  />
                  <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow cursor-pointer">
                    <Camera className="w-4 h-4" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specialization
                  </label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your medical specialization"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Institution
                  </label>
                  <input
                    type="text"
                    name="institution"
                    value={formData.institution}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* About Edit Modal */}
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

            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                You can write about your years of experience, industry, or skills. People also talk about their achievements or previous job experiences.
              </p>
              
              <textarea
                value={aboutText}
                onChange={(e) => setAboutText(e.target.value)}
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tell us about yourself..."
              />

              <div className="flex justify-end pt-4">
                <button 
                  type="button"
                  onClick={() => setIsAboutModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 mr-2"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={handleAboutUpdate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messaging Modal */}
      {selectedChat && (
        <MessagingModal 
          member={{
            firstName: selectedChat.name.split(' ')[0],
            lastName: selectedChat.name.split(' ').slice(1).join(' '),
            profession: "Member",
            profileImage: selectedChat.profile_photo 
          }} 
          onClose={handleCloseModal}
        />
      )}
      {/* Alert Modal */}
      <AlertModal
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
      />
      
    </div>
  );
};

export default ProfileTabContent;