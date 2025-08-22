// src/pages/admin/events/workshop/WorkshopsTab.tsx
import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Plus, Calendar, Clock, Edit3, 
  MapPin, CheckCircle, AlertCircle, Archive,
  Settings, BarChart3, Mail
} from 'lucide-react';
import CreateWorkshopModal from './CreateWorkshopModal';
import CollaborationTab from './CollaborationTab';
import RegistrationsTab from './RegistrationTab';
import { workshopsApi, Workshop, WorkshopStatus, CreateWorkshopInput } from '../../../../services/workshopAPI';

interface WorkshopsTabProps {
  workshops?: Workshop[];
}

const WorkshopsTab: React.FC<WorkshopsTabProps> = () => {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'completed' | 'planning' | 'registrations' | 'collaboration'>('upcoming');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registrationsCount, setRegistrationsCount] = useState(0);
  const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null);

  // Fetch workshops from backend
  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        setLoading(true);
        const workshopsData = await workshopsApi.getAll();
        setWorkshops(workshopsData);
      } catch (err) {
        setError('Failed to fetch workshops. Please try again later.');
        console.error('Error fetching workshops:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkshops();
  }, []);

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

useEffect(() => {
  const fetchRegistrationsCount = async () => {
    try {
      const registrations = await workshopsApi.getRegistrations();
      setRegistrationsCount(registrations.length);
    } catch (err) {
      console.error('Error fetching registrations count:', err);
    }
  };

  fetchRegistrationsCount();
}, []);

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

  // Loading state
  if (loading) {
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
              {selectedTab !== 'collaboration' && (
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center font-medium transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Workshop
                </button>
              )}
              <button className="border border-green-600 text-green-600 px-6 py-2 rounded-lg hover:bg-green-50 flex items-center font-medium transition-colors">
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
              { id: 'upcoming', label: 'Upcoming', count: workshops.filter(w => ['Registration Open', 'In Progress'].includes(w.status)).length },
              { id: 'completed', label: 'Completed', count: workshops.filter(w => w.status === 'Completed').length },
              { id: 'planning', label: 'Planning', count: workshops.filter(w => w.status === 'Planning').length },
              { id: 'registrations', label: 'Registrations', count: registrationsCount },
              { id: 'collaboration', label: 'Collaboration Opportunities', count: 3 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`py-2 border-b-2 font-medium text-sm transition-colors ${
                  selectedTab === tab.id
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label} ({tab.count})
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
          ) : (
            <div className="space-y-6">
              {filteredWorkshops.map((workshop) => (
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

                      <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                        {workshop.description}
                      </p>

                      {/* Price */}
                      {workshop.price && (
                        <div className="mb-4">
                          <span className="text-lg font-bold text-green-600">${workshop.price}</span>
                        </div>
                      )}

                      {/* Admin Actions */}
                      <div className="flex flex-wrap gap-3">
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

                      {/* Metadata */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                          <span>Created: {workshop.createdAt}</span>
                          <span>Last Updated: {workshop.updatedAt}</span>
                          <span>ID: #{workshop.id}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

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