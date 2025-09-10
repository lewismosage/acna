import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Download,
  Edit3,
  Star,
  Search,
  FileText,
  User,
  Clock,
  BarChart3,
  Upload,
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
  Globe,
  Hash,
  ExternalLink,
} from "lucide-react";

// Types matching the JournalWatch interface
interface JournalArticle {
  id: number;
  title: string;
  authors: string;
  journal: string;
  publicationDate: string;
  doi: string;
  summary: string;
  abstract?: string;
  keyFindings: string[];
  relevance: "High" | "Medium" | "Low";
  studyType: string;
  population: string;
  countryFocus: string[];
  tags: string[];
  access: "Open" | "Subscription";
  rating?: number;
  commentary?: string;
  status: "Published" | "Draft" | "Archived";
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  downloadCount: number;
}

interface JournalAnalytics {
  total: number;
  totalViews: number;
  totalDownloads: number;
  monthlyViews: number;
  monthlyDownloads: number;
  published: number;
  draft: number;
  archived: number;
  featured: number;
  articlesByStudyType?: Record<string, number>;
  articlesByCountry?: Record<string, number>;
  topArticles?: Array<{
    id: number;
    title: string;
    studyType: string;
    viewCount: number;
    downloadCount: number;
  }>;
}

type JournalStatus = "Published" | "Draft" | "Archived";

