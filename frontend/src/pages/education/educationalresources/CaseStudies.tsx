import React, { useState, useEffect } from "react";
import { Users, Eye, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import VideoCaseStudies from "./VideoCaseStudies";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import { educationalResourcesApi, CaseStudySubmission } from "../../../services/educationalResourcesApi";

interface CaseStudiesProps {
  selectedCategory: string;
  searchTerm: string;
}

const CaseStudies: React.FC<CaseStudiesProps> = ({ selectedCategory, searchTerm }) => {
  const navigate = useNavigate();
  const [caseStudies, setCaseStudies] = useState<CaseStudySubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCaseStudies, setVisibleCaseStudies] = useState(6);

  useEffect(() => {
    const fetchCaseStudies = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch case studies with either 'Approved' or 'Published' status
        const [approvedStudies, publishedStudies] = await Promise.all([
          educationalResourcesApi.getSubmissions({ status: 'Approved' }).catch(() => []),
          educationalResourcesApi.getSubmissions({ status: 'Published' }).catch(() => [])
        ]);
        
        // Combine and deduplicate the results
        const allStudies = [...approvedStudies, ...publishedStudies];
        const uniqueStudies = allStudies.filter((study, index, self) => 
          index === self.findIndex(s => s.id === study.id)
        );
        
        setCaseStudies(uniqueStudies);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load case studies"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCaseStudies();
  }, []);

  const filteredCaseStudies = caseStudies.filter((study) => {
    const matchesCategory =
      selectedCategory === "all" || study.category === selectedCategory;
    const matchesSearch =
      study.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      study.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const displayedCaseStudies = filteredCaseStudies.slice(0, visibleCaseStudies);
  const hasMoreCaseStudies = visibleCaseStudies < filteredCaseStudies.length;

  const loadMoreCaseStudies = () => {
    setVisibleCaseStudies((prev) => prev + 6);
  };

  const handleCaseStudyClick = (caseStudyId: number) => {
    navigate(`/case-studies/${caseStudyId}`);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  const getReadTime = (content?: string) => {
    if (!content) return '5 min read';
    const wordCount = content.split(' ').length;
    const readTime = Math.ceil(wordCount / 200); 
    return `${readTime} min read`;
  };

  const parseFullContent = (fullContent?: string) => {
    if (!fullContent) return null;
    try {
      return JSON.parse(fullContent);
    } catch {
      return null;
    }
  };

  const getFirstImage = (attachments: string[]): string | null => {
    if (!attachments || attachments.length === 0) return null;
    
    // Filter for image files (common image extensions)
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    const imageAttachment = attachments.find(attachment => 
      imageExtensions.some(ext => attachment.toLowerCase().endsWith(ext))
    );
    
    return imageAttachment || null;
  };

  // Error Card Component
  const ErrorCard = ({
    message,
    onRetry,
  }: {
    message: string;
    onRetry: () => void;
  }) => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center max-w-md mx-auto">
      <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-red-800 mb-2">
        Error Loading Case Studies
      </h3>
      <p className="text-red-600 mb-6">{message}</p>
      <button
        onClick={onRetry}
        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md font-medium transition-colors duration-300"
      >
        Try Again
      </button>
    </div>
  );

  // No Content Card Component
  const NoContentCard = () => (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center max-w-md mx-auto">
      <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No Case Studies Found
      </h3>
      <p className="text-gray-600 mb-4">
        Try adjusting your search or filter criteria.
      </p>
    </div>
  );

  return (
    <div>
      {/* All Case Studies Section */}
      <div>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
            {selectedCategory === "all" && !searchTerm
              ? "All Case Studies"
              : "Case Studies"}
          </h2>
          <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Real-world examples of successful interventions, innovative
            approaches, and transformative outcomes in pediatric
            neurology across African healthcare systems.
          </p>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorCard
            message={error}
            onRetry={() => window.location.reload()}
          />
        ) : displayedCaseStudies.length > 0 ? (
          <div className="space-y-8">
            {displayedCaseStudies.map((study) => {
              const firstImage = getFirstImage(study.attachments) || study.imageUrl;
              const parsedContent = parseFullContent(study.fullContent);
              const hasImage = !!firstImage;

              return (
                <div
                  key={study.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                >
                  <div className={`flex flex-col ${hasImage ? 'md:flex-row' : ''}`}>
                    {/* Image Section - Only render if image exists */}
                    {hasImage && (
                      <div className="relative md:w-80 h-48 md:h-auto flex-shrink-0">
                        <img
                          src={firstImage}
                          alt={study.title}
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => handleCaseStudyClick(study.id)}
                          onError={(e) => {
                            // Hide the image container if the image fails to load
                            const imgElement = e.target as HTMLImageElement;
                            const container = imgElement.closest('.relative') as HTMLElement;
                            if (container) {
                              container.style.display = 'none';
                            }
                          }}
                        />
                        <div className="absolute top-3 left-3">
                          <span className="bg-red-600 text-white px-2 py-1 text-xs font-bold uppercase tracking-wide rounded">
                            {study.category}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Content Section */}
                    <div className="flex-1 p-6">
                      {/* Category badge for cases without images */}
                      {!hasImage && (
                        <div className="mb-3">
                          <span className="bg-red-600 text-white px-2 py-1 text-xs font-bold uppercase tracking-wide rounded">
                            {study.category}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <span>{study.location}</span>
                        <span className="mx-2">•</span>
                        <span>{formatDate(study.publishedDate || study.submissionDate)}</span>
                        <span className="mx-2">•</span>
                        <span>{getReadTime(study.fullContent)}</span>
                      </div>

                      <h3 
                        className="text-xl font-bold text-gray-900 mb-3 leading-tight hover:text-red-600 transition-colors cursor-pointer"
                        onClick={() => handleCaseStudyClick(study.id)}
                      >
                        {study.title}
                      </h3>

                      <p className="text-gray-600 mb-4 leading-relaxed">
                        {study.excerpt}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm">
                          <Eye className="w-4 h-4 text-red-600 mr-1" />
                          <span className="text-red-600 font-medium">
                            {study.impact ? `Impact: ${study.impact}` : 'Impact: Documented'}
                          </span>
                        </div>
                        <button 
                          onClick={() => handleCaseStudyClick(study.id)}
                          className="text-red-600 font-medium hover:text-red-700 text-sm transition-colors duration-200"
                        >
                          Read Case Study →
                        </button>
                      </div>

                      {/* Additional metadata for cases with parsed content */}
                      {parsedContent && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            {parsedContent.patient_demographics && (
                              <div>
                                <span className="font-medium">Demographics:</span>
                                <p>{parsedContent.patient_demographics.age_group}, {parsedContent.patient_demographics.gender}</p>
                              </div>
                            )}
                            {study.submittedBy && (
                              <div>
                                <span className="font-medium">Submitted by:</span>
                                <p>{study.submittedBy}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Load More Button */}
            {hasMoreCaseStudies && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMoreCaseStudies}
                  className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Load More Case Studies
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  Showing {displayedCaseStudies.length} of{" "}
                  {filteredCaseStudies.length} case studies
                </p>
              </div>
            )}

            {/* Video Case Studies Section - Always render as independent section */}
            <VideoCaseStudies />
          </div>
        ) : (
          <>
            <NoContentCard />
            {/* Video Case Studies Section - Render even when no regular case studies found */}
            <div className="mt-16">
              <VideoCaseStudies />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CaseStudies;