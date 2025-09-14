import React, { useState } from 'react';
import {
  BookOpen,
  Users,
  BarChart3,
  TrendingUp,
  FileText,
  Upload,
} from 'lucide-react';

// Types
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
                <FileText className="w-6 h-6" />
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

interface AnalyticsTabProps {
  analyticsData: ProgramAnalytics;
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ analyticsData }) => {
  const [alertModal, setAlertModal] = useState<Omit<AlertModalProps, 'isOpen' | 'onClose'> | null>(null);

  const closeAlertModal = () => {
    setAlertModal(null);
  };

  const handleFeatureComingSoon = (feature: string) => {
    setAlertModal({
      title: "Feature Coming Soon",
      message: `${feature} functionality is under development.`,
      type: "info"
    });
  };

  return (
    <>
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
              onClick={() => handleFeatureComingSoon("Program data export")}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-medium">Export Program Data</span>
              <FileText className="w-4 h-4 text-gray-400" />
            </button>
            <button 
              onClick={() => handleFeatureComingSoon("Report generation")}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-medium">Generate Report</span>
              <BarChart3 className="w-4 h-4 text-gray-400" />
            </button>
            <button 
              onClick={() => handleFeatureComingSoon("Bulk update")}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-medium">Bulk Update Programs</span>
              <Upload className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Additional Analytics Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {analyticsData.totalPrograms === 0 ? (
                <p className="text-gray-500 text-sm">No recent activity to display</p>
              ) : (
                <>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Programs Created This Month</span>
                    <span className="text-sm font-medium text-gray-900">{analyticsData.totalPrograms}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">New Enrollments</span>
                    <span className="text-sm font-medium text-gray-900">{analyticsData.totalEnrollments}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600">Upcoming Programs</span>
                    <span className="text-sm font-medium text-gray-900">{analyticsData.upcomingPrograms}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Average Fill Rate</span>
                  <span className="font-medium">{analyticsData.averageFillRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${Math.min(analyticsData.averageFillRate, 100)}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Program Success Rate</span>
                  <span className="font-medium">
                    {analyticsData.totalPrograms > 0 
                      ? ((analyticsData.programsByStatus.published / analyticsData.totalPrograms) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full"
                    style={{ 
                      width: `${analyticsData.totalPrograms > 0 
                        ? Math.min((analyticsData.programsByStatus.published / analyticsData.totalPrograms) * 100, 100)
                        : 0}%` 
                    }}
                  />
                </div>
              </div>
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
    </>
  );
};

export default AnalyticsTab;