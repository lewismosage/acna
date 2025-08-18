import { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Mail, 
  Phone, 
  Globe, 
  Download, 
  Share2, 
  ChevronLeft,
  CheckCircle,
  ExternalLink,
  Building,
  Mic,
  UserCheck,
  Star
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { conferencesApi, Conference as ApiConference, Registration } from '../../services/conferenceApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ScrollToTop from '../../components/common/ScrollToTop';

interface RegistrationStatus {
  type: 'success' | 'error';
  message: string;
}

interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  organization: string;
  profession: string;
  phone: string;
  registrationType: 'earlyBird' | 'regular';
}

const ConferenceDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'speakers' | 'registration'>('overview');
  const [conference, setConference] = useState<ApiConference | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    firstName: '',
    lastName: '',
    email: '',
    organization: '',
    profession: '',
    phone: '',
    registrationType: 'earlyBird'
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<RegistrationStatus | null>(null);

  useEffect(() => {
    const fetchConference = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await conferencesApi.getById(parseInt(id));
        setConference(data);
      } catch (err) {
        setError('Failed to load conference details. Please try again later.');
        console.error('Error fetching conference:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConference();
  }, [id]);

  const handleRegistration = async () => {
    if (!conference || !id) return;
    
    setIsRegistering(true);
    setRegistrationStatus(null);
  
    try {
      // Create a type-safe registration payload
      const registrationPayload: Omit<Registration, 'id'> = {
        name: `${registrationData.firstName} ${registrationData.lastName}`,
        email: registrationData.email,
        phone: registrationData.phone,
        organization: registrationData.organization,
        registrationDate: new Date().toISOString(),
        registrationType: registrationData.registrationType === 'earlyBird' ? 'earlyBird' : 'regular',
        paymentStatus: 'Pending'
      };
  
      await conferencesApi.addRegistration(parseInt(id), registrationPayload);
      
      setRegistrationStatus({
        type: 'success',
        message: 'Registration successful! You will receive a confirmation email with further details shortly.'
      });
      
      // Reset form
      setRegistrationData({
        firstName: '',
        lastName: '',
        email: '',
        organization: '',
        profession: '',
        phone: '',
        registrationType: 'earlyBird'
      });
    } catch (err) {
      setRegistrationStatus({
        type: 'error',
        message: 'Registration failed. Please try again later.'
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const getProgressPercentage = () => {
    if (!conference) return 0;
    return Math.round(((conference.registrationCount || 0) / (conference.capacity || 1)) * 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Registration Open':
        return 'bg-green-500';
      case 'Coming Soon':
        return 'bg-yellow-500';
      case 'Completed':
        return 'bg-blue-500';
      case 'Cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getSessionIcon = (type: string) => {
    switch (type) {
      case 'keynote':
      case 'presentation':
        return <Mic className="w-4 h-4" />;
      case 'workshop':
        return <Users className="w-4 h-4" />;
      case 'panel':
        return <UserCheck className="w-4 h-4" />;
      case 'break':
        return <Clock className="w-4 h-4" />;
      case 'social':
        return <Star className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!conference) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div>Conference not found</div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <ScrollToTop />
      
      {/* Back Navigation */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-red-600 hover:text-red-700 font-medium"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Conferences
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-8 md:py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Conference Image */}
            <div className="lg:w-2/5">
              <div className="relative">
                <img
                  src={conference.imageUrl || '/default-conference.jpg'}
                  alt={conference.title}
                  className="w-full h-64 lg:h-80 object-cover rounded-lg shadow-lg"
                />
                <div className="absolute top-4 left-4">
                  <span className={`${getStatusColor(conference.status)} text-white px-3 py-1 text-sm font-bold uppercase tracking-wide rounded`}>
                    {conference.status}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="bg-orange-600 text-white px-3 py-1 text-sm font-bold rounded">
                    {conference.type}
                  </span>
                </div>
              </div>
            </div>

            {/* Conference Details */}
            <div className="lg:w-3/5">
              <div className="mb-4">
                <span className="text-red-600 font-medium text-sm uppercase tracking-wide">
                  ANNUAL CONFERENCE
                </span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-4 leading-tight">
                {conference.title}
              </h1>

              {conference.theme && (
                <p className="text-lg md:text-xl text-red-600 font-light mb-6">
                  {conference.theme}
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-3">
                  <div className="flex items-center text-gray-700">
                    <Calendar className="w-5 h-5 mr-3 text-red-600" />
                    <span className="font-medium">{conference.date}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-700">
                    <MapPin className="w-5 h-5 mr-3 text-red-600" />
                    <div>
                      <div className="font-medium">{conference.location}</div>
                      {conference.venue && (
                        <div className="text-sm text-gray-600">{conference.venue}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-700">
                    <Globe className="w-5 h-5 mr-3 text-red-600" />
                    <span className="font-medium">{conference.type}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-lg font-bold text-red-600">{conference.attendees || '0'}+</div>
                    <div className="text-xs text-gray-600">Attendees</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-lg font-bold text-red-600">{conference.speakers || '0'}+</div>
                    <div className="text-xs text-gray-600">Speakers</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-lg font-bold text-red-600">{conference.countries || '0'}+</div>
                    <div className="text-xs text-gray-600">Countries</div>
                  </div>
                </div>
              </div>

              {/* Registration Progress */}
              {conference.capacity && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Registration Progress</span>
                    <span className="text-sm text-gray-600">
                      {conference.registrationCount || 0} / {conference.capacity} ({getProgressPercentage()}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-600 h-2 rounded-full" 
                      style={{ width: `${getProgressPercentage()}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => setActiveTab('registration')}
                  className="bg-orange-600 text-white px-6 py-3 rounded font-bold hover:bg-orange-700 transition-colors uppercase tracking-wide"
                >
                  Register Now
                </button>
                
                <div className="flex gap-2">
                  <button className="border border-red-600 text-red-600 px-4 py-3 rounded hover:bg-red-50 transition-colors flex items-center">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </button>
                  <button className="border border-red-600 text-red-600 px-4 py-3 rounded hover:bg-red-50 transition-colors flex items-center">
                    <Download className="w-4 h-4 mr-2" />
                    Brochure
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
              { key: 'schedule', label: 'Schedule' },
              { key: 'speakers', label: 'Speakers' },
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
      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* Description */}
                <div>
                  <h2 className="text-2xl font-light text-gray-900 mb-4">About This Conference</h2>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {conference.description}
                  </p>
                </div>

                {/* Conference Highlights */}
                {conference.highlights && conference.highlights.length > 0 && (
                  <div>
                    <h3 className="text-xl font-light text-gray-900 mb-4">Conference Highlights</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {conference.highlights.map((highlight, index) => (
                        <div key={index} className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Registration Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-lg font-light text-gray-900 mb-3">Registration Fees</h3>
                  <div className="text-sm text-gray-700">
                    {conference.earlyBirdFee && conference.earlyBirdDeadline && (
                      <div className="mb-2">
                        <span className="font-semibold">Early Bird ({conference.earlyBirdDeadline}):</span> {conference.earlyBirdFee}
                      </div>
                    )}
                    {conference.regularFee && (
                      <div>
                        <span className="font-semibold">Regular:</span> {conference.regularFee}
                      </div>
                    )}
                  </div>
                </div>

                {/* Organizer Info */}
                <div className="bg-red-50 p-6 rounded-lg">
                  <h3 className="text-lg font-light text-gray-900 mb-4">Event Organizer</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center">
                      <Building className="w-4 h-4 mr-2 text-red-600" />
                      <span className="font-medium">African Child Neurology Association (ACNA)</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-red-600" />
                      <a href="mailto:events@acna.org" className="text-red-600 hover:underline">
                        events@acna.org
                      </a>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-red-600" />
                      <span>+250-788-123-456</span>
                    </div>
                    <div className="flex items-center">
                      <ExternalLink className="w-4 h-4 mr-2 text-red-600" />
                      <a href="https://www.acna.org" className="text-red-600 hover:underline">
                        www.acna.org
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-4">
                  Conference Schedule
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  A comprehensive program featuring keynotes, workshops, panels, and networking opportunities.
                </p>
              </div>

              {conference.program && conference.program.length > 0 ? (
                <div className="mb-12">
                  <h3 className="text-xl font-light text-gray-900 mb-6 pb-2 border-b-2 border-red-600">
                    Conference Program
                  </h3>
                  
                  <div className="space-y-4">
                    {conference.program.map((session, index) => (
                      <div 
                        key={index} 
                        className="border border-gray-200 rounded-lg p-4 lg:p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col md:flex-row md:items-start gap-4">
                          <div className="flex items-center md:w-48 flex-shrink-0">
                            <div className="bg-red-600 text-white p-2 rounded mr-3">
                              {getSessionIcon(session.type)}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900">{session.time}</div>
                              {session.location && (
                                <div className="text-xs text-gray-600">{session.location}</div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <h4 className="text-lg font-light text-gray-900 mb-2">
                              {session.title}
                            </h4>
                            
                            {session.speaker && (
                              <div className="text-red-600 font-medium text-sm mb-1">
                                Speaker: {session.speaker}
                              </div>
                            )}
                            
                            {session.moderator && (
                              <div className="text-gray-700 text-sm mb-2">
                                <span className="font-medium">Moderator:</span> {session.moderator}
                              </div>
                            )}
                            
                            {session.duration && (
                              <div className="text-sm text-blue-600 font-medium">
                                Duration: {session.duration}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Clock className="w-12 h-12 mx-auto text-gray-400" />
                  <p className="mt-4 text-gray-600">Schedule details will be available soon</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'speakers' && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-4">
                  Featured Speakers
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Meet the distinguished experts and thought leaders who will be sharing their knowledge and insights at our conference.
                </p>
              </div>

              {conference.speakersList && conference.speakersList.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                  {conference.speakersList.map((speaker, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                      <div className="relative">
                        <img
                          src={speaker.imageUrl || '/default-speaker.jpg'}
                          alt={speaker.name}
                          className="w-full h-48 object-cover"
                        />
                        {speaker.isKeynote && (
                          <div className="absolute top-2 left-2">
                            <span className="bg-red-600 text-white px-2 py-1 text-xs font-bold uppercase tracking-wide rounded">
                              Keynote
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-light text-gray-900 mb-1">
                          {speaker.name}
                        </h3>
                        <p className="text-red-600 font-medium text-sm mb-1">
                          {speaker.title}
                        </p>
                        <p className="text-gray-600 text-xs mb-2">
                          {speaker.organization}
                        </p>
                        <div className="bg-gray-50 p-3 rounded">
                          <p className="text-xs text-gray-700">
                            <span className="font-medium">Bio:</span> {speaker.bio || 'Speaker information coming soon'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Mic className="w-12 h-12 mx-auto text-gray-400" />
                  <p className="mt-4 text-gray-600">Speaker information will be announced soon</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'registration' && (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-4">
                  Register for Conference
                </h2>
                <p className="text-gray-600">
                  Join us for this exciting conference with leading experts in the field.
                </p>
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
              <div className="bg-white border border-gray-200 rounded-lg p-6 lg:p-8">
                <div className="space-y-6">
                  {/* Registration Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Registration Type</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {conference.earlyBirdFee && conference.earlyBirdDeadline && (
                        <div className="relative">
                          <input
                            type="radio"
                            id="earlyBird"
                            name="registrationType"
                            value="earlyBird"
                            checked={registrationData.registrationType === 'earlyBird'}
                            onChange={(e) => setRegistrationData(prev => ({...prev, registrationType: e.target.value as any}))}
                            className="sr-only"
                          />
                          <label
                            htmlFor="earlyBird"
                            className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                              registrationData.registrationType === 'earlyBird'
                                ? 'border-red-600 bg-red-50'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            <div className="font-medium text-gray-900">Early Bird</div>
                            <div className="text-2xl font-bold text-red-600">{conference.earlyBirdFee}</div>
                            <div className="text-sm text-gray-600">Until {conference.earlyBirdDeadline}</div>
                          </label>
                        </div>
                      )}
                      
                      {conference.regularFee && (
                        <div className="relative">
                          <input
                            type="radio"
                            id="regular"
                            name="registrationType"
                            value="regular"
                            checked={registrationData.registrationType === 'regular'}
                            onChange={(e) => setRegistrationData(prev => ({...prev, registrationType: e.target.value as any}))}
                            className="sr-only"
                          />
                          <label
                            htmlFor="regular"
                            className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                              registrationData.registrationType === 'regular'
                                ? 'border-red-600 bg-red-50'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            <div className="font-medium text-gray-900">Regular</div>
                            <div className="text-2xl font-bold text-red-600">{conference.regularFee}</div>
                            <div className="text-sm text-gray-600">Standard Rate</div>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                      <input
                        type="text"
                        value={registrationData.firstName}
                        onChange={(e) => setRegistrationData(prev => ({...prev, firstName: e.target.value}))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                        placeholder="Enter your first name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                      <input
                        type="text"
                        value={registrationData.lastName}
                        onChange={(e) => setRegistrationData(prev => ({...prev, lastName: e.target.value}))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                        placeholder="Enter your last name"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                      placeholder="Enter your email address"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Organization *</label>
                      <input
                        type="text"
                        value={registrationData.organization}
                        onChange={(e) => setRegistrationData(prev => ({...prev, organization: e.target.value}))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                        placeholder="Pediatric Neurologist, etc."
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={registrationData.phone}
                      onChange={(e) => setRegistrationData(prev => ({...prev, phone: e.target.value}))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
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
                      <label htmlFor="terms" className="ml-3 text-sm text-gray-700">
                        I agree to the{' '}
                        <a href="/terms-and-conditions" className="text-red-600 hover:underline">Terms and Conditions</a>
                        {' '}and{' '}
                        <a href="/privacy-policy" className="text-red-600 hover:underline">Privacy Policy</a>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={handleRegistration}
                    disabled={isRegistering}
                    className={`w-full bg-orange-600 text-white px-6 py-3 rounded font-bold hover:bg-orange-700 transition-colors uppercase tracking-wide ${
                      isRegistering ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {isRegistering ? 'Processing Registration...' : 'Complete Registration'}
                  </button>

                  <div className="text-center text-sm text-gray-600">
                    <p>Secure payment processing • Full refund available until 30 days before event</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ConferenceDetailPage;