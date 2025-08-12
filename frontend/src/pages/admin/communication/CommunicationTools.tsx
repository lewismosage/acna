import { useEffect, useState } from 'react';
import { 
  Mail, Users, MessageSquare, Send
} from 'lucide-react';
import NewsletterManagement from './NewsletterManagement';
import MessageManagement from './MessageManagement';
import { getSubscribers, sendNewsletter } from '../../../services/api';

// Define message type
type Message = {
  id: number;
  firstName: string;
  lastName: string;
  subject: string;
  message: string;
  time: string;
  read: boolean;
};

interface Subscriber {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  subscribed_at: string;
  is_active: boolean;
}

const CommunicationDashboard = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [newsletterData, setNewsletterData] = useState({
    subject: '',
    content: '',
    recipients: 'all'
  });
  const [activeTab, setActiveTab] = useState<'home' | 'subscribers' | 'messages'>('home');
  const [messages] = useState<Message[]>([
    {
      id: 1,
      firstName: "Dr. Sarah",
      lastName: "Johnson",
      subject: "Question about membership renewal",
      message: "Hello, I have a question regarding my membership renewal...",
      time: "2 hours ago",
      read: false
    },
    {
      id: 2,
      firstName: "Dr. Michael",
      lastName: "Chen",
      subject: "Event registration issue",
      message: "I am experiencing difficulties registering for the upcoming conference...",
      time: "1 day ago",
      read: false
    },
    {
      id: 3,
      firstName: "Dr. Amara",
      lastName: "Okafor",
      subject: "Resource access request",
      message: "I would like to request access to the advanced EEG interpretation resources...",
      time: "2 days ago",
      read: true
    }
  ]);

  useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        const data = await getSubscribers();
        setSubscribers(data);
      } catch (err: any) {
        console.error('Failed to fetch subscribers:', err.message);
      }
    };

    fetchSubscribers();
  }, []);

  const handleSendNewsletter = async () => {
    try {
      await sendNewsletter(newsletterData);
      // Reset form after successful send
      setNewsletterData({
        subject: '',
        content: '',
        recipients: 'all'
      });
      alert('Newsletter sent successfully!');
    } catch (err: any) {
      console.error('Failed to send newsletter:', err.message);
      alert('Failed to send newsletter');
    }
  };

  const activeSubscribers = subscribers.filter(sub => sub.is_active);
  const newThisMonth = activeSubscribers.filter(sub => {
    const subDate = new Date(sub.subscribed_at);
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return subDate > monthAgo;
  }).length;

  // Tab navigation items
  const tabs = [
    { id: 'home', label: 'HOME', icon: Mail },
    { id: 'subscribers', label: 'NEWSLETTER SUBSCRIBERS', icon: Users },
    { id: 'messages', label: 'MESSAGES', icon: MessageSquare }
  ];

  // Home Tab Content
  const HomeContent = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white border border-gray-300 rounded-lg">
        <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
          <h2 className="font-semibold text-gray-800">Send Newsletter</h2>
          <p className="text-xs text-gray-500">{activeSubscribers.length} active subscribers</p>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Newsletter subject..."
                value={newsletterData.subject}
                onChange={(e) => setNewsletterData({...newsletterData, subject: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newsletterData.recipients}
                onChange={(e) => setNewsletterData({...newsletterData, recipients: e.target.value})}
              >
                <option value="all">All Active Subscribers ({activeSubscribers.length})</option>
                <option value="new">New This Month ({newThisMonth})</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Write your message..."
                value={newsletterData.content}
                onChange={(e) => setNewsletterData({...newsletterData, content: e.target.value})}
              />
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={handleSendNewsletter}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
                disabled={!newsletterData.subject || !newsletterData.content}
              >
                <Send className="w-4 h-4 mr-2" />
                Send Now
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-300 rounded-lg">
        <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
          <h2 className="font-semibold text-gray-800">Recent Messages</h2>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {messages.slice(0, 3).map((message) => (
              <div key={message.id} className="p-3 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{message.firstName} {message.lastName}</p>
                    <p className="text-sm text-gray-700">{message.subject}</p>
                    <p className="text-xs text-gray-500">{message.time}</p>
                  </div>
                  {!message.read && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full ml-2 mt-1"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={() => setActiveTab('messages')}
            className="w-full mt-4 text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            View All Messages →
          </button>
        </div>
      </div>
    </div>
  );

  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeContent />;
      case 'subscribers':
        return <NewsletterManagement initialSubscribers={subscribers} />
      case 'messages':
        return <MessageManagement messages={messages} />;
      default:
        return <HomeContent />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b-2 border-gray-200">
        {/* Navigation Tabs */}
        <div className="bg-blue-700 overflow-x-auto">
          <nav className="px-4 md:px-6">
            <div className="flex space-x-0 min-w-max">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as 'home' | 'subscribers' | 'messages')}
                  className={`px-3 py-3 md:px-4 md:py-4 text-xs md:text-sm font-medium border-r border-blue-600 last:border-r-0 hover:bg-blue-600 transition-colors whitespace-nowrap flex items-center ${
                    activeTab === id ? 'bg-blue-600 text-white' : 'text-blue-100'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2 md:mr-2" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 md:px-6 md:py-8">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default CommunicationDashboard;