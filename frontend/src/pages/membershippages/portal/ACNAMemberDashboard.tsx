import { useState } from 'react';
import { 
  User, BookOpen, Award, MessageSquare, FileText, Calendar, LogOut,
  Home, Edit3, Upload, Users, Clock, CheckCircle, AlertCircle, Search, Menu, X
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import CoursesTabContent from './CoursesTabContent';
import WorkshopTapContent from './WorkshopTabContent';
import DirectoryTabContent from './DirectoryTabContent';
import ProfileTabContent from './ProfileTabContent';
import ELearningDashboard from './ELearningDashboard';
import ForumComponent from './forums/ForumComponent';
import { SignOutModal } from './SignOutModal'
import ScrollToTop from '../../../components/common/ScrollToTop';
import defaultProfileImage from '../../../assets/default Profile Image.png';
import { useAuth } from '../../../services/AuthContext';

interface LocationState {
  activeTab?: string;
}

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
  cpdProgress?: {
    enrolledCourses: number;
    completedHours: number;
    requiredHours: number;
    certificationsEarned: number;
  };
}

const getProfileImageUrl = (url: string | undefined) => {
  if (!url) return defaultProfileImage;
  
  if (url.startsWith('http')) return url;
  
  const backendBaseUrl = process.env.REACT_APP_BACKEND_URL;
  return `${backendBaseUrl}${url}`;
};

// Component for Member Info Panel
const MemberInfoPanel = ({ memberData }: { memberData: MemberData }) => (
  <div className="bg-white border border-gray-300 rounded-lg">
    <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
      <h2 className="font-semibold text-gray-800">Member Information</h2>
    </div>
    <div className="p-4">
      <div className="flex items-center mb-4">
      <img
          src={getProfileImageUrl(memberData.profile_photo)}
          alt="Profile"
          className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-gray-300 mr-3 md:mr-4"
        />
        <div>
          <h3 className="font-semibold text-base md:text-lg">{memberData.name}</h3>
          {memberData.institution && (
            <p className="text-xs md:text-sm text-gray-600">{memberData.institution}</p>
          )}
        </div>
      </div>
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
            <td className="py-2 text-gray-600">Tier:</td>
            <td className="py-2 font-medium">{memberData.membership_class || 'Member'}</td>
          </tr>
          <tr className="border-b">
            <td className="py-2 text-gray-600">Member ID:</td>
            <td className="py-2 font-medium">{memberData.membership_id}</td>
          </tr>
          <tr>
            <td className="py-2 text-gray-600">Member Since:</td>
            <td className="py-2">
              {memberData.member_since || new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
              })}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

