// services/patientCareApi.ts
const API_BASE_URL = 'http://127.0.0.1:8000/api';

import { 
  PatientResource, 
  ResourceAnalytics, 
  CreateResourceInput,
  ResourceType,
  ResourceStatus 
} from '../pages/admin/resources/patientcareresources/patientCare';

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

const normalizeResource = (backendResource: any): PatientResource => {
  const safeArray = (arr: any[]): string[] => {
    if (!Array.isArray(arr)) return [];
    return arr.map(item => {
      if (typeof item === 'string') return item;
      if (typeof item === 'object' && item !== null) {
        return item.name || item.language || item.audience || item.tag || '';
      }
      return '';
    }).filter(Boolean);
  };

  // Handle language/languages field mapping
  let languages: string[] = [];
  if (backendResource.languages && Array.isArray(backendResource.languages)) {
    // Backend returns array of objects with language field
    languages = backendResource.languages.map((lang: any) => 
      typeof lang === 'string' ? lang : (lang.language || '')
    ).filter(Boolean);
  } else if (backendResource.language) {
    // Fallback if backend returns 'language' field
    languages = Array.isArray(backendResource.language) 
      ? safeArray(backendResource.language)
      : [backendResource.language];
  }

  let imageUrl = backendResource.imageUrl || backendResource.image_url;
  if (imageUrl && imageUrl.startsWith('/') && !imageUrl.startsWith('//')) {
    imageUrl = `${API_BASE_URL}${imageUrl}`;
  }

  let fileUrl = backendResource.fileUrl || backendResource.file_url;
  let externalUrl = backendResource.externalUrl || backendResource.external_url;

  return {
    id: backendResource.id || 0,
    title: backendResource.title || '',
    description: backendResource.description || '',
    full_description: backendResource.full_description || backendResource.full_description,
    category: backendResource.category || '',
    type: backendResource.type || 'Guide',
    condition: backendResource.condition || '',
    language: languages, 
    status: backendResource.status || 'Draft',
    isFeatured: backendResource.isFeatured || backendResource.is_featured || false,
    isFree: backendResource.isFree || backendResource.is_free || true,
    imageUrl: imageUrl || '/api/placeholder/400/250',
    fileUrl: fileUrl,
    externalUrl: externalUrl,
    tags: safeArray(backendResource.tags),
    targetAudience: safeArray(backendResource.targetAudience || backendResource.target_audience),
    ageGroup: backendResource.ageGroup || backendResource.age_group || '',
    difficulty: backendResource.difficulty || 'Beginner',
    duration: backendResource.duration,
    downloadCount: backendResource.downloadCount || backendResource.download_count || 0,
    viewCount: backendResource.viewCount || backendResource.view_count || 0,
    rating: backendResource.rating,
    author: backendResource.author || '',
    reviewedBy: backendResource.reviewedBy || backendResource.reviewed_by,
    createdAt: backendResource.createdAt?.split('T')[0] || backendResource.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    updatedAt: backendResource.updatedAt?.split('T')[0] || backendResource.updated_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    lastReviewDate: backendResource.lastReviewDate?.split('T')[0] || backendResource.last_review_date?.split('T')[0],
  };
};

