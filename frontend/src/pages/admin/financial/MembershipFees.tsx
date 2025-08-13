import { Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../../../services/api';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import AlertModal from '../../../components/common/AlertModal';

interface Payment {
  id: number;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  payment_type: string;
  membership_type: string;
  user: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

const MembershipFees = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alert, setAlert] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'error'
  });

  useEffect(() => {
    const fetchAllPayments = async () => {
      try {
        setIsLoading(true);
        
        // First fetch all members
        const usersResponse = await api.get('/users/members/');
        const allPayments: Payment[] = [];
        
        // Then fetch payments for each member
        for (const user of usersResponse.data) {
          try {
            const paymentsResponse = await api.get(`/payments/user-payments/?user_id=${user.id}`);
            allPayments.push(...paymentsResponse.data);
          } catch (error) {
            console.error(`Failed to fetch payments for user ${user.id}`, error);
          }
        }
        
        setPayments(allPayments);
        
      } catch (error) {
        setAlert({
          isOpen: true,
          title: 'Error',
          message: 'Failed to fetch membership payments. Please try again later.',
          type: 'error'
        });
        console.error('Error fetching membership payments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllPayments();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Function to format the user's full name
  const formatUserName = (firstName: string, lastName: string) => {
    return `${firstName} ${lastName}`.trim();
  };

  const handleExport = async () => {
    try {
      setAlert({
        isOpen: true,
        title: 'Export Started',
        message: 'Your report is being prepared and will be downloaded shortly.',
        type: 'info'
      });
    } catch (error) {
      setAlert({
        isOpen: true,
        title: 'Export Failed',
        message: 'Could not generate the report. Please try again later.',
        type: 'error'
      });
    }
  };

  const closeAlert = () => {
    setAlert(prev => ({ ...prev, isOpen: false }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
        <div className="bg-gray-100 px-4 py-3 border-b border-gray-300 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Membership Fees</h2>
          <button 
            onClick={handleExport}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm"
            disabled={payments.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
        
        {payments.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-500 mb-4">No membership payments found in the system</div>
            <div className="text-sm text-gray-400">
              This could be because:
              <ul className="list-disc list-inside mt-2 text-left max-w-md mx-auto">
                <li>No payments have been processed yet</li>
                <li>Your account doesn't have permission to view payments</li>
              </ul>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Member Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Membership Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(payment.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatUserName(payment.user?.first_name, payment.user?.last_name)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                        {payment.payment_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                        {payment.membership_type.replace('_', ' ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        ${payment.amount} {payment.currency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          payment.status === 'succeeded' 
                            ? 'bg-green-100 text-green-800' 
                            : payment.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination would go here */}
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">1</span> to{' '}
                    <span className="font-medium">{payments.length}</span> of{' '}
                    <span className="font-medium">{payments.length}</span> results
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <AlertModal
        isOpen={alert.isOpen}
        onClose={closeAlert}
        title={alert.title}
        message={alert.message}
        type={alert.type}
      />
    </>
  );
};

export default MembershipFees;