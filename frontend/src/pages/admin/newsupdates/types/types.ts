export type NewsType = 'News Article' | 'Press Release' | 'Announcement' | 'Research Update';
export type NewsStatus = 'Draft' | 'Published' | 'Archived';

export interface NewsItem {
  id: number;
  title: string;
  subtitle?: string;
  type: NewsType;
  status: NewsStatus;
  category: string;
  date: string;
  readTime: string;
  views: number;
  imageUrl?: string;
  content: {
    introduction: string;
    sections: {
      heading: string;
      content: string;
    }[];
    conclusion?: string;
  };
  tags: string[];
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  author?: {
    name: string;
    title: string;
    organization: string;
    bio: string;
    imageUrl: string;
  };
  source?: {
    name: string;
    url: string;
  };
  contact?: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface CreateNewsInput {
  title: string;
  subtitle?: string;
  type: NewsType;
  status: NewsStatus;
  category: string;
  date: string;
  readTime: string;
  imageUrl: string;
  content: {
    introduction: string;
    sections: {
      heading: string;
      content: string;
    }[];
    conclusion?: string;
  };
  author?: {
    name?: string;
    title?: string;
    organization?: string;
    bio?: string;
    imageUrl?: string;
  };
  tags: string[];
  source?: {
    name?: string;
    url?: string;
  };
  contact?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  isFeatured?: boolean;
}