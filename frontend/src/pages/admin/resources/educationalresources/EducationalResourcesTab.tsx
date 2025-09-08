import React, { useState, useEffect } from 'react';
import { 
  Book, 
  BarChart3,
  AlertCircle
} from 'lucide-react';
import FactSheetResourcesTab from './FactSheetResourcesTab';
import CaseStudySubmissionsTab from './CaseStudySubmissionsTab';
import CreateResourceModal from './CreateResourceModal';
import AnalyticsTab from './AnalyticsTab';
import { educationalResourcesApi, EducationalResource, CaseStudySubmission, ResourceAnalytics } from '../../../../services/educationalResourcesApi';
import LoadingSpinner from '../../../../components/common/LoadingSpinner';

const EducationalResourcesTab: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'resources' | 'submissions' | 'analytics'>('resources');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for actual data from API
  const [resources, setResources] = useState<EducationalResource[]>([]);
  const [submissions, setSubmissions] = useState<CaseStudySubmission[]>([]);
  const [analytics, setAnalytics] = useState<ResourceAnalytics | null>(null);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [resourcesData, submissionsData, analyticsData] = await Promise.all([
        educationalResourcesApi.getAll(),
        educationalResourcesApi.getSubmissions(),
        educationalResourcesApi.getAnalytics()
      ]);
      
      setResources(resourcesData);
      setSubmissions(submissionsData);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleResourceCreated = (newResource: EducationalResource) => {
    setResources(prev => [newResource, ...prev]);
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={loadInitialData}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    switch (selectedTab) {
      case 'resources':
        return (
          <FactSheetResourcesTab
            resources={resources}
            setResources={setResources}
            onCreateNew={() => setShowCreateModal(true)}
          />
        );
      case 'submissions':
        return (
          <CaseStudySubmissionsTab
            submissions={submissions}
            setSubmissions={setSubmissions}
          />
        );
      case 'analytics':
        return <AnalyticsTab analytics={analytics} />;
      default:
        return null;
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
                <Book className="w-7 h-7 mr-3 text-blue-600" />
                Educational Resources Management
              </h2>
              <p className="text-gray-600 mt-1">Manage fact sheets, case studies, and educational content</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setSelectedTab('analytics')}
                className="border border-blue-600 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 flex items-center font-medium transition-colors"
              >
                <BarChart3 className="w-5 h-5 mr-2" />
                Analytics
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-4 border-b border-gray-200">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'resources', label: 'Educational Resources', count: resources.length },
              { id: 'submissions', label: 'Case Study Submissions', count: submissions.length },
              { id: 'analytics', label: 'Analytics', count: 0 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`py-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  selectedTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label} {tab.count > 0 && `(${tab.count})`}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>

      {/* Create Resource Modal */}
      {showCreateModal && (
        <CreateResourceModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onResourceCreated={handleResourceCreated}
        />
      )}
    </div>
  );
};

export default EducationalResourcesTab;