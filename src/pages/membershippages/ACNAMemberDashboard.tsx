import React, { useState } from 'react';
import { 
  User, 
  BookOpen, 
  Award, 
  MessageSquare, 
  FileText, 
  Calendar, 
  LogOut,
  Home,
  Edit3,
  Upload,
  Users,
  Download,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const ACNAMemberDashboard = () => {
  const [activeTab, setActiveTab] = useState('home');

  // Mock user data
  const memberData = {
    name: "Dr. Sarah Mwangi",
    membershipStatus: "Active",
    tier: "Professional Member",
    institution: "Kenyatta National Hospital",
    memberSince: "January 2020",
    profilePhoto: "https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=150",
    cpdProgress: {
      enrolledCourses: 3,
      completedHours: 45,
      requiredHours: 60,
      certificationsEarned: 2
    }
  };

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
    },
    {
      title: "Neurodevelopmental Assessment",
      date: "September 20, 2025",
      duration: "6 hours",
      status: "available"
    }
  ];

  const recentActivity = [
    { action: "Completed", item: "Cerebral Palsy Workshop", date: "July 20, 2025" },
    { action: "Downloaded", item: "CPD Certificate", date: "July 18, 2025" },
    { action: "Submitted", item: "Case Study Report", date: "July 15, 2025" }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Section */}
      <div className="bg-white border-b-2 border-gray-200">
        {/* Logo and Title */}
        <div className="bg-blue-800 text-white px-6 py-3">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-4">
              <span className="text-blue-800 font-bold text-lg">ACNA</span>
            </div>
            <h1 className="text-xl font-semibold">African Child Neurology Association - Member Portal</h1>
          </div>
        </div>

        {/* Navigation Bar */}
        <div className="bg-blue-700">
          <nav className="px-6">
            <div className="flex space-x-0">
              {[
                { id: 'home', label: 'HOME', icon: Home },
                { id: 'profile', label: 'PROFILE', icon: User },
                { id: 'courses', label: 'COURSES', icon: BookOpen },
                { id: 'training', label: 'E-LEARNING', icon: BookOpen },
                { id: 'certification', label: 'CERTIFICATION', icon: Award },
                { id: 'forum', label: 'FORUM', icon: MessageSquare },
                { id: 'submit', label: 'SUBMIT CASE/RESEARCH', icon: FileText },
                { id: 'events', label: 'EVENTS', icon: Calendar },
                { id: 'signout', label: 'SIGN OUT', icon: LogOut }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`px-4 py-3 text-sm font-medium border-r border-blue-600 last:border-r-0 hover:bg-blue-600 transition-colors ${
                    activeTab === id ? 'bg-blue-600 text-white' : 'text-blue-100'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </nav>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Member Info & Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Member Status Panel */}
            <div className="bg-white border-2 border-gray-300 rounded">
              <div className="bg-gray-200 px-4 py-2 border-b border-gray-300">
                <h2 className="font-semibold text-gray-800">Member Information</h2>
              </div>
              <div className="p-4">
                <div className="flex items-center mb-4">
                  <img
                    src={memberData.profilePhoto}
                    alt="Profile"
                    className="w-16 h-16 rounded-full border-2 border-gray-300 mr-4"
                  />
                  <div>
                    <h3 className="font-semibold text-lg">{memberData.name}</h3>
                    <p className="text-sm text-gray-600">{memberData.institution}</p>
                  </div>
                </div>
                
                <table className="w-full text-sm">
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

            {/* CPD Progress Panel */}
            <div className="bg-white border-2 border-gray-300 rounded">
              <div className="bg-gray-200 px-4 py-2 border-b border-gray-300">
                <h2 className="font-semibold text-gray-800">CPD Progress</h2>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{memberData.cpdProgress.completedHours}</div>
                    <div className="text-xs text-gray-600">Hours Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{memberData.cpdProgress.requiredHours}</div>
                    <div className="text-xs text-gray-600">Required Hours</div>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(memberData.cpdProgress.completedHours / memberData.cpdProgress.requiredHours) * 100}%` }}
                  ></div>
                </div>
                
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 text-gray-600">Enrolled Courses:</td>
                      <td className="py-2 font-medium">{memberData.cpdProgress.enrolledCourses}</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-gray-600">Certifications:</td>
                      <td className="py-2 font-medium">{memberData.cpdProgress.certificationsEarned}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border-2 border-gray-300 rounded">
              <div className="bg-gray-200 px-4 py-2 border-b border-gray-300">
                <h2 className="font-semibold text-gray-800">Quick Actions</h2>
              </div>
              <div className="p-4 space-y-3">
                {[
                  { icon: Edit3, label: 'Edit Profile', color: 'blue' },
                  { icon: FileText, label: 'Submit Article', color: 'green' },
                  { icon: MessageSquare, label: 'Join Discussion Forum', color: 'purple' },
                  { icon: Users, label: 'View Member Directory', color: 'orange' }
                ].map(({ icon: Icon, label, color }, index) => (
                  <button
                    key={index}
                    className={`w-full flex items-center px-4 py-2 bg-${color}-50 hover:bg-${color}-100 border border-${color}-200 rounded transition-colors text-left`}
                  >
                    <Icon className={`w-4 h-4 mr-3 text-${color}-600`} />
                    <span className={`text-${color}-700 font-medium`}>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Training & Activities */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Training Highlights */}
            <div className="bg-white border-2 border-gray-300 rounded">
              <div className="bg-gray-200 px-4 py-2 border-b border-gray-300">
                <h2 className="font-semibold text-gray-800">Training Highlights</h2>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {upcomingCourses.map((course, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{course.title}</h4>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <Calendar className="w-4 h-4 mr-1" />
                          {course.date}
                          <Clock className="w-4 h-4 ml-3 mr-1" />
                          {course.duration}
                        </div>
                      </div>
                      <div className="ml-4">
                        {course.status === 'enrolled' ? (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                            Enrolled
                          </span>
                        ) : (
                          <button className="bg-orange-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-orange-700">
                            Enroll
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 text-center">
                  <button className="bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-700">
                    View All Training Programs
                  </button>
                </div>
              </div>
            </div>

            {/* Research & Submission Box */}
            <div className="bg-white border-2 border-gray-300 rounded">
              <div className="bg-gray-200 px-4 py-2 border-b border-gray-300">
                <h2 className="font-semibold text-gray-800">Research & Case Submission</h2>
              </div>
              <div className="p-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <h4 className="font-medium text-gray-900 mb-1">Upload Research Paper</h4>
                    <p className="text-sm text-gray-600">Submit your research for peer review</p>
                  </div>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors cursor-pointer">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <h4 className="font-medium text-gray-900 mb-1">Submit Case Report</h4>
                    <p className="text-sm text-gray-600">Share interesting clinical cases</p>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm text-blue-800">
                    <AlertCircle className="w-4 h-4 inline mr-1" />
                    Submissions are reviewed within 2-3 weeks. Check your email for updates.
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white border-2 border-gray-300 rounded">
              <div className="bg-gray-200 px-4 py-2 border-b border-gray-300">
                <h2 className="font-semibold text-gray-800">Recent Activity</h2>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center p-3 border-l-4 border-blue-400 bg-blue-50">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">{activity.action}</span> {activity.item}
                        </p>
                        <p className="text-xs text-gray-600">{activity.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 text-center">
                  <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                    View All Activity →
                  </button>
                </div>
              </div>
            </div>

            {/* Member Directory Link */}
            <div className="bg-white border-2 border-gray-300 rounded">
              <div className="bg-gray-200 px-4 py-2 border-b border-gray-300">
                <h2 className="font-semibold text-gray-800">Member Directory</h2>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Connect with Colleagues</h4>
                    <p className="text-sm text-gray-600">Browse our network of 2,500+ members across Africa</p>
                  </div>
                  <button className="bg-orange-600 text-white px-4 py-2 rounded font-medium hover:bg-orange-700 flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Browse Directory
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ACNAMemberDashboard;