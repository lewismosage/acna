import { useEffect, useState } from 'react';
import { 
  Mail, Users, MessageSquare, Send
} from 'lucide-react';
import NewsletterManagement from './NewsletterManagement';
import MessageManagement from './MessageManagement';
import { getSubscribers, sendNewsletter } from '../../../services/api';
import NewsletterForm from './NewsletterForm';
import AlertModal from '../../../components/common/AlertModal';

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
  const [activeTab, setActiveTab] = useState<'home' | 'subscribers' | 'messages'>('home');
  const [alert, setAlert] = useState({
    show: false,
    title: '',
    message: '',
    type: 'success' as 'success' | 'error' | 'warning' | 'info'
  });
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

  const handleSendNewsletter = async (data: {
    subject: string;
    content: string;
    recipients: string;
  }) => {
    try {
      await sendNewsletter(data);
      setAlert({
        show: true,
        title: 'Success',
        message: 'Newsletter sent successfully!',
        type: 'success'
      });
    } catch (err: any) {
      console.error('Failed to send newsletter:', err.message);
      setAlert({
        show: true,
        title: 'Error',
        message: 'Failed to send newsletter',
        type: 'error'
      });
    }
  };

  const closeAlert = () => {
    setAlert(prev => ({ ...prev, show: false }));
  };

  const activeSubscribers = subscribers.filter(sub => sub.is_active);
  const newThisMonth = activeSubscribers.filter(sub => {
    const subDate = new Date(sub.subscribed_at);
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return subDate > monthAgo;
  }).length;

  const tabs = [
    { id: 'home', label: 'HOME', icon: Mail },
    { id: 'subscribers', label: 'NEWSLETTER SUBSCRIBERS', icon: Users },
    { id: 'messages', label: 'MESSAGES', icon: MessageSquare }
  ];

  const RecentMessages = () => (
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
  );

  const HomeContent = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <NewsletterForm 
        activeSubscribersCount={activeSubscribers.length}
        newThisMonthCount={newThisMonth}
        onSend={handleSendNewsletter}
      />
      <RecentMessages />
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeContent />;
      case 'subscribers':
        return <NewsletterManagement initialSubscribers={subscribers} />;
      case 'messages':
        return <MessageManagement messages={messages} />;
      default:
        return <HomeContent />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
       {/* Alert Modal */}
        <AlertModal
        isOpen={alert.show}
        onClose={closeAlert}
        title={alert.title}
        message={alert.message}
        type={alert.type}
      />
      <div className="bg-white border-b-2 border-gray-200">
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

      <div className="max-w-7xl mx-auto px-4 py-6 md:px-6 md:py-8">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default CommunicationDashboard;