import React, { useState } from 'react';
import { Award, Trophy, Users, Calendar, FileText, CheckCircle, Star, Medal } from 'lucide-react';
import ScrollToTop from '../../components/common/ScrollToTop';

const AwardsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const awardCategories = [
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

  const recentWinners = [
    {
      name: "Dr. Amina Hassan",
      title: "Excellence in Child Neurology - 2024",
      location: "Lagos, Nigeria",
      achievement: "Pioneered community-based epilepsy care programs reaching over 5,000 children across West Africa",
      image: "https://images.pexels.com/photos/5214907/pexels-photo-5214907.jpeg?auto=compress&cs=tinysrgb&w=400",
      category: "excellence"
    },
    {
      name: "Dr. Joseph Mutamba",
      title: "Healthcare Innovation Award - 2024",
      location: "Kampala, Uganda",
      achievement: "Developed mobile diagnostic units that increased early detection rates by 70% in rural communities",
      image: "https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=400",
      category: "innovation"
    },
    {
      name: "Dr. Fatima El-Rashid",
      title: "Child Neurology Advocacy Award - 2024",
      location: "Cairo, Egypt",
      achievement: "Led policy reforms that mandated neurological screening in all primary schools across North Africa",
      image: "https://images.pexels.com/photos/3952048/pexels-photo-3952048.jpeg?auto=compress&cs=tinysrgb&w=400",
      category: "advocacy"
    },
    {
      name: "Prof. Samuel Ochieng",
      title: "Medical Education Excellence - 2024",
      location: "Nairobi, Kenya",
      achievement: "Established training centers that have graduated 200+ pediatric neurologists across East Africa",
      image: "https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=400",
      category: "education"
    },
    {
      name: "Dr. Grace Mthembu",
      title: "Lifetime Service Award - 2024",
      location: "Cape Town, South Africa",
      achievement: "40 years of dedicated service, founding three specialized pediatric neurology centers",
      image: "https://images.pexels.com/photos/4260323/pexels-photo-4260323.jpeg?auto=compress&cs=tinysrgb&w=400",
      category: "service"
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

  const filteredWinners = selectedCategory === 'all' 
    ? recentWinners 
    : recentWinners.filter(winner => winner.category === selectedCategory);

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
            <button className="bg-white text-red-600 px-8 py-3 font-bold hover:bg-gray-100 transition-colors duration-300 uppercase tracking-wide rounded">
              Submit Nomination
            </button>
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
            {awardCategories.map((category) => {
             
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
                      {category.criteria.map((criterion, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start">
                        <CheckCircle className="w-4 h-4 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                        {criterion}
                      </li>
                      ))}
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
              Celebrating the 2024 recipients who have made extraordinary contributions to child neurology across Africa
            </p>
          </div>

          {/* Filter Buttons */}
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
            {awardCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id 
                    ? 'bg-orange-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category.title.split(' ')[0]}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredWinners.map((winner, index) => (
              <div key={index} className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="relative h-48">
                  <img
                    src={winner.image}
                    alt={winner.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-red-600 text-white px-3 py-1 text-xs font-bold uppercase tracking-wide rounded">
                      2024 Winner
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
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
             <button className="border-2 border-orange-600 text-orange-600 px-6 py-2 sm:px-8 sm:py-3 font-medium hover:bg-orange-600 hover:text-white transition-all duration-300 uppercase tracking-wide rounded text-sm sm:text-base">
              View All Past Winners
            </button>
          </div>
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

            <button className="border-2 border-orange-600 text-orange-600 px-6 py-2 sm:px-8 sm:py-3 font-medium hover:bg-orange-600 hover:text-white transition-all duration-300 uppercase tracking-wide rounded text-sm sm:text-base">
              Start Nomination Process
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AwardsPage;