import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Search,
  Filter,
  Calendar,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Globe,
  User,
  Hash,
  AlertCircle,
} from "lucide-react";
import ScrollToTop from "../../../components/common/ScrollToTop";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import {
  journalArticlesApi,
  JournalArticle,
} from "../../../services/journalWatchAPI";

const JournalWatch = () => {
  const navigate = useNavigate();
  const [selectedStudyType, setSelectedStudyType] = useState<string>("all");
  const [selectedRelevance, setSelectedRelevance] = useState<string>("all");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [expandedArticle, setExpandedArticle] = useState<number | null>(null);
  const [journalArticles, setJournalArticles] = useState<JournalArticle[]>([]);
  const [studyTypes, setStudyTypes] = useState<string[]>(["all"]);
  const [countries, setCountries] = useState<string[]>(["all"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleArticles, setVisibleArticles] = useState(8);

  const relevanceLevels = ["all", "High", "Medium", "Low"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [articlesData, studyTypesData, countriesData] = await Promise.all(
          [
            journalArticlesApi.getAll(),
            journalArticlesApi.getStudyTypes(),
            journalArticlesApi.getCountries(),
          ]
        );

        setJournalArticles(articlesData);
        setStudyTypes(["all", ...studyTypesData]);
        setCountries(["all", ...countriesData]);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load journal articles"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredArticles = journalArticles.filter((article) => {
    const matchesStudyType =
      selectedStudyType === "all" || article.studyType === selectedStudyType;
    const matchesRelevance =
      selectedRelevance === "all" || article.relevance === selectedRelevance;
    const matchesCountry =
      selectedCountry === "all" ||
      article.countryFocus.includes(selectedCountry);
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );

    return (
      matchesStudyType && matchesRelevance && matchesCountry && matchesSearch
    );
  });

  const displayedArticles = filteredArticles.slice(0, visibleArticles);
  const hasMoreArticles = visibleArticles < filteredArticles.length;

  const loadMoreArticles = () => {
    setVisibleArticles((prev) => prev + 8);
  };

  const getRelevanceColor = (relevance: string) => {
    switch (relevance) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleViewArticle = async (id: number) => {
    try {
      await journalArticlesApi.incrementView(id);
      // Navigate to the detail page
      navigate(`/journal-watch/${id}`);
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
      <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No Journal Articles Available
      </h3>
      <p className="text-gray-600 mb-4">
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
            Journal Watch
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 font-light max-w-3xl mx-auto mb-8">
            Curated summaries of recent pediatric neurology research relevant to
            African contexts
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-gray-600">
            <div className="flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-red-600" />
              <span>{journalArticles.length} Article Summaries</span>
            </div>
            <div className="flex items-center">
              <Globe className="w-5 h-5 mr-2 text-red-600" />
              <span>
                {
                  journalArticles.filter((a) => a.countryFocus.length > 1)
                    .length
                }{" "}
                Multi-Country Studies
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
              About Journal Watch
            </h2>
            <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
          </div>

          <div className="space-y-6 text-gray-700 leading-relaxed text-lg">
            <p>
              Our Journal Watch service provides busy clinicians and researchers
              with concise, critical summaries of the latest pediatric neurology
              research with particular relevance to African populations and
              healthcare contexts.
            </p>
            <p>
              Each summary is prepared by ACNA's expert reviewers who evaluate
              the methodology, findings, and practical implications of recent
              publications. We highlight studies that advance understanding of
              neurological conditions affecting African children or offer
              insights applicable to resource-limited settings.
            </p>
            <p>
              Stay current with the evidence base while saving time - our team
              reads the journals so you don't have to.
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
                placeholder="Search articles by title, summary or tags..."
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
                  value={selectedStudyType}
                  onChange={(e) => setSelectedStudyType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                >
                  {studyTypes.map((type) => (
                    <option key={type} value={type}>
                      {type === "all" ? "All Study Types" : type}
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={selectedRelevance}
                onChange={(e) => setSelectedRelevance(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
              >
                {relevanceLevels.map((level) => (
                  <option key={level} value={level}>
                    {level === "all" ? "All Relevance" : level}
                  </option>
                ))}
              </select>

              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
              >
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country === "all" ? "All Countries" : country}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Articles List */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <ErrorCard
              message={error}
              onRetry={() => window.location.reload()}
            />
          ) : displayedArticles.length > 0 ? (
            <div className="space-y-8">
              {displayedArticles.map((article) => (
                <div
                  key={article.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden border border-gray-200"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${getRelevanceColor(
                              article.relevance
                            )}`}
                          >
                            {article.relevance} Relevance
                          </span>
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs font-medium rounded">
                            {article.studyType}
                          </span>
                          {article.countryFocus.map((country, index) => (
                            <span
                              key={index}
                              className="bg-green-100 text-green-800 px-2 py-1 text-xs font-medium rounded"
                            >
                              {country}
                            </span>
                          ))}
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight hover:text-red-600 transition-colors cursor-pointer">
                          {article.title}
                        </h3>
                      </div>
                    </div>

                    {/* Authors and Journal */}
                    <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-600 mb-4 gap-2">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {article.authors}
                      </div>
                      <span className="hidden sm:block">•</span>
                      <div className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        {article.journal}
                      </div>
                      <span className="hidden sm:block">•</span>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {article.publicationDate}
                      </div>
                    </div>

                    {/* Summary */}
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {article.summary}
                    </p>

                    {/* Key Findings Preview */}
                    {expandedArticle === article.id ? (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Key Findings:
                        </h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                          {article.keyFindings.map((finding, index) => (
                            <li key={index} className="flex items-start">
                              <Hash className="w-4 h-4 mr-2 mt-0.5 text-red-600 flex-shrink-0" />
                              {finding}
                            </li>
                          ))}
                        </ul>

                        {article.commentary && (
                          <div className="mt-4 bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg">
                            <h4 className="font-semibold text-gray-900 mb-2">
                              ACNA Commentary:
                            </h4>
                            <p className="text-gray-700 text-sm">
                              {article.commentary}
                            </p>
                          </div>
                        )}

                        <div className="mt-4">
                          <h4 className="font-semibold text-gray-900 mb-2">
                            Population:
                          </h4>
                          <p className="text-sm text-gray-600">
                            {article.population}
                            </p>
                        </div>

                        <div className="mt-3">
                          <h4 className="font-semibold text-gray-900 mb-2">
                            Tags:
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {article.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="bg-gray-100 text-gray-700 px-2 py-1 text-xs rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600">
                          Key findings: {article.keyFindings[0]}
                          {article.keyFindings.length > 1 &&
                            ` and ${article.keyFindings.length - 1} more...`}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                      <button
                        onClick={() =>
                          setExpandedArticle(
                            expandedArticle === article.id ? null : article.id
                          )
                        }
                        className="text-red-600 font-medium hover:text-red-700 text-sm self-start"
                      >
                        {expandedArticle === article.id
                          ? "Show Less"
                          : "Read More"}{ " "}
                        {expandedArticle === article.id ? (
                          <ChevronUp className="inline ml-1 w-4 h-4" />
                        ) : (
                          <ChevronDown className="inline ml-1 w-4 h-4" />
                        )}
                      </button>

                      <div className="flex gap-3">
                        <button
                          onClick={() => handleViewArticle(article.id)}
                          className="flex items-center bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Load More Button */}
              {hasMoreArticles && (
                <div className="text-center mt-8">
                  <button
                    onClick={loadMoreArticles}
                    className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                  >
                    Load More Articles
                  </button>
                  <p className="text-sm text-gray-500 mt-2">
                    Showing {displayedArticles.length} of{" "}
                    {filteredArticles.length} articles
                  </p>
                </div>
              )}
            </div>
          ) : (
            <NoContentCard />
          )}
        </div>
      </section>
    </div>
  );
};

export default JournalWatch;