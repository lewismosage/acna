import React, { useState } from 'react';

const MembershipFAQs = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const faqCategories = [
    {
      title: "General Membership Questions",
      faqs: [
        {
          question: "What is the African Child Neurology Association (ACNA)?",
          answer: "ACNA is a professional organization dedicated to improving neurological care for children across Africa. We bring together healthcare professionals, researchers, institutions, and advocates to advance pediatric neurology through education, research, advocacy, and collaboration."
        },
        {
          question: "Who can become an ACNA member?",
          answer: "ACNA membership is open to individuals, institutions, and organizations from Africa and beyond who share our mission. This includes pediatric neurologists, medical professionals, allied health workers, students, researchers, institutions, and corporate partners involved in child neurology."
        },
        {
          question: "What are the benefits of ACNA membership?",
          answer: "Benefits vary by membership type but generally include access to exclusive resources, networking opportunities, professional development, conference discounts, research collaboration opportunities, and the chance to contribute to improving child neurological care across Africa."
        },
        {
          question: "How long does ACNA membership last?",
          answer: "Most ACNA memberships are annual and run for twelve months from the enrollment date. To maintain benefits and access to opportunities, membership must be current and paid up. Lifetime membership is also available for qualified Full Members."
        }
      ]
    },
    {
      title: "Membership Types & Fees",
      faqs: [
        {
          question: "What are the different types of ACNA membership?",
          answer: "ACNA offers 8 membership categories: Full/Professional Member ($80), Associate Member ($40), Trainee/Student Member ($15), Institutional Member ($300), Affiliate Member ($50), Honorary Member (Complimentary), Corporate/Partner Member ($500+), and Lifetime Member ($500 one-time)."
        },
        {
          question: "How much does ACNA membership cost?",
          answer: "Membership fees range from $15 for students to $500+ for corporate members. Full Professional membership is $80 annually, Associate membership is $40, and Institutional membership is $300. Honorary membership is complimentary for outstanding contributors."
        },
        {
          question: "Can I upgrade or downgrade my membership type?",
          answer: "Yes, you can change your membership type based on your current status and qualifications. Contact our membership team to discuss upgrading or changing your membership category. Any fee differences will be adjusted accordingly."
        },
        {
          question: "What is the difference between Full and Associate membership?",
          answer: "Full/Professional Members have voting rights, can serve on committees, and have access to premium resources. Associate Members are allied health professionals who participate in forums and networking but don't have voting rights or committee eligibility."
        }
      ]
    },
    {
      title: "Application & Registration",
      faqs: [
        {
          question: "How do I apply for ACNA membership?",
          answer: "You can apply online through our membership registration form. Select your membership category, provide the required information, upload any necessary documents (like proof of enrollment for students), and complete the payment process."
        },
        {
          question: "What documents do I need to provide for membership?",
          answer: "Requirements vary by membership type. Students need proof of enrollment, professionals may need license verification, and institutions need registration documents. Specific requirements are outlined in the application form for each category."
        },
        {
          question: "How long does the application process take?",
          answer: "Most applications are processed within 5-10 business days after submission and payment verification. You'll receive a confirmation email once your membership is approved and activated."
        },
        {
          question: "Can I apply for membership from outside Africa?",
          answer: "Yes! ACNA welcomes members from around the world who support our mission. Affiliate membership is specifically designed for individuals and organizations outside Africa, while other categories are open based on qualifications."
        }
      ]
    },
    {
      title: "Payment & Billing",
      faqs: [
        {
          question: "What payment methods do you accept?",
          answer: "We accept various payment methods including credit/debit cards, bank transfers, and mobile money options popular in African countries. Payment processing is secure and handled through our trusted payment partners."
        },
        {
          question: "Are membership fees refundable?",
          answer: "Membership fees are generally non-refundable once processed. However, we consider refund requests on a case-by-case basis within 30 days of payment, particularly for exceptional circumstances."
        },
        {
          question: "When do I need to renew my membership?",
          answer: "Annual memberships expire 12 months from your enrollment date. You'll receive renewal reminders via email 60, 30, and 7 days before expiration. Lifetime members don't need to renew."
        },
        {
          question: "What happens if I don't renew my membership on time?",
          answer: "If you don't renew by the expiration date, your membership will lapse and you'll lose access to member benefits. You can reactivate by paying the current year's fees, but there may be a brief processing period."
        }
      ]
    },
    {
      title: "Member Benefits & Access",
      faqs: [
        {
          question: "What exclusive resources do members get access to?",
          answer: "Members access clinical guidelines, research publications, webinar recordings, e-learning materials, networking platforms, and regional collaboration opportunities. Full members get additional premium resources and voting rights."
        },
        {
          question: "How do I access the member dashboard?",
          answer: "After your membership is approved, you'll receive login credentials to access the member portal. The dashboard provides access to resources, event information, networking tools, and your membership status."
        },
        {
          question: "Can I attend ACNA events as a member?",
          answer: "Yes! Members receive discounted rates for ACNA conferences, workshops, and webinars. Some events may be exclusive to members or offer early registration privileges."
        },
        {
          question: "How do I get involved in ACNA committees or leadership roles?",
          answer: "Full/Professional Members can express interest in committee service or leadership roles. Opportunities are announced through member communications, and applications are reviewed by the Board of Directors."
        }
      ]
    },
    {
      title: "Student & Trainee Membership",
      faqs: [
        {
          question: "How do I prove my student status?",
          answer: "Students need to provide proof of current enrollment such as a student ID, enrollment letter, or transcript. This documentation is required during application and may need to be updated annually."
        },
        {
          question: "What mentorship opportunities are available to student members?",
          answer: "Student members can access our mentorship program connecting them with experienced professionals, participate in career development workshops, and receive guidance on research and career paths in pediatric neurology."
        },
        {
          question: "Are there scholarships or grants available for student members?",
          answer: "Yes, we offer travel grants for conference attendance, research competition opportunities, and scholarships for training programs. These opportunities are announced regularly to student members."
        },
        {
          question: "Can I transition from student to professional membership?",
          answer: "Absolutely! Once you complete your studies and begin professional practice, you can upgrade to Full/Professional or Associate membership depending on your role and qualifications."
        }
      ]
    },
    {
      title: "Technical Support",
      faqs: [
        {
          question: "I'm having trouble with the registration process. Who can help?",
          answer: "Our technical support team is available to assist with registration issues. Contact us through the support portal, email, or phone. We also have step-by-step guides available on our website."
        },
        {
          question: "How do I update my membership information?",
          answer: "You can update your information through the member dashboard or by contacting our membership team. Keep your contact details current to receive important updates and communications."
        },
        {
          question: "I forgot my login credentials. How do I reset them?",
          answer: "Use the 'Forgot Password' link on the login page to reset your password. If you need further assistance, contact our support team with your registered email address."
        },
        {
          question: "Can I download a membership certificate?",
          answer: "Yes, active members can download their membership certificate from the member dashboard. The certificate includes your membership type, validity period, and unique member ID."
        }
      ]
    }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-6">Membership FAQs</h1>
          <p className="text-xl md:text-2xl text-gray-700 font-light max-w-3xl mx-auto">
            Find answers to common questions about ACNA membership, benefits, and application process.
          </p>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">Frequently Asked Questions</h2>
          <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
          <p className="text-lg text-gray-700 leading-relaxed">
            Have questions about joining ACNA? We've compiled answers to the most common questions about membership types, benefits, application process, and more. Can't find what you're looking for? 
            <span className="text-orange-600 font-medium cursor-pointer hover:underline"> Contact our support team</span> for personalized assistance.
          </p>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          {faqCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                  {categoryIndex + 1}
                </span>
                {category.title}
              </h3>
              
              <div className="">
                {category.faqs.map((faq, faqIndex) => {
                  const globalIndex = categoryIndex * 100 + faqIndex; // Unique index for each FAQ
                  return (
                    <div key={faqIndex} className="border-b border-gray-200 last:border-b-0">
                      <button
                        onClick={() => toggleFAQ(globalIndex)}
                        className="w-full py-6 px-6 text-left flex justify-between items-start hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-semibold text-gray-900 text-lg pr-4 leading-relaxed">
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

      {/* Quick Links Section */}
      <section className="py-16 bg-orange-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">Need More Help?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-blue-50 rounded p-6">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">View Membership Categories</h3>
              <p className="text-gray-600 mb-4">Explore all membership types and their benefits</p>
              <a href="/membership-categories" className="text-orange-600 font-medium hover:underline">
                Learn More →
              </a>
            </div>
            
            <div className="bg-blue-50 rounded p-6">
              <div className="text-4xl mb-4">✍️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Apply for Membership</h3>
              <p className="text-gray-600 mb-4">Ready to join? Start your application today</p>
              <a href="/register" className="text-orange-600 font-medium hover:underline">
                Apply Now →
              </a>
            </div>
            
            <div className="bg-blue-50 rounded p-6">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Contact Support</h3>
              <p className="text-gray-600 mb-4">Get personalized help from our team</p>
              <a href="/contact" className="text-orange-600 font-medium hover:underline">
                Contact Us →
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MembershipFAQs;