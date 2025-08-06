import React, { useState } from "react";
import {
  FileText,
  Download,
  Calendar,
  Users,
  AlertCircle,
  Eye,
  Filter,
  Search,
  ChevronRight,
  BookOpen,
  Globe,
  ClipboardList,
} from "lucide-react";

interface PolicyBrief {
  id: number;
  title: string;
  category: string;
  issueDate: string;
  lastUpdated: string;
  status: "Current" | "Archived" | "Draft";
  priority: "High" | "Medium" | "Low";
  summary: string;
  keyRecommendations: string[];
  downloadCount: string;
  pageCount: number;
  relatedPolicies?: string[];
  targetAudience: string[];
  imageUrl: string;
  region?: string[];
}

const PolicyBriefs = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [expandedBrief, setExpandedBrief] = useState<number | null>(null);

  const policyBriefs: PolicyBrief[] = [
    {
      id: 1,
      title: "Improving Access to Pediatric Neurological Care in Rural Africa",
      category: "Healthcare Access",
      issueDate: "August 2025",
      lastUpdated: "August 2025",
      status: "Current",
      priority: "High",
      summary:
        "This policy brief outlines strategic recommendations for expanding access to pediatric neurological care in rural African communities, addressing the critical shortage of specialists and infrastructure.",
      keyRecommendations: [
        "Establish telemedicine networks connecting rural clinics with urban specialists",
        "Train community health workers in basic neurological assessment",
        "Implement mobile clinic programs for remote areas",
        "Develop regional centers of excellence for pediatric neurology",
        "Create referral pathways between primary care and specialist services"
      ],
      downloadCount: "2.5K",
      pageCount: 18,
      targetAudience: [
        "Health Ministers",
        "Healthcare Administrators",
        "NGOs",
        "International Donors"
      ],
      relatedPolicies: [
        "WHO Framework for Integrated People-Centered Health Services",
        "African Union Health Strategy"
      ],
      imageUrl: "https://images.pexels.com/photos/5721876/pexels-photo-5721876.jpeg",
      region: ["East Africa", "West Africa", "Southern Africa"]
    },
    {
      id: 2,
      title: "Nutritional Interventions for Neurodevelopmental Disorders",
      category: "Nutrition & Development",
      issueDate: "July 2025",
      lastUpdated: "July 2025",
      status: "Current",
      priority: "Medium",
      summary:
        "Evidence-based recommendations for nutritional interventions that support cognitive development and mitigate neurodevelopmental disorders in African children.",
      keyRecommendations: [
        "Fortification of staple foods with essential micronutrients",
        "Community education programs on neuroprotective diets",
        "Integration of nutritional screening in pediatric neurology clinics",
        "Research partnerships to study local dietary patterns and brain health",
        "Policy incentives for production of affordable nutritious foods"
      ],
      downloadCount: "1.8K",
      pageCount: 14,
      targetAudience: [
        "Nutrition Program Directors",
        "Public Health Officials",
        "Food Security Organizations",
        "Pediatricians"
      ],
      imageUrl: "https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg",
      region: ["All Regions"]
    },
    {
      id: 3,
      title: "Epilepsy Stigma Reduction in School Settings",
      category: "Epilepsy & Seizures",
      issueDate: "June 2025",
      lastUpdated: "June 2025",
      status: "Current",
      priority: "High",
      summary:
        "Policy framework for reducing stigma and improving educational outcomes for children with epilepsy across African school systems.",
      keyRecommendations: [
        "Mandatory teacher training on epilepsy awareness",
        "Development of school seizure action plans",
        "Peer education programs to reduce stigma",
        "Policy protections against educational discrimination",
        "School-based support groups for students with epilepsy"
      ],
      downloadCount: "1.2K",
      pageCount: 16,
      targetAudience: [
        "Education Ministers",
        "School Administrators",
        "Teachers Associations",
        "Parent Groups"
      ],
      imageUrl: "https://images.pexels.com/photos/5212359/pexels-photo-5212359.jpeg",
      region: ["East Africa", "West Africa"]
    },
    {
      id: 4,
      title: "Digital Health Solutions for Pediatric Neurology in Africa",
      category: "Technology & Innovation",
      issueDate: "May 2025",
      lastUpdated: "May 2025",
      status: "Current",
      priority: "Medium",
      summary:
        "Recommendations for implementing digital health technologies to improve diagnosis, treatment and monitoring of neurological conditions in African children.",
      keyRecommendations: [
        "Development of culturally adapted mobile health applications",
        "Telemedicine platforms for specialist consultations",
        "Electronic medical record systems for neurological conditions",
        "Mobile EEG and diagnostic tools for remote areas",
        "Training programs for healthcare workers on digital tools"
      ],
      downloadCount: "1.5K",
      pageCount: 20,
      targetAudience: [
        "Health Technology Officers",
        "Hospital Administrators",
        "Innovation Hubs",
        "Medical Schools"
      ],
      imageUrl: "https://images.pexels.com/photos/8386365/pexels-photo-8386365.jpeg",
      region: ["All Regions"]
    },
    {
      id: 5,
      title: "Early Intervention for Cerebral Palsy in Low-Resource Settings",
      category: "Early Detection & Prevention",
      issueDate: "April 2025",
      lastUpdated: "April 2025",
      status: "Current",
      priority: "High",
      summary:
        "Practical policy recommendations for implementing early intervention programs for cerebral palsy in African healthcare systems with limited resources.",
      keyRecommendations: [
        "Community-based screening programs",
        "Task-shifting models for therapy delivery",
        "Low-cost assistive device programs",
        "Family training and support initiatives",
        "Integration with existing maternal and child health services"
      ],
      downloadCount: "1.3K",
      pageCount: 22,
      targetAudience: [
        "Rehabilitation Specialists",
        "Community Health Workers",
        "Disability Organizations",
        "Pediatricians"
      ],
      imageUrl: "https://images.pexels.com/photos/4260323/pexels-photo-4260323.jpeg",
      region: ["Southern Africa", "East Africa"]
    }
  ];

  const categories = [
    "all",
    "Healthcare Access",
    "Nutrition & Development",
    "Epilepsy & Seizures",
    "Technology & Innovation",
    "Early Detection & Prevention",
    "Mental Health",
    "Education & Inclusion"
  ];

  const statuses = ["all", "Current", "Archived", "Draft"];
  const regions = ["all", "All Regions", "East Africa", "West Africa", "Southern Africa", "North Africa", "Central Africa"];

  const filteredBriefs = policyBriefs.filter((brief) => {
    const matchesCategory = selectedCategory === "all" || brief.category === selectedCategory;
    const matchesStatus = selectedStatus === "all" || brief.status === selectedStatus;
    const matchesRegion = selectedRegion === "all" || 
                         (brief.region && brief.region.includes(selectedRegion));
    const matchesSearch =
      brief.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brief.summary.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesStatus && matchesRegion && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Current":
        return "bg-green-100 text-green-800";
      case "Archived":
        return "bg-yellow-100 text-yellow-800";
      case "Draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "text-red-600";
      case "Medium":
        return "text-orange-600";
      case "Low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-6">
            Policy Briefs & Recommendations
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 font-light max-w-3xl mx-auto mb-8">
            Evidence-based policy recommendations to improve child neurological health outcomes across Africa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-gray-600">
            <div className="flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-red-600" />
              <span>{policyBriefs.length} Policy Briefs</span>
            </div>
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
              <span>
                {policyBriefs.filter((b) => b.priority === "High").length}{" "}
                High Priority Recommendations
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
              About Our Policy Briefs
            </h2>
            <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
          </div>

          <div className="space-y-6 text-gray-700 leading-relaxed text-lg">
            <p>
              ACNA's policy briefs provide concise, actionable recommendations for 
              policymakers, healthcare leaders, and advocates working to improve 
              neurological care for African children. Each brief synthesizes current 
              evidence with practical implementation guidance tailored to African contexts.
            </p>
            <p>
              Our recommendations are developed through rigorous research and consultation 
              with our network of pediatric neurologists, public health experts, and 
              policymakers across the continent. They address critical gaps in policy, 
              service delivery, and health system strengthening for child neurological care.
            </p>
            <p>
              These briefs are designed to inform national health strategies, guide 
              program development, and advocate for policy changes that will improve 
              outcomes for children with neurological conditions across Africa.
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
                placeholder="Search policy briefs..."
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
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status === "all" ? "All Statuses" : status}
                  </option>
                ))}
              </select>

              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
              >
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {region === "all" ? "All Regions" : region}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Policy Briefs List */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="space-y-8">
            {filteredBriefs.map((brief) => (
              <div
                key={brief.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden border border-gray-200"
              >
                <div className="flex flex-col lg:flex-row">
                  {/* Image */}
                  <div className="lg:w-64 h-48 lg:h-auto flex-shrink-0">
                    <img
                      src={brief.imageUrl}
                      alt={brief.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(
                              brief.status
                            )}`}
                          >
                            {brief.status}
                          </span>
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs font-medium rounded">
                            {brief.category}
                          </span>
                          <span
                            className={`text-xs font-medium ${getPriorityColor(
                              brief.priority
                            )}`}
                          >
                            {brief.priority} Priority
                          </span>
                          {brief.region && brief.region.includes("All Regions") ? (
                            <span className="bg-purple-100 text-purple-800 px-2 py-1 text-xs font-medium rounded">
                              Pan-African
                            </span>
                          ) : (
                            brief.region && brief.region.map((region, index) => (
                              <span key={index} className="bg-green-100 text-green-800 px-2 py-1 text-xs font-medium rounded">
                                {region}
                              </span>
                            ))
                          )}
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight hover:text-red-600 transition-colors cursor-pointer">
                          {brief.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-2 sm:mt-0">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {brief.issueDate}
                        </div>
                        <div className="flex items-center">
                          <Download className="w-4 h-4 mr-1" />
                          {brief.downloadCount}
                        </div>
                        <span>{brief.pageCount} pages</span>
                      </div>
                    </div>

                    {/* Summary */}
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {brief.summary}
                    </p>

                    {/* Key Recommendations Preview */}
                    {expandedBrief === brief.id ? (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Key Recommendations:
                        </h4>
                        <ul className="space-y-1 text-sm text-gray-600">
                          {brief.keyRecommendations.map((recommendation, index) => (
                            <li key={index} className="flex items-start">
                              <ChevronRight className="w-4 h-4 mr-1 mt-0.5 text-red-600 flex-shrink-0" />
                              {recommendation}
                            </li>
                          ))}
                        </ul>

                        {brief.targetAudience && (
                          <div className="mt-4">
                            <h4 className="font-semibold text-gray-900 mb-2">
                              Target Audience:
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {brief.targetAudience.map(
                                (audience, index) => (
                                  <span
                                    key={index}
                                    className="bg-gray-100 text-gray-700 px-2 py-1 text-xs rounded"
                                  >
                                    {audience}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600">
                          Key recommendations:{" "}
                          {brief.keyRecommendations.slice(0, 2).join(", ")}
                          {brief.keyRecommendations.length > 2 &&
                            ` and ${brief.keyRecommendations.length - 2} more...`}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                      <button
                        onClick={() =>
                          setExpandedBrief(
                            expandedBrief === brief.id
                              ? null
                              : brief.id
                          )
                        }
                        className="text-red-600 font-medium hover:text-red-700 text-sm self-start"
                      >
                        {expandedBrief === brief.id
                          ? "Show Less"
                          : "Read More"}{" "}
                        →
                      </button>

                      <div className="flex gap-3">
                        <button className="flex items-center bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-medium">
                          <Download className="w-4 h-4 mr-2" />
                          Download PDF
                        </button>
                        <button className="flex items-center border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredBriefs.length === 0 && (
            <div className="text-center py-12">
              <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No policy briefs found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Need Custom Policy Recommendations?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Our team can develop tailored policy briefs and recommendations for your specific context or region.
          </p>
          <button className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition">
            Request Policy Support
          </button>
        </div>
      </section>
    </div>
  );
};

export default PolicyBriefs;