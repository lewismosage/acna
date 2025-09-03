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

export interface EBooklet {
  id: number;
  title: string;
  description: string;
  abstract?: string;
  category: string;
  status: 'Draft' | 'Published' | 'Archived';
  isFeatured: boolean;
  imageUrl: string;
  fileUrl: string;
  fileSize: string;
  authors: string[];
  targetAudience: string[];
  pages: number;
  fileFormats: string[];
  language: string;
  isbn?: string;
  publisher?: string;
  edition?: string;
  tableOfContents: string[];
  keywords: string[];
  tags: string[];
  downloadCount: number;
  viewCount: number;
  rating?: number;
  publicationDate: string;
  createdAt: string;
  updatedAt: string;
  lastUpdated: string;
}

export interface CreateEBookletInput {
  title: string;
  description: string;
  abstract?: string;
  category: string;
  status: 'Draft' | 'Published' | 'Archived';
  isFeatured: boolean;
  imageFile?: File | null;
  ebookletFile?: File | null;
  authors: string[];
  targetAudience: string[];
  pages: number;
  fileFormats: string[];
  language: string;
  isbn?: string;
  publisher?: string;
  edition?: string;
  tableOfContents: string[];
  keywords: string[];
  tags: string[];
  publicationDate?: string;
}

export interface EBookletAnalytics {
  total: number;
  draft: number;
  published: number;
  archived: number;
  totalDownloads: number;
  monthlyDownloads: number;
  featured: number;
  totalViews: number;
  ebookletsByCategory?: {
    [key: string]: number;
  };
  topEbooklets?: Array<{
    id: number;
    title: string;
    category: string;
    downloadCount: number;
    viewCount: number;
  }>;
}

const normalizeEBooklet = (backendEBooklet: any): EBooklet => {
  const safeArray = (arr: any): string[] => {
    if (!Array.isArray(arr)) return [];
    return arr.filter((item: any) => typeof item === 'string' && item.trim());
  };

  return {
    id: backendEBooklet.id || 0,
    title: backendEBooklet.title || '',
    description: backendEBooklet.description || '',
    abstract: backendEBooklet.abstract,
    category: backendEBooklet.category || '',
    status: backendEBooklet.status || 'Draft',
    isFeatured: backendEBooklet.is_featured || false,
    imageUrl: backendEBooklet.image_url || '/api/placeholder/400/250',
    fileUrl: backendEBooklet.file_url || '',
    fileSize: backendEBooklet.file_size || '0 MB',
    authors: safeArray(backendEBooklet.authors),
    targetAudience: safeArray(backendEBooklet.target_audience),
    pages: backendEBooklet.pages || 0,
    fileFormats: safeArray(backendEBooklet.file_formats),
    language: backendEBooklet.language || 'English',
    isbn: backendEBooklet.isbn,
    publisher: backendEBooklet.publisher,
    edition: backendEBooklet.edition,
    tableOfContents: safeArray(backendEBooklet.table_of_contents),
    keywords: safeArray(backendEBooklet.keywords),
    tags: safeArray(backendEBooklet.tags),
    downloadCount: backendEBooklet.download_count || 0,
    viewCount: backendEBooklet.view_count || 0,
    rating: backendEBooklet.rating,
    publicationDate: backendEBooklet.publication_date || '',
    createdAt: backendEBooklet.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    updatedAt: backendEBooklet.updated_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    lastUpdated: backendEBooklet.last_updated?.split('T')[0] || new Date().toISOString().split('T')[0],
  };
};

