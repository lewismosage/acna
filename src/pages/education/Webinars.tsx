import React, { useState } from "react";
import {
  Video,
  Calendar,
  Clock,
  User,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Play,
  Download,
  Bookmark,
  Share2,
  AlertCircle,
} from "lucide-react";

interface Webinar {
  id: number;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  duration: string;
  speakers: {
    name: string;
    credentials: string;
    affiliation: string;
  }[];
  isLive: boolean;
  isUpcoming: boolean;
  isFeatured?: boolean;
  registrationLink?: string;
  recordingLink?: string;
  slidesLink?: string;
  imageUrl: string;
  tags: string[];
  languages: string[];
  targetAudience: string[];
  learningObjectives: string[];
}

const Webinars = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedAudience, setSelectedAudience] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [expandedWebinar, setExpandedWebinar] = useState<number | null>(null);

  const webinars: Webinar[] = [
    {
      id: 1,
      title: "Advances in Pediatric Epilepsy Management in Africa",
      description: "Expert panel discussion on the latest treatment approaches and challenges specific to African contexts.",
      category: "Epilepsy",
      date: "June 15, 2025",
      time: "14:00 GMT",
      duration: "90 min",
      speakers: [
        {
          name: "Dr. Amina Diallo",
          credentials: "MD, PhD",
          affiliation: "University of Dakar, Senegal"
        },
        {
          name: "Prof. Kwame Osei",
          credentials: "FRCP",
          affiliation: "Korle Bu Teaching Hospital, Ghana"
        }
      ],
      isLive: false,
      isUpcoming: true,
      isFeatured: true,
      registrationLink: "https://acna.org/webinars/register/1",
      imageUrl: "https://images.pexels.com/photos/5721876/pexels-photo-5721876.jpeg",
      tags: ["Epilepsy", "Treatment", "Panel"],
      languages: ["English", "French"],
      targetAudience: ["Neurologists", "Pediatricians", "Residents"],
      learningObjectives: [
        "Understand current treatment guidelines for pediatric epilepsy in Africa",
        "Learn about challenges in medication access and adherence",
        "Discuss culturally appropriate counseling approaches"
      ]
    },
    {
      id: 2,
      title: "Cerebral Palsy: Early Identification in Community Settings",
      description: "Training on recognizing early signs of cerebral palsy and initiating interventions in low-resource settings.",
      category: "Cerebral Palsy",
      date: "May 28, 2025",
      time: "12:00 GMT",
      duration: "60 min",
      speakers: [
        {
          name: "Dr. Fatima Nkosi",
          credentials: "PT, PhD",
          affiliation: "University of Cape Town, South Africa"
        }
      ],
      isLive: false,
      isUpcoming: true,
      registrationLink: "https://acna.org/webinars/register/2",
      imageUrl: "https://images.pexels.com/photos/4260323/pexels-photo-4260323.jpeg",
      tags: ["Cerebral Palsy", "Early Intervention", "Rehabilitation"],
      languages: ["English", "Portuguese"],
      targetAudience: ["Community Health Workers", "Physical Therapists"],
      learningObjectives: [
        "Learn to identify early signs of cerebral palsy",
        "Understand basic intervention strategies",
        "Know when to refer for specialist care"
      ]
    },
    {
      id: 3,
      title: "Autism Spectrum Disorders: Cultural Perspectives in Africa",
      description: "Exploring cultural interpretations of autism and strategies for improving diagnosis and support.",
      category: "Autism",
      date: "April 10, 2025",
      time: "15:00 GMT",
      duration: "75 min",
      speakers: [
        {
          name: "Dr. Ngozi Eze",
          credentials: "MD, MPH",
          affiliation: "University of Nigeria Teaching Hospital"
        },
        {
          name: "Dr. Hassan Abdi",
          credentials: "PhD",
          affiliation: "Kenya Autism Research Center"
        }
      ],
      isLive: false,
      isUpcoming: false,
      recordingLink: "https://acna.org/webinars/recordings/3",
      slidesLink: "https://acna.org/webinars/slides/3",
      imageUrl: "https://images.pexels.com/photos/5212359/pexels-photo-5212359.jpeg",
      tags: ["Autism", "Culture", "Diagnosis"],
      languages: ["English"],
      targetAudience: ["Clinicians", "Researchers", "Educators"],
      learningObjectives: [
        "Understand cultural beliefs about autism in different African communities",
        "Learn culturally sensitive diagnostic approaches",
        "Explore community-based support strategies"
      ]
    },
    {
      id: 4,
      title: "Live Q&A: Childhood Headache Disorders in Africa",
      description: "Interactive session on diagnosing and managing common childhood headache disorders.",
      category: "Headache",
      date: "July 5, 2025",
      time: "13:00 GMT",
      duration: "60 min",
      speakers: [
        {
          name: "Dr. Tendai Moyo",
          credentials: "MD",
          affiliation: "Harare Children's Hospital, Zimbabwe"
        }
      ],
      isLive: true,
      isUpcoming: true,
      isFeatured: true,
      registrationLink: "https://acna.org/webinars/register/4",
      imageUrl: "https://images.pexels.com/photos/8376181/pexels-photo-8376181.jpeg",
      tags: ["Headache", "Q&A", "Diagnosis"],
      languages: ["English", "French"],
      targetAudience: ["General Practitioners", "Pediatricians"],
      learningObjectives: [
        "Learn to differentiate primary and secondary headaches",
        "Understand when to investigate further",
        "Discuss treatment options available in Africa"
      ]
    },
    
  ];

  const categories = ["all", "Epilepsy", "Cerebral Palsy", "Autism", "Headache", "Infectious Disease", "Neuromuscular"];
  const audiences = ["all", "Neurologists", "Pediatricians", "General Practitioners", "Community Health Workers", "Researchers", "Educators"];
  const statuses = ["all", "upcoming", "recorded", "live"];

  const filteredWebinars = webinars.filter((webinar) => {
    const matchesCategory = selectedCategory === "all" || webinar.category === selectedCategory;
    const matchesAudience = selectedAudience === "all" || webinar.targetAudience.some(aud => aud === selectedAudience);
    const matchesStatus = 
      selectedStatus === "all" ||
      (selectedStatus === "upcoming" && webinar.isUpcoming && !webinar.isLive) ||
      (selectedStatus === "recorded" && !webinar.isUpcoming) ||
      (selectedStatus === "live" && webinar.isLive);
    const matchesSearch =
      webinar.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      webinar.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      webinar.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesAudience && matchesStatus && matchesSearch;
  });

  const getStatusBadge = (webinar: Webinar) => {
    if (webinar.isLive) {
      return (
        <span className="bg-red-600 text-white px-2 py-1 text-xs font-bold rounded-full flex items-center">
          <span className="w-2 h-2 bg-white rounded-full mr-1"></span>
          LIVE NOW
        </span>
      );
    }
    if (webinar.isUpcoming) {
      return (
        <span className="bg-blue-600 text-white px-2 py-1 text-xs font-bold rounded-full">
          UPCOMING
        </span>
      );
    }
    return (
      <span className="bg-gray-600 text-white px-2 py-1 text-xs font-bold rounded-full">
        RECORDED
      </span>
    );
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-6">
            ACNA Webinars
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 font-light max-w-3xl mx-auto mb-8">
            Live and recorded educational sessions on pediatric neurology topics relevant to Africa
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-gray-600">
            <div className="flex items-center">
              <Video className="w-5 h-5 mr-2 text-red-600" />
              <span>{webinars.length} Webinars Available</span>
            </div>
            <div className="flex items-center">
              <User className="w-5 h-5 mr-2 text-red-600" />
              <span>
                {webinars.filter(w => w.isUpcoming).length} Upcoming Events
              </span>
            </div>
            <div className="flex items-center">
              <Play className="w-5 h-5 mr-2 text-red-600" />
              <span>
                {webinars.filter(w => !w.isUpcoming).length} Recordings Available
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
              About Our Webinars
            </h2>
            <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
          </div>

          <div className="space-y-6 text-gray-700 leading-relaxed text-lg">
            <p>
              ACNA's webinar series brings together leading experts in pediatric neurology to share knowledge,
              discuss challenges, and present solutions tailored to African healthcare contexts. Our sessions
              cover the full spectrum of child neurological conditions, with a focus on practical approaches
              for resource-limited settings.
            </p>
            <p>
              Participate in live sessions to interact directly with speakers and colleagues across the continent,
              or access our growing library of recorded webinars at your convenience. Many webinars offer
              continuing medical education (CME) credits for healthcare professionals.
            </p>
            <p>
              All webinars are free to attend, with recordings and presentation slides available for download
              afterward (when permitted by speakers).
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-gray-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search webinars by title, description or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-600" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category === "all" ? "All Categories" : category}
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={selectedAudience}
                onChange={(e) => setSelectedAudience(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
              >
                {audiences.map((audience) => (
                  <option key={audience} value={audience}>
                    {audience === "all" ? "All Audiences" : audience}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status === "all" ? "All Statuses" : status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Webinars List */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          {/* Featured Webinars */}
          {filteredWebinars.filter(w => w.isFeatured).length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Bookmark className="w-6 h-6 text-red-600 mr-2" />
                Featured Webinars
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                {filteredWebinars.filter(w => w.isFeatured).map((webinar) => (
                  <div key={webinar.id} className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-red-200 hover:border-red-300 transition-colors">
                    <div className="relative">
                      <img 
                        src={webinar.imageUrl} 
                        alt={webinar.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        {getStatusBadge(webinar)}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{webinar.title}</h3>
                      <p className="text-gray-600 mb-4">{webinar.description}</p>
                      
                      <div className="flex items-center text-sm text-gray-500 gap-4 mb-4">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {webinar.date}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {webinar.time} ({webinar.duration})
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded">
                          {webinar.category}
                        </span>
                        {webinar.tags.slice(0, 2).map((tag, index) => (
                          <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="space-y-2">
                        {webinar.speakers.map((speaker, index) => (
                          <div key={index} className="text-sm">
                            <p className="font-medium text-gray-900">{speaker.name}, {speaker.credentials}</p>
                            <p className="text-gray-600">{speaker.affiliation}</p>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-6">
                        {webinar.isUpcoming ? (
                          <a
                            href={webinar.registrationLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full bg-red-600 text-white text-center py-3 rounded-md hover:bg-red-700 transition-colors font-medium"
                          >
                            Register Now
                          </a>
                        ) : (
                          <a
                            href={webinar.recordingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full bg-red-600 text-white text-center py-3 rounded-md hover:bg-red-700 transition-colors font-medium"
                          >
                            Watch Recording
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Webinars */}
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {selectedStatus === "all" ? "All Webinars" : 
             selectedStatus === "upcoming" ? "Upcoming Webinars" :
             selectedStatus === "recorded" ? "Recorded Webinars" : "Live Webinars"}
          </h2>
          
          {filteredWebinars.length > 0 ? (
            <div className="space-y-8">
              {filteredWebinars.filter(w => !w.isFeatured).map((webinar) => (
                <div key={webinar.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-200">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/3 relative">
                      <img 
                        src={webinar.imageUrl} 
                        alt={webinar.title}
                        className="w-full h-48 md:h-full object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        {getStatusBadge(webinar)}
                      </div>
                    </div>
                    
                    <div className="md:w-2/3 p-6">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{webinar.title}</h3>
                        <button 
                          onClick={() => setExpandedWebinar(expandedWebinar === webinar.id ? null : webinar.id)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center"
                        >
                          {expandedWebinar === webinar.id ? 'Less Details' : 'More Details'}
                          {expandedWebinar === webinar.id ? (
                            <ChevronUp className="ml-1 w-4 h-4" />
                          ) : (
                            <ChevronDown className="ml-1 w-4 h-4" />
                          )}
                        </button>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4">{webinar.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded">
                          {webinar.category}
                        </span>
                        {webinar.tags.slice(0, 2).map((tag, index) => (
                          <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500 gap-4 mb-4">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {webinar.date}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {webinar.time} ({webinar.duration})
                        </div>
                      </div>
                      
                      {expandedWebinar === webinar.id && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="mb-4">
                            <h4 className="font-semibold text-gray-900 text-sm mb-2">Learning Objectives:</h4>
                            <ul className="space-y-1 text-sm text-gray-600">
                              {webinar.learningObjectives.map((obj, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="text-red-600 mr-2">•</span>
                                  {obj}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="mb-4">
                            <h4 className="font-semibold text-gray-900 text-sm mb-2">Speakers:</h4>
                            <div className="space-y-2">
                              {webinar.speakers.map((speaker, index) => (
                                <div key={index} className="text-sm">
                                  <p className="font-medium text-gray-900">{speaker.name}, {speaker.credentials}</p>
                                  <p className="text-gray-600">{speaker.affiliation}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <h4 className="font-semibold text-gray-900 text-sm mb-2">For:</h4>
                            <div className="flex flex-wrap gap-1">
                              {webinar.targetAudience.map((audience, index) => (
                                <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 text-xs rounded">
                                  {audience}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex gap-3">
                            {webinar.isUpcoming ? (
                              <a
                                href={webinar.registrationLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition-colors font-medium text-center"
                              >
                                Register Now
                              </a>
                            ) : (
                              <a
                                href={webinar.recordingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition-colors font-medium text-center"
                              >
                                Watch Recording
                              </a>
                            )}
                            
                            {webinar.slidesLink && (
                              <a
                                href={webinar.slidesLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors font-medium"
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Slides
                              </a>
                            )}
                            
                            <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50">
                              <Share2 className="w-4 h-4 text-gray-600" />
                            </button>
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
              <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No webinars found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Want to Present a Webinar?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Share your expertise with pediatric neurology professionals across Africa.
          </p>
          <button className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition">
            Propose a Webinar Topic
          </button>
        </div>
      </section>
    </div>
  );
};

export default Webinars;