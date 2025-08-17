const API_BASE_URL = 'http://127.0.0.1:8000';
const NEWS_API_URL = `${API_BASE_URL}/api/news`;

export interface NewsItem {
  id: number;
  title: string;
  subtitle?: string;
  type: 'News Article' | 'Press Release' | 'Announcement' | 'Research Update';
  status: 'Draft' | 'Published' | 'Archived';
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

export interface NewsAnalytics {
  total: number;
  published: number;
  drafts: number;
  archived: number;
  totalViews: number;
  monthlyViews: number;
  featured: number;
}

export interface CreateNewsInput {
  title: string;
  subtitle?: string;
  type: 'News Article' | 'Press Release' | 'Announcement' | 'Research Update';
  status: 'Draft' | 'Published' | 'Archived';
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

export const newsApi = {
  getAll: async (params?: {
    status?: string;
    type?: string;
    category?: string;
    featured?: boolean;
    search?: string;
  }): Promise<NewsItem[]> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const response = await fetch(`${NEWS_API_URL}/?${searchParams.toString()}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  getById: async (id: number): Promise<NewsItem> => {
    const response = await fetch(`${NEWS_API_URL}/${id}/`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  create: async (data: CreateNewsInput): Promise<NewsItem> => {
    const response = await fetch(`${NEWS_API_URL}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw errorData;
    }
    return response.json();
  },

  update: async (id: number, data: CreateNewsInput): Promise<NewsItem> => {
    const response = await fetch(`${NEWS_API_URL}/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw errorData;
    }
    return response.json();
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${NEWS_API_URL}/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  },

  getFeatured: async (): Promise<NewsItem[]> => {
    const response = await fetch(`${NEWS_API_URL}/featured/`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  uploadImage: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`${NEWS_API_URL}/upload_image/`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw errorData;
    }
    return response.json();
  },

  getAnalytics: async (): Promise<NewsAnalytics> => {
    const response = await fetch(`${NEWS_API_URL}/analytics/`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  toggleFeatured: async (id: number): Promise<NewsItem> => {
    const response = await fetch(`${NEWS_API_URL}/${id}/toggle_featured/`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  updateStatus: async (id: number, status: string): Promise<NewsItem> => {
    const response = await fetch(`${NEWS_API_URL}/${id}/update_status/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },
};