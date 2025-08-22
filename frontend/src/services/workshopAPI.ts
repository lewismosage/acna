// src/api/workshopAPI.ts
const API_BASE_URL = 'http://127.0.0.1:8000/api';

export type WorkshopStatus = 'Planning' | 'Registration Open' | 'In Progress' | 'Completed' | 'Cancelled';
export type WorkshopType = 'Online' | 'In-Person' | 'Hybrid';

export interface Workshop {
  id: number;
  title: string;
  instructor: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  venue?: string;
  type: WorkshopType;
  status: WorkshopStatus;
  description: string;
  imageUrl: string;
  capacity: number;
  registered: number;
  price?: number;
  prerequisites: string[];
  materials: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkshopAnalytics {
  total: number;
  planning: number;
  registrationOpen: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  totalRegistrations: number;
  monthlyRegistrations: number;
  totalRevenue?: number;
  workshopsByType?: {
    Online: number;
    'In-Person': number;
    Hybrid: number;
  };
  topWorkshops?: Array<{
    id: number;
    title: string;
    date: string;
    registered: number;
  }>;
}

export interface CreateWorkshopInput {
  title: string;
  instructor: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  venue?: string;
  type: WorkshopType;
  status: WorkshopStatus;
  description: string;
  imageUrl: string;
  capacity: number;
  price?: number;
  prerequisites: string[];
  materials: string[];
}

export interface CollaborationSubmission {
  id: number;
  projectTitle: string;
  projectDescription: string;
  institution: string;
  projectLead: string;
  contactEmail: string;
  skillsNeeded: string[];
  commitmentLevel: string;
  duration: string;
  additionalNotes: string;
  submittedAt: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Needs Info';
}

export interface CreateCollaborationInput {
  projectTitle: string;
  projectDescription: string;
  institution: string;
  projectLead: string;
  contactEmail: string;
  skillsNeeded: string[];
  commitmentLevel: string;
  duration: string;
  additionalNotes: string;
}

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

// Helper function to get headers without Content-Type (for FormData and DELETE)
const getAuthHeadersWithoutContentType = (): Record<string, string> => {
  const token = localStorage.getItem('access_token');
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Helper function to handle API responses
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
  
  // Handle empty responses (like DELETE)
  if (response.status === 204) {
    return null;
  }
  
  return response.json();
};

// Helper function to safely convert backend data to frontend format
const normalizeWorkshop = (backendWorkshop: any): Workshop => {
  const safeArray = (arr: any[]): string[] => {
    if (!Array.isArray(arr)) return [];
    return arr.map(item => {
      if (typeof item === 'string') return item;
      if (typeof item === 'object' && item !== null) {
        return item.name || item.prerequisite || item.material || '';
      }
      return '';
    }).filter(Boolean);
  };

  return {
    id: backendWorkshop.id || 0,
    title: backendWorkshop.title || '',
    instructor: backendWorkshop.instructor || '',
    date: backendWorkshop.date || '',
    time: backendWorkshop.time || '',
    duration: backendWorkshop.duration || '',
    location: backendWorkshop.location || '',
    venue: backendWorkshop.venue,
    type: backendWorkshop.type || 'In-Person',
    status: backendWorkshop.status || 'Planning',
    description: backendWorkshop.description || '',
    imageUrl: backendWorkshop.imageUrl || backendWorkshop.image_url || '/api/placeholder/400/250',
    capacity: backendWorkshop.capacity || 30,
    registered: backendWorkshop.registered || backendWorkshop.registration_count || 0,
    price: backendWorkshop.price,
    prerequisites: safeArray(backendWorkshop.prerequisites),
    materials: safeArray(backendWorkshop.materials),
    createdAt: backendWorkshop.createdAt?.split('T')[0] || backendWorkshop.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    updatedAt: backendWorkshop.updatedAt?.split('T')[0] || backendWorkshop.updated_at?.split('T')[0] || new Date().toISOString().split('T')[0],
  };
};

const normalizeCollaboration = (backendCollaboration: any): CollaborationSubmission => {
  return {
    id: backendCollaboration.id || 0,
    projectTitle: backendCollaboration.projectTitle || backendCollaboration.project_title || '',
    projectDescription: backendCollaboration.projectDescription || backendCollaboration.project_description || '',
    institution: backendCollaboration.institution || '',
    projectLead: backendCollaboration.projectLead || backendCollaboration.project_lead || '',
    contactEmail: backendCollaboration.contactEmail || backendCollaboration.contact_email || '',
    skillsNeeded: Array.isArray(backendCollaboration.skillsNeeded) 
      ? backendCollaboration.skillsNeeded 
      : (backendCollaboration.skills_needed || '').split(',').map((s: string) => s.trim()).filter(Boolean),
    commitmentLevel: backendCollaboration.commitmentLevel || backendCollaboration.commitment_level || '',
    duration: backendCollaboration.duration || '',
    additionalNotes: backendCollaboration.additionalNotes || backendCollaboration.additional_notes || '',
    submittedAt: backendCollaboration.submittedAt?.split('T')[0] || backendCollaboration.submitted_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    status: backendCollaboration.status || 'Pending',
  };
};

export const workshopsApi = {
  // ========== WORKSHOP CRUD OPERATIONS ==========
  
  getAll: async (params?: {
    status?: string;
    type?: string;
    search?: string;
  }): Promise<Workshop[]> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/workshops/?${searchParams.toString()}`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data.map(normalizeWorkshop) : [];
  },

  getById: async (id: number): Promise<Workshop> => {
    const response = await fetch(`${API_BASE_URL}/workshops/${id}/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return normalizeWorkshop(data);
  },

