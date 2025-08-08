import { getNames } from 'country-list'; 

export interface MembershipCategory {
  title: string;
  fee: string;
  amount: number; 
  value: string;
  whoCanJoin: string[];
  benefits: string[];
  color: string;
  badgeColor: string;
}

export interface CountryOption {
  value: string;
  label: string;
}

export interface MembershipClassDisplay {
  display: string;
  value: MembershipClass;
}

export type MembershipClass = 
  | "full_professional"
  | "associate"
  | "student"
  | "institutional"
  | "affiliate"
  | "honorary"
  | "corporate"
  | "lifetime";

export const countryOptions: CountryOption[] = getNames()
  .sort()
  .map((country: string) => ({
    value: country,
    label: country
  }));

export interface RegistrationFormData {
  // Individual fields
  membershipClass: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  emailAddress: string;
  physicalAddress: string;
  country: string;
  ageBracket: string;
  password: string;
  confirmPassword: string;
  gender: string;
  // Organization fields
  organizationName: string;
  organizationType: string;
  registrationNumber: string;
  contactPersonName: string;
  contactPersonTitle: string;
  organizationEmail: string;
  organizationPhone: string;
  organizationAddress: string;
  organizationCountry: string;
  website: string;
  termsAccepted: boolean;
}

export const membershipClasses: MembershipClassDisplay[] = [
  { display: "Full / Professional Member", value: "full_professional" },
  { display: "Associate Member", value: "associate" },
  { display: "Trainee / Student Member", value: "student" },
  { display: "Institutional Member", value: "institutional" },
  { display: "Affiliate Member", value: "affiliate" },
  { display: "Honorary Member", value: "honorary" },
  { display: "Corporate / Partner Member", value: "corporate" },
  { display: "Lifetime Member", value: "lifetime" },
];

export const organizationTypes = [
  "Healthcare Institution",
  "Research Organization",
  "NGO/Non-Profit",
  "Government Agency",
  "Educational Institution",
  "Corporate Partner",
];

export const ageBrackets = ["18-25", "26-35", "36-45", "46-55", "56-65", "65+"];


export const membershipCategories: MembershipCategory[] = [
  {
    title: "Full / Professional Member",
    fee: "USD $80",
    amount: 8000,
    value: "full_professional",
    whoCanJoin: [
      "Licensed pediatric neurologists",
      "Medical doctors or consultants specializing in child neurology or neurology",
      "Professionals engaged in clinical practice, research, or teaching in neurology"
    ],
    benefits: [
      "Full voting rights at ACNA General Assemblies",
      "Access to member-only publications, journals, and clinical guidelines",
      "Discounted rates for annual conferences, workshops, and webinars",
      "Eligibility to serve on ACNA committees and hold leadership roles",
      "Priority access to research collaboration and grant opportunities",
      "Member dashboard with premium learning resources"
    ],
    color: "bg-blue-50 border-blue-200",
    badgeColor: "bg-blue-600"
  },
  {
    title: "Associate Member",
    fee: "USD $40",
    amount: 4000,
    value: "associate",
    whoCanJoin: [
      "Allied health professionals such as nurses, psychologists, occupational therapists, physiotherapists, speech and language therapists, and social workers in child health or neurology-related fields"
    ],
    benefits: [
      "Participation in ACNA special interest groups and forums",
      "Access to monthly newsletters, toolkits, and webinars",
      "Discounted admission to relevant events and training",
      "Platform for professional networking and regional collaboration",
      "Certificate of membership and CPD recognition (where applicable)"
    ],
    color: "bg-green-50 border-green-200",
    badgeColor: "bg-green-600"
  },
  {
    title: "Trainee / Student Member",
    fee: "USD $15",
    amount: 1500,
    value: "student",
    whoCanJoin: [
      "Medical students, neurology residents, fellows, or early-career researchers with proof of enrollment"
    ],
    benefits: [
      "Access to mentorship programs and career development support",
      "Eligibility for student travel grants and research competitions",
      "Access to curated e-learning materials, lectures, and webinars",
      "Early access to internships, training opportunities, and scholarships",
      "Involvement in student networks and academic forums"
    ],
    color: "bg-yellow-50 border-yellow-200",
    badgeColor: "bg-yellow-600"
  },
  {
    title: "Institutional Member",
    fee: "USD $300",
    amount: 30000,
    value: "institutional",
    whoCanJoin: [
      "Academic institutions, hospitals, non-governmental organizations (NGOs), research centers, and training institutions focused on child health or neuroscience"
    ],
    benefits: [
      "Group access for up to 5 staff members (expandable at a fee)",
      "Institutional recognition on the ACNA website and materials",
      "Priority eligibility for collaborative projects and multi-center research",
      "Discounted exhibition/sponsorship rates for ACNA events",
      "Networking with regional and global institutional partners"
    ],
    color: "bg-purple-50 border-purple-200",
    badgeColor: "bg-purple-600"
  },
  {
    title: "Affiliate Member",
    fee: "USD $50",
    amount: 5000,
    value: "affiliate",
    whoCanJoin: [
      "Individuals or organizations outside Africa or non-clinical stakeholders who support ACNA's goals (e.g., researchers, policy experts, philanthropists)"
    ],
    benefits: [
      "Access to quarterly reports, newsletters, and ACNA publications",
      "Invitations to international workshops and knowledge-sharing events",
      "Recognition as a Friend of ACNA in annual reports",
      "No voting rights or eligibility for board positions"
    ],
    color: "bg-indigo-50 border-indigo-200",
    badgeColor: "bg-indigo-600"
  },
  {
    title: "Honorary Member",
    fee: "Complimentary (Lifetime)",
    amount: 0,
    value: "honorary",
    whoCanJoin: [
      "Individuals who have made outstanding contributions to pediatric neurology in Africa",
      "Nominated and approved by the ACNA Board of Directors"
    ],
    benefits: [
      "Lifetime recognition and award certificate",
      "Complimentary access to all ACNA events and materials",
      "May serve as advisors to ACNA committees or projects",
      "Highlighted in the ACNA Hall of Honour"
    ],
    color: "bg-amber-50 border-amber-200",
    badgeColor: "bg-amber-600"
  },
  {
    title: "Corporate / Partner Member",
    fee: "USD $500+ (custom packages available)",
    amount: 50000,
    value: "corporate",
    whoCanJoin: [
      "Companies or private-sector entities such as pharmaceutical firms, medical device manufacturers, or health tech innovators"
    ],
    benefits: [
      "Brand visibility at ACNA events, newsletters, and website",
      "Access to exhibit booths and corporate speaking slots",
      "Invitations to closed strategic roundtables and innovation summits",
      "Opportunities to co-develop health programs or support research",
      "Annual report mention and digital partner badge"
    ],
    color: "bg-rose-50 border-rose-200",
    badgeColor: "bg-rose-600"
  },
  {
    title: "Lifetime Member",
    fee: "USD $500 (One-Time)",
    amount: 50000,
    value: "lifetime",
    whoCanJoin: [
      "Qualified Full Members who wish to support ACNA with a one-time contribution"
    ],
    benefits: [
      "All Full Member benefits with no renewal fees",
      "Lifetime Membership Certificate",
      "Priority invitations to special sessions and ACNA partner forums",
      "Recognition as a sustaining supporter of child neurology in Africa"
    ],
    color: "bg-emerald-50 border-emerald-200",
    badgeColor: "bg-emerald-600"
  }
];