import React, { useState } from 'react';
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
  Star
} from 'lucide-react';

// Types
type ResourceType = 'Fact Sheet' | 'Case Study' | 'Video' | 'Document' | 'Slide Deck' | 'Interactive';
type ResourceStatus = 'Published' | 'Draft' | 'Under Review' | 'Archived';
type ResourceCategory = 'Epilepsy' | 'Cerebral Palsy' | 'Neurodevelopment' | 'Nutrition' | 'Seizures' | 'Rehabilitation' | 'General';

interface FactSheet {
  id: number;
  title: string;
  type: ResourceType;
  category: ResourceCategory;
  description: string;
  fullDescription?: string;
  status: ResourceStatus;
  author: string;
  dateCreated: string;
  datePublished?: string;
  downloads: number;
  views: number;
  fileSize: string;
  fileFormat: string;
  tags: string[];
  targetAudience: string[];
  isFeatured: boolean;
  imageUrl?: string;
  fileUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface FactSheetResourcesTabProps {
  factSheets: FactSheet[];
  setFactSheets: React.Dispatch<React.SetStateAction<FactSheet[]>>;
  onCreateNew: () => void;
}

const FactSheetResourcesTab: React.FC<FactSheetResourcesTabProps> = ({
  factSheets,
  setFactSheets,
  onCreateNew
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const categories = ['Epilepsy', 'Cerebral Palsy', 'Neurodevelopment', 'Nutrition', 'Seizures', 'Rehabilitation', 'General'];
  const statuses = ['Published', 'Draft', 'Under Review', 'Archived'];
  const resourceTypes = ['Fact Sheet', 'Case Study', 'Video', 'Document', 'Slide Deck', 'Interactive'];

  const filteredResources = factSheets.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || resource.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || resource.status === filterStatus;
    const matchesType = filterType === 'all' || resource.type === filterType;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesType;
  });

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

  const getTypeIcon = (type: ResourceType) => {
    switch (type) {
      case 'Video':
        return <Video className="w-5 h-5" />;
      case 'Fact Sheet':
      case 'Document':
        return <FileText className="w-5 h-5" />;
      case 'Interactive':
        return <Book className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const handleResourceStatusChange = (resourceId: number, newStatus: ResourceStatus) => {
    setFactSheets(prev =>
      prev.map(resource =>
        resource.id === resourceId
          ? { ...resource, status: newStatus }
          : resource
      )
    );
  };

  const handleToggleFeatured = (resourceId: number) => {
    setFactSheets(prev =>
      prev.map(resource =>
        resource.id === resourceId
          ? { ...resource, isFeatured: !resource.isFeatured }
          : resource
      )
    );
  };

  return (
    <div className="space-y-6">
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
        
        <button
          onClick={onCreateNew}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center font-medium transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Resource
        </button>
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
                <span>{resource.dateCreated}</span>
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span>{resource.fileSize} • {resource.fileFormat}</span>
                <div className="flex gap-3">
                  <span>{resource.downloads} downloads</span>
                  <span>{resource.views} views</span>
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
                  <button className="text-blue-600 hover:text-blue-800 p-1">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="text-green-600 hover:text-green-800 p-1">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button className="text-purple-600 hover:text-purple-800 p-1">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-800 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Admin Actions */}
              <div className="space-y-2">
                <select
                  value={resource.status}
                  onChange={(e) => handleResourceStatusChange(resource.id, e.target.value as ResourceStatus)}
                  className="w-full px-3 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Draft">Draft</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Published">Published</option>
                  <option value="Archived">Archived</option>
                </select>
                
                <button 
                  onClick={() => handleToggleFeatured(resource.id)}
                  className={`w-full px-3 py-1 rounded text-xs font-medium transition-colors ${
                    resource.isFeatured 
                      ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {resource.isFeatured ? 'Unfeature' : 'Feature'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredResources.length === 0 && (
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
    </div>
  );
};

export default FactSheetResourcesTab;