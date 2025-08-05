import { useState } from 'react';
import { X, Send } from 'lucide-react';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isCurrentUser: boolean;
}

interface MessagingModalProps {
  member: {
    firstName: string;
    lastName: string;
    profession: string;
    profileImage?: string;
  };
  onClose: () => void;
}

const MessagingModal = ({ member, onClose }: MessagingModalProps) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: member.firstName,
      content: 'Hi there, I would like to be part of your network as we are in similar disciplines',
      timestamp: '11:49 AM',
      isCurrentUser: false,
    },
    {
      id: '2',
      sender: 'You',
      content: 'Hello! I would be happy to connect and discuss potential collaborations.',
      timestamp: '11:52 AM',
      isCurrentUser: true,
    },
  ]);

  const handleSendMessage = () => {
    if (message.trim() === '') return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'You',
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isCurrentUser: true,
    };

    setMessages([...messages, newMessage]);
    setMessage('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img
              src={member.profileImage || 'https://via.placeholder.com/40'}
              alt={`${member.firstName} ${member.lastName}`}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h3 className="font-semibold text-gray-900">
                {member.firstName} {member.lastName}
              </h3>
              <p className="text-xs text-gray-500">{member.profession}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${
                  msg.isCurrentUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p>{msg.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    msg.isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                  }`}
                >
                  {msg.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Write a message..."
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSendMessage}
              disabled={message.trim() === ''}
              className={`p-2 rounded-full ${
                message.trim() === ''
                  ? 'text-gray-400'
                  : 'text-blue-600 hover:bg-blue-50'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagingModal;