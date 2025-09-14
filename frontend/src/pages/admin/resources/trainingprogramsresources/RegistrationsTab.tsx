import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  Mail,
  Trash2,
  Users,
  Calendar,
  BookOpen,
  Award,
  Phone,
  User,
  AlertCircle,
  RefreshCw,
  Download,
} from 'lucide-react';

import AlertModal from '../../../../components/common/AlertModal';
import { trainingProgramsApi, Registration, TrainingProgram } from '../../../../services/trainingProgramsApi';

interface RegistrationsTabProps {
  registrations: Registration[];
  programs: TrainingProgram[];
  onUpdateRegistration: (id: number, updates: Partial<Registration>) => Promise<void>;
  onDeleteRegistration: (id: number) => Promise<void>;
  programId?: number; // Optional - if provided, only show registrations for this program
}

const RegistrationsTab: React.FC<RegistrationsTabProps> = ({ 
  registrations: propRegistrations,
  programs,
  onUpdateRegistration,
  onDeleteRegistration,
  programId 
}) => {
  const [registrations, setRegistrations] = useState<Registration[]>(propRegistrations);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegistrationStatus, setSelectedRegistrationStatus] = useState("all");
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
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Update local state when prop changes
  useEffect(() => {
    setRegistrations(propRegistrations);
  }, [propRegistrations]);

  const refreshRegistrations = async () => {
    setIsRefreshing(true);
    try {
      const data = await trainingProgramsApi.getRegistrations(programId);
      setRegistrations(data);
      setAlertModal({
        isOpen: true,
        title: "Refreshed Successfully",
        message: "Registration data has been updated.",
        type: "success"
      });
    } catch (error) {
      console.error('Error refreshing registrations:', error);
      setAlertModal({
        isOpen: true,
        title: "Refresh Error",
        message: "Failed to refresh registrations. Please try again.",
        type: "error"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed":
      case "Paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
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

  const filteredRegistrations = registrations.filter((registration) => {
    const matchesSearch =
      registration.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.participantEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.programTitle.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedRegistrationStatus === "all" || registration.status === selectedRegistrationStatus;

    return matchesSearch && matchesStatus;
  });

  const handleConfirmRegistration = async (registration: Registration) => {
    try {
      await onUpdateRegistration(registration.id, { status: "Confirmed" });
      
      // Update local state
      setRegistrations(prev => 
        prev.map(r => r.id === registration.id ? { ...r, status: "Confirmed" } : r)
      );
      
      setAlertModal({
        isOpen: true,
        title: "Registration Confirmed",
        message: `${registration.participantName}'s registration has been confirmed successfully.`,
        type: "success"
      });
    } catch (error) {
      console.error('Error confirming registration:', error);
      setAlertModal({
        isOpen: true,
        title: "Update Error",
        message: "Failed to confirm registration. Please try again.",
        type: "error"
      });
    }
  };

  const handleDeleteRegistration = (registration: Registration) => {
    setAlertModal({
      isOpen: true,
      title: "Confirm Deletion",
      message: `Are you sure you want to delete ${registration.participantName}'s registration? This action cannot be undone.`,
      type: "confirm",
      confirmText: "Delete",
      showCancel: true,
      onConfirm: async () => {
        try {
          await onDeleteRegistration(registration.id);
          
          // Update local state
          setRegistrations(prev => prev.filter(r => r.id !== registration.id));
          
          setAlertModal({
            isOpen: true,
            title: "Registration Deleted",
            message: "The registration has been successfully deleted.",
            type: "success"
          });
        } catch (error) {
          console.error('Error deleting registration:', error);
          setAlertModal({
            isOpen: true,
            title: "Delete Error",
            message: "Failed to delete registration. Please try again.",
            type: "error"
          });
        }
      }
    });
  };

  const handleUpdateRegistrationStatus = async (registration: Registration, newStatus: Registration['status']) => {
    try {
      await onUpdateRegistration(registration.id, { status: newStatus });
      
      // Update local state
      setRegistrations(prev => 
        prev.map(r => r.id === registration.id ? { ...r, status: newStatus } : r)
      );
      
      setAlertModal({
        isOpen: true,
        title: "Status Updated",
        message: `Registration status has been updated to ${newStatus}.`,
        type: "success"
      });
    } catch (error) {
      console.error('Error updating registration status:', error);
      setAlertModal({
        isOpen: true,
        title: "Update Error",
        message: "Failed to update registration status. Please try again.",
        type: "error"
      });
    }
  };

  const handleExportRegistrations = async () => {
    setIsExporting(true);
    try {
      // Note: This assumes the API has a similar export function for registrations
      // You may need to modify the API to include registration export functionality
      const blob = await trainingProgramsApi.exportToCSV({ type: 'registrations' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'registrations_export.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setAlertModal({
        isOpen: true,
        title: "Export Successful",
        message: "Registration data has been exported successfully.",
        type: "success"
      });
    } catch (error) {
      console.error('Error exporting registrations:', error);
      setAlertModal({
        isOpen: true,
        title: "Export Error",
        message: "Failed to export registration data. Please try again.",
        type: "error"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleSendEmail = (registration: Registration) => {
    setAlertModal({
      isOpen: true,
      title: "Email Feature",
      message: "Email functionality is not yet implemented. This feature will allow you to send customized emails to participants.",
      type: "info"
    });
  };

  const closeAlertModal = () => {
    setAlertModal(prev => ({ ...prev, isOpen: false }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mr-3" />
        <span className="text-lg text-gray-600">Loading registrations...</span>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header with Actions */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col lg:flex-row gap-4 items-center flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search registrations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <select
                value={selectedRegistrationStatus}
                onChange={(e) => setSelectedRegistrationStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                <option value="all">All Status</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Pending">Pending</option>
                <option value="Waitlisted">Waitlisted</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <button 
              onClick={refreshRegistrations}
              disabled={isRefreshing}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button 
              onClick={handleExportRegistrations}
              disabled={isExporting}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              <Download className={`w-4 h-4 mr-2 ${isExporting ? 'animate-pulse' : ''}`} />
              Export
            </button>
          </div>
        </div>

        {/* Registration Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-800">
                {registrations.filter(r => r.status === "Confirmed").length}
              </div>
              <div className="text-sm text-green-600">Confirmed</div>
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-800">
                {registrations.filter(r => r.status === "Pending").length}
              </div>
              <div className="text-sm text-yellow-600">Pending</div>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-800">
                {registrations.filter(r => r.status === "Waitlisted").length}
              </div>
              <div className="text-sm text-blue-600">Waitlisted</div>
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-800">
                {registrations.filter(r => r.status === "Cancelled").length}
              </div>
              <div className="text-sm text-red-600">Cancelled</div>
            </div>
          </div>
        </div>

        {filteredRegistrations.length > 0 ? (
          <div className="space-y-4">
            {filteredRegistrations.map((registration) => (
              <div key={registration.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {registration.participantName}
                        </h3>
                        <p className="text-sm text-gray-600 font-medium">
                          {registration.programTitle}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(registration.status)} flex items-center`}>
                          {registration.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(registration.paymentStatus)}`}>
                          {registration.paymentStatus}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-2 text-indigo-600" />
                        <span>{registration.participantEmail}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2 text-indigo-600" />
                        <span>{registration.participantPhone}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="w-4 h-4 mr-2 text-indigo-600" />
                        <span>{registration.profession}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <BookOpen className="w-4 h-4 mr-2 text-indigo-600" />
                        <span>{registration.organization}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Award className="w-4 h-4 mr-2 text-indigo-600" />
                        <span>{registration.experience} experience</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 text-indigo-600" />
                        <span>Registered: {registration.registrationDate}</span>
                      </div>
                    </div>

                    {registration.specialRequests && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                        <div className="flex items-start">
                          <AlertCircle className="w-4 h-4 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-yellow-800">Special Requests:</p>
                            <p className="text-sm text-yellow-700">{registration.specialRequests}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3">
                      <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center text-sm font-medium transition-colors">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </button>
                      
                      {registration.status === "Pending" && (
                        <button 
                          onClick={() => handleConfirmRegistration(registration)}
                          className="border border-green-300 text-green-600 px-4 py-2 rounded-lg hover:bg-green-50 flex items-center text-sm font-medium transition-colors"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Confirm Registration
                        </button>
                      )}
                      
                      {registration.status === "Confirmed" && (
                        <button 
                          onClick={() => handleUpdateRegistrationStatus(registration, "Waitlisted")}
                          className="border border-blue-300 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 flex items-center text-sm font-medium transition-colors"
                        >
                          Move to Waitlist
                        </button>
                      )}
                      
                      <button 
                        onClick={() => handleSendEmail(registration)}
                        className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center text-sm font-medium transition-colors"
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Send Email
                      </button>
                      
                      <button 
                        onClick={() => handleDeleteRegistration(registration)}
                        className="border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 flex items-center text-sm font-medium transition-colors"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No registrations found</h3>
            <p className="text-gray-500">
              {searchTerm ? "No registrations match your search criteria." : "No registrations yet."}
            </p>
          </div>
        )}
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
    </>
  );
};

export default RegistrationsTab;