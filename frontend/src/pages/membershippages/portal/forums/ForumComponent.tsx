import { useState, useEffect } from 'react';
import { 
  Search, MessageSquare, Users, Clock, ChevronRight, 
  Plus, Pin, Star, Eye, MessageCircle, User, Calendar,
  TrendingUp, Filter, SortDesc
} from 'lucide-react';
import { Link } from "react-router-dom";
import { forumApi, ForumCategory, ForumThread, ForumAnalytics } from '../../../../services/forumApi';

const ForumComponent = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateThread, setShowCreateThread] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for API data
  const [forumCategories, setForumCategories] = useState<ForumCategory[]>([]);
  const [recentThreads, setRecentThreads] = useState<ForumThread[]>([]);
  const [analytics, setAnalytics] = useState<ForumAnalytics | null>(null);
  
  // Create thread form state
  const [newThread, setNewThread] = useState({
    title: '',
    content: '',
    category_id: '',
    tags: [] as string[]
  });

  // Icon mapping for categories
  const iconMap: { [key: string]: React.ComponentType<any> } = {
    'MessageSquare': MessageSquare,
    'Users': Users,
    'Star': Star,
    'TrendingUp': TrendingUp,
    'Calendar': Calendar,
    'MessageCircle': MessageCircle,
  };

  const tabs = [
    { id: 'all', label: 'All forums' },
    { id: 'activity', label: 'Recent Activity' }
  ];

  useEffect(() => {
    fetchForumData();
  }, []);

  const fetchForumData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [categoriesData, recentThreadsData, analyticsData] = await Promise.all([
        forumApi.getCategories(),
        forumApi.getRecentThreads(),
        forumApi.getForumAnalytics()
      ]);
      
      setForumCategories(categoriesData);
      setRecentThreads(recentThreadsData);
      setAnalytics(analyticsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load forum data');
      console.error('Error fetching forum data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = forumCategories.filter(category =>
    category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateThread = async () => {
    if (!newThread.title.trim() || !newThread.content.trim() || !newThread.category_id) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setError(null);
      await forumApi.createThread({
        title: newThread.title,
        content: newThread.content,
        category_id: parseInt(newThread.category_id),
        tags: newThread.tags
      });
      
      setShowCreateThread(false);
      setNewThread({ title: '', content: '', category_id: '', tags: [] });
      fetchForumData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create thread');
    }
  };

  const CreateThreadModal = () => {
    if (!showCreateThread) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Create New Thread</h3>
              <button 
                onClick={() => {
                  setShowCreateThread(false);
                  setError(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select 
                value={newThread.category_id}
                onChange={(e) => setNewThread(prev => ({ ...prev, category_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a category</option>
                {forumCategories.map(category => (
                  <option key={category.id} value={category.id}>{category.title}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input 
                type="text" 
                value={newThread.title}
                onChange={(e) => setNewThread(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your thread title..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content *
              </label>
              <textarea 
                rows={8}
                value={newThread.content}
                onChange={(e) => setNewThread(prev => ({ ...prev, content: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Write your thread content..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (optional)
              </label>
              <input 
                type="text" 
                placeholder="Enter tags separated by commas..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    const newTags = e.currentTarget.value.split(',').map(tag => tag.trim());
                    setNewThread(prev => ({ ...prev, tags: [...prev.tags, ...newTags] }));
                    e.currentTarget.value = '';
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {newThread.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {newThread.tags.map((tag, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded flex items-center">
                      {tag}
                      <button
                        onClick={() => setNewThread(prev => ({
                          ...prev,
                          tags: prev.tags.filter((_, i) => i !== index)
                        }))}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
            <button 
              onClick={() => {
                setShowCreateThread(false);
                setError(null);
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button 
              onClick={handleCreateThread}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Thread
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
              state={{ fromForum: true }} 
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
          {analytics ? (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Threads</span>
                <span className="font-medium">{analytics.total_threads.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Posts</span>
                <span className="font-medium">{analytics.total_posts.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Active Users</span>
                <span className="font-medium">{analytics.active_users.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Recent Activity</span>
                <span className="font-medium text-green-600">{analytics.recent_activity_count}</span>
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-500">Loading statistics...</div>
          )}
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

  const AllForumsTab = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="animate-pulse">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {filteredCategories.map((category) => {
          const IconComponent = iconMap[category.icon] || MessageSquare;
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
                        {category.last_post ? (
                          <>Last post {new Date(category.last_post.created_at).toLocaleDateString()} by {category.last_post.author}</>
                        ) : (
                          'No posts yet'
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right ml-4">
                    <div className="text-lg font-semibold text-gray-900">
                      {category.thread_count.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">threads</div>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <Link 
                    to={`/forum/${category.slug}`}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
                  >
                    Go to discussion
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const RecentActivityTab = () => {
    if (loading) {
      return (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
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
                    {thread.is_pinned && (
                      <Pin className="w-4 h-4 text-orange-600" />
                    )}
                    <Link 
                      to={`/forum/${thread.category.slug}/thread/${thread.slug}`}
                      className="font-medium text-gray-900 hover:text-blue-600"
                    >
                      {thread.title}
                    </Link>
                    {thread.has_new_replies && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        New
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {thread.author.display_name}
                    </div>
                    <div className="flex items-center">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {thread.reply_count} replies
                    </div>
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {thread.view_count} views
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {new Date(thread.last_activity).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                      {thread.category.title}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error loading forum</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchForumData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 md:px-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Discussion Forums</h1>
          
          {/* Search and Create Thread */}
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
              onClick={() => setShowCreateThread(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create thread
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

      <CreateThreadModal />
    </div>
  );
};

export default ForumComponent;