import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, BarChart3, Download, Eye, TrendingUp, FileText, Upload } from 'lucide-react';
import PublicationsTab from './PublicationsTab';
import ResearchProjectsTab from './ResearchProjectsTab';
import ResearchPapersTab from './ResearchPapersTab';
import { publicationsApi, PublicationAnalytics } from '../../../../services/publicationsAPI';
import { researchProjectsApi, researchPapersApi, 
  ResearchProjectAnalytics, ResearchPaperAnalytics } from '../../../../services/researchprojectsApi';

type TabType = 'publications' | 'research-projects' | 'research-papers' | 'analytics';

const PublicationResourcesTab = () => {
  const [selectedTab, setSelectedTab] = useState<TabType>('publications');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [publicationAnalytics, setPublicationAnalytics] = useState<PublicationAnalytics | null>(null);
  const [researchProjectAnalytics, setResearchProjectAnalytics] = useState<ResearchProjectAnalytics | null>(null);
  const [researchPaperAnalytics, setResearchPaperAnalytics] = useState<ResearchPaperAnalytics | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Load analytics data
  useEffect(() => {
    if (selectedTab === 'analytics') {
      loadAllAnalytics();
    }
  }, [selectedTab]);

  const loadAllAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      const [pubAnalytics, projectAnalytics, paperAnalytics] = await Promise.all([
        publicationsApi.getAnalytics(),
        researchProjectsApi.getAnalytics(),
        researchPapersApi.getAnalytics(),
      ]);
      
      setPublicationAnalytics(pubAnalytics);
      setResearchProjectAnalytics(projectAnalytics);
      setResearchPaperAnalytics(paperAnalytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const getAddButtonText = () => {
    switch (selectedTab) {
      case 'publications':
        return 'Add Publication';
      case 'research-projects':
        return 'Add Active Research';
      case 'research-papers':
      case 'analytics':
        return null; // No add button for research papers and analytics
      default:
        return 'Add Publication';
    }
  };

  const handleAddButtonClick = () => {
    setShowCreateModal(true);
  };

  const renderAnalyticsTab = () => {
    if (loadingAnalytics) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!publicationAnalytics || !researchProjectAnalytics || !researchPaperAnalytics) {
      return (
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No analytics data available
          </h3>
          <p className="text-gray-500">
            Analytics data will appear once you have published resources with user engagement.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Overall Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">
                  Total Publications
                </p>
                <p className="text-3xl font-bold text-blue-900">
                  {publicationAnalytics.total}
                </p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-blue-600 text-sm mt-2">All publications & resources</p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">
                  Research Projects
                </p>
                <p className="text-3xl font-bold text-green-900">
                  {researchProjectAnalytics.total}
                </p>
              </div>
              <FileText className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-green-600 text-sm mt-2">Active & completed projects</p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">
                  Research Papers
                </p>
                <p className="text-3xl font-bold text-purple-900">
                  {researchPaperAnalytics.totalPapers}
                </p>
              </div>
              <Upload className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-purple-600 text-sm mt-2">Member submissions</p>
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-600 text-sm font-medium">
                  Total Downloads
                </p>
                <p className="text-3xl font-bold text-indigo-900">
                  {publicationAnalytics.totalDownloads.toLocaleString()}
                </p>
              </div>
              <Download className="w-8 h-8 text-indigo-600" />
            </div>
            <p className="text-indigo-600 text-sm mt-2">All publications</p>
          </div>
        </div>

        {/* Publications Analytics */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Publications & Resources Overview
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Total Views</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {publicationAnalytics.totalViews.toLocaleString()}
                  </p>
                </div>
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Monthly Downloads</p>
                  <p className="text-2xl font-bold text-green-900">
                    {publicationAnalytics.monthlyDownloads.toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Total Citations</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {publicationAnalytics.totalCitations.toLocaleString()}
                  </p>
                </div>
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Publication Status Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-green-50">
              <div className="text-2xl font-bold text-green-800">
                {publicationAnalytics.published}
              </div>
              <div className="text-sm text-green-600">Published</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-yellow-50">
              <div className="text-2xl font-bold text-yellow-800">
                {publicationAnalytics.draft}
              </div>
              <div className="text-sm text-yellow-600">Draft</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-gray-50">
              <div className="text-2xl font-bold text-gray-800">
                {publicationAnalytics.archived}
              </div>
              <div className="text-sm text-gray-600">Archived</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-blue-50">
              <div className="text-2xl font-bold text-blue-800">
                {publicationAnalytics.featured}
              </div>
              <div className="text-sm text-blue-600">Featured</div>
            </div>
          </div>
        </div>

        {/* Research Projects Analytics */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Research Projects Overview
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Active Projects</p>
                  <p className="text-2xl font-bold text-green-900">
                    {researchProjectAnalytics.active}
                  </p>
                </div>
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Total Investigators</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {researchProjectAnalytics.totalInvestigators}
                  </p>
                </div>
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Ethics Approved</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {researchProjectAnalytics.projectsWithEthicsApproval}
                  </p>
                </div>
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Project Status Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-yellow-50">
              <div className="text-xl font-bold text-yellow-800">
                {researchProjectAnalytics.planning}
              </div>
              <div className="text-xs text-yellow-600">Planning</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-blue-50">
              <div className="text-xl font-bold text-blue-800">
                {researchProjectAnalytics.recruiting}
              </div>
              <div className="text-xs text-blue-600">Recruiting</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-indigo-50">
              <div className="text-xl font-bold text-indigo-800">
                {researchProjectAnalytics.dataCollection}
              </div>
              <div className="text-xs text-indigo-600">Data Collection</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-green-50">
              <div className="text-xl font-bold text-green-800">
                {researchProjectAnalytics.completed}
              </div>
              <div className="text-xs text-green-600">Completed</div>
            </div>
          </div>
        </div>

        {/* Research Papers Analytics */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Research Papers Submissions Overview
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Under Review</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {researchPaperAnalytics.underReview}
                  </p>
                </div>
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Published</p>
                  <p className="text-2xl font-bold text-green-900">
                    {researchPaperAnalytics.published}
                  </p>
                </div>
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Total Authors</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {researchPaperAnalytics.totalAuthors}
                  </p>
                </div>
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Paper Status Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-blue-50">
              <div className="text-xl font-bold text-blue-800">
                {researchPaperAnalytics.submitted}
              </div>
              <div className="text-xs text-blue-600">Submitted</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-yellow-50">
              <div className="text-xl font-bold text-yellow-800">
                {researchPaperAnalytics.revisionRequired}
              </div>
              <div className="text-xs text-yellow-600">Revision Required</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-green-50">
              <div className="text-xl font-bold text-green-800">
                {researchPaperAnalytics.accepted}
              </div>
              <div className="text-xs text-green-600">Accepted</div>
            </div>
          </div>
        </div>

        {/* Publications by Category & Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Publications by Category */}
          {publicationAnalytics.publicationsByCategory && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Publications by Category
              </h3>
              <div className="space-y-3">
                {Object.entries(publicationAnalytics.publicationsByCategory).map(
                  ([category, count]) => (
                    <div key={category} className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-blue-800 font-medium">
                          {category}
                        </span>
                        <span className="text-blue-600 font-bold">{count}</span>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Research Projects by Type */}
          {researchProjectAnalytics.projectsByType && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Research Projects by Type
              </h3>
              <div className="space-y-3">
                {Object.entries(researchProjectAnalytics.projectsByType).map(
                  ([type, count]) => (
                    <div key={type} className="bg-green-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-green-800 font-medium">
                          {type}
                        </span>
                        <span className="text-green-600 font-bold">{count}</span>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>

        {/* Top Publications */}
        {publicationAnalytics.topPublications && publicationAnalytics.topPublications.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Top Publications by Downloads
              </h3>
              <button className="flex items-center text-sm text-blue-600 hover:text-blue-800">
                <Download className="w-4 h-4 mr-1" />
                Export Report
              </button>
            </div>
            <div className="space-y-3">
              {publicationAnalytics.topPublications.map((pub) => (
                <div
                  key={pub.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {pub.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {pub.type} • {pub.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-blue-600">
                      {pub.downloads.toLocaleString()} downloads
                    </p>
                    <p className="text-xs text-gray-500">
                      {pub.viewCount.toLocaleString()} views • {pub.citationCount} citations
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <span className="text-sm font-medium">Export All Data</span>
              <FileText className="w-4 h-4 text-gray-400" />
            </button>
            <button className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <span className="text-sm font-medium">Generate Report</span>
              <BarChart3 className="w-4 h-4 text-gray-400" />
            </button>
            <button className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <span className="text-sm font-medium">Bulk Update</span>
              <Upload className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'publications':
        return <PublicationsTab showCreateModal={showCreateModal} onShowCreateModalChange={setShowCreateModal} />;
      case 'research-projects':
        return <ResearchProjectsTab showCreateModal={showCreateModal} onShowCreateModalChange={setShowCreateModal} />;
      case 'research-papers':
        return <ResearchPapersTab />;
      case 'analytics':
        return renderAnalyticsTab();
      default:
        return <PublicationsTab showCreateModal={showCreateModal} onShowCreateModalChange={setShowCreateModal} />;
    }
  };

  // Determine if the add button should be shown
  const shouldShowAddButton = selectedTab !== 'research-papers' && selectedTab !== 'analytics';
  const addButtonText = getAddButtonText();

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
              {shouldShowAddButton && addButtonText && (
                <button 
                  onClick={handleAddButtonClick}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center font-medium transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  {addButtonText}
                </button>
              )}
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <nav className="flex space-x-8">
              {[
                { id: 'publications', label: 'Publications & Resources' },
                { id: 'research-projects', label: 'Active Research Projects' },
                { id: 'research-papers', label: 'Research Papers (Submissions by ACNA Members)' },
                { id: 'analytics', label: 'Analytics' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as TabType)}
                  className={`py-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
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
          
          {/* Additional info for research papers tab */}
          {selectedTab === 'research-papers' && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Research papers are submitted by ACNA members through the member portal. 
                This section displays all submitted papers for review and management purposes.
              </p>
            </div>
          )}
          
          {/* Additional info for analytics tab */}
          {selectedTab === 'analytics' && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Analytics Overview:</strong> Combined insights from Publications & Resources, Active Research Projects, and Research Paper Submissions.
              </p>
            </div>
          )}
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