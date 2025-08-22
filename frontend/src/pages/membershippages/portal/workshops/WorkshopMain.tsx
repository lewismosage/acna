import { useState } from 'react';
import { Award, Users, MessageCircle } from 'lucide-react';
import WorkshopsTab from './WorkshopsTab';
import CollaborationOpportunitiesTab from './CollaborationOpportunitiesTab';
import RequestCollaborationTab from './RequestCollaborationTab';

const WorkshopComponent = () => {
  const [activeTab, setActiveTab] = useState('workshops');

  // Tab navigation
  const tabs = [
    { id: 'workshops', label: 'WORKSHOPS', icon: Award },
    { id: 'collaboration', label: 'COLLABORATION OPPORTUNITIES', icon: Users },
    { id: 'request', label: 'REQUEST COLLABORATION', icon: MessageCircle }
  ];

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'workshops':
        return <WorkshopsTab />;
      case 'collaboration':
        return <CollaborationOpportunitiesTab />;
      case 'request':
        return <RequestCollaborationTab />;
      default:
        return <WorkshopsTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b-2 border-gray-200">
        <div className="bg-white text-grey px-4 py-4 md:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Award className="w-8 h-8 mr-3" />
              <h1 className="text-xl md:text-2xl font-bold">Workshop & Collaboration Hub</h1>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-blue-700 overflow-x-auto">
          <nav className="px-4 md:px-6">
            <div className="flex space-x-0 min-w-max">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 font-medium text-sm flex items-center border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-yellow-400 text-white bg-blue-800'
                      : 'border-transparent text-blue-100 hover:text-white'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default WorkshopComponent;