  create: async (data: CreateWorkshopInput): Promise<Workshop> => {
  // Prepare the data for backend - remove any ID field
  const { id, ...requestData } = data as any;
  
  // Ensure arrays are always present
  requestData.prerequisites = requestData.prerequisites || [];
  requestData.materials = requestData.materials || [];
  
  // Convert empty strings to null for optional fields
  requestData.venue = requestData.venue || null;
  requestData.price = requestData.price || null;

  console.log('Sending workshop data:', requestData);

  const response = await fetch(`${API_BASE_URL}/workshops/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(requestData),
  });
  
  const result = await handleResponse(response);
  return normalizeWorkshop(result);
},

  update: async (id: number, data: Partial<CreateWorkshopInput>): Promise<Workshop> => {
    const response = await fetch(`${API_BASE_URL}/workshops/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    const result = await handleResponse(response);
    return normalizeWorkshop(result);
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/workshops/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeadersWithoutContentType(),
    });
    
    return handleResponse(response);
  },

  // ========== WORKSHOP-SPECIFIC OPERATIONS ==========
  
  getFeatured: async (): Promise<Workshop[]> => {
    const response = await fetch(`${API_BASE_URL}/workshops/featured/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data.map(normalizeWorkshop) : [];
  },

  getUpcoming: async (): Promise<Workshop[]> => {
    const response = await fetch(`${API_BASE_URL}/workshops/upcoming/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data.map(normalizeWorkshop) : [];
  },

  getAnalytics: async (): Promise<WorkshopAnalytics> => {
    const response = await fetch(`${API_BASE_URL}/workshops/analytics/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    
    // Normalize the response to match our interface
    return {
      total: data.total || 0,
      planning: data.planning || 0,
      registrationOpen: data.registrationOpen || 0,
      inProgress: data.inProgress || 0,
      completed: data.completed || 0,
      cancelled: data.cancelled || 0,
      totalRegistrations: data.totalRegistrations || 0,
      monthlyRegistrations: data.monthlyRegistrations || 0,
      totalRevenue: data.totalRevenue || 0,
      workshopsByType: data.workshopsByType || {
        Online: 0,
        'In-Person': 0,
        Hybrid: 0
      },
      topWorkshops: data.topWorkshops || []
    };
  },

  toggleFeatured: async (id: number): Promise<Workshop> => {
    const response = await fetch(`${API_BASE_URL}/workshops/${id}/toggle_featured/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    const result = await handleResponse(response);
    return normalizeWorkshop(result);
  },

  updateStatus: async (id: number, status: WorkshopStatus): Promise<Workshop> => {
    const response = await fetch(`${API_BASE_URL}/workshops/${id}/update_status/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    
    const result = await handleResponse(response);
    return normalizeWorkshop(result);
  },

  // ========== FILE UPLOAD OPERATIONS ==========
  
  uploadImage: async (file: File): Promise<{ url: string; filename: string; path: string }> => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`${API_BASE_URL}/workshops/upload_image/`, {
      method: 'POST',
      headers: getAuthHeadersWithoutContentType(),
      body: formData,
    });
    
    return handleResponse(response);
  },

  // ========== COLLABORATION MANAGEMENT ==========
  
  getCollaborations: async (params?: {
    status?: string;
    search?: string;
  }): Promise<CollaborationSubmission[]> => {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/collaborations/?${searchParams.toString()}`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data.map(normalizeCollaboration) : [];
  },

  getCollaborationById: async (id: number): Promise<CollaborationSubmission> => {
    const response = await fetch(`${API_BASE_URL}/collaborations/${id}/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return normalizeCollaboration(data);
  },

  createCollaboration: async (data: CreateCollaborationInput): Promise<CollaborationSubmission> => {
    const response = await fetch(`${API_BASE_URL}/collaborations/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    const result = await handleResponse(response);
    return normalizeCollaboration(result);
  },

  updateCollaboration: async (id: number, data: Partial<CreateCollaborationInput>): Promise<CollaborationSubmission> => {
    const response = await fetch(`${API_BASE_URL}/collaborations/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    const result = await handleResponse(response);
    return normalizeCollaboration(result);
  },

  deleteCollaboration: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/collaborations/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeadersWithoutContentType(),
    });
    
    return handleResponse(response);
  },

  updateCollaborationStatus: async (id: number, status: string): Promise<CollaborationSubmission> => {
    const response = await fetch(`${API_BASE_URL}/collaborations/${id}/update_status/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    
    const result = await handleResponse(response);
    return normalizeCollaboration(result);
  },

  // ========== METADATA OPERATIONS ==========
  
  getInstructors: async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/workshops/instructors/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  },

  getLocations: async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/workshops/locations/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  },

  // ========== EXPORT OPERATIONS ==========
  
  exportWorkshops: async (format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> => {
    const response = await fetch(`${API_BASE_URL}/workshops/export/?format=${format}`, {
      headers: getAuthHeadersWithoutContentType(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.blob();
  },

  exportCollaborations: async (format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> => {
    const response = await fetch(`${API_BASE_URL}/collaborations/export/?format=${format}`, {
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
  getAll: getAllWorkshops,
  getById: getWorkshopById,
  create: createWorkshop,
  update: updateWorkshop,
  delete: deleteWorkshop,
  getFeatured: getFeaturedWorkshops,
  getUpcoming: getUpcomingWorkshops,
  getAnalytics: getWorkshopAnalytics,
  toggleFeatured: toggleWorkshopFeatured,
  updateStatus: updateWorkshopStatus,
  uploadImage: uploadWorkshopImage,
  getCollaborations: getCollaborationSubmissions,
  getCollaborationById: getCollaborationSubmissionById,
  createCollaboration: createCollaborationSubmission,
  updateCollaboration: updateCollaborationSubmission,
  deleteCollaboration: deleteCollaborationSubmission,
  updateCollaborationStatus: updateCollaborationSubmissionStatus,
  getInstructors: getWorkshopInstructors,
  getLocations: getWorkshopLocations,
  exportWorkshops,
  exportCollaborations,
} = workshopsApi;