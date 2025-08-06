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
    url: "/#mission",
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
    url: "/about#vision",
    keywords: ["vision", "future", "aspiration"],
    category: "about"
  },
  {
    title: "Our Structure",
    description: "Governance and leadership structure of ACNA",
    url: "/about#structure",
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
    url: "/research#projects",
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

  // Recognition & Awards
  {
    title: "Recognition & Awards",
    description: "ACNA's awards program for excellence in child neurology",
    url: "/awards",
    keywords: ["awards", "recognition", "excellence", "achievement"],
    category: "awards"
  },
  {
    title: "Award Categories",
    description: "Different award categories offered by ACNA",
    url: "/awards#categories",
    keywords: ["award types", "categories", "nominations"],
    category: "awards"
  },

  // Membership
  {
    title: "Membership",
    description: "Join or renew your ACNA membership",
    url: "/membership",
    keywords: ["join", "renew", "member", "membership", "register"],
    category: "membership"
  },
  {
    title: "Membership Categories",
    description: "Different types of ACNA membership",
    url: "/membership#categories",
    keywords: ["membership types", "categories", "professional", "student"],
    category: "membership"
  },
  {
    title: "Membership Benefits",
    description: "Benefits of ACNA membership",
    url: "/membership#benefits",
    keywords: ["benefits", "advantages", "perks", "resources"],
    category: "membership"
  },
  {
    title: "Membership Application",
    description: "Apply for ACNA membership",
    url: "/membership/application",
    keywords: ["apply", "application", "join", "registration"],
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
  }
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