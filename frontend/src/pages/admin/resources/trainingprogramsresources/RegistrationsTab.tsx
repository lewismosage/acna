import React, { useState } from 'react';
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
} from 'lucide-react';

// Types
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

// Alert Modal Component
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
                <AlertCircle className="w-6 h-6" />
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

interface RegistrationsTabProps {
  registrations: Registration[];
  onUpdateRegistration?: (id: number, updates: Partial<Registration>) => void;
  onDeleteRegistration?: (id: number) => void;
}

const RegistrationsTab: React.FC<RegistrationsTabProps> = ({
  registrations = [],
  onUpdateRegistration,
  onDeleteRegistration
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegistrationStatus, setSelectedRegistrationStatus] = useState("all");
  const [alertModal, setAlertModal] = useState<Omit<AlertModalProps, 'isOpen' | 'onClose'> | null>(null);

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

  const handleConfirmRegistration = (registration: Registration) => {
    if (onUpdateRegistration) {
      onUpdateRegistration(registration.id, { status: "Confirmed" });
      setAlertModal({
        title: "Registration Confirmed",
        message: `${registration.participantName}'s registration has been confirmed successfully.`,
        type: "success"
      });
    }
  };

  const handleDeleteRegistration = (registration: Registration) => {
    setAlertModal({
      title: "Confirm Deletion",
      message: `Are you sure you want to delete ${registration.participantName}'s registration? This action cannot be undone.`,
      type: "confirm",
      confirmText: "Delete",
      showCancel: true,
      onConfirm: () => {
        if (onDeleteRegistration) {
          onDeleteRegistration(registration.id);
          setAlertModal({
            title: "Registration Deleted",
            message: "The registration has been successfully deleted.",
            type: "success"
          });
        }
      }
    });
  };

  const handleSendEmail = (registration: Registration) => {
    setAlertModal({
      title: "Email Feature",
      message: "Email functionality is not yet implemented. This feature will allow you to send customized emails to participants.",
      type: "info"
    });
  };

  const closeAlertModal = () => {
    setAlertModal(null);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
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
                      <button 
                        onClick={() => handleConfirmRegistration(registration)}
                        className="border border-green-300 text-green-600 px-4 py-2 rounded-lg hover:bg-green-50 flex items-center text-sm font-medium transition-colors"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Confirm Registration
                      </button>
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
      {alertModal && (
        <AlertModal
          isOpen={true}
          onClose={closeAlertModal}
          {...alertModal}
        />
      )}
    </>
  );
};

export default RegistrationsTab;