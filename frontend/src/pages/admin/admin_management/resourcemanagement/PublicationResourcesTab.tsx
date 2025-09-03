import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Edit3, 
  Eye, 
  Trash2, 
  Download,
  ExternalLink,
  ArrowRight,
  BarChart3,
  BookOpen,
  Clock,
  User,
  Award,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

type PublicationStatus = 'Published' | 'Draft' | 'Archived';
type PublicationType = 'Research Paper' | 'Clinical Guidelines' | 'Educational Resource' | 'Policy Brief' | 'Research Report';

interface Publication {
  id: number;
  title: string;
  authors: string;
  journal?: string;
  date: string;
  doi?: string;
  excerpt: string;
  type: PublicationType;
  status: PublicationStatus;
  downloads: number;
  imageUrl: string;
  category: string;
  isFeatured?: boolean;
  accessType: 'Open Access' | 'Free Access' | 'Member Access';
  createdAt: string;
  updatedAt: string;
}

const PublicationResourcesTab = () => {
  const [selectedTab, setSelectedTab] = useState<'all' | 'published' | 'drafts' | 'archived' | 'featured'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedPublication, setExpandedPublication] = useState<number | null>(null);

  // Sample data for admin view
  const [allPublications, setAllPublications] = useState<Publication[]>([
    {
      id: 1,
      title: "Epidemiology of pediatric epilepsy in sub-Saharan Africa: A multi-center prospective study",
      authors: "Dr. Amara Kone, Dr. Michael Okonkwo, Dr. Sarah Mwangi",
      journal: "African Journal of Neurological Sciences",
      date: "July 2025",
      doi: "10.1016/j.ajns.2025.07.001",
      excerpt: "This comprehensive study across 12 African countries reveals critical insights into the prevalence, risk factors, and treatment gaps for pediatric epilepsy, providing evidence-based recommendations for improved care strategies.",
      type: "Research Paper",
      status: "Published",
      downloads: 1245,
      imageUrl: "https://images.pexels.com/photos/3985163/pexels-photo-3985163.jpeg",
      category: "Epilepsy",
      isFeatured: true,
      accessType: "Open Access",
      createdAt: "2025-06-15",
      updatedAt: "2025-07-01"
    },
    {
      id: 2,
      title: "Evidence-based Guidelines for Managing Pediatric Epilepsy in Resource-limited Settings",
      authors: "ACNA Guidelines Committee",
      date: "August 2025",
      excerpt: "Comprehensive clinical guidelines for managing pediatric epilepsy in African healthcare settings with limited resources.",
      type: "Clinical Guidelines",
      status: "Published",
      downloads: 876,
      imageUrl: "https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg",
      category: "Practice Guidelines",
      accessType: "Open Access",
      createdAt: "2025-07-10",
      updatedAt: "2025-08-01"
    },
    {
      id: 3,
      title: "Interactive Case Studies in African Child Neurology: A Digital Learning Platform",
      authors: "Dr. Fatima Al-Rashid, Dr. James Mbeki",
      date: "July 2025",
      excerpt: "Digital platform featuring interactive case studies for training healthcare professionals in pediatric neurology across Africa.",
      type: "Educational Resource",
      status: "Published",
      downloads: 543,
      imageUrl: "https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg",
      category: "Medical Education",
      accessType: "Free Access",
      createdAt: "2025-06-20",
      updatedAt: "2025-07-15"
    },
    {
      id: 4,
      title: "Strengthening Pediatric Neurological Services: Policy Recommendations for African Governments",
      authors: "ACNA Policy Working Group",
      date: "June 2025",
      excerpt: "Policy recommendations for improving pediatric neurological services across African healthcare systems.",
      type: "Policy Brief",
      status: "Draft",
      downloads: 0,
      imageUrl: "https://images.pexels.com/photos/4386339/pexels-photo-4386339.jpeg",
      category: "Health Policy",
      accessType: "Open Access",
      createdAt: "2025-05-15",
      updatedAt: "2025-06-10"
    },
    {
      id: 5,
      title: "Annual Report: State of Child Neurology in Africa 2025",
      authors: "ACNA Research Division",
      date: "May 2025",
      excerpt: "Comprehensive annual report on the state of child neurology services, research, and education across Africa.",
      type: "Research Report",
      status: "Published",
      downloads: 987,
      imageUrl: "https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg",
      category: "Annual Report",
      isFeatured: true,
      accessType: "Free Access",
      createdAt: "2025-04-20",
      updatedAt: "2025-05-15"
    }
  ]);

  const getStatusColor = (status: PublicationStatus) => {
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

  const getAccessTypeColor = (accessType: Publication['accessType']) => {
    switch (accessType) {
      case 'Open Access':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Free Access':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Member Access':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleStatusChange = (publicationId: number, newStatus: PublicationStatus) => {
    setAllPublications(prev => 
      prev.map(pub => 
        pub.id === publicationId 
          ? { ...pub, status: newStatus, updatedAt: new Date().toISOString().split('T')[0] }
          : pub
      )
    );
  };

  const filteredPublications = allPublications.filter(pub => {
    const matchesTab = 
      selectedTab === 'all' || 
      (selectedTab === 'published' && pub.status === 'Published') ||
      (selectedTab === 'drafts' && pub.status === 'Draft') ||
      (selectedTab === 'archived' && pub.status === 'Archived') ||
      (selectedTab === 'featured' && pub.isFeatured);
    
    const matchesSearch =
      pub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pub.authors.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pub.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  const formatDownloadCount = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white border border-gray-300 rounded-lg">
        <div className="bg-blue-50 px-6 py-4 border-b border-gray-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <BookOpen className="w-7 h-7 mr-3 text-blue-600" />
                Publication Resources
              </h2>
              <p className="text-gray-600 mt-1">Manage research papers, clinical guidelines, and educational resources</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center font-medium transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Publication
              </button>
              <button className="border border-blue-600 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 flex items-center font-medium transition-colors">
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
                { id: 'all', label: 'All', count: allPublications.length },
                { id: 'published', label: 'Published', count: allPublications.filter(p => p.status === 'Published').length },
                { id: 'drafts', label: 'Drafts', count: allPublications.filter(p => p.status === 'Draft').length },
                { id: 'archived', label: 'Archived', count: allPublications.filter(p => p.status === 'Archived').length },
                { id: 'featured', label: 'Featured', count: allPublications.filter(p => p.isFeatured).length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`py-2 border-b-2 font-medium text-sm transition-colors ${
                    selectedTab === tab.id
                      ? 'border-blue-600 text-blue-600'
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
                placeholder="Search publications..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          <div className="space-y-6">
            {filteredPublications.length > 0 ? (
              filteredPublications.map((pub) => (
                <div key={pub.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                  <div className="flex flex-col lg:flex-row">
                    {/* Publication Image */}
                    <div className="lg:w-1/4">
                      <div className="relative">
                        <img
                          src={pub.imageUrl}
                          alt={pub.title}
                          className="w-full h-48 lg:h-full object-cover rounded-t-lg lg:rounded-l-lg lg:rounded-t-none"
                        />
                        <div className="absolute top-3 left-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(pub.status)}`}>
                            {pub.status}
                          </span>
                        </div>
                        {pub.isFeatured && (
                          <div className="absolute top-3 right-3">
                            <Award className="w-5 h-5 text-yellow-500 fill-current" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Publication Details */}
                    <div className="lg:w-3/4 p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                            {pub.title}
                          </h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                            <div className="space-y-2">
                              <div className="flex items-center text-gray-600 text-sm">
                                <User className="w-4 h-4 mr-2 text-blue-600" />
                                <span>{pub.authors}</span>
                              </div>
                              {pub.journal && (
                                <div className="flex items-center text-gray-600 text-sm">
                                  <FileText className="w-4 h-4 mr-2 text-blue-600" />
                                  <span>{pub.journal}</span>
                                </div>
                              )}
                              <div className="flex items-center text-gray-600 text-sm">
                                <Clock className="w-4 h-4 mr-2 text-blue-600" />
                                <span>{pub.date}</span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center text-gray-600 text-sm">
                                <span className="font-medium">{pub.type}</span>
                              </div>
                              <div className="flex items-center text-gray-600 text-sm">
                                <span className={`px-2 py-1 rounded-full text-xs ${getAccessTypeColor(pub.accessType)}`}>
                                  {pub.accessType}
                                </span>
                              </div>
                              <div className="flex items-center text-gray-600 text-sm">
                                <Download className="w-4 h-4 mr-2 text-blue-600" />
                                <span>{formatDownloadCount(pub.downloads)} downloads</span>
                              </div>
                            </div>
                          </div>

                          <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                            {pub.excerpt}
                          </p>

                          {pub.doi && (
                            <div className="mb-4">
                              <h4 className="font-semibold text-gray-900 text-sm mb-1">DOI:</h4>
                              <p className="text-gray-600 text-sm">{pub.doi}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Admin Actions */}
                      <div className="flex flex-wrap gap-3">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center text-sm font-medium transition-colors">
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit Details
                        </button>

                        <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center text-sm font-medium transition-colors">
                          <Download className="w-4 h-4 mr-2" />
                          Download Files
                        </button>

                        <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center text-sm font-medium transition-colors">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View External Link
                        </button>

                        <div className="relative">
                          <select
                            value={pub.status}
                            onChange={(e) => handleStatusChange(pub.id, e.target.value as PublicationStatus)}
                            className="border border-gray-300 px-3 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="Published">Published</option>
                            <option value="Draft">Draft</option>
                            <option value="Archived">Archive</option>
                          </select>
                        </div>

                        <button 
                          onClick={() => setAllPublications(prev => 
                            prev.map(p => p.id === pub.id ? {...p, isFeatured: !p.isFeatured} : p)
                          )}
                          className={`border px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-colors ${
                            pub.isFeatured 
                              ? 'border-yellow-300 bg-yellow-50 text-yellow-800 hover:bg-yellow-100' 
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <Award className={`w-4 h-4 mr-2 ${pub.isFeatured ? 'fill-current' : ''}`} />
                          {pub.isFeatured ? 'Unfeature' : 'Feature'}
                        </button>
                      </div>

                      {/* Metadata */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                          <span>Created: {pub.createdAt}</span>
                          <span>Last Updated: {pub.updatedAt}</span>
                          <span>ID: #{pub.id}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No publications found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm 
                    ? "No publications match your search criteria." 
                    : `No publications in the ${selectedTab} category.`}
                </p>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
                >
                  Add Your First Publication
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicationResourcesTab;