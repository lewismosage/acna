import React from 'react';
import WhereWeWork from './Wherewework';

const HowWeWork = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-6">How we work</h1>
          <p className="text-xl md:text-2xl text-gray-700 font-light max-w-3xl mx-auto">
           Driving change through partnerships, research, and skilled care.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="space-y-6 text-gray-700 leading-relaxed">
            <p>
              At the African Child Neurology Association (ACNA), our work is driven by a commitment to equity, inclusion, and excellence in child neurology. We partner with clinicians, researchers, health institutions, and communities across the continent to bridge gaps in knowledge, access, and care.
            </p>
            
            <p>
              Our approach is collaborative and holistic. We support local capacity by providing training and mentorship to healthcare professionals, developing evidence-based resources, and promoting early diagnosis and effective management of neurological disorders in children.
            </p>
            
            <p>
              We also work to influence policy and strengthen health systems by advocating for the inclusion of child neurology in national health agendas. Through research and regional partnerships, we strive to generate data that drives better decisions and sustainable change.
            </p>
            
            <p>
              Whether it's through building local expertise, empowering caregivers, or coordinating regional initiatives, ACNA is committed to a future where every African child with a neurological condition receives the care they deserve.
            </p>
          </div>
        </div>
      </section>

      {/* Where We Work Section */}
      <section className="py-16 bg-orange-600">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-start">
            
            {/* Left Content */}
            <div className="lg:w-1/2 text-white px-6 lg:px-12">
              <h2 className="text-4xl font-light mb-4">Where we work</h2>
              <div className="w-16 h-1 bg-white mb-6"></div>

              <p className="text-lg leading-relaxed mb-8">
                <strong>We work in over 25 countries.</strong><br />
                When neurological conditions affect children in underserved communities, our teams of specialists, nurses, researchers, and community health workers are often among the first to respond. Our commitment to reaching every child enables us to provide specialized care in remote areas, build local capacity, and directly deliver evidence-based neurological interventions.
              </p>
              <p className="text-lg leading-relaxed mb-8">
                Through strong regional partnerships and sustained community engagement, we empower local healthcare systems to better recognize, diagnose, and manage neurological conditions in children. Our work is grounded in collaboration, cultural sensitivity, and long-term impact, ensuring that no child is left behind, no matter where they live.
              </p>
            </div>

            {/* Right Content: Region Selector */}
            <div className="lg:w-1/2 mt-12 lg:mt-0 px-6">
              <WhereWeWork />
            </div>
          </div>
        </div>
      </section>

      {/* Explore Our Resources Section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">Explore Our Resources</h2>
            <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Discover how we put your generosity to work. Explore resources that reflect impact, equity, and progress.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {/* Impact Report Card */}
            <div className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Impact Report</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                See the impact of hope, care, and global solidarity in child neurology.
              </p>
              <button className="border-2 border-orange-500 text-orange-500 px-6 py-2 text-sm font-medium hover:bg-orange-500 hover:text-white transition-all duration-300">
                Download PDF
              </button>
            </div>

            {/* Impact in Focus Card */}
            <div className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Impact in Focus</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                A closer look at neurological health, research advances, and advocacy efforts.
              </p>
              <button className="border-2 border-orange-500 text-orange-500 px-6 py-2 text-sm font-medium hover:bg-orange-500 hover:text-white transition-all duration-300">
                View Report
              </button>
            </div>

            {/* Annual Report Card */}
            <div className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Annual Report</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Child neurology equity in action: explore the 2024 annual report.
              </p>
              <button className="border-2 border-orange-500 text-orange-500 px-6 py-2 text-sm font-medium hover:bg-orange-500 hover:text-white transition-all duration-300">
                View Report
              </button>
            </div>

            {/* Get Involved Card */}
            <div className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Get Involved</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Join the global fight for neurological health care as a human right.
              </p>
              <button className="border-2 border-orange-500 text-orange-500 px-6 py-2 text-sm font-medium hover:bg-orange-500 hover:text-white transition-all duration-300">
                Take Action
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowWeWork;