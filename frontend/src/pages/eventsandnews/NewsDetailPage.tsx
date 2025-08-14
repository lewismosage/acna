import React, { useState } from 'react';
import { 
  Calendar, 
  User, 
  Clock, 
  Share2, 
  ChevronLeft,
  Download,
  Mail,
  Phone,
  Globe,
  ExternalLink,
  Building,
  Tag,
  Eye,
  BookOpen,
  ArrowRight
} from 'lucide-react';

interface Author {
  name: string;
  title: string;
  organization: string;
  bio: string;
  imageUrl: string;
}

interface RelatedArticle {
  id: number;
  type: string;
  title: string;
  date: string;
  image: string;
  category: string;
  excerpt: string;
}

interface NewsArticleData {
  id: number;
  type: 'news' | 'press-release';
  category: string;
  title: string;
  subtitle?: string;
  date: string;
  readTime: string;
  views: number;
  imageUrl: string;
  content: {
    introduction: string;
    sections: {
      heading: string;
      content: string;
    }[];
    conclusion?: string;
  };
  author?: Author;
  tags: string[];
  source?: {
    name: string;
    url: string;
  };
  contact?: {
    name: string;
    email: string;
    phone: string;
  };
}

const NewsDetailPage = () => {
  const [activeTab, setActiveTab] = useState<'article' | 'about'>('article');

  // Sample news article data - in real app would come from router params or API
  const article: NewsArticleData = {
    id: 1,
    type: 'news',
    category: 'Healthcare Systems',
    title: "Building Stronger Pediatric Neurology Services Across Africa",
    subtitle: "How ACNA is transforming neurological care through innovative training programs and community partnerships",
    date: "July 15, 2025",
    readTime: "8 min read",
    views: 1247,
    imageUrl: "https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=800",
    content: {
      introduction: "The African Child Neurology Association (ACNA) continues to make significant strides in improving pediatric neurological care across the continent. Through innovative training programs, community partnerships, and policy advocacy, ACNA is addressing critical gaps in neurological healthcare for children in Africa.",
      sections: [
        {
          heading: "Addressing the Healthcare Gap",
          content: "Africa faces a significant shortage of pediatric neurologists, with fewer than 200 specialists serving over 400 million children across the continent. This critical gap has left many families without access to essential neurological care, leading to delayed diagnoses and limited treatment options for conditions such as epilepsy, cerebral palsy, and developmental disorders."
        },
        {
          heading: "Innovative Training Programs",
          content: "ACNA has launched comprehensive training programs that combine traditional medical education with modern telemedicine technologies. These programs have trained over 500 healthcare workers in the past year alone, focusing on early detection, basic management, and appropriate referral pathways for pediatric neurological conditions. The training emphasizes practical skills that can be implemented in resource-limited settings."
        },
        {
          heading: "Community-Based Care Models",
          content: "Recognizing that hospital-based care alone cannot address the continent's needs, ACNA has pioneered community-based care models that bring neurological services closer to families. These models involve training community health workers to identify early signs of neurological conditions and provide basic interventions while maintaining strong referral networks to specialist centers."
        },
        {
          heading: "Technology and Telemedicine",
          content: "The integration of telemedicine has revolutionized how neurological care is delivered across Africa. ACNA's telemedicine platform now connects over 50 healthcare facilities across 15 countries, enabling real-time consultations between primary care providers and specialist neurologists. This technology has reduced diagnosis times by an average of 60% and improved treatment outcomes significantly."
        },
        {
          heading: "Policy and Advocacy Efforts",
          content: "Beyond direct healthcare delivery, ACNA actively engages with government officials and international organizations to advocate for policies that support pediatric neurological health. Recent advocacy efforts have led to the inclusion of pediatric neurology services in national health insurance schemes in three African countries, making care more accessible to families who previously couldn't afford specialized treatment."
        }
      ],
      conclusion: "The work of ACNA demonstrates that with innovative approaches, strategic partnerships, and dedicated advocacy, it is possible to transform pediatric neurological care in Africa. As the organization continues to expand its programs and influence, thousands more children across the continent will gain access to the specialized care they need to thrive."
    },
    author: {
      name: "Dr. Fatima Hassan",
      title: "Senior Health Correspondent",
      organization: "African Medical Journal",
      bio: "Dr. Hassan is a respected health journalist with over 12 years of experience covering healthcare developments across Africa. She holds an MD from the University of Cape Town and has received multiple awards for her reporting on public health issues.",
      imageUrl: "https://images.pexels.com/photos/5407206/pexels-photo-5407206.jpeg?auto=compress&cs=tinysrgb&w=300"
    },
    tags: ["Pediatric Neurology", "Healthcare Systems", "Medical Training", "Telemedicine", "Community Health", "Africa"],
    source: {
      name: "African Medical Journal",
      url: "https://africanmedicaljournal.org"
    }
  };

  const pressRelease: NewsArticleData = {
    id: 2,
    type: 'press-release',
    category: 'Press Release',
    title: "ACNA celebrates the African Child Neurology Day and launches community outreach programs",
    date: "April 26, 2025",
    readTime: "5 min read",
    views: 892,
    imageUrl: "https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=800",
    content: {
      introduction: "The African Child Neurology Association (ACNA) marks the African Child Neurology Day by launching comprehensive community outreach programs across 15 African countries to improve access to neurological care for children.",
      sections: [
        {
          heading: "Celebrating Progress and Commitment",
          content: "African Child Neurology Day serves as a reminder of the progress made in pediatric neurological care across the continent and reaffirms our commitment to ensuring every child has access to quality neurological healthcare. This year's celebration is particularly significant as we launch our most ambitious community outreach initiative to date."
        },
        {
          heading: "Community Outreach Programs Launch",
          content: "The new community outreach programs will operate in 15 African countries, focusing on early detection, education, and basic care for common pediatric neurological conditions. These programs are designed to work within existing healthcare systems while building local capacity for long-term sustainability."
        },
        {
          heading: "Partnership and Collaboration",
          content: "ACNA has partnered with local governments, international NGOs, and community organizations to ensure the success of these programs. Key partners include the World Health Organization, UNICEF, and various national health ministries who have committed resources and policy support."
        },
        {
          heading: "Expected Impact and Reach",
          content: "The programs are expected to reach over 2 million children in their first year of operation, providing screening services, health education, and referral pathways to specialized care. The initiative will also train 1,000 community health workers in basic pediatric neurology principles."
        }
      ],
      conclusion: "This African Child Neurology Day marks not just a celebration of our achievements, but the beginning of an even more impactful chapter in our mission to improve neurological health outcomes for children across Africa."
    },
    contact: {
      name: "ACNA Communications Team",
      email: "media@acna.org",
      phone: "+254-700-123-456"
    },
    tags: ["ACNA", "Community Outreach", "African Child Neurology Day", "Healthcare Access", "Public Health"]
  };

  // Use press release for demo, but in real app this would be determined by route params
  const currentArticle = article;

  const relatedArticles: RelatedArticle[] = [
    {
      id: 3,
      type: "ACNA JOURNAL",
      title: "How Nutrition Impacts Brain Development in African Children",
      date: "June 30, 2025",
      image: "https://images.pexels.com/photos/3184192/pexels-photo-3184192.jpeg?auto=compress&cs=tinysrgb&w=400",
      category: "Neurodevelopment & Nutrition",
      excerpt: "New research highlights the critical role of nutrition in early brain development and neurological health outcomes."
    },
    {
      id: 4,
      type: "BULLETIN",
      title: "Bridging the Gap: Child Neurology Training in Sub-Saharan Africa",
      date: "June 5, 2025",
      image: "https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=400",
      category: "Medical Education",
      excerpt: "Exploring innovative approaches to training the next generation of pediatric neurologists in resource-limited settings."
    },
    {
      id: 5,
      type: "ACNA NEWS",
      title: "Telemedicine Revolution: Connecting Rural Communities to Specialist Care",
      date: "May 20, 2025",
      image: "https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=400",
      category: "Technology & Innovation",
      excerpt: "How digital health technologies are transforming access to pediatric neurological care across Africa."
    }
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Back Navigation */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button className="flex items-center text-red-600 hover:text-red-700 font-medium">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to News
          </button>
        </div>
      </div>

      {/* Article Header */}
      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4">
          {/* Category Badge */}
          <div className="mb-4">
            <span className="bg-red-600 text-white px-3 py-1 text-sm font-bold uppercase tracking-wide rounded">
              {currentArticle.type === 'news' ? 'NEWS ARTICLE' : 'PRESS RELEASE'}
            </span>
          </div>

          {/* Title and Subtitle */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            {currentArticle.title}
          </h1>
          
          {currentArticle.subtitle && (
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {currentArticle.subtitle}
            </p>
          )}

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-8">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-red-600" />
              <span>{currentArticle.date}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2 text-red-600" />
              <span>{currentArticle.readTime}</span>
            </div>
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-2 text-red-600" />
              <span>{currentArticle.views.toLocaleString()} views</span>
            </div>
            <div className="flex items-center">
              <Tag className="w-4 h-4 mr-2 text-red-600" />
              <span>{currentArticle.category}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-12">
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Share2 className="w-4 h-4 mr-2" />
              Share Article
            </button>
            <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </button>
            <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <BookOpen className="w-4 h-4 mr-2" />
              Print Article
            </button>
          </div>
        </div>
      </section>

      {/* Hero Image */}
      <section className="mb-12">
        <div className="max-w-6xl mx-auto px-4">
          <img
            src={currentArticle.imageUrl}
            alt={currentArticle.title}
            className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
          />
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('article')}
              className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'article'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Article
            </button>
            {currentArticle.author && (
              <button
                onClick={() => setActiveTab('about')}
                className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'about'
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                About the Author
              </button>
            )}
          </nav>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {activeTab === 'article' && (
                <div className="prose prose-lg max-w-none">
                  {/* Introduction */}
                  <div className="text-lg leading-relaxed text-gray-700 mb-8 font-medium">
                    {currentArticle.content.introduction}
                  </div>

                  {/* Article Sections */}
                  {currentArticle.content.sections.map((section, index) => (
                    <div key={index} className="mb-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        {section.heading}
                      </h2>
                      <p className="text-gray-700 leading-relaxed mb-6">
                        {section.content}
                      </p>
                    </div>
                  ))}

                  {/* Conclusion */}
                  {currentArticle.content.conclusion && (
                    <div className="bg-blue-50 p-6 rounded-lg mb-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Conclusion</h3>
                      <p className="text-gray-700 leading-relaxed">
                        {currentArticle.content.conclusion}
                      </p>
                    </div>
                  )}

                  {/* Tags */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentArticle.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200 cursor-pointer transition-colors"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'about' && currentArticle.author && (
                <div className="max-w-2xl">
                  <div className="bg-white border border-gray-200 rounded-lg p-8">
                    <div className="flex items-start gap-6">
                      <img
                        src={currentArticle.author.imageUrl}
                        alt={currentArticle.author.name}
                        className="w-20 h-20 rounded-full object-cover flex-shrink-0"
                      />
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {currentArticle.author.name}
                        </h3>
                        <p className="text-red-600 font-medium mb-2">
                          {currentArticle.author.title}
                        </p>
                        <p className="text-gray-600 mb-4">
                          {currentArticle.author.organization}
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                          {currentArticle.author.bio}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-8">
              {/* Contact Information (for press releases) */}
              {currentArticle.type === 'press-release' && currentArticle.contact && (
                <div className="bg-red-50 p-6 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Media Contact</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2 text-red-600" />
                      <span className="font-medium">{currentArticle.contact.name}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-red-600" />
                      <a href={`mailto:${currentArticle.contact.email}`} className="text-red-600 hover:underline">
                        {currentArticle.contact.email}
                      </a>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-red-600" />
                      <span>{currentArticle.contact.phone}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Source Information (for news articles) */}
              {currentArticle.source && (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Source</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Building className="w-4 h-4 mr-2 text-red-600" />
                      <span className="font-medium">{currentArticle.source.name}</span>
                    </div>
                    <div className="flex items-center">
                      <ExternalLink className="w-4 h-4 mr-2 text-red-600" />
                      <a href={currentArticle.source.url} className="text-red-600 hover:underline text-sm">
                        Visit Source
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Related Articles */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Related Articles</h3>
                <div className="space-y-4">
                  {relatedArticles.map((related) => (
                    <div key={related.id} className="group cursor-pointer">
                      <div className="flex gap-3 hover:bg-gray-50 transition-colors duration-200 p-3 rounded-lg">
                        <div className="relative flex-shrink-0 w-16 h-16 overflow-hidden rounded">
                          <img
                            src={related.image}
                            alt={related.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-0.5 left-0.5">
                            <span className="bg-red-600 text-white px-1 py-0.5 text-xs font-bold uppercase tracking-wide text-[10px]">
                              {related.type}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 space-y-1">
                          <h4 className="text-sm font-semibold text-gray-900 leading-tight group-hover:text-red-600 transition-colors line-clamp-2">
                            {related.title}
                          </h4>
                          <p className="text-xs text-gray-500">{related.date}</p>
                          <p className="text-xs text-red-600 font-medium uppercase">{related.category}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6">
                  <button className="w-full text-center text-red-600 font-medium hover:text-red-700 transition-colors flex items-center justify-center">
                    View All News
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NewsDetailPage;