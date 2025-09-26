const API_BASE_URL = 'http://127.0.0.1:8000/api';

export interface Webinar {
  id: number;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  duration: string;
  speakers: {
    id?: number;
    name: string;
    credentials: string;
    affiliation: string;
    bio?: string;
    imageUrl?: string;
    order?: number;
  }[];
  status: 'Planning' | 'Registration Open' | 'Live' | 'Completed' | 'Cancelled';
  type: 'Live' | 'Recorded' | 'Hybrid';
  isUpcoming: boolean;
  isFeatured?: boolean;
  registrationLink?: string;
  recordingLink?: string;
  slidesLink?: string;
  imageUrl: string;
  tags: string[];
  languages: string[];
  targetAudience: string[];
  learningObjectives: string[];
  registrationCount?: number;
  registrationProgress?: number;
  capacity?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Registration {
  id: number;
  webinarId: number;
  webinarTitle: string;
  attendeeName: string;
  email: string;
  phone: string;
  organization?: string;
  registrationType: 'Free' | 'Paid' | 'Student' | 'Professional';
  paymentStatus: 'pending' | 'paid' | 'free' | 'failed' | 'refunded';
  registrationDate: string;
  amount?: number;
  country?: string;
}

export interface WebinarAnalytics {
  total: number;
  planning: number;
  registrationOpen: number; 
  live: number;
  completed: number;
  cancelled: number;
  totalRegistrations: number;
  monthlyRegistrations: number;
  featured: number;
  totalViews: number;
  webinarsByType?: {
    Live: number;
    Recorded: number;
    Hybrid: number;
  };
  topWebinars?: Array<{
    id: number;
    title: string;
    date: string;
    registrationCount: number;
  }>;
}

export interface CreateWebinarInput {
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  duration: string;
  speakers: {
    name: string;
    credentials: string;
    affiliation: string;
    bio?: string;
    imageUrl?: string;
  }[];
  status: 'Planning' | 'Registration Open' | 'Live' | 'Completed' | 'Cancelled';
  type: 'Live' | 'Recorded' | 'Hybrid';
  isFeatured?: boolean;
  registrationLink?: string;
  recordingLink?: string;
  slidesLink?: string;
  imageUrl: string;
  tags: string[];
  languages: string[];
  targetAudience: string[];
  learningObjectives: string[];
  capacity?: number;
}

export interface CreateRegistrationInput {
  webinar: number;
  attendeeName: string;
  email: string;
  phone: string;
  organization?: string;
  registrationType: 'Free' | 'Paid' | 'Student' | 'Professional';
  amount?: number;
  country?: string;
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
const normalizeWebinar = (backendWebinar: any): Webinar => {
  const safeArray = (arr: any[], key?: string): string[] => {
    if (!Array.isArray(arr)) return [];
    return arr.map(item => {
      if (typeof item === 'string') return item;
      if (typeof item === 'object' && item !== null) {
        return key ? item[key] : item.name || item.language || item.audience || '';
      }
      return '';
    }).filter(Boolean);
  };

  // Get the image URL properly
  let imageUrl = backendWebinar.imageUrl || backendWebinar.image_url;
  
  // If it's a relative path, make it absolute
  if (imageUrl && imageUrl.startsWith('/') && !imageUrl.startsWith('//')) {
    imageUrl = `${API_BASE_URL}${imageUrl}`;
  }

  return {
    id: backendWebinar.id || 0,
    title: backendWebinar.title || '',
    description: backendWebinar.description || '',
    category: backendWebinar.category || '',
    date: backendWebinar.date || '',
    time: backendWebinar.time || '',
    duration: backendWebinar.duration || '',
    speakers: Array.isArray(backendWebinar.speakers) 
      ? backendWebinar.speakers.map((speaker: any, index: number) => ({
          id: speaker.id,
          name: speaker.name || '',
          credentials: speaker.credentials || '',
          affiliation: speaker.affiliation || '',
          bio: speaker.bio,
          imageUrl: speaker.imageUrl || speaker.image_url,
          order: speaker.order !== undefined ? speaker.order : index,
        }))
      : [],
    status: backendWebinar.status || 'Planning',
    type: backendWebinar.type || 'Live',
    isUpcoming: backendWebinar.isUpcoming || backendWebinar.is_upcoming || false,
    isFeatured: backendWebinar.isFeatured || backendWebinar.is_featured || false,
    registrationLink: backendWebinar.registrationLink || backendWebinar.registration_link,
    recordingLink: backendWebinar.recordingLink || backendWebinar.recording_link,
    slidesLink: backendWebinar.slidesLink || backendWebinar.slides_link,
    imageUrl: imageUrl || '/api/placeholder/400/250',
    tags: safeArray(backendWebinar.tags, 'name'),
    languages: safeArray(backendWebinar.languages, 'language'),
    targetAudience: safeArray(backendWebinar.targetAudience || backendWebinar.target_audience, 'audience'),
    learningObjectives: safeArray(backendWebinar.learningObjectives || backendWebinar.learning_objectives, 'objective'),
    registrationCount: backendWebinar.registrationCount || backendWebinar.registration_count || 0,
    registrationProgress: backendWebinar.registrationProgress || backendWebinar.registration_progress || 0,
    capacity: backendWebinar.capacity || 100,
    createdAt: backendWebinar.createdAt?.split('T')[0] || backendWebinar.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    updatedAt: backendWebinar.updatedAt?.split('T')[0] || backendWebinar.updated_at?.split('T')[0] || new Date().toISOString().split('T')[0],
  };
};

const normalizeRegistration = (backendRegistration: any): Registration => {
  return {
    id: backendRegistration.id || 0,
    webinarId: backendRegistration.webinar || backendRegistration.webinarId || 0,
    webinarTitle: backendRegistration.webinarTitle || backendRegistration.webinar_title || '',
    attendeeName: backendRegistration.attendeeName || backendRegistration.attendee_name || '',
    email: backendRegistration.email || '',
    phone: backendRegistration.phone || '',
    organization: backendRegistration.organization || '',
    registrationType: backendRegistration.registrationType || backendRegistration.registration_type || 'Free',
    paymentStatus: backendRegistration.paymentStatus || backendRegistration.payment_status || 'pending',
    registrationDate: backendRegistration.registrationDate?.split('T')[0] || backendRegistration.registration_date?.split('T')[0] || new Date().toISOString().split('T')[0],
    amount: backendRegistration.amount,
    country: backendRegistration.country || '',
  };
};

export const webinarsApi = {
  // ========== WEBINAR CRUD OPERATIONS ==========
  
  getAll: async (params?: {
    status?: string;
    type?: string;
    category?: string;
    featured?: boolean;
    upcoming?: boolean;
    search?: string;
  }): Promise<Webinar[]> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/webinars/?${searchParams.toString()}`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data.map(normalizeWebinar) : [];
  },

  getById: async (id: number): Promise<Webinar> => {
    const response = await fetch(`${API_BASE_URL}/webinars/${id}/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return normalizeWebinar(data);
  },

