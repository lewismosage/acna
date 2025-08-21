import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Download, 
  Eye, 
  Edit3, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Mail,
  Users,
  BarChart3,
  Search,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Star,
  Award,
  FileCheck,
  XCircle,
  MessageCircle,
  Phone,
  Loader,
  Calendar,
  TrendingUp,
  Target,
  DollarSign,
  EyeIcon
} from 'lucide-react';
import { abstractApi, Abstract, AbstractStatus, Author, AbstractAnalytics } from '../../../services/abstractApi';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

type PresentationType = 'Oral Presentation' | 'Poster Presentation' | 'E-Poster' | 'No Preference';
type AbstractCategory = 'Clinical Research' | 'Basic Science & Translational Research' | 'Healthcare Technology & Innovation' | 'Medical Education & Training' | 'Public Health & Policy' | 'Case Reports';

interface AbstractsTabProps {
  abstracts?: Abstract[];
}

interface ImportantDates {
  year: number;
  abstractSubmissionOpens: string;
  abstractSubmissionDeadline: string;
  abstractReviewCompletion: string;
  acceptanceNotifications: string;
  finalAbstractSubmission: string;
  conferencePresentation: string;
}

const AbstractsTab: React.FC<AbstractsTabProps> = ({ abstracts: initialAbstracts = [] }) => {
  const [abstracts, setAbstracts] = useState<Abstract[]>(initialAbstracts);
  const [selectedTab, setSelectedTab] = useState<'all' | 'review' | 'accepted' | 'revision' | 'rejected' | 'analytics'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedAbstract, setExpandedAbstract] = useState<number | null>(null);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [showDatesModal, setShowDatesModal] = useState(false);
  const [currentAbstract, setCurrentAbstract] = useState<Abstract | null>(null);
  const [notificationComments, setNotificationComments] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AbstractAnalytics | null>(null);
  const [importantDates, setImportantDates] = useState<ImportantDates>({
    year: 2026,
    abstractSubmissionOpens: 'January 15, 2026',
    abstractSubmissionDeadline: 'April 30, 2026',
    abstractReviewCompletion: 'June 15, 2026',
    acceptanceNotifications: 'July 1, 2026',
    finalAbstractSubmission: 'August 15, 2026',
    conferencePresentation: 'March 15-17, 2026',
  });
  const [stats, setStats] = useState({
    total: 0,
    underReview: 0,
    accepted: 0,
    revisionRequired: 0,
    rejected: 0,
  });

  // Load abstracts on component mount
  useEffect(() => {
    loadAbstracts();
  }, []);

  // Load analytics when tab changes
  useEffect(() => {
    if (selectedTab === 'analytics') {
      loadAnalytics();
    }
  }, [selectedTab]);

  const loadAbstracts = async () => {
    try {
      setLoading(true);
      const fetchedAbstracts = await abstractApi.getAbstracts();
      setAbstracts(fetchedAbstracts);
      updateStats(fetchedAbstracts);
    } catch (err) {
      console.error('Error loading abstracts:', err);
      setAbstracts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await abstractApi.getAnalytics();
      setAnalyticsData(data);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setAnalyticsData(null);
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (abstractsList: Abstract[]) => {
    setStats({
      total: abstractsList.length,
      underReview: abstractsList.filter(a => a.status === 'Under Review').length,
      accepted: abstractsList.filter(a => a.status === 'Accepted').length,
      revisionRequired: abstractsList.filter(a => a.status === 'Revision Required').length,
      rejected: abstractsList.filter(a => a.status === 'Rejected').length,
    });
  };

  const getStatusColor = (status: AbstractStatus) => {
    switch (status) {
      case 'Accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Under Review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Revision Required':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: AbstractStatus) => {
    switch (status) {
      case 'Accepted':
        return <CheckCircle className="w-4 h-4" />;
      case 'Under Review':
        return <Clock className="w-4 h-4" />;
      case 'Revision Required':
        return <AlertCircle className="w-4 h-4" />;
      case 'Rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const handleStatusChange = async (abstractId: number, newStatus: AbstractStatus) => {
    try {
      setUpdating(abstractId);
      const updatedAbstract = await abstractApi.updateAbstractStatus(abstractId, newStatus);
      setAbstracts(prev => 
        prev.map(abstract => 
          abstract.id === abstractId 
            ? { ...updatedAbstract, lastUpdated: new Date().toISOString().split('T')[0] }
            : abstract
        )
      );
      updateStats(abstracts.map(a => a.id === abstractId ? updatedAbstract : a));
    } catch (err) {
      console.error('Error updating abstract status:', err);
    } finally {
      setUpdating(null);
    }
  };

  const handleNotifyAbstract = (abstract: Abstract) => {
    setCurrentAbstract(abstract);
    setNotificationComments(abstract.reviewerComments || '');
    setShowNotifyModal(true);
  };

  const handleSendNotification = async () => {
  if (!currentAbstract) return;

  try {
    setUpdating(currentAbstract.id);
    
    // Use the new combined endpoint
    const result = await abstractApi.addCommentsAndNotify(currentAbstract.id, notificationComments);
    
    if (result.success) {
      // Update local state with the returned abstract data
      setAbstracts(prev => 
        prev.map(abstract => 
          abstract.id === currentAbstract.id
            ? { ...result.abstract, lastUpdated: new Date().toISOString().split('T')[0] }
            : abstract
        )
      );
      alert('Comments updated and notification sent successfully!');
    } else {
      alert('Failed to send notification: ' + result.message);
    }
    setShowNotifyModal(false);
  } catch (err) {
    console.error('Error sending notification:', err);
    
    // Handle the error properly with type checking
    const errorMessage = err instanceof Error 
      ? err.message 
      : 'An unexpected error occurred';
    
    alert('Failed to send notification: ' + errorMessage);
  } finally {
    setUpdating(null);
  }
};

 

  const toggleFeatured = async (abstractId: number) => {
    try {
      setUpdating(abstractId);
      const updatedAbstract = await abstractApi.toggleFeatured(abstractId);
      setAbstracts(prev => 
        prev.map(abstract => 
          abstract.id === abstractId ? updatedAbstract : abstract
        )
      );
    } catch (err) {
      console.error('Error toggling featured status:', err);
    } finally {
      setUpdating(null);
    }
  };

  const toggleExpand = (abstractId: number) => {
    setExpandedAbstract(expandedAbstract === abstractId ? null : abstractId);
  };

  const filteredAbstracts = abstracts.filter(abstract => {
    // Filter by selected tab
    const statusMatch = 
      selectedTab === 'all' ||
      (selectedTab === 'review' && abstract.status === 'Under Review') ||
      (selectedTab === 'accepted' && abstract.status === 'Accepted') ||
      (selectedTab === 'revision' && abstract.status === 'Revision Required') ||
      (selectedTab === 'rejected' && abstract.status === 'Rejected');
    
    // Filter by search term
    const searchMatch = 
      abstract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      abstract.authors.some(author => 
        `${author.firstName} ${author.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      abstract.keywords.some(keyword => 
        keyword.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    return statusMatch && searchMatch;
  });

  const handleExport = async () => {
    try {
      const blob = await abstractApi.exportAbstracts('csv');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'abstracts.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting abstracts:', err);
    }
  };

  const handleSendNotificationDirect = async (abstractId: number) => {
    try {
      setUpdating(abstractId);
      const result = await abstractApi.sendStatusNotification(abstractId);
      if (result.success) {
        alert('Notification sent successfully!');
      } else {
        alert('Failed to send notification: ' + result.message);
      }
    } catch (err) {
      console.error('Error sending notification:', err);
      alert('Failed to send notification');
    } finally {
      setUpdating(null);
    }
  };

  const handleSaveDates = async () => {
  try {
    setUpdating(-1);
    
    // Validate required fields with proper TypeScript typing
    const requiredFields: (keyof ImportantDates)[] = [
      'abstractSubmissionOpens',
      'abstractSubmissionDeadline', 
      'abstractReviewCompletion',
      'acceptanceNotifications',
      'finalAbstractSubmission',
      'conferencePresentation'
    ];
    
    const missingFields = requiredFields.filter(field => {
      const value = importantDates[field];
      return !value || (typeof value === 'string' && value.trim() === '');
    });
    
    if (missingFields.length > 0) {
      alert('Please fill in all date fields before saving.');
      return;
    }
    
    // Validate year
    if (!importantDates.year || importantDates.year < new Date().getFullYear()) {
      alert('Please enter a valid year (current year or future).');
      return;
    }
    
    const result = await abstractApi.updateImportantDates(importantDates);
    
    setShowDatesModal(false);
    
    // Show success message - handle potential response structure
    let successMessage = `Important dates for ${importantDates.year} saved successfully!`;
    if (result && typeof result === 'object' && 'message' in result) {
      successMessage = (result as any).message || successMessage;
    }
    alert(successMessage);
    
    // Refresh data if needed
    if (selectedTab === 'analytics') {
      loadAnalytics();
    }
    
  } catch (err: unknown) {
    console.error('Error saving important dates:', err);
    
    // Better error handling with proper TypeScript error typing
    let errorMessage = 'Failed to save important dates';
    
    if (err instanceof Error && err.message) {
      try {
        const parsedError = JSON.parse(err.message);
        if (parsedError.details && typeof parsedError.details === 'object') {
          // Handle Django validation errors
          const fieldErrors = Object.entries(parsedError.details)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('\n');
          errorMessage = `Validation errors:\n${fieldErrors}`;
        } else {
          errorMessage = parsedError.message || parsedError.error || errorMessage;
        }
      } catch {
        errorMessage = err.message;
      }
    } else if (typeof err === 'string') {
      errorMessage = err;
    }
    
    alert(`Error: ${errorMessage}`);
  } finally {
    setUpdating(null);
  }
};

  const renderAnalyticsTab = () => {
    if (!analyticsData) return null;

    return (
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Abstracts</p>
                <p className="text-3xl font-bold text-blue-900">{analyticsData.total}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-blue-600 text-sm mt-2">All submissions</p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Accepted</p>
                <p className="text-3xl font-bold text-green-900">{analyticsData.accepted}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-green-600 text-sm mt-2">Ready for conference</p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium">Under Review</p>
                <p className="text-3xl font-bold text-yellow-900">{analyticsData.underReview}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
            <p className="text-yellow-600 text-sm mt-2">Pending decision</p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Total Authors</p>
                <p className="text-3xl font-bold text-purple-900">{analyticsData.totalAuthors}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-purple-600 text-sm mt-2">Contributing researchers</p>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Abstract Status Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-blue-50">
              <div className="text-2xl font-bold text-blue-800">{analyticsData.underReview}</div>
              <div className="text-sm text-blue-600">Under Review</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-green-50">
              <div className="text-2xl font-bold text-green-800">{analyticsData.accepted}</div>
              <div className="text-sm text-green-600">Accepted</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-yellow-50">
              <div className="text-2xl font-bold text-yellow-800">{analyticsData.revisionRequired}</div>
              <div className="text-sm text-yellow-600">Revision Required</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-red-50">
              <div className="text-2xl font-bold text-red-800">{analyticsData.rejected}</div>
              <div className="text-sm text-red-600">Rejected</div>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Abstracts by Category</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(analyticsData.byCategory || {}).map(([category, count]) => (
              <div key={category} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-gray-800 font-medium text-sm">{category}</span>
                  <span className="text-gray-600 font-bold">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Presentation Types */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Presentation Preferences</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(analyticsData.byPresentationType || {}).map(([type, count]) => (
              <div key={type} className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-blue-800 font-medium text-sm">{type}</span>
                  <span className="text-blue-600 font-bold">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Countries */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contributing Countries</h3>
          <div className="flex flex-wrap gap-2">
            {(analyticsData.countries || []).map((country, index) => (
              <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                {country}
              </span>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={handleExport}
              className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-5 h-5 mr-2 text-blue-600" />
              <span className="text-sm font-medium">Export Data</span>
            </button>
            <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
              <span className="text-sm font-medium">Generate Report</span>
            </button>
            <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Mail className="w-5 h-5 mr-2 text-purple-600" />
              <span className="text-sm font-medium">Email Summary</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white border border-gray-300 rounded-lg">
        <div className="bg-blue-50 px-6 py-4 border-b border-gray-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <FileText className="w-7 h-7 mr-3 text-blue-600" />
                Abstract Submissions
              </h2>
              <p className="text-gray-600 mt-1">Manage and review submitted abstracts for the conference</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDatesModal(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center font-medium transition-colors"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Important Dates
              </button>
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
                { id: 'all', label: 'All Abstracts', count: stats.total },
                { id: 'review', label: 'Under Review', count: stats.underReview },
                { id: 'accepted', label: 'Accepted', count: stats.accepted },
                { id: 'revision', label: 'Revision Required', count: stats.revisionRequired },
                { id: 'rejected', label: 'Rejected', count: stats.rejected },
                { id: 'analytics', label: 'Analytics', count: 0 }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`py-2 border-b-2 font-medium text-sm transition-colors ${
                    selectedTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label} {tab.count > 0 && `(${tab.count})`}
                </button>
              ))}
            </nav>
            <div className="mt-3 md:mt-0 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search abstracts..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {selectedTab === 'analytics' ? (
            /* Analytics Tab */
            <div>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Abstract Analytics</h3>
                <p className="text-gray-600">Comprehensive analytics and insights about your abstracts</p>
              </div>
              {analyticsData ? renderAnalyticsTab() : (
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No analytics data available</h3>
                  <p className="text-gray-500">
                    Analytics data will appear once you have abstracts with submissions.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredAbstracts.length > 0 ? (
                filteredAbstracts.map((abstract) => (
                  <div key={abstract.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-3">
                            {abstract.isFeatured && (
                              <Star className="w-5 h-5 text-yellow-500 fill-current mt-1 flex-shrink-0" />
                            )}
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                                {abstract.title}
                              </h3>
                              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-3">
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                  {abstract.category}
                                </span>
                                <span className="flex items-center">
                                  <Users className="w-4 h-4 mr-1" />
                                  {abstract.authors.length} author{abstract.authors.length > 1 ? 's' : ''}
                                </span>
                                <span className="flex items-center">
                                  <Award className="w-4 h-4 mr-1" />
                                  {abstract.presentationPreference}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                            <div className="flex items-center">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(abstract.status)} flex items-center`}>
                                {getStatusIcon(abstract.status)}
                                <span className="ml-1">{abstract.status}</span>
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className="font-medium">Submitted:</span> {new Date(abstract.submittedDate).toLocaleDateString()}
                            </div>
                            <div className="flex items-center">
                              <span className="font-medium">Last Updated:</span> {new Date(abstract.lastUpdated).toLocaleDateString()}
                            </div>
                          </div>

                          {/* Keywords */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {abstract.keywords.map((keyword, index) => (
                              <span key={index} className="bg-gray-100 text-gray-800 px-2 py-1 text-xs rounded">
                                {keyword}
                              </span>
                            ))}
                          </div>

                          {/* Presenting Author */}
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-1">Presenting Author:</p>
                            {abstract.authors.filter(a => a.isPresenter).map((author, index) => (
                              <div key={index} className="text-sm">
                                <span className="font-medium text-gray-900">{author.firstName} {author.lastName}</span>
                                <span className="text-gray-600 ml-2">{author.institution}, {author.country}</span>
                                <span className="text-blue-600 ml-2">{author.email}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Expandable Content */}
                      {expandedAbstract === abstract.id && (
                        <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                          {/* Authors */}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">All Authors:</h4>
                            <div className="space-y-2">
                              {abstract.authors.map((author, index) => (
                                <div key={index} className="text-sm">
                                  <span className="font-medium text-gray-900">{author.firstName} {author.lastName}</span>
                                  {author.isCorresponding && (
                                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                      Corresponding
                                    </span>
                                  )}
                                  <div className="text-gray-600">{author.institution}, {author.country}</div>
                                  <div className="text-blue-600">{author.email}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Abstract Content */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Background/Objectives</h4>
                              <p className="text-gray-600 text-sm whitespace-pre-line">{abstract.background}</p>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Methods</h4>
                              <p className="text-gray-600 text-sm whitespace-pre-line">{abstract.methods}</p>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Results</h4>
                              <p className="text-gray-600 text-sm whitespace-pre-line">{abstract.results}</p>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Conclusions</h4>
                              <p className="text-gray-600 text-sm whitespace-pre-line">{abstract.conclusions}</p>
                            </div>
                          </div>

                          {/* Conflict of Interest */}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Conflict of Interest</h4>
                            <p className="text-gray-600 text-sm">{abstract.conflictOfInterest}</p>
                          </div>

                          {/* Reviewer Comments */}
                          {abstract.reviewerComments && (
                            <div className="bg-yellow-50 p-4 rounded-lg">
                              <h4 className="font-medium text-gray-900 mb-2">Reviewer Comments</h4>
                              <p className="text-gray-600 text-sm whitespace-pre-line">{abstract.reviewerComments}</p>
                              {abstract.assignedReviewer && (
                                <p className="text-sm text-gray-500 mt-2">- {abstract.assignedReviewer}</p>
                              )}
                            </div>
                          )}

                          {/* Files */}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Files:</h4>
                            <div className="flex flex-wrap gap-3">
                              {abstract.abstractFileUrl && (
                                <a 
                                  href={abstract.abstractFileUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                                >
                                  <FileText className="w-4 h-4 mr-1" />
                                  Abstract Document
                                </a>
                              )}
                              {abstract.ethicalApprovalUrl && (
                                <a 
                                  href={abstract.ethicalApprovalUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                                >
                                  <FileText className="w-4 h-4 mr-1" />
                                  Ethical Approval
                                </a>
                              )}
                              {abstract.supplementaryFilesUrl && (
                                <a 
                                  href={abstract.supplementaryFilesUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                                >
                                  <FileText className="w-4 h-4 mr-1" />
                                  Supplementary Materials
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Admin Actions */}
                      <div className="flex flex-wrap gap-3 mt-4">
                        <button 
                          onClick={() => toggleExpand(abstract.id)}
                          className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center text-sm font-medium transition-colors"
                        >
                          {expandedAbstract === abstract.id ? (
                            <>
                              <ChevronUp className="w-4 h-4 mr-2" />
                              Collapse
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4 mr-2" />
                              Expand
                            </>
                          )}
                        </button>

                        <button 
                          onClick={() => handleNotifyAbstract(abstract)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center text-sm font-medium transition-colors"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Add Comments & Notify
                        </button>

                        <button 
                          onClick={() => toggleFeatured(abstract.id)}
                          disabled={updating === abstract.id}
                          className={`border px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-colors ${
                            abstract.isFeatured 
                              ? 'border-yellow-300 bg-yellow-50 text-yellow-800 hover:bg-yellow-100' 
                              : 'border-gray-300 hover:bg-gray-50'
                          } ${updating === abstract.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {updating === abstract.id ? (
                            <Loader className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Star className={`w-4 h-4 mr-2 ${abstract.isFeatured ? 'fill-current' : ''}`} />
                          )}
                          {abstract.isFeatured ? 'Unfeature' : 'Feature'}
                        </button>

                        <div className="relative">
                          <select
                            value={abstract.status}
                            onChange={(e) => handleStatusChange(abstract.id, e.target.value as AbstractStatus)}
                            disabled={updating === abstract.id}
                            className="border border-gray-300 px-3 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                          >
                            <option value="Under Review">Under Review</option>
                            <option value="Accepted">Accept</option>
                            <option value="Revision Required">Request Revision</option>
                            <option value="Rejected">Reject</option>
                          </select>
                          {updating === abstract.id && (
                            <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
                              <Loader className="w-4 h-4 animate-spin" />
                            </div>
                          )}
                        </div>

                        <button 
                          onClick={() => handleSendNotificationDirect(abstract.id)}
                          disabled={updating === abstract.id}
                          className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center text-sm font-medium transition-colors disabled:opacity-50"
                        >
                          {updating === abstract.id ? (
                            <Loader className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Mail className="w-4 h-4 mr-2" />
                          )}
                          Notify Author
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No abstracts found</h3>
                  <p className="text-gray-500">
                    {searchTerm 
                      ? "No abstracts match your search criteria." 
                      : "No abstracts have been submitted yet."}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Notify Modal */}
      {showNotifyModal && currentAbstract && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Add Comments & Notify Author</h3>
                <button 
                  onClick={() => setShowNotifyModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">{currentAbstract.title}</h4>
                  <p className="text-sm text-gray-600">
                    Submitted by: {currentAbstract.authors.find(a => a.isPresenter)?.firstName}{' '}
                    {currentAbstract.authors.find(a => a.isPresenter)?.lastName}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comments for Author</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={6}
                    value={notificationComments}
                    onChange={(e) => setNotificationComments(e.target.value)}
                    placeholder="Add comments or feedback for the author (optional)..."
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowNotifyModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendNotification}
                  disabled={updating === currentAbstract.id}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                  {updating === currentAbstract.id && (
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  <Mail className="w-4 h-4 mr-2" />
                  Notify Author
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Important Dates Modal */}
      {showDatesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Set Important Dates</h3>
                <button 
                  onClick={() => setShowDatesModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Conference Year</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={importantDates.year}
                    onChange={(e) => setImportantDates(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Abstract Submission Opens</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={importantDates.abstractSubmissionOpens}
                      onChange={(e) => setImportantDates(prev => ({ ...prev, abstractSubmissionOpens: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Abstract Submission Deadline</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={importantDates.abstractSubmissionDeadline}
                      onChange={(e) => setImportantDates(prev => ({ ...prev, abstractSubmissionDeadline: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Abstract Review Completion</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={importantDates.abstractReviewCompletion}
                      onChange={(e) => setImportantDates(prev => ({ ...prev, abstractReviewCompletion: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Acceptance Notifications</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={importantDates.acceptanceNotifications}
                      onChange={(e) => setImportantDates(prev => ({ ...prev, acceptanceNotifications: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Final Abstract Submission</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={importantDates.finalAbstractSubmission}
                      onChange={(e) => setImportantDates(prev => ({ ...prev, finalAbstractSubmission: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Conference Presentation</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={importantDates.conferencePresentation}
                      onChange={(e) => setImportantDates(prev => ({ ...prev, conferencePresentation: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowDatesModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDates}
                  disabled={updating === -1}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                  {updating === -1 && (
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  <Calendar className="w-4 h-4 mr-2" />
                  Save Dates
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AbstractsTab;