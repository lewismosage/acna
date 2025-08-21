import React, { useState, useEffect } from 'react';
import { Award, Trophy, Users, Calendar, FileText, CheckCircle, Star, Medal, UserCheck } from 'lucide-react';
import ScrollToTop from '../../components/common/ScrollToTop';
import { Link } from 'react-router';
import { awardsApi, AwardWinner, AwardCategory } from '../../services/awardsApi'; // Adjust import path as needed

const AwardsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [recentWinners, setRecentWinners] = useState<AwardWinner[]>([]);
  const [awardCategories, setAwardCategories] = useState<AwardCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayedWinners, setDisplayedWinners] = useState(3); // Track how many winners to show

  // Default category data with icons for display purposes
  const defaultCategories = [
    {
      id: 'excellence',
      title: "Excellence in Child Neurology",
      description: "Recognizing outstanding contributions to pediatric neurological care and research across Africa",
      icon: Trophy,
      color: "bg-blue-600",
      criteria: ["Minimum 10 years experience", "Published research contributions", "Community impact demonstration"]
    },
    {
      id: 'innovation',
      title: "Healthcare Innovation Award", 
      description: "Honoring innovative approaches to addressing neurological care challenges in African communities",
      icon: Star,
      color: "bg-purple-600",
      criteria: ["Novel treatment approaches", "Technology implementation", "Measurable patient outcomes"]
    },
    {
      id: 'advocacy',
      title: "Child Neurology Advocacy Award",
      description: "Celebrating individuals who champion neurological health awareness and policy changes",
      icon: Users,
      color: "bg-green-600",
      criteria: ["Policy influence", "Community engagement", "Awareness campaign leadership"]
    },
    {
      id: 'education',
      title: "Medical Education Excellence",
      description: "Recognizing exceptional contributions to training and educating healthcare professionals",
      icon: Award,
      color: "bg-orange-600",
      criteria: ["Training program development", "Curriculum innovation", "Mentorship excellence"]
    },
    {
      id: 'service',
      title: "Lifetime Service Award",
      description: "Honoring sustained dedication to improving child neurological health across Africa",
      icon: Medal,
      color: "bg-red-600",
      criteria: ["25+ years of service", "Cross-continental impact", "Mentorship legacy"]
    }
  ];

  const nominationSteps = [
    {
      step: 1,
      title: "Review Award Categories",
      description: "Choose the most appropriate award category for your nominee",
      icon: FileText
    },
    {
      step: 2,
      title: "Gather Required Documentation", 
      description: "Collect CV, supporting letters, and evidence of achievements",
      icon: Users
    },
    {
      step: 3,
      title: "Complete Nomination Form",
      description: "Fill out the detailed online nomination application",
      icon: CheckCircle
    },
    {
      step: 4,
      title: "Submit Before Deadline",
      description: "Ensure all materials are submitted by December 31, 2025",
      icon: Calendar
    }
  ];

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [winners, categories] = await Promise.all([
          awardsApi.getWinners({ status: 'Active' }), // Only get active winners
          awardsApi.getCategories({ active: true }) // Only get active categories
        ]);
        
        setRecentWinners(winners);
        setAwardCategories(categories);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        console.error('Error fetching awards data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Reset displayed winners when category changes
  useEffect(() => {
    setDisplayedWinners(3);
  }, [selectedCategory]);

  // Merge API categories with default display data
  const displayCategories = awardCategories.length > 0 
    ? awardCategories.map(apiCategory => {
        const defaultCategory = defaultCategories.find(dc => 
          dc.title.toLowerCase().includes(apiCategory.title.toLowerCase().split(' ')[0]) ||
          apiCategory.title.toLowerCase().includes(dc.title.toLowerCase().split(' ')[0])
        );
        return {
          ...apiCategory,
          icon: defaultCategory?.icon || Award,
          color: defaultCategory?.color || "bg-blue-600",
          criteria: defaultCategory?.criteria || ["Excellence in field", "Significant contributions", "Community impact"]
        };
      })
    : defaultCategories;

  const filteredWinners = selectedCategory === 'all' 
    ? recentWinners 
    : recentWinners.filter(winner => {
        // Try to match by category ID first, then by category title
        const category = awardCategories.find(cat => cat.id === winner.category);
        return category?.title.toLowerCase().includes(selectedCategory) || 
               winner.categoryTitle?.toLowerCase().includes(selectedCategory);
      });

  // Get winners to display based on pagination
  const winnersToShow = filteredWinners.slice(0, displayedWinners);
  const hasMoreWinners = filteredWinners.length > displayedWinners;
  const showViewMoreButton = filteredWinners.length > 3;

  // Handle view more winners
  const handleViewMoreWinners = () => {
    setDisplayedWinners(prev => prev + 3);
  };

  // Handle view less winners (reset to 3)
  const handleViewLessWinners = () => {
    setDisplayedWinners(3);
  };

  return (
    <div className="bg-white min-h-screen">
      <ScrollToTop />
      {/* Hero Section */}
      <section className="py-12 md:py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 mb-4 md:mb-6">
            Awards & Recognitions
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-700 font-light max-w-3xl mx-auto">
            Celebrating excellence, innovation, and dedication in advancing child neurology care across Africa
          </p>
        </div>
      </section>

      {/* 2025 Nominations Open Banner */}
      <section className="py-8 bg-orange-600">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              2025 Award Nominations Now Open
            </h2>
            <p className="text-lg mb-6 max-w-2xl mx-auto">
              Nominate exceptional individuals and initiatives for ACNA's prestigious awards. Deadline: December 31, 2025
            </p>
            <Link
              to="/awards-nomination"
              className="bg-white text-red-600 px-8 py-3 font-bold hover:bg-gray-100 transition-colors duration-300 uppercase tracking-wide rounded">
              Submit Nomination
            </Link>
          </div>
        </div>
      </section>

      {/* Award Categories Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
              Award Categories
            </h2>
            <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              ACNA recognizes outstanding contributions across multiple areas of child neurology and healthcare delivery
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayCategories.map((category) => {
              return (
                <div key={category.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {category.title}
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {category.description}
                  </p>
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 text-sm">Key Criteria:</h4>
                    <ul className="space-y-1">
                      {category.criteria?.map((criterion, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start">
                          <CheckCircle className="w-4 h-4 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                          {criterion}
                        </li>
                      )) || (
                        <li className="text-sm text-gray-600 flex items-start">
                          <CheckCircle className="w-4 h-4 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                          Excellence in field of expertise
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recent Award Winners Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
              Recent Award Winners
            </h2>
            <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Celebrating recent recipients who have made extraordinary contributions to child neurology across Africa
            </p>
          </div>

          {/* Filter Buttons */}
          {displayCategories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === 'all' 
                    ? 'bg-orange-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                All Winners
              </button>
              {displayCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.title.toLowerCase().split(' ')[0])}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.title.toLowerCase().split(' ')[0]
                      ? 'bg-orange-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category.title.split(' ')[0]}
                </button>
              ))}
            </div>
          )}

          {/* Winners Grid */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">Error loading winners: {error}</div>
            </div>
          ) : winnersToShow.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {winnersToShow.map((winner) => (
                <div key={winner.id} className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="relative h-48">
                    {winner.imageUrl ? (
                      <img
                        src={winner.imageUrl}
                        alt={winner.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const img = e.currentTarget as HTMLImageElement;
                          img.style.display = 'none';
                          const fallback = img.nextElementSibling as HTMLElement;
                          if (fallback) {
                            fallback.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    {/* Fallback trophy icon for winners without images */}
                    <div className={`w-full h-full bg-yellow-100 flex items-center justify-center ${winner.imageUrl ? 'hidden' : 'flex'}`}>
                      <Trophy className="w-16 h-16 text-yellow-600" />
                    </div>
                    <div className="absolute top-4 left-4">
                      <span className="bg-red-600 text-white px-3 py-1 text-xs font-bold uppercase tracking-wide rounded">
                        {winner.year} Winner
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {winner.name}
                    </h3>
                    <p className="text-red-600 font-medium text-sm mb-2">
                      {winner.title}
                    </p>
                    <p className="text-gray-600 text-sm mb-3">
                      {winner.location}
                    </p>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {winner.achievement}
                    </p>
                    {winner.categoryTitle && (
                      <p className="text-blue-600 text-xs font-medium mt-3 uppercase tracking-wide">
                        {winner.categoryTitle}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Award Winners Found</h3>
              <p className="text-gray-500">
                {selectedCategory === 'all' 
                  ? "No award winners have been announced yet." 
                  : "No winners found for the selected category."}
              </p>
            </div>
          )}

          {/* View More/Less Winners Buttons */}
          {showViewMoreButton && winnersToShow.length > 0 && (
            <div className="text-center mt-12 space-x-4">
              {hasMoreWinners && (
                <button 
                  onClick={handleViewMoreWinners}
                  className="border-2 border-orange-600 text-orange-600 px-6 py-2 sm:px-8 sm:py-3 font-medium hover:bg-orange-600 hover:text-white transition-all duration-300 uppercase tracking-wide rounded text-sm sm:text-base"
                >
                  View More Winners
                </button>
              )}
              {displayedWinners > 3 && (
                <button 
                  onClick={handleViewLessWinners}
                  className="border-2 border-gray-400 text-gray-600 px-6 py-2 sm:px-8 sm:py-3 font-medium hover:bg-gray-400 hover:text-white transition-all duration-300 uppercase tracking-wide rounded text-sm sm:text-base"
                >
                  View Less
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Nomination Process Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
              Nomination Process
            </h2>
            <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Follow these simple steps to nominate deserving individuals for ACNA awards
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {nominationSteps.map((step) => {
              return (
                <div key={step.step} className="text-center">
                  <div className="relative mb-6">
                    <div className="bg-orange-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white text-2xl font-bold">{step.step}</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Important Dates</h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-700">
                <div>
                  <strong>Nominations Open:</strong><br />
                  September 1, 2025
                </div>
                <div>
                  <strong>Submission Deadline:</strong><br />
                  December 31, 2025
                </div>
                <div>
                  <strong>Awards Ceremony:</strong><br />
                  March 2026
                </div>
              </div>
            </div>

            <Link
             to="/awards-nomination"
             className="border-2 border-orange-600 text-orange-600 px-6 py-2 sm:px-8 sm:py-3 font-medium hover:bg-orange-600 hover:text-white transition-all duration-300 uppercase tracking-wide rounded text-sm sm:text-base">
              Start Nomination Process
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AwardsPage;