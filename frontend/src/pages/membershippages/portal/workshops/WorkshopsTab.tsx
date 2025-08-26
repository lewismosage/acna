import { useState, useEffect } from 'react';
import { 
  Search, Filter, User, Calendar, Clock, MapPin, 
  Users, FileText, ChevronDown, ChevronUp, BookOpen,
  Target, Award, CheckCircle, Loader
} from 'lucide-react';
import { workshopsApi, Workshop, WorkshopStatus, WorkshopType } from '../../../../services/workshopAPI';

const WorkshopsTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [expandedWorkshop, setExpandedWorkshop] = useState<number | null>(null);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch workshops from API
  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        setLoading(true);
        const workshopsData = await workshopsApi.getAll();
        setWorkshops(workshopsData);
      } catch (err) {
        setError('Failed to load workshops. Please try again later.');
        console.error('Error fetching workshops:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkshops();
  }, []);

  // Filter workshops based on search and type
  const filteredWorkshops = workshops.filter(workshop => {
    const matchesSearch = workshop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          workshop.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          workshop.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || workshop.type === filterType;
    return matchesSearch && matchesType;
  });

  const toggleExpand = (id: number) => {
    setExpandedWorkshop(expandedWorkshop === id ? null : id);
  };

  const getStatusColor = (status: WorkshopStatus) => {
    switch (status) {
      case 'Registration Open': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-gray-100 text-gray-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      case 'Planning': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: WorkshopType) => {
    switch (type) {
      case 'Online': return '💻';
      case 'In-Person': return '🏢';
      case 'Hybrid': return '🔀';
      default: return '📚';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Function to truncate description to approximately 2 lines
  const getTruncatedDescription = (description: string, maxLength: number = 120) => {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength).trim() + '...';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 mb-2">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-4">
          <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900">Medical Workshops</h1>
        </div>
        <p className="text-gray-600 mb-6">
          Enhance your clinical skills with our specialized workshops led by expert medical professionals.
        </p>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search workshops, instructors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Formats</option>
              <option value="Online">Online</option>
              <option value="In-Person">In-Person</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Workshop Cards */}
      <div className="space-y-6">
        {filteredWorkshops.map((workshop) => (
          <div key={workshop.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Workshop Header - Compact View */}
            <div className="p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Workshop Image */}
                {workshop.imageUrl && (
                  <div className="lg:w-80 w-full">
                    <div className="relative h-48 rounded-lg overflow-hidden">
                      <img
                        src={workshop.imageUrl}
                        alt={workshop.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(workshop.status)}`}>
                          {workshop.status}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className="bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs font-medium">
                          {getTypeIcon(workshop.type)} {workshop.type}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Workshop Info - Compact */}
                <div className="flex-1 min-w-0">
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{workshop.title}</h3>
                    {/* Truncated description - only show 2 lines */}
                    <p className="text-gray-600 text-sm">
                      {getTruncatedDescription(workshop.description)}
                    </p>
                  </div>
                  
                  {/* Workshop details grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                        <div>
                          <div className="font-medium text-gray-900">{formatDate(workshop.date)}</div>
                          <div className="text-gray-600">{workshop.time}</div>
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2 text-blue-500" />
                        <span>Duration: {workshop.duration}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                        <div>
                          <div className="font-medium text-gray-900">{workshop.location}</div>
                          {workshop.venue && <div className="text-gray-600">{workshop.venue}</div>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2 text-blue-500" />
                        <span>{workshop.registered} / {workshop.capacity} registered</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-700">
                        <User className="w-4 h-4 mr-2 text-blue-500" />
                        <span>Instructor: {workshop.instructor}</span>
                      </div>
                      <div className="text-lg font-bold text-blue-600">
                        {workshop.price && workshop.price > 0 ? `${workshop.price}` : 'Free'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex gap-3">
                    <button 
                      className={`px-6 py-2 rounded-lg font-medium flex items-center ${
                        workshop.status === 'Registration Open' 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={workshop.status !== 'Registration Open'}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      {workshop.status === 'Registration Open' ? 'Register Now' : workshop.status}
                    </button>
                    
                    <button 
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Share
                    </button>
                    
                    <button 
                      onClick={() => toggleExpand(workshop.id)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center"
                    >
                      {expandedWorkshop === workshop.id ? (
                        <>
                          <ChevronUp className="w-4 h-4 mr-2" />
                          View Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4 mr-2" />
                          View More
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Expanded Details - Only shown when expanded */}
            {expandedWorkshop === workshop.id && (
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                {/* Full description */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Full Description</h4>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <p className="text-gray-700 text-sm whitespace-pre-line">{workshop.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column - Prerequisites */}
                  <div className="space-y-6">
                    {workshop.prerequisites && workshop.prerequisites.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                          <Target className="w-5 h-5 mr-2 text-blue-600" />
                          Prerequisites
                        </h4>
                        <ul className="bg-white p-4 rounded-lg border border-gray-200 space-y-2">
                          {workshop.prerequisites.map((prerequisite, index) => (
                            <li key={index} className="flex items-start text-sm text-gray-700">
                              <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span>{prerequisite}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  {/* Right Column - Materials */}
                  <div className="space-y-6">
                    {workshop.materials && workshop.materials.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                          <FileText className="w-5 h-5 mr-2 text-blue-600" />
                          Materials Included
                        </h4>
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <ul className="space-y-2">
                            {workshop.materials.map((material, index) => (
                              <li key={index} className="flex items-start text-sm text-gray-700">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                                <span>{material}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {filteredWorkshops.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No workshops found</h3>
            <p className="text-gray-500">Try adjusting your search or filters to find what you're looking for.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkshopsTab;