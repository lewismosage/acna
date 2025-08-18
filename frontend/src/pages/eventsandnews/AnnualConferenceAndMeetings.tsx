import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Clock, Globe, Download, ExternalLink, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ScrollToTop from '../../components/common/ScrollToTop';
import { conferencesApi, Conference as ApiConference } from '../../services/conferenceApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

type ConferenceStatus = 'Registration Open' | 'Coming Soon' | 'Completed';

interface Conference {
  id: number;
  title: string;
  date: string;
  location: string;
  venue: string;
  type: string;
  status: ConferenceStatus;
  theme: string;
  description: string;
  imageUrl: string;
  attendees: string;
  speakers: string;
  countries: string;
  earlyBirdDeadline: string;
  regularFee: string;
  earlyBirdFee: string;
  highlights: string[];
  resources?: {
    type: string;
    url: string;
    size: string;
  }[];
}

const ConferencePage = () => {
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'past'>('upcoming');
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConferences = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await conferencesApi.getAll();
        // Transform API data to match our frontend interface
        const transformedData = data.map((conf: ApiConference) => ({
          id: conf.id,
          title: conf.title,
          date: conf.date,
          location: conf.location,
          venue: conf.venue || '',
          type: conf.type,
          status: conf.status as ConferenceStatus,
          theme: conf.theme || '',
          description: conf.description,
          imageUrl: conf.imageUrl || '',
          attendees: conf.attendees || '0',
          speakers: conf.speakers || '0',
          countries: conf.countries || '0',
          earlyBirdDeadline: conf.earlyBirdDeadline || '',
          regularFee: conf.regularFee || '',
          earlyBirdFee: conf.earlyBirdFee || '',
          highlights: conf.highlights || [],
        }));
        setConferences(transformedData);
      } catch (err) {
        setError('Failed to load conferences. Please try again later.');
        console.error('Error fetching conferences:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConferences();
  }, []);

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

  // Filter conferences based on selected tab
  const upcomingConferences = conferences.filter(conf => 
    conf.status === 'Registration Open' || conf.status === 'Coming Soon'
  );
  
  const pastConferences = conferences.filter(conf => 
    conf.status === 'Completed'
  );

  // Calculate quick stats from the data
  const quickStats = {
    nextConference: upcomingConferences.length > 0 ? upcomingConferences[0].date.split('-')[0] : 'N/A',
    expectedAttendees: upcomingConferences.reduce((sum, conf) => {
      const attendees = parseInt(conf.attendees) || 0;
      return sum + attendees;
    }, 0),
    expertSpeakers: upcomingConferences.reduce((sum, conf) => {
      const speakers = parseInt(conf.speakers) || 0;
      return sum + speakers;
    }, 0),
    countries: upcomingConferences.reduce((sum, conf) => {
      const countries = parseInt(conf.countries) || 0;
      return sum + countries;
    }, 0),
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
              <div className="text-xl md:text-2xl lg:text-3xl font-bold mb-1">
                {quickStats.nextConference}
              </div>
              <div className="text-xs md:text-sm opacity-90">Next Conference</div>
            </div>
            <div className="p-2">
              <div className="text-xl md:text-2xl lg:text-3xl font-bold mb-1">
                {quickStats.expectedAttendees}+
              </div>
              <div className="text-xs md:text-sm opacity-90">Expected Attendees</div>
            </div>
            <div className="p-2">
              <div className="text-xl md:text-2xl lg:text-3xl font-bold mb-1">
                {quickStats.expertSpeakers}+
              </div>
              <div className="text-xs md:text-sm opacity-90">Expert Speakers</div>
            </div>
            <div className="p-2">
              <div className="text-xl md:text-2xl lg:text-3xl font-bold mb-1">
                {quickStats.countries}+
              </div>
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
              { id: 'upcoming', label: 'Upcoming Conferences' },
              { id: 'past', label: 'Past Conferences' }
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
              {upcomingConferences.length > 0 ? (
                upcomingConferences.map((conference) => (
                  <div key={conference.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/3">
                        <img
                          src={conference.imageUrl || '/default-conference.jpg'}
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
                            {conference.theme && (
                              <p className="text-md text-red-600 font-medium mb-4">
                                {conference.theme}
                              </p>
                            )}
                          </div>
                          {conference.status === 'Registration Open' && (
                            <a 
                              href={`/conferences/${conference.id}`}
                              className="bg-orange-600 text-white px-4 py-2 text-sm md:text-base font-bold hover:bg-orange-700 transition-colors uppercase tracking-wide rounded text-center"
                            >
                              View Details
                            </a>
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
                                {conference.venue && (
                                  <div className="text-xs text-gray-600">{conference.venue}</div>
                                )}
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

                        {conference.highlights.length > 0 && (
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
                        )}

                        {conference.status === 'Registration Open' && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                              <div>
                                <h4 className="font-bold text-gray-900 mb-1 text-sm md:text-base">Registration Fees:</h4>
                                <div className="text-xs md:text-sm text-gray-700">
                                  {conference.earlyBirdFee && conference.earlyBirdDeadline && (
                                    <>
                                      <span className="font-semibold">Early Bird ({conference.earlyBirdDeadline}):</span> {conference.earlyBirdFee}
                                    </>
                                  )}
                                  {conference.regularFee && (
                                    <>
                                      {conference.earlyBirdFee && ' | '}
                                      <span className="font-semibold">Regular:</span> {conference.regularFee}
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col sm:flex-row gap-2">
                                <button className="border border-red-600 text-red-600 px-3 py-1 md:px-4 md:py-2 text-xs md:text-sm font-medium hover:bg-red-600 hover:text-white transition-colors rounded">
                                  Download Brochure
                                </button>
                                <a 
                                  href={`/conferences/${conference.id}`}
                                  className="bg-red-600 text-white px-3 py-1 md:px-4 md:py-2 text-xs md:text-sm font-medium hover:bg-red-700 transition-colors rounded text-center"
                                >
                                  Register Now
                                </a>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming conferences</h3>
                  <p className="text-gray-500">There are currently no upcoming conferences scheduled.</p>
                </div>
              )}
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

              {pastConferences.length > 0 ? (
                <div className="space-y-6 md:space-y-8">
                  {pastConferences.map((conference) => (
                    <div key={conference.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/3">
                          <img
                            src={conference.imageUrl || '/default-conference.jpg'}
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
                            <a 
                              href={`/conferences/${conference.id}`}
                              className="border border-red-600 text-red-600 px-4 py-2 text-sm md:text-base font-medium hover:bg-red-600 hover:text-white transition-colors rounded text-center"
                            >
                              View Details
                            </a>
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
                                  {conference.venue && (
                                    <div className="text-xs text-gray-600">{conference.venue}</div>
                                  )}
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

                          {conference.resources && conference.resources.length > 0 && (
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
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No past conferences</h3>
                  <p className="text-gray-500">There are currently no past conferences to display.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ConferencePage;