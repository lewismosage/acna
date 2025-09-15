// trainingProgramsApi.js - Fixed version
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
      console.error('API Error Response:', errorData);
      
      // Handle validation errors specifically
      if (errorData.details) {
        const validationErrors = Object.entries(errorData.details)
          .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
          .join('; ');
        errorMessage = `Validation Error: ${validationErrors}`;
      } else {
        errorMessage = errorData.error || errorData.message || errorMessage;
      }
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

// Export types
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
    isFeatured: backendProgram.isFeatured || backendProgram.is_featured || false,
    duration: backendProgram.duration || '',
    format: backendProgram.format || 'In-person',
    location: backendProgram.location || '',
    maxParticipants: backendProgram.maxParticipants || backendProgram.max_participants || 0,
    currentEnrollments: backendProgram.currentEnrollments || backendProgram.current_enrollments || 0,
    instructor: backendProgram.instructor || '',
    startDate: backendProgram.startDate || backendProgram.start_date || '',
    endDate: backendProgram.endDate || backendProgram.end_date || '',
    price: backendProgram.price || 0,
    currency: backendProgram.currency || 'USD',
    imageUrl: backendProgram.imageUrl || backendProgram.image_url || '/api/placeholder/400/250',
    createdAt: (backendProgram.createdAt || backendProgram.created_at || '').split('T')[0] || new Date().toISOString().split('T')[0],
    updatedAt: (backendProgram.updatedAt || backendProgram.updated_at || '').split('T')[0] || new Date().toISOString().split('T')[0],
    registrationDeadline: backendProgram.registrationDeadline || backendProgram.registration_deadline || '',
    prerequisites: safeArray(backendProgram.prerequisites || backendProgram.prerequisites),
    learningOutcomes: safeArray(backendProgram.learningOutcomes || backendProgram.learning_outcomes),
    certificationType: backendProgram.certificationType || backendProgram.certificate_type || 'CME Certificate',
    cmeCredits: backendProgram.cmeCredits || backendProgram.cme_credits || 0,
    schedule: backendProgram.schedule || [],
    speakers: backendProgram.speakers || [],
    topics: safeArray(backendProgram.topics),
    targetAudience: safeArray(backendProgram.targetAudience || backendProgram.target_audience),
    language: backendProgram.language || 'English',
    timezone: backendProgram.timezone || 'GMT',
    materials: safeArray(backendProgram.materials),
    assessmentMethod: backendProgram.assessmentMethod || backendProgram.assessment_method || 'None',
    passingScore: backendProgram.passingScore || backendProgram.passing_score,
  };
};

const normalizeRegistration = (backendRegistration: any): Registration => {
  return {
    id: backendRegistration.id || 0,
    programId: backendRegistration.programId || backendRegistration.program_id || backendRegistration.program || 0,
    programTitle: backendRegistration.programTitle || backendRegistration.program_title || backendRegistration.program?.title || '',
    participantName: backendRegistration.participantName || backendRegistration.participant_name || '',
    participantEmail: backendRegistration.participantEmail || backendRegistration.participant_email || '',
    participantPhone: backendRegistration.participantPhone || backendRegistration.participant_phone || '',
    organization: backendRegistration.organization || '',
    profession: backendRegistration.profession || '',
    experience: backendRegistration.experience || '',
    registrationDate: (backendRegistration.registrationDate || backendRegistration.registration_date || '').split('T')[0] || new Date().toISOString().split('T')[0],
    status: backendRegistration.status || 'Pending',
    paymentStatus: backendRegistration.paymentStatus || backendRegistration.payment_status || 'Pending',
    specialRequests: backendRegistration.specialRequests || backendRegistration.special_requests || '',
  };
};

