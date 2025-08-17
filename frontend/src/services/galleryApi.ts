const API_BASE_URL = 'http://127.0.0.1:8000';
const GALLERY_API_URL = `${API_BASE_URL}/gallery/api`;

// Types
export interface GalleryItem {
  id: number;
  title: string;
  type: 'photo' | 'video';
  category: string;
  description: string;
  image?: File | string;
  video?: File | string;
  thumbnail?: File | string;
  media_url?: string;
  thumbnail_url?: string;
  event_date: string;
  location: string;
  duration?: string;
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  slug: string;
  view_count: number;
}

export interface Story {
  id: number;
  title: string;
  patient_name: string;
  age: number;
  condition: string;
  story: string;
  image?: File | string;
  image_url?: string;
  location: string;
  story_date: string;
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  slug: string;
  view_count: number;
}

export interface GalleryStats {
  total_gallery_items: number;
  published_gallery_items: number;
  total_stories: number;
  published_stories: number;
  total_views: number;
  last_updated: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Utility function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
};

// Utility function to create headers
const createHeaders = (isMultipart = false): HeadersInit => {
  const headers: HeadersInit = {};
  
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  
  // Try to include auth token if available
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Utility function to handle API responses
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    try {
      const errorData = await response.json();
      console.error('API Error:', {
        status: response.status,
        url: response.url,
        error: errorData
      });
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    } catch {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }
  return await response.json();
};

// Gallery Items API
export const galleryItemsApi = {
  // Get all gallery items with optional filters
  getAll: async (params?: {
    status?: string;
    type?: string;
    category?: string;
    is_featured?: boolean;
    search?: string;
    ordering?: string;
    page?: number;
  }): Promise<GalleryItem[]> => {  // Changed return type
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const url = `${GALLERY_API_URL}/gallery-items/?${searchParams.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: createHeaders(false),
    });
    
    const data = await handleResponse<any>(response);
    // Handle both array and paginated response formats
    return Array.isArray(data) ? data : (data.results || []);
  },

  // Get single gallery item by ID
  getById: async (id: number): Promise<GalleryItem> => {
    const response = await fetch(`${GALLERY_API_URL}/gallery-items/${id}/`, {
      method: 'GET',
      headers: createHeaders(false),
    });
    
    return handleResponse<GalleryItem>(response);
  },

  // Create new gallery item
  create: async (data: FormData): Promise<GalleryItem> => {
    const response = await fetch(`${GALLERY_API_URL}/gallery-items/`, {
      method: 'POST',
      headers: createHeaders(true),
      body: data,
    });
    
    return handleResponse<GalleryItem>(response);
  },

  // Update gallery item
  update: async (id: number, data: FormData): Promise<GalleryItem> => {
    const response = await fetch(`${GALLERY_API_URL}/gallery-items/${id}/`, {
      method: 'PATCH',
      headers: createHeaders(true),
      body: data,
    });
    
    return handleResponse<GalleryItem>(response);
  },

  // Delete gallery item
  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${GALLERY_API_URL}/gallery-items/${id}/`, {
      method: 'DELETE',
      headers: createHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete gallery item: ${response.status}`);
    }
  },

  // Get featured gallery items
  getFeatured: async (): Promise<GalleryItem[]> => {
    const response = await fetch(`${GALLERY_API_URL}/gallery-items/featured/`, {
      method: 'GET',
      headers: createHeaders(false),
    });
    
    return handleResponse<GalleryItem[]>(response);
  },

  // Get gallery items by category
  getByCategory: async (): Promise<Record<string, GalleryItem[]>> => {
    const response = await fetch(`${GALLERY_API_URL}/gallery-items/by_category/`, {
      method: 'GET',
      headers: createHeaders(false),
    });
    
    return handleResponse<Record<string, GalleryItem[]>>(response);
  },

  // Update gallery item status
  updateStatus: async (id: number, status: string): Promise<ApiResponse<any>> => {
    const response = await fetch(`${GALLERY_API_URL}/gallery-items/${id}/update_status/`, {
      method: 'PATCH',
      headers: createHeaders(),
      body: JSON.stringify({ status }),
    });
    
    return handleResponse<ApiResponse<any>>(response);
  },

  // Toggle featured status
  toggleFeatured: async (id: number): Promise<ApiResponse<{ is_featured: boolean }>> => {
    const response = await fetch(`${GALLERY_API_URL}/gallery-items/${id}/toggle_featured/`, {
      method: 'PATCH',
      headers: createHeaders(),
    });
    
    return handleResponse<ApiResponse<{ is_featured: boolean }>>(response);
  },

  // Bulk actions
  bulkAction: async (itemIds: number[], action: string): Promise<ApiResponse<any>> => {
    const response = await fetch(`${GALLERY_API_URL}/gallery-items/bulk_action/`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({ item_ids: itemIds, action }),
    });
    
    return handleResponse<ApiResponse<any>>(response);
  },

  // Get gallery items statistics
  getStats: async (): Promise<any> => {
    const response = await fetch(`${GALLERY_API_URL}/gallery-items/stats/`, {
      method: 'GET',
      headers: createHeaders(),
    });
    
    return handleResponse<any>(response);
  },
};

// Stories API
// Stories API
export const storiesApi = {
  // Get all stories with optional filters
  getAll: async (params?: {
    status?: string;
    condition?: string;
    is_featured?: boolean;
    search?: string;
    ordering?: string;
    page?: number;
  }): Promise<Story[]> => {  // Changed return type to Story[] to match galleryItemsApi
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const url = `${GALLERY_API_URL}/stories/?${searchParams.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: createHeaders(false),
    });
    
    const data = await handleResponse<any>(response);
    // Handle both array and paginated response formats
    return Array.isArray(data) ? data : (data.results || []);
  },

  // Get single story by ID
  getById: async (id: number): Promise<Story> => {
    const response = await fetch(`${GALLERY_API_URL}/stories/${id}/`, {
      method: 'GET',
      headers: createHeaders(false),
    });
    
    return handleResponse<Story>(response);
  },

  // Create new story
  create: async (data: FormData): Promise<Story> => {
    const response = await fetch(`${GALLERY_API_URL}/stories/`, {
      method: 'POST',
      headers: createHeaders(true),
      body: data,
    });
    
    return handleResponse<Story>(response);
  },

  // Update story
  update: async (id: number, data: FormData): Promise<Story> => {
    const response = await fetch(`${GALLERY_API_URL}/stories/${id}/`, {
      method: 'PATCH',
      headers: createHeaders(true),
      body: data,
    });
    
    return handleResponse<Story>(response);
  },

  // Delete story
  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${GALLERY_API_URL}/stories/${id}/`, {
      method: 'DELETE',
      headers: createHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete story: ${response.status}`);
    }
  },

  // Get featured stories
  getFeatured: async (): Promise<Story[]> => {
    const response = await fetch(`${GALLERY_API_URL}/stories/featured/`, {
      method: 'GET',
      headers: createHeaders(false),
    });
    
    return handleResponse<Story[]>(response);
  },

  // Get stories by condition
  getByCondition: async (): Promise<Record<string, Story[]>> => {
    const response = await fetch(`${GALLERY_API_URL}/stories/by_condition/`, {
      method: 'GET',
      headers: createHeaders(false),
    });
    
    return handleResponse<Record<string, Story[]>>(response);
  },

  // Update story status
  updateStatus: async (id: number, status: string): Promise<ApiResponse<any>> => {
    const response = await fetch(`${GALLERY_API_URL}/stories/${id}/update_status/`, {
      method: 'PATCH',
      headers: createHeaders(),
      body: JSON.stringify({ status }),
    });
    
    return handleResponse<ApiResponse<any>>(response);
  },

  // Toggle featured status
  toggleFeatured: async (id: number): Promise<ApiResponse<{ is_featured: boolean }>> => {
    const response = await fetch(`${GALLERY_API_URL}/stories/${id}/toggle_featured/`, {
      method: 'PATCH',
      headers: createHeaders(),
    });
    
    return handleResponse<ApiResponse<{ is_featured: boolean }>>(response);
  },

  // Bulk actions
  bulkAction: async (storyIds: number[], action: string): Promise<ApiResponse<any>> => {
    const response = await fetch(`${GALLERY_API_URL}/stories/bulk_action/`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({ story_ids: storyIds, action }),
    });
    
    return handleResponse<ApiResponse<any>>(response);
  },

  // Get stories statistics
  getStats: async (): Promise<any> => {
    const response = await fetch(`${GALLERY_API_URL}/stories/stats/`, {
      method: 'GET',
      headers: createHeaders(),
    });
    
    return handleResponse<any>(response);
  },
};

