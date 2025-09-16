import { useState, useEffect } from 'react';
import { 
  ArrowLeft, User, MessageCircle, Pin,
  Bold, Italic, Underline, Link2, List,
  ListOrdered, Code, MoreHorizontal, Heart, Eye
} from 'lucide-react';
import { useParams, useNavigate, Link } from "react-router-dom";
import ScrollToTop from '../../../../components/common/ScrollToTop';
import { forumApi, ForumThread, ForumPost, CreateForumPostInput } from '../../../../services/forumApi';

const PostReply = () => {
  const { forumId, threadSlug } = useParams();
  const navigate = useNavigate();
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // State for API data
  const [currentThread, setCurrentThread] = useState<ForumThread | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);

  useEffect(() => {
    if (threadSlug) {
      fetchThreadData();
    }
  }, [threadSlug]);

  const fetchThreadData = async () => {
    if (!threadSlug) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Get all threads to find the one matching our slug
      const threads = await forumApi.getThreads();
      const matchingThread = threads.find(thread => thread.slug === threadSlug);
      
      if (!matchingThread) {
        setError('Thread not found');
        return;
      }
      
      // Get the full thread details with posts
      const threadDetails = await forumApi.getThreadById(matchingThread.id);
      setCurrentThread(threadDetails);
      
      // Get posts for this thread
      const threadPosts = await forumApi.getPosts({
        thread: matchingThread.id,
        ordering: 'created_at'
      });
      
      setPosts(threadPosts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load thread data');
      console.error('Error fetching thread data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!replyContent.trim() || !currentThread) return;
    
    try {
      setSubmitting(true);
      setError(null);
      
      const newPostData: CreateForumPostInput = {
        content: replyContent,
        thread: currentThread.id,
        parent_post: null // Top-level reply to thread
      };
      
      const newPost = await forumApi.createPost(newPostData);
      
      // Add the new post to the posts list
      setPosts(prevPosts => [...prevPosts, newPost]);
      setReplyContent('');
      
      // Scroll to the bottom to show the new post
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 100);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeThread = async () => {
    if (!currentThread) return;
    
    try {
      const result = await forumApi.likeThread(currentThread.id);
      setCurrentThread(prev => prev ? {
        ...prev,
        is_liked: result.liked,
        like_count: result.like_count
      } : null);
    } catch (err) {
      console.error('Error liking thread:', err);
    }
  };

  const handleLikePost = async (postId: number) => {
    try {
      const result = await forumApi.likePost(postId);
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { ...post, is_liked: result.liked, like_count: result.like_count }
            : post
        )
      );
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleBackClick = () => {
    navigate(`/forum/${forumId}`);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="bg-white rounded-lg border border-gray-200 mb-6 p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="h-20 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !currentThread) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {error || 'Thread not found'}
          </h2>
          <p className="text-gray-600 mb-4">
            {error || "The thread you're looking for doesn't exist."}
          </p>
          <button
            onClick={handleBackClick}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center mb-4">
            <button
              onClick={handleBackClick}
              className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              Back to {currentThread.category.title}
            </button>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900">{currentThread.title}</h1>
          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
            <span>in {currentThread.category.title}</span>
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              {currentThread.view_count} views
            </div>
            <div className="flex items-center">
              <MessageCircle className="w-4 h-4 mr-1" />
              {currentThread.reply_count} replies
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Original Thread */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {currentThread.author.display_name}
                    </h3>
                    <span className="ml-2 text-blue-600 text-sm font-medium">Thread Author</span>
                    {currentThread.is_pinned && (
                      <span className="ml-3 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                        <Pin className="w-3 h-3 mr-1" />
                        Pinned
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">{formatTimeAgo(currentThread.created_at)}</span>
                </div>
                
                <div className="prose prose-sm max-w-none mb-4">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {currentThread.content}
                  </p>
                </div>
                
                {currentThread.tags && currentThread.tags.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-1">
                    {currentThread.tags.map((tag, index) => (
                      <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center space-x-6 text-sm">
                  <button 
                    onClick={handleLikeThread}
                    className={`flex items-center ${
                      currentThread.is_liked 
                        ? 'text-red-600 hover:text-red-700' 
                        : 'text-gray-500 hover:text-red-600'
                    }`}
                  >
                    <Heart className={`w-4 h-4 mr-1 ${currentThread.is_liked ? 'fill-current' : ''}`} />
                    {currentThread.like_count} {currentThread.like_count === 1 ? 'like' : 'likes'}
                  </button>
                  <button className="flex items-center text-gray-500 hover:text-blue-600">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Reply
                  </button>
                  <span className="text-gray-500">
                    🌐 Translate to English
                  </span>
                  <button className="text-gray-500 hover:text-gray-700">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Section */}
        {posts.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 mb-6">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <h2 className="font-semibold text-gray-800">
                Replies ({posts.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {posts.map((post) => (
                <div key={post.id} className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-500" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <h4 className="text-sm font-medium text-gray-900">
                            {post.author.display_name}
                          </h4>
                          {post.is_edited && (
                            <span className="ml-2 text-xs text-gray-500">(edited)</span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">{formatTimeAgo(post.created_at)}</span>
                      </div>
                      
                      <div className="prose prose-sm max-w-none mb-3">
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {post.content}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-xs">
                        <button 
                          onClick={() => handleLikePost(post.id)}
                          className={`flex items-center ${
                            post.is_liked 
                              ? 'text-red-600 hover:text-red-700' 
                              : 'text-gray-500 hover:text-red-600'
                          }`}
                        >
                          <Heart className={`w-4 h-4 mr-1 ${post.is_liked ? 'fill-current' : ''}`} />
                          {post.like_count} {post.like_count === 1 ? 'like' : 'likes'}
                        </button>
                        <button className="text-gray-500 hover:text-blue-600">
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reply Form */}
        <form onSubmit={handleReplySubmit} className="bg-white rounded-lg border border-gray-200">
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <h2 className="font-semibold text-gray-800">Post Reply</h2>
          </div>
          <div className="p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-md text-sm mb-3">
                {error}
              </div>
            )}
            
            {/* Formatting Toolbar */}
            <div className="flex items-center space-x-2 mb-3 pb-3 border-b border-gray-200">
              <button type="button" className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
                <Bold className="w-4 h-4" />
              </button>
              <button type="button" className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
                <Italic className="w-4 h-4" />
              </button>
              <button type="button" className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
                <Underline className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-gray-300 mx-1"></div>
              <button type="button" className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
                <Link2 className="w-4 h-4" />
              </button>
              <button type="button" className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
                <List className="w-4 h-4" />
              </button>
              <button type="button" className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
                <ListOrdered className="w-4 h-4" />
              </button>
              <button type="button" className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
                <Code className="w-4 h-4" />
              </button>
            </div>
            
            <textarea
              rows={6}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Add details for others to answer your question"
              disabled={submitting}
            />
            
            <div className="flex justify-end mt-4">
              <button 
                type="submit"
                disabled={!replyContent.trim() || submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Posting...' : 'Reply'}
              </button>
            </div>
          </div>
        </form>

        {/* Thread Info Sidebar */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200">
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <h2 className="font-semibold text-gray-800">Thread Information</h2>
          </div>
          <div className="p-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Created:</span>
              <span className="font-medium">{formatTimeAgo(currentThread.created_at)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Last Activity:</span>
              <span className="font-medium">{formatTimeAgo(currentThread.last_activity)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Views:</span>
              <span className="font-medium">{currentThread.view_count.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Replies:</span>
              <span className="font-medium">{currentThread.reply_count.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Likes:</span>
              <span className="font-medium">{currentThread.like_count.toLocaleString()}</span>
            </div>
            <div className="pt-3 border-t border-gray-200">
              <Link 
                to={`/forum/${forumId}`}
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                ← Back to {currentThread.category.title}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostReply;