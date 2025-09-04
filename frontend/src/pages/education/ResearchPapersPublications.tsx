import React, { useState, useEffect } from 'react';
import { ArrowRight, Download, ExternalLink } from 'lucide-react';
import { publicationsApi, Publication } from '../../services/publicationsAPI';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ResearchPapersPage = () => {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [isLoadingPublications, setIsLoadingPublications] = useState(true);
  const [publicationsError, setPublicationsError] = useState<string | null>(null);

  const researchPapers = [
    {
      title: "Epidemiology of pediatric epilepsy in sub-Saharan Africa: A multi-center prospective study",
      authors: "Dr. Amara Kone, Dr. Michael Okonkwo, Dr. Sarah Mwangi",
      journal: "African Journal of Neurological Sciences",
      date: "July 2025",
      doi: "10.1016/j.ajns.2025.07.001",
      excerpt: "This comprehensive study across 12 African countries reveals critical insights into the prevalence, risk factors, and treatment gaps for pediatric epilepsy, providing evidence-based recommendations for improved care strategies."
    },
    {
      title: "Novel biomarkers for early detection of cerebral palsy in African infants: A longitudinal cohort study",
      authors: "Dr. Fatima Al-Rashid, Dr. James Mbeki, Dr. Linda Asante",
      journal: "The Lancet Child & Adolescent Health",
      date: "June 2025",
      doi: "10.1016/S2352-4642(25)00234-1",
      excerpt: "Identification of culturally-relevant biomarkers that can predict cerebral palsy development in African infants, enabling earlier intervention and improved developmental outcomes."
    },
    {
      title: "Impact of malnutrition on neurodevelopmental outcomes: 10-year longitudinal analysis",
      authors: "Dr. Kwame Asiedu, Dr. Zara Hassan, Dr. Robert Nyong",
      journal: "Pediatric Neurology International",
      date: "May 2025",
      doi: "10.1002/pni.2025.123456",
      excerpt: "Long-term study examining the relationship between early childhood malnutrition and neurological development, with implications for intervention programs across Africa."
    },
    {
      title: "Telemedicine in pediatric neurology: Bridging healthcare gaps in rural Africa",
      authors: "Dr. Grace Nkomo, Dr. Ahmed El-Sayed, Dr. Mary Wanjiku",
      journal: "Digital Health Africa",
      date: "April 2025",
      doi: "10.1089/dha.2025.0087",
      excerpt: "Evaluation of telemedicine implementation across rural African healthcare settings, demonstrating significant improvements in access to specialist neurological care for children."
    },
    {
      title: "Traditional medicine integration in pediatric epilepsy management: A systematic review",
      authors: "Dr. Blessing Okoro, Dr. Kenji Nakamura, Dr. Aisha Diallo",
      journal: "Complementary Medicine Research",
      date: "March 2025",
      doi: "10.1159/000531847",
      excerpt: "Comprehensive analysis of traditional healing practices in epilepsy management across Africa, identifying safe integration opportunities with conventional medical treatment."
    },
    {
      title: "Healthcare worker training effectiveness in pediatric neurological emergencies",
      authors: "Dr. Samuel Osei, Dr. Priya Sharma, Dr. John Kamau",
      journal: "Medical Education Today",
      date: "February 2025",
      doi: "10.1016/j.medt.2025.02.009",
      excerpt: "Assessment of training program outcomes for primary healthcare workers in managing neurological emergencies in children, with recommendations for curriculum enhancement."
    }
  ];

  const activeResearch = [
    {
      type: "ONGOING STUDY",
      title: "Multi-center Trial: Anti-seizure Medication Efficacy in African Children",
      principal_investigator: "Dr. Michael Okonkwo",
      duration: "2024-2027",
      image: "https://images.pexels.com/photos/3985163/pexels-photo-3985163.jpeg?auto=compress&cs=tinysrgb&w=400",
      category: "Clinical Trial",
      funding: "WHO Research Grant",
      status: "Active"
    },
    {
      type: "COHORT STUDY",
      title: "Genetic Markers of Neurodevelopmental Disorders in African Populations",
      principal_investigator: "Dr. Fatima Al-Rashid",
      duration: "2023-2026",
      image: "https://images.pexels.com/photos/4173239/pexels-photo-4173239.jpeg?auto=compress&cs=tinysrgb&w=400",
      category: "Genetic Research",
      funding: "African Research Foundation",
      status: "Active"
    },
    {
      type: "EPIDEMIOLOGICAL",
      title: "Stroke in Children: Prevalence and Risk Factors Across 20 African Countries",
      principal_investigator: "Dr. Sarah Mwangi",
      duration: "2025-2028",
      image: "https://images.pexels.com/photos/5726794/pexels-photo-5726794.jpeg?auto=compress&cs=tinysrgb&w=400",
      category: "Population Health",
      funding: "Gates Foundation",
      status: "Active"
    },
    {
      type: "INTERVENTION",
      title: "Community-based Rehabilitation Programs for Cerebral Palsy",
      principal_investigator: "Dr. Grace Nkomo",
      duration: "2024-2026",
      image: "https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=400",
      category: "Rehabilitation",
      funding: "UNICEF Partnership",
      status: "Active"
    }
  ];

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        setIsLoadingPublications(true);
        setPublicationsError(null);
        const data = await publicationsApi.getAll({ status: 'Published' });
        setPublications(data.slice(0, 4)); // Show only first 4 publications
      } catch (err) {
        setPublicationsError('Failed to load publications');
        console.error('Error fetching publications:', err);
      } finally {
        setIsLoadingPublications(false);
      }
    };

    fetchPublications();
  }, []);

  const handlePublicationClick = (publicationId: number) => {
    window.location.href = `/publications/${publicationId}`;
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-6">Research Papers & Publications</h1>
          <p className="text-xl md:text-2xl text-gray-700 font-light max-w-3xl mx-auto">
            Explore cutting-edge research, active studies, and comprehensive publications advancing pediatric neurology across Africa.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          
          {/* Recent Research Papers Section - First */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">Recent Research Papers</h2>
              <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Latest peer-reviewed research papers and studies published by ACNA members and collaborating institutions.
              </p>
            </div>

            <div className="space-y-8 mb-12">
              {researchPapers.map((paper, index) => (
                <div key={index} className="border-l-4 border-red-600 pl-6 hover:bg-gray-50 transition-colors duration-200 py-6 border-b border-gray-100 last:border-b-0">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-900 leading-tight max-w-4xl">
                      <a href="#" className="hover:text-red-600 transition-colors">
                        {paper.title}
                      </a>
                    </h3>
                    <div className="flex gap-2 ml-4">
                      <button className="p-2 text-gray-600 hover:text-red-600 transition-colors" title="Download PDF">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:text-red-600 transition-colors" title="External Link">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Authors:</span> {paper.authors}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Published in:</span> {paper.journal} | {paper.date}
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    <span className="font-medium">DOI:</span> {paper.doi}
                  </div>
                  <p className="text-gray-700 leading-relaxed text-sm mb-3">{paper.excerpt}</p>
                  <a href="#" className="text-red-600 text-sm font-medium inline-flex items-center hover:text-red-700">
                    READ FULL PAPER <ArrowRight className="ml-1 w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>

            <div className="text-center">
              <button className="border-2 border-orange-600 text-orange-600 px-6 py-2 sm:px-8 sm:py-3 font-medium hover:bg-orange-600 hover:text-white transition-all duration-300 uppercase tracking-wide rounded text-sm sm:text-base">
                View All Research Papers
              </button>
            </div>
          </div>

          {/* Active Research Projects Section - Second */}
          <section id="active-research" className="mb-16">
            <div className="mb-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">Active Research Projects</h2>
                <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Ongoing research initiatives and studies currently being conducted across African institutions.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-12">
                {activeResearch.map((project, index) => (
                  <div key={index} className="group cursor-pointer hover:bg-gray-50 transition-colors duration-200 p-6 rounded-lg border border-gray-200">
                    <div className="relative mb-4 overflow-hidden rounded">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 left-2">
                        <span className="bg-red-600 text-white px-2 py-1 text-xs font-bold uppercase tracking-wide rounded">
                          {project.type}
                        </span>
                      </div>
                      <div className="absolute top-2 right-2">
                        <span className="bg-green-600 text-white px-2 py-1 text-xs font-medium rounded">
                          {project.status || 'Active'}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-red-600 font-medium text-xs uppercase">{project.category}</p>
                      <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-red-600 transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        <span className="font-medium">Principal Investigator:</span> {project.principal_investigator}
                      </p>
                      <p className="text-gray-600 text-sm">
                        <span className="font-medium">Duration:</span> {project.duration}
                      </p>
                      <p className="text-gray-600 text-sm">
                        <span className="font-medium">Funding:</span> {project.funding}
                      </p>
                      <a href="#" className="text-red-600 text-sm font-medium inline-flex items-center hover:text-red-700 pt-2">
                        VIEW PROJECT DETAILS <ArrowRight className="ml-1 w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            
              <div className="text-center">
                <button className="border-2 border-orange-600 text-orange-600 px-6 py-2 sm:px-8 sm:py-3 font-medium hover:bg-orange-600 hover:text-white transition-all duration-300 uppercase tracking-wide rounded text-sm sm:text-base">
                  View All Active Research
                </button>
              </div>
            </div>
          </section>

          {/* Publications & Resources Section - Third */}
          <section id="publications-resources">
            <div>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">Publications & Resources</h2>
                <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Clinical guidelines, educational materials, policy briefs, and other resources for healthcare professionals.
                </p>
              </div>

              {isLoadingPublications ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner />
                </div>
              ) : publicationsError ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-red-600 mb-4">{publicationsError}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md font-medium transition-colors duration-300"
                  >
                    Try Again
                  </button>
                </div>
              ) : publications.length > 0 ? (
                <>
                  <div className="grid md:grid-cols-2 gap-8 mb-12">
                    {publications.map((publication) => (
                      <div 
                        key={publication.id} 
                        className="group cursor-pointer flex gap-4 hover:bg-gray-50 transition-colors duration-200 p-4 rounded-lg"
                        onClick={() => handlePublicationClick(publication.id)}
                      >
                        <div className="relative flex-shrink-0 w-24 h-24 overflow-hidden rounded">
                          <img
                            src={publication.imageUrl}
                            alt={publication.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-1 left-1">
                            <span className="bg-red-600 text-white px-2 py-0.5 text-xs font-bold uppercase tracking-wide">
                              {publication.type}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-start">
                            <p className="text-red-600 font-medium text-xs uppercase">{publication.category}</p>
                            <span className="bg-green-100 text-green-800 px-2 py-0.5 text-xs font-medium rounded">
                              {publication.accessType}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-gray-900 leading-tight group-hover:text-red-600 transition-colors">
                            {publication.title}
                          </h3>
                          <p className="text-gray-600 text-sm">{publication.date}</p>
                          <p className="text-gray-700 text-sm line-clamp-2">{publication.excerpt}</p>
                          <div className="flex gap-3 pt-1">
                            <span className="text-red-600 text-sm font-medium inline-flex items-center hover:text-red-700">
                              READ MORE <ArrowRight className="ml-1 w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-center">
                    <button 
                      onClick={() => window.location.href = '/publications'}
                      className="border-2 border-orange-600 text-orange-600 px-6 py-2 sm:px-8 sm:py-3 font-medium hover:bg-orange-600 hover:text-white transition-all duration-300 uppercase tracking-wide rounded text-sm sm:text-base"
                    >
                      View All Publications
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Publications Available</h3>
                  <p className="text-gray-600">No publications are available at this time. Please check back later.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
};

export default ResearchPapersPage;