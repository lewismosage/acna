import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Plus, Calendar, Clock, Edit3, 
  MapPin, CheckCircle, AlertCircle, Archive,
  Settings, BarChart3, Mail, TrendingUp,
  DollarSign, Eye as EyeIcon, Download,
  FileText, Users, Star, ChevronDown, ChevronUp
} from 'lucide-react';
import CreateWorkshopModal from './CreateWorkshopModal';
import CollaborationTab from './CollaborationTab';
import RegistrationsTab from './RegistrationTab';
import { workshopsApi, Workshop, WorkshopStatus, CreateWorkshopInput, WorkshopAnalytics } from '../../../../services/workshopAPI';

interface WorkshopsTabProps {
  workshops?: Workshop[];
}

const WorkshopsTab: React.FC<WorkshopsTabProps> = () => {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'completed' | 'planning' | 'registrations' | 'collaboration' | 'analytics'>('upcoming');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registrationsCount, setRegistrationsCount] = useState(0);
  const [collaborationsCount, setCollaborationsCount] = useState(0);
  const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null);
  const [analyticsData, setAnalyticsData] = useState<WorkshopAnalytics | null>(null);
  const [expandedWorkshops, setExpandedWorkshops] = useState<number[]>([]);

  // Fetch workshops from backend
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        // Fetch workshops
        const workshopsData = await workshopsApi.getAll();
        setWorkshops(workshopsData);
        
        // Fetch registrations count
        const registrations = await workshopsApi.getRegistrations();
        setRegistrationsCount(registrations.length);
        
        // Fetch collaborations count
        const collaborations = await workshopsApi.getCollaborations();
        setCollaborationsCount(collaborations.length);
        
      } catch (err) {
        setError('Failed to fetch data. Please try again later.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Load analytics when tab changes to analytics
  useEffect(() => {
    if (selectedTab === 'analytics') {
      loadAnalytics();
    }
  }, [selectedTab]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await workshopsApi.getAnalytics();
      setAnalyticsData(data);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setAnalyticsData(null);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to truncate text to two sentences
  const truncateToTwoSentences = (text: string): { truncated: string; hasMore: boolean } => {
    if (!text) return { truncated: '', hasMore: false };
    
    // Split by sentence endings (., !, ?)
    const sentences = text.match(/[^\.!?]+[\.!?]+/g) || [];
    
    if (sentences.length <= 2) {
      return { truncated: text, hasMore: false };
    }
    
    // Take first two sentences
    const truncated = sentences.slice(0, 2).join(' ').trim();
    return { truncated, hasMore: true };
  };

  // Function to render text with line breaks
  const renderWithLineBreaks = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const toggleExpand = (id: number) => {
    setExpandedWorkshops(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  };

  const handleSaveWorkshop = async (workshopData: CreateWorkshopInput) => {
    try {
      if (editingWorkshop) {
        // Update existing workshop
        const updatedWorkshop = await workshopsApi.update(editingWorkshop.id, workshopData);
        setWorkshops(prev => prev.map(w => w.id === editingWorkshop.id ? updatedWorkshop : w));
        setEditingWorkshop(null);
      } else {
        // Create new workshop
        const newWorkshop = await workshopsApi.create(workshopData);
        setWorkshops(prev => [...prev, newWorkshop]);
      }
      setShowCreateModal(false);
    } catch (err) {
      console.error('Error saving workshop:', err);
      setError('Failed to save workshop. Please try again.');
    }
  };

  const handleEditWorkshop = (workshop: Workshop) => {
    setEditingWorkshop(workshop);
    setShowCreateModal(true);
  };

  const getStatusColor = (status: WorkshopStatus) => {
    switch (status) {
      case 'Registration Open':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Planning':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: WorkshopStatus) => {
    switch (status) {
      case 'Registration Open':
        return <CheckCircle className="w-4 h-4" />;
      case 'In Progress':
        return <Clock className="w-4 h-4" />;
      case 'Planning':
        return <Settings className="w-4 h-4" />;
      case 'Completed':
        return <Archive className="w-4 h-4" />;
      case 'Cancelled':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const handleStatusChange = async (workshopId: number, newStatus: WorkshopStatus) => {
    try {
      await workshopsApi.updateStatus(workshopId, newStatus);
      setWorkshops(prev => 
        prev.map(workshop => 
          workshop.id === workshopId 
            ? { ...workshop, status: newStatus, updatedAt: new Date().toISOString().split('T')[0] }
            : workshop
        )
      );
    } catch (err) {
      console.error('Error updating workshop status:', err);
      setError('Failed to update workshop status. Please try again.');
    }
  };

  const getProgressPercentage = (registered: number, capacity: number) => {
    return Math.round((registered / capacity) * 100);
  };

  const filteredWorkshops = workshops.filter(workshop => {
    switch (selectedTab) {
      case 'upcoming':
        return ['Registration Open', 'In Progress'].includes(workshop.status);
      case 'completed':
        return workshop.status === 'Completed';
      case 'planning':
        return workshop.status === 'Planning';
      default:
        return true;
    }
  });

  // Analytics Tab Component
  const renderAnalyticsTab = () => {
    if (!analyticsData) {
      return (
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No analytics data available</h3>
          <p className="text-gray-500">
            Analytics data will appear once you have workshops with registrations.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Total Workshops</p>
                <p className="text-3xl font-bold text-green-900">{analyticsData.total}</p>
              </div>
              <BookOpen className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-green-600 text-sm mt-2">All time</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Registrations</p>
                <p className="text-3xl font-bold text-blue-900">{analyticsData.totalRegistrations.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-blue-600 text-sm mt-2">Across all workshops</p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Monthly Registrations</p>
                <p className="text-3xl font-bold text-purple-900">{analyticsData.monthlyRegistrations.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-purple-600 text-sm mt-2">Last 30 days</p>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold text-orange-900">
                  ${analyticsData.totalRevenue ? analyticsData.totalRevenue.toLocaleString() : '0'}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-orange-600" />
            </div>
            <p className="text-orange-600 text-sm mt-2">From paid workshops</p>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Workshop Status Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 rounded-lg bg-blue-50">
              <div className="text-2xl font-bold text-blue-800">{analyticsData.planning}</div>
              <div className="text-sm text-blue-600">Planning</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-green-50">
              <div className="text-2xl font-bold text-green-800">{analyticsData.registrationOpen}</div>
              <div className="text-sm text-green-600">Registration Open</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-yellow-50">
              <div className="text-2xl font-bold text-yellow-800">{analyticsData.inProgress}</div>
              <div className="text-sm text-yellow-600">In Progress</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-gray-50">
              <div className="text-2xl font-bold text-gray-800">{analyticsData.completed}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-red-50">
              <div className="text-2xl font-bold text-red-800">{analyticsData.cancelled}</div>
              <div className="text-sm text-red-600">Cancelled</div>
            </div>
          </div>
        </div>

        {/* Workshop Types */}
        {analyticsData.workshopsByType && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Workshop Types Distribution</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-blue-800 font-medium">Online</span>
                  <span className="text-blue-600 font-bold">{analyticsData.workshopsByType.Online || 0}</span>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-green-800 font-medium">In-Person</span>
                  <span className="text-green-600 font-bold">{analyticsData.workshopsByType['In-Person'] || 0}</span>
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-purple-800 font-medium">Hybrid</span>
                  <span className="text-purple-600 font-bold">{analyticsData.workshopsByType.Hybrid || 0}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top Workshops */}
        {analyticsData.topWorkshops && analyticsData.topWorkshops.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Top Workshops by Registration</h3>
              <button 
                onClick={async () => {
                  try {
                    const blob = await workshopsApi.exportWorkshops('csv');
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `workshops-report-${new Date().toISOString().split('T')[0]}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                  } catch (error) {
                    console.error('Error exporting workshops:', error);
                  }
                }}
                className="flex items-center text-sm text-green-600 hover:text-green-800"
              >
                <Download className="w-4 h-4 mr-1" />
                Export Report
              </button>
            </div>
            <div className="space-y-3">
              {analyticsData.topWorkshops.map((workshop) => (
                <div key={workshop.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{workshop.title}</p>
                    <p className="text-xs text-gray-500">{workshop.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600">{workshop.registered} registrations</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Revenue and Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration Performance</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average per workshop</span>
                <span className="font-bold text-gray-900">
                  {analyticsData.total > 0 ? Math.round(analyticsData.totalRegistrations / analyticsData.total) : 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Completion rate</span>
                <span className="font-bold text-green-600">
                  {analyticsData.total > 0 ? Math.round((analyticsData.completed / analyticsData.total) * 100) : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active workshops</span>
                <span className="font-bold text-blue-600">
                  {analyticsData.registrationOpen + analyticsData.inProgress}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={async () => {
                  try {
                    const blob = await workshopsApi.exportRegistrations(undefined, 'csv');
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `workshop-registrations-${new Date().toISOString().split('T')[0]}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                  } catch (error) {
                    console.error('Error exporting registrations:', error);
                  }
                }}
                className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium">Export All Registrations</span>
                <FileText className="w-4 h-4 text-gray-400" />
              </button>
              <button 
                onClick={async () => {
                  try {
                    const blob = await workshopsApi.exportCollaborations('csv');
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `collaborations-${new Date().toISOString().split('T')[0]}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                  } catch (error) {
                    console.error('Error exporting collaborations:', error);
                  }
                }}
                className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium">Export Collaborations</span>
                <Download className="w-4 h-4 text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="text-sm font-medium">Generate Monthly Report</span>
                <BarChart3 className="w-4 h-4 text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="text-sm font-medium">Email Summary</span>
                <Mail className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading && selectedTab !== 'analytics') {
    return (
      <div className="space-y-6">
        <div className="bg-white border border-gray-300 rounded-lg">
          <div className="bg-green-50 px-6 py-4 border-b border-gray-300">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <BookOpen className="w-7 h-7 mr-3 text-green-600" />
                  Workshop Management
                </h2>
                <p className="text-gray-600 mt-1">Loading workshops...</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-white border border-gray-300 rounded-lg">
          <div className="bg-red-50 px-6 py-4 border-b border-red-200">
            <div className="flex items-center">
              <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
              <div>
                <h2 className="text-xl font-bold text-red-800">Error Loading Workshops</h2>
                <p className="text-red-600 mt-1">{error}</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white border border-gray-300 rounded-lg">
        <div className="bg-green-50 px-6 py-4 border-b border-gray-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <BookOpen className="w-7 h-7 mr-3 text-green-600" />
                Workshop Management
              </h2>
              <p className="text-gray-600 mt-1">Manage workshops, instructors, and educational sessions</p>
            </div>
            <div className="flex gap-3">
              {selectedTab !== 'collaboration' && selectedTab !== 'analytics' && (
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center font-medium transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Workshop
                </button>
              )}
              <button 
                onClick={() => setSelectedTab('analytics')}
                className="border border-green-600 text-green-600 px-6 py-2 rounded-lg hover:bg-green-50 flex items-center font-medium transition-colors"
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
              { id: 'upcoming', label: 'Upcoming', count: workshops.filter(w => ['Registration Open', 'In Progress'].includes(w.status)).length },
              { id: 'completed', label: 'Completed', count: workshops.filter(w => w.status === 'Completed').length },
              { id: 'planning', label: 'Planning', count: workshops.filter(w => w.status === 'Planning').length },
              { id: 'registrations', label: 'Registrations', count: registrationsCount },
              { id: 'collaboration', label: 'Collaboration Opportunities', count: collaborationsCount },
              { id: 'analytics', label: 'Analytics', count: 0 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`py-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  selectedTab === tab.id
                    ? 'border-green-600 text-green-600'
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
          {selectedTab === 'collaboration' ? (
            <CollaborationTab />
          ) : selectedTab === 'registrations' ? (
            <RegistrationsTab workshops={workshops} />
          ) : selectedTab === 'analytics' ? (
            <div>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Workshop Analytics</h3>
                <p className="text-gray-600">Comprehensive analytics and insights about your workshops</p>
              </div>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : (
                renderAnalyticsTab()
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredWorkshops.map((workshop) => {
                const isExpanded = expandedWorkshops.includes(workshop.id);
                const { truncated: truncatedDescription, hasMore } = truncateToTwoSentences(workshop.description);

                return (
                  <div key={workshop.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                    <div className="flex flex-col lg:flex-row">
                      {/* Workshop Image */}
                      <div className="lg:w-1/4">
                        <div className="relative">
                          <img
                            src={workshop.imageUrl}
                            alt={workshop.title}
                            className="w-full h-48 lg:h-full object-cover rounded-t-lg lg:rounded-l-lg lg:rounded-t-none"
                          />
                          <div className="absolute top-3 left-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(workshop.status)} flex items-center`}>
                              {getStatusIcon(workshop.status)}
                              <span className="ml-1">{workshop.status}</span>
                            </span>
                          </div>
                          <div className="absolute top-3 right-3">
                            <span className="bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs font-medium">
                              {workshop.type}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Workshop Details */}
                      <div className="lg:w-3/4 p-6">
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                              {workshop.title}
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                              <div className="space-y-2">
                                <div className="flex items-center text-gray-600 text-sm">
                                  <Calendar className="w-4 h-4 mr-2 text-green-600" />
                                  <span className="font-medium">{workshop.date}</span>
                                </div>
                                <div className="flex items-center text-gray-600 text-sm">
                                  <Clock className="w-4 h-4 mr-2 text-green-600" />
                                  <span className="font-medium">{workshop.time}</span>
                                </div>
                                <div className="flex items-center text-gray-600 text-sm">
                                  <MapPin className="w-4 h-4 mr-2 text-green-600" />
                                  <div>
                                    <div className="font-medium">{workshop.location}</div>
                                    {workshop.venue && (
                                      <div className="text-xs text-gray-500">{workshop.venue}</div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3 text-center">
                                <div className="bg-gray-50 p-2 rounded">
                                  <div className="text-lg font-bold text-green-600">{workshop.duration}</div>
                                  <div className="text-xs text-gray-600">Duration</div>
                                </div>
                                <div className="bg-gray-50 p-2 rounded">
                                  <div className="text-lg font-bold text-green-600">{workshop.instructor.split(' ')[0]}</div>
                                  <div className="text-xs text-gray-600">Instructor</div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Registration Progress */}
                            <div className="mb-4">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium text-gray-700">Registration Progress</span>
                                <span className="text-sm text-gray-600">
                                  {workshop.registered} / {workshop.capacity} ({getProgressPercentage(workshop.registered, workshop.capacity)}%)
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-600 h-2 rounded-full" 
                                  style={{ width: `${getProgressPercentage(workshop.registered, workshop.capacity)}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* TRUNCATED DESCRIPTION - shows only when NOT expanded */}
                        {!isExpanded && (
                          <div className="mb-4">
                            <p className="text-gray-600 text-sm leading-relaxed">
                              {renderWithLineBreaks(truncatedDescription)}
                            </p>
                            {hasMore && (
                              <button
                                onClick={() => toggleExpand(workshop.id)}
                                className="text-green-600 hover:text-green-800 text-sm font-medium mt-1"
                              >
                                Read more...
                              </button>
                            )}
                          </div>
                        )}

                        {/* Price */}
                        {workshop.price && (
                          <div className="mb-4">
                            <span className="text-lg font-bold text-green-600">${workshop.price}</span>
                          </div>
                        )}

                        {/* Expandable Content */}
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                            {/* FULL DESCRIPTION */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h4 className="font-medium text-gray-900 mb-2">Full Description</h4>
                              <p className="text-gray-600 text-sm whitespace-pre-line">
                                {renderWithLineBreaks(workshop.description)}
                              </p>
                            </div>

                            {/* Prerequisites */}
                            {workshop.prerequisites && workshop.prerequisites.length > 0 && (
                              <div className="bg-yellow-50 p-4 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-2">Prerequisites</h4>
                                <ul className="text-gray-600 text-sm list-disc list-inside space-y-1">
                                  {workshop.prerequisites.map((prerequisite, index) => (
                                    <li key={index}>{prerequisite}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Materials & Resources */}
                            {workshop.materials && workshop.materials.length > 0 && (
                              <div className="bg-green-50 p-4 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-2">Materials & Resources</h4>
                                <ul className="text-gray-600 text-sm list-disc list-inside space-y-1">
                                  {workshop.materials.map((material, index) => (
                                    <li key={index}>{material}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Additional Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Instructor Details */}
                              <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <h4 className="font-medium text-gray-900 mb-2">Instructor Information</h4>
                                <div className="space-y-2 text-sm">
                                  <div>
                                    <span className="font-medium">Name: </span>
                                    <span className="text-gray-600">{workshop.instructor}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Workshop Metadata */}
                              <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <h4 className="font-medium text-gray-900 mb-2">Workshop Details</h4>
                                <div className="space-y-2 text-sm text-gray-600">
                                  <div>
                                    <span className="font-medium">Max Participants: </span>
                                    {workshop.capacity}
                                  </div>
                                  <div>
                                    <span className="font-medium">Created: </span>
                                    {workshop.createdAt}
                                  </div>
                                  <div>
                                    <span className="font-medium">Updated: </span>
                                    {workshop.updatedAt}
                                  </div>
                                  <div>
                                    <span className="font-medium">ID: </span>
                                    #{workshop.id}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Admin Actions */}
                        <div className="flex flex-wrap gap-3">
                          <button 
                            onClick={() => toggleExpand(workshop.id)}
                            className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center text-sm font-medium transition-colors"
                          >
                            {isExpanded ? (
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
                            onClick={() => handleEditWorkshop(workshop)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center text-sm font-medium transition-colors"
                          >
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit Details
                          </button>

                          <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center text-sm font-medium transition-colors">
                            <Mail className="w-4 h-4 mr-2" />
                            Email Participants
                          </button>

                          <div className="relative">
                            <select
                              value={workshop.status}
                              onChange={(e) => handleStatusChange(workshop.id, e.target.value as WorkshopStatus)}
                              className="border border-gray-300 px-3 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                              <option value="Planning">Planning</option>
                              <option value="Registration Open">Registration Open</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredWorkshops.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No workshops found</h3>
                  <p className="text-gray-500 mb-4">
                    {selectedTab === 'upcoming' 
                      ? "No upcoming workshops scheduled." 
                      : `No workshops in the ${selectedTab} category.`}
                  </p>
                  <button 
                    onClick={() => setShowCreateModal(true)}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-medium"
                  >
                    Create Your First Workshop
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Workshop Modal */}
      <CreateWorkshopModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingWorkshop(null);
        }}
        onSave={handleSaveWorkshop}
        initialData={editingWorkshop || undefined}
      />
    </div>
  );
};

export default WorkshopsTab;