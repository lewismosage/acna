import React, { useState } from 'react';
import { Heart, Phone, MessageCircle, Download, Users, BookOpen, AlertCircle, Clock, Search, Filter, Star, ExternalLink, Play, FileText, Globe, Headphones } from 'lucide-react';

interface Resource {
  id: number;
  title: string;
  category: string;
  type: 'Guide' | 'Video' | 'Audio' | 'Checklist' | 'App' | 'Website';
  condition: string;
  language: string[];
  description: string;
  downloadCount?: string;
  rating?: number;
  duration?: string;
  ageGroup: string;
  imageUrl: string;
  isPopular?: boolean;
  isFree: boolean;
  lastUpdated: string;
}

interface SupportGroup {
  id: number;
  name: string;
  condition: string;
  location: string;
  meetingType: 'In-Person' | 'Virtual' | 'Hybrid';
  schedule: string;
  contact: string;
  members: string;
  description: string;
  languages: string[];
}

interface EmergencyResource {
  id: number;
  title: string;
  description: string;
  phoneNumber: string;
  availability: string;
  coverage: string;
  icon: React.ReactNode;
}

const PatientCaregiverResources = () => {
  const [activeTab, setActiveTab] = useState<'resources' | 'support' | 'emergency'>('resources');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const resources: Resource[] = [
    {
      id: 1,
      title: "Understanding Your Child's Epilepsy: A Parent's Complete Guide",
      category: "Educational Guides",
      type: "Guide",
      condition: "Epilepsy",
      language: ["English", "French", "Swahili", "Hausa"],
      description: "Comprehensive guide covering seizure types, triggers, medications, and daily management strategies for parents of children with epilepsy.",
      downloadCount: "15.2K",
      rating: 4.8,
      ageGroup: "All Ages",
      imageUrl: "https://images.pexels.com/photos/4260325/pexels-photo-4260325.jpeg?auto=compress&cs=tinysrgb&w=600",
      isPopular: true,
      isFree: true,
      lastUpdated: "July 2025"
    },
    // ... other resources
  ];

  const supportGroups: SupportGroup[] = [
    {
      id: 1,
      name: "Kenya Epilepsy Support Network",
      condition: "Epilepsy",
      location: "Nairobi, Kenya",
      meetingType: "Hybrid",
      schedule: "Every 2nd Saturday, 2:00 PM",
      contact: "+254-700-123-456",
      members: "150+ families",
      description: "Support group for families dealing with childhood epilepsy, offering emotional support, practical advice, and advocacy training.",
      languages: ["English", "Swahili"]
    },
    // ... other support groups
  ];

  const emergencyResources: EmergencyResource[] = [
    {
      id: 1,
      title: "24/7 Neurological Emergency Hotline",
      description: "Immediate consultation with pediatric neurologists for urgent situations",
      phoneNumber: "+254-20-NEURO-1 (638761)",
      availability: "24/7",
      coverage: "East Africa",
      icon: <Phone className="w-6 h-6" />
    },
    // ... other emergency resources
  ];

  const categories = ['all', 'Educational Guides', 'Therapy & Exercise', 'Assessment Tools', 'Emergency Care', 'Nutrition & Diet', 'Education Support', 'Medication Management', 'Inspiration & Stories'];
  const conditions = ['all', 'Epilepsy', 'Cerebral Palsy', 'Developmental Delays', 'Autism Spectrum Disorders', 'All Conditions', 'Rare Conditions'];

  const filteredResources = resources.filter(resource => {
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesCondition = selectedCondition === 'all' || resource.condition === selectedCondition;
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesCondition && matchesSearch;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Guide': return <FileText className="w-4 h-4" />;
      case 'Video': return <Play className="w-4 h-4" />;
      case 'Audio': return <Headphones className="w-4 h-4" />;
      case 'App': return <Globe className="w-4 h-4" />;
      case 'Website': return <ExternalLink className="w-4 h-4" />;
      case 'Checklist': return <BookOpen className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating})</span>
      </div>
    );
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-6">Patient & Caregiver Resources</h1>
          <p className="text-xl md:text-2xl text-gray-700 font-light max-w-3xl mx-auto mb-8">
            Comprehensive support and practical resources for families navigating pediatric neurological conditions across Africa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-gray-600">
            <div className="flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-red-600" />
              <span>{resources.length} Resources Available</span>
            </div>
            <div className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-red-600" />
              <span>{supportGroups.length} Support Groups</span>
            </div>
            <div className="flex items-center">
              <Phone className="w-5 h-5 mr-2 text-red-600" />
              <span>24/7 Emergency Support</span>
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
                onClick={() => setActiveTab('resources')}
                className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                  activeTab === 'resources'
                    ? 'bg-white text-red-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Resources & Guides
              </button>
              <button
                onClick={() => setActiveTab('support')}
                className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                  activeTab === 'support'
                    ? 'bg-white text-red-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Support Groups
              </button>
              <button
                onClick={() => setActiveTab('emergency')}
                className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                  activeTab === 'emergency'
                    ? 'bg-white text-red-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Emergency Support
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        {activeTab === 'resources' && (
          <div>
            {/* Search and Filter */}
            <div className="mb-12 bg-gray-50 p-6 rounded-lg">
              <div className="flex flex-col lg:flex-row gap-4 items-center">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search resources..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-600" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category === 'all' ? 'All Categories' : category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <select
                    value={selectedCondition}
                    onChange={(e) => setSelectedCondition(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  >
                    {conditions.map(condition => (
                      <option key={condition} value={condition}>
                        {condition === 'all' ? 'All Conditions' : condition}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Resources Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredResources.map((resource) => (
                <div key={resource.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 border border-gray-200">
                  <div className="relative">
                    <img
                      src={resource.imageUrl}
                      alt={resource.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-red-600 text-white px-2 py-1 text-xs font-bold uppercase tracking-wide rounded flex items-center gap-1">
                        {getTypeIcon(resource.type)}
                        {resource.type}
                      </span>
                    </div>
                    {resource.isFree && (
                      <div className="absolute top-3 right-3">
                        <span className="bg-green-600 text-white px-2 py-1 text-xs font-bold rounded">
                          FREE
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{resource.title}</h3>
                    <div className="flex items-center text-gray-600 text-sm mb-3">
                      <span>{resource.category}</span>
                      <span className="mx-2">•</span>
                      <span>{resource.condition}</span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4">{resource.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {resource.language.map((lang, index) => (
                        <span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 text-xs rounded">
                          {lang}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        {resource.rating && renderStars(resource.rating)}
                        {resource.downloadCount && (
                          <div className="flex items-center text-gray-600 text-sm mt-1">
                            <Download className="w-4 h-4 mr-1" />
                            {resource.downloadCount}
                          </div>
                        )}
                      </div>
                      
                      <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors font-medium">
                        View Resource
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'support' && (
          <div>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">Support Groups</h2>
              <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Connect with other families facing similar challenges. Our support groups provide safe spaces for sharing experiences, advice, and encouragement.
              </p>
            </div>

            <div className="space-y-8">
              {supportGroups.map((group) => (
                <div key={group.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200 border border-gray-200 p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{group.name}</h3>
                        {group.id === 1 && (
                          <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-medium">
                            Supported by EACNA
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center text-gray-600 mb-4">
                        <Users className="w-4 h-4 mr-2 text-red-600" />
                        {group.members}
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {group.condition}
                        </span>
                        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                          {group.meetingType}
                        </span>
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                          {group.location}
                        </span>
                      </div>
                      
                      {group.id === 1 && (
                        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-4 rounded-r-lg">
                          <p className="text-blue-800 text-sm">
                            <strong>Officially supported by:</strong> The East African Child Neurology Association (EACNA)
                          </p>
                        </div>
                      )}
                      
                      <p className="text-gray-600 leading-relaxed mb-4">
                        {group.description}
                      </p>
                      
                      <div className="flex items-center text-gray-600 mb-2">
                        <Clock className="w-4 h-4 mr-2 text-red-600" />
                        {group.schedule}
                      </div>
                    </div>
                    
                    <div className="lg:w-64 lg:flex-shrink-0">
                      <div className="flex flex-wrap gap-1 mb-3">
                        {group.languages.map((lang, index) => (
                          <span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 text-xs rounded">
                            {lang}
                          </span>
                        ))}
                      </div>
                      
                      <div className="space-y-2">
                        <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2">
                          <Phone className="w-4 h-4" />
                          {group.contact}
                        </button>
                        <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors font-medium">
                          Learn More
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'emergency' && (
          <div>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">Emergency Support</h2>
              <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Immediate support when you need it most. Our emergency resources provide 24/7 access to neurological expertise and crisis support across Africa.
              </p>
            </div>

            {/* Emergency Alert */}
            <div className="bg-red-50 border-l-4 border-red-600 p-6 mb-12 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-bold text-red-800 mb-2">In Case of Medical Emergency</h3>
                  <p className="text-red-700 mb-3">
                    If your child is experiencing a life-threatening emergency, call your local emergency services immediately. 
                    These resources are for urgent neurological consultations and support, not life-threatening emergencies.
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className="font-medium">Emergency Numbers:</span>
                    <span>Kenya: 999 | Nigeria: 199 | South Africa: 10177 | Egypt: 123</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Resources Grid */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {emergencyResources.map((resource) => (
                <div key={resource.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="bg-red-100 p-3 rounded-lg text-red-600">
                      {resource.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {resource.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        {resource.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900">Phone Number:</span>
                      <a 
                        href={`tel:${resource.phoneNumber}`}
                        className="text-red-600 font-bold hover:text-red-700 transition-colors"
                      >
                        {resource.phoneNumber}
                      </a>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Availability: {resource.availability}</span>
                      <span>Coverage: {resource.coverage}</span>
                    </div>

                    <button className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2">
                      <Phone className="w-4 h-4" />
                      Call Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Newsletter Section */}
      <section className="py-16 bg-orange-600">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Stay Connected with ACNA</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Get the latest resources, support group updates, and important information about 
            pediatric neurological care delivered directly to your inbox.
          </p>
          
          <div className="max-w-md mx-auto">
            <div className="relative mb-4">
              <input
                type="email"
                placeholder="Email address"
                className="w-full px-6 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button className="absolute right-2 top-2 bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors flex items-center">
                <Heart className="mr-2 h-4 w-4" />
                Subscribe
              </button>
            </div>
            
            <p className="text-sm text-orange-100 opacity-90">
              Join thousands of families receiving support and resources. You can unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PatientCaregiverResources;