import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Loader, Mail, MapPin } from 'lucide-react';
import ScrollToTop from '../../components/common/ScrollToTop';
import api from '../../services/api';
import { conferencesApi, Conference } from '../../services/conferenceApi';
import { webinarsApi, Webinar } from '../../services/webinarsApi';
import { workshopsApi, Workshop } from '../../services/workshopAPI';
import LoadingSpinner from '../../components/common/LoadingSpinner';

interface SubscriptionStatus {
  type: 'success' | 'error';
  message: string;
}

interface CombinedEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  type: 'upcoming' | 'past';
  category: 'CONFERENCE' | 'WEBINAR' | 'WORKSHOP';
  description: string;
  imageUrl: string;
  isOnline?: boolean;
  eventType: 'conference' | 'webinar' | 'workshop';
}

const EventsPage = () => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [events, setEvents] = useState<CombinedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Newsletter subscription states
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);

  useEffect(() => {
    fetchAllEvents();
  }, []);

  const fetchAllEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const [conferences, webinars, workshops] = await Promise.allSettled([
        conferencesApi.getAll(),
        webinarsApi.getAll(),
        workshopsApi.getAll()
      ]);

      const combinedEvents: CombinedEvent[] = [];

      // Process conferences
      if (conferences.status === 'fulfilled') {
        conferences.value.forEach((conference: Conference) => {
          const isUpcoming = ['planning', 'registration_open', 'coming_soon'].includes(conference.status || '');
          const isOnline = conference.type === 'virtual';
          
          combinedEvents.push({
            id: conference.id!,
            title: conference.title,
            date: new Date(conference.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            time: conference.time || 'TBA',
            location: isOnline ? 'Virtual' : conference.location,
            type: isUpcoming ? 'upcoming' : 'past',
            category: 'CONFERENCE',
            description: conference.description,
            imageUrl: conference.display_image_url || conference.image_url || 'https://images.pexels.com/photos/1181438/pexels-photo-1181438.jpeg?auto=compress&cs=tinysrgb&w=600',
            isOnline,
            eventType: 'conference'
          });
        });
      }

      // Process webinars
      if (webinars.status === 'fulfilled') {
        webinars.value.forEach((webinar: Webinar) => {
          const isUpcoming = ['Planning', 'Registration Open'].includes(webinar.status);
          
          combinedEvents.push({
            id: webinar.id,
            title: webinar.title,
            date: new Date(webinar.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            time: webinar.time,
            location: 'Online',
            type: isUpcoming ? 'upcoming' : 'past',
            category: 'WEBINAR',
            description: webinar.description,
            imageUrl: webinar.imageUrl || 'https://images.pexels.com/photos/3952048/pexels-photo-3952048.jpeg?auto=compress&cs=tinysrgb&w=600',
            isOnline: true,
            eventType: 'webinar'
          });
        });
      }

      // Process workshops
      if (workshops.status === 'fulfilled') {
        workshops.value.forEach((workshop: Workshop) => {
          const isUpcoming = ['Planning', 'Registration Open'].includes(workshop.status);
          const isOnline = workshop.type === 'Online';
          
          combinedEvents.push({
            id: workshop.id,
            title: workshop.title,
            date: new Date(workshop.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            time: workshop.time,
            location: isOnline ? 'Online' : workshop.location,
            type: isUpcoming ? 'upcoming' : 'past',
            category: 'WORKSHOP',
            description: workshop.description,
            imageUrl: workshop.imageUrl || 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=600',
            isOnline,
            eventType: 'workshop'
          });
        });
      }

      // Sort events by date (most recent first)
      combinedEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setEvents(combinedEvents);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleReadMore = (event: CombinedEvent) => {
    switch (event.eventType) {
      case 'conference':
        navigate(`/conferences/${event.id}`);
        break;
      case 'webinar':
        navigate(`/webinars/${event.id}`);
        break;
      case 'workshop':
        navigate(`/workshops/${event.id}`);
        break;
    }
  };

  const filteredEvents = events.filter(event => {
    if (selectedFilter === 'all') return true;
    return event.type === selectedFilter;
  });

  const upcomingCount = events.filter(e => e.type === 'upcoming').length;
  const pastCount = events.filter(e => e.type === 'past').length;

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubscriptionStatus(null);

    try {
      const response = await api.post('/newsletter/subscribe/', {
        email,
        first_name: firstName,
        last_name: lastName,
        source: 'events'
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

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <ScrollToTop />
        <section className="py-12 md:py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 mb-4 md:mb-6">
              Events
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-700 font-light max-w-3xl mx-auto">
              Join us in advancing child neurology care across Africa through conferences, training programs, and community outreach initiatives.
            </p>
          </div>
        </section>
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            < LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white min-h-screen">
        <ScrollToTop />
        <section className="py-12 md:py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 mb-4 md:mb-6">
              Events
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-700 font-light max-w-3xl mx-auto">
              Join us in advancing child neurology care across Africa through conferences, training programs, and community outreach initiatives.
            </p>
          </div>
        </section>
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-md p-6 max-w-md mx-auto">
              <p className="text-red-800 mb-4">{error}</p>
              <button
                onClick={fetchAllEvents}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <ScrollToTop />
      {/* Hero Section */}
      <section className="py-12 md:py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 mb-4 md:mb-6">
            Events
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-700 font-light max-w-3xl mx-auto">
            Join us in advancing child neurology care across Africa through conferences, training programs, and community outreach initiatives.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Mobile Filters */}
            <div className="lg:hidden bg-white border border-gray-200 rounded p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {filteredEvents.length} results
                </h3>
                <button 
                  onClick={() => setSelectedFilter('all')}
                  className="text-red-600 text-sm font-medium hover:underline"
                >
                  Clear all
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">Filter by Date</h5>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setSelectedFilter('all')}
                      className={`py-2 px-3 rounded-md text-sm ${selectedFilter === 'all' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setSelectedFilter('upcoming')}
                      className={`py-2 px-3 rounded-md text-sm ${selectedFilter === 'upcoming' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                    >
                      Upcoming ({upcomingCount})
                    </button>
                    <button
                      onClick={() => setSelectedFilter('past')}
                      className={`py-2 px-3 rounded-md text-sm ${selectedFilter === 'past' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                    >
                      Past ({pastCount})
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Sidebar Filters */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <div className="bg-white border border-gray-200 rounded p-4 md:p-6 sticky top-6">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    {filteredEvents.length} results
                  </h3>
                  <button 
                    onClick={() => setSelectedFilter('all')}
                    className="text-red-600 text-sm font-medium hover:underline"
                  >
                    Clear all
                  </button>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-4">Filters</h4>
                  
                  <div className="mb-6">
                    <h5 className="font-medium text-gray-700 mb-3">Date</h5>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="dateFilter"
                          checked={selectedFilter === 'upcoming'}
                          onChange={() => setSelectedFilter('upcoming')}
                          className="mr-2 text-red-600"
                        />
                        <span className="text-sm text-gray-700">Upcoming ({upcomingCount})</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="dateFilter"
                          checked={selectedFilter === 'past'}
                          onChange={() => setSelectedFilter('past')}
                          className="mr-2 text-red-600"
                        />
                        <span className="text-sm text-gray-700">Past ({pastCount})</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Events List */}
            <div className="flex-1">
              <div className="space-y-4 md:space-y-6">
                {filteredEvents.map((event) => (
                  <div key={`${event.eventType}-${event.id}`} className="bg-white border border-gray-200 rounded overflow-hidden hover:shadow-lg transition-shadow duration-200">
                    <div className="flex flex-col sm:flex-row">
                      {/* Event Image */}
                      <div className="relative w-full sm:w-48 lg:w-64 h-48 flex-shrink-0">
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=600';
                          }}
                        />
                        <div className="absolute top-3 left-3">
                          <span className="bg-red-600 text-white px-2 py-1 text-xs font-bold uppercase tracking-wide rounded">
                            {event.type} EVENT
                          </span>
                        </div>
                      </div>

                      {/* Event Details */}
                      <div className="flex-1 p-4 sm:p-6">
                        <div className="mb-2">
                          <span className="text-red-600 font-medium text-xs sm:text-sm uppercase tracking-wide">
                            {event.category}
                          </span>
                        </div>
                        
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 leading-tight hover:text-red-600 transition-colors cursor-pointer">
                          {event.title}
                        </h3>

                        <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
                          <div className="flex items-center text-gray-600 text-xs sm:text-sm">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-red-600" />
                            {event.date}, {event.time}
                          </div>
                          <div className="flex items-center text-gray-600 text-xs sm:text-sm">
                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-red-600" />
                            {event.isOnline && (
                              <span className="inline-flex items-center mr-1 sm:mr-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                              </span>
                            )}
                            {event.location}
                          </div>
                        </div>

                        <p className="text-gray-700 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 line-clamp-2">
                          {event.description}
                        </p>

                        <button 
                          onClick={() => handleReadMore(event)}
                          className="text-red-600 text-xs sm:text-sm font-medium hover:text-red-700 hover:underline"
                        >
                          Read more»
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* No Events Found */}
              {filteredEvents.length === 0 && (
                <div className="bg-white border border-gray-200 rounded p-8 text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                  <p className="text-gray-600 mb-4">Try adjusting your filters to find what you're looking for.</p>
                  <button
                    onClick={() => setSelectedFilter('all')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-12 sm:py-16 bg-orange-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center text-white">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
            STAY UPDATED ON UPCOMING EVENTS
          </h2>
          <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto">
            Subscribe to receive notifications about upcoming conferences, workshops, and training programs focused on advancing child neurology care across Africa.
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
                  className="w-full px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
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
            
            <p className="text-sm text-orange-100 opacity-90">
              This site is protected by reCAPTCHA and the Google{' '}
              <a href="https://policies.google.com/privacy" className="underline hover:text-white">Privacy Policy</a>, and{' '}
              <a href="https://policies.google.com/terms" className="underline hover:text-white">Terms of Service</a> apply. By submitting your email to subscribe, you agree to the ACNA's{' '}
              <a href="/privacy-policy" className="underline hover:text-white">Privacy & Cookies Notice</a>.
            </p>
          </form>
        </div>
      </section>
    </div>
  );
};

export default EventsPage;