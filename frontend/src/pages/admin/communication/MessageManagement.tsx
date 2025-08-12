import { useState } from 'react';
import { 
  MessageSquare, ArrowLeft, Reply, Send, Mail 
} from 'lucide-react';



export type Message = {
  id: number;
  firstName: string;
  lastName: string;
  subject: string;
  message: string;
  time: string;
  read: boolean;
};

export interface Subscriber {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  subscribed_at: string;
  is_active: boolean;
}


// Mock data for messages
const mockMessages = [
  {
    id: 1,
    firstName: "Dr. Sarah",
    lastName: "Johnson",
    subject: "Question about membership renewal",
    message: "Hello, I hope this email finds you well. I have a question regarding my membership renewal process. Could you please provide information about the renewal deadline and any updated fees? I want to ensure I don't miss any important dates. Thank you for your assistance.",
    time: "2 hours ago",
    read: false
  },
  {
    id: 2,
    firstName: "Dr. Michael",
    lastName: "Chen",
    subject: "Event registration issue",
    message: "I am experiencing difficulties registering for the upcoming pediatric neurology conference. The registration form seems to be encountering an error when I try to submit my information. Could you please help resolve this issue or let me know if there's an alternative registration method? Thank you.",
    time: "1 day ago",
    read: false
  },
  {
    id: 3,
    firstName: "Dr. Amara",
    lastName: "Okafor",
    subject: "Resource access request",
    message: "I would like to request access to the advanced EEG interpretation resources that were mentioned in the recent newsletter. I believe these materials would be very beneficial for my current research project on pediatric epilepsy. Please let me know the process for accessing these resources.",
    time: "2 days ago",
    read: true
  },
  {
    id: 4,
    firstName: "Prof. David",
    lastName: "Martinez",
    subject: "Collaboration opportunity",
    message: "I am reaching out to discuss a potential collaboration opportunity between our institutions. We are working on a multi-center study on cerebral palsy treatment outcomes and would love to have ACNA participate. Would it be possible to schedule a meeting to discuss this further?",
    time: "3 days ago",
    read: true
  },
  {
    id: 5,
    firstName: "Dr. Lisa",
    lastName: "Thompson",
    subject: "Thank you for the webinar",
    message: "I wanted to express my gratitude for the excellent webinar on advanced pediatric stroke management that was held last week. The content was incredibly informative and will definitely help improve my clinical practice. Are there any similar sessions planned for the coming months?",
    time: "5 days ago",
    read: true
  }
];

interface MessageManagementProps {
  messages: Message[];
}

const MessageManagement = ({ messages }: MessageManagementProps) => {
  const [selectedMessage, setSelectedMessage] = useState<any>(null);

  const handleReply = (email: string) => {
    // In a real app, this would open a reply compose modal
    console.log(`Preparing reply to: ${email}`);
    alert(`Reply window would open for: ${email}`);
  };

  if (selectedMessage) {
    return (
      <div className="space-y-6">
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
                  <p className="text-gray-600">From: {selectedMessage.firstName} {selectedMessage.lastName}</p>
                  <p className="text-sm text-gray-500">{selectedMessage.time}</p>
                </div>
                <span className={`px-3 py-1 rounded text-sm ${
                  selectedMessage.read ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {selectedMessage.read ? 'Read' : 'Unread'}
                </span>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="text-gray-800 leading-relaxed">{selectedMessage.message}</p>
              </div>

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
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleReply(`${selectedMessage.firstName.toLowerCase()}.${selectedMessage.lastName.toLowerCase()}@acna.org`)}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Reply
                    </button>
                    <button className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
                      Save Draft
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
      <div className="bg-white border border-gray-300 rounded-lg">
        <div className="bg-blue-100 px-6 py-4 border-b border-gray-300">
          <h2 className="text-xl font-bold text-gray-800">Messages Inbox</h2>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {mockMessages.map((message) => (
              <div 
                key={message.id} 
                className={`p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow ${
                  message.read ? 'border-gray-200 bg-gray-50' : 'border-blue-200 bg-blue-50'
                }`}
                onClick={() => setSelectedMessage(message)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="font-semibold text-gray-800 mr-3">
                        {message.firstName} {message.lastName}
                      </h3>
                      {!message.read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                    <p className="text-gray-700 font-medium mb-1">{message.subject}</p>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {message.message.substring(0, 100)}...
                    </p>
                    <p className="text-xs text-gray-500 mt-2">{message.time}</p>
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
                <p className="text-2xl font-bold text-blue-600">{mockMessages.length}</p>
                <p className="text-sm text-gray-600">Total Messages</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {mockMessages.filter(m => !m.read).length}
                </p>
                <p className="text-sm text-gray-600">Unread Messages</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {mockMessages.filter(m => m.read).length}
                </p>
                <p className="text-sm text-gray-600">Read Messages</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageManagement;