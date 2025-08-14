import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Download, 
  Edit3, 
  Eye, 
  Trash2,
  Star,
  Bookmark,
  Printer,
  Share2,
  Search,
  Filter,
  FileText,
  User,
  Clock,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Upload
} from 'lucide-react';

type EBookletStatus = 'Published' | 'Draft' | 'Archived';
type FileFormat = 'PDF' | 'EPUB' | 'MOBI';

interface EBooklet {
  id: number;
  title: string;
  description: string;
  category: string;
  fileSize: string;
  pages: number;
  publicationDate: string;
  downloads: number;
  rating?: number;
  imageUrl: string;
  authors: string[];
  lastUpdated: string;
  targetAudience: string[];
  fileFormats: FileFormat[];
  status: EBookletStatus;
  isNew?: boolean;
  isFeatured?: boolean;
  createdAt: string;
  updatedAt: string;
}

const EBookletsTab = () => {
  const [selectedTab, setSelectedTab] = useState<'all' | 'published' | 'drafts' | 'archived' | 'featured'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedBooklet, setExpandedBooklet] = useState<number | null>(null);

  // Sample data for admin view
  const [allEBooklets, setAllEBooklets] = useState<EBooklet[]>([
    {
      id: 1,
      title: "Understanding Childhood Epilepsy: A Guide for African Parents",
      description: "Comprehensive guide explaining epilepsy in children, treatment options, and daily management strategies tailored for African families.",
      category: "Epilepsy",
      fileSize: "4.2 MB",
      pages: 36,
      publicationDate: "June 2025",
      downloads: 12500,
      rating: 4.7,
      imageUrl: "https://images.pexels.com/photos/4260325/pexels-photo-4260325.jpeg",
      authors: ["Dr. Amina Bello", "Prof. Kwame Mensah"],
      lastUpdated: "June 2025",
      targetAudience: ["Parents", "Caregivers"],
      fileFormats: ["PDF", "EPUB"],
      status: "Published",
      isFeatured: true,
      createdAt: "2025-05-15",
      updatedAt: "2025-06-01"
    },
    {
      id: 2,
      title: "Cerebral Palsy: Early Intervention Strategies for Community Health Workers",
      description: "Practical manual for community health workers on identifying early signs of cerebral palsy and implementing low-cost interventions.",
      category: "Cerebral Palsy",
      fileSize: "3.8 MB",
      pages: 42,
      publicationDate: "May 2025",
      downloads: 8700,
      rating: 4.5,
      imageUrl: "https://images.pexels.com/photos/4260323/pexels-photo-4260323.jpeg",
      authors: ["Dr. Fatoumata Diallo"],
      lastUpdated: "May 2025",
      targetAudience: ["Health Workers", "Community Volunteers"],
      fileFormats: ["PDF"],
      status: "Published",
      isNew: true,
      createdAt: "2025-04-10",
      updatedAt: "2025-05-15"
    },
    {
      id: 3,
      title: "Autism Spectrum Disorders: A Handbook for African Educators",
      description: "Classroom strategies and educational approaches for supporting children with autism in African school settings.",
      category: "Autism",
      fileSize: "5.1 MB",
      pages: 28,
      publicationDate: "April 2025",
      downloads: 6300,
      rating: 4.3,
      imageUrl: "https://images.pexels.com/photos/5212359/pexels-photo-5212359.jpeg",
      authors: ["Dr. Ngozi Eze", "Dr. Hassan Abdi"],
      lastUpdated: "April 2025",
      targetAudience: ["Teachers", "School Administrators"],
      fileFormats: ["PDF", "EPUB"],
      status: "Published",
      createdAt: "2025-03-20",
      updatedAt: "2025-04-10"
    },
    {
      id: 4,
      title: "Nutrition for Brain Development: Traditional African Foods That Help",
      description: "Guide to locally available foods that support optimal brain development in children, with culturally appropriate recipes.",
      category: "Nutrition",
      fileSize: "2.9 MB",
      pages: 24,
      publicationDate: "March 2025",
      downloads: 9100,
      rating: 4.8,
      imageUrl: "https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg",
      authors: ["Dr. Wanjiku Mwangi", "Nutritionist Aisha Kamara"],
      lastUpdated: "March 2025",
      targetAudience: ["Parents", "Community Health Workers"],
      fileFormats: ["PDF"],
      status: "Draft",
      createdAt: "2025-02-15",
      updatedAt: "2025-03-01"
    },
    {
      id: 5,
      title: "First Aid for Seizures: What Every African Community Should Know",
      description: "Illustrated guide to seizure first aid, dispelling myths and providing culturally appropriate response techniques.",
      category: "Epilepsy",
      fileSize: "3.5 MB",
      pages: 20,
      publicationDate: "February 2025",
      downloads: 15200,
      rating: 4.9,
      imageUrl: "https://images.pexels.com/photos/3985163/pexels-photo-3985163.jpeg",
      authors: ["Dr. Chukwuma Okafor"],
      lastUpdated: "February 2025",
      targetAudience: ["General Public", "Teachers"],
      fileFormats: ["PDF", "EPUB"],
      status: "Published",
      isFeatured: true,
      createdAt: "2025-01-10",
      updatedAt: "2025-02-01"
    }
  ]);

  const categories = ["all", "Epilepsy", "Cerebral Palsy", "Autism", "Nutrition", "Child Development", "Mental Health"];
  const audiences = ["all", "Parents", "Caregivers", "Teachers", "Health Workers", "Community Volunteers", "General Public"];

  const getStatusColor = (status: EBookletStatus) => {
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

  const handleStatusChange = (ebookletId: number, newStatus: EBookletStatus) => {
    setAllEBooklets(prev => 
      prev.map(ebook => 
        ebook.id === ebookletId 
          ? { ...ebook, status: newStatus, updatedAt: new Date().toISOString().split('T')[0] }
          : ebook
      )
    );
  };

  const filteredEBooklets = allEBooklets.filter(ebook => {
    const matchesTab = 
      selectedTab === 'all' || 
      (selectedTab === 'published' && ebook.status === 'Published') ||
      (selectedTab === 'drafts' && ebook.status === 'Draft') ||
      (selectedTab === 'archived' && ebook.status === 'Archived') ||
      (selectedTab === 'featured' && ebook.isFeatured);
    
    const matchesSearch =
      ebook.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ebook.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  const formatDownloadCount = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const renderRatingStars = (rating?: number) => {
    if (!rating) return null;
    
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating.toFixed(1)})</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white border border-gray-300 rounded-lg">
        <div className="bg-indigo-50 px-6 py-4 border-b border-gray-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <BookOpen className="w-7 h-7 mr-3 text-indigo-600" />
                E-Booklet Management
              </h2>
              <p className="text-gray-600 mt-1">Manage downloadable educational resources and publications</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center font-medium transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Upload E-Booklet
              </button>
              <button className="border border-indigo-600 text-indigo-600 px-6 py-2 rounded-lg hover:bg-indigo-50 flex items-center font-medium transition-colors">
                <BarChart3 className="w-5 h-5 mr-2" />
                Analytics
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <nav className="flex space-x-8">
              {[
                { id: 'all', label: 'All', count: allEBooklets.length },
                { id: 'published', label: 'Published', count: allEBooklets.filter(e => e.status === 'Published').length },
                { id: 'drafts', label: 'Drafts', count: allEBooklets.filter(e => e.status === 'Draft').length },
                { id: 'archived', label: 'Archived', count: allEBooklets.filter(e => e.status === 'Archived').length },
                { id: 'featured', label: 'Featured', count: allEBooklets.filter(e => e.isFeatured).length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`py-2 border-b-2 font-medium text-sm transition-colors ${
                    selectedTab === tab.id
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
            <div className="mt-3 md:mt-0 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search e-booklets..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          <div className="space-y-6">
            {filteredEBooklets.length > 0 ? (
              filteredEBooklets.map((ebook) => (
                <div key={ebook.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                  <div className="flex flex-col lg:flex-row">
                    {/* E-Booklet Image */}
                    <div className="lg:w-1/4">
                      <div className="relative">
                        <img
                          src={ebook.imageUrl}
                          alt={ebook.title}
                          className="w-full h-48 lg:h-full object-cover rounded-t-lg lg:rounded-l-lg lg:rounded-t-none"
                        />
                        <div className="absolute top-3 left-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(ebook.status)}`}>
                            {ebook.status}
                          </span>
                        </div>
                        {ebook.isFeatured && (
                          <div className="absolute top-3 right-3">
                            <Star className="w-5 h-5 text-yellow-500 fill-current" />
                          </div>
                        )}
                        {ebook.isNew && (
                          <div className="absolute bottom-3 right-3">
                            <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                              NEW
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* E-Booklet Details */}
                    <div className="lg:w-3/4 p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                            {ebook.title}
                          </h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                            <div className="space-y-2">
                              <div className="flex items-center text-gray-600 text-sm">
                                <FileText className="w-4 h-4 mr-2 text-indigo-600" />
                                <span className="font-medium">{ebook.category}</span>
                              </div>
                              <div className="flex items-center text-gray-600 text-sm">
                                <User className="w-4 h-4 mr-2 text-indigo-600" />
                                <span>{ebook.authors.join(', ')}</span>
                              </div>
                              <div className="flex items-center text-gray-600 text-sm">
                                <Clock className="w-4 h-4 mr-2 text-indigo-600" />
                                <span>Published: {ebook.publicationDate}</span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center text-gray-600 text-sm">
                                <span className="font-medium">{ebook.pages} pages • {ebook.fileSize}</span>
                              </div>
                              <div className="flex items-center text-gray-600 text-sm">
                                <Download className="w-4 h-4 mr-2 text-indigo-600" />
                                <span>{formatDownloadCount(ebook.downloads)} downloads</span>
                              </div>
                              {ebook.rating && (
                                <div className="flex items-center text-gray-600 text-sm">
                                  {renderRatingStars(ebook.rating)}
                                </div>
                              )}
                            </div>
                          </div>

                          <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                            {ebook.description}
                          </p>

                          {/* Target Audience */}
                          <div className="mb-4">
                            <h4 className="font-semibold text-gray-900 text-sm mb-1">Target Audience:</h4>
                            <div className="flex flex-wrap gap-1">
                              {ebook.targetAudience.map((audience, index) => (
                                <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 text-xs rounded">
                                  {audience}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* File Formats */}
                          <div className="mb-4">
                            <h4 className="font-semibold text-gray-900 text-sm mb-1">Formats Available:</h4>
                            <div className="flex flex-wrap gap-1">
                              {ebook.fileFormats.map((format, index) => (
                                <span key={index} className="bg-green-100 text-green-800 px-2 py-1 text-xs rounded">
                                  {format}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Admin Actions */}
                      <div className="flex flex-wrap gap-3">
                        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center text-sm font-medium transition-colors">
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit Details
                        </button>

                        <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center text-sm font-medium transition-colors">
                          <Download className="w-4 h-4 mr-2" />
                          Download Files
                        </button>

                        <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center text-sm font-medium transition-colors">
                          <Upload className="w-4 h-4 mr-2" />
                          Update Files
                        </button>

                        <div className="relative">
                          <select
                            value={ebook.status}
                            onChange={(e) => handleStatusChange(ebook.id, e.target.value as EBookletStatus)}
                            className="border border-gray-300 px-3 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          >
                            <option value="Published">Published</option>
                            <option value="Draft">Draft</option>
                            <option value="Archived">Archive</option>
                          </select>
                        </div>

                        <button 
                          onClick={() => setAllEBooklets(prev => 
                            prev.map(e => e.id === ebook.id ? {...e, isFeatured: !e.isFeatured} : e)
                          )}
                          className={`border px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-colors ${
                            ebook.isFeatured 
                              ? 'border-yellow-300 bg-yellow-50 text-yellow-800 hover:bg-yellow-100' 
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <Star className={`w-4 h-4 mr-2 ${ebook.isFeatured ? 'fill-current' : ''}`} />
                          {ebook.isFeatured ? 'Unfeature' : 'Feature'}
                        </button>
                      </div>

                      {/* Metadata */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                          <span>Created: {ebook.createdAt}</span>
                          <span>Last Updated: {ebook.updatedAt}</span>
                          <span>ID: #{ebook.id}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No e-booklets found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm 
                    ? "No e-booklets match your search criteria." 
                    : `No e-booklets in the ${selectedTab} category.`}
                </p>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium"
                >
                  Upload Your First E-Booklet
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EBookletsTab;