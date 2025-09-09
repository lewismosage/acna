import React, { useState } from 'react';
import { 
  User, 
  Calendar, 
  Phone, 
  Mail, 
  Tag, 
  Download, 
  Users,
  Trash2,
  MessageCircle,
  Loader,
  X,
  CheckCircle,
  AlertCircle,
  Heart,
  Award,
  FileText
} from 'lucide-react';
import { educationalResourcesApi } from '../../../../services/educationalResourcesApi'; 
import AlertModal from '../../../../components/common/AlertModal';

interface CaseStudySubmission {
  id: number;
  title: string;
  submittedBy: string; 
  institution: string;
  email: string;
  phone?: string;
  location: string;
  category: string;
  submissionDate: string; 
  status: 'Pending Review' | 'Under Review' | 'Approved' | 'Published' | 'Rejected';
  excerpt: string;
  fullContent?: string; 
  attachments: string[];
  reviewNotes?: string; 
  reviewedBy?: string; 
  reviewDate?: string; 
  publishedDate?: string; 
  impact?: string;
  imageUrl?: string; 
}

interface CaseStudySubmissionsTabProps {
  submissions: CaseStudySubmission[];
  setSubmissions: React.Dispatch<React.SetStateAction<CaseStudySubmission[]>>;
}

interface ParsedFullContent {
  patient_demographics?: {
    age_group?: string;
    gender?: string;
    location?: string;
  };
  clinical_presentation?: string;
  diagnostic_workup?: string;
  management?: string;
  outcome?: string;
  lesson_learned?: string;
  discussion?: string;
  ethics_approval?: boolean;
  ethics_number?: string;
  consent_obtained?: boolean;
  conflict_of_interest?: string;
  acknowledgments?: string;
  references?: string;
  declaration?: boolean;
  impact?: string;
}

