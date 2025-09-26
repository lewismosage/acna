import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Briefcase,
  Users,
  Building2,
  Loader,
  AlertCircle,
  ArrowLeft,
  Clock,
  DollarSign,
  CheckCircle,
  FileText,
  Award,
  Heart,
  Share2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import {
  careersApi,
  JobOpportunity,
  JobType
} from '../../services/careersAPI';
import ScrollToTop from '../../components/common/ScrollToTop';

interface JobDetailPageProps {}

const JobDetail: React.FC<JobDetailPageProps> = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobOpportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedJobs, setRelatedJobs] = useState<JobOpportunity[]>([]);

  useEffect(() => {
    if (id) {
      fetchJob(parseInt(id));
      fetchRelatedJobs(parseInt(id));
    }
  }, [id]);

  const fetchJob = async (jobId: number) => {
    try {
      setLoading(true);
      setError(null);
      const jobData = await careersApi.getJobById(jobId);
      setJob(jobData);
    } catch (err) {
      console.error('Error fetching job:', err);
      setError('Failed to load job details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedJobs = async (currentJobId: number) => {
    try {
      const jobsData = await careersApi.getAllJobs({ status: 'Active' });
      // Get jobs from the same department or similar type, excluding current job
      const related = jobsData
        .filter(j => j.id !== currentJobId)
        .slice(0, 3); // Limit to 3 related jobs
      setRelatedJobs(related);
    } catch (err) {
      console.error('Error fetching related jobs:', err);
    }
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
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getDaysUntilClosing = (dateString: string): number | null => {
    if (!dateString) return null;
    try {
      const closingDate = new Date(dateString);
      const today = new Date();
      const timeDiff = closingDate.getTime() - today.getTime();
      return Math.ceil(timeDiff / (1000 * 3600 * 24));
    } catch {
      return null;
    }
  };

  const handleShare = async () => {
    if (navigator.share && job) {
      try {
        await navigator.share({
          title: job.title,
          text: `Check out this job opportunity: ${job.title} at ACNA`,
          url: window.location.href,
        });
      } catch (err) {
        // Fallback to copying to clipboard
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    // You could show a toast notification here
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Job Not Found</h2>
          <p className="text-gray-600 mb-4">
            {error || 'The job you are looking for does not exist or has been removed.'}
          </p>
          <button
            onClick={() => navigate('/careers/jobs')}
            className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Browse All Jobs
          </button>
        </div>
      </div>
    );
  }

  const daysUntilClosing = getDaysUntilClosing(job.closingDate);
  const isUrgent = daysUntilClosing !== null && daysUntilClosing <= 7;
  const isExpired = daysUntilClosing !== null && daysUntilClosing < 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <ScrollToTop />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center mb-4">
            <button
              onClick={() => navigate('/careers/jobs')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Jobs
            </button>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              {/* Job Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getJobTypeColor(job.type)}`}>
                  {job.type}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200">
                  {job.level}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200">
                  {job.workArrangement}
                </span>
                {isUrgent && !isExpired && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-200 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Closing Soon
                  </span>
                )}
                {isExpired && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200">
                    Application Closed
                  </span>
                )}
              </div>

              {/* Job Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {job.title}
              </h1>

              {/* Key Job Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <Building2 className="w-5 h-5 mr-3 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{job.department}</p>
                    <p className="text-xs">Department</p>
                  </div>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-5 h-5 mr-3 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{job.location}</p>
                    <p className="text-xs">Location</p>
                  </div>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-5 h-5 mr-3 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {daysUntilClosing !== null && !isExpired ? 
                        `${daysUntilClosing} days left` : 
                        isExpired ? 'Closed' : 'Open'
                      }
                    </p>
                    <p className="text-xs">Application</p>
                  </div>
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="w-5 h-5 mr-3 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{job.applicationsCount || 0}</p>
                    <p className="text-xs">Applicants</p>
                  </div>
                </div>
              </div>

              {/* Salary */}
              {job.salary && (
                <div className="flex items-center mb-6">
                  <DollarSign className="w-5 h-5 mr-2 text-orange-600" />
                  <span className="text-xl font-semibold text-gray-900">{job.salary}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:w-64">
              {!isExpired ? (
                <Link
                  to={`/careers/jobs/apply/${job.id}`}
                  className="flex items-center justify-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  <Briefcase className="w-5 h-5 mr-2" />
                  Apply Now
                </Link>
              ) : (
                <button
                  disabled
                  className="flex items-center justify-center px-6 py-3 bg-gray-400 text-white rounded-lg cursor-not-allowed font-medium"
                >
                  Applications Closed
                </button>
              )}
              
              <button
                onClick={handleShare}
                className="flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Share Job
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-orange-600" />
                Job Description
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {job.description}
                </p>
              </div>
            </div>

            {/* Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-orange-600" />
                  Key Responsibilities
                </h2>
                <ul className="space-y-3">
                  {job.responsibilities.map((responsibility, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-gray-700">{responsibility}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-orange-600" />
                  Requirements
                </h2>
                <ul className="space-y-3">
                  {job.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-gray-700">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Qualifications */}
            {job.qualifications && job.qualifications.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-orange-600" />
                  Preferred Qualifications
                </h2>
                <ul className="space-y-3">
                  {job.qualifications.map((qualification, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-gray-700">{qualification}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-orange-600" />
                  Benefits & Perks
                </h2>
                <ul className="space-y-3">
                  {job.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Job Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Job Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Job Type:</span>
                  <span className="font-medium text-gray-900">{job.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Experience Level:</span>
                  <span className="font-medium text-gray-900">{job.level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Work Arrangement:</span>
                  <span className="font-medium text-gray-900">{job.workArrangement}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Department:</span>
                  <span className="font-medium text-gray-900">{job.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium text-gray-900">{job.location}</span>
                </div>
                {job.contractDuration && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium text-gray-900">{job.contractDuration}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Posted:</span>
                  <span className="font-medium text-gray-900">
                    {formatDate(job.postedDate || job.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Closing Date:</span>
                  <span className="font-medium text-gray-900">
                    {formatDate(job.closingDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Job ID:</span>
                  <span className="font-medium text-gray-900">#{job.id}</span>
                </div>
              </div>
            </div>

            {/* Apply CTA */}
            {!isExpired && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Ready to Apply?</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Join our mission to transform child health across Africa. Your skills and passion can make a real difference.
                </p>
                <Link
                  to={`/careers/jobs/apply/${job.id}`}
                  className="block w-full text-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  Apply for This Position
                </Link>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {daysUntilClosing !== null ? 
                    `Application closes in ${daysUntilClosing} days` : 
                    'No application deadline'
                  }
                </p>
              </div>
            )}

            {/* Related Jobs */}
            {relatedJobs.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Similar Positions</h3>
                <div className="space-y-4">
                  {relatedJobs.map((relatedJob) => (
                    <Link
                      key={relatedJob.id}
                      to={`/careers/jobs/${relatedJob.id}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:border-orange-200 hover:bg-orange-50 transition-all group"
                    >
                      <h4 className="font-medium text-gray-900 group-hover:text-orange-600 transition-colors mb-2 line-clamp-2">
                        {relatedJob.title}
                      </h4>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{relatedJob.department}</span>
                        <ChevronRight className="w-4 h-4 group-hover:text-orange-600" />
                      </div>
                    </Link>
                  ))}
                </div>
                <Link
                  to="/careers/jobs"
                  className="block mt-4 text-center text-orange-600 hover:text-orange-700 font-medium text-sm"
                >
                  View All Jobs
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;