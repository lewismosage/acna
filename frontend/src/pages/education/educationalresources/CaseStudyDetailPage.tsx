import { useState, useEffect } from "react";
import {
  Calendar,
  ChevronLeft,
  AlertCircle,
  FileText,
  User,
  MapPin,
  CheckCircle,
  Printer,
  Share2,
  Building,
  Download,
  Activity,
  Image as ImageIcon,
  File,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { CaseStudySubmission, educationalResourcesApi } from "../../../services/educationalResourcesApi";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import ScrollToTop from "../../../components/common/ScrollToTop";

// Extend the CaseStudySubmission interface to include attachmentUrls
interface ExtendedCaseStudySubmission extends CaseStudySubmission {
  attachmentUrls?: string[];
}

const CaseStudyDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "overview" | "clinical" | "outcome" | "attachments"
  >("overview");
  const [caseStudy, setCaseStudy] = useState<ExtendedCaseStudySubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCaseStudy = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const caseStudyData = await educationalResourcesApi.getSubmissionById(parseInt(id));
        setCaseStudy(caseStudyData as ExtendedCaseStudySubmission);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load case study"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCaseStudy();
  }, [id]);

  const parseFullContent = (fullContent?: string) => {
    if (!fullContent) return null;
    try {
      return JSON.parse(fullContent);
    } catch {
      return null;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Published":
        return "bg-green-600";
      case "Approved":
        return "bg-blue-600";
      case "Under Review":
        return "bg-yellow-600";
      case "Pending Review":
        return "bg-orange-600";
      case "Rejected":
        return "bg-red-600";
      default:
        return "bg-gray-600";
    }
  };

  const isImageFile = (url: string): boolean => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    return imageExtensions.some(ext => url.toLowerCase().includes(ext));
  };

  const getFileType = (url: string): string => {
    const lowerUrl = url.toLowerCase();
    if (isImageFile(url)) {
      return 'image';
    } else if (lowerUrl.includes('.pdf')) {
      return 'pdf';
    } else if (lowerUrl.includes('.doc') || lowerUrl.includes('.docx')) {
      return 'word';
    } else if (lowerUrl.includes('.xls') || lowerUrl.includes('.xlsx')) {
      return 'excel';
    } else {
      return 'file';
    }
  };

  const getFileIcon = (url: string) => {
    const fileType = getFileType(url);
    switch (fileType) {
      case 'image':
        return <ImageIcon className="w-5 h-5 text-blue-600" />;
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-600" />;
      case 'word':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'excel':
        return <FileText className="w-5 h-5 text-green-600" />;
      default:
        return <File className="w-5 h-5 text-gray-600" />;
    }
  };

  const getFileName = (url: string): string => {
    try {
      // Extract filename from URL
      const urlParts = url.split('/');
      const filename = urlParts[urlParts.length - 1];
      
      // Decode URL encoding and clean up
      return decodeURIComponent(filename).replace(/_[a-f0-9]{8}(\.[^.]+)?$/i, '$1');
    } catch {
      return 'Unknown file';
    }
  };

  const downloadFile = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('File not found');
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: try to open in new tab
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !caseStudy) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Case Study Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            {error || "The case study you're looking for doesn't exist."}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-red-600 hover:text-red-700 font-medium"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Case Studies
          </button>
        </div>
      </div>
    );
  }

  const parsedContent = parseFullContent(caseStudy.fullContent);
  
  // Use the new attachmentUrls property if available, otherwise fall back to constructing URLs
  const attachmentUrls = caseStudy.attachmentUrls && caseStudy.attachmentUrls.length > 0 
    ? caseStudy.attachmentUrls 
    : (caseStudy.attachments || []).map(attachment => educationalResourcesApi.getFileUrl(attachment));

  const imageAttachments = attachmentUrls.filter(url => isImageFile(url));
  const documentAttachments = attachmentUrls.filter(url => !isImageFile(url));

  // Get the first image for hero section
  const firstImage = caseStudy.imageUrl || (imageAttachments.length > 0 ? imageAttachments[0] : null);

  return (
    <div className="bg-white min-h-screen">
      <ScrollToTop />

      {/* Back Navigation */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-red-600 hover:text-red-700 font-medium"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Case Studies
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Case Study Image */}
            {firstImage && (
              <div className="lg:w-2/5">
                <div className="relative">
                  <img
                    src={educationalResourcesApi.getFileUrl(firstImage)}
                    alt={caseStudy.title}
                    className="w-full h-64 lg:h-80 object-cover rounded-lg shadow-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-red-600 text-white px-3 py-1 text-sm font-bold uppercase tracking-wide rounded">
                      {caseStudy.category}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className={`text-white px-3 py-1 text-sm font-bold rounded ${getStatusColor(caseStudy.status)}`}>
                      {caseStudy.status}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Case Study Details */}
            <div className={firstImage ? "lg:w-3/5" : "w-full"}>
              <div className="mb-4">
                <span className="text-red-600 font-medium text-sm uppercase tracking-wide">
                  Case Study
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                {caseStudy.title}
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-5 h-5 mr-3 text-red-600" />
                    <div>
                      <div className="font-medium">
                        {formatDate(caseStudy.publishedDate || caseStudy.submissionDate)}
                      </div>
                      <div className="text-sm">
                        {caseStudy.publishedDate ? 'Published' : 'Submitted'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <User className="w-5 h-5 mr-3 text-red-600" />
                    <span>By: {caseStudy.submittedBy}</span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-5 h-5 mr-3 text-red-600" />
                    <span>{caseStudy.location}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Building className="w-5 h-5 mr-3 text-red-600" />
                    <span>{caseStudy.institution}</span>
                  </div>

                  {caseStudy.impact && (
                    <div className="flex items-center text-gray-600">
                      <Activity className="w-5 h-5 mr-3 text-red-600" />
                      <span>Impact: {caseStudy.impact}</span>
                    </div>
                  )}

                  {caseStudy.reviewedBy && (
                    <div className="flex items-center text-gray-600">
                      <CheckCircle className="w-5 h-5 mr-3 text-green-600" />
                      <span>Reviewed by: {caseStudy.reviewedBy}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex gap-2">
                  <button className="border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </button>
                  <button className="border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                  </button>
                  {caseStudy.attachments && caseStudy.attachments.length > 0 && (
                    <button 
                      onClick={() => setActiveTab('attachments')}
                      className="border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Attachments
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
        <nav className="flex space-x-8">
          {[
            { key: "overview", label: "Overview", count: 0 },
            { key: "clinical", label: "Clinical Details", count: 0 },
            { key: "outcome", label: "Outcome & Impact", count: 0 },
            { key: "attachments", label: "Attachments", count: caseStudy.attachments?.length || 0 },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.key
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
        </div>
      </section>

      {/* Tab Content */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* Case Summary */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Case Summary
                  </h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {caseStudy.excerpt}
                  </p>
                </div>

                {/* Patient Demographics */}
                {parsedContent?.patient_demographics && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Patient Demographics
                    </h3>
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <span className="text-sm font-medium text-gray-600">Age Group:</span>
                          <div className="text-lg font-semibold text-gray-900">
                            {parsedContent.patient_demographics.age_group || parsedContent.patient_demographics.ageGroup}
                          </div>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Gender:</span>
                          <div className="text-lg font-semibold text-gray-900">
                            {parsedContent.patient_demographics.gender}
                          </div>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Location:</span>
                          <div className="text-lg font-semibold text-gray-900">
                            {parsedContent.patient_demographics.location}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Key Lessons */}
                {parsedContent?.lesson_learned && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Key Lessons Learned
                    </h3>
                    <div className="bg-green-50 border-l-4 border-green-500 p-6">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {parsedContent.lesson_learned}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Info */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Quick Info
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium">{caseStudy.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium">{caseStudy.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Institution:</span>
                      <span className="font-medium">{caseStudy.institution}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium">{caseStudy.location}</span>
                    </div>
                    {caseStudy.attachments && caseStudy.attachments.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Attachments:</span>
                        <span className="font-medium text-blue-600">
                          {caseStudy.attachments.length} files
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Review Information */}
                {(caseStudy.reviewedBy || caseStudy.reviewNotes) && (
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Review Information
                    </h3>
                    {caseStudy.reviewedBy && (
                      <div className="mb-3">
                        <span className="text-sm font-medium text-gray-600">Reviewed by:</span>
                        <div className="text-sm text-gray-900">{caseStudy.reviewedBy}</div>
                      </div>
                    )}
                    {caseStudy.reviewDate && (
                      <div className="mb-3">
                        <span className="text-sm font-medium text-gray-600">Review Date:</span>
                        <div className="text-sm text-gray-900">{formatDate(caseStudy.reviewDate)}</div>
                      </div>
                    )}
                    {caseStudy.reviewNotes && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">Review Notes:</span>
                        <p className="text-sm text-gray-700 mt-1">{caseStudy.reviewNotes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "clinical" && (
            <div className="max-w-4xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Clinical Details
              </h2>
              
              {parsedContent ? (
                <div className="space-y-8">
                  {/* Clinical Presentation */}
                  {parsedContent.clinical_presentation && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        Clinical Presentation
                      </h3>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {parsedContent.clinical_presentation}
                      </p>
                    </div>
                  )}

                  {/* Diagnostic Workup */}
                  {parsedContent.diagnostic_workup && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        Diagnostic Workup
                      </h3>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {parsedContent.diagnostic_workup}
                      </p>
                    </div>
                  )}

                  {/* Management */}
                  {parsedContent.management && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        Management Approach
                      </h3>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {parsedContent.management}
                      </p>
                    </div>
                  )}

                  {/* Discussion */}
                  {parsedContent.discussion && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        Discussion
                      </h3>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {parsedContent.discussion}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <FileText className="w-12 h-12 mx-auto text-gray-400" />
                  <p className="mt-4 text-gray-600">
                    Detailed clinical information is not available for this case study
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "outcome" && (
            <div className="max-w-4xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Outcome & Impact
              </h2>
              
              {parsedContent ? (
                <div className="space-y-8">
                  {/* Outcome */}
                  {parsedContent.outcome && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        Patient Outcome
                      </h3>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {parsedContent.outcome}
                      </p>
                    </div>
                  )}

                  {/* Impact */}
                  {caseStudy.impact && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <Activity className="w-6 h-6 mr-2 text-green-600" />
                        Clinical Impact
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {caseStudy.impact}
                      </p>
                    </div>
                  )}

                  {/* Lessons Learned */}
                  {parsedContent.lesson_learned && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        Lessons Learned
                      </h3>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {parsedContent.lesson_learned}
                      </p>
                    </div>
                  )}

                  {/* Acknowledgments */}
                  {parsedContent.acknowledgments && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        Acknowledgments
                      </h3>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {parsedContent.acknowledgments}
                      </p>
                    </div>
                  )}

                  {/* References */}
                  {parsedContent.references && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        References
                      </h3>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {parsedContent.references}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Activity className="w-12 h-12 mx-auto text-gray-400" />
                  <p className="mt-4 text-gray-600">
                    Outcome and impact information is not available for this case study
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "attachments" && (
            <div className="max-w-4xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Attachments
              </h2>
              
              {caseStudy.attachments && caseStudy.attachments.length > 0 ? (
                <div className="space-y-8">
                  {/* Images */}
                  {imageAttachments.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <ImageIcon className="w-6 h-6 mr-2 text-blue-600" />
                        Images ({imageAttachments.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {imageAttachments.map((attachment, index) => {
                          const fileName = getFileName(attachment);
                          const fileUrl = educationalResourcesApi.getFileUrl(attachment);
                          return (
                            <div key={index} className="group relative">
                              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                <img
                                  src={fileUrl}
                                  alt={fileName}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    // Show a fallback if image fails to load
                                    const parent = target.parentElement;
                                    if (parent) {
                                      parent.innerHTML = `
                                        <div class="w-full h-full flex items-center justify-center bg-gray-200">
                                          <span class="text-gray-500 text-sm">Image not available</span>
                                        </div>
                                      `;
                                    }
                                  }}
                                />
                              </div>
                              <div className="mt-2">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {fileName}
                                </p>
                                <a
                                  href={fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                  View Full Size
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Documents */}
                  {documentAttachments.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <FileText className="w-6 h-6 mr-2 text-red-600" />
                        Documents ({documentAttachments.length})
                      </h3>
                      <div className="space-y-4">
                        {documentAttachments.map((attachment, index) => {
                          const fileName = getFileName(attachment);
                          const fileUrl = educationalResourcesApi.getFileUrl(attachment);
                          return (
                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                              <div className="flex items-center">
                                {getFileIcon(fileName)}
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{fileName}</div>
                                  <div className="text-xs text-gray-500">
                                    {getFileType(fileName).toUpperCase()} Document
                                  </div>
                                </div>
                              </div>
                              <a
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
                                onClick={(e) => {
                                  // For downloads, we might want to trigger the download directly
                                  e.preventDefault();
                                  const link = document.createElement('a');
                                  link.href = fileUrl;
                                  link.setAttribute('download', fileName);
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                }}
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </a>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <FileText className="w-12 h-12 mx-auto text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-600 mt-4">
                    No Attachments Available
                  </h3>
                  <p className="text-gray-500 mt-2">
                    This case study doesn't have any attached files or images.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CaseStudyDetailPage;