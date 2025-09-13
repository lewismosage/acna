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
  MapPin,
  Shield,
  Scale,
  Gavel,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { PositionalStatement, policyManagementApi } from "../../../services/policyManagementApi";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import ScrollToTop from "../../../components/common/ScrollToTop";

const PositionStatementDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "overview" | "position" | "evidence" | "implications"
  >("overview");
  const [positionStatement, setPositionStatement] = useState<PositionalStatement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchPositionStatement = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const positionStatementData = await policyManagementApi.getById(parseInt(id));
        
        // Ensure it's a PositionalStatement type
        if (positionStatementData.type !== 'PositionalStatement') {
          throw new Error('Content is not a Position Statement');
        }
        
        setPositionStatement(positionStatementData as PositionalStatement);
        // Increment view count
        await policyManagementApi.incrementView(parseInt(id), 'PositionalStatement');
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load position statement"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPositionStatement();
  }, [id]);

  const handleDownload = async () => {
    if (!positionStatement) return;

    setIsDownloading(true);
    try {
      // Increment download count
      await policyManagementApi.incrementDownload(positionStatement.id, 'PositionalStatement');

      // Create a comprehensive document with the position statement content
      const content = `
ACNA OFFICIAL POSITION STATEMENT: ${positionStatement.title}

Category: ${positionStatement.category}
Status: ${positionStatement.status}
Date: ${new Date(positionStatement.updatedAt).toLocaleDateString()}
Pages: ${positionStatement.pageCount}

EXECUTIVE SUMMARY:
${positionStatement.summary}

KEY POLICY POSITIONS:
${positionStatement.keyPoints.map((point, i) => `${i + 1}. ${point}`).join('\n\n')}

COUNTRY/REGIONAL FOCUS:
${positionStatement.countryFocus.join(', ')}

RELATED POLICIES:
${positionStatement.relatedPolicies.join(', ')}

POLICY AREAS:
${positionStatement.tags.join(', ')}

---
This is an official position statement of the African Child Neurology Association (ACNA).
For more information, visit our website or contact our policy team.

Generated from ACNA Policy Management System
      `.trim();

      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ACNA_Position_Statement_${positionStatement.title.replace(/[^a-z0-9]/gi, '_')}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Update local state
      setPositionStatement((prev) =>
        prev ? { ...prev, downloadCount: prev.downloadCount + 1 } : null
      );
    } catch (err) {
      console.error("Error downloading file:", err);
    } finally {
      setIsDownloading(false);
    }
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

  if (error || !positionStatement) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Position Statement Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            {error || "The position statement you're looking for doesn't exist."}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-red-600 hover:text-red-700 font-medium"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Position Statements
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
            Back to Position Statements
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Position Statement Image */}
            <div className="lg:w-2/5">
              <div className="relative">
                <img
                  src={positionStatement.imageUrl || "https://images.pexels.com/photos/5668473/pexels-photo-5668473.jpeg?auto=compress&cs=tinysrgb&w=600"}
                  alt={positionStatement.title}
                  className="w-full h-64 lg:h-80 object-cover rounded-lg shadow-lg"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-red-600 text-white px-3 py-1 text-sm font-bold uppercase tracking-wide rounded">
                    {positionStatement.category}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="bg-blue-600 text-white px-3 py-1 text-sm font-bold rounded flex items-center">
                    <Shield className="w-4 h-4 mr-1" />
                    Official Position
                  </span>
                </div>
              </div>
            </div>

            {/* Position Statement Details */}
            <div className="lg:w-3/5">
              <div className="mb-4">
                <span className="text-red-600 font-medium text-sm uppercase tracking-wide">
                  Official Position Statement
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                {positionStatement.title}
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-5 h-5 mr-3 text-red-600" />
                    <div>
                      <div className="font-medium">
                        {formatDate(positionStatement.updatedAt)}
                      </div>
                      <div className="text-sm">Last Updated</div>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <FileText className="w-5 h-5 mr-3 text-red-600" />
                    <span>{positionStatement.pageCount} page{positionStatement.pageCount !== 1 ? 's' : ''} • Official Statement</span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <Scale className="w-5 h-5 mr-3 text-red-600" />
                    <span>{positionStatement.keyPoints.length} Key Position{positionStatement.keyPoints.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-5 h-5 mr-3 text-red-600" />
                    <span>
                      {positionStatement.countryFocus.length > 2 
                        ? `${positionStatement.countryFocus.slice(0, 2).join(", ")} +${positionStatement.countryFocus.length - 2} more`
                        : positionStatement.countryFocus.join(", ")
                      }
                    </span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <Eye className="w-5 h-5 mr-3 text-red-600" />
                    <span>{positionStatement.viewCount} views</span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <Download className="w-5 h-5 mr-3 text-red-600" />
                    <span>{positionStatement.downloadCount} downloads</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className={`bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center ${
                    isDownloading ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                >
                  <Download className="w-5 h-5 mr-2" />
                  {isDownloading ? "Downloading..." : "Download Statement"}
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
              { key: "position", label: "Key Positions" },
              { key: "evidence", label: "Evidence Base" },
              { key: "implications", label: "Policy Implications" },
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
                {/* Executive Summary */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Executive Summary
                  </h2>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-6">
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {positionStatement.summary}
                    </p>
                  </div>
                </div>

                {/* Official Position */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Gavel className="w-6 h-6 mr-2 text-red-600" />
                    ACNA's Official Position
                  </h3>
                  <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
                    <p className="text-gray-700 leading-relaxed">
                      This position statement represents the official stance of the African Child Neurology Association 
                      on critical issues affecting child neurological health. It is based on extensive consultation 
                      with our network of specialists and reflects current scientific evidence and best practices 
                      adapted for African healthcare contexts.
                    </p>
                  </div>
                </div>

                {/* Key Statistics */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Statement Overview
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">{positionStatement.keyPoints.length}</div>
                      <div className="text-sm text-gray-600">Key Positions</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">{positionStatement.countryFocus.length}</div>
                      <div className="text-sm text-gray-600">Countries/Regions</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600">{positionStatement.pageCount}</div>
                      <div className="text-sm text-gray-600">Document Pages</div>
                    </div>
                  </div>
                </div>

                {/* Related Policies */}
                {positionStatement.relatedPolicies.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <Target className="w-6 h-6 mr-2 text-red-600" />
                      Related Policies & Frameworks
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {positionStatement.relatedPolicies.map((policy, index) => (
                        <span
                          key={index}
                          className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {policy}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {positionStatement.tags.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <Tag className="w-6 h-6 mr-2 text-red-600" />
                      Policy Areas
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {positionStatement.tags.map((tag, index) => (
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
                      <span className="font-medium">{positionStatement.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium text-green-600">{positionStatement.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Document Length:</span>
                      <span className="font-medium">{positionStatement.pageCount} pages</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Views:</span>
                      <span className="font-medium text-blue-600">
                        {positionStatement.viewCount}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Downloads:</span>
                      <span className="font-medium text-green-600">
                        {positionStatement.downloadCount}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Geographic Focus */}
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-green-600" />
                    Geographic Focus
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {positionStatement.countryFocus.map((country, index) => (
                      <span
                        key={index}
                        className="bg-green-100 text-green-800 px-3 py-1 text-sm rounded-full font-medium"
                      >
                        {country}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Document Authority */}
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-blue-600" />
                    Document Authority
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-900">Organization:</span>
                      <div className="text-gray-700">African Child Neurology Association</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Document Type:</span>
                      <div className="text-gray-700">Official Position Statement</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Review Status:</span>
                      <div className="text-gray-700">Peer-reviewed and approved</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Validity:</span>
                      <div className="text-gray-700">Current and active</div>
                    </div>
                  </div>
                </div>

                {/* Citation Information */}
                <div className="bg-yellow-50 p-6 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    How to Cite
                  </h3>
                  <div className="text-sm text-gray-700 p-3 bg-white border border-yellow-200 rounded">
                    African Child Neurology Association. ({new Date(positionStatement.updatedAt).getFullYear()}). 
                    <em> {positionStatement.title}</em>. ACNA Position Statement. 
                    Retrieved from [URL]
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "position" && (
            <div className="max-w-4xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Key Policy Positions
              </h2>
              
              <div className="space-y-6">
                {positionStatement.keyPoints.map((point, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mr-4">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          Position Statement {index + 1}
                        </h3>
                        <p className="text-gray-700 leading-relaxed text-base">
                          {point}
                        </p>
                        <div className="mt-4 flex items-center text-sm text-gray-500">
                          <Scale className="w-4 h-4 mr-2" />
                          <span>Official ACNA Position</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Position Context */}
              <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
                  Position Context
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  These position statements reflect ACNA's official stance based on current evidence, 
                  expert consultation, and consideration of African healthcare contexts. They are intended 
                  to guide policy development, clinical practice, and advocacy efforts across the continent.
                </p>
              </div>
            </div>
          )}

          {activeTab === "evidence" && (
            <div className="max-w-4xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Evidence Base & Methodology
              </h2>
              
              <div className="space-y-8">
                {/* Evidence Foundation */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Book className="w-6 h-6 mr-2 text-blue-600" />
                    Evidence Foundation
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    This position statement is grounded in comprehensive evidence review and expert consultation. 
                    Our methodology ensures that positions are both scientifically sound and contextually 
                    appropriate for African healthcare settings.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 border-l-4 border-green-500 p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Literature Review</h4>
                      <p className="text-sm text-gray-700">
                        Systematic review of peer-reviewed literature, clinical guidelines, 
                        and evidence-based practices in pediatric neurology.
                      </p>
                    </div>
                    
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Expert Consultation</h4>
                      <p className="text-sm text-gray-700">
                        Input from ACNA members, international partners, and subject 
                        matter experts across multiple African countries.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Methodology */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">
                    Development Methodology
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">
                        1
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Evidence Synthesis</h4>
                        <p className="text-gray-600 text-sm">
                          Comprehensive review of available evidence from multiple sources including 
                          research studies, clinical data, and implementation experiences.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">
                        2
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Stakeholder Engagement</h4>
                        <p className="text-gray-600 text-sm">
                          Consultation with healthcare professionals, policymakers, and patient 
                          advocates across different African countries and healthcare systems.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">
                        3
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Consensus Development</h4>
                        <p className="text-gray-600 text-sm">
                          Structured process to achieve consensus among experts while considering 
                          diverse perspectives and local contexts.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">
                        4
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Review & Approval</h4>
                        <p className="text-gray-600 text-sm">
                          Formal review by ACNA leadership and subject matter experts before 
                          final approval and publication.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quality Assurance */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <CheckCircle className="w-6 h-6 mr-2 text-green-600" />
                    Quality Assurance
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start">
                      <CheckCircle className="w-5 h-5 mr-3 mt-0.5 text-green-600 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-gray-900">Peer Review Process</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Independent review by external experts
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <CheckCircle className="w-5 h-5 mr-3 mt-0.5 text-green-600 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-gray-900">Evidence Standards</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Adherence to international evidence standards
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <CheckCircle className="w-5 h-5 mr-3 mt-0.5 text-green-600 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-gray-900">Contextual Adaptation</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Adaptation to African healthcare contexts
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <CheckCircle className="w-5 h-5 mr-3 mt-0.5 text-green-600 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-gray-900">Regular Updates</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Periodic review and updates based on new evidence
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "implications" && (
            <div className="max-w-4xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Policy Implications & Recommendations
              </h2>
              
              <div className="space-y-8">
                {/* Policy Impact */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Target className="w-6 h-6 mr-2 text-red-600" />
                    Policy Impact & Applications
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    This position statement has significant implications for healthcare policy, 
                    clinical practice, and health system development across Africa. The following 
                    areas represent key domains where this position should influence decision-making.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Healthcare Policy</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• National health strategy development</li>
                        <li>• Healthcare workforce planning</li>
                        <li>• Resource allocation priorities</li>
                        <li>• Quality standards and guidelines</li>
                      </ul>
                    </div>
                    
                    <div className="bg-green-50 border-l-4 border-green-500 p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Clinical Practice</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Treatment protocols and guidelines</li>
                        <li>• Professional training curricula</li>
                        <li>• Care delivery models</li>
                        <li>• Clinical decision-making frameworks</li>
                      </ul>
                    </div>
                    
                    <div className="bg-purple-50 border-l-4 border-purple-500 p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Health Systems</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Service delivery organization</li>
                        <li>• Infrastructure development priorities</li>
                        <li>• Technology adoption strategies</li>
                        <li>• Quality improvement initiatives</li>
                      </ul>
                    </div>
                    
                    <div className="bg-orange-50 border-l-4 border-orange-500 p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Advocacy & Awareness</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Public health campaigns</li>
                        <li>• Community engagement strategies</li>
                        <li>• Stakeholder mobilization</li>
                        <li>• Media and communication efforts</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Implementation Recommendations */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">
                    Implementation Recommendations
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="border-l-4 border-green-500 pl-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        For Policymakers
                      </h4>
                      <p className="text-gray-700 mb-3">
                        Government officials and policy developers should integrate these positions 
                        into national health strategies and regulatory frameworks.
                      </p>
                      <ul className="list-disc list-inside text-gray-600 space-y-1">
                        <li>Review current policies against ACNA positions</li>
                        <li>Engage stakeholders in policy development processes</li>
                        <li>Allocate resources to support implementation</li>
                        <li>Establish monitoring and evaluation systems</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-blue-500 pl-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        For Healthcare Professionals
                      </h4>
                      <p className="text-gray-700 mb-3">
                        Clinicians and healthcare workers should adapt their practices to align 
                        with evidence-based recommendations outlined in this position.
                      </p>
                      <ul className="list-disc list-inside text-gray-600 space-y-1">
                        <li>Update clinical protocols and procedures</li>
                        <li>Participate in continuing education programs</li>
                        <li>Advocate for necessary resources and support</li>
                        <li>Share experiences and best practices</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-purple-500 pl-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        For Health System Leaders
                      </h4>
                      <p className="text-gray-700 mb-3">
                        Healthcare administrators and system leaders should align organizational 
                        strategies with ACNA's evidence-based positions.
                      </p>
                      <ul className="list-disc list-inside text-gray-600 space-y-1">
                        <li>Develop implementation plans and timelines</li>
                        <li>Secure necessary funding and resources</li>
                        <li>Train staff and build capacity</li>
                        <li>Monitor progress and outcomes</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Regional Considerations */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <MapPin className="w-6 h-6 mr-2 text-green-600" />
                    Regional Implementation Considerations
                  </h3>
                  
                  <div className="space-y-4">
                    {positionStatement.countryFocus.map((country, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                          <Globe className="w-4 h-4 mr-2 text-blue-600" />
                          {country}
                        </h4>
                        <div className="text-sm text-gray-600">
                          <p className="mb-2">
                            Implementation in {country} should consider local healthcare infrastructure, 
                            regulatory environment, and resource availability.
                          </p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>Adapt to local health system structures</li>
                            <li>Consider cultural and linguistic factors</li>
                            <li>Engage with national health authorities</li>
                            <li>Build on existing programs and initiatives</li>
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Call to Action */}
                <div className="bg-gradient-to-r from-red-50 to-blue-50 border border-red-200 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Gavel className="w-6 h-6 mr-2 text-red-600" />
                    Call to Action
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    ACNA calls upon all stakeholders to actively support the implementation of these 
                    evidence-based positions. Collective action is essential to improve child 
                    neurological health outcomes across Africa.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start">
                      <Users className="w-5 h-5 mr-3 mt-0.5 text-red-600 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-gray-900">Join the Movement</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Become an advocate for evidence-based child neurology care
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Share2 className="w-5 h-5 mr-3 mt-0.5 text-red-600 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-gray-900">Share & Disseminate</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Help spread awareness of these important positions
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Support Policy Implementation
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Help us advocate for the adoption and implementation of evidence-based positions 
            that will improve neurological care for African children.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition">
              Contact Policymakers
            </button>
            <button className="border border-red-600 text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-red-50 transition">
              Share This Statement
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PositionStatementDetailPage;