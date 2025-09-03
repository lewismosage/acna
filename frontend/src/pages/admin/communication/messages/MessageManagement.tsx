import { useState } from 'react';
import { 
  MessageSquare, ArrowLeft, Reply, Send, Mail, Loader2, Inbox, MailOpen
} from 'lucide-react';
import AlertModal from '../../../../components/common/AlertModal';
import { getMessages, updateMessage, sendMessageResponse } from '../../../../services/api';

export interface ContactMessage {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  is_read: boolean;
  responded: boolean;
  response_notes?: string;
}

export interface MessageManagementProps {
  messages: ContactMessage[];
}

const MessageManagement = ({ messages: initialMessages }: MessageManagementProps) => {
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [messages, setMessages] = useState<ContactMessage[]>(initialMessages);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [responseText, setResponseText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    title: '',
    message: '',
    type: 'success' as 'success' | 'error' | 'warning' | 'info'
  });

  const handleReply = async () => {
    if (!selectedMessage || !responseText.trim()) {
      setAlert({
        show: true,
        title: 'Error',
        message: 'Please write a response before sending',
        type: 'error'
      });
      return;
    }

    setIsSending(true);
    try {
      // Send the response
      await sendMessageResponse(selectedMessage.id, {
        response: responseText,
        notes: '' 
      });
      
      // Update the message as responded
      const updatedMessage = await updateMessage(selectedMessage.id, {
        responded: true,
        response_notes: responseText,
        is_read: true
      });

      // Update the messages list
      setMessages(messages.map(msg => 
        msg.id === selectedMessage.id ? updatedMessage : msg
      ));

      // Update the selected message
      setSelectedMessage({
        ...selectedMessage,
        responded: true,
        response_notes: responseText,
        is_read: true
      });

      setAlert({
        show: true,
        title: 'Success',
        message: 'Response sent successfully',
        type: 'success'
      });

      // Clear the response
      setResponseText('');
    } catch (error) {
      setAlert({
        show: true,
        title: 'Error',
        message: 'Failed to send response',
        type: 'error'
      });
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const closeAlert = () => {
    setAlert(prev => ({ ...prev, show: false }));
  };

  const handleMessageClick = (message: ContactMessage) => {
    setSelectedMessage(message);
    // Mark as read when clicked
    if (!message.is_read) {
      const updatedMessages = messages.map(msg => 
        msg.id === message.id ? { ...msg, is_read: true } : msg
      );
      setMessages(updatedMessages);
    }
  };

  // Filter messages based on active tab
  const getFilteredMessages = () => {
    const sortedMessages = [...messages].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    switch (activeTab) {
      case 'unread':
        return sortedMessages.filter(msg => !msg.is_read);
      case 'all':
      default:
        return sortedMessages;
    }
  };

  const unreadCount = messages.filter(msg => !msg.is_read).length;
  const totalCount = messages.length;

  if (selectedMessage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AlertModal
          isOpen={alert.show}
          onClose={closeAlert}
          title={alert.title}
          message={alert.message}
          type={alert.type}
        />

        <div className="bg-white shadow-sm">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3">
            <div className="flex items-center">
              <button 
                onClick={() => setSelectedMessage(null)}
                className="mr-3 p-1 hover:bg-blue-500 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{selectedMessage.first_name} {selectedMessage.last_name}</h2>
                <p className="text-blue-100 text-sm">{selectedMessage.email}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selectedMessage.responded 
                    ? 'bg-green-500 text-white' 
                    : 'bg-yellow-500 text-white'
                }`}>
                  {selectedMessage.responded ? 'Replied' : 'Pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Message Content */}
          <div className="p-4">
            {/* Subject and timestamp */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{selectedMessage.subject}</h3>
              <p className="text-sm text-gray-500">{formatDate(selectedMessage.created_at)}</p>
            </div>
            
            {/* Original message */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 border-l-4 border-blue-500">
              <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                {selectedMessage.message}
              </p>
            </div>

            {/* Previous response if exists */}
            {selectedMessage.responded && selectedMessage.response_notes && (
              <div className="bg-blue-50 rounded-lg p-4 mb-6 border-l-4 border-blue-600">
                <div className="flex items-center mb-2">
                  <MailOpen className="w-4 h-4 text-blue-600 mr-2" />
                  <h4 className="font-semibold text-blue-800">Your Response</h4>
                </div>
                <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                  {selectedMessage.response_notes}
                </p>
              </div>
            )}

            {/* Reply section */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center mb-4">
                <Reply className="w-5 h-5 text-gray-600 mr-2" />
                <h4 className="font-semibold text-gray-800">Reply</h4>
              </div>
              
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600"
                    value={`Re: ${selectedMessage.subject}`}
                    readOnly
                  />
                </div>
                <div>
                  <textarea
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Write your response..."
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    disabled={isSending}
                  />
                </div>
                <button 
                  onClick={handleReply}
                  disabled={isSending || !responseText.trim()}
                  className={`w-full bg-blue-600 text-white py-3 rounded-lg font-medium flex items-center justify-center transition-colors ${
                    isSending || !responseText.trim()
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-blue-700 active:bg-blue-800'
                  }`}
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Reply
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AlertModal
        isOpen={alert.show}
        onClose={closeAlert}
        title={alert.title}
        message={alert.message}
        type={alert.type}
      />

      <div className="bg-white shadow-sm">
        {/* Header with Tabs */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          
          
          {/* Tabs */}
          <div className="flex border-b border-blue-500">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-3 px-4 text-center relative transition-colors ${
                activeTab === 'all' 
                  ? 'bg-white text-blue-700 font-medium' 
                  : 'text-blue-100 hover:text-white hover:bg-blue-500'
              }`}
            >
              <div className="flex items-center justify-center">
                <Inbox className="w-4 h-4 mr-2" />
                All Messages
                {totalCount > 0 && (
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    activeTab === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-800 text-blue-100'
                  }`}>
                    {totalCount}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`flex-1 py-3 px-4 text-center relative transition-colors ${
                activeTab === 'unread' 
                  ? 'bg-white text-blue-700 font-medium' 
                  : 'text-blue-100 hover:text-white hover:bg-blue-500'
              }`}
            >
              <div className="flex items-center justify-center">
                <Mail className="w-4 h-4 mr-2" />
                Unread
                {unreadCount > 0 && (
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    activeTab === 'unread'
                      ? 'bg-red-600 text-white'
                      : 'bg-red-500 text-white'
                  }`}>
                    {unreadCount}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Messages List */}
        <div className="divide-y divide-gray-100">
          {getFilteredMessages().length === 0 ? (
            <div className="p-8 text-center">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No messages found</p>
              <p className="text-gray-400 text-sm">
                {activeTab === 'unread' ? 'All messages have been read' : 'Your inbox is empty'}
              </p>
            </div>
          ) : (
            getFilteredMessages().map((message) => (
              <div 
                key={message.id} 
                className={`p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 active:bg-gray-100 ${
                  !message.is_read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
                onClick={() => handleMessageClick(message)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center mb-1">
                      <h3 className={`font-semibold truncate mr-2 ${
                        !message.is_read ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {message.first_name} {message.last_name}
                      </h3>
                      {!message.is_read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                      )}
                    </div>
                    <p className={`font-medium mb-1 truncate ${
                      !message.is_read ? 'text-blue-800' : 'text-gray-700'
                    }`}>
                      {message.subject}
                    </p>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                      {message.message.substring(0, 120)}...
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        {formatDate(message.created_at)}
                      </p>
                      <div className="flex items-center space-x-2">
                        {message.responded && (
                          <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">
                            Replied
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="ml-3 flex-shrink-0">
                    <MessageSquare className={`w-5 h-5 ${
                      !message.is_read ? 'text-blue-500' : 'text-gray-400'
                    }`} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageManagement;