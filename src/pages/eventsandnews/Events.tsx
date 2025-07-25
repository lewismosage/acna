import React, { useState } from 'react';
import { Calendar, MapPin, Users } from 'lucide-react';
import ScrollToTop from '../../components/common/ScrollToTop';

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  type: 'upcoming' | 'past';
  category: string;
  description: string;
  imageUrl: string;
  isOnline?: boolean;
}

const EventsPage = () => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  const events: Event[] = [
    {
      id: 1,
      title: "ACNA Live from Nairobi: Advancing Pediatric Neurology Care Across East Africa",
      date: "August 15, 2025",
      time: "2:00PM-4:00PM EAT",
      location: "Live online",
      type: "upcoming",
      category: "CONFERENCE",
      description: "Join us for an interactive session discussing the latest advances in pediatric neurology care and treatment protocols across East African healthcare systems.",
      imageUrl: "https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=600",
      isOnline: true
    },
    {
      id: 2,
      title: "Epilepsy Awareness Workshop in Community Settings",
      date: "August 22, 2025",
      time: "9:00AM-5:00PM CAT",
      location: "In-person in Cape Town, SA",
      type: "upcoming",
      category: "WORKSHOP",
      description: "A comprehensive workshop focused on epilepsy awareness, community education, and reducing stigma around neurological conditions in African communities.",
      imageUrl: "https://images.pexels.com/photos/3184638/pexels-photo-3184638.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
      id: 3,
      title: "Child Neurology Training Program for Healthcare Workers",
      date: "September 5, 2025",
      time: "10:00AM-3:00PM WAT",
      location: "In-person in Lagos, Nigeria",
      type: "upcoming",
      category: "TRAINING",
      description: "Intensive training program designed to equip primary healthcare workers with essential skills in identifying and managing pediatric neurological conditions.",
      imageUrl: "https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
      id: 4,
      title: "ACNA Annual Conference: Building Stronger Neurological Care Networks",
      date: "July 10, 2025",
      time: "8:00AM-6:00PM EAT",
      location: "In-person in Kampala, Uganda",
      type: "past",
      category: "CONFERENCE",
      description: "Our flagship annual conference brought together neurologists, healthcare professionals, and advocates from across Africa to discuss collaborative care approaches.",
      imageUrl: "https://images.pexels.com/photos/1181438/pexels-photo-1181438.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
      id: 5,
      title: "Cerebral Palsy Support Groups: Strengthening Family Networks",
      date: "June 28, 2025",
      time: "2:00PM-5:00PM CAT",
      location: "In-person in Johannesburg, SA",
      type: "past",
      category: "SUPPORT GROUP",
      description: "A gathering of families, caregivers, and professionals focused on building support networks and sharing resources for children with cerebral palsy.",
      imageUrl: "https://images.pexels.com/photos/4260323/pexels-photo-4260323.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
      id: 6,
      title: "Telemedicine in Child Neurology: Expanding Access to Care",
      date: "June 15, 2025",
      time: "11:00AM-1:00PM GMT",
      location: "Live online",
      type: "past",
      category: "WEBINAR",
      description: "An exploration of telemedicine technologies and their role in expanding access to specialized neurological care for children in remote areas.",
      imageUrl: "https://images.pexels.com/photos/3952048/pexels-photo-3952048.jpeg?auto=compress&cs=tinysrgb&w=600",
      isOnline: true
    }
  ];

  const filteredEvents = events.filter(event => {
    if (selectedFilter === 'all') return true;
    return event.type === selectedFilter;
  });

  const upcomingCount = events.filter(e => e.type === 'upcoming').length;
  const pastCount = events.filter(e => e.type === 'past').length;

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
                  <div key={event.id} className="bg-white border border-gray-200 rounded overflow-hidden hover:shadow-lg transition-shadow duration-200">
                    <div className="flex flex-col sm:flex-row">
                      {/* Event Image */}
                      <div className="relative w-full sm:w-48 lg:w-64 h-48 flex-shrink-0">
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="w-full h-full object-cover"
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

                        <button className="text-red-600 text-xs sm:text-sm font-medium hover:text-red-700 hover:underline">
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

              {/* Load More Button */}
              {filteredEvents.length > 0 && (
                <div className="text-center mt-8 sm:mt-12">
                  <button className="border-2 border-red-600 text-red-600 px-6 py-2 sm:px-8 sm:py-3 font-medium hover:bg-red-600 hover:text-white transition-all duration-300 uppercase tracking-wide rounded text-sm sm:text-base">
                    Load More Events
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
          
          <div className="max-w-md mx-auto">
            <div className="relative mb-3 sm:mb-4">
              <input
                type="email"
                placeholder="Email address"
                className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button className="absolute right-2 top-2 bg-orange-600 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-md hover:bg-orange-700 transition-colors flex items-center text-sm sm:text-base">
                <Users className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Subscribe
              </button>
            </div>
            
            <p className="text-xs sm:text-sm text-orange-100 opacity-90">
              By subscribing, you agree to receive event notifications and updates from ACNA. You can unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EventsPage;