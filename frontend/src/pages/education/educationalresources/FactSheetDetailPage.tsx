import React, { useState, useEffect } from "react";
import {
  Calendar,
  Download,
  Share2,
  ChevronLeft,
  AlertCircle,
  Star,
  FileText,
  User,
  Globe,
  Eye,
  CheckCircle,
  Target,
  Users,
  Tag,
  Printer,
  Clock,
  Book,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { EducationalResource, educationalResourcesApi } from "../../../services/educationalResourcesApi";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import ScrollToTop from "../../../components/common/ScrollToTop";

const FactSheetDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "overview" | "contents" | "authors" | "download"
  >("overview");
  const [factSheet, setFactSheet] = useState<EducationalResource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchFactSheet = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const factSheetData = await educationalResourcesApi.getById(parseInt(id));
        setFactSheet(factSheetData);
        // Increment view count
        await educationalResourcesApi.incrementView(parseInt(id));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load fact sheet"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFactSheet();
  }, [id]);

  const handleDownload = async () => {
    if (!factSheet) return;

    setIsDownloading(true);
    try {
      // Increment download count
      await educationalResourcesApi.incrementDownload(factSheet.id);

      // Trigger download
      if (factSheet.fileUrl) {
        const link = document.createElement("a");
        link.href = factSheet.fileUrl;
        link.download = factSheet.title;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Update local state
        setFactSheet((prev) =>
          prev ? { ...prev, downloadCount: prev.downloadCount + 1 } : null
        );
      }
    } catch (err) {
      console.error("Error downloading file:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const renderRatingStars = (rating?: number) => {
    if (!rating) return null;

    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? "text-yellow-500 fill-current" : "text-gray-300"
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">
          ({rating.toFixed(1)})
        </span>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !factSheet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Fact Sheet Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            {error || "The fact sheet you're looking for doesn't exist."}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-red-600 hover:text-red-700 font-medium"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Fact Sheets
          </button>
        </div>
      </div>
    );
  }

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
            Back to Fact Sheets
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Fact Sheet Image */}
            <div className="lg:w-2/5">
              <div className="relative">
                <img
                  src={factSheet.imageUrl || "https://images.pexels.com/photos/4260325/pexels-photo-4260325.jpeg?auto=compress&cs=tinysrgb&w=600"}
                  alt={factSheet.title}
                  className="w-full h-64 lg:h-80 object-cover rounded-lg shadow-lg"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-red-600 text-white px-3 py-1 text-sm font-bold uppercase tracking-wide rounded">
                    {factSheet.category}
                  </span>
                </div>
                {factSheet.isFeatured && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-yellow-500 text-white px-3 py-1 text-sm font-bold rounded">
                      FEATURED
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Fact Sheet Details */}
            <div className="lg:w-3/5">
              <div className="mb-4">
                <span className="text-red-600 font-medium text-sm uppercase tracking-wide">
                  {factSheet.type}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                {factSheet.title}
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-5 h-5 mr-3 text-red-600" />
                    <div>
                      <div className="font-medium">
                        {formatDate(factSheet.publicationDate || factSheet.createdAt)}
                      </div>
                      <div className="text-sm">Published</div>
                    </div>
                  </div>

                  {factSheet.duration && (
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-5 h-5 mr-3 text-red-600" />
                      <span>{factSheet.duration} read</span>
                    </div>
                  )}

                  <div className="flex items-center text-gray-600">
                    <Users className="w-5 h-5 mr-3 text-red-600" />
                    <span>For: {factSheet.targetAudience.join(", ") || "Healthcare Professionals"}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {factSheet.fileSize && (
                    <div className="flex items-center text-gray-600">
                      <FileText className="w-5 h-5 mr-3 text-red-600" />
                      <span>Size: {factSheet.fileSize}</span>
                    </div>
                  )}

                  <div className="flex items-center text-gray-600">
                    <Download className="w-5 h-5 mr-3 text-red-600" />
                    <span>{factSheet.downloadCount} downloads</span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <Eye className="w-5 h-5 mr-3 text-red-600" />
                    <span>{factSheet.viewCount} views</span>
                  </div>

                  {factSheet.rating && (
                    <div className="flex items-center">
                      {renderRatingStars(factSheet.rating)}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleDownload}
                  disabled={isDownloading || !factSheet.fileUrl}
                  className={`bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center ${
                    isDownloading || !factSheet.fileUrl ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                >
                  <Download className="w-5 h-5 mr-2" />
                  {isDownloading ? "Downloading..." : "Download Fact Sheet"}
                </button>

                <div className="flex gap-2">
                  <button className="border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </button>
                  <button className="border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                  </button>
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
              { key: "overview", label: "Overview" },
              { key: "contents", label: "Contents" },
              { key: "authors", label: "Authors" },
              { key: "download", label: "Download" },
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
                {/* Description */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    About This Fact Sheet
                  </h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {factSheet.description}
                  </p>
                  {factSheet.fullDescription && (
                    <div className="mt-6">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {factSheet.fullDescription}
                      </p>
                    </div>
                  )}
                </div>

                {/* Learning Objectives */}
                {factSheet.learningObjectives && factSheet.learningObjectives.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Learning Objectives
                    </h3>
                    <ul className="space-y-2">
                      {factSheet.learningObjectives.map((objective, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="w-5 h-5 mr-3 mt-0.5 text-green-600 flex-shrink-0" />
                          <span className="text-gray-700">{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Related Conditions */}
                {factSheet.relatedConditions && factSheet.relatedConditions.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Related Conditions
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {factSheet.relatedConditions.map((condition, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {condition}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {factSheet.tags.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <Tag className="w-6 h-6 mr-2 text-red-600" />
                      Topics Covered
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {factSheet.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {tag}
                        </span>
                      ))}
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
                      <span className="font-medium">{factSheet.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Difficulty:</span>
                      <span className="font-medium">{factSheet.difficulty}</span>
                    </div>
                    {factSheet.fileSize && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">File Size:</span>
                        <span className="font-medium">{factSheet.fileSize}</span>
                      </div>
                    )}
                    {factSheet.fileFormat && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Format:</span>
                        <span className="font-medium">{factSheet.fileFormat}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Downloads:</span>
                      <span className="font-medium text-green-600">
                        {factSheet.downloadCount}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Views:</span>
                      <span className="font-medium text-blue-600">
                        {factSheet.viewCount}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Target Audience */}
                {factSheet.targetAudience && factSheet.targetAudience.length > 0 && (
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <Users className="w-5 h-5 mr-2 text-blue-600" />
                      Target Audience
                    </h3>
                    <ul className="space-y-2">
                      {factSheet.targetAudience.map((audience, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-blue-600 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{audience}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Prerequisites */}
                {factSheet.prerequisites && factSheet.prerequisites.length > 0 && (
                  <div className="bg-yellow-50 p-6 rounded-lg">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Prerequisites
                    </h3>
                    <ul className="space-y-2">
                      {factSheet.prerequisites.map((prereq, index) => (
                        <li key={index} className="flex items-start">
                          <AlertCircle className="w-4 h-4 mr-2 mt-0.5 text-yellow-600 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{prereq}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Languages */}
                {factSheet.languages && factSheet.languages.length > 0 && (
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <Globe className="w-5 h-5 mr-2 text-green-600" />
                      Available Languages
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {factSheet.languages.map((language, index) => (
                        <span
                          key={index}
                          className="bg-green-100 text-green-800 px-3 py-1 text-sm rounded-full font-medium"
                        >
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "contents" && (
            <div className="max-w-4xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Content Overview
              </h2>
              
              {factSheet.fullDescription ? (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="p-6">
                    <div className="prose max-w-none">
                      <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {factSheet.fullDescription}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Book className="w-12 h-12 mx-auto text-gray-400" />
                  <p className="mt-4 text-gray-600">
                    Detailed content will be available in the downloadable PDF
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "authors" && (
            <div className="max-w-4xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Authors & Contributors
              </h2>
              
              <div className="space-y-6">
                {/* Primary Author */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start gap-6">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {factSheet.author}
                        </h3>
                        <p className="text-red-600 font-medium mb-2">Primary Author</p>
                        {factSheet.institution && (
                          <p className="text-gray-600 mb-4">{factSheet.institution}</p>
                        )}
                        <p className="text-gray-600 mb-4">
                          Contributing author with expertise in pediatric neurology and child development.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 text-sm rounded-full">
                            Pediatric Neurology
                          </span>
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 text-sm rounded-full">
                            Medical Education
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reviewed By */}
                {factSheet.reviewedBy && (
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start gap-6">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-8 h-8 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {factSheet.reviewedBy}
                          </h3>
                          <p className="text-green-600 font-medium mb-2">Medical Reviewer</p>
                          <p className="text-gray-600 mb-4">
                            Reviewed this fact sheet for accuracy and clinical relevance.
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <span className="bg-green-100 text-green-800 px-3 py-1 text-sm rounded-full">
                              Clinical Review
                            </span>
                            <span className="bg-green-100 text-green-800 px-3 py-1 text-sm rounded-full">
                              Quality Assurance
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Location */}
                {factSheet.location && (
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Institution Location
                    </h3>
                    <p className="text-gray-700">{factSheet.location}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "download" && (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Download Fact Sheet
                </h2>
                <p className="text-gray-600">
                  This resource is available for free download to support education and awareness.
                </p>
              </div>

              {/* Download Options */}
              <div className="bg-white border border-gray-200 rounded-lg p-8">
                <div className="space-y-6">
                  {/* Fact Sheet Summary */}
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Download Summary
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Title:</span>
                        <div className="font-medium">{factSheet.title}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Category:</span>
                        <div className="font-medium">{factSheet.category}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Author:</span>
                        <div className="font-medium">{factSheet.author}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Difficulty:</span>
                        <div className="font-medium">{factSheet.difficulty}</div>
                      </div>
                      {factSheet.fileSize && (
                        <div>
                          <span className="text-gray-600">File Size:</span>
                          <div className="font-medium">{factSheet.fileSize}</div>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-600">Downloads:</span>
                        <div className="font-medium text-green-600">
                          {factSheet.downloadCount}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* References */}
                  {factSheet.references && factSheet.references.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        References Included
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">
                          This fact sheet includes {factSheet.references.length} scientific references:
                        </p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {factSheet.references.slice(0, 3).map((ref, index) => (
                            <li key={index} className="truncate">• {ref}</li>
                          ))}
                          {factSheet.references.length > 3 && (
                            <li className="text-gray-500">
                              ... and {factSheet.references.length - 3} more references
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Terms and Conditions */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="terms"
                        className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        required
                      />
                      <label
                        htmlFor="terms"
                        className="ml-3 text-sm text-gray-700"
                      >
                        I agree to use this resource for educational purposes only and acknowledge 
                        that it is provided free of charge by ACNA for healthcare professionals 
                        and medical students.
                      </label>
                    </div>
                  </div>

                  {/* Main Download Button */}
                  <button
                    onClick={handleDownload}
                    disabled={isDownloading || !factSheet.fileUrl}
                    className={`w-full bg-red-600 text-white px-6 py-4 rounded-lg font-bold hover:bg-red-700 transition-colors uppercase tracking-wide flex items-center justify-center ${
                      isDownloading || !factSheet.fileUrl ? "opacity-75 cursor-not-allowed" : ""
                    }`}
                  >
                    <Download className="w-5 h-5 mr-2" />
                    {isDownloading
                      ? "Downloading Fact Sheet..."
                      : factSheet.fileUrl
                      ? "Download Fact Sheet"
                      : "File Not Available"}
                  </button>

                  <div className="text-center text-sm text-gray-600">
                    <p>Free download • No registration required</p>
                    <p className="mt-1">
                      Questions? Contact us at{" "}
                      <a
                        href="mailto:resources@acna.org"
                        className="text-red-600 hover:underline"
                      >
                        resources@acna.org
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default FactSheetDetailPage;