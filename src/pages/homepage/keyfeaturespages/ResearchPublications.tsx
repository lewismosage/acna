import { useState } from 'react';
import ScrollToTop from '../../../components/common/ScrollToTop';

interface AccordionItem {
  title: string;
  content: string;
}

interface Article {
  title: string;
  date: string;
  imageUrl: string;
}

const ResearchPublications = () => {
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  const accordionItems: AccordionItem[] = [
    {
      title: "Clinical Research Studies",
      content: "Multi-center studies examining epidemiology, treatment outcomes, and novel therapeutic approaches for pediatric neurological conditions across African populations."
    },
    {
      title: "Evidence-Based Guidelines",
      content: "Comprehensive clinical practice guidelines developed specifically for African healthcare settings, addressing diagnosis, treatment, and management of childhood neurological disorders."
    },
    {
      title: "Educational Resources",
      content: "Training materials, case studies, and educational modules designed to enhance knowledge and skills in pediatric neurology for healthcare professionals at all levels."
    },
    {
      title: "Research Collaboration Platform",
      content: "Digital platform connecting researchers across Africa to facilitate data sharing, joint publications, and collaborative research initiatives in child neurology."
    }
  ];  

  const articles: Article[] = [
    {
      title: "Epilepsy prevalence and treatment gaps in sub-Saharan Africa: A systematic review",
      date: "January 12, 2025",
      imageUrl: "https://images.pexels.com/photos/3985163/pexels-photo-3985163.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
      title: "Novel biomarkers for early detection of cerebral palsy in African infants",
      date: "December 3, 2024",
      imageUrl: "https://images.pexels.com/photos/4173239/pexels-photo-4173239.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
      title: "Impact of malnutrition on neurodevelopment: 10-year longitudinal study",
      date: "November 18, 2024",
      imageUrl: "https://images.pexels.com/photos/5726794/pexels-photo-5726794.jpeg?auto=compress&cs=tinysrgb&w=600"
    }
  ];

  return (
    <div className="bg-white">
      <ScrollToTop />
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-6">Research & Publications</h1>
          <p className="text-xl md:text-2xl text-gray-700 font-light max-w-3xl mx-auto">
            Access cutting-edge research, clinical guidelines, and educational resources.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="space-y-6 text-gray-700 leading-relaxed text-lg">
            <p>
              ACNA is at the forefront of advancing scientific knowledge in pediatric neurology across Africa. Our research initiatives address critical gaps in understanding neurological conditions affecting African children, from epidemiological studies to innovative treatment approaches.
            </p>

            <p>
              Through collaborative research networks spanning the continent, we generate evidence that informs clinical practice, shapes health policy, and improves outcomes for children with neurological conditions. Our publications contribute to the global body of knowledge while addressing Africa-specific challenges and contexts.
            </p>

            <p>
              We are committed to making research accessible to all healthcare professionals, regardless of their location or resources. Our open-access publications, clinical guidelines, and educational materials are designed to bridge the knowledge gap and enhance care delivery across diverse healthcare settings.
            </p>

            <p>
              As we build a robust evidence base for pediatric neurology in Africa, our research efforts focus on practical solutions that can be implemented in real-world clinical settings, ensuring that scientific advances translate into improved care for every child.
            </p>
          </div>
        </div>
      </section>

      {/* Research Focus Areas Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">Research Focus Areas</h2>
            <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg">
              Explore our comprehensive research portfolio addressing the most pressing challenges in{' '}
              <span className="text-orange-600 font-medium">pediatric neurology</span> across the African continent.
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

          {/* Active Research Projects Section */}
          <div className="mb-16">
            <h3 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-2">Active Research Projects</h3>
            <div className="w-16 h-1 bg-red-600 mb-6"></div>
            <p className="text-gray-600 mb-8 max-w-3xl text-lg">
              Discover our ongoing research initiatives that are{' '}
              <span className="text-orange-600 font-medium">transforming understanding</span> of pediatric neurological conditions in African populations.
            </p>
            
            <div className="grid md:grid-cols-3 gap-12">
              {/* Epidemiological Studies */}
              <div>
                <img
                  src="https://images.pexels.com/photos/3985163/pexels-photo-3985163.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Epidemiological Studies"
                  className="w-full h-56 object-cover mb-4 rounded-lg"
                />
                <h4 className="text-lg font-bold text-gray-900 mb-2">Epidemiological Studies</h4>
                <p className="text-gray-700">
                  Large-scale population studies mapping the prevalence, risk factors, and burden of neurological conditions in children across different African regions and communities.
                </p>
              </div>

              {/* Treatment Efficacy Trials */}
              <div>
                <img
                  src="https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Treatment Efficacy Trials"
                  className="w-full h-56 object-cover mb-4 rounded-lg"
                />
                <h4 className="text-lg font-bold text-gray-900 mb-2">Treatment Efficacy Trials</h4>
                <p className="text-gray-700">
                  Clinical trials evaluating the effectiveness of new and existing treatments for epilepsy, cerebral palsy, and other neurological conditions in African healthcare settings.
                </p>
              </div>

              {/* Health Systems Research */}
              <div>
                <img
                  src="https://images.pexels.com/photos/5726794/pexels-photo-5726794.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Health Systems Research"
                  className="w-full h-56 object-cover mb-4 rounded-lg"
                />
                <h4 className="text-lg font-bold text-gray-900 mb-2">Health Systems Research</h4>
                <p className="text-gray-700">
                  Studies examining healthcare delivery models, training programs, and system strengthening approaches to improve access to pediatric neurological care.
                </p>
              </div>
            </div>
            <div className="mt-12 flex">
              <button className="border-2 border-orange-600 text-gray-800 px-6 py-3 text-sm font-bold tracking-wider hover:bg-orange-600 hover:text-white transition-all duration-300 rounded-lg">
                VIEW ALL PROJECTS
              </button>
            </div>
          </div>

          {/* Publications & Resources Section */}
          <div className="mb-16">
            <h3 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-2">Publications & Resources</h3>
            <div className="w-16 h-1 bg-red-600 mb-6"></div>
            <p className="text-gray-600 mb-8 max-w-3xl text-lg">
              Access our comprehensive library of{' '}
              <span className="text-orange-600 font-medium">peer-reviewed publications, guidelines, and educational materials</span> designed for healthcare professionals across Africa.
            </p>

            <div className="grid md:grid-cols-3 gap-12">
              {/* Journal Publications */}
              <div>
                <img
                  src="https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Journal Publications"
                  className="w-full h-56 object-cover mb-4 rounded-lg"
                />
                <h4 className="text-lg font-bold text-gray-900 mb-2">Journal Publications</h4>
                <p className="text-gray-700">
                  Peer-reviewed articles published in international journals, contributing original research findings and clinical insights to the global pediatric neurology community.
                </p>
              </div>

              {/* Clinical Guidelines */}
              <div>
                <img
                  src="https://images.pexels.com/photos/4386339/pexels-photo-4386339.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Clinical Guidelines"
                  className="w-full h-56 object-cover mb-4 rounded-lg"
                />
                <h4 className="text-lg font-bold text-gray-900 mb-2">Clinical Guidelines</h4>
                <p className="text-gray-700">
                  Evidence-based practice guidelines tailored for African healthcare contexts, providing clear recommendations for diagnosis and management of pediatric neurological conditions.
                </p>
              </div>

              {/* Educational Materials */}
              <div>
                <img
                  src="https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Educational Materials"
                  className="w-full h-56 object-cover mb-4 rounded-lg"
                />
                <h4 className="text-lg font-bold text-gray-900 mb-2">Educational Materials</h4>
                <p className="text-gray-700">
                  Interactive learning modules, case studies, and training resources designed to enhance clinical skills and knowledge in pediatric neurology for healthcare professionals.
                </p>
              </div>
            </div>

            {/* Button */}
            <div className="mt-12 flex">
              <button className="border-2 border-orange-600 text-gray-800 px-6 py-3 text-sm font-bold tracking-wider hover:bg-orange-600 hover:text-white transition-all duration-300 rounded-lg">
                ACCESS LIBRARY
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Publications Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">Recent Publications</h2>
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

export default ResearchPublications;