// Gallery Statistics API
export const galleryStatsApi = {
  // Get gallery statistics
  get: async (): Promise<GalleryStats> => {
    const response = await fetch(`${GALLERY_API_URL}/stats/1/`, {
      method: 'GET',
      headers: createHeaders(),
    });
    
    return handleResponse<GalleryStats>(response);
  },

  // Refresh statistics
  refresh: async (): Promise<GalleryStats> => {
    const response = await fetch(`${GALLERY_API_URL}/stats/refresh/`, {
      method: 'POST',
      headers: createHeaders(),
    });
    
    return handleResponse<GalleryStats>(response);
  },
};

// Helper functions for form data creation
export const createGalleryItemFormData = (item: Partial<GalleryItem>): FormData => {
  const formData = new FormData();
  
  // Add text fields
  if (item.title) formData.append('title', item.title);
  if (item.type) formData.append('type', item.type);
  if (item.category) formData.append('category', item.category);
  if (item.description) formData.append('description', item.description);
  if (item.event_date) formData.append('event_date', item.event_date);
  if (item.location) formData.append('location', item.location);
  if (item.duration) formData.append('duration', item.duration);
  if (item.status) formData.append('status', item.status);
  if (item.is_featured !== undefined) formData.append('is_featured', item.is_featured.toString());
  
  // Add file fields
  if (item.image instanceof File) {
    formData.append('image', item.image);
  }
  if (item.video instanceof File) {
    formData.append('video', item.video);
  }
  if (item.thumbnail instanceof File) {
    formData.append('thumbnail', item.thumbnail);
  }
  
  return formData;
};

export const createStoryFormData = (story: Partial<Story>): FormData => {
  const formData = new FormData();
  
  // Add text fields
  if (story.title) formData.append('title', story.title);
  if (story.patient_name) formData.append('patient_name', story.patient_name);
  if (story.age !== undefined) formData.append('age', story.age.toString());
  if (story.condition) formData.append('condition', story.condition);
  if (story.story) formData.append('story', story.story);
  if (story.location) formData.append('location', story.location);
  if (story.story_date) formData.append('story_date', story.story_date);
  if (story.status) formData.append('status', story.status);
  if (story.is_featured !== undefined) formData.append('is_featured', story.is_featured.toString());
  
  // Add image file
  if (story.image instanceof File) {
    formData.append('image', story.image);
  }
  
  return formData;
};

export default {
  galleryItems: galleryItemsApi,
  stories: storiesApi,
  stats: galleryStatsApi,
  helpers: {
    createGalleryItemFormData,
    createStoryFormData,
  },
};