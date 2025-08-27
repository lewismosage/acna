import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  Download, 
  Share2, 
  ChevronLeft,
  ExternalLink,
  Star,
  Eye,
  FileText,
  Play,
  Headphones,
  Globe,
  BookOpen,
  CheckCircle,
  AlertCircle,
  User,
  Languages,
  Target,
  Award,
  Heart,
  Tag
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientCareApi } from '../../services/patientCareApi';
import { PatientResource } from '../admin/resources/patientcare/patientCare';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ScrollToTop from '../../components/common/ScrollToTop';

const PatientCareDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'reviews'>('overview');
  const [resource, setResource] = useState<PatientResource | null>(null);
  const [relatedResources, setRelatedResources] = useState<PatientResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchResource = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await patientCareApi.getById(parseInt(id));
        setResource(data);
        
        // Increment view count
        await patientCareApi.incrementView(parseInt(id));
        
        // Fetch related resources
        const related = await patientCareApi.getAll({
          category: data.category,
          status: 'Published'
        });
        
        // Filter out current resource and limit to 3
        const filteredRelated = related
          .filter(r => r.id !== data.id)
          .slice(0, 3);
        
        setRelatedResources(filteredRelated);
        
      } catch (err) {
        setError('Failed to load resource details. Please try again later.');
        console.error('Error fetching resource:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResource();
  }, [id]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Guide': return <FileText className="w-5 h-5" />;
      case 'Video': return <Play className="w-5 h-5" />;
      case 'Audio': return <Headphones className="w-5 h-5" />;
      case 'App': return <Globe className="w-5 h-5" />;
      case 'Website': return <ExternalLink className="w-5 h-5" />;
      case 'Checklist': return <BookOpen className="w-5 h-5" />;
      case 'Infographic': return <BookOpen className="w-5 h-5" />;
      case 'Handbook': return <BookOpen className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownload = async () => {
    if (!resource) return;
    
    setIsDownloading(true);
    
    try {
      await patientCareApi.incrementDownload(resource.id);
      
      const url = resource.type === 'App' || resource.type === 'Website' 
        ? resource.externalUrl 
        : resource.fileUrl;
      
      if (url) {
        window.open(url, '_blank');
      }
    } catch (err) {
      console.error('Error handling download:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: resource?.title,
          text: resource?.description,
          url: window.location.href,
        });
      } catch (err) {
        // Fallback to copying URL
        navigator.clipboard.writeText(window.location.href);
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating})</span>
      </div>
    );
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
          <h2 className="text-xl font-semibold mb-2">Error Loading Resource</h2>
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

  if (!resource) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div>Resource not found</div>
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
            Back to Resources
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-8 md:py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Resource Image */}
            <div className="lg:w-2/5">
              <div className="relative">
                <img
                  src={resource.imageUrl || '/api/placeholder/400/250'}
                  alt={resource.title}
                  className="w-full h-64 lg:h-80 object-cover rounded-lg shadow-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/api/placeholder/400/250';
                  }}
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-red-600 text-white px-3 py-1 text-sm font-bold uppercase tracking-wide rounded flex items-center gap-2">
                    {getTypeIcon(resource.type)}
                    {resource.type}
                  </span>
                </div>
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  {resource.isFeatured && (
                    <span className="bg-orange-600 text-white px-3 py-1 text-sm font-bold rounded flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      Featured
                    </span>
                  )}
                  {resource.isFree && (
                    <span className="bg-green-600 text-white px-3 py-1 text-sm font-bold rounded">
                      FREE
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Resource Details */}
            <div className="lg:w-3/5">
              <div className="mb-4">
                <span className="text-red-600 font-medium text-sm uppercase tracking-wide">
                  {resource.category}
                </span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-4 leading-tight">
                {resource.title}
              </h1>

              <p className="text-lg md:text-xl text-gray-600 font-light mb-6">
                {resource.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-3">
                  <div className="flex items-center text-gray-700">
                    <Target className="w-5 h-5 mr-3 text-red-600" />
                    <span className="font-medium">{resource.condition}</span>
                  </div>
                  
                  {resource.author && (
                    <div className="flex items-center text-gray-700">
                      <User className="w-5 h-5 mr-3 text-red-600" />
                      <span className="font-medium">{resource.author}</span>
                    </div>
                  )}
                  
                  {resource.ageGroup && (
                    <div className="flex items-center text-gray-700">
                      <Users className="w-5 h-5 mr-3 text-red-600" />
                      <span className="font-medium">{resource.ageGroup}</span>
                    </div>
                  )}

                  {resource.duration && (
                    <div className="flex items-center text-gray-700">
                      <Clock className="w-5 h-5 mr-3 text-red-600" />
                      <span className="font-medium">{resource.duration}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-lg font-bold text-red-600">{resource.downloadCount.toLocaleString()}</div>
                    <div className="text-xs text-gray-600">Downloads</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-lg font-bold text-red-600">{resource.viewCount.toLocaleString()}</div>
                    <div className="text-xs text-gray-600">Views</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-lg font-bold text-red-600">{resource.rating || 'N/A'}</div>
                    <div className="text-xs text-gray-600">Rating</div>
                  </div>
                </div>
              </div>

              {/* Rating */}
              {resource.rating && (
                <div className="mb-6">
                  {renderStars(resource.rating)}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className={`bg-orange-600 text-white px-6 py-3 rounded font-bold hover:bg-orange-700 transition-colors uppercase tracking-wide flex items-center justify-center gap-2 ${
                    isDownloading ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  <Download className="w-4 h-4" />
                  {isDownloading ? 'Processing...' : (resource.type === 'App' || resource.type === 'Website' ? 'Visit Resource' : 'Download Resource')}
                </button>
                
                <div className="flex gap-2">
                  <button 
                    onClick={handleShare}
                    className="border border-red-600 text-red-600 px-4 py-3 rounded hover:bg-red-50 transition-colors flex items-center"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </button>
                  <button 
                    onClick={() => setResource(prev => prev ? {...prev, viewCount: prev.viewCount + 1} : null)}
                    className="border border-red-600 text-red-600 px-4 py-3 rounded hover:bg-red-50 transition-colors flex items-center"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Save
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
              { key: 'details', label: 'Details' },
              { key: 'reviews', label: 'Reviews & Feedback' }
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
                {/* Full Description */}
                {resource.full_description && (
                  <div>
                    <h2 className="text-2xl font-light text-gray-900 mb-4">About This Resource</h2>
                    <div className="prose max-w-none">
                      <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                        {resource.full_description}
                      </p>
                    </div>
                  </div>
                )}

                {/* Tags */}
                {resource.tags && resource.tags.length > 0 && (
                  <div>
                    <h3 className="text-xl font-light text-gray-900 mb-4">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {resource.tags.map((tag, index) => (
                        <span key={index} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Target Audience */}
                {resource.targetAudience && resource.targetAudience.length > 0 && (
                  <div>
                    <h3 className="text-xl font-light text-gray-900 mb-4">Target Audience</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {resource.targetAudience.map((audience, index) => (
                        <div key={index} className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{audience}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Resource Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-lg font-light text-gray-900 mb-3">Resource Information</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">{resource.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Difficulty:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(resource.difficulty)}`}>
                        {resource.difficulty}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium text-green-600">{resource.status}</span>
                    </div>
                    {resource.duration && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">{resource.duration}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Languages */}
                {resource.language && resource.language.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-light text-gray-900 mb-3 flex items-center">
                      <Languages className="w-4 h-4 mr-2 text-red-600" />
                      Available Languages
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {resource.language.map((lang, index) => (
                        <span key={index} className="bg-white border border-gray-200 px-2 py-1 rounded text-sm">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Publication Info */}
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="text-lg font-light text-gray-900 mb-3">Publication Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-red-600" />
                      <span className="text-gray-600">Published:</span>
                      <span className="font-medium ml-1">{resource.createdAt}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-red-600" />
                      <span className="text-gray-600">Updated:</span>
                      <span className="font-medium ml-1">{resource.updatedAt}</span>
                    </div>
                    {resource.lastReviewDate && (
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-2 text-red-600" />
                        <span className="text-gray-600">Last Review:</span>
                        <span className="font-medium ml-1">{resource.lastReviewDate}</span>
                      </div>
                    )}
                    {resource.reviewedBy && (
                      <div className="flex items-center">
                        <Award className="w-4 h-4 mr-2 text-red-600" />
                        <span className="text-gray-600">Reviewed by:</span>
                        <span className="font-medium ml-1">{resource.reviewedBy}</span>
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
                  Comprehensive information about this resource including technical specifications and usage guidelines.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Resource Specifications */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-red-600" />
                    Resource Specifications
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Resource Type:</span>
                      <span className="font-medium">{resource.type}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium">{resource.category}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Condition Focus:</span>
                      <span className="font-medium">{resource.condition}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Difficulty Level:</span>
                      <span className="font-medium">{resource.difficulty}</span>
                    </div>
                    {resource.ageGroup && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Age Group:</span>
                        <span className="font-medium">{resource.ageGroup}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Free Resource:</span>
                      <span className={`font-medium ${resource.isFree ? 'text-green-600' : 'text-red-600'}`}>
                        {resource.isFree ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Usage Statistics */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Eye className="w-5 h-5 mr-2 text-red-600" />
                    Usage Statistics
                  </h3>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{resource.viewCount.toLocaleString()}</div>
                      <div className="text-sm text-blue-800">Total Views</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{resource.downloadCount.toLocaleString()}</div>
                      <div className="text-sm text-green-800">Downloads</div>
                    </div>
                    {resource.rating && (
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">{resource.rating}/5</div>
                        <div className="text-sm text-yellow-800">User Rating</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Content Information</h4>
                    <div className="space-y-1">
                      <div>Created: {resource.createdAt}</div>
                      <div>Last Updated: {resource.updatedAt}</div>
                      {resource.lastReviewDate && <div>Last Reviewed: {resource.lastReviewDate}</div>}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Quality Assurance</h4>
                    <div className="space-y-1">
                      {resource.author && <div>Author: {resource.author}</div>}
                      {resource.reviewedBy && <div>Reviewed by: {resource.reviewedBy}</div>}
                      <div>Status: <span className="text-green-600 font-medium">{resource.status}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-4">
                  Reviews & Feedback
                </h2>
                <p className="text-gray-600">
                  See what others are saying about this resource.
                </p>
              </div>
              
              {/* Rating Summary */}
              {resource.rating && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
                  <div className="flex items-center justify-center mb-4">
                    <div className="text-center mr-8">
                      <div className="text-4xl font-bold text-gray-900">{resource.rating}</div>
                      <div className="text-sm text-gray-600">out of 5</div>
                    </div>
                    <div>
                      {renderStars(resource.rating)}
                      <div className="text-sm text-gray-600 mt-1">Based on user feedback</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Reviews Placeholder */}
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Star className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">
                  User reviews and feedback will be available soon.
                  <br />
                  Help us improve by providing your feedback after using this resource.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Related Resources */}
      {relatedResources.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-4">
                Related Resources
              </h2>
              <p className="text-gray-600">
                Other resources in the {resource.category} category that might interest you.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedResources.map((relatedResource) => (
                <div 
                  key={relatedResource.id} 
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 border border-gray-200 cursor-pointer"
                  onClick={() => navigate(`/patient-care-resources/${relatedResource.id}`)}
                >
                  <div className="relative">
                    <img
                      src={relatedResource.imageUrl || '/api/placeholder/400/250'}
                      alt={relatedResource.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-red-600 text-white px-2 py-1 text-xs font-bold uppercase tracking-wide rounded flex items-center gap-1">
                        {getTypeIcon(relatedResource.type)}
                        {relatedResource.type}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{relatedResource.title}</h3>
                    <div className="flex items-center text-gray-600 text-sm mb-3">
                      <span>{relatedResource.category}</span>
                      <span className="mx-2">•</span>
                      <span>{relatedResource.condition}</span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{relatedResource.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center text-gray-600 text-sm">
                          <Download className="w-4 h-4 mr-1" />
                          {relatedResource.downloadCount.toLocaleString()}
                          <span className="mx-2">•</span>
                          <Eye className="w-4 h-4 mr-1" />
                          {relatedResource.viewCount.toLocaleString()}
                        </div>
                      </div>
                      
                      <span className="text-red-600 font-medium text-sm hover:text-red-700">
                        View Resource →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className="py-16 bg-red-600">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Need More Support?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Explore our comprehensive collection of patient and caregiver resources, 
            or connect with support groups in your area.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/patient-care-resources')}
              className="bg-white text-red-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
            >
              Browse All Resources
            </button>
            <button 
              onClick={() => navigate('/patient-care-resources#support')}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white hover:text-red-600 transition-colors"
            >
              Find Support Groups
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PatientCareDetail;