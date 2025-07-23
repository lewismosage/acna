import { useState } from 'react';

interface AccordionItem {
  title: string;
  content: string;
}

interface Article {
  title: string;
  date: string;
  imageUrl: string;
}

const WhatWeDo = () => {
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  const accordionItems: AccordionItem[] = [
    {
      title: "Neurological Disorders in Children",
      content: "We focus on epilepsy, cerebral palsy, autism, and other neurological conditions affecting African children."
    },
    {
      title: "Capacity Building & Training",
      content: "Training healthcare professionals across the continent to diagnose, treat, and manage pediatric neurological conditions."
    },
    {
      title: "Research & Data Collection",
      content: "Supporting research initiatives to better understand the burden of neurological disorders in Africa."
    },
    {
      title: "Advocacy & Policy",
      content: "Engaging with governments and organizations to improve access to neurological care and inclusion in health policy."
    }
  ];  

  const articles: Article[] = [
    {
      title: "The vital link between quality management systems and diagnostics development",
      date: "November 20, 2023",
      imageUrl: "https://images.pexels.com/photos/3985163/pexels-photo-3985163.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
      title: "Democratizing health care through self-testing",
      date: "May 26, 2022",
      imageUrl: "https://images.pexels.com/photos/3985163/pexels-photo-3985163.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
      title: "Connected diagnostics and the future of global health",
      date: "January 24, 2023",
      imageUrl: "https://images.pexels.com/photos/3985163/pexels-photo-3985163.jpeg?auto=compress&cs=tinysrgb&w=600"
    }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-6">What we do</h1>
          <p className="text-xl md:text-2xl text-gray-700 font-light max-w-3xl mx-auto">
            Every child has the right to survive and thrive.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="space-y-6 text-gray-700 leading-relaxed text-lg">
          <p>
          Tremendous progress has been made in advancing child health across Africa, yet neurological conditions remain a significant and often overlooked challenge. Many children continue to face barriers to proper diagnosis, treatment, and long-term neurological care.
        </p>

        <p>
          Despite efforts, countless young lives are still lost or impacted by preventable or manageable neurological disorders, including epilepsy, cerebral palsy, neuroinfections, developmental delays, and birth-related brain injuries. Weak health systems and lack of access to specialized care leave millions vulnerable.
        </p>

        <p>
          Disparities are even more severe for children in rural areas, those living with disabilities, and families affected by poverty or displacement. In conflict zones and humanitarian emergencies, access to neurological support becomes nearly impossible, worsening outcomes for those who need care the most.
        </p>

        <p>
          As Africa’s population continues to grow and age structures shift, the burden on health systems will only increase. ACNA is working to ensure that all children regardless of background or circumstance have access to the neurological care they need to grow, learn, and thrive in a changing world.
        </p>
          </div>
        </div>
      </section>

      {/* Our Focus Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">Our focus</h2>
            <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg">
              Learn how our child neurology teams respond to urgent health needs across Africa, and how we adapt to deliver{' '}
              <span className="text-orange-600 font-medium">specialized neurological care</span> to children in some of the continent's most underserved regions.
            </p>
          </div>

          {/* Accordion Items */}
          <div className="max-w-4xl mx-auto mb-16">
            {accordionItems.map((item, index) => (
              <div key={index} className="border-b border-gray-200 mb-2 last:mb-0">
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full py-5 px-4 text-left flex justify-between items-center hover:bg-gray-100 transition-colors rounded-lg"
                >
                  <span className="font-medium text-gray-900 text-lg">{item.title}</span>
                  <span className="text-2xl text-gray-600">
                    {openAccordion === index ? '−' : '+'}
                  </span>
                </button>
                {openAccordion === index && (
                  <div className="pb-6 px-4 text-gray-600">
                    {item.content}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Medical Issues Section */}
          <div className="mb-16">
            <h3 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-2">Medical issues</h3>
            <div className="w-16 h-1 bg-red-600 mb-6"></div>
            <p className="text-gray-600 mb-8 max-w-3xl text-lg">
              Learn about the critical neurological conditions affecting children across Africa, and the work ACNA is doing to improve{' '}
              <span className="text-orange-600 font-medium">diagnosis, treatment, and long-term care</span>.
            </p>
            
            <div className="grid md:grid-cols-3 gap-12">
              {/* Epilepsy in Children */}
              <div>
                <img
                  src="https://images.pexels.com/photos/4260325/pexels-photo-4260325.jpeg"
                  alt="Epilepsy in Children"
                  className="w-full h-56 object-cover mb-4"
                />
                <h4 className="text-lg font-bold text-gray-900 mb-2">Epilepsy in Children</h4>
                <p className="text-gray-700">
                  Epilepsy is one of the most common neurological disorders in children across Africa, often misunderstood and underdiagnosed. ACNA works to raise awareness and improve care.
                </p>
              </div>

              {/* Cerebral Palsy */}
              <div>
                <img
                  src="https://images.pexels.com/photos/4260323/pexels-photo-4260323.jpeg?auto=compress&cs=tinysrgb&w=400"
                  alt="Cerebral Palsy"
                  className="w-full h-56 object-cover mb-4"
                />
                <h4 className="text-lg font-bold text-gray-900 mb-2">Cerebral Palsy</h4>
                <p className="text-gray-700">
                  Many children with cerebral palsy in Africa face stigma and lack access to therapy and support. ACNA promotes early diagnosis, rehabilitation, and community inclusion.
                </p>
              </div>

              {/* Neurodevelopmental Disorders */}
              <div>
                <img
                  src="https://images.pexels.com/photos/11035398/pexels-photo-11035398.jpeg"
                  alt="Neurodevelopmental Disorders"
                  className="w-full h-56 object-cover mb-4"
                />
                <h4 className="text-lg font-bold text-gray-900 mb-2">Neurodevelopmental Disorders</h4>
                <p className="text-gray-700">
                  Conditions like autism and developmental delays often go unnoticed or are misinterpreted. ACNA supports capacity building for better screening and intervention.
                </p>
              </div>
            </div>
            <div className="mt-12 flex">
              <button className="border-2 border-orange-600 text-gray-800 px-6 py-3 text-sm font-bold tracking-wider hover:bg-orange-600 hover:text-white transition-all duration-300 rounded-lg">
                SEE MORE
              </button>
            </div>
          </div>

          {/* Issues in Focus Section */}
          <div className="mb-16">
            <h3 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-2">Issues in focus</h3>
            <div className="w-16 h-1 bg-red-600 mb-6"></div>
            <p className="text-gray-600 mb-8 max-w-3xl text-lg">
              Explore the pressing challenges impacting children's neurological health in Africa, and how ACNA is actively working to improve outcomes through{' '}
              <span className="text-orange-600 font-medium">education, advocacy, and care</span>.
            </p>

            <div className="grid md:grid-cols-3 gap-12">
              {/* Access to Diagnosis and Treatment */}
              <div>
                <img
                  src="https://images.pexels.com/photos/3952048/pexels-photo-3952048.jpeg?auto=compress&cs=tinysrgb&w=400"
                  alt="Access to Diagnosis and Treatment"
                  className="w-full h-56 object-cover mb-4"
                />
                <h4 className="text-lg font-bold text-gray-900 mb-2">Access to Diagnosis and Treatment</h4>
                <p className="text-gray-700">
                  Many communities across Africa lack access to neurological specialists and essential diagnostic tools. ACNA advocates for equitable healthcare infrastructure to bridge this gap.
                </p>
              </div>

              {/* Community Awareness and Stigma */}
              <div>
                <img
                  src="https://images.pexels.com/photos/8828698/pexels-photo-8828698.jpeg?auto=compress&cs=tinysrgb&w=400"
                  alt="Community Awareness and Stigma"
                  className="w-full h-56 object-cover mb-4"
                />
                <h4 className="text-lg font-bold text-gray-900 mb-2">Community Awareness and Stigma</h4>
                <p className="text-gray-700">
                  Misconceptions and stigma surrounding neurological conditions often prevent families from seeking care. ACNA raises awareness and fosters acceptance through outreach programs.
                </p>
              </div>

              {/* Post-Crisis Care and Recovery */}
              <div>
                <img
                  src="https://images.pexels.com/photos/8199562/pexels-photo-8199562.jpeg?auto=compress&cs=tinysrgb&w=400"
                  alt="Post-Crisis Care and Recovery"
                  className="w-full h-56 object-cover mb-4"
                />
                <h4 className="text-lg font-bold text-gray-900 mb-2">Post-Crisis Care and Recovery</h4>
                <p className="text-gray-700">
                  From conflict zones to post-disaster areas, children often lack access to consistent neurological care. ACNA supports long-term recovery efforts and follow-up care models.
                </p>
              </div>
            </div>

            {/* Button */}
            <div className="mt-12 flex">
              <button className="border-2 border-orange-600 text-gray-800 px-6 py-3 text-sm font-bold tracking-wider hover:bg-orange-600 hover:text-white transition-all duration-300 rounded-lg">
                SEE MORE
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Our Work Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">Explore Our Work</h2>
            <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {articles.map((article, index) => (
              <article key={index} className="group cursor-pointer">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-64 object-cover mb-4 group-hover:opacity-90 transition-opacity rounded-lg"
                />
                <div className="text-sm text-gray-500 mb-2">{article.date}</div>
                <h3 className="text-xl font-medium text-orange-600 group-hover:text-orange-700 transition-colors">
                  {article.title}
                </h3>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default WhatWeDo;