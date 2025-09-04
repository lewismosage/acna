import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Download,
  Search,
  Filter,
  User,
  ChevronDown,
  Star,
  Bookmark,
  ArrowRight,
  AlertCircle,
  FileText,
} from "lucide-react";
import ScrollToTop from "../../../components/common/ScrollToTop";
import { EBooklet, ebookletsApi } from "../../../services/ebookletsApi";
import LoadingSpinner from "../../../components/common/LoadingSpinner";

const EBooklets = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [selectedAudience, setSelectedAudience] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [allEBooklets, setAllEBooklets] = useState<EBooklet[]>([]);
  const [featuredEBooklets, setFeaturedEBooklets] = useState<EBooklet[]>([]);
  const [categories, setCategories] = useState<string[]>(["all"]);
  const [audiences, setAudiences] = useState<string[]>(["all"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllFeatured, setShowAllFeatured] = useState(false);
  const [visibleEBooklets, setVisibleEBooklets] = useState(8);

  const languages = [
    "all",
    "English",
    "French",
    "Swahili",
    "Arabic",
    "Portuguese",
    "Hausa",
    "Yoruba",
    "Amharic",
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [ebookletsData, featuredData, categoriesData, audiencesData] =
          await Promise.all([
            ebookletsApi.getAll({ status: "Published" }),
            ebookletsApi.getFeatured(),
            ebookletsApi.getCategories(),
            ebookletsApi.getTargetAudiences(),
          ]);

        setAllEBooklets(ebookletsData);
        setFeaturedEBooklets(featuredData);
        setCategories(["all", ...categoriesData]);
        setAudiences(["all", ...audiencesData]);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load e-booklets"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredEBooklets = allEBooklets.filter((ebooklet) => {
    const matchesCategory =
      selectedCategory === "all" || ebooklet.category === selectedCategory;
    const matchesLanguage =
      selectedLanguage === "all" || ebooklet.language === selectedLanguage;
    const matchesAudience =
      selectedAudience === "all" ||
      ebooklet.targetAudience.some((aud) => aud === selectedAudience);
    const matchesSearch =
      ebooklet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ebooklet.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ebooklet.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );

    return (
      matchesCategory && matchesLanguage && matchesAudience && matchesSearch
    );
  });

  const displayedEBooklets = filteredEBooklets.slice(0, visibleEBooklets);
  const hasMoreEBooklets = visibleEBooklets < filteredEBooklets.length;

  const loadMoreEBooklets = () => {
    setVisibleEBooklets((prev) => prev + 8);
  };

  const displayedFeaturedEBooklets = showAllFeatured
    ? featuredEBooklets
    : featuredEBooklets.slice(0, 3);

  const handleEBookletClick = (ebookletId: number) => {
    navigate(`/e-booklets/${ebookletId}`);
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
  const NoContentCard = ({ type }: { type: "featured" | "all" }) => (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center max-w-md mx-auto">
      <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No {type === "featured" ? "Featured E-Booklets" : "E-Booklets"}{" "}
        Available
      </h3>
      <p className="text-gray-600 mb-4">
        {type === "featured"
          ? "Check back later for featured e-booklets."
          : "Try adjusting your search or filter criteria."}
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
            E-Booklets
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 font-light max-w-3xl mx-auto mb-8">
            Downloadable educational resources for pediatric neurological
            conditions
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-gray-600">
            <div className="flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-red-600" />
              <span>{allEBooklets.length} E-Booklets Available</span>
            </div>
            <div className="flex items-center">
              <Download className="w-5 h-5 mr-2 text-red-600" />
              <span>Over 50K Downloads</span>
            </div>
            <div className="flex items-center">
              <User className="w-5 h-5 mr-2 text-red-600" />
              <span>Available in Multiple Languages</span>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
              About Our E-Booklets
            </h2>
            <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
          </div>

          <div className="space-y-6 text-gray-700 leading-relaxed text-lg">
            <p>
              Our collection of e-booklets provides reliable, culturally
              appropriate information about pediatric neurological conditions
              tailored specifically for African audiences. Developed by ACNA's
              expert team, these resources translate complex medical information
              into accessible formats for families, educators, and healthcare
              workers.
            </p>
            <p>
              Each booklet undergoes rigorous review by our medical advisory
              board and is tested with community groups to ensure clarity and
              cultural relevance. We prioritize information that addresses the
              unique challenges faced by African children with neurological
              conditions and their caregivers.
            </p>
            <p>
              All resources are available for free download in multiple
              languages and formats to ensure accessibility across different
              devices and literacy levels.
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
                placeholder="Search e-booklets by title, description or tags..."
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
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
              >
                {languages.map((language) => (
                  <option key={language} value={language}>
                    {language === "all" ? "All Languages" : language}
                  </option>
                ))}
              </select>

              <select
                value={selectedAudience}
                onChange={(e) => setSelectedAudience(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
              >
                {audiences.map((audience) => (
                  <option key={audience} value={audience}>
                    {audience === "all" ? "All Audiences" : audience}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* E-Booklets List */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          {/* Featured E-Booklets */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Bookmark className="w-6 h-6 text-red-600 mr-2" />
              Featured E-Booklets
            </h2>

            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <ErrorCard
                message={error}
                onRetry={() => window.location.reload()}
              />
            ) : featuredEBooklets.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedFeaturedEBooklets.map((ebooklet) => (
                    <div
                      key={ebooklet.id}
                      className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-red-200 hover:border-red-300 transition-all duration-200 hover:shadow-xl"
                    >
                      <div className="relative">
                        <img
                          src={ebooklet.imageUrl}
                          alt={ebooklet.title}
                          className="w-full h-40 object-cover"
                        />
                        <div className="absolute top-2 left-2">
                          <span className="bg-green-600 text-white px-2 py-1 text-xs font-bold rounded">
                            FEATURED
                          </span>
                        </div>
                      </div>

                      <div className="p-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">
                          {ebooklet.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {ebooklet.description}
                        </p>

                        <div className="flex items-center text-xs text-gray-500 gap-3 mb-3">
                          <div className="flex items-center">
                            <FileText className="w-3 h-3 mr-1" />
                            {ebooklet.pages} pages
                          </div>
                          <div className="flex items-center">
                            <Download className="w-3 h-3 mr-1" />
                            {ebooklet.fileSize}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 mb-3">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded">
                            {ebooklet.category}
                          </span>
                          {ebooklet.tags.slice(0, 1).map((tag, index) => (
                            <span
                              key={index}
                              className="bg-purple-100 text-purple-800 px-2 py-1 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="mb-3 text-sm">
                          <p className="font-medium text-gray-900 text-xs">
                            {ebooklet.authors[0]}
                          </p>
                          {ebooklet.authors.length > 1 && (
                            <p className="text-xs text-gray-500">
                              +{ebooklet.authors.length - 1} more
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between mb-3">
                          <div className="text-xs text-gray-500">
                            <span>{ebooklet.downloadCount} downloads</span>
                          </div>
                          {renderRatingStars(ebooklet.rating)}
                        </div>

                        <div className="space-y-2">
                          <button
                            onClick={() => handleEBookletClick(ebooklet.id)}
                            className="w-full bg-red-600 text-white text-center py-2 px-3 rounded-md hover:bg-red-700 transition-colors font-medium text-sm flex items-center justify-center"
                          >
                            View Details
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {featuredEBooklets.length > 3 && (
                  <div className="text-center mt-6">
                    <button
                      onClick={() => setShowAllFeatured(!showAllFeatured)}
                      className="text-red-600 hover:text-red-700 font-medium flex items-center justify-center mx-auto"
                    >
                      {showAllFeatured
                        ? "Show Less"
                        : `View All ${featuredEBooklets.length} Featured E-Booklets`}
                      <ChevronDown
                        className={`w-4 h-4 ml-1 transition-transform ${
                          showAllFeatured ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <NoContentCard type="featured" />
            )}
          </div>

          {/* All E-Booklets */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              All E-Booklets
              <span className="text-gray-500 text-lg font-normal ml-2">
                ({filteredEBooklets.length})
              </span>
            </h2>

            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <ErrorCard
                message={error}
                onRetry={() => window.location.reload()}
              />
            ) : displayedEBooklets.length > 0 ? (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {displayedEBooklets.map((ebooklet) => (
                    <div
                      key={ebooklet.id}
                      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-200 hover:border-red-200"
                    >
                      <div className="relative">
                        <img
                          src={ebooklet.imageUrl}
                          alt={ebooklet.title}
                          className="w-full h-32 object-cover"
                        />
                      </div>

                      <div className="p-3">
                        <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">
                          {ebooklet.title}
                        </h3>

                        <div className="flex flex-wrap gap-1 mb-2">
                          <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 text-xs rounded">
                            {ebooklet.category}
                          </span>
                        </div>

                        <div className="flex items-center text-xs text-gray-500 gap-2 mb-2">
                          <div className="flex items-center">
                            <FileText className="w-3 h-3 mr-1" />
                            <span className="truncate">
                              {ebooklet.pages} pages
                            </span>
                          </div>
                        </div>

                        <div className="text-xs mb-2">
                          <p className="font-medium text-gray-900 truncate">
                            {ebooklet.authors[0]}
                          </p>
                          {ebooklet.authors.length > 1 && (
                            <p className="text-gray-500">
                              +{ebooklet.authors.length - 1} more
                            </p>
                          )}
                        </div>

                        <div className="space-y-1">
                          <button
                            onClick={() => handleEBookletClick(ebooklet.id)}
                            className="w-full text-red-600 hover:text-red-700 font-medium py-1.5 px-3 border border-red-200 rounded-md hover:bg-red-50 transition-colors text-xs flex items-center justify-center"
                          >
                            Details
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Load More Button */}
                {hasMoreEBooklets && (
                  <div className="text-center mt-8">
                    <button
                      onClick={loadMoreEBooklets}
                      className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                    >
                      Load More E-Booklets
                    </button>
                    <p className="text-sm text-gray-500 mt-2">
                      Showing {displayedEBooklets.length} of{" "}
                      {filteredEBooklets.length} e-booklets
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <NoContentCard type="all" />
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default EBooklets;
