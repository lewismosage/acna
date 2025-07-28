import React from "react";
import { ArrowRight, Clock, Users, Award, Globe } from "lucide-react";
import ScrollToTop from "../../components/common/ScrollToTop";

const TrainingPrograms = () => {
  const featuredPrograms = [
    {
      type: "FLAGSHIP PROGRAM",
      title: "Annual Continental Conference in Pediatric Neurology",
      duration: "3 Days",
      participants: "500+ Professionals",
      format: "Hybrid (In-person & Virtual)",
      location: "Rotating African Cities",
      image:
        "https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=400",
      category: "Conference",
      nextDate: "October 15-17, 2025 | Accra, Ghana",
    },
    {
      type: "CERTIFICATION",
      title: "Fellowship Program in Pediatric Neurology",
      duration: "12 Months",
      participants: "20 Fellows/Year",
      format: "Clinical Rotations + Coursework",
      location: "Partner Institutions",
      image:
        "https://images.pexels.com/photos/5726794/pexels-photo-5726794.jpeg?auto=compress&cs=tinysrgb&w=400",
      category: "Fellowship",
      nextDate: "Applications open: September 1, 2025",
    },
    {
      type: "MASTERCLASS",
      title: "Epilepsy Management Intensive Workshop",
      duration: "5 Days",
      participants: "40 Participants",
      format: "Hands-on Training",
      location: "Multiple Locations",
      image:
        "https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=400",
      category: "Workshop",
      nextDate: "Next session: August 28-30, 2025",
    },
    {
      type: "ONLINE LEARNING",
      title: "Virtual Pediatric Neurology Fundamentals",
      duration: "Self-paced",
      participants: "Unlimited",
      format: "Interactive Online Modules",
      location: "Virtual Platform",
      image:
        "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=400",
      category: "Online Course",
      nextDate: "Available year-round",
    },
  ];

  const specializedPrograms = [
    {
      title: "Cerebral Palsy Assessment and Management",
      duration: "3 Days",
      level: "Intermediate",
      cme: "24 CME Credits",
      description:
        "Comprehensive training on assessment techniques, therapeutic interventions, and family-centered care approaches for children with cerebral palsy.",
      image:
        "https://images.pexels.com/photos/4173239/pexels-photo-4173239.jpeg?auto=compress&cs=tinysrgb&w=400",
      nextOffering: "September 12-14, 2025",
    },
    {
      title: "Pediatric Stroke Recognition and Emergency Management",
      duration: "2 Days",
      level: "Advanced",
      cme: "16 CME Credits",
      description:
        "Critical skills training for rapid recognition, diagnosis, and emergency management of stroke in children and adolescents.",
      image:
        "https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=400",
      nextOffering: "August 20-21, 2025",
    },
    {
      title: "Neurodevelopmental Assessment in Primary Care",
      duration: "4 Days",
      level: "Beginner",
      cme: "32 CME Credits",
      description:
        "Essential skills for primary healthcare workers in screening and assessing neurodevelopmental conditions in children.",
      image:
        "https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=400",
      nextOffering: "October 5-8, 2025",
    },
    {
      title: "Genetic Counseling in Pediatric Neurology",
      duration: "2 Days",
      level: "Advanced",
      cme: "16 CME Credits",
      description:
        "Specialized training in genetic counseling approaches for families dealing with inherited neurological conditions.",
      image:
        "https://images.pexels.com/photos/3985163/pexels-photo-3985163.jpeg?auto=compress&cs=tinysrgb&w=400",
      nextOffering: "November 15-16, 2025",
    },
    {
      title: "Community-Based Rehabilitation Strategies",
      duration: "5 Days",
      level: "Intermediate",
      cme: "40 CME Credits",
      description:
        "Training in developing and implementing community-based rehabilitation programs for children with neurological disabilities.",
      image:
        "https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=400",
      nextOffering: "December 3-7, 2025",
    },
    {
      title: "Telemedicine in Pediatric Neurology",
      duration: "1 Day",
      level: "All Levels",
      cme: "8 CME Credits",
      description:
        "Practical training on implementing telemedicine solutions for pediatric neurological consultations in resource-limited settings.",
      image:
        "https://images.pexels.com/photos/4386339/pexels-photo-4386339.jpeg?auto=compress&cs=tinysrgb&w=400",
      nextOffering: "September 25, 2025",
    },
  ];

  const learningPaths = [
    {
      type: "CAREER PATH",
      title: "Primary Healthcare Worker Pathway",
      description: "Comprehensive training sequence for non-specialists",
      modules: [
        "Basic Neurological Assessment",
        "Common Conditions Recognition",
        "Referral Guidelines",
        "Family Communication",
      ],
      duration: "6 Months",
      image:
        "https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg?auto=compress&cs=tinysrgb&w=400",
      certification: "ACNA Primary Care Certificate",
    },
    {
      type: "SPECIALTY PATH",
      title: "Pediatric Neurology Specialist Pathway",
      description: "Advanced training for medical specialists",
      modules: [
        "Advanced Diagnostics",
        "Complex Case Management",
        "Research Methods",
        "Leadership Skills",
      ],
      duration: "12 Months",
      image:
        "https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=400",
      certification: "ACNA Specialist Certificate",
    },
    {
      type: "RESEARCH PATH",
      title: "Clinical Research Training Pathway",
      description: "Research methodology and implementation",
      modules: [
        "Study Design",
        "Data Collection",
        "Statistical Analysis",
        "Publication Writing",
      ],
      duration: "9 Months",
      image:
        "https://images.pexels.com/photos/5726794/pexels-photo-5726794.jpeg?auto=compress&cs=tinysrgb&w=400",
      certification: "ACNA Research Certificate",
    },
  ];

  return (
    <div className="bg-white min-h-screen">
      <ScrollToTop />
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-6">
            Training Programs
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 font-light max-w-3xl mx-auto">
            Advance your expertise in pediatric neurology through our
            comprehensive training programs designed for healthcare
            professionals across Africa.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          {/* Featured Programs Section */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
                Featured Training Programs
              </h2>
              <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Our flagship training opportunities designed to meet the diverse
                needs of healthcare professionals across the continent.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {featuredPrograms.map((program, index) => (
                <div
                  key={index}
                  className="group cursor-pointer hover:bg-gray-50 transition-colors duration-200 p-6 rounded-lg border border-gray-200"
                >
                  <div className="relative mb-4 overflow-hidden rounded">
                    <img
                      src={program.image}
                      alt={program.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="bg-red-600 text-white px-2 py-1 text-xs font-bold uppercase tracking-wide rounded">
                        {program.type}
                      </span>
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className="bg-orange-600 text-white px-2 py-1 text-xs font-medium rounded">
                        {program.category}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-red-600 transition-colors">
                      {program.title}
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {program.duration}
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {program.participants}
                      </div>
                      <div className="flex items-center">
                        <Globe className="w-4 h-4 mr-1" />
                        {program.format}
                      </div>
                      <div className="flex items-center text-orange-600 font-medium">
                        <Award className="w-4 h-4 mr-1" />
                        {program.location}
                      </div>
                    </div>
                    <p className="text-red-600 font-medium text-sm">
                      {program.nextDate}
                    </p>
                    <a
                      href="#"
                      className="text-red-600 text-sm font-medium inline-flex items-center hover:text-red-700 pt-2"
                    >
                      LEARN MORE & REGISTER{" "}
                      <ArrowRight className="ml-1 w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <button className="border-2 border-orange-600 text-orange-600 px-6 py-2 sm:px-8 sm:py-3 font-medium hover:bg-orange-600 hover:text-white transition-all duration-300 uppercase tracking-wide rounded text-sm sm:text-base">
                View All Featured Programs
              </button>
            </div>
          </div>

          {/* Specialized Training Programs Section */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
                Specialized Training Programs
              </h2>
              <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Focused training sessions targeting specific neurological
                conditions and clinical skills.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {specializedPrograms.map((program, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <img
                    src={program.image}
                    alt={program.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs font-medium rounded">
                        {program.level}
                      </span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 text-xs font-medium rounded">
                        {program.cme}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">
                      {program.title}
                    </h3>
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <Clock className="w-4 h-4 mr-1" />
                      {program.duration}
                    </div>
                    <p className="text-gray-700 text-sm mb-3 line-clamp-3">
                      {program.description}
                    </p>
                    <p className="text-orange-600 font-medium text-sm mb-3">
                      Next: {program.nextOffering}
                    </p>
                    <button className="text-red-600 text-sm font-medium hover:text-red-700 flex items-center">
                      REGISTER NOW <ArrowRight className="ml-1 w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <button className="border-2 border-orange-600 text-orange-600 px-6 py-2 sm:px-8 sm:py-3 font-medium hover:bg-orange-600 hover:text-white transition-all duration-300 uppercase tracking-wide rounded text-sm sm:text-base">
                View All Specialized Programs
              </button>
            </div>
          </div>

          {/* Learning Pathways Section */}
          <div>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
                Structured Learning Pathways
              </h2>
              <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Comprehensive learning journeys designed to build expertise
                systematically across different career levels.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {learningPaths.map((path, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <img
                    src={path.image}
                    alt={path.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <div className="mb-3">
                      <span className="bg-yellow-500 text-white px-2 py-1 text-xs font-bold uppercase tracking-wide rounded">
                        {path.type}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {path.title}
                    </h3>
                    <p className="text-gray-700 text-sm mb-4">
                      {path.description}
                    </p>

                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">
                        Training Modules:
                      </h4>
                      <ul className="space-y-1">
                        {path.modules.map((module, idx) => (
                          <li
                            key={idx}
                            className="text-xs text-gray-600 flex items-center"
                          >
                            <div className="w-1.5 h-1.5 bg-orange-600 rounded-full mr-2"></div>
                            {module}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">
                          Duration: {path.duration}
                        </span>
                        <span className="text-orange-600 font-medium">
                          {path.certification}
                        </span>
                      </div>
                    </div>

                    <button className="w-full mt-4 bg-orange-600 text-white py-2 rounded font-medium hover:bg-orange-700 transition-colors">
                      START PATHWAY
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <button className="border-2 border-orange-600 text-orange-600 px-6 py-2 sm:px-8 sm:py-3 font-medium hover:bg-orange-600 hover:text-white transition-all duration-300 uppercase tracking-wide rounded text-sm sm:text-base">
                Explore All Learning Pathways
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Registration & Support Section */}
      <section className="py-16 bg-orange-600">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            READY TO ADVANCE YOUR EXPERTISE?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of healthcare professionals who have enhanced their
            skills through our training programs. Get started today with
            personalized learning recommendations.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto mb-6">
            <button className="bg-white text-orange-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center justify-center">
              <Award className="mr-2 h-4 w-4" />
              Browse Programs
            </button>
            <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-orange-600 transition-colors">
              Get Recommendations
            </button>
          </div>

          <div className="text-sm text-orange-100 opacity-90 space-y-2">
            <p>
              Need help choosing the right program? Contact our Education Team
              at{" "}
              <a
                href="mailto:training@acna.org"
                className="underline hover:text-white"
              >
                training@acna.org
              </a>
            </p>
            <p>
              Financial assistance and scholarships available for qualified
              participants from low-resource settings.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TrainingPrograms;
