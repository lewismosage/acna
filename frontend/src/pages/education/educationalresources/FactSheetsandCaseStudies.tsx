import React, { useState } from "react";
import {
  Download,
  FileText,
  Users,
  Brain,
  Search,
  Filter,
} from "lucide-react";
import CaseStudies from "./CaseStudies";

interface FactSheet {
  id: number;
  title: string;
  category: string;
  description: string;
  downloadCount: string;
  datePublished: string;
  fileSize: string;
  imageUrl: string;
  tags: string[];
}

const FactSheetsAndCaseStudies = () => {
  const [activeTab, setActiveTab] = useState<"factsheets" | "casestudies">(
    "factsheets"
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const factSheets: FactSheet[] = [
    {
      id: 1,
      title: "Epilepsy in African Children: Understanding the Burden",
      category: "Epilepsy",
      description:
        "Comprehensive overview of epilepsy prevalence, causes, and treatment challenges in African pediatric populations.",
      downloadCount: "2.4K",
      datePublished: "July 2025",
      fileSize: "1.2 MB",
      imageUrl:
        "https://images.pexels.com/photos/4260325/pexels-photo-4260325.jpeg?auto=compress&cs=tinysrgb&w=600",
      tags: ["Epilepsy", "Statistics", "Treatment", "Africa"],
    },
    {
      id: 2,
      title: "Cerebral Palsy: Early Detection and Intervention Strategies",
      category: "Cerebral Palsy",
      description:
        "Evidence-based guidelines for early identification and comprehensive management of cerebral palsy in resource-limited settings.",
      downloadCount: "1.8K",
      datePublished: "June 2025",
      fileSize: "2.1 MB",
      imageUrl:
        "https://images.pexels.com/photos/4260323/pexels-photo-4260323.jpeg?auto=compress&cs=tinysrgb&w=600",
      tags: ["Cerebral Palsy", "Early Detection", "Intervention", "Guidelines"],
    },
    {
      id: 3,
      title:
        "Neurodevelopmental Disorders: Screening Tools for African Healthcare Settings",
      category: "Neurodevelopment",
      description:
        "Culturally adapted screening instruments and assessment protocols for identifying developmental delays in African children.",
      downloadCount: "3.1K",
      datePublished: "May 2025",
      fileSize: "1.8 MB",
      imageUrl:
        "https://images.pexels.com/photos/11035398/pexels-photo-11035398.jpeg?auto=compress&cs=tinysrgb&w=600",
      tags: ["Screening", "Development", "Assessment", "Tools"],
    },
    {
      id: 4,
      title:
        "Malnutrition and Brain Development: Critical Periods and Interventions",
      category: "Nutrition",
      description:
        "Impact of malnutrition on neurological development and evidence-based nutritional interventions for optimal brain health.",
      downloadCount: "2.7K",
      datePublished: "April 2025",
      fileSize: "1.5 MB",
      imageUrl:
        "https://images.pexels.com/photos/3184192/pexels-photo-3184192.jpeg?auto=compress&cs=tinysrgb&w=600",
      tags: ["Nutrition", "Brain Development", "Malnutrition", "Prevention"],
    },
    {
      id: 5,
      title: "Febrile Seizures in Tropical Settings: Management Guidelines",
      category: "Seizures",
      description:
        "Clinical protocols for managing febrile seizures in children with consideration for tropical disease contexts and resource availability.",
      downloadCount: "1.9K",
      datePublished: "March 2025",
      fileSize: "1.0 MB",
      imageUrl:
        "https://images.pexels.com/photos/3985163/pexels-photo-3985163.jpeg?auto=compress&cs=tinysrgb&w=600",
      tags: [
        "Febrile Seizures",
        "Tropical Medicine",
        "Emergency Care",
        "Guidelines",
      ],
    },
    {
      id: 6,
      title: "Community-Based Rehabilitation for Neurological Disabilities",
      category: "Rehabilitation",
      description:
        "Practical guide for implementing community-based rehabilitation programs for children with neurological disabilities in African communities.",
      downloadCount: "2.2K",
      datePublished: "February 2025",
      fileSize: "2.8 MB",
      imageUrl:
        "https://images.pexels.com/photos/8828698/pexels-photo-8828698.jpeg?auto=compress&cs=tinysrgb&w=600",
      tags: ["Rehabilitation", "Community Care", "Disability", "Inclusion"],
    },
  ];

  // Case studies count for display (would be passed from CaseStudies component in real app)
  const caseStudiesCount = 3;

  const categories = {
    factsheets: [
      "all",
      "Epilepsy",
      "Cerebral Palsy",
      "Neurodevelopment",
      "Nutrition",
      "Seizures",
      "Rehabilitation",
    ],
    casestudies: [
      "all",
      "Epilepsy Care",
      "Mobile Health",
      "Telemedicine",
      "Community Engagement",
      "Early Intervention",
      "Capacity Building",
    ],
  };

  const filteredFactSheets = factSheets.filter((sheet) => {
    const matchesCategory =
      selectedCategory === "all" || sheet.category === selectedCategory;
    const matchesSearch =
      sheet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sheet.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-6">
            Educational Resources
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 font-light max-w-3xl mx-auto mb-8">
            Comprehensive fact sheets and real-world case studies advancing
            child neurology knowledge across Africa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="flex items-center text-gray-600">
              <FileText className="w-5 h-5 mr-2 text-red-600" />
              <span>{factSheets.length} Fact Sheets Available</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Users className="w-5 h-5 mr-2 text-red-600" />
              <span>{caseStudiesCount} Case Studies Documented</span>
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
                onClick={() => {
                  setActiveTab("factsheets");
                  setSelectedCategory("all");
                  setSearchTerm("");
                }}
                className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                  activeTab === "factsheets"
                    ? "bg-white text-red-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Fact Sheets
              </button>
              <button
                onClick={() => {
                  setActiveTab("casestudies");
                  setSelectedCategory("all");
                  setSearchTerm("");
                }}
                className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                  activeTab === "casestudies"
                    ? "bg-white text-red-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Case Studies
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Bar */}
      <section className="py-6 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${
                  activeTab === "factsheets" ? "fact sheets" : "case studies"
                }...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
              >
                {categories[activeTab].map((category) => (
                  <option key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          {activeTab === "factsheets" ? (
            <div>
              {/* Fact Sheets Header */}
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
                  Clinical Fact Sheets
                </h2>
                <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Evidence-based resources providing essential information about
                  pediatric neurological conditions, diagnostic approaches, and
                  management strategies tailored for African healthcare
                  settings.
                </p>
              </div>

              {/* Fact Sheets Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredFactSheets.map((sheet) => (
                  <div
                    key={sheet.id}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                  >
                    <div className="relative">
                      <img
                        src={sheet.imageUrl}
                        alt={sheet.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="bg-red-600 text-white px-2 py-1 text-xs font-bold uppercase tracking-wide rounded">
                          {sheet.category}
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight">
                        {sheet.title}
                      </h3>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {sheet.description}
                      </p>

                      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                        <span>{sheet.datePublished}</span>
                        <span>{sheet.fileSize}</span>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {sheet.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 text-gray-600 px-2 py-1 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-600">
                          <Download className="w-4 h-4 mr-1" />
                          {sheet.downloadCount} downloads
                        </div>
                        <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-medium">
                          Download PDF
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredFactSheets.length === 0 && (
                <div className="text-center py-12">
                  <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No fact sheets found
                  </h3>
                  <p className="text-gray-600">
                    Try adjusting your search or filter criteria.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <CaseStudies 
              selectedCategory={selectedCategory} 
              searchTerm={searchTerm} 
            />
          )}
        </div>
      </section>
    </div>
  );
};

export default FactSheetsAndCaseStudies;