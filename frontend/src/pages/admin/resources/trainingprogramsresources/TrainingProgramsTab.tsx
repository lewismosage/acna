import React, { useState } from "react";
import {
  BookOpen,
  Plus,
  Edit3,
  Search,
  Users,
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
  MapPin,
  Globe,
  Award,
  Star,
  FileText,
  User,
} from "lucide-react";

import RegistrationsTab from "./RegistrationsTab";
import CreateProgramModal from "./CreateProgramModal";

// Types
type ProgramStatus = "Published" | "Draft" | "Archived";
type ProgramType = "Conference" | "Workshop" | "Fellowship" | "Online Course" | "Masterclass";
type ProgramFormat = "In-person" | "Virtual" | "Hybrid";

interface TrainingProgram {
  id: number;
  title: string;
  description: string;
  type: ProgramType;
  category: string;
  status: ProgramStatus;
  isFeatured: boolean;
  duration: string;
  format: ProgramFormat;
  location: string;
  maxParticipants: number;
  currentEnrollments: number;
  instructor: string;
  startDate: string;
  endDate: string;
  price: number;
  currency: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  registrationDeadline: string;
  prerequisites: string[];
  learningOutcomes: string[];
  certificationType: string;
  cmeCredits: number;
}

interface Registration {
  id: number;
  programId: number;
  programTitle: string;
  participantName: string;
  participantEmail: string;
  participantPhone: string;
  organization: string;
  profession: string;
  experience: string;
  registrationDate: string;
  status: "Pending" | "Confirmed" | "Waitlisted" | "Cancelled";
  paymentStatus: "Pending" | "Paid" | "Refunded";
  specialRequests: string;
}

interface ProgramAnalytics {
  totalPrograms: number;
  totalEnrollments: number;
  totalRevenue: number;
  averageFillRate: number;
  programsByStatus: {
    published: number;
    draft: number;
    archived: number;
    featured: number;
  };
  programsByType: Record<string, number>;
  monthlyRevenue: number;
  upcomingPrograms: number;
}

