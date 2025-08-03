import React, { useState } from "react";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Bookmark,
  ExternalLink,
  UserPlus,
  AlertCircle,
  Link as LinkIcon,
} from "lucide-react";
import { Link } from "react-router-dom";

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: "Workshop" | "Symposium" | "Conference";
  category: string;
  speakers: string[];
  registrationLink: string;
  isVirtual: boolean;
  isFree: boolean;
  audience: string[];
  imageUrl: string;
  isFeatured?: boolean;
  isNew?: boolean;
}

interface CollaborationOpportunity {
  id: number;
  title: string;
  description: string;
  projectLead: string;
  institution: string;
  skillsNeeded: string[];
  commitmentLevel: string;
  duration: string;
  isActive: boolean;
  contactEmail: string;
  createdAt: string;
}

const WorkshopsSymposiums = () => {
  const [activeTab, setActiveTab] = useState<"events" | "collaborations">("events");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [expandedEvent, setExpandedEvent] = useState<number | null>(null);

  const events: Event[] = [
    {
      id: 1,
      title: "3rd Annual East African Pediatric Neurology Symposium",
      description: "Bringing together experts to discuss latest advances in pediatric neurology care and research in East Africa.",
      date: "15-17 November 2025",
      time: "9:00 AM - 5:00 PM EAT",
      location: "Nairobi, Kenya",
      type: "Symposium",
      category: "Clinical Practice",
      speakers: ["Prof. Wanjiru Mwangi", "Dr. Hassan Abdi", "Prof. Kwame Mensah"],
      registrationLink: "https://acna.org/events/east-africa-2025",
      isVirtual: false,
      isFree: false,
      audience: ["Neurologists", "Pediatricians", "Researchers"],
      imageUrl: "https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg",
      isFeatured: true
    },
    {
      id: 2,
      title: "Community Epilepsy Management Workshop",
      description: "Training for community health workers on identification and basic management of childhood epilepsy.",
      date: "5-7 March 2025",
      time: "8:30 AM - 3:00 PM WAT",
      location: "Lagos, Nigeria",
      type: "Workshop",
      category: "Community Health",
      speakers: ["Dr. Amina Bello", "Dr. Chukwuma Okafor"],
      registrationLink: "https://acna.org/events/lagos-2025",
      isVirtual: false,
      isFree: true,
      audience: ["Community Health Workers", "Nurses"],
      imageUrl: "https://images.pexels.com/photos/4260325/pexels-photo-4260325.jpeg"
    },
    {
      id: 3,
      title: "Virtual Symposium on Autism in Africa",
      description: "Exploring culturally appropriate diagnostic and intervention approaches for autism spectrum disorders.",
      date: "22 April 2025",
      time: "1:00 PM - 6:00 PM GMT",
      location: "Online",
      type: "Symposium",
      category: "Neurodevelopment",
      speakers: ["Dr. Ngozi Eze", "Prof. Tendai Moyo", "Dr. Fatoumata Diallo"],
      registrationLink: "https://acna.org/events/autism-2025",
      isVirtual: true,
      isFree: true,
      audience: ["Clinicians", "Educators", "Parents"],
      imageUrl: "https://images.pexels.com/photos/5212359/pexels-photo-5212359.jpeg",
      isNew: true
    },
    {
      id: 4,
      title: "Advanced EEG Interpretation Workshop",
      description: "Hands-on training in pediatric EEG interpretation for neurologists and trainees.",
      date: "10-12 September 2025",
      time: "8:00 AM - 4:00 PM SAST",
      location: "Cape Town, South Africa",
      type: "Workshop",
      category: "Diagnostics",
      speakers: ["Prof. Sarah Johnson", "Dr. Ibrahim Hassan"],
      registrationLink: "https://acna.org/events/eeg-2025",
      isVirtual: false,
      isFree: false,
      audience: ["Neurologists", "Fellows", "Technicians"],
      imageUrl: "https://images.pexels.com/photos/8386365/pexels-photo-8386365.jpeg"
    },
    {
      id: 5,
      title: "Cerebral Palsy: From Diagnosis to Rehabilitation",
      description: "Multidisciplinary approaches to cerebral palsy management in resource-limited settings.",
      date: "30 May 2025",
      time: "10:00 AM - 3:00 PM EAT",
      location: "Kampala, Uganda",
      type: "Workshop",
      category: "Rehabilitation",
      speakers: ["Dr. Nakato Kintu", "Dr. Wanjiku Mwangi"],
      registrationLink: "https://acna.org/events/cp-2025",
      isVirtual: false,
      isFree: true,
      audience: ["Therapists", "Pediatricians", "Caregivers"],
      imageUrl: "https://images.pexels.com/photos/4260323/pexels-photo-4260323.jpeg"
    }
  ];

  const collaborationOpportunities: CollaborationOpportunity[] = [
    {
      id: 1,
      title: "Community-Based Epilepsy Screening Program",
      description: "Seeking partners to implement and evaluate a community epilepsy screening tool in rural Tanzania.",
      projectLead: "Dr. Asha Juma",
      institution: "Tanzania Institute of Neurology",
      skillsNeeded: ["Community Health", "Program Evaluation", "Epilepsy Management"],
      commitmentLevel: "Moderate",
      duration: "12 months",
      isActive: true,
      contactEmail: "a.juma@tin.or.tz",
      createdAt: "2025-05-15"
    },
    {
      id: 2,
      title: "Neurodevelopmental Outcomes After Neonatal Jaundice",
      description: "Multicenter study on long-term neurodevelopmental outcomes following severe neonatal jaundice.",
      projectLead: "Prof. Kwame Mensah",
      institution: "West African Child Health Research Consortium",
      skillsNeeded: ["Developmental Pediatrics", "Data Analysis", "Research Coordination"],
      commitmentLevel: "High",
      duration: "24 months",
      isActive: true,
      contactEmail: "k.mensah@wachrc.org",
      createdAt: "2025-04-22"
    },
    {
      id: 3,
      title: "Cerebral Palsy Registry Development",
      description: "Collaboration to establish a national cerebral palsy registry in Nigeria.",
      projectLead: "Dr. Chukwuma Okafor",
      institution: "Nigerian Pediatric Neurology Association",
      skillsNeeded: ["Database Development", "Public Health", "Clinical Neurology"],
      commitmentLevel: "Variable",
      duration: "18 months",
      isActive: true,
      contactEmail: "c.okafor@npna.org.ng",
      createdAt: "2025-06-10"
    }
  ];

  const eventTypes = ["all", "Workshop", "Symposium", "Conference"];
  const categories = ["all", "Clinical Practice", "Community Health", "Neurodevelopment", "Diagnostics", "Rehabilitation", "Research"];
  const audiences = ["all", "Neurologists", "Pediatricians", "Researchers", "Community Health Workers", "Nurses", "Therapists", "Educators", "Parents", "Caregivers"];

  const filteredEvents = events.filter((event) => {
    const matchesType = selectedType === "all" || event.type === selectedType;
    const matchesCategory = selectedCategory === "all" || event.category === selectedCategory;
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesCategory && matchesSearch;
  });

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "Workshop":
        return "bg-blue-100 text-blue-800";
      case "Symposium":
        return "bg-purple-100 text-purple-800";
      case "Conference":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
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
            Educational events and collaboration opportunities to advance pediatric neurology in Africa
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-gray-600">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-red-600" />
              <span>{events.length} Upcoming Events</span>
            </div>
            <div className="flex items-center">
              <UserPlus className="w-5 h-5 mr-2 text-red-600" />
              <span>{collaborationOpportunities.length} Active Collaborations</span>
            </div>
            <div className="flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-red-600" />
              <span>Across {new Set(events.map(e => e.location.split(",")[0])).size} African Countries</span>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-center">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab("events")}
                className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                  activeTab === "events"
                    ? "bg-white text-red-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Events Calendar
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

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        {activeTab === "events" && (
          <>
            {/* Search and Filter */}
            <div className="mb-12 bg-gray-50 p-6 rounded-lg">
              <div className="flex flex-col lg:flex-row gap-4 items-center">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-600" />
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                    >
                      {eventTypes.map((type) => (
                        <option key={type} value={type}>
                          {type === "all" ? "All Types" : type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category === "all" ? "All Categories" : category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Featured Events */}
            {filteredEvents.filter(e => e.isFeatured || e.isNew).length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Bookmark className="w-6 h-6 text-red-600 mr-2" />
                  Featured Events
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                  {filteredEvents.filter(e => e.isFeatured || e.isNew).map((event) => (
                    <div key={event.id} className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-red-200 hover:border-red-300 transition-colors">
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/3">
                          <img 
                            src={event.imageUrl} 
                            alt={event.title}
                            className="w-full h-48 md:h-full object-cover"
                          />
                        </div>
                        <div className="md:w-2/3 p-6">
                          <div className="flex justify-between items-start mb-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded ${getEventTypeColor(event.type)}`}>
                              {event.type}
                            </span>
                            {event.isNew && (
                              <span className="bg-green-100 text-green-800 px-2 py-1 text-xs font-bold rounded">
                                NEW
                              </span>
                            )}
                          </div>
                          
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                          <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded">
                              {event.category}
                            </span>
                            {event.audience.slice(0, 2).map((aud, index) => (
                              <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 text-xs rounded">
                                {aud}
                              </span>
                            ))}
                            {event.audience.length > 2 && (
                              <span className="bg-gray-100 text-gray-800 px-2 py-1 text-xs rounded">
                                +{event.audience.length - 2}
                              </span>
                            )}
                          </div>
                          
                          <div className="space-y-2 text-sm text-gray-600 mb-4">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              {event.date} • {event.time}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2" />
                              {event.location} {event.isVirtual && "(Virtual)"}
                            </div>
                            {event.speakers.length > 0 && (
                              <div className="flex items-center">
                                <Users className="w-4 h-4 mr-2" />
                                Speakers: {event.speakers.slice(0, 2).join(", ")}
                                {event.speakers.length > 2 && " + more"}
                              </div>
                            )}
                          </div>
                          
                          <a
                            href={event.registrationLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors font-medium"
                          >
                            Register Now
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Events */}
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              All Upcoming Events
            </h2>
            <div className="space-y-6">
              {filteredEvents.map((event) => (
                <div 
                  key={event.id} 
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-200"
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/4">
                      <img 
                        src={event.imageUrl} 
                        alt={event.title}
                        className="w-full h-48 md:h-full object-cover"
                      />
                    </div>
                    <div className="md:w-3/4 p-6">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getEventTypeColor(event.type)}`}>
                          {event.type}
                        </span>
                        {event.isFree && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 text-xs font-bold rounded">
                            FREE
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{event.title}</h3>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded">
                          {event.category}
                        </span>
                        {event.isVirtual && (
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 text-xs rounded">
                            Virtual
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4">{event.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm mb-1">Date & Time:</h4>
                          <p className="text-gray-600 text-sm flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            {event.date} • {event.time}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm mb-1">Location:</h4>
                          <p className="text-gray-600 text-sm flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            {event.location}
                          </p>
                        </div>
                        {expandedEvent === event.id && (
                          <>
                            <div>
                              <h4 className="font-semibold text-gray-900 text-sm mb-1">Audience:</h4>
                              <div className="flex flex-wrap gap-1">
                                {event.audience.map((aud, index) => (
                                  <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 text-xs rounded">
                                    {aud}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 text-sm mb-1">Speakers:</h4>
                              <ul className="text-gray-600 text-sm">
                                {event.speakers.map((speaker, index) => (
                                  <li key={index} className="flex items-center">
                                    <Users className="w-4 h-4 mr-2 opacity-50" />
                                    {speaker}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </>
                        )}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                        <button
                          onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
                          className="text-red-600 font-medium hover:text-red-700 text-sm self-start"
                        >
                          {expandedEvent === event.id ? "Show Less" : "More Details"}{" "}
                          {expandedEvent === event.id ? <ChevronUp className="inline ml-1 w-4 h-4" /> : <ChevronDown className="inline ml-1 w-4 h-4" />}
                        </button>
                        
                        <a
                          href={event.registrationLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Register Now
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredEvents.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No upcoming events found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search or check back later for new events.
                </p>
              </div>
            )}
          </>
        )}

        {activeTab === "collaborations" && (
          <div>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
                Collaboration Opportunities
              </h2>
              <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Connect with researchers and clinicians across Africa working on pediatric neurology projects.
                ACNA members can request collaboration support for their active projects.
              </p>
            </div>

            {/* Current Opportunities */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <UserPlus className="w-6 h-6 text-red-600 mr-2" />
                Current Opportunities
              </h2>
              
              <div className="space-y-6">
                {collaborationOpportunities.map((opportunity) => (
                  <div key={opportunity.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-200 p-6">
                    <div className="flex flex-col md:flex-row md:justify-between gap-6">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{opportunity.title}</h3>
                        <p className="text-gray-600 mb-4">{opportunity.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm mb-1">Project Lead:</h4>
                            <p className="text-gray-600 text-sm">{opportunity.projectLead}, {opportunity.institution}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm mb-1">Duration:</h4>
                            <p className="text-gray-600 text-sm">{opportunity.duration} • {opportunity.commitmentLevel} commitment</p>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm mb-1">Skills Needed:</h4>
                          <div className="flex flex-wrap gap-1">
                            {opportunity.skillsNeeded.map((skill, index) => (
                              <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="md:w-64 flex-shrink-0">
                        <div className="space-y-3">
                          <a
                            href={`mailto:${opportunity.contactEmail}`}
                            className="block bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors font-medium text-center"
                          >
                            Contact Project Lead
                          </a>
                          <p className="text-xs text-gray-500 text-center">
                            Posted: {new Date(opportunity.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Request Collaboration */}
            <div className="bg-blue-50 rounded-xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Have an Active Project?
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  ACNA members can request collaboration support for their pediatric neurology projects.
                </p>
              </div>
              
              <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <AlertCircle className="w-6 h-6 text-red-600 mr-2" />
                    Request Collaboration Support
                  </h3>
                  <p className="text-gray-600 mb-6">
                    To request collaboration assistance for your project, please log in to your ACNA Members Account
                    and submit a Collaboration Request form. Our team will help connect you with potential partners
                    and resources.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                      to="/login"
                      className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition text-center"
                    >
                      Log In to Your Account
                    </Link>
                    <Link
                      to="/membership"
                      className="flex-1 border border-red-600 text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-red-50 transition text-center"
                    >
                      Become a Member
                    </Link>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    What You Can Request
                  </h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                      <span className="text-red-600 mr-2">•</span>
                      <span>
                        <strong>Expert Consultation:</strong> Connect with specialists in specific neurological conditions
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-600 mr-2">•</span>
                      <span>
                        <strong>Research Collaboration:</strong> Find partners for multicenter studies or data sharing
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-600 mr-2">•</span>
                      <span>
                        <strong>Training Support:</strong> Request workshop facilitators or training materials
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-600 mr-2">•</span>
                      <span>
                        <strong>Program Implementation:</strong> Get help launching community programs
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-600 mr-2">•</span>
                      <span>
                        <strong>Technical Assistance:</strong> Access support for grant writing or protocol development
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkshopsSymposiums;