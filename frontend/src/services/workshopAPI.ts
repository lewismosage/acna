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
  registrations?: WorkshopRegistration[];
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

export interface WorkshopRegistration {
  id: number;
  workshop: number;
  workshopTitle: string;
  workshopDate: string;
  workshopLocation: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  organization: string;
  profession: string;
  registrationType: string;
  paymentStatus: string;
  amount?: number;
  country?: string;
  registeredAt: string;
}

export interface CreateWorkshopRegistrationInput {
  workshop: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  organization?: string;
  profession?: string;
  registrationType: 'Free' | 'Paid' | 'Student' | 'Professional';
  amount?: number;
  country?: string;
}

export interface WorkshopRegistrationResponse {
  success: boolean;
  message: string;
  data?: WorkshopRegistration;
  registration_data?: any;
  payment_required?: boolean;
  amount?: number;
  workshop_id?: number;
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

// Add this normalization function for workshop registrations
const normalizeWorkshopRegistration = (backendRegistration: any): WorkshopRegistration => {
  return {
    id: backendRegistration.id || 0,
    workshop: backendRegistration.workshop || 0,
    workshopTitle: backendRegistration.workshopTitle || backendRegistration.workshop_title || '',
    workshopDate: backendRegistration.workshopDate || backendRegistration.workshop_date || '',
    workshopLocation: backendRegistration.workshopLocation || backendRegistration.workshop_location || '',
    firstName: backendRegistration.first_name || backendRegistration.firstName || '',
    lastName: backendRegistration.last_name || backendRegistration.lastName || '',
    fullName: backendRegistration.full_name || backendRegistration.fullName || '',
    email: backendRegistration.email || '',
    phone: backendRegistration.phone || '',
    organization: backendRegistration.organization || '',
    profession: backendRegistration.profession || '',
    registrationType: backendRegistration.registration_type || backendRegistration.registrationType || 'Free',
    paymentStatus: backendRegistration.payment_status || backendRegistration.paymentStatus || 'pending',
    amount: backendRegistration.amount,
    country: backendRegistration.country || '',
    registeredAt: backendRegistration.registered_at || backendRegistration.registeredAt || new Date().toISOString(),
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

  addCollaborationCommentsAndNotify: async (id: number, comments: string): Promise<CollaborationSubmission> => {
  const response = await fetch(`${API_BASE_URL}/collaborations/${id}/add_comments_and_notify/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ comments }),
  });
  
  const result = await handleResponse(response);
  
  
  if (result && result.data) {
    return normalizeCollaboration(result.data);
  } else if (result && result.collaboration) {
    return normalizeCollaboration(result.collaboration);
  } else {
    return normalizeCollaboration(result);
  }
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

  // ========== REGISTRATION MANAGEMENT ==========
  
  getRegistrations: async (params?: {
    workshopId?: number;
    registrationType?: string;
    paymentStatus?: string;
    search?: string;
  }): Promise<WorkshopRegistration[]> => {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Convert camelCase to snake_case for backend
          let backendKey = key;
          if (key === 'workshopId') backendKey = 'workshop_id';
          if (key === 'registrationType') backendKey = 'registration_type';
          if (key === 'paymentStatus') backendKey = 'payment_status';
          
          searchParams.append(backendKey, value.toString());
        }
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/workshop-registrations/?${searchParams.toString()}`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data.map(normalizeWorkshopRegistration) : [];
  },

  getWorkshopRegistrations: async (workshopId: number, params?: {
    registrationType?: string;
    paymentStatus?: string;
    search?: string;
  }): Promise<WorkshopRegistration[]> => {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          let backendKey = key;
          if (key === 'registrationType') backendKey = 'registration_type';
          if (key === 'paymentStatus') backendKey = 'payment_status';
          
          searchParams.append(backendKey, value.toString());
        }
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/workshops/${workshopId}/registrations/?${searchParams.toString()}`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data.map(normalizeWorkshopRegistration) : [];
  },

  createRegistration: async (data: CreateWorkshopRegistrationInput): Promise<WorkshopRegistrationResponse> => {
  // Convert camelCase to snake_case for backend
  const backendData = {
    workshop: data.workshop,
    first_name: data.firstName,
    last_name: data.lastName,
    email: data.email,
    phone: data.phone,
    organization: data.organization,
    profession: data.profession,
    registration_type: data.registrationType,
    amount: data.amount,
    country: data.country,
  };

  // Use the workshop-registrations endpoint
  const response = await fetch(`${API_BASE_URL}/workshop-registrations/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(backendData),
  });
  
  const result = await handleResponse(response);
  return result;
},

  createPaymentSession: async (workshopId: number, registrationData: any, amount: number): Promise<{ sessionId: string }> => {
    const response = await fetch(`${API_BASE_URL}/workshops/payment/create-checkout-session/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        workshop_id: workshopId,
        registration_data: registrationData,
        amount: amount,
      }),
    });
    
    return handleResponse(response);
  },

  verifyPayment: async (sessionId: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/workshops/payment/verify/?session_id=${sessionId}`, {
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  downloadInvoice: async (sessionId: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/workshops/payment/invoice/?session_id=${sessionId}`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'workshop_invoice.pdf';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading workshop invoice:', error);
      throw error;
    }
},

  updateRegistration: async (id: number, data: Partial<CreateWorkshopRegistrationInput>): Promise<WorkshopRegistration> => {
    // Convert camelCase to snake_case for backend
    const backendData: any = {};
    if (data.firstName !== undefined) backendData.first_name = data.firstName;
    if (data.lastName !== undefined) backendData.last_name = data.lastName;
    if (data.email !== undefined) backendData.email = data.email;
    if (data.phone !== undefined) backendData.phone = data.phone;
    if (data.organization !== undefined) backendData.organization = data.organization;
    if (data.profession !== undefined) backendData.profession = data.profession;
    if (data.registrationType !== undefined) backendData.registration_type = data.registrationType;
    if (data.amount !== undefined) backendData.amount = data.amount;
    if (data.country !== undefined) backendData.country = data.country;
    if (data.workshop !== undefined) backendData.workshop = data.workshop;

    const response = await fetch(`${API_BASE_URL}/workshop-registrations/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(backendData),
    });
    
    const result = await handleResponse(response);
    return normalizeWorkshopRegistration(result);
  },

  deleteRegistration: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/workshop-registrations/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeadersWithoutContentType(),
    });
    
    return handleResponse(response);
  },

  updatePaymentStatus: async (id: number, paymentStatus: string): Promise<WorkshopRegistration> => {
    const response = await fetch(`${API_BASE_URL}/workshop-registrations/${id}/update_payment_status/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ payment_status: paymentStatus }),
    });
    
    const result = await handleResponse(response);
    return normalizeWorkshopRegistration(result);
  },

  sendRegistrationConfirmation: async (registrationId: number): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/workshop-registrations/${registrationId}/send_confirmation/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  // ========== EXPORT OPERATIONS ==========
  
  exportRegistrations: async (workshopId?: number, format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> => {
    const params = new URLSearchParams();
    if (workshopId) params.append('workshop_id', workshopId.toString());
    params.append('format', format);
    
    const response = await fetch(`${API_BASE_URL}/workshop-registrations/export/?${params.toString()}`, {
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