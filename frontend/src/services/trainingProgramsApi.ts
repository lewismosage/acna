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

export interface TrainingProgram {
  id: number;
  title: string;
  description: string;
  type: 'Conference' | 'Workshop' | 'Fellowship' | 'Online Course' | 'Masterclass';
  category: string;
  status: 'Published' | 'Draft' | 'Archived';
  isFeatured: boolean;
  duration: string;
  format: 'In-person' | 'Virtual' | 'Hybrid';
  location: string;
  maxParticipants: number;
  currentEnrollments: number;
  instructor: string;
  startDate: string;
  endDate: string;
  price: number;
  currency: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  registrationDeadline: string;
  prerequisites: string[];
  learningOutcomes: string[];
  certificationType: string;
  cmeCredits: number;
  schedule?: ScheduleItem[];
  speakers?: Speaker[];
  topics?: string[];
  targetAudience?: string[];
  language?: string;
  timezone?: string;
  materials?: string[];
  assessmentMethod?: string;
  passingScore?: number;
}

export interface ScheduleItem {
  day: string;
  time: string;
  activity: string;
  speaker: string;
}

export interface Speaker {
  name: string;
  title: string;
  organization: string;
  bio: string;
}

export interface Registration {
  id: number;
  programId: number;
  programTitle: string;
  participantName: string;
  participantEmail: string;
  participantPhone: string;
  organization: string;
  profession: string;
  experience: string;
  registrationDate: string;
  status: 'Pending' | 'Confirmed' | 'Waitlisted' | 'Cancelled';
  paymentStatus: 'Pending' | 'Paid' | 'Refunded';
  specialRequests: string;
}

export interface CreateTrainingProgramInput {
  title: string;
  description: string;
  type: 'Conference' | 'Workshop' | 'Fellowship' | 'Online Course' | 'Masterclass';
  category: string;
  status: 'Published' | 'Draft' | 'Archived';
  isFeatured: boolean;
  duration: string;
  format: 'In-person' | 'Virtual' | 'Hybrid';
  location: string;
  maxParticipants: number;
  instructor: string;
  startDate: string;
  endDate: string;
  price: number;
  currency: string;
  imageFile?: File | null;
  registrationDeadline: string;
  prerequisites: string[];
  learningOutcomes: string[];
  certificationType: string;
  cmeCredits: number;
  schedule?: ScheduleItem[];
  speakers?: Speaker[];
  topics?: string[];
  targetAudience?: string[];
  language?: string;
  timezone?: string;
  materials?: string[];
  assessmentMethod?: string;
  passingScore?: number;
}

export interface TrainingProgramAnalytics {
  totalPrograms: number;
  totalEnrollments: number;
  totalRevenue: number;
  averageFillRate: number;
  programsByStatus: {
    published: number;
    draft: number;
    archived: number;
    featured: number;
  };
  programsByType: Record<string, number>;
  monthlyRevenue: number;
  upcomingPrograms: number;
  topPrograms?: Array<{
    id: number;
    title: string;
    category: string;
    enrollments: number;
    revenue: number;
  }>;
}

const normalizeTrainingProgram = (backendProgram: any): TrainingProgram => {
  const safeArray = (arr: any): string[] => {
    if (!Array.isArray(arr)) return [];
    return arr.filter((item: any) => typeof item === 'string' && item.trim());
  };

  return {
    id: backendProgram.id || 0,
    title: backendProgram.title || '',
    description: backendProgram.description || '',
    type: backendProgram.type || 'Conference',
    category: backendProgram.category || '',
    status: backendProgram.status || 'Draft',
    isFeatured: backendProgram.is_featured || false,
    duration: backendProgram.duration || '',
    format: backendProgram.format || 'In-person',
    location: backendProgram.location || '',
    maxParticipants: backendProgram.max_participants || 0,
    currentEnrollments: backendProgram.current_enrollments || 0,
    instructor: backendProgram.instructor || '',
    startDate: backendProgram.start_date || '',
    endDate: backendProgram.end_date || '',
    price: backendProgram.price || 0,
    currency: backendProgram.currency || 'USD',
    imageUrl: backendProgram.image_url || '/api/placeholder/400/250',
    createdAt: backendProgram.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    updatedAt: backendProgram.updated_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    registrationDeadline: backendProgram.registration_deadline || '',
    prerequisites: safeArray(backendProgram.prerequisites),
    learningOutcomes: safeArray(backendProgram.learning_outcomes),
    certificationType: backendProgram.certificate_type || 'CME Certificate',
    cmeCredits: backendProgram.cme_credits || 0,
    schedule: backendProgram.schedule || [],
    speakers: backendProgram.speakers || [],
    topics: safeArray(backendProgram.topics),
    targetAudience: safeArray(backendProgram.target_audience),
    language: backendProgram.language || 'English',
    timezone: backendProgram.timezone || 'GMT',
    materials: safeArray(backendProgram.materials),
    assessmentMethod: backendProgram.assessment_method || 'None',
    passingScore: backendProgram.passing_score,
  };
};

