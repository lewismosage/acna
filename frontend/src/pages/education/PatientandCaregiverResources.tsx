import React, { useState, useEffect, } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Phone, MessageCircle, Download, Users, Mail, BookOpen, AlertCircle, Clock, Search, Filter, Star, ExternalLink, Play, FileText, Globe, Headphones } from 'lucide-react';
import { patientCareApi } from '../../services/patientCareApi';
import { PatientResource } from '../admin/esources/patientcareresources/patientCare'; 
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../services/api';

interface SubscriptionStatus {
  type: 'success' | 'error';
  message: string;
}

interface SupportGroup {
  id: number;
  name: string;
  condition: string;
  location: string;
  meetingType: 'In-Person' | 'Virtual' | 'Hybrid';
  schedule: string;
  contact: string;
  members: string;
  description: string;
  languages: string[];
}

interface EmergencyResource {
  id: number;
  title: string;
  description: string;
  phoneNumber: string;
  availability: string;
  coverage: string;
  icon: React.ReactNode;
}

const PatientCaregiverResources = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'resources' | 'support' | 'emergency'>('resources');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  
  // New state for API data
  const [resources, setResources] = useState<PatientResource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [conditions, setConditions] = useState<string[]>([]);

  // Load data on component mount
  useEffect(() => {
    loadResourcesData();
    loadMetadata();
  }, []);

  const loadResourcesData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch only published resources for public view
      const fetchedResources = await patientCareApi.getAll({
        status: 'Published'
      });
      
      setResources(fetchedResources);
    } catch (err) {
      console.error('Error loading resources:', err);
      setError('Failed to load resources. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const loadMetadata = async () => {
    try {
      const [categoriesData, conditionsData] = await Promise.all([
        patientCareApi.getCategories(),
        patientCareApi.getConditions()
      ]);
      
      setCategories(['all', ...categoriesData]);
      setConditions(['all', ...conditionsData]);
    } catch (err) {
      console.error('Error loading metadata:', err);
      // Use fallback values
      setCategories(['all', 'Educational Guides', 'Therapy & Exercise', 'Assessment Tools', 'Emergency Care', 'Nutrition & Diet', 'Education Support', 'Medication Management', 'Inspiration & Stories']);
      setConditions(['all', 'Epilepsy', 'Cerebral Palsy', 'Developmental Delays', 'Autism Spectrum Disorders', 'All Conditions', 'Rare Conditions']);
    }
  };

  // Handle resource interactions
  const handleResourceView = async (resourceId: number) => {
    try {
      await patientCareApi.incrementView(resourceId);
      // Update local state to reflect the view count increment
      setResources(prev => 
        prev.map(resource => 
          resource.id === resourceId 
            ? { ...resource, viewCount: resource.viewCount + 1 }
            : resource
        )
      );
    } catch (err) {
      console.error('Error incrementing view count:', err);
    }
  };

  const handleResourceDownload = async (resourceId: number, url?: string) => {
    try {
      await patientCareApi.incrementDownload(resourceId);
      // Update local state to reflect the download count increment
      setResources(prev => 
        prev.map(resource => 
          resource.id === resourceId 
            ? { ...resource, downloadCount: resource.downloadCount + 1 }
            : resource
        )
      );
      
      // Open the download/external URL
      if (url) {
        window.open(url, '_blank');
      }
    } catch (err) {
      console.error('Error incrementing download count:', err);
      // Still allow the download even if tracking fails
      if (url) {
        window.open(url, '_blank');
      }
    }
  };

  // Support groups data (keeping as static for now)
  const supportGroups: SupportGroup[] = [
    {
      id: 1,
      name: "Kenya Epilepsy Support Network",
      condition: "Epilepsy",
      location: "Nairobi, Kenya",
      meetingType: "Hybrid",
      schedule: "Every 2nd Saturday, 2:00 PM",
      contact: "+254-700-123-456",
      members: "150+ families",
      description: "Support group for families dealing with childhood epilepsy, offering emotional support, practical advice, and advocacy training.",
      languages: ["English", "Swahili"]
    },
    // Add more support groups as needed
  ];

  // Emergency resources data (keeping as static for now)
  const emergencyResources: EmergencyResource[] = [
    {
      id: 1,
      title: "24/7 Neurological Emergency Hotline",
      description: "Immediate consultation with pediatric neurologists for urgent situations",
      phoneNumber: "+254-20-NEURO-1 (638761)",
      availability: "24/7",
      coverage: "East Africa",
      icon: <Phone className="w-6 h-6" />
    },
    // Add more emergency resources as needed
  ];

  const filteredResources = resources.filter(resource => {
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesCondition = selectedCondition === 'all' || resource.condition === selectedCondition;
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesCondition && matchesSearch;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Guide': return <FileText className="w-4 h-4" />;
      case 'Video': return <Play className="w-4 h-4" />;
      case 'Audio': return <Headphones className="w-4 h-4" />;
      case 'App': return <Globe className="w-4 h-4" />;
      case 'Website': return <ExternalLink className="w-4 h-4" />;
      case 'Checklist': return <BookOpen className="w-4 h-4" />;
      case 'Infographic': return <BookOpen className="w-4 h-4" />;
      case 'Handbook': return <BookOpen className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubscriptionStatus(null);

    try {
      const response = await api.post('/newsletter/subscribe/', {
        email,
        first_name: firstName,
        last_name: lastName,
        source: 'patient_care'
      });

      setSubscriptionStatus({
        type: 'success',
        message: 'Thank you for subscribing to our newsletter!'
      });
      setEmail('');
      setFirstName('');
      setLastName('');
    } catch (error: unknown) {
      let errorMessage = 'Failed to subscribe. Please try again later.';
      
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as { response?: { status?: number, data?: any } };
        if (axiosError.response?.status === 400 && axiosError.response.data?.email) {
          errorMessage = axiosError.response.data.email[0];
        } else if (axiosError.response?.data?.detail) {
          errorMessage = axiosError.response.data.detail;
        }
      }

      setSubscriptionStatus({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
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

  const getResourceUrl = (resource: PatientResource) => {
    if (resource.type === 'App' || resource.type === 'Website') {
      return resource.externalUrl;
    }
    return resource.fileUrl;
  };

  const handleResourceClick = async (resource: PatientResource) => {
    await handleResourceView(resource.id);
    
    const url = getResourceUrl(resource);
    if (url) {
      await handleResourceDownload(resource.id, url);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-6">Patient & Caregiver Resources</h1>
          <p className="text-xl md:text-2xl text-gray-700 font-light max-w-3xl mx-auto mb-8">
            Comprehensive support and practical resources for families navigating pediatric neurological conditions across Africa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-gray-600">
            <div className="flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-red-600" />
              <span>{resources.length} Resources Available</span>
            </div>
            <div className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-red-600" />
              <span>{supportGroups.length} Support Groups</span>
            </div>
            <div className="flex items-center">
              <Phone className="w-5 h-5 mr-2 text-red-600" />
              <span>24/7 Emergency Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-center">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('resources')}
                className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                  activeTab === 'resources'
                    ? 'bg-white text-red-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Resources & Guides
              </button>
              <button
                onClick={() => setActiveTab('support')}
                className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                  activeTab === 'support'
                    ? 'bg-white text-red-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Support Groups
              </button>
              <button
                onClick={() => setActiveTab('emergency')}
                className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                  activeTab === 'emergency'
                    ? 'bg-white text-red-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Emergency Support
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        {activeTab === 'resources' && (
          <div>
            {/* Search and Filter */}
            <div className="mb-12 bg-gray-50 p-6 rounded-lg">
              <div className="flex flex-col lg:flex-row gap-4 items-center">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search resources..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-600" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category === 'all' ? 'All Categories' : category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <select
                    value={selectedCondition}
                    onChange={(e) => setSelectedCondition(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  >
                    {conditions.map(condition => (
                      <option key={condition} value={condition}>
                        {condition === 'all' ? 'All Conditions' : condition}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <LoadingSpinner />
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={loadResourcesData}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Resources Grid */}
            {!loading && !error && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredResources.length > 0 ? (
                  filteredResources.map((resource) => (
                    <div key={resource.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 border border-gray-200">
                      <div className="relative">
                        <img
                          src={resource.imageUrl || '/api/placeholder/400/250'}
                          alt={resource.title}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/api/placeholder/400/250';
                          }}
                        />
                        <div className="absolute top-3 left-3">
                          <span className="bg-red-600 text-white px-2 py-1 text-xs font-bold uppercase tracking-wide rounded flex items-center gap-1">
                            {getTypeIcon(resource.type)}
                            {resource.type}
                          </span>
                        </div>
                        {resource.isFree && (
                          <div className="absolute top-3 right-3">
                            <span className="bg-green-600 text-white px-2 py-1 text-xs font-bold rounded">
                              FREE
                            </span>
                          </div>
                        )}
                        {resource.isFeatured && (
                          <div className="absolute bottom-3 right-3">
                            <Star className="w-5 h-5 text-yellow-500 fill-current" />
                          </div>
                        )}
                      </div>
                      
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{resource.title}</h3>
                        <div className="flex items-center text-gray-600 text-sm mb-3">
                          <span>{resource.category}</span>
                          <span className="mx-2">•</span>
                          <span>{resource.condition}</span>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-4">{resource.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {resource.language?.map((lang, index) => (
                            <span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 text-xs rounded">
                              {lang}
                            </span>
                          ))}
                        </div>

                        {/* Additional metadata */}
                        <div className="text-xs text-gray-500 mb-4">
                          <div>Author: {resource.author}</div>
                          {resource.ageGroup && <div>Age Group: {resource.ageGroup}</div>}
                          {resource.duration && <div>Duration: {resource.duration}</div>}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            {resource.rating && renderStars(resource.rating)}
                            <div className="flex items-center text-gray-600 text-sm mt-1">
                              <Download className="w-4 h-4 mr-1" />
                              {resource.downloadCount.toLocaleString()}
                              <span className="mx-2">•</span>
                              <span>{resource.viewCount.toLocaleString()} views</span>
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => navigate(`/patient-care-resources/${resource.id}`)}
                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors font-medium"
                          >
                            View Resource
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  !loading && (
                    <div className="col-span-full text-center py-12">
                      <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
                      <p className="text-gray-500">
                        {searchTerm || selectedCategory !== 'all' || selectedCondition !== 'all'
                          ? "Try adjusting your search criteria."
                          : "Resources will appear here once they are published."}
                      </p>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'support' && (
          <div>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">Support Groups</h2>
              <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Connect with other families facing similar challenges. Our support groups provide safe spaces for sharing experiences, advice, and encouragement.
              </p>
            </div>

            <div className="space-y-8">
              {supportGroups.map((group) => (
                <div key={group.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200 border border-gray-200 p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{group.name}</h3>
                        {group.id === 1 && (
                          <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-medium">
                            Supported by EACNA
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center text-gray-600 mb-4">
                        <Users className="w-4 h-4 mr-2 text-red-600" />
                        {group.members}
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {group.condition}
                        </span>
                        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                          {group.meetingType}
                        </span>
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                          {group.location}
                        </span>
                      </div>
                      
                      {group.id === 1 && (
                        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-4 rounded-r-lg">
                          <p className="text-blue-800 text-sm">
                            <strong>Officially supported by:</strong> The East African Child Neurology Association (EACNA)
                          </p>
                        </div>
                      )}
                      
                      <p className="text-gray-600 leading-relaxed mb-4">
                        {group.description}
                      </p>
                      
                      <div className="flex items-center text-gray-600 mb-2">
                        <Clock className="w-4 h-4 mr-2 text-red-600" />
                        {group.schedule}
                      </div>
                    </div>
                    
                    <div className="lg:w-64 lg:flex-shrink-0">
                      <div className="flex flex-wrap gap-1 mb-3">
                        {group.languages.map((lang, index) => (
                          <span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 text-xs rounded">
                            {lang}
                          </span>
                        ))}
                      </div>
                      
                      <div className="space-y-2">
                        <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2 w-full">
                          <Phone className="w-4 h-4" />
                          {group.contact}
                        </button>
                        <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors font-medium w-full">
                          Learn More
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'emergency' && (
          <div>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">Emergency Support</h2>
              <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Immediate support when you need it most. Our emergency resources provide 24/7 access to neurological expertise and crisis support across Africa.
              </p>
            </div>

            {/* Emergency Alert */}
            <div className="bg-red-50 border-l-4 border-red-600 p-6 mb-12 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-bold text-red-800 mb-2">In Case of Medical Emergency</h3>
                  <p className="text-red-700 mb-3">
                    If your child is experiencing a life-threatening emergency, call your local emergency services immediately. 
                    These resources are for urgent neurological consultations and support, not life-threatening emergencies.
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className="font-medium">Emergency Numbers:</span>
                    <span>Kenya: 999 | Nigeria: 199 | South Africa: 10177 | Egypt: 123</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Resources Grid */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {emergencyResources.map((resource) => (
                <div key={resource.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="bg-red-100 p-3 rounded-lg text-red-600">
                      {resource.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {resource.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        {resource.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900">Phone Number:</span>
                      <a 
                        href={`tel:${resource.phoneNumber}`}
                        className="text-red-600 font-bold hover:text-red-700 transition-colors"
                      >
                        {resource.phoneNumber}
                      </a>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Availability: {resource.availability}</span>
                      <span>Coverage: {resource.coverage}</span>
                    </div>

                    <button className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2">
                      <Phone className="w-4 h-4" />
                      Call Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Newsletter Section */}
      <section className="py-16 bg-orange-600">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Stay Connected with ACNA</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Get the latest resources, support group updates, and important information about 
            pediatric neurological care delivered directly to your inbox.
          </p>
          
          <form onSubmit={handleSubscribe} className="max-w-md mx-auto">
            {subscriptionStatus && (
              <div className={`mb-4 p-3 rounded-md ${
                subscriptionStatus.type === 'success' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {subscriptionStatus.message}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <input
                  type="text"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                  required
                />
              </div>
            </div>
            
            <div className="relative mb-4">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                required
              />
              <button 
                type="submit"
                disabled={isSubmitting}
                className={`absolute right-2 top-2 bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors flex items-center ${
                  isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  'Subscribing...'
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Subscribe
                  </>
                )}
              </button>
            </div>
            
            <p className="text-sm text-orange-100 opacity-90">
              Join thousands of families receiving support and resources. You can unsubscribe at any time.
            </p>
          </form>
        </div>
      </section>
    </div>
  );
};

export default PatientCaregiverResources;