import { useState } from 'react';
import { Send } from 'lucide-react';
import AlertModal from '../../../components/common/AlertModal';

interface NewsletterFormProps {
  activeSubscribersCount: number;
  newThisMonthCount: number;
  onSend: (data: { subject: string; content: string; recipients: string }) => Promise<void>;
}

const NewsletterForm = ({
  activeSubscribersCount,
  newThisMonthCount,
  onSend
}: NewsletterFormProps) => {
  const [newsletterData, setNewsletterData] = useState({
    subject: '',
    content: '',
    recipients: 'all'
  });
  const [alert, setAlert] = useState({
    show: false,
    title: '',
    message: '',
    type: 'error' as 'success' | 'error' | 'warning' | 'info'
  });
  const [isSending, setIsSending] = useState(false); 

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewsletterData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const closeAlert = () => {
    setAlert(prev => ({ ...prev, show: false }));
  };

  const handleSend = async () => {
    if (!newsletterData.subject.trim() || !newsletterData.content.trim()) {
      setAlert({
        show: true,
        title: 'Validation Error',
        message: 'Subject and content are required',
        type: 'error'
      });
      return;
    }

    try {
      setIsSending(true); // Start loading state
      await onSend(newsletterData);
      setNewsletterData({
        subject: '',
        content: '',
        recipients: 'all'
      });
    } catch (error) {
      // Error handled by parent
    } finally {
      setIsSending(false); // End loading state
    }
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg">
      {/* Alert Modal */}
      <AlertModal
        isOpen={alert.show}
        onClose={closeAlert}
        title={alert.title}
        message={alert.message}
        type={alert.type}
      />

      <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
        <h2 className="font-semibold text-gray-800">Send Newsletter</h2>
        <p className="text-xs text-gray-500">{activeSubscribersCount} active subscribers</p>
      </div>

      <div className="p-4">
        <div className="space-y-4">
          {/* Subject Field */}
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

          {/* Recipients Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
            <select
              name="recipients"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newsletterData.recipients}
              onChange={handleInputChange}
            >
              <option value="all">
                All Active Subscribers ({activeSubscribersCount})
              </option>
              <option value="new">
                New This Month ({newThisMonthCount})
              </option>
            </select>
          </div>

          {/* Message Field */}
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

          {/* Send Button */}
          <div className="flex space-x-2">
            <button
              onClick={handleSend}
              className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center ${
                isSending ? 'opacity-75 cursor-not-allowed' : ''
              }`}
              disabled={!newsletterData.subject || !newsletterData.content || isSending}
            >
              {isSending ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 
                      5.373 0 12h4zm2 5.291A7.962 7.962 
                      0 014 12H0c0 3.042 1.135 5.824 
                      3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Now
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsletterForm;
