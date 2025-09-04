import React, { useState } from 'react';
import { 
  Calendar, 
  ChevronLeft,
  FileText,
  User,
  Globe,
  BookOpen,
  Quote,
  Award,
  Building,
  Mail,
  Tag,
  ArrowRight
} from 'lucide-react';

// Mock data
const mockPaper = {
  id: 1,
  title: "Epidemiology of pediatric epilepsy in sub-Saharan Africa: A multi-center prospective study",
  authors: ["Dr. Amara Kone", "Dr. Michael Okonkwo", "Dr. Sarah Mwangi"],
  correspondingAuthor: "Dr. Amara Kone",
  correspondingEmail: "amara.kone@university.edu",
  affiliations: [
    "University of Ghana Medical School, Accra, Ghana",
    "University of Nigeria Teaching Hospital, Enugu, Nigeria", 
    "University of Nairobi School of Medicine, Nairobi, Kenya"
  ],
  journal: "African Journal of Neurological Sciences",
  publishDate: "July 15, 2025",
  keywords: ["pediatric epilepsy", "sub-Saharan Africa", "epidemiology", "prospective study", "treatment gaps"],
  abstract: `Background: Pediatric epilepsy represents a significant neurological burden in sub-Saharan Africa, yet comprehensive epidemiological data remains limited. This study aimed to determine the prevalence, clinical characteristics, and treatment gaps of pediatric epilepsy across multiple African countries.

Methods: We conducted a multi-center prospective study across 12 countries in sub-Saharan Africa from January 2023 to December 2024. Children aged 1-18 years with confirmed epilepsy were enrolled from participating centers. Data collection included demographic information, seizure characteristics, electroencephalographic findings, treatment history, and socioeconomic factors.

Results: A total of 3,847 children were enrolled across all centers. The overall prevalence of active epilepsy was 8.2 per 1,000 children (95% CI: 7.8-8.6). Focal seizures were most common (52.3%), followed by generalized tonic-clonic seizures (31.7%). Treatment gap was identified in 64% of cases, with significant variations between urban (45%) and rural (78%) populations. Malnutrition was present in 38% of cases and associated with increased seizure frequency.

Conclusions: This study reveals a high burden of pediatric epilepsy in sub-Saharan Africa with substantial treatment gaps, particularly in rural areas. These findings underscore the urgent need for improved healthcare infrastructure, training programs, and accessible treatment options to address this critical public health challenge.`,
  fullText: `This comprehensive multi-center study represents the largest prospective investigation of pediatric epilepsy in sub-Saharan Africa to date. The research involved collaboration between 24 institutions across 12 countries, providing unprecedented insights into the epidemiological landscape of pediatric epilepsy in the region.

The study methodology employed standardized diagnostic criteria and data collection protocols developed specifically for the African context. All participating centers underwent extensive training to ensure consistency in case identification, clinical assessment, and data recording procedures.

Key findings include significant disparities in treatment access between urban and rural populations, with rural children experiencing substantially higher treatment gaps. The study also identified several region-specific risk factors and clinical presentations that differ from patterns observed in developed countries.

These results have important implications for healthcare policy development, resource allocation, and the design of targeted intervention programs across sub-Saharan Africa.`,
  ethicsStatement: "This study was approved by institutional review boards at all participating centers",
  dataAvailability: "De-identified data are available upon reasonable request to the corresponding author",
  conflictOfInterest: "The authors declare no competing interests",
  references: [
    "World Health Organization. Epilepsy: a public health imperative. Geneva: WHO Press; 2019.",
    "Ngugi AK, Bottomley C, Kleinschmidt I, et al. Estimation of the burden of active and life-time epilepsy: a meta-analytic approach. Epilepsia. 2010;51(5):883-890.",
    "Ba-Diop A, Marin B, Druet-Cabanac M, et al. Epidemiology, causes, and treatment of epilepsy in sub-Saharan Africa. Lancet Neurol. 2014;13(10):1029-1044."
  ]
};

