import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Users, 
  Download, 
  Share2, 
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Play,
  Bookmark,
  Globe,
  Mail
} from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import { Webinar, webinarsApi } from '../../services/webinarsApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ScrollToTop from '../../components/common/ScrollToTop';

const WebinarDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'overview' | 'speakers' | 'resources' | 'registration'>('overview');
  const [webinar, setWebinar] = useState<Webinar | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registrationData, setRegistrationData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    organization: '',
    profession: '',
    phone: '',
    country: ''
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<{type: 'success' | 'error'; message: string} | null>(null);

  useEffect(() => {
    const fetchWebinar = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const webinarData = await webinarsApi.getById(parseInt(id));
        setWebinar(webinarData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load webinar');
      } finally {
        setLoading(false);
      }
    };

    fetchWebinar();
  }, [id]);

  const isUpcoming = (webinar: Webinar): boolean => {
    if (webinar.status === 'Completed' || webinar.status === 'Cancelled') return false;
    if (webinar.status === 'Live') return false;
    
    // For other statuses, check if the date is in the future
    if (webinar.date) {
      const webinarDate = new Date(webinar.date);
      const today = new Date();
      return webinarDate > today;
    }
    
    return webinar.status === 'Registration Open' || webinar.status === 'Planning';
  };

  const isLive = (webinar: Webinar): boolean => {
    return webinar.status === 'Live';
  };

  const handleRegistration = async () => {
    if (!webinar) return;
    
    setIsRegistering(true);
    setRegistrationStatus(null);

    try {
      await webinarsApi.createRegistration({
        webinar: webinar.id,
        attendeeName: `${registrationData.firstName} ${registrationData.lastName}`,
        email: registrationData.email,
        phone: registrationData.phone,
        organization: registrationData.organization,
        registrationType: 'Free',
        country: registrationData.country
      });
      
      setRegistrationStatus({
        type: 'success',
        message: 'Registration successful! You will receive a confirmation email with joining details shortly.'
      });
      
      // Reset form
      setRegistrationData({
        firstName: '',
        lastName: '',
        email: '',
        organization: '',
        profession: '',
        phone: '',
        country: ''
      });
    } catch (err) {
      setRegistrationStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Registration failed. Please try again later.'
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const getStatusBadge = () => {
    if (!webinar) return null;
    
    if (isLive(webinar)) {
      return (
        <span className="bg-red-600 text-white px-3 py-1 text-sm font-bold rounded-full flex items-center">
          <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
          LIVE NOW
        </span>
      );
    }
    if (isUpcoming(webinar)) {
      return (
        <span className="bg-blue-600 text-white px-3 py-1 text-sm font-bold rounded-full">
          UPCOMING
        </span>
      );
    }
    return (
      <span className="bg-gray-600 text-white px-3 py-1 text-sm font-bold rounded-full">
        RECORDED
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        < LoadingSpinner />
      </div>
    );
  }

  if (error || !webinar) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Webinar Not Found</h2>
          <p className="text-gray-600 mb-4">{error || "The webinar you're looking for doesn't exist."}</p>
          <Link to="/webinars" className="text-red-600 hover:text-red-700 font-medium">
            Back to Webinars
          </Link>
        </div>
      </div>
    );
  }

  const webinarIsUpcoming = isUpcoming(webinar);
  const webinarIsLive = isLive(webinar);

  return (
    <div className="bg-white min-h-screen">
      {/* Back Navigation */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link to="/webinars" className="flex items-center text-red-600 hover:text-red-700 font-medium">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Webinars
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-12 md:py-16">
      < ScrollToTop />
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Webinar Image */}
            <div className="lg:w-2/5">
              <div className="relative">
                <img
                  src={webinar.imageUrl}
                  alt={webinar.title}
                  className="w-full h-64 lg:h-80 object-cover rounded-lg shadow-lg"
                />
                <div className="absolute top-4 left-4">
                  {getStatusBadge()}
                </div>
                {webinar.isFeatured && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-yellow-500 text-white px-3 py-1 text-sm font-bold rounded flex items-center">
                      <Bookmark className="w-4 h-4 mr-1" />
                      FEATURED
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Webinar Details */}
            <div className="lg:w-3/5">
              <div className="mb-4">
                <span className="text-red-600 font-medium text-sm uppercase tracking-wide">
                  {webinar.category}
                </span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                {webinar.title}
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-5 h-5 mr-3 text-red-600" />
                    <div>
                      <div className="font-medium">{webinar.date}</div>
                      <div className="text-sm">{webinar.time}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-5 h-5 mr-3 text-red-600" />
                    <span>{webinar.duration}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Users className="w-5 h-5 mr-3 text-red-600" />
                    <span>For: {webinar.targetAudience.join(', ')}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Globe className="w-5 h-5 mr-3 text-red-600" />
                    <span>Languages: {webinar.languages.join(', ')}</span>
                  </div>
                  
                  {webinar.registrationCount !== undefined && (
                    <div className="flex items-center text-gray-600">
                      <User className="w-5 h-5 mr-3 text-red-600" />
                      <span>{webinar.registrationCount} registered</span>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed">
                {webinar.description}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                {webinarIsUpcoming ? (
                  <button 
                    onClick={() => setActiveTab('registration')}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center"
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    Register Now - Free
                  </button>
                ) : webinar.recordingLink ? (
                  <a
                    href={webinar.recordingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Watch Recording
                  </a>
                ) : null}
                
                <div className="flex gap-2">
                  <button className="border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </button>
                  {webinar.slidesLink && (
                    <a
                      href={webinar.slidesLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Slides
                    </a>
                  )}
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
              { key: 'speakers', label: 'Speakers' },
              { key: 'resources', label: 'Resources' },
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
                {/* Description */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Webinar</h2>
                  <p className="text-gray-700 leading-relaxed">
                    {webinar.description}
                  </p>
                </div>

                {/* Learning Objectives */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Learning Objectives</h3>
                  <ul className="space-y-2">
                    {webinar.learningObjectives.map((objective, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 mr-3 mt-0.5 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tags */}
                {webinar.tags.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Topics Covered</h3>
                    <div className="flex flex-wrap gap-2">
                      {webinar.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Target Audience */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Target Audience</h3>
                  <ul className="space-y-2">
                    {webinar.targetAudience.map((audience, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-700">
                        <User className="w-4 h-4 mr-2 text-red-600" />
                        {audience}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Technical Requirements */}
                {webinarIsUpcoming && (
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Technical Requirements</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start">
                        <AlertCircle className="w-4 h-4 mr-2 mt-0.5 text-blue-600 flex-shrink-0" />
                        <span>Stable internet connection</span>
                      </li>
                      <li className="flex items-start">
                        <AlertCircle className="w-4 h-4 mr-2 mt-0.5 text-blue-600 flex-shrink-0" />
                        <span>Computer or mobile device with audio</span>
                      </li>
                      <li className="flex items-start">
                        <AlertCircle className="w-4 h-4 mr-2 mt-0.5 text-blue-600 flex-shrink-0" />
                        <span>Web browser (Chrome, Firefox, Safari, or Edge)</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'speakers' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Speakers</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {webinar.speakers.map((speaker, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start mb-4">
                        {speaker.imageUrl ? (
                          <img
                            src={speaker.imageUrl}
                            alt={speaker.name}
                            className="w-16 h-16 rounded-full object-cover mr-4"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                            <User className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{speaker.name}</h3>
                          <p className="text-red-600 font-medium">{speaker.credentials}</p>
                          <p className="text-gray-600">{speaker.affiliation}</p>
                        </div>
                      </div>
                      {speaker.bio && (
                        <p className="text-gray-700 text-sm leading-relaxed mb-4">{speaker.bio}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Webinar Resources</h2>
                
                {!webinar.isUpcoming ? (
                  <div className="space-y-6">
                    {webinar.recordingLink && (
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                          <Play className="w-5 h-5 mr-2 text-red-600" />
                          Recording
                        </h3>
                        <p className="text-gray-700 mb-4">Watch the full webinar recording at your convenience.</p>
                        <a
                          href={webinar.recordingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-red-600 hover:text-red-700 font-medium"
                        >
                          Watch Recording
                          <ExternalLink className="w-4 h-4 ml-1" />
                        </a>
                      </div>
                    )}
                    
                    {webinar.slidesLink && (
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                          <Download className="w-5 h-5 mr-2 text-red-600" />
                          Presentation Slides
                        </h3>
                        <p className="text-gray-700 mb-4">Download the presentation slides used during the webinar.</p>
                        <a
                          href={webinar.slidesLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-red-600 hover:text-red-700 font-medium"
                        >
                          Download Slides
                          <ExternalLink className="w-4 h-4 ml-1" />
                        </a>
                      </div>
                    )}
                    
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Additional Resources</h3>
                      <p className="text-gray-700">
                        For more information on this topic, please visit the ACNA resources section or contact us directly.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Resources will be available after the webinar
                    </h3>
                    <p className="text-gray-600">
                      Check back here after the webinar date to access the recording and presentation materials.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'registration' && (
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Register for This Webinar</h2>
              
              {!webinar.isUpcoming ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Registration is closed
                  </h3>
                  <p className="text-gray-600 mb-6">
                    This webinar has already taken place. You can watch the recording on the Resources tab.
                  </p>
                  <button 
                    onClick={() => setActiveTab('resources')}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                  >
                    View Resources
                  </button>
                </div>
              ) : (
                <>
                  <div className="bg-blue-50 p-6 rounded-lg mb-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Webinar Details</h3>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                        <span>{webinar.date} at {webinar.time}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-blue-600" />
                        <span>Duration: {webinar.duration}</span>
                      </div>
                      {webinar.registrationLink && (
                        <div className="flex items-center">
                          <ExternalLink className="w-4 h-4 mr-2 text-blue-600" />
                          <a 
                            href={webinar.registrationLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            External registration page
                          </a>
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

                  <div className="space-y-4">
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-1">
                          Organization
                        </label>
                        <input
                          type="text"
                          id="organization"
                          value={registrationData.organization}
                          onChange={(e) => setRegistrationData(prev => ({...prev, organization: e.target.value}))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label htmlFor="profession" className="block text-sm font-medium text-gray-700 mb-1">
                          Profession/Title
                        </label>
                        <input
                          type="text"
                          id="profession"
                          value={registrationData.profession}
                          onChange={(e) => setRegistrationData(prev => ({...prev, profession: e.target.value}))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          value={registrationData.phone}
                          onChange={(e) => setRegistrationData(prev => ({...prev, phone: e.target.value}))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                          Country
                        </label>
                        <input
                          type="text"
                          id="country"
                          value={registrationData.country}
                          onChange={(e) => setRegistrationData(prev => ({...prev, country: e.target.value}))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleRegistration}
                      disabled={isRegistering}
                      className={`w-full bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors ${
                        isRegistering ? 'opacity-75 cursor-not-allowed' : ''
                      }`}
                    >
                      {isRegistering ? 'Registering...' : 'Register Now'}
                    </button>
                    
                    <p className="text-sm text-gray-500 text-center">
                      By registering, you agree to receive communications about this webinar and related ACNA events.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default WebinarDetailPage;