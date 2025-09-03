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
} from "lucide-react";
import UploadEBookletModal from "./UploadEBookletModal";
import {
  ebookletsApi,
  EBooklet,
  EBookletAnalytics,
} from "../../../../services/ebookletsApi";
import LoadingSpinner from "../../../../components/common/LoadingSpinner";

type EBookletStatus = "Published" | "Draft" | "Archived";

const EBookletsTab = () => {
  const [selectedTab, setSelectedTab] = useState<
    "all" | "published" | "drafts" | "archived" | "featured" | "analytics"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [expandedEBooklets, setExpandedEBooklets] = useState<number[]>([]);
  const [ebooklets, setEBooklets] = useState<EBooklet[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<EBookletAnalytics | null>(
    null
  );
  const [editingEBooklet, setEditingEBooklet] = useState<EBooklet | undefined>(
    undefined
  );
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Load ebooklets from API
  useEffect(() => {
    loadEBooklets();
    loadAnalytics();
  }, []);

  const loadEBooklets = async () => {
    try {
      setLoading(true);
      const data = await ebookletsApi.getAll();
      setEBooklets(data);
    } catch (error) {
      console.error("Error loading e-booklets:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const data = await ebookletsApi.getAnalytics();
      setAnalyticsData(data);
    } catch (error) {
      console.error("Error loading analytics:", error);
    }
  };

  // Helper function to truncate text to two sentences
  const truncateToTwoSentences = (
    text: string
  ): { truncated: string; hasMore: boolean } => {
    if (!text) return { truncated: "", hasMore: false };

    const sentences = text.match(/[^\.!?]+[\.!?]+/g) || [];

    if (sentences.length <= 2) {
      return { truncated: text, hasMore: false };
    }

    const truncated = sentences.slice(0, 2).join(" ").trim();
    return { truncated, hasMore: true };
  };

  const renderWithLineBreaks = (text: string) => {
    if (!text) return null;
    return text.split("\n").map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < text.split("\n").length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const getStatusColor = (status: EBookletStatus) => {
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

  const getStatusIcon = (status: EBookletStatus) => {
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

  const handleStatusChange = async (
    ebookletId: number,
    newStatus: EBookletStatus
  ) => {
    try {
      await ebookletsApi.updateStatus(ebookletId, newStatus);
      setEBooklets((prev) =>
        prev.map((ebook) =>
          ebook.id === ebookletId
            ? {
                ...ebook,
                status: newStatus,
                updatedAt: new Date().toISOString().split("T")[0],
              }
            : ebook
        )
      );
      loadAnalytics(); // Refresh analytics
    } catch (error) {
      console.error("Error updating e-booklet status:", error);
    }
  };

  const handleToggleFeatured = async (ebookletId: number) => {
    try {
      await ebookletsApi.toggleFeatured(ebookletId);
      setEBooklets((prev) =>
        prev.map((ebook) =>
          ebook.id === ebookletId
            ? { ...ebook, isFeatured: !ebook.isFeatured }
            : ebook
        )
      );
      loadAnalytics(); // Refresh analytics
    } catch (error) {
      console.error("Error toggling featured status:", error);
    }
  };

  const handleDeleteEBooklet = async (ebookletId: number) => {
    if (
      window.confirm(
        "Are you sure you want to delete this e-booklet? This action cannot be undone."
      )
    ) {
      try {
        await ebookletsApi.delete(ebookletId);
        setEBooklets((prev) => prev.filter((ebook) => ebook.id !== ebookletId));
        loadAnalytics(); // Refresh analytics
      } catch (error) {
        console.error("Error deleting e-booklet:", error);
      }
    }
  };

  const handleEditEBooklet = (ebook: EBooklet) => {
    setEditingEBooklet(ebook);
    setShowUploadModal(true);
  };

  const handleCreateEBooklet = async (ebookletData: any) => {
    try {
      const toCreateInput = (d: any) => ({
        title: d.title,
        description: d.description,
        abstract: d.abstract,
        category: d.category,
        status: d.status,
        isFeatured: !!d.isFeatured,
        imageFile: d.imageFile || undefined,
        ebookletFile:
          Array.isArray(d.bookletFiles) && d.bookletFiles.length > 0
            ? d.bookletFiles[0]
            : undefined,
        authors: Array.isArray(d.authors) ? d.authors : [],
        targetAudience: Array.isArray(d.targetAudience) ? d.targetAudience : [],
        pages:
          typeof d.pages === "number"
            ? d.pages
            : parseInt(d.pages || "0", 10) || 0,
        fileFormats: Array.isArray(d.fileFormats) ? d.fileFormats : [],
        language: d.language || "English",
        isbn: d.isbn || undefined,
        publisher: d.publisher || undefined,
        edition: d.edition || undefined,
        tableOfContents: Array.isArray(d.tableOfContents)
          ? d.tableOfContents
          : [],
        keywords: Array.isArray(d.keywords) ? d.keywords : [],
        tags: Array.isArray(d.tags) ? d.tags : [],
        publicationDate: d.publicationDate || undefined,
      });

      if (editingEBooklet) {
        const updatedEBooklet = await ebookletsApi.update(
          editingEBooklet.id,
          toCreateInput(ebookletData)
        );
        setEBooklets((prev) =>
          prev.map((e) => (e.id === editingEBooklet.id ? updatedEBooklet : e))
        );
      } else {
        const createdEBooklet = await ebookletsApi.create(
          toCreateInput(ebookletData)
        );
        setEBooklets((prev) => [createdEBooklet, ...prev]);
      }
      setShowUploadModal(false);
      setEditingEBooklet(undefined);
      loadAnalytics();
    } catch (error) {
      console.error("Error saving e-booklet:", error);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedEBooklets((prev) =>
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

  const filteredEBooklets = ebooklets.filter((ebook) => {
    const matchesTab =
      selectedTab === "all" ||
      (selectedTab === "published" && ebook.status === "Published") ||
      (selectedTab === "drafts" && ebook.status === "Draft") ||
      (selectedTab === "archived" && ebook.status === "Archived") ||
      (selectedTab === "featured" && ebook.isFeatured);

    const matchesSearch =
      ebook.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ebook.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || ebook.category === selectedCategory;

    return matchesTab && matchesSearch && matchesCategory;
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
                  Total E-Booklets
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
            <p className="text-green-600 text-sm mt-2">Across all e-booklets</p>
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
            <p className="text-purple-600 text-sm mt-2">All e-booklet views</p>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            E-Booklet Status Breakdown
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

        {/* E-Booklets by Category */}
        {analyticsData.ebookletsByCategory && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              E-Booklets by Category
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(analyticsData.ebookletsByCategory).map(
                ([category, count]) => (
                  <div key={category} className="bg-indigo-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-indigo-800 font-medium">
                        {category}
                      </span>
                      <span className="text-indigo-600 font-bold">{count}</span>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Top E-Booklets */}
        {analyticsData.topEbooklets &&
          analyticsData.topEbooklets.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Top E-Booklets by Downloads
                </h3>
                <button className="flex items-center text-sm text-indigo-600 hover:text-indigo-800">
                  <Download className="w-4 h-4 mr-1" />
                  Export Report
                </button>
              </div>
              <div className="space-y-3">
                {analyticsData.topEbooklets.map((ebook) => (
                  <div
                    key={ebook.id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {ebook.title}
                      </p>
                      <p className="text-xs text-gray-500">{ebook.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-indigo-600">
                        {ebook.downloadCount.toLocaleString()} downloads
                      </p>
                      <p className="text-xs text-gray-500">
                        {ebook.viewCount.toLocaleString()} views
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Quick Actions */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <span className="text-sm font-medium">Export All Data</span>
              <FileText className="w-4 h-4 text-gray-400" />
            </button>
            <button className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <span className="text-sm font-medium">Generate Report</span>
              <BarChart3 className="w-4 h-4 text-gray-400" />
            </button>
            <button className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <span className="text-sm font-medium">Bulk Update</span>
              <Upload className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

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
              <p className="text-gray-600 mt-1">
                Manage downloadable educational resources and publications
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center font-medium transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Upload E-Booklet
              </button>
              <button
                onClick={() => setSelectedTab("analytics")}
                className="border border-indigo-600 text-indigo-600 px-6 py-2 rounded-lg hover:bg-indigo-50 flex items-center font-medium transition-colors"
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
                { id: "all", label: "All", count: ebooklets.length },
                {
                  id: "published",
                  label: "Published",
                  count: ebooklets.filter((e) => e.status === "Published")
                    .length,
                },
                {
                  id: "drafts",
                  label: "Drafts",
                  count: ebooklets.filter((e) => e.status === "Draft").length,
                },
                {
                  id: "archived",
                  label: "Archived",
                  count: ebooklets.filter((e) => e.status === "Archived")
                    .length,
                },
                {
                  id: "featured",
                  label: "Featured",
                  count: ebooklets.filter((e) => e.isFeatured).length,
                },
                { id: "analytics", label: "Analytics", count: 0 },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`py-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    selectedTab === tab.id
                      ? "border-indigo-600 text-indigo-600"
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
                  placeholder="Search e-booklets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-600" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="all">All Categories</option>
                  {Array.from(new Set(ebooklets.map((e) => e.category))).map(
                    (category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    )
                  )}
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
                  E-Booklet Analytics
                </h3>
                <p className="text-gray-600">
                  Comprehensive analytics and insights about your e-booklet
                  library
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
                    Analytics data will appear once you have published
                    e-booklets with user engagement.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredEBooklets.length > 0 ? (
                filteredEBooklets.map((ebook) => {
                  const isExpanded = expandedEBooklets.includes(ebook.id);
                  const { truncated: truncatedDescription, hasMore } =
                    truncateToTwoSentences(ebook.description);

                  return (
                    <div
                      key={ebook.id}
                      className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow"
                    >
                      <div className="flex flex-col lg:flex-row">
                        {/* E-Booklet Image */}
                        <div className="lg:w-1/4">
                          <div className="relative">
                            <img
                              src={ebook.imageUrl || "/api/placeholder/400/250"}
                              alt={ebook.title}
                              className="w-full h-48 lg:h-full object-cover rounded-t-lg lg:rounded-l-lg lg:rounded-t-none"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/api/placeholder/400/250";
                              }}
                            />
                            <div className="absolute top-3 left-3">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                                  ebook.status
                                )} flex items-center`}
                              >
                                {getStatusIcon(ebook.status)}
                                <span className="ml-1">{ebook.status}</span>
                              </span>
                            </div>
                            {ebook.isFeatured && (
                              <div className="absolute top-3 right-3">
                                <Star className="w-5 h-5 text-yellow-500 fill-current" />
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
                                    <span className="font-medium">
                                      {ebook.category}
                                    </span>
                                  </div>
                                  <div className="flex items-center text-gray-600 text-sm">
                                    <User className="w-4 h-4 mr-2 text-indigo-600" />
                                    <span>
                                      {safeArrayJoin(ebook.authors, 2)}
                                    </span>
                                  </div>
                                  <div className="flex items-center text-gray-600 text-sm">
                                    <Clock className="w-4 h-4 mr-2 text-indigo-600" />
                                    <span>
                                      Published: {ebook.publicationDate}
                                    </span>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <div className="flex items-center text-gray-600 text-sm">
                                    <span className="font-medium">
                                      {ebook.pages} pages • {ebook.fileSize}
                                    </span>
                                  </div>
                                  <div className="flex items-center text-gray-600 text-sm">
                                    <Download className="w-4 h-4 mr-2 text-indigo-600" />
                                    <span>
                                      {formatDownloadCount(ebook.downloadCount)}{" "}
                                      downloads
                                    </span>
                                  </div>
                                  {ebook.rating && (
                                    <div className="flex items-center text-gray-600 text-sm">
                                      {renderRatingStars(ebook.rating)}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* TRUNCATED DESCRIPTION - shows only when NOT expanded */}
                              {!isExpanded && (
                                <div className="mb-4">
                                  <p className="text-gray-600 text-sm leading-relaxed">
                                    {renderWithLineBreaks(truncatedDescription)}
                                  </p>
                                  {hasMore && (
                                    <button
                                      onClick={() => toggleExpand(ebook.id)}
                                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mt-1"
                                    >
                                      Read more...
                                    </button>
                                  )}
                                </div>
                              )}

                              {/* Target Audience */}
                              <div className="mb-4">
                                <h4 className="font-semibold text-gray-900 text-sm mb-1">
                                  Target Audience:
                                </h4>
                                <div className="flex flex-wrap gap-1">
                                  {ebook.targetAudience.map(
                                    (audience, index) => (
                                      <span
                                        key={index}
                                        className="bg-gray-100 text-gray-700 px-2 py-1 text-xs rounded"
                                      >
                                        {audience}
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>

                              {/* File Formats */}
                              <div className="mb-4">
                                <h4 className="font-semibold text-gray-900 text-sm mb-1">
                                  Formats Available:
                                </h4>
                                <div className="flex flex-wrap gap-1">
                                  {ebook.fileFormats.map((format, index) => (
                                    <span
                                      key={index}
                                      className="bg-green-100 text-green-800 px-2 py-1 text-xs rounded"
                                    >
                                      {format}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* Expandable Content */}
                              {isExpanded && (
                                <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                                  {/* FULL DESCRIPTION */}
                                  <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-2">
                                      Full Description
                                    </h4>
                                    <p className="text-gray-600 text-sm whitespace-pre-line">
                                      {renderWithLineBreaks(
                                        ebook.abstract || ebook.description
                                      )}
                                    </p>
                                  </div>

                                  {/* Additional Details */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Publication Details */}
                                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                                      <h4 className="font-medium text-gray-900 mb-2">
                                        Publication Details
                                      </h4>
                                      <div className="space-y-2 text-sm text-gray-600">
                                        {ebook.isbn && (
                                          <div>
                                            <span className="font-medium">
                                              ISBN:{" "}
                                            </span>
                                            {ebook.isbn}
                                          </div>
                                        )}
                                        {ebook.publisher && (
                                          <div>
                                            <span className="font-medium">
                                              Publisher:{" "}
                                            </span>
                                            {ebook.publisher}
                                          </div>
                                        )}
                                        {ebook.edition && (
                                          <div>
                                            <span className="font-medium">
                                              Edition:{" "}
                                            </span>
                                            {ebook.edition}
                                          </div>
                                        )}
                                        <div>
                                          <span className="font-medium">
                                            Language:{" "}
                                          </span>
                                          {ebook.language}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Table of Contents */}
                                    {ebook.tableOfContents.length > 0 && (
                                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                                        <h4 className="font-medium text-gray-900 mb-2">
                                          Table of Contents
                                        </h4>
                                        <div className="space-y-1 text-sm text-gray-600">
                                          {ebook.tableOfContents.map(
                                            (item, index) => (
                                              <div key={index}>• {item}</div>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Keywords and Tags */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {ebook.keywords.length > 0 && (
                                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                                        <h4 className="font-medium text-gray-900 mb-2">
                                          Keywords
                                        </h4>
                                        <div className="flex flex-wrap gap-1">
                                          {ebook.keywords.map(
                                            (keyword, index) => (
                                              <span
                                                key={index}
                                                className="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded"
                                              >
                                                {keyword}
                                              </span>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    {ebook.tags.length > 0 && (
                                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                                        <h4 className="font-medium text-gray-900 mb-2">
                                          Tags
                                        </h4>
                                        <div className="flex flex-wrap gap-1">
                                          {ebook.tags.map((tag, index) => (
                                            <span
                                              key={index}
                                              className="bg-purple-100 text-purple-800 px-2 py-1 text-xs rounded"
                                            >
                                              {tag}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Files and Links */}
                                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                                    <h4 className="font-medium text-gray-900 mb-2">
                                      Files and Links
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                      {ebook.fileUrl && (
                                        <div>
                                          <span className="font-medium">
                                            Download URL:{" "}
                                          </span>
                                          <a
                                            href={ebook.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-indigo-600 hover:underline"
                                          >
                                            {ebook.fileUrl}
                                          </a>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Admin Actions */}
                          <div className="flex flex-wrap gap-3">
                            <button
                              onClick={() => toggleExpand(ebook.id)}
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
                              onClick={() => handleEditEBooklet(ebook)}
                              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center text-sm font-medium transition-colors"
                            >
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
                                onChange={(e) =>
                                  handleStatusChange(
                                    ebook.id,
                                    e.target.value as EBookletStatus
                                  )
                                }
                                className="border border-gray-300 px-3 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              >
                                <option value="Published">Published</option>
                                <option value="Draft">Draft</option>
                                <option value="Archived">Archive</option>
                              </select>
                            </div>

                            <button
                              onClick={() => handleToggleFeatured(ebook.id)}
                              className={`border px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-colors ${
                                ebook.isFeatured
                                  ? "border-yellow-300 bg-yellow-50 text-yellow-800 hover:bg-yellow-100"
                                  : "border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              <Star
                                className={`w-4 h-4 mr-2 ${
                                  ebook.isFeatured ? "fill-current" : ""
                                }`}
                              />
                              {ebook.isFeatured ? "Unfeature" : "Feature"}
                            </button>

                            <button
                              onClick={() => handleDeleteEBooklet(ebook.id)}
                              className="border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 flex items-center text-sm font-medium transition-colors"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
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
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No e-booklets found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm
                      ? "No e-booklets match your search criteria."
                      : `No e-booklets in the ${selectedTab} category.`}
                  </p>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium"
                  >
                    Upload Your First E-Booklet
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Upload E-Booklet Modal */}
      <UploadEBookletModal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setEditingEBooklet(undefined);
        }}
        onSubmit={handleCreateEBooklet}
        editingEBooklet={editingEBooklet}
      />
    </div>
  );
};

export default EBookletsTab;
