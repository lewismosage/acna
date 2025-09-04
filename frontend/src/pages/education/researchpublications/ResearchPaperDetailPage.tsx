import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  ChevronLeft,
  FileText,
  User,
  Globe,
  BookOpen,
  Quote,
  Award,
  Building,
  Mail,
  Tag,
  ArrowRight,
  Download,
  ExternalLink
} from 'lucide-react';
import { 
  researchPapersApi, 
  ResearchPaper,
  Author 
} from '../../../services/researchprojectsApi';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

const ResearchPaperDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('abstract');
  const [paper, setPaper] = useState<ResearchPaper | null>(null);
  const [relatedPapers, setRelatedPapers] = useState<ResearchPaper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchPaper = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const paperId = parseInt(id, 10);
        const paperData = await researchPapersApi.getById(paperId);
        setPaper(paperData);
        
        // Fetch related papers (same category, different paper)
        const relatedData = await researchPapersApi.getAll({ 
          category: paperData.category 
        });
        setRelatedPapers(relatedData.filter(p => p.id !== paperId).slice(0, 3));
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load research paper');
        console.error('Error fetching research paper:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaper();
  }, [id]);

  const formatAuthors = (authors: Author[]) => {
    if (!Array.isArray(authors) || authors.length === 0) {
      return 'Authors not available';
    }
    
    if (authors.length <= 3) {
      return authors.map(author => author.name).join(', ');
    }
    return `${authors.slice(0, 3).map(author => author.name).join(', ')}, et al.`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Date not available';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (err) {
      return dateString;
    }
  };

  const getCorrespondingAuthor = (authors: Author[]) => {
    return authors.find(author => author.isCorresponding) || authors[0];
  };

  const handleBack = () => {
    navigate('/research-papers-and-publications');
  };

  const handleRelatedPaperClick = (paperId: number) => {
    navigate(`/research-papers/${paperId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Published':
        return 'bg-green-100 text-green-800';
      case 'Accepted':
        return 'bg-blue-100 text-blue-800';
      case 'Under Review':
        return 'bg-yellow-100 text-yellow-800';
      case 'Revision Required':
        return 'bg-orange-100 text-orange-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !paper) {
    return (
      <div className="bg-white min-h-screen">
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <button 
              onClick={handleBack}
              className="flex items-center text-red-600 hover:text-red-700 font-medium"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Research Papers
            </button>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {error ? 'Error Loading Paper' : 'Paper Not Found'}
          </h2>
          <p className="text-gray-600 mb-6">
            {error || 'The research paper you\'re looking for could not be found.'}
          </p>
          <button
            onClick={handleBack}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
          >
            Back to Research Papers
          </button>
        </div>
      </div>
    );
  }

  const correspondingAuthor = getCorrespondingAuthor(paper.authors);

  return (
    <div className="bg-white min-h-screen">
      {/* Back Navigation */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button 
            onClick={handleBack}
            className="flex items-center text-red-600 hover:text-red-700 font-medium"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Research Papers
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="mb-6 flex items-center justify-center gap-4">
            <span className="text-red-600 font-medium text-sm uppercase tracking-wide">
              {paper.researchType}
            </span>
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(paper.status)}`}>
              {paper.status}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-6 leading-tight">
            {paper.title}
          </h1>

          <div className="flex flex-wrap justify-center items-center gap-6 text-gray-600 mb-6">
            <div className="flex items-center">
              <User className="w-5 h-5 mr-2 text-red-600" />
              <span className="font-medium">{formatAuthors(paper.authors)}</span>
            </div>
            {paper.targetJournal && (
              <div className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-red-600" />
                <span className="font-medium">{paper.targetJournal}</span>
              </div>
            )}
            <div className="flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-red-600" />
              <span className="font-medium">{formatDate(paper.submissionDate)}</span>
            </div>
          </div>

          {paper.manuscriptUrl && (
            <div className="flex justify-center gap-4">
              <button
                onClick={() => window.open(paper.manuscriptUrl, '_blank')}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md font-medium flex items-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Manuscript
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4">
          <nav className="flex space-x-8">
            {[
              { key: 'abstract', label: 'Abstract' },
              { key: 'authors', label: 'Authors & Details' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.key
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </section>

      {/* Tab Content */}
      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4">
          {activeTab === 'abstract' && (
            <div className="space-y-8">
              {/* Abstract */}
              <div>
                <h2 className="text-2xl font-light text-gray-900 mb-6 flex items-center">
                  <Quote className="w-6 h-6 mr-2 text-red-600" />
                  Abstract
                </h2>
                <div className="prose max-w-none">
                  <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-red-600">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {paper.abstract}
                    </p>
                  </div>
                </div>
              </div>

              {/* Keywords */}
              {paper.keywords && paper.keywords.length > 0 && (
                <div>
                  <h3 className="text-xl font-light text-gray-900 mb-4">Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {paper.keywords.map((keyword, index) => (
                      <span key={index} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        <Tag className="w-3 h-3" />
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Research Details */}
              <div>
                <h3 className="text-xl font-light text-gray-900 mb-4">Research Details</h3>
                <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-600 space-y-3">
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-900">Category:</span>{' '}
                      <span className="text-gray-700">{paper.category}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Research Type:</span>{' '}
                      <span className="text-gray-700">{paper.researchType}</span>
                    </div>
                    {paper.studyDesign && (
                      <div>
                        <span className="font-medium text-gray-900">Study Design:</span>{' '}
                        <span className="text-gray-700">{paper.studyDesign}</span>
                      </div>
                    )}
                    {paper.participants && (
                      <div>
                        <span className="font-medium text-gray-900">Participants:</span>{' '}
                        <span className="text-gray-700">{paper.participants}</span>
                      </div>
                    )}
                    <div>
                      <span className="font-medium text-gray-900">Ethics Approval:</span>{' '}
                      <span className={`text-sm px-2 py-1 rounded ${
                        paper.ethicsApproval ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {paper.ethicsApproval ? 'Approved' : 'Not Approved'}
                      </span>
                    </div>
                    {paper.ethicsNumber && (
                      <div>
                        <span className="font-medium text-gray-900">Ethics Number:</span>{' '}
                        <span className="text-gray-700">{paper.ethicsNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Funding Information */}
              {paper.fundingSource && (
                <div>
                  <h3 className="text-xl font-light text-gray-900 mb-4">Funding</h3>
                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-600">
                    <p className="text-gray-700 text-sm">{paper.fundingSource}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'authors' && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-4">
                  Authors & Details
                </h2>
                <p className="text-gray-600">
                  Meet the researchers who contributed to this study
                </p>
              </div>

              {/* Corresponding Author */}
              {correspondingAuthor && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Mail className="w-5 h-5 mr-2 text-red-600" />
                    Corresponding Author
                  </h3>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">{correspondingAuthor.name}</h4>
                      <p className="text-gray-600 text-sm mb-1">{correspondingAuthor.affiliation}</p>
                      <a 
                        href={`mailto:${correspondingAuthor.email}`}
                        className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1"
                      >
                        <Mail className="w-4 h-4" />
                        {correspondingAuthor.email}
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* All Authors */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">All Authors</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paper.authors.map((author, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900 truncate">{author.name}</h4>
                            {author.isCorresponding && (
                              <span className="bg-red-100 text-red-800 px-2 py-0.5 text-xs font-medium rounded">
                                Corresponding
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{author.affiliation}</p>
                          <a 
                            href={`mailto:${author.email}`}
                            className="text-sm text-red-600 hover:text-red-700"
                          >
                            {author.email}
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Information */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Conflict of Interest */}
                {paper.conflictOfInterest && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Conflict of Interest</h3>
                    <p className="text-gray-700 text-sm">{paper.conflictOfInterest}</p>
                  </div>
                )}

                {/* Acknowledgments */}
                {paper.acknowledgments && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Acknowledgments</h3>
                    <p className="text-gray-700 text-sm">{paper.acknowledgments}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Related Papers Section */}
      {relatedPapers.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-4">
                Related Research Papers
              </h2>
              <p className="text-gray-600">
                Other studies in {paper.category.toLowerCase()} that might interest you
              </p>
            </div>

            <div className="space-y-6">
              {relatedPapers.map((relatedPaper) => (
                <div 
                  key={relatedPaper.id} 
                  className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                  onClick={() => handleRelatedPaperClick(relatedPaper.id)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 leading-tight max-w-3xl hover:text-red-600 transition-colors">
                      {relatedPaper.title}
                    </h3>
                    <div className="flex items-center gap-2 ml-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(relatedPaper.status)}`}>
                        {relatedPaper.status}
                      </span>
                      <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Authors:</span> {formatAuthors(relatedPaper.authors)}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Category:</span> {relatedPaper.category} | 
                    <span className="font-medium ml-2">Submitted:</span> {formatDate(relatedPaper.submissionDate)}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <button 
                onClick={() => navigate('/research-papers')}
                className="border-2 border-orange-600 text-orange-600 px-6 py-3 font-medium hover:bg-orange-600 hover:text-white transition-all duration-300 uppercase tracking-wide rounded"
              >
                View All Research Papers
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default ResearchPaperDetailPage;