const CaseStudySubmissionsTab: React.FC<CaseStudySubmissionsTabProps> = ({
  submissions,
  setSubmissions
}) => {
  const [expandedSubmissions, setExpandedSubmissions] = useState<number[]>([]);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    submissionId: number | null;
    submissionTitle: string;
  }>({
    isOpen: false,
    submissionId: null,
    submissionTitle: ''
  });

  // Comments and notification modal state
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState<CaseStudySubmission | null>(null);
  const [notificationComments, setNotificationComments] = useState('');
  const [updating, setUpdating] = useState<number | null>(null);

  // Alert modal state for notifications
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'confirm';
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  const getSubmissionStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
      case 'Published':
        return 'bg-green-100 text-green-800';
      case 'Pending Review':
        return 'bg-yellow-100 text-yellow-800';
      case 'Under Review':
        return 'bg-blue-100 text-blue-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const showAlert = (type: 'success' | 'error', title: string, message: string) => {
    setAlertModal({
      isOpen: true,
      type,
      title,
      message
    });
  };

  const closeAlert = () => {
    setAlertModal({
      isOpen: false,
      type: 'success',
      title: '',
      message: ''
    });
  };

  const toggleSubmissionExpansion = (id: number) => {
    setExpandedSubmissions(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleStatusChange = async (submissionId: number, newStatus: string) => {
    try {
      // Update status via API
      await educationalResourcesApi.updateSubmissionStatus(submissionId, newStatus);
      
      // Update local state
      setSubmissions(prev =>
        prev.map(submission =>
          submission.id === submissionId
            ? { ...submission, status: newStatus as CaseStudySubmission['status'] }
            : submission
        )
      );
      
      showAlert('success', 'Status Updated', `Submission status updated to "${newStatus}" successfully.`);
    } catch (error) {
      console.error('Failed to update submission status:', error);
      showAlert('error', 'Update Failed', 'Failed to update submission status. Please try again.');
    }
  };

  const openDeleteModal = (submissionId: number, submissionTitle: string) => {
    setDeleteModal({
      isOpen: true,
      submissionId,
      submissionTitle
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      submissionId: null,
      submissionTitle: ''
    });
  };

  const handleDeleteSubmission = async () => {
    if (!deleteModal.submissionId) return;

    try {
      await educationalResourcesApi.deleteSubmission(deleteModal.submissionId);
      
      setSubmissions(prev => prev.filter(submission => submission.id !== deleteModal.submissionId));
      
      closeDeleteModal();
      showAlert('success', 'Submission Deleted', 'The submission has been deleted successfully.');
    } catch (error) {
      console.error('Failed to delete submission:', error);
      showAlert('error', 'Delete Failed', 'Failed to delete the submission. Please try again.');
    }
  };

  const handleNotifySubmission = (submission: CaseStudySubmission) => {
    setCurrentSubmission(submission);
    setNotificationComments(submission.reviewNotes || '');
    setShowNotifyModal(true);
  };

  const handleSendNotification = async () => {
    if (!currentSubmission) return;
  
    try {
      setUpdating(currentSubmission.id);
      
      // Use the new combined endpoint
      const result = await educationalResourcesApi.addCommentsAndNotify(
        currentSubmission.id, 
        notificationComments,
        'Admin' 
      );
      
      if (result.success && result.submission) {
        // Update local state with the returned submission data
        setSubmissions(prev => 
          prev.map(submission => 
            submission.id === currentSubmission.id
              ? { 
                  ...submission, // Keep all existing properties
                  reviewNotes: notificationComments, 
                  reviewedBy: 'Admin',
                  // Only update the fields that we know exist
                  status: result.submission?.status || submission.status,
                  reviewDate: result.submission?.reviewDate || submission.reviewDate,
                  // Add other fields as needed
                }
              : submission
          )
        );
        
        // Close modal and show success
        setShowNotifyModal(false);
        setNotificationComments('');
        showAlert('success', 'Comments Updated', 'Comments updated and notification sent successfully!');
      } else {
        showAlert('error', 'Notification Failed', `Failed to send notification: ${result.message}`);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      showAlert('error', 'Notification Error', 'Failed to send notification. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      // Handle both ISO string and date-only formats
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (error) {
      return dateString;
    }
  };

  const parseFullContent = (fullContent: string | undefined): ParsedFullContent => {
    if (!fullContent) return {};
    
    try {
      return JSON.parse(fullContent);
    } catch (error) {
      console.error('Error parsing full content:', error);
      return {};
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Modal for delete confirmation */}
      <AlertModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteSubmission}
        title="Delete Submission"
        message={`Are you sure you want to delete the submission "${deleteModal.submissionTitle}"? This action cannot be undone.`}
        type="confirm"
        confirmText="Delete"
        cancelText="Cancel"
        showCancel={true}
      />

      {/* Alert Modal for notifications */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={closeAlert}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        confirmText="OK"
        showCancel={false}
      />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">Case Study Submissions</h3>
        <p className="text-blue-700 text-sm">
          Review and manage case study submissions from healthcare professionals across Africa.
          Approved submissions will be published in the public case studies section.
        </p>
      </div>

      <div className="space-y-4">
        {submissions.map((submission) => {
          const isExpanded = expandedSubmissions.includes(submission.id);
          const parsedContent = parseFullContent(submission.fullContent);

          return (
            <div key={submission.id} className="bg-white border border-gray-200 rounded-lg">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-900">{submission.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSubmissionStatusColor(submission.status)}`}>
                        {submission.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="font-medium">
                            {submission.submittedBy || 'Unknown Submitter'}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{formatDate(submission.submissionDate)}</span>
                        </div>
                        {submission.phone && (
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-2 text-gray-400" />
                            <span>{submission.phone}</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Tag className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{submission.category}</span>
                        </div>
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{submission.email}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">{submission.location}</span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{submission.excerpt}</p>
                    
                    {submission.impact && (
                      <div className="mb-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Impact: {submission.impact}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                          {submission.attachments?.length || 0} attachment{(submission.attachments?.length || 0) !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <button
                        onClick={() => toggleSubmissionExpansion(submission.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        {isExpanded ? 'Collapse Details' : 'View Details'}
                      </button>
                    </div>
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="mt-6 pt-6 border-t border-gray-200 space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                          <User className="w-4 h-4 mr-2 text-blue-600" />
                          Contact Information
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div><span className="font-medium">Submitted by:</span> {submission.submittedBy || 'Unknown'}</div>
                          <div><span className="font-medium">Institution:</span> {submission.institution}</div>
                          <div><span className="font-medium">Email:</span> {submission.email}</div>
                          {submission.phone && (
                            <div><span className="font-medium">Phone:</span> {submission.phone}</div>
                          )}
                          <div><span className="font-medium">Location:</span> {submission.location}</div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                          Submission Details
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div><span className="font-medium">Category:</span> {submission.category}</div>
                          <div><span className="font-medium">Submitted:</span> {formatDate(submission.submissionDate)}</div>
                          {submission.reviewDate && (
                            <div><span className="font-medium">Reviewed:</span> {formatDate(submission.reviewDate)}</div>
                          )}
                          {submission.reviewedBy && (
                            <div><span className="font-medium">Reviewed by:</span> {submission.reviewedBy}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Patient Demographics */}
                    {parsedContent.patient_demographics && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                          <Users className="w-4 h-4 mr-2 text-green-600" />
                          Patient Demographics
                        </h4>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            {parsedContent.patient_demographics.age_group && (
                              <div>
                                <span className="font-medium text-gray-700">Age Group:</span>
                                <div className="text-gray-600">{parsedContent.patient_demographics.age_group}</div>
                              </div>
                            )}
                            {parsedContent.patient_demographics.gender && (
                              <div>
                                <span className="font-medium text-gray-700">Gender:</span>
                                <div className="text-gray-600">{parsedContent.patient_demographics.gender}</div>
                              </div>
                            )}
                            {parsedContent.patient_demographics.location && (
                              <div>
                                <span className="font-medium text-gray-700">Patient Location:</span>
                                <div className="text-gray-600">{parsedContent.patient_demographics.location}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Case Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {parsedContent.clinical_presentation && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                            <Heart className="w-4 h-4 mr-2 text-red-500" />
                            Clinical Presentation
                          </h4>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded whitespace-pre-line">
                            {parsedContent.clinical_presentation}
                          </p>
                        </div>
                      )}

                      {parsedContent.diagnostic_workup && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                            <FileText className="w-4 h-4 mr-2 text-purple-600" />
                            Diagnostic Workup
                          </h4>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded whitespace-pre-line">
                            {parsedContent.diagnostic_workup}
                          </p>
                        </div>
                      )}

                      {parsedContent.management && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                            <Award className="w-4 h-4 mr-2 text-orange-600" />
                            Management
                          </h4>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded whitespace-pre-line">
                            {parsedContent.management}
                          </p>
                        </div>
                      )}

                      {parsedContent.outcome && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                            Outcome
                          </h4>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded whitespace-pre-line">
                            {parsedContent.outcome}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Lessons Learned and Discussion */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {parsedContent.lesson_learned && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                            <Award className="w-4 h-4 mr-2 text-yellow-600" />
                            Lesson Learned / Key Points
                          </h4>
                          <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded whitespace-pre-line">
                            {parsedContent.lesson_learned}
                          </p>
                        </div>
                      )}

                      {parsedContent.discussion && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Discussion</h4>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded whitespace-pre-line">
                            {parsedContent.discussion}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Ethics & Consent */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2 text-orange-600" />
                        Ethics & Consent
                      </h4>
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Ethics Approval:</span>
                            <span className={`ml-2 px-2 py-1 rounded text-xs ${parsedContent.ethics_approval ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {parsedContent.ethics_approval ? 'Yes' : 'No'}
                            </span>
                            {parsedContent.ethics_number && (
                              <div className="mt-1 text-gray-600">Number: {parsedContent.ethics_number}</div>
                            )}
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Patient Consent:</span>
                            <span className={`ml-2 px-2 py-1 rounded text-xs ${parsedContent.consent_obtained ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {parsedContent.consent_obtained ? 'Obtained' : 'Not Obtained'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Additional Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {parsedContent.conflict_of_interest && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Conflict of Interest</h4>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                            {parsedContent.conflict_of_interest}
                          </p>
                        </div>
                      )}

                      {parsedContent.acknowledgments && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Acknowledgments</h4>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                            {parsedContent.acknowledgments}
                          </p>
                        </div>
                      )}
                    </div>

                    {parsedContent.references && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">References</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded whitespace-pre-line">
                          {parsedContent.references}
                        </p>
                      </div>
                    )}

                    {/* Attachments */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Attachments</h4>
                      <div className="space-y-2">
                        {(submission.attachments || []).map((attachment, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">{attachment}</span>
                            <button className="text-blue-600 hover:text-blue-800">
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        {(!submission.attachments || submission.attachments.length === 0) && (
                          <p className="text-sm text-gray-500">No attachments</p>
                        )}
                      </div>
                    </div>
                    
                    {submission.reviewNotes && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Review Notes</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{submission.reviewNotes}</p>
                      </div>
                    )}
                    
                    {/* Updated Action Buttons */}
                    <div className="flex gap-3 pt-4 flex-wrap">
                      <select
                        value={submission.status}
                        onChange={(e) => handleStatusChange(submission.id, e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Pending Review">Pending Review</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Approved">Approved</option>
                        <option value="Published">Published</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                      
                      <button 
                        onClick={() => handleNotifySubmission(submission)}
                        disabled={updating === submission.id}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm flex items-center transition-colors disabled:opacity-50"
                      >
                        {updating === submission.id ? (
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <MessageCircle className="w-4 h-4 mr-2" />
                        )}
                        Add Comments & Notify
                      </button>

                      <button 
                        onClick={() => openDeleteModal(submission.id, submission.title)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {submissions.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
          <p className="text-gray-500">Case study submissions will appear here for review.</p>
        </div>
      )}

      {/* Comments and Notification Modal */}
      {showNotifyModal && currentSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Add Comments & Notify Submitter</h3>
                <button 
                  onClick={() => setShowNotifyModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">{currentSubmission.title}</h4>
                  <p className="text-sm text-gray-600">
                    Submitted by: {currentSubmission.submittedBy}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comments for Submitter</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={6}
                    value={notificationComments}
                    onChange={(e) => setNotificationComments(e.target.value)}
                    placeholder="Add comments or feedback for the submitter (optional)..."
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowNotifyModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendNotification}
                  disabled={updating === currentSubmission.id}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center transition-colors"
                >
                  {updating === currentSubmission.id && (
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Notify Submitter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseStudySubmissionsTab;