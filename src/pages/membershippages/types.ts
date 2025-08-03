export interface CountryOption {
  value: string;
  label: string;
}

export interface RegistrationFormData {
  // Individual fields
  membershipClass: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  emailAddress: string;
  physicalAddress: string;
  country: string;
  county: string;
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
  organizationCounty: string;
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

export const counties = [
  "Baringo",
  "Bomet",
  "Bungoma",
  "Busia",
  "Elgeyo-Marakwet",
  "Embu",
  "Garissa",
  "Homa Bay",
  "Isiolo",
  "Kajiado",
  "Kakamega",
  "Kericho",
  "Kiambu",
  "Kilifi",
  "Kirinyaga",
  "Kisii",
  "Kisumu",
  "Kitui",
  "Kwale",
  "Laikipia",
  "Lamu",
  "Machakos",
  "Makueni",
  "Mandera",
  "Marsabit",
  "Meru",
  "Migori",
  "Mombasa",
  "Murang'a",
  "Nairobi",
  "Nakuru",
  "Nandi",
  "Narok",
  "Nyamira",
  "Nyandarua",
  "Nyeri",
  "Samburu",
  "Siaya",
  "Taita-Taveta",
  "Tana River",
  "Tharaka-Nithi",
  "Trans Nzoia",
  "Turkana",
  "Uasin Gishu",
  "Vihiga",
  "Wajir",
  "West Pokot",
];