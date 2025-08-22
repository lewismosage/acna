import { useState } from 'react';
import { 
  Search, Filter, User, Calendar, Clock, MapPin, Star, 
  Users, FileText 
} from 'lucide-react';

interface Workshop {
  id: number;
  title: string;
  instructor: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  type: 'Online' | 'In-Person' | 'Hybrid';
  capacity: number;
  enrolled: number;
  price: number;
  status: 'Open' | 'Full' | 'Completed';
  description: string;
  prerequisites: string[];
  materials: string[];
  rating: number;
  reviews: number;
}

const WorkshopsTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');

  // Mock workshop data
  const workshops: Workshop[] = [
    {
      id: 1,
      title: "Advanced EEG Interpretation in Pediatric Patients",
      instructor: "Dr. Sarah Johnson",
      date: "2025-10-20",
      time: "2:00 PM - 5:00 PM",
      duration: "3 hours",
      location: "Virtual Meeting Room",
      type: "Online",
      capacity: 50,
      enrolled: 35,
      price: 150,
      status: "Open",
      description: "Learn advanced techniques for interpreting EEG patterns in pediatric neurology cases.",
      prerequisites: ["Basic EEG knowledge", "Clinical experience"],
      materials: ["EEG Atlas", "Case studies", "Recording software"],
      rating: 4.8,
      reviews: 24
    },
    {
      id: 2,
      title: "Cerebral Palsy Management Workshop",
      instructor: "Prof. Michael Chen",
      date: "2025-10-25",
      time: "9:00 AM - 4:00 PM",
      duration: "7 hours",
      location: "Kenyatta National Hospital",
      type: "In-Person",
      capacity: 30,
      enrolled: 28,
      price: 200,
      status: "Open",
      description: "Comprehensive workshop on modern approaches to cerebral palsy management and rehabilitation.",
      prerequisites: ["Medical degree", "Pediatric experience"],
      materials: ["Assessment tools", "Treatment protocols", "Case presentations"],
      rating: 4.9,
      reviews: 18
    },
    {
      id: 3,
      title: "Pediatric Stroke Recognition and Treatment",
      instructor: "Dr. Emma Williams",
      date: "2025-11-05",
      time: "10:00 AM - 3:00 PM",
      duration: "5 hours",
      location: "Hybrid (Online + Clinical Demo)",
      type: "Hybrid",
      capacity: 40,
      enrolled: 40,
      price: 175,
      status: "Full",
      description: "Early recognition and emergency management of stroke in pediatric patients.",
      prerequisites: ["Emergency medicine background"],
      materials: ["Protocol guidelines", "Simulation scenarios"],
      rating: 4.7,
      reviews: 31
    }
  ];

  // Filter workshops based on search and type
  const filteredWorkshops = workshops.filter(workshop => {
    const matchesSearch = workshop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          workshop.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || workshop.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search workshops..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Types</option>
              <option value="Online">Online</option>
              <option value="In-Person">In-Person</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Workshop Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredWorkshops.map((workshop) => (
          <div key={workshop.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{workshop.title}</h3>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <User className="w-4 h-4 mr-1" />
                    {workshop.instructor}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  workshop.status === 'Open' ? 'bg-green-100 text-green-800' :
                  workshop.status === 'Full' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {workshop.status}
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-4">{workshop.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(workshop.date).toLocaleDateString()} • {workshop.time}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  {workshop.duration}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  {workshop.location} ({workshop.type})
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  <span className="text-sm font-medium">{workshop.rating}</span>
                  <span className="text-sm text-gray-500 ml-1">({workshop.reviews} reviews)</span>
                </div>
                <div className="text-sm text-gray-600">
                  {workshop.enrolled}/{workshop.capacity} enrolled
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-lg font-bold text-blue-600">
                  ${workshop.price}
                </div>
                <button 
                  className={`px-4 py-2 rounded-md font-medium ${
                    workshop.status === 'Open' 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={workshop.status !== 'Open'}
                >
                  {workshop.status === 'Open' ? 'Register Now' : 'Registration Closed'}
                </button>
              </div>
            </div>

            {/* Workshop details footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <div className="flex items-center">
                  <FileText className="w-3 h-3 mr-1" />
                  {workshop.materials.length} materials included
                </div>
                <div className="flex items-center">
                  <Users className="w-3 h-3 mr-1" />
                  {workshop.prerequisites.length} prerequisites
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkshopsTab;