import React, { useState, useEffect } from "react";
import {
  Calendar,
  Download,
  Share2,
  ChevronLeft,
  ExternalLink,
  Star,
  Eye,
  FileText,
  User,
  Globe,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Target,
  Users,
  Tag,
  Award,
  Building,
  Heart,
  Clock,
  Printer,
} from "lucide-react";
import { useParams } from "react-router-dom";
import {
  publicationsApi,
  Publication,
  Author,
} from "../../../services/publicationsAPI";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import ScrollToTop from "../../../components/common/ScrollToTop";

const PublicationDetailPage = () => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "details" | "authors" | "download"
  >("overview");
  const [publication, setPublication] = useState<Publication | null>(null);
  const [relatedPublications, setRelatedPublications] = useState<Publication[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const { id } = useParams<{ id: string }>();
  const publicationId = id ? parseInt(id) : 0;

  useEffect(() => {
    const fetchPublication = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await publicationsApi.getById(publicationId);
        setPublication(data);

        // Increment view count
        await publicationsApi.incrementView(publicationId);

        // Fetch related publications
        const related = await publicationsApi.getAll({
          category: data.category,
          status: "Published",
        });

        // Filter out current publication and limit to 3
        const filteredRelated = related
          .filter((p) => p.id !== data.id)
          .slice(0, 3);

        setRelatedPublications(filteredRelated);
      } catch (err) {
        setError("Failed to load publication details. Please try again later.");
        console.error("Error fetching publication:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublication();
  }, [publicationId]);

  const handleDownload = async () => {
    if (!publication) return;

    setIsDownloading(true);

    try {
      await publicationsApi.incrementDownload(publication.id);

      if (publication.downloadUrl) {
        const link = document.createElement("a");
        link.href = publication.downloadUrl;
        link.download = publication.title;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (publication.externalUrl) {
        window.open(publication.externalUrl, "_blank");
      }
    } catch (err) {
      console.error("Error handling download:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share && publication) {
      try {
        await navigator.share({
          title: publication.title,
          text: publication.excerpt,
          url: window.location.href,
        });
      } catch (err) {
        navigator.clipboard.writeText(window.location.href);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const getAccessTypeColor = (accessType: string) => {
    switch (accessType) {
      case "Open Access":
        return "bg-green-100 text-green-800";
      case "Free Access":
        return "bg-blue-100 text-blue-800";
      case "Member Access":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <div className="text-red-600 text-center">
          <h2 className="text-xl font-semibold mb-2">
            Error Loading Publication
          </h2>
          <p>{error}</p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!publication) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div>Publication not found</div>
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
            onClick={() => window.history.back()}
            className="flex items-center text-red-600 hover:text-red-700 font-medium"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Publications
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-8 md:py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Publication Image */}
            <div className="lg:w-2/5">
              <div className="relative">
                <img
                  src={publication.imageUrl}
                  alt={publication.title}
                  className="w-full h-64 lg:h-80 object-cover rounded-lg shadow-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/api/placeholder/400/250";
                  }}
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-red-600 text-white px-3 py-1 text-sm font-bold uppercase tracking-wide rounded">
                    {publication.type}
                  </span>
                </div>
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  {publication.isFeatured && (
                    <span className="bg-orange-600 text-white px-3 py-1 text-sm font-bold rounded flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      Featured
                    </span>
                  )}
                  <span
                    className={`px-3 py-1 text-sm font-bold rounded ${getAccessTypeColor(
                      publication.accessType
                    )}`}
                  >
                    {publication.accessType}
                  </span>
                </div>
              </div>
            </div>

            {/* Publication Details */}
            <div className="lg:w-3/5">
              <div className="mb-4">
                <span className="text-red-600 font-medium text-sm uppercase tracking-wide">
                  {publication.category}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-4 leading-tight">
                {publication.title}
              </h1>

              <p className="text-lg md:text-xl text-gray-600 font-light mb-6">
                {publication.excerpt}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-3">
                  {publication.journal && (
                    <div className="flex items-center text-gray-700">
                      <BookOpen className="w-5 h-5 mr-3 text-red-600" />
                      <span className="font-medium">{publication.journal}</span>
                    </div>
                  )}

                  {publication.publisher && (
                    <div className="flex items-center text-gray-700">
                      <Building className="w-5 h-5 mr-3 text-red-600" />
                      <span className="font-medium">
                        {publication.publisher}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center text-gray-700">
                    <Globe className="w-5 h-5 mr-3 text-red-600" />
                    <span className="font-medium">{publication.language}</span>
                  </div>

                  <div className="flex items-center text-gray-700">
                    <Calendar className="w-5 h-5 mr-3 text-red-600" />
                    <span className="font-medium">{publication.date}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-lg font-bold text-red-600">
                      {publication.downloads.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600">Downloads</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-lg font-bold text-red-600">
                      {publication.viewCount.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600">Views</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-lg font-bold text-red-600">
                      {publication.citationCount}
                    </div>
                    <div className="text-xs text-gray-600">Citations</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className={`bg-orange-600 text-white px-6 py-3 rounded font-bold hover:bg-orange-700 transition-colors uppercase tracking-wide flex items-center justify-center gap-2 ${
                    isDownloading ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                >
                  <Download className="w-4 h-4" />
                  {isDownloading ? "Processing..." : "Download"}
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={handleShare}
                    className="border border-red-600 text-red-600 px-4 py-3 rounded hover:bg-red-50 transition-colors flex items-center"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </button>
                  <button className="border border-red-600 text-red-600 px-4 py-3 rounded hover:bg-red-50 transition-colors flex items-center">
                    <Heart className="w-4 h-4 mr-2" />
                    Save
                  </button>
                  {publication.externalUrl && (
                    <button
                      onClick={() =>
                        window.open(publication.externalUrl, "_blank")
                      }
                      className="border border-red-600 text-red-600 px-4 py-3 rounded hover:bg-red-50 transition-colors flex items-center"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Online
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
              { key: "overview", label: "Overview" },
              { key: "details", label: "Details" },
              { key: "authors", label: "Authors" },
              { key: "download", label: "Download & Access" },
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
      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* Abstract */}
                {publication.abstract && (
                  <div>
                    <h2 className="text-2xl font-light text-gray-900 mb-4">
                      Abstract
                    </h2>
                    <div className="prose max-w-none">
                      <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                        {publication.abstract}
                      </p>
                    </div>
                  </div>
                )}

                {/* Full Content */}
                {publication.fullContent && (
                  <div>
                    <h2 className="text-2xl font-light text-gray-900 mb-4">
                      Content
                    </h2>
                    <div className="prose max-w-none">
                      <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                        {publication.fullContent}
                      </p>
                    </div>
                  </div>
                )}

                {/* Keywords */}
                {publication.keywords && publication.keywords.length > 0 && (
                  <div>
                    <h3 className="text-xl font-light text-gray-900 mb-4">
                      Keywords
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {publication.keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                        >
                          <Tag className="w-3 h-3" />
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {publication.tags && publication.tags.length > 0 && (
                  <div>
                    <h3 className="text-xl font-light text-gray-900 mb-4">
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {publication.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Target Audience */}
                {publication.targetAudience &&
                  publication.targetAudience.length > 0 && (
                    <div>
                      <h3 className="text-xl font-light text-gray-900 mb-4">
                        Target Audience
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {publication.targetAudience.map((audience, index) => (
                          <div key={index} className="flex items-start">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">
                              {audience}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Publication Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-lg font-light text-gray-900 mb-3">
                    Publication Information
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">{publication.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium text-green-600">
                        {publication.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Access:</span>
                      <span className="font-medium">
                        {publication.accessType}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Language:</span>
                      <span className="font-medium">
                        {publication.language}
                      </span>
                    </div>
                    {publication.isbn && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">ISBN:</span>
                        <span className="font-medium">{publication.isbn}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Publication Details */}
                {(publication.journal ||
                  publication.volume ||
                  publication.issue ||
                  publication.pages) && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-light text-gray-900 mb-3 flex items-center">
                      <BookOpen className="w-4 h-4 mr-2 text-red-600" />
                      Publication Details
                    </h3>
                    <div className="space-y-2 text-sm">
                      {publication.journal && (
                        <div>
                          <span className="font-medium">Journal:</span>{" "}
                          {publication.journal}
                        </div>
                      )}
                      {publication.volume && (
                        <div>
                          <span className="font-medium">Volume:</span>{" "}
                          {publication.volume}
                        </div>
                      )}
                      {publication.issue && (
                        <div>
                          <span className="font-medium">Issue:</span>{" "}
                          {publication.issue}
                        </div>
                      )}
                      {publication.pages && (
                        <div>
                          <span className="font-medium">Pages:</span>{" "}
                          {publication.pages}
                        </div>
                      )}
                      {publication.publisher && (
                        <div>
                          <span className="font-medium">Publisher:</span>{" "}
                          {publication.publisher}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Statistics */}
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="text-lg font-light text-gray-900 mb-3">
                    Statistics
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Download className="w-4 h-4 mr-2 text-red-600" />
                      <span className="text-gray-600">Downloads:</span>
                      <span className="font-medium ml-1">
                        {publication.downloads.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-2 text-red-600" />
                      <span className="text-gray-600">Views:</span>
                      <span className="font-medium ml-1">
                        {publication.viewCount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Award className="w-4 h-4 mr-2 text-red-600" />
                      <span className="text-gray-600">Citations:</span>
                      <span className="font-medium ml-1">
                        {publication.citationCount}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-red-600" />
                      <span className="text-gray-600">Published:</span>
                      <span className="font-medium ml-1">
                        {publication.date}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "details" && (
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-4">
                  Technical Details & Specifications
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Comprehensive information about this publication including
                  technical specifications and metadata.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Publication Specifications */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-red-600" />
                    Publication Specifications
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">{publication.type}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium">
                        {publication.category}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium">{publication.status}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Access Type:</span>
                      <span className="font-medium">
                        {publication.accessType}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Language:</span>
                      <span className="font-medium">
                        {publication.language}
                      </span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Featured:</span>
                      <span
                        className={`font-medium ${
                          publication.isFeatured
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {publication.isFeatured ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Usage Statistics */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Eye className="w-5 h-5 mr-2 text-red-600" />
                    Usage Statistics
                  </h3>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {publication.viewCount.toLocaleString()}
                      </div>
                      <div className="text-sm text-blue-800">Total Views</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {publication.downloads.toLocaleString()}
                      </div>
                      <div className="text-sm text-green-800">Downloads</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {publication.citationCount}
                      </div>
                      <div className="text-sm text-yellow-800">Citations</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Additional Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Publication Information
                    </h4>
                    <div className="space-y-1">
                      <div>Published: {publication.date}</div>
                      <div>Created: {publication.createdAt}</div>
                      <div>Last Updated: {publication.updatedAt}</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Identifiers
                    </h4>
                    <div className="space-y-1">
                      <div>ID: {publication.id}</div>
                      {publication.isbn && <div>ISBN: {publication.isbn}</div>}
                      <div>
                        Status:{" "}
                        <span className="text-green-600 font-medium">
                          {publication.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "authors" && (
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-4">
                  Authors
                </h2>
                <p className="text-gray-600">
                  Meet the experts who contributed to this publication.
                </p>
              </div>

              {publication.authors && publication.authors.length > 0 ? (
                <div className="space-y-6">
                  {publication.authors.map((author: Author, index: number) => (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 rounded-lg p-6"
                    >
                      <div className="flex items-start gap-6">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-8 h-8 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {author.name}
                          </h3>
                          {author.credentials && (
                            <p className="text-red-600 font-medium text-sm mb-1">
                              {author.credentials}
                            </p>
                          )}
                          <p className="text-gray-600 mb-3">
                            {author.affiliation}
                          </p>
                          {author.email && (
                            <a
                              href={`mailto:${author.email}`}
                              className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1"
                            >
                              <User className="w-4 h-4" />
                              {author.email}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <User className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">
                    Author information not available.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "download" && (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-4">
                  Download & Access
                </h2>
                <p className="text-gray-600">
                  Access this publication through the available download
                  options.
                </p>
              </div>

              {/* Download Options */}
              <div className="bg-white border border-gray-200 rounded-lg p-8">
                <div className="space-y-6">
                  {/* Publication Summary */}
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Download Summary
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Title:</span>
                        <div className="font-medium">{publication.title}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Type:</span>
                        <div className="font-medium">{publication.type}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Access:</span>
                        <div className="font-medium">
                          {publication.accessType}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Language:</span>
                        <div className="font-medium">
                          {publication.language}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Downloads:</span>
                        <div className="font-medium text-green-600">
                          {publication.downloads.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Published:</span>
                        <div className="font-medium">{publication.date}</div>
                      </div>
                    </div>
                  </div>

                  {/* Download Options */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Available Options
                    </h3>
                    <div className="space-y-3">
                      {publication.downloadUrl && (
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center">
                            <Download className="w-5 h-5 mr-3 text-red-600" />
                            <div>
                              <div className="font-medium">Download PDF</div>
                              <div className="text-sm text-gray-600">
                                Full publication for offline reading
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={handleDownload}
                            disabled={isDownloading}
                            className={`bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center ${
                              isDownloading
                                ? "opacity-75 cursor-not-allowed"
                                : ""
                            }`}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            {isDownloading ? "Downloading..." : "Download"}
                          </button>
                        </div>
                      )}

                      {publication.externalUrl && (
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center">
                            <ExternalLink className="w-5 h-5 mr-3 text-red-600" />
                            <div>
                              <div className="font-medium">View Online</div>
                              <div className="text-sm text-gray-600">
                                Access publication on external site
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              window.open(publication.externalUrl, "_blank")
                            }
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Online
                          </button>
                        </div>
                      )}

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center">
                          <Printer className="w-5 h-5 mr-3 text-red-600" />
                          <div>
                            <div className="font-medium">Print Version</div>
                            <div className="text-sm text-gray-600">
                              Print-friendly format
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => window.print()}
                          className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center"
                        >
                          <Printer className="w-4 h-4 mr-2" />
                          Print
                        </button>
                      </div>
                    </div>
                  </div>

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
                        I agree to use this publication for academic and
                        professional purposes in accordance with copyright laws
                        and ACNA guidelines.
                      </label>
                    </div>
                  </div>

                  {/* Main Download Button */}
                  {publication.downloadUrl && (
                    <button
                      onClick={handleDownload}
                      disabled={isDownloading}
                      className={`w-full bg-red-600 text-white px-6 py-4 rounded-lg font-bold hover:bg-red-700 transition-colors uppercase tracking-wide flex items-center justify-center ${
                        isDownloading ? "opacity-75 cursor-not-allowed" : ""
                      }`}
                    >
                      <Download className="w-5 h-5 mr-2" />
                      {isDownloading
                        ? "Downloading Publication..."
                        : "Download Publication"}
                    </button>
                  )}

                  <div className="text-center text-sm text-gray-600">
                    <p>{publication.accessType} • Professional Use</p>
                    <p className="mt-1">
                      Questions? Contact us at{" "}
                      <a
                        href="mailto:publications@acna.org"
                        className="text-red-600 hover:underline"
                      >
                        publications@acna.org
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Related Publications */}
      {relatedPublications.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-4">
                Related Publications
              </h2>
              <p className="text-gray-600">
                Other publications in the {publication.category} category that
                might interest you.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedPublications.map((relatedPublication) => (
                <div
                  key={relatedPublication.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 border border-gray-200 cursor-pointer"
                  onClick={() =>
                    (window.location.href = `/publications/${relatedPublication.id}`)
                  }
                >
                  <div className="relative">
                    <img
                      src={relatedPublication.imageUrl}
                      alt={relatedPublication.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-red-600 text-white px-2 py-1 text-xs font-bold uppercase tracking-wide rounded">
                        {relatedPublication.type}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {relatedPublication.title}
                    </h3>
                    <div className="flex items-center text-gray-600 text-sm mb-3">
                      <span>{relatedPublication.category}</span>
                      <span className="mx-2">•</span>
                      <span>{relatedPublication.date}</span>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {relatedPublication.excerpt}
                    </p>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center text-gray-600 text-sm">
                          <Download className="w-4 h-4 mr-1" />
                          {relatedPublication.downloads.toLocaleString()}
                          <span className="mx-2">•</span>
                          <Eye className="w-4 h-4 mr-1" />
                          {relatedPublication.viewCount.toLocaleString()}
                        </div>
                      </div>

                      <span className="text-red-600 font-medium text-sm hover:text-red-700">
                        View Publication →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default PublicationDetailPage;
