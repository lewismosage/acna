import { useEffect, useState } from "react";
import {
  Calendar,
  UserPlus,
  AlertCircle,
  Target,
  Globe,
  Users2,
  Mail,
  Twitter,
  Linkedin,
  MessageCircle,
  ArrowRight,
  Users
} from "lucide-react";
import { Link } from "react-router-dom";
import api from '../../services/api';

interface SubscriptionStatus {
  type: 'success' | 'error';
  message: string;
}

interface AccordionItem {
  title: string;
  content: string;
}

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  type: 'upcoming' | 'past';
  category: string;
  description: string;
  imageUrl: string;
  isOnline?: boolean;
}

interface CollaborationOpportunity {
  id: number;
  title: string;
  description: string;
  projectLead: string;
  institution: string;
  skillsNeeded: string[];
  commitmentLevel: string;
  duration: string;
  isActive: boolean;
  contactEmail: string;
  createdAt: string;
}

const WorkshopsSymposiums = () => {
  const [activeTab, setActiveTab] = useState<"highlights" | "collaborations">("highlights");
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  const accordionItems: AccordionItem[] = [
    {
      title: "Clinical Skills Development",
      content: "Hands-on training in diagnosis and management of pediatric neurological disorders."
    },
    {
      title: "Research Methodologies",
      content: "Building capacity for conducting high-quality neurological research in African contexts."
    },
    {
      title: "Community Engagement",
      content: "Strategies for improving awareness and care for neurological conditions at community level."
    },
    {
      title: "Policy & Advocacy",
      content: "Developing skills to influence health policies affecting children with neurological conditions."
    }
  ];

  const upcomingEvents: Event[] = [
    {
      id: 1,
      title: "ACNA Live from Nairobi: Advancing Pediatric Neurology Care Across East Africa",
      date: "August 15, 2025",
      time: "2:00PM-4:00PM EAT",
      location: "Live online",
      type: "upcoming",
      category: "CONFERENCE",
      description: "Join us for an interactive session discussing the latest advances in pediatric neurology care and treatment protocols across East African healthcare systems.",
      imageUrl: "https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=600",
      isOnline: true
    },
    {
      id: 2,
      title: "Epilepsy Awareness Workshop in Community Settings",
      date: "August 22, 2025",
      time: "9:00AM-5:00PM CAT",
      location: "In-person in Cape Town, SA",
      type: "upcoming",
      category: "WORKSHOP",
      description: "A comprehensive workshop focused on epilepsy awareness, community education, and reducing stigma around neurological conditions in African communities.",
      imageUrl: "https://images.pexels.com/photos/3184638/pexels-photo-3184638.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
      id: 3,
      title: "Child Neurology Training Program for Healthcare Workers",
      date: "September 5, 2025",
      time: "10:00AM-3:00PM WAT",
      location: "In-person in Lagos, Nigeria",
      type: "upcoming",
      category: "TRAINING",
      description: "Intensive training program designed to equip primary healthcare workers with essential skills in identifying and managing pediatric neurological conditions.",
      imageUrl: "https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=600"
    }
  ];

  const collaborationOpportunities: CollaborationOpportunity[] = [
    {
      id: 1,
      title: "Community-Based Epilepsy Screening Program",
      description: "Seeking partners to implement and evaluate a community epilepsy screening tool in rural Tanzania.",
      projectLead: "Dr. Asha Juma",
      institution: "Tanzania Institute of Neurology",
      skillsNeeded: ["Community Health", "Program Evaluation", "Epilepsy Management"],
      commitmentLevel: "Moderate",
      duration: "12 months",
      isActive: true,
      contactEmail: "a.juma@tin.or.tz",
      createdAt: "2025-05-15"
    },
    {
      id: 2,
      title: "Neurodevelopmental Outcomes After Neonatal Jaundice",
      description: "Multicenter study on long-term neurodevelopmental outcomes following severe neonatal jaundice.",
      projectLead: "Prof. Kwame Mensah",
      institution: "West African Child Health Research Consortium",
      skillsNeeded: ["Developmental Pediatrics", "Data Analysis", "Research Coordination"],
      commitmentLevel: "High",
      duration: "24 months",
      isActive: true,
      contactEmail: "k.mensah@wachrc.org",
      createdAt: "2025-04-22"
    },
    {
      id: 3,
      title: "Cerebral Palsy Registry Development",
      description: "Collaboration to establish a national cerebral palsy registry in Nigeria.",
      projectLead: "Dr. Chukwuma Okafor",
      institution: "Nigerian Pediatric Neurology Association",
      skillsNeeded: ["Database Development", "Public Health", "Clinical Neurology"],
      commitmentLevel: "Variable",
      duration: "18 months",
      isActive: true,
      contactEmail: "c.okafor@npna.org.ng",
      createdAt: "2025-06-10"
    }
  ];

  useEffect(() => {
    if (location.hash === '#opportunities') {
      setActiveTab("collaborations");
      setTimeout(() => {
        const element = document.getElementById("opportunities");
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [location]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubscriptionStatus(null);

    try {
      const response = await api.post('/newsletter/subscribe/', {
        email,
        first_name: firstName,
        last_name: lastName,
        source: 'workshops_and_symposiums'
      });

      setSubscriptionStatus({
        type: 'success',
        message: 'Thank you for subscribing to our newsletter!'
      });
      setEmail('');
      setFirstName('');
      setLastName('');
    } catch (error: unknown) {
      let errorMessage = 'Failed to subscribe. Please try again later.';
      
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as { response?: { status?: number, data?: any } };
        if (axiosError.response?.status === 400 && axiosError.response.data?.email) {
          errorMessage = axiosError.response.data.email[0];
        } else if (axiosError.response?.data?.detail) {
          errorMessage = axiosError.response.data.detail;
        }
      }

      setSubscriptionStatus({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-6">
            Workshops & Symposiums
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 font-light max-w-3xl mx-auto mb-8">
            Deepening knowledge, growing collaboration, and shaping the future of child neurology in Africa
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-gray-600">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-red-600" />
              <span>42+ Past Events</span>
            </div>
            <div className="flex items-center">
              <UserPlus className="w-5 h-5 mr-2 text-red-600" />
              <span>{collaborationOpportunities.length} Active Collaborations</span>
            </div>
            <div className="flex items-center">
              <Globe className="w-5 h-5 mr-2 text-red-600" />
              <span>18 African Countries Reached</span>
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
                onClick={() => setActiveTab("highlights")}
                className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                  activeTab === "highlights"
                    ? "bg-white text-red-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Highlights
              </button>
              <button
                onClick={() => setActiveTab("collaborations")}
                className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                  activeTab === "collaborations"
                    ? "bg-white text-red-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Collaboration Opportunities
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        {activeTab === "highlights" && (
          <div className="space-y-16">
            {/* What Are Workshops & Symposiums */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                What Are Workshops & Symposiums at ACNA?
              </h2>
              <div className="bg-blue-50 rounded-xl p-8 space-y-4">
                <p className="text-gray-700">
                  <strong>Workshops</strong> at ACNA are intensive, hands-on training sessions focused on developing practical skills in pediatric neurology. These sessions typically last 1-3 days and emphasize interactive learning through case studies, demonstrations, and small group exercises.
                </p>
                <p className="text-gray-700">
                  <strong>Symposiums</strong> are academic gatherings where experts present and discuss the latest research, clinical practices, and policy developments in child neurology. These events foster knowledge exchange and often feature panel discussions and networking opportunities.
                </p>
                <p className="text-gray-700">
                  Together, these educational formats play a crucial role in ACNA's mission to build capacity, advance professional development, and promote cutting-edge research across Africa's pediatric neurology community.
                </p>
              </div>
            </section>

            {/* Focus Areas */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                Our Focus Areas
              </h2>
                <div className="max-w-4xl mx-auto">
                  {accordionItems.map((item, index) => (
                    <div key={index} className="border-b border-gray-200 mb-2 last:mb-0">
                      <button
                        onClick={() => toggleAccordion(index)}
                        className="w-full py-5 px-4 text-left flex justify-between items-center hover:bg-gray-100 transition-colors rounded-lg"
                      >
                        <span className="font-medium text-gray-900 text-lg">{item.title}</span>
                        <span className="text-2xl text-gray-600">
                          {openAccordion === index ? '−' : '+'}
                        </span>
                      </button>
                      {openAccordion === index && (
                        <div className="pb-6 px-4 text-gray-600">
                          {item.content}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
            </section>

            {/* Upcoming Events Section*/}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <Calendar className="w-8 h-8 text-red-600 mr-3" />
                Upcoming Events
              </h2>
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="group cursor-pointer flex gap-4 hover:bg-gray-50 transition-colors duration-200 p-4 rounded-lg">
                    <div className="relative flex-shrink-0 w-24 h-24 overflow-hidden rounded">
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-1 left-1">
                        <span className="bg-red-600 text-white px-2 py-0.5 text-xs font-bold uppercase tracking-wide">
                          {event.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-orange-600 font-medium text-xs uppercase">
                        {event.date}, {event.time}
                      </p>
                      <h3 className="text-base font-bold text-gray-900 leading-tight group-hover:text-red-600 transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {event.isOnline ? 'Online Event' : event.location}
                      </p>
                      <a href="#" className="text-red-600 text-sm font-medium inline-flex items-center hover:text-red-700">
                        READ MORE <ArrowRight className="ml-1 w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <Link
                  to="/events"
                  className="border-2 border-orange-600 text-gray-800 px-6 py-3 text-sm font-bold tracking-wider hover:bg-orange-600 hover:text-white transition-all duration-300 rounded-lg"
                >
                  VIEW ALL EVENTS
                </Link>
              </div>
            </section>

            {/* Collaborate or Host */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <Users2 className="w-8 h-8 text-red-600 mr-3" />
                Collaborate or Host
              </h2>
              <div className="bg-white border border-gray-200 rounded-xl p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">How to Get Involved</h3>
                    <ul className="space-y-4 text-gray-700">
                      <li className="flex items-start">
                        <span className="text-red-600 mr-2">•</span>
                        <span><strong>Propose a topic:</strong> Suggest workshop themes addressing critical needs in African pediatric neurology</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-600 mr-2">•</span>
                        <span><strong>Host regionally:</strong> Partner with ACNA to organize symposiums in your institution or country</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-600 mr-2">•</span>
                        <span><strong>Share expertise:</strong> Volunteer as a facilitator, moderator, or speaker</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-600 mr-2">•</span>
                        <span><strong>Support financially:</strong> Sponsor events or provide resources for participant scholarships</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Submit Your Proposal</h3>
                    <p className="text-gray-700 mb-6">
                      Interested in organizing an ACNA-endorsed workshop or symposium? Download our hosting guidelines and submit a proposal form.
                    </p>
                    <div className="space-y-3">
                      <a
                        href="/proposal-guidelines.pdf"
                        className="block bg-white border border-red-600 text-red-600 px-4 py-3 rounded-lg font-medium text-center hover:bg-red-50 transition"
                      >
                        Download Guidelines
                      </a>
                      <a
                        href="/submit-proposal"
                        className="block bg-red-600 text-white px-4 py-3 rounded-lg font-medium text-center hover:bg-red-700 transition"
                      >
                        Submit Proposal Form
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Stay Engaged */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <Mail className="w-8 h-8 text-red-600 mr-3" />
                Stay Engaged
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-blue-50 rounded-xl p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Join Our Community</h3>
                  <p className="text-gray-700 mb-6">
                    Never miss an announcement about upcoming workshops and symposiums. Connect with fellow professionals and access event materials.
                  </p>
                  <form onSubmit={handleSubscribe} className="max-w-md mx-auto">
                    {subscriptionStatus && (
                      <div className={`mb-4 p-3 rounded-md ${
                        subscriptionStatus.type === 'success' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {subscriptionStatus.message}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <input
                          type="text"
                          placeholder="First name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg text-grey-900 focus:outline-none focus:ring-2 focus:ring-white"
                          required
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Last name"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="relative mb-4">
                      <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-6 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                        required
                      />
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className={`absolute right-2 top-2 bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors flex items-center ${
                          isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                        }`}
                      >
                        {isSubmitting ? (
                          'Subscribing...'
                        ) : (
                          <>
                            <Mail className="mr-2 h-4 w-4" />
                            Subscribe
                          </>
                        )}
                      </button>
                    </div>
                    
                    <p className="text-xs sm:text-sm text-grey-100 opacity-90">
                    By subscribing, you agree to receive event notifications and updates from ACNA. You can unsubscribe at any time.
                  </p>
                  </form>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Access Resources</h3>
                  <p className="text-gray-700 mb-6">
                    Materials from past ACNA workshops and symposiums are available to members. Log in to access presentations, recordings, and training manuals.
                  </p>
                  <div className="space-y-3">
                    <Link
                      to="/login"
                      className="block bg-white border border-red-600 text-red-600 px-4 py-3 rounded-lg font-medium text-center hover:bg-red-50 transition"
                    >
                      Member Login
                    </Link>
                    <Link
                      to="/register"
                      className="block bg-gray-900 text-white px-4 py-3 rounded-lg font-medium text-center hover:bg-gray-800 transition"
                    >
                      Become a Member
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === "collaborations" && (
          <div>
            <div id="opportunities" className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
                Collaboration Opportunities
              </h2>
              <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Connect with researchers and clinicians across Africa working on pediatric neurology projects.
                ACNA members can request collaboration support for their active projects.
              </p>
            </div>

            {/* Current Opportunities */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <UserPlus className="w-6 h-6 text-red-600 mr-2" />
                Current Opportunities
              </h2>
              
              <div className="space-y-6">
                {collaborationOpportunities.map((opportunity) => (
                  <div key={opportunity.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-200 p-6">
                    <div className="flex flex-col md:flex-row md:justify-between gap-6">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{opportunity.title}</h3>
                        <p className="text-gray-600 mb-4">{opportunity.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm mb-1">Project Lead:</h4>
                            <p className="text-gray-600 text-sm">{opportunity.projectLead}, {opportunity.institution}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm mb-1">Duration:</h4>
                            <p className="text-gray-600 text-sm">{opportunity.duration} • {opportunity.commitmentLevel} commitment</p>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm mb-1">Skills Needed:</h4>
                          <div className="flex flex-wrap gap-1">
                            {opportunity.skillsNeeded.map((skill, index) => (
                              <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="md:w-64 flex-shrink-0">
                        <div className="space-y-3">
                          <a
                            href={`mailto:${opportunity.contactEmail}`}
                            className="block bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors font-medium text-center"
                          >
                            Contact Project Lead
                          </a>
                          <p className="text-xs text-gray-500 text-center">
                            Posted: {new Date(opportunity.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Request Collaboration */}
            <div className="bg-blue-50 rounded-xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Have an Active Project?
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  ACNA members can request collaboration support for their pediatric neurology projects.
                </p>
              </div>
              
              <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <AlertCircle className="w-6 h-6 text-red-600 mr-2" />
                    Request Collaboration Support
                  </h3>
                  <p className="text-gray-600 mb-6">
                    To request collaboration assistance for your project, please log in to your ACNA Members Account
                    and submit a Collaboration Request form in the Workshop & Collaboration Hub. Our team will help connect you with potential partners
                    and resources.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                      to="/login"
                      className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition text-center"
                    >
                      Log In to Your Account
                    </Link>
                    <Link
                      to="/register"
                      className="flex-1 border border-red-600 text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-red-50 transition text-center"
                    >
                      Become a Member
                    </Link>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    What You Can Request
                  </h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                      <span className="text-red-600 mr-2">•</span>
                      <span>
                        <strong>Expert Consultation:</strong> Connect with specialists in specific neurological conditions
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-600 mr-2">•</span>
                      <span>
                        <strong>Research Collaboration:</strong> Find partners for multicenter studies or data sharing
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-600 mr-2">•</span>
                      <span>
                        <strong>Training Support:</strong> Request workshop facilitators or training materials
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-600 mr-2">•</span>
                      <span>
                        <strong>Program Implementation:</strong> Get help launching community programs
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-600 mr-2">•</span>
                      <span>
                        <strong>Technical Assistance:</strong> Access support for grant writing or protocol development
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkshopsSymposiums;