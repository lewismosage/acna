import React, { useState, useEffect } from "react";
import {
  Video,
  Calendar,
  Clock,
  User,
  Users,
  Edit3,
  Eye,
  CheckCircle,
  AlertCircle,
  Archive,
  Settings,
  BarChart3,
  Mail,
  Star,
  Trash2,
  Play,
  Upload,
  BookOpen,
  Languages,
  Target,
  Tag,
  Phone,
  TrendingUp,
  Eye as EyeIcon,
  Download,
  FileText,
  ChevronDown,
  ChevronUp,
  Plus,
} from "lucide-react";

type WebinarStatus =
  | "Planning"
  | "Registration Open"
  | "Live"
  | "Completed"
  | "Cancelled";
type WebinarType = "Live" | "Recorded" | "Hybrid";

export interface Webinar {
  id: number;
  title: string;
  description: string;
  full_description?: string;
  category: string;
  date: string;
  time: string;
  duration: string;
  speakers: {
    name: string;
    credentials: string;
    affiliation: string;
  }[];
  status: WebinarStatus;
  type: WebinarType;
  isUpcoming: boolean;
  isFeatured?: boolean;
  registrationLink?: string;
  recordingLink?: string;
  slidesLink?: string;
  imageUrl: string;
  tags: string[];
  languages: string[];
  targetAudience: string[];
  learningObjectives: string[];
  registrationCount?: number;
  capacity?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Registration {
  id: number;
  attendeeName: string;
  email: string;
  phone: string;
  organization?: string;
  registrationType: "Free" | "Paid" | "Student" | "Professional";
  paymentStatus: "pending" | "paid" | "free" | "failed" | "refunded";
  registrationDate: string;
  webinarId: number;
  webinarTitle: string;
  amount?: number;
  country?: string;
}

export interface WebinarAnalytics {
  total: number;
  planning: number;
  registrationOpen: number;
  live: number;
  completed: number;
  cancelled: number;
  totalRegistrations: number;
  monthlyRegistrations: number;
  featured: number;
  totalViews: number;
  webinarsByType?: {
    Live: number;
    Recorded: number;
    Hybrid: number;
  };
  topWebinars?: Array<{
    id: number;
    title: string;
    date: string;
    registrationCount: number;
  }>;
}

interface WebinarsTabProps {
  webinars?: Webinar[];
}

// Import the CreateWebinarModal component and API
import CreateWebinarModal from "./CreateWebinarModal";
import { webinarsApi } from "../../../../services/webinarsApi";
import LoadingSpinner from "../../../../components/common/LoadingSpinner";

const WebinarsTab: React.FC<WebinarsTabProps> = ({
  webinars: initialWebinars = [],
}) => {
  const [webinars, setWebinars] = useState<Webinar[]>(initialWebinars);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [selectedTab, setSelectedTab] = useState<
    | "all"
    | "upcoming"
    | "live"
    | "completed"
    | "planning"
    | "registrations"
    | "analytics"
  >("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingWebinar, setEditingWebinar] = useState<Webinar | undefined>(
    undefined
  );
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<WebinarAnalytics | null>(
    null
  );
  const [expandedWebinars, setExpandedWebinars] = useState<number[]>([]);

  // Load webinars on component mount
  useEffect(() => {
    loadWebinars();
    loadRegistrations();
  }, []);

  // Load analytics when tab changes
  useEffect(() => {
    if (selectedTab === "analytics") {
      loadAnalytics();
    }
  }, [selectedTab]);

  const loadWebinars = async () => {
    try {
      setLoading(true);
      const fetchedWebinars = await webinarsApi.getAll();
      setWebinars(fetchedWebinars);
    } catch (err) {
      console.error("Error loading webinars:", err);
      setWebinars([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const loadRegistrations = async () => {
    try {
      const fetchedRegistrations = await webinarsApi.getRegistrations();
      setRegistrations(fetchedRegistrations);
    } catch (err) {
      console.error("Error loading registrations:", err);
      setRegistrations([]); // Set empty array on error
    }
  };

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await webinarsApi.getAnalytics();
      setAnalyticsData(data);
    } catch (err) {
      console.error("Error loading analytics:", err);
      setAnalyticsData(null);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to truncate text to two sentences
  const truncateToTwoSentences = (
    text: string
  ): { truncated: string; hasMore: boolean } => {
    if (!text) return { truncated: "", hasMore: false };

    // Split by sentence endings (., !, ?)
    const sentences = text.match(/[^\.!?]+[\.!?]+/g) || [];

    if (sentences.length <= 2) {
      return { truncated: text, hasMore: false };
    }

    // Take first two sentences
    const truncated = sentences.slice(0, 2).join(" ").trim();
    return { truncated, hasMore: true };
  };

  const getStatusColor = (status: WebinarStatus) => {
    switch (status) {
      case "Registration Open":
        return "bg-green-100 text-green-800 border-green-200";
      case "Live":
        return "bg-red-100 text-red-800 border-red-200";
      case "Planning":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Completed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: WebinarStatus) => {
    switch (status) {
      case "Registration Open":
        return <CheckCircle className="w-4 h-4" />;
      case "Live":
        return <Play className="w-4 h-4" />;
      case "Planning":
        return <Settings className="w-4 h-4" />;
      case "Completed":
        return <Archive className="w-4 h-4" />;
      case "Cancelled":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Free":
        return "bg-blue-100 text-blue-800";
      case "Failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleStatusChange = async (
    webinarId: number,
    newStatus: WebinarStatus
  ) => {
    try {
      await webinarsApi.updateStatus(webinarId, newStatus);
      setWebinars((prev) =>
        prev.map((webinar) =>
          webinar.id === webinarId
            ? {
                ...webinar,
                status: newStatus,
                updatedAt: new Date().toISOString().split("T")[0],
              }
            : webinar
        )
      );
    } catch (err) {
      console.error("Error updating webinar status:", err);
    }
  };

  const handleCreateWebinar = async (webinarData: Webinar) => {
    try {
      if (editingWebinar) {
        // Update existing webinar
        const updatedWebinar = await webinarsApi.update(editingWebinar.id, {
          title: webinarData.title,
          description: webinarData.description,
          category: webinarData.category,
          date: webinarData.date,
          time: webinarData.time,
          duration: webinarData.duration,
          speakers: webinarData.speakers,
          status: webinarData.status,
          type: webinarData.type,
          isFeatured: webinarData.isFeatured,
          registrationLink: webinarData.registrationLink,
          recordingLink: webinarData.recordingLink,
          slidesLink: webinarData.slidesLink,
          imageUrl: webinarData.imageUrl,
          tags: webinarData.tags,
          languages: webinarData.languages,
          targetAudience: webinarData.targetAudience,
          learningObjectives: webinarData.learningObjectives,
          capacity: webinarData.capacity,
        });
        setWebinars((prev) =>
          prev.map((w) => (w.id === editingWebinar.id ? updatedWebinar : w))
        );
      } else {
        // Create new webinar
        const createdWebinar = await webinarsApi.create({
          title: webinarData.title,
          description: webinarData.description,
          category: webinarData.category,
          date: webinarData.date,
          time: webinarData.time,
          duration: webinarData.duration,
          speakers: webinarData.speakers,
          status: webinarData.status,
          type: webinarData.type,
          isFeatured: webinarData.isFeatured,
          registrationLink: webinarData.registrationLink,
          recordingLink: webinarData.recordingLink,
          slidesLink: webinarData.slidesLink,
          imageUrl: webinarData.imageUrl,
          tags: webinarData.tags,
          languages: webinarData.languages,
          targetAudience: webinarData.targetAudience,
          learningObjectives: webinarData.learningObjectives,
          capacity: webinarData.capacity,
        });
        setWebinars((prev) => [createdWebinar, ...prev]);
      }
      setShowCreateModal(false);
      setEditingWebinar(undefined);
    } catch (err) {
      console.error("Error saving webinar:", err);
    }
  };

  const handleEditWebinar = (webinar: Webinar) => {
    setEditingWebinar(webinar);
    setShowCreateModal(true);
  };

  const handleToggleFeatured = async (webinarId: number) => {
    try {
      await webinarsApi.toggleFeatured(webinarId);
      setWebinars((prev) =>
        prev.map((w) =>
          w.id === webinarId ? { ...w, isFeatured: !w.isFeatured } : w
        )
      );
    } catch (err) {
      console.error("Error toggling featured status:", err);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedWebinars((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const getProgressPercentage = (registered: number, capacity: number) => {
    return Math.round((registered / capacity) * 100);
  };

  // Helper function to safely render array data
  const safeArrayJoin = (arr: any[], key?: string, limit?: number): string => {
    if (!Array.isArray(arr) || arr.length === 0) return "None";

    let values: string[];
    if (key) {
      values = arr
        .map((item) => {
          if (typeof item === "string") return item;
          if (typeof item === "object" && item !== null) {
            return item[key] || "";
          }
          return "";
        })
        .filter(Boolean);
    } else {
      values = arr
        .map((item) => {
          if (typeof item === "string") return item;
          if (typeof item === "object" && item !== null) {
            return (
              item.name ||
              item.language ||
              item.audience ||
              item.objective ||
              ""
            );
          }
          return "";
        })
        .filter(Boolean);
    }

    if (limit && values.length > limit) {
      return (
        values.slice(0, limit).join(", ") + ` (+${values.length - limit} more)`
      );
    }

    return values.join(", ") || "None";
  };

  // Function to render text with line breaks
  const renderWithLineBreaks = (text: string) => {
    if (!text) return null;
    return text.split("\n").map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < text.split("\n").length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const filteredWebinars = webinars.filter((webinar) => {
    switch (selectedTab) {
      case "upcoming":
        return ["Registration Open"].includes(webinar.status);
      case "live":
        return webinar.status === "Live";
      case "completed":
        return webinar.status === "Completed";
      case "planning":
        return webinar.status === "Planning";
      default:
        return true;
    }
  });

  const renderAnalyticsTab = () => {
    if (!analyticsData) return null;

    return (
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">
                  Total Webinars
                </p>
                <p className="text-3xl font-bold text-purple-900">
                  {analyticsData.total}
                </p>
              </div>
              <Video className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-purple-600 text-sm mt-2">All time</p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">
                  Total Registrations
                </p>
                <p className="text-3xl font-bold text-green-900">
                  {analyticsData.totalRegistrations.toLocaleString()}
                </p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-green-600 text-sm mt-2">Across all webinars</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">
                  Monthly Registrations
                </p>
                <p className="text-3xl font-bold text-blue-900">
                  {analyticsData.monthlyRegistrations.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-blue-600 text-sm mt-2">Last 30 days</p>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">
                  Total Views
                </p>
                <p className="text-3xl font-bold text-orange-900">
                  {analyticsData.totalViews.toLocaleString()}
                </p>
              </div>
              <EyeIcon className="w-8 h-8 text-orange-600" />
            </div>
            <p className="text-orange-600 text-sm mt-2">All webinar views</p>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Webinar Status Breakdown
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 rounded-lg bg-blue-50">
              <div className="text-2xl font-bold text-blue-800">
                {analyticsData.planning}
              </div>
              <div className="text-sm text-blue-600">Planning</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-green-50">
              <div className="text-2xl font-bold text-green-800">
                {analyticsData.registrationOpen}
              </div>
              <div className="text-sm text-green-600">Registration Open</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-red-50">
              <div className="text-2xl font-bold text-red-800">
                {analyticsData.live}
              </div>
              <div className="text-sm text-red-600">Live</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-gray-50">
              <div className="text-2xl font-bold text-gray-800">
                {analyticsData.completed}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-red-50">
              <div className="text-2xl font-bold text-red-800">
                {analyticsData.cancelled}
              </div>
              <div className="text-sm text-red-600">Cancelled</div>
            </div>
          </div>
        </div>

        {/* Webinar Types */}
        {analyticsData.webinarsByType && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Webinar Types
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-blue-800 font-medium">Live</span>
                  <span className="text-blue-600 font-bold">
                    {analyticsData.webinarsByType.Live || 0}
                  </span>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-green-800 font-medium">Recorded</span>
                  <span className="text-green-600 font-bold">
                    {analyticsData.webinarsByType.Recorded || 0}
                  </span>
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-purple-800 font-medium">Hybrid</span>
                  <span className="text-purple-600 font-bold">
                    {analyticsData.webinarsByType.Hybrid || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top Webinars */}
        {analyticsData.topWebinars && analyticsData.topWebinars.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Top Webinars by Registration
              </h3>
              <button className="flex items-center text-sm text-purple-600 hover:text-purple-800">
                <Download className="w-4 h-4 mr-1" />
                Export Report
              </button>
            </div>
            <div className="space-y-3">
              {analyticsData.topWebinars.map((webinar) => (
                <div
                  key={webinar.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {webinar.title}
                    </p>
                    <p className="text-xs text-gray-500">{webinar.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-purple-600">
                      {webinar.registrationCount} registrations
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Featured Webinars
            </h3>
            <div className="text-center py-8">
              <Star className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <div className="text-3xl font-bold text-gray-900">
                {analyticsData.featured}
              </div>
              <p className="text-gray-600">Featured webinars</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <span className="text-sm font-medium">Export All Data</span>
                <FileText className="w-4 h-4 text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <span className="text-sm font-medium">Generate Report</span>
                <BarChart3 className="w-4 h-4 text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <span className="text-sm font-medium">Email Summary</span>
                <Mail className="w-4 h-4 text-gray-400" />
              </button>
            </div>
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
        <div className="bg-purple-50 px-6 py-4 border-b border-gray-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Video className="w-7 h-7 mr-3 text-purple-600" />
                Webinar Management
              </h2>
              <p className="text-gray-600 mt-1">
                Manage webinars, speakers, and educational sessions
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 flex items-center font-medium transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Webinar
              </button>
              <button
                onClick={() => setSelectedTab("analytics")}
                className="border border-purple-600 text-purple-600 px-6 py-2 rounded-lg hover:bg-purple-50 flex items-center font-medium transition-colors"
              >
                <BarChart3 className="w-5 h-5 mr-2" />
                Analytics
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-4 border-b border-gray-200">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              { id: "all", label: "All Webinars", count: webinars.length },
              {
                id: "upcoming",
                label: "Upcoming",
                count: webinars.filter((w) =>
                  ["Registration Open"].includes(w.status)
                ).length,
              },
              {
                id: "live",
                label: "Live Now",
                count: webinars.filter((w) => w.status === "Live").length,
              },
              {
                id: "completed",
                label: "Completed",
                count: webinars.filter((w) => w.status === "Completed").length,
              },
              {
                id: "planning",
                label: "Planning",
                count: webinars.filter((w) => w.status === "Planning").length,
              },
              {
                id: "registrations",
                label: "Registrations",
                count: registrations.length,
              },
              { id: "analytics", label: "Analytics", count: 0 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`py-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  selectedTab === tab.id
                    ? "border-purple-600 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label} {tab.count > 0 && `(${tab.count})`}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {selectedTab === "registrations" ? (
            /* Registrations Table */
            <div>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Webinar Registrations
                </h3>
                <p className="text-gray-600">
                  Manage attendee registrations for all webinars
                </p>
              </div>

              {registrations.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Attendee
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Contact Info
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Registration Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Payment Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Registration Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {registrations.map((registration) => (
                        <tr key={registration.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {registration.attendeeName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {registration.organization}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              <div className="flex items-center mb-1">
                                <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                {registration.email}
                              </div>
                              <div className="flex items-center">
                                <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                {registration.phone}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {registration.registrationType}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(
                                registration.paymentStatus
                              )}`}
                            >
                              {registration.paymentStatus}
                              {registration.amount &&
                                ` (${registration.amount})`}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {registration.registrationDate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <button className="text-purple-600 hover:text-purple-900">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="text-blue-600 hover:text-blue-900">
                                <Mail className="w-4 h-4" />
                              </button>
                              <button className="text-red-600 hover:text-red-900">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No registrations found
                  </h3>
                  <p className="text-gray-500">
                    No attendees have registered for any webinars yet.
                  </p>
                </div>
              )}
            </div>
          ) : selectedTab === "analytics" ? (
            /* Analytics Tab */
            <div>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Webinar Analytics
                </h3>
                <p className="text-gray-600">
                  Comprehensive analytics and insights about your webinars
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
                    Analytics data will appear once you have webinars with
                    registrations.
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Webinars List */
            <div className="space-y-6">
              {filteredWebinars.length > 0 ? (
                filteredWebinars.map((webinar) => {
                  const isExpanded = expandedWebinars.includes(webinar.id);
                  const { truncated: truncatedDescription, hasMore } =
                    truncateToTwoSentences(webinar.description);

                  return (
                    <div
                      key={webinar.id}
                      className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow"
                    >
                      <div className="flex flex-col lg:flex-row">
                        {/* Webinar Image */}
                        <div className="lg:w-1/4">
                          <div className="relative">
                            <img
                              src={
                                webinar.imageUrl || "/api/placeholder/300/200"
                              }
                              alt={webinar.title}
                              className="w-full h-48 lg:h-full object-cover rounded-t-lg lg:rounded-l-lg lg:rounded-t-none"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/api/placeholder/300/200";
                              }}
                            />
                            <div className="absolute top-3 left-3">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                                  webinar.status
                                )} flex items-center`}
                              >
                                {getStatusIcon(webinar.status)}
                                <span className="ml-1">{webinar.status}</span>
                              </span>
                            </div>
                            {webinar.isFeatured && (
                              <div className="absolute top-3 right-3">
                                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                              </div>
                            )}
                            <div className="absolute bottom-3 right-3">
                              <span className="bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs font-medium">
                                {webinar.type}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Webinar Details */}
                        <div className="lg:w-3/4 p-6">
                          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                                {webinar.title}
                              </h3>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                <div className="space-y-2">
                                  <div className="flex items-center text-gray-600 text-sm">
                                    <Calendar className="w-4 h-4 mr-2 text-purple-600" />
                                    <span className="font-medium">
                                      {webinar.date}
                                    </span>
                                  </div>
                                  <div className="flex items-center text-gray-600 text-sm">
                                    <Clock className="w-4 h-4 mr-2 text-purple-600" />
                                    <span className="font-medium">
                                      {webinar.time} ({webinar.duration})
                                    </span>
                                  </div>
                                  <div className="flex items-center text-gray-600 text-sm">
                                    <Tag className="w-4 h-4 mr-2 text-purple-600" />
                                    <span className="font-medium">
                                      {webinar.category}
                                    </span>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <div className="flex items-center text-gray-600 text-sm">
                                    <Languages className="w-4 h-4 mr-2 text-purple-600" />
                                    <span>
                                      {safeArrayJoin(
                                        webinar.languages,
                                        "language",
                                        2
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex items-center text-gray-600 text-sm">
                                    <Target className="w-4 h-4 mr-2 text-purple-600" />
                                    <span>
                                      {safeArrayJoin(
                                        webinar.targetAudience,
                                        "audience",
                                        2
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex items-center text-gray-600 text-sm">
                                    <User className="w-4 h-4 mr-2 text-purple-600" />
                                    <span>
                                      {(webinar.speakers || []).length} speaker
                                      {(webinar.speakers || []).length > 1
                                        ? "s"
                                        : ""}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Registration Progress */}
                              {webinar.registrationCount !== undefined &&
                                webinar.capacity && (
                                  <div className="mb-4">
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="text-sm font-medium text-gray-700">
                                        Registration Progress
                                      </span>
                                      <span className="text-sm text-gray-600">
                                        {webinar.registrationCount} /{" "}
                                        {webinar.capacity} (
                                        {getProgressPercentage(
                                          webinar.registrationCount,
                                          webinar.capacity
                                        )}
                                        %)
                                      </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div
                                        className="bg-purple-600 h-2 rounded-full"
                                        style={{
                                          width: `${getProgressPercentage(
                                            webinar.registrationCount,
                                            webinar.capacity
                                          )}%`,
                                        }}
                                      ></div>
                                    </div>
                                  </div>
                                )}

                              {/* Speakers */}
                              <div className="mb-4">
                                <h4 className="font-semibold text-gray-900 text-sm mb-2">
                                  Speakers:
                                </h4>
                                <div className="space-y-1">
                                  {(webinar.speakers || []).map(
                                    (speaker, index) => (
                                      <div key={index} className="text-sm">
                                        <span className="font-medium text-gray-900">
                                          {speaker.name}, {speaker.credentials}
                                        </span>
                                        <span className="text-gray-600 ml-2">
                                          {speaker.affiliation}
                                        </span>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* TRUNCATED DESCRIPTION - shows only when NOT expanded */}
                          {!isExpanded && (
                            <div className="mb-4">
                              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                                {renderWithLineBreaks(truncatedDescription)}
                              </p>
                              {hasMore && (
                                <button
                                  onClick={() => toggleExpand(webinar.id)}
                                  className="text-purple-600 hover:text-purple-800 text-sm font-medium mt-1"
                                >
                                  Read more...
                                </button>
                              )}
                            </div>
                          )}

                          {/* Tags */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {(webinar.tags || []).map((tag, index) => (
                              <span
                                key={index}
                                className="bg-purple-100 text-purple-800 px-2 py-1 text-xs rounded"
                              >
                                {typeof tag === "string" ? tag : ""}
                              </span>
                            ))}
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
                                    webinar.full_description ||
                                      webinar.description
                                  )}
                                </p>
                              </div>

                              {/* Learning Objectives */}
                              {webinar.learningObjectives &&
                                webinar.learningObjectives.length > 0 && (
                                  <div className="bg-blue-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-2">
                                      Learning Objectives
                                    </h4>
                                    <ul className="text-gray-600 text-sm list-disc list-inside space-y-1">
                                      {webinar.learningObjectives.map(
                                        (objective, index) => (
                                          <li key={index}>{objective}</li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}

                              {/* Additional Details */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Links */}
                                {(webinar.registrationLink ||
                                  webinar.recordingLink ||
                                  webinar.slidesLink) && (
                                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                                    <h4 className="font-medium text-gray-900 mb-2">
                                      Links
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                      {webinar.registrationLink && (
                                        <div>
                                          <span className="font-medium">
                                            Registration:{" "}
                                          </span>
                                          <a
                                            href={webinar.registrationLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-purple-600 hover:underline"
                                          >
                                            {webinar.registrationLink}
                                          </a>
                                        </div>
                                      )}
                                      {webinar.recordingLink && (
                                        <div>
                                          <span className="font-medium">
                                            Recording:{" "}
                                          </span>
                                          <a
                                            href={webinar.recordingLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-purple-600 hover:underline"
                                          >
                                            {webinar.recordingLink}
                                          </a>
                                        </div>
                                      )}
                                      {webinar.slidesLink && (
                                        <div>
                                          <span className="font-medium">
                                            Slides:{" "}
                                          </span>
                                          <a
                                            href={webinar.slidesLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-purple-600 hover:underline"
                                          >
                                            {webinar.slidesLink}
                                          </a>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Additional Info */}
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                  <h4 className="font-medium text-gray-900 mb-2">
                                    Additional Information
                                  </h4>
                                  <div className="space-y-2 text-sm text-gray-600">
                                    <div>
                                      <span className="font-medium">
                                        Created:{" "}
                                      </span>
                                      {webinar.createdAt}
                                    </div>
                                    <div>
                                      <span className="font-medium">
                                        Updated:{" "}
                                      </span>
                                      {webinar.updatedAt}
                                    </div>
                                    <div>
                                      <span className="font-medium">ID: </span>#
                                      {webinar.id}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Admin Actions */}
                          <div className="flex flex-wrap gap-3">
                            <button
                              onClick={() => toggleExpand(webinar.id)}
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
                              onClick={() => handleEditWebinar(webinar)}
                              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center text-sm font-medium transition-colors"
                            >
                              <Edit3 className="w-4 h-4 mr-2" />
                              Edit Details
                            </button>

                            <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center text-sm font-medium transition-colors">
                              <Mail className="w-4 h-4 mr-2" />
                              Email Registrants
                            </button>

                            {webinar.status === "Completed" && (
                              <>
                                <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center text-sm font-medium transition-colors">
                                  <Upload className="w-4 h-4 mr-2" />
                                  Upload Recording
                                </button>
                                <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center text-sm font-medium transition-colors">
                                  <BookOpen className="w-4 h-4 mr-2" />
                                  Upload Slides
                                </button>
                              </>
                            )}

                            <div className="relative">
                              <select
                                value={webinar.status}
                                onChange={(e) =>
                                  handleStatusChange(
                                    webinar.id,
                                    e.target.value as WebinarStatus
                                  )
                                }
                                className="border border-gray-300 px-3 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              >
                                <option value="Planning">Planning</option>
                                <option value="Registration Open">
                                  Registration Open
                                </option>
                                <option value="Live">Mark as Live</option>
                                <option value="Completed">
                                  Mark as Completed
                                </option>
                                <option value="Cancelled">Cancel</option>
                              </select>
                            </div>

                            <button
                              onClick={() => handleToggleFeatured(webinar.id)}
                              className={`border px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-colors ${
                                webinar.isFeatured
                                  ? "border-yellow-300 bg-yellow-50 text-yellow-800 hover:bg-yellow-100"
                                  : "border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              <Star
                                className={`w-4 h-4 mr-2 ${
                                  webinar.isFeatured ? "fill-current" : ""
                                }`}
                              />
                              {webinar.isFeatured ? "Unfeature" : "Feature"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No webinars found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {selectedTab === "all"
                      ? "You haven't created any webinars yet."
                      : `No webinars in the ${selectedTab} category.`}
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 font-medium"
                  >
                    Create Your First Webinar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Webinar Modal */}
      {showCreateModal && (
        <CreateWebinarModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setEditingWebinar(undefined);
          }}
          onSave={handleCreateWebinar}
          initialData={editingWebinar}
        />
      )}
    </div>
  );
};

export default WebinarsTab;
