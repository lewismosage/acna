import React, { useState } from 'react';
import { 
  User, 
  Calendar, 
  Phone, 
  Mail, 
  Tag, 
  Download, 
  Users,
  Trash2 
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
    } catch (error) {
      console.error('Failed to update submission status:', error);
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
    } catch (error) {
      console.error('Failed to delete submission:', error);
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
                  <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
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
                        <h4 className="font-medium text-gray-900 mb-2">Submission Details</h4>
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
                      
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                        Add Review Notes
                      </button>
                      
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                        Contact Submitter
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
    </div>
  );
};

export default CaseStudySubmissionsTab;