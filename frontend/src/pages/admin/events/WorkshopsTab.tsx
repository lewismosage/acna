import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Calendar, 
  Clock, 
  User, 
  Users,
  Edit3, 
  Eye, 
  Download, 
  MapPin,
  CheckCircle,
  AlertCircle,
  Archive,
  Settings,
  BarChart3,
  Mail,
  Star,
  Trash2,
  Award,
  Target,
  MessageCircle,
  FileCheck,
  XCircle,
  Phone
} from 'lucide-react';

type WorkshopStatus = 'Planning' | 'Registration Open' | 'In Progress' | 'Completed' | 'Cancelled';
type WorkshopType = 'Online' | 'In-Person' | 'Hybrid';

export interface Workshop {
  id: number;
  title: string;
  instructor: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  venue?: string;
  type: WorkshopType;
  status: WorkshopStatus;
  description: string;
  imageUrl: string;
  capacity: number;
  registered: number;
  price?: number;
  prerequisites: string[];
  materials: string[];
  rating?: number;
  reviews?: number;
  createdAt: string;
  updatedAt: string;
}

interface CollaborationSubmission {
  id: number;
  projectTitle: string;
  projectDescription: string;
  institution: string;
  projectLead: string;
  contactEmail: string;
  skillsNeeded: string[];
  commitmentLevel: string;
  duration: string;
  additionalNotes: string;
  submittedAt: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Needs Info';
}

interface WorkshopsTabProps {
  workshops: Workshop[];
}