  create: async (data: CreateWebinarInput): Promise<Webinar> => {
    const response = await fetch(`${API_BASE_URL}/webinars/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    const result = await handleResponse(response);
    return normalizeWebinar(result);
  },

  update: async (id: number, data: Partial<CreateWebinarInput>): Promise<Webinar> => {
    const response = await fetch(`${API_BASE_URL}/webinars/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    const result = await handleResponse(response);
    return normalizeWebinar(result);
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/webinars/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeadersWithoutContentType(),
    });
    
    return handleResponse(response);
  },

  // ========== WEBINAR-SPECIFIC OPERATIONS ==========
  
  getFeatured: async (): Promise<Webinar[]> => {
    const response = await fetch(`${API_BASE_URL}/webinars/featured/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data.map(normalizeWebinar) : [];
  },

  getUpcoming: async (): Promise<Webinar[]> => {
    const response = await fetch(`${API_BASE_URL}/webinars/upcoming/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data.map(normalizeWebinar) : [];
  },

  getLive: async (): Promise<Webinar[]> => {
    const response = await fetch(`${API_BASE_URL}/webinars/?status=Live`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data.map(normalizeWebinar) : [];
  },

  getAnalytics: async (): Promise<WebinarAnalytics> => {
    const response = await fetch(`${API_BASE_URL}/webinars/analytics/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    
    // Normalize the response to match our interface
    return {
      total: data.total || 0,
      planning: data.planning || 0,
      registrationOpen: data.registrationOpen || 0,
      live: data.live || 0,
      completed: data.completed || 0,
      cancelled: data.cancelled || 0,
      totalRegistrations: data.totalRegistrations || 0,
      monthlyRegistrations: data.monthlyRegistrations || 0,
      featured: data.featured || 0,
      totalViews: data.totalViews || 0,
      webinarsByType: data.webinarsByType || {
        Live: 0,
        Recorded: 0,
        Hybrid: 0
      },
      topWebinars: data.topWebinars || []
    };
  },

  toggleFeatured: async (id: number): Promise<Webinar> => {
    const response = await fetch(`${API_BASE_URL}/webinars/${id}/toggle_featured/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    const result = await handleResponse(response);
    return normalizeWebinar(result);
  },

  updateStatus: async (id: number, status: string): Promise<Webinar> => {
    const response = await fetch(`${API_BASE_URL}/webinars/${id}/update_status/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    
    const result = await handleResponse(response);
    return normalizeWebinar(result);
  },

  // ========== FILE UPLOAD OPERATIONS ==========
  
  uploadImage: async (file: File): Promise<{ url: string; filename: string; path: string }> => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`${API_BASE_URL}/webinars/upload_image/`, {
      method: 'POST',
      headers: getAuthHeadersWithoutContentType(),
      body: formData,
    });
    
    return handleResponse(response);
  },

  uploadSpeakerImage: async (file: File): Promise<{ url: string; filename: string; path: string }> => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`${API_BASE_URL}/webinars/upload_speaker_image/`, {
      method: 'POST',
      headers: getAuthHeadersWithoutContentType(),
      body: formData,
    });
    
    return handleResponse(response);
  },

  // ========== REGISTRATION MANAGEMENT ==========
  
  getRegistrations: async (params?: {
    webinarId?: number;
    registrationType?: string;
    paymentStatus?: string;
    search?: string;
  }): Promise<Registration[]> => {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Convert camelCase to snake_case for backend
          let backendKey = key;
          if (key === 'webinarId') backendKey = 'webinar_id';
          if (key === 'registrationType') backendKey = 'registration_type';
          if (key === 'paymentStatus') backendKey = 'payment_status';
          
          searchParams.append(backendKey, value.toString());
        }
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/registrations/?${searchParams.toString()}`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data.map(normalizeRegistration) : [];
  },

  getRegistrationById: async (id: number): Promise<Registration> => {
    const response = await fetch(`${API_BASE_URL}/registrations/${id}/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return normalizeRegistration(data);
  },

  getWebinarRegistrations: async (webinarId: number, params?: {
    registrationType?: string;
    paymentStatus?: string;
    search?: string;
  }): Promise<Registration[]> => {
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
    
    const response = await fetch(`${API_BASE_URL}/webinars/${webinarId}/registrations/?${searchParams.toString()}`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data.map(normalizeRegistration) : [];
  },

  createRegistration: async (data: CreateRegistrationInput): Promise<Registration> => {
    // Convert camelCase to snake_case for backend
    const backendData = {
      webinar: data.webinar,
      attendee_name: data.attendeeName,
      email: data.email,
      phone: data.phone,
      organization: data.organization,
      registration_type: data.registrationType,
      amount: data.amount,
      country: data.country,
    };

    const response = await fetch(`${API_BASE_URL}/registrations/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(backendData),
    });
    
    const result = await handleResponse(response);
    return normalizeRegistration(result);
  },

  updateRegistration: async (id: number, data: Partial<CreateRegistrationInput>): Promise<Registration> => {
    // Convert camelCase to snake_case for backend
    const backendData: any = {};
    if (data.attendeeName !== undefined) backendData.attendee_name = data.attendeeName;
    if (data.email !== undefined) backendData.email = data.email;
    if (data.phone !== undefined) backendData.phone = data.phone;
    if (data.organization !== undefined) backendData.organization = data.organization;
    if (data.registrationType !== undefined) backendData.registration_type = data.registrationType;
    if (data.amount !== undefined) backendData.amount = data.amount;
    if (data.country !== undefined) backendData.country = data.country;
    if (data.webinar !== undefined) backendData.webinar = data.webinar;

    const response = await fetch(`${API_BASE_URL}/registrations/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(backendData),
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

  updatePaymentStatus: async (id: number, paymentStatus: string): Promise<Registration> => {
    const response = await fetch(`${API_BASE_URL}/registrations/${id}/update_payment_status/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ payment_status: paymentStatus }),
    });
    
    const result = await handleResponse(response);
    return normalizeRegistration(result);
  },