const normalizeRegistration = (backendRegistration: any): Registration => {
  return {
    id: backendRegistration.id || 0,
    programId: backendRegistration.program_id || 0,
    programTitle: backendRegistration.program_title || '',
    participantName: backendRegistration.participant_name || '',
    participantEmail: backendRegistration.participant_email || '',
    participantPhone: backendRegistration.participant_phone || '',
    organization: backendRegistration.organization || '',
    profession: backendRegistration.profession || '',
    experience: backendRegistration.experience || '',
    registrationDate: backendRegistration.registration_date?.split('T')[0] || new Date().toISOString().split('T')[0],
    status: backendRegistration.status || 'Pending',
    paymentStatus: backendRegistration.payment_status || 'Pending',
    specialRequests: backendRegistration.special_requests || '',
  };
};

export const trainingProgramsApi = {
  // ========== TRAINING PROGRAM CRUD OPERATIONS ==========
  
  getAll: async (params?: {
    status?: string;
    category?: string;
    featured?: boolean;
    search?: string;
    type?: string;
  }): Promise<TrainingProgram[]> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/training-programs/?${searchParams.toString()}`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data.map(normalizeTrainingProgram) : [];
  },

  getById: async (id: number): Promise<TrainingProgram> => {
    const response = await fetch(`${API_BASE_URL}/training-programs/${id}/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return normalizeTrainingProgram(data);
  },

  create: async (data: CreateTrainingProgramInput): Promise<TrainingProgram> => {
    const formData = new FormData();
    
    // Handle array fields by stringifying them
    const arrayFields = ['prerequisites', 'learningOutcomes', 'topics', 'targetAudience', 'materials'];
    Object.entries(data).forEach(([key, value]) => {
      if (arrayFields.includes(key) && Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else if (key === 'schedule' && Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else if (key === 'speakers' && Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else if (key === 'imageFile' && value instanceof File) {
        formData.append('image', value);
      } else if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });
  
    const response = await fetch(`${API_BASE_URL}/training-programs/`, {
      method: 'POST',
      headers: getAuthHeadersWithoutContentType(),
      body: formData,
    });
    
    const result = await handleResponse(response);
    return normalizeTrainingProgram(result);
  },
  
  update: async (id: number, data: Partial<CreateTrainingProgramInput>): Promise<TrainingProgram> => {
    const formData = new FormData();
    
    // Handle array fields by stringifying them
    const arrayFields = ['prerequisites', 'learningOutcomes', 'topics', 'targetAudience', 'materials'];
    Object.entries(data).forEach(([key, value]) => {
      if (arrayFields.includes(key) && Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else if (key === 'schedule' && Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else if (key === 'speakers' && Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else if (key === 'imageFile' && value instanceof File) {
        formData.append('image', value);
      } else if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });
  
    const response = await fetch(`${API_BASE_URL}/training-programs/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeadersWithoutContentType(),
      body: formData,
    });
    
    const result = await handleResponse(response);
    return normalizeTrainingProgram(result);
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/training-programs/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeadersWithoutContentType(),
    });
    
    return handleResponse(response);
  },

  // ========== PROGRAM-SPECIFIC OPERATIONS ==========
  
  getFeatured: async (): Promise<TrainingProgram[]> => {
    const response = await fetch(`${API_BASE_URL}/training-programs/featured/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data.map(normalizeTrainingProgram) : [];
  },

  getByStatus: async (status: string): Promise<TrainingProgram[]> => {
    const response = await fetch(`${API_BASE_URL}/training-programs/?status=${status}`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data.map(normalizeTrainingProgram) : [];
  },

  getAnalytics: async (): Promise<TrainingProgramAnalytics> => {
    const response = await fetch(`${API_BASE_URL}/training-programs/analytics/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    
    // Normalize the analytics data
    return {
      totalPrograms: data.total_programs || 0,
      totalEnrollments: data.total_enrollments || 0,
      totalRevenue: data.total_revenue || 0,
      averageFillRate: data.average_fill_rate || 0,
      programsByStatus: {
        published: data.programs_by_status?.published || 0,
        draft: data.programs_by_status?.draft || 0,
        archived: data.programs_by_status?.archived || 0,
        featured: data.programs_by_status?.featured || 0,
      },
      programsByType: data.programs_by_type || {},
      monthlyRevenue: data.monthly_revenue || 0,
      upcomingPrograms: data.upcoming_programs || 0,
      topPrograms: (data.top_programs || []).map((program: {
        id?: number;
        title?: string;
        category?: string;
        enrollments?: number;
        revenue?: number;
      }) => ({
        id: program.id || 0,
        title: program.title || '',
        category: program.category || '',
        enrollments: program.enrollments || 0,
        revenue: program.revenue || 0,
      })),
    };
  },

  toggleFeatured: async (id: number): Promise<TrainingProgram> => {
    const response = await fetch(`${API_BASE_URL}/training-programs/${id}/toggle_featured/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    const result = await handleResponse(response);
    return normalizeTrainingProgram(result);
  },

  updateStatus: async (id: number, status: string): Promise<TrainingProgram> => {
    const response = await fetch(`${API_BASE_URL}/training-programs/${id}/update_status/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    
    const result = await handleResponse(response);
    return normalizeTrainingProgram(result);
  },

  // ========== REGISTRATION OPERATIONS ==========
  
  getRegistrations: async (programId?: number): Promise<Registration[]> => {
    const url = programId 
      ? `${API_BASE_URL}/training-programs/${programId}/registrations/`
      : `${API_BASE_URL}/registrations/`;
      
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data.map(normalizeRegistration) : [];
  },

  createRegistration: async (registrationData: Partial<Registration>): Promise<Registration> => {
    const response = await fetch(`${API_BASE_URL}/registrations/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(registrationData),
    });
    
    const result = await handleResponse(response);
    return normalizeRegistration(result);
  },

  updateRegistration: async (id: number, updates: Partial<Registration>): Promise<Registration> => {
    const response = await fetch(`${API_BASE_URL}/registrations/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    
    const result = await handleResponse(response);
    return normalizeRegistration(result);
  },

  deleteRegistration: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/registrations/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeadersWithoutContentType(),
    });
    
    return handleResponse(response);
  },

  // ========== FILE UPLOAD OPERATIONS ==========
  
  uploadImage: async (file: File): Promise<{ url: string; filename: string; path: string }> => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`${API_BASE_URL}/training-programs/upload_image/`, {
      method: 'POST',
      headers: getAuthHeadersWithoutContentType(),
      body: formData,
    });
    
    return handleResponse(response);
  },

  // ========== METADATA OPERATIONS ==========
  
  getCategories: async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/training-programs/categories/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  },

  getInstructors: async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/training-programs/instructors/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  },

  getTargetAudiences: async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/training-programs/target_audiences/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  },

  // ========== BULK OPERATIONS ==========
  
  bulkUpdateStatus: async (ids: number[], status: string): Promise<TrainingProgram[]> => {
    const response = await fetch(`${API_BASE_URL}/training-programs/bulk_update_status/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ids, status }),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data.map(normalizeTrainingProgram) : [];
  },

  bulkDelete: async (ids: number[]): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/training-programs/bulk_delete/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ids }),
    });
    
    return handleResponse(response);
  },

  // ========== EXPORT OPERATIONS ==========
  
  exportToCSV: async (filters?: Record<string, any>): Promise<Blob> => {
    const searchParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/training-programs/export/?${searchParams.toString()}`, {
      headers: getAuthHeadersWithoutContentType(),
    });
    
    if (!response.ok) {
      throw new Error('Export failed');
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
  delete: deleteTrainingProgram,
  getFeatured,
  getByStatus,
  getAnalytics,
  toggleFeatured,
  updateStatus,
  getRegistrations,
  createRegistration,
  updateRegistration,
  deleteRegistration,
  uploadImage,
  getCategories,
  getInstructors,
  getTargetAudiences,
  bulkUpdateStatus,
  bulkDelete,
  exportToCSV,
} = trainingProgramsApi;