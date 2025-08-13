import { Home, Users, Calendar, Gift } from 'lucide-react';
import { useState } from 'react';
import FinancialOverview from './FinancialOverview';
import MembershipFees from './MembershipFees';
import EventRegistrations from './EventRegistrations';
import TrainingPrograms from './TrainingPrograms';
import Donations from './Donations';

const FinancialManagement = () => {
  const [activeTab, setActiveTab] = useState('home');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return <FinancialOverview />;
      case 'membership':
        return <MembershipFees />;
      case 'events':
        return <EventRegistrations />;
      case 'training':
        return <TrainingPrograms />;
      case 'donations':
        return <Donations />;
      default:
        return <FinancialOverview />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Transactions Sidebar */}
      <div className="bg-white border border-gray-300 rounded-lg w-full md:w-64">
        <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
          <h2 className="font-semibold text-gray-800">Transactions</h2>
        </div>
        <div className="p-4 space-y-3">
          {[
            { id: 'home', icon: Home, label: 'Home', color: 'blue' },
            { id: 'membership', icon: Users, label: 'Membership Fees', color: 'blue' },
            { id: 'events', icon: Calendar, label: 'Event Registrations', color: 'green' },
            { id: 'training', icon: Calendar, label: 'Training Programs Fees', color: 'purple' },
            { id: 'donations', icon: Gift, label: 'Donations', color: 'orange' },
          ].map(({ id, icon: Icon, label, color }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center px-3 py-2 text-sm ${
                activeTab === id 
                  ? `bg-${color}-100 border-${color}-200 text-${color}-700` 
                  : `bg-${color}-50 hover:bg-${color}-100 border-${color}-200`
              } border rounded transition-colors text-left`}
            >
              <Icon className={`w-4 h-4 mr-3 text-${color}-600`} />
              <span className={`font-medium text-${color}-700`}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default FinancialManagement;