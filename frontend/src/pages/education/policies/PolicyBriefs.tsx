import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  AlertCircle,
  Eye,
  Filter,
  Search,
  ChevronRight,
  BookOpen,
  ClipboardList,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import ScrollToTop from "../../../components/common/ScrollToTop";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import {
  policyManagementApi,
  PolicyBelief,
} from "../../../services/policyManagementApi";

const PolicyBriefs = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [expandedBrief, setExpandedBrief] = useState<number | null>(null);
  const [policyBriefs, setPolicyBriefs] = useState<PolicyBelief[]>([]);
  const [categories, setCategories] = useState<string[]>(["all"]);
  const [regions, setRegions] = useState<string[]>(["all"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleBriefs, setVisibleBriefs] = useState(8);

  const statuses = ["all", "Published"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch only published policy beliefs
        const data = await policyManagementApi.getAll({
          type: "PolicyBelief",
          status: "Published",
        });

        const publishedBriefs = data.filter(
          (item): item is PolicyBelief => 
            item.type === "PolicyBelief" && item.status === "Published"
        );

        setPolicyBriefs(publishedBriefs);

        // Extract unique categories and regions
        const uniqueCategories = Array.from(
          new Set(publishedBriefs.map(brief => brief.category))
        ).filter(Boolean);
        
        const uniqueRegions = Array.from(
          new Set(
            publishedBriefs.flatMap(brief => brief.region || [])
          )
        ).filter(Boolean);

        setCategories(["all", ...uniqueCategories]);
        setRegions(["all", "All Regions", ...uniqueRegions]);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load policy briefs"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredBriefs = policyBriefs.filter((brief) => {
    const matchesCategory = selectedCategory === "all" || brief.category === selectedCategory;
    const matchesStatus = selectedStatus === "all" || brief.status === selectedStatus;
    const matchesRegion = selectedRegion === "all" || 
                         (brief.region && (
                           brief.region.includes(selectedRegion) ||
                           (selectedRegion === "All Regions" && brief.region.includes("All Regions"))
                         ));
    const matchesSearch =
      brief.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brief.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brief.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesStatus && matchesRegion && matchesSearch;
  });

  const displayedBriefs = filteredBriefs.slice(0, visibleBriefs);
  const hasMoreBriefs = visibleBriefs < filteredBriefs.length;

  const loadMoreBriefs = () => {
    setVisibleBriefs(prev => prev + 8);
  };

  const getPriorityColor = (priority: string) => {
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

  const handleViewDetails = async (id: number) => {
    try {
      await policyManagementApi.incrementView(id, "PolicyBelief");
      navigate(`/policy-briefs/${id}`);
    } catch (error) {
      console.error("Error incrementing view count:", error);
    }
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
        Error Loading Content
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
      <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No policy briefs found
      </h3>
      <p className="text-gray-600">
        Try adjusting your search or filter criteria.
      </p>
    </div>
  );

  return (
    <div className="bg-white min-h-screen">
      <ScrollToTop />
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-6">
            Policy Briefs & Recommendations
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 font-light max-w-3xl mx-auto mb-8">
            Evidence-based policy recommendations to improve child neurological health outcomes across Africa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-gray-600">
            <div className="flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-red-600" />
              <span>{policyBriefs.length} Policy Briefs</span>
            </div>
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
              <span>
                {policyBriefs.filter((b) => b.priority === "High").length}{" "}
                High Priority Recommendations
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
              About Our Policy Briefs
            </h2>
            <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
          </div>

          <div className="space-y-6 text-gray-700 leading-relaxed text-lg">
            <p>
              ACNA's policy briefs provide concise, actionable recommendations for 
              policymakers, healthcare leaders, and advocates working to improve 
              neurological care for African children. Each brief synthesizes current 
              evidence with practical implementation guidance tailored to African contexts.
            </p>
            <p>
              Our recommendations are developed through rigorous research and consultation 
              with our network of pediatric neurologists, public health experts, and 
              policymakers across the continent. They address critical gaps in policy, 
              service delivery, and health system strengthening for child neurological care.
            </p>
            <p>
              These briefs are designed to inform national health strategies, guide 
              program development, and advocate for policy changes that will improve 
              outcomes for children with neurological conditions across Africa.
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-gray-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search policy briefs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-600" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category === "all" ? "All Categories" : category}
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status === "all" ? "All Statuses" : status}
                  </option>
                ))}
              </select>

              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
              >
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {region === "all" ? "All Regions" : region}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Policy Briefs List */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <ErrorCard
              message={error}
              onRetry={() => window.location.reload()}
            />
          ) : displayedBriefs.length > 0 ? (
            <div className="space-y-8">
              {displayedBriefs.map((brief) => (
                <div
                  key={brief.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden border border-gray-200"
                >
                  <div className="flex flex-col lg:flex-row">
                    {/* Image */}
                    {brief.imageUrl && (
                      <div className="lg:w-64 h-48 lg:h-auto flex-shrink-0">
                        <img
                          src={brief.imageUrl}
                          alt={brief.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 p-6">
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className="bg-green-100 text-green-800 px-2 py-1 text-xs font-medium rounded">
                              Published
                            </span>
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs font-medium rounded">
                              {brief.category}
                            </span>
                            <span
                              className={`text-xs font-medium ${getPriorityColor(
                                brief.priority
                              )}`}
                            >
                              {brief.priority} Priority
                            </span>
                            {brief.region && brief.region.includes("All Regions") ? (
                              <span className="bg-purple-100 text-purple-800 px-2 py-1 text-xs font-medium rounded">
                                Pan-African
                              </span>
                            ) : (
                              brief.region && brief.region.map((region, index) => (
                                <span key={index} className="bg-green-100 text-green-800 px-2 py-1 text-xs font-medium rounded">
                                  {region}
                                </span>
                              ))
                            )}
                          </div>

                          <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight hover:text-red-600 transition-colors cursor-pointer">
                            {brief.title}
                          </h3>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-2 sm:mt-0">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(brief.updatedAt).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <Eye className="w-4 h-4 mr-1" />
                            {brief.viewCount}
                          </div>
                        </div>
                      </div>

                      {/* Summary */}
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        {brief.summary}
                      </p>

                      {/* Key Recommendations Preview */}
                      {expandedBrief === brief.id ? (
                        <div className="mb-4">
                          <h4 className="font-semibold text-gray-900 mb-2">
                            Key Recommendations:
                          </h4>
                          <ul className="space-y-1 text-sm text-gray-600">
                            {brief.keyRecommendations.map((recommendation, index) => (
                              <li key={index} className="flex items-start">
                                <ChevronRight className="w-4 h-4 mr-1 mt-0.5 text-red-600 flex-shrink-0" />
                                {recommendation}
                              </li>
                            ))}
                          </ul>

                          {brief.targetAudience && brief.targetAudience.length > 0 && (
                            <div className="mt-4">
                              <h4 className="font-semibold text-gray-900 mb-2">
                                Target Audience:
                              </h4>
                              <div className="flex flex-wrap gap-1">
                                {brief.targetAudience.map(
                                  (audience, index) => (
                                    <span
                                      key={index}
                                      className="bg-gray-100 text-gray-700 px-2 py-1 text-xs rounded"
                                    >
                                      {audience}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                          {brief.tags && brief.tags.length > 0 && (
                            <div className="mt-4">
                              <h4 className="font-semibold text-gray-900 mb-2">
                                Tags:
                              </h4>
                              <div className="flex flex-wrap gap-1">
                                {brief.tags.map((tag, index) => (
                                  <span
                                    key={index}
                                    className="bg-gray-100 text-gray-700 px-2 py-1 text-xs rounded"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600">
                            Key recommendations:{" "}
                            {brief.keyRecommendations.slice(0, 2).join(", ")}
                            {brief.keyRecommendations.length > 2 &&
                              ` and ${brief.keyRecommendations.length - 2} more...`}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                        <button
                          onClick={() =>
                            setExpandedBrief(
                              expandedBrief === brief.id
                                ? null
                                : brief.id
                            )
                          }
                          className="text-red-600 font-medium hover:text-red-700 text-sm self-start"
                        >
                          {expandedBrief === brief.id
                            ? "Show Less"
                            : "Read More"}{" "}
                          {expandedBrief === brief.id ? (
                            <ChevronUp className="inline ml-1 w-4 h-4" />
                          ) : (
                            <ChevronDown className="inline ml-1 w-4 h-4" />
                          )}
                        </button>

                        <div className="flex gap-3">
                          <button 
                            onClick={() => handleViewDetails(brief.id)}
                            className="flex items-center border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Load More Button */}
              {hasMoreBriefs && (
                <div className="text-center mt-8">
                  <button
                    onClick={loadMoreBriefs}
                    className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                  >
                    Load More Briefs
                  </button>
                  <p className="text-sm text-gray-500 mt-2">
                    Showing {displayedBriefs.length} of{" "}
                    {filteredBriefs.length} policy briefs
                  </p>
                </div>
              )}
            </div>
          ) : (
            <NoContentCard />
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Need Custom Policy Recommendations?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Our team can develop tailored policy briefs and recommendations for your specific context or region.
          </p>
          <button className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition">
            Request Policy Support
          </button>
        </div>
      </section>
    </div>
  );
};

export default PolicyBriefs;