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

// Types matching your React components
export type ResearchProjectType = 
  | 'Clinical Trial' 
  | 'Observational Study' 
  | 'Intervention Study' 
  | 'Epidemiological Study' 
  | 'Genetic Research' 
  | 'Cohort Study' 
  | 'Case-Control Study'
  | 'Systematic Review'
  | 'Meta-Analysis';

export type ResearchProjectStatus = 
  | 'Planning' 
  | 'Active' 
  | 'Recruiting' 
  | 'Data Collection' 
  | 'Analysis' 
  | 'Completed' 
  | 'Suspended' 
  | 'Terminated';

export interface Investigator {
  name: string;
  role: string;
  affiliation: string;
  email?: string;
}

export interface ResearchProject {
  id: number;
  title: string;
  description: string;
  type: ResearchProjectType;
  status: ResearchProjectStatus;
  principalInvestigator: string;
  investigators: Investigator[];
  institutions: string[];
  startDate: string;
  endDate: string;
  fundingSource?: string;
  fundingAmount?: string;
  targetPopulation: string;
  sampleSize?: number;
  objectives: string[];
  methodology: string;
  ethicsApproval: boolean;
  registrationNumber?: string;
  keywords: string[];
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  investigatorCount?: number;
  durationDays?: number;
  isActive?: boolean;
}

export interface CreateResearchProjectInput {
  title: string;
  description: string;
  type: ResearchProjectType;
  status: ResearchProjectStatus;
  principalInvestigator: string;
  investigators: Investigator[];
  institutions: string[];
  startDate: string;
  endDate: string;
  fundingSource?: string;
  fundingAmount?: string;
  targetPopulation: string;
  sampleSize?: number;
  objectives: string[];
  methodology: string;
  ethicsApproval: boolean;
  registrationNumber?: string;
  keywords: string[];
  imageFile?: File;
}

export interface ResearchProjectAnalytics {
  total: number;
  planning: number;
  active: number;
  recruiting: number;
  dataCollection: number;
  analysis: number;
  completed: number;
  suspended: number;
  terminated: number;
  projectsByType: {
    [key: string]: number;
  };
  projectsByStatus: {
    [key: string]: number;
  };
  totalInvestigators: number;
  projectsWithEthicsApproval: number;
  avgDurationDays?: number;
}

export interface ResearchProjectUpdate {
  id: number;
  researchProject: number;
  title: string;
  description: string;
  updateType: 'Milestone' | 'Status Change' | 'Publication' | 'General Update';
  createdAt: string;
}

const normalizeResearchProject = (backendProject: any): ResearchProject => {
  const safeArray = (arr: any): string[] => {
    if (!Array.isArray(arr)) return [];
    return arr.filter((item: any) => typeof item === 'string' && item.trim());
  };

  const safeInvestigatorArray = (arr: any): Investigator[] => {
    if (!Array.isArray(arr)) return [];
    return arr.filter((item: any) => 
      typeof item === 'object' && item.name && item.role && item.affiliation
    );
  };

  return {
    id: backendProject.id || 0,
    title: backendProject.title || '',
    description: backendProject.description || '',
    type: backendProject.type || 'Clinical Trial',
    status: backendProject.status || 'Planning',
    principalInvestigator: backendProject.principalInvestigator || backendProject.principal_investigator || '',
    investigators: safeInvestigatorArray(backendProject.investigators),
    institutions: safeArray(backendProject.institutions),
    startDate: backendProject.startDate || backendProject.start_date || '',
    endDate: backendProject.endDate || backendProject.end_date || '',
    fundingSource: backendProject.fundingSource || backendProject.funding_source,
    fundingAmount: backendProject.fundingAmount || backendProject.funding_amount,
    targetPopulation: backendProject.targetPopulation || backendProject.target_population || '',
    sampleSize: backendProject.sampleSize || backendProject.sample_size,
    objectives: safeArray(backendProject.objectives),
    methodology: backendProject.methodology || '',
    ethicsApproval: backendProject.ethicsApproval || backendProject.ethics_approval || false,
    registrationNumber: backendProject.registrationNumber || backendProject.registration_number,
    keywords: safeArray(backendProject.keywords),
    imageUrl: backendProject.imageUrl || backendProject.image_url || 'https://images.pexels.com/photos/3985163/pexels-photo-3985163.jpeg?auto=compress&cs=tinysrgb&w=400',
    createdAt: backendProject.createdAt || backendProject.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    updatedAt: backendProject.updatedAt || backendProject.updated_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    investigatorCount: backendProject.investigatorCount || backendProject.investigator_count,
    durationDays: backendProject.durationDays || backendProject.duration_days,
    isActive: backendProject.isActive || backendProject.is_active,
  };
};

