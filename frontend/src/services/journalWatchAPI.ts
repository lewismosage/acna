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

export interface JournalArticle {
  id: number;
  title: string;
  authors: string;
  journal: string;
  publicationDate: string;
  summary: string;
  abstract?: string;
  keyFindings: string[];
  relevance: "High" | "Medium" | "Low";
  studyType: string;
  population: string;
  countryFocus: string[];
  tags: string[];
  commentary?: string;
  status: "Published" | "Draft" | "Archived";
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  downloadCount: number;
}

export interface CreateJournalArticleInput {
  title: string;
  authors: string;
  journal: string;
  summary: string;
  abstract?: string;
  keyFindings: string[];
  relevance: "High" | "Medium" | "Low";
  studyType: string;
  population: string;
  countryFocus: string[];
  tags: string[];
  commentary?: string;
  status: "Published" | "Draft" | "Archived";
}

export interface JournalAnalytics {
  total: number;
  totalViews: number;
  totalDownloads: number;
  monthlyViews: number;
  monthlyDownloads: number;
  published: number;
  draft: number;
  archived: number;
  articlesByStudyType?: Record<string, number>;
  articlesByCountry?: Record<string, number>;
  topArticles?: Array<{
    id: number;
    title: string;
    studyType: string;
    viewCount: number;
    downloadCount: number;
  }>;
}

const normalizeJournalArticle = (backendArticle: any): JournalArticle => {
  const safeArray = (arr: any): string[] => {
    if (!Array.isArray(arr)) return [];
    return arr.filter((item: any) => typeof item === 'string' && item.trim());
  };

  return {
    id: backendArticle.id || 0,
    title: backendArticle.title || '',
    authors: backendArticle.authors || '',
    journal: backendArticle.journal || '',
    publicationDate: backendArticle.publicationDate || backendArticle.publication_date || '',
    summary: backendArticle.summary || '',
    abstract: backendArticle.abstract,
    keyFindings: safeArray(backendArticle.keyFindings || backendArticle.key_findings),
    relevance: backendArticle.relevance || 'Medium',
    studyType: backendArticle.studyType || backendArticle.study_type || '',
    population: backendArticle.population || '',
    countryFocus: safeArray(backendArticle.countryFocus || backendArticle.country_focus),
    tags: safeArray(backendArticle.tags),
    commentary: backendArticle.commentary,
    status: backendArticle.status || 'Draft',
    createdAt: backendArticle.createdAt || backendArticle.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    updatedAt: backendArticle.updatedAt || backendArticle.updated_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    viewCount: backendArticle.viewCount || backendArticle.view_count || 0,
    downloadCount: backendArticle.downloadCount || backendArticle.download_count || 0,
  };
};

export const journalArticlesApi = {
  // ========== JOURNAL ARTICLE CRUD OPERATIONS ==========
  
  getAll: async (params?: {
    status?: string;
    relevance?: string;
    studyType?: string;
    search?: string;
  }): Promise<JournalArticle[]> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== 'all') {
          // Convert camelCase to snake_case for backend
          const backendKey = key === 'studyType' ? 'study_type' : key;
          searchParams.append(backendKey, value.toString());
        }
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/journal-articles/?${searchParams.toString()}`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data.map(normalizeJournalArticle) : [];
  },

  getById: async (id: number): Promise<JournalArticle> => {
    const response = await fetch(`${API_BASE_URL}/journal-articles/${id}/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return normalizeJournalArticle(data);
  },

  create: async (data: CreateJournalArticleInput): Promise<JournalArticle> => {
    // Convert camelCase to snake_case for backend
    const backendData = {
      title: data.title,
      authors: data.authors,
      journal: data.journal,
      summary: data.summary,
      abstract: data.abstract,
      key_findings: data.keyFindings,
      relevance: data.relevance,
      study_type: data.studyType,
      population: data.population,
      country_focus: data.countryFocus,
      tags: data.tags,
      commentary: data.commentary,
      status: data.status,
    };

    const response = await fetch(`${API_BASE_URL}/journal-articles/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(backendData),
    });
    
    const result = await handleResponse(response);
    return normalizeJournalArticle(result);
  },
  
  update: async (id: number, data: Partial<CreateJournalArticleInput>): Promise<JournalArticle> => {
    // Convert camelCase to snake_case for backend
    const backendData: any = {};
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        switch (key) {
          case 'keyFindings':
            backendData.key_findings = value;
            break;
          case 'studyType':
            backendData.study_type = value;
            break;
          case 'countryFocus':
            backendData.country_focus = value;
            break;
          default:
            backendData[key] = value;
        }
      }
    });

    const response = await fetch(`${API_BASE_URL}/journal-articles/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(backendData),
    });
    
    const result = await handleResponse(response);
    return normalizeJournalArticle(result);
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/journal-articles/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  // ========== JOURNAL ARTICLE-SPECIFIC OPERATIONS ==========
  
  getByStatus: async (status: string): Promise<JournalArticle[]> => {
    const response = await fetch(`${API_BASE_URL}/journal-articles/?status=${status}`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data.map(normalizeJournalArticle) : [];
  },

  getAnalytics: async (): Promise<JournalAnalytics> => {
    const response = await fetch(`${API_BASE_URL}/journal-articles/analytics/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    
    // Normalize the analytics data
    return {
      total: data.total || 0,
      totalViews: data.totalViews || data.total_views || 0,
      totalDownloads: data.totalDownloads || data.total_downloads || 0,
      monthlyViews: data.monthlyViews || data.monthly_views || 0,
      monthlyDownloads: data.monthlyDownloads || data.monthly_downloads || 0,
      published: data.published || 0,
      draft: data.draft || 0,
      archived: data.archived || 0,
      articlesByStudyType: data.articlesByStudyType || data.articles_by_study_type || {},
      articlesByCountry: data.articlesByCountry || data.articles_by_country || {},
      topArticles: (data.topArticles || data.top_articles || []).map((article: {
        id?: number;
        title?: string;
        study_type?: string;
        studyType?: string;
        view_count?: number;
        viewCount?: number;
        download_count?: number;
        downloadCount?: number;
      }) => ({
        id: article.id || 0,
        title: article.title || '',
        studyType: article.studyType || article.study_type || '',
        viewCount: article.viewCount || article.view_count || 0,
        downloadCount: article.downloadCount || article.download_count || 0,
      })),
    };
  },

  updateStatus: async (id: number, status: string): Promise<JournalArticle> => {
    const response = await fetch(`${API_BASE_URL}/journal-articles/${id}/update_status/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    
    const result = await handleResponse(response);
    return normalizeJournalArticle(result);
  },

  incrementDownload: async (id: number): Promise<void> => {
    await fetch(`${API_BASE_URL}/journal-articles/${id}/increment_download/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  },

  incrementView: async (id: number): Promise<void> => {
    await fetch(`${API_BASE_URL}/journal-articles/${id}/increment_view/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  },

  // ========== METADATA OPERATIONS ==========
  
  getStudyTypes: async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/journal-articles/study_types/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  },

  getCountries: async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/journal-articles/countries/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  },

  getTags: async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/journal-articles/tags/`, {
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
  delete: deleteJournalArticle,
  getByStatus,
  getAnalytics,
  updateStatus,
  incrementDownload,
  incrementView,
  getStudyTypes,
  getCountries,
  getTags,
} = journalArticlesApi;