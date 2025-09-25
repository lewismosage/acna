import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  Calendar,
  Briefcase,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Users,
  Building2,
  Loader,
  AlertCircle
} from 'lucide-react';
import {
  careersApi,
  JobOpportunity,
  JobType,
  JobLevel,
  WorkArrangement
} from '../../services/careersAPI';
import ScrollToTop from '../../components/common/ScrollToTop';

interface JobsPageProps {}

interface FilterState {
  search: string;
  department: string;
  type: JobType | '';
  level: JobLevel | '';
  location: string;
  workArrangement: WorkArrangement | '';
}

const Jobs: React.FC<JobsPageProps> = () => {
  const [jobs, setJobs] = useState<JobOpportunity[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedJobs, setExpandedJobs] = useState<Set<number>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    department: '',
    type: '',
    level: '',
    location: '',
    workArrangement: ''
  });

  const [departments, setDepartments] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);

  useEffect(() => {
    fetchJobs();
    fetchMetadata();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [jobs, filters]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const jobsData = await careersApi.getAllJobs({ status: 'Active' });
      setJobs(jobsData);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load job opportunities. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [departmentsData, locationsData] = await Promise.all([
        careersApi.getDepartments(),
        careersApi.getLocations()
      ]);
      setDepartments(departmentsData);
      setLocations(locationsData);
    } catch (err) {
      console.error('Error fetching metadata:', err);
    }
  };

  const applyFilters = () => {
    let filtered = jobs.filter(job => {
      const matchesSearch = !filters.search || 
        job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.department.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.description.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesDepartment = !filters.department || job.department === filters.department;
      const matchesType = !filters.type || job.type === filters.type;
      const matchesLevel = !filters.level || job.level === filters.level;
      const matchesLocation = !filters.location || job.location === filters.location;
      const matchesWorkArrangement = !filters.workArrangement || job.workArrangement === filters.workArrangement;

      return matchesSearch && matchesDepartment && matchesType && matchesLevel && matchesLocation && matchesWorkArrangement;
    });

    setFilteredJobs(filtered);
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      department: '',
      type: '',
      level: '',
      location: '',
      workArrangement: ''
    });
  };

  const toggleJobExpansion = (jobId: number) => {
    setExpandedJobs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

  const getJobTypeColor = (type: JobType): string => {
    switch (type) {
      case 'Full-time':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Part-time':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Contract':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Internship':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Volunteer':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'No deadline';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading job opportunities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Jobs</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchJobs}
            className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ScrollToTop />
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Join Our Mission
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Discover meaningful career opportunities at ACNA and help us transform child health across Africa. 
              Every role contributes to our vision of better neurological care for children.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center">
                <Briefcase className="w-5 h-5 mr-2" />
                {jobs.length} Open Positions
              </div>
              <div className="flex items-center">
                <Building2 className="w-5 h-5 mr-2" />
                {departments.length} Departments
              </div>
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                {locations.length} Locations
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs by title, department, or description..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-5 h-5 mr-2" />
              Filters
              {showFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
            </button>

            {/* Desktop Filters */}
            <div className="hidden lg:flex items-center gap-4">
              <select
                value={filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>

              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
              >
                <option value="">All Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
                <option value="Volunteer">Volunteer</option>
              </select>

              <select
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
              >
                <option value="">All Locations</option>
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>

              {(filters.search || filters.department || filters.type || filters.location || filters.level || filters.workArrangement) && (
                <button
                  onClick={clearFilters}
                  className="flex items-center px-4 py-3 text-gray-600 hover:text-gray-800"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="lg:hidden mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select
                  value={filters.department}
                  onChange={(e) => handleFilterChange('department', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                >
                  <option value="">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>

                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                >
                  <option value="">All Types</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                  <option value="Volunteer">Volunteer</option>
                </select>

                <select
                  value={filters.level}
                  onChange={(e) => handleFilterChange('level', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                >
                  <option value="">All Levels</option>
                  <option value="Entry-level">Entry-level</option>
                  <option value="Mid-level">Mid-level</option>
                  <option value="Senior">Senior</option>
                  <option value="Executive">Executive</option>
                </select>

                <select
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                >
                  <option value="">All Locations</option>
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>

              {(filters.search || filters.department || filters.type || filters.location || filters.level || filters.workArrangement) && (
                <button
                  onClick={clearFilters}
                  className="w-full flex items-center justify-center px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Jobs List */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {filteredJobs.length} Job{filteredJobs.length !== 1 ? 's' : ''} Available
          </h2>
        </div>

        {filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-500 mb-4">
              {filters.search || filters.department || filters.type || filters.location ? 
                'Try adjusting your search criteria or filters.' : 
                'No job opportunities are currently available.'
              }
            </p>
            {(filters.search || filters.department || filters.type || filters.location) && (
              <button
                onClick={clearFilters}
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredJobs.map((job) => {
              const isExpanded = expandedJobs.has(job.id);
              
              return (
                <div key={job.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getJobTypeColor(job.type)}`}>
                            {job.type}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                            {job.level}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                            {job.workArrangement}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-orange-600 cursor-pointer">
                          {job.title}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Building2 className="w-4 h-4 mr-2 text-orange-600" />
                            {job.department}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-orange-600" />
                            {job.location}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-orange-600" />
                            Closes: {formatDate(job.closingDate)}
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2 text-orange-600" />
                            {job.applicationsCount || 0} applicants
                          </div>
                        </div>

                        <p className="text-gray-700 mb-4 line-clamp-3">
                          {job.description}
                        </p>

                        {job.salary && (
                          <p className="text-lg font-semibold text-gray-900 mb-4">
                            {job.salary}
                          </p>
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-6 pt-6 border-t border-gray-200 space-y-6">
                        {job.responsibilities && job.responsibilities.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Key Responsibilities</h4>
                            <ul className="space-y-2">
                              {job.responsibilities.map((responsibility, index) => (
                                <li key={index} className="text-gray-700 flex items-start">
                                  <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                  {responsibility}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {job.requirements && job.requirements.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Requirements</h4>
                            <ul className="space-y-2">
                              {job.requirements.map((requirement, index) => (
                                <li key={index} className="text-gray-700 flex items-start">
                                  <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                  {requirement}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {job.qualifications && job.qualifications.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Qualifications</h4>
                            <ul className="space-y-2">
                              {job.qualifications.map((qualification, index) => (
                                <li key={index} className="text-gray-700 flex items-start">
                                  <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                  {qualification}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {job.benefits && job.benefits.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Benefits & Perks</h4>
                            <ul className="space-y-2">
                              {job.benefits.map((benefit, index) => (
                                <li key={index} className="text-gray-700 flex items-start">
                                  <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                  {benefit}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3 mt-6">
                      <button
                        onClick={() => toggleJobExpansion(job.id)}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-4 h-4 mr-2" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4 mr-2" />
                            Show More
                          </>
                        )}
                      </button>

                      <Link
                        to={`/jobs/apply/${job.id}`}
                        className="flex items-center px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium transition-colors"
                      >
                        Apply Now
                      </Link>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                      <div className="flex flex-wrap gap-4">
                        <span>Posted: {formatDate(job.postedDate || job.createdAt)}</span>
                        <span>Job ID: #{job.id}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Jobs;