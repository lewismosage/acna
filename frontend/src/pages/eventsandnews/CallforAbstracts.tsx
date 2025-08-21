import React, { useState, useEffect } from "react";
import {
  Calendar,
  FileText,
  Award,
  CheckCircle,
  Clock,
  Users,
  AlertCircle,
  Download,
  Upload,
  Search,
  Filter,
  Link,
  Loader,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ScrollToTop from "../../components/common/ScrollToTop";
import { getCurrentImportantDates, ImportantDates } from "../../services/abstractApi";

const CallForAbstracts = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [importantDates, setImportantDates] = useState<ImportantDates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch important dates on component mount
  useEffect(() => {
    const fetchImportantDates = async () => {
      try {
        setLoading(true);
        const dates = await getCurrentImportantDates();
        setImportantDates(dates);
      } catch (err) {
        console.error("Failed to fetch important dates:", err);
        setError("Failed to load important dates");
        // Fallback to hardcoded dates if API fails
        setImportantDates({
          year: 2026,
          abstractSubmissionOpens: "January 15, 2026",
          abstractSubmissionDeadline: "April 30, 2026",
          abstractReviewCompletion: "June 15, 2026",
          acceptanceNotifications: "July 1, 2026",
          finalAbstractSubmission: "August 15, 2026",
          conferencePresentation: "March 15-17, 2026",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchImportantDates();
  }, []);

  // Generate important dates array from API data
  const generateImportantDatesArray = (dates: ImportantDates) => {
    if (!dates) return [];

    return [
      {
        date: dates.abstractSubmissionOpens,
        event: "Abstract Submission Opens",
        status: "upcoming",
        description: "Online submission platform goes live",
      },
      {
        date: dates.abstractSubmissionDeadline,
        event: "Abstract Submission Deadline",
        status: "deadline",
        description: "Final deadline for all abstract submissions",
      },
      {
        date: dates.abstractReviewCompletion,
        event: "Abstract Review Completion",
        status: "upcoming",
        description: "All reviews completed by scientific committee",
      },
      {
        date: dates.acceptanceNotifications,
        event: "Acceptance Notifications",
        status: "upcoming",
        description: "Authors notified of acceptance decisions",
      },
      {
        date: dates.finalAbstractSubmission,
        event: "Final Abstract Submission",
        status: "upcoming",
        description: "Revised abstracts due for publication",
      },
      {
        date: dates.conferencePresentation,
        event: "Conference Presentation",
        status: "conference",
        description: `Abstract presentations at ACNA ${dates.year}`,
      },
    ];
  };

  const abstractCategories = [
    {
      id: "clinical",
      title: "Clinical Research",
      description:
        "Original clinical studies, case series, and clinical observations in pediatric neurology",
      icon: Users,
      color: "bg-blue-600",
      examples: [
        "Treatment outcomes in pediatric epilepsy",
        "Novel therapeutic approaches",
        "Clinical trial results",
        "Comparative effectiveness studies",
      ],
    },
    {
      id: "basic",
      title: "Basic Science & Translational Research",
      description: "Fundamental research with potential clinical applications",
      icon: Search,
      color: "bg-purple-600",
      examples: [
        "Molecular mechanisms of neurological disorders",
        "Biomarker discovery",
        "Genetic studies",
        "Laboratory-based investigations",
      ],
    },
    {
      id: "technology",
      title: "Healthcare Technology & Innovation",
      description:
        "Technological advances and innovative solutions in pediatric neurology",
      icon: Award,
      color: "bg-green-600",
      examples: [
        "Telemedicine applications",
        "AI and machine learning",
        "Medical devices and diagnostics",
        "Digital health solutions",
      ],
    },
    {
      id: "education",
      title: "Medical Education & Training",
      description:
        "Educational initiatives, training programs, and curriculum development",
      icon: FileText,
      color: "bg-orange-600",
      examples: [
        "Training program evaluation",
        "Curriculum innovations",
        "Educational technology",
        "Competency assessment",
      ],
    },
    {
      id: "public",
      title: "Public Health & Policy",
      description:
        "Population health studies, healthcare policy, and system improvements",
      icon: Users,
      color: "bg-red-600",
      examples: [
        "Epidemiological studies",
        "Healthcare access and equity",
        "Policy implementation outcomes",
        "Community health initiatives",
      ],
    },
    {
      id: "case",
      title: "Case Reports",
      description:
        "Interesting or unusual clinical cases with educational value",
      icon: FileText,
      color: "bg-teal-600",
      examples: [
        "Rare neurological conditions",
        "Unusual presentations",
        "Novel treatment approaches",
        "Diagnostic challenges",
      ],
    },
  ];

  const submissionGuidelines = [
    {
      section: "Format Requirements",
      items: [
        "Maximum 300 words for abstract body",
        "Structured format: Background, Methods, Results, Conclusions",
        "Title limited to 20 words",
        "Up to 6 authors maximum",
        "Times New Roman, 12-point font",
      ],
    },
    {
      section: "Content Guidelines",
      items: [
        "Original work not previously published",
        "Clear objectives and methodology",
        "Relevant results and statistical analysis",
        "Meaningful conclusions supported by data",
        "Ethical approval documentation required",
      ],
    },
    {
      section: "Submission Process",
      items: [
        "Online submission through ACNA portal",
        "All authors must be registered",
        "Corresponding author designation required",
        "Category selection mandatory",
        "Conflict of interest disclosure",
      ],
    },
    {
      section: "Review Criteria",
      items: [
        "Scientific merit and methodology",
        "Relevance to pediatric neurology",
        "Clarity of presentation",
        "Statistical analysis appropriateness",
        "Clinical or research significance",
      ],
    },
  ];

  const presentationTypes = [
    {
      type: "Oral Presentation",
      duration: "12 minutes + 3 minutes Q&A",
      description: "Selected high-quality abstracts for platform presentations",
      requirements: [
        "PowerPoint presentation",
        "Professional attire required",
        "Audio-visual support provided",
        "Session moderator assigned",
      ],
    },
    {
      type: "Poster Presentation",
      duration: "90-minute poster sessions",
      description: "Visual presentation with author discussion opportunities",
      requirements: [
        "A0 size poster (84.1 × 118.9 cm)",
        "Author presence required during session",
        "Poster boards and materials provided",
        "Digital copy for proceedings",
      ],
    },
    {
      type: "E-Poster",
      duration: "Available throughout conference",
      description: "Digital poster display with interactive features",
      requirements: [
        "Digital format submission",
        "Interactive elements encouraged",
        "Online discussion platform",
        "Virtual presentation option",
      ],
    },
  ];

  const awards = [
    {
      name: "Best Clinical Research Abstract",
      prize: "$1,000 + Certificate",
      criteria:
        "Outstanding clinical research with significant impact on patient care",
      eligibility: "Open to all clinical research abstracts",
    },
    {
      name: "Young Investigator Award",
      prize: "$750 + Conference Registration",
      criteria: "Exceptional research by investigators under 35 years",
      eligibility: "First author must be under 35 years of age",
    },
    {
      name: "Best Case Report",
      prize: "$500 + Certificate",
      criteria: "Most educational and clinically relevant case report",
      eligibility: "Case report category submissions only",
    },
    {
      name: "Innovation in Healthcare Technology",
      prize: "$1,000 + Featured Presentation",
      criteria:
        "Groundbreaking technological innovation in pediatric neurology",
      eligibility: "Technology and innovation category",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "deadline":
        return "bg-red-600";
      case "upcoming":
        return "bg-blue-600";
      case "conference":
        return "bg-green-600";
      default:
        return "bg-gray-600";
    }
  };

  const filteredCategories =
    selectedCategory === "all"
      ? abstractCategories
      : abstractCategories.filter(
          (category) => category.id === selectedCategory
        );

  const handleSubmitClick = () => {
    navigate("/abstract-submission");
  };



  const importantDatesArray = importantDates ? generateImportantDatesArray(importantDates) : [];

  return (
    <div className="bg-white min-h-screen">
      <ScrollToTop />
      {/* Hero Section */}
      <section className="py-12 md:py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 mb-4 md:mb-6">
            Call for Abstracts
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-700 font-light max-w-3xl mx-auto mb-8">
            Share your research, innovations, and clinical experiences at ACNA
            Annual Conference {importantDates?.year || 2026}. We invite submissions across all areas of
            pediatric neurology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleSubmitClick}
              className="bg-orange-600 text-white px-8 py-4 font-bold hover:bg-orange-700 transition-colors uppercase tracking-wide rounded inline-flex items-center"
            >
              <Upload className="mr-2 w-5 h-5" />
              Submit Abstract
            </button>
            <button className="border-2 border-orange-600 text-red-600 px-8 py-4 font-bold hover:bg-orange-600 hover:text-white transition-colors uppercase tracking-wide rounded inline-flex items-center">
              <Download className="mr-2 w-5 h-5" />
              Download Guidelines
            </button>
          </div>
        </div>
      </section>

      {/* Important Dates Banner */}
      <section className="py-8 bg-orange-600">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center text-white mb-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              Important Dates
            </h2>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="w-8 h-8 animate-spin text-white-600" />
                <p className="text-lg">Loading important dates...</p>
              </div>
            ) : (
              <p className="text-xl mb-8 max-w-2xl mx-auto">
                Mark your calendar - Abstract submission deadline: {importantDates?.abstractSubmissionDeadline || "April 30, 2026"}
              </p>
            )}
          </div>
          
          {!loading && (
            <>
              {error && (
                <div className="text-center text-white mb-4">
                  <div className="bg-white bg-opacity-10 rounded p-2 text-sm">
                    <AlertCircle className="w-4 h-4 inline mr-2" />
                    {error} - Showing fallback dates
                  </div>
                </div>
              )}
              
              {importantDatesArray.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center text-white">
                  {importantDatesArray.map((date, index) => (
                    <div
                      key={index}
                      className="bg-white bg-opacity-10 rounded-lg p-3"
                    >
                      <div className="text-sm font-bold mb-1">{date.date}</div>
                      <div className="text-xs opacity-100">{date.event}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-white">
                  <p className="text-lg">Important dates will be available soon.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Abstract Categories Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
              Abstract Categories
            </h2>
            <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Choose the most appropriate category for your research or clinical
              work
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === "all"
                  ? "bg-orange-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Categories
            </button>
            {abstractCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? "bg-orange-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category.title.split(" ")[0]}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCategories.map((category) => {
              return (
                <div
                  key={category.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {category.title}
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {category.description}
                  </p>
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 text-sm">
                      Example Topics:
                    </h4>
                    <ul className="space-y-1">
                      {category.examples.map((example, index) => (
                        <li
                          key={index}
                          className="text-sm text-gray-600 flex items-start"
                        >
                          <CheckCircle className="w-3 h-3 text-orange-600 mr-2 mt-1 flex-shrink-0" />
                          {example}
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

      {/* Submission Guidelines Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
              Submission Guidelines
            </h2>
            <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Please review these guidelines carefully before submitting your
              abstract
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {submissionGuidelines.map((guideline, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-6"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 text-red-600 mr-2" />
                  {guideline.section}
                </h3>
                <ul className="space-y-3">
                  {guideline.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start">
              <AlertCircle className="w-6 h-6 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Important Notice
                </h3>
                <p className="text-gray-700 mb-4">
                  All abstracts must be submitted through our online form.
                  Email submissions will not be accepted. Ensure all co-authors
                  have approved the submission before finalizing.
                </p>
                <div className="flex flex-wrap gap-4">
                  <button 
                   onClick={handleSubmitClick}
                   className="bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors rounded">
                    Access Submission Portal
                  </button>
                  <button className="border border-blue-600 text-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-600 hover:text-white transition-colors rounded">
                    Download Template
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Presentation Types Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
              Presentation Types
            </h2>
            <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Accepted abstracts will be presented in one of the following
              formats
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {presentationTypes.map((type, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="text-center mb-6">
                  <div className="bg-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {type.type}
                  </h3>
                  <p className="text-red-600 font-medium text-sm mb-3">
                    {type.duration}
                  </p>
                  <p className="text-gray-600 text-sm">{type.description}</p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 text-sm">
                    Requirements:
                  </h4>
                  <ul className="space-y-2">
                    {type.requirements.map((requirement, reqIndex) => (
                      <li
                        key={reqIndex}
                        className="text-sm text-gray-600 flex items-start"
                      >
                        <CheckCircle className="w-3 h-3 text-green-500 mr-2 mt-1 flex-shrink-0" />
                        {requirement}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Awards Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
              Abstract Awards
            </h2>
            <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Outstanding abstracts will be recognized with prestigious awards
              and prizes
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {awards.map((award, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start">
                  <div className="bg-yellow-500 w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {award.name}
                    </h3>
                    <p className="text-red-600 font-bold text-lg mb-3">
                      {award.prize}
                    </p>
                    <p className="text-gray-700 mb-3 text-sm">
                      {award.criteria}
                    </p>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-xs text-gray-600">
                        <span className="font-medium">Eligibility:</span>{" "}
                        {award.eligibility}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-orange-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Submit Your Abstract?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join leading researchers and clinicians in sharing your work at ACNA
            Annual Conference {importantDates?.year || 2026}. Don't miss this opportunity to contribute to
            advancing pediatric neurology across Africa.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleSubmitClick}
              className="bg-white text-red-600 px-8 py-4 font-bold hover:bg-gray-100 transition-colors uppercase tracking-wide rounded inline-flex items-center justify-center"
            >
              <Upload className="mr-2 w-5 h-5" />
              Submit Your Abstract
            </button>
            <button className="border-2 border-white text-white px-8 py-4 font-bold hover:bg-white hover:text-red-600 transition-colors uppercase tracking-wide rounded inline-flex items-center justify-center">
              <Download className="mr-2 w-5 h-5" />
              Download Guidelines
            </button>
          </div>

          <p className="text-sm text-red-100 opacity-90 mt-6">
            Questions about abstract submission? Contact us at
            abstracts@acna.org
          </p>
        </div>
      </section>
    </div>
  );
};

export default CallForAbstracts;