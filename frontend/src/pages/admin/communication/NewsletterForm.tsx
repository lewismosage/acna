import { useState } from 'react';
import { Send } from 'lucide-react';

interface NewsletterFormProps {
  activeSubscribersCount: number;
  newThisMonthCount: number;
  onSend: (data: { subject: string; content: string; recipients: string }) => Promise<void>;
}

const NewsletterForm = ({ activeSubscribersCount, newThisMonthCount, onSend }: NewsletterFormProps) => {
  const [newsletterData, setNewsletterData] = useState({
    subject: '',
    content: '',
    recipients: 'all'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewsletterData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSend = async () => {
    await onSend(newsletterData);
    setNewsletterData({
      subject: '',
      content: '',
      recipients: 'all'
    });
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg">
      <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
        <h2 className="font-semibold text-gray-800">Send Newsletter</h2>
        <p className="text-xs text-gray-500">{activeSubscribersCount} active subscribers</p>
      </div>
      <div className="p-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <input
              type="text"
              name="subject"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Newsletter subject..."
              value={newsletterData.subject}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
            <select 
              name="recipients"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newsletterData.recipients}
              onChange={handleInputChange}
            >
              <option value="all">All Active Subscribers ({activeSubscribersCount})</option>
              <option value="new">New This Month ({newThisMonthCount})</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
            <textarea
              name="content"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Write your message..."
              value={newsletterData.content}
              onChange={handleInputChange}
            />
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={handleSend}
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
  );
};

export default NewsletterForm;