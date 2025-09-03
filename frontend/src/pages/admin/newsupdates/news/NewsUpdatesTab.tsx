import React, { useState, useEffect } from 'react';
import { 
  Newspaper, 
  Plus, 
  Edit, 
  Eye, 
  Star,
  Mail,
  Phone,
  Calendar, 
  Clock, 
  User, 
  BarChart2,
  Search,
  CheckCircle,
  AlertCircle,
  Clock as DraftIcon,
  Tag as TagIcon,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Trash2,
  RefreshCw
} from 'lucide-react';
import CreateNewsModal from './news/CreateNewsModal';
import { NewsItem, NewsStatus, NewsType } from './types';
import { newsApi } from '../../../services/newsApi';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import placeholderImg from '../../../assets/default Profile Image.png';

const NewsUpdatesTab: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([]);
  const [selectedTab, setSelectedTab] = useState<'all' | 'published' | 'drafts' | 'archived' | 'analytics'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedNews, setExpandedNews] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [editingNews, setEditingNews] = useState<NewsItem | undefined>(undefined);
  const [analyticsData, setAnalyticsData] = useState({
    total: 0,
    published: 0,
    drafts: 0,
    archived: 0,
    totalViews: 0,
    monthlyViews: 0,
    featured: 0
  });

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    let filtered = newsItems;
    
    // Filter by tab
    if (selectedTab !== 'all' && selectedTab !== 'analytics') {
      filtered = filtered.filter(item => 
        selectedTab === 'published' ? item.status === 'Published' :
        selectedTab === 'drafts' ? item.status === 'Draft' :
        item.status === 'Archived'
      );
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(term) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(term)) ||
        item.content.introduction.toLowerCase().includes(term) ||
        item.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }
    
    setFilteredNews(filtered);
  }, [selectedTab, searchTerm, newsItems]);

  // Fetch analytics when tab changes to analytics
  useEffect(() => {
    if (selectedTab === 'analytics') {
      const fetchAnalytics = async () => {
        setLoading(true);
        try {
          const data = await newsApi.getAnalytics();
          setAnalyticsData(data);
        } catch (err: any) {
          const errorMessage = err?.error || err?.message || 'Failed to load analytics data.';
          setError(errorMessage);
          console.error('Error fetching analytics:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchAnalytics();
    }
  }, [selectedTab]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      const [newsData, analyticsData] = await Promise.all([
        newsApi.getAll(),
        newsApi.getAnalytics()
      ]);
      
      setNewsItems(newsData);
      setFilteredNews(newsData);
      setAnalyticsData(analyticsData);
    } catch (err: any) {
      console.error('Error fetching news:', err);
      setError(err.message || 'Failed to load news items. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedNews(expandedNews === id ? null : id);
  };

  const toggleFeatured = async (id: number) => {
    try {
      const updatedNews = await newsApi.toggleFeatured(id); 
      setNewsItems(newsItems.map(item => 
        item.id === id ? updatedNews : item
      ));
    } catch (error) {
      console.error('Error toggling featured status:', error);
      setError('Failed to update featured status');
    }
  };

  const handleStatusChange = async (id: number, status: NewsStatus) => {
    try {
      const updatedNews = await newsApi.updateStatus(id, status);
      setNewsItems(newsItems.map(item => 
        item.id === id ? updatedNews : item
      ));
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update status');
    }
  };

  const handleCreateNews = (newNews: NewsItem) => {
    setNewsItems([newNews, ...newsItems]);
    setShowCreateModal(false);
    // Refresh stats
    fetchNews();
  };

  const handleEditNews = (newsItem: NewsItem) => {
    setEditingNews(newsItem);
    setShowCreateModal(true);
  };

  const handleUpdateNews = (updatedNews: NewsItem) => {
    setNewsItems(newsItems.map(item => 
      item.id === updatedNews.id ? updatedNews : item
    ));
    setShowCreateModal(false);
    setEditingNews(undefined);
    // Refresh stats
    fetchNews();
  };

  const handleDeleteNews = async (id: number) => {
    if (!confirm('Are you sure you want to delete this news item? This action cannot be undone.')) {
      return;
    }

    try {
      await newsApi.delete(id);
      setNewsItems(newsItems.filter(item => item.id !== id));
      // Refresh stats
      fetchNews();
    } catch (error) {
      console.error('Error deleting news:', error);
      setError('Failed to delete news item');
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingNews(undefined);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: NewsStatus) => {
    switch (status) {
      case 'Published': return 'border-green-500 bg-green-50 text-green-800';
      case 'Draft': return 'border-yellow-500 bg-yellow-50 text-yellow-800';
      case 'Archived': return 'border-gray-500 bg-gray-50 text-gray-800';
      default: return 'border-gray-300 bg-gray-50 text-gray-800';
    }
  };

  const getStatusIcon = (status: NewsStatus) => {
    switch (status) {
      case 'Published': return <CheckCircle className="w-3 h-3" />;
      case 'Draft': return <DraftIcon className="w-3 h-3" />;
      case 'Archived': return <AlertCircle className="w-3 h-3" />;
      default: return <AlertCircle className="w-3 h-3" />;
    }
  };

  const getTypeLabel = (type: NewsType) => {
    switch (type) {
      case 'News Article': return 'Article';
      case 'Press Release': return 'Press Release';
      case 'Announcement': return 'Announcement';
      case 'Research Update': return 'Research';
      default: return type;
    }
  };

  const renderAnalyticsTab = () => {
    if (!analyticsData) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total News Items</p>
                <p className="text-3xl font-bold text-blue-900">{analyticsData.total}</p>
              </div>
              <Newspaper className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-blue-600 text-sm mt-2">All time</p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Published Articles</p>
                <p className="text-3xl font-bold text-green-900">{analyticsData.published}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-green-600 text-sm mt-2">Live content</p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Total Views</p>
                <p className="text-3xl font-bold text-purple-900">{analyticsData.totalViews.toLocaleString()}</p>
              </div>
              <Eye className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-purple-600 text-sm mt-2">All articles</p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium">Featured Articles</p>
                <p className="text-3xl font-bold text-yellow-900">{analyticsData.featured}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
            <p className="text-yellow-600 text-sm mt-2">Currently featured</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Status Distribution</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">Published</span>
                </div>
                <span className="font-bold text-green-600">{analyticsData.published}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">Drafts</span>
                </div>
                <span className="font-bold text-yellow-600">{analyticsData.drafts}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">Archived</span>
                </div>
                <span className="font-bold text-gray-600">{analyticsData.archived}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Performance</h3>
            <div className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-purple-800 font-medium">Monthly Views</span>
                  <span className="text-purple-600 font-bold text-xl">{analyticsData.monthlyViews.toLocaleString()}</span>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-purple-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${Math.min((analyticsData.monthlyViews / analyticsData.totalViews) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                <p>Average views per article: {analyticsData.published > 0 ? Math.round(analyticsData.totalViews / analyticsData.published) : 0}</p>
                <p>Featured article ratio: {analyticsData.total > 0 ? Math.round((analyticsData.featured / analyticsData.total) * 100) : 0}%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-2">{analyticsData.total}</div>
              <div className="text-sm text-blue-800 font-medium">Total Content Pieces</div>
              <div className="text-xs text-blue-600 mt-1">All time creation</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {analyticsData.total > 0 ? Math.round((analyticsData.published / analyticsData.total) * 100) : 0}%
              </div>
              <div className="text-sm text-green-800 font-medium">Publication Rate</div>
              <div className="text-xs text-green-600 mt-1">Content published</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {analyticsData.published > 0 ? Math.round(analyticsData.totalViews / analyticsData.published) : 0}
              </div>
              <div className="text-sm text-purple-800 font-medium">Avg Views/Article</div>
              <div className="text-xs text-purple-600 mt-1">Engagement metric</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading && selectedTab !== 'analytics') {
    return <LoadingSpinner />;
  }

  if (error && selectedTab !== 'analytics') {
    return (
      <div className="bg-white border border-gray-300 rounded-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading News</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <div className="flex gap-3 justify-center">
          <button 
            onClick={fetchNews}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium flex items-center"
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
      {error && selectedTab === 'analytics' && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
          <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3">
            <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <title>Close</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
            </svg>
          </button>
        </div>
      )}

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
              <button 
                onClick={fetchNews}
                className="border border-blue-600 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 flex items-center font-medium transition-colors"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Refresh
              </button>
              <button 
                onClick={() => setSelectedTab('analytics')}
                className="border border-blue-600 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 flex items-center font-medium transition-colors"
              >
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
                { id: 'all', label: 'All News', count: analyticsData.total },
                { id: 'published', label: 'Published', count: analyticsData.published },
                { id: 'drafts', label: 'Drafts', count: analyticsData.drafts },
                { id: 'archived', label: 'Archived', count: analyticsData.archived }
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
            {selectedTab !== 'analytics' && (
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
            )}
          </div>
        </div>

        {loading && selectedTab === 'analytics' && (
          <div className="p-6 text-center">
            <LoadingSpinner />
          </div>
        )}

        {!loading && (
          <>
            {selectedTab === 'analytics' ? (
              renderAnalyticsTab()
            ) : (
              /* News List */
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
                                src={item.imageUrl || 'https://via.placeholder.com/800x500?text=No+Image'}
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
                                  {getTypeLabel(item.type)}
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
                                    <span>{formatDate(item.date)}</span>
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
                                    <TagIcon className="w-4 h-4 mr-2 text-blue-600" />
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
                                <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-2 whitespace-pre-line">
                                  {item.content.introduction}
                                </p>
                              </div>
                            </div>

                            {/* Expandable Content */}
                            {expandedNews === item.id && (
                              <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                                {/* Content Sections */}
                                {item.content.sections.map((section, index) => (
                                  <div key={index} className="mb-4">
                                    <h4 className="font-medium text-gray-900 mb-2">{section.heading}</h4>
                                    <p className="text-gray-600 text-sm whitespace-pre-line">{section.content}</p>
                                  </div>
                                ))}

                                {/* Conclusion */}
                                {item.content.conclusion && (
                                  <div className="bg-gray-50 p-4 rounded-lg">
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
                                        src={item.author.imageUrl || placeholderImg}
                                        alt={item.author.name}
                                        className="w-12 h-12 rounded-full object-cover"
                                      />
                                      <div>
                                        <p className="font-medium text-gray-900">
                                          {item.author.name}
                                        </p>
                                        <p className="text-sm text-gray-600">{item.author.title}</p>
                                        <p className="text-sm text-gray-600">{item.author.organization}</p>
                                      </div>
                                    </div>
                                    {item.author.bio && (
                                      <p className="text-gray-600 text-sm mt-2 whitespace-pre-line">{item.author.bio}</p>
                                    )}
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
                                      {item.contact.phone && (
                                        <div className="flex items-center">
                                          <Phone className="w-4 h-4 mr-2 text-blue-600" />
                                          <span>{item.contact.phone}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Source */}
                                {item.source && (
                                  <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-2">Source</h4>
                                    <div className="flex items-center">
                                      <ExternalLink className="w-4 h-4 mr-2 text-blue-600" />
                                      <a 
                                        href={item.source.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline text-sm"
                                      >
                                        {item.source.name}
                                      </a>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Admin Actions */}
                            <div className="flex flex-wrap gap-3 mt-4">
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

                              <button 
                                onClick={() => handleEditNews(item)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center text-sm font-medium transition-colors"
                              >
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

                              <button 
                                onClick={() => handleDeleteNews(item.id)}
                                className="border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 flex items-center text-sm font-medium transition-colors"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </button>
                            </div>

                            {/* Metadata */}
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                                <span>Created: {formatDate(item.createdAt)}</span>
                                <span>Last Updated: {formatDate(item.updatedAt)}</span>
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
            )}
          </>
        )}
      </div>

      {/* Create/Edit News Modal */}
      <CreateNewsModal 
        isOpen={showCreateModal} 
        onClose={handleCloseModal}
        onSave={editingNews ? handleUpdateNews : handleCreateNews}
        initialData={editingNews}
      />
    </div>
  );
};

export default NewsUpdatesTab;