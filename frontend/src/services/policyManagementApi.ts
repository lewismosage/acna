// policyManagementApi.ts
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

// Helper function to handle multipart/form-data requests (for file uploads)
const getAuthHeadersMultipart = (): Record<string, string> => {
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

// Types
export type ContentStatus = "Published" | "Draft" | "Archived";
export type PriorityLevel = "High" | "Medium" | "Low";

export interface BaseContentItem {
  id: number;
  title: string;
  category: string;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
  summary: string;
  viewCount: number;
  downloadCount: number;
  imageUrl: string;
  tags: string[];
}

export interface PolicyBelief extends BaseContentItem {
  type: "PolicyBelief";
  priority: PriorityLevel;
  targetAudience: string[];
  keyRecommendations: string[];
  region: string[];
}

export interface PositionalStatement extends BaseContentItem {
  type: "PositionalStatement";
  keyPoints: string[];
  pageCount: number;
  countryFocus: string[];
  relatedPolicies: string[];
}

export type ContentItem = PolicyBelief | PositionalStatement;

export interface ContentAnalytics {
  total: number;
  published: number;
  draft: number;
  archived: number;
  totalViews: number;
  totalDownloads: number;
  monthlyDownloads: number;
  contentByCategory: Record<string, number>;
  topContent: ContentItem[];
}

// Input types for creating/updating content
export interface BaseContentInput {
  title: string;
  category: string;
  summary: string;
  status: ContentStatus;
  tags: string[];
  imageUrl?: string;
  imageFile?: File;
}

export interface PolicyBeliefInput extends BaseContentInput {
  type: "PolicyBelief";
  priority: PriorityLevel;
  targetAudience: string[];
  keyRecommendations: string[];
  region: string[];
}

export interface PositionalStatementInput extends BaseContentInput {
  type: "PositionalStatement";
  keyPoints: string[];
  pageCount: number;
  countryFocus: string[];
  relatedPolicies: string[];
}

export type ContentInput = PolicyBeliefInput | PositionalStatementInput;

// Normalize backend data to frontend format
const normalizeContentItem = (backendItem: any): ContentItem => {
  const safeArray = (arr: any): string[] => {
    if (!Array.isArray(arr)) return [];
    return arr.filter((item: any) => typeof item === 'string' && item.trim());
  };

  const baseItem = {
    id: backendItem.id || 0,
    title: backendItem.title || '',
    category: backendItem.category || '',
    status: backendItem.status || 'Draft',
    createdAt: backendItem.createdAt || backendItem.created_at || '',
    updatedAt: backendItem.updatedAt || backendItem.updated_at || '',
    summary: backendItem.summary || '',
    viewCount: backendItem.viewCount || backendItem.view_count || 0,
    downloadCount: backendItem.downloadCount || backendItem.download_count || 0,
    imageUrl: backendItem.imageUrl || backendItem.image_url || '',
    tags: safeArray(backendItem.tags),
  };

  if (backendItem.type === 'PolicyBelief' || backendItem.type === 'policy_belief') {
    return {
      ...baseItem,
      type: 'PolicyBelief',
      priority: backendItem.priority || 'Medium',
      targetAudience: safeArray(backendItem.targetAudience || backendItem.target_audience),
      keyRecommendations: safeArray(backendItem.keyRecommendations || backendItem.key_recommendations),
      region: safeArray(backendItem.region),
    };
  } else {
    return {
      ...baseItem,
      type: 'PositionalStatement',
      keyPoints: safeArray(backendItem.keyPoints || backendItem.key_points),
      pageCount: backendItem.pageCount || backendItem.page_count || 0,
      countryFocus: safeArray(backendItem.countryFocus || backendItem.country_focus),
      relatedPolicies: safeArray(backendItem.relatedPolicies || backendItem.related_policies),
    };
  }
};

// Convert frontend data to backend format
const prepareContentForBackend = (data: ContentInput): FormData => {
  const formData = new FormData();
  
  // Add common fields
  formData.append('title', data.title);
  formData.append('category', data.category);
  formData.append('summary', data.summary);
  formData.append('status', data.status);
  formData.append('tags', JSON.stringify(data.tags));
  
  if (data.imageUrl) {
    formData.append('image_url', data.imageUrl);
  }
  
  if (data.imageFile) {
    formData.append('image', data.imageFile);
  }
  
  // Add type-specific fields
  if (data.type === 'PolicyBelief') {
    formData.append('type', 'PolicyBelief');
    formData.append('priority', data.priority);
    formData.append('target_audience', JSON.stringify(data.targetAudience));
    formData.append('key_recommendations', JSON.stringify(data.keyRecommendations));
    formData.append('region', JSON.stringify(data.region));
  } else {
    formData.append('type', 'PositionalStatement');
    formData.append('page_count', data.pageCount.toString());
    formData.append('key_points', JSON.stringify(data.keyPoints));
    formData.append('country_focus', JSON.stringify(data.countryFocus));
    formData.append('related_policies', JSON.stringify(data.relatedPolicies));
  }
  
  return formData;
};

export const policyManagementApi = {
  // ========== CONTENT CRUD OPERATIONS ==========
  
  getAll: async (params?: {
    status?: string;
    search?: string;
    category?: string;
    type?: string;
  }): Promise<ContentItem[]> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== 'all') {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/content/?${searchParams.toString()}`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data.map(normalizeContentItem) : [];
  },

  getById: async (id: number): Promise<ContentItem> => {
    const response = await fetch(`${API_BASE_URL}/content/${id}/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return normalizeContentItem(data);
  },

  create: async (data: ContentInput): Promise<ContentItem> => {
    const formData = prepareContentForBackend(data);
    
    const response = await fetch(`${API_BASE_URL}/content/`, {
      method: 'POST',
      headers: getAuthHeadersMultipart(),
      body: formData,
    });
    
    const result = await handleResponse(response);
    return normalizeContentItem(result);
  },
  
  update: async (id: number, data: Partial<ContentInput>): Promise<ContentItem> => {
    const formData = new FormData();
    
    // Add only the fields that are provided
    if (data.title !== undefined) formData.append('title', data.title);
    if (data.category !== undefined) formData.append('category', data.category);
    if (data.summary !== undefined) formData.append('summary', data.summary);
    if (data.status !== undefined) formData.append('status', data.status);
    if (data.tags !== undefined) formData.append('tags', JSON.stringify(data.tags));
    if (data.imageUrl !== undefined) formData.append('image_url', data.imageUrl);
    if (data.imageFile !== undefined) formData.append('image', data.imageFile);
    
    // Type-specific fields
    if (data.type === 'PolicyBelief') {
      if (data.priority !== undefined) formData.append('priority', data.priority);
      if (data.targetAudience !== undefined) formData.append('target_audience', JSON.stringify(data.targetAudience));
      if (data.keyRecommendations !== undefined) formData.append('key_recommendations', JSON.stringify(data.keyRecommendations));
      if (data.region !== undefined) formData.append('region', JSON.stringify(data.region));
    } else if (data.type === 'PositionalStatement') {
      if (data.pageCount !== undefined) formData.append('page_count', data.pageCount.toString());
      if (data.keyPoints !== undefined) formData.append('key_points', JSON.stringify(data.keyPoints));
      if (data.countryFocus !== undefined) formData.append('country_focus', JSON.stringify(data.countryFocus));
      if (data.relatedPolicies !== undefined) formData.append('related_policies', JSON.stringify(data.relatedPolicies));
    }

    const response = await fetch(`${API_BASE_URL}/content/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeadersMultipart(),
      body: formData,
    });
    
    const result = await handleResponse(response);
    return normalizeContentItem(result);
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/content/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  // ========== CONTENT-SPECIFIC OPERATIONS ==========
  
  getByStatus: async (status: string): Promise<ContentItem[]> => {
    const response = await fetch(`${API_BASE_URL}/content/?status=${status}`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data.map(normalizeContentItem) : [];
  },

  getByType: async (type: string): Promise<ContentItem[]> => {
    const response = await fetch(`${API_BASE_URL}/content/?type=${type}`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data.map(normalizeContentItem) : [];
  },

  getAnalytics: async (): Promise<ContentAnalytics> => {
    const response = await fetch(`${API_BASE_URL}/content/analytics/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    
    // Normalize the analytics data
    return {
      total: data.total || 0,
      published: data.published || 0,
      draft: data.draft || 0,
      archived: data.archived || 0,
      totalViews: data.totalViews || data.total_views || 0,
      totalDownloads: data.totalDownloads || data.total_downloads || 0,
      monthlyDownloads: data.monthlyDownloads || data.monthly_downloads || 0,
      contentByCategory: data.contentByCategory || data.content_by_category || {},
      topContent: (data.topContent || data.top_content || []).map(normalizeContentItem),
    };
  },

  updateStatus: async (id: number, status: ContentStatus): Promise<ContentItem> => {
    const response = await fetch(`${API_BASE_URL}/content/${id}/status/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    
    const result = await handleResponse(response);
    return normalizeContentItem(result);
  },

  incrementDownload: async (id: number, type: string): Promise<void> => {
    await fetch(`${API_BASE_URL}/content/${id}/increment_download/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content_type: type }),
    });
  },

  incrementView: async (id: number, type: string): Promise<void> => {
    await fetch(`${API_BASE_URL}/content/${id}/increment_view/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content_type: type }),
    });
  },

  // ========== METADATA OPERATIONS ==========
  
  getCategories: async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/content/categories/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  },

  getTargetAudienceOptions: async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/content/target_audience_options/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  },

  getRegions: async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/content/regions/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  },

  getCountries: async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/content/countries/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  },

  getTags: async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/content/tags/`, {
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
  delete: deleteContent,
  getByStatus,
  getByType,
  getAnalytics,
  updateStatus,
  incrementDownload,
  incrementView,
  getCategories,
  getTargetAudienceOptions,
  getRegions,
  getCountries,
  getTags,
} = policyManagementApi;