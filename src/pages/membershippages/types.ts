import { getNames } from 'country-list'; 

export interface CountryOption {
  value: string;
  label: string;
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

export const membershipClasses = [
  "Student Member",
  "Regular Member",
  "Senior Member",
  "International Member",
  "Honorary Member",
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
