import { useState } from 'react';
import { 
  Search, MessageSquare, Users, Clock, ChevronRight, 
  Plus, Pin, Star, Eye, MessageCircle, User, Calendar,
  TrendingUp, Filter, SortDesc
} from 'lucide-react';
import { Link } from "react-router-dom";

const ForumComponent = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);

  // Mock forum data
  const forumCategories = [
    {
      id: 1,
      title: "General Discussion",
      description: "Use this forum to discuss things related to pediatric neurology that don't belong in any of the other forums.",
      threadCount: 1245,
      lastPost: "a day ago",
      lastPostBy: "Dr. Sarah Mwangi",
      icon: MessageSquare,
      color: "blue"
    },
    {
      id: 2,
      title: "Meet and Greet",
      description: "Introduce yourself and say hello to your fellow colleagues!",
      threadCount: 2338,
      lastPost: "2 hours ago",
      lastPostBy: "Dr. James Kiprotich",
      icon: Users,
      color: "green"
    },
    {
      id: 3,
      title: "Case Studies & Clinical Discussion",
      description: "Share interesting cases, discuss diagnostic challenges, and seek clinical advice from peers.",
      threadCount: 892,
      lastPost: "5 hours ago",
      lastPostBy: "Prof. Michael Johnson",
      icon: Star,
      color: "purple"
    },
    {
      id: 4,
      title: "Research & Publications",
      description: "Discuss ongoing research, share publications, and collaborate on research projects.",
      threadCount: 567,
      lastPost: "1 day ago",
      lastPostBy: "Dr. Emma Williams",
      icon: TrendingUp,
      color: "orange"
    },
    {
      id: 5,
      title: "Training & Education",
      description: "Questions about courses, workshops, and continuing medical education opportunities.",
      threadCount: 423,
      lastPost: "3 hours ago",
      lastPostBy: "Dr. Fatima Al-Rashid",
      icon: Calendar,
      color: "teal"
    },
    {
      id: 6,
      title: "Technical Support",
      description: "Get help with platform issues, course access problems, and technical questions.",
      threadCount: 156,
      lastPost: "6 hours ago",
      lastPostBy: "ACNA Support",
      icon: MessageCircle,
      color: "red"
    }
  ];

  const recentThreads = [
    {
      id: 1,
      title: "Complex case: 8-year-old with refractory epilepsy",
      author: "Dr. Sarah Mwangi",
      category: "Case Studies",
      replies: 23,
      views: 156,
      lastReply: "2 hours ago",
      isPinned: false,
      hasNewReplies: true
    },
    {
      id: 2,
      title: "Welcome to the new ACNA forum!",
      author: "ACNA Admin",
      category: "General Discussion",
      replies: 45,
      views: 298,
      lastReply: "4 hours ago",
      isPinned: true,
      hasNewReplies: false
    },
    {
      id: 3,
      title: "Research collaboration opportunity - EEG analysis study",
      author: "Prof. Michael Johnson",
      category: "Research & Publications",
      replies: 12,
      views: 89,
      lastReply: "1 day ago",
      isPinned: false,
      hasNewReplies: true
    }
  ];

  const tabs = [
    { id: 'all', label: 'All forums' },
    { id: 'activity', label: 'Recent Activity' }
  ];

  const filteredCategories = forumCategories.filter(category =>
    category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const CreatePostModal = () => {
    if (!showCreatePost) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Create New Post</h3>
              <button 
                onClick={() => setShowCreatePost(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Select a category</option>
                {forumCategories.map(category => (
                  <option key={category.id} value={category.id}>{category.title}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your post title..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <textarea 
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Write your post content..."
              />
            </div>
          </div>
          
          <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
            <button 
              onClick={() => setShowCreatePost(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Create Post
            </button>
          </div>
        </div>
      </div>
    );
  };

  const Sidebar = () => (
    <div className="lg:col-span-1 space-y-6">
      {/* Description */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
          <h2 className="font-semibold text-gray-800">Description</h2>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            Welcome to the ACNA discussion forums! Ask questions, debate ideas, 
            and find fellow colleagues who share your goals. Browse popular threads below 
            or other forums in the sidebar.
          </p>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Link
              to="/forum-guidelines"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
              Forum guidelines
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Forum Stats */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
          <h2 className="font-semibold text-gray-800">Forum Statistics</h2>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Threads</span>
            <span className="font-medium">5,621</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Posts</span>
            <span className="font-medium">23,456</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Active Members</span>
            <span className="font-medium">1,234</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Online Now</span>
            <span className="font-medium text-green-600">89</span>
          </div>
        </div>
      </div>

      {/* Popular Tags */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
          <h2 className="font-semibold text-gray-800">Popular Tags</h2>
        </div>
        <div className="p-4">
          <div className="flex flex-wrap gap-2">
            {['epilepsy', 'EEG', 'cerebral-palsy', 'research', 'case-study', 'pediatric', 'neurology', 'treatment'].map((tag) => (
              <span key={tag} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded cursor-pointer hover:bg-blue-200">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const AllForumsTab = () => (
    <div className="space-y-4">
      {filteredCategories.map((category) => {
        const IconComponent = category.icon;
        return (
          <div key={category.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className={`p-3 rounded-lg bg-${category.color}-100`}>
                    <IconComponent className={`w-6 h-6 text-${category.color}-600`} />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {category.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {category.description}
                    </p>
                    <div className="text-xs text-gray-500">
                      Last post {category.lastPost} by {category.lastPostBy}
                    </div>
                  </div>
                </div>
                
                <div className="text-right ml-4">
                  <div className="text-lg font-semibold text-gray-900">
                    {category.threadCount.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">threads</div>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center">
                  Go to discussion
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const RecentActivityTab = () => (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <div className="flex items-center space-x-2">
            <button className="text-gray-400 hover:text-gray-600">
              <Filter className="w-4 h-4" />
            </button>
            <button className="text-gray-400 hover:text-gray-600">
              <SortDesc className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="divide-y divide-gray-200">
        {recentThreads.map((thread) => (
          <div key={thread.id} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  {thread.isPinned && (
                    <Pin className="w-4 h-4 text-orange-600" />
                  )}
                  <h3 className="font-medium text-gray-900 hover:text-blue-600 cursor-pointer">
                    {thread.title}
                  </h3>
                  {thread.hasNewReplies && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      New
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {thread.author}
                  </div>
                  <div className="flex items-center">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    {thread.replies} replies
                  </div>
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    {thread.views} views
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {thread.lastReply}
                  </div>
                </div>
                
                <div className="mt-2">
                  <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                    {thread.category}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 md:px-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Discussion Forums</h1>
          
          {/* Search and Create Post */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search forum"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button 
              onClick={() => setShowCreatePost(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create post
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-0 border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {activeTab === 'all' ? <AllForumsTab /> : <RecentActivityTab />}
          </div>

          {/* Sidebar - Constant for both tabs */}
          <Sidebar />
        </div>
      </div>

      <CreatePostModal />
    </div>
  );
};

export default ForumComponent;