import React, { useState, useEffect } from "react";
import { ArrowRight, Download, ExternalLink } from "lucide-react";
import { researchPapersApi, ResearchPaper } from "../../../services/researchprojectsApi";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import ActiveResearchProjects from "./ActiveResearchProjectsComponent";
import PublicationsResources from "./PublicationsResourcesComponent";

const ResearchPapersPage = () => {
  const [researchPapers, setResearchPapers] = useState<ResearchPaper[]>([]);
  const [isLoadingPapers, setIsLoadingPapers] = useState(true);
  const [papersError, setPapersError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResearchPapers = async () => {
      try {
        setIsLoadingPapers(true);
        setPapersError(null);
        const data = await researchPapersApi.getAll({ 
          status: "Accepted" 
        });
        setResearchPapers(data.slice(0, 6)); // Show only first 6 papers
      } catch (err) {
        setPapersError("Failed to load research papers");
        console.error("Error fetching research papers:", err);
      } finally {
        setIsLoadingPapers(false);
      }
    };

    fetchResearchPapers();
  }, []);

  const handleResearchPaperClick = (paperId: number) => {
    window.location.href = `/research-papers/${paperId}`;
  };

  const formatAuthors = (authors: any[]) => {
    if (!Array.isArray(authors) || authors.length === 0) {
      return "Authors not available";
    }
    
    const authorNames = authors.map(author => 
      typeof author === 'string' ? author : author.name || 'Unknown Author'
    );
    
    if (authorNames.length <= 3) {
      return authorNames.join(", ");
    }
    
    return `${authorNames.slice(0, 3).join(", ")} et al.`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Date not available";
    
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

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-6">
            Research Papers & Publications
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 font-light max-w-3xl mx-auto">
            Explore cutting-edge research, active studies, and comprehensive
            publications advancing pediatric neurology across Africa.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          {/* Recent Research Papers Section - First */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
                Recent Research Papers
              </h2>
              <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Latest peer-reviewed research papers and studies published by
                ACNA members and collaborating institutions.
              </p>
            </div>

            {isLoadingPapers ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : papersError ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg mb-12">
                <p className="text-red-600 mb-4">{papersError}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md font-medium transition-colors duration-300"
                >
                  Try Again
                </button>
              </div>
            ) : researchPapers.length > 0 ? (
              <>
                <div className="space-y-8 mb-12">
                  {researchPapers.map((paper) => (
                    <div
                      key={paper.id}
                      className="border-l-4 border-red-600 pl-6 hover:bg-gray-50 transition-colors duration-200 py-6 border-b border-gray-100 last:border-b-0 cursor-pointer"
                      onClick={() => handleResearchPaperClick(paper.id)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-bold text-gray-900 leading-tight max-w-4xl hover:text-red-600 transition-colors">
                          {paper.title}
                        </h3>
                        <div className="flex gap-2 ml-4">
                          {paper.manuscriptUrl && (
                            <button
                              className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                              title="Download PDF"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(paper.manuscriptUrl, '_blank');
                              }}
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                            title="View Details"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResearchPaperClick(paper.id);
                            }}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Authors:</span>{" "}
                        {formatAuthors(paper.authors)}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Category:</span>{" "}
                        {paper.category} | {formatDate(paper.submissionDate)}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Research Type:</span>{" "}
                        {paper.researchType}
                      </div>
                      {paper.targetJournal && (
                        <div className="text-sm text-gray-600 mb-3">
                          <span className="font-medium">Target Journal:</span>{" "}
                          {paper.targetJournal}
                        </div>
                      )}
                      <p className="text-gray-700 leading-relaxed text-sm mb-3">
                        {paper.abstract.length > 300 
                          ? `${paper.abstract.substring(0, 300)}...` 
                          : paper.abstract}
                      </p>
                      {paper.keywords && paper.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {paper.keywords.slice(0, 5).map((keyword, index) => (
                            <span
                              key={index}
                              className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-red-600 text-sm font-medium inline-flex items-center hover:text-red-700">
                          READ FULL PAPER <ArrowRight className="ml-1 w-3 h-3" />
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          paper.status === 'Published' ? 'bg-green-100 text-green-800' :
                          paper.status === 'Under Review' ? 'bg-yellow-100 text-yellow-800' :
                          paper.status === 'Accepted' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {paper.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  <button 
                    onClick={() => window.location.href = '/research-papers'}
                    className="border-2 border-orange-600 text-orange-600 px-6 py-2 sm:px-8 sm:py-3 font-medium hover:bg-orange-600 hover:text-white transition-all duration-300 uppercase tracking-wide rounded text-sm sm:text-base"
                  >
                    View All Research Papers
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg mb-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Research Papers Available
                </h3>
                <p className="text-gray-600">
                  No research papers are available at this time. Please check back later.
                </p>
              </div>
            )}
          </div>

          {/* Active Research Projects Component */}
          <ActiveResearchProjects />

          {/* Publications & Resources Component */}
          <PublicationsResources />
        </div>
      </section>
    </div>
  );
};

export default ResearchPapersPage;