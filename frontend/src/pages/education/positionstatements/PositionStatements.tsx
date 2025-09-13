import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Calendar,
  AlertCircle,
  Eye,
  Filter,
  Search,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import ScrollToTop from "../../../components/common/ScrollToTop";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import {
  policyManagementApi,
  PositionalStatement,
} from "../../../services/policyManagementApi";

const PositionStatements = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [expandedStatement, setExpandedStatement] = useState<number | null>(null);
  const [positionStatements, setPositionStatements] = useState<PositionalStatement[]>([]);
  const [categories, setCategories] = useState<string[]>(["all"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleStatements, setVisibleStatements] = useState(8);

  const statuses = ["all", "Published"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch only published positional statements
        const data = await policyManagementApi.getAll({
          type: "PositionalStatement",
          status: "Published",
        });

        const publishedStatements = data.filter(
          (item): item is PositionalStatement => 
            item.type === "PositionalStatement" && item.status === "Published"
        );

        setPositionStatements(publishedStatements);

        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(publishedStatements.map(statement => statement.category))
        ).filter(Boolean);
        
        setCategories(["all", ...uniqueCategories]);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load position statements"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredStatements = positionStatements.filter((statement) => {
    const matchesCategory = selectedCategory === "all" || statement.category === selectedCategory;
    const matchesStatus = selectedStatus === "all" || statement.status === selectedStatus;
    const matchesSearch =
      statement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      statement.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      statement.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const displayedStatements = filteredStatements.slice(0, visibleStatements);
  const hasMoreStatements = visibleStatements < filteredStatements.length;

  const loadMoreStatements = () => {
    setVisibleStatements(prev => prev + 8);
  };

  const handleViewDetails = async (id: number) => {
    try {
      await policyManagementApi.incrementView(id, "PositionalStatement");
      navigate(`/position-statements/${id}`);
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
      <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No position statements found
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
            Position Statements
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 font-light max-w-3xl mx-auto mb-8">
            ACNA's official positions on critical child neurology issues
            affecting African children and healthcare systems.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-gray-600">
            <div className="flex items-center">
              <FileText className="w-5 h-5 mr-2 text-red-600" />
              <span>{positionStatements.length} Official Statements</span>
            </div>
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
              <span>
                {positionStatements.length} Published Statements
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
              About Our Position Statements
            </h2>
            <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
          </div>

          <div className="space-y-6 text-gray-700 leading-relaxed text-lg">
            <p>
              ACNA's position statements represent our organization's official
              stance on critical issues affecting child neurological health
              across Africa. These evidence-based documents serve as
              authoritative resources for policymakers, healthcare
              professionals, and advocates working to improve neurological care
              for children.
            </p>
            <p>
              Each position statement is developed through rigorous consultation
              with our network of pediatric neurologists, researchers, and
              healthcare professionals across the continent. They reflect
              current scientific evidence, best practices, and the unique
              challenges facing African healthcare systems.
            </p>
            <p>
              Our position statements are designed to influence policy
              development, guide clinical practice, advocate for systemic
              changes, and promote awareness of critical neurological health
              issues affecting African children.
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
                placeholder="Search position statements..."
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
            </div>
          </div>
        </div>
      </section>

      {/* Position Statements List */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <ErrorCard
              message={error}
              onRetry={() => window.location.reload()}
            />
          ) : displayedStatements.length > 0 ? (
            <div className="space-y-8">
              {displayedStatements.map((statement) => (
                <div
                  key={statement.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden border border-gray-200"
                >
                  <div className="flex flex-col lg:flex-row">
                    {/* Image */}
                    {statement.imageUrl && (
                      <div className="lg:w-64 h-48 lg:h-auto flex-shrink-0">
                        <img
                          src={statement.imageUrl}
                          alt={statement.title}
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
                              {statement.category}
                            </span>
                            {statement.countryFocus && statement.countryFocus.length > 0 && (
                              statement.countryFocus.map((country, index) => (
                                <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 text-xs font-medium rounded">
                                  {country}
                                </span>
                              ))
                            )}
                          </div>

                          <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight hover:text-red-600 transition-colors cursor-pointer">
                            {statement.title}
                          </h3>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-2 sm:mt-0">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(statement.updatedAt).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <Eye className="w-4 h-4 mr-1" />
                            {statement.viewCount}
                          </div>
                          {statement.pageCount > 0 && (
                            <span>{statement.pageCount} pages</span>
                          )}
                        </div>
                      </div>

                      {/* Summary */}
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        {statement.summary}
                      </p>

                      {/* Key Points Preview */}
                      {expandedStatement === statement.id ? (
                        <div className="mb-4">
                          <h4 className="font-semibold text-gray-900 mb-2">
                            Key Policy Points:
                          </h4>
                          <ul className="space-y-1 text-sm text-gray-600">
                            {statement.keyPoints.map((point, index) => (
                              <li key={index} className="flex items-start">
                                <ChevronRight className="w-4 h-4 mr-1 mt-0.5 text-red-600 flex-shrink-0" />
                                {point}
                              </li>
                            ))}
                          </ul>

                          {statement.relatedPolicies && statement.relatedPolicies.length > 0 && (
                            <div className="mt-4">
                              <h4 className="font-semibold text-gray-900 mb-2">
                                Related Policies:
                              </h4>
                              <div className="flex flex-wrap gap-1">
                                {statement.relatedPolicies.map((policy, index) => (
                                  <span
                                    key={index}
                                    className="bg-gray-100 text-gray-700 px-2 py-1 text-xs rounded"
                                  >
                                    {policy}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {statement.tags && statement.tags.length > 0 && (
                            <div className="mt-4">
                              <h4 className="font-semibold text-gray-900 mb-2">
                                Tags:
                              </h4>
                              <div className="flex flex-wrap gap-1">
                                {statement.tags.map((tag, index) => (
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
                            Key areas:{" "}
                            {statement.keyPoints.slice(0, 2).join(", ")}
                            {statement.keyPoints.length > 2 &&
                              ` and ${statement.keyPoints.length - 2} more...`}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                        <button
                          onClick={() =>
                            setExpandedStatement(
                              expandedStatement === statement.id
                                ? null
                                : statement.id
                            )
                          }
                          className="text-red-600 font-medium hover:text-red-700 text-sm self-start"
                        >
                          {expandedStatement === statement.id
                            ? "Show Less"
                            : "Read More"}{" "}
                          {expandedStatement === statement.id ? (
                            <ChevronUp className="inline ml-1 w-4 h-4" />
                          ) : (
                            <ChevronDown className="inline ml-1 w-4 h-4" />
                          )}
                        </button>

                        <div className="flex gap-3">
                          <button 
                            onClick={() => handleViewDetails(statement.id)}
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
              {hasMoreStatements && (
                <div className="text-center mt-8">
                  <button
                    onClick={loadMoreStatements}
                    className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                  >
                    Load More Statements
                  </button>
                  <p className="text-sm text-gray-500 mt-2">
                    Showing {displayedStatements.length} of{" "}
                    {filteredStatements.length} position statements
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
            Have a Position Statement Topic?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            ACNA welcomes input on critical issues that require official position statements to guide policy and practice.
          </p>
          <button className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition">
            Suggest a Topic
          </button>
        </div>
      </section>
    </div>
  );
};

export default PositionStatements;