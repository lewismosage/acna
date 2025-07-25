import React from 'react';
import ScrollToTop from '../../components/common/ScrollToTop';

const MembershipCategories = () => {
  const membershipCategories = [
    {
      title: "Full / Professional Member",
      fee: "USD $80",
      whoCanJoin: [
        "Licensed pediatric neurologists",
        "Medical doctors or consultants specializing in child neurology or neurology",
        "Professionals engaged in clinical practice, research, or teaching in neurology"
      ],
      benefits: [
        "Full voting rights at ACNA General Assemblies",
        "Access to member-only publications, journals, and clinical guidelines",
        "Discounted rates for annual conferences, workshops, and webinars",
        "Eligibility to serve on ACNA committees and hold leadership roles",
        "Priority access to research collaboration and grant opportunities",
        "Member dashboard with premium learning resources"
      ],
      color: "bg-blue-50 border-blue-200",
      badgeColor: "bg-blue-600"
    },
    {
      title: "Associate Member",
      fee: "USD $40",
      whoCanJoin: [
        "Allied health professionals such as nurses, psychologists, occupational therapists, physiotherapists, speech and language therapists, and social workers in child health or neurology-related fields"
      ],
      benefits: [
        "Participation in ACNA special interest groups and forums",
        "Access to monthly newsletters, toolkits, and webinars",
        "Discounted admission to relevant events and training",
        "Platform for professional networking and regional collaboration",
        "Certificate of membership and CPD recognition (where applicable)"
      ],
      color: "bg-green-50 border-green-200",
      badgeColor: "bg-green-600"
    },
    {
      title: "Trainee / Student Member",
      fee: "USD $15",
      whoCanJoin: [
        "Medical students, neurology residents, fellows, or early-career researchers with proof of enrollment"
      ],
      benefits: [
        "Access to mentorship programs and career development support",
        "Eligibility for student travel grants and research competitions",
        "Access to curated e-learning materials, lectures, and webinars",
        "Early access to internships, training opportunities, and scholarships",
        "Involvement in student networks and academic forums"
      ],
      color: "bg-yellow-50 border-yellow-200",
      badgeColor: "bg-yellow-600"
    },
    {
      title: "Institutional Member",
      fee: "USD $300",
      whoCanJoin: [
        "Academic institutions, hospitals, non-governmental organizations (NGOs), research centers, and training institutions focused on child health or neuroscience"
      ],
      benefits: [
        "Group access for up to 5 staff members (expandable at a fee)",
        "Institutional recognition on the ACNA website and materials",
        "Priority eligibility for collaborative projects and multi-center research",
        "Discounted exhibition/sponsorship rates for ACNA events",
        "Networking with regional and global institutional partners"
      ],
      color: "bg-purple-50 border-purple-200",
      badgeColor: "bg-purple-600"
    },
    {
      title: "Affiliate Member",
      fee: "USD $50",
      whoCanJoin: [
        "Individuals or organizations outside Africa or non-clinical stakeholders who support ACNA's goals (e.g., researchers, policy experts, philanthropists)"
      ],
      benefits: [
        "Access to quarterly reports, newsletters, and ACNA publications",
        "Invitations to international workshops and knowledge-sharing events",
        "Recognition as a Friend of ACNA in annual reports",
        "No voting rights or eligibility for board positions"
      ],
      color: "bg-indigo-50 border-indigo-200",
      badgeColor: "bg-indigo-600"
    },
    {
      title: "Honorary Member",
      fee: "Complimentary (Lifetime)",
      whoCanJoin: [
        "Individuals who have made outstanding contributions to pediatric neurology in Africa",
        "Nominated and approved by the ACNA Board of Directors"
      ],
      benefits: [
        "Lifetime recognition and award certificate",
        "Complimentary access to all ACNA events and materials",
        "May serve as advisors to ACNA committees or projects",
        "Highlighted in the ACNA Hall of Honour"
      ],
      color: "bg-amber-50 border-amber-200",
      badgeColor: "bg-amber-600"
    },
    {
      title: "Corporate / Partner Member",
      fee: "USD $500+ (custom packages available)",
      whoCanJoin: [
        "Companies or private-sector entities such as pharmaceutical firms, medical device manufacturers, or health tech innovators"
      ],
      benefits: [
        "Brand visibility at ACNA events, newsletters, and website",
        "Access to exhibit booths and corporate speaking slots",
        "Invitations to closed strategic roundtables and innovation summits",
        "Opportunities to co-develop health programs or support research",
        "Annual report mention and digital partner badge"
      ],
      color: "bg-rose-50 border-rose-200",
      badgeColor: "bg-rose-600"
    },
    {
      title: "Lifetime Member",
      fee: "USD $500 (One-Time)",
      whoCanJoin: [
        "Qualified Full Members who wish to support ACNA with a one-time contribution"
      ],
      benefits: [
        "All Full Member benefits with no renewal fees",
        "Lifetime Membership Certificate",
        "Priority invitations to special sessions and ACNA partner forums",
        "Recognition as a sustaining supporter of child neurology in Africa"
      ],
      color: "bg-emerald-50 border-emerald-200",
      badgeColor: "bg-emerald-600"
    }
  ];

  return (
    <div className="bg-white">
      <ScrollToTop />
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-6">Membership Categories</h1>
          <p className="text-xl md:text-2xl text-gray-700 font-light max-w-3xl mx-auto">
            Join a community of professionals dedicated to improving child neurological care across Africa.
          </p>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4"> ACNA Membership Categories</h2>
            <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
            <p className="text-lg text-gray-700 leading-relaxed">
              The African Child Neurology Association (ACNA) offers tailored membership options for professionals, institutions, students, and partners dedicated to improving child neurological care in Africa. Our membership structure is designed to foster collaboration, advance education, and support advocacy across the continent.
            </p>
            <p className="text-lg text-gray-700 mt-4">
             <strong>Membership is open to individuals and institutions from Africa and beyond who share ACNA's mission.</strong>
            </p>
          </div>
        </div>
      </section>

      {/* Membership Categories Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8">
            {membershipCategories.map((category, index) => (
              <div key={index} className={`bg-white rounded-lg shadow-lg border-2 ${category.color} overflow-hidden hover:shadow-xl transition-shadow duration-300`}>
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">{category.title}</h3>
                    <span className={`${category.badgeColor} text-white px-4 py-2 rounded-full text-sm font-bold`}>
                      {category.fee}
                    </span>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Who Can Join:</h4>
                    <ul className="space-y-2">
                      {category.whoCanJoin.map((item, idx) => (
                        <li key={idx} className="text-gray-700 text-sm leading-relaxed">
                          • {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Benefits:</h4>
                    <ul className="space-y-2">
                      {category.benefits.map((benefit, idx) => (
                        <li key={idx} className="text-gray-700 text-sm leading-relaxed flex items-start">
                          <span className="text-green-500 mr-2 flex-shrink-0">✓</span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-orange-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Join?</h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Become part of the movement to transform child neurological care across Africa. Your membership makes a difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <span className="text-2xl"></span>
            <a
              href="/register"
              className="bg-white text-orange-600 px-8 py-4 font-bold text-lg hover:bg-gray-100 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Become a Member Now
            </a>
          </div>
          <p className="text-orange-100 mt-6 text-sm">
            Questions about membership? <span className="underline cursor-pointer hover:text-white">Contact us</span> for more information.
          </p>
        </div>
      </section>
    </div>
  );
};

export default MembershipCategories;