const JournalWatchTab = () => {
  const [selectedTab, setSelectedTab] = useState<
    "all" | "published" | "drafts" | "archived" | "featured" | "analytics"
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

  // Mock data for demonstration
  useEffect(() => {
    loadArticles();
    loadAnalytics();
  }, []);

  const loadArticles = async () => {
    setLoading(true);
    // Mock API call - replace with actual API
    setTimeout(() => {
      const mockArticles: JournalArticle[] = [
        {
          id: 1,
          title: "Prevalence and Risk Factors for Pediatric Epilepsy in Rural Kenya",
          authors: "Muthoni et al.",
          journal: "African Journal of Neurology",
          publicationDate: "2025-06-15",
          doi: "10.1234/ajneu.2025.0123",
          summary: "Community-based study identifying prevalence of epilepsy in children aged 2-15 years in rural Western Kenya, with analysis of associated risk factors.",
          abstract: "Background: Limited data exists on pediatric epilepsy prevalence in rural African settings. This study aimed to determine the prevalence and associated risk factors for epilepsy in children in rural Western Kenya.\n\nMethods: Community-based cross-sectional study of 2,847 children aged 2-15 years across 12 villages in Kakamega County.\n\nResults: Active epilepsy prevalence was 12.3 per 1000 children. Major risk factors included birth complications and cerebral malaria history.",
          keyFindings: [
            "Prevalence of active epilepsy was 12.3 per 1000 children",
            "Major risk factors included birth complications (OR 3.2) and cerebral malaria (OR 4.1)",
            "68% of cases were not receiving regular treatment",
            "Significant association with family history (p<0.01)"
          ],
          relevance: "High",
          studyType: "Epidemiology",
          population: "Children 2-15 years",
          countryFocus: ["Kenya"],
          tags: ["Epilepsy", "Prevalence", "Risk Factors"],
          access: "Open",
          rating: 4.5,
          commentary: "Important baseline data for service planning in similar rural African contexts.",
          status: "Published",
          isFeatured: true,
          createdAt: "2025-06-01",
          updatedAt: "2025-06-15",
          viewCount: 1247,
          downloadCount: 342
        },
        {
          id: 2,
          title: "Effectiveness of Community-Based Rehabilitation for Cerebral Palsy in Uganda",
          authors: "Nakato et al.",
          journal: "Journal of Pediatric Rehabilitation",
          publicationDate: "2025-05-20",
          doi: "10.5678/jpr.2025.0456",
          summary: "Randomized controlled trial comparing community-based rehabilitation to standard care for children with cerebral palsy in Uganda.",
          keyFindings: [
            "Community program showed 42% greater improvement in motor function",
            "Caregiver satisfaction scores 78% vs 52% in control group",
            "Cost-effective at $23 per quality-adjusted life year",
            "Recommended for scale-up in similar low-resource settings"
          ],
          relevance: "High",
          studyType: "Intervention",
          population: "Children 1-12 years with CP",
          countryFocus: ["Uganda"],
          tags: ["Cerebral Palsy", "Rehabilitation", "Community Health"],
          access: "Subscription",
          rating: 4.8,
          status: "Published",
          isFeatured: false,
          createdAt: "2025-05-01",
          updatedAt: "2025-05-20",
          viewCount: 892,
          downloadCount: 156
        },
        {
          id: 3,
          title: "Genetic Markers of Autism Spectrum Disorder in South African Children",
          authors: "Petersen et al.",
          journal: "Nature Genetics Africa",
          publicationDate: "2025-03-10",
          doi: "10.2468/nga.2025.0321",
          summary: "Genome-wide association study identifying novel genetic variants associated with ASD in African populations.",
          keyFindings: [
            "Identified 3 novel loci specific to African genomes",
            "Heritability estimate of 0.65 in study population",
            "Different genetic architecture compared to European populations",
            "Potential implications for diagnostic testing in African contexts"
          ],
          relevance: "Medium",
          studyType: "Genetics",
          population: "Children with ASD",
          countryFocus: ["South Africa"],
          tags: ["Autism", "Genetics", "Biomarkers"],
          access: "Subscription",
          rating: 4.0,
          status: "Draft",
          isFeatured: false,
          createdAt: "2025-02-15",
          updatedAt: "2025-03-05",
          viewCount: 234,
          downloadCount: 45
        }
      ];
      setArticles(mockArticles);
      setLoading(false);
    }, 1000);
  };

  const loadAnalytics = async () => {
    // Mock analytics data
    const mockAnalytics: JournalAnalytics = {
      total: 3,
      totalViews: 2373,
      totalDownloads: 543,
      monthlyViews: 892,
      monthlyDownloads: 156,
      published: 2,
      draft: 1,
      archived: 0,
      featured: 1,
      articlesByStudyType: {
        "Epidemiology": 1,
        "Intervention": 1,
        "Genetics": 1
      },
      articlesByCountry: {
        "Kenya": 1,
        "Uganda": 1,
        "South Africa": 1
      },
      topArticles: [
        { id: 1, title: "Prevalence and Risk Factors for Pediatric Epilepsy in Rural Kenya", studyType: "Epidemiology", viewCount: 1247, downloadCount: 342 },
        { id: 2, title: "Effectiveness of Community-Based Rehabilitation for Cerebral Palsy in Uganda", studyType: "Intervention", viewCount: 892, downloadCount: 156 }
      ]
    };
    setAnalyticsData(mockAnalytics);
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
    setArticles((prev) =>
      prev.map((article) =>
        article.id === articleId
          ? {
              ...article,
              status: newStatus,
              updatedAt: new Date().toISOString().split("T")[0],
            }
          : article
      )
    );
    loadAnalytics();
  };

  const handleToggleFeatured = async (articleId: number) => {
    setArticles((prev) =>
      prev.map((article) =>
        article.id === articleId
          ? { ...article, isFeatured: !article.isFeatured }
          : article
      )
    );
    loadAnalytics();
  };

  const handleDeleteArticle = async (articleId: number) => {
    if (
      window.confirm(
        "Are you sure you want to delete this journal article? This action cannot be undone."
      )
    ) {
      setArticles((prev) => prev.filter((article) => article.id !== articleId));
      loadAnalytics();
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedArticles((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const safeArrayJoin = (arr: any[], limit?: number): string => {
    if (!Array.isArray(arr) || arr.length === 0) return "None";

    const values = arr
      .map((item) => {
        if (typeof item === "string") return item;
        return String(item);
      })
      .filter(Boolean);

    if (limit && values.length > limit) {
      return (
        values.slice(0, limit).join(", ") + ` (+${values.length - limit} more)`
      );
    }

    return values.join(", ") || "None";
  };

  const filteredArticles = articles.filter((article) => {
    const matchesTab =
      selectedTab === "all" ||
      (selectedTab === "published" && article.status === "Published") ||
      (selectedTab === "drafts" && article.status === "Draft") ||
      (selectedTab === "archived" && article.status === "Archived") ||
      (selectedTab === "featured" && article.isFeatured);

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

  const renderRatingStars = (rating?: number) => {
    if (!rating) return null;

    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? "text-yellow-500 fill-current" : "text-gray-300"
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">
          ({rating.toFixed(1)})
        </span>
      </div>
    );
  };

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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            <div className="text-center p-4 rounded-lg bg-indigo-50">
              <div className="text-2xl font-bold text-indigo-800">
                {analyticsData.featured}
              </div>
              <div className="text-sm text-indigo-600">Featured</div>
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
              <button className="flex items-center text-sm text-indigo-600 hover:text-indigo-800">
                <Download className="w-4 h-4 mr-1" />
                Export Report
              </button>
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
                onClick={() => setShowUploadModal(true)}
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
                {
                  id: "featured",
                  label: "Featured",
                  count: articles.filter((a) => a.isFeatured).length,
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
                              {article.isFeatured && (
                                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 text-xs font-medium rounded border border-yellow-200 flex items-center">
                                  <Star className="w-3 h-3 mr-1 fill-current" />
                                  Featured
                                </span>
                              )}
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
                                  <Hash className="w-4 h-4 mr-2 text-red-600" />
                                  <span>DOI: {article.doi}</span>
                                </div>
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

                          {/* Rating */}
                          {article.rating && (
                            <div className="mt-2 lg:mt-0">
                              {renderRatingStars(article.rating)}
                            </div>
                          )}
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
                            onClick={() => setEditingArticle(article)}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center text-sm font-medium transition-colors"
                          >
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit Article
                          </button>

                          <a
                            href={`https://doi.org/${article.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center text-sm font-medium transition-colors"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Original
                          </a>

                          <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center text-sm font-medium transition-colors">
                            <Download className="w-4 h-4 mr-2" />
                            Export Summary
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
                            onClick={() => handleToggleFeatured(article.id)}
                            className={`border px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-colors ${
                              article.isFeatured
                                ? "border-yellow-300 bg-yellow-50 text-yellow-800 hover:bg-yellow-100"
                                : "border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            <Star
                              className={`w-4 h-4 mr-2 ${
                                article.isFeatured ? "fill-current" : ""
                              }`}
                            />
                            {article.isFeatured ? "Unfeature" : "Feature"}
                          </button>

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
                    onClick={() => setShowUploadModal(true)}
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

      {/* Note: Upload Modal would be implemented separately */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingArticle ? "Edit Article" : "Add New Article"}
            </h3>
            <p className="text-gray-600 mb-4">
              The article creation/editing modal will be implemented next.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setEditingArticle(undefined);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalWatchTab;