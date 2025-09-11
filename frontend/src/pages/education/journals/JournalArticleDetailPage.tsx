import { useState, useEffect } from "react";
import {
  BookOpen,
  ChevronLeft,
  AlertCircle,
  Calendar,
  User,
  Globe,
  Hash,
  Eye,
  Download,
  Share2,
  Quote,
  FileText,
  Award,
  Tag,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { JournalArticle, journalArticlesApi } from "../../../services/journalWatchAPI";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import ScrollToTop from "../../../components/common/ScrollToTop";

const JournalArticleDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "overview" | "findings" | "commentary" | "citation"
  >("overview");
  const [article, setArticle] = useState<JournalArticle | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<JournalArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const articleData = await journalArticlesApi.getById(parseInt(id));
        setArticle(articleData);
        
        // Increment view count
        await journalArticlesApi.incrementView(parseInt(id));

        // Fetch related articles (same study type or country focus)
        const allArticles = await journalArticlesApi.getAll();
        const related = allArticles
          .filter(a => 
            a.id !== articleData.id && 
            (a.studyType === articleData.studyType || 
             a.countryFocus.some(country => articleData.countryFocus.includes(country)))
          )
          .slice(0, 3);
        setRelatedArticles(related);

      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load journal article"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article?.title,
        text: article?.summary,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // You could add a toast notification here
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Article Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            {error || "The journal article you're looking for doesn't exist."}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-red-600 hover:text-red-700 font-medium"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Journal Watch
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
            Back to Journal Watch
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-12 md:py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="flex justify-center items-center gap-4 mb-6">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getRelevanceColor(article.relevance)}`}>
                {article.relevance} Relevance
              </span>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 text-sm font-medium rounded-full">
                {article.studyType}
              </span>
              {article.countryFocus.map((country, index) => (
                <span key={index} className="bg-green-100 text-green-800 px-3 py-1 text-sm font-medium rounded-full">
                  {country}
                </span>
              ))}
            </div>

            <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-6 leading-tight max-w-4xl mx-auto">
              {article.title}
            </h1>

            <div className="flex flex-wrap justify-center items-center gap-6 text-gray-600 mb-8">
              <div className="flex items-center">
                <User className="w-5 h-5 mr-2 text-red-600" />
                <span className="font-medium">{article.authors}</span>
              </div>
              <div className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-red-600" />
                <span className="font-medium">{article.journal}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-red-600" />
                <span className="font-medium">{formatDate(article.publicationDate)}</span>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={handleShare}
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Share Article
              </button>
            </div>
          </div>

          <div className="flex justify-center items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-1 text-red-600" />
              <span>{article.viewCount} views</span>
            </div>
            <div className="flex items-center">
              <Download className="w-4 h-4 mr-1 text-red-600" />
              <span>{article.downloadCount} downloads</span>
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
              { key: "findings", label: "Key Findings" },
              { key: "commentary", label: "ACNA Commentary" },
              { key: "citation", label: "Citation & Details" },
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <Quote className="w-6 h-6 mr-2 text-red-600" />
                    Summary
                  </h2>
                  <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-red-600">
                    <p className="text-gray-700 leading-relaxed">
                      {article.summary}
                    </p>
                  </div>
                </div>

                {/* Abstract (if available) */}
                {article.abstract && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Abstract
                    </h3>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {article.abstract}
                      </p>
                    </div>
                  </div>
                )}

                {/* Tags */}
                {article.tags.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <Tag className="w-5 h-5 mr-2 text-red-600" />
                      Related Topics
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {article.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-3 py-1 text-sm rounded-full font-medium"
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
                {/* Article Info */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Article Information
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Study Type:</span>
                      <span className="font-medium">{article.studyType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Relevance:</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getRelevanceColor(article.relevance)}`}>
                        {article.relevance}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium text-green-600">{article.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Added:</span>
                      <span className="font-medium">{formatDate(article.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Updated:</span>
                      <span className="font-medium">{formatDate(article.updatedAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Population Focus */}
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Globe className="w-5 h-5 mr-2 text-blue-600" />
                    Study Population
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {article.population}
                  </p>
                </div>

                {/* Country Focus */}
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Geographic Focus
                  </h3>
                  <div className="space-y-2">
                    {article.countryFocus.map((country, index) => (
                      <div key={index} className="flex items-center">
                        <Globe className="w-4 h-4 mr-2 text-green-600" />
                        <span className="text-sm font-medium">{country}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "findings" && (
            <div className="max-w-4xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Award className="w-6 h-6 mr-2 text-red-600" />
                Key Findings
              </h2>
              {article.keyFindings.length > 0 ? (
                <div className="space-y-4">
                  {article.keyFindings.map((finding, index) => (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start">
                        <div className="bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4 flex-shrink-0 mt-1">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-700 leading-relaxed">
                            {finding}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Hash className="w-12 h-12 mx-auto text-gray-400" />
                  <p className="mt-4 text-gray-600">
                    Key findings will be available soon
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "commentary" && (
            <div className="max-w-4xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                ACNA Expert Commentary
              </h2>
              {article.commentary ? (
                <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg">
                  <div className="flex items-start mb-4">
                    <div className="bg-blue-600 p-2 rounded-lg mr-4">
                      <Quote className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Expert Analysis
                      </h3>
                      <p className="text-sm text-gray-600">
                        Reviewed by ACNA's expert panel
                      </p>
                    </div>
                  </div>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {article.commentary}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Quote className="w-12 h-12 mx-auto text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mt-4 mb-2">
                    Commentary Coming Soon
                  </h3>
                  <p className="text-gray-600">
                    Our expert panel is reviewing this article. Commentary will be added shortly.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "citation" && (
            <div className="max-w-4xl space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Citation & Publication Details
                </h2>
                
                {/* Citation Box */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-red-600" />
                    Citation
                  </h3>
                  <div className="bg-white p-4 rounded border font-mono text-sm text-gray-700 mb-4">
                    {article.authors}. {article.title}. <em>{article.journal}</em>. {article.publicationDate}.
                  </div>
                  <button
                    onClick={() => {
                      const citation = `${article.authors}. ${article.title}. ${article.journal}. ${article.publicationDate}.`;
                      navigator.clipboard.writeText(citation);
                    }}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Copy Citation
                  </button>
                </div>

                {/* Publication Details */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Publication Information
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-900">Journal:</span>
                        <div className="text-gray-700">{article.journal}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Authors:</span>
                        <div className="text-gray-700">{article.authors}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Publication Date:</span>
                        <div className="text-gray-700">{formatDate(article.publicationDate)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      ACNA Review Details
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-900">Relevance Rating:</span>
                        <div className={`inline-block ml-2 px-2 py-1 text-xs font-medium rounded ${getRelevanceColor(article.relevance)}`}>
                          {article.relevance}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Study Type:</span>
                        <div className="text-gray-700">{article.studyType}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Added to Journal Watch:</span>
                        <div className="text-gray-700">{formatDate(article.createdAt)}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Last Updated:</span>
                        <div className="text-gray-700">{formatDate(article.updatedAt)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Related Articles Section */}
      {relatedArticles.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-4">
                Related Articles
              </h2>
              <p className="text-gray-600">
                Other journal articles that might interest you
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedArticles.map((relatedArticle) => (
                <div
                  key={relatedArticle.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden border border-gray-200 cursor-pointer"
                  onClick={() => navigate(`/journal-watch/${relatedArticle.id}`)}
                >
                  <div className="p-6">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getRelevanceColor(relatedArticle.relevance)}`}>
                        {relatedArticle.relevance}
                      </span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs font-medium rounded">
                        {relatedArticle.studyType}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight hover:text-red-600 transition-colors line-clamp-2">
                      {relatedArticle.title}
                    </h3>

                    <div className="text-sm text-gray-600 mb-3">
                      <div className="flex items-center mb-1">
                        <User className="w-3 h-3 mr-1" />
                        <span className="truncate">{relatedArticle.authors}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>{relatedArticle.publicationDate}</span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                      {relatedArticle.summary}
                    </p>

                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-red-600 font-medium text-sm hover:text-red-700">
                        Read More
                      </span>
                      <div className="flex items-center text-xs text-gray-500">
                        <Eye className="w-3 h-3 mr-1" />
                        {relatedArticle.viewCount}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <button
                onClick={() => navigate('/journal-watch')}
                className="border-2 border-red-600 text-red-600 px-6 py-3 font-medium hover:bg-red-600 hover:text-white transition-all duration-300 uppercase tracking-wide rounded"
              >
                View All Articles
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default JournalArticleDetailPage;