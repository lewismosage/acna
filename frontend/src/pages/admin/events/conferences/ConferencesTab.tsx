import React, { useState, useEffect } from "react";
import {
  Users,
  Calendar,
  MapPin,
  Edit3,
  Globe,
  CheckCircle,
  AlertCircle,
  Archive,
  BarChart3,
  Mail,
  Trash2,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  Phone,
  Plus,
} from "lucide-react";
import CreateEventModal from "./CreateConferencesModal";
import AlertModal from "../../../../components/common/AlertModal";
import { conferencesApi } from "../../../../services/conferenceApi";
import type {
  Conference,
  Registration,
  ConferenceAnalytics,
  ConferenceCreateUpdateData,
} from "../../../../services/conferenceApi";
import LoadingSpinner from "../../../../components/common/LoadingSpinner";

interface ConferencesTabProps {
  conferences?: Conference[];
}

const ConferencesTab: React.FC<ConferencesTabProps> = ({
  conferences: initialConferences,
}) => {
  const [expandedConferences, setExpandedConferences] = useState<number[]>([]);
  const [conferences, setConferences] = useState<Conference[]>(
    initialConferences || []
  );
  const [selectedTab, setSelectedTab] = useState<
    "all" | "upcoming" | "completed" | "registrations" | "analytics"
  >("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingConference, setEditingConference] = useState<Conference | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registrations, setRegistrations] = useState<
    (Registration & { conference_title: string; conference_id: number })[]
  >([]);
  const [analyticsData, setAnalyticsData] =
    useState<ConferenceAnalytics | null>(null);

  // Alert modal state
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "info" | "warning" | "error" | "success" | "confirm";
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  // Fetch conferences from backend
  useEffect(() => {
    const fetchConferences = async () => {
      if (initialConferences && initialConferences.length > 0) {
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const data = await conferencesApi.getAll();
        setConferences(data);
      } catch (err: any) {
        const errorMessage =
          err?.error ||
          err?.message ||
          "Failed to load conferences. Please try again later.";
        setError(errorMessage);
        console.error("Error fetching conferences:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConferences();
  }, [initialConferences]);

  // Fetch registrations when tab changes
  useEffect(() => {
    if (selectedTab === "registrations") {
      const fetchRegistrations = async () => {
        setIsLoading(true);
        try {
          const data = await conferencesApi.getAll();
          const allRegistrations: (Registration & {
            conference_title: string;
            conference_id: number;
          })[] = [];

          data.forEach((conf) => {
            const confRegistrations =
              conf.conference_registrations || conf.registrations || [];

            // Add conference information to each registration
            const registrationsWithConference = confRegistrations.map(
              (reg) => ({
                ...reg,
                conference_title: conf.title,
                conference_id: conf.id!,
              })
            );

            allRegistrations.push(...registrationsWithConference);
          });

          setRegistrations(allRegistrations);
        } catch (err: any) {
          const errorMessage =
            err?.error || err?.message || "Failed to load registrations.";
          setError(errorMessage);
          console.error("Error fetching registrations:", err);
        } finally {
          setIsLoading(false);
        }
      };

      fetchRegistrations();
    }
  }, [selectedTab]);

  // Fetch analytics when tab changes
  useEffect(() => {
    if (selectedTab === "analytics") {
      const fetchAnalytics = async () => {
        setIsLoading(true);
        try {
          const data = await conferencesApi.getAnalytics();
          setAnalyticsData(data);
        } catch (err: any) {
          const errorMessage =
            err?.error || err?.message || "Failed to load analytics data.";
          setError(errorMessage);
          console.error("Error fetching analytics:", err);
        } finally {
          setIsLoading(false);
        }
      };

      fetchAnalytics();
    }
  }, [selectedTab]);

  // Helper function to show alert modal
  const showAlert = (
    title: string,
    message: string,
    type: "info" | "warning" | "error" | "success" | "confirm" = "info",
    onConfirm?: () => void,
    confirmText?: string,
    cancelText?: string
  ) => {
    setAlertModal({
      isOpen: true,
      title,
      message,
      type,
      onConfirm,
      confirmText,
      cancelText,
    });
  };

  const closeAlert = () => {
    setAlertModal({
      isOpen: false,
      title: "",
      message: "",
      type: "info",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "registration_open":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "coming_soon":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "planning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "registration_open":
        return <CheckCircle className="w-4 h-4" />;
      case "completed":
        return <Archive className="w-4 h-4" />;
      case "cancelled":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case "registration_open":
        return "Registration Open";
      case "coming_soon":
        return "Coming Soon";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      case "planning":
        return "Planning";
      default:
        return status;
    }
  };

  const handleStatusChange = async (
    conferenceId: number,
    newStatus: string
  ) => {
    try {
      const updatedConference = await conferencesApi.updateStatus(
        conferenceId,
        newStatus
      );
      setConferences((prev) =>
        prev.map((conf) =>
          conf.id === conferenceId ? updatedConference : conf
        )
      );

      // Show success message
      showAlert(
        "Status Updated",
        `Conference status has been successfully updated to "${getStatusDisplayName(
          newStatus
        )}".`,
        "success"
      );
    } catch (err: any) {
      const errorMessage =
        err?.error || err?.message || "Failed to update conference status.";
      showAlert("Update Failed", errorMessage, "error");
      console.error("Error updating status:", err);
    }
  };

  const handleEditConference = (conference: Conference) => {
    setEditingConference(conference);
    setShowCreateModal(true);
  };

  const handleCreateConference = async (
    conferenceData: ConferenceCreateUpdateData
  ) => {
    try {
      setIsLoading(true);
      let result: Conference;

      if (editingConference && editingConference.id) {
        result = await conferencesApi.update(
          editingConference.id,
          conferenceData
        );
        setConferences((prev) =>
          prev.map((conf) => (conf.id === editingConference.id ? result : conf))
        );

        showAlert(
          "Conference Updated",
          `"${result.title}" has been successfully updated.`,
          "success"
        );
      } else {
        result = await conferencesApi.create(conferenceData);
        setConferences((prev) => [result, ...prev]);

        showAlert(
          "Conference Created",
          `"${result.title}" has been successfully created.`,
          "success"
        );
      }

      setShowCreateModal(false);
      setEditingConference(null);
      setError(null);
    } catch (err: any) {
      let errorMessage = "Failed to save conference.";

      if (err?.error) {
        if (typeof err.error === "string") {
          errorMessage = err.error;
        } else if (typeof err.error === "object") {
          const fieldErrors = Object.entries(err.error)
            .map(([field, messages]: [string, any]) => {
              const messageArray = Array.isArray(messages)
                ? messages
                : [messages];
              return `${field}: ${messageArray.join(", ")}`;
            })
            .join("; ");
          errorMessage = fieldErrors || errorMessage;
        }
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      }

      showAlert("Save Failed", errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingConference(null);
  };

  const toggleExpand = (id: number) => {
    setExpandedConferences((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Updated delete function to use AlertModal instead of confirm()
  const handleDeleteConference = (conferenceId: number) => {
    const conference = conferences.find((c) => c.id === conferenceId);
    const conferenceName = conference?.title || "this conference";

    showAlert(
      "Delete Conference",
      `Are you sure you want to delete "${conferenceName}"?\n\nThis action cannot be undone and will permanently remove all conference data, including registrations and associated information.`,
      "confirm",
      async () => {
        try {
          await conferencesApi.delete(conferenceId);
          setConferences((prev) =>
            prev.filter((conf) => conf.id !== conferenceId)
          );

          showAlert(
            "Conference Deleted",
            `"${conferenceName}" has been successfully deleted.`,
            "success"
          );
        } catch (err: any) {
          const errorMessage =
            err?.error || err?.message || "Failed to delete conference.";
          showAlert("Delete Failed", errorMessage, "error");
          console.error("Error deleting conference:", err);
        }
      },
      "Delete Conference",
      "Cancel"
    );
  };

  const getProgressPercentage = (registered: number, capacity?: number) => {
    return capacity ? Math.round((registered / capacity) * 100) : 0;
  };

  const filteredConferences = conferences.filter((conference) => {
    switch (selectedTab) {
      case "upcoming":
        return (
          conference.status === "registration_open" ||
          conference.status === "coming_soon"
        );
      case "completed":
        return conference.status === "completed";
      case "registrations":
      case "analytics":
        return true;
      default:
        return true;
    }
  });

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "free":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderAnalyticsTab = () => {
    if (!analyticsData) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">
                  Total Conferences
                </p>
                <p className="text-3xl font-bold text-blue-900">
                  {analyticsData.total_conferences}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-blue-600 text-sm mt-2">All time</p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">
                  Total Registrations
                </p>
                <p className="text-3xl font-bold text-green-900">
                  {analyticsData.total_registrations.toLocaleString()}
                </p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-green-600 text-sm mt-2">
              Across all conferences
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">
                  Total Revenue
                </p>
                <p className="text-3xl font-bold text-purple-900">
                  ${analyticsData.total_revenue.toLocaleString()}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-purple-600 text-sm mt-2">
              From successful conference registrations
            </p>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">
                  Upcoming Conferences
                </p>
                <p className="text-3xl font-bold text-orange-900">
                  {analyticsData.upcoming_conferences}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-orange-600" />
            </div>
            <p className="text-orange-600 text-sm mt-2">Currently scheduled</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Conference Types
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-blue-800 font-medium">In-person</span>
                <span className="text-blue-600 font-bold">
                  {analyticsData.conferences_by_type?.in_person || 0}
                </span>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-green-800 font-medium">Virtual</span>
                <span className="text-green-600 font-bold">
                  {analyticsData.conferences_by_type?.virtual || 0}
                </span>
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-purple-800 font-medium">Hybrid</span>
                <span className="text-purple-600 font-bold">
                  {analyticsData.conferences_by_type?.hybrid || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {analyticsData.top_conferences &&
          analyticsData.top_conferences.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Top Conferences by Registration
              </h3>
              <div className="space-y-3">
                {analyticsData.top_conferences.map((conference) => (
                  <div
                    key={conference.id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {conference.title}
                      </p>
                      <p className="text-xs text-gray-500">{conference.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-blue-600">
                        {conference.registration_count} registrations
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

  const renderRegistrationsTab = () => (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Conference Registrations
          </h3>
          <p className="text-gray-600 text-sm mt-1">
            Manage attendee registrations for all conferences
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attendee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registration Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registration Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {registrations.map((registration) => (
                <tr key={registration.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {registration.full_name ||
                          `${registration.first_name} ${registration.last_name}`}
                      </div>
                      <div className="text-sm text-gray-500">
                        {registration.organization}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">
                        {registration.email}
                      </div>
                      <div className="text-sm text-gray-500">
                        {registration.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {registration.conference_title}
                      </div>
                      <div className="text-xs text-gray-500">
                        ID: #{registration.conference_id}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        registration.registration_type === "early_bird"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {registration.registration_type
                        .replace("_", " ")
                        .toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(
                        registration.payment_status
                      )}`}
                    >
                      {registration.payment_status === "free"
                        ? "FREE"
                        : registration.payment_status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {registration.registered_at
                      ? new Date(
                          registration.registered_at
                        ).toLocaleDateString()
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {registrations?.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No registrations found
            </h3>
            <p className="text-gray-500">
              No attendees have registered for any conferences yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={closeAlert}
        onConfirm={alertModal.onConfirm}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        confirmText={alertModal.confirmText}
        cancelText={alertModal.cancelText}
        showCancel={!!alertModal.onConfirm}
      />

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
          <button
            onClick={() => setError(null)}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            <svg
              className="fill-current h-6 w-6 text-red-500"
              role="button"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <title>Close</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
            </svg>
          </button>
        </div>
      )}

      <div className="bg-white border border-gray-300 rounded-lg">
        <div className="bg-blue-50 px-6 py-4 border-b border-gray-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Users className="w-7 h-7 mr-3 text-blue-600" />
                Conference Management
              </h2>
              <p className="text-gray-600 mt-1">
                Manage annual conferences, meetings, and events
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center font-medium transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Conference
              </button>
              <button
                onClick={() => setSelectedTab("analytics")}
                className="border border-blue-600 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 flex items-center font-medium transition-colors"
              >
                <BarChart3 className="w-5 h-5 mr-2" />
                Analytics
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              {
                id: "all",
                label: "All Conferences",
                count: conferences?.length || 0,
              },
              {
                id: "upcoming",
                label: "Upcoming",
                count:
                  conferences?.filter(
                    (c) =>
                      c.status === "registration_open" ||
                      c.status === "coming_soon"
                  ).length || 0,
              },
              {
                id: "completed",
                label: "Completed",
                count:
                  conferences?.filter((c) => c.status === "completed").length ||
                  0,
              },
              {
                id: "registrations",
                label: "Registrations",
                count: registrations?.length || 0,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`py-2 border-b-2 font-medium text-sm transition-colors ${
                  selectedTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {isLoading && (
          <div className="p-6 text-center">
            <LoadingSpinner />
          </div>
        )}

        {!isLoading && (
          <>
            {selectedTab === "registrations" ? (
              renderRegistrationsTab()
            ) : selectedTab === "analytics" ? (
              renderAnalyticsTab()
            ) : (
              <div className="p-6">
                <div className="space-y-6">
                  {filteredConferences.map((conference) => (
                    <div
                      key={conference.id}
                      className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow"
                    >
                      <div className="flex flex-col lg:flex-row">
                        <div className="lg:w-1/4">
                          <div className="relative">
                            {conference.display_image_url ||
                            conference.image_url ? (
                              <img
                                src={
                                  conference.display_image_url ||
                                  conference.image_url
                                }
                                alt={conference.title}
                                className="w-full h-48 lg:h-full object-cover rounded-t-lg lg:rounded-l-lg lg:rounded-t-none"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "/api/placeholder/300/200";
                                }}
                              />
                            ) : (
                              <div className="w-full h-48 lg:h-full bg-gray-200 flex items-center justify-center rounded-t-lg lg:rounded-l-lg lg:rounded-t-none">
                                <Users className="w-12 h-12 text-gray-400" />
                              </div>
                            )}
                            <div className="absolute top-3 left-3">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                                  conference.status
                                )} flex items-center`}
                              >
                                {getStatusIcon(conference.status)}
                                <span className="ml-1">
                                  {getStatusDisplayName(conference.status)}
                                </span>
                              </span>
                            </div>
                            {conference.type && (
                              <div className="absolute top-3 right-3">
                                <span className="bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs font-medium">
                                  {conference.type
                                    .replace("_", " ")
                                    .toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="lg:w-3/4 p-6">
                          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                                {conference.title}
                              </h3>
                              {conference.theme && (
                                <p className="text-blue-600 font-medium mb-3 text-sm">
                                  {conference.theme}
                                </p>
                              )}

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                <div className="space-y-2">
                                  <div className="flex items-center text-gray-600 text-sm">
                                    <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                                    <span className="font-medium">
                                      {conference.date}
                                    </span>
                                    {conference.time && (
                                      <span className="ml-2">
                                        at {conference.time}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center text-gray-600 text-sm">
                                    <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                                    <div>
                                      <div className="font-medium">
                                        {conference.location}
                                      </div>
                                      {conference.venue && (
                                        <div className="text-xs text-gray-500">
                                          {conference.venue}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center text-gray-600 text-sm">
                                    <Globe className="w-4 h-4 mr-2 text-blue-600" />
                                    <span className="font-medium">
                                      {conference.type
                                        ?.replace("_", " ")
                                        .toUpperCase()}
                                    </span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3 text-center">
                                  <div className="bg-gray-50 p-2 rounded">
                                    <div className="text-lg font-bold text-blue-600">
                                      {conference.expected_attendees || 0}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      Expected
                                    </div>
                                  </div>
                                  <div className="bg-gray-50 p-2 rounded">
                                    <div className="text-lg font-bold text-blue-600">
                                      {conference.conference_speakers?.length ||
                                        0}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      Speakers
                                    </div>
                                  </div>
                                  <div className="bg-gray-50 p-2 rounded">
                                    <div className="text-lg font-bold text-blue-600">
                                      {conference.countries_represented || 0}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      Countries
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {conference.registration_count !== undefined &&
                                conference.capacity && (
                                  <div className="mb-4">
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="text-sm font-medium text-gray-700">
                                        Registration Progress
                                      </span>
                                      <span className="text-sm text-gray-600">
                                        {conference.registration_count} /{" "}
                                        {conference.capacity} (
                                        {getProgressPercentage(
                                          conference.registration_count,
                                          conference.capacity
                                        )}
                                        %)
                                      </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div
                                        className="bg-blue-600 h-2 rounded-full"
                                        style={{
                                          width: `${getProgressPercentage(
                                            conference.registration_count,
                                            conference.capacity
                                          )}%`,
                                        }}
                                      ></div>
                                    </div>
                                  </div>
                                )}
                            </div>
                          </div>

                          {/* SHORT DESCRIPTION - shown in main card */}
                          <p className="text-gray-700 text-sm md:text-base mb-4 md:mb-6 leading-relaxed whitespace-pre-line">
                            {conference.description}
                          </p>

                          {conference.highlights &&
                            Array.isArray(conference.highlights) &&
                            conference.highlights.length > 0 && (
                              <div className="mb-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">
                                  Event Highlights
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {conference.highlights.map(
                                    (highlight, idx) => (
                                      <span
                                        key={idx}
                                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                                      >
                                        {highlight}
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                            )}

                          {/* Expandable Content */}
                          {expandedConferences.includes(conference.id!) && (
                            <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                              {/* FULL DESCRIPTION - shown only when expanded */}
                              {conference.full_description && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                  <h4 className="font-medium text-gray-900 mb-2">
                                    Full Description
                                  </h4>
                                  <p className="text-gray-600 text-sm whitespace-pre-line">
                                    {conference.full_description}
                                  </p>
                                </div>
                              )}

                              {/* Additional Conference Details */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Conference Information */}
                                <div className="space-y-4">
                                  <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-3">
                                      Event Details
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                      {conference.start_date && (
                                        <div className="flex items-center">
                                          <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                                          <span>
                                            Start:{" "}
                                            {formatDate(conference.start_date)}
                                          </span>
                                        </div>
                                      )}
                                      {conference.end_date && (
                                        <div className="flex items-center">
                                          <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                                          <span>
                                            End:{" "}
                                            {formatDate(conference.end_date)}
                                          </span>
                                        </div>
                                      )}
                                      {conference.duration && (
                                        <div className="flex items-center">
                                          <Clock className="w-4 h-4 mr-2 text-blue-600" />
                                          <span>
                                            Duration: {conference.duration}
                                          </span>
                                        </div>
                                      )}
                                      {conference.website && (
                                        <div className="flex items-center">
                                          <ExternalLink className="w-4 h-4 mr-2 text-blue-600" />
                                          <a
                                            href={conference.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline"
                                          >
                                            Visit Website
                                          </a>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Registration Information */}
                                  {(conference.regular_fee ||
                                    conference.early_bird_fee) && (
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                      <h4 className="font-medium text-gray-900 mb-3">
                                        Registration Fees
                                      </h4>
                                      <div className="space-y-2 text-sm">
                                        {conference.early_bird_fee && (
                                          <div className="flex justify-between">
                                            <span>Early Bird:</span>
                                            <span className="font-medium">
                                              ${conference.early_bird_fee}
                                            </span>
                                          </div>
                                        )}
                                        {conference.regular_fee && (
                                          <div className="flex justify-between">
                                            <span>Regular:</span>
                                            <span className="font-medium">
                                              ${conference.regular_fee}
                                            </span>
                                          </div>
                                        )}
                                        {conference.early_bird_deadline && (
                                          <div className="text-xs text-gray-600 mt-2">
                                            Early bird deadline:{" "}
                                            {formatDate(
                                              conference.early_bird_deadline
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Speakers and Organizers */}
                                <div className="space-y-4">
                                  {/* Speakers */}
                                  {conference.conference_speakers &&
                                    conference.conference_speakers.length >
                                      0 && (
                                      <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="font-medium text-gray-900 mb-3">
                                          Featured Speakers
                                        </h4>
                                        <div className="space-y-3">
                                          {conference.conference_speakers
                                            .slice(0, 3)
                                            .map((speaker, idx) => (
                                              <div
                                                key={idx}
                                                className="flex items-center gap-3"
                                              >
                                                {speaker.image_url && (
                                                  <img
                                                    src={speaker.image_url}
                                                    alt={speaker.name}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                  />
                                                )}
                                                <div>
                                                  <p className="font-medium text-gray-900 text-sm">
                                                    {speaker.name}
                                                  </p>
                                                  <p className="text-xs text-gray-600">
                                                    {speaker.title}
                                                  </p>
                                                  {speaker.organization && (
                                                    <p className="text-xs text-gray-500">
                                                      {speaker.organization}
                                                    </p>
                                                  )}
                                                </div>
                                              </div>
                                            ))}
                                          {conference.conference_speakers
                                            .length > 3 && (
                                            <p className="text-xs text-gray-600">
                                              +
                                              {conference.conference_speakers
                                                .length - 3}{" "}
                                              more speakers
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                  {/* Contact Information */}
                                  {(conference.organizer_email ||
                                    conference.organizer_phone) && (
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                      <h4 className="font-medium text-gray-900 mb-3">
                                        Contact Information
                                      </h4>
                                      <div className="space-y-2 text-sm">
                                        {conference.organizer_email && (
                                          <div className="flex items-center">
                                            <Mail className="w-4 h-4 mr-2 text-blue-600" />
                                            <a
                                              href={`mailto:${conference.organizer_email}`}
                                              className="text-blue-600 hover:underline"
                                            >
                                              {conference.organizer_email}
                                            </a>
                                          </div>
                                        )}
                                        {conference.organizer_phone && (
                                          <div className="flex items-center">
                                            <Phone className="w-4 h-4 mr-2 text-blue-600" />
                                            <span>
                                              {conference.organizer_phone}
                                            </span>
                                          </div>
                                        )}
                                        {conference.organizer_name && (
                                          <div className="flex items-center">
                                            <Users className="w-4 h-4 mr-2 text-blue-600" />
                                            <span>
                                              {conference.organizer_name}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Additional Information */}
                              {(conference.agenda ||
                                conference.objectives ||
                                conference.target_audience) && (
                                <div className="space-y-4">
                                  {conference.objectives && (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                      <h4 className="font-medium text-gray-900 mb-2">
                                        Objectives
                                      </h4>
                                      <p className="text-gray-600 text-sm whitespace-pre-line">
                                        {conference.objectives}
                                      </p>
                                    </div>
                                  )}

                                  {conference.target_audience && (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                      <h4 className="font-medium text-gray-900 mb-2">
                                        Target Audience
                                      </h4>
                                      <p className="text-gray-600 text-sm whitespace-pre-line">
                                        {conference.target_audience}
                                      </p>
                                    </div>
                                  )}

                                  {conference.agenda && (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                      <h4 className="font-medium text-gray-900 mb-2">
                                        Conference Agenda
                                      </h4>
                                      <p className="text-gray-600 text-sm whitespace-pre-line">
                                        {conference.agenda}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Registration Stats (if expanded) */}
                              {conference.registration_count !== undefined && (
                                <div className="bg-green-50 p-4 rounded-lg">
                                  <h4 className="font-medium text-gray-900 mb-3">
                                    Registration Statistics
                                  </h4>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                    <div>
                                      <div className="text-lg font-bold text-green-600">
                                        {conference.registration_count}
                                      </div>
                                      <div className="text-xs text-gray-600">
                                        Registered
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-lg font-bold text-blue-600">
                                        {conference.capacity || 0}
                                      </div>
                                      <div className="text-xs text-gray-600">
                                        Capacity
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-lg font-bold text-purple-600">
                                        {conference.capacity
                                          ? conference.capacity -
                                            conference.registration_count
                                          : 0}
                                      </div>
                                      <div className="text-xs text-gray-600">
                                        Available
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-lg font-bold text-orange-600">
                                        {getProgressPercentage(
                                          conference.registration_count,
                                          conference.capacity
                                        )}
                                        %
                                      </div>
                                      <div className="text-xs text-gray-600">
                                        Filled
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="flex flex-wrap gap-3">
                            <button
                              onClick={() => toggleExpand(conference.id!)}
                              className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center text-sm font-medium transition-colors"
                            >
                              {expandedConferences.includes(conference.id!) ? (
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
                              onClick={() => handleEditConference(conference)}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center text-sm font-medium transition-colors"
                            >
                              <Edit3 className="w-4 h-4 mr-2" />
                              Edit Details
                            </button>

                            <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center text-sm font-medium transition-colors">
                              <Mail className="w-4 h-4 mr-2" />
                              Email Attendees
                            </button>

                            <div className="relative">
                              <select
                                value={conference.status}
                                onChange={(e) =>
                                  handleStatusChange(
                                    conference.id!,
                                    e.target.value
                                  )
                                }
                                className="border border-gray-300 px-3 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="planning">Planning</option>
                                <option value="registration_open">
                                  Registration Open
                                </option>
                                <option value="coming_soon">Coming Soon</option>
                                <option value="completed">
                                  Mark as Completed
                                </option>
                                <option value="cancelled">Cancel</option>
                              </select>
                            </div>

                            <button
                              onClick={() =>
                                handleDeleteConference(conference.id!)
                              }
                              className="text-red-600 hover:text-red-800 flex items-center text-sm font-medium"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </button>
                          </div>

                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                              <span>
                                Created:{" "}
                                {conference.created_at
                                  ? new Date(
                                      conference.created_at
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </span>
                              <span>
                                Last Updated:{" "}
                                {conference.updated_at
                                  ? new Date(
                                      conference.updated_at
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </span>
                              <span>ID: #{conference.id}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredConferences.length === 0 && !isLoading && (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No conferences found
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {selectedTab === "all"
                        ? "You haven't created any conferences yet."
                        : `No conferences in the ${selectedTab} category.`}
                    </p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
                    >
                      Create Your First Conference
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <CreateEventModal
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        onSave={handleCreateConference}
        editingConference={editingConference}
      />
    </div>
  );
};

export default ConferencesTab;
