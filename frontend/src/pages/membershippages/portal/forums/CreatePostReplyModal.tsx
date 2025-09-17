import { useState } from 'react';
import { Bold, Italic, Underline, Link2, List, ListOrdered, Code } from 'lucide-react';
import { forumApi, CreateForumPostInput } from '../../../../services/forumApi';

interface CreatePostReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newPost: any) => void;
  threadId: number;
  threadTitle: string;
  parentPostId?: number | null;
}

const CreatePostReplyModal: React.FC<CreatePostReplyModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  threadId,
  threadTitle,
  parentPostId = null
}) => {
  const [replyContent, setReplyContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setReplyContent('');
    setError(null);
    setIsSubmitting(false);
    onClose();
  };

  const handleReplySubmit = async () => {
    if (!replyContent.trim()) {
      setError('Please enter your reply content');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      const newPostData: CreateForumPostInput = {
        content: replyContent.trim(),
        thread: threadId,
        parent_post: parentPostId
      };
      
      const newPost = await forumApi.createPost(newPostData);
      
      handleClose();
      onSuccess(newPost);
      
    } catch (err) {
      console.error('Error creating reply:', err);
      setError(err instanceof Error ? err.message : 'Failed to create reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Allow Ctrl+Enter or Cmd+Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleReplySubmit();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">
                {parentPostId ? 'Reply to Post' : 'Reply to Thread'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">in: {threadTitle}</p>
            </div>
            <button 
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              disabled={isSubmitting}
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-md text-sm mb-4">
              {error}
            </div>
          )}
          
          {/* Formatting Toolbar */}
          <div className="flex items-center space-x-2 mb-3 pb-3 border-b border-gray-200">
            <button 
              type="button" 
              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
              disabled={isSubmitting}
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button 
              type="button" 
              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
              disabled={isSubmitting}
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button 
              type="button" 
              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
              disabled={isSubmitting}
              title="Underline"
            >
              <Underline className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-gray-300 mx-1"></div>
            <button 
              type="button" 
              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
              disabled={isSubmitting}
              title="Link"
            >
              <Link2 className="w-4 h-4" />
            </button>
            <button 
              type="button" 
              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
              disabled={isSubmitting}
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </button>
            <button 
              type="button" 
              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
              disabled={isSubmitting}
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button 
              type="button" 
              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
              disabled={isSubmitting}
              title="Code"
            >
              <Code className="w-4 h-4" />
            </button>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Reply *
            </label>
            <textarea
              rows={8}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Write your reply here..."
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">
              Tip: Use Ctrl+Enter (Cmd+Enter on Mac) to submit quickly
            </p>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {replyContent.length} characters
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              onClick={handleReplySubmit}
              disabled={!replyContent.trim() || isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Posting...' : 'Post Reply'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostReplyModal;