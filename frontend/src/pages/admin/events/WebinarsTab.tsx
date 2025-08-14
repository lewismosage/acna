import React, { useState } from 'react';
import { 
  Video, 
  Plus, 
  Calendar, 
  Clock, 
  User, 
  Users,
  Edit3, 
  Eye, 
  Download, 
  Globe,
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
  Trash2,
  Play,
  Pause,
  Upload,
  Link,
  BookOpen,
  Languages,
  Target,
  Tag
} from 'lucide-react';

type WebinarStatus = 'Planning' | 'Registration Open' | 'Live' | 'Completed' | 'Cancelled';
type WebinarType = 'Live' | 'Recorded' | 'Hybrid';

export interface Webinar {
  id: number;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  duration: string;
  speakers: {
    name: string;
    credentials: string;
    affiliation: string;
  }[];
  status: WebinarStatus;
  type: WebinarType;
  isUpcoming: boolean;
  isFeatured?: boolean;
  registrationLink?: string;
  recordingLink?: string;
  slidesLink?: string;
  imageUrl: string;
  tags: string[];
  languages: string[];
  targetAudience: string[];
  learningObjectives: string[];
  registrationCount?: number;
  capacity?: number;
  createdAt: string;
  updatedAt: string;
}

interface WebinarsTabProps {
  webinars: Webinar[];
}

