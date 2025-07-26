import React from 'react';
import { ArrowRight, Mail } from 'lucide-react';

const LatestNewsPage = () => {
  const pressReleases = [
    {
      title: "ACNA celebrates the African Child Neurology Day and launches community outreach programs",
      date: "April 26, 2025",
      excerpt: "The African Child Neurology Association marks this important day by launching comprehensive community outreach programs across 15 African countries to improve access to neurological care for children."
    },
    {
      title: "ACNA Mourns the Passing of Former President Dr. Sarah Mwangi",
      date: "March 18, 2025",
      excerpt: "The African Child Neurology Association mourns the loss of Dr. Sarah Mwangi, former president and pioneering advocate for child neurological health across Africa."
    },
    {
      title: "ACNA Recognized with Ghana's 2024 Health Innovation Award for Epilepsy Care Designation",
      date: "February 15, 2025",
      excerpt: "The Association receives prestigious recognition for groundbreaking work in epilepsy care and innovative treatment approaches for children across West Africa."
    },
    {
      title: "ACNA Appoints New Board Chair, Welcomes New Member Organizations",
      date: "February 1, 2025",
      excerpt: "The organization welcomes Dr. Michael Okonkwo as new Board Chair and announces partnerships with three new member organizations from East Africa."
    },
    {
      title: "ACNA Launches Telemedicine Initiative for Remote Neurological Consultations",
      date: "January 22, 2025",
      excerpt: "New telemedicine program connects specialist neurologists with healthcare workers in remote areas, improving access to expert consultation for children with neurological conditions."
    },
    {
      title: "ACNA Research Shows Significant Improvement in Early Diagnosis Rates",
      date: "January 10, 2025",
      excerpt: "Multi-country study reveals 60% improvement in early diagnosis rates of pediatric neurological conditions following ACNA's training programs for primary healthcare workers."
    }
  ];

  const newsArticles = [
    {
      type: "ACNA JOURNAL",
      title: "Building Stronger Pediatric Neurology Services Across Africa",
      date: "July 15, 2025",
      image: "https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=400",
      category: "Healthcare Systems"
    },
    {
      type: "NEUROLOGY REPORT",
      title: "How Nutrition Impacts Brain Development in African Children",
      date: "June 30, 2025",
      image: "https://images.pexels.com/photos/3184192/pexels-photo-3184192.jpeg?auto=compress&cs=tinysrgb&w=400",
      category: "Neurodevelopment & Nutrition"
    },
    {
      type: "ACNA NEWS",
      title: "Remembering Dr. Sarah Mwangi: A Legacy of Neurological Advocacy",
      date: "June 18, 2025",
      image: "https://images.pexels.com/photos/1181438/pexels-photo-1181438.jpeg?auto=compress&cs=tinysrgb&w=400",
      category: "Leadership & Legacy"
    },
    {
      type: "BULLETIN",
      title: "Bridging the Gap: Child Neurology Training in Sub-Saharan Africa",
      date: "June 5, 2025",
      image: "https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=400",
      category: "Medical Education"
    }
  ];  

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-6">Latest News & Updates</h1>
          <p className="text-xl md:text-2xl text-gray-700 font-light max-w-3xl mx-auto">
            Stay informed about the latest developments in child neurology across Africa and our ongoing efforts to improve neurological care for children.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          
          {/* News About ACNA Section - First */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">News About ACNA</h2>
              <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Guest articles on other sources referencing our work to end hunger and poverty.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {newsArticles.map((article, index) => (
                <div key={index} className="group cursor-pointer flex gap-4 hover:bg-gray-50 transition-colors duration-200 p-4 rounded-lg">
                  <div className="relative flex-shrink-0 w-24 h-24 overflow-hidden rounded">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-1 left-1">
                      <span className="bg-red-600 text-white px-2 py-0.5 text-xs font-bold uppercase tracking-wide">
                        {article.type}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-red-600 font-medium text-xs uppercase">{article.category}</p>
                    <h3 className="text-base font-bold text-gray-900 leading-tight group-hover:text-red-600 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 text-sm">{article.date}</p>
                    <a href="#" className="text-red-600 text-sm font-medium inline-flex items-center hover:text-red-700">
                      READ MORE <ArrowRight className="ml-1 w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <button className="border-2 border-orange-600 text-orange-600 px-6 py-2 sm:px-8 sm:py-3 font-medium hover:bg-orange-600 hover:text-white transition-all duration-300 uppercase tracking-wide rounded text-sm sm:text-base">
                View All News About ACNA
              </button>
            </div>
          </div>

          {/* Press Releases Section - Second */}
          <div>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">Press Releases</h2>
              <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Check out the latest press releases from African Child Neurology Association.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {pressReleases.map((release, index) => (
                <div key={index} className="border-l-4 border-red-600 pl-6 hover:bg-gray-50 transition-colors duration-200 py-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                    <a href="#" className="hover:text-red-600 transition-colors">
                      {release.title}
                    </a>
                  </h3>
                  <p className="text-red-600 font-medium text-sm mb-3">{release.date}</p>
                  <p className="text-gray-700 leading-relaxed text-sm">{release.excerpt}</p>
                </div>
              ))}
            </div>

            <div className="text-center">
              <button className="border-2 border-orange-600 text-orange-600 px-6 py-2 sm:px-8 sm:py-3 font-medium hover:bg-orange-600 hover:text-white transition-all duration-300 uppercase tracking-wide rounded text-sm sm:text-base">
                View All Press Releases
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-orange-600">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">SIGN UP FOR THE ACNA NEWSLETTER</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
          Subscribe to get updates on the latest in child neurology, healthcare equity, research breakthroughs, and advocacy efforts across Africa.
          </p>
          
          <div className="max-w-md mx-auto">
            <div className="relative mb-4">
              <input
                type="email"
                placeholder="Email address"
                className="w-full px-6 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button className="absolute right-2 top-2 bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors flex items-center">
                <Mail className="mr-2 h-4 w-4" />
                Subscribe
              </button>
            </div>
            
            <p className="text-sm text-orange-100 opacity-90">
              This site is protected by reCAPTCHA and the Google{' '}
              <a href="#" className="underline hover:text-white">Privacy Policy</a>, and{' '}
              <a href="#" className="underline hover:text-white">Terms of Service</a> apply. By submitting your email to subscribe, you agree to the ACNA's{' '}
              <a href="#" className="underline hover:text-white">Privacy & Cookies Notice</a>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LatestNewsPage;