import React, { useState, useEffect } from "react";
import { Clock, Users, Award, ArrowRight, Search, Filter, AlertCircle } from "lucide-react";
import { TrainingProgram, trainingProgramsApi } from "../../../services/trainingProgramsApi";
import LoadingSpinner from "../../../components/common/LoadingSpinner";

interface CourseFilters {
  category: string;
  level: string;
  format: string;
  search: string;
}

const CoursesTabContent = () => {
  // State for data
  const [allPrograms, setAllPrograms] = useState<TrainingProgram[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for filters
  const [filters, setFilters] = useState<CourseFilters>({
    category: '',
    level: '',
    format: '',
    search: ''
  });

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Available filter options
  const levels = ['Beginner', 'Intermediate', 'Advanced'];
  const formats = ['Online', 'Hybrid', 'Self-paced', 'In-person', 'Virtual'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [programsData, categoriesData] = await Promise.all([
          trainingProgramsApi.getAll({ status: "Published" }),
          trainingProgramsApi.getCategories(),
        ]);

        setAllPrograms(programsData);
        setCategories(categoriesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter programs based on current filters
  const filteredPrograms = allPrograms.filter((program) => {
    const matchesCategory = !filters.category || program.category === filters.category;
    const matchesLevel = !filters.level || program.certificationType?.includes(filters.level) || program.type === filters.level;
    const matchesFormat = !filters.format || program.format?.includes(filters.format) || program.type?.includes(filters.format);
    const matchesSearch = !filters.search || 
      program.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      program.description.toLowerCase().includes(filters.search.toLowerCase()) ||
      program.instructor.toLowerCase().includes(filters.search.toLowerCase());

    return matchesCategory && matchesLevel && matchesFormat && matchesSearch;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredPrograms.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedPrograms = filteredPrograms.slice(startIndex, startIndex + itemsPerPage);

  // Helper functions
  const formatDate = (dateString: string) => {
    if (!dateString) return "TBD";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (program: TrainingProgram) => {
    const now = new Date();
    const startDate = new Date(program.startDate);
    const endDate = new Date(program.endDate);
    const registrationDeadline = new Date(program.registrationDeadline);
    
    // Check if user is enrolled (you might need to implement user enrollment tracking)
    // For now, we'll use a simple logic based on dates
    if (endDate < now) {
      return { status: 'completed', color: 'bg-green-100 text-green-800', label: 'Completed' };
    } else if (startDate <= now && endDate >= now) {
      return { status: 'enrolled', color: 'bg-blue-100 text-blue-800', label: 'In Progress' };
    } else if (registrationDeadline > now) {
      return { status: 'available', color: 'bg-orange-100 text-orange-800', label: 'Available' };
    } else {
      return { status: 'closed', color: 'bg-gray-100 text-gray-800', label: 'Registration Closed' };
    }
  };

  const getEnrollmentPercentage = (program: TrainingProgram) => {
    if (program.maxParticipants === 0) return 0;
    return (program.currentEnrollments / program.maxParticipants) * 100;
  };

  const handleFilterChange = (key: keyof CourseFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleProgramClick = (programId: number) => {
    // Navigate to program detail page or show more info
    console.log('Program clicked:', programId);
    // You can implement navigation here
  };

  // Error Card Component
  const ErrorCard = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center max-w-md mx-auto">
      <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Courses</h3>
      <p className="text-red-600 mb-6">{message}</p>
      <button
        onClick={onRetry}
        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md font-medium transition-colors duration-300"
      >
        Try Again
      </button>
    </div>
  );

  // No Courses Card Component
  const NoCoursesCard = () => (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center max-w-md mx-auto">
      <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
        <Award className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No Courses Found</h3>
      <p className="text-gray-600 mb-4">
        {filters.search || filters.category || filters.level || filters.format 
          ? "Try adjusting your search or filter criteria." 
          : "No courses are currently available."}
      </p>
      {(filters.search || filters.category || filters.level || filters.format) && (
        <button
          onClick={() => setFilters({ category: '', level: '', format: '', search: '' })}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Clear Filters
        </button>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded mb-4"></div>
            <div className="flex gap-4">
              <div className="h-8 bg-gray-200 rounded w-32"></div>
              <div className="h-8 bg-gray-200 rounded w-32"></div>
              <div className="h-8 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <ErrorCard message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses by title, description, or instructor..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <select 
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <select 
              value={filters.level}
              onChange={(e) => handleFilterChange('level', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Levels</option>
              {levels.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
            <select 
              value={filters.format}
              onChange={(e) => handleFilterChange('format', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Formats</option>
              {formats.map((format) => (
                <option key={format} value={format}>{format}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Results count */}
        {(filters.search || filters.category || filters.level || filters.format) && (
          <div className="mt-3 text-sm text-gray-600">
            Showing {filteredPrograms.length} of {allPrograms.length} courses
            {filteredPrograms.length !== allPrograms.length && (
              <button
                onClick={() => setFilters({ category: '', level: '', format: '', search: '' })}
                className="ml-2 text-blue-600 hover:text-blue-700"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Courses Grid */}
      {displayedPrograms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedPrograms.map((program) => {
            const statusInfo = getStatusColor(program);
            const enrollmentPercentage = getEnrollmentPercentage(program);
            
            return (
              <div 
                key={program.id} 
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-200 cursor-pointer"
                onClick={() => handleProgramClick(program.id)}
              >
                <div className="relative">
                  <img
                    src={program.imageUrl}
                    alt={program.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/api/placeholder/400/250";
                    }}
                  />
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  {program.isFeatured && (
                    <div className="absolute top-2 left-2">
                      <span className="bg-yellow-500 text-white px-2 py-1 text-xs font-bold rounded">
                        FEATURED
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {program.category}
                    </span>
                    <span className="text-xs font-medium text-gray-500">
                      {program.type}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{program.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">By {program.instructor}</p>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{program.description}</p>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-1" />
                      {program.duration}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Award className="w-4 h-4 mr-1" />
                      {program.cmeCredits} CME
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-1" />
                      {program.currentEnrollments}/{program.maxParticipants}
                    </div>
                    <div className="flex items-center text-gray-600 text-xs">
                      {program.format}
                    </div>
                  </div>

                  {/* Enrollment Progress */}
                  <div className="mb-3">
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
                        style={{ width: `${Math.min(enrollmentPercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-3 border-t">
                    <div className="text-sm">
                      <div className="font-medium text-gray-700">
                        Starts: {formatDate(program.startDate)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {program.price === 0 ? "FREE" : `${program.currency} ${program.price}`}
                      </div>
                    </div>
                    <button className={`flex items-center text-sm font-medium transition-colors ${
                      statusInfo.status === 'enrolled' 
                        ? 'text-blue-600 hover:text-blue-800' 
                        : statusInfo.status === 'completed' 
                          ? 'text-green-600 hover:text-green-800' 
                          : statusInfo.status === 'available'
                            ? 'text-orange-600 hover:text-orange-800'
                            : 'text-gray-400 cursor-not-allowed'
                    }`}>
                      {statusInfo.status === 'enrolled' 
                        ? 'Continue' 
                        : statusInfo.status === 'completed' 
                          ? 'View Certificate' 
                          : statusInfo.status === 'available'
                            ? 'Enroll Now'
                            : 'Closed'}
                      {statusInfo.status !== 'closed' && <ArrowRight className="ml-1 w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <NoCoursesCard />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="inline-flex rounded-md shadow-sm">
            <button 
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 border-t border-b border-gray-300 text-sm font-medium ${
                  currentPage === page 
                    ? 'bg-blue-50 text-blue-600 border-blue-300' 
                    : 'bg-white text-gray-500 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button 
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default CoursesTabContent;