import React, { useState } from 'react';
import { UserPlus, Eye, Mail, Plus, X, User, Building, MapPin, Award, FileText, Mail as MailIcon } from 'lucide-react';
import { Nominee, awardsApi } from '../../../../services/awardsApi';

interface NomineesTabProps {
  nominees: Nominee[];
  searchTerm: string;
  loading: boolean;
  onAddToPoll: (nominee: Nominee) => void;
  onRefresh: () => void;
}

const NomineesTab: React.FC<NomineesTabProps> = ({
  nominees,
  searchTerm,
  loading,
  onAddToPoll,
  onRefresh
}) => {
  const [selectedNominee, setSelectedNominee] = useState<Nominee | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Only show nominees from new submissions (source === 'new')
  const unverifiedNominees = nominees.filter(nominee => 
    nominee.source === 'new' && nominee.status === 'Pending'
  );

  const filteredNominees = unverifiedNominees.filter(nominee => 
    nominee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nominee.institution.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddToPoll = async (nominee: Nominee) => {
    try {
      await onAddToPoll(nominee);
      onRefresh();
    } catch (error) {
      console.error('Failed to add nominee to poll:', error);
    }
  };

  const handleRejectNominee = async (nominee: Nominee) => {
    try {
      await awardsApi.updateNomineeStatus(nominee.id, 'Rejected');
      onRefresh();
    } catch (error) {
      console.error('Failed to reject nominee:', error);
    }
  };

  const handleViewDetails = (nominee: Nominee) => {
    setSelectedNominee(nominee);
    setShowDetailsModal(true);
  };

  const handleContactNominator = (nominee: Nominee) => {
    if (nominee.email) {
      window.open(`mailto:${nominee.email}?subject=Regarding your nomination for ${nominee.name}`);
    } else {
      alert('No email address available for this nominee');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-bold">Nominee Verification</h3>
          <p className="text-gray-600 text-sm">
            Review and verify new nominee submissions before adding them to the poll
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {filteredNominees.length} pending verification
        </div>
      </div>

      {filteredNominees.length > 0 ? (
        <div className="space-y-4">
          {filteredNominees.map((nominee) => (
            <div 
              key={nominee.id} 
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 leading-tight">
                        {nominee.name}
                      </h4>
                      <p className="text-gray-600 text-sm mt-1">
                        {nominee.institution} • {nominee.specialty}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                      Awaiting Verification
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <span className="font-medium">Category:</span>
                      <span className="ml-2">{nominee.categoryTitle}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium">Location:</span>
                      <span className="ml-2">{nominee.location || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium">Email:</span>
                      <span className="ml-2">{nominee.email || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium">Suggested by:</span>
                      <span className="ml-2">{nominee.suggestedBy}</span>
                    </div>
                  </div>

                  {nominee.achievement && (
                    <div className="mt-4">
                      <h5 className="font-medium text-gray-900 text-sm mb-2">Achievement Summary:</h5>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {nominee.achievement.length > 200 
                          ? `${nominee.achievement.substring(0, 200)}...` 
                          : nominee.achievement}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleAddToPoll(nominee)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Poll
                </button>
                
                <button
                  onClick={() => handleRejectNominee(nominee)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center text-sm font-medium transition-colors"
                >
                  Reject
                </button>

                <button
                  onClick={() => handleViewDetails(nominee)}
                  className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center text-sm font-medium transition-colors"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </button>

                <button
                  onClick={() => handleContactNominator(nominee)}
                  className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center text-sm font-medium transition-colors"
                >
                  <MailIcon className="w-4 h-4 mr-2" />
                  Contact Nominator
                </button>
              </div>

              {/* Metadata */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                  <span>Submitted: {new Date(nominee.suggestedDate).toLocaleDateString()}</span>
                  <span>Source: {nominee.source === 'new' ? 'New Submission' : 'Nomination Form'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <UserPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No nominees awaiting verification</h3>
          <p className="text-gray-500">
            {searchTerm 
              ? "No nominees match your search criteria." 
              : "All nominee submissions have been processed."}
          </p>
        </div>
      )}

      {/* Nominee Details Modal */}
      {showDetailsModal && selectedNominee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">
                  Nominee Details: {selectedNominee.name}
                </h3>
                <button 
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedNominee(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Personal Information
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium">Full Name:</span>
                      <p className="text-gray-700">{selectedNominee.name}</p>
                    </div>
                    <div>
                      <span className="font-medium">Email:</span>
                      <p className="text-gray-700">{selectedNominee.email || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span>
                      <p className="text-gray-700">{selectedNominee.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Location:</span>
                      <p className="text-gray-700">{selectedNominee.location || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Specialty:</span>
                      <p className="text-gray-700">{selectedNominee.specialty}</p>
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                    <Building className="w-5 h-5 mr-2" />
                    Professional Information
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium">Institution:</span>
                      <p className="text-gray-700">{selectedNominee.institution}</p>
                    </div>
                    <div>
                      <span className="font-medium">Award Category:</span>
                      <p className="text-gray-700">{selectedNominee.categoryTitle}</p>
                    </div>
                    <div>
                      <span className="font-medium">Suggested by:</span>
                      <p className="text-gray-700">{selectedNominee.suggestedBy}</p>
                    </div>
                    <div>
                      <span className="font-medium">Submitted on:</span>
                      <p className="text-gray-700">
                        {new Date(selectedNominee.suggestedDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedNominee.status === 'Pending' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : selectedNominee.status === 'Approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedNominee.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Achievement Summary */}
              {selectedNominee.achievement && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                    <Award className="w-5 h-5 mr-2" />
                    Achievement Summary
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {selectedNominee.achievement}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons in Modal */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleAddToPoll(selectedNominee)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center text-sm font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Approve & Add to Poll
                  </button>
                  
                  <button
                    onClick={() => handleRejectNominee(selectedNominee)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center text-sm font-medium transition-colors"
                  >
                    Reject Nominee
                  </button>

                  <button
                    onClick={() => handleContactNominator(selectedNominee)}
                    className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center text-sm font-medium transition-colors"
                  >
                    <MailIcon className="w-4 h-4 mr-2" />
                    Contact Nominator
                  </button>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedNominee(null);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NomineesTab;