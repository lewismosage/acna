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
  TrendingUp,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { PolicyBelief, policyManagementApi } from "../../../services/policyManagementApi";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import ScrollToTop from "../../../components/common/ScrollToTop";

const PolicyBeliefDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "overview" | "recommendations" | "implementation" | "impact"
  >("overview");
  const [policyBelief, setPolicyBelief] = useState<PolicyBelief | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchPolicyBelief = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const policyBeliefData = await policyManagementApi.getById(parseInt(id));
        
        // Ensure it's a PolicyBelief type
        if (policyBeliefData.type !== 'PolicyBelief') {
          throw new Error('Content is not a Policy Belief');
        }
        
        setPolicyBelief(policyBeliefData as PolicyBelief);
        // Increment view count
        await policyManagementApi.incrementView(parseInt(id), 'PolicyBelief');
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load policy belief"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPolicyBelief();
  }, [id]);

  const handleDownload = async () => {
    if (!policyBelief) return;

    setIsDownloading(true);
    try {
      // Increment download count
      await policyManagementApi.incrementDownload(policyBelief.id, 'PolicyBelief');

      // For now, we'll create a text file with the policy belief content
      const content = `
ACNA Policy Belief: ${policyBelief.title}

Category: ${policyBelief.category}
Priority: ${policyBelief.priority}
Status: ${policyBelief.status}
Date: ${new Date(policyBelief.updatedAt).toLocaleDateString()}

SUMMARY:
${policyBelief.summary}

KEY RECOMMENDATIONS:
${policyBelief.keyRecommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

TARGET AUDIENCE:
${policyBelief.targetAudience.join(', ')}

REGIONAL FOCUS:
${policyBelief.region.join(', ')}

TAGS:
${policyBelief.tags.join(', ')}

---
Generated from ACNA Policy Management System
      `.trim();

      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ACNA_Policy_Brief_${policyBelief.title.replace(/[^a-z0-9]/gi, '_')}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Update local state
      setPolicyBelief((prev) =>
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-600";
      case "Medium":
        return "bg-orange-600";
      case "Low":
        return "bg-green-600";
      default:
        return "bg-gray-600";
    }
  };

  const getPriorityTextColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "text-red-600";
      case "Medium":
        return "text-orange-600";
      case "Low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !policyBelief) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Policy Belief Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            {error || "The policy belief you're looking for doesn't exist."}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-red-600 hover:text-red-700 font-medium"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Policy Briefs
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
            Back to Policy Briefs
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Policy Belief Image */}
            <div className="lg:w-2/5">
              <div className="relative">
                <img
                  src={policyBelief.imageUrl || "https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=600"}
                  alt={policyBelief.title}
                  className="w-full h-64 lg:h-80 object-cover rounded-lg shadow-lg"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-red-600 text-white px-3 py-1 text-sm font-bold uppercase tracking-wide rounded">
                    {policyBelief.category}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className={`text-white px-3 py-1 text-sm font-bold rounded ${getPriorityColor(policyBelief.priority)}`}>
                    {policyBelief.priority} Priority
                  </span>
                </div>
              </div>
            </div>

            {/* Policy Belief Details */}
            <div className="lg:w-3/5">
              <div className="mb-4">
                <span className="text-red-600 font-medium text-sm uppercase tracking-wide">
                  Policy Belief
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                {policyBelief.title}
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-5 h-5 mr-3 text-red-600" />
                    <div>
                      <div className="font-medium">
                        {formatDate(policyBelief.updatedAt)}
                      </div>
                      <div className="text-sm">Last Updated</div>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <Target className={`w-5 h-5 mr-3 ${getPriorityTextColor(policyBelief.priority)}`} />
                    <span>{policyBelief.priority} Priority Policy</span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <Users className="w-5 h-5 mr-3 text-red-600" />
                    <span>For: {policyBelief.targetAudience.slice(0, 2).join(", ")}</span>
                    {policyBelief.targetAudience.length > 2 && (
                      <span className="text-sm ml-1">+{policyBelief.targetAudience.length - 2} more</span>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-5 h-5 mr-3 text-red-600" />
                    <span>
                      {policyBelief.region.includes("All Regions") ? "Pan-African" : policyBelief.region.join(", ")}
                    </span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <Eye className="w-5 h-5 mr-3 text-red-600" />
                    <span>{policyBelief.viewCount} views</span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <Download className="w-5 h-5 mr-3 text-red-600" />
                    <span>{policyBelief.downloadCount} downloads</span>
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
                  {isDownloading ? "Downloading..." : "Download Policy Brief"}
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
              { key: "recommendations", label: "Key Recommendations" },
              { key: "implementation", label: "Implementation" },
              { key: "impact", label: "Expected Impact" },
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
                {/* Summary */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Policy Overview
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {policyBelief.summary}
                  </p>
                </div>

                {/* Context & Background */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Context & Background
                  </h3>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-6">
                    <p className="text-gray-700 leading-relaxed">
                      This policy belief addresses critical gaps in neurological care for children across Africa. 
                      It is based on extensive research, consultation with healthcare professionals, and analysis 
                      of current healthcare delivery systems in the targeted regions.
                    </p>
                  </div>
                </div>

                {/* Key Statistics */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Policy Metrics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">{policyBelief.keyRecommendations.length}</div>
                      <div className="text-sm text-gray-600">Key Recommendations</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">{policyBelief.targetAudience.length}</div>
                      <div className="text-sm text-gray-600">Target Audiences</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600">{policyBelief.region.length}</div>
                      <div className="text-sm text-gray-600">Regions Covered</div>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {policyBelief.tags.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <Tag className="w-6 h-6 mr-2 text-red-600" />
                      Policy Areas
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {policyBelief.tags.map((tag, index) => (
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
                      <span className="font-medium">{policyBelief.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Priority:</span>
                      <span className={`font-medium ${getPriorityTextColor(policyBelief.priority)}`}>
                        {policyBelief.priority}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium text-green-600">{policyBelief.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Views:</span>
                      <span className="font-medium text-blue-600">
                        {policyBelief.viewCount}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Downloads:</span>
                      <span className="font-medium text-green-600">
                        {policyBelief.downloadCount}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Target Audience */}
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-blue-600" />
                    Target Audience
                  </h3>
                  <ul className="space-y-2">
                    {policyBelief.targetAudience.map((audience, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-blue-600 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{audience}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Regional Focus */}
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-green-600" />
                    Regional Focus
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {policyBelief.region.map((region, index) => (
                      <span
                        key={index}
                        className="bg-green-100 text-green-800 px-3 py-1 text-sm rounded-full font-medium"
                      >
                        {region}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Implementation Timeline */}
                <div className="bg-orange-50 p-6 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-orange-600" />
                    Implementation Timeline
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phase 1:</span>
                      <span className="font-medium">Immediate (0-6 months)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phase 2:</span>
                      <span className="font-medium">Short-term (6-18 months)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phase 3:</span>
                      <span className="font-medium">Long-term (18+ months)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "recommendations" && (
            <div className="max-w-4xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Key Policy Recommendations
              </h2>
              
              <div className="space-y-6">
                {policyBelief.keyRecommendations.map((recommendation, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-4">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Recommendation {index + 1}
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                          {recommendation}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs font-medium rounded">
                            {policyBelief.priority} Priority
                          </span>
                          <span className="bg-green-100 text-green-800 px-2 py-1 text-xs font-medium rounded">
                            {policyBelief.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Implementation Notes */}
              <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-yellow-600" />
                  Implementation Notes
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  These recommendations should be adapted to local contexts and resources. 
                  Implementation should involve stakeholder consultation and phased rollout 
                  to ensure sustainability and effectiveness.
                </p>
              </div>
            </div>
          )}

          {activeTab === "implementation" && (
            <div className="max-w-4xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Implementation Guidance
              </h2>
              
              <div className="space-y-8">
                {/* Implementation Phases */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">
                    Implementation Phases
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="border-l-4 border-green-500 pl-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        Phase 1: Immediate Actions (0-6 months)
                      </h4>
                      <p className="text-gray-700 mb-3">
                        Focus on policy development, stakeholder engagement, and resource identification.
                      </p>
                      <ul className="list-disc list-inside text-gray-600 space-y-1">
                        <li>Conduct stakeholder mapping and engagement</li>
                        <li>Develop policy framework documents</li>
                        <li>Secure initial funding and resources</li>
                        <li>Establish implementation team</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-orange-500 pl-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        Phase 2: Short-term Implementation (6-18 months)
                      </h4>
                      <p className="text-gray-700 mb-3">
                        Begin pilot programs and build capacity for full implementation.
                      </p>
                      <ul className="list-disc list-inside text-gray-600 space-y-1">
                        <li>Launch pilot programs in selected regions</li>
                        <li>Train healthcare professionals and policymakers</li>
                        <li>Establish monitoring and evaluation systems</li>
                        <li>Refine implementation based on early results</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-blue-500 pl-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        Phase 3: Long-term Sustainability (18+ months)
                      </h4>
                      <p className="text-gray-700 mb-3">
                        Scale successful interventions and ensure long-term sustainability.
                      </p>
                      <ul className="list-disc list-inside text-gray-600 space-y-1">
                        <li>Scale successful pilots to national level</li>
                        <li>Integrate into existing health systems</li>
                        <li>Establish sustainable funding mechanisms</li>
                        <li>Conduct comprehensive impact evaluation</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Key Stakeholders */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <Users className="w-6 h-6 mr-2 text-blue-600" />
                    Key Stakeholders
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {policyBelief.targetAudience.map((audience, index) => (
                      <div key={index} className="flex items-start p-4 bg-gray-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 mr-3 mt-0.5 text-green-600 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-gray-900">{audience}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Critical stakeholder for successful implementation
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resource Requirements */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">
                    Resource Requirements
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <FileText className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                      <h4 className="font-medium text-gray-900">Policy Development</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Legislative drafting and consultation processes
                      </p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <Users className="w-8 h-8 mx-auto text-green-600 mb-2" />
                      <h4 className="font-medium text-gray-900">Human Resources</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Training and capacity building programs
                      </p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <TrendingUp className="w-8 h-8 mx-auto text-purple-600 mb-2" />
                      <h4 className="font-medium text-gray-900">Financial Support</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Funding for implementation and sustainability
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "impact" && (
            <div className="max-w-4xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Expected Impact & Outcomes
              </h2>
              
              <div className="space-y-8">
                {/* Impact Overview */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <TrendingUp className="w-6 h-6 mr-2 text-green-600" />
                    Expected Outcomes
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    Implementation of this policy belief is expected to create significant improvements 
                    in neurological care delivery for children across the targeted regions. The impact 
                    will be measured across multiple dimensions of healthcare quality and accessibility.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-green-50 border-l-4 border-green-500 p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Healthcare Quality</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Improved diagnostic accuracy and speed</li>
                        <li>• Enhanced treatment protocols and guidelines</li>
                        <li>• Better clinical outcomes for patients</li>
                        <li>• Standardized care across regions</li>
                      </ul>
                    </div>
                    
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Healthcare Access</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Increased availability of specialized care</li>
                        <li>• Reduced geographical barriers to treatment</li>
                        <li>• More equitable distribution of resources</li>
                        <li>• Enhanced community health programs</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Measurable Outcomes */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">
                    Key Performance Indicators
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-3xl font-bold text-red-600 mb-2">25%</div>
                      <div className="text-sm font-medium text-gray-900 mb-1">Reduction in</div>
                      <div className="text-sm text-gray-600">Diagnostic delays for neurological conditions</div>
                    </div>
                    
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600 mb-2">40%</div>
                      <div className="text-sm font-medium text-gray-900 mb-1">Increase in</div>
                      <div className="text-sm text-gray-600">Access to specialized neurological care</div>
                    </div>
                    
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-3xl font-bold text-green-600 mb-2">60%</div>
                      <div className="text-sm font-medium text-gray-900 mb-1">Improvement in</div>
                      <div className="text-sm text-gray-600">Treatment adherence and outcomes</div>
                    </div>
                  </div>
                </div>

                {/* Regional Impact */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <MapPin className="w-6 h-6 mr-2 text-green-600" />
                    Regional Impact Assessment
                  </h3>
                  
                  <div className="space-y-4">
                    {policyBelief.region.map((region, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">{region}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Population Served:</span>
                            <div className="font-medium text-gray-900">
                              {region === "All Regions" ? "Continental coverage" : "Regional population"}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Expected Timeline:</span>
                            <div className="font-medium text-gray-900">2-3 years for full impact</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Key Benefits:</span>
                            <div className="font-medium text-gray-900">Improved care coordination</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Success Metrics:</span>
                            <div className="font-medium text-gray-900">Clinical outcomes tracking</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Long-term Vision */}
                <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Star className="w-6 h-6 mr-2 text-blue-600" />
                    Long-term Vision
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    The successful implementation of this policy belief will contribute to a transformed 
                    landscape of pediatric neurological care in Africa, where every child has access to 
                    timely, quality, and culturally appropriate neurological healthcare services.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start">
                      <CheckCircle className="w-5 h-5 mr-3 mt-0.5 text-green-600 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-gray-900">Sustainable Healthcare Systems</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Self-sustaining neurological care networks across Africa
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <CheckCircle className="w-5 h-5 mr-3 mt-0.5 text-green-600 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-gray-900">Enhanced Capacity</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Trained workforce and strengthened health systems
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <CheckCircle className="w-5 h-5 mr-3 mt-0.5 text-green-600 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-gray-900">Equitable Access</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Reduced disparities in neurological care access
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <CheckCircle className="w-5 h-5 mr-3 mt-0.5 text-green-600 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-gray-900">Research Excellence</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          African-led research in pediatric neurology
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Monitoring & Evaluation */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">
                    Monitoring & Evaluation Framework
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Baseline Assessment</h4>
                      <p className="text-sm text-gray-600">
                        Comprehensive evaluation of current neurological care capacity and gaps
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Progress Monitoring</h4>
                      <p className="text-sm text-gray-600">
                        Quarterly reviews of implementation milestones and outcome indicators
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Impact Evaluation</h4>
                      <p className="text-sm text-gray-600">
                        Annual comprehensive assessment of policy impact on health outcomes
                      </p>
                    </div>
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

export default PolicyBeliefDetailPage;