import { useState, useEffect } from "react";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Mail,
  Phone,
  Globe,
  Download,
  Share2,
  ChevronLeft,
  CheckCircle,
  ExternalLink,
  Building,
  Mic,
  UserCheck,
  Star,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  conferencesApi,
  Conference as ApiConference,
  Registration,
  RegistrationResponse,
} from "../../services/conferenceApi";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ScrollToTop from "../../components/common/ScrollToTop";

interface RegistrationStatus {
  type: "success" | "error";
  message: string;
}

interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  organization: string;
  profession: string;
  phone: string;
  registrationType: "early_bird" | "regular";
}

const ConferenceDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "overview" | "schedule" | "speakers" | "registration"
  >("overview");
  const [conference, setConference] = useState<ApiConference | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    firstName: "",
    lastName: "",
    email: "",
    organization: "",
    profession: "",
    phone: "",
    registrationType: "early_bird",
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationStatus, setRegistrationStatus] =
    useState<RegistrationStatus | null>(null);

  useEffect(() => {
    const fetchConference = async () => {
      if (!id) return;

      setIsLoading(true);
      setError(null);

      try {
        const data = await conferencesApi.getById(parseInt(id));
        setConference(data);
      } catch (err) {
        setError("Failed to load conference details. Please try again later.");
        console.error("Error fetching conference:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConference();
  }, [id]);

  const handleRegistration = async () => {
    if (!conference || !id) return;

    setIsRegistering(true);
    setRegistrationStatus(null);

    try {
      const registrationPayload: Omit<Registration, "id" | "full_name"> = {
        first_name: registrationData.firstName,
        last_name: registrationData.lastName,
        email: registrationData.email,
        phone: registrationData.phone,
        organization: registrationData.organization,
        job_title: registrationData.profession,
        registration_type: registrationData.registrationType,
        payment_status: "pending",
        registered_at: new Date().toISOString(),
      };

      const response: RegistrationResponse =
        await conferencesApi.addRegistration(parseInt(id), registrationPayload);

      if (response.payment_required) {
        // Payment required - redirect to payment
        try {
          console.log("Creating payment session...");
          const paymentResponse = await conferencesApi.createPaymentSession(
            parseInt(id),
            response.registration_data
          );
          console.log("Payment session created:", paymentResponse);

          console.log("Loading Stripe...");
          console.log(
            "Stripe key:",
            import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
          );

          // Load Stripe and redirect to checkout
          const stripe = await loadStripe(
            import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!
          );

          if (!stripe) {
            console.error("Failed to load Stripe");
            throw new Error("Failed to load Stripe");
          }
          console.log("Stripe loaded successfully");

          console.log(
            "Redirecting to checkout with sessionId:",
            paymentResponse.sessionId
          );
          const { error } = await stripe.redirectToCheckout({
            sessionId: paymentResponse.sessionId,
          });

          if (error) {
            console.error("Stripe redirect error:", error);
            setRegistrationStatus({
              type: "error",
              message: "Failed to redirect to payment. Please try again.",
            });
          } else {
            console.log("Redirect to Stripe successful");
          }
        } catch (paymentError) {
          console.error("Payment error:", paymentError);
          setRegistrationStatus({
            type: "error",
            message: "Failed to create payment session. Please try again.",
          });
        }
      } else {
        // No payment required - registration complete
        setRegistrationStatus({
          type: "success",
          message:
            "Registration successful! You will receive a confirmation email with further details shortly.",
        });

        // Reset form
        setRegistrationData({
          firstName: "",
          lastName: "",
          email: "",
          organization: "",
          profession: "",
          phone: "",
          registrationType: "early_bird",
        });
      }
    } catch (err: any) {
      // Handle duplicate registration error
      if (err.message && err.message.includes("already registered")) {
        setRegistrationStatus({
          type: "error",
          message:
            "This email is already registered for this conference. Please use a different email address.",
        });
      } else if (err.message && err.message.includes("409")) {
        setRegistrationStatus({
          type: "error",
          message:
            "This email is already registered for this conference. Please use a different email address.",
        });
      } else {
        setRegistrationStatus({
          type: "error",
          message: "Registration failed. Please try again later.",
        });
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const getProgressPercentage = () => {
    if (!conference) return 0;
    return Math.round(
      ((conference.registration_count || 0) / (conference.capacity || 1)) * 100
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "registration_open":
        return "bg-green-500";
      case "coming_soon":
        return "bg-yellow-500";
      case "completed":
        return "bg-blue-500";
      case "cancelled":
        return "bg-red-500";
      case "planning":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "registration_open":
        return "Registration Open";
      case "coming_soon":
        return "Coming Soon";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      case "planning":
        return "Planning";
      default:
        return status;
    }
  };

  const getSessionIcon = (type: string) => {
    switch (type) {
      case "keynote":
      case "presentation":
        return <Mic className="w-4 h-4" />;
      case "workshop":
        return <Users className="w-4 h-4" />;
      case "panel":
        return <UserCheck className="w-4 h-4" />;
      case "break":
        return <Clock className="w-4 h-4" />;
      case "social":
        return <Star className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!conference) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div>Conference not found</div>
      </div>
    );
  }

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
            Back to Conferences
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-8 md:py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Conference Image */}
            <div className="lg:w-2/5">
              <div className="relative">
                <img
                  src={
                    conference.image_url ||
                    conference.display_image_url ||
                    "/default-conference.jpg"
                  }
                  alt={conference.title}
                  className="w-full h-64 lg:h-80 object-cover rounded-lg shadow-lg"
                />
                <div className="absolute top-4 left-4">
                  <span
                    className={`${getStatusColor(
                      conference.status
                    )} text-white px-3 py-1 text-sm font-bold uppercase tracking-wide rounded`}
                  >
                    {getStatusLabel(conference.status)}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="bg-orange-600 text-white px-3 py-1 text-sm font-bold rounded">
                    {conference.type}
                  </span>
                </div>
              </div>
            </div>

            {/* Conference Details */}
            <div className="lg:w-3/5">
              <div className="mb-4">
                <span className="text-red-600 font-medium text-sm uppercase tracking-wide">
                  ANNUAL CONFERENCE
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-4 leading-tight">
                {conference.title}
              </h1>

              {conference.theme && (
                <p className="text-lg md:text-xl text-red-600 font-light mb-6">
                  {conference.theme}
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-3">
                  <div className="flex items-center text-gray-700">
                    <Calendar className="w-5 h-5 mr-3 text-red-600" />
                    <span className="font-medium">{conference.date}</span>
                  </div>

                  <div className="flex items-center text-gray-700">
                    <MapPin className="w-5 h-5 mr-3 text-red-600" />
                    <div>
                      <div className="font-medium">{conference.location}</div>
                      {conference.venue && (
                        <div className="text-sm text-gray-600">
                          {conference.venue}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center text-gray-700">
                    <Globe className="w-5 h-5 mr-3 text-red-600" />
                    <span className="font-medium">{conference.type}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-lg font-bold text-red-600">
                      {conference.expected_attendees || "0"}+
                    </div>
                    <div className="text-xs text-gray-600">Attendees</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-lg font-bold text-red-600">
                      {conference.conference_speakers?.length ||
                        conference.speakers?.length ||
                        "0"}
                      +
                    </div>
                    <div className="text-xs text-gray-600">Speakers</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-lg font-bold text-red-600">
                      {conference.countries_represented || "0"}+
                    </div>
                    <div className="text-xs text-gray-600">Countries</div>
                  </div>
                </div>
              </div>

              {/* Registration Progress */}
              {conference.capacity && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Registration Progress
                    </span>
                    <span className="text-sm text-gray-600">
                      {conference.registration_count || 0} /{" "}
                      {conference.capacity} ({getProgressPercentage()}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-600 h-2 rounded-full"
                      style={{ width: `${getProgressPercentage()}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setActiveTab("registration")}
                  className="bg-orange-600 text-white px-6 py-3 rounded font-bold hover:bg-orange-700 transition-colors uppercase tracking-wide"
                >
                  Register Now
                </button>

                <div className="flex gap-2">
                  <button className="border border-red-600 text-red-600 px-4 py-3 rounded hover:bg-red-50 transition-colors flex items-center">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </button>
                  <button className="border border-red-600 text-red-600 px-4 py-3 rounded hover:bg-red-50 transition-colors flex items-center">
                    <Download className="w-4 h-4 mr-2" />
                    Brochure
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
              { key: "schedule", label: "Schedule" },
              { key: "speakers", label: "Speakers" },
              { key: "registration", label: "Registration" },
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
              </button>
            ))}
          </nav>
        </div>
      </section>

      {/* Tab Content */}
      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* Description */}
                <div>
                  <h2 className="text-2xl font-light text-gray-900 mb-4">
                    About This Conference
                  </h2>
                  <p className="text-gray-600 text-sm whitespace-pre-line">
                    {conference.full_description}
                  </p>
                </div>

                {/* Conference Highlights */}
                {conference.highlights && conference.highlights.length > 0 && (
                  <div>
                    <h3 className="text-xl font-light text-gray-900 mb-4">
                      Conference Highlights
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {conference.highlights.map((highlight, index) => (
                        <div key={index} className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">
                            {highlight}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Registration Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-lg font-light text-gray-900 mb-3">
                    Registration Fees
                  </h3>
                  <div className="text-sm text-gray-700">
                    {conference.early_bird_fee &&
                      conference.early_bird_deadline && (
                        <div className="mb-2">
                          <span className="font-semibold">
                            Early Bird ({conference.early_bird_deadline}):
                          </span>{" "}
                          ${conference.early_bird_fee}
                        </div>
                      )}
                    {conference.regular_fee && (
                      <div>
                        <span className="font-semibold">Regular:</span> $
                        {conference.regular_fee}
                      </div>
                    )}
                  </div>
                </div>

                {/* Organizer Info */}
                <div className="bg-red-50 p-6 rounded-lg">
                  <h3 className="text-lg font-light text-gray-900 mb-4">
                    Event Organizer
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center">
                      <Building className="w-4 h-4 mr-2 text-red-600" />
                      <span className="font-medium">
                        {conference.organizer_name}
                      </span>
                    </div>
                    {conference.organizer_email && (
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-red-600" />
                        <a
                          href={`mailto:${conference.organizer_email}`}
                          className="text-red-600 hover:underline"
                        >
                          {conference.organizer_email}
                        </a>
                      </div>
                    )}
                    {conference.organizer_phone && (
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-red-600" />
                        <span>{conference.organizer_phone}</span>
                      </div>
                    )}
                    {conference.organizer_website && (
                      <div className="flex items-center">
                        <ExternalLink className="w-4 h-4 mr-2 text-red-600" />
                        <a
                          href={conference.organizer_website}
                          className="text-red-600 hover:underline"
                        >
                          {conference.organizer_website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "schedule" && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-4">
                  Conference Schedule
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  A comprehensive program featuring keynotes, workshops, panels,
                  and networking opportunities.
                </p>
              </div>

              {conference.conference_sessions &&
              conference.conference_sessions.length > 0 ? (
                <div className="mb-12">
                  <h3 className="text-xl font-light text-gray-900 mb-6 pb-2 border-b-2 border-red-600">
                    Conference Program
                  </h3>

                  <div className="space-y-4">
                    {conference.conference_sessions.map((session, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4 lg:p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col md:flex-row md:items-start gap-4">
                          <div className="flex items-center md:w-48 flex-shrink-0">
                            <div className="bg-red-600 text-white p-2 rounded mr-3">
                              {getSessionIcon(session.session_type)}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900">
                                {session.start_time}
                              </div>
                              {session.location && (
                                <div className="text-xs text-gray-600">
                                  {session.location}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex-1">
                            <h4 className="text-lg font-light text-gray-900 mb-2">
                              {session.title}
                            </h4>

                            {session.speaker_names && (
                              <div className="text-red-600 font-medium text-sm mb-1">
                                Speaker: {session.speaker_names}
                              </div>
                            )}

                            {session.moderator && (
                              <div className="text-gray-700 text-sm mb-2">
                                <span className="font-medium">Moderator:</span>{" "}
                                {session.moderator}
                              </div>
                            )}

                            {session.duration_display && (
                              <div className="text-sm text-blue-600 font-medium">
                                Duration: {session.duration_display}
                              </div>
                            )}
                            {session.description && (
                              <p className="text-gray-600 text-sm mt-2 whitespace-pre-line">
                                {session.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Clock className="w-12 h-12 mx-auto text-gray-400" />
                  <p className="mt-4 text-gray-600">
                    Schedule details will be available soon
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "speakers" && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-4">
                  Featured Speakers
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Meet the distinguished experts and thought leaders who will be
                  sharing their knowledge and insights at our conference.
                </p>
              </div>

              {conference.conference_speakers &&
              conference.conference_speakers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                  {conference.conference_speakers.map((speaker, index) => (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                    >
                      <div className="relative">
                        <img
                          src={
                            speaker.image_url ||
                            speaker.display_image_url ||
                            "/default-speaker.jpg"
                          }
                          alt={speaker.name}
                          className="w-full h-48 object-cover"
                        />
                        {speaker.is_keynote && (
                          <div className="absolute top-2 left-2">
                            <span className="bg-red-600 text-white px-2 py-1 text-xs font-bold uppercase tracking-wide rounded">
                              Keynote
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-light text-gray-900 mb-1">
                          {speaker.name}
                        </h3>
                        {speaker.title && (
                          <p className="text-red-600 font-medium text-sm mb-1">
                            {speaker.title}
                          </p>
                        )}
                        {speaker.organization && (
                          <p className="text-gray-600 text-xs mb-2">
                            {speaker.organization}
                          </p>
                        )}
                        <div className="bg-gray-50 p-3 rounded">
                          <p className="text-xs text-gray-700 whitespace-pre-line">
                            <span className="font-medium">Bio:</span>{" "}
                            {speaker.bio || "Speaker information coming soon"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Mic className="w-12 h-12 mx-auto text-gray-400" />
                  <p className="mt-4 text-gray-600">
                    Speaker information will be announced soon
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "registration" && (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-4">
                  Register for Conference
                </h2>
                <p className="text-gray-600">
                  Join us for this exciting conference with leading experts in
                  the field.
                </p>
              </div>

              {registrationStatus && (
                <div
                  className={`mb-6 p-4 rounded-md ${
                    registrationStatus.type === "success"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {registrationStatus.message}
                </div>
              )}

              {/* Registration Form */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 lg:p-8">
                <div className="space-y-6">
                  {/* Registration Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Registration Type
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {conference.early_bird_fee &&
                        conference.early_bird_deadline && (
                          <div className="relative">
                            <input
                              type="radio"
                              id="earlyBird"
                              name="registrationType"
                              value="early_bird"
                              checked={
                                registrationData.registrationType ===
                                "early_bird"
                              }
                              onChange={(e) =>
                                setRegistrationData((prev) => ({
                                  ...prev,
                                  registrationType: e.target.value as any,
                                }))
                              }
                              className="sr-only"
                            />
                            <label
                              htmlFor="earlyBird"
                              className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                                registrationData.registrationType ===
                                "early_bird"
                                  ? "border-red-600 bg-red-50"
                                  : "border-gray-300 hover:border-gray-400"
                              }`}
                            >
                              <div className="font-medium text-gray-900">
                                Early Bird
                              </div>
                              <div className="text-2xl font-bold text-red-600">
                                ${conference.early_bird_fee}
                              </div>
                              <div className="text-sm text-gray-600">
                                Until {conference.early_bird_deadline}
                              </div>
                            </label>
                          </div>
                        )}

                      {conference.regular_fee && (
                        <div className="relative">
                          <input
                            type="radio"
                            id="regular"
                            name="registrationType"
                            value="regular"
                            checked={
                              registrationData.registrationType === "regular"
                            }
                            onChange={(e) =>
                              setRegistrationData((prev) => ({
                                ...prev,
                                registrationType: e.target.value as any,
                              }))
                            }
                            className="sr-only"
                          />
                          <label
                            htmlFor="regular"
                            className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                              registrationData.registrationType === "regular"
                                ? "border-red-600 bg-red-50"
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                          >
                            <div className="font-medium text-gray-900">
                              Regular
                            </div>
                            <div className="text-2xl font-bold text-red-600">
                              ${conference.regular_fee}
                            </div>
                            <div className="text-sm text-gray-600">
                              Standard Rate
                            </div>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={registrationData.firstName}
                        onChange={(e) =>
                          setRegistrationData((prev) => ({
                            ...prev,
                            firstName: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                        placeholder="Enter your first name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={registrationData.lastName}
                        onChange={(e) =>
                          setRegistrationData((prev) => ({
                            ...prev,
                            lastName: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                        placeholder="Enter your last name"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={registrationData.email}
                      onChange={(e) =>
                        setRegistrationData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                      placeholder="Enter your email address"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Organization *
                      </label>
                      <input
                        type="text"
                        value={registrationData.organization}
                        onChange={(e) =>
                          setRegistrationData((prev) => ({
                            ...prev,
                            organization: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                        placeholder="Hospital, University, etc."
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Profession/Title *
                      </label>
                      <input
                        type="text"
                        value={registrationData.profession}
                        onChange={(e) =>
                          setRegistrationData((prev) => ({
                            ...prev,
                            profession: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                        placeholder="Pediatric Neurologist, etc."
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={registrationData.phone}
                      onChange={(e) =>
                        setRegistrationData((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  {/* Terms and Conditions */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="terms"
                        className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        required
                      />
                      <label
                        htmlFor="terms"
                        className="ml-3 text-sm text-gray-700"
                      >
                        I agree to the{" "}
                        <a
                          href="/terms-and-conditions"
                          className="text-red-600 hover:underline"
                        >
                          Terms and Conditions
                        </a>{" "}
                        and{" "}
                        <a
                          href="/privacy-policy"
                          className="text-red-600 hover:underline"
                        >
                          Privacy Policy
                        </a>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={handleRegistration}
                    disabled={isRegistering}
                    className={`w-full bg-orange-600 text-white px-6 py-3 rounded font-bold hover:bg-orange-700 transition-colors uppercase tracking-wide ${
                      isRegistering ? "opacity-75 cursor-not-allowed" : ""
                    }`}
                  >
                    {isRegistering
                      ? "Processing Registration..."
                      : "Complete Registration"}
                  </button>

                  <div className="text-center text-sm text-gray-600">
                    <p>
                      Secure payment processing • Full refund available until 30
                      days before event
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ConferenceDetailPage;
