import React from 'react';
import ScrollToTop from '../../components/common/ScrollToTop';
import { Link } from 'react-router-dom';

const VolunteerInfoSection = () => {

  

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto">
      <ScrollToTop />

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row mb-12">
          {/* Left Header */}
          <div className="lg:w-1/2 bg-orange-600 text-white p-12">
            <div className="h-0.5 w-16 bg-white mb-6"></div>
            <h2 className="text-4xl font-light mb-4">VOLUNTEER</h2>
            <p className="text-lg">Get involved in your community</p>
          </div>

          {/* Right Image */}
          <div className="lg:w-1/2">
            <img
              src="https://images.pexels.com/photos/8042458/pexels-photo-8042458.jpeg?auto=compress&w=600."
              alt="Community volunteers working together"
              className="w-full h-60 object-cover"
            />
          </div>
        </div>

        {/* Content Section */}
        <div className="px-4 lg:px-12">
          <div className="max-w-4xl">
            <p className="text-gray-700 mb-4">
              At ACNA, we believe every child deserves access to quality neurological care. We work across Africa to support health professionals, advocate for stronger systems, and build communities of care for children with neurological conditions.
            </p>

            <p className="text-gray-700 mb-8">
              <strong>That's where you come in.</strong> Volunteers like you help us expand our reach, amplify awareness, and support families and professionals across the continent.
            </p>

            {/* In Your Community Section */}
            <div className="mb-8">
              <h3 className="text-2xl text-orange-600 font-light mb-4">In Your Community</h3>
              <p className="text-gray-700 mb-6">
                There are many ways you can support ACNA’s mission right from your own community:
              </p>

              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">○</span>
                  <div>
                    <strong>Educate your community –</strong> Help raise awareness about childhood neurological disorders by organizing local events, webinars, or school talks.
                  </div>
                </li>

                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">○</span>
                  <div>
                    <strong>Support outreach and advocacy –</strong> Distribute resources, join public campaigns, or represent ACNA at local health fairs and forums.
                  </div>
                </li>

                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">○</span>
                  <div>
                    <strong>Use your skills –</strong> Whether you’re a writer, designer, translator, or health student, your talents can support ACNA projects and communication efforts.
                  </div>
                </li>

                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">○</span>
                  <div>
                    <strong>Involve children and youth –</strong> Engage young people in learning about child health advocacy and help them lead initiatives in schools and clubs.
                  </div>
                </li>

                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">○</span>
                  <div>
                    <strong>Fundraise for ACNA –</strong> Launch a personal or community fundraiser to support training, research, or child health programs.
                  </div>
                </li>

                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">○</span>
                  <div>
                    <strong>Amplify our mission online –</strong> Use your digital platforms to share stories, facts, and ACNA initiatives. Your voice can help us reach more people.
                  </div>
                </li>

                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">○</span>
                  <div>
                    <strong>Other special projects –</strong> From event support to community mapping, let us know how you’d like to help.
                  </div>
                </li>
              </ul>
            </div>

            <div className="mb-8">
              <p className="text-gray-700 mb-2">
                Volunteers must be 16 or older. Those under 18 should be accompanied by an adult at in-person events.
              </p>
              <p className="text-gray-700 mb-8">
                ACNA currently does not offer international volunteer opportunities.
              </p>
            </div>

            {/* CTA Button */}
            <Link to="/volunteer/form" 
              className="border-2 border-orange-600 text-orange-600 px-8 py-3 text-sm font-bold tracking-wider hover:bg-orange-600 hover:text-white transition-all duration-300">
              VOLUNTEER WITH ACNA
              </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VolunteerInfoSection;
