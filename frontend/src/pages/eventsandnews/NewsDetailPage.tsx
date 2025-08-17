import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  User, 
  Clock, 
  Share2, 
  ChevronLeft,
  Download,
  Mail,
  Phone,
  ExternalLink,
  Building,
  Tag,
  Eye,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { newsApi, NewsItem } from '../../services/newsApi';
import ScrollToTop from '../../components/common/ScrollToTop';

const NewsDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<NewsItem | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'article' | 'about'>('article');

  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) {
        setError('No article ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Fetch the main article
        const articleData = await newsApi.getById(Number(id));
        setArticle(articleData);

        // Fetch related articles (same category, excluding current article)
        const relatedData = await newsApi.getAll({
          status: 'Published',
          category: articleData.category
        });
        
        // Filter out current article and limit to 3 related articles
        const filteredRelated = relatedData
          .filter(item => item.id !== articleData.id)
          .slice(0, 3);
        
        setRelatedArticles(filteredRelated);

      } catch (err) {
        console.error('Error fetching article:', err);
        setError(err instanceof Error ? err.message : 'Failed to load article');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  const handleBackToNews = () => {
    navigate('/news');
  };

  const handleRelatedArticleClick = (relatedArticle: NewsItem) => {
    navigate(`/news/${relatedArticle.id}`);
  };

  const handleViewAllNews = () => {
    navigate('/news');
  };

  const handleShare = () => {
    if (navigator.share && article) {
      navigator.share({
        title: article.title,
        text: article.content.introduction,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleDownloadPDF = () => {
    // Implement PDF download functionality
    console.log('Download PDF functionality to be implemented');
  };

  const handlePrint = () => {
    window.print();
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-gray-500 bg-white">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading article...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded p-8 text-center max-w-md mx-auto">
          <h3 className="text-lg font-medium text-red-900 mb-2">Error loading article</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => navigate('/news')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Back to News
          </button>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Article not found</h3>
          <p className="text-gray-600 mb-4">The article you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/news')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to News
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Back Navigation */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button 
            onClick={handleBackToNews}
            className="flex items-center text-red-600 hover:text-red-700 font-medium"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to News
          </button>
        </div>
      </div>

      {/* Article Header */}
      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4">
          {/* Category Badge */}
          <div className="mb-4">
            <span className="bg-red-600 text-white px-3 py-1 text-sm font-bold uppercase tracking-wide rounded">
              {article.type === 'News Article' ? 'NEWS ARTICLE' : 
               article.type === 'Press Release' ? 'PRESS RELEASE' : 
               article.type.toUpperCase()}
            </span>
          </div>

          {/* Title and Subtitle */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            {article.title}
          </h1>
          
          {article.subtitle && (
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {article.subtitle}
            </p>
          )}

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-8">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-red-600" />
              <span>{formatDate(article.date)}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2 text-red-600" />
              <span>{article.readTime}</span>
            </div>
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-2 text-red-600" />
              <span>{article.views.toLocaleString()} views</span>
            </div>
            <div className="flex items-center">
              <Tag className="w-4 h-4 mr-2 text-red-600" />
              <span>{article.category}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-12">
            <button 
              onClick={handleShare}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Article
            </button>
            <button 
              onClick={handleDownloadPDF}
              className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </button>
            <button 
              onClick={handlePrint}
              className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Print Article
            </button>
          </div>
        </div>
      </section>

      {/* Hero Image */}
      {article.imageUrl && (
        <section className="mb-12">
          <div className="max-w-6xl mx-auto px-4">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
            />
          </div>
        </section>
      )}

      {/* Navigation Tabs */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('article')}
              className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'article'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Article
            </button>
            {article.author && (
              <button
                onClick={() => setActiveTab('about')}
                className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'about'
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                About the Author
              </button>
            )}
          </nav>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <ScrollToTop />
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {activeTab === 'article' && (
                <div className="prose prose-lg max-w-none">
                  {/* Introduction */}
                  <div className="text-lg leading-relaxed text-gray-700 mb-8 font-medium">
                    {article.content.introduction}
                  </div>

                  {/* Article Sections */}
                  {article.content.sections.map((section, index) => (
                    <div key={index} className="mb-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        {section.heading}
                      </h2>
                      <p className="text-gray-700 leading-relaxed mb-6">
                        {section.content}
                      </p>
                    </div>
                  ))}

                  {/* Conclusion */}
                  {article.content.conclusion && (
                    <div className="bg-blue-50 p-6 rounded-lg mb-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Conclusion</h3>
                      <p className="text-gray-700 leading-relaxed">
                        {article.content.conclusion}
                      </p>
                    </div>
                  )}

                  {/* Tags */}
                  {article.tags && article.tags.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {article.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200 cursor-pointer transition-colors"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'about' && article.author && (
                <div className="max-w-2xl">
                  <div className="bg-white border border-gray-200 rounded-lg p-8">
                    <div className="flex items-start gap-6">
                      {article.author.imageUrl && (
                        <img
                          src={article.author.imageUrl}
                          alt={article.author.name}
                          className="w-20 h-20 rounded-full object-cover flex-shrink-0"
                        />
                      )}
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {article.author.name}
                        </h3>
                        {article.author.title && (
                          <p className="text-red-600 font-medium mb-2">
                            {article.author.title}
                          </p>
                        )}
                        {article.author.organization && (
                          <p className="text-gray-600 mb-4">
                            {article.author.organization}
                          </p>
                        )}
                        {article.author.bio && (
                          <p className="text-gray-700 leading-relaxed">
                            {article.author.bio}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-8">
              {/* Contact Information (for press releases) */}
              {article.type === 'Press Release' && article.contact && (
                <div className="bg-red-50 p-6 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Media Contact</h3>
                  <div className="space-y-3 text-sm">
                    {article.contact.name && (
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-red-600" />
                        <span className="font-medium">{article.contact.name}</span>
                      </div>
                    )}
                    {article.contact.email && (
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-red-600" />
                        <a href={`mailto:${article.contact.email}`} className="text-red-600 hover:underline">
                          {article.contact.email}
                        </a>
                      </div>
                    )}
                    {article.contact.phone && (
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-red-600" />
                        <span>{article.contact.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Source Information (for news articles) */}
              {article.source && (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Source</h3>
                  <div className="space-y-2">
                    {article.source.name && (
                      <div className="flex items-center">
                        <Building className="w-4 h-4 mr-2 text-red-600" />
                        <span className="font-medium">{article.source.name}</span>
                      </div>
                    )}
                    {article.source.url && (
                      <div className="flex items-center">
                        <ExternalLink className="w-4 h-4 mr-2 text-red-600" />
                        <a href={article.source.url} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline text-sm">
                          Visit Source
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Related Articles */}
              {relatedArticles.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Related Articles</h3>
                  <div className="space-y-4">
                    {relatedArticles.map((related) => (
                      <div 
                        key={related.id} 
                        className="group cursor-pointer"
                        onClick={() => handleRelatedArticleClick(related)}
                      >
                        <div className="flex gap-3 hover:bg-gray-50 transition-colors duration-200 p-3 rounded-lg">
                          <div className="relative flex-shrink-0 w-16 h-16 overflow-hidden rounded">
                            {related.imageUrl ? (
                              <img
                                src={related.imageUrl}
                                alt={related.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-500 text-xs">No Image</span>
                              </div>
                            )}
                            <div className="absolute top-0.5 left-0.5">
                              <span className="bg-red-600 text-white px-1 py-0.5 text-xs font-bold uppercase tracking-wide text-[10px]">
                                {related.type}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 space-y-1">
                            <h4 className="text-sm font-semibold text-gray-900 leading-tight group-hover:text-red-600 transition-colors line-clamp-2">
                              {related.title}
                            </h4>
                            <p className="text-xs text-gray-500">{formatDate(related.date)}</p>
                            <p className="text-xs text-red-600 font-medium uppercase">{related.category}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6">
                    <button 
                      onClick={handleViewAllNews}
                      className="w-full text-center text-red-600 font-medium hover:text-red-700 transition-colors flex items-center justify-center"
                    >
                      View All News
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NewsDetailPage;