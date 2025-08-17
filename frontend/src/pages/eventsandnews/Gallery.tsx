import { useState, useEffect } from 'react';
import { Camera, Video, Users, Calendar, MapPin, Eye, Download, Share2, Stethoscope, Play, Mail } from 'lucide-react';
import api from '../../services/api';
import { galleryItemsApi, GalleryItem as ApiGalleryItem } from '../../services/galleryApi';

interface SubscriptionStatus {
  type: 'success' | 'error';
  message: string;
}

// Use the API GalleryItem type but keep the legacy interface for compatibility
interface GalleryItem extends Omit<ApiGalleryItem, 'event_date' | 'media_url' | 'thumbnail_url'> {
  date: string;
  imageUrl: string;
  thumbnailUrl: string;
}

interface Category {
  id: string;
  name: string;
  icon: any; 
}

const Gallery = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedMedia, setSelectedMedia] = useState<GalleryItem | null>(null);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [displayedItems, setDisplayedItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  
  const ITEMS_PER_PAGE = 9;

  const categories: Category[] = [
    { id: 'all', name: 'All Media', icon: Camera },
    { id: 'conferences', name: 'Conferences', icon: Users },
    { id: 'training', name: 'Training', icon: Calendar },
    { id: 'community', name: 'Community', icon: Users },
    { id: 'events', name: 'Events', icon: Calendar },
    { id: 'outreach', name: 'Outreach', icon: Camera },
    { id: 'medical', name: 'Medical', icon: Stethoscope},
    { id: 'stories', name: 'Success Stories', icon: Video }
  ];

  // Transform API data to component format
  const transformGalleryItem = (apiItem: ApiGalleryItem): GalleryItem => {
    return {
      ...apiItem,
      date: apiItem.event_date,
      imageUrl: apiItem.media_url || apiItem.thumbnail_url || '',
      thumbnailUrl: apiItem.thumbnail_url || apiItem.media_url || ''
    };
  };

  // Fetch gallery items from API
  useEffect(() => {
    const fetchGalleryItems = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch only published items
        const apiItems = await galleryItemsApi.getAll({ 
          status: 'published',
          ordering: '-created_at'
        });
        
        // Debug: Log the actual API response
        console.log('API Response:', apiItems);
        console.log('First item:', apiItems[0]);
        
        // Transform API data to component format
        const transformedItems = apiItems.map(transformGalleryItem);
        setGalleryItems(transformedItems);
      } catch (err) {
        console.error('Error fetching gallery items:', err);
        setError('Failed to load gallery items. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryItems();
  }, []);

  // Update displayed items when filter changes
  useEffect(() => {
    const filteredItems = selectedFilter === 'all' 
      ? galleryItems 
      : galleryItems.filter(item => item.category === selectedFilter);
    
    // Reset to first 9 items when filter changes
    const initialItems = filteredItems.slice(0, ITEMS_PER_PAGE);
    setDisplayedItems(initialItems);
    setHasMore(filteredItems.length > ITEMS_PER_PAGE);
  }, [selectedFilter, galleryItems]);

  const filteredItems = selectedFilter === 'all' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === selectedFilter);

  const loadMoreItems = () => {
    setLoadingMore(true);
    
    // Simulate loading delay for better UX
    setTimeout(() => {
      const currentCount = displayedItems.length;
      const nextItems = filteredItems.slice(currentCount, currentCount + ITEMS_PER_PAGE);
      
      setDisplayedItems(prev => [...prev, ...nextItems]);
      setHasMore(currentCount + ITEMS_PER_PAGE < filteredItems.length);
      setLoadingMore(false);
    }, 500);
  };

  const photoCount = galleryItems.filter(item => item.type === 'photo').length;
  const videoCount = galleryItems.filter(item => item.type === 'video').length;

  const openModal = (item: GalleryItem) => {
    setSelectedMedia(item);
  };

  const closeModal = () => {
    setSelectedMedia(null);
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
        source: 'gallery'
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

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="py-12 md:py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 mb-4 md:mb-6">
            Gallery
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-700 font-light max-w-3xl mx-auto">
            Explore moments from our conferences, training programs, community outreach, and the inspiring stories of progress in child neurology across Africa.
          </p>
          <div className="mt-8 flex justify-center space-x-8 text-sm text-gray-600">
            <div className="flex items-center">
              <Camera className="w-4 h-4 mr-2 text-red-600" />
              {photoCount} Photos
            </div>
            <div className="flex items-center">
              <Video className="w-4 h-4 mr-2 text-red-600" />
              {videoCount} Videos
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Mobile Filters */}
            <div className="lg:hidden bg-white border border-gray-200 rounded p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {displayedItems.length} of {filteredItems.length} items
                </h3>
                <button 
                  onClick={() => setSelectedFilter('all')}
                  className="text-red-600 text-sm font-medium hover:underline"
                >
                  Show all
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedFilter(category.id)}
                      className={`py-2 px-3 rounded-md text-sm flex items-center justify-center ${
                        selectedFilter === category.id 
                          ? 'bg-red-600 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <IconComponent className="w-3 h-3 mr-1" />
                      {category.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Desktop Sidebar Filters */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <div className="bg-white border border-gray-200 rounded p-4 md:p-6 sticky top-6">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    {filteredItems.length} items
                  </h3>
                  <button 
                    onClick={() => setSelectedFilter('all')}
                    className="text-red-600 text-sm font-medium hover:underline"
                  >
                    Show all media
                  </button>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-4">Categories</h4>
                  
                  <div className="space-y-2">
                    {categories.map((category) => {
                      const IconComponent = category.icon;
                      const count = category.id === 'all' 
                        ? galleryItems.length 
                        : galleryItems.filter(item => item.category === category.id).length;
                      
                      return (
                        <button
                          key={category.id}
                          onClick={() => setSelectedFilter(category.id)}
                          className={`w-full flex items-center justify-between p-2 rounded-md text-sm transition-colors ${
                            selectedFilter === category.id 
                              ? 'bg-red-600 text-white' 
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center">
                            <IconComponent className="w-4 h-4 mr-2" />
                            {category.name}
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            selectedFilter === category.id 
                              ? 'bg-white bg-opacity-20' 
                              : 'bg-gray-200'
                          }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Gallery Grid */}
            <div className="flex-1">
              {/* Loading State */}
              {loading && (
                <div className="text-center py-12">
                  <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-gray-500 bg-white">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading gallery items...
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded p-8 text-center">
                  <Camera className="w-12 h-12 text-red-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-red-900 mb-2">Error loading gallery</h3>
                  <p className="text-red-700 mb-4">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Reload Page
                  </button>
                </div>
              )}

              {/* Gallery Items */}
              {!loading && !error && displayedItems.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {displayedItems.map((item) => (
                    <div 
                      key={item.id} 
                      className="group cursor-pointer bg-white border border-gray-200 rounded overflow-hidden hover:shadow-lg transition-all duration-300"
                      onClick={() => openModal(item)}
                    >
                      <div className="relative aspect-square overflow-hidden">
                        <img
                          src={item.thumbnailUrl || '/placeholder-image.jpg'}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder-image.jpg';
                          }}
                        />
                        
                        {/* Media Type Overlay */}
                        <div className="absolute top-3 left-3">
                          <span className={`px-2 py-1 text-xs font-bold uppercase tracking-wide rounded ${
                            item.type === 'video' ? 'bg-red-600 text-white' : 'bg-black bg-opacity-50 text-white'
                          }`}>
                            {item.type === 'video' ? (
                              <div className="flex items-center">
                                <Play className="w-3 h-3 mr-1" />
                                Video
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <Camera className="w-3 h-3 mr-1" />
                                Photo
                              </div>
                            )}
                          </span>
                        </div>

                        {/* Video Duration */}
                        {item.type === 'video' && item.duration && (
                          <div className="absolute bottom-3 right-3">
                            <span className="bg-black bg-opacity-75 text-white px-2 py-1 text-xs rounded">
                              {item.duration}
                            </span>
                          </div>
                        )}

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Eye className="w-8 h-8 text-white" />
                          </div>
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="mb-2">
                          <span className="text-red-600 font-medium text-xs uppercase tracking-wide">
                            {item.category.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        </div>
                        
                        <h3 className="text-sm font-bold text-gray-900 mb-2 leading-tight line-clamp-2">
                          {item.title}
                        </h3>

                        <div className="space-y-1 mb-3">
                          <div className="flex items-center text-gray-600 text-xs">
                            <Calendar className="w-3 h-3 mr-1 text-red-600" />
                            {formatDate(item.date)}
                          </div>
                          <div className="flex items-center text-gray-600 text-xs">
                            <MapPin className="w-3 h-3 mr-1 text-red-600" />
                            {item.location}
                          </div>
                        </div>

                        <p className="text-gray-700 text-xs leading-relaxed line-clamp-2">
                          {item.description || 'No description available'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* No Items Found */}
              {!loading && !error && displayedItems.length === 0 && (
                <div className="bg-white border border-gray-200 rounded p-8 text-center">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {galleryItems.length === 0 ? 'No media at the moment' : 'No media found'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {galleryItems.length === 0 
                      ? 'Check back later for new gallery content.' 
                      : 'Try selecting a different category to explore our gallery.'
                    }
                  </p>
                  {galleryItems.length > 0 && (
                    <button
                      onClick={() => setSelectedFilter('all')}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Show All Media
                    </button>
                  )}
                </div>
              )}

              {/* Load More Button - Only show if there are more items to load */}
              {!loading && !error && hasMore && displayedItems.length > 0 && (
                <div className="text-center mt-8 sm:mt-12">
                  <button 
                    onClick={loadMoreItems}
                    disabled={loadingMore}
                    className={`border-2 border-orange-600 text-orange-600 px-6 py-2 sm:px-8 sm:py-3 font-medium hover:bg-orange-600 hover:text-white transition-all duration-300 uppercase tracking-wide rounded text-sm sm:text-base ${
                      loadingMore ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {loadingMore ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading More...
                      </div>
                    ) : (
                      'Load More Media'
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-90" onClick={closeModal}>
          <div className="relative max-w-3xl w-full bg-white rounded-lg overflow-hidden max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 z-10 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-75 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="flex-1 overflow-hidden">
              <img
                src={selectedMedia.imageUrl || '/placeholder-image.jpg'}
                alt={selectedMedia.title}
                className="w-full h-full object-contain max-h-[60vh]"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-image.jpg';
                }}
              />
            </div>
            
            <div className="p-4 sm:p-6 overflow-y-auto">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                <div className="flex-1">
                  <span className="text-red-600 font-medium text-sm uppercase tracking-wide">
                    {selectedMedia.category.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mt-1 mb-2">
                    {selectedMedia.title}
                  </h2>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1 text-red-600" />
                      {formatDate(selectedMedia.date)}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1 text-red-600" />
                      {selectedMedia.location}
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                    {selectedMedia.description || 'No description available'}
                  </p>
                </div>
                
                <div className="flex space-x-2 sm:ml-4">
                  <button className="p-2 text-gray-600 hover:text-red-600 transition-colors">
                    <Download className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-red-600 transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Newsletter Section */}
      <section className="py-16 bg-orange-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            STAY CONNECTED WITH OUR WORK
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Subscribe to receive updates about our latest programs, events, and the inspiring stories from our community.
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

export default Gallery;