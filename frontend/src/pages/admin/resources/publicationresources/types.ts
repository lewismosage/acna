export type PublicationStatus = 'Published' | 'Draft' | 'Archived';
export type PublicationType = 'Research Paper' | 'Clinical Guidelines' | 'Educational Resource' | 'Policy Brief' | 'Research Report';
export type AccessType = 'Open Access' | 'Free Access' | 'Member Access';

export interface Author {
  name: string;
  credentials: string;
  affiliation: string;
  email?: string;
}

export interface Publication {
  id: number;
  title: string;
  excerpt: string;
  abstract?: string;
  fullContent?: string;
  type: PublicationType;
  category: string;
  status: PublicationStatus;
  accessType: AccessType;
  isFeatured: boolean;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  publisher?: string;
  isbn?: string;
  language: string;
  imageUrl: string;
  downloadUrl?: string;
  externalUrl?: string;
  authors: Author[];
  targetAudience: string[];
  tags: string[];
  keywords: string[];
  downloads: number;
  viewCount: number;
  citationCount: number;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePublicationInput {
  title: string;
  excerpt: string;
  abstract?: string;
  fullContent?: string;
  type: PublicationType;
  category: string;
  status: PublicationStatus;
  accessType: AccessType;
  isFeatured: boolean;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  publisher?: string;
  isbn?: string;
  language: string;
  imageFile?: File | null;
  downloadUrl?: string;
  externalUrl?: string;
  authors: Author[];
  targetAudience: string[];
  tags: string[];
  keywords: string[];
}