import { useState } from 'react';
import { 
  Search, MessageSquare, ChevronRight, Plus, Pin, 
  Star, Eye, MessageCircle, User, Clock, ArrowLeft
} from 'lucide-react';
import { Link, useParams, useNavigate } from "react-router-dom";
import ScrollToTop from '../../../../components/common/ScrollToTop';

const ForumThread = () => {
  const { forumId } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [newPostContent, setNewPostContent] = useState('');

  // Mock forum data - this would come from your backend in a real app
  const forumData = {
    'general': {
      title: "General Discussion",
      description: "Use this forum to discuss things related to pediatric neurology that don't belong in any of the other forums.",
      totalPosts: 1245,
      lastPost: "a day ago"
    },
    'meet-and-greet': {
      title: "Meet and Greet",
      description: "Introduce yourself and say hello to your fellow colleagues!",
      totalPosts: 2338,
      lastPost: "2 hours ago"
    },
    'case-studies': {
      title: "Case Studies & Clinical Discussion",
      description: "Share interesting cases, discuss diagnostic challenges, and seek clinical advice from peers.",
      totalPosts: 892,
      lastPost: "5 hours ago"
    },
    'research': {
      title: "Research & Publications",
      description: "Discuss ongoing research, share publications, and collaborate on research projects.",
      totalPosts: 567,
      lastPost: "1 day ago"
    },
    'training': {
      title: "Training & Education",
      description: "Questions about courses, workshops, and continuing medical education opportunities.",
      totalPosts: 423,
      lastPost: "3 hours ago"
    },
    'technical-support': {
      title: "Technical Support",
      description: "Get help with platform issues, course access problems, and technical questions.",
      totalPosts: 156,
      lastPost: "6 hours ago"
    }
  };

  // Get the current forum info based on the forumId parameter
  const threadInfo = forumData[forumId as keyof typeof forumData] || forumData.general;

  // Mock posts data
  const posts = [
    {
      id: 1,
      author: "Dr. Sarah Mwangi",
      content: "Hello everyone! I wanted to discuss some recent developments in pediatric neurology treatments. Has anyone tried the new protocol for refractory epilepsy cases?",
      timestamp: "17 hours ago",
      isPinned: false,
      replies: 3
    },
    {
      id: 2,
      author: "Dr. James Kiprotich",
      content: "Welcome to all new members! Feel free to introduce yourselves and share your experiences in the field.",
      timestamp: "21 hours ago",
      isPinned: true,
      replies: 0
    },
    {
      id: 3,
      author: "Prof. Michael Johnson",
      content: "I'm organizing a research collaboration on EEG analysis in pediatric patients. If anyone is interested, please reach out!",
      timestamp: "a day ago",
      isPinned: false,
      replies: 7
    },
    {
      id: 4,
      author: "Dr. Emma Williams",
      content: "Does anyone have experience with non-pharmacological interventions for ADHD in young children? Looking for practical advice.",
      timestamp: "2 days ago",
      isPinned: false,
      replies: 12
    },
    {
      id: 5,
      author: "Dr. Fatima Al-Rashid",
      content: "I'll be presenting at the upcoming conference on neonatal neurology. Would love to connect with others attending!",
      timestamp: "3 days ago",
      isPinned: false,
      replies: 5
    }
  ];

  const filteredPosts = posts.filter(post =>
    post.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePostSubmit = (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    
    // In a real app, you would send this to your backend
    const newPost = {
      id: posts.length + 1,
      author: "Current User",
      content: newPostContent,
      timestamp: "just now",
      isPinned: false,
      replies: 0
    };
    
    // Add the new post to the beginning of the array
    posts.unshift(newPost);
    setNewPostContent('');
  };

  const handleBackClick = () => {
    navigate("/memberportal", { state: { activeTab: "forum" } });
  };

  const handleReplyClick = (postId: number) => {
    navigate(`/forum/${forumId}/post/${postId}`);
  };

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
              <h1 className="text-2xl font-bold text-gray-900">{threadInfo.title}</h1>
              <p className="text-gray-600 mt-1">{threadInfo.description}</p>
            </div>
            
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search this forum"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-4 text-sm text-gray-500 border-t border-gray-200 pt-4">
            <div className="flex items-center">
              <MessageCircle className="w-4 h-4 mr-1" />
              {threadInfo.totalPosts.toLocaleString()} posts
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              Last post {threadInfo.lastPost}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Create Post Form */}
            <div className="bg-white rounded-lg border border-gray-200 mb-6">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-800">Create Post</h2>
              </div>
              <div className="p-4">
                <div>
                  <textarea
                    rows={4}
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                    placeholder="Write your post here..."
                  />
                  <div className="flex justify-end">
                    <button 
                      onClick={handlePostSubmit}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Posts List */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="font-semibold text-gray-800">Posts</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Sort by:</span>
                  <select className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option>Recent</option>
                    <option>Oldest</option>
                    <option>Most Replies</option>
                  </select>
                </div>
              </div>

              {filteredPosts.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No posts found matching your search.
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredPosts.map((post) => (
                    <div key={post.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                            <User className="w-5 h-5" />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-gray-900">
                              {post.author}
                              {post.isPinned && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                                  <Pin className="w-3 h-3 mr-1" />
                                  Pinned
                                </span>
                              )}
                            </h3>
                            <span className="text-xs text-gray-500">{post.timestamp}</span>
                          </div>
                          
                          <p className="mt-1 text-sm text-gray-700 whitespace-pre-line">
                            {post.content}
                          </p>
                          
                          <div className="mt-3 flex items-center space-x-4">
                            <button 
                              onClick={() => handleReplyClick(post.id)}
                              className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
                            >
                              <MessageCircle className="w-4 h-4 mr-1" />
                              Reply {post.replies > 0 && `(${post.replies})`}
                            </button>
                          </div>
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
                  {threadInfo.description}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Posts:</span>
                  <span className="font-medium">{threadInfo.totalPosts.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-600">Last Post:</span>
                  <span className="font-medium">{threadInfo.lastPost}</span>
                </div>
              </div>
            </div>

            {/* Related Forums */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                <h2 className="font-semibold text-gray-800">Related Forums</h2>
              </div>
              <div className="p-4 space-y-3">
                {Object.entries(forumData).map(([id, forum]) => {
                  if (id !== forumId) {
                    return (
                      <Link 
                        key={id}
                        to={`/forum/${id}`} 
                        className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {forum.title}
                      </Link>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumThread;