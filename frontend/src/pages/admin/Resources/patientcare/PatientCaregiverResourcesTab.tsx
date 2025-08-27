import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Clock, 
  User, 
  Users,
  Edit3, 
  Eye, 
  CheckCircle,
  Archive,
  Settings,
  BarChart3,
  Star,
  Trash2,
  Play,
  Upload,
  Languages,
  Target,
  Tag,
  TrendingUp,
  Download,
  FileText,
  ChevronDown,
  ChevronUp,
  Plus,
  Globe,
  Headphones,
  ExternalLink,
  Heart,
  Filter,
  Search
} from 'lucide-react';

export type ResourceStatus = 'Draft' | 'Published' | 'Archived' | 'Under Review';
export type ResourceType = 'Guide' | 'Video' | 'Audio' | 'Checklist' | 'App' | 'Website' | 'Infographic' | 'Handbook';

export interface PatientResource {
  id: number;
  title: string;
  description: string;
  full_description?: string;
  category: string;
  type: ResourceType;
  condition: string;
  language: string[];
  status: ResourceStatus;
  isFeatured?: boolean;
  isFree: boolean;
  imageUrl: string;
  fileUrl?: string;
  externalUrl?: string;
  tags: string[];
  targetAudience: string[];
  ageGroup: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration?: string;
  downloadCount: number;
  viewCount: number;
  rating?: number;
  author: string;
  reviewedBy?: string;
  createdAt: string;
  updatedAt: string;
  lastReviewDate?: string;
}

export interface ResourceAnalytics {
  total: number;
  draft: number;
  published: number;
  archived: number;
  underReview: number;
  totalDownloads: number;
  monthlyDownloads: number;
  featured: number;
  totalViews: number;
  resourcesByType?: {
    Guide: number;
    Video: number;
    Audio: number;
    Checklist: number;
    App: number;
    Website: number;
    Infographic: number;
    Handbook: number;
  };
  topResources?: Array<{
    id: number;
    title: string;
    type: string;
    downloadCount: number;
    viewCount: number;
  }>;
  resourcesByCondition?: {
    [key: string]: number;
  };
}

interface PatientCaregiverResourcesTabProps {
  resources?: PatientResource[];
}

import CreateResourceModal from './CreateResourceModal';
import { patientCareApi } from '../../../../services/patientCareApi';
import LoadingSpinner from '../../../../components/common/LoadingSpinner';

