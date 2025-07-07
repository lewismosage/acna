import React, { useState } from 'react';
import { Calendar, User, ArrowRight, BookOpen, FileText, Search, Filter } from 'lucide-react';

const News = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const newsItems = [
    {
      id: 1,
      title: "New Guidelines for Pediatric Epilepsy Management Released",
      excerpt: "ACNA publishes comprehensive clinical guidelines based on latest research and African healthcare context.",
      content: "The Africa Child Neurology Association has released updated clinical guidelines for pediatric epilepsy management...",
      category: "guidelines",
      author: "Dr. Sarah Mwaniki",
      date: "December 10, 2024",
      image: "https://images.pexels.com/photos/3825583/pexels-photo-3825583.jpeg?auto=compress&cs=tinysrgb&w=600",
      featured: true
    },
    {
      id: 2,
      title: "ACNA 2024 Annual Conference Registration Now Open",
      excerpt: "Join us in Cape Town for three days of cutting-edge research presentations and networking opportunities.",
      content: "We are excited to announce that registration is now open for the ACNA 2024 Annual Conference...",
      category: "conference",
      author: "ACNA Events Team",
      date: "December 15, 2024",
      image: "https://images.pexels.com/photos/4021775/pexels-photo-4021775.jpeg?auto=compress&cs=tinysrgb&w=600",
      featured: true
    },
    {
      id: 3,
      title: "Research Breakthrough in Pediatric Stroke Treatment",
      excerpt: "African researchers make significant progress in understanding and treating pediatric stroke.",
      content: "A collaborative research effort across multiple African institutions has yielded promising results...",
      category: "research",
      author: "Dr. Mohamed Hassan",
      date: "December 8, 2024",
      image: "https://images.pexels.com/photos/3786126/pexels-photo-3786126.jpeg?auto=compress&cs=tinysrgb&w=600",
      featured: false
    },
    {
      id: 4,
      title: "Dr. Amara Okafor Receives International Recognition",
      excerpt: "ACNA President honored for outstanding contributions to child neurology education in Africa.",
      content: "Dr. Amara Okafor, President of the Africa Child Neurology Association, has been awarded...",
      category: "awards",
      author: "ACNA Communications",
      date: "December 5, 2024",
      image: "https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=600",
      featured: false
    },
    {
      id: 5,
      title: "New Telemedicine Initiative Launched for Rural Areas",
      excerpt: "ACNA partners with technology providers to bring specialist care to underserved communities.",
      content: "The Africa Child Neurology Association announces a groundbreaking telemedicine initiative...",
      category: "innovation",
      author: "Dr. Kwame Asante",
      date: "December 3, 2024",
      image: "https://images.pexels.com/photos/4226219/pexels-photo-4226219.jpeg?auto=compress&cs=tinysrgb&w=600",
      featured: false
    },
    {
      id: 6,
      title: "Publication: African Journal of Child Neurology - Latest Issue",
      excerpt: "The latest issue features groundbreaking research from across the continent.",
      content: "The African Journal of Child Neurology's latest issue includes several important studies...",
      category: "publication",
      author: "Editorial Team",
      date: "December 1, 2024",
      image: "https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=600",
      featured: false
    }
  ];

  const publications = [
    {
      id: 1,
      title: "African Journal of Child Neurology",
      description: "Peer-reviewed journal featuring the latest research in pediatric neurology across Africa.",
      type: "Journal",
      frequency: "Quarterly",
      image: "https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      id: 2,
      title: "Clinical Guidelines Compendium",
      description: "Comprehensive collection of evidence-based clinical guidelines for African healthcare settings.",
      type: "Reference",
      frequency: "Annual",
      image: "https://images.pexels.com/photos/4226219/pexels-photo-4226219.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      id: 3,
      title: "ACNA Newsletter",
      description: "Monthly updates on association activities, member spotlights, and industry news.",
      type: "Newsletter",
      frequency: "Monthly",
      image: "https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg?auto=compress&cs=tinysrgb&w=400"
    }
  ];

  const filteredNews = newsItems.filter(item => {
    const categoryMatch = selectedCategory === 'all' || item.category === selectedCategory;
    const searchMatch = searchTerm === '' || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && searchMatch;
  });

  const featuredNews = newsItems.filter(item => item.featured);
  const regularNews = filteredNews.filter(item => !item.featured);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-green-900 to-green-700 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              News & Publications
            </h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              Stay informed about the latest developments in child neurology, research breakthroughs, 
              and ACNA activities across Africa.
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search news and publications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Categories</option>
                <option value="research">Research</option>
                <option value="conference">Conferences</option>
                <option value="guidelines">Guidelines</option>
                <option value="awards">Awards</option>
                <option value="innovation">Innovation</option>
                <option value="publication">Publications</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Featured News */}
      {featuredNews.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Featured News
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Important updates and breakthroughs in child neurology
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {featuredNews.map((item) => (
                <article key={item.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-200">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.category === 'research' ? 'bg-blue-100 text-blue-800' :
                        item.category === 'conference' ? 'bg-purple-100 text-purple-800' :
                        item.category === 'guidelines' ? 'bg-green-100 text-green-800' :
                        item.category === 'awards' ? 'bg-yellow-100 text-yellow-800' :
                        item.category === 'innovation' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                      </span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                        Featured
                      </span>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">{item.excerpt}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <User className="w-4 h-4 mr-2" />
                        <span className="mr-4">{item.author}</span>
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{item.date}</span>
                      </div>
                      <button className="text-green-600 font-medium hover:text-green-700 inline-flex items-center">
                        Read More
                        <ArrowRight className="ml-1 w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All News */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Latest News</h2>
              <p className="text-xl text-gray-600">Stay updated with recent developments</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularNews.map((item) => (
              <article key={item.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.category === 'research' ? 'bg-blue-100 text-blue-800' :
                      item.category === 'conference' ? 'bg-purple-100 text-purple-800' :
                      item.category === 'guidelines' ? 'bg-green-100 text-green-800' :
                      item.category === 'awards' ? 'bg-yellow-100 text-yellow-800' :
                      item.category === 'innovation' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">{item.excerpt}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      <span>{item.author}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{item.date}</span>
                    </div>
                  </div>
                  
                  <button className="text-green-600 font-medium hover:text-green-700 inline-flex items-center text-sm">
                    Read More
                    <ArrowRight className="ml-1 w-4 h-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Publications Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Our Publications
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Access our comprehensive collection of journals, guidelines, and educational resources
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {publications.map((publication) => (
              <div key={publication.id} className="bg-gray-50 p-8 rounded-xl text-center hover:shadow-lg transition-shadow duration-200">
                <img
                  src={publication.image}
                  alt={publication.title}
                  className="w-24 h-32 mx-auto mb-6 rounded-lg shadow-md object-cover"
                />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{publication.title}</h3>
                <p className="text-gray-600 mb-4">{publication.description}</p>
                <div className="flex justify-center items-center space-x-4 mb-6">
                  <div className="flex items-center">
                    <BookOpen className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">{publication.type}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">{publication.frequency}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                    Access
                  </button>
                  <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                    Subscribe
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-20 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Stay Informed
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
            Subscribe to our newsletter and never miss important updates, research breakthroughs, 
            or event announcements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
            />
            <button className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center">
              Subscribe
              <ArrowRight className="ml-2 w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default News;