const WebinarsTab: React.FC<WebinarsTabProps> = ({ webinars: initialWebinars }) => {
  const [webinars, setWebinars] = useState<Webinar[]>(initialWebinars);
  const [selectedTab, setSelectedTab] = useState<'all' | 'upcoming' | 'live' | 'completed' | 'planning'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Sample data for admin view
  const [allWebinars, setAllWebinars] = useState<Webinar[]>([
    {
      id: 1,
      title: "Advances in Pediatric Epilepsy Management in Africa",
      description: "Expert panel discussion on the latest treatment approaches and challenges specific to African contexts.",
      category: "Epilepsy",
      date: "June 15, 2025",
      time: "14:00 GMT",
      duration: "90 min",
      speakers: [
        {
          name: "Dr. Amina Diallo",
          credentials: "MD, PhD",
          affiliation: "University of Dakar, Senegal"
        },
        {
          name: "Prof. Kwame Osei",
          credentials: "FRCP",
          affiliation: "Korle Bu Teaching Hospital, Ghana"
        }
      ],
      status: "Registration Open",
      type: "Live",
      isUpcoming: true,
      isFeatured: true,
      registrationLink: "https://acna.org/webinars/register/1",
      imageUrl: "https://images.pexels.com/photos/5721876/pexels-photo-5721876.jpeg",
      tags: ["Epilepsy", "Treatment", "Panel"],
      languages: ["English", "French"],
      targetAudience: ["Neurologists", "Pediatricians", "Residents"],
      learningObjectives: [
        "Understand current treatment guidelines for pediatric epilepsy in Africa",
        "Learn about challenges in medication access and adherence",
        "Discuss culturally appropriate counseling approaches"
      ],
      registrationCount: 247,
      capacity: 300,
      createdAt: "2024-10-15",
      updatedAt: "2024-11-20"
    },
    {
      id: 2,
      title: "Cerebral Palsy: Early Identification in Community Settings",
      description: "Training on recognizing early signs of cerebral palsy and initiating interventions in low-resource settings.",
      category: "Cerebral Palsy",
      date: "May 28, 2025",
      time: "12:00 GMT",
      duration: "60 min",
      speakers: [
        {
          name: "Dr. Fatima Nkosi",
          credentials: "PT, PhD",
          affiliation: "University of Cape Town, South Africa"
        }
      ],
      status: "Planning",
      type: "Live",
      isUpcoming: true,
      registrationLink: "https://acna.org/webinars/register/2",
      imageUrl: "https://images.pexels.com/photos/4260323/pexels-photo-4260323.jpeg",
      tags: ["Cerebral Palsy", "Early Intervention", "Rehabilitation"],
      languages: ["English", "Portuguese"],
      targetAudience: ["Community Health Workers", "Physical Therapists"],
      learningObjectives: [
        "Learn to identify early signs of cerebral palsy",
        "Understand basic intervention strategies",
        "Know when to refer for specialist care"
      ],
      registrationCount: 0,
      capacity: 200,
      createdAt: "2024-09-10",
      updatedAt: "2024-11-15"
    },
    {
      id: 3,
      title: "Autism Spectrum Disorders: Cultural Perspectives in Africa",
      description: "Exploring cultural interpretations of autism and strategies for improving diagnosis and support.",
      category: "Autism",
      date: "April 10, 2025",
      time: "15:00 GMT",
      duration: "75 min",
      speakers: [
        {
          name: "Dr. Ngozi Eze",
          credentials: "MD, MPH",
          affiliation: "University of Nigeria Teaching Hospital"
        },
        {
          name: "Dr. Hassan Abdi",
          credentials: "PhD",
          affiliation: "Kenya Autism Research Center"
        }
      ],
      status: "Completed",
      type: "Recorded",
      isUpcoming: false,
      recordingLink: "https://acna.org/webinars/recordings/3",
      slidesLink: "https://acna.org/webinars/slides/3",
      imageUrl: "https://images.pexels.com/photos/5212359/pexels-photo-5212359.jpeg",
      tags: ["Autism", "Culture", "Diagnosis"],
      languages: ["English"],
      targetAudience: ["Clinicians", "Researchers", "Educators"],
      learningObjectives: [
        "Understand cultural beliefs about autism in different African communities",
        "Learn culturally sensitive diagnostic approaches",
        "Explore community-based support strategies"
      ],
      registrationCount: 185,
      capacity: 250,
      createdAt: "2024-01-20",
      updatedAt: "2025-04-12"
    },
    {
      id: 4,
      title: "Live Q&A: Childhood Headache Disorders in Africa",
      description: "Interactive session on diagnosing and managing common childhood headache disorders.",
      category: "Headache",
      date: "March 5, 2025",
      time: "13:00 GMT",
      duration: "60 min",
      speakers: [
        {
          name: "Dr. Tendai Moyo",
          credentials: "MD",
          affiliation: "Harare Children's Hospital, Zimbabwe"
        }
      ],
      status: "Live",
      type: "Live",
      isUpcoming: true,
      isFeatured: true,
      registrationLink: "https://acna.org/webinars/register/4",
      imageUrl: "https://images.pexels.com/photos/8376181/pexels-photo-8376181.jpeg",
      tags: ["Headache", "Q&A", "Diagnosis"],
      languages: ["English", "French"],
      targetAudience: ["General Practitioners", "Pediatricians"],
      learningObjectives: [
        "Learn to differentiate primary and secondary headaches",
        "Understand when to investigate further",
        "Discuss treatment options available in Africa"
      ],
      registrationCount: 156,
      capacity: 200,
      createdAt: "2024-08-15",
      updatedAt: "2025-03-05"
    }
  ]);

  const getStatusColor = (status: WebinarStatus) => {
    switch (status) {
      case 'Registration Open':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Live':
        return 'bg-red-100 text-red-800 border-red-200';
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

  const getStatusIcon = (status: WebinarStatus) => {
    switch (status) {
      case 'Registration Open':
        return <CheckCircle className="w-4 h-4" />;
      case 'Live':
        return <Play className="w-4 h-4" />;
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

  const handleStatusChange = (webinarId: number, newStatus: WebinarStatus) => {
    setAllWebinars(prev => 
      prev.map(webinar => 
        webinar.id === webinarId 
          ? { ...webinar, status: newStatus, updatedAt: new Date().toISOString().split('T')[0] }
          : webinar
      )
    );
  };

  const handleCreateWebinar = (newWebinar: Webinar) => {
    setAllWebinars(prev => [newWebinar, ...prev]);
    setShowCreateModal(false);
  };

  const getProgressPercentage = (registered: number, capacity: number) => {
    return Math.round((registered / capacity) * 100);
  };

  const filteredWebinars = allWebinars.filter(webinar => {
    switch (selectedTab) {
      case 'upcoming':
        return ['Registration Open'].includes(webinar.status);
      case 'live':
        return webinar.status === 'Live';
      case 'completed':
        return webinar.status === 'Completed';
      case 'planning':
        return webinar.status === 'Planning';
      default:
        return true;
    }
  });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white border border-gray-300 rounded-lg">
        <div className="bg-purple-50 px-6 py-4 border-b border-gray-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Video className="w-7 h-7 mr-3 text-purple-600" />
                Webinar Management
              </h2>
              <p className="text-gray-600 mt-1">Manage webinars, speakers, and educational sessions</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 flex items-center font-medium transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Webinar
              </button>
              <button className="border border-purple-600 text-purple-600 px-6 py-2 rounded-lg hover:bg-purple-50 flex items-center font-medium transition-colors">
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
              { id: 'all', label: 'All Webinars', count: allWebinars.length },
              { id: 'upcoming', label: 'Upcoming', count: allWebinars.filter(w => ['Registration Open'].includes(w.status)).length },
              { id: 'live', label: 'Live Now', count: allWebinars.filter(w => w.status === 'Live').length },
              { id: 'completed', label: 'Completed', count: allWebinars.filter(w => w.status === 'Completed').length },
              { id: 'planning', label: 'Planning', count: allWebinars.filter(w => w.status === 'Planning').length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`py-2 border-b-2 font-medium text-sm transition-colors ${
                  selectedTab === tab.id
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {/* Webinars List */}
        <div className="p-6">
          <div className="space-y-6">
            {filteredWebinars.map((webinar) => (
              <div key={webinar.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                <div className="flex flex-col lg:flex-row">
                  {/* Webinar Image */}
                  <div className="lg:w-1/4">
                    <div className="relative">
                      <img
                        src={webinar.imageUrl}
                        alt={webinar.title}
                        className="w-full h-48 lg:h-full object-cover rounded-t-lg lg:rounded-l-lg lg:rounded-t-none"
                      />
                      <div className="absolute top-3 left-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(webinar.status)} flex items-center`}>
                          {getStatusIcon(webinar.status)}
                          <span className="ml-1">{webinar.status}</span>
                        </span>
                      </div>
                      {webinar.isFeatured && (
                        <div className="absolute top-3 right-3">
                          <Star className="w-5 h-5 text-yellow-500 fill-current" />
                        </div>
                      )}
                      <div className="absolute bottom-3 right-3">
                        <span className="bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs font-medium">
                          {webinar.type}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Webinar Details */}
                  <div className="lg:w-3/4 p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                          {webinar.title}
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                          <div className="space-y-2">
                            <div className="flex items-center text-gray-600 text-sm">
                              <Calendar className="w-4 h-4 mr-2 text-purple-600" />
                              <span className="font-medium">{webinar.date}</span>
                            </div>
                            <div className="flex items-center text-gray-600 text-sm">
                              <Clock className="w-4 h-4 mr-2 text-purple-600" />
                              <span className="font-medium">{webinar.time} ({webinar.duration})</span>
                            </div>
                            <div className="flex items-center text-gray-600 text-sm">
                              <Tag className="w-4 h-4 mr-2 text-purple-600" />
                              <span className="font-medium">{webinar.category}</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center text-gray-600 text-sm">
                              <Languages className="w-4 h-4 mr-2 text-purple-600" />
                              <span>{webinar.languages.join(', ')}</span>
                            </div>
                            <div className="flex items-center text-gray-600 text-sm">
                              <Target className="w-4 h-4 mr-2 text-purple-600" />
                              <span>{webinar.targetAudience.slice(0, 2).join(', ')}</span>
                            </div>
                            <div className="flex items-center text-gray-600 text-sm">
                              <User className="w-4 h-4 mr-2 text-purple-600" />
                              <span>{webinar.speakers.length} speaker{webinar.speakers.length > 1 ? 's' : ''}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Registration Progress */}
                        {webinar.registrationCount !== undefined && webinar.capacity && (
                          <div className="mb-4">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium text-gray-700">Registration Progress</span>
                              <span className="text-sm text-gray-600">
                                {webinar.registrationCount} / {webinar.capacity} ({getProgressPercentage(webinar.registrationCount, webinar.capacity)}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-purple-600 h-2 rounded-full" 
                                style={{ width: `${getProgressPercentage(webinar.registrationCount, webinar.capacity)}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {/* Speakers */}
                        <div className="mb-4">
                          <h4 className="font-semibold text-gray-900 text-sm mb-2">Speakers:</h4>
                          <div className="space-y-1">
                            {webinar.speakers.map((speaker, index) => (
                              <div key={index} className="text-sm">
                                <span className="font-medium text-gray-900">{speaker.name}, {speaker.credentials}</span>
                                <span className="text-gray-600 ml-2">{speaker.affiliation}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                      {webinar.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {webinar.tags.map((tag, index) => (
                        <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Admin Actions */}
                    <div className="flex flex-wrap gap-3">
                      <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center text-sm font-medium transition-colors">
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit Details
                      </button>

                      <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center text-sm font-medium transition-colors">
                        <Mail className="w-4 h-4 mr-2" />
                        Email Registrants
                      </button>

                      {webinar.status === 'Completed' && (
                        <>
                          <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center text-sm font-medium transition-colors">
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Recording
                          </button>
                          <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center text-sm font-medium transition-colors">
                            <BookOpen className="w-4 h-4 mr-2" />
                            Upload Slides
                          </button>
                        </>
                      )}

                      <div className="relative">
                        <select
                          value={webinar.status}
                          onChange={(e) => handleStatusChange(webinar.id, e.target.value as WebinarStatus)}
                          className="border border-gray-300 px-3 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="Planning">Planning</option>
                          <option value="Registration Open">Registration Open</option>
                          <option value="Live">Mark as Live</option>
                          <option value="Completed">Mark as Completed</option>
                          <option value="Cancelled">Cancel</option>
                        </select>
                      </div>

                      <button 
                        onClick={() => setAllWebinars(prev => 
                          prev.map(w => w.id === webinar.id ? {...w, isFeatured: !w.isFeatured} : w)
                        )}
                        className={`border px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-colors ${
                          webinar.isFeatured 
                            ? 'border-yellow-300 bg-yellow-50 text-yellow-800 hover:bg-yellow-100' 
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <Star className={`w-4 h-4 mr-2 ${webinar.isFeatured ? 'fill-current' : ''}`} />
                        {webinar.isFeatured ? 'Unfeature' : 'Feature'}
                      </button>
                    </div>

                    {/* Metadata */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                        <span>Created: {webinar.createdAt}</span>
                        <span>Last Updated: {webinar.updatedAt}</span>
                        <span>ID: #{webinar.id}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredWebinars.length === 0 && (
            <div className="text-center py-12">
              <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No webinars found</h3>
              <p className="text-gray-500 mb-4">
                {selectedTab === 'all' 
                  ? "You haven't created any webinars yet." 
                  : `No webinars in the ${selectedTab} category.`}
              </p>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 font-medium"
              >
                Create Your First Webinar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WebinarsTab;