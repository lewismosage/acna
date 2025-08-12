import { useState, useEffect } from 'react';
import { Mail, Users, Send } from 'lucide-react';
import { getSubscribers } from '../../../services/api';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

interface Subscriber {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  subscribed_at: string;
  is_active: boolean;
}

interface NewsletterManagementProps {
  initialSubscribers: Subscriber[]; 
}

const NewsletterManagement = ({ initialSubscribers }: NewsletterManagementProps) => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>(initialSubscribers);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const subscribersPerPage = 10;

  useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        setIsLoading(true);
        const data = await getSubscribers();
        setSubscribers(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch subscribers');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscribers();
  }, []);

  const activeSubscribers = subscribers.filter(sub => sub.is_active);
  const newThisMonth = activeSubscribers.filter(sub => {
    const subDate = new Date(sub.subscribed_at);
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return subDate > monthAgo;
  }).length;

  // Get current subscribers for pagination
  const indexOfLastSubscriber = currentPage * subscribersPerPage;
  const indexOfFirstSubscriber = indexOfLastSubscriber - subscribersPerPage;
  const currentSubscribers = activeSubscribers.slice(indexOfFirstSubscriber, indexOfLastSubscriber);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (isLoading) {
    return <LoadingSpinner />; 
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Subscribers List */}
      <div className="bg-white border border-gray-300 rounded-lg">
        <div className="bg-blue-100 px-6 py-4 border-b border-gray-300">
          <h2 className="text-xl font-bold text-gray-800">Newsletter Subscribers</h2>
          <p className="text-sm text-gray-600 mt-1">
            Showing {indexOfFirstSubscriber + 1}-{Math.min(indexOfLastSubscriber, activeSubscribers.length)} of {activeSubscribers.length} active subscribers
          </p>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">First Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Last Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date Subscribed</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentSubscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{subscriber.first_name || '-'}</td>
                    <td className="px-4 py-3 text-sm">{subscriber.last_name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-blue-600">{subscriber.email}</td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(subscriber.subscribed_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        subscriber.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {subscriber.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="mt-6 flex justify-center">
            <nav className="inline-flex rounded-md shadow">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-l-md border border-gray-300 ${
                  currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              
              {Array.from({ length: Math.ceil(activeSubscribers.length / subscribersPerPage) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => paginate(index + 1)}
                  className={`px-3 py-1 border-t border-b border-gray-300 ${
                    currentPage === index + 1 
                      ? 'bg-blue-50 text-blue-600 border-blue-200' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === Math.ceil(activeSubscribers.length / subscribersPerPage)}
                className={`px-3 py-1 rounded-r-md border border-gray-300 ${
                  currentPage === Math.ceil(activeSubscribers.length / subscribersPerPage) 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </nav>
          </div>

          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3">Subscription Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{activeSubscribers.length}</p>
                <p className="text-sm text-gray-600">Active Subscribers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{newThisMonth}</p>
                <p className="text-sm text-gray-600">New This Month</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {subscribers.length > 0 
                    ? Math.round((activeSubscribers.length / subscribers.length) * 100) 
                    : 0}%
                </p>
                <p className="text-sm text-gray-600">Active Rate</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsletterManagement;