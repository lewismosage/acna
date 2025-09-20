import { useState, useEffect, useRef } from 'react';
import { Search, Bell, MessageCircle, RefreshCw, MoreVertical, Trash2, X } from 'lucide-react';
import { messagingApi, type Conversation } from '../../../../services/messagingApi';
import defaultProfileImage from '../../../../assets/default Profile Image.png';

interface ChatsProps {
  onSelectChat: (conversation: Conversation) => void;
}

const Chats = ({ onSelectChat }: ChatsProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeDropdown]);

  const fetchConversations = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }
      const data = await messagingApi.getConversations({ search: searchQuery });
      setConversations(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch conversations');
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchConversations(false);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout for search
    searchTimeoutRef.current = setTimeout(() => {
      fetchConversations(false);
    }, 500);
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await messagingApi.leaveConversation(conversationId);
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      setDeleteConfirm(null);
      setActiveDropdown(null);
    } catch (err) {
      setError('Failed to delete conversation');
    }
  };

  const toggleDropdown = (conversationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setActiveDropdown(activeDropdown === conversationId ? null : conversationId);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getConversationName = (conversation: Conversation) => {
    if (conversation.is_group) {
      return conversation.group_name || 'Group Chat';
    }
    if (conversation.other_participant) {
      return conversation.other_participant.display_name || conversation.other_participant.username;
    }
    return 'Unknown';
  };

  const getConversationImage = (conversation: Conversation) => {
    if (conversation.is_group) {
      return conversation.group_image_url || defaultProfileImage;
    }
    if (conversation.other_participant?.profile_photo) {
      return conversation.other_participant.profile_photo;
    }
    return defaultProfileImage;
  };

  const getLastMessagePreview = (conversation: Conversation) => {
    if (!conversation.last_message) {
      return 'No messages yet';
    }

    const message = conversation.last_message;
    // Handle case where sender might be undefined
    const senderName = message.sender?.display_name || message.sender?.username || 'Unknown';
    
    switch (message.message_type) {
      case 'image':
        return `${senderName}: 📷 Image`;
      case 'file':
        return `${senderName}: 📎 File`;
      case 'emoji':
        return `${senderName}: ${message.content || ''}`;
      default:
        const preview = message.content || '';
        return `${senderName}: ${preview.length > 50 ? preview.substring(0, 50) + '...' : preview}`;
    }
  };

  // Calculate total unread messages
  const getTotalUnreadCount = () => {
    return conversations.reduce((total, conv) => total + conv.unread_count, 0);
  };

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conversation => {
    if (!searchQuery.trim()) return true;
    
    const searchLower = searchQuery.toLowerCase();
    const conversationName = getConversationName(conversation).toLowerCase();
    const lastMessageContent = conversation.last_message?.content?.toLowerCase() || '';
    
    return conversationName.includes(searchLower) || lastMessageContent.includes(searchLower);
  });

  if (loading && conversations.length === 0) {
    return (
      <div className="w-full md:w-80 bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-500">Loading conversations...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full md:w-80 bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900">Messages</h3>
        <div className="flex items-center space-x-2">
          {/* Refresh Button */}
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            title="Refresh conversations"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          
          {/* Notification Bell with Badge */}
          <div className="relative">
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
              <Bell className="w-4 h-4" />
            </button>
            {getTotalUnreadCount() > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {getTotalUnreadCount() > 99 ? '99+' : getTotalUnreadCount()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4 relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              fetchConversations(false);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Conversations List */}
      <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {filteredConversations.length === 0 && !loading ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </p>
            <p className="text-gray-400 text-xs">
              {searchQuery ? 'Try a different search term' : 'Start a new conversation to get started'}
            </p>
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <div 
              key={conversation.id} 
              className={`p-3 rounded-lg cursor-pointer flex items-start gap-3 transition-colors group relative ${
                conversation.unread_count > 0 ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'
              }`}
              onClick={() => onSelectChat(conversation)}
            >
              <div className="flex-shrink-0 relative">
                <img 
                  src={getConversationImage(conversation)} 
                  alt={getConversationName(conversation)}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = defaultProfileImage;
                  }}
                />
                {conversation.unread_count > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <span className={`font-medium truncate ${
                    conversation.unread_count > 0 ? 'text-gray-900' : 'text-gray-700'
                  }`}>
                    {getConversationName(conversation)}
                    {conversation.is_group && (
                      <span className="ml-1 text-xs text-gray-500">
                        ({conversation.participants.length})
                      </span>
                    )}
                  </span>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {conversation.last_message ? formatTime(conversation.last_message.created_at) : ''}
                    </span>
                    
                    {/* More Actions Dropdown */}
                    <div className="relative">
                      <button
                        onClick={(e) => toggleDropdown(conversation.id, e)}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="w-3 h-3" />
                      </button>
                      
                      {activeDropdown === conversation.id && (
                        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[120px]">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirm(conversation.id);
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <p className={`text-sm mt-1 truncate ${
                  conversation.unread_count > 0 ? 'text-gray-900 font-medium' : 'text-gray-600'
                }`}>
                  {getLastMessagePreview(conversation)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Conversation</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete this conversation? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteConversation(deleteConfirm)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chats;