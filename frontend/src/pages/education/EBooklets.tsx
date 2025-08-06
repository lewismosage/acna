import React, { useState } from "react";
import {
  BookOpen,
  Download,
  Search,
  Filter,
  FileText,
  User,
  Clock,
  ChevronDown,
  ChevronUp,
  Star,
  Bookmark,
  Printer,
  Share2,
} from "lucide-react";

interface EBooklet {
  id: number;
  title: string;
  description: string;
  category: string;
  language: string[];
  fileSize: string;
  pages: number;
  publicationDate: string;
  downloads: string;
  rating?: number;
  imageUrl: string;
  authors: string[];
  lastUpdated: string;
  targetAudience: string[];
  fileFormats: string[];
  isNew?: boolean;
  isFeatured?: boolean;
}

const EBooklets = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [selectedAudience, setSelectedAudience] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [expandedBooklet, setExpandedBooklet] = useState<number | null>(null);

  const eBooklets: EBooklet[] = [
    {
      id: 1,
      title: "Understanding Childhood Epilepsy: A Guide for African Parents",
      description: "Comprehensive guide explaining epilepsy in children, treatment options, and daily management strategies tailored for African families.",
      category: "Epilepsy",
      language: ["English", "French", "Swahili"],
      fileSize: "4.2 MB",
      pages: 36,
      publicationDate: "June 2025",
      downloads: "12.5K",
      rating: 4.7,
      imageUrl: "https://images.pexels.com/photos/4260325/pexels-photo-4260325.jpeg",
      authors: ["Dr. Amina Bello", "Prof. Kwame Mensah"],
      lastUpdated: "June 2025",
      targetAudience: ["Parents", "Caregivers"],
      fileFormats: ["PDF", "EPUB"],
      isFeatured: true
    },
    {
      id: 2,
      title: "Cerebral Palsy: Early Intervention Strategies for Community Health Workers",
      description: "Practical manual for community health workers on identifying early signs of cerebral palsy and implementing low-cost interventions.",
      category: "Cerebral Palsy",
      language: ["English", "Portuguese"],
      fileSize: "3.8 MB",
      pages: 42,
      publicationDate: "May 2025",
      downloads: "8.7K",
      rating: 4.5,
      imageUrl: "https://images.pexels.com/photos/4260323/pexels-photo-4260323.jpeg",
      authors: ["Dr. Fatoumata Diallo"],
      lastUpdated: "May 2025",
      targetAudience: ["Health Workers", "Community Volunteers"],
      fileFormats: ["PDF"],
      isNew: true
    },
    {
      id: 3,
      title: "Autism Spectrum Disorders: A Handbook for African Educators",
      description: "Classroom strategies and educational approaches for supporting children with autism in African school settings.",
      category: "Autism",
      language: ["English", "French", "Arabic"],
      fileSize: "5.1 MB",
      pages: 28,
      publicationDate: "April 2025",
      downloads: "6.3K",
      rating: 4.3,
      imageUrl: "https://images.pexels.com/photos/5212359/pexels-photo-5212359.jpeg",
      authors: ["Dr. Ngozi Eze", "Dr. Hassan Abdi"],
      lastUpdated: "April 2025",
      targetAudience: ["Teachers", "School Administrators"],
      fileFormats: ["PDF", "EPUB"]
    },
    {
      id: 4,
      title: "Nutrition for Brain Development: Traditional African Foods That Help",
      description: "Guide to locally available foods that support optimal brain development in children, with culturally appropriate recipes.",
      category: "Nutrition",
      language: ["English", "Swahili", "Hausa"],
      fileSize: "2.9 MB",
      pages: 24,
      publicationDate: "March 2025",
      downloads: "9.1K",
      rating: 4.8,
      imageUrl: "https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg",
      authors: ["Dr. Wanjiku Mwangi", "Nutritionist Aisha Kamara"],
      lastUpdated: "March 2025",
      targetAudience: ["Parents", "Community Health Workers"],
      fileFormats: ["PDF"]
    },
    {
      id: 5,
      title: "First Aid for Seizures: What Every African Community Should Know",
      description: "Illustrated guide to seizure first aid, dispelling myths and providing culturally appropriate response techniques.",
      category: "Epilepsy",
      language: ["English", "French", "Yoruba"],
      fileSize: "3.5 MB",
      pages: 20,
      publicationDate: "February 2025",
      downloads: "15.2K",
      rating: 4.9,
      imageUrl: "https://images.pexels.com/photos/3985163/pexels-photo-3985163.jpeg",
      authors: ["Dr. Chukwuma Okafor"],
      lastUpdated: "February 2025",
      targetAudience: ["General Public", "Teachers"],
      fileFormats: ["PDF", "EPUB"],
      isFeatured: true
    },
    {
      id: 6,
      title: "Developmental Milestones: Tracking Your Child's Progress",
      description: "Age-by-age guide to typical child development with adaptations for African cultural contexts.",
      category: "Child Development",
      language: ["English", "French", "Swahili", "Amharic"],
      fileSize: "4.7 MB",
      pages: 32,
      publicationDate: "January 2025",
      downloads: "7.8K",
      rating: 4.6,
      imageUrl: "https://images.pexels.com/photos/11035398/pexels-photo-11035398.jpeg",
      authors: ["Dr. Tendai Moyo"],
      lastUpdated: "January 2025",
      targetAudience: ["Parents", "Caregivers"],
      fileFormats: ["PDF"]
    }
  ];

  const categories = ["all", "Epilepsy", "Cerebral Palsy", "Autism", "Nutrition", "Child Development", "Mental Health"];
  const languages = ["all", "English", "French", "Swahili", "Arabic", "Portuguese", "Hausa", "Yoruba", "Amharic"];
  const audiences = ["all", "Parents", "Caregivers", "Teachers", "Health Workers", "Community Volunteers", "General Public"];

  const filteredBooklets = eBooklets.filter((booklet) => {
    const matchesCategory = selectedCategory === "all" || booklet.category === selectedCategory;
    const matchesLanguage = selectedLanguage === "all" || booklet.language.includes(selectedLanguage);
    const matchesAudience = selectedAudience === "all" || booklet.targetAudience.includes(selectedAudience);
    const matchesSearch =
      booklet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booklet.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesLanguage && matchesAudience && matchesSearch;
  });

  const renderRatingStars = (rating?: number) => {
    if (!rating) return null;
    
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating.toFixed(1)})</span>
      </div>
    );
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-6">
            E-Booklets
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 font-light max-w-3xl mx-auto mb-8">
            Downloadable educational resources for pediatric neurological conditions
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-gray-600">
            <div className="flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-red-600" />
              <span>{eBooklets.length} Booklets Available</span>
            </div>
            <div className="flex items-center">
              <Download className="w-5 h-5 mr-2 text-red-600" />
              <span>Over 50K Downloads</span>
            </div>
            <div className="flex items-center">
              <User className="w-5 h-5 mr-2 text-red-600" />
              <span>Available in 8 Languages</span>
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
              Our collection of e-booklets provides reliable, culturally appropriate information about 
              pediatric neurological conditions tailored specifically for African audiences. Developed by 
              ACNA's expert team, these resources translate complex medical information into accessible 
              formats for families, educators, and healthcare workers.
            </p>
            <p>
              Each booklet undergoes rigorous review by our medical advisory board and is tested with 
              community groups to ensure clarity and cultural relevance. We prioritize information that 
              addresses the unique challenges faced by African children with neurological conditions and 
              their caregivers.
            </p>
            <p>
              All resources are available for free download in multiple languages and formats to ensure 
              accessibility across different devices and literacy levels.
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
                placeholder="Search booklets by title or description..."
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
          {/* Featured Booklets */}
          {filteredBooklets.filter(b => b.isFeatured).length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Bookmark className="w-6 h-6 text-red-600 mr-2" />
                Featured Resources
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                {filteredBooklets.filter(b => b.isFeatured).map((booklet) => (
                  <div key={booklet.id} className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-red-200 hover:border-red-300 transition-colors">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/3">
                        <img 
                          src={booklet.imageUrl} 
                          alt={booklet.title}
                          className="w-full h-48 md:h-full object-cover"
                        />
                      </div>
                      <div className="md:w-2/3 p-6">
                        <div className="flex justify-between items-start">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{booklet.title}</h3>
                          {booklet.isNew && (
                            <span className="bg-green-100 text-green-800 px-2 py-1 text-xs font-bold rounded">
                              NEW
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-4">{booklet.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded">
                            {booklet.category}
                          </span>
                          {booklet.language.map((lang, index) => (
                            <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 text-xs rounded">
                              {lang}
                            </span>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-500 gap-4">
                            <span>{booklet.pages} pages</span>
                            <span>{booklet.fileSize}</span>
                            {renderRatingStars(booklet.rating)}
                          </div>
                          <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors font-medium flex items-center">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Booklets */}
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            All E-Booklets
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBooklets.map((booklet) => (
              <div key={booklet.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-200">
                <div className="relative">
                  <img 
                    src={booklet.imageUrl} 
                    alt={booklet.title}
                    className="w-full h-48 object-cover"
                  />
                  {booklet.isNew && (
                    <span className="absolute top-3 right-3 bg-green-600 text-white px-2 py-1 text-xs font-bold rounded">
                      NEW
                    </span>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{booklet.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{booklet.description}</p>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded">
                      {booklet.category}
                    </span>
                    {booklet.language.slice(0, 2).map((lang, index) => (
                      <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 text-xs rounded">
                        {lang}
                      </span>
                    ))}
                    {booklet.language.length > 2 && (
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 text-xs rounded">
                        +{booklet.language.length - 2}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{booklet.pages} pages</span>
                    <span>{booklet.fileSize}</span>
                    <span>{booklet.downloads}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    {renderRatingStars(booklet.rating)}
                    <button 
                      onClick={() => setExpandedBooklet(expandedBooklet === booklet.id ? null : booklet.id)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center"
                    >
                      {expandedBooklet === booklet.id ? 'Less Details' : 'More Details'}
                      {expandedBooklet === booklet.id ? (
                        <ChevronUp className="ml-1 w-4 h-4" />
                      ) : (
                        <ChevronDown className="ml-1 w-4 h-4" />
                      )}
                    </button>
                  </div>
                  
                  {expandedBooklet === booklet.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="mb-3">
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">Authors:</h4>
                        <p className="text-gray-600 text-sm">{booklet.authors.join(", ")}</p>
                      </div>
                      <div className="mb-3">
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">For:</h4>
                        <div className="flex flex-wrap gap-1">
                          {booklet.targetAudience.map((audience, index) => (
                            <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 text-xs rounded">
                              {audience}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="mb-3">
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">Formats:</h4>
                        <div className="flex flex-wrap gap-1">
                          {booklet.fileFormats.map((format, index) => (
                            <span key={index} className="bg-green-100 text-green-800 px-2 py-1 text-xs rounded">
                              {format}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button className="flex-1 bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition-colors font-medium flex items-center justify-center">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </button>
                        <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50">
                          <Share2 className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50">
                          <Printer className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredBooklets.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No booklets found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default EBooklets;