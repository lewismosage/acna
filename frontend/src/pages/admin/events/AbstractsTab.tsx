import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Download, 
  Eye, 
  Edit3, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Mail,
  Users,
  BarChart3,
  Search,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Star,
  Award,
  FileCheck,
  XCircle,
  MessageCircle,
  Phone
} from 'lucide-react';

type AbstractStatus = 'Under Review' | 'Accepted' | 'Revision Required' | 'Rejected';
type PresentationType = 'Oral Presentation' | 'Poster Presentation' | 'E-Poster' | 'No Preference';
type AbstractCategory = 'Clinical Research' | 'Basic Science & Translational Research' | 'Healthcare Technology & Innovation' | 'Medical Education & Training' | 'Public Health & Policy' | 'Case Reports';

export interface Author {
  firstName: string;
  lastName: string;
  email: string;
  institution: string;
  country: string;
  isPresenter: boolean;
  isCorresponding: boolean;
}

export interface Abstract {
  id: number;
  title: string;
  authors: Author[];
  category: AbstractCategory;
  presentationPreference: PresentationType;
  keywords: string[];
  background: string;
  methods: string;
  results: string;
  conclusions: string;
  conflictOfInterest: string;
  status: AbstractStatus;
  submittedDate: string;
  lastUpdated: string;
  abstractFileUrl?: string;
  ethicalApprovalUrl?: string;
  supplementaryFilesUrl?: string;
  reviewerComments?: string;
  assignedReviewer?: string;
  rating?: number;
  isFeatured?: boolean;
}

interface AbstractsTabProps {
  abstracts: Abstract[];
}

