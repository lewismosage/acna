import { useState } from 'react';
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
  AlertCircle,
  ExternalLink,
  User,
  Building
} from 'lucide-react';

interface Speaker {
  id: number;
  name: string;
  title: string;
  organization: string;
  bio: string;
  imageUrl: string;
  expertise: string[];
}

interface Session {
  id: number;
  time: string;
  title: string;
  speaker: string;
  duration: string;
  type: 'presentation' | 'workshop' | 'panel' | 'break';
}

interface RegistrationStatus {
  type: 'success' | 'error';
  message: string;
}

const EventDetailsPage = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'program' | 'speakers' | 'logistics'>('overview');
  const [registrationData, setRegistrationData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    organization: '',
    profession: '',
    phone: ''
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<RegistrationStatus | null>(null);

  // Sample event data - in a real app, this would come from props or API
  const event = {
    id: 1,
    title: "ACNA Live from Nairobi: Advancing Pediatric Neurology Care Across East Africa",
    date: "August 15, 2025",
    time: "2:00PM-4:00PM EAT",
    location: "Live online",
    type: "upcoming",
    category: "CONFERENCE",
    description: "Join us for an interactive session discussing the latest advances in pediatric neurology care and treatment protocols across East African healthcare systems.",
    fullDescription: "This comprehensive conference brings together leading pediatric neurologists, healthcare professionals, and advocates from across East Africa to discuss groundbreaking advances in neurological care for children. The event will feature interactive presentations, case studies, and collaborative discussions on improving treatment protocols, accessibility, and outcomes for pediatric neurological conditions across the region.",
    imageUrl: "https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=600",
    isOnline: true,
    capacity: 500,
    registered: 347,
    price: "Free",
    languages: ["English", "Swahili"],
    cmeCredits: 2,
    targetAudience: [
      "Pediatric Neurologists",
      "General Pediatricians", 
      "Neurologists",
      "Medical Students",
      "Nursing Staff",
      "Healthcare Administrators",
      "Public Health Officials"
    ],
    learningObjectives: [
      "Understand current best practices in pediatric neurology care across East Africa",
      "Learn about innovative treatment protocols and their implementation",
      "Explore strategies for improving healthcare accessibility in resource-limited settings",
      "Network with leading professionals in the field",
      "Discuss collaborative approaches to advancing neurological care"
    ],
    keyTopics: [
      "Pediatric Epilepsy Management",
      "Cerebral Palsy Interventions",
      "Neurodevelopmental Disorders",
      "Community-Based Care Models",
      "Telemedicine Applications",
      "Healthcare Policy and Advocacy"
    ],
    organizer: {
      name: "African Child Neurology Association (ACNA)",
      contact: "events@acna.org",
      phone: "+254-700-123-456",
      website: "www.acna.org"
    },
    technicalRequirements: [
      "Stable internet connection",
      "Computer or mobile device with camera/microphone",
      "Zoom application (link will be provided upon registration)",
      "Quiet environment for participation"
    ]
  };

  const speakers: Speaker[] = [
    {
      id: 1,
      name: "Dr. Amara Okafor",
      title: "Chief of Pediatric Neurology",
      organization: "Kenyatta University Teaching Hospital",
      bio: "Dr. Okafor is a leading pediatric neurologist with over 15 years of experience in managing complex neurological conditions in children. She has published extensively on epilepsy management in resource-limited settings.",
      imageUrl: "https://images.pexels.com/photos/5407206/pexels-photo-5407206.jpeg?auto=compress&cs=tinysrgb&w=300",
      expertise: ["Pediatric Epilepsy", "Neurodevelopmental Disorders", "Community Health"]
    },
    {
      id: 2,
      name: "Prof. James Kithinji",
      title: "Professor of Neurology",
      organization: "University of Nairobi",
      bio: "Professor Kithinji is a renowned neurologist and researcher focusing on cerebral palsy interventions and rehabilitation strategies for children in East Africa.",
      imageUrl: "https://images.pexels.com/photos/6749778/pexels-photo-6749778.jpeg?auto=compress&cs=tinysrgb&w=300",
      expertise: ["Cerebral Palsy", "Neurorehabilitation", "Medical Education"]
    }
  ];

  const program: Session[] = [
    {
      id: 1,
      time: "2:00 PM",
      title: "Welcome & Opening Remarks",
      speaker: "ACNA Leadership Team",
      duration: "15 min",
      type: "presentation"
    },
    {
      id: 2,
      time: "2:15 PM",
      title: "Current Landscape of Pediatric Neurology in East Africa",
      speaker: "Dr. Amara Okafor",
      duration: "30 min",
      type: "presentation"
    },
    {
      id: 3,
      time: "2:45 PM",
      title: "Innovative Treatment Protocols: Case Studies & Best Practices",
      speaker: "Prof. James Kithinji",
      duration: "30 min",
      type: "presentation"
    },
    {
      id: 4,
      time: "3:15 PM",
      title: "Interactive Q&A Session",
      speaker: "All Speakers",
      duration: "20 min",
      type: "panel"
    },
    {
      id: 5,
      time: "3:35 PM",
      title: "Networking & Closing Remarks",
      speaker: "ACNA Team",
      duration: "25 min",
      type: "presentation"
    }
  ];

  const handleRegistration = async () => {
    setIsRegistering(true);
    setRegistrationStatus(null);

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setRegistrationStatus({
        type: 'success',
        message: 'Registration successful! You will receive a confirmation email with joining details shortly.'
      });
      setRegistrationData({
        firstName: '',
        lastName: '',
        email: '',
        organization: '',
        profession: '',
        phone: ''
      });
    } catch (error) {
      setRegistrationStatus({
        type: 'error',
        message: 'Registration failed. Please try again later.'
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'presentation':
        return 'bg-blue-100 text-blue-800';
      case 'workshop':
        return 'bg-green-100 text-green-800';
      case 'panel':
        return 'bg-purple-100 text-purple-800';
      case 'break':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Back Navigation */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button className="flex items-center text-red-600 hover:text-red-700 font-medium">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Events
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Event Image */}
            <div className="lg:w-2/5">
              <div className="relative">
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-64 lg:h-80 object-cover rounded-lg shadow-lg"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-red-600 text-white px-3 py-1 text-sm font-bold uppercase tracking-wide rounded">
                    {event.type} EVENT
                  </span>
                </div>
                {event.isOnline && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-green-600 text-white px-3 py-1 text-sm font-bold rounded flex items-center">
                      <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                      LIVE ONLINE
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Event Details */}
            <div className="lg:w-3/5">
              <div className="mb-4">
                <span className="text-red-600 font-medium text-sm uppercase tracking-wide">
                  {event.category}
                </span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                {event.title}
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-5 h-5 mr-3 text-red-600" />
                    <div>
                      <div className="font-medium">{event.date}</div>
                      <div className="text-sm">{event.time}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-5 h-5 mr-3 text-red-600" />
                    <span>{event.location}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Users className="w-5 h-5 mr-3 text-red-600" />
                    <span>{event.registered} registered / {event.capacity} capacity</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-5 h-5 mr-3 text-red-600" />
                    <span>2 hours</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <CheckCircle className="w-5 h-5 mr-3 text-red-600" />
                    <span>{event.cmeCredits} CME Credits</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Globe className="w-5 h-5 mr-3 text-red-600" />
                    <span>{event.languages.join(', ')}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center">
                  <Mail className="w-5 h-5 mr-2" />
                  Register Now - {event.price}
                </button>
                
                <div className="flex gap-2">
                  <button className="border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </button>
                  <button className="border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                    <Download className="w-4 h-4 mr-2" />
                    Download
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
              { key: 'program', label: 'Program' },
              { key: 'speakers', label: 'Speakers' },
              { key: 'logistics', label: 'Logistics' }
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Event</h2>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {event.fullDescription}
                  </p>
                </div>

                {/* Learning Objectives */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Learning Objectives</h3>
                  <ul className="space-y-2">
                    {event.learningObjectives.map((objective, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 mr-3 mt-0.5 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Key Topics */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Key Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {event.keyTopics.map((topic, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Target Audience */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Target Audience</h3>
                  <ul className="space-y-2">
                    {event.targetAudience.map((audience, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-700">
                        <User className="w-4 h-4 mr-2 text-red-600" />
                        {audience}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Organizer Info */}
                <div className="bg-red-50 p-6 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Event Organizer</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center">
                      <Building className="w-4 h-4 mr-2 text-red-600" />
                      <span className="font-medium">{event.organizer.name}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-red-600" />
                      <a href={`mailto:${event.organizer.contact}`} className="text-red-600 hover:underline">
                        {event.organizer.contact}
                      </a>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-red-600" />
                      <span>{event.organizer.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <ExternalLink className="w-4 h-4 mr-2 text-red-600" />
                      <a href={`https://${event.organizer.website}`} className="text-red-600 hover:underline">
                        {event.organizer.website}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'program' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Event Program</h2>
              <div className="space-y-4">
                {program.map((session) => (
                  <div key={session.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-red-600 font-semibold">{session.time}</span>
                          <span className={`px-2 py-1 text-xs font-medium rounded ${getSessionTypeColor(session.type)}`}>
                            {session.type.charAt(0).toUpperCase() + session.type.slice(1)}
                          </span>
                          <span className="text-gray-500 text-sm">{session.duration}</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{session.title}</h3>
                        <p className="text-gray-600">{session.speaker}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'speakers' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Speakers</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {speakers.map((speaker) => (
                  <div key={speaker.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <img
                      src={speaker.imageUrl}
                      alt={speaker.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{speaker.name}</h3>
                      <p className="text-red-600 font-medium mb-2">{speaker.title}</p>
                      <p className="text-gray-600 mb-4">{speaker.organization}</p>
                      <p className="text-gray-700 text-sm leading-relaxed mb-4">{speaker.bio}</p>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Expertise:</h4>
                        <div className="flex flex-wrap gap-1">
                          {speaker.expertise.map((skill, index) => (
                            <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 text-xs rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'logistics' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Event Logistics</h2>
              </div>

              {/* Technical Requirements */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Technical Requirements</h3>
                <div className="bg-blue-50 p-6 rounded-lg">
                  <ul className="space-y-2">
                    {event.technicalRequirements.map((requirement, index) => (
                      <li key={index} className="flex items-start">
                        <AlertCircle className="w-5 h-5 mr-3 mt-0.5 text-blue-600 flex-shrink-0" />
                        <span className="text-gray-700">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Registration Form */}
              <div className="max-w-2xl">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Register for This Event</h3>
                
                {registrationStatus && (
                  <div className={`mb-4 p-4 rounded-md ${
                    registrationStatus.type === 'success' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {registrationStatus.message}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="First Name"
                      value={registrationData.firstName}
                      onChange={(e) => setRegistrationData(prev => ({...prev, firstName: e.target.value}))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={registrationData.lastName}
                      onChange={(e) => setRegistrationData(prev => ({...prev, lastName: e.target.value}))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    />
                  </div>
                  
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={registrationData.email}
                    onChange={(e) => setRegistrationData(prev => ({...prev, email: e.target.value}))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Organization"
                      value={registrationData.organization}
                      onChange={(e) => setRegistrationData(prev => ({...prev, organization: e.target.value}))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Profession/Title"
                      value={registrationData.profession}
                      onChange={(e) => setRegistrationData(prev => ({...prev, profession: e.target.value}))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    />
                  </div>
                  
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={registrationData.phone}
                    onChange={(e) => setRegistrationData(prev => ({...prev, phone: e.target.value}))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  />

                  <button
                    onClick={handleRegistration}
                    disabled={isRegistering}
                    className={`w-full bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors ${
                      isRegistering ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {isRegistering ? 'Registering...' : 'Register Now'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default EventDetailsPage;