const PatientCaregiverResourcesTab: React.FC<PatientCaregiverResourcesTabProps> = ({ resources: initialResources = [] }) => {
  const [resources, setResources] = useState<PatientResource[]>(initialResources);
  const [selectedTab, setSelectedTab] = useState<'all' | 'published' | 'draft' | 'archived' | 'under-review' | 'analytics'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingResource, setEditingResource] = useState<PatientResource | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<ResourceAnalytics | null>(null);
  const [expandedResources, setExpandedResources] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');

  // Load resources from API
  useEffect(() => {
    loadResources();
    loadAnalytics();
  }, []);

  const loadResources = async () => {
    try {
      setLoading(true);
      const data = await patientCareApi.getAll();
      setResources(data);
    } catch (error) {
      console.error('Error loading resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const data = await patientCareApi.getAnalytics();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  // Helper function to truncate text to two sentences
  const truncateToTwoSentences = (text: string): { truncated: string; hasMore: boolean } => {
    if (!text) return { truncated: '', hasMore: false };
    
    const sentences = text.match(/[^\.!?]+[\.!?]+/g) || [];
    
    if (sentences.length <= 2) {
      return { truncated: text, hasMore: false };
    }
    
    const truncated = sentences.slice(0, 2).join(' ').trim();
    return { truncated, hasMore: true };
  };

  const getStatusColor = (status: ResourceStatus) => {
    switch (status) {
      case 'Published':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Under Review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Archived':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: ResourceStatus) => {
    switch (status) {
      case 'Published':
        return <CheckCircle className="w-4 h-4" />;
      case 'Draft':
        return <Settings className="w-4 h-4" />;
      case 'Under Review':
        return <Eye className="w-4 h-4" />;
      case 'Archived':
        return <Archive className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: ResourceType) => {
    switch (type) {
      case 'Guide': return <FileText className="w-4 h-4" />;
      case 'Video': return <Play className="w-4 h-4" />;
      case 'Audio': return <Headphones className="w-4 h-4" />;
      case 'App': return <Globe className="w-4 h-4" />;
      case 'Website': return <ExternalLink className="w-4 h-4" />;
      case 'Checklist': return <CheckCircle className="w-4 h-4" />;
      case 'Infographic': return <BookOpen className="w-4 h-4" />;
      case 'Handbook': return <BookOpen className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const handleStatusChange = async (resourceId: number, newStatus: ResourceStatus) => {
    try {
      await patientCareApi.updateStatus(resourceId, newStatus);
      setResources(prev => 
        prev.map(resource => 
          resource.id === resourceId 
            ? { ...resource, status: newStatus, updatedAt: new Date().toISOString().split('T')[0] }
            : resource
        )
      );
    } catch (err) {
      console.error('Error updating resource status:', err);
    }
  };

  const handleCreateResource = async (resourceData: PatientResource) => {
    try {
      if (editingResource) {
        const updatedResource = await patientCareApi.update(editingResource.id, resourceData);
        setResources(prev => 
          prev.map(r => r.id === editingResource.id ? updatedResource : r)
        );
      } else {
        const createdResource = await patientCareApi.create(resourceData);
        setResources(prev => [createdResource, ...prev]);
      }
      setShowCreateModal(false);
      setEditingResource(undefined);
      loadAnalytics(); // Refresh analytics
    } catch (err) {
      console.error('Error saving resource:', err);
    }
  };

  const handleEditResource = (resource: PatientResource) => {
    setEditingResource(resource);
    setShowCreateModal(true);
  };

  const handleToggleFeatured = async (resourceId: number) => {
    try {
      await patientCareApi.toggleFeatured(resourceId);
      setResources(prev => 
        prev.map(r => r.id === resourceId ? {...r, isFeatured: !r.isFeatured} : r)
      );
    } catch (err) {
      console.error('Error toggling featured status:', err);
    }
  };

  const handleDeleteResource = async (resourceId: number) => {
    if (window.confirm('Are you sure you want to delete this resource? This action cannot be undone.')) {
      try {
        await patientCareApi.delete(resourceId);
        setResources(prev => prev.filter(r => r.id !== resourceId));
        loadAnalytics(); // Refresh analytics
      } catch (err) {
        console.error('Error deleting resource:', err);
      }
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedResources(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  };

  const safeArrayJoin = (arr: any[], limit?: number): string => {
    if (!Array.isArray(arr) || arr.length === 0) return 'None';
    
    const values = arr.map(item => {
      if (typeof item === 'string') return item;
      return String(item);
    }).filter(Boolean);
    
    if (limit && values.length > limit) {
      return values.slice(0, limit).join(', ') + ` (+${values.length - limit} more)`;
    }
    
    return values.join(', ') || 'None';
  };

  const renderWithLineBreaks = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const filteredResources = resources.filter(resource => {
    const matchesTab = selectedTab === 'all' || 
      (selectedTab === 'published' && resource.status === 'Published') ||
      (selectedTab === 'draft' && resource.status === 'Draft') ||
      (selectedTab === 'archived' && resource.status === 'Archived') ||
      (selectedTab === 'under-review' && resource.status === 'Under Review');
    
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesCondition = selectedCondition === 'all' || resource.condition === selectedCondition;
    
    return matchesTab && matchesSearch && matchesCategory && matchesCondition;
  });

  const renderAnalyticsTab = () => {
    if (!analyticsData) return null;

    return (
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Total Resources</p>
                <p className="text-3xl font-bold text-orange-900">{analyticsData.total}</p>
              </div>
              <BookOpen className="w-8 h-8 text-orange-600" />
            </div>
            <p className="text-orange-600 text-sm mt-2">All time</p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Total Downloads</p>
                <p className="text-3xl font-bold text-green-900">{analyticsData.totalDownloads.toLocaleString()}</p>
              </div>
              <Download className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-green-600 text-sm mt-2">Across all resources</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Monthly Downloads</p>
                <p className="text-3xl font-bold text-blue-900">{analyticsData.monthlyDownloads.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-blue-600 text-sm mt-2">Last 30 days</p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Total Views</p>
                <p className="text-3xl font-bold text-purple-900">{analyticsData.totalViews.toLocaleString()}</p>
              </div>
              <Eye className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-purple-600 text-sm mt-2">All resource views</p>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Status Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-green-50">
              <div className="text-2xl font-bold text-green-800">{analyticsData.published}</div>
              <div className="text-sm text-green-600">Published</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-yellow-50">
              <div className="text-2xl font-bold text-yellow-800">{analyticsData.draft}</div>
              <div className="text-sm text-yellow-600">Draft</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-blue-50">
              <div className="text-2xl font-bold text-blue-800">{analyticsData.underReview}</div>
              <div className="text-sm text-blue-600">Under Review</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-gray-50">
              <div className="text-2xl font-bold text-gray-800">{analyticsData.archived}</div>
              <div className="text-sm text-gray-600">Archived</div>
            </div>
          </div>
        </div>

        {/* Resource Types */}
        {analyticsData.resourcesByType && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Types</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(analyticsData.resourcesByType).map(([type, count]) => (
                <div key={type} className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-orange-800 font-medium">{type}</span>
                    <span className="text-orange-600 font-bold">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resources by Condition */}
        {analyticsData.resourcesByCondition && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resources by Condition</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(analyticsData.resourcesByCondition).map(([condition, count]) => (
                <div key={condition} className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-800 font-medium">{condition}</span>
                    <span className="text-blue-600 font-bold">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Resources */}
        {analyticsData.topResources && analyticsData.topResources.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Top Resources by Downloads</h3>
              <button className="flex items-center text-sm text-orange-600 hover:text-orange-800">
                <Download className="w-4 h-4 mr-1" />
                Export Report
              </button>
            </div>
            <div className="space-y-3">
              {analyticsData.topResources.map((resource) => (
                <div key={resource.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{resource.title}</p>
                    <p className="text-xs text-gray-500">{resource.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-orange-600">{resource.downloadCount.toLocaleString()} downloads</p>
                    <p className="text-xs text-gray-500">{resource.viewCount.toLocaleString()} views</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Featured Resources</h3>
            <div className="text-center py-8">
              <Star className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <div className="text-3xl font-bold text-gray-900">{analyticsData.featured}</div>
              <p className="text-gray-600">Featured resources</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <span className="text-sm font-medium">Export All Data</span>
                <FileText className="w-4 h-4 text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <span className="text-sm font-medium">Generate Report</span>
                <BarChart3 className="w-4 h-4 text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <span className="text-sm font-medium">Bulk Update</span>
                <Upload className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const categories = ['all', 'Educational Guides', 'Therapy & Exercise', 'Assessment Tools', 'Emergency Care', 'Nutrition & Diet', 'Education Support', 'Medication Management', 'Inspiration & Stories'];
  const conditions = ['all', 'Epilepsy', 'Cerebral Palsy', 'Developmental Delays', 'Autism Spectrum Disorders', 'All Conditions', 'Rare Conditions'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white border border-gray-300 rounded-lg">
        <div className="bg-orange-50 px-6 py-4 border-b border-gray-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Heart className="w-7 h-7 mr-3 text-orange-600" />
                Patient & Caregiver Resources
              </h2>
              <p className="text-gray-600 mt-1">Manage educational resources, guides, and support materials for families</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 flex items-center font-medium transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Resource
              </button>
              <button 
                onClick={() => setSelectedTab('analytics')}
                className="border border-orange-600 text-orange-600 px-6 py-2 rounded-lg hover:bg-orange-50 flex items-center font-medium transition-colors"
              >
                <BarChart3 className="w-5 h-5 mr-2" />
                Analytics
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-4 border-b border-gray-200">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'all', label: 'All Resources', count: resources.length },
              { id: 'published', label: 'Published', count: resources.filter(r => r.status === 'Published').length },
              { id: 'draft', label: 'Draft', count: resources.filter(r => r.status === 'Draft').length },
              { id: 'under-review', label: 'Under Review', count: resources.filter(r => r.status === 'Under Review').length },
              { id: 'archived', label: 'Archived', count: resources.filter(r => r.status === 'Archived').length },
              { id: 'analytics', label: 'Analytics', count: 0 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`py-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  selectedTab === tab.id
                    ? 'border-orange-600 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label} {tab.count > 0 && `(${tab.count})`}
              </button>
            ))}
          </nav>
        </div>

        {/* Search and Filter Bar */}
        {selectedTab !== 'analytics' && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-600" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
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
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
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
        )}

        {/* Content Area */}
        <div className="p-6">
          {selectedTab === 'analytics' ? (
            <div>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Resource Analytics</h3>
                <p className="text-gray-600">Comprehensive analytics and insights about your patient care resources</p>
              </div>
              {analyticsData ? renderAnalyticsTab() : (
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No analytics data available</h3>
                  <p className="text-gray-500">
                    Analytics data will appear once you have published resources with user engagement.
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Resources List */
            <div className="space-y-6">
              {filteredResources.length > 0 ? (
                filteredResources.map((resource) => {
                  const isExpanded = expandedResources.includes(resource.id);
                  const { truncated: truncatedDescription, hasMore } = truncateToTwoSentences(resource.description);

                  return (
                    <div key={resource.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                      <div className="flex flex-col lg:flex-row">
                        {/* Resource Image */}
                        <div className="lg:w-1/4">
                          <div className="relative">
                            <img
                              src={resource.imageUrl || '/api/placeholder/300/200'}
                              alt={resource.title}
                              className="w-full h-48 lg:h-full object-cover rounded-t-lg lg:rounded-l-lg lg:rounded-t-none"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/api/placeholder/300/200';
                              }}
                            />
                            <div className="absolute top-3 left-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(resource.status)} flex items-center`}>
                                {getStatusIcon(resource.status)}
                                <span className="ml-1">{resource.status}</span>
                              </span>
                            </div>
                            {resource.isFeatured && (
                              <div className="absolute top-3 right-3">
                                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                              </div>
                            )}
                            <div className="absolute bottom-3 left-3">
                              <span className="bg-orange-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center">
                                {getTypeIcon(resource.type)}
                                <span className="ml-1">{resource.type}</span>
                              </span>
                            </div>
                            <div className="absolute bottom-3 right-3">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                resource.isFree ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'
                              }`}>
                                {resource.isFree ? 'FREE' : 'PREMIUM'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Resource Details */}
                        <div className="lg:w-3/4 p-6">
                          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                                {resource.title}
                              </h3>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                <div className="space-y-2">
                                  <div className="flex items-center text-gray-600 text-sm">
                                    <Tag className="w-4 h-4 mr-2 text-orange-600" />
                                    <span className="font-medium">{resource.category}</span>
                                  </div>
                                  <div className="flex items-center text-gray-600 text-sm">
                                    <Target className="w-4 h-4 mr-2 text-orange-600" />
                                    <span className="font-medium">{resource.condition}</span>
                                  </div>
                                  <div className="flex items-center text-gray-600 text-sm">
                                    <User className="w-4 h-4 mr-2 text-orange-600" />
                                    <span className="font-medium">{resource.ageGroup}</span>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <div className="flex items-center text-gray-600 text-sm">
                                    <Languages className="w-4 h-4 mr-2 text-orange-600" />
                                    <span>{safeArrayJoin(resource.language, 2)}</span>
                                  </div>
                                  <div className="flex items-center text-gray-600 text-sm">
                                    <Users className="w-4 h-4 mr-2 text-orange-600" />
                                    <span>{safeArrayJoin(resource.targetAudience, 2)}</span>
                                  </div>
                                  <div className="flex items-center text-gray-600 text-sm">
                                    <BookOpen className="w-4 h-4 mr-2 text-orange-600" />
                                    <span className={`px-2 py-1 rounded text-xs ${
                                      resource.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                                      resource.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      {resource.difficulty}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Stats */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div className="bg-gray-50 p-3 rounded-lg text-center">
                                  <div className="flex items-center justify-center mb-1">
                                    <Download className="w-4 h-4 text-gray-600 mr-1" />
                                  </div>
                                  <div className="text-lg font-bold text-gray-900">{resource.downloadCount.toLocaleString()}</div>
                                  <div className="text-xs text-gray-600">Downloads</div>
                                </div>
                                
                                <div className="bg-gray-50 p-3 rounded-lg text-center">
                                  <div className="flex items-center justify-center mb-1">
                                    <Eye className="w-4 h-4 text-gray-600 mr-1" />
                                  </div>
                                  <div className="text-lg font-bold text-gray-900">{resource.viewCount.toLocaleString()}</div>
                                  <div className="text-xs text-gray-600">Views</div>
                                </div>

                                {resource.rating && (
                                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                                    <div className="flex items-center justify-center mb-1">
                                      <Star className="w-4 h-4 text-yellow-500 mr-1 fill-current" />
                                    </div>
                                    <div className="text-lg font-bold text-gray-900">{resource.rating}</div>
                                    <div className="text-xs text-gray-600">Rating</div>
                                  </div>
                                )}

                                {resource.duration && (
                                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                                    <div className="flex items-center justify-center mb-1">
                                      <Clock className="w-4 h-4 text-gray-600 mr-1" />
                                    </div>
                                    <div className="text-xs font-bold text-gray-900">{resource.duration}</div>
                                    <div className="text-xs text-gray-600">Duration</div>
                                  </div>
                                )}
                              </div>

                              {/* Author and Review Info */}
                              <div className="mb-4">
                                <div className="flex items-center text-gray-600 text-sm mb-1">
                                  <User className="w-4 h-4 mr-2 text-orange-600" />
                                  <span className="font-medium">Author:</span>
                                  <span className="ml-1">{resource.author}</span>
                                </div>
                                {resource.reviewedBy && (
                                  <div className="flex items-center text-gray-600 text-sm">
                                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                                    <span className="font-medium">Reviewed by:</span>
                                    <span className="ml-1">{resource.reviewedBy}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* TRUNCATED DESCRIPTION - shows only when NOT expanded */}
                          {!isExpanded && (
                            <div className="mb-4">
                              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                                {renderWithLineBreaks(truncatedDescription)}
                              </p>
                              {hasMore && (
                                <button
                                  onClick={() => toggleExpand(resource.id)}
                                  className="text-orange-600 hover:text-orange-800 text-sm font-medium mt-1"
                                >
                                  Read more...
                                </button>
                              )}
                            </div>
                          )}

                          {/* Tags */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {(resource.tags || []).map((tag, index) => (
                              <span key={index} className="bg-orange-100 text-orange-800 px-2 py-1 text-xs rounded">
                                {typeof tag === 'string' ? tag : ''}
                              </span>
                            ))}
                          </div>

                          {/* Expandable Content */}
                          {isExpanded && (
                            <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                              {/* FULL DESCRIPTION */}
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-2">Full Description</h4>
                                <p className="text-gray-600 text-sm whitespace-pre-line">
                                  {renderWithLineBreaks(resource.full_description || resource.description)}
                                </p>
                              </div>

                              {/* Additional Details */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Links */}
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                  <h4 className="font-medium text-gray-900 mb-2">Resource Links</h4>
                                  <div className="space-y-2 text-sm">
                                    {resource.fileUrl && (
                                      <div>
                                        <span className="font-medium">File URL: </span>
                                        <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">
                                          {resource.fileUrl}
                                        </a>
                                      </div>
                                    )}
                                    {resource.externalUrl && (
                                      <div>
                                        <span className="font-medium">External URL: </span>
                                        <a href={resource.externalUrl} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">
                                          {resource.externalUrl}
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Additional Info */}
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                  <h4 className="font-medium text-gray-900 mb-2">Additional Information</h4>
                                  <div className="space-y-2 text-sm text-gray-600">
                                    <div>
                                      <span className="font-medium">Created: </span>
                                      {resource.createdAt}
                                    </div>
                                    <div>
                                      <span className="font-medium">Updated: </span>
                                      {resource.updatedAt}
                                    </div>
                                    {resource.lastReviewDate && (
                                      <div>
                                        <span className="font-medium">Last Reviewed: </span>
                                        {resource.lastReviewDate}
                                      </div>
                                    )}
                                    <div>
                                      <span className="font-medium">ID: </span>
                                      #{resource.id}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Admin Actions */}
                          <div className="flex flex-wrap gap-3">
                            <button 
                              onClick={() => toggleExpand(resource.id)}
                              className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center text-sm font-medium transition-colors"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="w-4 h-4 mr-2" />
                                  Collapse
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-4 h-4 mr-2" />
                                  Expand
                                </>
                              )}
                            </button>

                            <button 
                              onClick={() => handleEditResource(resource)}
                              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center text-sm font-medium transition-colors"
                            >
                              <Edit3 className="w-4 h-4 mr-2" />
                              Edit Details
                            </button>

                            <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center text-sm font-medium transition-colors">
                              <Eye className="w-4 h-4 mr-2" />
                              Preview
                            </button>

                            {resource.type !== 'Website' && resource.type !== 'App' && (
                              <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center text-sm font-medium transition-colors">
                                <Upload className="w-4 h-4 mr-2" />
                                Update File
                              </button>
                            )}

                            <div className="relative">
                              <select
                                value={resource.status}
                                onChange={(e) => handleStatusChange(resource.id, e.target.value as ResourceStatus)}
                                className="border border-gray-300 px-3 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                              >
                                <option value="Draft">Draft</option>
                                <option value="Under Review">Under Review</option>
                                <option value="Published">Published</option>
                                <option value="Archived">Archived</option>
                              </select>
                            </div>

                            <button 
                              onClick={() => handleToggleFeatured(resource.id)}
                              className={`border px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-colors ${
                                resource.isFeatured 
                                  ? 'border-yellow-300 bg-yellow-50 text-yellow-800 hover:bg-yellow-100' 
                                  : 'border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <Star className={`w-4 h-4 mr-2 ${resource.isFeatured ? 'fill-current' : ''}`} />
                              {resource.isFeatured ? 'Unfeature' : 'Feature'}
                            </button>

                            <button 
                              onClick={() => handleDeleteResource(resource.id)}
                              className="border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 flex items-center text-sm font-medium transition-colors"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
                  <p className="text-gray-500 mb-4">
                    {selectedTab === 'all' 
                      ? "You haven't created any resources yet." 
                      : `No resources in the ${selectedTab.replace('-', ' ')} category.`}
                  </p>
                  <button 
                    onClick={() => setShowCreateModal(true)}
                    className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 font-medium"
                  >
                    Create Your First Resource
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Resource Modal */}
      {showCreateModal && (
        <CreateResourceModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setEditingResource(undefined);
          }}
          onSubmit={handleCreateResource}
          editingResource={editingResource}
        />
      )}
    </div>
  );
};

export default PatientCaregiverResourcesTab;