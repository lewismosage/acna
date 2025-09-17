import { useState, useEffect } from 'react';
import { forumApi, ForumCategory } from '../../../../services/forumApi';

interface CreateThreadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: ForumCategory[];
  initialCategoryId?: number;
}

interface NewThreadData {
  title: string;
  content: string;
  category_id: string;
  tags: string[];
}

const CreateThreadModal: React.FC<CreateThreadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  categories,
  initialCategoryId
}) => {
  const [newThread, setNewThread] = useState<NewThreadData>({
    title: '',
    content: '',
    category_id: initialCategoryId ? initialCategoryId.toString() : '',
    tags: []
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update category_id when initialCategoryId changes
  useEffect(() => {
    if (initialCategoryId) {
      setNewThread(prev => ({
        ...prev,
        category_id: initialCategoryId.toString()
      }));
    }
  }, [initialCategoryId]);

  const handleClose = () => {
    setNewThread({
      title: '',
      content: '',
      category_id: initialCategoryId ? initialCategoryId.toString() : '',
      tags: []
    });
    setError(null);
    setIsSubmitting(false);
    onClose();
  };

  const handleCreateThread = async () => {
    if (!newThread.title.trim() || !newThread.content.trim() || !newThread.category_id) {
      setError('Please fill in all required fields');
      return;
    }
  
    try {
      setError(null);
      setIsSubmitting(true);
      
      const newThreadData = {
        title: newThread.title.trim(),
        content: newThread.content.trim(),
        category_id: parseInt(newThread.category_id),
        tags: newThread.tags
      };
      
      console.log('Creating thread with data:', newThreadData);
      
      await forumApi.createThread(newThreadData);
      
      handleClose();
      onSuccess();
    } catch (err) {
      console.error('Error creating thread:', err);
      setError(err instanceof Error ? err.message : 'Failed to create thread');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTagsKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      e.preventDefault();
      const newTags = e.currentTarget.value.split(',').map(tag => tag.trim()).filter(tag => tag);
      setNewThread(prev => ({ 
        ...prev, 
        tags: [...new Set([...prev.tags, ...newTags])] // Remove duplicates
      }));
      e.currentTarget.value = '';
    }
  };

  const removeTag = (indexToRemove: number) => {
    setNewThread(prev => ({
      ...prev,
      tags: prev.tags.filter((_, index) => index !== indexToRemove)
    }));
  };

  const getCategoryTitle = () => {
    if (initialCategoryId) {
      const category = categories.find(cat => cat.id === initialCategoryId);
      return category ? ` in ${category.title}` : '';
    }
    return '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Create New Thread{getCategoryTitle()}</h3>
            <button 
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              disabled={isSubmitting}
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
          
          {!initialCategoryId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select 
                value={newThread.category_id}
                onChange={(e) => setNewThread(prev => ({ ...prev, category_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.title}</option>
                ))}
              </select>
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags (optional)
            </label>
            <input 
              type="text" 
              placeholder="Enter tags separated by commas and press Enter..."
              onKeyPress={handleTagsKeyPress}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            />
            {newThread.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {newThread.tags.map((tag, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded flex items-center">
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                      disabled={isSubmitting}
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
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            onClick={handleCreateThread}
            disabled={!newThread.title.trim() || !newThread.content.trim() || !newThread.category_id || isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating...' : 'Create Thread'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateThreadModal;