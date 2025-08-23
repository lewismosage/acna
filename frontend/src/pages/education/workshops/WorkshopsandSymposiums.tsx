import { useEffect, useState } from "react";
import {
  Calendar,
  UserPlus,
  AlertCircle,
  Target,
  Globe,
  Users2,
  Mail,
  ArrowRight,
  Users,
  Clock,
  MapPin,
  BookOpen,
  X,
  CheckCircle,
  Building,
  Phone
} from "lucide-react";
import api from '../../../services/api';
import { workshopsApi, Workshop } from '../../../services/workshopAPI';

// Import the CollaborationsTab component
import CollaborationsTab from './Collaborations';

interface SubscriptionStatus {
  type: 'success' | 'error';
  message: string;
}

interface AccordionItem {
  title: string;
  content: string;
}

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

const WorkshopsSymposiums = () => {
  // Add back the activeTab state
  const [activeTab, setActiveTab] = useState<"highlights" | "collaborations">("highlights");
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  
  // Workshops state
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);
  const [showWorkshopDetails, setShowWorkshopDetails] = useState(false);
  
  // Registration state
  const [showRegistrationSidebar, setShowRegistrationSidebar] = useState(false);
  const [registrationWorkshop, setRegistrationWorkshop] = useState<Workshop | null>(null);
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

 

  // Add back the useEffect for handling hash navigation
  useEffect(() => {
    if (window.location.hash === '#opportunities') {
      setActiveTab("collaborations");
      setTimeout(() => {
        const element = document.getElementById("opportunities");
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, []);

  // Fetch workshops on component mount
  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        setLoading(true);
        const workshopsData = await workshopsApi.getUpcoming();
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

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubscriptionStatus(null);

    try {
      const response = await api.post('/newsletter/subscribe/', {
        email,
        first_name: firstName,
        last_name: lastName,
        source: 'workshops_and_symposiums'
      });

      setSubscriptionStatus({
        type: 'success',
        message: 'Thank you for subscribing to our newsletter!'
      });
      setEmail('');
      setFirstName('');
      setLastName('');
    } catch (error: unknown) {
      let errorMessage = 'Failed to subscribe. Please try again later.';
      
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as { response?: { status?: number, data?: any } };
        if (axiosError.response?.status === 400 && axiosError.response.data?.email) {
          errorMessage = axiosError.response.data.email[0];
        } else if (axiosError.response?.data?.detail) {
          errorMessage = axiosError.response.data.detail;
        }
      }

      setSubscriptionStatus({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShowMore = (workshop: Workshop) => {
    setSelectedWorkshop(workshop);
    setShowWorkshopDetails(true);
  };

  const handleRegisterClick = (workshop: Workshop) => {
    setRegistrationWorkshop(workshop);
    setShowRegistrationSidebar(true);
    setShowWorkshopDetails(false);
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!registrationWorkshop) return;

    setIsRegistering(true);
    setRegistrationStatus(null);

    try {
      // Call the workshop registration API
      const registrationPayload = {
        workshop: registrationWorkshop.id,
        firstName: registrationData.firstName,
        lastName: registrationData.lastName,
        email: registrationData.email,
        phone: registrationData.phone,
        organization: registrationData.organization,
        profession: registrationData.profession,
        registrationType: 'Free' as const, 
        country: '', 
      };

      const result = await workshopsApi.createRegistration(registrationPayload);
      
      setRegistrationStatus({
        type: 'success',
        message: `Registration successful! You have been registered for "${registrationWorkshop.title}". You will receive a confirmation email shortly.`
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Registration Open':
        return 'bg-green-600';
      case 'In Progress':
        return 'bg-yellow-600';
      case 'Planning':
        return 'bg-blue-600';
      case 'Completed':
        return 'bg-gray-600';
      case 'Cancelled':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-6">
            Workshops & Symposiums
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 font-light max-w-3xl mx-auto mb-8">
            Deepening knowledge, growing collaboration, and shaping the future of child neurology in Africa
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-gray-600">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-red-600" />
              <span>{workshops.length} Active Workshops</span>
            </div>
            <div className="flex items-center">
              <UserPlus className="w-5 h-5 mr-2 text-red-600" />
              <span>Open Registration</span>
            </div>
            <div className="flex items-center">
              <Globe className="w-5 h-5 mr-2 text-red-600" />
              <span>18 African Countries Reached</span>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs - Add this back */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-center">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab("highlights")}
                className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                  activeTab === "highlights"
                    ? "bg-white text-red-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Highlights
              </button>
              <button
                onClick={() => setActiveTab("collaborations")}
                className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                  activeTab === "collaborations"
                    ? "bg-white text-red-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Collaboration Opportunities
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content - Wrap content in conditional tabs */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        {activeTab === "highlights" && (
          <div className="space-y-16">
            {/* What Are Workshops & Symposiums */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                What Are Workshops & Symposiums at ACNA?
              </h2>
              <div className="bg-blue-50 rounded-xl p-8 space-y-4">
                <p className="text-gray-700">
                  <strong>Workshops</strong> at ACNA are intensive, hands-on training sessions focused on developing practical skills in pediatric neurology. These sessions typically last 1-3 days and emphasize interactive learning through case studies, demonstrations, and small group exercises.
                </p>
                <p className="text-gray-700">
                  <strong>Symposiums</strong> are academic gatherings where experts present and discuss the latest research, clinical practices, and policy developments in child neurology. These events foster knowledge exchange and often feature panel discussions and networking opportunities.
                </p>
                <p className="text-gray-700">
                  Together, these educational formats play a crucial role in ACNA's mission to build capacity, advance professional development, and promote cutting-edge research across Africa's pediatric neurology community.
                </p>
              </div>
            </section>

            {/* ACNA Workshops Section */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <BookOpen className="w-8 h-8 text-red-600 mr-3" />
                ACNA Workshops
              </h2>
              
              {loading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-12 bg-red-50 rounded-lg">
                  <AlertCircle className="w-12 h-12 mx-auto text-red-400 mb-4" />
                  <p className="text-red-600">{error}</p>
                </div>
              ) : workshops.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No workshops available at the moment</p>
                </div>
              ) : (
                <>
                  <div className="grid md:grid-cols-2 gap-8 mb-12">
                    {workshops.map((workshop) => (
                      <div key={workshop.id} className="group cursor-pointer flex gap-4 hover:bg-gray-50 transition-colors duration-200 p-4 rounded-lg">
                        <div className="relative flex-shrink-0 w-24 h-24 overflow-hidden rounded">
                          <img
                            src={workshop.imageUrl}
                            alt={workshop.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-1 left-1">
                            <span className={`${getStatusColor(workshop.status)} text-white px-2 py-0.5 text-xs font-bold uppercase tracking-wide`}>
                              WORKSHOP
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-orange-600 font-medium text-xs uppercase">
                            {workshop.date}, {workshop.time}
                          </p>
                          <h3 className="text-base font-bold text-gray-900 leading-tight group-hover:text-red-600 transition-colors">
                            {workshop.title}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {workshop.location} • Duration: {workshop.duration}
                          </p>
                          <p className="text-gray-600 text-sm">
                            Instructor: {workshop.instructor}
                          </p>
                          <button 
                            onClick={() => handleShowMore(workshop)}
                            className="text-red-600 text-sm font-medium inline-flex items-center hover:text-red-700"
                          >
                            VIEW MORE <ArrowRight className="ml-1 w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-center">
                    <a
                      href="/workshops"
                      className="border-2 border-orange-600 text-gray-800 px-6 py-3 text-sm font-bold tracking-wider hover:bg-orange-600 hover:text-white transition-all duration-300 rounded-lg"
                    >
                      VIEW ALL WORKSHOPS
                    </a>
                  </div>
                </>
              )}
            </section>

            {/* Stay Engaged */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <Mail className="w-8 h-8 text-red-600 mr-3" />
                Stay Engaged
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-blue-50 rounded-xl p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Join Our Community</h3>
                  <p className="text-gray-700 mb-6">
                    Never miss an announcement about upcoming workshops and symposiums. Connect with fellow professionals and access event materials.
                  </p>
                  <form onSubmit={handleSubscribe} className="max-w-md mx-auto">
                    {subscriptionStatus && (
                      <div className={`mb-4 p-3 rounded-md ${
                        subscriptionStatus.type === 'success' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {subscriptionStatus.message}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <input
                          type="text"
                          placeholder="First name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg text-grey-900 focus:outline-none focus:ring-2 focus:ring-white"
                          required
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Last name"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="relative mb-4">
                      <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-6 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                        required
                      />
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className={`absolute right-2 top-2 bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors flex items-center ${
                          isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                        }`}
                      >
                        {isSubmitting ? (
                          'Subscribing...'
                        ) : (
                          <>
                            <Mail className="mr-2 h-4 w-4" />
                            Subscribe
                          </>
                        )}
                      </button>
                    </div>
                    
                    <p className="text-xs sm:text-sm text-grey-100 opacity-90">
                      By subscribing, you agree to receive event notifications and updates from ACNA. You can unsubscribe at any time.
                    </p>
                  </form>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Access Resources</h3>
                  <p className="text-gray-700 mb-6">
                    Materials from past ACNA workshops and symposiums are available to members. Log in to access presentations, recordings, and training manuals.
                  </p>
                  <div className="space-y-3">
                    <a
                      href="/login"
                      className="block bg-white border border-red-600 text-red-600 px-4 py-3 rounded-lg font-medium text-center hover:bg-red-50 transition"
                    >
                      Member Login
                    </a>
                    <a
                      href="/register"
                      className="block bg-gray-900 text-white px-4 py-3 rounded-lg font-medium text-center hover:bg-gray-800 transition"
                    >
                      Become a Member
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Collaborations Tab Content - Add this */}
        {activeTab === "collaborations" && <CollaborationsTab />}
      </div>

      {/* Workshop Details Modal */}
      {showWorkshopDetails && selectedWorkshop && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              {/* Header Image */}
              <div className="relative h-64">
                <img
                  src={selectedWorkshop.imageUrl}
                  alt={selectedWorkshop.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className={`${getStatusColor(selectedWorkshop.status)} text-white px-3 py-1 text-sm font-bold uppercase tracking-wide rounded`}>
                    {selectedWorkshop.status}
                  </span>
                </div>
                <button
                  onClick={() => setShowWorkshopDetails(false)}
                  className="absolute top-4 right-4 bg-white bg-opacity-90 p-2 rounded-full hover:bg-opacity-100"
                >
                  <X className="w-5 h-5 text-gray-700" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 lg:p-8">
                <h1 className="text-3xl font-light text-gray-900 mb-4">
                  {selectedWorkshop.title}
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-700">
                      <Calendar className="w-5 h-5 mr-3 text-red-600" />
                      <span className="font-medium">{selectedWorkshop.date}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-700">
                      <Clock className="w-5 h-5 mr-3 text-red-600" />
                      <span className="font-medium">{selectedWorkshop.time}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-700">
                      <MapPin className="w-5 h-5 mr-3 text-red-600" />
                      <div>
                        <div className="font-medium">{selectedWorkshop.location}</div>
                        {selectedWorkshop.venue && (
                          <div className="text-sm text-gray-600">{selectedWorkshop.venue}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-lg font-bold text-red-600">{selectedWorkshop.duration}</div>
                      <div className="text-xs text-gray-600">Duration</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-lg font-bold text-red-600">{selectedWorkshop.capacity}</div>
                      <div className="text-xs text-gray-600">Capacity</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-lg font-bold text-red-600">{selectedWorkshop.registered}</div>
                      <div className="text-xs text-gray-600">Registered</div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-light text-gray-900 mb-3">About This Workshop</h3>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {selectedWorkshop.description}
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-light text-gray-900 mb-3">Instructor</h3>
                  <p className="text-gray-700">
                    {selectedWorkshop.instructor}
                  </p>
                </div>

                {selectedWorkshop.prerequisites && selectedWorkshop.prerequisites.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xl font-light text-gray-900 mb-3">Prerequisites</h3>
                    <ul className="space-y-1">
                      {selectedWorkshop.prerequisites.map((prerequisite, index) => (
                        <li key={index} className="flex items-start text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{prerequisite}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedWorkshop.materials && selectedWorkshop.materials.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xl font-light text-gray-900 mb-3">Materials Provided</h3>
                    <ul className="space-y-1">
                      {selectedWorkshop.materials.map((material, index) => (
                        <li key={index} className="flex items-start text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{material}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedWorkshop.price && (
                  <div className="mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="text-xl font-light text-gray-900 mb-2">Registration Fee</h3>
                      <div className="text-2xl font-bold text-red-600">${selectedWorkshop.price}</div>
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={() => handleRegisterClick(selectedWorkshop)}
                    className="bg-orange-600 text-white px-8 py-3 rounded font-bold hover:bg-orange-700 transition-colors uppercase tracking-wide"
                  >
                    Register Now
                  </button>
                  <button
                    onClick={() => setShowWorkshopDetails(false)}
                    className="border border-gray-300 text-gray-700 px-6 py-3 rounded font-medium hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Registration Sidebar */}
      {showRegistrationSidebar && registrationWorkshop && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-lg overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Register for Workshop</h2>
                <button
                  onClick={() => {
                    setShowRegistrationSidebar(false);
                    setRegistrationStatus(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Workshop Info */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-medium text-gray-900 mb-2">{registrationWorkshop.title}</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {registrationWorkshop.date} at {registrationWorkshop.time}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {registrationWorkshop.location}
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    {registrationWorkshop.registered} / {registrationWorkshop.capacity} registered
                  </div>
                  {registrationWorkshop.price && (
                    <div className="text-lg font-bold text-red-600 mt-2">
                      ${registrationWorkshop.price}
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
              <form onSubmit={handleRegistration} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <input
                      type="text"
                      value={registrationData.firstName}
                      onChange={(e) => setRegistrationData(prev => ({...prev, firstName: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                    <input
                      type="text"
                      value={registrationData.lastName}
                      onChange={(e) => setRegistrationData(prev => ({...prev, lastName: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={registrationData.email}
                    onChange={(e) => setRegistrationData(prev => ({...prev, email: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organization *</label>
                  <input
                    type="text"
                    value={registrationData.organization}
                    onChange={(e) => setRegistrationData(prev => ({...prev, organization: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    placeholder="Hospital, University, etc."
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Profession/Title *</label>
                  <input
                    type="text"
                    value={registrationData.profession}
                    onChange={(e) => setRegistrationData(prev => ({...prev, profession: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    placeholder="Pediatric Neurologist, etc."
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={registrationData.phone}
                    onChange={(e) => setRegistrationData(prev => ({...prev, phone: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                </div>

                {/* Terms and Conditions */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="terms"
                      className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      required
                    />
                    <label htmlFor="terms" className="ml-2 text-xs text-gray-700">
                      I agree to the{' '}
                      <a href="/terms-and-conditions" className="text-red-600 hover:underline">Terms and Conditions</a>
                      {' '}and{' '}
                      <a href="/privacy-policy" className="text-red-600 hover:underline">Privacy Policy</a>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isRegistering}
                  className={`w-full bg-orange-600 text-white px-6 py-3 rounded font-bold hover:bg-orange-700 transition-colors uppercase tracking-wide ${
                    isRegistering ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isRegistering ? 'Processing Registration...' : 'Complete Registration'}
                </button>

                <div className="text-center text-xs text-gray-600">
                  <p>Secure registration • Confirmation email will be sent</p>
                </div>
              </form>

              {/* Contact Info */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Need Help?</h3>
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex items-center">
                    <Mail className="w-3 h-3 mr-2" />
                    <a href="mailto:workshops@acna.org" className="text-red-600 hover:underline">
                      workshops@acna.org
                    </a>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-3 h-3 mr-2" />
                    <span>+250-788-123-456</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkshopsSymposiums;