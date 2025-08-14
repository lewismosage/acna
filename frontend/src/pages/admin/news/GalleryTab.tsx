import React, { useState } from 'react';
import { 
  Camera, 
  Video, 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  Download, 
  Share2, 
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
  ChevronUp
} from 'lucide-react';
import CreateGalleryItemModal from './CreateGalleryItemModal';

type GalleryItemStatus = 'Published' | 'Draft' | 'Archived';
type GalleryItemType = 'photo' | 'video';

export interface GalleryItem {
  id: number;
  type: GalleryItemType;
  title: string;
  category: string;
  date: string;
  location: string;
  description: string;
  imageUrl: string;
  thumbnailUrl: string;
  duration?: string;
  status: GalleryItemStatus;
  createdAt: string;
  updatedAt: string;
  isFeatured?: boolean;
}

interface StoryItem {
  id: number;
  title: string;
  patientName: string;
  age: number;
  condition: string;
  location: string;
  date: string;
  story: string;
  imageUrl: string;
  status: GalleryItemStatus;
  createdAt: string;
  updatedAt: string;
  isFeatured?: boolean;
}

interface GalleryTabProps {
  galleryItems: GalleryItem[];
  storyItems: StoryItem[];
}

const GalleryTab: React.FC<GalleryTabProps> = ({  }) => {
  const [selectedTab, setSelectedTab] = useState<'gallery' | 'stories'>('gallery');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'published' | 'drafts' | 'archived'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItem, setExpandedItem] = useState<number | null>(null);

  // Sample data for admin view
  const [allGalleryItems, setAllGalleryItems] = useState<GalleryItem[]>([
    {
      id: 1,
      type: 'photo',
      title: "ACNA Annual Conference 2025 - Opening Ceremony",
      category: "conferences",
      date: "July 10, 2025",
      location: "Kampala, Uganda",
      description: "Healthcare professionals from across Africa gathered for the opening ceremony of our flagship annual conference.",
      imageUrl: "https://images.pexels.com/photos/1181438/pexels-photo-1181438.jpeg?auto=compress&cs=tinysrgb&w=800",
      thumbnailUrl: "https://images.pexels.com/photos/1181438/pexels-photo-1181438.jpeg?auto=compress&cs=tinysrgb&w=400",
      status: "Published",
      createdAt: "2025-07-10",
      updatedAt: "2025-07-10",
      isFeatured: true
    },
    {
      id: 2,
      type: 'video',
      title: "Pediatric Neurology Training Workshop Highlights",
      category: "training",
      date: "September 5, 2025",
      location: "Lagos, Nigeria",
      description: "Key moments from our intensive training program for healthcare workers in pediatric neurological care.",
      imageUrl: "https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=800",
      thumbnailUrl: "https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=400",
      duration: "4:32",
      status: "Published",
      createdAt: "2025-09-01",
      updatedAt: "2025-09-05"
    },
    {
      id: 3,
      type: 'photo',
      title: "Community Outreach Program - Epilepsy Awareness",
      category: "community",
      date: "August 22, 2025",
      location: "Cape Town, South Africa",
      description: "Community members participating in our epilepsy awareness and education program.",
      imageUrl: "https://images.pexels.com/photos/3184638/pexels-photo-3184638.jpeg?auto=compress&cs=tinysrgb&w=800",
      thumbnailUrl: "https://images.pexels.com/photos/3184638/pexels-photo-3184638.jpeg?auto=compress&cs=tinysrgb&w=400",
      status: "Draft",
      createdAt: "2025-08-20",
      updatedAt: "2025-08-20"
    },
    {
      id: 4,
      type: 'photo',
      title: "Medical Equipment Donation Ceremony",
      category: "events",
      date: "August 15, 2025",
      location: "Nairobi, Kenya",
      description: "State-of-the-art neurological diagnostic equipment being donated to local healthcare facilities.",
      imageUrl: "https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=800",
      thumbnailUrl: "https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=400",
      status: "Archived",
      createdAt: "2025-08-10",
      updatedAt: "2025-08-15"
    }
  ]);

  const [allStoryItems, setAllStoryItems] = useState<StoryItem[]>([
    {
      id: 1,
      title: "From Seizures to School: Amina's Journey",
      patientName: "Amina Diallo",
      age: 8,
      condition: "Epilepsy",
      location: "Dakar, Senegal",
      date: "June 15, 2025",
      story: "Amina was diagnosed with epilepsy at age 5 and suffered frequent seizures that kept her out of school. Through our community epilepsy program, she received proper medication and support. Today, she's seizure-free and thriving in her second year of school.",
      imageUrl: "https://images.pexels.com/photos/5214907/pexels-photo-5214907.jpeg?auto=compress&cs=tinysrgb&w=800",
      status: "Published",
      createdAt: "2025-06-10",
      updatedAt: "2025-06-15",
      isFeatured: true
    },
    {
      id: 2,
      title: "Overcoming Cerebral Palsy: Kwame's Story",
      patientName: "Kwame Osei",
      age: 6,
      condition: "Cerebral Palsy",
      location: "Accra, Ghana",
      date: "May 28, 2025",
      story: "Kwame was born with cerebral palsy and had difficulty walking. Our early intervention program provided physical therapy and mobility aids. After 18 months of therapy, Kwame took his first independent steps.",
      imageUrl: "https://images.pexels.com/photos/4260323/pexels-photo-4260323.jpeg?auto=compress&cs=tinysrgb&w=800",
      status: "Published",
      createdAt: "2025-05-20",
      updatedAt: "2025-05-28"
    },
    {
      id: 3,
      title: "Diagnosed at Last: Fatima's Autism Journey",
      patientName: "Fatima Nkosi",
      age: 7,
      condition: "Autism Spectrum Disorder",
      location: "Johannesburg, South Africa",
      date: "April 10, 2025",
      story: "Fatima was misdiagnosed for years before our specialists correctly identified her autism. With proper therapy and support, she's made remarkable progress in communication and social skills.",
      imageUrl: "https://images.pexels.com/photos/3952048/pexels-photo-3952048.jpeg?auto=compress&cs=tinysrgb&w=800",
      status: "Draft",
      createdAt: "2025-04-05",
      updatedAt: "2025-04-10"
    }
  ]);

  const getStatusColor = (status: GalleryItemStatus) => {
    switch (status) {
      case 'Published':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Archived':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: GalleryItemStatus) => {
    switch (status) {
      case 'Published':
        return <CheckCircle className="w-4 h-4" />;
      case 'Draft':
        return <Clock className="w-4 h-4" />;
      case 'Archived':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Camera className="w-4 h-4" />;
    }
  };

  const handleStatusChange = (id: number, newStatus: GalleryItemStatus, isStory: boolean = false) => {
    if (isStory) {
      setAllStoryItems(prev => 
        prev.map(item => 
          item.id === id 
            ? { ...item, status: newStatus, updatedAt: new Date().toISOString().split('T')[0] }
            : item
        )
      );
    } else {
      setAllGalleryItems(prev => 
        prev.map(item => 
          item.id === id 
            ? { ...item, status: newStatus, updatedAt: new Date().toISOString().split('T')[0] }
            : item
        )
      );
    }
  };

  const handleCreateItem = (newItem: GalleryItem | StoryItem) => {
    if ('type' in newItem) {
      setAllGalleryItems(prev => [newItem as GalleryItem, ...prev]);
    } else {
      setAllStoryItems(prev => [newItem as StoryItem, ...prev]);
    }
    setShowCreateModal(false);
  };

  const toggleFeatured = (id: number, isStory: boolean = false) => {
    if (isStory) {
      setAllStoryItems(prev => 
        prev.map(item => 
          item.id === id 
            ? { ...item, isFeatured: !item.isFeatured }
            : item
        )
      );
    } else {
      setAllGalleryItems(prev => 
        prev.map(item => 
          item.id === id 
            ? { ...item, isFeatured: !item.isFeatured }
            : item
        )
      );
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  const filteredGalleryItems = allGalleryItems.filter(item => {
    switch (selectedFilter) {
      case 'published':
        return item.status === 'Published';
      case 'drafts':
        return item.status === 'Draft';
      case 'archived':
        return item.status === 'Archived';
      default:
        return true;
    }
  }).filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredStoryItems = allStoryItems.filter(item => {
    switch (selectedFilter) {
      case 'published':
        return item.status === 'Published';
      case 'drafts':
        return item.status === 'Draft';
      case 'archived':
        return item.status === 'Archived';
      default:
        return true;
    }
  }).filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.condition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    gallery: {
      total: allGalleryItems.length,
      published: allGalleryItems.filter(i => i.status === 'Published').length,
      drafts: allGalleryItems.filter(i => i.status === 'Draft').length,
      archived: allGalleryItems.filter(i => i.status === 'Archived').length,
    },
    stories: {
      total: allStoryItems.length,
      published: allStoryItems.filter(i => i.status === 'Published').length,
      drafts: allStoryItems.filter(i => i.status === 'Draft').length,
      archived: allStoryItems.filter(i => i.status === 'Archived').length,
    }
  };

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
              <button className="border border-purple-600 text-purple-600 px-6 py-2 rounded-lg hover:bg-purple-50 flex items-center font-medium transition-colors">
                <Download className="w-5 h-5 mr-2" />
                Export
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
              { id: 'drafts', label: 'Drafts', count: selectedTab === 'gallery' ? stats.gallery.drafts : stats.stories.drafts },
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
                filteredGalleryItems.map((item) => (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                    <div className="flex flex-col lg:flex-row">
                      {/* Gallery Item Image */}
                      <div className="lg:w-1/4">
                        <div className="relative">
                          <img
                            src={item.thumbnailUrl}
                            alt={item.title}
                            className="w-full h-48 lg:h-full object-cover rounded-t-lg lg:rounded-l-lg lg:rounded-t-none"
                          />
                          <div className="absolute top-3 left-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(item.status)} flex items-center`}>
                              {getStatusIcon(item.status)}
                              <span className="ml-1">{item.status}</span>
                            </span>
                          </div>
                          {item.isFeatured && (
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
                              {item.title}
                            </h3>
                            
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2 text-purple-600" />
                                <span>{item.date}</span>
                              </div>
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-2 text-purple-600" />
                                <span>{item.location}</span>
                              </div>
                              <div className="flex items-center">
                                <Users className="w-4 h-4 mr-2 text-purple-600" />
                                <span className="capitalize">{item.category}</span>
                              </div>
                            </div>

                            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </div>

                        {/* Admin Actions */}
                        <div className="flex flex-wrap gap-3">
                          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center text-sm font-medium transition-colors">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </button>


                          <button 
                            onClick={() => toggleFeatured(item.id)}
                            className={`border px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-colors ${
                              item.isFeatured 
                                ? 'border-yellow-300 bg-yellow-50 text-yellow-800 hover:bg-yellow-100' 
                                : 'border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <Heart className={`w-4 h-4 mr-2 ${item.isFeatured ? 'fill-current' : ''}`} />
                            {item.isFeatured ? 'Unfeature' : 'Feature'}
                          </button>

                          <div className="relative">
                            <select
                              value={item.status}
                              onChange={(e) => handleStatusChange(item.id, e.target.value as GalleryItemStatus)}
                              className="border border-gray-300 px-3 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                              <option value="Draft">Draft</option>
                              <option value="Published">Published</option>
                              <option value="Archived">Archived</option>
                            </select>
                          </div>
                        </div>

                        {/* Metadata */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                            <span>Created: {item.createdAt}</span>
                            <span>Last Updated: {item.updatedAt}</span>
                            <span>ID: #{item.id}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
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
                filteredStoryItems.map((item) => (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                    <div className="flex flex-col lg:flex-row">
                      {/* Story Image */}
                      <div className="lg:w-1/4">
                        <div className="relative">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-48 lg:h-full object-cover rounded-t-lg lg:rounded-l-lg lg:rounded-t-none"
                          />
                          <div className="absolute top-3 left-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(item.status)} flex items-center`}>
                              {getStatusIcon(item.status)}
                              <span className="ml-1">{item.status}</span>
                            </span>
                          </div>
                          {item.isFeatured && (
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
                              {item.title}
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div className="space-y-2">
                                <div className="flex items-center text-gray-600 text-sm">
                                  <Users className="w-4 h-4 mr-2 text-purple-600" />
                                  <span className="font-medium">{item.patientName}, {item.age} years</span>
                                </div>
                                <div className="flex items-center text-gray-600 text-sm">
                                  <BookOpen className="w-4 h-4 mr-2 text-purple-600" />
                                  <span className="font-medium">{item.condition}</span>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center text-gray-600 text-sm">
                                  <MapPin className="w-4 h-4 mr-2 text-purple-600" />
                                  <span>{item.location}</span>
                                </div>
                                <div className="flex items-center text-gray-600 text-sm">
                                  <Calendar className="w-4 h-4 mr-2 text-purple-600" />
                                  <span>{item.date}</span>
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
                                  {item.story}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Admin Actions */}
                        <div className="flex flex-wrap gap-3">
                          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center text-sm font-medium transition-colors">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </button>

                          <button 
                            onClick={() => toggleFeatured(item.id, true)}
                            className={`border px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-colors ${
                              item.isFeatured 
                                ? 'border-yellow-300 bg-yellow-50 text-yellow-800 hover:bg-yellow-100' 
                                : 'border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <Heart className={`w-4 h-4 mr-2 ${item.isFeatured ? 'fill-current' : ''}`} />
                            {item.isFeatured ? 'Unfeature' : 'Feature'}
                          </button>

                          <div className="relative">
                            <select
                              value={item.status}
                              onChange={(e) => handleStatusChange(item.id, e.target.value as GalleryItemStatus, true)}
                              className="border border-gray-300 px-3 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                              <option value="Draft">Draft</option>
                              <option value="Published">Published</option>
                              <option value="Archived">Archived</option>
                            </select>
                          </div>
                        </div>

                        {/* Metadata */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                            <span>Created: {item.createdAt}</span>
                            <span>Last Updated: {item.updatedAt}</span>
                            <span>ID: #{item.id}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
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

      {/* Create Modal */}
      <CreateGalleryItemModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateItem}
        type={selectedTab}
      />
    </div>
  );
};

export default GalleryTab;