export const researchProjectsApi = {
  // ========== RESEARCH PROJECT CRUD OPERATIONS ==========
  
  getAll: async (params?: {
    status?: string;
    type?: string;
    ethics_approval?: boolean;
    active_only?: boolean;
    search?: string;
  }): Promise<ResearchProject[]> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/research-projects/?${searchParams.toString()}`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data.map(normalizeResearchProject) : [];
  },

  getById: async (id: number): Promise<ResearchProject> => {
    const response = await fetch(`${API_BASE_URL}/research-projects/${id}/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return normalizeResearchProject(data);
  },

  create: async (data: CreateResearchProjectInput): Promise<ResearchProject> => {
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
  
    const response = await fetch(`${API_BASE_URL}/research-projects/`, {
      method: 'POST',
      headers: getAuthHeadersWithoutContentType(), 
      body: formData,
    });
    
    const result = await handleResponse(response);
    return normalizeResearchProject(result);
  },
  
  update: async (id: number, data: Partial<CreateResearchProjectInput>): Promise<ResearchProject> => {
    const formData = new FormData();
    
    // Handle array fields by stringifying them
    const arrayFields = ['investigators', 'institutions', 'objectives', 'keywords'];
    Object.entries(data).forEach(([key, value]) => {
      if (arrayFields.includes(key) && Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else if (key === 'imageFile' && value instanceof File) {
        formData.append('image', value);
      } else if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });
  
    const response = await fetch(`${API_BASE_URL}/research-projects/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeadersWithoutContentType(),
      body: formData,
    });
    
    const result = await handleResponse(response);
    return normalizeResearchProject(result);
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/research-projects/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeadersWithoutContentType(),
    });
    
    return handleResponse(response);
  },

  // ========== RESEARCH PROJECT-SPECIFIC OPERATIONS ==========
  
  getActive: async (): Promise<ResearchProject[]> => {
    const response = await fetch(`${API_BASE_URL}/research-projects/active/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data.map(normalizeResearchProject) : [];
  },

  getByStatus: async (): Promise<{[key: string]: ResearchProject[]}> => {
    const response = await fetch(`${API_BASE_URL}/research-projects/by_status/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    const result: {[key: string]: ResearchProject[]} = {};
    
    for (const [status, projects] of Object.entries(data)) {
      result[status] = Array.isArray(projects) ? 
        (projects as any[]).map(normalizeResearchProject) : [];
    }
    
    return result;
  },

  getAnalytics: async (): Promise<ResearchProjectAnalytics> => {
    const response = await fetch(`${API_BASE_URL}/research-projects/analytics/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    
    // Normalize the analytics data
    return {
      total: data.total || 0,
      planning: data.planning || 0,
      active: data.active || 0,
      recruiting: data.recruiting || 0,
      dataCollection: data.dataCollection || data.data_collection || 0,
      analysis: data.analysis || 0,
      completed: data.completed || 0,
      suspended: data.suspended || 0,
      terminated: data.terminated || 0,
      projectsByType: data.projectsByType || data.projects_by_type || {},
      projectsByStatus: data.projectsByStatus || data.projects_by_status || {},
      totalInvestigators: data.totalInvestigators || data.total_investigators || 0,
      projectsWithEthicsApproval: data.projectsWithEthicsApproval || data.projects_with_ethics_approval || 0,
      avgDurationDays: data.avgDurationDays || data.avg_duration_days,
    };
  },

  updateStatus: async (id: number, status: ResearchProjectStatus): Promise<ResearchProject> => {
    const response = await fetch(`${API_BASE_URL}/research-projects/${id}/update_status/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    
    const result = await handleResponse(response);
    return normalizeResearchProject(result);
  },

  incrementView: async (id: number): Promise<void> => {
    await fetch(`${API_BASE_URL}/research-projects/${id}/increment_view/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  },

  // ========== FILE UPLOAD OPERATIONS ==========
  
  uploadImage: async (file: File): Promise<{ url: string; filename: string; path: string }> => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`${API_BASE_URL}/research-projects/upload_image/`, {
      method: 'POST',
      headers: getAuthHeadersWithoutContentType(),
      body: formData,
    });
    
    return handleResponse(response);
  },

  // ========== METADATA OPERATIONS ==========
  
  getInvestigators: async (): Promise<Investigator[]> => {
    const response = await fetch(`${API_BASE_URL}/research-projects/investigators/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  },

  getInstitutions: async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/research-projects/institutions/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  },

  getTypes: async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/research-projects/types/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  },

  getStatuses: async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/research-projects/statuses/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  },

  // ========== PROJECT UPDATES OPERATIONS ==========
  
  getUpdates: async (projectId: number): Promise<ResearchProjectUpdate[]> => {
    const response = await fetch(`${API_BASE_URL}/research-projects/${projectId}/updates/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  },

  addUpdate: async (projectId: number, updateData: {
    title: string;
    description: string;
    updateType: 'Milestone' | 'Status Change' | 'Publication' | 'General Update';
  }): Promise<ResearchProjectUpdate> => {
    const response = await fetch(`${API_BASE_URL}/research-projects/${projectId}/add_update/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData),
    });
    
    return handleResponse(response);
  },
};

// Export individual functions for convenience
export const {
  getAll,
  getById,
  create,
  update,
  delete: deleteResearchProject,
  getActive,
  getByStatus,
  getAnalytics,
  updateStatus,
  incrementView,
  uploadImage,
  getInvestigators,
  getInstitutions,
  getTypes,
  getStatuses,
  getUpdates,
  addUpdate,
} = researchProjectsApi;