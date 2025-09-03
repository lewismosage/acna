export type ResourceStatus = 'Draft' | 'Published' | 'Archived' | 'Under Review';
export type ResourceType = 'Guide' | 'Video' | 'Audio' | 'Checklist' | 'App' | 'Website' | 'Infographic' | 'Handbook';

export interface PatientResource {
  id: number;
  title: string;
  description: string;
  full_description?: string;
  category: string;
  type: ResourceType;
  condition: string;
  language: string[];
  status: ResourceStatus;
  isFeatured?: boolean;
  isFree: boolean;
  imageUrl: string;
  fileUrl?: string;
  externalUrl?: string;
  tags: string[];
  targetAudience: string[];
  ageGroup: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration?: string;
  downloadCount: number;
  viewCount: number;
  rating?: number;
  author: string;
  reviewedBy?: string;
  createdAt: string;
  updatedAt: string;
  lastReviewDate?: string;
}

export interface ResourceAnalytics {
  total: number;
  draft: number;
  published: number;
  archived: number;
  underReview: number;
  totalDownloads: number;
  monthlyDownloads: number;
  featured: number;
  totalViews: number;
  resourcesByType?: {
    Guide: number;
    Video: number;
    Audio: number;
    Checklist: number;
    App: number;
    Website: number;
    Infographic: number;
    Handbook: number;
  };
  topResources?: Array<{
    id: number;
    title: string;
    type: string;
    downloadCount: number;
    viewCount: number;
  }>;
  resourcesByCondition?: {
    [key: string]: number;
  };
}

export interface CreateResourceInput {
  title: string;
  description: string;
  full_description?: string;
  category: string;
  type: ResourceType;
  condition: string;
  language: string[];
  status: ResourceStatus;
  isFeatured?: boolean;
  isFree: boolean;
  imageFile?: File | null;
  fileUrl?: string;
  externalUrl?: string;
  tags: string[];
  targetAudience: string[];
  ageGroup: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration?: string;
  author: string;
  reviewedBy?: string;
}