const WorkshopsTab: React.FC<WorkshopsTabProps> = ({ workshops: initialWorkshops }) => {
  const [workshops, setWorkshops] = useState<Workshop[]>(initialWorkshops);
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'completed' | 'planning' | 'collaboration'>('upcoming');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Sample data for admin view
  const [allWorkshops, setAllWorkshops] = useState<Workshop[]>([
    {
      id: 1,
      title: "Advanced EEG Interpretation in Pediatric Patients",
      instructor: "Dr. Sarah Johnson",
      date: "October 25, 2025",
      time: "2:00 PM - 5:00 PM",
      duration: "3 hours",
      location: "Virtual Meeting Room",
      type: "Online",
      status: "Registration Open",
      description: "Learn advanced techniques for interpreting EEG patterns in pediatric neurology cases with hands-on practice sessions.",
      imageUrl: "https://images.pexels.com/photos/5726794/pexels-photo-5726794.jpeg?auto=compress&cs=tinysrgb&w=800",
      capacity: 50,
      registered: 35,
      price: 150,
      prerequisites: ["Basic EEG knowledge", "Clinical experience"],
      materials: ["EEG Atlas", "Case studies", "Recording software"],
      rating: 4.8,
      reviews: 24,
      createdAt: "2024-09-15",
      updatedAt: "2024-11-20"
    },
    {
      id: 2,
      title: "Cerebral Palsy Management Workshop",
      instructor: "Prof. Michael Chen",
      date: "November 15, 2025",
      time: "9:00 AM - 4:00 PM",
      duration: "7 hours",
      location: "Kenyatta National Hospital",
      venue: "Conference Hall A",
      type: "In-Person",
      status: "Registration Open",
      description: "Comprehensive workshop on modern approaches to cerebral palsy management and rehabilitation techniques.",
      imageUrl: "https://images.pexels.com/photos/4260323/pexels-photo-4260323.jpeg?auto=compress&cs=tinysrgb&w=800",
      capacity: 30,
      registered: 28,
      price: 200,
      prerequisites: ["Medical degree", "Pediatric experience"],
      materials: ["Assessment tools", "Treatment protocols", "Case presentations"],
      rating: 4.9,
      reviews: 18,
      createdAt: "2024-08-10",
      updatedAt: "2024-11-18"
    },
    {
      id: 3,
      title: "Pediatric Stroke Recognition and Treatment",
      instructor: "Dr. Emma Williams",
      date: "September 10, 2025",
      time: "10:00 AM - 3:00 PM",
      duration: "5 hours",
      location: "Hybrid Session",
      type: "Hybrid",
      status: "Completed",
      description: "Early recognition and emergency management of stroke in pediatric patients with case studies.",
      imageUrl: "https://images.pexels.com/photos/8376181/pexels-photo-8376181.jpeg?auto=compress&cs=tinysrgb&w=800",
      capacity: 40,
      registered: 40,
      price: 175,
      prerequisites: ["Emergency medicine background"],
      materials: ["Protocol guidelines", "Simulation scenarios"],
      rating: 4.7,
      reviews: 31,
      createdAt: "2024-06-15",
      updatedAt: "2025-09-12"
    },
    {
      id: 4,
      title: "Introduction to Pediatric Neurosurgery",
      instructor: "Dr. James Ochieng",
      date: "December 5, 2025",
      time: "1:00 PM - 6:00 PM",
      duration: "5 hours",
      location: "TBD",
      type: "In-Person",
      status: "Planning",
      description: "Foundational workshop covering basic principles and techniques in pediatric neurosurgery.",
      imageUrl: "https://images.pexels.com/photos/5726794/pexels-photo-5726794.jpeg?auto=compress&cs=tinysrgb&w=800",
      capacity: 25,
      registered: 0,
      price: 250,
      prerequisites: ["Medical degree", "Surgical training"],
      materials: ["Surgical guides", "Video demonstrations"],
      createdAt: "2024-11-01",
      updatedAt: "2024-11-15"
    }
  ]);

  // Sample collaboration submissions
  const [collaborationSubmissions, setCollaborationSubmissions] = useState<CollaborationSubmission[]>([
    {
      id: 1,
      projectTitle: "Multi-center Study on Pediatric Epilepsy Outcomes",
      projectDescription: "Looking for collaborators to participate in a longitudinal study examining treatment outcomes in pediatric epilepsy patients across East Africa. This study aims to analyze seizure control rates, medication adherence, and quality of life measures.",
      institution: "University of Nairobi",
      projectLead: "Dr. James Kiprotich",
      contactEmail: "j.kiprotich@uon.ac.ke",
      skillsNeeded: ["Clinical Research", "Data Analysis", "Patient Recruitment"],
      commitmentLevel: "Moderate",
      duration: "18 months",
      additionalNotes: "Seeking partners with access to pediatric epilepsy patients and research infrastructure.",
      submittedAt: "2025-01-15",
      status: "Pending"
    },
    {
      id: 2,
      projectTitle: "Developing AI Tools for EEG Analysis",
      projectDescription: "Seeking collaborators with machine learning expertise to develop automated EEG analysis tools for pediatric patients. The goal is to create diagnostic aids for under-resourced settings.",
      institution: "Aga Khan University Hospital",
      projectLead: "Dr. Fatima Al-Rashid",
      contactEmail: "f.alrashid@aku.edu",
      skillsNeeded: ["Machine Learning", "EEG Expertise", "Software Development"],
      commitmentLevel: "High",
      duration: "12 months",
      additionalNotes: "We have preliminary datasets and are looking for technical partners.",
      submittedAt: "2025-01-10",
      status: "Approved"
    },
    {
      id: 3,
      projectTitle: "Community-based Cerebral Palsy Intervention Program",
      projectDescription: "Developing community-based intervention strategies for children with cerebral palsy in rural areas. Looking for rehabilitation specialists and community health experts.",
      institution: "Muhimbili University of Health",
      projectLead: "Dr. Grace Mwangi",
      contactEmail: "g.mwangi@muhas.ac.tz",
      skillsNeeded: ["Physiotherapy", "Community Health", "Program Management"],
      commitmentLevel: "Moderate",
      duration: "24 months",
      additionalNotes: "Project funded by local government with extension possibilities.",
      submittedAt: "2025-01-08",
      status: "Needs Info"
    }
  ]);

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

  const getCollaborationStatusColor = (status: CollaborationSubmission['status']) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Needs Info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleStatusChange = (workshopId: number, newStatus: WorkshopStatus) => {
    setAllWorkshops(prev => 
      prev.map(workshop => 
        workshop.id === workshopId 
          ? { ...workshop, status: newStatus, updatedAt: new Date().toISOString().split('T')[0] }
          : workshop
      )
    );
  };

  const handleCollaborationStatusChange = (submissionId: number, newStatus: CollaborationSubmission['status']) => {
    setCollaborationSubmissions(prev =>
      prev.map(submission =>
        submission.id === submissionId
          ? { ...submission, status: newStatus }
          : submission
      )
    );
  };

  const getProgressPercentage = (registered: number, capacity: number) => {
    return Math.round((registered / capacity) * 100);
  };

  const filteredWorkshops = allWorkshops.filter(workshop => {
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

  const renderCollaborationOpportunities = () => (
    <div className="space-y-6">
      {collaborationSubmissions.map((submission) => (
        <div key={submission.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{submission.projectTitle}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {submission.projectLead}
                </div>
                <div className="flex items-center">
                  <Target className="w-4 h-4 mr-1" />
                  {submission.institution}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Submitted: {submission.submittedAt}
                </div>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCollaborationStatusColor(submission.status)}`}>
              {submission.status}
            </span>
          </div>

          <p className="text-gray-600 mb-4">{submission.projectDescription}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Duration:</strong> {submission.duration}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Commitment Level:</strong> {submission.commitmentLevel}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Contact:</strong> {submission.contactEmail}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Skills Needed:</p>
              <div className="flex flex-wrap gap-2">
                {submission.skillsNeeded.map((skill, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {submission.additionalNotes && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-1">Additional Notes:</p>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{submission.additionalNotes}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => handleCollaborationStatusChange(submission.id, 'Approved')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center text-sm font-medium transition-colors"
            >
              <FileCheck className="w-4 h-4 mr-2" />
              Approve & Post
            </button>
            
            <button 
              onClick={() => handleCollaborationStatusChange(submission.id, 'Rejected')}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center text-sm font-medium transition-colors"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </button>

            <button 
              onClick={() => handleCollaborationStatusChange(submission.id, 'Needs Info')}
              className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 flex items-center text-sm font-medium transition-colors"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Request More Info
            </button>

            <a 
              href={`mailto:${submission.contactEmail}`}
              className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center text-sm font-medium transition-colors"
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact Submitter
            </a>

            <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center text-sm font-medium transition-colors">
              <Phone className="w-4 h-4 mr-2" />
              Schedule Call
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
              <span>Submission ID: #{submission.id}</span>
              <span>Status: {submission.status}</span>
            </div>
          </div>
        </div>
      ))}

      {collaborationSubmissions.length === 0 && (
        <div className="text-center py-12">
          <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No collaboration submissions</h3>
          <p className="text-gray-500">No collaboration requests have been submitted yet.</p>
        </div>
      )}
    </div>
  );

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
              <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center font-medium transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Workshop
              </button>
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
              { id: 'upcoming', label: 'Upcoming', count: allWorkshops.filter(w => ['Registration Open', 'In Progress'].includes(w.status)).length },
              { id: 'completed', label: 'Completed', count: allWorkshops.filter(w => w.status === 'Completed').length },
              { id: 'planning', label: 'Planning', count: allWorkshops.filter(w => w.status === 'Planning').length },
              { id: 'collaboration', label: 'Collaboration Opportunities', count: collaborationSubmissions.length }
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
            renderCollaborationOpportunities()
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

                          {/* Rating */}
                          {workshop.rating && (
                            <div className="flex items-center mb-4">
                              <Star className="w-4 h-4 text-yellow-400 mr-1 fill-current" />
                              <span className="text-sm font-medium">{workshop.rating}</span>
                              <span className="text-sm text-gray-500 ml-1">({workshop.reviews} reviews)</span>
                            </div>
                          )}
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
                        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center text-sm font-medium transition-colors">
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
                            <option value="Registration Open">Registration Open</option>
                            <option value="Registration Closed">Registration Closed</option>
                            <option value="Completed">Mark as Completed</option>
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
    </div>
  );
};

export default WorkshopsTab;