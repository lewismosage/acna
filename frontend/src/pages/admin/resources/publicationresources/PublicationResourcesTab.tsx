import React, { useState } from 'react';
import { BookOpen, Plus, BarChart3 } from 'lucide-react';
import PublicationsTab from './PublicationsTab';
import ResearchProjectsTab from './ResearchProjectsTab';
import ResearchPapersTab from './ResearchPapersTab';

type TabType = 'publications' | 'research-projects' | 'research-papers';

const PublicationResourcesTab = () => {
  const [selectedTab, setSelectedTab] = useState<TabType>('publications');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const getAddButtonText = () => {
    switch (selectedTab) {
      case 'publications':
        return 'Add Publication';
      case 'research-projects':
        return 'Add Active Research';
      case 'research-papers':
        return 'Add Recent Research Paper';
      default:
        return 'Add Publication';
    }
  };

  const handleAddButtonClick = () => {
    setShowCreateModal(true);
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'publications':
        return <PublicationsTab showCreateModal={showCreateModal} onShowCreateModalChange={setShowCreateModal} />;
      case 'research-projects':
          return <ResearchProjectsTab showCreateModal={showCreateModal} onShowCreateModalChange={setShowCreateModal} />;
      case 'research-papers':
        return <ResearchPapersTab />;
      default:
        return <PublicationsTab showCreateModal={showCreateModal} onShowCreateModalChange={setShowCreateModal} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white border border-gray-300 rounded-lg">
        <div className="bg-blue-50 px-6 py-4 border-b border-gray-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <BookOpen className="w-7 h-7 mr-3 text-blue-600" />
                Publication Resources
              </h2>
              <p className="text-gray-600 mt-1">Manage research papers, clinical guidelines, and educational resources</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleAddButtonClick}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center font-medium transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                {getAddButtonText()}
              </button>
              <button className="border border-blue-600 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 flex items-center font-medium transition-colors">
                <BarChart3 className="w-5 h-5 mr-2" />
                Analytics
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <nav className="flex space-x-8">
              {[
                { id: 'publications', label: 'Publications & Resources' },
                { id: 'research-projects', label: 'Active Research Projects' },
                { id: 'research-papers', label: 'Recent Research Papers' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as TabType)}
                  className={`py-2 border-b-2 font-medium text-sm transition-colors ${
                    selectedTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content Area - Render the appropriate tab component */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default PublicationResourcesTab;