// Helper function to prepare form data with proper validation
const prepareFormData = (data: CreateTrainingProgramInput): FormData => {
  const formData = new FormData();
  
  console.log('Preparing form data from:', data);
  
  // Helper to safely add string values
  const addStringField = (key: string, value: any, required: boolean = false) => {
    if (value !== null && value !== undefined) {
      const stringValue = String(value).trim();
      if (stringValue || !required) {
        formData.append(key, stringValue);
        console.log(`Added ${key}:`, stringValue);
      } else if (required) {
        console.warn(`Required field ${key} is empty`);
      }
    } else if (required) {
      console.warn(`Required field ${key} is null/undefined`);
    }
  };
  
  // Helper to safely add numeric values
  const addNumericField = (key: string, value: any, defaultValue: number = 0) => {
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      const numericValue = Number(value);
      if (!isNaN(numericValue)) {
        formData.append(key, String(numericValue));
        console.log(`Added ${key}:`, numericValue);
      } else {
        formData.append(key, String(defaultValue));
        console.warn(`Invalid numeric value for ${key}, using default:`, defaultValue);
      }
    } else {
      formData.append(key, String(defaultValue));
      console.log(`Added ${key} (default):`, defaultValue);
    }
  };
  
  // Helper to add array fields as JSON
  const addArrayField = (key: string, value: any) => {
    if (Array.isArray(value)) {
      const filteredArray = value.filter(item => item && String(item).trim());
      formData.append(key, JSON.stringify(filteredArray));
      console.log(`Added ${key}:`, filteredArray);
    } else {
      formData.append(key, JSON.stringify([]));
      console.log(`Added ${key} (empty array)`);
    }
  };
  
  // Add required fields
  addStringField('title', data.title, true);
  addStringField('description', data.description, true);
  addStringField('category', data.category, true);
  addStringField('instructor', data.instructor, true);
  addStringField('duration', data.duration, true);
  
  // Add optional string fields
  addStringField('type', data.type || 'Conference');
  addStringField('format', data.format || 'In-person');
  addStringField('location', data.location || '');
  addStringField('status', data.status || 'Draft');
  addStringField('currency', data.currency || 'USD');
  addStringField('timezone', data.timezone || 'GMT');
  addStringField('language', data.language || 'English');
  addStringField('certificationType', data.certificationType || 'CME Certificate');
  addStringField('assessmentMethod', data.assessmentMethod || 'None');
  
  // Add required date fields
  addStringField('startDate', data.startDate, true);
  addStringField('endDate', data.endDate, true);
  addStringField('registrationDeadline', data.registrationDeadline, true);
  
  // Add numeric fields
  addNumericField('maxParticipants', data.maxParticipants, 1);
  addNumericField('price', data.price, 0);
  addNumericField('cmeCredits', data.cmeCredits, 0);
  if (data.passingScore !== undefined && data.passingScore !== null) {
    addNumericField('passingScore', data.passingScore);
  }
  
  // Add boolean field
  formData.append('isFeatured', String(Boolean(data.isFeatured)));
  console.log('Added isFeatured:', Boolean(data.isFeatured));
  
  // Add URL field (can be empty)
  //addStringField('imageUrl', data.imageUrl || '');
  
  // Add array fields
  addArrayField('prerequisites', data.prerequisites);
  addArrayField('learningOutcomes', data.learningOutcomes);
  addArrayField('topics', data.topics);
  addArrayField('targetAudience', data.targetAudience);
  addArrayField('materials', data.materials);
  
  // Add complex objects
  if (data.schedule && Array.isArray(data.schedule)) {
    formData.append('schedule', JSON.stringify(data.schedule));
    console.log('Added schedule:', data.schedule);
  } else {
    formData.append('schedule', JSON.stringify([]));
  }
  
  if (data.speakers && Array.isArray(data.speakers)) {
    formData.append('speakers', JSON.stringify(data.speakers));
    console.log('Added speakers:', data.speakers);
  } else {
    formData.append('speakers', JSON.stringify([]));
  }
  
  // Add file if present
  if (data.imageFile && data.imageFile instanceof File) {
    formData.append('image', data.imageFile);
    console.log('Added image file:', data.imageFile.name);
  }
  
  console.log('Form data preparation completed');
  return formData;
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
    try {
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
    } catch (error) {
      console.error('Error fetching training programs:', error);
      throw error;
    }
  },

  getById: async (id: number): Promise<TrainingProgram> => {
    try {
      const response = await fetch(`${API_BASE_URL}/training-programs/${id}/`, {
        headers: getAuthHeaders(),
      });
      
      const data = await handleResponse(response);
      return normalizeTrainingProgram(data);
    } catch (error) {
      console.error('Error fetching training program:', error);
      throw error;
    }
  },

  create: async (data: CreateTrainingProgramInput): Promise<TrainingProgram> => {
    try {
      console.log('Creating training program with data:', data);
      
      // Validate required fields before sending
      const requiredFields = ['title', 'description', 'category', 'instructor', 'startDate', 'endDate', 'registrationDeadline'];
      const missingFields = requiredFields.filter(field => !data[field as keyof CreateTrainingProgramInput] || String(data[field as keyof CreateTrainingProgramInput]).trim() === '');
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
      
      // Validate dates
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      const registrationDeadline = new Date(data.registrationDeadline);
      
      if (startDate >= endDate) {
        throw new Error('End date must be after start date');
      }
      
      if (registrationDeadline >= startDate) {
        throw new Error('Registration deadline must be before start date');
      }
      
      // Validate numeric fields
      if (data.maxParticipants <= 0) {
        throw new Error('Maximum participants must be greater than 0');
      }
      
      if (data.price < 0) {
        throw new Error('Price cannot be negative');
      }
      
      const formData = prepareFormData(data);
      
      const response = await fetch(`${API_BASE_URL}/training-programs/`, {
        method: 'POST',
        headers: getAuthHeadersWithoutContentType(),
        body: formData,
      });
      
      const result = await handleResponse(response);
      console.log('Training program created successfully:', result);
      return normalizeTrainingProgram(result);
    } catch (error) {
      console.error('Error creating training program:', error);
      throw error;
    }
  },
  
  update: async (id: number, data: Partial<CreateTrainingProgramInput>): Promise<TrainingProgram> => {
    try {
      console.log('Updating training program with data:', data);
      
      const formData = prepareFormData(data as CreateTrainingProgramInput);
      
      const response = await fetch(`${API_BASE_URL}/training-programs/${id}/`, {
        method: 'PATCH',
        headers: getAuthHeadersWithoutContentType(),
        body: formData,
      });
      
      const result = await handleResponse(response);
      console.log('Training program updated successfully:', result);
      return normalizeTrainingProgram(result);
    } catch (error) {
      console.error('Error updating training program:', error);
      throw error;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/training-programs/${id}/`, {
        method: 'DELETE',
        headers: getAuthHeadersWithoutContentType(),
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Error deleting training program:', error);
      throw error;
    }
  },

  // ========== PROGRAM-SPECIFIC OPERATIONS ==========
  
  getFeatured: async (): Promise<TrainingProgram[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/training-programs/featured/`, {
        headers: getAuthHeaders(),
      });
      
      const data = await handleResponse(response);
      return Array.isArray(data) ? data.map(normalizeTrainingProgram) : [];
    } catch (error) {
      console.error('Error fetching featured programs:', error);
      throw error;
    }
  },

  getByStatus: async (status: string): Promise<TrainingProgram[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/training-programs/?status=${status}`, {
        headers: getAuthHeaders(),
      });
      
      const data = await handleResponse(response);
      return Array.isArray(data) ? data.map(normalizeTrainingProgram) : [];
    } catch (error) {
      console.error('Error fetching programs by status:', error);
      throw error;
    }
  },

  getAnalytics: async (): Promise<TrainingProgramAnalytics> => {
    try {
      const response = await fetch(`${API_BASE_URL}/training-programs/analytics/`, {
        headers: getAuthHeaders(),
      });
      
      const data = await handleResponse(response);
      
      // Normalize the analytics data
      return {
        totalPrograms: data.totalPrograms || data.total_programs || 0,
        totalEnrollments: data.totalEnrollments || data.total_enrollments || 0,
        totalRevenue: data.totalRevenue || data.total_revenue || 0,
        averageFillRate: data.averageFillRate || data.average_fill_rate || 0,
        programsByStatus: data.programsByStatus || data.programs_by_status || {
          published: 0,
          draft: 0,
          archived: 0,
          featured: 0,
        },
        programsByType: data.programsByType || data.programs_by_type || {},
        monthlyRevenue: data.monthlyRevenue || data.monthly_revenue || 0,
        upcomingPrograms: data.upcomingPrograms || data.upcoming_programs || 0,
        topPrograms: (data.topPrograms || data.top_programs || []).map((program: any) => ({
          id: program.id || 0,
          title: program.title || '',
          category: program.category || '',
          enrollments: program.enrollments || 0,
          revenue: program.revenue || 0,
        })),
      };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  },

  toggleFeatured: async (id: number): Promise<TrainingProgram> => {
    try {
      const response = await fetch(`${API_BASE_URL}/training-programs/${id}/toggle_featured/`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      
      const result = await handleResponse(response);
      return normalizeTrainingProgram(result);
    } catch (error) {
      console.error('Error toggling featured status:', error);
      throw error;
    }
  },

  updateStatus: async (id: number, status: string): Promise<TrainingProgram> => {
    try {
      const response = await fetch(`${API_BASE_URL}/training-programs/${id}/update_status/`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      });
      
      const result = await handleResponse(response);
      return normalizeTrainingProgram(result);
    } catch (error) {
      console.error('Error updating status:', error);
      throw error;
    }
  },

  // ========== REGISTRATION OPERATIONS ==========
  
  getRegistrations: async (programId?: number): Promise<Registration[]> => {
    try {
      // Use the specific training program registrations endpoint
      const url = programId 
        ? `${API_BASE_URL}/training-programs/${programId}/registrations/`
        : `${API_BASE_URL}/training-program-registrations/`;
        
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });
      
      const data = await handleResponse(response);
      return Array.isArray(data) ? data.map(normalizeRegistration) : [];
    } catch (error) {
      console.error('Error fetching registrations:', error);
      throw error;
    }
  },

  createRegistration: async (registrationData: Partial<Registration>): Promise<Registration> => {
    try {
      console.log('Creating registration with data:', registrationData);
      
      // Map frontend field names to backend field names
      const backendData = {
        program: registrationData.programId,
        participant_name: registrationData.participantName,
        participant_email: registrationData.participantEmail,
        participant_phone: registrationData.participantPhone,
        organization: registrationData.organization,
        profession: registrationData.profession,
        experience: registrationData.experience,
        special_requests: registrationData.specialRequests || '',
        status: registrationData.status || 'Pending',
        payment_status: registrationData.paymentStatus || 'Pending'
      };

      console.log('Mapped backend data:', backendData);

      // Validate required fields
      const requiredFields = [
        { field: 'program', value: backendData.program },
        { field: 'participant_name', value: backendData.participant_name },
        { field: 'participant_email', value: backendData.participant_email },
        { field: 'participant_phone', value: backendData.participant_phone },
        { field: 'organization', value: backendData.organization },
        { field: 'profession', value: backendData.profession },
        { field: 'experience', value: backendData.experience }
      ];

      const missingFields = requiredFields.filter(
        ({ value }) => !value || String(value).trim() === ''
      ).map(({ field }) => field);

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Use the specific training program registrations endpoint
      const response = await fetch(`${API_BASE_URL}/training-program-registrations/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(backendData),
      });
      
      const result = await handleResponse(response);
      console.log('Registration created successfully:', result);
      return normalizeRegistration(result);
    } catch (error) {
      console.error('Error creating registration:', error);
      throw error;
    }
  },

  updateRegistration: async (id: number, updates: Partial<Registration>): Promise<Registration> => {
    try {
      // Map frontend updates to backend field names
      const backendUpdates: any = {};
      
      if (updates.participantName !== undefined) backendUpdates.participant_name = updates.participantName;
      if (updates.participantEmail !== undefined) backendUpdates.participant_email = updates.participantEmail;
      if (updates.participantPhone !== undefined) backendUpdates.participant_phone = updates.participantPhone;
      if (updates.organization !== undefined) backendUpdates.organization = updates.organization;
      if (updates.profession !== undefined) backendUpdates.profession = updates.profession;
      if (updates.experience !== undefined) backendUpdates.experience = updates.experience;
      if (updates.status !== undefined) backendUpdates.status = updates.status;
      if (updates.paymentStatus !== undefined) backendUpdates.payment_status = updates.paymentStatus;
      if (updates.specialRequests !== undefined) backendUpdates.special_requests = updates.specialRequests;

      const response = await fetch(`${API_BASE_URL}/training-program-registrations/${id}/`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(backendUpdates),
      });
      
      const result = await handleResponse(response);
      return normalizeRegistration(result);
    } catch (error) {
      console.error('Error updating registration:', error);
      throw error;
    }
  },

  deleteRegistration: async (id: number): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/training-program-registrations/${id}/`, {
        method: 'DELETE',
        headers: getAuthHeadersWithoutContentType(),
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Error deleting registration:', error);
      throw error;
    }
  },

  // ========== FILE UPLOAD OPERATIONS ==========
  
  uploadImage: async (file: File): Promise<{ url: string; filename: string; path: string }> => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch(`${API_BASE_URL}/training-programs/upload_image/`, {
        method: 'POST',
        headers: getAuthHeadersWithoutContentType(),
        body: formData,
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },

  // ========== METADATA OPERATIONS ==========
  
  getCategories: async (): Promise<string[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/training-programs/categories/`, {
        headers: getAuthHeaders(),
      });
      
      const data = await handleResponse(response);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  getInstructors: async (): Promise<string[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/training-programs/instructors/`, {
        headers: getAuthHeaders(),
      });
      
      const data = await handleResponse(response);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching instructors:', error);
      throw error;
    }
  },

  getTargetAudiences: async (): Promise<string[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/training-programs/target_audiences/`, {
        headers: getAuthHeaders(),
      });
      
      const data = await handleResponse(response);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching target audiences:', error);
      throw error;
    }
  },

  // ========== BULK OPERATIONS ==========
  
  bulkUpdateStatus: async (ids: number[], status: string): Promise<TrainingProgram[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/training-programs/bulk_update_status/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ids, status }),
      });
      
      const data = await handleResponse(response);
      return Array.isArray(data) ? data.map(normalizeTrainingProgram) : [];
    } catch (error) {
      console.error('Error bulk updating status:', error);
      throw error;
    }
  },

  bulkDelete: async (ids: number[]): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/training-programs/bulk_delete/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ids }),
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Error bulk deleting:', error);
      throw error;
    }
  },

  // ========== EXPORT OPERATIONS ==========
  
  exportToCSV: async (filters?: Record<string, any>): Promise<Blob> => {
    try {
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
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      throw error;
    }
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