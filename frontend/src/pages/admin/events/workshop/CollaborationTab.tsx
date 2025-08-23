import React, { useState, useEffect } from 'react';
import { 
  Calendar, User, Target, MessageCircle, FileCheck, 
  XCircle, Mail, Trash2, RefreshCw, Search, Loader
} from 'lucide-react';
import { workshopsApi, CollaborationSubmission } from '../../../../services/workshopAPI';
import LoadingSpinner from '../../../../components/common/LoadingSpinner';

const CollaborationTab: React.FC = () => {
  const [collaborationSubmissions, setCollaborationSubmissions] = useState<CollaborationSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notificationComments, setNotificationComments] = useState('');
  const [currentSubmission, setCurrentSubmission] = useState<CollaborationSubmission | null>(null);

  // Fetch collaboration submissions when component mounts
  useEffect(() => {
    fetchCollaborationSubmissions();
  }, []);

  const fetchCollaborationSubmissions = async () => {
    setIsLoading(true);
    setError(null);
    try {
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
      await workshopsApi.deleteCollaboration(submissionId);
      setCollaborationSubmissions(prev => prev.filter(sub => sub.id !== submissionId));
    } catch (err) {
      setError('Failed to delete submission.');
      console.error('Error deleting collaboration submission:', err);
    }
  };

  const handleNotifySubmission = (submission: CollaborationSubmission) => {
    setCurrentSubmission(submission);
    setNotificationComments(submission.additionalNotes || '');
    setShowNotifyModal(true);
  };

  const handleSendNotification = async () => {
    if (!currentSubmission) return;

    try {
      setUpdatingStatus(currentSubmission.id);
      
      // Update the submission with comments (this would need a backend endpoint)
      // For now, we'll just update the status to "Needs Info" and show success
      const updatedSubmission = await workshopsApi.updateCollaborationStatus(currentSubmission.id, 'Needs Info');
      
      setCollaborationSubmissions(prev =>
        prev.map(submission =>
          submission.id === currentSubmission.id
            ? updatedSubmission
            : submission
        )
      );
      
      setShowNotifyModal(false);
      setNotificationComments('');
      setCurrentSubmission(null);
      
      // Show success message
      setError(null);
    } catch (err) {
      setError(`Failed to send notification: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error('Error sending notification:', err);
    } finally {
      setUpdatingStatus(null);
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

  // Filter submissions based on search term
  const filteredSubmissions = collaborationSubmissions.filter(submission =>
    submission.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.projectDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.projectLead.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.contactEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.skillsNeeded.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
      {/* Header with search bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Collaboration Submissions</h2>
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search submissions..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredSubmissions.map((submission) => (
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
              onClick={() => handleNotifySubmission(submission)}
              disabled={updatingStatus === submission.id}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center text-sm font-medium transition-colors disabled:opacity-50"
            >
              {updatingStatus === submission.id ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <MessageCircle className="w-4 h-4 mr-2" />
              )}
              Add Comments & Notify
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

      {filteredSubmissions.length === 0 && (
        <div className="text-center py-12">
          <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No matching submissions found' : 'No collaboration submissions'}
          </h3>
          <p className="text-gray-500">
            {searchTerm 
              ? 'Try adjusting your search terms' 
              : 'No collaboration requests have been submitted yet.'}
          </p>
        </div>
      )}

      {/* Notify Modal */}
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
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">{currentSubmission.projectTitle}</h4>
                  <p className="text-sm text-gray-600">
                    Submitted by: {currentSubmission.projectLead} ({currentSubmission.contactEmail})
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comments for Submitter</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={6}
                    value={notificationComments}
                    onChange={(e) => setNotificationComments(e.target.value)}
                    placeholder="Add comments or request more information from the submitter..."
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowNotifyModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendNotification}
                  disabled={updatingStatus === currentSubmission.id}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                  {updatingStatus === currentSubmission.id && (
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  <Mail className="w-4 h-4 mr-2" />
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

export default CollaborationTab;