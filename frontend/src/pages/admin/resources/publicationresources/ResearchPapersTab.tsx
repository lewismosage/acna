import React, { useState, useEffect } from 'react';
import { Search, Edit3, Trash2, FileText, Calendar, User, ExternalLink, Download, Award, ChevronDown, ChevronUp } from 'lucide-react';
import { researchPapersApi, ResearchPaper, ResearchPaperStatus } from '../../../../services/researchprojectsApi';
import LoadingSpinner from '../../../../components/common/LoadingSpinner';
import AlertModal from '../../../../components/common/AlertModal';

const ResearchPapersTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedPaper, setExpandedPaper] = useState<number | null>(null);
  const [allPapers, setAllPapers] = useState<ResearchPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [researchTypeFilter, setResearchTypeFilter] = useState<string>('');

  // Alert modal state
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    type: 'info' | 'warning' | 'error' | 'success' | 'confirm';
    title: string;
    message: string;
    onConfirm?: () => void;
    showCancel?: boolean;
    confirmText?: string;
    cancelText?: string;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  // Fetch research papers from API
  useEffect(() => {
    const fetchPapers = async () => {
      try {
        setLoading(true);
        
        // Build filter parameters
        const params: any = {};
        if (statusFilter) params.status = statusFilter;
        if (categoryFilter) params.category = categoryFilter;
        if (researchTypeFilter) params.research_type = researchTypeFilter;
        if (searchTerm.trim()) params.search = searchTerm.trim();
        
        const papers = await researchPapersApi.getAll(params);
        setAllPapers(papers);
      } catch (error: any) {
        console.error('Error fetching research papers:', error);
        setAlertModal({
          isOpen: true,
          type: 'error',
          title: 'Error Loading Papers',
          message: error.message || 'Failed to load research papers. Please refresh the page or try again later.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPapers();
  }, [statusFilter, categoryFilter, researchTypeFilter, searchTerm]);

  const getStatusColor = (status: ResearchPaperStatus) => {
    switch (status) {
      case 'Published':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Under Review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Accepted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Submitted':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Revision Required':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleStatusChange = async (paperId: number, newStatus: ResearchPaperStatus) => {
    try {
      const updatedPaper = await researchPapersApi.updateStatus(paperId, newStatus);
      
      setAllPapers(prev => 
        prev.map(paper => 
          paper.id === paperId ? updatedPaper : paper
        )
      );
      
      setAlertModal({
        isOpen: true,
        type: 'success',
        title: 'Status Updated',
        message: `Paper status has been successfully updated to "${newStatus}".`
      });
    } catch (error: any) {
      console.error('Error updating paper status:', error);
      setAlertModal({
        isOpen: true,
        type: 'error',
        title: 'Error Updating Status',
        message: error.message || 'Failed to update paper status. Please try again.'
      });
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedPaper(expandedPaper === id ? null : id);
  };

  const handleDeletePaper = (paper: ResearchPaper) => {
    setAlertModal({
      isOpen: true,
      type: 'confirm',
      title: 'Delete Research Paper',
      message: `Are you sure you want to delete "${paper.title}"? This action cannot be undone.`,
      showCancel: true,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: () => confirmDeletePaper(paper.id, paper.title)
    });
  };

  const confirmDeletePaper = async (paperId: number, paperTitle: string) => {
    try {
      await researchPapersApi.delete(paperId);
      setAllPapers(prev => prev.filter(p => p.id !== paperId));

      setAlertModal({
        isOpen: true,
        type: 'success',
        title: 'Paper Deleted',
        message: `"${paperTitle}" has been successfully deleted.`
      });
    } catch (error: any) {
      console.error('Error deleting paper:', error);
      setAlertModal({
        isOpen: true,
        type: 'error',
        title: 'Error Deleting Paper',
        message: error.message || 'Failed to delete paper. Please try again.'
      });
    }
  };

  const formatAuthors = (authors: any[]): string => {
    return authors.map(author => author.name).join(', ');
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const filteredPapers = allPapers.filter(paper => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      paper.title.toLowerCase().includes(searchLower) ||
      paper.authors.some(author => author.name.toLowerCase().includes(searchLower)) ||
      paper.abstract.toLowerCase().includes(searchLower) ||
      paper.keywords.some(keyword => keyword.toLowerCase().includes(searchLower))
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search research papers by title, author, abstract, or keywords..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Revision Required">Revision Required</option>
              <option value="Accepted">Accepted</option>
              <option value="Published">Published</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">All Categories</option>
              <option value="Pediatric Epilepsy">Pediatric Epilepsy</option>
              <option value="Cerebral Palsy">Cerebral Palsy</option>
              <option value="Neurodevelopmental Disorders">Neurodevelopmental Disorders</option>
              <option value="Pediatric Stroke">Pediatric Stroke</option>
              <option value="Infectious Diseases of CNS">Infectious Diseases of CNS</option>
              <option value="Genetic Neurological Disorders">Genetic Neurological Disorders</option>
              <option value="Neurooncology">Neurooncology</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Research Type</label>
            <select
              value={researchTypeFilter}
              onChange={(e) => setResearchTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">All Types</option>
              <option value="Clinical Trial">Clinical Trial</option>
              <option value="Observational Study">Observational Study</option>
              <option value="Case Report">Case Report</option>
              <option value="Case Series">Case Series</option>
              <option value="Systematic Review">Systematic Review</option>
              <option value="Meta-Analysis">Meta-Analysis</option>
              <option value="Basic Science Research">Basic Science Research</option>
              <option value="Epidemiological Study">Epidemiological Study</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Research Papers List */}
      <div className="space-y-6">
        {filteredPapers.length > 0 ? (
          filteredPapers.map((paper) => {
            const isExpanded = expandedPaper === paper.id;
            
            return (
              <div key={paper.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-bold text-gray-900 leading-tight pr-4">
                          {paper.title}
                        </h3>
                        <div className="flex gap-2 flex-shrink-0">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(paper.status)}`}>
                            {paper.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center text-gray-600 text-sm">
                            <User className="w-4 h-4 mr-2 text-blue-600" />
                            <span>{formatAuthors(paper.authors)}</span>
                          </div>
                          <div className="flex items-center text-gray-600 text-sm">
                            <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                            <span>Submitted: {formatDate(paper.submissionDate)}</span>
                          </div>
                          {paper.reviewDeadline && (
                            <div className="flex items-center text-gray-600 text-sm">
                              <Calendar className="w-4 h-4 mr-2 text-orange-600" />
                              <span>Review Deadline: {formatDate(paper.reviewDeadline)}</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center text-gray-600 text-sm">
                            <span className="font-medium">Type: {paper.researchType}</span>
                          </div>
                          <div className="flex items-center text-gray-600 text-sm">
                            <span className="font-medium">Category: {paper.category}</span>
                          </div>
                          <div className="flex items-center text-gray-600 text-sm">
                            <span className="font-medium">Authors: {paper.authorCount}</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                        {paper.abstract}
                      </p>

                      {/* Keywords */}
                      {paper.keywords.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            {paper.keywords.map((keyword, index) => (
                              <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Expandable Content */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h4 className="font-medium text-gray-900 mb-2">Study Details</h4>
                              <div className="space-y-1 text-sm text-gray-600">
                                {paper.studyDesign && <div><span className="font-medium">Study Design:</span> {paper.studyDesign}</div>}
                                {paper.participants && <div><span className="font-medium">Participants:</span> {paper.participants}</div>}
                                {paper.targetJournal && <div><span className="font-medium">Target Journal:</span> {paper.targetJournal}</div>}
                                <div><span className="font-medium">Ethics Approval:</span> {paper.ethicsApproval ? 'Yes' : 'No'}</div>
                                {paper.ethicsNumber && <div><span className="font-medium">Ethics Number:</span> {paper.ethicsNumber}</div>}
                              </div>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg">
                              <h4 className="font-medium text-gray-900 mb-2">Additional Information</h4>
                              <div className="space-y-1 text-sm text-gray-600">
                                {paper.fundingSource && <div><span className="font-medium">Funding:</span> {paper.fundingSource}</div>}
                                {paper.conflictOfInterest && <div><span className="font-medium">Conflict of Interest:</span> {paper.conflictOfInterest}</div>}
                                <div><span className="font-medium">Under Review:</span> {paper.isUnderReview ? 'Yes' : 'No'}</div>
                                <div><span className="font-medium">Last Modified:</span> {formatDate(paper.lastModified)}</div>
                              </div>
                            </div>
                          </div>

                          {paper.acknowledgments && (
                            <div className="bg-green-50 p-4 rounded-lg">
                              <h4 className="font-medium text-gray-900 mb-2">Acknowledgments</h4>
                              <p className="text-sm text-gray-600">{paper.acknowledgments}</p>
                            </div>
                          )}

                          {/* Corresponding Author */}
                          {paper.correspondingAuthor && (
                            <div className="bg-yellow-50 p-4 rounded-lg">
                              <h4 className="font-medium text-gray-900 mb-2">Corresponding Author</h4>
                              <div className="text-sm text-gray-600">
                                <div><span className="font-medium">Name:</span> {paper.correspondingAuthor.name}</div>
                                <div><span className="font-medium">Email:</span> {paper.correspondingAuthor.email}</div>
                                <div><span className="font-medium">Affiliation:</span> {paper.correspondingAuthor.affiliation}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => toggleExpand(paper.id)}
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
                          View Details
                        </>
                      )}
                    </button>

                    {paper.manuscriptUrl && (
                      <a
                        href={paper.manuscriptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="border border-blue-300 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 flex items-center text-sm font-medium transition-colors"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Manuscript
                      </a>
                    )}

                    <div className="relative">
                      <select
                        value={paper.status}
                        onChange={(e) => handleStatusChange(paper.id, e.target.value as ResearchPaperStatus)}
                        className="border border-gray-300 px-3 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Submitted">Submitted</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Revision Required">Revision Required</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Published">Published</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>

                    <button 
                      onClick={() => handleDeletePaper(paper)}
                      className="border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 flex items-center text-sm font-medium transition-colors"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </button>
                  </div>

                  {/* Metadata */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                      <span>Submission ID: #{paper.id}</span>
                      <span>Submitted: {formatDate(paper.submissionDate)}</span>
                      <span>Last Modified: {formatDate(paper.lastModified)}</span>
                      {paper.supplementaryFiles.length > 0 && (
                        <span>Supplementary Files: {paper.supplementaryFiles.length}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No research papers found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter || categoryFilter || researchTypeFilter
                ? "No research papers match your current filters." 
                : "No research papers have been submitted yet."}
            </p>
            {(searchTerm || statusFilter || categoryFilter || researchTypeFilter) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setCategoryFilter('');
                  setResearchTypeFilter('');
                }}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={alertModal.onConfirm}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        showCancel={alertModal.showCancel}
        confirmText={alertModal.confirmText}
        cancelText={alertModal.cancelText}
      />
    </div>
  );
};

export default ResearchPapersTab;