import { useState } from 'react';
import { Search, Bell } from 'lucide-react';

interface Message {
  id: number;
  sender: string;
  preview: string;
  time: string;
  unread: boolean;
  profilePhoto?: string;
}

interface ChatsProps {
  onSelectChat: (sender: string) => void;
}

const Chats = ({ onSelectChat }: ChatsProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "Lydia Muchiri",
      preview: "You: Got it! Thanks..",
      time: "11:50 AM",
      unread: false,
      profilePhoto: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {
      id: 2,
      sender: "Prof. Dr. David Costa",
      preview: "Sponsored Your Cybersecurity MSc Awards - Start Anytime",
      time: "10:30 AM",
      unread: true,
      profilePhoto: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      id: 3,
      sender: "CYFRA'S TECHNOLOGIE...",
      preview: "You: Hello...",
      time: "Yesterday",
      unread: false,
      profilePhoto: 'https://randomuser.me/api/portraits/lego/5.jpg'
    },
    {
      id: 4,
      sender: "Emmanuel Nyakundi",
      preview: "Emmanuel: Hello ...",
      time: "Yesterday",
      unread: false,
      profilePhoto: 'https://randomuser.me/api/portraits/men/65.jpg'
    },
    {
      id: 5,
      sender: "Colina Gibson",
      preview: "Colina: Hello...",
      time: "2 days ago",
      unread: false,
      profilePhoto: 'https://randomuser.me/api/portraits/women/68.jpg'
    }
  ]);

  return (
    <div className="w-full md:w-80 bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900">Messages</h3>
        <div className="flex space-x-2">
          <button className="p-1 text-gray-500 hover:text-gray-700">
            <Search className="w-5 h-5" />
          </button>
          <button className="p-1 text-gray-500 hover:text-gray-700">
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`p-3 rounded-lg cursor-pointer flex items-start gap-3 ${message.unread ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
            onClick={() => onSelectChat(message.sender)}
          >
            <div className="flex-shrink-0">
              <img 
                src={message.profilePhoto || 'https://via.placeholder.com/40'} 
                alt={message.sender}
                className="w-10 h-10 rounded-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between">
                <span className={`font-medium ${message.unread ? 'text-gray-900' : 'text-gray-700'}`}>
                  {message.sender}
                </span>
                <span className="text-xs text-gray-500">{message.time}</span>
              </div>
              <p className={`text-sm mt-1 truncate ${message.unread ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                {message.preview}
              </p>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-4 text-blue-600 font-medium text-center py-2 hover:bg-blue-50 rounded-lg">
        See all messages
      </button>
    </div>
  );
};

export default Chats;