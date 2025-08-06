import { useState } from 'react';
import { 
  User, Search, Bell,
} from 'lucide-react';
import Chats from '../../membershippages/portal/communications/Chats'; 
import MessagingModal from '../../membershippages/portal/communications/MessagingModal'

interface MemberData {
  name: string;
  membershipStatus: string;
  tier: string;
  institution: string;
  memberSince: string;
  profilePhoto: string;
  cpdProgress: {
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
  profilePhoto?: string; 
}

const ProfileTabContent = ({ memberData }: { memberData: MemberData }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('about');
  const [aboutText, setAboutText] = useState(
    "Hello, I'm a passionate Full Stack Software Engineer, with over 4 years of hands-on experience building scalable, user-centric applications. I specialize in full-stack development with a focus on backend development, cloud infrastructure, and developing end-to-end digital solutions that solve real-world problems, especially in health tech, education, and social impact sectors."
  );
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedChat, setSelectedChat] = useState<{name: string, profilePhoto?: string} | null>(null);

  const handleSelectChat = (message: Message) => {
    setSelectedChat({
      name: message.sender,
      profilePhoto: message.profilePhoto
    });
  };

  const handleCloseModal = () => {
    setSelectedChat(null);
  };

  const messages: Message[] = [
    {
      id: 1,
      sender: "Lydia Muchiri",
      preview: "You: Got it! Thanks..",
      time: "11:50 AM",
      unread: false
    },
    {
      id: 2,
      sender: "Prof. Dr. David Costa",
      preview: "Sponsored Your Cybersecurity MSc Awards - Start Anytime",
      time: "10:30 AM",
      unread: true
    },
    {
      id: 3,
      sender: "CYFRA'S TECHNOLOGIE...",
      preview: "You: Hello...",
      time: "Yesterday",
      unread: false
    },
    {
      id: 4,
      sender: "Emmanuel Nyakundi",
      preview: "Emmanuel: Hello ...",
      time: "Yesterday",
      unread: false
    },
    {
      id: 5,
      sender: "Colina Gibson",
      preview: "Colina: Hello...",
      time: "2 days ago",
      unread: false
    }
  ];

  

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    // Add password change logic here
    alert('Password changed successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 min-h-screen bg-gray-50 p-4">
      {/* Main Content */}
      <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
        {/* Profile Header */}
        <div className="border-b border-gray-200 pb-6">
          <div className="flex justify-between items-start">
            {/* Image placeholder on the left */}
            <div className="flex-shrink-0 mr-6">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {memberData.profilePhoto ? (
                  <img 
                    src={memberData.profilePhoto} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-gray-400" />
                )}
              </div>
            </div>

            {/* Name and details on the right with edit button */}
            <div className="flex-1 flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{memberData.name}</h1>
                <p className="text-blue-600 text-sm font-medium mt-1">{memberData.tier}</p>
                <div className="flex text-gray-500 text-sm mt-2">
                  <span>{memberData.institution}</span>
                </div>
              </div>
              <button 
                className="text-gray-500 hover:text-gray-700 p-2"
                onClick={() => setIsEditModalOpen(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Status table */}
          <div className="mt-6 bg-blue-50 p-4 rounded-lg">
            <table className="w-full text-xs md:text-sm">
              <tbody>
                <tr className="border-b">
                  <td className="py-2 text-gray-600">Status:</td>
                  <td className="py-2">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                      {memberData.membershipStatus}
                    </span>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 text-gray-600">Tier:</td>
                  <td className="py-2 font-medium">{memberData.tier}</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-600">Member Since:</td>
                  <td className="py-2">{memberData.memberSince}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Profile Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Edit Info</h3>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Profile Image Upload */}
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mb-2">
                    {memberData.profilePhoto ? (
                      <img 
                        src={memberData.profilePhoto} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  <button className="text-blue-600 text-sm hover:text-blue-800">
                    Change image
                  </button>
                </div>

                {/* Form Fields */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      defaultValue={memberData.name.split(' ')[0]} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      defaultValue={memberData.name.split(' ').slice(1).join(' ')} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                    <input
                      type="text"
                      defaultValue={memberData.institution}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button 
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
          </div>
          <div className="bg-white p-4 rounded-md border border-gray-200">
            <p className="text-gray-700 whitespace-pre-line">{aboutText}</p>
          </div>

            {/* About Edit Modal */}
            {isAboutModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Edit about</h3>
                    <button 
                      onClick={() => setIsAboutModalOpen(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
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
                    />

                    <div className="flex justify-end pt-4">
                      <button 
                        onClick={() => setIsAboutModalOpen(false)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Account Settings Section */}
        {activeSection === 'account' && (
          <div className="mt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Change Password</h2>
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
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Change Password
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Right Sidebar - Now using the Chats component */}
      <Chats onSelectChat={handleSelectChat} />

      {/* Messaging Modal */}
      {selectedChat && (
        <MessagingModal 
          member={{
            firstName: selectedChat.name.split(' ')[0],
            lastName: selectedChat.name.split(' ').slice(1).join(' '),
            profession: "Member",
            profileImage: selectedChat.profilePhoto 
          }} 
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default ProfileTabContent;