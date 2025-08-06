import React, { useState } from "react";
import {
  BookOpen,
  Search,
  Filter,
  Calendar,
  Download,
  ExternalLink,
  FileText,
  ChevronDown,
  ChevronUp,
  Globe,
  ClipboardList,
  BarChart2,
  User,
  Hash,
} from "lucide-react";

interface JournalArticle {
  id: number;
  title: string;
  authors: string;
  journal: string;
  publicationDate: string;
  doi: string;
  summary: string;
  keyFindings: string[];
  relevance: "High" | "Medium" | "Low";
  studyType: string;
  population: string;
  countryFocus: string[];
  tags: string[];
  access: "Open" | "Subscription";
  rating?: number;
  commentary?: string;
}

const JournalWatch = () => {
  const [selectedStudyType, setSelectedStudyType] = useState<string>("all");
  const [selectedRelevance, setSelectedRelevance] = useState<string>("all");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [expandedArticle, setExpandedArticle] = useState<number | null>(null);

  const journalArticles: JournalArticle[] = [
    {
      id: 1,
      title: "Prevalence and Risk Factors for Pediatric Epilepsy in Rural Kenya",
      authors: "Muthoni et al.",
      journal: "African Journal of Neurology",
      publicationDate: "June 2025",
      doi: "10.1234/ajneu.2025.0123",
      summary:
        "Community-based study identifying prevalence of epilepsy in children aged 2-15 years in rural Western Kenya, with analysis of associated risk factors.",
      keyFindings: [
        "Prevalence of active epilepsy was 12.3 per 1000 children",
        "Major risk factors included birth complications (OR 3.2) and cerebral malaria (OR 4.1)",
        "68% of cases were not receiving regular treatment",
        "Significant association with family history (p<0.01)"
      ],
      relevance: "High",
      studyType: "Epidemiology",
      population: "Children 2-15 years",
      countryFocus: ["Kenya"],
      tags: ["Epilepsy", "Prevalence", "Risk Factors"],
      access: "Open",
      rating: 4.5,
      commentary: "Important baseline data for service planning in similar rural African contexts."
    },
    {
      id: 2,
      title: "Effectiveness of Community-Based Rehabilitation for Cerebral Palsy in Uganda",
      authors: "Nakato et al.",
      journal: "Journal of Pediatric Rehabilitation",
      publicationDate: "May 2025",
      doi: "10.5678/jpr.2025.0456",
      summary:
        "Randomized controlled trial comparing community-based rehabilitation to standard care for children with cerebral palsy in Uganda.",
      keyFindings: [
        "Community program showed 42% greater improvement in motor function",
        "Caregiver satisfaction scores 78% vs 52% in control group",
        "Cost-effective at $23 per quality-adjusted life year",
        "Recommended for scale-up in similar low-resource settings"
      ],
      relevance: "High",
      studyType: "Intervention",
      population: "Children 1-12 years with CP",
      countryFocus: ["Uganda"],
      tags: ["Cerebral Palsy", "Rehabilitation", "Community Health"],
      access: "Subscription",
      rating: 4.8
    },
    {
      id: 3,
      title: "Neurodevelopmental Outcomes of Neonatal Jaundice in Nigeria",
      authors: "Adeleke et al.",
      journal: "Pediatric Research",
      publicationDate: "April 2025",
      doi: "10.9101/pedres.2025.0789",
      summary:
        "Prospective cohort study following infants with severe neonatal jaundice to assess long-term neurodevelopmental outcomes.",
      keyFindings: [
        "23% of cases showed developmental delay at 12 months",
        "Auditory processing most commonly affected domain",
        "Early intervention improved outcomes by 31%",
        "Recommend routine developmental screening post-jaundice"
      ],
      relevance: "Medium",
      studyType: "Cohort",
      population: "Infants with severe jaundice",
      countryFocus: ["Nigeria"],
      tags: ["Neonatal Jaundice", "Neurodevelopment", "Early Intervention"],
      access: "Open",
      rating: 4.2
    },
    {
      id: 4,
      title: "Genetic Markers of Autism Spectrum Disorder in South African Children",
      authors: "Petersen et al.",
      journal: "Nature Genetics Africa",
      publicationDate: "March 2025",
      doi: "10.2468/nga.2025.0321",
      summary:
        "Genome-wide association study identifying novel genetic variants associated with ASD in African populations.",
      keyFindings: [
        "Identified 3 novel loci specific to African genomes",
        "Heritability estimate of 0.65 in study population",
        "Different genetic architecture compared to European populations",
        "Potential implications for diagnostic testing in African contexts"
      ],
      relevance: "Medium",
      studyType: "Genetics",
      population: "Children with ASD",
      countryFocus: ["South Africa"],
      tags: ["Autism", "Genetics", "Biomarkers"],
      access: "Subscription",
      rating: 4.0
    },
    {
      id: 5,
      title: "Impact of Malaria Prevention on Cognitive Outcomes in Tanzanian Children",
      authors: "Massawe et al.",
      journal: "Lancet Global Health",
      publicationDate: "February 2025",
      doi: "10.3579/lancetgh.2025.0654",
      summary:
        "Cluster-randomized trial evaluating cognitive benefits of enhanced malaria prevention in school-aged children.",
      keyFindings: [
        "Intervention group showed 11.3 point higher cognitive scores",
        "Greater impact in children under 8 years",
        "School attendance improved by 18%",
        "Cost-benefit ratio favorable at scale"
      ],
      relevance: "High",
      studyType: "Intervention",
      population: "School-aged children",
      countryFocus: ["Tanzania"],
      tags: ["Malaria", "Cognition", "School Performance"],
      access: "Open",
      rating: 4.7,
      commentary: "Strong evidence for integrating malaria control with education programs."
    }
  ];

  const studyTypes = ["all", "Epidemiology", "Intervention", "Cohort", "Genetics", "Clinical Trial", "Systematic Review"];
  const relevanceLevels = ["all", "High", "Medium", "Low"];
  const countries = ["all", "Kenya", "Uganda", "Nigeria", "South Africa", "Tanzania", "Multi-Country"];

  const filteredArticles = journalArticles.filter((article) => {
    const matchesStudyType = selectedStudyType === "all" || article.studyType === selectedStudyType;
    const matchesRelevance = selectedRelevance === "all" || article.relevance === selectedRelevance;
    const matchesCountry = selectedCountry === "all" || article.countryFocus.includes(selectedCountry);
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStudyType && matchesRelevance && matchesCountry && matchesSearch;
  });

  const getRelevanceColor = (relevance: string) => {
    switch (relevance) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAccessColor = (access: string) => {
    return access === "Open" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800";
  };

  const renderRatingStars = (rating?: number) => {
    if (!rating) return null;
    
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
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
            Journal Watch
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 font-light max-w-3xl mx-auto mb-8">
            Curated summaries of recent pediatric neurology research relevant to African contexts
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-gray-600">
            <div className="flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-red-600" />
              <span>{journalArticles.length} Article Summaries</span>
            </div>
            <div className="flex items-center">
              <Globe className="w-5 h-5 mr-2 text-red-600" />
              <span>
                {journalArticles.filter(a => a.countryFocus.length > 1).length}{" "}
                Multi-Country Studies
              </span>
            </div>
            <div className="flex items-center">
              <FileText className="w-5 h-5 mr-2 text-red-600" />
              <span>
                {journalArticles.filter(a => a.access === "Open").length}{" "}
                Open Access
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
              About Journal Watch
            </h2>
            <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
          </div>

          <div className="space-y-6 text-gray-700 leading-relaxed text-lg">
            <p>
              Our Journal Watch service provides busy clinicians and researchers with 
              concise, critical summaries of the latest pediatric neurology research 
              with particular relevance to African populations and healthcare contexts.
            </p>
            <p>
              Each summary is prepared by ACNA's expert reviewers who evaluate the 
              methodology, findings, and practical implications of recent publications.
              We highlight studies that advance understanding of neurological conditions 
              affecting African children or offer insights applicable to resource-limited settings.
            </p>
            <p>
              Stay current with the evidence base while saving time - our team reads 
              the journals so you don't have to.
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
                placeholder="Search articles by title, summary or tags..."
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
                  value={selectedStudyType}
                  onChange={(e) => setSelectedStudyType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                >
                  {studyTypes.map((type) => (
                    <option key={type} value={type}>
                      {type === "all" ? "All Study Types" : type}
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={selectedRelevance}
                onChange={(e) => setSelectedRelevance(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
              >
                {relevanceLevels.map((level) => (
                  <option key={level} value={level}>
                    {level === "all" ? "All Relevance" : level}
                  </option>
                ))}
              </select>

              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
              >
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country === "all" ? "All Countries" : country}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Articles List */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="space-y-8">
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden border border-gray-200"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getRelevanceColor(article.relevance)}`}>
                          {article.relevance} Relevance
                        </span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs font-medium rounded">
                          {article.studyType}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getAccessColor(article.access)}`}>
                          {article.access} Access
                        </span>
                        {article.countryFocus.map((country, index) => (
                          <span key={index} className="bg-green-100 text-green-800 px-2 py-1 text-xs font-medium rounded">
                            {country}
                          </span>
                        ))}
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight hover:text-red-600 transition-colors cursor-pointer">
                        {article.title}
                      </h3>
                    </div>

                    {article.rating && (
                      <div className="mt-2 sm:mt-0">
                        {renderRatingStars(article.rating)}
                      </div>
                    )}
                  </div>

                  {/* Authors and Journal */}
                  <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-600 mb-4 gap-2">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {article.authors}
                    </div>
                    <span className="hidden sm:block">•</span>
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-1" />
                      {article.journal}
                    </div>
                    <span className="hidden sm:block">•</span>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {article.publicationDate}
                    </div>
                  </div>

                  {/* Summary */}
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {article.summary}
                  </p>

                  {/* Key Findings Preview */}
                  {expandedArticle === article.id ? (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Key Findings:
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        {article.keyFindings.map((finding, index) => (
                          <li key={index} className="flex items-start">
                            <Hash className="w-4 h-4 mr-2 mt-0.5 text-red-600 flex-shrink-0" />
                            {finding}
                          </li>
                        ))}
                      </ul>

                      {article.commentary && (
                        <div className="mt-4 bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg">
                          <h4 className="font-semibold text-gray-900 mb-2">
                            ACNA Commentary:
                          </h4>
                          <p className="text-gray-700 text-sm">
                            {article.commentary}
                          </p>
                        </div>
                      )}

                      <div className="mt-4">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Population:
                        </h4>
                        <p className="text-sm text-gray-600">{article.population}</p>
                      </div>

                      <div className="mt-3">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Tags:
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {article.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="bg-gray-100 text-gray-700 px-2 py-1 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">
                        Key findings: {article.keyFindings[0]}
                        {article.keyFindings.length > 1 &&
                          ` and ${article.keyFindings.length - 1} more...`}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <button
                      onClick={() =>
                        setExpandedArticle(
                          expandedArticle === article.id
                            ? null
                            : article.id
                        )
                      }
                      className="text-red-600 font-medium hover:text-red-700 text-sm self-start"
                    >
                      {expandedArticle === article.id
                        ? "Show Less"
                        : "Read More"}{" "}
                      {expandedArticle === article.id ? <ChevronUp className="inline ml-1 w-4 h-4" /> : <ChevronDown className="inline ml-1 w-4 h-4" />}
                    </button>

                    <div className="flex gap-3">
                      <a
                        href={`https://doi.org/${article.doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Article
                      </a>
                      <button className="flex items-center border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium">
                        <Download className="w-4 h-4 mr-2" />
                        Download Summary
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div className="text-center py-12">
              <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No articles found
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

export default JournalWatch;