const RelatedPapers = [
  {
    title: "Novel biomarkers for early detection of cerebral palsy in African infants: A longitudinal cohort study",
    authors: "Dr. Fatima Al-Rashid, Dr. James Mbeki, Dr. Linda Asante",
    journal: "The Lancet Child & Adolescent Health",
    date: "June 2025"
  },
  {
    title: "Impact of malnutrition on neurodevelopmental outcomes: 10-year longitudinal analysis",
    authors: "Dr. Kwame Asiedu, Dr. Zara Hassan, Dr. Robert Nyong",
    journal: "Pediatric Neurology International", 
    date: "May 2025"
  },
  {
    title: "Telemedicine in pediatric neurology: Bridging healthcare gaps in rural Africa",
    authors: "Dr. Grace Nkomo, Dr. Ahmed El-Sayed, Dr. Mary Wanjiku",
    journal: "Digital Health Africa",
    date: "April 2025"
  }
];

const ResearchPaperDetailPage = () => {
  const [activeTab, setActiveTab] = useState('abstract');
  const [paper] = useState(mockPaper);
  
  const formatAuthors = (authors) => {
    if (authors.length <= 3) {
      return authors.join(', ');
    }
    return `${authors.slice(0, 3).join(', ')}, et al.`;
  };

  const handleBack = () => {
    console.log('Navigate back to research papers');
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Back Navigation */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button 
            onClick={handleBack}
            className="flex items-center text-red-600 hover:text-red-700 font-medium"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Research Papers
          </button>
        </div>
      </div>

      {/* Hero Section - Clean without metrics or buttons */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="mb-6">
            <span className="text-red-600 font-medium text-sm uppercase tracking-wide">
              RESEARCH PAPER
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-6 leading-tight">
            {paper.title}
          </h1>

          <div className="flex flex-wrap justify-center items-center gap-6 text-gray-600">
            <div className="flex items-center">
              <User className="w-5 h-5 mr-2 text-red-600" />
              <span className="font-medium">{formatAuthors(paper.authors)}</span>
            </div>
            <div className="flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-red-600" />
              <span className="font-medium">{paper.journal}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-red-600" />
              <span className="font-medium">{paper.publishDate}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs - Only 2 tabs */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4">
          <nav className="flex space-x-8">
            {[
              { key: 'abstract', label: 'Abstract' },
              { key: 'authors', label: 'Authors & Affiliations' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.key
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </section>

      {/* Tab Content */}
      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4">
          {activeTab === 'abstract' && (
            <div className="space-y-8">
              {/* Abstract */}
              <div>
                <h2 className="text-2xl font-light text-gray-900 mb-6 flex items-center">
                  <Quote className="w-6 h-6 mr-2 text-red-600" />
                  Abstract
                </h2>
                <div className="prose max-w-none">
                  <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-red-600">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {paper.abstract}
                    </p>
                  </div>
                </div>
              </div>

              {/* Keywords */}
              <div>
                <h3 className="text-xl font-light text-gray-900 mb-4">Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {paper.keywords.map((keyword, index) => (
                    <span key={index} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      <Tag className="w-3 h-3" />
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              {/* Key Findings - Paragraph format like abstract */}
              <div>
                <h3 className="text-xl font-light text-gray-900 mb-4">Key Findings</h3>
                <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-600">
                  <p className="text-gray-700 leading-relaxed">
                    This multi-center study across 12 countries in sub-Saharan Africa revealed a high prevalence 
                    of active pediatric epilepsy at 8.2 per 1,000 children. The research identified significant 
                    treatment gaps affecting 64% of cases, with substantial disparities between urban and rural 
                    populations. Rural areas showed particularly concerning treatment gaps at 78% compared to 45% 
                    in urban settings. The study enrolled 3,847 children and found that focal seizures were most 
                    common at 52.3%, followed by generalized tonic-clonic seizures at 31.7%. Malnutrition was 
                    present in 38% of cases and showed strong association with increased seizure frequency, 
                    highlighting the interconnection between socioeconomic factors and neurological outcomes.
                  </p>
                </div>
              </div>

              {/* Full Text Preview */}
              <div>
                <h3 className="text-xl font-light text-gray-900 mb-4">Full Text (Preview)</h3>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {paper.fullText}
                  </p>
                  <button className="text-red-600 hover:text-red-700 font-medium flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Read Full Paper
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'authors' && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-4">
                  Authors & Affiliations
                </h2>
                <p className="text-gray-600">
                  Meet the researchers who contributed to this study
                </p>
              </div>

              {/* Corresponding Author */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Mail className="w-5 h-5 mr-2 text-red-600" />
                  Corresponding Author
                </h3>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">{paper.correspondingAuthor}</h4>
                    <a 
                      href={`mailto:${paper.correspondingEmail}`}
                      className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1"
                    >
                      <Mail className="w-4 h-4" />
                      {paper.correspondingEmail}
                    </a>
                  </div>
                </div>
              </div>

              {/* All Authors */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">All Authors</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paper.authors.map((author, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{author}</h4>
                          <p className="text-sm text-gray-600">Author {index + 1}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Affiliations */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Building className="w-5 h-5 mr-2 text-red-600" />
                  Institutional Affiliations
                </h3>
                <div className="space-y-3">
                  {paper.affiliations.map((affiliation, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                      <div className="flex items-start">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs font-medium rounded mr-3 mt-0.5">
                          {index + 1}
                        </span>
                        <p className="text-gray-700">{affiliation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ethics Statement */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Ethics Statement</h3>
                <p className="text-gray-700 text-sm">{paper.ethicsStatement}</p>
              </div>

              {/* Data Availability */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Data Availability</h3>
                <p className="text-gray-700 text-sm">{paper.dataAvailability}</p>
              </div>

              {/* Conflict of Interest */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Conflict of Interest</h3>
                <p className="text-gray-700 text-sm">{paper.conflictOfInterest}</p>
              </div>

              {/* References */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">References (Sample)</h3>
                <div className="space-y-2">
                  {paper.references.map((reference, index) => (
                    <div key={index} className="text-sm text-gray-700 pb-2 border-b border-gray-100 last:border-b-0">
                      <span className="font-medium">{index + 1}.</span> {reference}
                    </div>
                  ))}
                  <div className="text-center pt-4">
                    <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                      View All References ({paper.references.length + 32})
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Related Papers Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-4">
              Related Research Papers
            </h2>
            <p className="text-gray-600">
              Other studies and publications in pediatric neurology that might interest you
            </p>
          </div>

          <div className="space-y-6">
            {RelatedPapers.map((relatedPaper, index) => (
              <div 
                key={index} 
                className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                onClick={() => console.log(`Navigate to paper ${index}`)}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 leading-tight max-w-3xl hover:text-red-600 transition-colors">
                    {relatedPaper.title}
                  </h3>
                  <ArrowRight className="w-5 h-5 text-gray-400 ml-4 flex-shrink-0" />
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Authors:</span> {relatedPaper.authors}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Published in:</span> {relatedPaper.journal} | {relatedPaper.date}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <button className="border-2 border-orange-600 text-orange-600 px-6 py-3 font-medium hover:bg-orange-600 hover:text-white transition-all duration-300 uppercase tracking-wide rounded">
              View All Research Papers
            </button>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-red-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-light text-white mb-6">
            Contribute to Research
          </h2>
          <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
            Join the African Child Neurology Association and be part of advancing pediatric neurology research across Africa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-red-600 px-8 py-3 rounded font-bold hover:bg-gray-100 transition-colors uppercase tracking-wide">
              Submit Research
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded font-bold hover:bg-white hover:text-red-600 transition-colors uppercase tracking-wide">
              Join ACNA
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ResearchPaperDetailPage;