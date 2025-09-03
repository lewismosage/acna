export type PublicationStatus = 'Published' | 'Draft' | 'Archived';
export type PublicationType = 'Research Paper' | 'Clinical Guidelines' | 'Educational Resource' | 'Policy Brief' | 'Research Report';
export type AccessType = 'Open Access' | 'Free Access' | 'Member Access';

export interface Author {
  name: string;
  credentials: string;
  affiliation: string;
  email?: string;
}

export interface CreatePublicationInput {
  title: string;
  authors: Author[];
  journal?: string;
  excerpt: string;
  type: PublicationType;
  status: PublicationStatus;
  imageUrl: string;
  category: string;
  accessType: AccessType;
  abstract?: string;
  fullContent?: string;
  tags: string[];
  targetAudience: string[];
  keywords: string[];
  downloadUrl?: string;
  externalUrl?: string;
  language: string;
}

export interface Publication extends CreatePublicationInput {
  id: number;
  date: string; // This will be handled by the backend
  downloads: number;
  createdAt: string;
  updatedAt: string;
  volume?: string;
  issue?: string;
  pages?: string;
  publisher?: string;
  isbn?: string;
  citationCount?: number;
  isFeatured?: boolean;
}