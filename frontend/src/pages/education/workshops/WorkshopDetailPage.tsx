import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Users, 
  Download, 
  Share2, 
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  Mail,
  Phone,
  Target,
  FileText,
  Award
} from 'lucide-react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Workshop, workshopsApi } from '../../../services/workshopAPI';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ScrollToTop from '../../../components/common/ScrollToTop';

interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  organization: string;
  profession: string;
  phone: string;
}

interface RegistrationStatus {
  type: 'success' | 'error';
  message: string;
}

const WorkshopDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'overview' | 'instructor' | 'logistics' | 'registration'>('overview');
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    firstName: '',
    lastName: '',
    email: '',
    organization: '',
    profession: '',
    phone: ''
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<RegistrationStatus | null>(null);

  useEffect(() => {
    const fetchWorkshop = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const workshopData = await workshopsApi.getById(parseInt(id));
        setWorkshop(workshopData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load workshop');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkshop();
  }, [id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Registration Open':
        return 'bg-green-600 text-white';
      case 'In Progress':
        return 'bg-yellow-600 text-white';
      case 'Planning':
        return 'bg-blue-600 text-white';
      case 'Completed':
        return 'bg-gray-600 text-white';
      case 'Cancelled':
        return 'bg-red-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const isRegistrationOpen = (status: string) => {
    return status === 'Registration Open';
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!workshop) return;

    setIsRegistering(true);
    setRegistrationStatus(null);

    try {
      const registrationPayload = {
        workshop: workshop.id,
        firstName: registrationData.firstName,
        lastName: registrationData.lastName,
        email: registrationData.email,
        phone: registrationData.phone,
        organization: registrationData.organization,
        profession: registrationData.profession,
        registrationType: 'Free' as const, 
        country: '', 
      };

      await workshopsApi.createRegistration(registrationPayload);
      
      setRegistrationStatus({
        type: 'success',
        message: `Registration successful! You have been registered for "${workshop.title}". You will receive a confirmation email shortly.`
      });
      
      // Reset form
      setRegistrationData({
        firstName: '',
        lastName: '',
        email: '',
        organization: '',
        profession: '',
        phone: ''
      });
      
      // Refresh workshop data to update registration count
      const updatedWorkshop = await workshopsApi.getById(workshop.id);
      setWorkshop(updatedWorkshop);
      
    } catch (err: any) {
      const errorMessage = err.message || 'Registration failed. Please try again later.';
      setRegistrationStatus({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !workshop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Workshop Not Found</h2>
          <p className="text-gray-600 mb-4">{error || "The workshop you're looking for doesn't exist."}</p>
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-red-600 hover:text-red-700 font-medium"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Workshops
          </button>
        </div>
      </div>
    );
  }

  const registrationOpen = isRegistrationOpen(workshop.status);

  return (
    <div className="bg-white min-h-screen">
      {/* Back Navigation */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-red-600 hover:text-red-700 font-medium"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Workshops & Symposiums
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-12 md:py-16">
        <ScrollToTop />
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Workshop Image */}
            <div className="lg:w-2/5">
              <div className="relative">
                <img
                  src={workshop.imageUrl}
                  alt={workshop.title}
                  className="w-full h-64 lg:h-80 object-cover rounded-lg shadow-lg"
                />
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 text-sm font-bold uppercase tracking-wide rounded ${getStatusColor(workshop.status)}`}>
                    {workshop.status}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="bg-orange-600 text-white px-3 py-1 text-sm font-bold rounded">
                    WORKSHOP
                  </span>
                </div>
              </div>
            </div>

            {/* Workshop Details */}
            <div className="lg:w-3/5">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                {workshop.title}
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-5 h-5 mr-3 text-red-600" />
                    <div>
                      <div className="font-medium">{formatDate(workshop.date)}</div>
                      <div className="text-sm">{workshop.time}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-5 h-5 mr-3 text-red-600" />
                    <span>Duration: {workshop.duration}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-5 h-5 mr-3 text-red-600" />
                    <div>
                      <div className="font-medium">{workshop.location}</div>
                      {workshop.venue && (
                        <div className="text-sm text-gray-600">{workshop.venue}</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Users className="w-5 h-5 mr-3 text-red-600" />
                    <span>{workshop.registered} / {workshop.capacity} registered</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <User className="w-5 h-5 mr-3 text-red-600" />
                    <span>Instructor: {workshop.instructor}</span>
                  </div>
                  
                  {workshop.price && (
                    <div className="flex items-center text-gray-600">
                      <Award className="w-5 h-5 mr-3 text-red-600" />
                      <span className="text-2xl font-bold text-red-600">${workshop.price}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {registrationOpen ? (
                  <button 
                    onClick={() => setActiveTab('registration')}
                    className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center"
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    Register Now
                  </button>
                ) : (
                  <button 
                    disabled
                    className="bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold cursor-not-allowed flex items-center justify-center"
                  >
                    Registration {workshop.status === 'Completed' ? 'Closed' : workshop.status}
                  </button>
                )}
                
                <div className="flex gap-2">
                  <button className="border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </button>
                  <button className="border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                    <Download className="w-4 h-4 mr-2" />
                    Download Info
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex space-x-8">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'instructor', label: 'Instructor' },
              { key: 'logistics', label: 'Logistics' },
              { key: 'registration', label: 'Registration' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.key
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </section>

      {/* Tab Content */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* About Workshop */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Workshop</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {workshop.description}
                  </p>
                </div>

                {/* Prerequisites */}
                {workshop.prerequisites && workshop.prerequisites.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <Target className="w-6 h-6 mr-2 text-red-600" />
                      Prerequisites
                    </h3>
                    <ul className="space-y-2">
                      {workshop.prerequisites.map((prerequisite, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="w-5 h-5 mr-3 mt-0.5 text-green-600 flex-shrink-0" />
                          <span className="text-gray-700">{prerequisite}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Materials Provided */}
                {workshop.materials && workshop.materials.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <FileText className="w-6 h-6 mr-2 text-red-600" />
                      Materials Provided
                    </h3>
                    <ul className="space-y-2">
                      {workshop.materials.map((material, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="w-5 h-5 mr-3 mt-0.5 text-green-600 flex-shrink-0" />
                          <span className="text-gray-700">{material}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Info */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Info</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{workshop.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Capacity:</span>
                      <span className="font-medium">{workshop.capacity} participants</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Available Spots:</span>
                      <span className="font-medium text-green-600">
                        {workshop.capacity - workshop.registered} remaining
                      </span>
                    </div>
                    {workshop.price && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price:</span>
                        <span className="font-bold text-red-600">${workshop.price}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Workshop Format */}
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Workshop Format</h3>
                  <div className="space-y-3 text-sm text-gray-700">
                    <div className="flex items-start">
                      <AlertCircle className="w-4 h-4 mr-2 mt-0.5 text-blue-600 flex-shrink-0" />
                      <span>Interactive hands-on training</span>
                    </div>
                    <div className="flex items-start">
                      <AlertCircle className="w-4 h-4 mr-2 mt-0.5 text-blue-600 flex-shrink-0" />
                      <span>Case studies and group exercises</span>
                    </div>
                    <div className="flex items-start">
                      <AlertCircle className="w-4 h-4 mr-2 mt-0.5 text-blue-600 flex-shrink-0" />
                      <span>Q&A sessions with expert instructor</span>
                    </div>
                    <div className="flex items-start">
                      <AlertCircle className="w-4 h-4 mr-2 mt-0.5 text-blue-600 flex-shrink-0" />
                      <span>Certificate of completion provided</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'instructor' && (
            <div className="max-w-4xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Meet Your Instructor</h2>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-8">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/3">
                      {/* You can add instructor image here if available in the data */}
                      <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center mx-auto">
                        <User className="w-20 h-20 text-gray-400" />
                      </div>
                    </div>
                    <div className="md:w-2/3">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{workshop.instructor}</h3>
                      <p className="text-red-600 font-medium mb-4">Workshop Instructor</p>
                      <p className="text-gray-700 leading-relaxed mb-6">
                        Our instructor brings extensive experience in pediatric neurology and is dedicated to 
                        providing hands-on, practical training that participants can immediately apply in 
                        their practice.
                      </p>
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">Areas of Expertise:</h4>
                        <div className="flex flex-wrap gap-2">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 text-sm rounded-full">
                            Pediatric Neurology
                          </span>
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 text-sm rounded-full">
                            Clinical Training
                          </span>
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 text-sm rounded-full">
                            Medical Education
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logistics' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Workshop Logistics</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Location & Timing */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Location & Timing</h3>
                  <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                    <div className="flex items-start">
                      <Calendar className="w-5 h-5 mr-3 mt-1 text-red-600" />
                      <div>
                        <div className="font-medium text-gray-900">{formatDate(workshop.date)}</div>
                        <div className="text-gray-600">{workshop.time}</div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="w-5 h-5 mr-3 mt-1 text-red-600" />
                      <div>
                        <div className="font-medium text-gray-900">{workshop.location}</div>
                        {workshop.venue && (
                          <div className="text-gray-600">{workshop.venue}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Clock className="w-5 h-5 mr-3 mt-1 text-red-600" />
                      <div>
                        <div className="font-medium text-gray-900">Duration: {workshop.duration}</div>
                        <div className="text-gray-600">Please arrive 15 minutes early</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* What to Bring */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">What to Bring</h3>
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 mr-3 mt-0.5 text-blue-600 flex-shrink-0" />
                        <span className="text-gray-700">Valid ID for registration</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 mr-3 mt-0.5 text-blue-600 flex-shrink-0" />
                        <span className="text-gray-700">Notebook and pen for taking notes</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 mr-3 mt-0.5 text-blue-600 flex-shrink-0" />
                        <span className="text-gray-700">Comfortable clothing for practical sessions</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 mr-3 mt-0.5 text-blue-600 flex-shrink-0" />
                        <span className="text-gray-700">Any relevant case materials (optional)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Need Help?</h3>
                <div className="bg-red-50 p-6 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-red-600" />
                      <a href="mailto:workshops@acna.org" className="text-red-600 hover:underline">
                        workshops@acna.org
                      </a>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-red-600" />
                      <span className="text-gray-700">+250-788-123-456</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'registration' && (
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Workshop Registration</h2>
              
              {!registrationOpen ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Registration is {workshop.status === 'Completed' ? 'closed' : 'not yet open'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {workshop.status === 'Completed' 
                      ? 'This workshop has already taken place.' 
                      : 'Registration will open soon. Check back later or subscribe to our newsletter for updates.'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Workshop Summary */}
                  <div className="bg-blue-50 p-6 rounded-lg mb-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Workshop Summary</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Date:</span>
                        <div className="font-medium">{formatDate(workshop.date)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Time:</span>
                        <div className="font-medium">{workshop.time}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Duration:</span>
                        <div className="font-medium">{workshop.duration}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Location:</span>
                        <div className="font-medium">{workshop.location}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Spots Available:</span>
                        <div className="font-medium text-green-600">
                          {workshop.capacity - workshop.registered} of {workshop.capacity}
                        </div>
                      </div>
                      {workshop.price && (
                        <div>
                          <span className="text-gray-600">Price:</span>
                          <div className="font-bold text-red-600">${workshop.price}</div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {registrationStatus && (
                    <div className={`mb-6 p-4 rounded-md ${
                      registrationStatus.type === 'success' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {registrationStatus.message}
                    </div>
                  )}

                  {/* Registration Form */}
                  <form onSubmit={handleRegistration} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                          First Name *
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          value={registrationData.firstName}
                          onChange={(e) => setRegistrationData(prev => ({...prev, firstName: e.target.value}))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          value={registrationData.lastName}
                          onChange={(e) => setRegistrationData(prev => ({...prev, lastName: e.target.value}))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={registrationData.email}
                        onChange={(e) => setRegistrationData(prev => ({...prev, email: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-1">
                        Organization *
                      </label>
                      <input
                        type="text"
                        id="organization"
                        value={registrationData.organization}
                        onChange={(e) => setRegistrationData(prev => ({...prev, organization: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                        placeholder="Hospital, University, etc."
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="profession" className="block text-sm font-medium text-gray-700 mb-1">
                        Profession/Title *
                      </label>
                      <input
                        type="text"
                        id="profession"
                        value={registrationData.profession}
                        onChange={(e) => setRegistrationData(prev => ({...prev, profession: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                        placeholder="Pediatric Neurologist, etc."
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        value={registrationData.phone}
                        onChange={(e) => setRegistrationData(prev => ({...prev, phone: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                        placeholder="Enter your phone number"
                      />
                    </div>

                    {/* Terms and Conditions */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          id="terms"
                          className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                          required
                        />
                        <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
                          I agree to the{' '}
                          <a href="/terms-and-conditions" className="text-red-600 hover:underline">Terms and Conditions</a>
                          {' '}and{' '}
                          <a href="/privacy-policy" className="text-red-600 hover:underline">Privacy Policy</a>
                        </label>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isRegistering || (workshop.capacity - workshop.registered) <= 0}
                      className={`w-full bg-orange-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-700 transition-colors uppercase tracking-wide ${
                        isRegistering || (workshop.capacity - workshop.registered) <= 0 ? 'opacity-75 cursor-not-allowed' : ''
                      }`}
                    >
                      {isRegistering ? 'Processing Registration...' : 
                       (workshop.capacity - workshop.registered) <= 0 ? 'Workshop Full' : 
                       'Complete Registration'}
                    </button>

                    <div className="text-center text-sm text-gray-600">
                      <p>Secure registration • Confirmation email will be sent</p>
                      <p className="mt-1">
                        Questions? Contact us at{' '}
                        <a href="mailto:workshops@acna.org" className="text-red-600 hover:underline">
                          workshops@acna.org
                        </a>
                      </p>
                    </div>
                  </form>
                </>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default WorkshopDetailPage;