import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowRight, 
  Clock, 
  Users, 
  Award, 
  Globe, 
  Search, 
  Filter,
  Star,
  MapPin,
  Calendar,
  BookOpen,
  AlertCircle,
  ChevronDown,
  User
} from "lucide-react";
import ScrollToTop from "../../../components/common/ScrollToTop";
import { TrainingProgram, trainingProgramsApi } from "../../../services/trainingProgramsApi";
import LoadingSpinner from "../../../components/common/LoadingSpinner";

const TrainingPrograms = () => {
  const navigate = useNavigate();
  
  // State for data
  const [allPrograms, setAllPrograms] = useState<TrainingProgram[]>([]);
  const [featuredPrograms, setFeaturedPrograms] = useState<TrainingProgram[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for filters
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedFormat, setSelectedFormat] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  // State for display
  const [showAllFeatured, setShowAllFeatured] = useState(false);
  const [visiblePrograms, setVisiblePrograms] = useState(6);

  const programTypes = ["all", "Conference", "Workshop", "Fellowship", "Online Course", "Masterclass"];
  const programFormats = ["all", "In-person", "Virtual", "Hybrid"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [programsData, featuredData, categoriesData] = await Promise.all([
          trainingProgramsApi.getAll({ status: "Published" }),
          trainingProgramsApi.getFeatured(),
          trainingProgramsApi.getCategories(),
        ]);

        setAllPrograms(programsData);
        setFeaturedPrograms(featuredData);
        setCategories(categoriesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load training programs");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter programs based on current filters
  const filteredPrograms = allPrograms.filter((program) => {
    const matchesCategory = selectedCategory === "all" || program.category === selectedCategory;
    const matchesType = selectedType === "all" || program.type === selectedType;
    const matchesFormat = selectedFormat === "all" || program.format === selectedFormat;
    const matchesSearch = 
      program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.instructor.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesType && matchesFormat && matchesSearch;
  });

  const displayedPrograms = filteredPrograms.slice(0, visiblePrograms);
  const hasMorePrograms = visiblePrograms < filteredPrograms.length;
  const displayedFeaturedPrograms = showAllFeatured ? featuredPrograms : featuredPrograms.slice(0, 4);

  const loadMorePrograms = () => {
    setVisiblePrograms(prev => prev + 6);
  };

  const handleProgramClick = (programId: number) => {
    // Navigate to program detail page (you'll need to create this route)
    navigate(`/training-programs/${programId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Published":
        return "bg-green-100 text-green-800";
      case "Draft":
        return "bg-yellow-100 text-yellow-800";
      case "Archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "TBD";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const calculateDaysUntil = (dateString: string) => {
    if (!dateString) return null;
    const programDate = new Date(dateString);
    const today = new Date();
    const diffTime = programDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : null;
  };

  // Error Card Component
  const ErrorCard = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center max-w-md mx-auto">
      <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Programs</h3>
      <p className="text-red-600 mb-6">{message}</p>
      <button
        onClick={onRetry}
        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md font-medium transition-colors duration-300"
      >
        Try Again
      </button>
    </div>
  );

  // No Content Card Component
  const NoContentCard = ({ type }: { type: "featured" | "all" }) => (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center max-w-md mx-auto">
      <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No {type === "featured" ? "Featured Programs" : "Training Programs"} Available
      </h3>
      <p className="text-gray-600 mb-4">
        {type === "featured" 
          ? "Check back later for featured training programs." 
          : "Try adjusting your search or filter criteria."}
      </p>
    </div>
  );

  return (
    <div className="bg-white min-h-screen">
      <ScrollToTop />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-6">
            Training Programs
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 font-light max-w-3xl mx-auto mb-8">
            Advance your expertise in pediatric neurology through our
            comprehensive training programs designed for healthcare
            professionals across Africa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-gray-600">
            <div className="flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-red-600" />
              <span>{allPrograms.length} Programs Available</span>
            </div>
            <div className="flex items-center">
              <Star className="w-5 h-5 mr-2 text-red-600" />
              <span>{featuredPrograms.length} Featured Programs</span>
            </div>
            <div className="flex items-center">
              <Globe className="w-5 h-5 mr-2 text-red-600" />
              <span>Multiple Formats Available</span>
            </div>
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
                placeholder="Search programs by title, description, or instructor..."
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
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
              >
                {programTypes.map((type) => (
                  <option key={type} value={type}>
                    {type === "all" ? "All Types" : type}
                  </option>
                ))}
              </select>

              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
              >
                {programFormats.map((format) => (
                  <option key={format} value={format}>
                    {format === "all" ? "All Formats" : format}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          {/* Featured Programs Section */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
                Featured Training Programs
              </h2>
              <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Our flagship training opportunities designed to meet the diverse
                needs of healthcare professionals across the continent.
              </p>
            </div>

            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <ErrorCard message={error} onRetry={() => window.location.reload()} />
            ) : featuredPrograms.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 gap-8 mb-12">
                  {displayedFeaturedPrograms.map((program) => {
                    const daysUntil = calculateDaysUntil(program.startDate);
                    const enrollmentPercentage = program.maxParticipants > 0 
                      ? (program.currentEnrollments / program.maxParticipants) * 100 
                      : 0;

                    return (
                      <div
                        key={program.id}
                        className="group cursor-pointer hover:bg-gray-50 transition-colors duration-200 p-6 rounded-lg border border-gray-200 hover:border-red-200"
                        onClick={() => handleProgramClick(program.id)}
                      >
                        <div className="relative mb-4 overflow-hidden rounded">
                          <img
                            src={program.imageUrl}
                            alt={program.title}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/api/placeholder/400/250";
                            }}
                          />
                          <div className="absolute top-2 left-2">
                            <span className="bg-red-600 text-white px-2 py-1 text-xs font-bold uppercase tracking-wide rounded">
                              FEATURED
                            </span>
                          </div>
                          <div className="absolute top-2 right-2">
                            <span className="bg-orange-600 text-white px-2 py-1 text-xs font-medium rounded">
                              {program.type}
                            </span>
                          </div>
                          {daysUntil && daysUntil <= 30 && (
                            <div className="absolute bottom-2 right-2">
                              <span className="bg-green-600 text-white px-2 py-1 text-xs font-bold rounded">
                                {daysUntil} DAYS LEFT
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-red-600 transition-colors">
                            {program.title}
                          </h3>
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {program.description}
                          </p>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {program.duration}
                            </div>
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {program.currentEnrollments}/{program.maxParticipants}
                            </div>
                            <div className="flex items-center">
                              <Globe className="w-4 h-4 mr-1" />
                              {program.format}
                            </div>
                            <div className="flex items-center text-orange-600 font-medium">
                              <MapPin className="w-4 h-4 mr-1" />
                              {program.location}
                            </div>
                          </div>

                          {/* Enrollment Progress Bar */}
                          <div className="mt-3">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Enrollment: {enrollmentPercentage.toFixed(0)}%</span>
                              <span>{program.maxParticipants - program.currentEnrollments} spots left</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  enrollmentPercentage >= 80 ? "bg-red-500" :
                                  enrollmentPercentage >= 60 ? "bg-yellow-500" : "bg-green-500"
                                }`}
                                style={{ width: `${enrollmentPercentage}%` }}
                              />
                            </div>
                          </div>
                          
                          <div className="pt-2 space-y-1">
                            <p className="text-red-600 font-medium text-sm flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDate(program.startDate)} - {formatDate(program.endDate)}
                            </p>
                            <p className="text-orange-600 font-medium text-sm">
                              Registration deadline: {formatDate(program.registrationDeadline)}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-gray-900">
                                {program.price === 0 ? "FREE" : `${program.currency} ${program.price}`}
                              </span>
                              <div className="flex items-center text-sm text-gray-600">
                                <Award className="w-4 h-4 mr-1" />
                                {program.cmeCredits} CME Credits
                              </div>
                            </div>
                          </div>
                          
                          <button className="text-red-600 text-sm font-medium inline-flex items-center hover:text-red-700 pt-2">
                            LEARN MORE & REGISTER <ArrowRight className="ml-1 w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {featuredPrograms.length > 4 && (
                  <div className="text-center mb-12">
                    <button
                      onClick={() => setShowAllFeatured(!showAllFeatured)}
                      className="text-red-600 hover:text-red-700 font-medium flex items-center justify-center mx-auto"
                    >
                      {showAllFeatured 
                        ? "Show Less" 
                        : `View All ${featuredPrograms.length} Featured Programs`}
                      <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showAllFeatured ? "rotate-180" : ""}`} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <NoContentCard type="featured" />
            )}
          </div>

          {/* All Training Programs Section */}
          <div>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
                All Training Programs
                <span className="text-gray-500 text-lg font-normal ml-2">
                  ({filteredPrograms.length})
                </span>
              </h2>
              <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Comprehensive training sessions targeting specific neurological
                conditions and clinical skills.
              </p>
            </div>

            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <ErrorCard message={error} onRetry={() => window.location.reload()} />
            ) : displayedPrograms.length > 0 ? (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedPrograms.map((program) => {
                    const daysUntil = calculateDaysUntil(program.startDate);
                    const enrollmentPercentage = program.maxParticipants > 0 
                      ? (program.currentEnrollments / program.maxParticipants) * 100 
                      : 0;

                    return (
                      <div
                        key={program.id}
                        className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer hover:border-red-200"
                        onClick={() => handleProgramClick(program.id)}
                      >
                        <div className="relative">
                          <img
                            src={program.imageUrl}
                            alt={program.title}
                            className="w-full h-40 object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/api/placeholder/400/250";
                            }}
                          />
                          <div className="absolute top-2 left-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(program.status)}`}>
                              {program.type}
                            </span>
                          </div>
                          {program.isFeatured && (
                            <div className="absolute top-2 right-2">
                              <Star className="w-5 h-5 text-yellow-500 fill-current" />
                            </div>
                          )}
                          {daysUntil && daysUntil <= 7 && (
                            <div className="absolute bottom-2 right-2">
                              <span className="bg-red-600 text-white px-2 py-1 text-xs font-bold rounded">
                                URGENT
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="p-5">
                          <div className="flex justify-between items-start mb-2">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs font-medium rounded">
                              {program.category}
                            </span>
                            <div className="flex items-center text-xs text-gray-500">
                              <Award className="w-3 h-3 mr-1" />
                              {program.cmeCredits} CME
                            </div>
                          </div>
                          
                          <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight line-clamp-2">
                            {program.title}
                          </h3>
                          
                          <div className="flex items-center text-sm text-gray-600 mb-2">
                            <User className="w-4 h-4 mr-1" />
                            {program.instructor}
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600 mb-3">
                            <Clock className="w-4 h-4 mr-1" />
                            {program.duration} • {program.format}
                          </div>
                          
                          <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                            {program.description}
                          </p>
                          
                          <div className="space-y-2 mb-3">
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>Enrollment: {enrollmentPercentage.toFixed(0)}%</span>
                              <span>{program.currentEnrollments}/{program.maxParticipants}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1">
                              <div
                                className={`h-1 rounded-full ${
                                  enrollmentPercentage >= 80 ? "bg-red-500" :
                                  enrollmentPercentage >= 60 ? "bg-yellow-500" : "bg-green-500"
                                }`}
                                style={{ width: `${enrollmentPercentage}%` }}
                              />
                            </div>
                          </div>
                          
                          <div className="text-xs text-gray-500 mb-3">
                            <p>Starts: {formatDate(program.startDate)}</p>
                            <p>Register by: {formatDate(program.registrationDeadline)}</p>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-gray-900">
                              {program.price === 0 ? "FREE" : `${program.currency} ${program.price}`}
                            </span>
                            <button className="text-red-600 text-sm font-medium hover:text-red-700 flex items-center">
                              REGISTER <ArrowRight className="ml-1 w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Load More Button */}
                {hasMorePrograms && (
                  <div className="text-center mt-8">
                    <button
                      onClick={loadMorePrograms}
                      className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                    >
                      Load More Programs
                    </button>
                    <p className="text-sm text-gray-500 mt-2">
                      Showing {displayedPrograms.length} of {filteredPrograms.length} programs
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <NoContentCard type="all" />
            )}
          </div>
        </div>
      </section>

      {/* Registration & Support Section */}
      <section className="py-16 bg-orange-600">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            READY TO ADVANCE YOUR EXPERTISE?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of healthcare professionals who have enhanced their
            skills through our training programs. Get started today with
            personalized learning recommendations.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto mb-6">
            <button 
              onClick={() => navigate("/training-programs")}
              className="bg-white text-orange-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center justify-center"
            >
              <Award className="mr-2 h-4 w-4" />
              Browse Programs
            </button>
            <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-orange-600 transition-colors">
              Get Recommendations
            </button>
          </div>

          <div className="text-sm text-orange-100 opacity-90 space-y-2">
            <p>
              Need help choosing the right program? Contact our Education Team at{" "}
              <a
                href="mailto:training@acna.org"
                className="underline hover:text-white"
              >
                training@acna.org
              </a>
            </p>
            <p>
              Financial assistance and scholarships available for qualified
              participants from low-resource settings.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TrainingPrograms;