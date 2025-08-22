import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  MapPin, 
  Edit3, 
  Eye, 
  Globe,
  CheckCircle,
  AlertCircle,
  Archive,
  BarChart3,
  Mail,
  User,
  Trash2
} from 'lucide-react';
import CreateEventModal from './CreateConferencesModal';
import { conferencesApi } from '../../../../services/conferenceApi';
import type { 
  Conference,
  Registration,
  ConferenceAnalytics,
  ConferenceCreateUpdateData
} from '../../../../services/conferenceApi';
import LoadingSpinner from '../../../../components/common/LoadingSpinner';

interface ConferencesTabProps {
  conferences?: Conference[];
}

const ConferencesTab: React.FC<ConferencesTabProps> = ({ conferences: initialConferences }) => {
  const [conferences, setConferences] = useState<Conference[]>(initialConferences || []);
  const [selectedTab, setSelectedTab] = useState<'all' | 'upcoming' | 'completed' | 'registrations' | 'analytics'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingConference, setEditingConference] = useState<Conference | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [analyticsData, setAnalyticsData] = useState<ConferenceAnalytics | null>(null);

  // Fetch conferences from backend
  useEffect(() => {
    const fetchConferences = async () => {
      if (initialConferences && initialConferences.length > 0) {
        return; // Use initial data if available
      }
      
      setIsLoading(true);
      setError(null);
      try {
        const data = await conferencesApi.getAll();
        setConferences(data);
      } catch (err) {
        setError('Failed to load conferences. Please try again later.');
        console.error('Error fetching conferences:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConferences();
  }, [initialConferences]);

  // Fetch registrations when tab changes
  useEffect(() => {
    if (selectedTab === 'registrations') {
      const fetchRegistrations = async () => {
        setIsLoading(true);
        try {
          const data = await conferencesApi.getAll();
          const allRegistrations: Registration[] = [];
          
          data.forEach(conf => {
            if (conf.conference_registrations) {
              allRegistrations.push(...conf.conference_registrations);
            }
          });
          
          setRegistrations(allRegistrations);
        } catch (err) {
          setError('Failed to load registrations.');
          console.error('Error fetching registrations:', err);
        } finally {
          setIsLoading(false);
        }
      };

      fetchRegistrations();
    }
  }, [selectedTab]);

  // Fetch analytics when tab changes
  useEffect(() => {
    if (selectedTab === 'analytics') {
      const fetchAnalytics = async () => {
        setIsLoading(true);
        try {
          const data = await conferencesApi.getAnalytics();
          setAnalyticsData(data);
        } catch (err) {
          setError('Failed to load analytics data.');
          console.error('Error fetching analytics:', err);
        } finally {
          setIsLoading(false);
        }
      };

      fetchAnalytics();
    }
  }, [selectedTab]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registration_open':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'coming_soon':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'planning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'registration_open':
        return <CheckCircle className="w-4 h-4" />;
      case 'completed':
        return <Archive className="w-4 h-4" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'registration_open':
        return 'Registration Open';
      case 'coming_soon':
        return 'Coming Soon';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'planning':
        return 'Planning';
      default:
        return status;
    }
  };

  const handleStatusChange = async (conferenceId: number, newStatus: string) => {
    try {
      const updatedConference = await conferencesApi.updateStatus(conferenceId, newStatus);
      setConferences(prev => 
        prev.map(conf => 
          conf.id === conferenceId ? updatedConference : conf
        )
      );
    } catch (err) {
      setError('Failed to update conference status.');
      console.error('Error updating status:', err);
    }
  };

  const handleEditConference = (conference: Conference) => {
    setEditingConference(conference);
    setShowCreateModal(true);
  };

  const handleCreateConference = async (conferenceData: ConferenceCreateUpdateData) => {
    try {
      let result: Conference;
      
      if (editingConference && editingConference.id) {
        // Update existing conference
        result = await conferencesApi.update(editingConference.id, conferenceData);
        setConferences(prev => 
          prev.map(conf => 
            conf.id === editingConference.id ? result : conf
          )
        );
      } else {
        // Create new conference
        result = await conferencesApi.create(conferenceData);
        setConferences(prev => [result, ...prev]);
      }
      
      setShowCreateModal(false);
      setEditingConference(null);
    } catch (err) {
      setError(editingConference ? 'Failed to update conference.' : 'Failed to create conference.');
      console.error('Error saving conference:', err);
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingConference(null);
  };

  const handleDeleteConference = async (conferenceId: number) => {
    if (!confirm('Are you sure you want to delete this conference? This action cannot be undone.')) {
      return;
    }

    try {
      await conferencesApi.delete(conferenceId);
      setConferences(prev => prev.filter(conf => conf.id !== conferenceId));
    } catch (err) {
      setError('Failed to delete conference.');
      console.error('Error deleting conference:', err);
    }
  };

  const getProgressPercentage = (registered: number, capacity?: number) => {
    return capacity ? Math.round((registered / capacity) * 100) : 0;
  };

  const filteredConferences = conferences.filter(conference => {
    switch (selectedTab) {
      case 'upcoming':
        return conference.status === 'registration_open' || conference.status === 'coming_soon';
      case 'completed':
        return conference.status === 'completed';
      case 'registrations':
      case 'analytics':
        return true;
      default:
        return true;
    }
  });

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
                <p className="text-blue-600 text-sm font-medium">Total Conferences</p>
                <p className="text-3xl font-bold text-blue-900">{analyticsData.total_conferences}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-blue-600 text-sm mt-2">All time</p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Total Registrations</p>
                <p className="text-3xl font-bold text-green-900">{analyticsData.total_registrations.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-green-600 text-sm mt-2">Across all conferences</p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold text-purple-900">${analyticsData.total_revenue.toLocaleString()}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-purple-600 text-sm mt-2">Registration fees</p>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Upcoming Conferences</p>
                <p className="text-3xl font-bold text-orange-900">{analyticsData.upcoming_conferences}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-orange-600" />
            </div>
            <p className="text-orange-600 text-sm mt-2">Currently scheduled</p>
          </div>
        </div>

        {/* Conference Types */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Conference Types</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-blue-800 font-medium">In-person</span>
                <span className="text-blue-600 font-bold">{analyticsData.conferences_by_type.in_person || 0}</span>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-green-800 font-medium">Virtual</span>
                <span className="text-green-600 font-bold">{analyticsData.conferences_by_type.virtual || 0}</span>
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-purple-800 font-medium">Hybrid</span>
                <span className="text-purple-600 font-bold">{analyticsData.conferences_by_type.hybrid || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Conferences */}
        {analyticsData.top_conferences && analyticsData.top_conferences.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Conferences by Registration</h3>
            <div className="space-y-3">
              {analyticsData.top_conferences.map((conference) => (
                <div key={conference.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{conference.title}</p>
                    <p className="text-xs text-gray-500">{conference.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-blue-600">{conference.registration_count} registrations</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderRegistrationsTab = () => (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Conference Registrations</h3>
          <p className="text-gray-600 text-sm mt-1">Manage attendee registrations for all conferences</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attendee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registration Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registration Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {registrations.map((registration) => (
                <tr key={registration.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {registration.full_name || `${registration.first_name} ${registration.last_name}`}
                      </div>
                      <div className="text-sm text-gray-500">{registration.organization}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">{registration.email}</div>
                      <div className="text-sm text-gray-500">{registration.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      registration.registration_type === 'early_bird' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {registration.registration_type.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(registration.payment_status)}`}>
                      {registration.payment_status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {registration.registered_at ? new Date(registration.registered_at).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      <Mail className="w-4 h-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {registrations?.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No registrations found</h3>
            <p className="text-gray-500">No attendees have registered for any conferences yet.</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
          <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3">
            <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <title>Close</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
            </svg>
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-white border border-gray-300 rounded-lg">
        <div className="bg-blue-50 px-6 py-4 border-b border-gray-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Users className="w-7 h-7 mr-3 text-blue-600" />
                Conference Management
              </h2>
              <p className="text-gray-600 mt-1">Manage annual conferences, meetings, and events</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center font-medium transition-colors"
              >
                Create Conference
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
          <nav className="flex space-x-8">
            {[
              { id: 'all', label: 'All Conferences', count: conferences?.length || 0 },
              { 
                id: 'upcoming', 
                label: 'Upcoming', 
                count: conferences?.filter(c => c.status === 'registration_open' || c.status === 'coming_soon').length || 0
              },
              { 
                id: 'completed', 
                label: 'Completed', 
                count: conferences?.filter(c => c.status === 'completed').length || 0
              },
              { id: 'registrations', label: 'Registrations', count: registrations?.length || 0 }
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
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="p-6 text-center">
            <LoadingSpinner />
          </div>
        )}

        {/* Content Area */}
        {!isLoading && (
          <>
            {selectedTab === 'registrations' ? (
              renderRegistrationsTab()
            ) : selectedTab === 'analytics' ? (
              renderAnalyticsTab()
            ) : (
              <div className="p-6">
                <div className="space-y-6">
                  {filteredConferences.map((conference) => (
                    <div key={conference.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                      <div className="flex flex-col lg:flex-row">
                        {/* Conference Image */}
                        <div className="lg:w-1/4">
                          <div className="relative">
                            {conference.display_image_url || conference.image_url ? (
                              <img 
                                src={conference.display_image_url || conference.image_url || ''}
                                alt="Event preview" 
                                className="h-32 w-32 object-cover rounded-md"
                              />
                            ) : (
                              <div className="w-full h-48 lg:h-full bg-gray-200 flex items-center justify-center rounded-t-lg lg:rounded-l-lg lg:rounded-t-none">
                                <Users className="w-12 h-12 text-gray-400" />
                              </div>
                            )}
                            <div className="absolute top-3 left-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(conference.status)} flex items-center`}>
                                {getStatusIcon(conference.status)}
                                <span className="ml-1">{getStatusDisplayName(conference.status)}</span>
                              </span>
                            </div>
                            {conference.type && (
                              <div className="absolute top-3 right-3">
                                <span className="bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs font-medium">
                                  {conference.type.replace('_', ' ').toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Conference Details */}
                        <div className="lg:w-3/4 p-6">
                          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                                {conference.title}
                              </h3>
                              {conference.theme && (
                                <p className="text-blue-600 font-medium mb-3 text-sm">
                                  {conference.theme}
                                </p>
                              )}
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                <div className="space-y-2">
                                  <div className="flex items-center text-gray-600 text-sm">
                                    <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                                    <span className="font-medium">{conference.date}</span>
                                    {conference.time && <span className="ml-2">at {conference.time}</span>}
                                  </div>
                                  <div className="flex items-center text-gray-600 text-sm">
                                    <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                                    <div>
                                      <div className="font-medium">{conference.location}</div>
                                      {conference.venue && (
                                        <div className="text-xs text-gray-500">{conference.venue}</div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center text-gray-600 text-sm">
                                    <Globe className="w-4 h-4 mr-2 text-blue-600" />
                                    <span className="font-medium">{conference.type.replace('_', ' ').toUpperCase()}</span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3 text-center">
                                  <div className="bg-gray-50 p-2 rounded">
                                    <div className="text-lg font-bold text-blue-600">{conference.expected_attendees || 0}</div>
                                    <div className="text-xs text-gray-600">Expected</div>
                                  </div>
                                  <div className="bg-gray-50 p-2 rounded">
                                    <div className="text-lg font-bold text-blue-600">{conference.conference_speakers?.length || 0}</div>
                                    <div className="text-xs text-gray-600">Speakers</div>
                                  </div>
                                  <div className="bg-gray-50 p-2 rounded">
                                    <div className="text-lg font-bold text-blue-600">{conference.countries_represented || 0}</div>
                                    <div className="text-xs text-gray-600">Countries</div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Registration Progress */}
                              {conference.registration_count !== undefined && conference.capacity && (
                                <div className="mb-4">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-medium text-gray-700">Registration Progress</span>
                                    <span className="text-sm text-gray-600">
                                      {conference.registration_count} / {conference.capacity} ({getProgressPercentage(conference.registration_count, conference.capacity)}%)
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-blue-600 h-2 rounded-full" 
                                      style={{ width: `${getProgressPercentage(conference.registration_count, conference.capacity)}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                            {conference.description}
                          </p>

                          {/* Highlights */}
                          {conference.highlights && Array.isArray(conference.highlights) && conference.highlights.length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Event Highlights</h4>
                              <div className="flex flex-wrap gap-2">
                                {conference.highlights.map((highlight, idx) => (
                                  <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                    {highlight}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Admin Actions */}
                          <div className="flex flex-wrap gap-3">
                            <button 
                              onClick={() => handleEditConference(conference)}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center text-sm font-medium transition-colors"
                            >
                              <Edit3 className="w-4 h-4 mr-2" />
                              Edit Details
                            </button>

                            <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center text-sm font-medium transition-colors">
                              <Mail className="w-4 h-4 mr-2" />
                              Email Attendees
                            </button>

                            <div className="relative">
                              <select
                                value={conference.status}
                                onChange={(e) => handleStatusChange(conference.id!, e.target.value)}
                                className="border border-gray-300 px-3 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="planning">Planning</option>
                                <option value="registration_open">Registration Open</option>
                                <option value="coming_soon">Coming Soon</option>
                                <option value="completed">Mark as Completed</option>
                                <option value="cancelled">Cancel</option>
                              </select>
                            </div>

                            <button 
                              onClick={() => handleDeleteConference(conference.id!)}
                              className="text-red-600 hover:text-red-800 flex items-center text-sm font-medium"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </button>
                          </div>

                          {/* Metadata */}
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                              <span>Created: {conference.created_at ? new Date(conference.created_at).toLocaleDateString() : 'N/A'}</span>
                              <span>Last Updated: {conference.updated_at ? new Date(conference.updated_at).toLocaleDateString() : 'N/A'}</span>
                              <span>ID: #{conference.id}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredConferences.length === 0 && !isLoading && (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No conferences found</h3>
                    <p className="text-gray-500 mb-4">
                      {selectedTab === 'all' 
                        ? "You haven't created any conferences yet." 
                        : `No conferences in the ${selectedTab} category.`}
                    </p>
                    <button 
                      onClick={() => setShowCreateModal(true)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
                    >
                      Create Your First Conference
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Event Modal */}
      <CreateEventModal 
        isOpen={showCreateModal} 
        onClose={handleCloseModal}
        onSave={handleCreateConference}
        editingConference={editingConference}
      />
    </div>
  );
};

export default ConferencesTab;