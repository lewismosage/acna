const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Helper function to get authentication headers
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('access_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const getAuthHeadersWithoutContentType = (): Record<string, string> => {
  const token = localStorage.getItem('access_token');
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      // If we can't parse the error, use the default message
    }
    throw new Error(errorMessage);
  }
  
  if (response.status === 204) {
    return null;
  }
  
  return response.json();
};

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

export interface PublicationAnalytics {
  total: number;
  draft: number;
  published: number;
  archived: number;
  featured: number;
  totalDownloads: number;
  monthlyDownloads: number;
  totalViews: number;
  totalCitations: number;
  publicationsByCategory?: {
    [key: string]: number;
  };
  publicationsByType?: {
    [key: string]: number;
  };
  topPublications?: Array<{
    id: number;
    title: string;
    category: string;
    type: string;
    downloads: number;
    viewCount: number;
    citationCount: number;
  }>;
}

const normalizePublication = (backendPublication: any): Publication => {
  const safeArray = (arr: any): string[] => {
    if (!Array.isArray(arr)) return [];
    return arr.filter((item: any) => typeof item === 'string' && item.trim());
  };

  const safeAuthorArray = (arr: any): Author[] => {
    if (!Array.isArray(arr)) return [];
    return arr.filter((item: any) => typeof item === 'object' && item.name && item.affiliation);
  };

  return {
    id: backendPublication.id || 0,
    title: backendPublication.title || '',
    excerpt: backendPublication.excerpt || '',
    abstract: backendPublication.abstract,
    fullContent: backendPublication.fullContent || backendPublication.full_content,
    type: backendPublication.type || 'Research Paper',
    category: backendPublication.category || '',
    status: backendPublication.status || 'Draft',
    accessType: backendPublication.accessType || backendPublication.access_type || 'Open Access',
    isFeatured: backendPublication.isFeatured || backendPublication.is_featured || false,
    journal: backendPublication.journal,
    volume: backendPublication.volume,
    issue: backendPublication.issue,
    pages: backendPublication.pages,
    publisher: backendPublication.publisher,
    isbn: backendPublication.isbn,
    language: backendPublication.language || 'English',
    imageUrl: backendPublication.imageUrl || backendPublication.image_url || '/api/placeholder/400/250',
    downloadUrl: backendPublication.downloadUrl || backendPublication.download_url,
    externalUrl: backendPublication.externalUrl || backendPublication.external_url,
    authors: safeAuthorArray(backendPublication.authors),
    targetAudience: safeArray(backendPublication.targetAudience || backendPublication.target_audience),
    tags: safeArray(backendPublication.tags),
    keywords: safeArray(backendPublication.keywords),
    downloads: backendPublication.downloads || 0,
    viewCount: backendPublication.viewCount || backendPublication.view_count || 0,
    citationCount: backendPublication.citationCount || backendPublication.citation_count || 0,
    date: backendPublication.date || '',
    createdAt: backendPublication.createdAt || backendPublication.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    updatedAt: backendPublication.updatedAt || backendPublication.updated_at?.split('T')[0] || new Date().toISOString().split('T')[0],
  };
};

