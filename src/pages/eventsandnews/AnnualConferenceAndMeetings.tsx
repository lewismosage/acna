import { useState } from 'react';
import { Calendar, MapPin, Users, Clock, Globe, Download, ExternalLink, CheckCircle, Star, Mic, UserCheck } from 'lucide-react';
import ScrollToTop from '../../components/common/ScrollToTop';

type ConferenceStatus = 'Registration Open' | 'Coming Soon' | 'Completed';
type SessionType = 'keynote' | 'workshop' | 'panel' | 'break' | 'social' | 'registration' | 'session';

const ConferencePage = () => {
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'schedule' | 'speakers' | 'past'>('upcoming');

  const upcomingConferences = [
    {
      id: 1,
      title: "ACNA Annual Conference 2026: Innovations in Pediatric Neurology",
      date: "March 15-17, 2026",
      location: "Kigali, Rwanda",
      venue: "Kigali Convention Centre",
      type: "In-person & Virtual",
      status: "Registration Open" as ConferenceStatus,
      theme: "Bridging Technology and Care: The Future of Child Neurology in Africa",
      description: "Join us for three days of cutting-edge research presentations, hands-on workshops, and networking opportunities with leading pediatric neurologists across Africa.",
      imageUrl: "https://images.pexels.com/photos/1181438/pexels-photo-1181438.jpeg?auto=compress&cs=tinysrgb&w=800",
      attendees: "500+",
      speakers: "50+",
      countries: "25+",
      earlyBirdDeadline: "January 15, 2026",
      regularFee: "$450",
      earlyBirdFee: "$350",
      highlights: [
        "Keynote by Dr. Sarah Johnson on AI in Pediatric Diagnostics",
        "Workshop on Advanced EEG Interpretation",
        "Panel Discussion on Healthcare Equity",
        "Networking Reception & Awards Ceremony"
      ]
    },
    {
      id: 2,
      title: "Mid-Year Regional Meeting: East Africa",
      date: "September 12-13, 2025",
      location: "Dar es Salaam, Tanzania",
      venue: "Julius Nyerere International Convention Centre",
      type: "In-person",
      status: "Coming Soon" as ConferenceStatus,
      theme: "Strengthening Regional Collaboration in Child Neurology",
      description: "A focused regional gathering addressing specific challenges and opportunities in East African pediatric neurology practice.",
      imageUrl: "https://images.pexels.com/photos/3184638/pexels-photo-3184638.jpeg?auto=compress&cs=tinysrgb&w=800",
      attendees: "200+",
      speakers: "25+",
      countries: "8+",
      earlyBirdDeadline: "August 1, 2025",
      regularFee: "$250",
      earlyBirdFee: "$200",
      highlights: [
        "Regional Research Presentations",
        "Training Workshop on Seizure Management",
        "Policy Roundtable Discussion",
        "Cultural Exchange Evening"
      ]
    }
  ];

  const pastConferences = [
    {
      id: 3,
      title: "ACNA Annual Conference 2025: Building Stronger Networks",
      date: "July 10-12, 2025",
      location: "Kampala, Uganda",
      venue: "Kampala Serena Hotel",
      type: "Hybrid",
      status: "Completed" as ConferenceStatus,
      attendees: "480",
      speakers: "45",
      countries: "22",
      description: "Our most successful conference to date, focusing on building collaborative networks across African child neurology communities.",
      imageUrl: "https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=800",
      resources: [
        { type: "Proceedings", url: "#", size: "15.2 MB" },
        { type: "Presentation Slides", url: "#", size: "45.8 MB" },
        { type: "Photo Gallery", url: "#", size: "View Online" },
        { type: "Video Recordings", url: "#", size: "View Online" }
      ]
    },
    {
      id: 4,
      title: "ACNA Annual Conference 2024: Advancing Care Through Research",
      date: "March 18-20, 2024",
      location: "Lagos, Nigeria",
      venue: "Eko Hotels & Suites",
      type: "Hybrid",
      status: "Completed" as ConferenceStatus,
      attendees: "420",
      speakers: "38",
      countries: "19",
      description: "Groundbreaking research presentations and collaborative initiatives that shaped our 2024-2025 strategic direction.",
      imageUrl: "https://images.pexels.com/photos/3184192/pexels-photo-3184192.jpeg?auto=compress&cs=tinysrgb&w=800",
      resources: [
        { type: "Conference Report", url: "#", size: "8.5 MB" },
        { type: "Research Abstracts", url: "#", size: "12.3 MB" },
        { type: "Workshop Materials", url: "#", size: "22.1 MB" }
      ]
    }
  ];

  const conferenceSchedule = [
    {
      day: "Day 1 - March 15, 2026",
      sessions: [
        {
          time: "8:00 AM - 9:00 AM",
          title: "Registration & Welcome Coffee",
          type: "registration" as SessionType,
          location: "Main Foyer"
        },
        {
          time: "9:00 AM - 10:30 AM",
          title: "Opening Ceremony & Keynote Address",
          speaker: "Dr. Sarah Johnson",
          topic: "AI and Machine Learning in Pediatric Neurology",
          type: "keynote" as SessionType,
          location: "Main Auditorium"
        },
        {
          time: "10:30 AM - 11:00 AM",
          title: "Coffee Break & Networking",
          type: "break" as SessionType,
          location: "Exhibition Hall"
        },
        {
          time: "11:00 AM - 12:30 PM",
          title: "Research Presentations: Epilepsy Management",
          type: "session" as SessionType,
          location: "Conference Room A",
          speakers: ["Dr. Michael Okafor", "Dr. Fatima Al-Zahra", "Dr. Joseph Mwangi"]
        },
        {
          time: "12:30 PM - 1:30 PM",
          title: "Lunch & Poster Session",
          type: "break" as SessionType,
          location: "Exhibition Hall"
        },
        {
          time: "1:30 PM - 3:00 PM",
          title: "Workshop: Advanced EEG Interpretation",
          type: "workshop" as SessionType,
          location: "Training Room 1",
          capacity: "50 participants"
        },
        {
          time: "3:00 PM - 3:30 PM",
          title: "Afternoon Tea",
          type: "break" as SessionType,
          location: "Networking Lounge"
        },
        {
          time: "3:30 PM - 5:00 PM",
          title: "Panel: Healthcare Equity in Child Neurology",
          type: "panel" as SessionType,
          location: "Main Auditorium",
          moderator: "Dr. Grace Mthembu"
        },
        {
          time: "7:00 PM - 10:00 PM",
          title: "Welcome Reception",
          type: "social" as SessionType,
          location: "Rooftop Terrace"
        }
      ]
    }
  ];

  const speakers = [
    {
      name: "Dr. Sarah Johnson",
      title: "Director of Pediatric AI Research",
      institution: "Johns Hopkins Hospital",
      country: "USA",
      expertise: "Artificial Intelligence in Pediatric Diagnostics",
      imageUrl: "https://images.pexels.com/photos/5214907/pexels-photo-5214907.jpeg?auto=compress&cs=tinysrgb&w=300",
      keynote: true
    },
    {
      name: "Prof. Michael Okafor",
      title: "Head of Pediatric Neurology",
      institution: "University College Hospital Ibadan",
      country: "Nigeria",
      expertise: "Epilepsy Management in Resource-Limited Settings",
      imageUrl: "https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=300"
    },
    {
      name: "Dr. Amina Hassan",
      title: "Chief of Child Neurology",
      institution: "Cairo Children's Hospital",
      country: "Egypt",
      expertise: "Neurodevelopmental Disorders",
      imageUrl: "https://images.pexels.com/photos/3952048/pexels-photo-3952048.jpeg?auto=compress&cs=tinysrgb&w=300"
    },
    {
      name: "Dr. Joseph Mwangi",
      title: "Pediatric Neurologist",
      institution: "Kenyatta National Hospital",
      country: "Kenya",
      expertise: "Cerebral Palsy and Movement Disorders",
      imageUrl: "https://images.pexels.com/photos/4260323/pexels-photo-4260323.jpeg?auto=compress&cs=tinysrgb&w=300"
    }
  ];

  const getStatusColor = (status: ConferenceStatus) => {
    switch (status) {
      case 'Registration Open':
        return 'bg-green-500';
      case 'Coming Soon':
        return 'bg-yellow-500';
      case 'Completed':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getSessionIcon = (type: SessionType) => {
    switch (type) {
      case 'keynote':
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

  return (
    <div className="bg-white min-h-screen">
      <ScrollToTop />
      {/* Hero Section */}
      <section className="py-8 md:py-12 lg:py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-gray-900 mb-4 md:mb-6">
            Annual Conference & Meetings
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-700 font-light max-w-3xl mx-auto">
            Join leading pediatric neurologists, researchers, and healthcare professionals from across Africa for groundbreaking conferences and collaborative meetings.
          </p>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-6 md:py-8 bg-orange-600">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 text-center text-white">
            <div className="p-2">
              <div className="text-xl md:text-2xl lg:text-3xl font-bold mb-1">2026</div>
              <div className="text-xs md:text-sm opacity-90">Next Conference</div>
            </div>
            <div className="p-2">
              <div className="text-xl md:text-2xl lg:text-3xl font-bold mb-1">500+</div>
              <div className="text-xs md:text-sm opacity-90">Expected Attendees</div>
            </div>
            <div className="p-2">
              <div className="text-xl md:text-2xl lg:text-3xl font-bold mb-1">50+</div>
              <div className="text-xs md:text-sm opacity-90">Expert Speakers</div>
            </div>
            <div className="p-2">
              <div className="text-xl md:text-2xl lg:text-3xl font-bold mb-1">25+</div>
              <div className="text-xs md:text-sm opacity-90">Countries</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Tabs */}
      <section className="py-8 md:py-12 lg:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Tab Navigation */}
          <div className="flex flex-wrap justify-center mb-8 md:mb-12 border-b border-gray-200">
            {[
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'schedule', label: 'Schedule' },
              { id: 'speakers', label: 'Speakers' },
              { id: 'past', label: 'Past' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`px-3 py-2 md:px-6 md:py-3 font-medium text-xs md:text-sm lg:text-base transition-colors border-b-2 ${
                  selectedTab === tab.id
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Upcoming Conferences Tab */}
          {selectedTab === 'upcoming' && (
            <div className="space-y-6 md:space-y-8">
              {upcomingConferences.map((conference) => (
                <div key={conference.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-lg">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/3">
                      <img
                        src={conference.imageUrl}
                        alt={conference.title}
                        className="w-full h-48 md:h-full object-cover"
                      />
                    </div>
                    <div className="md:w-2/3 p-4 md:p-6 lg:p-8">
                      <div className="flex flex-col md:flex-row md:items-start justify-between mb-4 gap-4">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span className={`${getStatusColor(conference.status)} text-white px-2 py-1 text-xs font-bold uppercase tracking-wide rounded`}>
                              {conference.status}
                            </span>
                          </div>
                          <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-2">
                            {conference.title}
                          </h2>
                          <p className="text-md text-red-600 font-medium mb-4">
                            {conference.theme}
                          </p>
                        </div>
                        {conference.status === 'Registration Open' && (
                          <button className="bg-orange-600 text-white px-4 py-2 text-sm md:text-base font-bold hover:bg-orange-700 transition-colors uppercase tracking-wide rounded">
                            Register Now
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
                        <div className="space-y-2 md:space-y-3">
                          <div className="flex items-center text-gray-700">
                            <Calendar className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 text-red-600" />
                            <span className="font-medium text-sm md:text-base">{conference.date}</span>
                          </div>
                          <div className="flex items-center text-gray-700">
                            <MapPin className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 text-red-600" />
                            <div>
                              <div className="font-medium text-sm md:text-base">{conference.location}</div>
                              <div className="text-xs text-gray-600">{conference.venue}</div>
                            </div>
                          </div>
                          <div className="flex items-center text-gray-700">
                            <Globe className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 text-red-600" />
                            <span className="font-medium text-sm md:text-base">{conference.type}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 md:gap-4 text-center">
                          <div className="bg-gray-50 p-2 rounded">
                            <div className="text-lg font-bold text-red-600">{conference.attendees}</div>
                            <div className="text-xs text-gray-600">Attendees</div>
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <div className="text-lg font-bold text-red-600">{conference.speakers}</div>
                            <div className="text-xs text-gray-600">Speakers</div>
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <div className="text-lg font-bold text-red-600">{conference.countries}</div>
                            <div className="text-xs text-gray-600">Countries</div>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-700 text-sm md:text-base mb-4 md:mb-6 leading-relaxed">
                        {conference.description}
                      </p>

                      <div className="mb-4 md:mb-6">
                        <h4 className="font-bold text-gray-900 mb-2 md:mb-3 text-sm md:text-base">Conference Highlights:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 md:gap-2">
                          {conference.highlights.map((highlight, index) => (
                            <div key={index} className="flex items-start">
                              <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-xs md:text-sm text-gray-700">{highlight}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {conference.status === 'Registration Open' && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div>
                              <h4 className="font-bold text-gray-900 mb-1 text-sm md:text-base">Registration Fees:</h4>
                              <div className="text-xs md:text-sm text-gray-700">
                                <span className="font-semibold">Early Bird ({conference.earlyBirdDeadline}):</span> {conference.earlyBirdFee} |{' '}
                                <span className="font-semibold">Regular:</span> {conference.regularFee}
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <button className="border border-red-600 text-red-600 px-3 py-1 md:px-4 md:py-2 text-xs md:text-sm font-medium hover:bg-red-600 hover:text-white transition-colors rounded">
                                Download Brochure
                              </button>
                              <button className="bg-red-600 text-white px-3 py-1 md:px-4 md:py-2 text-xs md:text-sm font-medium hover:bg-red-700 transition-colors rounded">
                                Register Now
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Conference Schedule Tab */}
          {selectedTab === 'schedule' && (
            <div>
              <div className="text-center mb-6 md:mb-8">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 md:mb-4">
                  ACNA Annual Conference 2026 - Detailed Schedule
                </h2>
                <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
                  A comprehensive three-day program featuring keynotes, workshops, panels, and networking opportunities.
                </p>
              </div>

              {conferenceSchedule.map((day, dayIndex) => (
                <div key={dayIndex} className="mb-8 md:mb-12">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6 pb-2 border-b-2 border-red-600">
                    {day.day}
                  </h3>
                  
                  <div className="space-y-3 md:space-y-4">
                    {day.sessions.map((session, sessionIndex) => (
                      <div 
                        key={sessionIndex} 
                        className="border border-gray-200 rounded-lg p-3 md:p-4 lg:p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col md:flex-row md:items-start gap-3 md:gap-4">
                          <div className="flex items-center md:w-40 lg:w-48 flex-shrink-0">
                            <div className="bg-red-600 text-white p-1 md:p-2 rounded mr-2 md:mr-3">
                              {getSessionIcon(session.type)}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 text-sm md:text-base">{session.time}</div>
                              <div className="text-xs text-gray-600">{session.location}</div>
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <h4 className="text-base md:text-lg font-bold text-gray-900 mb-1 md:mb-2">
                              {session.title}
                            </h4>
                            
                            {session.speaker && (
                              <div className="text-red-600 font-medium text-sm mb-1">
                                Keynote Speaker: {session.speaker}
                              </div>
                            )}
                            
                            {session.topic && (
                              <div className="text-gray-700 text-sm mb-1 md:mb-2">{session.topic}</div>
                            )}
                            
                            {session.speakers && (
                              <div className="text-gray-700 text-sm mb-1 md:mb-2">
                                <span className="font-medium">Speakers:</span> {session.speakers.join(', ')}
                              </div>
                            )}
                            
                            {session.moderator && (
                              <div className="text-gray-700 text-sm mb-1 md:mb-2">
                                <span className="font-medium">Moderator:</span> {session.moderator}
                              </div>
                            )}
                            
                            {session.capacity && (
                              <div className="text-xs md:text-sm text-blue-600 font-medium">
                                Limited to {session.capacity}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Featured Speakers Tab */}
          {selectedTab === 'speakers' && (
            <div>
              <div className="text-center mb-8 md:mb-12">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 md:mb-4">
                  Featured Speakers
                </h2>
                <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
                  Meet the distinguished experts and thought leaders who will be sharing their knowledge and insights at our conference.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
                {speakers.map((speaker, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                    <div className="relative">
                      <img
                        src={speaker.imageUrl}
                        alt={speaker.name}
                        className="w-full h-40 md:h-48 object-cover"
                      />
                      {speaker.keynote && (
                        <div className="absolute top-2 left-2">
                          <span className="bg-red-600 text-white px-2 py-1 text-xs font-bold uppercase tracking-wide rounded">
                            Keynote
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4 md:p-6">
                      <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1">
                        {speaker.name}
                      </h3>
                      <p className="text-red-600 font-medium text-xs md:text-sm mb-1">
                        {speaker.title}
                      </p>
                      <p className="text-gray-600 text-xs mb-2">
                        {speaker.institution}
                      </p>
                      <p className="text-gray-500 text-xs mb-2 md:mb-3">
                        {speaker.country}
                      </p>
                      <div className="bg-gray-50 p-2 md:p-3 rounded">
                        <p className="text-xs text-gray-700">
                          <span className="font-medium">Expertise:</span> {speaker.expertise}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Past Conferences Tab */}
          {selectedTab === 'past' && (
            <div>
              <div className="text-center mb-8 md:mb-12">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 md:mb-4">
                  Past Conferences
                </h2>
                <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
                  Explore highlights and resources from our previous conferences and meetings.
                </p>
              </div>

              <div className="space-y-6 md:space-y-8">
                {pastConferences.map((conference) => (
                  <div key={conference.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-lg">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/3">
                        <img
                          src={conference.imageUrl}
                          alt={conference.title}
                          className="w-full h-48 md:h-full object-cover"
                        />
                      </div>
                      <div className="md:w-2/3 p-4 md:p-6 lg:p-8">
                        <div className="flex flex-col md:flex-row md:items-start justify-between mb-4 gap-4">
                          <div>
                            <span className={`${getStatusColor(conference.status)} text-white px-2 py-1 text-xs font-bold uppercase tracking-wide rounded mb-2 inline-block`}>
                              {conference.status}
                            </span>
                            <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-2">
                              {conference.title}
                            </h3>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
                          <div className="space-y-2 md:space-y-3">
                            <div className="flex items-center text-gray-700">
                              <Calendar className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 text-red-600" />
                              <span className="text-sm md:text-base">{conference.date}</span>
                            </div>
                            <div className="flex items-center text-gray-700">
                              <MapPin className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 text-red-600" />
                              <div>
                                <div className="text-sm md:text-base">{conference.location}</div>
                                <div className="text-xs text-gray-600">{conference.venue}</div>
                              </div>
                            </div>
                            <div className="flex items-center text-gray-700">
                              <Globe className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 text-red-600" />
                              <span className="text-sm md:text-base">{conference.type}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 md:gap-4 text-center">
                            <div className="bg-gray-50 p-2 rounded">
                              <div className="text-lg font-bold text-red-600">{conference.attendees}</div>
                              <div className="text-xs text-gray-600">Attendees</div>
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                              <div className="text-lg font-bold text-red-600">{conference.speakers}</div>
                              <div className="text-xs text-gray-600">Speakers</div>
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                              <div className="text-lg font-bold text-red-600">{conference.countries}</div>
                              <div className="text-xs text-gray-600">Countries</div>
                            </div>
                          </div>
                        </div>

                        <p className="text-gray-700 text-sm md:text-base mb-4 md:mb-6">
                          {conference.description}
                        </p>

                        {conference.resources && (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 md:p-4">
                            <h4 className="font-bold text-gray-900 mb-2 md:mb-3 text-sm md:text-base">Conference Resources:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                              {conference.resources.map((resource, index) => (
                                <a
                                  key={index}
                                  href={resource.url}
                                  className="flex items-center justify-between p-2 md:p-3 bg-white border border-gray-200 rounded hover:shadow-md transition-shadow"
                                >
                                  <div className="flex items-center">
                                    <Download className="w-3 h-3 md:w-4 md:h-4 text-red-600 mr-2" />
                                    <span className="font-medium text-gray-900 text-xs md:text-sm">{resource.type}</span>
                                  </div>
                                  <div className="flex items-center text-xs md:text-sm text-gray-600">
                                    <span className="mr-1 md:mr-2">{resource.size}</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-8 md:mt-12">
                <button className="border-2 border-orange-600 text-orange-600 px-4 py-2 md:px-6 md:py-3 font-medium hover:bg-orange-600 hover:text-white transition-all duration-300 uppercase tracking-wide rounded text-xs md:text-sm">
                  View Full Past Conferences
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ConferencePage;