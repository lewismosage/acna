import { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Download,
  Edit3,
  Search,
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
  AlertCircle,
  Globe,
} from "lucide-react";
import LoadingSpinner from "../../../../components/common/LoadingSpinner";
import CreateContentModal from "./CreateContentModal";
import { policyManagementApi } from "../../../../services/policyManagementApi";

type ContentStatus = "Published" | "Draft" | "Archived";

interface BaseContentItem {
  id: number;
  title: string;
  category: string;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
  summary: string;
  viewCount: number;
  downloadCount: number;
  imageUrl: string;
  tags: string[];
}

interface PolicyBelief extends BaseContentItem {
  type: "PolicyBelief";
  priority: "High" | "Medium" | "Low";
  targetAudience: string[];
  keyRecommendations: string[];
  region: string[];
}

interface PositionalStatement extends BaseContentItem {
  type: "PositionalStatement";
  keyPoints: string[];
  pageCount: number;
  countryFocus: string[];
  relatedPolicies: string[];
}

type ContentItem = PolicyBelief | PositionalStatement;

interface ContentAnalytics {
  total: number;
  published: number;
  draft: number;
  archived: number;
  totalViews: number;
  totalDownloads: number;
  monthlyDownloads: number;
  contentByCategory: Record<string, number>;
  topContent: ContentItem[];
}

