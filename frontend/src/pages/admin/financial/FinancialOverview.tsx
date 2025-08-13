import { DollarSign, TrendingUp, Download } from 'lucide-react';
import StatsCard from './StatsCard';

const FinancialOverview = () => {
  return (
    <>
      {/* Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard title="Total Revenue" value="$45,680" icon={DollarSign} color="green" trend="+12% vs last month" />
        <StatsCard title="Donations" value="$2,340" icon={DollarSign} color="blue" />
        <StatsCard title="Monthly Growth" value="+8.5%" icon={TrendingUp} color="purple" />
      </div>

      {/* Recent Transactions */}
      <div className="bg-white border border-gray-300 rounded-lg mt-6">
        <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Recent Transactions</h2>
            <div className="flex space-x-2">
              <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                <Download className="w-4 h-4 inline mr-1" />
                Export Report
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <div className="space-y-3">
            {[
              { member: 'Dr. Sarah Johnson', amount: '$150', type: 'Membership Fee', status: 'Completed', date: '2025-08-12' },
              { member: 'Dr. Michael Chen', amount: '$75', type: 'Event Registration', status: 'Pending', date: '2025-08-11' },
              { member: 'Dr. Amara Okafor', amount: '$100', type: 'Donation', status: 'Completed', date: '2025-08-10' },
            ].map((transaction, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                <div>
                  <p className="font-medium text-sm">{transaction.member}</p>
                  <p className="text-xs text-gray-600">{transaction.type} • {transaction.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">{transaction.amount}</p>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    transaction.status === 'Completed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {transaction.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default FinancialOverview;