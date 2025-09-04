import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Download, 
  Share2, 
  ChevronLeft,
  ExternalLink,
  Star,
  Eye,
  FileText,
  User,
  Users,
  Globe,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Target,
  Tag,
  Award,
  Building,
  Heart,
  Clock,
  TrendingUp,
  MapPin,
  DollarSign,
  Shield,
  Activity
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { researchProjectsApi, ResearchProject, Investigator } from '../../../services/researchprojectsApi';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ScrollToTop from '../../../components/common/ScrollToTop';

const ResearchProjectDetailsPage = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'team' | 'methodology'>('overview');
  const [project, setProject] = useState<ResearchProject | null>(null);
  const [relatedProjects, setRelatedProjects] = useState<ResearchProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const projectId = id ? parseInt(id) : 0;

  useEffect(() => {
    const fetchProject = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await researchProjectsApi.getById(projectId);
        setProject(data);
        
        // Increment view count
        await researchProjectsApi.incrementView(projectId);
        
        // Fetch related projects based on type or status
        const related = await researchProjectsApi.getAll({
          type: data.type,
          active_only: true
        });
        
        // Filter out current project and limit to 3
        const filteredRelated = related
          .filter(p => p.id !== data.id)
          .slice(0, 3);
        
        setRelatedProjects(filteredRelated);
        
      } catch (err) {
        setError('Failed to load research project details. Please try again later.');
        console.error('Error fetching research project:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const handleShare = async () => {
    if (navigator.share && project) {
      try {
        await navigator.share({
          title: project.title,
          text: project.description,
          url: window.location.href,
        });
      } catch (err) {
        navigator.clipboard.writeText(window.location.href);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Recruiting':
        return 'bg-blue-100 text-blue-800';
      case 'Data Collection':
        return 'bg-yellow-100 text-yellow-800';
      case 'Analysis':
        return 'bg-purple-100 text-purple-800';
      case 'Completed':
        return 'bg-gray-100 text-gray-800';
      case 'Planning':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Clinical Trial':
        return 'text-red-600';
      case 'Observational Study':
        return 'text-blue-600';
      case 'Genetic Research':
        return 'text-purple-600';
      case 'Cohort Study':
        return 'text-green-600';
      case 'Epidemiological Study':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const calculateProgress = () => {
    if (!project) return 0;
    const startDate = new Date(project.startDate);
    const endDate = new Date(project.endDate);
    const currentDate = new Date();
    
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = currentDate.getTime() - startDate.getTime();
    
    return Math.max(0, Math.min(100, Math.round((elapsed / totalDuration) * 100)));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <div className="text-red-600 text-center">
          <h2 className="text-xl font-semibold mb-2">Error Loading Research Project</h2>
          <p>{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div>Research project not found</div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <ScrollToTop />
      
      {/* Back Navigation */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-red-600 hover:text-red-700 font-medium"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Research Projects
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-8 md:py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Project Image */}
            <div className="lg:w-2/5">
              <div className="relative">
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="w-full h-64 lg:h-80 object-cover rounded-lg shadow-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.pexels.com/photos/3985163/pexels-photo-3985163.jpeg?auto=compress&cs=tinysrgb&w=400';
                  }}
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-red-600 text-white px-3 py-1 text-sm font-bold uppercase tracking-wide rounded">
                    {project.type}
                  </span>
                </div>
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <span className={`px-3 py-1 text-sm font-bold rounded ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                  {project.ethicsApproval && (
                    <span className="bg-green-600 text-white px-3 py-1 text-sm font-bold rounded flex items-center gap-1">
                      <Shield className="w-4 h-4" />
                      Ethics Approved
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Project Details */}
            <div className="lg:w-3/5">
              <div className="mb-4">
                <span className={`font-medium text-sm uppercase tracking-wide ${getTypeColor(project.type)}`}>
                  {project.type}
                </span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-4 leading-tight">
                {project.title}
              </h1>

              <p className="text-lg md:text-xl text-gray-600 font-light mb-6">
                {project.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-3">
                  <div className="flex items-center text-gray-700">
                    <User className="w-5 h-5 mr-3 text-red-600" />
                    <div>
                      <div className="font-medium">Principal Investigator</div>
                      <div className="text-sm text-gray-600">{project.principalInvestigator}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-700">
                    <Calendar className="w-5 h-5 mr-3 text-red-600" />
                    <div>
                      <div className="font-medium">{formatDate(project.startDate)} - {formatDate(project.endDate)}</div>
                      <div className="text-sm text-gray-600">Project Duration</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-700">
                    <MapPin className="w-5 h-5 mr-3 text-red-600" />
                    <div>
                      <div className="font-medium">{project.institutions.join(', ')}</div>
                      <div className="text-sm text-gray-600">Participating Institutions</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-lg font-bold text-red-600">{project.investigators.length}</div>
                    <div className="text-xs text-gray-600">Investigators</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-lg font-bold text-red-600">{project.sampleSize || 'TBD'}</div>
                    <div className="text-xs text-gray-600">Sample Size</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-lg font-bold text-red-600">{calculateProgress()}%</div>
                    <div className="text-xs text-gray-600">Progress</div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Project Progress</span>
                  <span className="text-sm text-gray-600">{calculateProgress()}% Complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${calculateProgress()}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  className="bg-orange-600 text-white px-6 py-3 rounded font-bold hover:bg-orange-700 transition-colors uppercase tracking-wide flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
                
                <div className="flex gap-2">
                  <button 
                    onClick={handleShare}
                    className="border border-red-600 text-red-600 px-4 py-3 rounded hover:bg-red-50 transition-colors flex items-center"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </button>
                  <button className="border border-red-600 text-red-600 px-4 py-3 rounded hover:bg-red-50 transition-colors flex items-center">
                    <Heart className="w-4 h-4 mr-2" />
                    Save
                  </button>
                  <button className="border border-red-600 text-red-600 px-4 py-3 rounded hover:bg-red-50 transition-colors flex items-center">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex space-x-8">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'details', label: 'Project Details' },
              { key: 'team', label: 'Research Team' },
              { key: 'methodology', label: 'Methodology' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.key
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </section>

      {/* Tab Content */}
      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* Project Description */}
                <div>
                  <h2 className="text-2xl font-light text-gray-900 mb-4">Project Description</h2>
                  <div className="prose max-w-none">
                    <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                      {project.description}
                    </p>
                  </div>
                </div>

                {/* Research Objectives */}
                {project.objectives && project.objectives.length > 0 && (
                  <div>
                    <h3 className="text-xl font-light text-gray-900 mb-4 flex items-center">
                      <Target className="w-6 h-6 mr-2 text-red-600" />
                      Research Objectives
                    </h3>
                    <ul className="space-y-2">
                      {project.objectives.map((objective, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="w-5 h-5 mr-3 mt-0.5 text-green-600 flex-shrink-0" />
                          <span className="text-gray-700">{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Target Population */}
                {project.targetPopulation && (
                  <div>
                    <h3 className="text-xl font-light text-gray-900 mb-4 flex items-center">
                      <Users className="w-6 h-6 mr-2 text-red-600" />
                      Target Population
                    </h3>
                    <p className="text-gray-600 bg-blue-50 p-4 rounded-lg">
                      {project.targetPopulation}
                    </p>
                  </div>
                )}

                {/* Keywords */}
                {project.keywords && project.keywords.length > 0 && (
                  <div>
                    <h3 className="text-xl font-light text-gray-900 mb-4">Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {project.keywords.map((keyword, index) => (
                        <span key={index} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          <Tag className="w-3 h-3" />
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Project Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-lg font-light text-gray-900 mb-3">Project Information</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">{project.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-medium px-2 py-1 rounded text-xs ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ethics Approval:</span>
                      <span className={`font-medium ${project.ethicsApproval ? 'text-green-600' : 'text-red-600'}`}>
                        {project.ethicsApproval ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                    {project.registrationNumber && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Registration:</span>
                        <span className="font-medium">{project.registrationNumber}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Funding Information */}
                {(project.fundingSource || project.fundingAmount) && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-light text-gray-900 mb-3 flex items-center">
                      <DollarSign className="w-4 h-4 mr-2 text-red-600" />
                      Funding Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      {project.fundingSource && (
                        <div><span className="font-medium">Source:</span> {project.fundingSource}</div>
                      )}
                      {project.fundingAmount && (
                        <div><span className="font-medium">Amount:</span> {project.fundingAmount}</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Timeline */}
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="text-lg font-light text-gray-900 mb-3">Timeline</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-red-600" />
                      <span className="text-gray-600">Started:</span>
                      <span className="font-medium ml-1">{formatDate(project.startDate)}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-red-600" />
                      <span className="text-gray-600">Expected End:</span>
                      <span className="font-medium ml-1">{formatDate(project.endDate)}</span>
                    </div>
                    {project.durationDays && (
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-red-600" />
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium ml-1">{Math.round(project.durationDays / 365 * 10) / 10} years</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-4">
                  Technical Details & Specifications
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Comprehensive information about this research project including technical specifications and methodology.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Project Specifications */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-red-600" />
                    Project Specifications
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">{project.type}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium">{project.status}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Sample Size:</span>
                      <span className="font-medium">{project.sampleSize || 'TBD'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Ethics Approval:</span>
                      <span className={`font-medium ${project.ethicsApproval ? 'text-green-600' : 'text-red-600'}`}>
                        {project.ethicsApproval ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Institutions:</span>
                      <span className="font-medium">{project.institutions.length}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Investigators:</span>
                      <span className="font-medium">{project.investigators.length}</span>
                    </div>
                  </div>
                </div>

                {/* Project Timeline */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-red-600" />
                    Project Timeline
                  </h3>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{formatDate(project.startDate)}</div>
                      <div className="text-sm text-blue-800">Project Start</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{calculateProgress()}%</div>
                      <div className="text-sm text-green-800">Current Progress</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{formatDate(project.endDate)}</div>
                      <div className="text-sm text-yellow-800">Expected Completion</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Methodology Overview */}
              {project.methodology && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Methodology Overview</h3>
                  <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                    {project.methodology}
                  </p>
                </div>
              )}

              {/* Additional Information */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Project Information</h4>
                    <div className="space-y-1">
                      <div>Created: {project.createdAt}</div>
                      <div>Last Updated: {project.updatedAt}</div>
                      {project.registrationNumber && (
                        <div>Registration: {project.registrationNumber}</div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Identifiers</h4>
                    <div className="space-y-1">
                      <div>Project ID: {project.id}</div>
                      <div>Status: <span className={`font-medium px-2 py-1 rounded text-xs ${getStatusColor(project.status)}`}>{project.status}</span></div>
                      <div>Active: <span className="font-medium text-green-600">{project.isActive ? 'Yes' : 'No'}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-4">
                  Research Team
                </h2>
                <p className="text-gray-600">
                  Meet the dedicated researchers and investigators working on this project.
                </p>
              </div>

              {/* Principal Investigator */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Principal Investigator</h3>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-gray-900 mb-2">{project.principalInvestigator}</h4>
                      <p className="text-red-600 font-medium text-sm mb-1">Principal Investigator</p>
                      <p className="text-gray-600 mb-3">Leading this research initiative with extensive expertise in the field.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Research Team Members */}
              {project.investigators && project.investigators.length > 0 ? (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Research Team Members</h3>
                  <div className="space-y-6">
                    {project.investigators.map((investigator: Investigator, index: number) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start gap-6">
                          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-8 h-8 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-xl font-bold text-gray-900 mb-2">{investigator.name}</h4>
                            <p className="text-red-600 font-medium text-sm mb-1">{investigator.role}</p>
                            <p className="text-gray-600 mb-3">{investigator.affiliation}</p>
                            {investigator.email && (
                              <a 
                                href={`mailto:${investigator.email}`}
                                className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1"
                              >
                                <User className="w-4 h-4" />
                                {investigator.email}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Research team information not available.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'methodology' && (
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-4">
                  Research Methodology
                </h2>
                <p className="text-gray-600">
                  Detailed methodology and approach being used in this research project.
                </p>
              </div>

              {/* Methodology Description */}
              {project.methodology ? (
                <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-red-600" />
                    Methodology Description
                  </h3>
                  <div className="prose max-w-none">
                    <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                      {project.methodology}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg mb-8">
                  <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Detailed methodology information will be available soon.</p>
                </div>
              )}

              {/* Study Design Specs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Study Parameters */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Study Parameters</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Study Type:</span>
                      <span className="font-medium">{project.type}</span>
                    </div>
                    {project.sampleSize && (
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-gray-600">Sample Size:</span>
                        <span className="font-medium">{project.sampleSize}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Target Population:</span>
                      <span className="font-medium">{project.targetPopulation || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Ethics Approval:</span>
                      <span className={`font-medium ${project.ethicsApproval ? 'text-green-600' : 'text-red-600'}`}>
                        {project.ethicsApproval ? 'Obtained' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Research Objectives */}
                {project.objectives && project.objectives.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Target className="w-5 h-5 mr-2 text-red-600" />
                      Research Objectives
                    </h3>
                    <ul className="space-y-2">
                      {project.objectives.map((objective, index) => (
                        <li key={index} className="flex items-start text-sm">
                          <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                          <span className="text-gray-700">{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Related Projects */}
{relatedProjects.length > 0 && (
  <section className="py-16 bg-gray-50">
    <div className="max-w-6xl mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-4">
          Related Research Projects
        </h2>
        <p className="text-gray-600">
          Other active research projects in {project.type} that might interest you.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {relatedProjects.map((relatedProject) => (
          <div 
            key={relatedProject.id} 
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 border border-gray-200 cursor-pointer"
            onClick={() => navigate(`/research-projects/${relatedProject.id}`)}
          >
            <div className="relative">
              <img
                src={relatedProject.imageUrl}
                alt={relatedProject.title}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.pexels.com/photos/3985163/pexels-photo-3985163.jpeg?auto=compress&cs=tinysrgb&w=400';
                }}
              />
              <div className="absolute top-3 left-3">
                <span className="bg-red-600 text-white px-2 py-1 text-xs font-bold uppercase tracking-wide rounded">
                  {relatedProject.type}
                </span>
              </div>
              <div className="absolute top-3 right-3">
                <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(relatedProject.status)}`}>
                  {relatedProject.status}
                </span>
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                {relatedProject.title}
              </h3>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {relatedProject.description}
              </p>
              
              <div className="flex items-center text-gray-600 text-sm mb-3">
                <User className="w-4 h-4 mr-1" />
                <span>{relatedProject.principalInvestigator}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600 text-sm">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>{formatDate(relatedProject.startDate)}</span>
                </div>
                
                <span className="text-red-600 font-medium text-sm hover:text-red-700">
                  View Project →
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    </section>
    )}
  </div>
  );
};

export default ResearchProjectDetailsPage;