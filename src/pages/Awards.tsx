import React, { useState } from 'react';
import { Award, Trophy, Star, Calendar, User, ArrowRight, Medal } from 'lucide-react';

const Awards = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const awards = [
    {
      id: 1,
      title: "ACNA Excellence in Research Award",
      description: "Recognizing outstanding contributions to pediatric neurology research across Africa.",
      category: "research",
      recipient: "Dr. Sarah Mwaniki",
      institution: "University of Nairobi",
      year: "2024",
      image: "https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=600",
      achievement: "Groundbreaking research on pediatric epilepsy management in resource-limited settings"
    },
    {
      id: 2,
      title: "Young Investigator Award",
      description: "Supporting emerging researchers under 35 years of age making significant contributions to child neurology.",
      category: "young-investigator",
      recipient: "Dr. Kwame Asante",
      institution: "Korle-Bu Teaching Hospital, Ghana",
      year: "2024",
      image: "https://images.pexels.com/photos/4173239/pexels-photo-4173239.jpeg?auto=compress&cs=tinysrgb&w=600",
      achievement: "Innovative telemedicine solutions for neurological care in rural communities"
    },
    {
      id: 3,
      title: "Lifetime Achievement Award",
      description: "Honoring a career of exceptional service and contribution to African child neurology.",
      category: "lifetime",
      recipient: "Prof. Amara Okafor",
      institution: "University of Lagos, Nigeria",
      year: "2024",
      image: "https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=600",
      achievement: "30+ years of dedicated service and establishment of multiple pediatric neurology centers across West Africa"
    },
    {
      id: 4,
      title: "Community Impact Award",
      description: "Recognizing initiatives that significantly improve child neurology care accessibility.",
      category: "community",
      recipient: "Dr. Fatima Al-Rashid",
      institution: "Cairo University Children's Hospital",
      year: "2023",
      image: "https://images.pexels.com/photos/4021775/pexels-photo-4021775.jpeg?auto=compress&cs=tinysrgb&w=600",
      achievement: "Mobile neurology clinic serving remote areas across North Africa"
    },
    {
      id: 5,
      title: "Innovation in Education Award",
      description: "Advancing medical education and training in pediatric neurology.",
      category: "education",
      recipient: "Dr. Nelson Mandela",
      institution: "University of Cape Town",
      year: "2023",
      image: "https://images.pexels.com/photos/3825583/pexels-photo-3825583.jpeg?auto=compress&cs=tinysrgb&w=600",
      achievement: "Development of comprehensive online training platform for pediatric neurology"
    },
    {
      id: 6,
      title: "Best Clinical Case Presentation",
      description: "Outstanding presentation of complex clinical cases advancing medical knowledge.",
      category: "clinical",
      recipient: "Dr. Maria Santos",
      institution: "Hospital Pediatrico, Maputo",
      year: "2023",
      image: "https://images.pexels.com/photos/4021775/pexels-photo-4021775.jpeg?auto=compress&cs=tinysrgb&w=600",
      achievement: "Innovative treatment approach for rare genetic neurological conditions"
    }
  ];

  const upcomingAwards = [
    {
      id: 1,
      title: "ACNA Research Excellence Award 2025",
      deadline: "March 1, 2025",
      category: "Research",
      description: "Submit your groundbreaking research in pediatric neurology for recognition."
    },
    {
      id: 2,
      title: "Young Investigator Award 2025",
      deadline: "February 15, 2025",
      category: "Young Investigator",
      description: "Open to researchers under 35 with innovative contributions to the field."
    },
    {
      id: 3,
      title: "Community Impact Award 2025",
      deadline: "April 1, 2025",
      category: "Community Service",
      description: "Recognizing initiatives that improve access to neurological care."
    }
  ];

  const filteredAwards = awards.filter(award => 
    selectedCategory === 'all' || award.category === selectedCategory
  );

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-yellow-900 to-yellow-700 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Awards & Recognition
            </h1>
            <p className="text-xl text-yellow-100 max-w-3xl mx-auto">
              Celebrating excellence in child neurology research, clinical care, education, 
              and community service across Africa.
            </p>
          </div>
        </div>
      </section>

      {/* Awards Categories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Award Categories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              ACNA recognizes excellence across multiple domains of child neurology practice and research
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-xl text-center hover:shadow-lg transition-shadow duration-200">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Research Excellence</h3>
              <p className="text-gray-600 mb-6">
                Recognizing groundbreaking research that advances our understanding of pediatric neurological conditions.
              </p>
              <button className="text-blue-600 font-medium hover:text-blue-700 inline-flex items-center">
                Learn More <ArrowRight className="ml-1 w-4 h-4" />
              </button>
            </div>

            <div className="bg-gray-50 p-8 rounded-xl text-center hover:shadow-lg transition-shadow duration-200">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Young Investigator</h3>
              <p className="text-gray-600 mb-6">
                Supporting and celebrating emerging researchers under 35 making significant contributions to the field.
              </p>
              <button className="text-blue-600 font-medium hover:text-blue-700 inline-flex items-center">
                Learn More <ArrowRight className="ml-1 w-4 h-4" />
              </button>
            </div>

            <div className="bg-gray-50 p-8 rounded-xl text-center hover:shadow-lg transition-shadow duration-200">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Medal className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Lifetime Achievement</h3>
              <p className="text-gray-600 mb-6">
                Honoring careers of exceptional service and long-term contribution to African child neurology.
              </p>
              <button className="text-blue-600 font-medium hover:text-blue-700 inline-flex items-center">
                Learn More <ArrowRight className="ml-1 w-4 h-4" />
              </button>
            </div>

            <div className="bg-gray-50 p-8 rounded-xl text-center hover:shadow-lg transition-shadow duration-200">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Community Impact</h3>
              <p className="text-gray-600 mb-6">
                Recognizing initiatives that significantly improve access to neurological care in communities.
              </p>
              <button className="text-blue-600 font-medium hover:text-blue-700 inline-flex items-center">
                Learn More <ArrowRight className="ml-1 w-4 h-4" />
              </button>
            </div>

            <div className="bg-gray-50 p-8 rounded-xl text-center hover:shadow-lg transition-shadow duration-200">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Innovation in Education</h3>
              <p className="text-gray-600 mb-6">
                Advancing medical education and training methodologies in pediatric neurology.
              </p>
              <button className="text-blue-600 font-medium hover:text-blue-700 inline-flex items-center">
                Learn More <ArrowRight className="ml-1 w-4 h-4" />
              </button>
            </div>

            <div className="bg-gray-50 p-8 rounded-xl text-center hover:shadow-lg transition-shadow duration-200">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Clinical Excellence</h3>
              <p className="text-gray-600 mb-6">
                Outstanding clinical case presentations and innovative treatment approaches.
              </p>
              <button className="text-blue-600 font-medium hover:text-blue-700 inline-flex items-center">
                Learn More <ArrowRight className="ml-1 w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Winners */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Recent Award Winners</h2>
              <p className="text-xl text-gray-600">Celebrating our 2024 and 2023 award recipients</p>
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="all">All Categories</option>
              <option value="research">Research Excellence</option>
              <option value="young-investigator">Young Investigator</option>
              <option value="lifetime">Lifetime Achievement</option>
              <option value="community">Community Impact</option>
              <option value="education">Innovation in Education</option>
              <option value="clinical">Clinical Excellence</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAwards.map((award) => (
              <div key={award.id} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                <img
                  src={award.image}
                  alt={award.recipient}
                  className="w-20 h-20 rounded-full mx-auto mb-6 object-cover"
                />
                
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{award.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{award.description}</p>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                    <div className="flex items-center justify-center mb-2">
                      <Trophy className="w-5 h-5 text-yellow-600 mr-2" />
                      <span className="text-yellow-800 font-medium">{award.year} Winner</span>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">{award.recipient}</div>
                    <div className="text-sm text-gray-600">{award.institution}</div>
                  </div>
                  
                  <p className="text-sm text-gray-600 italic">"{award.achievement}"</p>
                </div>
                
                <button className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-yellow-700 transition-colors">
                  Read Full Story
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call for Nominations */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              2025 Award Nominations Now Open
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nominate exceptional individuals and initiatives for ACNA's prestigious awards
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {upcomingAwards.map((award) => (
              <div key={award.id} className="bg-gradient-to-br from-yellow-50 to-orange-50 p-8 rounded-xl border border-yellow-200">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                    <Award className="w-5 h-5 text-yellow-600" />
                  </div>
                  <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                    {award.category}
                  </span>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{award.title}</h3>
                <p className="text-gray-600 mb-4">{award.description}</p>
                
                <div className="flex items-center text-sm text-gray-500 mb-6">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Deadline: {award.deadline}</span>
                </div>
                
                <div className="flex gap-2">
                  <button className="flex-1 bg-yellow-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors">
                    Nominate
                  </button>
                  <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                    Guidelines
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nomination Process */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Nomination Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Follow these simple steps to nominate deserving individuals for ACNA awards
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-yellow-600">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Review Criteria</h3>
              <p className="text-gray-600">
                Read the specific criteria and requirements for each award category.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-yellow-600">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Prepare Documentation</h3>
              <p className="text-gray-600">
                Gather required supporting documents, CV, and recommendation letters.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-yellow-600">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Submit Nomination</h3>
              <p className="text-gray-600">
                Complete the online nomination form before the deadline.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-yellow-600">4</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Review Process</h3>
              <p className="text-gray-600">
                Expert panel reviews nominations and selects winners for announcement.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <button className="bg-yellow-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-700 transition-colors inline-flex items-center">
              Start Nomination Process
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-yellow-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Recognize Excellence in Your Community
          </h2>
          <p className="text-xl text-yellow-100 mb-8 max-w-3xl mx-auto">
            Help us celebrate outstanding contributions to child neurology across Africa. 
            Your nominations help recognize and inspire excellence in our field.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-yellow-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors inline-flex items-center justify-center">
              Submit Nomination
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-yellow-600 transition-colors">
              View Past Winners
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Awards;