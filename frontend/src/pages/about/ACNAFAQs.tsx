import React, { useState } from 'react';
import { Link } from 'react-router';

const GeneralACNAFAQs = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const faqCategories = [
    {
      title: "About ACNA",
      faqs: [
        {
          question: "What is the African Child Neurology Association (ACNA)?",
          answer: "ACNA is a professional organization dedicated to improving neurological care for children across Africa. We bring together healthcare professionals, researchers, institutions, and advocates to advance pediatric neurology through education, research, advocacy, and collaboration. Our mission is to ensure every African child has access to quality neurological care."
        },
        {
          question: "When was ACNA founded and where is it headquartered?",
          answer: "ACNA was founded to address the growing need for specialized pediatric neurological care across Africa. Our headquarters is located in Nairobi, Kenya, with regional offices in Abuja (Nigeria), Addis Ababa (Ethiopia), Dakar (Senegal), and Johannesburg (South Africa), allowing us to serve the entire continent effectively."
        },
        {
          question: "What is ACNA's mission and vision?",
          answer: "Our mission is to advance pediatric neurology across Africa through education, research, advocacy, and collaboration. Our vision is a future where every African child has access to quality neurological care, regardless of their location or socioeconomic status. We strive to build sustainable healthcare systems that can serve communities for generations."
        },
        {
          question: "How many countries does ACNA operate in?",
          answer: "ACNA operates across 25+ African countries, with a network of over 1,250 staff and volunteers. We have 20 regional and field offices strategically located to maximize our impact and reach. Our programs annually reach over 500,000 children across the continent."
        }
      ]
    },
    {
      title: "Programs & Services",
      faqs: [
        {
          question: "What programs does ACNA offer?",
          answer: "ACNA offers comprehensive programs including clinical training for healthcare providers, research initiatives, policy advocacy, community education, telemedicine services, and capacity building for healthcare institutions. We also provide educational resources, mentorship programs, and support for establishing pediatric neurology units across Africa."
        },
        {
          question: "Does ACNA provide direct medical services?",
          answer: "While ACNA primarily focuses on education, training, and capacity building, we do support direct medical services through our partner institutions and mobile clinics in underserved areas. We work to strengthen existing healthcare systems rather than replace them, ensuring sustainable long-term impact."
        },
        {
          question: "How does ACNA support healthcare professionals?",
          answer: "ACNA provides continuing medical education, specialized training programs, research opportunities, networking platforms, and access to the latest clinical guidelines and best practices. We offer fellowships, mentorship programs, and career development opportunities for healthcare professionals at all levels."
        },
        {
          question: "What research does ACNA conduct?",
          answer: "ACNA conducts research on pediatric neurological conditions prevalent in Africa, including epilepsy, cerebral palsy, neurodevelopmental disorders, and infectious diseases affecting the nervous system. Our research focuses on developing culturally appropriate treatment protocols and improving diagnostic capabilities across the continent."
        }
      ]
    },
    {
      title: "Partnerships & Collaboration",
      faqs: [
        {
          question: "Who does ACNA partner with?",
          answer: "ACNA partners with governments, universities, hospitals, international organizations, NGOs, and corporate sponsors. Our partners include the World Health Organization, UNICEF, local ministries of health, medical schools, and international pediatric neurology societies to maximize our collective impact."
        },
        {
          question: "How can organizations partner with ACNA?",
          answer: "Organizations can partner with ACNA through various mechanisms including research collaborations, training program sponsorship, technology sharing, policy advocacy, and funding support. We welcome partnerships that align with our mission and can contribute to improving child neurological health across Africa."
        },
        {
          question: "Does ACNA collaborate with international organizations?",
          answer: "Yes, ACNA actively collaborates with international pediatric neurology societies, global health organizations, and academic institutions worldwide. These partnerships facilitate knowledge exchange, capacity building, and resource sharing to benefit African children with neurological conditions."
        },
        {
          question: "How does ACNA work with local governments?",
          answer: "ACNA works closely with African governments to develop healthcare policies, establish clinical guidelines, train healthcare workers, and strengthen health systems. We provide technical expertise and support for implementing national pediatric neurology programs and improving healthcare infrastructure."
        }
      ]
    },
    {
      title: "Getting Involved",
      faqs: [
        {
          question: "How can I get involved with ACNA?",
          answer: "There are many ways to get involved with ACNA: become a member, volunteer for programs, participate in training workshops, contribute to research, attend conferences, donate to support our mission, or spread awareness about pediatric neurology issues in Africa. Every contribution makes a difference."
        },
        {
          question: "Does ACNA offer volunteer opportunities?",
          answer: "Yes, ACNA offers various volunteer opportunities including clinical service, training program assistance, research support, community outreach, administrative support, and advocacy work. Volunteers can contribute remotely or through field assignments based on their skills and availability."
        },
        {
          question: "How can I donate to ACNA?",
          answer: "You can donate to ACNA through our secure online donation platform, bank transfers, or by participating in fundraising events. We accept one-time donations, recurring monthly contributions, and targeted donations for specific programs. All donations are used efficiently to maximize impact for African children."
        },
        {
          question: "Can I attend ACNA events and conferences?",
          answer: "ACNA regularly hosts conferences, workshops, webinars, and training sessions that are open to healthcare professionals, researchers, students, and other stakeholders. Members receive discounted rates and early registration privileges. Check our events calendar for upcoming opportunities."
        }
      ]
    },
    {
      title: "Resources & Support",
      faqs: [
        {
          question: "What resources does ACNA provide?",
          answer: "ACNA provides clinical guidelines, educational materials, research publications, training modules, webinar recordings, policy briefs, and networking platforms. Members have access to our comprehensive resource library, continuing education credits, and expert consultation services."
        },
        {
          question: "How can I access ACNA's educational materials?",
          answer: "Educational materials are available through our member portal, public website, and mobile app. Some resources are freely available to all healthcare providers, while premium content is accessible to members. We also distribute materials through our partner institutions and training programs."
        },
        {
          question: "Does ACNA offer telemedicine or consultation services?",
          answer: "Yes, ACNA provides telemedicine consultation services connecting African healthcare providers with pediatric neurology specialists. This includes case consultations, second opinions, and educational sessions to support providers in underserved areas with limited access to specialized care."
        },
        {
          question: "How can I contact ACNA for support?",
          answer: "You can contact ACNA through our website contact form, email our support team, call our regional offices, or connect with us on social media. We have dedicated support staff to assist with membership, programs, technical issues, and general inquiries in multiple languages."
        }
      ]
    },
    {
      title: "Impact & Outcomes",
      faqs: [
        {
          question: "What impact has ACNA achieved?",
          answer: "ACNA has trained thousands of healthcare providers, established pediatric neurology units in major hospitals, contributed to policy changes in multiple countries, published groundbreaking research, and directly improved care for over 500,000 children annually. Our programs have significantly increased access to quality neurological care across Africa."
        },
        {
          question: "How does ACNA measure its success?",
          answer: "ACNA measures success through various metrics including number of healthcare providers trained, children reached through programs, research publications, policy changes influenced, healthcare facilities strengthened, and long-term health outcomes in target populations. We publish annual impact reports with detailed statistics."
        },
        {
          question: "What are ACNA's future goals?",
          answer: "ACNA aims to expand reach to all African countries, establish pediatric neurology training programs in every region, develop innovative diagnostic and treatment technologies, influence continental health policies, and create sustainable financing mechanisms for pediatric neurological care across Africa."
        },
        {
          question: "How can I stay updated on ACNA's work and impact?",
          answer: "Stay updated through our newsletter, social media channels, annual reports, member communications, website updates, and regional meetings. We regularly share success stories, research findings, program updates, and opportunities for involvement with our community."
        }
      ]
    }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-6">Frequently Asked Questions</h1>
          <p className="text-xl md:text-2xl text-gray-700 font-light max-w-3xl mx-auto">
            Learn more about ACNA, our mission, programs, and how we're transforming pediatric neurology across Africa.
          </p>
        </div>
      </section>

      {/* Header Section with Sidebar */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start gap-8 mb-12">
            {/* Compact Sidebar */}
            <div className="bg-orange-600 text-white rounded-lg p-6 w-full md:w-64 flex-shrink-0">
              <div className="mb-4">
                <h2 className="text-xl font-bold">FAQ Sections</h2>
              </div>
              <ul className="space-y-2">
                <li>
                  <a href="/membership-faqs" className="hover:underline block py-2">
                    Membership FAQs
                  </a>
                </li>
                <li>
                  <Link to="/careers#faq" className="hover:underline block py-2">
                    Careers FAQ
                  </Link>
                </li>
                <li>
                  <a href="/contact" className="hover:underline block py-2">
                    Contact Support
                  </a>
                </li>
              </ul>
            </div>

            {/* Header Content */}
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
                General Questions About ACNA
              </h2>
              <div className="w-20 h-1 bg-red-600 mb-6"></div>
              <p className="text-lg text-gray-700">
                Get answers to common questions about our organization, programs, partnerships, and impact across Africa. 
                For specific questions about membership or careers, check our specialized FAQ sections.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Categories Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {faqCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-12 last:mb-0">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                  {categoryIndex + 1}
                </span>
                {category.title}
              </h3>
              
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {category.faqs.map((faq, faqIndex) => {
                  const globalIndex = categoryIndex * 100 + faqIndex;
                  return (
                    <div key={faqIndex} className="border-b border-gray-200 last:border-b-0">
                      <button
                        onClick={() => toggleFAQ(globalIndex)}
                        className="w-full py-5 px-6 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-semibold text-gray-900 text-lg pr-4">
                          {faq.question}
                        </span>
                        <span className="text-2xl text-orange-600 flex-shrink-0 transform transition-transform duration-200">
                          {openFAQ === globalIndex ? '−' : '+'}
                        </span>
                      </button>
                      {openFAQ === globalIndex && (
                        <div className="pb-6 px-6 text-gray-700 leading-relaxed">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default GeneralACNAFAQs;