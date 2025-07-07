import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Users, ArrowRight, Filter } from 'lucide-react';

const Events = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');

  const events = [
    {
      id: 1,
      title: "ACNA 2024 Annual Conference",
      date: "March 15-17, 2024",
      location: "Cape Town, South Africa",
      time: "9:00 AM - 5:00 PM",
      category: "conference",
      region: "southern",
      attendees: 500,
      image: "https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=600",
      description: "Join us for three days of cutting-edge research presentations, workshops, and networking opportunities.",
      status: "upcoming"
    },
    {
      id: 2,
      title: "Pediatric Epilepsy Workshop",
      date: "February 28, 2024",
      location: "Lagos, Nigeria",
      time: "10:00 AM - 4:00 PM",
      category: "workshop",
      region: "western",
      attendees: 120,
      image: "https://images.pexels.com/photos/4021775/pexels-photo-4021775.jpeg?auto=compress&cs=tinysrgb&w=600",
      description: "Hands-on workshop focusing on latest developments in pediatric epilepsy management.",
      status: "upcoming"
    },
    {
      id: 3,
      title: "Virtual Research Symposium",
      date: "January 20, 2024",
      location: "Online",
      time: "2:00 PM - 6:00 PM",
      category: "webinar",
      region: "all",
      attendees: 800,
      image: "https://images.pexels.com/photos/3825583/pexels-photo-3825583.jpeg?auto=compress&cs=tinysrgb&w=600",
      description: "Presenting the latest research findings from across Africa in child neurology.",
      status: "completed"
    }
  ];

  const filteredEvents = events.filter(event => {
    const categoryMatch = selectedCategory === 'all' || event.category === selectedCategory;
    const regionMatch = selectedRegion === 'all' || event.region === selectedRegion;
    return categoryMatch && regionMatch;
  });

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-purple-900 to-purple-700 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Events & Conferences
            </h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto">
              Join our community at world-class conferences, workshops, and educational events 
              designed to advance child neurology practice across Africa.
            </p>
          </div>
        </div>
      </section>

      {/* Upcoming Highlights */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Featured Events
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Don't miss these exceptional opportunities for learning, networking, and professional growth
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <img
                src="https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="ACNA 2024 Conference"
                className="rounded-2xl shadow-2xl w-full"
              />
            </div>
            <div>
              <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium mb-4 inline-block">
                Annual Conference
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                ACNA 2024 Annual Conference
              </h3>
              <p className="text-lg text-gray-600 mb-6">
                Our flagship event brings together over 500 professionals from across Africa for 
                three days of groundbreaking research presentations, hands-on workshops, and 
                invaluable networking opportunities.
              </p>
              <div className="space-y-3 mb-8">
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-5 h-5 mr-3" />
                  <span>March 15-17, 2024</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-5 h-5 mr-3" />
                  <span>Cape Town, South Africa</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="w-5 h-5 mr-3" />
                  <span>500+ Expected Attendees</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center">
                  Register Now
                  <ArrowRight className="ml-2 w-4 h-4" />
                </button>
                <button className="border-2 border-yellow-500 text-yellow-600 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 hover:text-white transition-colors">
                  View Program
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Event Filters */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">All Events</h2>
              <p className="text-xl text-gray-600">Discover all upcoming and past events</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-6 md:mt-0">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  <option value="conference">Conferences</option>
                  <option value="workshop">Workshops</option>
                  <option value="webinar">Webinars</option>
                  <option value="training">Training</option>
                </select>
              </div>
              
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Regions</option>
                <option value="northern">Northern Africa</option>
                <option value="western">Western Africa</option>
                <option value="eastern">Eastern Africa</option>
                <option value="southern">Southern Africa</option>
                <option value="central">Central Africa</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      event.category === 'conference' ? 'bg-purple-100 text-purple-800' :
                      event.category === 'workshop' ? 'bg-blue-100 text-blue-800' :
                      event.category === 'webinar' ? 'bg-green-100 text-green-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      event.status === 'upcoming' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {event.status === 'upcoming' ? 'Upcoming' : 'Completed'}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{event.title}</h3>
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">{event.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      <span>{event.attendees} attendees</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {event.status === 'upcoming' ? (
                      <>
                        <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                          Register
                        </button>
                        <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                          Learn More
                        </button>
                      </>
                    ) : (
                      <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                        View Recordings
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Event Types */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Types of Events
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We offer diverse learning and networking opportunities to meet your professional development needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Annual Conferences</h3>
              <p className="text-gray-600">
                Our flagship events featuring the latest research, clinical updates, and networking opportunities.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Workshops</h3>
              <p className="text-gray-600">
                Hands-on training sessions focused on specific techniques, technologies, and clinical skills.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Webinars</h3>
              <p className="text-gray-600">
                Virtual sessions covering emerging topics, research findings, and expert discussions.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Regional Meetings</h3>
              <p className="text-gray-600">
                Local gatherings that address region-specific challenges and opportunities in child neurology.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Don't Miss Our Next Event
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto">
            Stay updated on all upcoming events and be the first to register for our exclusive 
            conferences and workshops.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-purple-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center">
              Subscribe to Updates
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors">
              View Event Calendar
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Events;