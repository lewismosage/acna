export type ConferenceStatus = 'Planning' | 'Registration Open' | 'Coming Soon' | 'Completed' | 'Cancelled';
export type ConferenceType = 'In-person' | 'Virtual' | 'Hybrid';
export type SessionType = 'presentation' | 'workshop' | 'panel' | 'break' | 'registration' | 'social';

export interface Organizer {
  name: string;
  contact: string;
  phone: string;
  website: string;
}

interface ImageFile {
  file: File;
  preview: string;
}

export interface Speaker {
  name: string;
  title: string;
  organization: string;
  bio: string;
  imageUrl: string;
  imageFile?: ImageFile;
  expertise: string[];
  isKeynote: boolean;
}

export interface Session {
  time: string;
  title: string;
  speaker: string;
  duration: string;
  type: SessionType;
  location?: string;
  capacity?: string;
  moderator?: string;
  topic?: string;
  speakers?: string[];
}

export interface Registration {
  id: number;
  conferenceId: number;
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  registrationDate: string;
  registrationType: 'Early Bird' | 'Regular';
  paymentStatus: 'Paid' | 'Pending' | 'Failed';
}

export interface FormData {
  title: string;
  date: string;
  time: string;
  location: string;
  venue: string;
  type: ConferenceType;
  status: ConferenceStatus;
  category: string;
  theme: string;
  description: string;
  fullDescription: string;
  imageUrl: string;
  imageFile?: ImageFile;
  isOnline: boolean;
  capacity: string;
  price: string;
  earlyBirdFee: string;
  regularFee: string;
  earlyBirdDeadline: string;
  languages: string[];
  targetAudience: string[];
  learningObjectives: string[];
  keyTopics: string[];
  technicalRequirements: string[];
  organizer: Organizer;
  speakers: Speaker[];
  program: Session[];
  highlights: string[];
}

export interface Conference {
  id: number;
  title: string;
  date: string;
  location: string;
  venue?: string;
  type: ConferenceType;
  status: ConferenceStatus;
  theme?: string;
  description: string;
  imageUrl: string;
  attendees: string;
  speakers: string;
  countries: string;
  earlyBirdDeadline?: string;
  regularFee?: string;
  earlyBirdFee?: string;
  registrationCount?: number;
  capacity?: number;
  highlights?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (conference: Conference) => Promise<void>;
  editingConference?: Conference | null;
}

export interface ConferencesTabProps {
  conferences: Conference[];
}

export interface ConferenceAnalytics {
  total: number;
  upcoming: number;
  completed: number;
  cancelled: number;
  totalRegistrations: number;
  totalRevenue: number;
  inPerson: number;
  virtual: number;
  hybrid: number;
}

export interface AnalyticsData {
  totalConferences: number;
  upcomingConferences: number;
  completedConferences: number;
  totalRegistrations: number;
  totalRevenue: number;
  averageAttendance: number;
  registrationTrends: { month: string; registrations: number }[];
  conferencePerformance: { name: string; registrations: number; capacity: number; revenue: number }[];
  registrationByType: { type: string; count: number; percentage: number }[];
  attendeesByCountry: { country: string; count: number }[];
}