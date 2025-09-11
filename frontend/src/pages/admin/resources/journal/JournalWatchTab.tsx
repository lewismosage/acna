import { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Download,
  Edit3,
  Search,
  FileText,
  User,
  ChevronDown,
  ChevronUp,
  Eye,
  Trash2,
  CheckCircle,
  Archive,
  Settings,
  TrendingUp,
  Filter,
  Calendar,
  Hash,
  BarChart3,
} from "lucide-react";
import LoadingSpinner from "../../../../components/common/LoadingSpinner";
import CreateJournalModal from "./CreateJournalModal";
import { journalArticlesApi, JournalArticle, JournalAnalytics, CreateJournalArticleInput } from "../../../../services/journalWatchAPI";

type JournalStatus = "Published" | "Draft" | "Archived";

const JournalWatchTab = () => {
  const [selectedTab, setSelectedTab] = useState<
    "all" | "published" | "drafts" | "archived" | "analytics"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [expandedArticles, setExpandedArticles] = useState<number[]>([]);
  const [articles, setArticles] = useState<JournalArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<JournalAnalytics | null>(null);
  const [editingArticle, setEditingArticle] = useState<JournalArticle | undefined>(undefined);
  const [selectedStudyType, setSelectedStudyType] = useState("all");
  const [selectedRelevance, setSelectedRelevance] = useState("all");
  const [error, setError] = useState<string | null>(null);

  // Load articles from API
  const loadArticles = async () => {
    setLoading(true);
    setError(null);
    try {
      const statusMapping = {
        'all': undefined,
        'published': 'Published',
        'drafts': 'Draft', 
        'archived': 'Archived',
        'analytics': undefined
      };
  
      const params = {
        status: statusMapping[selectedTab],
        search: searchTerm || undefined,
        studyType: selectedStudyType !== "all" ? selectedStudyType : undefined,
        relevance: selectedRelevance !== "all" ? selectedRelevance : undefined,
      };
      
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, value]) => value !== undefined)
      );
      
      const data = await journalArticlesApi.getAll(cleanParams);
      setArticles(data);
    } catch (error) {
      console.error("Error loading articles:", error);
      setError(error instanceof Error ? error.message : "Failed to load articles");
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  // Load analytics from API
  const loadAnalytics = async () => {
    try {
      const data = await journalArticlesApi.getAnalytics();
      setAnalyticsData(data);
    } catch (error) {
      console.error("Error loading analytics:", error);
      setAnalyticsData(null);
    }
  };

  useEffect(() => {
    loadArticles();
    if (selectedTab === "analytics") {
      loadAnalytics();
    }
  }, [selectedTab, selectedStudyType, selectedRelevance]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadArticles();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Handle saving articles (create or update)
  const handleSaveArticle = async (articleData: CreateJournalArticleInput) => {
    setError(null);
    try {
      if (editingArticle) {
        // Update existing article
        const updatedArticle = await journalArticlesApi.update(editingArticle.id, articleData);
        setArticles(prev => prev.map(article => 
          article.id === editingArticle.id ? updatedArticle : article
        ));
      } else {
        // Create new article
        const newArticle = await journalArticlesApi.create(articleData);
        setArticles(prev => [newArticle, ...prev]);
      }
      
      // Refresh analytics after changes
      loadAnalytics();
      setShowUploadModal(false);
      setEditingArticle(undefined);
    } catch (error) {
      console.error("Error saving article:", error);
      setError(error instanceof Error ? error.message : "Failed to save article");
      throw error; // Re-throw so the modal can handle it
    }
  };

  const getRelevanceColor = (relevance: string) => {
    switch (relevance) {
      case "High":
        return "bg-red-100 text-red-800 border-red-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: JournalStatus) => {
    switch (status) {
      case "Published":
        return "bg-green-100 text-green-800 border-green-200";
      case "Draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Archived":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: JournalStatus) => {
    switch (status) {
      case "Published":
        return <CheckCircle className="w-4 h-4" />;
      case "Draft":
        return <Settings className="w-4 h-4" />;
      case "Archived":
        return <Archive className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const handleStatusChange = async (articleId: number, newStatus: JournalStatus) => {
    setError(null);
    try {
      const updatedArticle = await journalArticlesApi.updateStatus(articleId, newStatus);
      setArticles(prev => prev.map(article => 
        article.id === articleId ? updatedArticle : article
      ));
      loadAnalytics();
    } catch (error) {
      console.error("Error updating status:", error);
      setError(error instanceof Error ? error.message : "Failed to update status");
    }
  };

  const handleDeleteArticle = async (articleId: number) => {
    if (
      window.confirm(
        "Are you sure you want to delete this journal article? This action cannot be undone."
      )
    ) {
      setError(null);
      try {
        await journalArticlesApi.delete(articleId);
        setArticles(prev => prev.filter((article) => article.id !== articleId));
        loadAnalytics();
      } catch (error) {
        console.error("Error deleting article:", error);
        setError(error instanceof Error ? error.message : "Failed to delete article");
      }
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedArticles((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredArticles = articles.filter((article) => {
    const matchesTab =
      selectedTab === "all" ||
      (selectedTab === "published" && article.status === "Published") ||
      (selectedTab === "drafts" && article.status === "Draft") ||
      (selectedTab === "archived" && article.status === "Archived");
  
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
  
    const matchesStudyType =
      selectedStudyType === "all" || article.studyType === selectedStudyType;
  
    const matchesRelevance =
      selectedRelevance === "all" || article.relevance === selectedRelevance;
  
    return matchesTab && matchesSearch && matchesStudyType && matchesRelevance;
  });

  const renderAnalyticsTab = () => {
    if (!analyticsData) return null;

    return (
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-600 text-sm font-medium">
                  Total Articles
                </p>
                <p className="text-3xl font-bold text-indigo-900">
                  {analyticsData.total}
                </p>
              </div>
              <BookOpen className="w-8 h-8 text-indigo-600" />
            </div>
            <p className="text-indigo-600 text-sm mt-2">All time</p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">
                  Total Downloads
                </p>
                <p className="text-3xl font-bold text-green-900">
                  {analyticsData.totalDownloads.toLocaleString()}
                </p>
              </div>
              <Download className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-green-600 text-sm mt-2">Across all articles</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">
                  Monthly Downloads
                </p>
                <p className="text-3xl font-bold text-blue-900">
                  {analyticsData.monthlyDownloads.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-blue-600 text-sm mt-2">Last 30 days</p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">
                  Total Views
                </p>
                <p className="text-3xl font-bold text-purple-900">
                  {analyticsData.totalViews.toLocaleString()}
                </p>
              </div>
              <Eye className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-purple-600 text-sm mt-2">All article views</p>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Article Status Breakdown
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-green-50">
              <div className="text-2xl font-bold text-green-800">
                {analyticsData.published}
              </div>
              <div className="text-sm text-green-600">Published</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-yellow-50">
              <div className="text-2xl font-bold text-yellow-800">
                {analyticsData.draft}
              </div>
              <div className="text-sm text-yellow-600">Draft</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-gray-50">
              <div className="text-2xl font-bold text-gray-800">
                {analyticsData.archived}
              </div>
              <div className="text-sm text-gray-600">Archived</div>
            </div>
          </div>
        </div>

        {/* Articles by Study Type */}
        {analyticsData.articlesByStudyType && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Articles by Study Type
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(analyticsData.articlesByStudyType).map(
                ([studyType, count]) => (
                  <div key={studyType} className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-800 font-medium">
                        {studyType}
                      </span>
                      <span className="text-blue-600 font-bold">{count}</span>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Top Articles */}
        {analyticsData.topArticles && analyticsData.topArticles.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Top Articles by Views
              </h3>
            </div>
            <div className="space-y-3">
              {analyticsData.topArticles.map((article) => (
                <div
                  key={article.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {article.title}
                    </p>
                    <p className="text-xs text-gray-500">{article.studyType}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-indigo-600">
                      {article.viewCount.toLocaleString()} views
                    </p>
                    <p className="text-xs text-gray-500">
                      {article.downloadCount.toLocaleString()} downloads
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading && articles.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="inline-flex text-red-400 hover:text-red-600"
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-white border border-gray-300 rounded-lg">
        <div className="bg-red-50 px-6 py-4 border-b border-gray-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <BookOpen className="w-7 h-7 mr-3 text-red-600" />
                Journal Watch Management
              </h2>
              <p className="text-gray-600 mt-1">
                Manage journal article summaries and research publications
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setEditingArticle(undefined);
                  setShowUploadModal(true);
                }}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 flex items-center font-medium transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Article
              </button>
              <button
                onClick={() => setSelectedTab("analytics")}
                className="border border-red-600 text-red-600 px-6 py-2 rounded-lg hover:bg-red-50 flex items-center font-medium transition-colors"
              >
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
                { id: "all", label: "All", count: articles.length },
                {
                  id: "published",
                  label: "Published",
                  count: articles.filter((a) => a.status === "Published").length,
                },
                {
                  id: "drafts",
                  label: "Drafts",
                  count: articles.filter((a) => a.status === "Draft").length,
                },
                {
                  id: "archived",
                  label: "Archived",
                  count: articles.filter((a) => a.status === "Archived").length,
                },
                { id: "analytics", label: "Analytics", count: 0 },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`py-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    selectedTab === tab.id
                      ? "border-red-600 text-red-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label} {tab.count > 0 && `(${tab.count})`}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Search and Filter Bar */}
        {selectedTab !== "analytics" && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-600" />
                <select
                  value={selectedStudyType}
                  onChange={(e) => setSelectedStudyType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="all">All Study Types</option>
                  <option value="Epidemiology">Epidemiology</option>
                  <option value="Intervention">Intervention</option>
                  <option value="Genetics">Genetics</option>
                  <option value="Clinical Trial">Clinical Trial</option>
                  <option value="Systematic Review">Systematic Review</option>
                </select>
                <select
                  value={selectedRelevance}
                  onChange={(e) => setSelectedRelevance(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="all">All Relevance</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="p-6">
          {selectedTab === "analytics" ? (
            <div>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Journal Watch Analytics
                </h3>
                <p className="text-gray-600">
                  Comprehensive analytics and insights about your journal article library
                </p>
              </div>
              {analyticsData ? (
                renderAnalyticsTab()
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No analytics data available
                  </h3>
                  <p className="text-gray-500">
                    Analytics data will appear once you have published articles with user engagement.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner />
                </div>
              )}
              
              {filteredArticles.length > 0 ? (
                filteredArticles.map((article) => {
                  const isExpanded = expandedArticles.includes(article.id);

                  return (
                    <div
                      key={article.id}
                      className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow"
                    >
                      <div className="p-6">
                        {/* Header */}
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                          <div className="flex-1">
                            {/* Status and Feature Badges */}
                            <div className="flex flex-wrap gap-2 mb-3">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                                  article.status
                                )} flex items-center`}
                              >
                                {getStatusIcon(article.status)}
                                <span className="ml-1">{article.status}</span>
                              </span>
                              <span className={`px-2 py-1 text-xs font-medium rounded border ${getRelevanceColor(article.relevance)}`}>
                                {article.relevance} Relevance
                              </span>
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs font-medium rounded border border-blue-200">
                                {article.studyType}
                              </span>
                              <span className={`px-2 py-1 text-xs font-medium rounded ${
                                article.access === "Open" 
                                  ? "bg-green-100 text-green-800 border border-green-200" 
                                  : "bg-orange-100 text-orange-800 border border-orange-200"
                              }`}>
                                {article.access} Access
                              </span>
                              {article.countryFocus.map((country, index) => (
                                <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 text-xs font-medium rounded border border-purple-200">
                                  {country}
                                </span>
                              ))}
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                              {article.title}
                            </h3>

                            {/* Authors and Journal Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                              <div className="space-y-2">
                                <div className="flex items-center text-gray-600 text-sm">
                                  <User className="w-4 h-4 mr-2 text-red-600" />
                                  <span className="font-medium">{article.authors}</span>
                                </div>
                                <div className="flex items-center text-gray-600 text-sm">
                                  <BookOpen className="w-4 h-4 mr-2 text-red-600" />
                                  <span>{article.journal}</span>
                                </div>
                                <div className="flex items-center text-gray-600 text-sm">
                                  <Calendar className="w-4 h-4 mr-2 text-red-600" />
                                  <span>Published: {article.publicationDate}</span>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center text-gray-600 text-sm">
                                  <Eye className="w-4 h-4 mr-2 text-red-600" />
                                  <span>{article.viewCount.toLocaleString()} views</span>
                                </div>
                                <div className="flex items-center text-gray-600 text-sm">
                                  <Download className="w-4 h-4 mr-2 text-red-600" />
                                  <span>{article.downloadCount.toLocaleString()} downloads</span>
                                </div>
                              </div>
                            </div>

                            {/* Summary */}
                            <div className="mb-4">
                              <p className="text-gray-600 text-sm leading-relaxed">
                                {article.summary}
                              </p>
                            </div>

                            {/* Key Findings Preview */}
                            <div className="mb-4">
                              <h4 className="font-semibold text-gray-900 text-sm mb-2">
                                Key Findings:
                              </h4>
                              <div className="space-y-1">
                                <div className="flex items-start text-sm text-gray-600">
                                  <Hash className="w-4 h-4 mr-2 mt-0.5 text-red-600 flex-shrink-0" />
                                  {article.keyFindings[0]}
                                </div>
                                {!isExpanded && article.keyFindings.length > 1 && (
                                  <p className="text-sm text-gray-500 ml-6">
                                    and {article.keyFindings.length - 1} more findings...
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Tags and Population */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <h4 className="font-semibold text-gray-900 text-sm mb-1">
                                  Population:
                                </h4>
                                <p className="text-gray-600 text-sm">{article.population}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 text-sm mb-1">
                                  Tags:
                                </h4>
                                <div className="flex flex-wrap gap-1">
                                  {article.tags.slice(0, 3).map((tag, index) => (
                                    <span
                                      key={index}
                                      className="bg-gray-100 text-gray-700 px-2 py-1 text-xs rounded"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                  {article.tags.length > 3 && (
                                    <span className="text-xs text-gray-500">
                                      +{article.tags.length - 3} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Expandable Content */}
                            {isExpanded && (
                              <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                                {/* Full Abstract */}
                                {article.abstract && (
                                  <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-2">
                                      Abstract
                                    </h4>
                                    <p className="text-gray-600 text-sm whitespace-pre-line">
                                      {article.abstract}
                                    </p>
                                  </div>
                                )}

                                {/* All Key Findings */}
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                  <h4 className="font-medium text-gray-900 mb-2">
                                    All Key Findings
                                  </h4>
                                  <ul className="space-y-2 text-sm text-gray-600">
                                    {article.keyFindings.map((finding, index) => (
                                      <li key={index} className="flex items-start">
                                        <Hash className="w-4 h-4 mr-2 mt-0.5 text-red-600 flex-shrink-0" />
                                        {finding}
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                {/* Commentary */}
                                {article.commentary && (
                                  <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg">
                                    <h4 className="font-semibold text-gray-900 mb-2">
                                      ACNA Commentary:
                                    </h4>
                                    <p className="text-gray-700 text-sm">
                                      {article.commentary}
                                    </p>
                                  </div>
                                )}

                                {/* All Tags */}
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                  <h4 className="font-medium text-gray-900 mb-2">
                                    All Tags
                                  </h4>
                                  <div className="flex flex-wrap gap-1">
                                    {article.tags.map((tag, index) => (
                                      <span
                                        key={index}
                                        className="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Admin Actions */}
                        <div className="flex flex-wrap gap-3 mb-4">
                          <button
                            onClick={() => toggleExpand(article.id)}
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
                            onClick={() => {
                              setEditingArticle(article);
                              setShowUploadModal(true);
                            }}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center text-sm font-medium transition-colors"
                          >
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit Article
                          </button>

                          <div className="relative">
                            <select
                              value={article.status}
                              onChange={(e) =>
                                handleStatusChange(
                                  article.id,
                                  e.target.value as JournalStatus
                                )
                              }
                              className="border border-gray-300 px-3 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            >
                              <option value="Published">Published</option>
                              <option value="Draft">Draft</option>
                              <option value="Archived">Archive</option>
                            </select>
                          </div>

                          <button
                            onClick={() => handleDeleteArticle(article.id)}
                            className="border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 flex items-center text-sm font-medium transition-colors"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </button>
                        </div>

                        {/* Metadata */}
                        <div className="pt-4 border-t border-gray-200">
                          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                            <span>Created: {article.createdAt}</span>
                            <span>Last Updated: {article.updatedAt}</span>
                            <span>ID: #{article.id}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No journal articles found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm
                      ? "No articles match your search criteria."
                      : `No articles in the ${selectedTab} category.`}
                  </p>
                  <button
                    onClick={() => {
                      setEditingArticle(undefined);
                      setShowUploadModal(true);
                    }}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-medium"
                  >
                    Add Your First Article
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <CreateJournalModal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setEditingArticle(undefined);
        }}
        onSave={handleSaveArticle}
        editingArticle={editingArticle}
      />
    </div>
  );
};

export default JournalWatchTab;