const AbstractsTab: React.FC<AbstractsTabProps> = ({ abstracts: initialAbstracts }) => {
  const [abstracts, setAbstracts] = useState<Abstract[]>(initialAbstracts);
  const [selectedTab, setSelectedTab] = useState<'all' | 'review' | 'accepted' | 'revision' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedAbstract, setExpandedAbstract] = useState<number | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [currentAbstract, setCurrentAbstract] = useState<Abstract | null>(null);
  const [reviewerComments, setReviewerComments] = useState('');

  // Sample data for admin view
  const [allAbstracts, setAllAbstracts] = useState<Abstract[]>([
    {
      id: 1,
      title: "Novel Biomarkers for Early Detection of Pediatric Epilepsy in African Populations",
      authors: [
        {
          firstName: "Amina",
          lastName: "Diallo",
          email: "a.diallo@university.edu",
          institution: "University of Dakar",
          country: "Senegal",
          isPresenter: true,
          isCorresponding: true
        },
        {
          firstName: "Kwame",
          lastName: "Osei",
          email: "k.osei@hospital.org",
          institution: "Korle Bu Teaching Hospital",
          country: "Ghana",
          isPresenter: false,
          isCorresponding: false
        }
      ],
      category: "Clinical Research",
      presentationPreference: "Oral Presentation",
      keywords: ["epilepsy", "biomarkers", "pediatric", "Africa"],
      background: "Early detection of pediatric epilepsy in resource-limited settings remains a significant challenge...",
      methods: "We conducted a prospective cohort study of 500 children presenting with seizure-like symptoms...",
      results: "Preliminary results identified three novel biomarkers with sensitivity of 92% and specificity of 88%...",
      conclusions: "These biomarkers show promise for early detection of pediatric epilepsy in African populations...",
      conflictOfInterest: "None declared",
      status: "Under Review",
      submittedDate: "2025-03-15",
      lastUpdated: "2025-03-15",
      abstractFileUrl: "/abstracts/1.pdf",
      ethicalApprovalUrl: "/ethics/1.pdf",
      rating: 4.5,
      isFeatured: true
    },
    {
      id: 2,
      title: "Community-Based Rehabilitation for Children with Cerebral Palsy in Rural Tanzania",
      authors: [
        {
          firstName: "Fatima",
          lastName: "Nkosi",
          email: "f.nkosi@rehab.org",
          institution: "University of Cape Town",
          country: "South Africa",
          isPresenter: true,
          isCorresponding: true
        }
      ],
      category: "Public Health & Policy",
      presentationPreference: "Poster Presentation",
      keywords: ["cerebral palsy", "rehabilitation", "community health", "Tanzania"],
      background: "Access to rehabilitation services for children with cerebral palsy in rural Africa is extremely limited...",
      methods: "We trained 50 community health workers in basic rehabilitation techniques and followed 120 children...",
      results: "After 12 months, 78% of children showed improved motor function compared to baseline...",
      conclusions: "Community-based rehabilitation is a feasible and effective approach in resource-limited settings...",
      conflictOfInterest: "None declared",
      status: "Accepted",
      submittedDate: "2025-02-28",
      lastUpdated: "2025-03-20",
      abstractFileUrl: "/abstracts/2.pdf",
      ethicalApprovalUrl: "/ethics/2.pdf",
      supplementaryFilesUrl: "/supplementary/2.zip",
      rating: 4.2
    },
    {
      id: 3,
      title: "Machine Learning Algorithm for EEG Interpretation in Neonatal Seizures",
      authors: [
        {
          firstName: "Michael",
          lastName: "Chen",
          email: "m.chen@tech.edu",
          institution: "African Institute of Technology",
          country: "Kenya",
          isPresenter: true,
          isCorresponding: true
        },
        {
          firstName: "Sarah",
          lastName: "Johnson",
          email: "s.johnson@tech.edu",
          institution: "African Institute of Technology",
          country: "Kenya",
          isPresenter: false,
          isCorresponding: false
        }
      ],
      category: "Healthcare Technology & Innovation",
      presentationPreference: "Oral Presentation",
      keywords: ["machine learning", "EEG", "neonatal", "seizures"],
      background: "Interpretation of neonatal EEG requires specialized training that is often unavailable in Africa...",
      methods: "We developed a convolutional neural network trained on 10,000 EEG samples from neonates...",
      results: "The algorithm achieved 94% accuracy in detecting seizure activity compared to expert review...",
      conclusions: "This tool could significantly improve access to EEG interpretation in resource-limited settings...",
      conflictOfInterest: "Patent pending for the algorithm",
      status: "Revision Required",
      submittedDate: "2025-03-10",
      lastUpdated: "2025-03-25",
      abstractFileUrl: "/abstracts/3.pdf",
      reviewerComments: "Please provide more details on the training dataset and validation methods.",
      assignedReviewer: "Dr. James Ochieng",
      rating: 3.8
    },
    {
      id: 4,
      title: "Impact of Maternal Nutrition on Neurodevelopmental Outcomes in Nigerian Infants",
      authors: [
        {
          firstName: "Ngozi",
          lastName: "Eze",
          email: "n.eze@hospital.org",
          institution: "University of Nigeria Teaching Hospital",
          country: "Nigeria",
          isPresenter: true,
          isCorresponding: true
        }
      ],
      category: "Basic Science & Translational Research",
      presentationPreference: "No Preference",
      keywords: ["maternal nutrition", "neurodevelopment", "infants", "Nigeria"],
      background: "Maternal malnutrition remains prevalent in sub-Saharan Africa with potential impacts on neurodevelopment...",
      methods: "Prospective cohort study of 1,200 mother-infant pairs assessing nutritional status and developmental outcomes...",
      results: "Significant correlations found between maternal micronutrient levels and infant cognitive scores at 12 months...",
      conclusions: "Nutritional interventions during pregnancy may improve neurodevelopmental outcomes...",
      conflictOfInterest: "None declared",
      status: "Rejected",
      submittedDate: "2025-01-20",
      lastUpdated: "2025-02-15",
      abstractFileUrl: "/abstracts/4.pdf",
      reviewerComments: "Study design lacks adequate control for confounding socioeconomic factors.",
      assignedReviewer: "Dr. Fatima Bello",
      rating: 2.5
    }
  ]);

  const getStatusColor = (status: AbstractStatus) => {
    switch (status) {
      case 'Accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Under Review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Revision Required':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: AbstractStatus) => {
    switch (status) {
      case 'Accepted':
        return <CheckCircle className="w-4 h-4" />;
      case 'Under Review':
        return <Clock className="w-4 h-4" />;
      case 'Revision Required':
        return <AlertCircle className="w-4 h-4" />;
      case 'Rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const handleStatusChange = (abstractId: number, newStatus: AbstractStatus) => {
    setAllAbstracts(prev => 
      prev.map(abstract => 
        abstract.id === abstractId 
          ? { 
              ...abstract, 
              status: newStatus,
              lastUpdated: new Date().toISOString().split('T')[0] 
            } 
          : abstract
      )
    );
  };

  const handleReviewAbstract = (abstract: Abstract) => {
    setCurrentAbstract(abstract);
    setReviewerComments(abstract.reviewerComments || '');
    setShowReviewModal(true);
  };

  const handleSubmitReview = () => {
    if (!currentAbstract) return;

    setAllAbstracts(prev => 
      prev.map(abstract => 
        abstract.id === currentAbstract.id
          ? { 
              ...abstract, 
              reviewerComments,
              lastUpdated: new Date().toISOString().split('T')[0] 
            }
          : abstract
      )
    );
    setShowReviewModal(false);
  };

  const toggleFeatured = (abstractId: number) => {
    setAllAbstracts(prev => 
      prev.map(abstract => 
        abstract.id === abstractId 
          ? { ...abstract, isFeatured: !abstract.isFeatured }
          : abstract
      )
    );
  };

  const toggleExpand = (abstractId: number) => {
    setExpandedAbstract(expandedAbstract === abstractId ? null : abstractId);
  };

  const filteredAbstracts = allAbstracts.filter(abstract => {
    // Filter by selected tab
    const statusMatch = 
      selectedTab === 'all' ||
      (selectedTab === 'review' && abstract.status === 'Under Review') ||
      (selectedTab === 'accepted' && abstract.status === 'Accepted') ||
      (selectedTab === 'revision' && abstract.status === 'Revision Required') ||
      (selectedTab === 'rejected' && abstract.status === 'Rejected');
    
    // Filter by search term
    const searchMatch = 
      abstract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      abstract.authors.some(author => 
        `${author.firstName} ${author.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      abstract.keywords.some(keyword => 
        keyword.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    return statusMatch && searchMatch;
  });

  const stats = {
    total: allAbstracts.length,
    underReview: allAbstracts.filter(a => a.status === 'Under Review').length,
    accepted: allAbstracts.filter(a => a.status === 'Accepted').length,
    revisionRequired: allAbstracts.filter(a => a.status === 'Revision Required').length,
    rejected: allAbstracts.filter(a => a.status === 'Rejected').length,
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white border border-gray-300 rounded-lg">
        <div className="bg-blue-50 px-6 py-4 border-b border-gray-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <FileText className="w-7 h-7 mr-3 text-blue-600" />
                Abstract Submissions
              </h2>
              <p className="text-gray-600 mt-1">Manage and review submitted abstracts for the conference</p>
            </div>
            <div className="flex gap-3">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center font-medium transition-colors">
                <Download className="w-5 h-5 mr-2" />
                Export All
              </button>
              <button className="border border-blue-600 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 flex items-center font-medium transition-colors">
                <BarChart3 className="w-5 h-5 mr-2" />
                Analytics
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <nav className="flex space-x-8">
              {[
                { id: 'all', label: 'All Abstracts', count: stats.total },
                { id: 'review', label: 'Under Review', count: stats.underReview },
                { id: 'accepted', label: 'Accepted', count: stats.accepted },
                { id: 'revision', label: 'Revision Required', count: stats.revisionRequired },
                { id: 'rejected', label: 'Rejected', count: stats.rejected }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`py-2 border-b-2 font-medium text-sm transition-colors ${
                    selectedTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
            <div className="mt-3 md:mt-0 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search abstracts..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          <div className="space-y-6">
            {filteredAbstracts.length > 0 ? (
              filteredAbstracts.map((abstract) => (
                <div key={abstract.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          {abstract.isFeatured && (
                            <Star className="w-5 h-5 text-yellow-500 fill-current mt-1 flex-shrink-0" />
                          )}
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                              {abstract.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-3">
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                {abstract.category}
                              </span>
                              <span className="flex items-center">
                                <Users className="w-4 h-4 mr-1" />
                                {abstract.authors.length} author{abstract.authors.length > 1 ? 's' : ''}
                              </span>
                              <span className="flex items-center">
                                <Award className="w-4 h-4 mr-1" />
                                {abstract.presentationPreference}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(abstract.status)} flex items-center`}>
                              {getStatusIcon(abstract.status)}
                              <span className="ml-1">{abstract.status}</span>
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium">Submitted:</span> {abstract.submittedDate}
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium">Last Updated:</span> {abstract.lastUpdated}
                          </div>
                          {abstract.rating && (
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-400 mr-1 fill-current" />
                              <span className="font-medium">{abstract.rating}/5</span>
                            </div>
                          )}
                        </div>

                        {/* Keywords */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {abstract.keywords.map((keyword, index) => (
                            <span key={index} className="bg-gray-100 text-gray-800 px-2 py-1 text-xs rounded">
                              {keyword}
                            </span>
                          ))}
                        </div>

                        {/* Presenting Author */}
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-1">Presenting Author:</p>
                          {abstract.authors.filter(a => a.isPresenter).map((author, index) => (
                            <div key={index} className="text-sm">
                              <span className="font-medium text-gray-900">{author.firstName} {author.lastName}</span>
                              <span className="text-gray-600 ml-2">{author.institution}, {author.country}</span>
                              <span className="text-blue-600 ml-2">{author.email}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Expandable Content */}
                    {expandedAbstract === abstract.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                        {/* Authors */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">All Authors:</h4>
                          <div className="space-y-2">
                            {abstract.authors.map((author, index) => (
                              <div key={index} className="text-sm">
                                <span className="font-medium text-gray-900">{author.firstName} {author.lastName}</span>
                                {author.isCorresponding && (
                                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                    Corresponding
                                  </span>
                                )}
                                <div className="text-gray-600">{author.institution}, {author.country}</div>
                                <div className="text-blue-600">{author.email}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Abstract Content */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Background/Objectives</h4>
                            <p className="text-gray-600 text-sm whitespace-pre-line">{abstract.background}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Methods</h4>
                            <p className="text-gray-600 text-sm whitespace-pre-line">{abstract.methods}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Results</h4>
                            <p className="text-gray-600 text-sm whitespace-pre-line">{abstract.results}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Conclusions</h4>
                            <p className="text-gray-600 text-sm whitespace-pre-line">{abstract.conclusions}</p>
                          </div>
                        </div>

                        {/* Conflict of Interest */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Conflict of Interest</h4>
                          <p className="text-gray-600 text-sm">{abstract.conflictOfInterest}</p>
                        </div>

                        {/* Reviewer Comments */}
                        {abstract.reviewerComments && (
                          <div className="bg-yellow-50 p-4 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-2">Reviewer Comments</h4>
                            <p className="text-gray-600 text-sm whitespace-pre-line">{abstract.reviewerComments}</p>
                            {abstract.assignedReviewer && (
                              <p className="text-sm text-gray-500 mt-2">- {abstract.assignedReviewer}</p>
                            )}
                          </div>
                        )}

                        {/* Files */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Files:</h4>
                          <div className="flex flex-wrap gap-3">
                            {abstract.abstractFileUrl && (
                              <a 
                                href={abstract.abstractFileUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                              >
                                <FileText className="w-4 h-4 mr-1" />
                                Abstract Document
                              </a>
                            )}
                            {abstract.ethicalApprovalUrl && (
                              <a 
                                href={abstract.ethicalApprovalUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                              >
                                <FileText className="w-4 h-4 mr-1" />
                                Ethical Approval
                              </a>
                            )}
                            {abstract.supplementaryFilesUrl && (
                              <a 
                                href={abstract.supplementaryFilesUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                              >
                                <FileText className="w-4 h-4 mr-1" />
                                Supplementary Materials
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Admin Actions */}
                    <div className="flex flex-wrap gap-3 mt-4">
                      <button 
                        onClick={() => toggleExpand(abstract.id)}
                        className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center text-sm font-medium transition-colors"
                      >
                        {expandedAbstract === abstract.id ? (
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

                      <button 
                        onClick={() => handleReviewAbstract(abstract)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center text-sm font-medium transition-colors"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Review Abstract
                      </button>

                      <button 
                        onClick={() => toggleFeatured(abstract.id)}
                        className={`border px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-colors ${
                          abstract.isFeatured 
                            ? 'border-yellow-300 bg-yellow-50 text-yellow-800 hover:bg-yellow-100' 
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <Star className={`w-4 h-4 mr-2 ${abstract.isFeatured ? 'fill-current' : ''}`} />
                        {abstract.isFeatured ? 'Unfeature' : 'Feature'}
                      </button>

                      <div className="relative">
                        <select
                          value={abstract.status}
                          onChange={(e) => handleStatusChange(abstract.id, e.target.value as AbstractStatus)}
                          className="border border-gray-300 px-3 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="Under Review">Under Review</option>
                          <option value="Accepted">Accept</option>
                          <option value="Revision Required">Request Revision</option>
                          <option value="Rejected">Reject</option>
                        </select>
                      </div>

                      <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center text-sm font-medium transition-colors">
                        <Mail className="w-4 h-4 mr-2" />
                        Contact Author
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No abstracts found</h3>
                <p className="text-gray-500">
                  {searchTerm 
                    ? "No abstracts match your search criteria." 
                    : "No abstracts have been submitted yet."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && currentAbstract && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Review Abstract #{currentAbstract.id}</h3>
                <button 
                  onClick={() => setShowReviewModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">{currentAbstract.title}</h4>
                  <p className="text-sm text-gray-600">
                    Submitted by: {currentAbstract.authors.find(a => a.isPresenter)?.firstName}{' '}
                    {currentAbstract.authors.find(a => a.isPresenter)?.lastName}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reviewer Comments</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={6}
                    value={reviewerComments}
                    onChange={(e) => setReviewerComments(e.target.value)}
                    placeholder="Provide detailed feedback for the author..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rating (1-5)</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={currentAbstract.rating || 3}
                      onChange={(e) => setCurrentAbstract({
                        ...currentAbstract,
                        rating: Number(e.target.value)
                      })}
                    >
                      {[1, 2, 3, 4, 5].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={currentAbstract.status}
                      onChange={(e) => setCurrentAbstract({
                        ...currentAbstract,
                        status: e.target.value as AbstractStatus
                      })}
                    >
                      <option value="Under Review">Under Review</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Revision Required">Revision Required</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReview}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AbstractsTab;