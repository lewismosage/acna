import { useState } from 'react';
import SAMGWER from "../../assets/sam-gwer.jpg"
import { Link } from 'react-router';
import JoWilmshurst from "../../assets/Jo Wilmshurst.jpg"


const OurStory = () => {
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };


  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-6">Our history</h1>
          <p className="text-xl md:text-2xl text-gray-700 font-light max-w-3xl mx-auto">
            The journey of ACNA - From vision to impact in child neurology across Africa
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="space-y-8 text-gray-700 leading-relaxed text-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">The Beginning</h2>
            <p>
              ACNA (African Child Neurology Alliance) was born from a shared urgency among African neurologists, pediatricians, and public health experts to address a silent crisis—neurological disorders affecting children in underserved regions. In 2010, a handful of clinicians and researchers came together after witnessing countless children suffer or die needlessly from conditions that were treatable or preventable. What began as informal collaboration quickly evolved into a regional movement to close the gap in access to pediatric neurology care.
            </p>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4 mt-12">A Vision Rooted in Equity</h2>
            <p>
              From the beginning, ACNA was founded on the belief that <strong className="text-orange-600">every child deserves access to quality neurological care</strong>, regardless of where they are born. Our mission is driven by equity, scientific integrity, and the urgent need to reduce disparities in child health outcomes across Africa. We envisioned a network that not only delivered care but also trained local professionals, built research capacity, and informed policy to create lasting change.
            </p>
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0 md:pr-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Leadership Team</h2>
              <p className="text-gray-600 text-lg mb-6">
                Our leaders' deep expertise in pediatric neurology and public health guides our work with communities across Africa to achieve better neurological outcomes for children.
              </p>
              <Link
              to="/about/leadership"
              className="border-2 border-orange-600 text-gray-800 px-6 py-3 text-sm font-bold tracking-wider hover:bg-orange-600 hover:text-white transition-all duration-300 rounded-lg">
               MEET ACNA'S LEADERS
              </Link>
            </div>
            <div className="md:w-1/2">
              <img
                src={JoWilmshurst}
                alt="ACNA Leadership Team"
                className="w-auto h-60 mx-auto rounded-lg shadow-lg object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Leader and Donate Section */}
      <section className="py-16 bg-orange-600">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          {/* Left Column - Leader */}
          <div className="md:w-1/2 flex flex-col items-center md:items-start">
            <div className="w-48 h-48 rounded-full bg-white overflow-hidden mb-6 border-4 border-white shadow-lg">
              <img
                src={SAMGWER} 
                alt="Sam Gwer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-center md:text-left text-white">
              <h3 className="text-2xl font-bold mb-2">Dr. Sams Gwer</h3>
              <p className="text-orange-100 mb-4">Chairperson, African Child Neurology Association (ACNA)</p>
              <p className="italic">
                "Every child deserves a future free from the burden of untreated neurological conditions. At ACNA, we are building that future one trained doctor, one informed community, and one child at a time. Your support isn’t just a donation; it’s a lifeline. Together, we can transform the landscape of pediatric neurology across Africa."
              </p>
            </div>
          </div>

          {/* Right Column - Donate CTA */}
          <div className="md:w-1/2 text-white text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">CREATE YOUR OWN PIECE OF HISTORY</h2>
            <p className="text-xl mb-8">
            Become a donor and be part of a historic movement to transform child neurology across Africa. Your support helps deliver life-saving care, train local specialists, and ensure no child is left behind due to treatable neurological conditions.
            </p>
            <button className="bg-white text-orange-600 px-8 py-3 rounded font-bold hover:bg-orange-50 transition-colors duration-200">
              DONATE NOW
            </button>
          </div>
        </div>
      </div>
    </section>
    </div>
  );
};

export default OurStory;