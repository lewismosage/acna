import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Calendar,
  ChevronLeft,
  AlertCircle,
  Clock,
  Users,
  MapPin,
  Award,
  CheckCircle,
  User,
  BookOpen,
  Star,
  Download,
  Share2,
  Printer,
  Target,
  Phone,
  Mail,
  Building,
  FileText,
  Video,
  Monitor,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import {
  TrainingProgram,
  trainingProgramsApi,
  TrainingProgramRegistrationResponse,
} from "../../../services/trainingProgramsApi";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import ScrollToTop from "../../../components/common/ScrollToTop";

const TrainingProgramDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "overview" | "curriculum" | "instructors" | "register"
  >("overview");
  const [program, setProgram] = useState<TrainingProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Registration form state
  const [registrationData, setRegistrationData] = useState({
    participantName: "",
    participantEmail: "",
    participantPhone: "",
    organization: "",
    profession: "",
    experience: "",
    specialRequests: "",
  });
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(
    null
  );

  useEffect(() => {
    const fetchProgram = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const programData = await trainingProgramsApi.getById(parseInt(id));
        setProgram(programData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load training program"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProgram();
  }, [id]);

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!program) return;

    setRegistrationLoading(true);
    setRegistrationError(null);

    try {
      const response: TrainingProgramRegistrationResponse =
        await trainingProgramsApi.createRegistration({
          programId: program.id,
          ...registrationData,
        });

      // Check if payment is required
      if (response.payment_required) {
        console.log("Payment required, creating payment session...");

        // Create payment session
        const paymentSession = await trainingProgramsApi.createPaymentSession(
          response.program_id!,
          response.registration_data!,
          response.amount!
        );

        // Initialize Stripe and redirect to checkout
        const stripe = await loadStripe(
          import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!
        );
        if (!stripe) {
          throw new Error("Failed to load Stripe");
        }

        const { error } = await stripe.redirectToCheckout({
          sessionId: paymentSession.sessionId,
        });

        if (error) {
          throw new Error(error.message || "Failed to redirect to payment");
        }
      } else {
        // No payment required - registration completed
        setRegistrationSuccess(true);
        setRegistrationData({
          participantName: "",
          participantEmail: "",
          participantPhone: "",
          organization: "",
          profession: "",
          experience: "",
          specialRequests: "",
        });
      }
    } catch (err) {
      setRegistrationError(
        err instanceof Error ? err.message : "Failed to submit registration"
      );
    } finally {
      setRegistrationLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "TBD";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateDaysUntil = (dateString: string) => {
    if (!dateString) return null;
    const programDate = new Date(dateString);
    const today = new Date();
    const diffTime = programDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : null;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Published":
        return "bg-green-600";
      case "Draft":
        return "bg-yellow-600";
      case "Archived":
        return "bg-gray-600";
      default:
        return "bg-gray-600";
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "Virtual":
        return <Monitor className="w-5 h-5 text-blue-600" />;
      case "Hybrid":
        return <Video className="w-5 h-5 text-purple-600" />;
      default:
        return <MapPin className="w-5 h-5 text-green-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Training Program Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            {error || "The training program you're looking for doesn't exist."}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-red-600 hover:text-red-700 font-medium"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Training Programs
          </button>
        </div>
      </div>
    );
  }

  const daysUntil = calculateDaysUntil(program.startDate);
  const enrollmentPercentage =
    program.maxParticipants > 0
      ? (program.currentEnrollments / program.maxParticipants) * 100
      : 0;
  const spotsLeft = program.maxParticipants - program.currentEnrollments;
  const isRegistrationOpen =
    daysUntil &&
    daysUntil > 0 &&
    spotsLeft > 0 &&
    program.status === "Published";

  return (
    <div className="bg-white min-h-screen">
      <ScrollToTop />

      {/* Back Navigation */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-red-600 hover:text-red-700 font-medium"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Training Programs
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Program Image */}
            <div className="lg:w-2/5">
              <div className="relative">
                <img
                  src={program.imageUrl}
                  alt={program.title}
                  className="w-full h-64 lg:h-80 object-cover rounded-lg shadow-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/api/placeholder/400/300";
                  }}
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-red-600 text-white px-3 py-1 text-sm font-bold uppercase tracking-wide rounded">
                    {program.type}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span
                    className={`text-white px-3 py-1 text-sm font-bold rounded ${getStatusColor(
                      program.status
                    )}`}
                  >
                    {program.status}
                  </span>
                </div>
                {program.isFeatured && (
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-yellow-500 text-white px-3 py-1 text-sm font-bold rounded flex items-center">
                      <Star className="w-4 h-4 mr-1" />
                      FEATURED
                    </span>
                  </div>
                )}
                {daysUntil && daysUntil <= 30 && (
                  <div className="absolute bottom-4 right-4">
                    <span
                      className={`text-white px-3 py-1 text-sm font-bold rounded ${
                        daysUntil <= 7 ? "bg-red-600" : "bg-orange-600"
                      }`}
                    >
                      {daysUntil} DAYS LEFT
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Program Details */}
            <div className="lg:w-3/5">
              <div className="mb-4">
                <span className="text-red-600 font-medium text-sm uppercase tracking-wide">
                  {program.category}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                {program.title}
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-5 h-5 mr-3 text-red-600" />
                    <div>
                      <div className="font-medium">
                        {formatDate(program.startDate)} -{" "}
                        {formatDate(program.endDate)}
                      </div>
                      <div className="text-sm">Program Dates</div>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <Clock className="w-5 h-5 mr-3 text-red-600" />
                    <span>{program.duration}</span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <User className="w-5 h-5 mr-3 text-red-600" />
                    <span>Led by: {program.instructor}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    {getFormatIcon(program.format)}
                    <span className="ml-3">
                      {program.format} • {program.location}
                    </span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <Users className="w-5 h-5 mr-3 text-red-600" />
                    <span>
                      {program.currentEnrollments}/{program.maxParticipants}{" "}
                      enrolled
                    </span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <Award className="w-5 h-5 mr-3 text-red-600" />
                    <span>{program.cmeCredits} CME Credits</span>
                  </div>
                </div>
              </div>

              {/* Enrollment Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>
                    Enrollment Progress: {enrollmentPercentage.toFixed(0)}%
                  </span>
                  <span
                    className={spotsLeft <= 5 ? "text-red-600 font-medium" : ""}
                  >
                    {spotsLeft} spots remaining
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${
                      enrollmentPercentage >= 90
                        ? "bg-red-500"
                        : enrollmentPercentage >= 75
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${enrollmentPercentage}%` }}
                  />
                </div>
              </div>

              {/* Pricing and Registration */}
              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="text-3xl font-bold text-gray-900">
                      {program.price === 0
                        ? "FREE"
                        : `${
                            program.currency
                          } ${program.price.toLocaleString()}`}
                    </div>
                    <div className="text-sm text-gray-600">
                      Registration deadline:{" "}
                      {formatDate(program.registrationDeadline)}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {isRegistrationOpen ? (
                      <button
                        onClick={() => setActiveTab("register")}
                        className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center"
                      >
                        <Users className="w-5 h-5 mr-2" />
                        REGISTER NOW
                      </button>
                    ) : (
                      <div className="text-center">
                        <div className="bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold">
                          {spotsLeft <= 0
                            ? "FULL"
                            : daysUntil && daysUntil <= 0
                            ? "CLOSED"
                            : "UNAVAILABLE"}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {spotsLeft <= 0
                            ? "No spots available"
                            : "Registration closed"}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex gap-2">
                  <button className="border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </button>
                  <button className="border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                  </button>
                  <button className="border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                    <Download className="w-4 h-4 mr-2" />
                    Download Info
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex space-x-8">
            {[
              { key: "overview", label: "Overview" },
              { key: "curriculum", label: "Curriculum & Schedule" },
              { key: "instructors", label: "Instructors & Speakers" },
              { key: "register", label: "Register", count: spotsLeft },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.key
                    ? "border-red-600 text-red-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">
                    {tab.count} spots left
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </section>

      {/* Tab Content */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* Program Description */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Program Overview
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                    {program.description}
                  </p>
                </div>

                {/* Learning Outcomes */}
                {program.learningOutcomes &&
                  program.learningOutcomes.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <Target className="w-6 h-6 mr-2 text-red-600" />
                        Learning Outcomes
                      </h3>
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-6">
                        <p className="text-gray-700 mb-4">
                          After completing this program, participants will be
                          able to:
                        </p>
                        <ul className="space-y-2">
                          {program.learningOutcomes.map((outcome, index) => (
                            <li key={index} className="flex items-start">
                              <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{outcome}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                {/* Prerequisites */}
                {program.prerequisites && program.prerequisites.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Prerequisites
                    </h3>
                    <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
                      <ul className="space-y-2">
                        {program.prerequisites.map((prerequisite, index) => (
                          <li key={index} className="flex items-start">
                            <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">
                              {prerequisite}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Target Audience */}
                {program.targetAudience &&
                  program.targetAudience.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <Users className="w-6 h-6 mr-2 text-red-600" />
                        Target Audience
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {program.targetAudience.map((audience, index) => (
                          <span
                            key={index}
                            className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium"
                          >
                            {audience}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Topics Covered */}
                {program.topics && program.topics.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <BookOpen className="w-6 h-6 mr-2 text-red-600" />
                      Topics Covered
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {program.topics.map((topic, index) => (
                        <span
                          key={index}
                          className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Materials */}
                {program.materials && program.materials.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <FileText className="w-6 h-6 mr-2 text-red-600" />
                      Course Materials
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <ul className="space-y-2">
                        {program.materials.map((material, index) => (
                          <li key={index} className="flex items-center">
                            <Download className="w-4 h-4 text-gray-500 mr-3" />
                            <span className="text-gray-700">{material}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Info */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Quick Info
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">{program.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Format:</span>
                      <span className="font-medium">{program.format}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{program.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Language:</span>
                      <span className="font-medium">
                        {program.language || "English"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Timezone:</span>
                      <span className="font-medium">
                        {program.timezone || "GMT"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">CME Credits:</span>
                      <span className="font-medium text-green-600">
                        {program.cmeCredits}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Certificate Information */}
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Award className="w-5 h-5 mr-2 text-green-600" />
                    Certification
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-900">
                        Certificate Type:
                      </span>
                      <div className="text-gray-700">
                        {program.certificationType}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">
                        CME Credits:
                      </span>
                      <div className="text-gray-700">
                        {program.cmeCredits} credits
                      </div>
                    </div>
                    {program.assessmentMethod && (
                      <div>
                        <span className="font-medium text-gray-900">
                          Assessment:
                        </span>
                        <div className="text-gray-700">
                          {program.assessmentMethod}
                        </div>
                      </div>
                    )}
                    {program.passingScore && (
                      <div>
                        <span className="font-medium text-gray-900">
                          Passing Score:
                        </span>
                        <div className="text-gray-700">
                          {program.passingScore}%
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Need Help?
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center text-gray-700">
                      <Mail className="w-4 h-4 mr-3 text-blue-600" />
                      <a
                        href="mailto:training@acna.org"
                        className="hover:text-blue-600"
                      >
                        training@acna.org
                      </a>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Phone className="w-4 h-4 mr-3 text-blue-600" />
                      <span>+1 (555) 123-4567</span>
                    </div>
                    <div className="flex items-start text-gray-700">
                      <Building className="w-4 h-4 mr-3 mt-0.5 text-blue-600" />
                      <div>
                        <div>African Child Neurology Association</div>
                        <div className="text-xs text-gray-600">
                          Education Department
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "curriculum" && (
            <div className="max-w-4xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Curriculum & Schedule
              </h2>

              {program.schedule && program.schedule.length > 0 ? (
                <div className="space-y-6">
                  {program.schedule.map((item, index) => (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 rounded-lg p-6"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                        <div className="flex items-center mb-2 md:mb-0">
                          <Calendar className="w-5 h-5 mr-3 text-red-600" />
                          <h3 className="text-lg font-semibold text-gray-900">
                            {item.day}
                          </h3>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>{item.time}</span>
                        </div>
                      </div>
                      <h4 className="text-base font-medium text-gray-900 mb-2">
                        {item.activity}
                      </h4>
                      <div className="flex items-center text-gray-600">
                        <User className="w-4 h-4 mr-2" />
                        <span>{item.speaker}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Calendar className="w-12 h-12 mx-auto text-gray-400" />
                  <p className="mt-4 text-gray-600">
                    Detailed schedule will be provided closer to the program
                    date
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "instructors" && (
            <div className="max-w-4xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Instructors & Speakers
              </h2>

              {program.speakers && program.speakers.length > 0 ? (
                <div className="space-y-8">
                  {program.speakers.map((speaker, index) => (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 rounded-lg p-6"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                          <User className="w-8 h-8 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {speaker.name}
                          </h3>
                          <p className="text-red-600 font-medium mb-2">
                            {speaker.title}
                          </p>
                          <p className="text-gray-600 mb-3">
                            {speaker.organization}
                          </p>
                          <p className="text-gray-700 leading-relaxed">
                            {speaker.bio}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {program.instructor}
                      </h3>
                      <p className="text-red-600 font-medium mb-2">
                        Lead Instructor
                      </p>
                      <p className="text-gray-600 mb-3">
                        African Child Neurology Association
                      </p>
                      <p className="text-gray-700 leading-relaxed">
                        Detailed instructor information will be provided upon
                        registration.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "register" && (
            <div className="max-w-4xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Registration
              </h2>

              {registrationSuccess ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-green-900 mb-2">
                    Registration Submitted Successfully!
                  </h3>
                  <p className="text-green-700 mb-6">
                    Thank you for registering for {program.title}. You will
                    receive a confirmation email shortly with further details.
                  </p>
                  <button
                    onClick={() => setRegistrationSuccess(false)}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Register Another Participant
                  </button>
                </div>
              ) : !isRegistrationOpen ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
                  <AlertCircle className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-yellow-900 mb-2">
                    Registration Not Available
                  </h3>
                  <p className="text-yellow-700 mb-4">
                    {spotsLeft <= 0
                      ? "This program is currently full. Please check back for future offerings."
                      : daysUntil && daysUntil <= 0
                      ? "Registration has closed for this program."
                      : "Registration is not currently open for this program."}
                  </p>
                  <div className="text-sm text-yellow-600">
                    For more information, contact us at{" "}
                    <a href="mailto:training@acna.org" className="underline">
                      training@acna.org
                    </a>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <form
                      onSubmit={handleRegistrationSubmit}
                      className="space-y-6"
                    >
                      {registrationError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <div className="flex items-center">
                            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                            <span className="text-red-800">
                              {registrationError}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Personal Information */}
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Personal Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Full Name *
                            </label>
                            <input
                              type="text"
                              required
                              value={registrationData.participantName}
                              onChange={(e) =>
                                setRegistrationData({
                                  ...registrationData,
                                  participantName: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Email Address *
                            </label>
                            <input
                              type="email"
                              required
                              value={registrationData.participantEmail}
                              onChange={(e) =>
                                setRegistrationData({
                                  ...registrationData,
                                  participantEmail: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Phone Number *
                            </label>
                            <input
                              type="tel"
                              required
                              value={registrationData.participantPhone}
                              onChange={(e) =>
                                setRegistrationData({
                                  ...registrationData,
                                  participantPhone: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Organization *
                            </label>
                            <input
                              type="text"
                              required
                              value={registrationData.organization}
                              onChange={(e) =>
                                setRegistrationData({
                                  ...registrationData,
                                  organization: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Professional Information */}
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Professional Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Profession *
                            </label>
                            <select
                              required
                              value={registrationData.profession}
                              onChange={(e) =>
                                setRegistrationData({
                                  ...registrationData,
                                  profession: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                            >
                              <option value="">Select profession</option>
                              <option value="Pediatric Neurologist">
                                Pediatric Neurologist
                              </option>
                              <option value="General Neurologist">
                                General Neurologist
                              </option>
                              <option value="Pediatrician">Pediatrician</option>
                              <option value="Nurse">Nurse</option>
                              <option value="Resident">Resident</option>
                              <option value="Medical Student">
                                Medical Student
                              </option>
                              <option value="Researcher">Researcher</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Years of Experience *
                            </label>
                            <select
                              required
                              value={registrationData.experience}
                              onChange={(e) =>
                                setRegistrationData({
                                  ...registrationData,
                                  experience: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                            >
                              <option value="">Select experience</option>
                              <option value="Less than 1 year">
                                Less than 1 year
                              </option>
                              <option value="1-2 years">1-2 years</option>
                              <option value="3-5 years">3-5 years</option>
                              <option value="6-10 years">6-10 years</option>
                              <option value="11-15 years">11-15 years</option>
                              <option value="More than 15 years">
                                More than 15 years
                              </option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Special Requests */}
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Special Requests or Accommodations
                        </h3>
                        <textarea
                          rows={4}
                          value={registrationData.specialRequests}
                          onChange={(e) =>
                            setRegistrationData({
                              ...registrationData,
                              specialRequests: e.target.value,
                            })
                          }
                          placeholder="Please let us know if you have any special requirements, dietary restrictions, accessibility needs, or other requests..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                        />
                      </div>

                      {/* Terms and Conditions */}
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start">
                          <input
                            type="checkbox"
                            required
                            id="terms"
                            className="mt-1 mr-3"
                          />
                          <label
                            htmlFor="terms"
                            className="text-sm text-gray-700"
                          >
                            I agree to the{" "}
                            <a
                              href="#"
                              className="text-red-600 hover:underline"
                            >
                              terms and conditions
                            </a>{" "}
                            and{" "}
                            <a
                              href="#"
                              className="text-red-600 hover:underline"
                            >
                              privacy policy
                            </a>
                            . I understand that registration is subject to
                            availability and confirmation.
                          </label>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={registrationLoading}
                          className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
                            registrationLoading
                              ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                              : "bg-red-600 text-white hover:bg-red-700"
                          }`}
                        >
                          {registrationLoading ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Submitting...
                            </div>
                          ) : (
                            "Submit Registration"
                          )}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Registration Sidebar */}
                  <div className="space-y-6">
                    {/* Program Summary */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        Registration Summary
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="font-medium text-gray-900">
                            Program:
                          </span>
                          <div className="text-gray-700">{program.title}</div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">
                            Dates:
                          </span>
                          <div className="text-gray-700">
                            {formatDate(program.startDate)} -{" "}
                            {formatDate(program.endDate)}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">
                            Format:
                          </span>
                          <div className="text-gray-700">{program.format}</div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">
                            Duration:
                          </span>
                          <div className="text-gray-700">
                            {program.duration}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">
                            CME Credits:
                          </span>
                          <div className="text-gray-700">
                            {program.cmeCredits}
                          </div>
                        </div>
                        <div className="border-t border-red-300 pt-3">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-900">
                              Total Cost:
                            </span>
                            <span className="text-xl font-bold text-red-600">
                              {program.price === 0
                                ? "FREE"
                                : `${
                                    program.currency
                                  } ${program.price.toLocaleString()}`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Available Spots */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        Availability
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Enrollment:</span>
                          <span>
                            {program.currentEnrollments}/
                            {program.maxParticipants}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              enrollmentPercentage >= 90
                                ? "bg-red-500"
                                : enrollmentPercentage >= 75
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                            style={{ width: `${enrollmentPercentage}%` }}
                          />
                        </div>
                        <div className="text-center">
                          <span
                            className={`text-lg font-bold ${
                              spotsLeft <= 5 ? "text-red-600" : "text-green-600"
                            }`}
                          >
                            {spotsLeft} spots remaining
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Registration Deadline */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Registration Deadline
                      </h3>
                      <div className="text-blue-800 font-medium">
                        {formatDate(program.registrationDeadline)}
                      </div>
                      {daysUntil && (
                        <div className="text-sm text-blue-600 mt-1">
                          {daysUntil} days remaining
                        </div>
                      )}
                    </div>

                    {/* Contact Support */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        Need Help?
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center text-gray-700">
                          <Mail className="w-4 h-4 mr-3 text-gray-600" />
                          <a
                            href="mailto:training@acna.org"
                            className="hover:text-red-600"
                          >
                            training@acna.org
                          </a>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <Phone className="w-4 h-4 mr-3 text-gray-600" />
                          <span>+1 (555) 123-4567</span>
                        </div>
                        <p className="text-gray-600 text-xs mt-3">
                          Our support team is available Monday-Friday, 9AM-5PM
                          GMT to assist with registration questions.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action Section */}
      {activeTab !== "register" && isRegistrationOpen && (
        <section className="py-16 bg-red-600">
          <div className="max-w-4xl mx-auto px-4 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Advance Your Skills?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Don't miss this opportunity to enhance your expertise in pediatric
              neurology. Only {spotsLeft} spots remaining!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setActiveTab("register")}
                className="bg-white text-red-600 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-colors flex items-center justify-center"
              >
                <Users className="w-5 h-5 mr-2" />
                REGISTER NOW
              </button>
              <button
                onClick={() => setActiveTab("overview")}
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold hover:bg-white hover:text-red-600 transition-colors"
              >
                Learn More
              </button>
            </div>
            <p className="text-red-100 text-sm mt-4">
              Registration closes on {formatDate(program.registrationDeadline)}
            </p>
          </div>
        </section>
      )}
    </div>
  );
};

export default TrainingProgramDetailPage;