// Component for CPD Progress Panel
const CpdProgressPanel = ({ memberData }: { memberData: MemberData }) => {
  const cpdData = memberData.cpdProgress || {
    enrolledCourses: 0,
    completedHours: 0,
    requiredHours: 60, // Default required hours
    certificationsEarned: 0
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg">
      <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
        <h2 className="font-semibold text-gray-800">CPD Progress</h2>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 md:gap-4 mb-3 md:mb-4">
          <div className="text-center">
            <div className="text-xl md:text-2xl font-bold text-blue-600">{cpdData.completedHours}</div>
            <div className="text-xs text-gray-600">Hours Completed</div>
          </div>
          <div className="text-center">
            <div className="text-xl md:text-2xl font-bold text-orange-600">{cpdData.requiredHours}</div>
            <div className="text-xs text-gray-600">Required Hours</div>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-3 md:mb-4">
          <div 
            className="bg-blue-600 h-2 rounded-full" 
            style={{ width: `${Math.min(100, (cpdData.completedHours / cpdData.requiredHours) * 100)}%` }}
          />
        </div>
        <table className="w-full text-xs md:text-sm">
          <tbody>
            <tr className="border-b">
              <td className="py-2 text-gray-600">Enrolled Courses:</td>
              <td className="py-2 font-medium">{cpdData.enrolledCourses}</td>
            </tr>
            <tr>
              <td className="py-2 text-gray-600">Certifications:</td>
              <td className="py-2 font-medium">{cpdData.certificationsEarned}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Component for Quick Actions Panel
const QuickActionsPanel = () => (
  <div className="bg-white border border-gray-300 rounded-lg">
    <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
      <h2 className="font-semibold text-gray-800">Quick Actions</h2>
    </div>
    <div className="p-3 md:p-4 space-y-2 md:space-y-3">
      {[
        { icon: Edit3, label: 'Edit Profile', color: 'blue' },
        { icon: FileText, label: 'Training Programs', color: 'green' },
        { icon: MessageSquare, label: 'Join Discussion Forum', color: 'purple' },
        { icon: Users, label: 'View Member Directory', color: 'orange' },
        { icon: FileText, label: 'Request Collaboration Support', color: 'green' },
      ].map(({ icon: Icon, label, color }, index) => (
        <button
          key={index}
          className={`w-full flex items-center px-3 py-2 text-xs md:text-sm bg-${color}-50 hover:bg-${color}-100 border border-${color}-200 rounded transition-colors text-left`}
        >
          <Icon className={`w-3 h-3 md:w-4 md:h-4 mr-2 md:mr-3 text-${color}-600`} />
          <span className={`text-${color}-700 font-medium`}>{label}</span>
        </button>
      ))}
    </div>
  </div>
);

// Tab Content Components
const HomeTabContent = () => {
  const upcomingCourses = [
    {
      title: "Advanced Epilepsy Management",
      date: "August 15, 2025",
      duration: "4 hours",
      status: "enrolled"
    },
    {
      title: "Pediatric Stroke Recognition",
      date: "September 2, 2025",
      duration: "3 hours",
      status: "available"
    }
  ];

  const recentActivity = [
    { action: "Completed", item: "Cerebral Palsy Workshop", date: "July 20, 2025" },
    { action: "Downloaded", item: "CPD Certificate", date: "July 18, 2025" }
  ];

  return (
    <>
      <div className="bg-white border border-gray-300 rounded-lg">
        <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
          <h2 className="font-semibold text-gray-800">Training Highlights</h2>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {upcomingCourses.map((course, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                <div className="flex-1">
                  <h4 className="font-medium text-sm md:text-base text-gray-900">{course.title}</h4>
                  <div className="flex items-center text-xs md:text-sm text-gray-600 mt-1">
                    <Calendar className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                    {course.date}
                    <Clock className="w-3 h-3 md:w-4 md:h-4 ml-2 md:ml-3 mr-1" />
                    {course.duration}
                  </div>
                </div>
                <div className="ml-2">
                  {course.status === 'enrolled' ? (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                      Enrolled
                    </span>
                  ) : (
                    <button className="bg-orange-600 text-white px-2 py-1 rounded text-xs font-medium hover:bg-orange-700">
                      Enroll
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <button className="bg-blue-600 text-white px-4 py-2 text-sm md:text-base rounded font-medium hover:bg-blue-700">
              View All Training Programs
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-300 rounded-lg">
        <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
          <h2 className="font-semibold text-gray-800">Research & Case Submission</h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 md:p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
              <Upload className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 text-gray-400" />
              <h4 className="font-medium text-sm md:text-base text-gray-900 mb-1">Upload Research Paper</h4>
              <p className="text-xs md:text-sm text-gray-600">Submit your research for peer review</p>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 md:p-6 text-center hover:border-green-400 transition-colors cursor-pointer">
              <FileText className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 text-gray-400" />
              <h4 className="font-medium text-sm md:text-base text-gray-900 mb-1">Submit Case Report</h4>
              <p className="text-xs md:text-sm text-gray-600">Share interesting clinical cases</p>
            </div>
          </div>
          <div className="mt-3 md:mt-4 p-2 md:p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-xs md:text-sm text-blue-800">
              <AlertCircle className="w-3 h-3 md:w-4 md:h-4 inline mr-1" />
              Submissions are reviewed within 2-3 weeks. Check your email for updates.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-300 rounded-lg">
        <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
          <h2 className="font-semibold text-gray-800">Recent Activity</h2>
        </div>
        <div className="p-4">
          <div className="space-y-2 md:space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center p-2 md:p-3 border-l-4 border-blue-400 bg-blue-50">
                <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600 mr-2 md:mr-3" />
                <div className="flex-1">
                  <p className="text-xs md:text-sm">
                    <span className="font-medium">{activity.action}</span> {activity.item}
                  </p>
                  <p className="text-xs text-gray-600">{activity.date}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 md:mt-4 text-center">
            <button className="text-blue-600 hover:text-blue-800 font-medium text-xs md:text-sm">
              View All Activity →
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const ACNAMemberDashboard = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState((location.state as LocationState)?.activeTab || 'home');
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const { user, logout } = useAuth();
  const handleProfileUpdate = (updatedData: Partial<MemberData>) => {
    setMemberData((prev: MemberData) => ({
      ...prev,
      ...updatedData
    }));
  };

  const [memberData, setMemberData] = useState<MemberData>({
    id: user?.id || 0,
    name: user?.name || 'Member',
    email: user?.email || '',
    membershipStatus: user?.is_active_member ? 'Active' : 'Inactive',
    membership_class: user?.membership_class || 'Member',
    membership_valid_until: user?.membership_valid_until || '',
    membership_id: user?.membership_id || '',
    institution: user?.institution || '',
    specialization: user?.specialization || '',
    member_since: user?.member_since || '',
    profile_photo: user?.profile_photo || '',
    cpdProgress: {
      enrolledCourses: 3,
      completedHours: 45,
      requiredHours: 60,
      certificationsEarned: 2
    }
  });


  // Tab navigation items (excluding signout since we're using a modal now)
  const tabs = [
    { id: 'home', label: 'HOME', icon: Home },
    { id: 'profile', label: 'PROFILE', icon: User },
    { id: 'courses', label: 'TRAINING PROGRAMS', icon: BookOpen },
    { id: 'training', label: 'E-LEARNING', icon: BookOpen },
    { id: 'workshop', label: 'WORKSHOP', icon: Award },
    { id: 'forum', label: 'FORUM', icon: MessageSquare },
    { id: 'directory', label: 'MEMBERS DIRECTORY', icon: Users }
  ];

  // Tab content components
  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeTabContent />;
      case 'profile':
        return <ProfileTabContent 
        memberData={memberData} 
        onProfileUpdate={handleProfileUpdate} 
      />
      case 'courses':
        return <CoursesTabContent />;
      case 'training':
        return <ELearningDashboard />;
      case 'workshop':
        return <WorkshopTapContent />;
      case 'forum':
        return <ForumComponent />;
      case 'directory':
        return <DirectoryTabContent />;
      default:
        return <HomeTabContent />;
    }
  };

  const handleTabClick = (id: string) => {
    setActiveTab(id);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <ScrollToTop />
      {/* Sign Out Modal */}
      <SignOutModal 
        isOpen={showSignOutModal} 
        onClose={() => setShowSignOutModal(false)} 
      />

      {/* Mobile Header - Always visible on mobile */}
      <div className="md:hidden bg-blue-800 text-white p-3 flex items-center justify-between">
        <button 
          onClick={() => setShowMobileSidebar(!showMobileSidebar)}
          className="p-2 rounded-full hover:bg-blue-700"
        >
          {showMobileSidebar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <h1 className="text-lg font-semibold">Member Portal</h1>
        <div className="w-8"></div> {/* Spacer for balance */}
      </div>

      {/* Mobile Sidebar - Only visible when toggled */}
      <div className={`md:hidden fixed inset-y-0 left-0 w-64 bg-blue-800 text-white transform z-40 transition-transform duration-300 ease-in-out ${
        showMobileSidebar ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-blue-700">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-800 font-bold text-sm">ACNA</span>
              </div>
              <h1 className="text-lg font-semibold">Member Portal</h1>
            </div>
          </div>
          
          <nav className="flex-1 overflow-y-auto">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  handleTabClick(id);
                  setShowMobileSidebar(false);
                }}
                className={`w-full text-left px-4 py-3 flex items-center ${
                  activeTab === id ? 'bg-blue-700' : 'hover:bg-blue-700'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span>{label}</span>
              </button>
            ))}
            {/* Sign Out Button */}
            <button
              onClick={() => {
                setShowSignOutModal(true);
                setShowMobileSidebar(false);
              }}
              className="w-full text-left px-4 py-3 flex items-center hover:bg-blue-700"
            >
              <LogOut className="w-5 h-5 mr-3" />
              <span>SIGN OUT</span>
            </button>
          </nav>
          
          {/* Return to Home link at bottom */}
          <div className="p-4 border-t border-blue-700">
            <Link
              to='/'
              className="flex items-center text-sm hover:text-blue-200"
              onClick={() => {
                setActiveTab('home');
                setShowMobileSidebar(false);
              }}
            >
              <Home className="w-4 h-4 mr-2" / >
              Return to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Overlay when mobile sidebar is open */}
      {showMobileSidebar && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}

      {/* Main Content */}
      <div className="md:ml-0 transition-all duration-300">
        {/* Desktop Header Section */}
        <div className="bg-white border-b-2 border-gray-200 hidden md:block">
          <div className="bg-blue-800 text-white px-4 py-3 md:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link 
                  to="/" 
                  className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center mr-3 md:mr-4 hover:bg-gray-100 transition-colors duration-200"
                  title="Back to Home"
                >
                  <ArrowLeftIcon className="w-5 h-5 text-blue-800" />
                </Link>
                <h1 className="text-lg md:text-xl font-semibold">African Child Neurology Association - Member Portal</h1>
              </div>
              <div className="hidden md:flex items-center bg-white rounded-lg overflow-hidden shadow max-w-xs">
                <input
                  type="text"
                  placeholder="Search..."
                  className="px-3 py-1 w-full text-sm text-gray-700 focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 flex items-center"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Bar */}
          <div className="bg-blue-700 overflow-x-auto">
            <nav className="px-4 md:px-6">
              <div className="flex space-x-0 min-w-max">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => handleTabClick(id)}
                    className={`px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm font-medium border-r border-blue-600 last:border-r-0 hover:bg-blue-600 transition-colors whitespace-nowrap ${
                      activeTab === id ? 'bg-blue-600 text-white' : 'text-blue-100'
                    }`}
                  >
                    <span className="hidden md:inline">{label}</span>
                    <span className="md:hidden">
                      <Icon className="w-4 h-4 mx-auto" />
                    </span>
                  </button>
                ))}
                {/* Sign Out Button */}
                <button
                  onClick={() => setShowSignOutModal(true)}
                  className="px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm font-medium border-r border-blue-600 last:border-r-0 hover:bg-blue-600 transition-colors whitespace-nowrap text-blue-100"
                >
                  <span className="hidden md:inline">SIGN OUT</span>
                  <span className="md:hidden">
                    <LogOut className="w-4 h-4 mx-auto" />
                  </span>
                </button>
              </div>
            </nav>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="max-w-7xl mx-auto px-4 py-4 md:px-6 md:py-6">
          {activeTab === 'home' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Left Column - Member Info & Quick Actions */}
              <div className="lg:col-span-1 space-y-4 md:space-y-6">
                <MemberInfoPanel memberData={memberData} />
                <CpdProgressPanel memberData={memberData} />
                <QuickActionsPanel />
              </div>

              {/* Right Column - Dynamic Content Based on Active Tab */}
              <div className="lg:col-span-2 space-y-4 md:space-y-6">
                {renderTabContent()}
              </div>
            </div>
          ) : (
            <div className="space-y-4 md:space-y-6">
              {renderTabContent()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ACNAMemberDashboard;