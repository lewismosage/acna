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
} from "lucide-react";

interface PositionStatement {
  id: number;
  title: string;
  category: string;
  issueDate: string;
  lastUpdated: string;
  status: "Current" | "Under Review" | "Draft";
  priority: "High" | "Medium" | "Low";
  summary: string;
  keyPoints: string[];
  downloadCount: string;
  pageCount: number;
  relatedPolicies?: string[];
  targetAudience: string[];
  imageUrl: string;
}

const PositionStatements = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [expandedStatement, setExpandedStatement] = useState<number | null>(
    null
  );

  const positionStatements: PositionStatement[] = [
    {
      id: 1,
      title: "Universal Access to Anti-Epileptic Drugs for African Children",
      category: "Epilepsy & Seizures",
      issueDate: "July 2025",
      lastUpdated: "July 2025",
      status: "Current",
      priority: "High",
      summary:
        "ACNA advocates for immediate policy reforms to ensure universal access to essential anti-epileptic drugs for all African children, addressing the critical treatment gap that affects over 5 million children across the continent.",
      keyPoints: [
        "Elimination of import tariffs on essential anti-epileptic medications",
        "Development of generic drug manufacturing capabilities within Africa",
        "Integration of epilepsy care into primary healthcare systems",
        "Training programs for primary healthcare workers in seizure management",
        "Community-based distribution systems for remote areas",
      ],
      downloadCount: "3.2K",
      pageCount: 12,
      targetAudience: [
        "Policy Makers",
        "Health Ministers",
        "WHO Regional Offices",
        "Pharmaceutical Companies",
      ],
      relatedPolicies: [
        "WHO Essential Medicines List",
        "African Union Health Strategy",
      ],
      imageUrl:
        "https://images.pexels.com/photos/4260325/pexels-photo-4260325.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
    {
      id: 2,
      title: "Mandatory Newborn Neurological Screening Programs",
      category: "Early Detection & Prevention",
      issueDate: "June 2025",
      lastUpdated: "June 2025",
      status: "Current",
      priority: "High",
      summary:
        "ACNA calls for the implementation of standardized newborn neurological screening programs across all African healthcare systems to enable early detection and intervention for neurodevelopmental disorders.",
      keyPoints: [
        "Implementation of universal newborn neurological assessments",
        "Development of culturally appropriate screening tools",
        "Training of healthcare workers in early detection methods",
        "Establishment of referral pathways for specialized care",
        "Integration with existing maternal and child health programs",
      ],
      downloadCount: "2.8K",
      pageCount: 15,
      targetAudience: [
        "Pediatricians",
        "Midwives",
        "Health System Administrators",
        "UNICEF",
      ],
      relatedPolicies: [
        "Sustainable Development Goals",
        "Every Newborn Action Plan",
      ],
      imageUrl:
        "https://images.pexels.com/photos/3985163/pexels-photo-3985163.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
    
  ];

  const categories = [
    "all",
    "Epilepsy & Seizures",
    "Early Detection & Prevention",
    "Social Inclusion & Rights",
    "Emergency & Crisis Response",
    "Technology & Innovation",
    "Nutrition & Development",
    "Professional Development",
    "Environmental Health",
  ];
  const statuses = ["all", "Current", "Under Review", "Draft"];

  const filteredStatements = positionStatements.filter((statement) => {
    const matchesCategory =
      selectedCategory === "all" || statement.category === selectedCategory;
    const matchesStatus =
      selectedStatus === "all" || statement.status === selectedStatus;
    const matchesSearch =
      statement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      statement.summary.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Current":
        return "bg-green-100 text-green-800";
      case "Under Review":
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
            Position Statements
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 font-light max-w-3xl mx-auto mb-8">
            ACNA's official positions on critical child neurology issues
            affecting African children and healthcare systems.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-gray-600">
            <div className="flex items-center">
              <FileText className="w-5 h-5 mr-2 text-red-600" />
              <span>{positionStatements.length} Official Statements</span>
            </div>
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
              <span>
                {positionStatements.filter((s) => s.priority === "High").length}{" "}
                High Priority Issues
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
              About Our Position Statements
            </h2>
            <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
          </div>

          <div className="space-y-6 text-gray-700 leading-relaxed text-lg">
            <p>
              ACNA's position statements represent our organization's official
              stance on critical issues affecting child neurological health
              across Africa. These evidence-based documents serve as
              authoritative resources for policymakers, healthcare
              professionals, and advocates working to improve neurological care
              for children.
            </p>
            <p>
              Each position statement is developed through rigorous consultation
              with our network of pediatric neurologists, researchers, and
              healthcare professionals across the continent. They reflect
              current scientific evidence, best practices, and the unique
              challenges facing African healthcare systems.
            </p>
            <p>
              Our position statements are designed to influence policy
              development, guide clinical practice, advocate for systemic
              changes, and promote awareness of critical neurological health
              issues affecting African children.
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
                placeholder="Search position statements..."
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
            </div>
          </div>
        </div>
      </section>

      {/* Position Statements List */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="space-y-8">
            {filteredStatements.map((statement) => (
              <div
                key={statement.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden border border-gray-200"
              >
                <div className="flex flex-col lg:flex-row">
                  {/* Image */}
                  <div className="lg:w-64 h-48 lg:h-auto flex-shrink-0">
                    <img
                      src={statement.imageUrl}
                      alt={statement.title}
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
                              statement.status
                            )}`}
                          >
                            {statement.status}
                          </span>
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs font-medium rounded">
                            {statement.category}
                          </span>
                          <span
                            className={`text-xs font-medium ${getPriorityColor(
                              statement.priority
                            )}`}
                          >
                            {statement.priority} Priority
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight hover:text-red-600 transition-colors cursor-pointer">
                          {statement.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-2 sm:mt-0">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {statement.issueDate}
                        </div>
                        <div className="flex items-center">
                          <Download className="w-4 h-4 mr-1" />
                          {statement.downloadCount}
                        </div>
                        <span>{statement.pageCount} pages</span>
                      </div>
                    </div>

                    {/* Summary */}
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {statement.summary}
                    </p>

                    {/* Key Points Preview */}
                    {expandedStatement === statement.id ? (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Key Policy Recommendations:
                        </h4>
                        <ul className="space-y-1 text-sm text-gray-600">
                          {statement.keyPoints.map((point, index) => (
                            <li key={index} className="flex items-start">
                              <ChevronRight className="w-4 h-4 mr-1 mt-0.5 text-red-600 flex-shrink-0" />
                              {point}
                            </li>
                          ))}
                        </ul>

                        {statement.targetAudience && (
                          <div className="mt-4">
                            <h4 className="font-semibold text-gray-900 mb-2">
                              Target Audience:
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {statement.targetAudience.map(
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
                          Key areas:{" "}
                          {statement.keyPoints.slice(0, 2).join(", ")}
                          {statement.keyPoints.length > 2 &&
                            ` and ${statement.keyPoints.length - 2} more...`}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                      <button
                        onClick={() =>
                          setExpandedStatement(
                            expandedStatement === statement.id
                              ? null
                              : statement.id
                          )
                        }
                        className="text-red-600 font-medium hover:text-red-700 text-sm self-start"
                      >
                        {expandedStatement === statement.id
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

          {filteredStatements.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No position statements found
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

export default PositionStatements;
