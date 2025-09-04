import React, { useState, useEffect } from 'react';
import { Search, Edit3, Trash2, FileText, Calendar, User, ExternalLink, Download, Award, ChevronDown, ChevronUp } from 'lucide-react';
//import CreateResearchPaperModal from './CreateResearchPaperModal';
//import { ResearchPaper, ResearchPaperStatus } from './CreateResearchPaperModal';
import LoadingSpinner from '../../../../components/common/LoadingSpinner';
import AlertModal from '../../../../components/common/AlertModal';

const ResearchPapersTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedPaper, setExpandedPaper] = useState<number | null>(null);
  const [allPapers, setAllPapers] = useState<ResearchPaper[]>([]);
  const [editingPaper, setEditingPaper] = useState<ResearchPaper | null>(null);
  const [loading, setLoading] = useState(true);

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

  // Mock API to simulate data loading
  useEffect(() => {
    const fetchPapers = async () => {
      try {
        setLoading(true);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data - in real app, this would come from your API
        const mockPapers: ResearchPaper[] = [
          {
            id: 1,
            title: "Machine Learning Approaches for Early Detection of Autism Spectrum Disorders in African Children",
            authors: [
              { name: "Dr. Amina Hassan", credentials: "MD, PhD", affiliation: "University of Cairo", email: "a.hassan@cu.edu.eg" },
              { name: "Dr. John Mbeki", credentials: "PhD", affiliation: "University of Cape Town", email: "j.mbeki@uct.ac.za" }
            ],
            journal: "African Journal of Neurological Sciences",
            abstract: "This study investigates the application of machine learning algorithms for early detection of autism spectrum disorders (ASD) in pediatric populations across Africa. We analyzed behavioral patterns, eye-tracking data, and developmental milestones from 850 children aged 18-36 months across five African countries.",
            doi: "10.1016/j.ajns.2024.01.015",
            publicationDate: "2024-03-15",
            category: "Autism",
            keywords: ["machine learning", "autism", "early detection", "pediatrics", "Africa"],
            citationCount: 23,
            impactFactor: 4.2,
            status: "Published",
            accessType: "Open Access",
            downloadUrl: "https://example.com/paper1.pdf",
            externalUrl: "https://journal.com/article/12345",
            volume: "45",
            issue: "3",
            pages: "234-248",
            language: "English",
            researchType: "Original Research",
            methodology: "Cross-sectional machine learning study",
            sampleSize: 850,
            studyDuration: "24 months",
            fundingSource: "African Research Foundation",
            ethicsApproval: true,
            conflictOfInterest: false,
            isFeatured: true,
            imageUrl: "https://images.pexels.com/photos/8617634/pexels-photo-8617634.jpeg?auto=compress&cs=tinysrgb&w=400",
            createdAt: "2024-03-01",
            updatedAt: "2024-12-15"
          },
          {
            id: 2,
            title: "Efficacy of Traditional Herbal Medicine in Managing Pediatric Epilepsy: A Systematic Review and Meta-Analysis",
            authors: [
              { name: "Dr. Fatima Al-Rashid", credentials: "MD, MSc", affiliation: "University of Ghana", email: "f.alrashid@ug.edu.gh" },
              { name: "Dr. Samuel Okafor", credentials: "PhD, PharmD", affiliation: "University of Nigeria", email: "s.okafor@unn.edu.ng" },
              { name: "Dr. Marie Nkomo", credentials: "MD, PhD", affiliation: "University of Zimbabwe", email: "m.nkomo@uz.ac.zw" }
            ],
            journal: "Traditional Medicine Research",
            abstract: "This systematic review examines the efficacy and safety of traditional herbal medicines used in managing pediatric epilepsy across sub-Saharan Africa. We analyzed 24 studies involving 3,200 children to assess seizure reduction and adverse effects.",
            doi: "10.1080/tmr.2024.02.018",
            publicationDate: "2024-02-28",
            category: "Epilepsy",
            keywords: ["herbal medicine", "epilepsy", "pediatric", "systematic review", "Africa"],
            citationCount: 15,
            impactFactor: 3.8,
            status: "Published",
            accessType: "Free Access",
            downloadUrl: "https://example.com/paper2.pdf",
            externalUrl: "https://tmr-journal.com/article/67890",
            volume: "18",
            issue: "2",
            pages: "89-107",
            language: "English",
            researchType: "Systematic Review",
            methodology: "Systematic review and meta-analysis following PRISMA guidelines",
            sampleSize: 3200,
            studyDuration: "18 months",
            fundingSource: "WHO Traditional Medicine Programme",
            ethicsApproval: true,
            conflictOfInterest: false,
            isFeatured: false,
            imageUrl: "https://images.pexels.com/photos/4173239/pexels-photo-4173239.jpeg?auto=compress&cs=tinysrgb&w=400",
            createdAt: "2024-02-15",
            updatedAt: "2024-11-20"
          }
        ];
        
        setAllPapers(mockPapers);
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
  }, []);

  const getStatusColor = (status: ResearchPaperStatus) => {
    switch (status) {
      case 'Published':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'In Review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Accepted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Submitted':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAccessTypeColor = (accessType: string) => {
    switch (accessType) {
      case 'Open Access':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Free Access':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Subscription':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleStatusChange = async (paperId: number, newStatus: ResearchPaperStatus) => {
    try {
      // In real app, this would be an API call
      setAllPapers(prev => 
        prev.map(paper => 
          paper.id === paperId 
            ? { ...paper, status: newStatus, updatedAt: new Date().toISOString().split('T')[0] }
            : paper
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

  const handlePaperSaved = (savedPaper: ResearchPaper) => {
    if (editingPaper) {
      // Update existing paper
      setAllPapers(prev => 
        prev.map(p => p.id === savedPaper.id ? savedPaper : p)
      );
      setEditingPaper(null);
      
      setAlertModal({
        isOpen: true,
        type: 'success',
        title: 'Paper Updated',
        message: `"${savedPaper.title}" has been successfully updated.`
      });
    } else {
      // Add new paper
      setAllPapers(prev => [savedPaper, ...prev]);
      
      setAlertModal({
        isOpen: true,
        type: 'success',
        title: 'Paper Created',
        message: `"${savedPaper.title}" has been successfully created.`
      });
    }
    
    setShowCreateModal(false);
  };

  const handlePaperError = (error: string) => {
    setAlertModal({
      isOpen: true,
      type: 'error',
      title: 'Error Saving Paper',
      message: error
    });
  };

  const handleEditPaper = (paper: ResearchPaper) => {
    setEditingPaper(paper);
    setShowCreateModal(true);
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
      // In real app, this would be an API call
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

  const filteredPapers = allPapers.filter(paper => {
    const matchesSearch =
      paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paper.authors.some(author => author.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      paper.abstract.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paper.journal.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const formatAuthors = (authors: any[]): string => {
    return authors.map(author => author.name).join(', ');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search research papers..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Research Papers List */}
      <div className="space-y-6">
        {filteredPapers.length > 0 ? (
          filteredPapers.map((paper) => {
            const isExpanded = expandedPaper === paper.id;
            
            return (
              <div key={paper.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                <div className="flex flex-col lg:flex-row">
                  {/* Paper Image */}
                  <div className="lg:w-1/4">
                    <div className="relative">
                      <img
                        src={paper.imageUrl}
                        alt={paper.title}
                        className="w-full h-48 lg:h-full object-cover rounded-t-lg lg:rounded-l-lg lg:rounded-t-none"
                      />
                      <div className="absolute top-3 left-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(paper.status)}`}>
                          {paper.status}
                        </span>
                      </div>
                      {paper.isFeatured && (
                        <div className="absolute top-3 right-3">
                          <Award className="w-5 h-5 text-yellow-500 fill-current" />
                        </div>
                      )}
                      <div className="absolute bottom-3 left-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getAccessTypeColor(paper.accessType)}`}>
                          {paper.accessType}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Paper Details */}
                  <div className="lg:w-3/4 p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                          {paper.title}
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                          <div className="space-y-2">
                            <div className="flex items-center text-gray-600 text-sm">
                              <User className="w-4 h-4 mr-2 text-blue-600" />
                              <span>{formatAuthors(paper.authors)}</span>
                            </div>
                            <div className="flex items-center text-gray-600 text-sm">
                              <FileText className="w-4 h-4 mr-2 text-blue-600" />
                              <span>{paper.journal}</span>
                            </div>
                            <div className="flex items-center text-gray-600 text-sm">
                              <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                              <span>{paper.publicationDate}</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center text-gray-600 text-sm">
                              <span className="font-medium">Type: {paper.researchType}</span>
                            </div>
                            <div className="flex items-center text-gray-600 text-sm">
                              <span className="font-medium">Citations: {paper.citationCount}</span>
                            </div>
                            <div className="flex items-center text-gray-600 text-sm">
                              <span className="font-medium">Impact Factor: {paper.impactFactor}</span>
                            </div>
                          </div>
                        </div>

                        <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                          {paper.abstract}
                        </p>

                        {/* Expandable Content */}
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-2">Publication Details</h4>
                                <div className="space-y-1 text-sm text-gray-600">
                                  {paper.doi && <div><span className="font-medium">DOI:</span> {paper.doi}</div>}
                                  {paper.volume && <div><span className="font-medium">Volume:</span> {paper.volume}</div>}
                                  {paper.issue && <div><span className="font-medium">Issue:</span> {paper.issue}</div>}
                                  {paper.pages && <div><span className="font-medium">Pages:</span> {paper.pages}</div>}
                                  <div><span className="font-medium">Language:</span> {paper.language}</div>
                                </div>
                              </div>

                              <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-2">Study Information</h4>
                                <div className="space-y-1 text-sm text-gray-600">
                                  <div><span className="font-medium">Methodology:</span> {paper.methodology}</div>
                                  {paper.sampleSize && <div><span className="font-medium">Sample Size:</span> {paper.sampleSize}</div>}
                                  {paper.studyDuration && <div><span className="font-medium">Duration:</span> {paper.studyDuration}</div>}
                                  {paper.fundingSource && <div><span className="font-medium">Funding:</span> {paper.fundingSource}</div>}
                                </div>
                              </div>
                            </div>

                            {paper.keywords.length > 0 && (
                              <div className="bg-green-50 p-4 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-2">Keywords</h4>
                                <div className="flex flex-wrap gap-2">
                                  {paper.keywords.map((keyword, index) => (
                                    <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                      {keyword}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="flex gap-4 text-sm text-gray-600">
                              {paper.ethicsApproval && (
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Ethics Approved</span>
                              )}
                              {!paper.conflictOfInterest && (
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">No Conflict of Interest</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Admin Actions */}
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
                            Expand
                          </>
                        )}
                      </button>

                      {paper.downloadUrl && (
                        <a
                          href={paper.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="border border-blue-300 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 flex items-center text-sm font-medium transition-colors"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download PDF
                        </a>
                      )}

                      {paper.externalUrl && (
                        <a
                          href={paper.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="border border-green-300 text-green-600 px-4 py-2 rounded-lg hover:bg-green-50 flex items-center text-sm font-medium transition-colors"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Journal
                        </a>
                      )}

                      <button 
                        onClick={() => handleEditPaper(paper)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center text-sm font-medium transition-colors"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit Details
                      </button>

                      <div className="relative">
                        <select
                          value={paper.status}
                          onChange={(e) => handleStatusChange(paper.id, e.target.value as ResearchPaperStatus)}
                          className="border border-gray-300 px-3 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="Draft">Draft</option>
                          <option value="Submitted">Submitted</option>
                          <option value="In Review">In Review</option>
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
                        <span>Created: {paper.createdAt}</span>
                        <span>Last Updated: {paper.updatedAt}</span>
                        <span>ID: #{paper.id}</span>
                      </div>
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
              {searchTerm 
                ? "No research papers match your search criteria." 
                : "No research papers available yet."}
            </p>
            <button 
              onClick={() => {
                setEditingPaper(null);
                setShowCreateModal(true);
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
            >
              Add Your First Research Paper
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Research Paper Modal */}
      {showCreateModal && (
        <CreateResearchPaperModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setEditingPaper(null);
          }}
          onSuccess={handlePaperSaved}
          onError={handlePaperError}
          initialData={editingPaper || undefined}
        />
      )}

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