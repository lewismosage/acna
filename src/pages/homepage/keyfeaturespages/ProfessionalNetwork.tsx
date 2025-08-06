import { useState } from 'react';
import ScrollToTop from '../../../components/common/ScrollToTop';
import { Link } from 'react-router';

interface AccordionItem {
  title: string;
  content: string;
}

interface Article {
  title: string;
  date: string;
  imageUrl: string;
}

const ProfessionalNetwork = () => {
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  const accordionItems: AccordionItem[] = [
    {
      title: "Expert Consultation Network",
      content: "Connect with specialized pediatric neurologists across Africa for case consultations, second opinions, and collaborative treatment planning."
    },
    {
      title: "Research Collaboration Hub",
      content: "Join multi-center research initiatives, share data, and contribute to groundbreaking studies on child neurology in African populations."
    },
    {
      title: "Continuing Medical Education",
      content: "Access webinars, workshops, and certification programs designed specifically for healthcare professionals treating neurological conditions in children."
    },
    {
      title: "Mentorship & Career Development",
      content: "Participate in mentorship programs connecting experienced specialists with emerging professionals in pediatric neurology across the continent."
    }
  ];  

  return (
    <div className="bg-white">
      <ScrollToTop />
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-6">Professional Network</h1>
          <p className="text-xl md:text-2xl text-gray-700 font-light max-w-3xl mx-auto">
            Connect with leading child neurologists and researchers across the African continent.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="space-y-6 text-gray-700 leading-relaxed text-lg">
            <p>
              The African Child Neurology Association brings together a diverse community of healthcare professionals dedicated to advancing pediatric neurological care across the continent. Our network spans from renowned academic institutions to frontline clinics in rural communities.
            </p>

            <p>
              Through our professional network, specialists share knowledge, collaborate on complex cases, and work together to address the unique challenges facing children with neurological conditions in Africa. This collaborative approach strengthens healthcare systems and improves outcomes for patients continent-wide.
            </p>

            <p>
              Our members include pediatric neurologists, general pediatricians, nurses, physiotherapists, occupational therapists, researchers, and allied healthcare professionals. Together, we form a comprehensive support system that addresses every aspect of child neurological care.
            </p>

            <p>
              As the demand for specialized neurological care continues to grow across Africa, our network serves as a vital resource for professional development, knowledge sharing, and collaborative care delivery. Join us in building a stronger future for pediatric neurology across the continent.
            </p>
          </div>
        </div>
      </section>

      {/* Network Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          
         {/* Member Categories Section */}
          <div className="mb-16">
            <h3 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-2">Member Categories</h3>
            <div className="w-16 h-1 bg-red-600 mb-6"></div>
            <p className="text-gray-600 mb-8 max-w-3xl text-lg">
              Our network welcomes healthcare professionals at all levels, from{' '}
              <span className="text-orange-600 font-medium">medical students to senior consultants</span>, all united in advancing child neurology across Africa.
            </p>
            
            <div className="grid md:grid-cols-3 gap-12">
              {/* Specialist Members */}
              <div>
                <img
                  src="https://images.stockcake.com/public/c/0/d/c0dbf447-02db-4db0-a968-fcee1a5390db_large/digital-medical-care-stockcake.jpg"
                  alt="Specialist Members"
                  className="w-full h-56 object-cover mb-4 rounded-lg"
                />
                <h4 className="text-lg font-bold text-gray-900 mb-2">Specialist Members</h4>
                <p className="text-gray-700">
                  Pediatric neurologists, child psychiatrists, and neurosurgeons leading specialized care and research initiatives across African healthcare institutions.
                </p>
              </div>

              {/* General Healthcare Providers */}
              <div>
                <img
                  src="https://images.stockcake.com/public/9/9/6/996de5db-feb7-40dc-a3a9-ff56a28bc5d7_large/healthcare-workers-outdoors-stockcake.jpg"
                  alt="General Healthcare Providers"
                  className="w-full h-56 object-cover mb-4 rounded-lg"
                />
                <h4 className="text-lg font-bold text-gray-900 mb-2">General Healthcare Providers</h4>
                <p className="text-gray-700">
                  Pediatricians, family physicians, and nurses working in primary care settings who encounter children with neurological conditions in their daily practice.
                </p>
              </div>

              {/* Allied Health Professionals */}
              <div>
                <img
                  src="https://images.stockcake.com/public/f/5/2/f523d11e-9945-4c73-8189-911a0023b7fe_large/digital-healthcare-excellence-stockcake.jpg"
                  alt="Allied Health Professionals"
                  className="w-full h-56 object-cover mb-4 rounded-lg"
                />
                <h4 className="text-lg font-bold text-gray-900 mb-2">Allied Health Professionals</h4>
                <p className="text-gray-700">
                  Physiotherapists, occupational therapists, speech therapists, and other specialists providing comprehensive rehabilitation and support services.
                </p>
              </div>
            </div>
            <div className="mt-12 flex">
              <Link
              to="/register"
              className="border-2 border-orange-600 text-gray-800 px-6 py-3 text-sm font-bold tracking-wider hover:bg-orange-600 hover:text-white transition-all duration-300 rounded-lg">
                JOIN US
              </Link>
            </div>
          </div>

          {/* Collaboration Opportunities Section */}
          <div className="mb-16">
            <h3 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-2">Collaboration Opportunities</h3>
            <div className="w-16 h-1 bg-red-600 mb-6"></div>
            <p className="text-gray-600 mb-8 max-w-3xl text-lg">
              Explore various ways to collaborate with fellow professionals and contribute to{' '}
              <span className="text-orange-600 font-medium">advancing pediatric neurology</span> through shared expertise and resources.
            </p>

            <div className="grid md:grid-cols-3 gap-12">
              {/* Telemedicine Consultations */}
              <div>
                <img
                  src="https://images.stockcake.com/public/0/9/a/09a94ae3-50ec-48aa-81af-516a01187671_large/pediatric-checkup-interaction-stockcake.jpg"
                  alt="Telemedicine Consultations"
                  className="w-full h-56 object-cover mb-4 rounded-lg"
                />
                <h4 className="text-lg font-bold text-gray-900 mb-2">Telemedicine Consultations</h4>
                <p className="text-gray-700">
                  Participate in virtual consultations connecting specialists with healthcare providers in underserved regions, expanding access to expert care across Africa.
                </p>
              </div>

              {/* Research Partnerships */}
              <div>
                <img
                  src="https://images.stockcake.com/public/9/0/2/9029e5c1-ff07-4e8e-8c21-c23b253029c6_large/focused-laboratory-team-stockcake.jpg"
                  alt="Research Partnerships"
                  className="w-full h-56 object-cover mb-4 rounded-lg"
                />
                <h4 className="text-lg font-bold text-gray-900 mb-2">Research Partnerships</h4>
                <p className="text-gray-700">
                  Collaborate on continent-wide research studies, contribute to publications, and participate in clinical trials addressing neurological conditions in African children.
                </p>
              </div>

              {/* Training & Education */}
              <div>
                <img
                  src="https://images.pexels.com/photos/5726794/pexels-photo-5726794.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Training & Education"
                  className="w-full h-56 object-cover mb-4 rounded-lg"
                />
                <h4 className="text-lg font-bold text-gray-900 mb-2">Training & Education</h4>
                <p className="text-gray-700">
                  Lead workshops, mentor junior colleagues, and contribute to educational programs that build capacity for pediatric neurological care across the continent.
                </p>
              </div>
            </div>

            {/* Button */}
            <div className="mt-12 flex">
              <Link
                to="/collaboration-opportunities#opportunities"
                className="border-2 border-orange-600 text-gray-800 px-6 py-3 text-sm font-bold tracking-wider hover:bg-orange-600 hover:text-white transition-all duration-300 rounded-lg"
              >
                EXPLORE OPPORTUNITIES
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProfessionalNetwork;