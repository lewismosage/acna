import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Video, 
  Plus, 
  Edit, 
  Calendar, 
  MapPin, 
  Users,
  BookOpen,
  Heart,
  CheckCircle,
  AlertCircle,
  Clock,
  Search,
  ChevronDown,
  ChevronUp,
  Trash2,
  RefreshCw
} from 'lucide-react';
import CreateGalleryItemModal from './CreateGalleryItemModal';
import { galleryItemsApi, storiesApi, GalleryItem, Story} from '../../../../services/galleryApi';
import LoadingSpinner from '../../../../components/common/LoadingSpinner';

type GalleryItemStatus = 'draft' | 'published' | 'archived';

interface GalleryTabProps {
  initialGalleryItems?: GalleryItem[];
  initialStoryItems?: Story[];
}

const GalleryTab: React.FC<GalleryTabProps> = ({ initialGalleryItems = [], initialStoryItems = [] }) => {
  const [selectedTab, setSelectedTab] = useState<'gallery' | 'stories'>('gallery');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const [allGalleryItems, setAllGalleryItems] = useState<GalleryItem[]>(initialGalleryItems);
  const [allStoryItems, setAllStoryItems] = useState<Story[]>(initialStoryItems);
  const [editingItem, setEditingItem] = useState<GalleryItem | Story | undefined>(undefined);
  const [loading, setLoading] = useState({
    gallery: false,
    stories: false
  });
  const [error, setError] = useState({
    gallery: '',
    stories: ''
  });

  // Clean up any null/undefined items that might have crept in
  useEffect(() => {
    setAllGalleryItems(prev => (prev || []).filter(Boolean));
    setAllStoryItems(prev => (prev || []).filter(Boolean));
  }, []);

  // Fetch data on component mount and when tab changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(prev => ({ ...prev, [selectedTab]: true }));
        
        if (selectedTab === 'gallery') {
          const response = await galleryItemsApi.getAll();
          // Handle both array and paginated response formats
          const galleryItems: GalleryItem[] = Array.isArray(response) ? response : response;
          setAllGalleryItems(galleryItems.filter(Boolean));
        } else {
          const response = await storiesApi.getAll();
          // Handle both array and paginated response formats
          const storyItems: Story[] = Array.isArray(response) ? response : response;
          setAllStoryItems(storyItems.filter(Boolean));
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(prev => ({
          ...prev,
          [selectedTab]: err instanceof Error ? err.message : 'Failed to fetch data'
        }));
      } finally {
        setLoading(prev => ({ ...prev, [selectedTab]: false }));
      }
    };
  
    fetchData();
  }, [selectedTab]);

  const fetchAllData = async () => {
    try {
      setLoading({ gallery: true, stories: true });
      
      const [galleryResponse, storiesResponse] = await Promise.all([
        galleryItemsApi.getAll(),
        storiesApi.getAll()
      ]);
      
      // Handle both array and paginated response formats
      const galleryItems: GalleryItem[] = Array.isArray(galleryResponse) ? galleryResponse : galleryResponse;
      const storyItems: Story[] = Array.isArray(storiesResponse) ? storiesResponse : storiesResponse;
      
      setAllGalleryItems(galleryItems.filter(Boolean));
      setAllStoryItems(storyItems.filter(Boolean));
      
      setError({ gallery: '', stories: '' });
    } catch (err) {
      console.error('Refresh error:', err);
      setError({
        gallery: err instanceof Error ? err.message : 'Failed to fetch gallery items',
        stories: err instanceof Error ? err.message : 'Failed to fetch stories'
      });
    } finally {
      setLoading({ gallery: false, stories: false });
    }
  };

  const getStatusColor = (status: GalleryItemStatus) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: GalleryItemStatus) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="w-4 h-4" />;
      case 'draft':
        return <Clock className="w-4 h-4" />;
      case 'archived':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Camera className="w-4 h-4" />;
    }
  };

  const handleStatusChange = async (id: number, newStatus: GalleryItemStatus, isStory: boolean = false) => {
    try {
      if (isStory) {
        await storiesApi.updateStatus(id, newStatus);
        setAllStoryItems(prev => 
          (prev || []).map(item => 
            item && item.id === id 
              ? { ...item, status: newStatus, updated_at: new Date().toISOString() }
              : item
          ).filter(Boolean)
        );
      } else {
        await galleryItemsApi.updateStatus(id, newStatus);
        setAllGalleryItems(prev => 
          (prev || []).map(item => 
            item && item.id === id 
              ? { ...item, status: newStatus, updated_at: new Date().toISOString() }
              : item
          ).filter(Boolean)
        );
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update status';
      setError(prev => ({
        ...prev,
        [isStory ? 'stories' : 'gallery']: errorMessage
      }));
    }
  };

  const handleCreateItem = async (newItem: any) => {
    try {
      const formData = new FormData();
      
      // Common fields
      formData.append('title', newItem.title);
      formData.append('is_featured', String(newItem.is_featured || false));
      
      if (newItem.type) {
        // Gallery item specific fields
        formData.append('type', newItem.type);
        formData.append('category', newItem.category);
        formData.append('description', newItem.description || '');
        formData.append('event_date', newItem.event_date || new Date().toISOString().split('T')[0]);
        formData.append('location', newItem.location || '');
        formData.append('status', 'draft');
        
        if (newItem.type === 'video' && newItem.duration) {
          formData.append('duration', newItem.duration);
        }
        
        if (newItem.imageFile instanceof File) {
          if (newItem.type === 'photo') {
            formData.append('image', newItem.imageFile);
          } else if (newItem.type === 'video') {
            formData.append('video', newItem.imageFile);
          }
        } else {
          throw new Error('Media file is required');
        }
        
        if (newItem.thumbnailFile instanceof File) {
          formData.append('thumbnail', newItem.thumbnailFile);
        }
        
        const createdItem = await galleryItemsApi.create(formData);
        if (createdItem) {
          setAllGalleryItems(prev => [createdItem, ...(prev || [])].filter(Boolean));
        }
      } else {
        // Story specific fields
        formData.append('patient_name', newItem.patient_name);
        formData.append('age', String(newItem.age));
        formData.append('condition', newItem.condition);
        formData.append('story', newItem.story);
        formData.append('story_date', newItem.story_date || new Date().toISOString().split('T')[0]);
        formData.append('location', newItem.location || '');
        formData.append('status', 'draft');
        
        if (newItem.imageFile instanceof File) {
          formData.append('image', newItem.imageFile);
        } else {
          throw new Error('Image file is required for stories');
        }
        
        const createdItem = await storiesApi.create(formData);
        if (createdItem) {
          setAllStoryItems(prev => [createdItem, ...(prev || [])].filter(Boolean));
        }
      }
      
      setShowCreateModal(false);
    } catch (err) {
      console.error('Failed to create item:', err);
      setError(prev => ({
        ...prev,
        [selectedTab]: err instanceof Error ? err.message : 'Failed to create item'
      }));
    }
  };

  const handleEditItem = (item: GalleryItem | Story) => {
    setEditingItem(item);
    setShowCreateModal(true);
  };

  const handleUpdateItem = async (updatedItem: any) => {
    try {
      if (!editingItem) return;

      const formData = new FormData();
      formData.append('title', updatedItem.title);
      formData.append('is_featured', String(updatedItem.is_featured || false));
      
      // Fixed explicit typing for savedItem
      let savedItem: GalleryItem | Story;
      
      if ('type' in editingItem) {
        // Gallery item update
        formData.append('type', updatedItem.type);
        formData.append('category', updatedItem.category);
        formData.append('description', updatedItem.description || '');
        formData.append('event_date', updatedItem.event_date);
        formData.append('location', updatedItem.location || '');
        
        if (updatedItem.type === 'video' && updatedItem.duration) {
          formData.append('duration', updatedItem.duration);
        }
        
        // Only append new files if they exist
        if (updatedItem.imageFile instanceof File) {
          if (updatedItem.type === 'photo') {
            formData.append('image', updatedItem.imageFile);
          } else if (updatedItem.type === 'video') {
            formData.append('video', updatedItem.imageFile);
          }
        }
        
        if (updatedItem.thumbnailFile instanceof File) {
          formData.append('thumbnail', updatedItem.thumbnailFile);
        }
        
        savedItem = await galleryItemsApi.update(editingItem.id, formData);
        setAllGalleryItems(prev => 
          (prev || []).map(item => 
            item && item.id === editingItem.id ? savedItem as GalleryItem : item
          ).filter(Boolean)
        );
      } else {
        // Story update
        formData.append('patient_name', updatedItem.patient_name);
        formData.append('age', String(updatedItem.age));
        formData.append('condition', updatedItem.condition);
        formData.append('story', updatedItem.story);
        formData.append('story_date', updatedItem.story_date);
        formData.append('location', updatedItem.location || '');
        
        if (updatedItem.imageFile instanceof File) {
          formData.append('image', updatedItem.imageFile);
        }
        
        savedItem = await storiesApi.update(editingItem.id, formData);
        setAllStoryItems(prev => 
          (prev || []).map(item => 
            item && item.id === editingItem.id ? savedItem as Story : item
          ).filter(Boolean)
        );
      }
      
      setShowCreateModal(false);
      setEditingItem(undefined);
    } catch (err) {
      console.error('Failed to update item:', err);
      setError(prev => ({
        ...prev,
        [selectedTab]: err instanceof Error ? err.message : 'Failed to update item'
      }));
    }
  };

  const handleDeleteItem = async (id: number, isStory: boolean = false) => {
    const itemType = isStory ? 'story' : 'gallery item';
    
    if (!confirm(`Are you sure you want to delete this ${itemType}? This action cannot be undone.`)) {
      return;
    }

    try {
      if (isStory) {
        await storiesApi.delete(id);
        setAllStoryItems(prev => (prev || []).filter(item => item?.id !== id));
      } else {
        await galleryItemsApi.delete(id);
        setAllGalleryItems(prev => (prev || []).filter(item => item?.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete item:', err);
      setError(prev => ({
        ...prev,
        [isStory ? 'stories' : 'gallery']: err instanceof Error ? err.message : 'Failed to delete item'
      }));
    }
  };

  const toggleFeatured = async (id: number, isStory: boolean = false) => {
    try {
      if (isStory) {
        const response = await storiesApi.toggleFeatured(id);
        
        if (response && response.data && typeof response.data.is_featured === 'boolean') {
          setAllStoryItems(prev => 
            (prev || []).map(item => 
              item && item.id === id 
                ? { ...item, is_featured: response.data.is_featured }
                : item
            ).filter(Boolean)
          );
        }
      } else {
        const response = await galleryItemsApi.toggleFeatured(id);
        
        if (response && response.data && typeof response.data.is_featured === 'boolean') {
          setAllGalleryItems(prev => 
            (prev || []).map(item => 
              item && item.id === id 
                ? { ...item, is_featured: response.data.is_featured }
                : item
            ).filter(Boolean)
          );
        }
      }
    } catch (err) {
      console.error('Failed to toggle featured status:', err);
      setError(prev => ({
        ...prev,
        [isStory ? 'stories' : 'gallery']: 'Failed to toggle featured status'
      }));
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingItem(undefined);
  };

  // Safe filtering with null checks
  const filteredGalleryItems = React.useMemo(() => {
    const items = (allGalleryItems || []).filter(Boolean);
    return items.filter(item => {
      if (!item || !item.id) return false;
      
      if (selectedFilter !== 'all' && item.status !== selectedFilter) {
        return false;
      }
      
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          item.title?.toLowerCase().includes(searchLower) ||
          (item.description?.toLowerCase().includes(searchLower)) ||
          (item.category?.toLowerCase().includes(searchLower))
        );
      }
      
      return true;
    });
  }, [allGalleryItems, selectedFilter, searchTerm]);
  
  const filteredStoryItems = React.useMemo(() => {
    const items = (allStoryItems || []).filter(Boolean);
    return items.filter(item => {
      if (!item || !item.id) return false;
      
      let statusMatch = true;
      switch (selectedFilter) {
        case 'published': 
          statusMatch = item.status === 'published';
          break;
        case 'draft': 
          statusMatch = item.status === 'draft';
          break;
        case 'archived': 
          statusMatch = item.status === 'archived';
          break;
        default: 
          statusMatch = true;
      }
      
      if (!statusMatch) return false;
      
      if (!searchTerm) return true;
      
      const searchLower = searchTerm.toLowerCase();
      return (
        item.title?.toLowerCase().includes(searchLower) ||
        item.patient_name?.toLowerCase().includes(searchLower) ||
        item.condition?.toLowerCase().includes(searchLower)
      );
    });
  }, [allStoryItems, selectedFilter, searchTerm]);

  const stats = React.useMemo(() => ({
    gallery: {
      total: (allGalleryItems || []).filter(Boolean).length,
      published: (allGalleryItems || []).filter(Boolean).filter(i => i.status === 'published').length,
      drafts: (allGalleryItems || []).filter(Boolean).filter(i => i.status === 'draft').length,
      archived: (allGalleryItems || []).filter(Boolean).filter(i => i.status === 'archived').length,
    },
    stories: {
      total: (allStoryItems || []).filter(Boolean).length,
      published: (allStoryItems || []).filter(Boolean).filter(i => i.status === 'published').length,
      drafts: (allStoryItems || []).filter(Boolean).filter(i => i.status === 'draft').length,
      archived: (allStoryItems || []).filter(Boolean).filter(i => i.status === 'archived').length,
    }
  }), [allGalleryItems, allStoryItems]);

  if (loading.gallery && selectedTab === 'gallery') {
    return <LoadingSpinner />;
  }

  if (loading.stories && selectedTab === 'stories') {
    return <LoadingSpinner />;
  }

  if (error.gallery && selectedTab === 'gallery') {
    return (
      <div className="bg-white border border-gray-300 rounded-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Gallery</h3>
        <p className="text-gray-500 mb-4">{error.gallery}</p>
        <div className="flex gap-3 justify-center">
          <button 
            onClick={fetchAllData}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 font-medium flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (error.stories && selectedTab === 'stories') {
    return (
      <div className="bg-white border border-gray-300 rounded-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Stories</h3>
        <p className="text-gray-500 mb-4">{error.stories}</p>
        <div className="flex gap-3 justify-center">
          <button 
            onClick={fetchAllData}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 font-medium flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white border border-gray-300 rounded-lg">
        <div className="bg-purple-50 px-6 py-4 border-b border-gray-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Camera className="w-7 h-7 mr-3 text-purple-600" />
                Gallery Management
              </h2>
              <p className="text-gray-600 mt-1">Manage gallery items and stories of changed lives</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 flex items-center font-medium transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create {selectedTab === 'gallery' ? 'Gallery Item' : 'Story'}
              </button>
              <button 
                onClick={fetchAllData}
                className="border border-purple-600 text-purple-600 px-6 py-2 rounded-lg hover:bg-purple-50 flex items-center font-medium transition-colors"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <nav className="flex space-x-8">
              <button
                onClick={() => setSelectedTab('gallery')}
                className={`py-2 border-b-2 font-medium text-sm transition-colors ${
                  selectedTab === 'gallery'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Gallery Items ({stats.gallery.total})
              </button>
              <button
                onClick={() => setSelectedTab('stories')}
                className={`py-2 border-b-2 font-medium text-sm transition-colors ${
                  selectedTab === 'stories'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Stories of Changed Lives ({stats.stories.total})
              </button>
            </nav>
            <div className="mt-3 md:mt-0 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={`Search ${selectedTab === 'gallery' ? 'gallery items' : 'stories'}...`}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Status Filter */}
        <div className="px-6 py-4 border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { id: 'all', label: 'All', count: selectedTab === 'gallery' ? stats.gallery.total : stats.stories.total },
              { id: 'published', label: 'Published', count: selectedTab === 'gallery' ? stats.gallery.published : stats.stories.published },
              { id: 'draft', label: 'Drafts', count: selectedTab === 'gallery' ? stats.gallery.drafts : stats.stories.drafts }, 
              { id: 'archived', label: 'Archived', count: selectedTab === 'gallery' ? stats.gallery.archived : stats.stories.archived }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id as any)}
                className={`py-2 border-b-2 font-medium text-sm transition-colors ${
                  selectedFilter === tab.id
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {selectedTab === 'gallery' ? (
            <div className="space-y-6">
              {filteredGalleryItems.length > 0 ? (
                filteredGalleryItems.filter(Boolean).map((item) => {
                  if (!item || !item.id) {
                    console.warn('Invalid gallery item found:', item);
                    return null;
                  }

                  return (
                    <div key={item.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                      <div className="flex flex-col lg:flex-row">
                        {/* Gallery Item Image */}
                        <div className="lg:w-1/4">
                          <div className="relative">
                            <img
                              src={item.media_url || 'https://via.placeholder.com/800x450'}
                              alt={item.title || 'Gallery item'}
                              className="w-full h-48 lg:h-full object-cover rounded-t-lg lg:rounded-l-lg lg:rounded-t-none"
                            />
                            <div className="absolute top-3 left-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(item.status || 'draft')} flex items-center`}>
                                {getStatusIcon(item.status || 'draft')}
                                <span className="ml-1 capitalize">{item.status || 'draft'}</span>
                              </span>
                            </div>
                            {item.is_featured && (
                              <div className="absolute top-3 right-3">
                                <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center">
                                  <Heart className="w-3 h-3 mr-1 fill-current" />
                                  Featured
                                </span>
                              </div>
                            )}
                            <div className="absolute bottom-3 left-3">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                item.type === 'video' ? 'bg-red-600 text-white' : 'bg-black bg-opacity-75 text-white'
                              }`}>
                                {item.type === 'video' ? (
                                  <div className="flex items-center">
                                    <Video className="w-3 h-3 mr-1" />
                                    Video
                                  </div>
                                ) : (
                                  <div className="flex items-center">
                                    <Camera className="w-3 h-3 mr-1" />
                                    Photo
                                  </div>
                                )}
                              </span>
                            </div>
                            {item.type === 'video' && item.duration && (
                              <div className="absolute bottom-3 right-3">
                                <span className="bg-black bg-opacity-75 text-white px-2 py-1 text-xs rounded">
                                  {item.duration}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Gallery Item Details */}
                        <div className="lg:w-3/4 p-6">
                          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                                {item.title || 'Untitled'}
                              </h3>
                              
                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                                <div className="flex items-center">
                                  <Calendar className="w-4 h-4 mr-2 text-purple-600" />
                                  <span>{item.event_date || 'No date'}</span>
                                </div>
                                <div className="flex items-center">
                                  <MapPin className="w-4 h-4 mr-2 text-purple-600" />
                                  <span>{item.location || 'No location'}</span>
                                </div>
                                <div className="flex items-center">
                                  <Users className="w-4 h-4 mr-2 text-purple-600" />
                                  <span className="capitalize">{item.category || 'No category'}</span>
                                </div>
                              </div>

                              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                                {item.description || 'No description'}
                              </p>
                            </div>
                          </div>

                          {/* Admin Actions */}
                          <div className="flex flex-wrap gap-3">
                            <button 
                              onClick={() => handleEditItem(item)}
                              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center text-sm font-medium transition-colors"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </button>

                            <button 
                              onClick={() => toggleFeatured(item.id)}
                              className={`border px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-colors ${
                                item.is_featured 
                                  ? 'border-yellow-300 bg-yellow-50 text-yellow-800 hover:bg-yellow-100' 
                                  : 'border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <Heart className={`w-4 h-4 mr-2 ${item.is_featured ? 'fill-current' : ''}`} />
                              {item.is_featured ? 'Unfeature' : 'Feature'}
                            </button>

                            <div className="relative">
                              <select
                                value={item.status || 'draft'}
                                onChange={(e) => handleStatusChange(item.id, e.target.value as GalleryItemStatus)}
                                className="border border-gray-300 px-3 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="archived">Archived</option>
                              </select>
                            </div>

                            <button 
                              onClick={() => handleDeleteItem(item.id)}
                              className="border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 flex items-center text-sm font-medium transition-colors"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </button>
                          </div>

                          {/* Metadata */}
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                              <span>Created: {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Unknown'}</span>
                              <span>Last Updated: {item.updated_at ? new Date(item.updated_at).toLocaleDateString() : 'Unknown'}</span>
                              <span>ID: #{item.id}</span>
                              {item.view_count !== undefined && (
                                <span>Views: {item.view_count}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No gallery items found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm 
                      ? "No items match your search criteria." 
                      : `No gallery items in the ${selectedFilter} category.`}
                  </p>
                  <button 
                    onClick={() => setShowCreateModal(true)}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 font-medium"
                  >
                    Create Your First Gallery Item
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredStoryItems.length > 0 ? (
                filteredStoryItems.filter(Boolean).map((item) => {
                  if (!item || !item.id) {
                    console.warn('Invalid story item found:', item);
                    return null;
                  }

                  return (
                    <div key={item.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                      <div className="flex flex-col lg:flex-row">
                        {/* Story Image */}
                        <div className="lg:w-1/4">
                          <div className="relative">
                            <img
                              src={item.image_url || 'https://via.placeholder.com/800x450'}
                              alt={item.title || 'Story image'}
                              className="w-full h-48 lg:h-full object-cover rounded-t-lg lg:rounded-l-lg lg:rounded-t-none"
                            />
                            <div className="absolute top-3 left-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(item.status || 'draft')} flex items-center`}>
                                {getStatusIcon(item.status || 'draft')}
                                <span className="ml-1 capitalize">{item.status || 'draft'}</span>
                              </span>
                            </div>
                            {item.is_featured && (
                              <div className="absolute top-3 right-3">
                                <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center">
                                  <Heart className="w-3 h-3 mr-1 fill-current" />
                                  Featured
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Story Details */}
                        <div className="lg:w-3/4 p-6">
                          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                                {item.title || 'Untitled Story'}
                              </h3>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="space-y-2">
                                  <div className="flex items-center text-gray-600 text-sm">
                                    <Users className="w-4 h-4 mr-2 text-purple-600" />
                                    <span className="font-medium">{item.patient_name || 'Unknown'}, {item.age || '?'} years</span>
                                  </div>
                                  <div className="flex items-center text-gray-600 text-sm">
                                    <BookOpen className="w-4 h-4 mr-2 text-purple-600" />
                                    <span className="font-medium">{item.condition || 'Not specified'}</span>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-center text-gray-600 text-sm">
                                    <MapPin className="w-4 h-4 mr-2 text-purple-600" />
                                    <span>{item.location || 'No location'}</span>
                                  </div>
                                  <div className="flex items-center text-gray-600 text-sm">
                                    <Calendar className="w-4 h-4 mr-2 text-purple-600" />
                                    <span>{item.story_date || 'No date'}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="mb-4">
                                <button 
                                  onClick={() => toggleExpand(item.id)}
                                  className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center text-sm font-medium transition-colors"
                                >
                                  {expandedItem === item.id ? (
                                    <>
                                      <ChevronUp className="w-4 h-4 mr-2" />
                                      Collapse Story
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown className="w-4 h-4 mr-2" />
                                      Expand Story
                                    </>
                                  )}
                                </button>
                              </div>

                              {expandedItem === item.id && (
                                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                  <h4 className="font-medium text-gray-900 mb-2">Full Story</h4>
                                  <p className="text-gray-600 text-sm whitespace-pre-line">
                                    {item.story || 'No story content'}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Admin Actions */}
                          <div className="flex flex-wrap gap-3">
                            <button 
                              onClick={() => handleEditItem(item)}
                              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center text-sm font-medium transition-colors"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </button>

                            <button 
                              onClick={() => toggleFeatured(item.id, true)}
                              className={`border px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-colors ${
                                item.is_featured 
                                  ? 'border-yellow-300 bg-yellow-50 text-yellow-800 hover:bg-yellow-100' 
                                  : 'border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <Heart className={`w-4 h-4 mr-2 ${item.is_featured ? 'fill-current' : ''}`} />
                              {item.is_featured ? 'Unfeature' : 'Feature'}
                            </button>

                            <div className="relative">
                              <select
                                value={item.status || 'draft'}
                                onChange={(e) => handleStatusChange(item.id, e.target.value as GalleryItemStatus, true)}
                                className="border border-gray-300 px-3 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="archived">Archived</option>
                              </select>
                            </div>

                            <button 
                              onClick={() => handleDeleteItem(item.id, true)}
                              className="border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 flex items-center text-sm font-medium transition-colors"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </button>
                          </div>

                          {/* Metadata */}
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                              <span>Created: {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Unknown'}</span>
                              <span>Last Updated: {item.updated_at ? new Date(item.updated_at).toLocaleDateString() : 'Unknown'}</span>
                              <span>ID: #{item.id}</span>
                              {item.view_count !== undefined && (
                                <span>Views: {item.view_count}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No stories found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm 
                      ? "No stories match your search criteria." 
                      : `No stories in the ${selectedFilter} category.`}
                  </p>
                  <button 
                    onClick={() => setShowCreateModal(true)}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 font-medium"
                  >
                    Create Your First Story
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <CreateGalleryItemModal 
        isOpen={showCreateModal} 
        onClose={handleCloseModal}
        onSave={editingItem ? handleUpdateItem : handleCreateItem}
        type={selectedTab}
        initialData={editingItem}
      />
    </div>
  );
};

export default GalleryTab;