  sendRegistrationConfirmation: async (registrationId: number): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/registrations/${registrationId}/send_confirmation/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  // ========== EMAIL OPERATIONS ==========
  
  emailRegistrants: async (webinarId: number, emailData: {
    subject: string;
    message: string;
    recipientType: 'all' | 'paid' | 'free' | 'pending';
  }): Promise<{ success: boolean; sent: number; recipients: string[] }> => {
    const response = await fetch(`${API_BASE_URL}/webinars/${webinarId}/email_registrants/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        subject: emailData.subject,
        message: emailData.message,
        recipient_type: emailData.recipientType,
      }),
    });
    
    return handleResponse(response);
  },

  // ========== EXPORT OPERATIONS ==========
  
  exportRegistrations: async (webinarId?: number, format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> => {
    const params = new URLSearchParams();
    if (webinarId) params.append('webinar_id', webinarId.toString());
    params.append('format', format);
    
    const response = await fetch(`${API_BASE_URL}/registrations/export/?${params.toString()}`, {
      headers: getAuthHeadersWithoutContentType(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.blob();
  },

  exportWebinars: async (format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> => {
    const response = await fetch(`${API_BASE_URL}/webinars/export/?format=${format}`, {
      headers: getAuthHeadersWithoutContentType(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.blob();
  },

  // ========== METADATA OPERATIONS ==========
  
  getCategories: async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/webinars/categories/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  },

  getLanguages: async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/webinars/languages/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  },

  getTargetAudiences: async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/webinars/target_audiences/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  },
};

// Export individual functions for convenience
export const {
  getAll: getAllWebinars,
  getById: getWebinarById,
  create: createWebinar,
  update: updateWebinar,
  delete: deleteWebinar,
  getFeatured: getFeaturedWebinars,
  getUpcoming: getUpcomingWebinars,
  getLive: getLiveWebinars,
  getAnalytics: getWebinarAnalytics,
  toggleFeatured: toggleWebinarFeatured,
  updateStatus: updateWebinarStatus,
  uploadImage: uploadWebinarImage,
  uploadSpeakerImage,
  getRegistrations,
  getRegistrationById,
  getWebinarRegistrations,
  createRegistration,
  updateRegistration,
  deleteRegistration,
  updatePaymentStatus: updateRegistrationPaymentStatus,
  sendRegistrationConfirmation,
  emailRegistrants: emailWebinarRegistrants,
  exportRegistrations,
  exportWebinars,
  getCategories: getWebinarCategories,
  getLanguages: getWebinarLanguages,
  getTargetAudiences: getWebinarTargetAudiences,
} = webinarsApi;