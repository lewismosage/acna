import React from "react";
import { Users, Heart, Eye } from "lucide-react";
import VideoCaseStudies from "./VideoCaseStudies";

interface CaseStudy {
  id: number;
  title: string;
  location: string;
  category: string;
  excerpt: string;
  readTime: string;
  datePublished: string;
  imageUrl: string;
  impact: string;
  featured?: boolean;
}

interface CaseStudiesProps {
  selectedCategory: string;
  searchTerm: string;
}

const CaseStudies: React.FC<CaseStudiesProps> = ({ selectedCategory, searchTerm }) => {
  const caseStudies: CaseStudy[] = [
    {
      id: 1,
      title:
        "From Stigma to Support: Changing Attitudes Toward Cerebral Palsy in Nigeria",
      location: "Lagos State, Nigeria",
      category: "Community Engagement",
      excerpt:
        "Community education program transforms local attitudes toward cerebral palsy, increasing school enrollment and reducing social isolation.",
      readTime: "9 min read",
      datePublished: "April 2025",
      imageUrl:
        "https://images.pexels.com/photos/1181438/pexels-photo-1181438.jpeg?auto=compress&cs=tinysrgb&w=600",
      impact: "85% attitude change",
      featured: false,
    },
    {
      id: 2,
      title:
        "Early Intervention Success: Rwanda's Developmental Screening Program",
      location: "Kigali Province, Rwanda",
      category: "Early Intervention",
      excerpt:
        "National implementation of early developmental screening leads to significant improvements in early identification and intervention for neurodevelopmental delays.",
      readTime: "10 min read",
      datePublished: "March 2025",
      imageUrl:
        "https://images.pexels.com/photos/3184638/pexels-photo-3184638.jpeg?auto=compress&cs=tinysrgb&w=600",
      impact: "12,000+ children screened",
      featured: false,
    },
    {
      id: 3,
      title:
        "Training the Trainers: Building Neurological Capacity in Ethiopia",
      location: "Addis Ababa, Ethiopia",
      category: "Capacity Building",
      excerpt:
        "Comprehensive training program for healthcare professionals creates a network of skilled practitioners capable of managing pediatric neurological conditions.",
      readTime: "8 min read",
      datePublished: "February 2025",
      imageUrl:
        "https://images.pexels.com/photos/8199562/pexels-photo-8199562.jpeg?auto=compress&cs=tinysrgb&w=600",
      impact: "120 professionals trained",
      featured: false,
    },
  ];

  const filteredCaseStudies = caseStudies.filter((study) => {
    const matchesCategory =
      selectedCategory === "all" || study.category === selectedCategory;
    const matchesSearch =
      study.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      study.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredCaseStudies = caseStudies.filter((study) => study.featured);

  return (
    <div>
      {/* Featured Case Studies */}
      {featuredCaseStudies.length > 0 &&
        selectedCategory === "all" &&
        !searchTerm && (
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-2">
                Featured Case Studies
              </h2>
              <div className="w-16 h-1 bg-red-600 mx-auto"></div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {featuredCaseStudies.map((study) => (
                <div
                  key={study.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200"
                >
                  <div className="relative">
                    <img
                      src={study.imageUrl}
                      alt={study.title}
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="bg-orange-600 text-white px-2 py-1 text-xs font-bold uppercase tracking-wide rounded">
                        Featured
                      </span>
                      <span className="bg-red-600 text-white px-2 py-1 text-xs font-bold uppercase tracking-wide rounded">
                        {study.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <span>{study.location}</span>
                      <span className="mx-2">•</span>
                      <span>{study.readTime}</span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight hover:text-red-600 transition-colors cursor-pointer">
                      {study.title}
                    </h3>

                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {study.excerpt}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm">
                        <Heart className="w-4 h-4 text-red-600 mr-1" />
                        <span className="text-red-600 font-medium">
                          {study.impact}
                        </span>
                      </div>
                      <button className="text-red-600 font-medium hover:text-red-700 text-sm">
                        Read Full Story →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* All Case Studies */}
      <div>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
            {selectedCategory === "all" && !searchTerm
              ? "All Case Studies"
              : "Case Studies"}
          </h2>
          <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Real-world examples of successful interventions, innovative
            approaches, and transformative outcomes in pediatric
            neurology across African healthcare systems.
          </p>
        </div>

        <div className="space-y-8">
          {filteredCaseStudies.map((study) => (
            <div
              key={study.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
            >
              <div className="flex flex-col md:flex-row">
                <div className="relative md:w-80 h-48 md:h-auto flex-shrink-0">
                  <img
                    src={study.imageUrl}
                    alt={study.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-red-600 text-white px-2 py-1 text-xs font-bold uppercase tracking-wide rounded">
                      {study.category}
                    </span>
                  </div>
                </div>

                <div className="flex-1 p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <span>{study.location}</span>
                    <span className="mx-2">•</span>
                    <span>{study.datePublished}</span>
                    <span className="mx-2">•</span>
                    <span>{study.readTime}</span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight hover:text-red-600 transition-colors cursor-pointer">
                    {study.title}
                  </h3>

                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {study.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm">
                      <Eye className="w-4 h-4 text-red-600 mr-1" />
                      <span className="text-red-600 font-medium">
                        Impact: {study.impact}
                      </span>
                    </div>
                    <button className="text-red-600 font-medium hover:text-red-700 text-sm">
                      Read Case Study →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <VideoCaseStudies />
        </div>

        {filteredCaseStudies.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No case studies found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseStudies;