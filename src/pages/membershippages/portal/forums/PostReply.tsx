import { useState } from 'react';
import { 
  ArrowLeft, User, MessageCircle, Pin,
  Bold, Italic, Underline, Link2, List,
  ListOrdered, Code, MoreHorizontal
} from 'lucide-react';
import { useParams, useNavigate } from "react-router-dom";
import ScrollToTop from '../../../../components/common/ScrollToTop';

interface Reply {
  id: number;
  author: string;
  content: string;
  timestamp: string;
}

interface Post {
  id: number;
  author: string;
  content: string;
  timestamp: string;
  isPinned: boolean;
  likes: number;
  replies: Reply[];
}

const PostReply = () => {
  const { forumId, postId } = useParams();
  const navigate = useNavigate();
  const [replyContent, setReplyContent] = useState('');

  // Mock data - in a real app, this would come from your backend
  const forumData = {
    'general': { title: "General Discussion" },
    'meet-and-greet': { title: "Meet and Greet" },
    'case-studies': { title: "Case Studies & Clinical Discussion" },
    'research': { title: "Research & Publications" },
    'training': { title: "Training & Education" },
    'technical-support': { title: "Technical Support" }
  };

  const posts: Record<number, Post> = {
    1: {
      id: 1,
      author: "Dr. Sarah Mwangi",
      content: "Hello everyone! I wanted to discuss some recent developments in pediatric neurology treatments. Has anyone tried the new protocol for refractory epilepsy cases?",
      timestamp: "17 hours ago",
      isPinned: false,
      likes: 2,
      replies: [
        {
          id: 101,
          author: "Dr. Michael Chen",
          content: "Great question! I've been following the research on this. The new protocol shows promising results, especially in cases where traditional treatments haven't been effective.",
          timestamp: "15 hours ago"
        },
        {
          id: 102,
          author: "Prof. Lisa Johnson",
          content: "I'd like to add that we should also consider the long-term effects. While the initial results are encouraging, we need more longitudinal studies.",
          timestamp: "12 hours ago"
        }
      ]
    },
    2: {
      id: 2,
      author: "Dr. James Kiprotich",
      content: "Welcome to all new members! Feel free to introduce yourselves and share your experiences in the field.",
      timestamp: "21 hours ago",
      isPinned: true,
      likes: 5,
      replies: []
    }
  };

  const currentPost = postId ? posts[Number(postId) as keyof typeof posts] : undefined;
  const forumTitle = forumId ? forumData[forumId as keyof typeof forumData]?.title : "Forum";

  const handleReplySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!replyContent.trim() || !currentPost) return;
    
    // In a real app, you would send this to your backend
    const newReply: Reply = {
      id: Date.now(),
      author: "Current User",
      content: replyContent,
      timestamp: "just now"
    };
    
    // Add the new reply
    currentPost.replies.push(newReply);
    setReplyContent('');
  };

  const handleBackClick = () => {
    navigate(`/forum/${forumId}`);
  };

  if (!currentPost) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Post not found</h2>
          <p className="text-gray-600 mb-4">The post you're looking for doesn't exist.</p>
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
              Back to {forumTitle}
            </button>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900">Post & Replies</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Original Post */}
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
                      {currentPost.author}
                    </h3>
                    <span className="ml-2 text-blue-600 text-sm font-medium">Learner</span>
                    {currentPost.isPinned && (
                      <span className="ml-3 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                        <Pin className="w-3 h-3 mr-1" />
                        Pinned
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">{currentPost.timestamp}</span>
                </div>
                
                <p className="text-gray-700 leading-relaxed mb-4">
                  {currentPost.content}
                </p>
                
                <div className="flex items-center space-x-6 text-sm">
                  <button className="flex items-center text-gray-500 hover:text-blue-600">
                    👍 Like {currentPost.likes}
                  </button>
                  <button className="flex items-center text-gray-500 hover:text-blue-600">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Reply
                  </button>
                  <button className="text-blue-600 hover:text-blue-800">
                    + Follow this post
                  </button>
                  <button className="text-blue-600 hover:text-blue-800">
                    🌐 Translate to English
                  </button>
                  <button className="text-gray-500 hover:text-gray-700">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Replies Section */}
        {currentPost.replies.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 mb-6">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <h2 className="font-semibold text-gray-800">
                Replies ({currentPost.replies.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {currentPost.replies.map((reply) => (
                <div key={reply.id} className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-500" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900">
                          {reply.author}
                        </h4>
                        <span className="text-xs text-gray-500">{reply.timestamp}</span>
                      </div>
                      
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {reply.content}
                      </p>
                      
                      <div className="mt-3 flex items-center space-x-4 text-xs">
                        <button className="text-gray-500 hover:text-blue-600">
                          👍 Like
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
            />
            
            <div className="flex justify-end mt-4">
              <button 
                type="submit"
                disabled={!replyContent.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reply
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostReply;