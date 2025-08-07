// utils/searchIndex.ts

/**
 * Interface for search items in the ACNA website
 */
export interface SearchItem {
  title: string;
  description: string;
  url: string;
  keywords: string[];
  category?: string;
}

/**
 * Comprehensive search index for the ACNA website
 * Organized by main categories with detailed keywords
 */
const searchIndex: SearchItem[] = [
  // Home Page
  {
    title: "Home",
    description: "Africa Child Neurology Association's official website",
    url: "/",
    keywords: ["home", "acna", "africa", "child neurology", "main", "homepage"],
    category: "navigation"
  },
  {
    title: "Advancing Child Neurology Across Africa",
    description: "Join the Africa Child Neurology Association and be part of a pan-African community",
    url: "/about",
    keywords: ["mission", "join", "community", "pan-african"],
    category: "about"
  },

  // About Us
  {
    title: "About ACNA",
    description: "Learn about the Africa Child Neurology Association and our mission",
    url: "/about",
    keywords: ["about", "organization", "mission", "vision", "history", "established", "values"],
    category: "about"
  },
  {
    title: "Our Mission",
    description: "ACNA's mission to promote excellence in child neurology care",
    url: "/about#mission",
    keywords: ["mission", "purpose", "goals"],
    category: "about"
  },
  {
    title: "Our Vision",
    description: "ACNA's vision for child neurology in Africa",
    url: "/about#mission",
    keywords: ["vision", "future", "aspiration"],
    category: "about"
  },
  {
    title: "Our Structure",
    description: "Governance and leadership structure of ACNA",
    url: "/about#leadership",
    keywords: ["structure", "governance", "leadership", "board"],
    category: "about"
  },
  {
    title: "Leadership Team",
    description: "Meet the leadership team of ACNA",
    url: "/about#leadership",
    keywords: ["leadership", "team", "board", "chairperson"],
    category: "about"
  },
  {
    title: "Our Continental Reach",
    description: "Countries where ACNA operates",
    url: "/about#reach",
    keywords: ["countries", "regions", "africa", "coverage"],
    category: "about"
  },
  {
    title: "Annual Report",
    description: "Resources that reflect impact, equity, and progress.",
    url: "/faqs",
    keywords: ["Impact Report", "Annual Report", "Impact in Focus", "reports"],
    category: "about"
  },

  // Professional Network
  {
    title: "Professional Network",
    description: "Connect with child neurology professionals across Africa",
    url: "/professional-network",
    keywords: ["network", "professionals", "connect", "collaborate"],
    category: "network"
  },
  {
    title: "Member Categories",
    description: "Different types of membership in ACNA's professional network",
    url: "/professional-network#categories",
    keywords: ["membership", "categories", "specialists", "healthcare providers"],
    category: "network"
  },
  {
    title: "Collaboration Opportunities",
    description: "Ways to collaborate with ACNA's professional network",
    url: "/professional-network#collaboration",
    keywords: ["collaboration", "telemedicine", "research", "training"],
    category: "network"
  },

  // Research & Publications
  {
    title: "Research & Publications",
    description: "Access ACNA's research and publications",
    url: "/research",
    keywords: ["research", "publications", "studies", "clinical guidelines"],
    category: "research"
  },
  {
    title: "Research Focus Areas",
    description: "Key research areas of ACNA",
    url: "/research#focus-areas",
    keywords: ["research areas", "focus", "priorities"],
    category: "research"
  },
  {
    title: "Active Research Projects",
    description: "Current research projects by ACNA",
    url: "/research-papers-and-publications#active-research",
    keywords: ["projects", "current", "ongoing", "trials"],
    category: "research"
  },
  {
    title: "Publications & Resources",
    description: "ACNA's library of publications and resources",
    url: "/research#publications",
    keywords: ["publications", "resources", "library", "guidelines"],
    category: "research"
  },

  // Events & Training
  {
    title: "Events & Training",
    description: "Upcoming events and training programs by ACNA",
    url: "/events",
    keywords: ["events", "training", "conferences", "workshops"],
    category: "events"
  },
  {
    title: "Training Programs",
    description: "ACNA's educational programs for healthcare professionals",
    url: "/events#programs",
    keywords: ["training", "programs", "education", "certification"],
    category: "events"
  },
  {
    title: "Upcoming Events",
    description: "Calendar of upcoming ACNA events",
    url: "/events#upcoming",
    keywords: ["events", "calendar", "schedule", "conferences"],
    category: "events"
  },
  {
    title: "Annual Conference and Meetings",
    description: "Groundbreaking conferences and collaborative meetings",
    url: "/annual-conference",
    keywords: ["events", "calendar", "expert speakers", "acna annual Conference", "schedule", "conferences"],
    category: "events"
  },
  {
    title: "Call for Abstracts",
    description: "Annual Conference",
    url: "/call-for-abstracts",
    keywords: ["events", "calendar", "abstract presentation", "abstract submission", "abstract categories"],
    category: "events"
  },
  {
    title: "Gallery",
    description: "Moments from our conferences, training programs, community outreach, and the inspiring stories",
    url: "/gallery",
    keywords: ["events", "success Stories", "innovation", "community", "training", "media",  "conferences"],
    category: "events"
  },

  // Recognition & Awards
  {
    title: "Recognition & Awards",
    description: "ACNA's awards program for excellence in child neurology",
    url: "/recogination-awards",
    keywords: ["awards", "recognition", "excellence", "achievement"],
    category: "awards"
  },
  {
    title: "Award Categories",
    description: "Different award categories offered by ACNA",
    url: "/awards",
    keywords: ["award types", "categories", "nominations"],
    category: "awards"
  },

  // Membership
  {
    title: "Membership FAQs",
    description: "Answers to common questions about ACNA membership",
    url: "/membership-faqs",
    keywords: ["FAQs", "questions", "membership"],
    category: "membership"
  },
  {
    title: "Membership Categories",
    description: "Different types of ACNA membership",
    url: "/membership-categories",
    keywords: ["membership types", "categories", "professional", "student"],
    category: "membership"
  },
  {
    title: "Membership Benefits",
    description: "Benefits of ACNA membership",
    url: "/membership-categories",
    keywords: ["benefits", "pricing", "advantages", "perks", "resources"],
    category: "membership"
  },
  {
    title: "Membership Application",
    description: "Apply for ACNA membership",
    url: "/register",
    keywords: ["apply", "application", "join", "registration"],
    category: "membership"
  },
  {
    title: "Membeship Renewal",
    description: "Continue your professional journey with ACNA",
    url: "/membership-renewal",
    keywords: ["apply", "renew", "payment", "application", "registration"],
    category: "membership"
  },
  {
    title: "Membeship Upgrade",
    description: "Upgrade to a higher membership tier and unlock additional benefits and opportunities",
    url: "/membership-upgrade",
    keywords: ["apply", "renew", "application", "registration"],
    category: "membership"
  },
  {
    title: "Membeship Directory",
    description: "African Healthcare Professionals Directory",
    url: "/membership-directory",
    keywords: ["join", "connect", "professionals", "directory", "registration"],
    category: "membership"
  },

  // News & Updates
  {
    title: "Latest News & Updates",
    description: "Recent news from ACNA",
    url: "/news",
    keywords: ["news", "updates", "articles", "stories"],
    category: "news"
  },

  // Get Involved
  {
    title: "Get Involved",
    description: "Ways to support ACNA's mission",
    url: "/get-involved",
    keywords: ["volunteer", "donate", "support", "participate"],
    category: "get-involved"
  },
  {
    title: "Donate",
    description: "Support ACNA through donations",
    url: "/donate",
    keywords: ["donate", "support", "contribute", "give"],
    category: "get-involved"
  },
  {
    title: "Volunteer",
    description: "Volunteer opportunities with ACNA",
    url: "/volunteer",
    keywords: ["volunteer", "opportunities", "help", "participate"],
    category: "get-involved"
  },

  // Careers
  {
    title: "Careers",
    description: "Job opportunities at ACNA",
    url: "/careers",
    keywords: ["jobs", "careers", "employment", "opportunities"],
    category: "careers"
  },

  // Resources
  {
    title: "Resources",
    description: "Educational resources from ACNA",
    url: "/resources",
    keywords: ["resources", "materials", "guides", "tools"],
    category: "resources"
  },
  {
    title: "E-Booklets",
    description: "Downloadable educational booklets",
    url: "/resources/ebooklets",
    keywords: ["ebooklets", "downloads", "education", "materials"],
    category: "resources"
  },
  {
    title: "Educational Videos",
    description: "Instructional videos on child neurology",
    url: "/resources/videos",
    keywords: ["videos", "education", "training", "tutorials"],
    category: "resources"
  },
  {
    title: "Member Portal",
    description: "African Child Neurology Association - Member Portal",
    url: "/memberportal",
    keywords: ["profile", "forum", "account", "members directory", "e-learning", "login",],
    category: "resources"
  },
  {
    title: "Fact Sheets and Case Studies",
    description: "Evidence-based educational Resources",
    url: "/case-studies-and-fact-sheets",
    keywords: ["educational resources", "education", "Case Studies", "Clinical Fact Sheets"],
    category: "resources"
  },
  {
    title: "Patient and Caregiver Resources",
    description: "Comprehensive patient support",
    url: "/patient-caregiver-resources",
    keywords: ["practical resources", "Resources and Guides", "training", "Support Groups", "Emergency Support",],
    category: "resources"
  },
  {
    title: "Workshops and Symposiums",
    description: "Advancing expertise in pediatric neurology through Workshops and Symposiums",
    url: "/collaboration-opportunities",
    keywords: ["videos", "education", "training", "collaboration", "opportunities", "tutorials"],
    category: "resources"
  },
  {
    title: "Journal Watch",
    description: "Curated summaries of recent pediatric neurology research",
    url: "/journal-watch",
    keywords: ["journals", "education", "methodology", "findings", "neurological", "conditions", "summaries"],
    category: "resources"
  },
  {
    title: "ACNA Webinars",
    description: "Live and recorded educational sessions on pediatric neurology topics",
    url: "/webinars",
    keywords: ["videos", "education", "training", "tutorials", "webinars", "live sessions"],
    category: "resources"
  },

  // Contact
  {
    title: "Contact Us",
    description: "Contact information for ACNA",
    url: "/contact",
    keywords: ["contact", "email", "phone", "address"],
    category: "contact"
  },

  // Legal
  {
    title: "Privacy Policy",
    description: "ACNA's privacy policy",
    url: "/privacy-policy",
    keywords: ["privacy", "policy", "data protection"],
    category: "legal"
  },
  {
    title: "Terms and Conditions",
    description: "ACNA's terms of service",
    url: "/terms",
    keywords: ["terms", "conditions", "legal"],
    category: "legal"
  },
  {
    title: "Cookie Policy",
    description: "ACNA's cookie usage policy",
    url: "/cookie-policy",
    keywords: ["cookies", "policy", "tracking"],
    category: "legal"
  },
  {
    title: "Donor Privacy Policy",
    description: "ACNA's donor privacy policy",
    url: "/donor-privacy",
    keywords: ["donor", "privacy", "policy"],
    category: "legal"
  },
  {
    title: "General Questions About ACNA",
    description: "Frequently Asked Questions",
    url: "/faqs",
    keywords: ["jobs", "careers", "faqs", "employment", "membership", "opportunities"],
    category: "careers"
  },
];

/**
 * Function to search the index based on a query string
 * @param query - The search query
 * @returns Array of matching search items
 */
export function searchSite(query: string): SearchItem[] {
  if (!query || query.trim() === '') {
    return [];
  }
  
  const normalizedQuery = query.toLowerCase().trim();
  
  return searchIndex.filter(item => {
    // Check if query matches title or description
    if (
      item.title.toLowerCase().includes(normalizedQuery) ||
      item.description.toLowerCase().includes(normalizedQuery)
    ) {
      return true;
    }
    
    // Check if query matches any keywords
    return item.keywords.some(keyword => 
      keyword.toLowerCase().includes(normalizedQuery)
    );
  });
}

/**
 * Function to search the index by category
 * @param category - The category to filter by
 * @returns Array of search items in the specified category
 */
export function getItemsByCategory(category: string): SearchItem[] {
  return searchIndex.filter(item => item.category === category);
}

export default searchIndex;