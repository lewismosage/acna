import { useState, useEffect } from 'react';
import { Search, Bell, Plus, MessageCircle } from 'lucide-react';
import { messagingApi, type Conversation } from '../../../../services/messagingApi';

interface ChatsProps {
  onSelectChat: (conversation: Conversation) => void;
}

const Chats = ({ onSelectChat }: ChatsProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const data = await messagingApi.getConversations({ search: searchQuery });
      setConversations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch conversations');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Debounce search
    const timeoutId = setTimeout(() => {
      fetchConversations();
    }, 500);
    
    return () => clearTimeout(timeoutId);
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
      return conversation.group_image_url || 'https://via.placeholder.com/40';
    }
    if (conversation.other_participant) {
      return conversation.other_participant.profile_photo || 'https://via.placeholder.com/40';
    }
    return 'https://via.placeholder.com/40';
  };

  const getLastMessagePreview = (conversation: Conversation) => {
    if (!conversation.last_message) {
      return 'No messages yet';
    }

    const message = conversation.last_message;
    const sender = message.sender.display_name || message.sender.username;
    
    switch (message.message_type) {
      case 'image':
        return `${sender}: 📷 Image`;
      case 'file':
        return `${sender}: 📎 File`;
      case 'emoji':
        return `${sender}: ${message.content}`;
      default:
        const preview = message.content || '';
        return `${sender}: ${preview.length > 50 ? preview.substring(0, 50) + '...' : preview}`;
    }
  };

  if (loading && conversations.length === 0) {
    return (
      <div className="w-full md:w-80 bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading conversations...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full md:w-80 bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900">Messages</h3>
        <div className="flex space-x-2">
          <button className="p-1 text-gray-500 hover:text-gray-700">
            <Plus className="w-5 h-5" />
          </button>
          <button className="p-1 text-gray-500 hover:text-gray-700">
            <Bell className="w-5 h-5" />
          </button>
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
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Conversations List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {conversations.length === 0 && !loading ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No conversations yet</p>
            <p className="text-gray-400 text-xs">Start a new conversation to get started</p>
          </div>
        ) : (
          conversations.map((conversation) => (
            <div 
              key={conversation.id} 
              className={`p-3 rounded-lg cursor-pointer flex items-start gap-3 transition-colors ${
                conversation.unread_count > 0 ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'
              }`}
              onClick={() => onSelectChat(conversation)}
            >
              <div className="flex-shrink-0 relative">
                <img 
                  src={getConversationImage(conversation)} 
                  alt={getConversationName(conversation)}
                  className="w-10 h-10 rounded-full object-cover"
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
                  <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                    {conversation.last_message ? formatTime(conversation.last_message.created_at) : ''}
                  </span>
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

      {conversations.length > 0 && (
        <button 
          onClick={fetchConversations}
          className="w-full mt-4 text-blue-600 font-medium text-center py-2 hover:bg-blue-50 rounded-lg"
        >
          Refresh conversations
        </button>
      )}
    </div>
  );
};

export default Chats;