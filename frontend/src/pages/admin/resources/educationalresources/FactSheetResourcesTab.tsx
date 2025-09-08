import React, { useState, useEffect } from 'react';
import { 
  Book, 
  Video, 
  FileText, 
  Plus, 
  Search, 
  Eye, 
  Edit3, 
  Trash2, 
  Download, 
  Star,
  RefreshCw,
  ChevronUp,
  Calendar,
  User,
  MapPin,
  Tag,
  Users,
  Clock,
  ExternalLink,
  Play
} from 'lucide-react';
import { educationalResourcesApi, EducationalResource } from '../../../../services/educationalResourcesApi';
import LoadingSpinner from '../../../../components/common/LoadingSpinner';
import AlertModal, { AlertModalProps } from '../../../../components/common/AlertModal';
import CreateResourceModal from './CreateResourceModal';

interface FactSheetResourcesTabProps {
  resources: EducationalResource[];
  setResources: React.Dispatch<React.SetStateAction<EducationalResource[]>>;
  onCreateNew: () => void;
}

const FactSheetResourcesTab: React.FC<FactSheetResourcesTabProps> = ({
  resources,
  setResources,
  onCreateNew
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [expandedResource, setExpandedResource] = useState<number | null>(null);
  
  // Modal states
  const [alertModal, setAlertModal] = useState<Partial<AlertModalProps> & { isOpen: boolean }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    resource: EducationalResource | null;
  }>({
    isOpen: false,
    resource: null
  });
  
  // Metadata from API
  const [categories, setCategories] = useState<string[]>([]);
  const [targetAudiences, setTargetAudiences] = useState<string[]>([]);
  const [authors, setAuthors] = useState<string[]>([]);

  const statuses = ['Published', 'Draft', 'Under Review', 'Archived'];
  const resourceTypes = ['Fact Sheet', 'Case Study', 'Video', 'Document', 'Slide Deck', 'Interactive', 'Webinar', 'Toolkit'];

  // Load metadata on mount
  useEffect(() => {
    loadMetadata();
  }, []);

  const loadMetadata = async () => {
    try {
      const [categoriesData, audiencesData, authorsData] = await Promise.all([
        educationalResourcesApi.getCategories(),
        educationalResourcesApi.getTargetAudiences(),
        educationalResourcesApi.getAuthors()
      ]);
      
      setCategories(categoriesData);
      setTargetAudiences(audiencesData);
      setAuthors(authorsData);
    } catch (err) {
      console.error('Error loading metadata:', err);
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || resource.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || resource.status === filterStatus;
    const matchesType = filterType === 'all' || resource.type === filterType;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesType;
  });

  const showAlert = (alertProps: Omit<AlertModalProps, 'isOpen' | 'onClose'>) => {
    setAlertModal({
      ...alertProps,
      isOpen: true
    });
  };

  const closeAlert = () => {
    setAlertModal(prev => ({ ...prev, isOpen: false }));
  };

  const getStatusColor = (status: string) => {
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Video':
      case 'Webinar':
        return <Video className="w-5 h-5" />;
      case 'Fact Sheet':
      case 'Document':
      case 'Toolkit':
        return <FileText className="w-5 h-5" />;
      case 'Interactive':
        return <Book className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const handleResourceStatusChange = async (resourceId: number, newStatus: string) => {
    try {
      setLoading(true);
      
      const updatedResource = await educationalResourcesApi.updateStatus(resourceId, newStatus);
      
      setResources(prev =>
        prev.map(resource =>
          resource.id === resourceId ? updatedResource : resource
        )
      );

      showAlert({
        title: 'Status Updated',
        message: `Resource status has been updated to "${newStatus}".`,
        type: 'success'
      });
    } catch (err) {
      console.error('Error updating status:', err);
      showAlert({
        title: 'Update Failed',
        message: err instanceof Error ? err.message : 'Failed to update status',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeatured = async (resourceId: number) => {
    try {
      setLoading(true);
      
      const updatedResource = await educationalResourcesApi.toggleFeatured(resourceId);
      
      setResources(prev =>
        prev.map(resource =>
          resource.id === resourceId ? updatedResource : resource
        )
      );

      showAlert({
        title: 'Featured Status Updated',
        message: `Resource has been ${updatedResource.isFeatured ? 'marked as featured' : 'removed from featured'}.`,
        type: 'success'
      });
    } catch (err) {
      console.error('Error toggling featured:', err);
      showAlert({
        title: 'Update Failed',
        message: err instanceof Error ? err.message : 'Failed to toggle featured status',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (resourceId: number) => {
    const resource = resources.find(r => r.id === resourceId);
    
    showAlert({
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete "${resource?.title}"?\n\nThis action cannot be undone and will permanently remove the resource and all associated data.`,
      type: 'confirm',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      showCancel: true,
      onConfirm: async () => {
        try {
          setLoading(true);
          
          await educationalResourcesApi.delete(resourceId);
          
          setResources(prev => prev.filter(resource => resource.id !== resourceId));
          
          showAlert({
            title: 'Resource Deleted',
            message: 'The resource has been successfully deleted.',
            type: 'success'
          });
        } catch (err) {
          console.error('Error deleting resource:', err);
          showAlert({
            title: 'Deletion Failed',
            message: err instanceof Error ? err.message : 'Failed to delete resource',
            type: 'error'
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleDownload = async (resourceId: number, fileUrl?: string) => {
    if (!fileUrl) {
      showAlert({
        title: 'Download Unavailable',
        message: 'No file is available for download for this resource.',
        type: 'warning'
      });
      return;
    }
    
    try {
      // Track download
      await educationalResourcesApi.incrementDownload(resourceId);
      
      // Open file in new tab
      window.open(fileUrl, '_blank');
      
      // Update download count in UI
      setResources(prev =>
        prev.map(resource =>
          resource.id === resourceId 
            ? { ...resource, downloadCount: resource.downloadCount + 1 }
            : resource
        )
      );
    } catch (err) {
      console.error('Error tracking download:', err);
      // Still allow download even if tracking fails
      window.open(fileUrl, '_blank');
    }
  };

  const handleEdit = (resource: EducationalResource) => {
    setEditModal({
      isOpen: true,
      resource: resource
    });
  };

  const handleEditClose = () => {
    setEditModal({
      isOpen: false,
      resource: null
    });
  };

  const handleEditSuccess = (updatedResource: EducationalResource) => {
    setResources(prev =>
      prev.map(resource =>
        resource.id === updatedResource.id ? updatedResource : resource
      )
    );
    
    showAlert({
      title: 'Resource Updated',
      message: 'The resource has been successfully updated.',
      type: 'success'
    });
    
    handleEditClose();
  };

  const toggleExpandResource = (resourceId: number) => {
    setExpandedResource(prev => prev === resourceId ? null : resourceId);
  };

  const refreshData = async () => {
    try {
      setLoading(true);
      
      const updatedResources = await educationalResourcesApi.getAll({
        status: filterStatus !== 'all' ? filterStatus : undefined,
        category: filterCategory !== 'all' ? filterCategory : undefined,
        type: filterType !== 'all' ? filterType : undefined,
        search: searchTerm || undefined
      });
      
      setResources(updatedResources);
      
      showAlert({
        title: 'Data Refreshed',
        message: 'Resource data has been successfully refreshed.',
        type: 'success'
      });
    } catch (err) {
      console.error('Error refreshing data:', err);
      showAlert({
        title: 'Refresh Failed',
        message: err instanceof Error ? err.message : 'Failed to refresh data',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderExpandedDetails = (resource: EducationalResource) => (
    <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
      {/* Full Description */}
      {resource.fullDescription && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Full Description</h4>
          <p className="text-gray-600 text-sm whitespace-pre-line">{resource.fullDescription}</p>
        </div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Author & Publication Info */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Publication Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center text-gray-600">
              <User className="w-4 h-4 mr-2" />
              <span>Author: {resource.author}</span>
            </div>
            {resource.institution && (
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                <span>Institution: {resource.institution}</span>
              </div>
            )}
            {resource.location && (
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                <span>Location: {resource.location}</span>
              </div>
            )}
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              <span>Published: {new Date(resource.createdAt).toLocaleDateString()}</span>
            </div>
            {resource.duration && (
              <div className="flex items-center text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                <span>Duration: {resource.duration}</span>
              </div>
            )}
          </div>
        </div>

        {/* Technical Details */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Technical Details</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div>Difficulty: {resource.difficulty}</div>
            {resource.fileSize && <div>File Size: {resource.fileSize}</div>}
            {resource.fileFormat && <div>Format: {resource.fileFormat}</div>}
            <div>Downloads: {resource.downloadCount}</div>
            <div>Views: {resource.viewCount}</div>
          </div>
        </div>
      </div>

      {/* Languages */}
      {resource.languages && resource.languages.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Languages</h4>
          <div className="flex flex-wrap gap-2">
            {resource.languages.map((language, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded-full">
                {language}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Target Audience */}
      {resource.targetAudience && resource.targetAudience.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Target Audience</h4>
          <div className="flex flex-wrap gap-2">
            {resource.targetAudience.map((audience, index) => (
              <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 text-xs rounded-full flex items-center">
                <Users className="w-3 h-3 mr-1" />
                {audience}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* All Tags */}
      {resource.tags && resource.tags.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">All Tags</h4>
          <div className="flex flex-wrap gap-2">
            {resource.tags.map((tag, index) => (
              <span key={index} className="bg-green-100 text-green-800 px-2 py-1 text-xs rounded-full flex items-center">
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Learning Objectives */}
      {resource.learningObjectives && resource.learningObjectives.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Learning Objectives</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
            {resource.learningObjectives.map((objective, index) => (
              <li key={index}>{objective}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Prerequisites */}
      {resource.prerequisites && resource.prerequisites.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Prerequisites</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
            {resource.prerequisites.map((prereq, index) => (
              <li key={index}>{prereq}</li>
            ))}
          </ul>
        </div>
      )}

      {/* External Links */}
      <div className="flex gap-4 pt-2">
        {resource.videoUrl && (
          <a
            href={resource.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-red-600 hover:text-red-800 text-sm"
          >
            <Play className="w-4 h-4 mr-1" />
            Watch Video
          </a>
        )}
        {resource.externalUrl && (
          <a
            href={resource.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            External Link
          </a>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={closeAlert}
        title={alertModal.title || ''}
        message={alertModal.message || ''}
        type={alertModal.type}
        onConfirm={alertModal.onConfirm}
        confirmText={alertModal.confirmText}
        cancelText={alertModal.cancelText}
        showCancel={alertModal.showCancel}
      />

      {/* Edit Modal */}
      <CreateResourceModal
        isOpen={editModal.isOpen}
        onClose={handleEditClose}
        onResourceCreated={handleEditSuccess}
        editingResource={editModal.resource}
      />

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col md:flex-row gap-3 flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            {resourceTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={refreshData}
            disabled={loading}
            className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <button
            onClick={onCreateNew}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center font-medium transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Resource
          </button>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => (
          <div key={resource.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
            <div className="relative">
              {resource.imageUrl ? (
                <img
                  src={resource.imageUrl}
                  alt={resource.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 rounded-t-lg flex items-center justify-center">
                  {getTypeIcon(resource.type)}
                </div>
              )}
              
              <div className="absolute top-3 left-3 flex gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(resource.status)}`}>
                  {resource.status}
                </span>
                {resource.isFeatured && (
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                )}
              </div>
              
              <div className="absolute top-3 right-3">
                <span className="bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                  {resource.type}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{resource.title}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-3">{resource.description}</p>
              
              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span>By {resource.author}</span>
                <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span>{resource.fileSize || 'N/A'} • {resource.fileFormat || 'N/A'}</span>
                <div className="flex gap-3">
                  <span>{resource.downloadCount} downloads</span>
                  <span>{resource.viewCount} views</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1 mb-4">
                {resource.tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 text-xs rounded">
                    {tag}
                  </span>
                ))}
                {resource.tags.length > 3 && (
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 text-xs rounded">
                    +{resource.tags.length - 3}
                  </span>
                )}
              </div>
              
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs text-blue-600 font-medium">{resource.category}</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => toggleExpandResource(resource.id)}
                    className="text-blue-600 hover:text-blue-800 p-1"
                    title={expandedResource === resource.id ? "Hide Details" : "View Details"}
                  >
                    {expandedResource === resource.id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                  <button 
                    onClick={() => handleEdit(resource)}
                    className="text-green-600 hover:text-green-800 p-1"
                    title="Edit Resource"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  {resource.fileUrl && (
                    <button 
                      onClick={() => handleDownload(resource.id, resource.fileUrl)}
                      className="text-purple-600 hover:text-purple-800 p-1"
                      title="Download Resource"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(resource.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Delete Resource"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Admin Actions */}
              <div className="space-y-2">
                <select
                  value={resource.status}
                  onChange={(e) => handleResourceStatusChange(resource.id, e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                >
                  <option value="Draft">Draft</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Published">Published</option>
                  <option value="Archived">Archived</option>
                </select>
                
                <button 
                  onClick={() => handleToggleFeatured(resource.id)}
                  disabled={loading}
                  className={`w-full px-3 py-1 rounded text-xs font-medium transition-colors disabled:opacity-50 ${
                    resource.isFeatured 
                      ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {resource.isFeatured ? 'Remove Feature' : 'Make Featured'}
                </button>
              </div>

              {/* Expanded Details */}
              {expandedResource === resource.id && renderExpandedDetails(resource)}
            </div>
          </div>
        ))}
      </div>
      
      {filteredResources.length === 0 && !loading && (
        <div className="text-center py-12">
          <Book className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
          <p className="text-gray-500">
            {searchTerm || filterCategory !== 'all' || filterStatus !== 'all' || filterType !== 'all'
              ? "Try adjusting your search or filter criteria."
              : "Get started by creating your first educational resource."}
          </p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
};

export default FactSheetResourcesTab;