// Main Component
const PolicyManagementTab = () => {
  const [selectedTab, setSelectedTab] = useState<"policyBeliefs" | "positionalStatements" | "analytics">("policyBeliefs");
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [selectedStatus, setSelectedStatus] = useState<string>("All Statuses");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [categories, setCategories] = useState<string[]>(["All Categories"]);
  const [loading, setLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<ContentAnalytics | null>(null);
  const [editingItem, setEditingItem] = useState<ContentItem | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const statusOptions = ["All Statuses", "Published", "Draft", "Archived"];

  // Load content from API
  const loadContent = async () => {
    setLoading(true);
    setError(null);
    try {
      const typeMapping = {
        'policyBeliefs': 'PolicyBelief',
        'positionalStatements': 'PositionalStatement',
        'analytics': undefined
      } as const;

      const params = {
        status: selectedStatus !== "All Statuses" ? selectedStatus : undefined,
        search: searchTerm || undefined,
        category: selectedCategory !== "All Categories" ? selectedCategory : undefined,
        type: typeMapping[selectedTab]
      };
      
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined)
      );
      
      const data = await policyManagementApi.getAll(cleanParams);
      setContentItems(data);
    } catch (error) {
      console.error("Error loading content:", error);
      setError(error instanceof Error ? error.message : "Failed to load content");
      setContentItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Load analytics from API
  const loadAnalytics = async () => {
    try {
      const data = await policyManagementApi.getAnalytics();
      setAnalyticsData(data);
    } catch (error) {
      console.error("Error loading analytics:", error);
      setAnalyticsData(null);
    }
  };

  // Load categories from API
  const loadCategories = async () => {
    try {
      const data = await policyManagementApi.getCategories();
      // If no categories returned, use default ones
      const defaultCategories = [
        "Epilepsy & Seizures",
        "Early Detection & Prevention",
        "Healthcare Access",
        "Nutrition & Development",
        "Social Inclusion & Rights",
        "Emergency & Crisis Response",
        "Technology & Innovation",
        "Mental Health",
        "Education & Inclusion"
      ];
      setCategories(["All Categories", ...(data.length > 0 ? data : defaultCategories)]);
    } catch (error) {
      console.error("Error loading categories:", error);
      // Use default categories on error
      const defaultCategories = [
        "Epilepsy & Seizures",
        "Early Detection & Prevention",
        "Healthcare Access",
        "Nutrition & Development",
        "Social Inclusion & Rights",
        "Emergency & Crisis Response",
        "Technology & Innovation",
        "Mental Health",
        "Education & Inclusion"
      ];
      setCategories(["All Categories", ...defaultCategories]);
    }
  };

  useEffect(() => {
    loadContent();
    loadCategories();
    if (selectedTab === "analytics") {
      loadAnalytics();
    }
  }, [selectedTab, selectedCategory, selectedStatus]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadContent();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSaveItem = async (itemData: Omit<ContentItem, "id"> & { imageFile?: File }) => {
    setError(null);
    try {
      if (editingItem) {
        const updatedItem = await policyManagementApi.update(editingItem.id, {
          ...itemData,
          updatedAt: new Date().toISOString()
        } as any);
        setContentItems(prev => prev.map(item => 
          item.id === editingItem.id ? updatedItem : item
        ));
      } else {
        const completeItemData = {
          ...itemData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          viewCount: 0,
          downloadCount: 0,
          imageUrl: itemData.imageFile ? "" : itemData.imageUrl // Will be set by server after upload
        };
        
        const createdItem = await policyManagementApi.create(completeItemData as any);
        setContentItems(prev => [createdItem, ...prev]);
      }
      
      loadAnalytics();
      setShowCreateModal(false);
      setEditingItem(undefined);
    } catch (error) {
      console.error("Error saving item:", error);
      setError(error instanceof Error ? error.message : "Failed to save item");
      throw error;
    }
  };

  const getStatusColor = (status: ContentStatus) => {
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

  const getStatusIcon = (status: ContentStatus) => {
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "text-red-600";
      case "Medium":
        return "text-orange-600";
      case "Low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const handleStatusChange = async (itemId: number, newStatus: ContentStatus) => {
    setError(null);
    try {
      const updatedItem = await policyManagementApi.updateStatus(itemId, newStatus);
      setContentItems(prev => prev.map(item => 
        item.id === itemId ? updatedItem : item
      ));
      loadAnalytics();
    } catch (error) {
      console.error("Error updating status:", error);
      setError(error instanceof Error ? error.message : "Failed to update status");
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (
      window.confirm(
        "Are you sure you want to delete this item? This action cannot be undone."
      )
    ) {
      setError(null);
      try {
        await policyManagementApi.delete(itemId);
        setContentItems(prev => prev.filter((item) => item.id !== itemId));
        loadAnalytics();
      } catch (error) {
        console.error("Error deleting item:", error);
        setError(error instanceof Error ? error.message : "Failed to delete item");
      }
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredItems = contentItems.filter((item) => {
    const matchesTab =
      selectedTab === "policyBeliefs" && item.type === "PolicyBelief" ||
      selectedTab === "positionalStatements" && item.type === "PositionalStatement" ||
      selectedTab === "analytics";
  
    const matchesCategory =
      selectedCategory === "All Categories" || item.category === selectedCategory;
    
    const matchesStatus =
      selectedStatus === "All Statuses" || item.status === selectedStatus;
    
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesTab && matchesCategory && matchesStatus && matchesSearch;
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
                  Total Items
                </p>
                <p className="text-3xl font-bold text-indigo-900">
                  {analyticsData.total}
                </p>
              </div>
              <FileText className="w-8 h-8 text-indigo-600" />
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
            <p className="text-green-600 text-sm mt-2">Across all items</p>
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
            <p className="text-purple-600 text-sm mt-2">All item views</p>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Content Status Breakdown
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

        {/* Content by Category */}
        {analyticsData.contentByCategory && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Content by Category
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(analyticsData.contentByCategory).map(
                ([category, count]) => (
                  <div key={category} className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-800 font-medium">
                        {category}
                      </span>
                      <span className="text-blue-600 font-bold">{count}</span>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Top Content */}
        {analyticsData.topContent && analyticsData.topContent.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Top Content by Views
              </h3>
            </div>
            <div className="space-y-3">
              {analyticsData.topContent.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-500">{item.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-indigo-600">
                      {item.viewCount.toLocaleString()} views
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.downloadCount.toLocaleString()} downloads
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

  if (loading && contentItems.length === 0) {
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
              <AlertCircle className="h-5 w-5 text-red-400" />
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
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="CurrentColor">
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
                <FileText className="w-7 h-7 mr-3 text-red-600" />
                Policy & Position Management
              </h2>
              <p className="text-gray-600 mt-1">
                Manage policy beliefs and positional statements
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setEditingItem(undefined);
                  setShowCreateModal(true);
                }}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 flex items-center font-medium transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Item
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
                {
                  id: "policyBeliefs",
                  label: "Policy Beliefs",
                  count: contentItems.filter((a) => a.type === "PolicyBelief").length,
                },
                {
                  id: "positionalStatements",
                  label: "Positional Statements",
                  count: contentItems.filter((a) => a.type === "PositionalStatement").length,
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
                  placeholder="Search content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-600" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
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
                  Content Analytics
                </h3>
                <p className="text-gray-600">
                  Comprehensive analytics and insights about your content library
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
                    Analytics data will appear once you have published content with user engagement.
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
              
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  const isExpanded = expandedItems.includes(item.id);

                  return (
                    <div
                      key={item.id}
                      className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow"
                    >
                      <div className="flex flex-col lg:flex-row">
                        {/* Image */}
                        <div className="lg:w-64 h-48 lg:h-auto flex-shrink-0">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover rounded-t-lg lg:rounded-l-lg lg:rounded-t-none"
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-6">
                          {/* Header */}
                          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                            <div className="flex-1">
                              {/* Status and Feature Badges */}
                              <div className="flex flex-wrap gap-2 mb-3">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                                    item.status
                                  )} flex items-center`}
                                >
                                  {getStatusIcon(item.status)}
                                  <span className="ml-1">{item.status}</span>
                                </span>
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs font-medium rounded border border-blue-200">
                                  {item.category}
                                </span>
                                
                                {item.type === "PolicyBelief" && (
                                  <span className={`text-xs font-medium ${getPriorityColor(item.priority)} px-2 py-1 bg-gray-100 rounded`}>
                                    {item.priority} Priority
                                  </span>
                                )}
                                
                                {item.type === "PositionalStatement" && item.countryFocus && item.countryFocus.map((country, index) => (
                                  <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 text-xs font-medium rounded border border-purple-200">
                                    {country}
                                  </span>
                                ))}
                              </div>

                              <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                                {item.title}
                              </h3>

                              {/* Info */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                <div className="space-y-2">
                                  <div className="flex items-center text-gray-600 text-sm">
                                    <Calendar className="w-4 h-4 mr-2 text-red-600" />
                                    <span>Created: {new Date(item.createdAt).toLocaleDateString()}</span>
                                  </div>
                                  <div className="flex items-center text-gray-600 text-sm">
                                    <Calendar className="w-4 h-4 mr-2 text-red-600" />
                                    <span>Updated: {new Date(item.updatedAt).toLocaleDateString()}</span>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <div className="flex items-center text-gray-600 text-sm">
                                    <Eye className="w-4 h-4 mr-2 text-red-600" />
                                    <span>{item.viewCount.toLocaleString()} views</span>
                                  </div>
                                  <div className="flex items-center text-gray-600 text-sm">
                                    <Download className="w-4 h-4 mr-2 text-red-600" />
                                    <span>{item.downloadCount.toLocaleString()} downloads</span>
                                  </div>
                                </div>
                              </div>

                              {/* Summary */}
                              <div className="mb-4">
                                <p className="text-gray-600 text-sm leading-relaxed">
                                  {item.summary}
                                </p>
                              </div>

                              {/* Key Points Preview */}
                              <div className="mb-4">
                                <h4 className="font-semibold text-gray-900 text-sm mb-2">
                                  {item.type === "PolicyBelief" ? "Key Recommendations:" : "Key Points:"}
                                </h4>
                                <div className="space-y-1">
                                  <div className="flex items-start text-sm text-gray-600">
                                    <Hash className="w-4 h-4 mr-2 mt-0.5 text-red-600 flex-shrink-0" />
                                    {item.type === "PolicyBelief" 
                                      ? item.keyRecommendations[0]
                                      : item.keyPoints[0]}
                                  </div>
                                  {!isExpanded && (
                                    <p className="text-sm text-gray-500 ml-6">
                                      and {(item.type === "PolicyBelief" 
                                        ? item.keyRecommendations.length 
                                        : item.keyPoints.length) - 1} more...
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Tags */}
                              <div className="mb-4">
                                <h4 className="font-semibold text-gray-900 text-sm mb-1">
                                  Tags:
                                </h4>
                                <div className="flex flex-wrap gap-1">
                                  {item.tags.slice(0, 3).map((tag, index) => (
                                    <span
                                      key={index}
                                      className="bg-gray-100 text-gray-700 px-2 py-1 text-xs rounded"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                  {item.tags.length > 3 && (
                                    <span className="text-xs text-gray-500">
                                      +{item.tags.length - 3} more
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Expandable Content */}
                              {isExpanded && (
                                <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                                  {/* All Key Points */}
                                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                                    <h4 className="font-medium text-gray-900 mb-2">
                                      {item.type === "PolicyBelief" ? "All Recommendations" : "All Key Points"}
                                    </h4>
                                    <ul className="space-y-2 text-sm text-gray-600">
                                      {(item.type === "PolicyBelief" 
                                        ? item.keyRecommendations 
                                        : item.keyPoints).map((point, index) => (
                                        <li key={index} className="flex items-start">
                                          <Hash className="w-4 h-4 mr-2 mt-0.5 text-red-600 flex-shrink-0" />
                                          {point}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>

                                  {/* Target Audience for Policy Beliefs */}
                                  {item.type === "PolicyBelief" && (
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                      <h4 className="font-medium text-gray-900 mb-2">
                                        Target Audience
                                      </h4>
                                      <div className="flex flex-wrap gap-1">
                                        {item.targetAudience.map((audience, index) => (
                                          <span
                                            key={index}
                                            className="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded"
                                          >
                                            {audience}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Region/Country Focus */}
                                  <div className="bg-green-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                      <Globe className="w-4 h-4 mr-2" />
                                      {item.type === "PolicyBelief" ? "Region Focus" : "Country Focus"}
                                    </h4>
                                    <div className="flex flex-wrap gap-1">
                                      {(item.type === "PolicyBelief" 
                                        ? item.region 
                                        : item.countryFocus).map((location, index) => (
                                        <span
                                          key={index}
                                          className="bg-green-100 text-green-800 px-2 py-1 text-xs rounded"
                                        >
                                          {location}
                                        </span>
                                      ))}
                                    </div>
                                  </div>

                                  {/* All Tags */}
                                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                                    <h4 className="font-medium text-gray-900 mb-2">
                                      All Tags
                                    </h4>
                                    <div className="flex flex-wrap gap-1">
                                      {item.tags.map((tag, index) => (
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
                              onClick={() => toggleExpand(item.id)}
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
                                setEditingItem(item);
                                setShowCreateModal(true);
                              }}
                              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center text-sm font-medium transition-colors"
                            >
                              <Edit3 className="w-4 h-4 mr-2" />
                              Edit
                            </button>

                            <div className="relative">
                              <select
                                value={item.status}
                                onChange={(e) =>
                                  handleStatusChange(
                                    item.id,
                                    e.target.value as ContentStatus
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
                              onClick={() => handleDeleteItem(item.id)}
                              className="border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 flex items-center text-sm font-medium transition-colors"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </button>
                          </div>

                          {/* Metadata */}
                          <div className="pt-4 border-t border-gray-200">
                            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                              <span>Created: {new Date(item.createdAt).toLocaleDateString()}</span>
                              <span>Last Updated: {new Date(item.updatedAt).toLocaleDateString()}</span>
                              <span>ID: #{item.id}</span>
                              {item.type === "PositionalStatement" && (
                                <span>Pages: {item.pageCount}</span>
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
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No content found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm
                      ? "No items match your search criteria."
                      : `No items in the ${selectedTab} category.`}
                  </p>
                  <button
                    onClick={() => {
                      setEditingItem(undefined);
                      setShowCreateModal(true);
                    }}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-medium"
                  >
                    Add Your First Item
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <CreateContentModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingItem(undefined);
        }}
        onSave={handleSaveItem}
        editingItem={editingItem}
        contentType={selectedTab === "policyBeliefs" ? "PolicyBelief" : "PositionalStatement"}
      />
    </div>
  );
};

export default PolicyManagementTab;