export const ebookletsApi = {
  // ========== EBOOKLET CRUD OPERATIONS ==========
  
  getAll: async (params?: {
    status?: string;
    category?: string;
    featured?: boolean;
    search?: string;
  }): Promise<EBooklet[]> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/ebooklets/?${searchParams.toString()}`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data.map(normalizeEBooklet) : [];
  },

  getById: async (id: number): Promise<EBooklet> => {
    const response = await fetch(`${API_BASE_URL}/ebooklets/${id}/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return normalizeEBooklet(data);
  },

  create: async (data: CreateEBookletInput): Promise<EBooklet> => {
    const formData = new FormData();
    
    // Handle array fields by stringifying them
    const arrayFields = ['authors', 'targetAudience', 'fileFormats', 'tableOfContents', 'keywords', 'tags'];
    Object.entries(data).forEach(([key, value]) => {
      if (arrayFields.includes(key) && Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else if (key === 'imageFile' && value instanceof File) {
        formData.append('image', value);
      } else if (key === 'ebookletFile' && value instanceof File) {
        formData.append('file', value);
      } else if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });
  
    const response = await fetch(`${API_BASE_URL}/ebooklets/`, {
      method: 'POST',
      headers: getAuthHeadersWithoutContentType(),
      body: formData,
    });
    
    const result = await handleResponse(response);
    return normalizeEBooklet(result);
  },
  
  update: async (id: number, data: Partial<CreateEBookletInput>): Promise<EBooklet> => {
    const formData = new FormData();
    
    // Handle array fields by stringifying them
    const arrayFields = ['authors', 'targetAudience', 'fileFormats', 'tableOfContents', 'keywords', 'tags'];
    Object.entries(data).forEach(([key, value]) => {
      if (arrayFields.includes(key) && Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else if (key === 'imageFile' && value instanceof File) {
        formData.append('image', value);
      } else if (key === 'ebookletFile' && value instanceof File) {
        formData.append('file', value);
      } else if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });
  
    const response = await fetch(`${API_BASE_URL}/ebooklets/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeadersWithoutContentType(),
      body: formData,
    });
    
    const result = await handleResponse(response);
    return normalizeEBooklet(result);
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/ebooklets/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeadersWithoutContentType(),
    });
    
    return handleResponse(response);
  },

  // ========== EBOOKLET-SPECIFIC OPERATIONS ==========
  
  getFeatured: async (): Promise<EBooklet[]> => {
    const response = await fetch(`${API_BASE_URL}/ebooklets/featured/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data.map(normalizeEBooklet) : [];
  },

  getByStatus: async (status: string): Promise<EBooklet[]> => {
    const response = await fetch(`${API_BASE_URL}/ebooklets/?status=${status}`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data.map(normalizeEBooklet) : [];
  },

  getAnalytics: async (): Promise<EBookletAnalytics> => {
    const response = await fetch(`${API_BASE_URL}/ebooklets/analytics/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    
    // Normalize the analytics data
    return {
      total: data.total || 0,
      draft: data.draft || 0,
      published: data.published || 0,
      archived: data.archived || 0,
      totalDownloads: data.total_downloads || 0,
      monthlyDownloads: data.monthly_downloads || 0,
      featured: data.featured || 0,
      totalViews: data.total_views || 0,
      ebookletsByCategory: data.ebooklets_by_category || {},
      topEbooklets: (data.top_ebooklets || []).map((ebook: {
        id?: number;
        title?: string;
        category?: string;
        download_count?: number;
        view_count?: number; 
      }) => ({
        id: ebook.id || 0,
        title: ebook.title || '',
        category: ebook.category || '',
        downloadCount: ebook.download_count || 0,
        viewCount: ebook.view_count || 0,
      })),
    };
  },

  toggleFeatured: async (id: number): Promise<EBooklet> => {
    const response = await fetch(`${API_BASE_URL}/ebooklets/${id}/toggle_featured/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    const result = await handleResponse(response);
    return normalizeEBooklet(result);
  },

  updateStatus: async (id: number, status: string): Promise<EBooklet> => {
    const response = await fetch(`${API_BASE_URL}/ebooklets/${id}/update_status/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    
    const result = await handleResponse(response);
    return normalizeEBooklet(result);
  },

  incrementDownload: async (id: number): Promise<void> => {
    await fetch(`${API_BASE_URL}/ebooklets/${id}/increment_download/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  },

  incrementView: async (id: number): Promise<void> => {
    await fetch(`${API_BASE_URL}/ebooklets/${id}/increment_view/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  },

  // ========== FILE UPLOAD OPERATIONS ==========
  
  uploadImage: async (file: File): Promise<{ url: string; filename: string; path: string }> => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`${API_BASE_URL}/ebooklets/upload_image/`, {
      method: 'POST',
      headers: getAuthHeadersWithoutContentType(),
      body: formData,
    });
    
    return handleResponse(response);
  },

  uploadFile: async (file: File): Promise<{ url: string; filename: string; path: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/ebooklets/upload_file/`, {
      method: 'POST',
      headers: getAuthHeadersWithoutContentType(),
      body: formData,
    });
    
    return handleResponse(response);
  },

  // ========== METADATA OPERATIONS ==========
  
  getCategories: async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/ebooklets/categories/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  },

  getTargetAudiences: async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/ebooklets/target_audiences/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  },

  getAuthors: async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/ebooklets/authors/`, {
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
  delete: deleteEBooklet,
  getFeatured,
  getByStatus,
  getAnalytics,
  toggleFeatured,
  updateStatus,
  incrementDownload,
  incrementView,
  uploadImage,
  uploadFile,
  getCategories,
  getTargetAudiences,
  getAuthors,
} = ebookletsApi;