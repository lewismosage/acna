import React, { useState, useEffect } from 'react';
import { ArrowRight, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { newsApi, NewsItem } from '../../services/newsApi';

interface SubscriptionStatus {
  type: 'success' | 'error';
  message: string;
}

const LatestNewsPage = () => {
  const navigate = useNavigate(); // Add navigation hook
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  
  // News Articles State
  const [newsArticles, setNewsArticles] = useState<NewsItem[]>([]);
  const [displayedNewsArticles, setDisplayedNewsArticles] = useState<NewsItem[]>([]);
  const [loadingMoreNews, setLoadingMoreNews] = useState(false);
  const [hasMoreNews, setHasMoreNews] = useState(false);
  
  // Press Releases State
  const [pressReleases, setPressReleases] = useState<NewsItem[]>([]);
  const [displayedPressReleases, setDisplayedPressReleases] = useState<NewsItem[]>([]);
  const [loadingMorePress, setLoadingMorePress] = useState(false);
  const [hasMorePress, setHasMorePress] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ITEMS_PER_SECTION = 6;

  // Navigation handlers
  const handleNewsClick = (article: NewsItem) => {
    navigate(`/news/${article.id}`, { state: { article } });
  };

  const handlePressReleaseClick = (release: NewsItem) => {
    navigate(`/news/${release.id}`, { state: { article: release } });
  };

  const handleViewAllNews = () => {
    navigate('/news/all', { state: { type: 'news' } });
  };

  const handleViewAllPressReleases = () => {
    navigate('/news/all', { state: { type: 'press-releases' } });
  };

  // Fetch news data from API
  useEffect(() => {
    const fetchNewsData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch news articles (excluding press releases)
        const articles = await newsApi.getAll({ 
          status: 'Published',
          type: 'News Article'
        });
        setNewsArticles(articles);
        
        // Set initial displayed news articles (first 6)
        const initialNewsItems = articles.slice(0, ITEMS_PER_SECTION);
        setDisplayedNewsArticles(initialNewsItems);
        setHasMoreNews(articles.length > ITEMS_PER_SECTION);
        
        // Fetch press releases
        const releases = await newsApi.getAll({
          status: 'Published',
          type: 'Press Release'
        });
        setPressReleases(releases);
        
        // Set initial displayed press releases (first 6)
        const initialPressItems = releases.slice(0, ITEMS_PER_SECTION);
        setDisplayedPressReleases(initialPressItems);
        setHasMorePress(releases.length > ITEMS_PER_SECTION);
        
      } catch (err) {
        console.error('Error fetching news data:', err);
        setError('Failed to load news data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchNewsData();
  }, []);

  // Load more news articles
  const loadMoreNews = () => {
    setLoadingMoreNews(true);
    
    setTimeout(() => {
      const currentCount = displayedNewsArticles.length;
      const nextItems = newsArticles.slice(currentCount, currentCount + ITEMS_PER_SECTION);
      
      setDisplayedNewsArticles(prev => [...prev, ...nextItems]);
      setHasMoreNews(currentCount + ITEMS_PER_SECTION < newsArticles.length);
      setLoadingMoreNews(false);
    }, 500);
  };

  // Load more press releases
  const loadMorePress = () => {
    setLoadingMorePress(true);
    
    setTimeout(() => {
      const currentCount = displayedPressReleases.length;
      const nextItems = pressReleases.slice(currentCount, currentCount + ITEMS_PER_SECTION);
      
      setDisplayedPressReleases(prev => [...prev, ...nextItems]);
      setHasMorePress(currentCount + ITEMS_PER_SECTION < pressReleases.length);
      setLoadingMorePress(false);
    }, 500);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubscriptionStatus(null);

    try {
      const response = await api.post('/newsletter/subscribe/', {
        email,
        first_name: firstName,
        last_name: lastName,
        source: 'website_newsletter'
      });

      setSubscriptionStatus({
        type: 'success',
        message: 'Thank you for subscribing to our newsletter!'
      });
      setEmail('');
      setFirstName('');
      setLastName('');
    } catch (error: unknown) {
      let errorMessage = 'Failed to subscribe. Please try again later.';
      
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as { response?: { status?: number, data?: any } };
        if (axiosError.response?.status === 400 && axiosError.response.data?.email) {
          errorMessage = axiosError.response.data.email[0];
        } else if (axiosError.response?.data?.detail) {
          errorMessage = axiosError.response.data.detail;
        }
      }

      setSubscriptionStatus({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
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
            Loading news...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded p-8 text-center max-w-md mx-auto">
          <h3 className="text-lg font-medium text-red-900 mb-2">Error loading news</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-6">Latest News & Press Releases</h1>
          <p className="text-xl md:text-2xl text-gray-700 font-light max-w-3xl mx-auto">
            Stay informed about the latest developments in child neurology across Africa and our ongoing efforts to improve neurological care for children.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          
          {/* News About ACNA Section - First */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">News About ACNA</h2>
              <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Guest articles on other sources referencing our work to end hunger and poverty.
              </p>
              {newsArticles.length > 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  Showing {displayedNewsArticles.length} of {newsArticles.length} articles
                </p>
              )}
            </div>

            {displayedNewsArticles.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 gap-8 mb-12">
                  {displayedNewsArticles.map((article) => (
                    <div 
                      key={article.id} 
                      className="group cursor-pointer flex gap-4 hover:bg-gray-50 transition-colors duration-200 p-4 rounded-lg"
                      onClick={() => handleNewsClick(article)}
                    >
                      <div className="relative flex-shrink-0 w-24 h-24 overflow-hidden rounded">
                        {article.imageUrl ? (
                          <img
                            src={article.imageUrl}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 text-xs">No Image</span>
                          </div>
                        )}
                        <div className="absolute top-1 left-1">
                          <span className="bg-red-600 text-white px-2 py-0.5 text-xs font-bold uppercase tracking-wide">
                            {article.type}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-red-600 font-medium text-xs uppercase">{article.category}</p>
                        <h3 className="text-base font-bold text-gray-900 leading-tight group-hover:text-red-600 transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-gray-600 text-sm">{formatDate(article.date)}</p>
                        <div className="text-red-600 text-sm font-medium inline-flex items-center hover:text-red-700">
                          READ MORE <ArrowRight className="ml-1 w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Load More News Button - Only show if there are more than 6 items */}
                {hasMoreNews && (
                  <div className="text-center mb-8">
                    <button 
                      onClick={loadMoreNews}
                      disabled={loadingMoreNews}
                      className={`border-2 border-orange-600 text-orange-600 px-6 py-2 sm:px-8 sm:py-3 font-medium hover:bg-orange-600 hover:text-white transition-all duration-300 uppercase tracking-wide rounded text-sm sm:text-base ${
                        loadingMoreNews ? 'opacity-75 cursor-not-allowed' : ''
                      }`}
                    >
                      {loadingMoreNews ? (
                        <div className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Loading More...
                        </div>
                      ) : (
                        'Load More News'
                      )}
                    </button>
                  </div>
                )}

                {/* View All Button - Only show if there are 6 or more items */}
                {newsArticles.length >= ITEMS_PER_SECTION && (
                  <div className="text-center">
                    <button 
                      onClick={handleViewAllNews}
                      className="border-2 border-orange-600 text-orange-600 px-6 py-2 sm:px-8 sm:py-3 font-medium hover:bg-orange-600 hover:text-white transition-all duration-300 uppercase tracking-wide rounded text-sm sm:text-base"
                    >
                      View All News About ACNA
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No news articles available at the moment.</p>
              </div>
            )}
          </div>

          {/* Press Releases Section - Second */}
          <div>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">Press Releases</h2>
              <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Check out the latest press releases from African Child Neurology Association.
              </p>
              {pressReleases.length > 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  Showing {displayedPressReleases.length} of {pressReleases.length} releases
                </p>
              )}
            </div>

            {displayedPressReleases.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 gap-8 mb-12">
                  {displayedPressReleases.map((release) => (
                    <div 
                      key={release.id} 
                      className="border-l-4 border-red-600 pl-6 hover:bg-gray-50 transition-colors duration-200 py-4 cursor-pointer"
                      onClick={() => handlePressReleaseClick(release)}
                    >
                      <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                        <span className="hover:text-red-600 transition-colors">
                          {release.title}
                        </span>
                      </h3>
                      <p className="text-red-600 font-medium text-sm mb-3">{formatDate(release.date)}</p>
                      <p className="text-gray-700 leading-relaxed text-sm mb-3">
                        {release.content?.introduction || 'No excerpt available'}
                      </p>
                      <div className="text-red-600 text-sm font-medium inline-flex items-center hover:text-red-700">
                        READ MORE <ArrowRight className="ml-1 w-3 h-3" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Load More Press Releases Button - Only show if there are more than 6 items */}
                {hasMorePress && (
                  <div className="text-center mb-8">
                    <button 
                      onClick={loadMorePress}
                      disabled={loadingMorePress}
                      className={`border-2 border-orange-600 text-orange-600 px-6 py-2 sm:px-8 sm:py-3 font-medium hover:bg-orange-600 hover:text-white transition-all duration-300 uppercase tracking-wide rounded text-sm sm:text-base ${
                        loadingMorePress ? 'opacity-75 cursor-not-allowed' : ''
                      }`}
                    >
                      {loadingMorePress ? (
                        <div className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Loading More...
                        </div>
                      ) : (
                        'Load More Press Releases'
                      )}
                    </button>
                  </div>
                )}

                {/* View All Button - Only show if there are 6 or more items */}
                {pressReleases.length >= ITEMS_PER_SECTION && (
                  <div className="text-center">
                    <button 
                      onClick={handleViewAllPressReleases}
                      className="border-2 border-orange-600 text-orange-600 px-6 py-2 sm:px-8 sm:py-3 font-medium hover:bg-orange-600 hover:text-white transition-all duration-300 uppercase tracking-wide rounded text-sm sm:text-base"
                    >
                      View All Press Releases
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No press releases available at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-orange-600">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">SIGN UP FOR THE ACNA NEWSLETTER</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Subscribe to get updates on the latest in child neurology, healthcare equity, research breakthroughs, and advocacy efforts across Africa.
          </p>
          
          <form onSubmit={handleSubscribe} className="max-w-md mx-auto">
            {subscriptionStatus && (
              <div className={`mb-4 p-3 rounded-md ${
                subscriptionStatus.type === 'success' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {subscriptionStatus.message}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <input
                  type="text"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                  required
                />
              </div>
            </div>
            
            <div className="relative mb-4">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                required
              />
              <button 
                type="submit"
                disabled={isSubmitting}
                className={`absolute right-2 top-2 bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors flex items-center ${
                  isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  'Subscribing...'
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Subscribe
                  </>
                )}
              </button>
            </div>
            
            <p className="text-sm text-orange-100 opacity-90">
              This site is protected by reCAPTCHA and the Google{' '}
              <a href="https://policies.google.com/privacy" className="underline hover:text-white">Privacy Policy</a>, and{' '}
              <a href="https://policies.google.com/terms" className="underline hover:text-white">Terms of Service</a> apply. By submitting your email to subscribe, you agree to the ACNA's{' '}
              <a href="/privacy-policy" className="underline hover:text-white">Privacy & Cookies Notice</a>.
            </p>
          </form>
        </div>
      </section>
    </div>
  );
};

export default LatestNewsPage;