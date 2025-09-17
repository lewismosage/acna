import { useState, useEffect } from 'react';
import { 
  Search, Pin, 
  Star, Eye, MessageCircle, User, Clock, ArrowLeft, Plus
} from 'lucide-react';
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from '../../../../services/AuthContext';
import ScrollToTop from '../../../../components/common/ScrollToTop';
import { forumApi, ForumCategory, ForumThread as ForumThreadType } from '../../../../services/forumApi';

const ForumThread = () => {
  const { user } = useAuth();
  const { forumId } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for API data
  const [category, setCategory] = useState<ForumCategory | null>(null);
  const [threads, setThreads] = useState<ForumThreadType[]>([]);
  const [sortBy, setSortBy] = useState('recent');

  // Create thread modal state
  const [showCreateThread, setShowCreateThread] = useState(false);
  const [newThread, setNewThread] = useState({
    title: '',
    content: '',
    tags: [] as string[]
  });

  useEffect(() => {
    if (forumId) {
      fetchCategoryData();
    }
  }, [forumId, sortBy]);

  const fetchCategoryData = async () => {
    if (!forumId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // First, get all categories to find the one matching our slug
      const categories = await forumApi.getCategories();
      const matchingCategory = categories.find(cat => cat.slug === forumId);
      
      if (!matchingCategory) {
        setError('Forum category not found');
        return;
      }
      
      setCategory(matchingCategory);
      
      // Get threads for this category with sorting
      const orderingMap = {
        'recent': '-created_at',
        'oldest': 'created_at',
        'most_replies': '-reply_count',
        'most_views': '-view_count',
        'popular': '-like_count'
      };
      
      const threadsData = await forumApi.getCategoryThreads(matchingCategory.id, {
        ordering: orderingMap[sortBy as keyof typeof orderingMap] || '-created_at'
      });
      
      setThreads(threadsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load forum data');
      console.error('Error fetching forum data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredThreads = threads.filter(thread =>
    thread.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    thread.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    thread.author.display_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateThread = async () => {
    if (!newThread.title.trim() || !newThread.content.trim()) {
      setError('Please enter both title and content for your thread');
      return;
    }
    
    if (!category) {
      setError('Category not found');
      return;
    }
    
    try {
      setError(null);
      
      const newThreadData = {
        title: newThread.title,
        content: newThread.content,
        category_id: category.id,  // Changed from 'category' to 'category_id'
        tags: newThread.tags
      };
      
      console.log('Creating thread with data:', newThreadData);
      
      await forumApi.createThread(newThreadData);
      
      // Reset form and close modal
      setNewThread({ title: '', content: '', tags: [] });
      setShowCreateThread(false);
      
      // Refresh data
      fetchCategoryData();
    } catch (err) {
      console.error('Error creating thread:', err);
      setError(err instanceof Error ? err.message : 'Failed to create thread');
    }
  };

  const handleBackClick = () => {
    navigate("/memberportal", { state: { activeTab: "forum" } });
  };

  const handleThreadClick = (thread: ForumThreadType) => {
    navigate(`/forum/${forumId}/thread/${thread.slug}`);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  // Create Thread Modal Component
  const CreateThreadModal = () => {
    if (!showCreateThread) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Create New Thread in {category?.title}</h3>
              <button 
                onClick={() => {
                  setShowCreateThread(false);
                  setError(null);
                  setNewThread({ title: '', content: '', tags: [] });
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
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
                Thread Title *
              </label>
              <input 
                type="text" 
                value={newThread.title}
                onChange={(e) => setNewThread(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter a descriptive title for your thread..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thread Content *
              </label>
              <textarea 
                rows={8}
                value={newThread.content}
                onChange={(e) => setNewThread(prev => ({ ...prev, content: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Write your thread content here..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (optional)
              </label>
              <input 
                type="text" 
                placeholder="Enter tags separated by commas and press Enter..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    e.preventDefault();
                    const newTags = e.currentTarget.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                    setNewThread(prev => ({ 
                      ...prev, 
                      tags: [...new Set([...prev.tags, ...newTags])] // Remove duplicates
                    }));
                    e.currentTarget.value = '';
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {newThread.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {newThread.tags.map((tag, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded flex items-center">
                      #{tag}
                      <button
                        type="button"
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
                setNewThread({ title: '', content: '', tags: [] });
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button 
              onClick={handleCreateThread}
              disabled={!newThread.title.trim() || !newThread.content.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Thread
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (error && !showCreateThread) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error loading forum</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchCategoryData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mr-2"
          >
            Try Again
          </button>
          <button
            onClick={handleBackClick}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Back to Forum
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <ScrollToTop />
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 md:px-6">
          <div className="flex items-center mb-4">
            <button
              onClick={handleBackClick}
              className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              Back to Forum
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {loading ? 'Loading...' : category?.title || 'Forum Category'}
              </h1>
              <p className="text-gray-600 mt-1">
                {loading ? 'Loading description...' : category?.description || 'Forum description'}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search this forum"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <button 
                onClick={() => setShowCreateThread(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center whitespace-nowrap"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Thread
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-4 text-sm text-gray-500 border-t border-gray-200 pt-4">
            <div className="flex items-center">
              <MessageCircle className="w-4 h-4 mr-1" />
              {category ? `${category.thread_count.toLocaleString()} threads` : 'Loading...'}
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              Last post {category?.last_post ? formatTimeAgo(category.last_post.created_at) : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Threads List */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="font-semibold text-gray-800">Threads</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Sort by:</span>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="recent">Recent</option>
                    <option value="oldest">Oldest</option>
                    <option value="most_replies">Most Replies</option>
                    <option value="most_views">Most Views</option>
                    <option value="popular">Most Liked</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="p-8">
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
              ) : filteredThreads.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  {searchTerm ? 'No threads found matching your search.' : 'No threads yet. Be the first to create one!'}
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredThreads.map((thread) => (
                    <div key={thread.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                            <User className="w-5 h-5" />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <button
                                onClick={() => handleThreadClick(thread)}
                                className="text-lg font-medium text-gray-900 hover:text-blue-600 text-left"
                              >
                                {thread.title}
                              </button>
                              {thread.is_pinned && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                                  <Pin className="w-3 h-3 mr-1" />
                                  Pinned
                                </span>
                              )}
                              {thread.has_new_replies && (
                                <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                  New
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">{formatTimeAgo(thread.created_at)}</span>
                          </div>
                          
                          <div className="mt-1 flex items-center text-sm text-gray-600">
                            <span>by {thread.author.display_name}</span>
                          </div>
                          
                          <p className="mt-2 text-sm text-gray-700 line-clamp-2">
                            {thread.content}
                          </p>
                          
                          <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <MessageCircle className="w-4 h-4 mr-1" />
                              {thread.reply_count} replies
                            </div>
                            <div className="flex items-center">
                              <Eye className="w-4 h-4 mr-1" />
                              {thread.view_count} views
                            </div>
                            <div className="flex items-center">
                              <Star className="w-4 h-4 mr-1" />
                              {thread.like_count} likes
                            </div>
                            {thread.last_post && (
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                Last reply {formatTimeAgo(thread.last_post.created_at)}
                              </div>
                            )}
                          </div>
                          
                          {thread.tags && thread.tags.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {thread.tags.map((tag, index) => (
                                <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Forum Info */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                <h2 className="font-semibold text-gray-800">About This Forum</h2>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  {category?.description || 'Loading description...'}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Threads:</span>
                  <span className="font-medium">{category?.thread_count.toLocaleString() || '0'}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-600">Total Posts:</span>
                  <span className="font-medium">{category?.post_count.toLocaleString() || '0'}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-600">Last Post:</span>
                  <span className="font-medium">
                    {category?.last_post ? formatTimeAgo(category.last_post.created_at) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                <h2 className="font-semibold text-gray-800">Quick Actions</h2>
              </div>
              <div className="p-4 space-y-3">
                <Link 
                  to="/memberportal"
                  state={{ activeTab: "forum" }}
                  className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  ← Back to All Forums
                </Link>
                <button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="block text-sm text-blue-600 hover:text-blue-800 hover:underline w-full text-left"
                >
                  ↑ Back to Top
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CreateThreadModal />
    </div>
  );
};

export default ForumThread;