// Alert Modal Component
interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'error' | 'success' | 'confirm';
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'info',
  confirmText = 'OK',
  cancelText = 'Cancel',
  showCancel = false
}) => {
  if (!isOpen) return null;

  const getIconAndColor = () => {
    switch (type) {
      case 'warning':
        return {
          iconColor: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        };
      case 'error':
        return {
          iconColor: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      case 'success':
        return {
          iconColor: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'confirm':
        return {
          iconColor: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200'
        };
      default:
        return {
          iconColor: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
    }
  };

  const { iconColor, bgColor, borderColor } = getIconAndColor();

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          onClick={onClose}
        ></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${bgColor} ${borderColor} border sm:mx-0 sm:h-10 sm:w-10`}>
              <div className={iconColor}>
                <Star className="w-6 h-6" />
              </div>
            </div>
            
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {title}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500 whitespace-pre-line">
                  {message}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse sm:gap-3">
            {onConfirm && (
              <button
                type="button"
                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${
                  type === 'error' || type === 'confirm'
                    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                    : type === 'warning'
                    ? 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
                    : type === 'success'
                    ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                    : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                }`}
                onClick={handleConfirm}
              >
                {confirmText}
              </button>
            )}
            
            {(showCancel || onConfirm) && (
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                onClick={onClose}
              >
                {onConfirm ? cancelText : 'Close'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const TrainingProgramsTab = () => {
  const [selectedTab, setSelectedTab] = useState<
    "all" | "published" | "drafts" | "archived" | "featured" | "registrations" | "analytics"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedPrograms, setExpandedPrograms] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading] = useState(false);
  const [alertModal, setAlertModal] = useState<Omit<AlertModalProps, 'isOpen' | 'onClose'> | null>(null);
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<TrainingProgram | undefined>(undefined);

  // Empty data arrays - no mock data
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);

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

  const handleSubmitProgram = async (programData: any) => {
    try {
      if (editingProgram) {
        // Update existing program
        setPrograms(prev => prev.map(p => 
          p.id === editingProgram.id 
            ? { 
                ...p, 
                ...programData, 
                updatedAt: new Date().toISOString().split("T")[0],
                imageUrl: programData.imageFile ? URL.createObjectURL(programData.imageFile) : p.imageUrl
              }
            : p
        ));
        setAlertModal({
          title: "Program Updated",
          message: "The training program has been successfully updated.",
          type: "success"
        });
      } else {
        // Create new program
        const newProgram: TrainingProgram = {
          id: Math.max(...programs.map(p => p.id), 0) + 1,
          ...programData,
          currentEnrollments: 0,
          createdAt: new Date().toISOString().split("T")[0],
          updatedAt: new Date().toISOString().split("T")[0],
          imageUrl: programData.imageFile 
            ? URL.createObjectURL(programData.imageFile) 
            : "/api/placeholder/400/250"
        };
        setPrograms(prev => [...prev, newProgram]);
        setAlertModal({
          title: "Program Created",
          message: "The training program has been successfully created.",
          type: "success"
        });
      }
    } catch (error) {
      console.error('Error saving program:', error);
      setAlertModal({
        title: "Error",
        message: "There was an error saving the program. Please try again.",
        type: "error"
      });
      throw error;
    }
  };

  // Registration handlers
  const handleUpdateRegistration = (id: number, updates: Partial<Registration>) => {
    setRegistrations(prev => prev.map(r => 
      r.id === id ? { ...r, ...updates } : r
    ));
  };

  const handleDeleteRegistration = (id: number) => {
    setRegistrations(prev => prev.filter(r => r.id !== id));
  };

  // Analytics data
  const analyticsData: ProgramAnalytics = {
    totalPrograms: programs.length,
    totalEnrollments: programs.reduce((sum, p) => sum + p.currentEnrollments, 0),
    totalRevenue: programs.reduce((sum, p) => sum + (p.currentEnrollments * p.price), 0),
    averageFillRate: programs.length > 0 ? 
      programs.reduce((sum, p) => sum + ((p.currentEnrollments / p.maxParticipants) * 100), 0) / programs.length : 0,
    programsByStatus: {
      published: programs.filter((p) => p.status === "Published").length,
      draft: programs.filter((p) => p.status === "Draft").length,
      archived: programs.filter((p) => p.status === "Archived").length,
      featured: programs.filter((p) => p.isFeatured).length,
    },
    programsByType: programs.reduce((acc, p) => {
      acc[p.type] = (acc[p.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    monthlyRevenue: programs.reduce((sum, p) => sum + (p.currentEnrollments * p.price), 0),
    upcomingPrograms: programs.filter((p) => new Date(p.startDate) > new Date()).length,
  };

  const getStatusColor = (status: ProgramStatus | string) => {
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

  const getStatusIcon = (status: ProgramStatus) => {
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

  const handleStatusChange = (programId: number, newStatus: ProgramStatus) => {
    setPrograms((prev) =>
      prev.map((program) =>
        program.id === programId
          ? { ...program, status: newStatus, updatedAt: new Date().toISOString().split("T")[0] }
          : program
      )
    );
  };

  const handleToggleFeatured = (programId: number) => {
    setPrograms((prev) =>
      prev.map((program) =>
        program.id === programId
          ? { ...program, isFeatured: !program.isFeatured }
          : program
      )
    );
  };

  const handleDeleteProgram = (programId: number) => {
    setAlertModal({
      title: "Confirm Deletion",
      message: "Are you sure you want to delete this program? This action cannot be undone.",
      type: "confirm",
      confirmText: "Delete",
      showCancel: true,
      onConfirm: () => {
        setPrograms(prev => prev.filter(p => p.id !== programId));
        setRegistrations(prev => prev.filter(r => r.programId !== programId));
        setAlertModal({
          title: "Program Deleted",
          message: "The training program has been successfully deleted.",
          type: "success"
        });
      }
    });
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
      program.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || program.category === selectedCategory;

    return matchesTab && matchesSearch && matchesCategory;
  });

  const closeAlertModal = () => {
    setAlertModal(null);
  };

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-600 text-sm font-medium">Total Programs</p>
              <p className="text-3xl font-bold text-indigo-900">{analyticsData.totalPrograms}</p>
            </div>
            <BookOpen className="w-8 h-8 text-indigo-600" />
          </div>
          <p className="text-indigo-600 text-sm mt-2">All time</p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Total Enrollments</p>
              <p className="text-3xl font-bold text-green-900">{analyticsData.totalEnrollments.toLocaleString()}</p>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-green-600 text-sm mt-2">Across all programs</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold text-blue-900">${analyticsData.totalRevenue.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-blue-600 text-sm mt-2">USD</p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Avg Fill Rate</p>
              <p className="text-3xl font-bold text-purple-900">{analyticsData.averageFillRate.toFixed(1)}%</p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-purple-600 text-sm mt-2">Enrollment capacity</p>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Program Status Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-lg bg-green-50">
            <div className="text-2xl font-bold text-green-800">{analyticsData.programsByStatus.published}</div>
            <div className="text-sm text-green-600">Published</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-yellow-50">
            <div className="text-2xl font-bold text-yellow-800">{analyticsData.programsByStatus.draft}</div>
            <div className="text-sm text-yellow-600">Draft</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-gray-50">
            <div className="text-2xl font-bold text-gray-800">{analyticsData.programsByStatus.archived}</div>
            <div className="text-sm text-gray-600">Archived</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-indigo-50">
            <div className="text-2xl font-bold text-indigo-800">{analyticsData.programsByStatus.featured}</div>
            <div className="text-sm text-indigo-600">Featured</div>
          </div>
        </div>
      </div>

      {/* Programs by Type */}
      {Object.keys(analyticsData.programsByType).length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Programs by Type</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(analyticsData.programsByType).map(([type, count]) => (
              <div key={type} className="bg-indigo-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-indigo-800 font-medium">{type}</span>
                  <span className="text-indigo-600 font-bold">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => setAlertModal({
              title: "Feature Coming Soon",
              message: "Program data export functionality is under development.",
              type: "info"
            })}
            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <span className="text-sm font-medium">Export Program Data</span>
            <FileText className="w-4 h-4 text-gray-400" />
          </button>
          <button 
            onClick={() => setAlertModal({
              title: "Feature Coming Soon",
              message: "Report generation functionality is under development.",
              type: "info"
            })}
            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <span className="text-sm font-medium">Generate Report</span>
            <BarChart3 className="w-4 h-4 text-gray-400" />
          </button>
          <button 
            onClick={() => setAlertModal({
              title: "Feature Coming Soon",
              message: "Bulk update functionality is under development.",
              type: "info"
            })}
            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <span className="text-sm font-medium">Bulk Update Programs</span>
            <Upload className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );

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
                            {program.prerequisites.length > 0 && (
                              <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <h4 className="font-medium text-gray-900 mb-2">Prerequisites</h4>
                                <ul className="space-y-1 text-sm text-gray-600">
                                  {program.prerequisites.map((req, index) => (
                                    <li key={index}>• {req}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {program.learningOutcomes.length > 0 && (
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
                        onChange={(e) => handleStatusChange(program.id, e.target.value as ProgramStatus)}
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
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
                    {Array.from(new Set(programs.map((p) => p.category))).map((category) => (
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
                {renderAnalyticsTab()}
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
              <div className="text-2xl font-bold text-indigo-800">{programs.length}</div>
              <div className="text-sm text-indigo-600">Total Programs</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-green-50">
              <div className="text-2xl font-bold text-green-800">
                {programs.reduce((sum, p) => sum + p.currentEnrollments, 0)}
              </div>
              <div className="text-sm text-green-600">Total Enrollments</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-yellow-50">
              <div className="text-2xl font-bold text-yellow-800">{registrations.length}</div>
              <div className="text-sm text-yellow-600">Active Registrations</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-purple-50">
              <div className="text-2xl font-bold text-purple-800">
                ${programs.reduce((sum, p) => sum + (p.currentEnrollments * p.price), 0).toLocaleString()}
              </div>
              <div className="text-sm text-purple-600">Total Revenue</div>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Modal */}
      {alertModal && (
        <AlertModal
          isOpen={true}
          onClose={closeAlertModal}
          {...alertModal}
        />
      )}

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

export default TrainingProgramsTab;