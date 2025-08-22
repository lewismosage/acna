import React, { useState, useEffect } from 'react';
import { 
  Calendar, User, Target, MessageCircle, FileCheck, 
  XCircle, Mail, Trash2, RefreshCw
} from 'lucide-react';
import { workshopsApi, CollaborationSubmission } from '../../../../services/workshopAPI';
import LoadingSpinner from '../../../../components/common/LoadingSpinner';

const CollaborationTab: React.FC = () => {
  const [collaborationSubmissions, setCollaborationSubmissions] = useState<CollaborationSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

  // Fetch collaboration submissions when component mounts
  useEffect(() => {
    fetchCollaborationSubmissions();
  }, []);

  const fetchCollaborationSubmissions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Use the correct method name: getCollaborations instead of getCollaborationSubmissions
      const submissions = await workshopsApi.getCollaborations();
      setCollaborationSubmissions(submissions);
    } catch (err) {
      setError('Failed to load collaboration submissions. Please try again later.');
      console.error('Error fetching collaboration submissions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getCollaborationStatusColor = (status: CollaborationSubmission['status']) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Needs Info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleCollaborationStatusChange = async (submissionId: number, newStatus: CollaborationSubmission['status']) => {
    setUpdatingStatus(submissionId);
    try {
      // Use the correct method name: updateCollaborationStatus instead of updateCollaborationSubmissionStatus
      const updatedSubmission = await workshopsApi.updateCollaborationStatus(submissionId, newStatus);
      
      setCollaborationSubmissions(prev =>
        prev.map(submission =>
          submission.id === submissionId
            ? updatedSubmission
            : submission
        )
      );
    } catch (err) {
      setError(`Failed to update submission status: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error('Error updating collaboration status:', err);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDeleteSubmission = async (submissionId: number) => {
    if (!confirm('Are you sure you want to delete this collaboration submission? This action cannot be undone.')) {
      return;
    }

    try {
      // Use the correct method name: deleteCollaboration instead of deleteCollaborationSubmission
      await workshopsApi.deleteCollaboration(submissionId);
      setCollaborationSubmissions(prev => prev.filter(sub => sub.id !== submissionId));
    } catch (err) {
      setError('Failed to delete submission.');
      console.error('Error deleting collaboration submission:', err);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <span className="block sm:inline">{error}</span>
        <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3">
          <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <title>Close</title>
            <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Collaboration Submissions</h2>
        <button
          onClick={fetchCollaborationSubmissions}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {collaborationSubmissions.map((submission) => (
        <div key={submission.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{submission.projectTitle}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {submission.projectLead}
                </div>
                <div className="flex items-center">
                  <Target className="w-4 h-4 mr-1" />
                  {submission.institution}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Submitted: {formatDate(submission.submittedAt)}
                </div>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCollaborationStatusColor(submission.status)}`}>
              {submission.status}
            </span>
          </div>

          <p className="text-gray-600 mb-4">{submission.projectDescription}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Duration:</strong> {submission.duration}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Commitment Level:</strong> {submission.commitmentLevel}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Contact:</strong> {submission.contactEmail}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Skills Needed:</p>
              <div className="flex flex-wrap gap-2">
                {submission.skillsNeeded.map((skill, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {submission.additionalNotes && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-1">Additional Notes:</p>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{submission.additionalNotes}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => handleCollaborationStatusChange(submission.id, 'Approved')}
              disabled={updatingStatus === submission.id}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center text-sm font-medium transition-colors disabled:opacity-50"
            >
              {updatingStatus === submission.id ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileCheck className="w-4 h-4 mr-2" />
              )}
              Approve & Post
            </button>
            
            <button 
              onClick={() => handleCollaborationStatusChange(submission.id, 'Rejected')}
              disabled={updatingStatus === submission.id}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center text-sm font-medium transition-colors disabled:opacity-50"
            >
              {updatingStatus === submission.id ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4 mr-2" />
              )}
              Reject
            </button>

            <button 
              onClick={() => handleCollaborationStatusChange(submission.id, 'Needs Info')}
              disabled={updatingStatus === submission.id}
              className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 flex items-center text-sm font-medium transition-colors disabled:opacity-50"
            >
              {updatingStatus === submission.id ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <MessageCircle className="w-4 h-4 mr-2" />
              )}
              Request More Info
            </button>

            <a 
              href={`mailto:${submission.contactEmail}`}
              className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center text-sm font-medium transition-colors"
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact Submitter
            </a>

            <button 
              onClick={() => handleCollaborationStatusChange(submission.id, 'Pending')}
              disabled={updatingStatus === submission.id}
              className="border border-orange-600 text-orange-600 px-4 py-2 rounded-lg hover:bg-orange-50 flex items-center text-sm font-medium transition-colors disabled:opacity-50"
            >
              {updatingStatus === submission.id ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Withdraw Post
            </button>

            <button 
              onClick={() => handleDeleteSubmission(submission.id)}
              className="border border-red-600 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 flex items-center text-sm font-medium transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
              <span>Submission ID: #{submission.id}</span>
              <span>Status: {submission.status}</span>
              <span>Submitted: {formatDate(submission.submittedAt)}</span>
            </div>
          </div>
        </div>
      ))}

      {collaborationSubmissions.length === 0 && (
        <div className="text-center py-12">
          <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No collaboration submissions</h3>
          <p className="text-gray-500">No collaboration requests have been submitted yet.</p>
        </div>
      )}
    </div>
  );
};

export default CollaborationTab;