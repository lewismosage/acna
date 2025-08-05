import { useState } from 'react';
import { 
  Users, AlertCircle, BookOpen, FileText, Calendar, 
  Target, Mail, MessageCircle, ArrowRight, Clock, 
  MapPin, Star, Award,
  CheckCircle, User, Search, Filter
} from 'lucide-react';

interface CollaborationRequest {
  projectTitle: string;
  projectDescription: string;
  institution: string;
  projectLead: string;
  contactEmail: string;
  skillsNeeded: string[];
  commitmentLevel: string;
  duration: string;
  additionalNotes: string;
}

interface Workshop {
  id: number;
  title: string;
  instructor: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  type: 'Online' | 'In-Person' | 'Hybrid';
  capacity: number;
  enrolled: number;
  price: number;
  status: 'Open' | 'Full' | 'Completed';
  description: string;
  prerequisites: string[];
  materials: string[];
  rating: number;
  reviews: number;
}

const WorkshopComponent = () => {
  const [activeTab, setActiveTab] = useState('workshops');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [showCollaborationForm, setShowCollaborationForm] = useState(false);
  
  // Collaboration request state
  const [request, setRequest] = useState<CollaborationRequest>({
    projectTitle: '',
    projectDescription: '',
    institution: '',
    projectLead: '',
    contactEmail: '',
    skillsNeeded: [],
    commitmentLevel: 'Moderate',
    duration: '',
    additionalNotes: ''
  });

  const [currentSkill, setCurrentSkill] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Mock workshop data
  const workshops: Workshop[] = [
    {
      id: 1,
      title: "Advanced EEG Interpretation in Pediatric Patients",
      instructor: "Dr. Sarah Johnson",
      date: "2025-10-20",
      time: "2:00 PM - 5:00 PM",
      duration: "3 hours",
      location: "Virtual Meeting Room",
      type: "Online",
      capacity: 50,
      enrolled: 35,
      price: 150,
      status: "Open",
      description: "Learn advanced techniques for interpreting EEG patterns in pediatric neurology cases.",
      prerequisites: ["Basic EEG knowledge", "Clinical experience"],
      materials: ["EEG Atlas", "Case studies", "Recording software"],
      rating: 4.8,
      reviews: 24
    },
    {
      id: 2,
      title: "Cerebral Palsy Management Workshop",
      instructor: "Prof. Michael Chen",
      date: "2025-10-25",
      time: "9:00 AM - 4:00 PM",
      duration: "7 hours",
      location: "Kenyatta National Hospital",
      type: "In-Person",
      capacity: 30,
      enrolled: 28,
      price: 200,
      status: "Open",
      description: "Comprehensive workshop on modern approaches to cerebral palsy management and rehabilitation.",
      prerequisites: ["Medical degree", "Pediatric experience"],
      materials: ["Assessment tools", "Treatment protocols", "Case presentations"],
      rating: 4.9,
      reviews: 18
    },
    {
      id: 3,
      title: "Pediatric Stroke Recognition and Treatment",
      instructor: "Dr. Emma Williams",
      date: "2025-11-05",
      time: "10:00 AM - 3:00 PM",
      duration: "5 hours",
      location: "Hybrid (Online + Clinical Demo)",
      type: "Hybrid",
      capacity: 40,
      enrolled: 40,
      price: 175,
      status: "Full",
      description: "Early recognition and emergency management of stroke in pediatric patients.",
      prerequisites: ["Emergency medicine background"],
      materials: ["Protocol guidelines", "Simulation scenarios"],
      rating: 4.7,
      reviews: 31
    }
  ];

  // Collaboration opportunities
  const collaborationOpportunities = [
    {
      id: 1,
      projectTitle: "Multi-center Study on Pediatric Epilepsy Outcomes",
      institution: "University of Nairobi",
      projectLead: "Dr. James Kiprotich",
      description: "Looking for collaborators to participate in a longitudinal study examining treatment outcomes in pediatric epilepsy patients across East Africa.",
      skillsNeeded: ["Clinical Research", "Data Analysis", "Patient Recruitment"],
      duration: "18 months",
      commitmentLevel: "Moderate",
      contactEmail: "j.kiprotich@uon.ac.ke",
      posted: "2025-10-08"
    },
    {
      id: 2,
      projectTitle: "Developing AI Tools for EEG Analysis",
      institution: "Aga Khan University Hospital",
      projectLead: "Dr. Fatima Al-Rashid",
      description: "Seeking collaborators with machine learning expertise to develop automated EEG analysis tools for pediatric patients.",
      skillsNeeded: ["Machine Learning", "EEG Expertise", "Software Development"],
      duration: "12 months",
      commitmentLevel: "High",
      contactEmail: "f.alrashid@aku.edu",
      posted: "2025-10-05"
    }
  ];

  // Filter workshops based on search and type
  const filteredWorkshops = workshops.filter(workshop => {
    const matchesSearch = workshop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          workshop.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || workshop.type === filterType;
    return matchesSearch && matchesType;
  });

  // Collaboration form handlers
  const handleRequestChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRequest(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSkill = () => {
    if (currentSkill.trim() && !request.skillsNeeded.includes(currentSkill.trim())) {
      setRequest(prev => ({
        ...prev,
        skillsNeeded: [...prev.skillsNeeded, currentSkill.trim()]
      }));
      setCurrentSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setRequest(prev => ({
      ...prev,
      skillsNeeded: prev.skillsNeeded.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      console.log('Submitted request:', request);
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setRequest({
        projectTitle: '',
        projectDescription: '',
        institution: '',
        projectLead: '',
        contactEmail: '',
        skillsNeeded: [],
        commitmentLevel: 'Moderate',
        duration: '',
        additionalNotes: ''
      });
    }, 1500);
  };

  // Tab navigation
  const tabs = [
    { id: 'workshops', label: 'WORKSHOPS', icon: Award },
    { id: 'collaboration', label: 'COLLABORATION OPPORTUNITIES', icon: Users },
    { id: 'request', label: 'REQUEST COLLABORATION', icon: MessageCircle }
  ];

  // Workshop listing component
  const WorkshopListing = () => (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search workshops..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Types</option>
              <option value="Online">Online</option>
              <option value="In-Person">In-Person</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Workshop Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredWorkshops.map((workshop) => (
          <div key={workshop.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{workshop.title}</h3>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <User className="w-4 h-4 mr-1" />
                    {workshop.instructor}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  workshop.status === 'Open' ? 'bg-green-100 text-green-800' :
                  workshop.status === 'Full' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {workshop.status}
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-4">{workshop.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(workshop.date).toLocaleDateString()} • {workshop.time}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  {workshop.duration}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  {workshop.location} ({workshop.type})
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  <span className="text-sm font-medium">{workshop.rating}</span>
                  <span className="text-sm text-gray-500 ml-1">({workshop.reviews} reviews)</span>
                </div>
                <div className="text-sm text-gray-600">
                  {workshop.enrolled}/{workshop.capacity} enrolled
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-lg font-bold text-blue-600">
                  ${workshop.price}
                </div>
                <button 
                  className={`px-4 py-2 rounded-md font-medium ${
                    workshop.status === 'Open' 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={workshop.status !== 'Open'}
                >
                  {workshop.status === 'Open' ? 'Register Now' : 'Registration Closed'}
                </button>
              </div>
            </div>

            {/* Workshop details footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <div className="flex items-center">
                  <FileText className="w-3 h-3 mr-1" />
                  {workshop.materials.length} materials included
                </div>
                <div className="flex items-center">
                  <Users className="w-3 h-3 mr-1" />
                  {workshop.prerequisites.length} prerequisites
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Collaboration opportunities component
  const CollaborationOpportunities = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Current Collaboration Opportunities</h2>
        <p className="text-gray-600 mb-6">
          Connect with fellow researchers and clinicians on exciting projects in pediatric neurology.
        </p>
        
        <div className="space-y-6">
          {collaborationOpportunities.map((opportunity) => (
            <div key={opportunity.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{opportunity.projectTitle}</h3>
                <span className="text-xs text-gray-500">Posted: {opportunity.posted}</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Institution:</strong> {opportunity.institution}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Project Lead:</strong> {opportunity.projectLead}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Duration:</strong> {opportunity.duration}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Commitment Level:</strong> {opportunity.commitmentLevel}
                  </p>
                </div>
              </div>

              <p className="text-gray-700 mb-4">{opportunity.description}</p>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Skills Needed:</p>
                <div className="flex flex-wrap gap-2">
                  {opportunity.skillsNeeded.map((skill, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <a 
                  href={`mailto:${opportunity.contactEmail}`}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
                >
                  <Mail className="w-4 h-4 mr-1" />
                  Contact Project Lead
                </a>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm flex items-center">
                  <ArrowRight className="w-4 h-4 mr-1" />
                  Express Interest
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Collaboration request form component
  const CollaborationRequestForm = () => {
    if (submitSuccess) {
      return (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Request Submitted Successfully!</h3>
          <p className="text-gray-600 mb-6">
            Your collaboration request has been received. ACNA will review your submission and may contact you for additional details.
          </p>
          <button
            onClick={() => setSubmitSuccess(false)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Submit Another Request
          </button>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Users className="w-6 h-6 text-blue-600 mr-3" />
            Request Collaboration Support
          </h2>
          <p className="text-gray-600 mt-2">
            Use this form to request collaboration support for your pediatric neurology project. 
            Your request will be reviewed and may be posted on our public collaboration opportunities page.
          </p>
        </div>

        <form onSubmit={handleSubmitRequest} className="space-y-6">
          {/* Project Information */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BookOpen className="w-5 h-5 text-blue-600 mr-2" />
              Project Information
            </h3>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="projectTitle" className="block text-sm font-medium text-gray-700 mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  id="projectTitle"
                  name="projectTitle"
                  value={request.projectTitle}
                  onChange={handleRequestChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Project Description *
                </label>
                <textarea
                  id="projectDescription"
                  name="projectDescription"
                  value={request.projectDescription}
                  onChange={handleRequestChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Briefly describe your project, its goals, and why you're seeking collaboration..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="institution" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Institution *
                  </label>
                  <input
                    type="text"
                    id="institution"
                    name="institution"
                    value={request.institution}
                    onChange={handleRequestChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="projectLead" className="block text-sm font-medium text-gray-700 mb-1">
                    Project Lead *
                  </label>
                  <input
                    type="text"
                    id="projectLead"
                    name="projectLead"
                    value={request.projectLead}
                    onChange={handleRequestChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Email *
                </label>
                <input
                  type="email"
                  id="contactEmail"
                  name="contactEmail"
                  value={request.contactEmail}
                  onChange={handleRequestChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Collaboration Details */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="w-5 h-5 text-blue-600 mr-2" />
              Collaboration Details
            </h3>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="skillsNeeded" className="block text-sm font-medium text-gray-700 mb-1">
                  Skills/Expertise Needed
                </label>
                <div className="flex">
                  <input
                    type="text"
                    id="skillsNeeded"
                    value={currentSkill}
                    onChange={(e) => setCurrentSkill(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add skills needed (e.g., Data Analysis, EEG Interpretation)"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="bg-gray-200 px-4 py-2 rounded-r-md hover:bg-gray-300 transition-colors"
                  >
                    Add
                  </button>
                </div>
                
                {request.skillsNeeded.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {request.skillsNeeded.map((skill, index) => (
                      <span key={index} className="inline-flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="ml-1 text-blue-600 hover:text-blue-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="commitmentLevel" className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Commitment Level *
                  </label>
                  <select
                    id="commitmentLevel"
                    name="commitmentLevel"
                    value={request.commitmentLevel}
                    onChange={handleRequestChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Minimal">Minimal (occasional consultation)</option>
                    <option value="Moderate">Moderate (regular meetings)</option>
                    <option value="High">High (active participation)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                    Project Duration *
                  </label>
                  <input
                    type="text"
                    id="duration"
                    name="duration"
                    value={request.duration}
                    onChange={handleRequestChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 6 months, 1 year"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  id="additionalNotes"
                  name="additionalNotes"
                  value={request.additionalNotes}
                  onChange={handleRequestChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any other information potential collaborators should know..."
                />
              </div>
            </div>
          </div>

          {/* Submission */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-500">
              * Required fields
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-3 rounded-md font-medium text-white ${
                isSubmitting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
              } transition-colors flex items-center`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Submit Request
                </>
              )}
            </button>
          </div>
        </form>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 text-blue-600 mr-2" />
            About Collaboration Requests
          </h3>
          <div className="space-y-3 text-gray-700 text-sm">
            <p>
              <strong>Review Process:</strong> All requests are reviewed by the ACNA Collaboration Committee within 3-5 business days.
            </p>
            <p>
              <strong>Public Posting:</strong> Approved requests will be posted on our collaboration opportunities page where other members can view and respond.
            </p>
            <p>
              <strong>Need help?</strong> Contact <a href="mailto:collaborations@acna.org" className="text-blue-600 hover:underline">collaborations@acna.org</a> for assistance.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'workshops':
        return <WorkshopListing />;
      case 'collaboration':
        return <CollaborationOpportunities />;
      case 'request':
        return <CollaborationRequestForm />;
      default:
        return <WorkshopListing />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b-2 border-gray-200">
        <div className="bg-white text-grey px-4 py-4 md:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Award className="w-8 h-8 mr-3" />
              <h1 className="text-xl md:text-2xl font-bold">Workshop & Collaboration Hub</h1>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-blue-700 overflow-x-auto">
          <nav className="px-4 md:px-6">
            <div className="flex space-x-0 min-w-max">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 font-medium text-sm flex items-center border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-yellow-400 text-white bg-blue-800'
                      : 'border-transparent text-blue-100 hover:text-white'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default WorkshopComponent;