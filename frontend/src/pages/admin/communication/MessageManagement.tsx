import { useState } from 'react';
import { 
  MessageSquare, ArrowLeft, Reply, Send, Mail, Loader2
} from 'lucide-react';
import AlertModal from '../../../components/common/AlertModal';
import { getMessages, updateMessage, sendMessageResponse } from '../../../services/api';

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
      await sendMessageResponse(selectedMessage.id, responseText);
      
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

    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const closeAlert = () => {
    setAlert(prev => ({ ...prev, show: false }));
  };

  if (selectedMessage) {
    return (
      <div className="space-y-6">
        {/* Alert Modal */}
        <AlertModal
          isOpen={alert.show}
          onClose={closeAlert}
          title={alert.title}
          message={alert.message}
          type={alert.type}
        />

        <div className="bg-white border border-gray-300 rounded-lg">
          <div className="bg-blue-100 px-6 py-4 border-b border-gray-300 flex items-center">
            <button 
              onClick={() => setSelectedMessage(null)}
              className="mr-4 text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-gray-800">Message Details</h2>
          </div>
          <div className="p-6">
            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{selectedMessage.subject}</h3>
                  <p className="text-gray-600">
                    From: {selectedMessage.first_name} {selectedMessage.last_name}
                    <br />
                    Email: {selectedMessage.email}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatDate(selectedMessage.created_at)}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded text-sm ${
                  selectedMessage.is_read ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {selectedMessage.is_read ? 'Read' : 'Unread'}
                </span>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                  {selectedMessage.message}
                </p>
              </div>

              {selectedMessage.responded && selectedMessage.response_notes && (
                <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100">
                  <h4 className="font-semibold text-blue-800 mb-2">Your Response</h4>
                  <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                    {selectedMessage.response_notes}
                  </p>
                </div>
              )}

              <div className="border-t pt-6">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <Reply className="w-5 h-5 mr-2" />
                  Reply to Message
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={`Re: ${selectedMessage.subject}`}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Response</label>
                    <textarea
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Write your response..."
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      disabled={isSending}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={handleReply}
                      disabled={isSending || !responseText.trim()}
                      className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center ${
                        isSending ? 'opacity-75 cursor-not-allowed' : ''
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
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alert Modal */}
      <AlertModal
        isOpen={alert.show}
        onClose={closeAlert}
        title={alert.title}
        message={alert.message}
        type={alert.type}
      />

      <div className="bg-white border border-gray-300 rounded-lg">
        <div className="bg-blue-100 px-6 py-4 border-b border-gray-300">
          <h2 className="text-xl font-bold text-gray-800">Messages Inbox</h2>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow ${
                  message.is_read ? 'border-gray-200 bg-gray-50' : 'border-blue-200 bg-blue-50'
                }`}
                onClick={() => setSelectedMessage(message)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="font-semibold text-gray-800 mr-3">
                        {message.first_name} {message.last_name}
                      </h3>
                      {!message.is_read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                    <p className="text-gray-700 font-medium mb-1">{message.subject}</p>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {message.message.substring(0, 100)}...
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {formatDate(message.created_at)}
                    </p>
                  </div>
                  <div className="ml-4">
                    <MessageSquare className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3">Message Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{messages.length}</p>
                <p className="text-sm text-gray-600">Total Messages</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {messages.filter(m => !m.is_read).length}
                </p>
                <p className="text-sm text-gray-600">Unread Messages</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {messages.filter(m => m.responded).length}
                </p>
                <p className="text-sm text-gray-600">Responded Messages</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageManagement;