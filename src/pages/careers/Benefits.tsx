import { useState } from "react";
import { ChevronDown, ChevronUp, Shield, Globe, GraduationCap, Users, Clock, MapPin, Gift, ChevronLeft, ChevronRight } from "lucide-react";
import ScrollToTop from "../../components/common/ScrollToTop";

const Benefits = () => {
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const benefitCategories = [
    {
      id: 1,
      icon: <Shield className="w-8 h-8" />,
      title: "Health & Wellness",
      subtitle: "Comprehensive care for you and your family",
      color: "bg-blue-50 text-blue-600",
      borderColor: "border-blue-200",
      benefits: [
        {
          name: "Medical Insurance",
          description: "Comprehensive health coverage including preventive care, specialist consultations, and emergency services across Africa and internationally"
        },
        {
          name: "Mental Health Support",
          description: "Access to counseling services, mental health apps, and wellness programs to support your emotional wellbeing"
        },
        {
          name: "Dental & Vision",
          description: "Full dental and vision coverage for you and your dependents, including routine checkups and corrective procedures"
        },
        {
          name: "Life & Disability Insurance",
          description: "Life insurance coverage and short/long-term disability protection to secure your family's financial future"
        },
        {
          name: "Health & Fitness",
          description: "Gym membership reimbursements, wellness stipends, and on-site fitness facilities at major offices"
        }
      ]
    },
    {
      id: 2,
      icon: <GraduationCap className="w-8 h-8" />,
      title: "Learning & Development",
      subtitle: "Invest in your professional growth",
      color: "bg-green-50 text-green-600",
      borderColor: "border-green-200",
      benefits: [
        {
          name: "Professional Development Fund",
          description: "$3,000 annual budget for conferences, courses, certifications, and skills training relevant to your role"
        },
        {
          name: "Leadership Programs",
          description: "Access to internal and external leadership development programs, including mentorship opportunities"
        },
        {
          name: "Conference & Travel",
          description: "Support for attending relevant medical, research, and professional conferences across Africa and globally"
        },
        {
          name: "Advanced Degree Support",
          description: "Tuition assistance for pursuing advanced degrees related to your work at ACNA, including PhDs and specialty certifications"
        },
        {
          name: "Internal Mobility",
          description: "Priority consideration for internal positions and cross-departmental project opportunities"
        }
      ]
    },
    {
      id: 3,
      icon: <Clock className="w-8 h-8" />,
      title: "Time Off & Flexibility",
      subtitle: "Balance work with life's important moments",
      color: "bg-purple-50 text-purple-600",
      borderColor: "border-purple-200",
      benefits: [
        {
          name: "Generous Vacation",
          description: "25-30 days of annual leave, increasing with tenure, plus local public holidays"
        },
        {
          name: "Flexible Work Arrangements",
          description: "Hybrid work options, flexible hours, and remote work opportunities based on role requirements"
        },
        {
          name: "Parental Leave",
          description: "16 weeks paid maternity leave, 8 weeks paternity leave, and adoption support benefits"
        },
        {
          name: "Personal Days",
          description: "Additional personal days for family emergencies, cultural celebrations, and personal wellness"
        },
        {
          name: "Sabbatical Opportunities",
          description: "Extended leave options for long-term employees to pursue research, education, or personal projects"
        }
      ]
    },
    {
      id: 4,
      icon: <Globe className="w-8 h-8" />,
      title: "Global Opportunities",
      subtitle: "Work across Africa and beyond",
      color: "bg-orange-50 text-orange-600",
      borderColor: "border-orange-200",
      benefits: [
        {
          name: "International Assignments",
          description: "Opportunities to work in different countries across our 25+ locations, with full relocation support"
        },
        {
          name: "Cross-Cultural Training",
          description: "Language learning support and cultural competency training for international assignments"
        },
        {
          name: "Travel & Accommodation",
          description: "Comprehensive travel insurance, quality accommodations, and per diem allowances for work travel"
        },
        {
          name: "Visa & Immigration Support",
          description: "Full support for work permits, visas, and immigration processes for international staff"
        },
        {
          name: "Global Health Coverage",
          description: "International health insurance that works across all our operating countries"
        }
      ]
    },
    {
      id: 5,
      icon: <Gift className="w-8 h-8" />,
      title: "Financial Benefits",
      subtitle: "Security and rewards for your contributions",
      color: "bg-indigo-50 text-indigo-600",
      borderColor: "border-indigo-200",
      benefits: [
        {
          name: "Competitive Salary",
          description: "Market-competitive salaries with annual reviews and performance-based increases"
        },
        {
          name: "Retirement Savings",
          description: "Employer-matched retirement contributions up to 6% of salary, vested immediately"
        },
        {
          name: "Annual Bonus",
          description: "Performance-based annual bonuses tied to individual and organizational impact goals"
        },
        {
          name: "Stock Options",
          description: "Equity participation opportunities for senior roles and long-term employees"
        },
        {
          name: "Financial Planning",
          description: "Access to financial advisors and planning services to help you manage and grow your wealth"
        }
      ]
    },
    {
      id: 6,
      icon: <Users className="w-8 h-8" />,
      title: "Community & Support",
      subtitle: "Connect and grow with your colleagues",
      color: "bg-red-50 text-red-600",
      borderColor: "border-red-200",
      benefits: [
        {
          name: "Employee Resource Groups",
          description: "Join communities based on interests, backgrounds, or career stages, with dedicated budgets for activities"
        },
        {
          name: "Mentorship Programs",
          description: "Formal mentoring relationships with senior leaders and cross-functional mentorship opportunities"
        },
        {
          name: "Team Building & Events",
          description: "Regular team outings, cultural celebrations, and pan-African staff gatherings"
        },
        {
          name: "Volunteer Time Off",
          description: "Paid time off for volunteer activities aligned with our mission and community service"
        },
        {
          name: "Family Support",
          description: "Childcare assistance, elder care resources, and family emergency support funds"
        }
      ]
    }
  ];

  const testimonials = [
    {
      quote: "The benefits at ACNA go beyond the traditional package. From the professional development opportunities to the supportive work environment, everything is designed to help you thrive while making a real difference in children's lives.",
      name: "Dr. Amara Kone",
      role: "Senior Research Coordinator",
      location: "Dakar Office",
      avatar: "A.K."
    },
    {
      quote: "Working at ACNA means being part of something bigger than yourself. The comprehensive health coverage and mental wellness support have been invaluable for my family, especially during challenging times.",
      name: "Sarah Ochieng",
      role: "Program Manager",
      location: "Nairobi Office", 
      avatar: "S.O."
    },
    {
      quote: "The learning and development opportunities here are exceptional. I've been able to attend three international conferences this year, and the leadership training has transformed how I approach my work.",
      name: "Dr. Ibrahim Hassan",
      role: "Clinical Director",
      location: "Abuja Office",
      avatar: "I.H."
    },
    {
      quote: "ACNA's commitment to work-life balance is genuine. The flexible arrangements allow me to excel in my role while being present for my family. It's rare to find an organization that truly walks the talk.",
      name: "Fatima Al-Rashid",
      role: "Data Scientist",
      location: "Remote",
      avatar: "F.R."
    }
  ];

  const quickBenefits = [
    "25-30 days annual leave",
    "Comprehensive health coverage",
    "$3,000 professional development fund",
    "16 weeks paid maternity leave",
    "Retirement matching up to 6%",
    "Flexible work arrangements",
    "International assignment opportunities",
    "Mental health & wellness support"
  ];

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => 
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };
  
  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => 
      prev === testimonials.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="bg-white">
      <ScrollToTop />
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-orange-600 to-orange-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
            Benefits & Rewards
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
            We believe that taking care of our people enables them to take exceptional care of the children and families we serve across Africa.
          </p>
          <div className="bg-white bg-opacity-20 rounded-lg p-6 max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {quickBenefits.slice(0, 4).map((benefit, index) => (
                <div key={index} className="text-sm">
                  <div className="w-2 h-2 bg-white rounded-full mx-auto mb-2"></div>
                  {benefit}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Overview */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Comprehensive Benefits Package</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our benefits reflect our commitment to supporting your whole life - professional growth, personal wellness, financial security, and meaningful connections.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {quickBenefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-center">
                <div className="w-3 h-3 bg-orange-600 rounded-full mx-auto mb-2"></div>
                <p className="text-sm text-gray-700 font-medium">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Benefits Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Explore Your Benefits</h2>
            <p className="text-lg text-gray-600">
              Click on each category to discover the full range of benefits available to ACNA team members.
            </p>
          </div>

          <div className="space-y-6">
            {benefitCategories.map((category) => (
              <div key={category.id} className={`border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ${category.borderColor}`}>
                <button
                  className="w-full p-6 text-left bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                  onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${category.color}`}>
                        {category.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{category.title}</h3>
                        <p className="text-gray-600 mt-1">{category.subtitle}</p>
                      </div>
                    </div>
                    <div className="text-gray-400">
                      {expandedCategory === category.id ? <ChevronUp /> : <ChevronDown />}
                    </div>
                  </div>
                </button>
                
                {expandedCategory === category.id && (
                  <div className="px-6 pb-6 bg-gray-50">
                    <div className="pl-16">
                      <div className="grid gap-4">
                        {category.benefits.map((benefit, index) => (
                          <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                            <h4 className="font-semibold text-gray-900 mb-2">{benefit.name}</h4>
                            <p className="text-gray-600 text-sm leading-relaxed">{benefit.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location-Specific Benefits */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Location-Specific Benefits</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              In addition to our global benefits package, we offer location-specific perks tailored to each of our major office locations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <MapPin className="w-6 h-6 text-orange-600 mr-2" />
                <h3 className="text-xl font-bold text-gray-900">Nairobi, Kenya</h3>
              </div>
              <ul className="space-y-2 text-gray-600">
                <li>• Transportation allowance</li>
                <li>• On-site medical clinic</li>
                <li>• Childcare facilities</li>
                <li>• Local cultural events budget</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <MapPin className="w-6 h-6 text-orange-600 mr-2" />
                <h3 className="text-xl font-bold text-gray-900">Abuja, Nigeria</h3>
              </div>
              <ul className="space-y-2 text-gray-600">
                <li>• Housing assistance</li>
                <li>• Security services</li>
                <li>• Local language training</li>
                <li>• Community engagement programs</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <MapPin className="w-6 h-6 text-orange-600 mr-2" />
                <h3 className="text-xl font-bold text-gray-900">All Locations</h3>
              </div>
              <ul className="space-y-2 text-gray-600">
                <li>• Cost of living adjustments</li>
                <li>• Local holiday calendar</li>
                <li>• Regional networking events</li>
                <li>• Cultural immersion opportunities</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* What Our Team Says */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold">What Our Team Says</h2>
            <div className="flex space-x-2">
              <button 
                onClick={prevTestimonial}
                className="p-2 rounded-full border border-gray-600 hover:bg-gray-800 transition-colors"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={nextTestimonial}
                className="p-2 rounded-full border border-gray-600 hover:bg-gray-800 transition-colors"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={index} className="w-full flex-shrink-0">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Main testimonial card */}
                    <div className="lg:col-span-3">
                      <div className="bg-gray-800 rounded-xl p-8 h-full">
                        <div className="text-6xl text-orange-500 mb-4">"</div>
                        <p className="text-xl leading-relaxed mb-6 text-gray-100">
                          {testimonial.quote}
                        </p>
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                            {testimonial.avatar}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{testimonial.name}</p>
                            <p className="text-gray-400">{testimonial.role}</p>
                            <p className="text-gray-500 text-sm">{testimonial.location}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Side stats card */}
                    <div className="lg:col-span-1">
                      <div className="bg-orange-600 rounded-xl p-6 h-full flex flex-col justify-center">
                        <div className="text-center text-white">
                          <div className="text-3xl font-bold mb-2">96%</div>
                          <div className="text-sm opacity-90 mb-4">Employee Satisfaction</div>
                          <div className="text-3xl font-bold mb-2">25+</div>
                          <div className="text-sm opacity-90 mb-4">Countries</div>
                          <div className="text-3xl font-bold mb-2">1,250+</div>
                          <div className="text-sm opacity-90">Team Members</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentTestimonial ? 'bg-orange-500' : 'bg-gray-600'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-orange-600 text-white text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Join Our Team?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            These benefits are just the beginning. Discover how you can build a meaningful career while making a lasting impact on child health across Africa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/careers/jobs"
              className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              View Open Positions
            </a>
            <a
              href="/careers/culture"
              className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:bg-opacity-10 transition"
            >
              Learn About Our Culture
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Benefits;