import { getNames } from 'country-list'; 

export interface CountryOption {
  value: string;
  label: string;
}

export interface MembershipClass {
  display: string;
  value: string;
}

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

export const membershipClasses: MembershipClass[] = [
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
