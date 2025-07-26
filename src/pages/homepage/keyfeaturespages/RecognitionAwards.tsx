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

const RecognitionAwards = () => {
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  const accordionItems: AccordionItem[] = [
    {
      title: "Excellence in Clinical Care Award",
      content: "Recognizes outstanding dedication to patient care, innovative treatment approaches, and significant improvements in clinical outcomes for children with neurological conditions."
    },
    {
      title: "Research Innovation Award",
      content: "Honors groundbreaking research contributions that advance understanding of pediatric neurological conditions, with particular emphasis on studies relevant to African populations."
    },
    {
      title: "Community Impact Award",
      content: "Celebrates professionals who have made exceptional contributions to expanding access to neurological care in underserved communities across Africa."
    },
    {
      title: "Lifetime Achievement Award",
      content: "The highest honor bestowed upon individuals who have dedicated their careers to advancing pediatric neurology and mentoring the next generation of specialists."
    }
  ];

  const articles: Article[] = [
    {
      title: "Dr. Amina Hassan receives ACNA's highest honor for pioneering epilepsy research in East Africa",
      date: "November 20, 2024",
      imageUrl: "https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
      title: "Young Investigator Award winners present breakthrough findings at annual conference",
      date: "September 15, 2024",
      imageUrl: "https://images.pexels.com/photos/5726794/pexels-photo-5726794.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
      title: "Community champions: Five professionals honored for expanding rural neurology services",
      date: "August 3, 2024",
      imageUrl: "https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg?auto=compress&cs=tinysrgb&w=600"
    }
  ];

  return (
    <div className="bg-white">
      <ScrollToTop />
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-6">Recognition & Awards</h1>
          <p className="text-xl md:text-2xl text-gray-700 font-light max-w-3xl mx-auto">
            Celebrate excellence in child neurology research, clinical care, and advocacy.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="space-y-6 text-gray-700 leading-relaxed text-lg">
            <p>
              The African Child Neurology Association proudly recognizes the exceptional contributions of healthcare professionals, researchers, and advocates who are transforming pediatric neurological care across the continent. Our awards program celebrates innovation, dedication, and impact in advancing the field.
            </p>

            <p>
              Through our comprehensive recognition program, we honor those who have made significant breakthroughs in research, demonstrated excellence in clinical practice, and shown unwavering commitment to improving outcomes for children with neurological conditions throughout Africa.
            </p>

            <p>
              Our awards span multiple categories, recognizing achievements at every career stage from promising young investigators to seasoned professionals whose lifetime contributions have shaped the field. These accolades not only celebrate individual excellence but also inspire continued innovation and collaboration.
            </p>

            <p>
              Beyond individual recognition, our awards program highlights the collective progress being made across African pediatric neurology, showcasing success stories that demonstrate the transformative power of dedicated healthcare professionals working together to build a brighter future for children.
            </p>
          </div>
        </div>
      </section>

      {/* Award Categories Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">Award Categories</h2>
            <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg">
              Discover our prestigious awards that honor{' '}
              <span className="text-orange-600 font-medium">outstanding achievements</span> in pediatric neurology across research, clinical practice, and community service.
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

          {/* Recognition Section */}
          <div className="mb-16">
            <div className="mt-12 flex">
              <Link
              to="/awards"
              className="border-2 border-orange-600 text-gray-800 px-6 py-3 text-sm font-bold tracking-wider hover:bg-orange-600 hover:text-white transition-all duration-300 rounded-lg">
                EXPLORE MORE ON AWARDS
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Award Winners Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">Recent Award Winners</h2>
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

export default RecognitionAwards;