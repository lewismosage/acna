import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Edit3,
  Search,
  Users,
  Clock,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Eye,
  Trash2,
  CheckCircle,
  Archive,
  Settings,
  Filter,
  Calendar,
  MapPin,
  Globe,
  Award,
  Star,
  FileText,
  User,
  RefreshCw,
  Download,
} from "lucide-react";

import RegistrationsTab from "./RegistrationsTab";
import CreateProgramModal from "./CreateProgramModal";
import AnalyticsTab from "./AnalyticsTab";
import AlertModal from "../../../../components/common/AlertModal";
import { 
  trainingProgramsApi, 
  TrainingProgram,
  Registration,
  TrainingProgramAnalytics,
  CreateTrainingProgramInput
} from '../../../../services/trainingProgramsApi';
import LoadingSpinner from "../../../../components/common/LoadingSpinner";

const TrainingProgramsTab = () => {
  const [selectedTab, setSelectedTab] = useState<
    "all" | "published" | "drafts" | "archived" | "featured" | "registrations" | "analytics"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedPrograms, setExpandedPrograms] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type?: 'info' | 'warning' | 'error' | 'success' | 'confirm';
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
    showCancel?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
  });
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<TrainingProgram | undefined>(undefined);

  // Data states
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [analyticsData, setAnalyticsData] = useState<TrainingProgramAnalytics>({
    totalPrograms: 0,
    totalEnrollments: 0,
    totalRevenue: 0,
    averageFillRate: 0,
    programsByStatus: {
      published: 0,
      draft: 0,
      archived: 0,
      featured: 0,
    },
    programsByType: {},
    monthlyRevenue: 0,
    upcomingPrograms: 0,
  });
  const [categories, setCategories] = useState<string[]>([]);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setInitialLoading(true);
    try {
      await Promise.all([
        loadPrograms(),
        loadRegistrations(),
        loadAnalytics(),
        loadCategories(),
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
      setAlertModal({
        isOpen: true,
        title: "Loading Error",
        message: "Failed to load program data. Please refresh the page or try again.",
        type: "error"
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const loadPrograms = async () => {
    try {
      const data = await trainingProgramsApi.getAll();
      setPrograms(data);
    } catch (error) {
      console.error('Error loading programs:', error);
      throw error;
    }
  };

  const loadRegistrations = async () => {
    try {
      const data = await trainingProgramsApi.getRegistrations();
      setRegistrations(data);
    } catch (error) {
      console.error('Error loading registrations:', error);
      throw error;
    }
  };

  const loadAnalytics = async () => {
    try {
      const data = await trainingProgramsApi.getAnalytics();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
      throw error;
    }
  };

  const loadCategories = async () => {
    try {
      const data = await trainingProgramsApi.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
      // Don't throw here as categories are not critical
    }
  };

  // Refresh data
  const refreshData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadPrograms(),
        loadRegistrations(),
        loadAnalytics(),
      ]);
      setAlertModal({
        isOpen: true,
        title: "Data Refreshed",
        message: "All data has been refreshed successfully.",
        type: "success"
      });
    } catch (error) {
      setAlertModal({
        isOpen: true,
        title: "Refresh Error",
        message: "Failed to refresh data. Please try again.",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  // Modal handlers
  const handleCreateProgram = () => {
    setEditingProgram(undefined);
    setIsCreateModalOpen(true);
  };

  const handleEditProgram = (program: TrainingProgram) => {
    setEditingProgram(program);
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setEditingProgram(undefined);
  };

  const handleSubmitProgram = async (programData: CreateTrainingProgramInput) => {
    try {
      let result: TrainingProgram;
      
      if (editingProgram) {
        // Update existing program
        result = await trainingProgramsApi.update(editingProgram.id, programData);
        setPrograms(prev => prev.map(p => 
          p.id === editingProgram.id ? result : p
        ));
        setAlertModal({
          isOpen: true,
          title: "Program Updated",
          message: "The training program has been successfully updated.",
          type: "success"
        });
      } else {
        // Create new program
        result = await trainingProgramsApi.create(programData);
        setPrograms(prev => [...prev, result]);
        setAlertModal({
          isOpen: true,
          title: "Program Created",
          message: "The training program has been successfully created.",
          type: "success"
        });
      }
      
      // Refresh analytics after creating/updating
      await loadAnalytics();
      
    } catch (error) {
      console.error('Error saving program:', error);
      setAlertModal({
        isOpen: true,
        title: "Error",
        message: "There was an error saving the program. Please try again.",
        type: "error"
      });
      throw error;
    }
  };

  // Registration handlers
  const handleUpdateRegistration = async (id: number, updates: Partial<Registration>) => {
    try {
      const updatedRegistration = await trainingProgramsApi.updateRegistration(id, updates);
      setRegistrations(prev => prev.map(r => 
        r.id === id ? updatedRegistration : r
      ));
      
      setAlertModal({
        isOpen: true,
        title: "Registration Updated",
        message: "The registration has been updated successfully.",
        type: "success"
      });
    } catch (error) {
      console.error('Error updating registration:', error);
      setAlertModal({
        isOpen: true,
        title: "Update Error",
        message: "Failed to update the registration. Please try again.",
        type: "error"
      });
    }
  };

  const handleDeleteRegistration = async (id: number) => {
    try {
      await trainingProgramsApi.deleteRegistration(id);
      setRegistrations(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error deleting registration:', error);
      setAlertModal({
        isOpen: true,
        title: "Delete Error",
        message: "Failed to delete the registration. Please try again.",
        type: "error"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Published":
      case "Confirmed":
      case "Paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "Draft":
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Archived":
      case "Cancelled":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "Waitlisted":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Refunded":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
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

  const toggleExpand = (id: number) => {
    setExpandedPrograms((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleStatusChange = async (programId: number, newStatus: string) => {
    try {
      const updatedProgram = await trainingProgramsApi.updateStatus(programId, newStatus);
      setPrograms((prev) =>
        prev.map((program) =>
          program.id === programId ? updatedProgram : program
        )
      );
      
      // Refresh analytics after status change
      await loadAnalytics();
      
    } catch (error) {
      console.error('Error updating status:', error);
      setAlertModal({
        isOpen: true,
        title: "Status Update Error",
        message: "Failed to update program status. Please try again.",
        type: "error"
      });
    }
  };

  const handleToggleFeatured = async (programId: number) => {
    try {
      const updatedProgram = await trainingProgramsApi.toggleFeatured(programId);
      setPrograms((prev) =>
        prev.map((program) =>
          program.id === programId ? updatedProgram : program
        )
      );
      
      // Refresh analytics after featured toggle
      await loadAnalytics();
      
    } catch (error) {
      console.error('Error toggling featured:', error);
      setAlertModal({
        isOpen: true,
        title: "Featured Toggle Error",
        message: "Failed to toggle featured status. Please try again.",
        type: "error"
      });
    }
  };

  const handleDeleteProgram = (programId: number) => {
    const program = programs.find(p => p.id === programId);
    if (!program) return;
    
    setAlertModal({
      isOpen: true,
      title: "Confirm Deletion",
      message: `Are you sure you want to delete "${program.title}"? This action cannot be undone and will also delete all associated registrations.`,
      type: "confirm",
      confirmText: "Delete",
      showCancel: true,
      onConfirm: async () => {
        try {
          await trainingProgramsApi.delete(programId);
          setPrograms(prev => prev.filter(p => p.id !== programId));
          setRegistrations(prev => prev.filter(r => r.programId !== programId));
          
          // Refresh analytics after deletion
          await loadAnalytics();
          
          setAlertModal({
            isOpen: true,
            title: "Program Deleted",
            message: "The training program has been successfully deleted.",
            type: "success"
          });
        } catch (error) {
          console.error('Error deleting program:', error);
          setAlertModal({
            isOpen: true,
            title: "Delete Error",
            message: "Failed to delete the program. Please try again.",
            type: "error"
          });
        }
      }
    });
  };

  const handleExportData = async () => {
    try {
      const blob = await trainingProgramsApi.exportToCSV();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'training_programs.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setAlertModal({
        isOpen: true,
        title: "Export Successful",
        message: "Training programs data has been exported successfully.",
        type: "success"
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      setAlertModal({
        isOpen: true,
        title: "Export Error",
        message: "Failed to export data. Please try again.",
        type: "error"
      });
    }
  };

  const filteredPrograms = programs.filter((program) => {
    const matchesTab =
      selectedTab === "all" ||
      (selectedTab === "published" && program.status === "Published") ||
      (selectedTab === "drafts" && program.status === "Draft") ||
      (selectedTab === "archived" && program.status === "Archived") ||
      (selectedTab === "featured" && program.isFeatured);

    const matchesSearch =
      program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.instructor.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || program.category === selectedCategory;

    return matchesTab && matchesSearch && matchesCategory;
  });

  const closeAlertModal = () => {
    setAlertModal(prev => ({ ...prev, isOpen: false }));
  };

  const renderProgramsContent = () => (
    <div className="space-y-6">
      {filteredPrograms.length > 0 ? (
        filteredPrograms.map((program) => {
          const isExpanded = expandedPrograms.includes(program.id);
          const enrollmentPercentage = (program.currentEnrollments / program.maxParticipants) * 100;

          return (
            <div key={program.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
              <div className="flex flex-col lg:flex-row">
                {/* Program Image */}
                <div className="lg:w-1/4">
                  <div className="relative">
                    <img
                      src={program.imageUrl}
                      alt={program.title}
                      className="w-full h-48 lg:h-full object-cover rounded-t-lg lg:rounded-l-lg lg:rounded-t-none"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/api/placeholder/400/250";
                      }}
                    />
                    <div className="absolute top-3 left-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(program.status)} flex items-center`}>
                        {getStatusIcon(program.status)}
                        <span className="ml-1">{program.status}</span>
                      </span>
                    </div>
                    {program.isFeatured && (
                      <div className="absolute top-3 right-3">
                        <Star className="w-5 h-5 text-yellow-500 fill-current" />
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3">
                      <span className="bg-indigo-600 text-white px-2 py-1 text-xs font-bold rounded">
                        {program.type}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Program Details */}
                <div className="lg:w-3/4 p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                        {program.title}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center text-gray-600 text-sm">
                            <FileText className="w-4 h-4 mr-2 text-indigo-600" />
                            <span className="font-medium">{program.category}</span>
                          </div>
                          <div className="flex items-center text-gray-600 text-sm">
                            <Clock className="w-4 h-4 mr-2 text-indigo-600" />
                            <span>{program.duration}</span>
                          </div>
                          <div className="flex items-center text-gray-600 text-sm">
                            <MapPin className="w-4 h-4 mr-2 text-indigo-600" />
                            <span>{program.location}</span>
                          </div>
                          <div className="flex items-center text-gray-600 text-sm">
                            <Globe className="w-4 h-4 mr-2 text-indigo-600" />
                            <span>{program.format}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center text-gray-600 text-sm">
                            <Users className="w-4 h-4 mr-2 text-indigo-600" />
                            <span>{program.currentEnrollments}/{program.maxParticipants} enrolled</span>
                          </div>
                          <div className="flex items-center text-gray-600 text-sm">
                            <Calendar className="w-4 h-4 mr-2 text-indigo-600" />
                            <span>{program.startDate} - {program.endDate}</span>
                          </div>
                          <div className="flex items-center text-gray-600 text-sm">
                            <Award className="w-4 h-4 mr-2 text-indigo-600" />
                            <span>{program.cmeCredits} CME Credits</span>
                          </div>
                          <div className="flex items-center text-gray-600 text-sm">
                            <User className="w-4 h-4 mr-2 text-indigo-600" />
                            <span>{program.instructor}</span>
                          </div>
                        </div>
                      </div>

                      {/* Enrollment Progress */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600">{enrollmentPercentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              enrollmentPercentage >= 80 ? "bg-green-600" :
                              enrollmentPercentage >= 60 ? "bg-yellow-500" : "bg-blue-600"
                            }`}
                            style={{ width: `${enrollmentPercentage}%` }}
                          />
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {program.description.substring(0, 200)}
                          {program.description.length > 200 && !isExpanded && "..."}
                        </p>
                        {program.description.length > 200 && (
                          <button
                            onClick={() => toggleExpand(program.id)}
                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mt-1"
                          >
                            {isExpanded ? "Show less" : "Read more..."}
                          </button>
                        )}
                      </div>

                      {/* Expandable Content */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-2">Full Description</h4>
                            <p className="text-gray-600 text-sm whitespace-pre-line">
                              {program.description}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {program.prerequisites && program.prerequisites.length > 0 && (
                              <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <h4 className="font-medium text-gray-900 mb-2">Prerequisites</h4>
                                <ul className="space-y-1 text-sm text-gray-600">
                                  {program.prerequisites.map((req, index) => (
                                    <li key={index}>• {req}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {program.learningOutcomes && program.learningOutcomes.length > 0 && (
                              <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <h4 className="font-medium text-gray-900 mb-2">Learning Outcomes</h4>
                                <ul className="space-y-1 text-sm text-gray-600">
                                  {program.learningOutcomes.map((outcome, index) => (
                                    <li key={index}>• {outcome}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>

                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-medium text-blue-900 mb-2">Certificate Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-blue-800">Certificate Type:</span>
                                <p className="text-blue-700">{program.certificationType}</p>
                              </div>
                              <div>
                                <span className="font-medium text-blue-800">CME Credits:</span>
                                <p className="text-blue-700">{program.cmeCredits} credits</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">${program.price}</div>
                      <div className="text-sm text-gray-600">{program.currency}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Registration deadline: {program.registrationDeadline}
                      </div>
                    </div>
                  </div>

                  {/* Admin Actions */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => toggleExpand(program.id)}
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
                      onClick={() => handleEditProgram(program)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center text-sm font-medium transition-colors"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Program
                    </button>

                    <button 
                      onClick={() => setSelectedTab("registrations")}
                      className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center text-sm font-medium transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Registrations ({program.currentEnrollments})
                    </button>

                    <div className="relative">
                      <select
                        value={program.status}
                        onChange={(e) => handleStatusChange(program.id, e.target.value)}
                        className="border border-gray-300 px-3 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="Published">Published</option>
                        <option value="Draft">Draft</option>
                        <option value="Archived">Archive</option>
                      </select>
                    </div>

                    <button
                      onClick={() => handleToggleFeatured(program.id)}
                      className={`border px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-colors ${
                        program.isFeatured
                          ? "border-yellow-300 bg-yellow-50 text-yellow-800 hover:bg-yellow-100"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <Star className={`w-4 h-4 mr-2 ${program.isFeatured ? "fill-current" : ""}`} />
                      {program.isFeatured ? "Unfeature" : "Feature"}
                    </button>

                    <button 
                      onClick={() => handleDeleteProgram(program.id)}
                      className="border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 flex items-center text-sm font-medium transition-colors"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </button>
                  </div>

                  {/* Metadata */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                      <span>Created: {program.createdAt}</span>
                      <span>Last Updated: {program.updatedAt}</span>
                      <span>Registration Deadline: {program.registrationDeadline}</span>
                      <span>ID: #{program.id}</span>
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
            No training programs found
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm
              ? "No programs match your search criteria."
              : `No programs in the ${selectedTab} category.`}
          </p>
          <button 
            onClick={handleCreateProgram}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium"
          >
            Create Your First Program
          </button>
        </div>
      )}
    </div>
  );

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-white border border-gray-300 rounded-lg">
          <div className="bg-indigo-50 px-6 py-4 border-b border-gray-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <BookOpen className="w-7 h-7 mr-3 text-indigo-600" />
                  Training Programs Management
                </h2>
                <p className="text-gray-600 mt-1">
                  Manage training programs, workshops, conferences and track registrations
                </p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={refreshData}
                  disabled={loading}
                  className="border border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 flex items-center font-medium transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button 
                  onClick={handleExportData}
                  className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center font-medium transition-colors"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Export
                </button>
                <button 
                  onClick={handleCreateProgram}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center font-medium transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Program
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
            <nav className="flex space-x-8 overflow-x-auto">
              {[
                { id: "all", label: "All", count: programs.length },
                { id: "published", label: "Published", count: programs.filter((p) => p.status === "Published").length },
                { id: "drafts", label: "Drafts", count: programs.filter((p) => p.status === "Draft").length },
                { id: "archived", label: "Archived", count: programs.filter((p) => p.status === "Archived").length },
                { id: "featured", label: "Featured", count: programs.filter((p) => p.isFeatured).length },
                { id: "registrations", label: "Registrations", count: registrations.length },
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
                  {tab.label} {tab.count > 0 && tab.id !== "analytics" && `(${tab.count})`}
                </button>
              ))}
            </nav>
          </div>

          {/* Search and Filter Bar */}
          {selectedTab !== "analytics" && selectedTab !== "registrations" && (
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex flex-col lg:flex-row gap-4 items-center">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search training programs..."
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
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
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
                    Training Programs Analytics
                  </h3>
                  <p className="text-gray-600">
                    Comprehensive analytics and insights about your training programs
                  </p>
                </div>
                <AnalyticsTab analyticsData={analyticsData} />
              </div>
            ) : selectedTab === "registrations" ? (
              <div>
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Program Registrations
                  </h3>
                  <p className="text-gray-600">
                    Manage and track all participant registrations across your programs
                  </p>
                </div>
                <RegistrationsTab
                  registrations={registrations}
                  programs={programs}
                  onUpdateRegistration={handleUpdateRegistration}
                  onDeleteRegistration={handleDeleteRegistration}
                />
              </div>
            ) : (
              renderProgramsContent()
            )}
          </div>
        </div>

        {/* Quick Stats Dashboard */}
        <div className="bg-white border border-gray-300 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-indigo-50">
              <div className="text-2xl font-bold text-indigo-800">{analyticsData.totalPrograms}</div>
              <div className="text-sm text-indigo-600">Total Programs</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-green-50">
              <div className="text-2xl font-bold text-green-800">{analyticsData.totalEnrollments}</div>
              <div className="text-sm text-green-600">Total Enrollments</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-yellow-50">
              <div className="text-2xl font-bold text-yellow-800">{registrations.length}</div>
              <div className="text-sm text-yellow-600">Active Registrations</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-purple-50">
              <div className="text-2xl font-bold text-purple-800">
                ${analyticsData.totalRevenue.toLocaleString()}
              </div>
              <div className="text-sm text-purple-600">Total Revenue</div>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={closeAlertModal}
        onConfirm={alertModal.onConfirm}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        confirmText={alertModal.confirmText}
        cancelText={alertModal.cancelText}
        showCancel={alertModal.showCancel}
      />

      {/* Create/Edit Program Modal */}
      <CreateProgramModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitProgram}
        editingProgram={editingProgram}
      />
    </>
  );
};

export default TrainingProgramsTab