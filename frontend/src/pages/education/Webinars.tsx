import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  ArrowRight,
} from "lucide-react";
import ScrollToTop from "../../components/common/ScrollToTop";
import { Webinar, 
  getAllWebinars,
  getFeaturedWebinars, 
  getWebinarCategories, 
  getWebinarTargetAudiences } from "../../services/webinarsApi";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const Webinars = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedAudience, setSelectedAudience] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [expandedWebinar, setExpandedWebinar] = useState<number | null>(null);
  const [allWebinars, setAllWebinars] = useState<Webinar[]>([]);
  const [featuredWebinars, setFeaturedWebinars] = useState<Webinar[]>([]);
  const [categories, setCategories] = useState<string[]>(["all"]);
  const [audiences, setAudiences] = useState<string[]>(["all"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllFeatured, setShowAllFeatured] = useState(false);
  const [visibleWebinars, setVisibleWebinars] = useState(4);

  const statuses = ["all", "upcoming", "recorded", "live"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [webinarsData, featuredData, categoriesData, audiencesData] = await Promise.all([
          getAllWebinars(),
          getFeaturedWebinars(),
          getWebinarCategories(),
          getWebinarTargetAudiences()
        ]);

        setAllWebinars(webinarsData);
        setFeaturedWebinars(featuredData);
        setCategories(["all", ...categoriesData]);
        setAudiences(["all", ...audiencesData]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load webinars");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // FIXED: Correct status detection functions
  const getIsUpcoming = (webinar: Webinar): boolean => {
    return webinar.status === 'Planning' || webinar.status === 'Registration Open';
  };

  const getIsLive = (webinar: Webinar): boolean => {
    return webinar.status === 'Live';
  };

  const getIsRecorded = (webinar: Webinar): boolean => {
    return webinar.status === 'Completed' || webinar.status === 'Cancelled';
  };

  const filteredWebinars = allWebinars.filter((webinar) => {
    const isUpcoming = getIsUpcoming(webinar);
    const isLive = getIsLive(webinar);
    const isRecorded = getIsRecorded(webinar);
    
    const matchesCategory = selectedCategory === "all" || webinar.category === selectedCategory;
    const matchesAudience = selectedAudience === "all" || webinar.targetAudience.some(aud => aud === selectedAudience);
    const matchesStatus = 
      selectedStatus === "all" ||
      (selectedStatus === "upcoming" && isUpcoming) ||
      (selectedStatus === "recorded" && isRecorded) ||
      (selectedStatus === "live" && isLive);
    const matchesSearch =
      webinar.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      webinar.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      webinar.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesAudience && matchesStatus && matchesSearch;
  });

  const displayedWebinars = filteredWebinars.slice(0, visibleWebinars);
  const hasMoreWebinars = visibleWebinars < filteredWebinars.length;

  const loadMoreWebinars = () => {
    setVisibleWebinars(prev => prev + 4);
  };

  const displayedFeaturedWebinars = showAllFeatured 
    ? featuredWebinars 
    : featuredWebinars.slice(0, 2);

  const getStatusBadge = (webinar: Webinar) => {
    const isLive = getIsLive(webinar);
    const isUpcoming = getIsUpcoming(webinar);
    const isRecorded = getIsRecorded(webinar);

    if (isLive) {
      return (
        <span className="bg-red-600 text-white px-2 py-1 text-xs font-bold rounded-full flex items-center">
          <span className="w-2 h-2 bg-white rounded-full mr-1"></span>
          LIVE NOW
        </span>
      );
    }
    if (isUpcoming) {
      return (
        <span className="bg-blue-600 text-white px-2 py-1 text-xs font-bold rounded-full">
          UPCOMING
        </span>
      );
    }
    if (isRecorded) {
      return (
        <span className="bg-gray-600 text-white px-2 py-1 text-xs font-bold rounded-full">
          RECORDED
        </span>
      );
    }
    return null;
  };

  const getActionButton = (webinar: Webinar) => {
    const isUpcoming = getIsUpcoming(webinar);
    const isLive = getIsLive(webinar);
    const isRecorded = getIsRecorded(webinar);

    if (isUpcoming) {
      return (
        <button 
          onClick={() => navigate(`/webinars/${webinar.id}?tab=registration`)}
          className="flex-1 bg-red-600 text-white text-center py-2 rounded-md hover:bg-red-700 transition-colors font-medium"
        >
          Register Now
        </button>
      );
    } else if (isLive && webinar.registrationLink) {
      return (
        <a
          href={webinar.registrationLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-red-600 text-white text-center py-2 rounded-md hover:bg-red-700 transition-colors font-medium"
        >
          Join Live
        </a>
      );
    } else if (isRecorded && webinar.recordingLink) {
      return (
        <a
          href={webinar.recordingLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-red-600 text-white text-center py-2 rounded-md hover:bg-red-700 transition-colors font-medium"
        >
          Watch Recording
        </a>
      );
    }
    return null;
  };

  const handleWebinarClick = (webinarId: number) => {
    navigate(`/webinars/${webinarId}`);
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Webinars</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <ScrollToTop />
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
              <span>{allWebinars.length} Webinars Available</span>
            </div>
            <div className="flex items-center">
              <User className="w-5 h-5 mr-2 text-red-600" />
              <span>
                {allWebinars.filter(w => getIsUpcoming(w)).length} Upcoming Events
              </span>
            </div>
            <div className="flex items-center">
              <Play className="w-5 h-5 mr-2 text-red-600" />
              <span>
                {allWebinars.filter(w => getIsRecorded(w)).length} Recordings Available
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
          {featuredWebinars.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Bookmark className="w-6 h-6 text-red-600 mr-2" />
                Featured Webinars
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                {displayedFeaturedWebinars.map((webinar) => (
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
                      <p className="text-gray-600 mb-4 line-clamp-2">{webinar.description}</p>
                      
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
                      
                      <div className="space-y-2 mb-4">
                        {webinar.speakers.slice(0, 2).map((speaker, index) => (
                          <div key={index} className="text-sm">
                            <p className="font-medium text-gray-900">{speaker.name}, {speaker.credentials}</p>
                            <p className="text-gray-600">{speaker.affiliation}</p>
                          </div>
                        ))}
                        {webinar.speakers.length > 2 && (
                          <p className="text-xs text-gray-500">+{webinar.speakers.length - 2} more speakers</p>
                        )}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2">
                        {getActionButton(webinar)}
                        <button 
                          onClick={() => handleWebinarClick(webinar.id)}
                          className="flex items-center justify-center text-red-600 hover:text-red-700 font-medium py-2 px-4 border border-red-200 rounded-md hover:bg-red-50"
                        >
                          Read More
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {featuredWebinars.length > 2 && (
                <div className="text-center mt-6">
                  <button
                    onClick={() => setShowAllFeatured(!showAllFeatured)}
                    className="text-red-600 hover:text-red-700 font-medium flex items-center justify-center mx-auto"
                  >
                    {showAllFeatured ? 'Show Less' : `View All ${featuredWebinars.length} Featured Webinars`}
                    <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showAllFeatured ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* All Webinars */}
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {selectedStatus === "all" ? "All Webinars" : 
             selectedStatus === "upcoming" ? "Upcoming Webinars" :
             selectedStatus === "recorded" ? "Recorded Webinars" : "Live Webinars"}
            <span className="text-gray-500 text-lg font-normal ml-2">
              ({filteredWebinars.length})
            </span>
          </h2>
          
          {displayedWebinars.length > 0 ? (
            <div className="space-y-8">
              {displayedWebinars.map((webinar) => (
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
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{webinar.title}</h3>
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
                          
                          <div className="flex flex-col sm:flex-row gap-3">
                            {getActionButton(webinar)}
                            
                            <button 
                              onClick={() => handleWebinarClick(webinar.id)}
                              className="flex items-center justify-center text-red-600 hover:text-red-700 font-medium py-2 px-4 border border-red-200 rounded-md hover:bg-red-50"
                            >
                              Full Details
                              <ArrowRight className="w-4 h-4 ml-1" />
                            </button>
                            
                            {webinar.slidesLink && (
                              <a
                                href={webinar.slidesLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors font-medium"
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
              
              {/* Load More Button */}
              {hasMoreWebinars && (
                <div className="text-center mt-8">
                  <button
                    onClick={loadMoreWebinars}
                    className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                  >
                    Load More Webinars
                  </button>
                  <p className="text-sm text-gray-500 mt-2">
                    Showing {displayedWebinars.length} of {filteredWebinars.length} webinars
                  </p>
                </div>
              )}
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