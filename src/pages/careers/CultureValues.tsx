import React, { useState } from "react";
import { ChevronDown, ChevronUp, Heart, Users, Lightbulb, Globe, Shield, Target } from "lucide-react";
import ScrollToTop from "../../components/common/ScrollToTop";

const CultureAndValues = () => {
  const [expandedValue, setExpandedValue] = useState<number | null>(null);

  const coreValues = [
    {
      id: 1,
      icon: <Heart className="w-8 h-8" />,
      title: "Compassion First",
      subtitle: "Every child deserves quality neurological care",
      description: "We approach our work with deep empathy and understanding. Every decision we make is guided by the faces and stories of the children and families we serve. Compassion drives us to go beyond clinical protocols to provide holistic, culturally sensitive care that honors the dignity of every individual.",
      examples: [
        "Patient-centered care approaches in all our programs",
        "Cultural competency training for all staff",
        "Family support services integrated into treatment plans"
      ]
    },
    {
      id: 2,
      icon: <Users className="w-8 h-8" />,
      title: "Collaborative Impact",
      subtitle: "Together we achieve more than we could alone",
      description: "We believe in the power of partnership and collective action. By working closely with local communities, governments, healthcare systems, and international partners, we create sustainable solutions that have lasting impact across the African continent.",
      examples: [
        "Multi-disciplinary teams across all projects",
        "Community-led health initiatives",
        "Cross-border knowledge sharing programs"
      ]
    },
    {
      id: 3,
      icon: <Lightbulb className="w-8 h-8" />,
      title: "Innovation & Excellence",
      subtitle: "Pioneering solutions for complex challenges",
      description: "We embrace innovation while maintaining the highest standards of excellence. From cutting-edge research to digital health solutions, we continuously seek better ways to diagnose, treat, and prevent neurological conditions in children across Africa.",
      examples: [
        "AI-powered diagnostic tools for resource-limited settings",
        "Mobile health platforms for remote consultations",
        "Evidence-based treatment protocols adapted for African contexts"
      ]
    },
    {
      id: 4,
      icon: <Globe className="w-8 h-8" />,
      title: "Pan-African Unity",
      subtitle: "Strengthening healthcare across the continent",
      description: "We celebrate the diversity of African cultures while working toward common health goals. Our pan-African approach ensures that knowledge, resources, and best practices flow freely across borders to benefit children everywhere on the continent.",
      examples: [
        "Standardized training programs across 25+ countries",
        "Multi-language educational materials and resources",
        "Regional centers of excellence for specialized care"
      ]
    },
    {
      id: 5,
      icon: <Shield className="w-8 h-8" />,
      title: "Integrity & Accountability",
      subtitle: "Transparent stewardship of resources and trust",
      description: "We maintain the highest ethical standards in all our operations. From financial transparency to research integrity, we are accountable to the communities we serve, our partners, and the children whose futures depend on our work.",
      examples: [
        "Open-source research and data sharing initiatives",
        "Community feedback mechanisms in all programs",
        "Regular third-party evaluations of our impact"
      ]
    },
    {
      id: 6,
      icon: <Target className="w-8 h-8" />,
      title: "Sustainable Solutions",
      subtitle: "Building systems that endure and grow",
      description: "We focus on creating lasting change by building local capacity and sustainable healthcare systems. Our goal is not just to treat children today, but to ensure that future generations have access to quality neurological care throughout their lives.",
      examples: [
        "Training programs for local healthcare workers",
        "Infrastructure development in partnership with governments",
        "Policy advocacy for systemic healthcare improvements"
      ]
    }
  ];

  const cultureHighlights = [
    {
      title: "Diverse & Inclusive",
      description: "Our team represents 25+ countries, bringing together medical professionals, researchers, policy experts, and community advocates from across Africa and beyond."
    },
    {
      title: "Learning-Oriented",
      description: "We invest in continuous learning and professional development, with annual training budgets, conference attendance, and mentorship programs for all staff."
    },
    {
      title: "Mission-Driven",
      description: "96% of our employees report feeling deeply connected to our mission, with many citing the meaningful nature of the work as their primary motivation."
    },
    {
      title: "Work-Life Balance",
      description: "We recognize that sustainable impact requires sustainable people. Our policies support flexible working, mental health, and family commitments."
    }
  ];

  return (
    <div className="bg-white">
      <ScrollToTop />
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-orange-600 to-orange-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
            Our Culture & Values
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
            At ACNA, our values aren't just words on a wall, they're the driving force behind every decision, every partnership, and every life we touch.
          </p>
          <div className="bg-white bg-opacity-20 rounded-lg p-6 max-w-2xl mx-auto">
            <p className="text-lg">
              "Our culture is built on the belief that every child in Africa deserves access to world-class neurological care, and that together, we can make this vision a reality."
            </p>
            <p className="text-sm mt-3 opacity-90">— ACNA Leadership Team</p>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              These six values guide everything we do, from daily interactions to strategic decisions that shape the future of child health in Africa.
            </p>
          </div>

          <div className="space-y-6">
            {coreValues.map((value) => (
              <div key={value.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <button
                  className="w-full p-6 text-left bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-inset"
                  onClick={() => setExpandedValue(expandedValue === value.id ? null : value.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-orange-600 flex-shrink-0">
                        {value.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{value.title}</h3>
                        <p className="text-gray-600 mt-1">{value.subtitle}</p>
                      </div>
                    </div>
                    <div className="text-orange-600">
                      {expandedValue === value.id ? <ChevronUp /> : <ChevronDown />}
                    </div>
                  </div>
                </button>
                
                {expandedValue === value.id && (
                  <div className="px-6 pb-6 bg-gray-50">
                    <div className="pl-12">
                      <p className="text-gray-700 mb-4 leading-relaxed">
                        {value.description}
                      </p>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">How we live this value:</h4>
                        <ul className="space-y-1">
                          {value.examples.map((example, index) => (
                            <li key={index} className="text-gray-600 flex items-start">
                              <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              {example}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Culture Highlights */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Culture in Action</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Values come to life through the daily experiences and environment we create for our team members.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {cultureHighlights.map((highlight, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{highlight.title}</h3>
                <p className="text-gray-600 leading-relaxed">{highlight.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-16 bg-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Values Drive Results</h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              When values and culture align with mission, extraordinary things happen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-extrabold mb-2">500K+</div>
              <div className="text-sm opacity-90">Children reached through our programs annually</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold mb-2">96%</div>
              <div className="text-sm opacity-90">Employee satisfaction and mission alignment</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold mb-2">25+</div>
              <div className="text-sm opacity-90">Countries where our values guide local teams</div>
            </div>
          </div>
        </div>
      </section>

      {/* Join Us CTA */}
      <section className="py-16 bg-white text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Live These Values?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            If our culture and values resonate with you, we'd love to explore how you can contribute to transforming child health across Africa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/careers/jobs"
              className="bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition"
            >
              View Open Positions
            </a>
            <a
              href="/careers/benefits"
              className="border border-orange-600 text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-orange-50 transition"
            >
              Learn About Benefits
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CultureAndValues;