import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Calendar, 
  MapPin, 
  Edit3, 
  Eye, 
  Download, 
  Globe,
  Clock,
  CheckCircle,
  AlertCircle,
  Archive,
  Settings,
  BarChart3,
  Mail,
  Share2,
  Copy,
  ExternalLink,
  Star,
  Trash2
} from 'lucide-react';
import CreateEventModal from './CreateEventsModal';

type ConferenceStatus = 'Planning' | 'Registration Open' | 'Coming Soon' | 'Completed' | 'Cancelled';
type ConferenceType = 'In-person' | 'Virtual' | 'Hybrid';

export interface Conference {
  id: number;
  title: string;
  date: string;
  location: string;
  venue?: string;
  type: ConferenceType;
  status: ConferenceStatus;
  theme?: string;
  description: string;
  imageUrl: string;
  attendees: string;
  speakers: string;
  countries: string;
  earlyBirdDeadline?: string;
  regularFee?: string;
  earlyBirdFee?: string;
  registrationCount?: number;
  capacity?: number;
  highlights?: string[];
  createdAt: string;
  updatedAt: string;
}

interface ConferencesTabProps {
  conferences: Conference[];
}

const ConferencesTab: React.FC<ConferencesTabProps> = ({ conferences: initialConferences }) => {
  const [conferences, setConferences] = useState<Conference[]>(initialConferences);
  const [selectedTab, setSelectedTab] = useState<'all' | 'upcoming' | 'completed' | 'planning'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Sample data for admin view
  const [allConferences, setAllConferences] = useState<Conference[]>([
    {
      id: 1,
      title: "ACNA Annual Conference 2026: Innovations in Pediatric Neurology",
      date: "March 15-17, 2026",
      location: "Kigali, Rwanda",
      venue: "Kigali Convention Centre",
      type: "Hybrid",
      status: "Registration Open",
      theme: "Bridging Technology and Care: The Future of Child Neurology in Africa",
      description: "Join us for three days of cutting-edge research presentations, hands-on workshops, and networking opportunities with leading pediatric neurologists across Africa.",
      imageUrl: "https://images.pexels.com/photos/1181438/pexels-photo-1181438.jpeg?auto=compress&cs=tinysrgb&w=800",
      attendees: "500+",
      speakers: "50+",
      countries: "25+",
      earlyBirdDeadline: "January 15, 2026",
      regularFee: "$450",
      earlyBirdFee: "$350",
      registrationCount: 347,
      capacity: 500,
      highlights: [
        "Keynote by Dr. Sarah Johnson on AI in Pediatric Diagnostics",
        "Workshop on Advanced EEG Interpretation",
        "Panel Discussion on Healthcare Equity",
        "Networking Reception & Awards Ceremony"
      ],
      createdAt: "2024-10-15",
      updatedAt: "2024-11-20"
    },
    {
      id: 2,
      title: "Mid-Year Regional Meeting: East Africa",
      date: "September 12-13, 2025",
      location: "Dar es Salaam, Tanzania",
      venue: "Julius Nyerere International Convention Centre",
      type: "In-person",
      status: "Planning",
      theme: "Strengthening Regional Collaboration in Child Neurology",
      description: "A focused regional gathering addressing specific challenges and opportunities in East African pediatric neurology practice.",
      imageUrl: "https://images.pexels.com/photos/3184638/pexels-photo-3184638.jpeg?auto=compress&cs=tinysrgb&w=800",
      attendees: "200+",
      speakers: "25+",
      countries: "8+",
      earlyBirdDeadline: "August 1, 2025",
      regularFee: "$250",
      earlyBirdFee: "$200",
      registrationCount: 0,
      capacity: 200,
      highlights: [
        "Regional Research Presentations",
        "Training Workshop on Seizure Management",
        "Policy Roundtable Discussion",
        "Cultural Exchange Evening"
      ],
      createdAt: "2024-09-10",
      updatedAt: "2024-11-15"
    },
    {
      id: 3,
      title: "ACNA Annual Conference 2025: Building Stronger Networks",
      date: "July 10-12, 2025",
      location: "Kampala, Uganda",
      venue: "Kampala Serena Hotel",
      type: "Hybrid",
      status: "Completed",
      theme: "Building collaborative networks across African child neurology communities",
      description: "Our most successful conference to date, focusing on building collaborative networks across African child neurology communities.",
      imageUrl: "https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=800",
      attendees: "480",
      speakers: "45",
      countries: "22",
      registrationCount: 480,
      capacity: 500,
      createdAt: "2024-01-20",
      updatedAt: "2025-07-15"
    }
  ]);

  const getStatusColor = (status: ConferenceStatus) => {
    switch (status) {
      case 'Registration Open':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Coming Soon':
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

  const getStatusIcon = (status: ConferenceStatus) => {
    switch (status) {
      case 'Registration Open':
        return <CheckCircle className="w-4 h-4" />;
      case 'Coming Soon':
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

  const handleStatusChange = (conferenceId: number, newStatus: ConferenceStatus) => {
    setAllConferences(prev => 
      prev.map(conf => 
        conf.id === conferenceId 
          ? { ...conf, status: newStatus, updatedAt: new Date().toISOString().split('T')[0] }
          : conf
      )
    );
  };

  const handleCreateConference = (newConference: Conference) => {
    setAllConferences(prev => [newConference, ...prev]);
    setShowCreateModal(false);
  };

  const getProgressPercentage = (registered: number, capacity: number) => {
    return Math.round((registered / capacity) * 100);
  };

  const filteredConferences = allConferences.filter(conference => {
    switch (selectedTab) {
      case 'upcoming':
        return ['Registration Open', 'Coming Soon', 'Planning'].includes(conference.status);
      case 'completed':
        return conference.status === 'Completed';
      case 'planning':
        return conference.status === 'Planning';
      default:
        return true;
    }
  });

  return (
    <div className="space-y-6">
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
              <button className="border border-blue-600 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 flex items-center font-medium transition-colors">
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
              { id: 'all', label: 'All Conferences', count: allConferences.length },
              { id: 'upcoming', label: 'Upcoming', count: allConferences.filter(c => ['Registration Open', 'Coming Soon', 'Planning'].includes(c.status)).length },
              { id: 'completed', label: 'Completed', count: allConferences.filter(c => c.status === 'Completed').length },
              { id: 'planning', label: 'Planning', count: allConferences.filter(c => c.status === 'Planning').length }
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

        {/* Conferences List */}
        <div className="p-6">
          <div className="space-y-6">
            {filteredConferences.map((conference) => (
              <div key={conference.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                <div className="flex flex-col lg:flex-row">
                  {/* Conference Image */}
                  <div className="lg:w-1/4">
                    <div className="relative">
                      <img
                        src={conference.imageUrl}
                        alt={conference.title}
                        className="w-full h-48 lg:h-full object-cover rounded-t-lg lg:rounded-l-lg lg:rounded-t-none"
                      />
                      <div className="absolute top-3 left-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(conference.status)} flex items-center`}>
                          {getStatusIcon(conference.status)}
                          <span className="ml-1">{conference.status}</span>
                        </span>
                      </div>
                      {conference.type && (
                        <div className="absolute top-3 right-3">
                          <span className="bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs font-medium">
                            {conference.type}
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
                              <span className="font-medium">{conference.type}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-3 text-center">
                            <div className="bg-gray-50 p-2 rounded">
                              <div className="text-lg font-bold text-blue-600">{conference.attendees}</div>
                              <div className="text-xs text-gray-600">Expected</div>
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                              <div className="text-lg font-bold text-blue-600">{conference.speakers}</div>
                              <div className="text-xs text-gray-600">Speakers</div>
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                              <div className="text-lg font-bold text-blue-600">{conference.countries}</div>
                              <div className="text-xs text-gray-600">Countries</div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Registration Progress */}
                        {conference.registrationCount !== undefined && conference.capacity && (
                          <div className="mb-4">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium text-gray-700">Registration Progress</span>
                              <span className="text-sm text-gray-600">
                                {conference.registrationCount} / {conference.capacity} ({getProgressPercentage(conference.registrationCount, conference.capacity)}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${getProgressPercentage(conference.registrationCount, conference.capacity)}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                      {conference.description}
                    </p>

                    {/* Admin Actions */}
                    <div className="flex flex-wrap gap-3">
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center text-sm font-medium transition-colors">
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
                          onChange={(e) => handleStatusChange(conference.id, e.target.value as ConferenceStatus)}
                          className="border border-gray-300 px-3 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="Planning">Planning</option>
                          <option value="Registration Open">Registration Open</option>
                          <option value="Coming Soon">Coming Soon</option>
                          <option value="Completed">Mark as Completed</option>
                          <option value="Cancelled">Cancel</option>
                        </select>
                      </div>

                    </div>

                    {/* Metadata */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                        <span>Created: {conference.createdAt}</span>
                        <span>Last Updated: {conference.updatedAt}</span>
                        <span>ID: #{conference.id}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredConferences.length === 0 && (
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
      </div>

      {/* Create Event Modal */}
      <CreateEventModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateConference}
      />
    </div>
  );
};

export default ConferencesTab;