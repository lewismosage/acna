import React, { useState } from 'react';
import { 
  Newspaper, 
  Plus, 
  Edit, 
  Eye, 
  Star,
  Mail,
  Phone,
  Trash2, 
  Calendar, 
  Clock, 
  User, 
  Download, 
  BarChart2,
  Search,
  CheckCircle,
  AlertCircle,
  Clock as DraftIcon,
  Share2,
  Tag,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';
import CreateNewsModal from './CreateNewsModal';

type NewsStatus = 'Published' | 'Draft' | 'Archived';
type NewsType = 'News Article' | 'Press Release' | 'Announcement' | 'Research Update';

export interface NewsItem {
  id: number;
  title: string;
  subtitle?: string;
  type: NewsType;
  status: NewsStatus;
  category: string;
  date: string;
  readTime: string;
  views: number;
  imageUrl: string;
  content: {
    introduction: string;
    sections: {
      heading: string;
      content: string;
    }[];
    conclusion?: string;
  };
  author?: {
    name: string;
    title: string;
    organization: string;
    bio: string;
    imageUrl: string;
  };
  tags: string[];
  source?: {
    name: string;
    url: string;
  };
  contact?: {
    name: string;
    email: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
  isFeatured?: boolean;
}

interface NewsTabProps {
  newsItems: NewsItem[];
}

const NewsTab: React.FC<NewsTabProps> = ({ newsItems: initialNewsItems }) => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>(initialNewsItems);
  const [selectedTab, setSelectedTab] = useState<'all' | 'published' | 'drafts' | 'archived'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedNews, setExpandedNews] = useState<number | null>(null);

  // Sample data for admin view
  const [allNews, setAllNews] = useState<NewsItem[]>([
    {
      id: 1,
      title: "Building Stronger Pediatric Neurology Services Across Africa",
      subtitle: "How ACNA is transforming neurological care through innovative training programs",
      type: "News Article",
      status: "Published",
      category: "Healthcare Systems",
      date: "July 15, 2025",
      readTime: "8 min read",
      views: 1247,
      imageUrl: "https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=800",
      content: {
        introduction: "The African Child Neurology Association (ACNA) continues to make significant strides in improving pediatric neurological care across the continent.",
        sections: [
          {
            heading: "Addressing the Healthcare Gap",
            content: "Africa faces a significant shortage of pediatric neurologists, with fewer than 200 specialists serving over 400 million children across the continent."
          },
          {
            heading: "Innovative Training Programs",
            content: "ACNA has launched comprehensive training programs that combine traditional medical education with modern telemedicine technologies."
          }
        ],
        conclusion: "The work of ACNA demonstrates that with innovative approaches, strategic partnerships, and dedicated advocacy, it is possible to transform pediatric neurological care in Africa."
      },
      author: {
        name: "Dr. Fatima Hassan",
        title: "Senior Health Correspondent",
        organization: "African Medical Journal",
        bio: "Dr. Hassan is a respected health journalist with over 12 years of experience covering healthcare developments across Africa.",
        imageUrl: "https://images.pexels.com/photos/5407206/pexels-photo-5407206.jpeg?auto=compress&cs=tinysrgb&w=300"
      },
      tags: ["Pediatric Neurology", "Healthcare Systems", "Medical Training"],
      source: {
        name: "African Medical Journal",
        url: "https://africanmedicaljournal.org"
      },
      createdAt: "2025-07-10",
      updatedAt: "2025-07-15",
      isFeatured: true
    },
    {
      id: 2,
      title: "ACNA celebrates the African Child Neurology Day",
      type: "Press Release",
      status: "Published",
      category: "Press Release",
      date: "April 26, 2025",
      readTime: "5 min read",
      views: 892,
      imageUrl: "https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=800",
      content: {
        introduction: "The African Child Neurology Association (ACNA) marks the African Child Neurology Day by launching comprehensive community outreach programs.",
        sections: [
          {
            heading: "Community Outreach Programs Launch",
            content: "The new community outreach programs will operate in 15 African countries, focusing on early detection, education, and basic care."
          }
        ],
        conclusion: "This African Child Neurology Day marks not just a celebration of our achievements, but the beginning of an even more impactful chapter."
      },
      contact: {
        name: "ACNA Communications Team",
        email: "media@acna.org",
        phone: "+254-700-123-456"
      },
      tags: ["ACNA", "Community Outreach", "African Child Neurology Day"],
      createdAt: "2025-04-20",
      updatedAt: "2025-04-26"
    },
    {
      id: 3,
      title: "Upcoming Training Workshop on Pediatric Epilepsy",
      type: "Announcement",
      status: "Draft",
      category: "Events",
      date: "September 18, 2025",
      readTime: "3 min read",
      views: 0,
      imageUrl: "https://images.pexels.com/photos/3184192/pexels-photo-3184192.jpeg?auto=compress&cs=tinysrgb&w=800",
      content: {
        introduction: "ACNA will be hosting a specialized training workshop on pediatric epilepsy management in Nairobi, Kenya.",
        sections: [
          {
            heading: "Workshop Details",
            content: "The workshop will cover the latest diagnostic techniques and treatment protocols for pediatric epilepsy."
          }
        ]
      },
      tags: ["Epilepsy", "Training", "Workshop"],
      createdAt: "2025-08-15",
      updatedAt: "2025-08-20"
    },
    {
      id: 4,
      title: "New Research on Autism Spectrum Disorders in Africa",
      type: "Research Update",
      status: "Archived",
      category: "Research",
      date: "March 10, 2025",
      readTime: "6 min read",
      views: 543,
      imageUrl: "https://images.pexels.com/photos/5212359/pexels-photo-5212359.jpeg?auto=compress&cs=tinysrgb&w=800",
      content: {
        introduction: "Groundbreaking research on autism spectrum disorders in African populations has been published.",
        sections: [
          {
            heading: "Key Findings",
            content: "The study reveals important cultural factors in diagnosis and treatment of autism in African contexts."
          }
        ]
      },
      tags: ["Autism", "Research", "Neurodevelopment"],
      createdAt: "2025-02-28",
      updatedAt: "2025-03-10"
    }
  ]);

  const getStatusColor = (status: NewsStatus) => {
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

  const getStatusIcon = (status: NewsStatus) => {
    switch (status) {
      case 'Published':
        return <CheckCircle className="w-4 h-4" />;
      case 'Draft':
        return <DraftIcon className="w-4 h-4" />;
      case 'Archived':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Newspaper className="w-4 h-4" />;
    }
  };

  const handleStatusChange = (newsId: number, newStatus: NewsStatus) => {
    setAllNews(prev => 
      prev.map(item => 
        item.id === newsId 
          ? { ...item, status: newStatus, updatedAt: new Date().toISOString().split('T')[0] }
          : item
      )
    );
  };

  const handleCreateNews = (newNews: NewsItem) => {
    setAllNews(prev => [newNews, ...prev]);
    setShowCreateModal(false);
  };

  const toggleFeatured = (newsId: number) => {
    setAllNews(prev => 
      prev.map(item => 
        item.id === newsId 
          ? { ...item, isFeatured: !item.isFeatured }
          : item
      )
    );
  };

  const toggleExpand = (newsId: number) => {
    setExpandedNews(expandedNews === newsId ? null : newsId);
  };

  const filteredNews = allNews.filter(item => {
    switch (selectedTab) {
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
    (item.subtitle && item.subtitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
    item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = {
    total: allNews.length,
    published: allNews.filter(n => n.status === 'Published').length,
    drafts: allNews.filter(n => n.status === 'Draft').length,
    archived: allNews.filter(n => n.status === 'Archived').length,
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white border border-gray-300 rounded-lg">
        <div className="bg-blue-50 px-6 py-4 border-b border-gray-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Newspaper className="w-7 h-7 mr-3 text-blue-600" />
                News & Press Releases Management
              </h2>
              <p className="text-gray-600 mt-1">Manage news articles, press releases, and announcements</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center font-medium transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create News
              </button>
              <button className="border border-blue-600 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 flex items-center font-medium transition-colors">
                <BarChart2 className="w-5 h-5 mr-2" />
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
                { id: 'all', label: 'All News', count: stats.total },
                { id: 'published', label: 'Published', count: stats.published },
                { id: 'drafts', label: 'Drafts', count: stats.drafts },
                { id: 'archived', label: 'Archived', count: stats.archived }
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
                placeholder="Search news..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* News List */}
        <div className="p-6">
          <div className="space-y-6">
            {filteredNews.length > 0 ? (
              filteredNews.map((item) => (
                <div key={item.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                  <div className="flex flex-col lg:flex-row">
                    {/* News Image */}
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
                              <Star className="w-3 h-3 mr-1 fill-current" />
                              Featured
                            </span>
                          </div>
                        )}
                        <div className="absolute bottom-3 left-3">
                          <span className="bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs font-medium">
                            {item.type}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* News Details */}
                    <div className="lg:w-3/4 p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                            {item.title}
                          </h3>
                          {item.subtitle && (
                            <p className="text-gray-600 mb-3">{item.subtitle}</p>
                          )}
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                              <span>{item.date}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-2 text-blue-600" />
                              <span>{item.readTime}</span>
                            </div>
                            <div className="flex items-center">
                              <Eye className="w-4 h-4 mr-2 text-blue-600" />
                              <span>{item.views} views</span>
                            </div>
                            <div className="flex items-center">
                              <Tag className="w-4 h-4 mr-2 text-blue-600" />
                              <span>{item.category}</span>
                            </div>
                          </div>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {item.tags.map((tag, index) => (
                              <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded">
                                {tag}
                              </span>
                            ))}
                          </div>

                          {/* Introduction Preview */}
                          <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-2">
                            {item.content.introduction}
                          </p>
                        </div>
                      </div>

                      {/* Expandable Content */}
                      {expandedNews === item.id && (
                        <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                          {/* Content Sections */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {item.content.sections.map((section, index) => (
                              <div key={index} className="mb-4">
                                <h4 className="font-medium text-gray-900 mb-2">{section.heading}</h4>
                                <p className="text-gray-600 text-sm whitespace-pre-line">{section.content}</p>
                              </div>
                            ))}
                          </div>

                          {/* Conclusion */}
                          {item.content.conclusion && (
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <h4 className="font-medium text-gray-900 mb-2">Conclusion</h4>
                              <p className="text-gray-600 text-sm whitespace-pre-line">{item.content.conclusion}</p>
                            </div>
                          )}

                          {/* Author */}
                          {item.author && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h4 className="font-medium text-gray-900 mb-2">Author</h4>
                              <div className="flex items-center gap-3">
                                <img
                                  src={item.author.imageUrl}
                                  alt={item.author.name}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                                <div>
                                  <p className="font-medium text-gray-900">{item.author.name}</p>
                                  <p className="text-sm text-gray-600">{item.author.title}, {item.author.organization}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Contact Info */}
                          {item.contact && (
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center">
                                  <User className="w-4 h-4 mr-2 text-blue-600" />
                                  <span>{item.contact.name}</span>
                                </div>
                                <div className="flex items-center">
                                  <Mail className="w-4 h-4 mr-2 text-blue-600" />
                                  <a href={`mailto:${item.contact.email}`} className="text-blue-600 hover:underline">
                                    {item.contact.email}
                                  </a>
                                </div>
                                <div className="flex items-center">
                                  <Phone className="w-4 h-4 mr-2 text-blue-600" />
                                  <span>{item.contact.phone}</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Source */}
                          {item.source && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h4 className="font-medium text-gray-900 mb-2">Source</h4>
                              <div className="flex items-center">
                                <ExternalLink className="w-4 h-4 mr-2 text-blue-600" />
                                <a href={item.source.url} className="text-blue-600 hover:underline text-sm">
                                  {item.source.name}
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Admin Actions */}
                      <div className="flex flex-wrap gap-3">
                        <button 
                          onClick={() => toggleExpand(item.id)}
                          className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center text-sm font-medium transition-colors"
                        >
                          {expandedNews === item.id ? (
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

                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center text-sm font-medium transition-colors">
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
                          <Star className={`w-4 h-4 mr-2 ${item.isFeatured ? 'fill-current' : ''}`} />
                          {item.isFeatured ? 'Unfeature' : 'Feature'}
                        </button>

                        <div className="relative">
                          <select
                            value={item.status}
                            onChange={(e) => handleStatusChange(item.id, e.target.value as NewsStatus)}
                            className="border border-gray-300 px-3 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="Draft">Draft</option>
                            <option value="Published">Publish</option>
                            <option value="Archived">Archive</option>
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
                <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No news items found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm 
                    ? "No items match your search criteria." 
                    : `No news items in the ${selectedTab} category.`}
                </p>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
                >
                  Create Your First News Item
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create News Modal */}
      <CreateNewsModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateNews}
      />
    </div>
  );
};

export default NewsTab;