export const publicationsApi = {
  // ========== PUBLICATION CRUD OPERATIONS ==========
  
  getAll: async (params?: {
    status?: string;
    category?: string;
    type?: string;
    featured?: boolean;
    search?: string;
  }): Promise<Publication[]> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/publications/?${searchParams.toString()}`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data.map(normalizePublication) : [];
  },

  getById: async (id: number): Promise<Publication> => {
    const response = await fetch(`${API_BASE_URL}/publications/${id}/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return normalizePublication(data);
  },

  create: async (data: CreatePublicationInput): Promise<Publication> => {
    const formData = new FormData();
    
    // Append all fields to formData
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'imageFile' && value instanceof File) {
        formData.append('image', value);
      } else if (Array.isArray(value)) {
        // Handle array fields by stringifying them
        formData.append(key, JSON.stringify(value));
      } else if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });
  
    const response = await fetch(`${API_BASE_URL}/publications/`, {
      method: 'POST',
      headers: getAuthHeadersWithoutContentType(), 
      body: formData,
    });
    
    const result = await handleResponse(response);
    return normalizePublication(result);
  },
  
  update: async (id: number, data: Partial<CreatePublicationInput>): Promise<Publication> => {
    const formData = new FormData();
    
    // Handle array fields by stringifying them
    const arrayFields = ['authors', 'targetAudience', 'tags', 'keywords'];
    Object.entries(data).forEach(([key, value]) => {
      if (arrayFields.includes(key) && Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else if (key === 'imageFile' && value instanceof File) {
        formData.append('image', value);
      } else if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });
  
    const response = await fetch(`${API_BASE_URL}/publications/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeadersWithoutContentType(),
      body: formData,
    });
    
    const result = await handleResponse(response);
    return normalizePublication(result);
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/publications/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeadersWithoutContentType(),
    });
    
    return handleResponse(response);
  },

  // ========== PUBLICATION-SPECIFIC OPERATIONS ==========
  
  getFeatured: async (): Promise<Publication[]> => {
    const response = await fetch(`${API_BASE_URL}/publications/featured/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data.map(normalizePublication) : [];
  },

  getByStatus: async (status: string): Promise<Publication[]> => {
    const response = await fetch(`${API_BASE_URL}/publications/?status=${status}`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data.map(normalizePublication) : [];
  },

  getAnalytics: async (): Promise<PublicationAnalytics> => {
    const response = await fetch(`${API_BASE_URL}/publications/analytics/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    
    // Normalize the analytics data
    return {
      total: data.total || 0,
      draft: data.draft || 0,
      published: data.published || 0,
      archived: data.archived || 0,
      featured: data.featured || 0,
      totalDownloads: data.total_downloads || data.totalDownloads || 0,
      monthlyDownloads: data.monthly_downloads || data.monthlyDownloads || 0,
      totalViews: data.total_views || data.totalViews || 0,
      totalCitations: data.total_citations || data.totalCitations || 0,
      publicationsByCategory: data.publications_by_category || data.publicationsByCategory || {},
      publicationsByType: data.publications_by_type || data.publicationsByType || {},
      topPublications: (data.top_publications || data.topPublications || []).map((pub: {
        id?: number;
        title?: string;
        category?: string;
        type?: string;
        downloads?: number;
        view_count?: number;
        viewCount?: number;
        citation_count?: number;
        citationCount?: number;
      }) => ({
        id: pub.id || 0,
        title: pub.title || '',
        category: pub.category || '',
        type: pub.type || '',
        downloads: pub.downloads || 0,
        viewCount: pub.viewCount || pub.view_count || 0,
        citationCount: pub.citationCount || pub.citation_count || 0,
      })),
    };
  },

  toggleFeatured: async (id: number): Promise<Publication> => {
    const response = await fetch(`${API_BASE_URL}/publications/${id}/toggle_featured/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    const result = await handleResponse(response);
    return normalizePublication(result);
  },

  updateStatus: async (id: number, status: string): Promise<Publication> => {
    const response = await fetch(`${API_BASE_URL}/publications/${id}/update_status/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    
    const result = await handleResponse(response);
    return normalizePublication(result);
  },

  incrementDownload: async (id: number): Promise<void> => {
    await fetch(`${API_BASE_URL}/publications/${id}/increment_download/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  },

  incrementView: async (id: number): Promise<void> => {
    await fetch(`${API_BASE_URL}/publications/${id}/increment_view/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  },

  // ========== FILE UPLOAD OPERATIONS ==========
  
  uploadImage: async (file: File): Promise<{ url: string; filename: string; path: string }> => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`${API_BASE_URL}/publications/upload_image/`, {
      method: 'POST',
      headers: getAuthHeadersWithoutContentType(),
      body: formData,
    });
    
    return handleResponse(response);
  },

  // ========== METADATA OPERATIONS ==========
  
  getCategories: async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/publications/categories/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  },

  getTargetAudiences: async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/publications/target_audiences/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  },

  getAuthors: async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/publications/authors/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  },
};

// Export individual functions for convenience
export const {
  getAll,
  getById,
  create,
  update,
  delete: deletePublication,
  getFeatured,
  getByStatus,
  getAnalytics,
  toggleFeatured,
  updateStatus,
  incrementDownload,
  incrementView,
  uploadImage,
  getCategories,
  getTargetAudiences,
  getAuthors,
} = publicationsApi;