export const patientCareApi = {
  // ========== RESOURCE CRUD OPERATIONS ==========
  
  getAll: async (params?: {
    status?: string;
    type?: string;
    category?: string;
    condition?: string;
    featured?: boolean;
    search?: string;
  }): Promise<PatientResource[]> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/patient-resources/?${searchParams.toString()}`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data.map(normalizeResource) : [];
  },

  getById: async (id: number): Promise<PatientResource> => {
    const response = await fetch(`${API_BASE_URL}/patient-resources/${id}/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return normalizeResource(data);
  },

  create: async (data: CreateResourceInput): Promise<PatientResource> => {
    const formData = new FormData();
    
    // Append all fields to formData
    Object.entries(data).forEach(([key, value]) => {
        if (key === 'imageFile' && value instanceof File) {
        formData.append('image', value);
        } else if (Array.isArray(value)) {
        value.forEach(item => formData.append(key, item));
        } else if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
        }
    });

    const response = await fetch(`${API_BASE_URL}/patient-resources/`, {
        method: 'POST',
        headers: getAuthHeadersWithoutContentType(), // Remove Content-Type for FormData
        body: formData,
    });
    
    const result = await handleResponse(response);
    return normalizeResource(result);
    },

  update: async (id: number, data: Partial<CreateResourceInput>): Promise<PatientResource> => {
    // Create FormData for file upload
    const formData = new FormData();
    
    // Append all fields to formData
    Object.entries(data).forEach(([key, value]) => {
        if (key === 'imageFile' && value instanceof File) {
        formData.append('image', value);
        } else if (Array.isArray(value)) {
        value.forEach(item => formData.append(key, item));
        } else if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
        }
    });

    const response = await fetch(`${API_BASE_URL}/patient-resources/${id}/`, {
        method: 'PATCH',
        headers: getAuthHeadersWithoutContentType(), // Remove Content-Type for FormData
        body: formData,
    });
    
    const result = await handleResponse(response);
    return normalizeResource(result);
    },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/patient-resources/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeadersWithoutContentType(),
    });
    
    return handleResponse(response);
  },

  // ========== RESOURCE-SPECIFIC OPERATIONS ==========
  
  getFeatured: async (): Promise<PatientResource[]> => {
    const response = await fetch(`${API_BASE_URL}/patient-resources/featured/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data.map(normalizeResource) : [];
  },

  getByStatus: async (status: string): Promise<PatientResource[]> => {
    const response = await fetch(`${API_BASE_URL}/patient-resources/?status=${status}`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data.map(normalizeResource) : [];
  },

  getAnalytics: async (): Promise<ResourceAnalytics> => {
    const response = await fetch(`${API_BASE_URL}/patient-resources/analytics/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    
    return {
      total: data.total || 0,
      draft: data.draft || 0,
      published: data.published || 0,
      archived: data.archived || 0,
      underReview: data.underReview || data.under_review || 0,
      totalDownloads: data.totalDownloads || data.total_downloads || 0,
      monthlyDownloads: data.monthlyDownloads || data.monthly_downloads || 0,
      featured: data.featured || 0,
      totalViews: data.totalViews || data.total_views || 0,
      resourcesByType: data.resourcesByType || data.resources_by_type || {
        Guide: 0,
        Video: 0,
        Audio: 0,
        Checklist: 0,
        App: 0,
        Website: 0,
        Infographic: 0,
        Handbook: 0
      },
      topResources: data.topResources || data.top_resources || [],
      resourcesByCondition: data.resourcesByCondition || data.resources_by_condition || {}
    };
  },

  toggleFeatured: async (id: number): Promise<PatientResource> => {
    const response = await fetch(`${API_BASE_URL}/patient-resources/${id}/toggle_featured/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    const result = await handleResponse(response);
    return normalizeResource(result);
  },

  updateStatus: async (id: number, status: string): Promise<PatientResource> => {
    const response = await fetch(`${API_BASE_URL}/patient-resources/${id}/update_status/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    
    const result = await handleResponse(response);
    return normalizeResource(result);
  },

  incrementDownload: async (id: number): Promise<void> => {
    await fetch(`${API_BASE_URL}/patient-resources/${id}/increment_download/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  },

  incrementView: async (id: number): Promise<void> => {
    await fetch(`${API_BASE_URL}/patient-resources/${id}/increment_view/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  },

  // ========== FILE UPLOAD OPERATIONS ==========
  
  uploadImage: async (file: File): Promise<{ url: string; filename: string; path: string }> => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`${API_BASE_URL}/patient-resources/upload_image/`, {
      method: 'POST',
      headers: getAuthHeadersWithoutContentType(),
      body: formData,
    });
    
    return handleResponse(response);
  },

  uploadFile: async (file: File): Promise<{ url: string; filename: string; path: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/patient-resources/upload_file/`, {
      method: 'POST',
      headers: getAuthHeadersWithoutContentType(),
      body: formData,
    });
    
    return handleResponse(response);
  },

  // ========== METADATA OPERATIONS ==========
  
  getCategories: async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/patient-resources/categories/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  },

  getConditions: async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/patient-resources/conditions/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  },

  getLanguages: async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/patient-resources/languages/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  },

  getTargetAudiences: async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/patient-resources/target_audiences/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  },

  getAgeGroups: async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/patient-resources/age_groups/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  },

  // ========== EXPORT OPERATIONS ==========
  
  exportResources: async (format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> => {
    const response = await fetch(`${API_BASE_URL}/patient-resources/export/?format=${format}`, {
      headers: getAuthHeadersWithoutContentType(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.blob();
  },
};

// Export individual functions for convenience
export const {
  getAll,
  getById,
  create,
  update,
  delete: deleteResource,
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
  getConditions,
  getLanguages,
  getTargetAudiences,
  getAgeGroups,
  exportResources,
} = patientCareApi;