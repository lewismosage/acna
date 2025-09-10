import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Download,
  FileText,
  Users,
  Brain,
  Search,
  Filter,
  ArrowRight,
  AlertCircle,
  Eye,
  Calendar,
} from "lucide-react";
import CaseStudies from "./CaseStudies";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import ScrollToTop from "../../../components/common/ScrollToTop";
import {
  EducationalResource,
  educationalResourcesApi,
  CaseStudySubmission,
} from "../../../services/educationalResourcesApi";

const FactSheetsAndCaseStudies = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<"factsheets" | "casestudies">(
    (searchParams.get('tab') as "factsheets" | "casestudies") || "factsheets"
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [factSheets, setFactSheets] = useState<EducationalResource[]>([]);
  const [caseStudies, setCaseStudies] = useState<CaseStudySubmission[]>([]);
  const [categories, setCategories] = useState<string[]>(["all"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleFactSheets, setVisibleFactSheets] = useState(9);

  // Case study categories for filtering
  const caseStudyCategories = [
    "all",
    "Epilepsy Care",
    "Mobile Health",
    "Telemedicine",
    "Community Engagement",
    "Early Intervention",
    "Capacity Building",
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch fact sheets and case studies in parallel
        const [factSheetsData, categoriesData, caseStudiesData] = await Promise.all([
          educationalResourcesApi.getAll({ 
            type: 'Fact Sheet', 
            status: 'Published' 
          }),
          educationalResourcesApi.getCategories(),
          // Fetch case studies with either 'Approved' or 'Published' status
          Promise.all([
            educationalResourcesApi.getSubmissions({ status: 'Approved' }).catch(() => []),
            educationalResourcesApi.getSubmissions({ status: 'Published' }).catch(() => [])
          ]).then(([approved, published]) => {
            // Combine and deduplicate
            const allStudies = [...approved, ...published];
            return allStudies.filter((study, index, self) => 
              index === self.findIndex(s => s.id === study.id)
            );
          })
        ]);

        setFactSheets(factSheetsData);
        setCaseStudies(caseStudiesData);
        setCategories(["all", ...categoriesData]);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load resources"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredFactSheets = factSheets.filter((sheet) => {
    const matchesCategory =
      selectedCategory === "all" || sheet.category === selectedCategory;
    const matchesSearch =
      sheet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sheet.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sheet.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesCategory && matchesSearch;
  });

  const displayedFactSheets = filteredFactSheets.slice(0, visibleFactSheets);
  const hasMoreFactSheets = visibleFactSheets < filteredFactSheets.length;

  const loadMoreFactSheets = () => {
    setVisibleFactSheets((prev) => prev + 9);
  };

  const handleViewMoreClick = async (factSheet: EducationalResource) => {
    try {
      // Increment view count
      await educationalResourcesApi.incrementView(factSheet.id);
      navigate(`/resources/fact-sheets/${factSheet.id}`);
    } catch (err) {
      console.error("Error incrementing view count:", err);
      // Navigate anyway
      navigate(`/resources/fact-sheets/${factSheet.id}`);
    }
  };

  useEffect(() => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('tab', activeTab);
    setSearchParams(newSearchParams);
  }, [activeTab, searchParams, setSearchParams]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
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
  const NoContentCard = ({ type }: { type: "factsheets" | "casestudies" }) => (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center max-w-md mx-auto">
      <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No {type === "factsheets" ? "Fact Sheets" : "Case Studies"} Available
      </h3>
      <p className="text-gray-600 mb-4">
        {type === "factsheets"
          ? "Try adjusting your search or filter criteria."
          : "Check back later for case studies."}
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
            Educational Resources
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 font-light max-w-3xl mx-auto mb-8">
            Comprehensive fact sheets and real-world case studies advancing
            child neurology knowledge across Africa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="flex items-center text-gray-600">
              <FileText className="w-5 h-5 mr-2 text-red-600" />
              <span>{factSheets.length} Fact Sheets Available</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Users className="w-5 h-5 mr-2 text-red-600" />
              <span>{caseStudies.length} Case Studies Documented</span>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-center">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => {
                  setActiveTab("factsheets");
                  setSelectedCategory("all");
                  setSearchTerm("");
                }}
                className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                  activeTab === "factsheets"
                    ? "bg-white text-red-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Fact Sheets
              </button>
              <button
                onClick={() => {
                  setActiveTab("casestudies");
                  setSelectedCategory("all");
                  setSearchTerm("");
                }}
                className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                  activeTab === "casestudies"
                    ? "bg-white text-red-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Case Studies
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Bar */}
      <section className="py-6 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${
                  activeTab === "factsheets" ? "fact sheets" : "case studies"
                }...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
              >
                {(activeTab === "factsheets" ? categories : caseStudyCategories).map(
                  (category: string) => (
                    <option key={category} value={category}>
                      {category === "all" ? "All Categories" : category}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          {activeTab === "factsheets" ? (
            <div>
              {/* Fact Sheets Header */}
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
                  Clinical Fact Sheets
                </h2>
                <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Evidence-based resources providing essential information about
                  pediatric neurological conditions, diagnostic approaches, and
                  management strategies tailored for African healthcare
                  settings.
                </p>
              </div>

              {loading ? (
                <LoadingSpinner />
              ) : error ? (
                <ErrorCard
                  message={error}
                  onRetry={() => window.location.reload()}
                />
              ) : displayedFactSheets.length > 0 ? (
                <div className="space-y-8">
                  {/* Fact Sheets Grid */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {displayedFactSheets.map((sheet) => (
                      <div
                        key={sheet.id}
                        className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                      >
                        <div className="relative">
                          <img
                            src={sheet.imageUrl || "https://images.pexels.com/photos/4260325/pexels-photo-4260325.jpeg?auto=compress&cs=tinysrgb&w=600"}
                            alt={sheet.title}
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute top-3 left-3">
                            <span className="bg-red-600 text-white px-2 py-1 text-xs font-bold uppercase tracking-wide rounded">
                              {sheet.category}
                            </span>
                          </div>
                          {sheet.isFeatured && (
                            <div className="absolute top-3 right-3">
                              <span className="bg-yellow-500 text-white px-2 py-1 text-xs font-bold rounded">
                                FEATURED
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="p-6">
                          <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight">
                            {sheet.title}
                          </h3>

                          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                            {sheet.description}
                          </p>

                          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                            <div className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              <span>{formatDate(sheet.publicationDate || sheet.createdAt)}</span>
                            </div>
                            {sheet.fileSize && <span>{sheet.fileSize}</span>}
                          </div>

                          <div className="flex flex-wrap gap-1 mb-4">
                            {sheet.tags.slice(0, 3).map((tag, index) => (
                              <span
                                key={index}
                                className="bg-gray-100 text-gray-600 px-2 py-1 text-xs rounded"
                              >
                                {tag}
                              </span>
                            ))}
                            {sheet.tags.length > 3 && (
                              <span className="bg-gray-100 text-gray-600 px-2 py-1 text-xs rounded">
                                +{sheet.tags.length - 3}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center">
                                <Download className="w-4 h-4 mr-1" />
                                {sheet.downloadCount}
                              </div>
                              <div className="flex items-center">
                                <Eye className="w-4 h-4 mr-1" />
                                {sheet.viewCount}
                              </div>
                            </div>
                            <button 
                              onClick={() => handleViewMoreClick(sheet)}
                              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-medium flex items-center"
                            >
                              View More
                              <ArrowRight className="w-4 h-4 ml-1" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Load More Button */}
                  {hasMoreFactSheets && (
                    <div className="text-center mt-8">
                      <button
                        onClick={loadMoreFactSheets}
                        className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                      >
                        Load More Fact Sheets
                      </button>
                      <p className="text-sm text-gray-500 mt-2">
                        Showing {displayedFactSheets.length} of{" "}
                        {filteredFactSheets.length} fact sheets
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <NoContentCard type="factsheets" />
              )}
            </div>
          ) : (
            <CaseStudies 
              selectedCategory={selectedCategory} 
              searchTerm={searchTerm} 
            />
          )}
        </div>
      </section>
    </div>
  );
};

export default FactSheetsAndCaseStudies;