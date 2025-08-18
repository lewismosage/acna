// conferencesApi.ts
const API_BASE_URL = 'http://127.0.0.1:8000';
const CONFERENCES_API_URL = `${API_BASE_URL}/api/conferences`;


export interface Speaker {
  name: string;
  title: string;
  organization: string;
  bio: string;
  imageUrl: string;
  isKeynote: boolean;
}

export interface Session {
  time: string;
  title: string;
  speaker: string;
  duration: string;
  type: 'presentation' | 'workshop' | 'panel' | 'break' | 'registration' | 'social';
  location?: string;
  moderator?: string;
}

export interface Conference {
  id: number;
  title: string;
  date: string;
  location: string;
  venue?: string;
  type: 'In-person' | 'Virtual' | 'Hybrid';
  status: 'Planning' | 'Registration Open' | 'Coming Soon' | 'Completed' | 'Cancelled';
  theme?: string;
  description: string;
  imageUrl?: string;
  attendees?: string;
  speakers?: string;
  countries?: string;
  earlyBirdDeadline?: string;
  regularFee?: string;
  earlyBirdFee?: string;
  registrationCount: number;
  capacity?: number;
  highlights?: string[];
  createdAt: string;
  updatedAt: string;
  registrations?: Registration[];
  program?: Session[]; 
  speakersList?: Speaker[]; 
}

export interface Registration {
  id: number;
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  registrationDate: string;
  registrationType: 'earlyBird' | 'regular';
  paymentStatus: 'Paid' | 'Pending' | 'Failed';
}

export interface ConferenceAnalytics {
  total: number;
  upcoming: number;
  completed: number;
  cancelled: number;
  totalRegistrations: number;
  totalRevenue: number;
  inPerson: number;
  virtual: number;
  hybrid: number;
}

export interface CreateConferenceInput {
  title: string;
  date: string;
  location: string;
  venue?: string;
  type: 'In-person' | 'Virtual' | 'Hybrid';
  status: 'Planning' | 'Registration Open' | 'Coming Soon' | 'Completed' | 'Cancelled';
  theme?: string;
  description: string;
  imageUrl?: string;
  attendees?: string;
  speakers?: string;
  countries?: string;
  earlyBirdDeadline?: string;
  regularFee?: string;
  earlyBirdFee?: string;
  registrationCount?: number;
  capacity?: number;
  highlights?: string[];
}

export const conferencesApi = {
  getAll: async (params?: {
    status?: string;
    type?: string;
    search?: string;
  }): Promise<Conference[]> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const response = await fetch(`${CONFERENCES_API_URL}/?${searchParams.toString()}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  getById: async (id: number): Promise<Conference> => {
    const response = await fetch(`${CONFERENCES_API_URL}/${id}/`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  create: async (data: CreateConferenceInput & { image?: File }): Promise<Conference> => {
    const formData = new FormData();
    
    // Append all fields to formData
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'highlights' && value) {
        // Handle array fields
        formData.append(key, JSON.stringify(value));
      } else if (value !== undefined && value !== null) {
        if (key === 'image' && value instanceof File) {
          // Handle file upload
          formData.append(key, value);
        } else {
          // Handle other fields
          formData.append(key, value.toString());
        }
      }
    });
    
    const response = await fetch(`${CONFERENCES_API_URL}/`, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header - let the browser set it with boundary
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw errorData;
    }
    return response.json();
  },

  update: async (id: number, data: Partial<CreateConferenceInput> & { image?: File }): Promise<Conference> => {
    const formData = new FormData();
    
    // Append all fields to formData
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'highlights' && value) {
        // Handle array fields
        formData.append(key, JSON.stringify(value));
      } else if (value !== undefined && value !== null) {
        if (key === 'image' && value instanceof File) {
          // Handle file upload
          formData.append(key, value);
        } else {
          // Handle other fields
          formData.append(key, value.toString());
        }
      }
    });
    
    const response = await fetch(`${CONFERENCES_API_URL}/${id}/`, {
      method: 'PATCH',
      body: formData,
      // Don't set Content-Type header - let the browser set it with boundary
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw errorData;
    }
    return response.json();
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${CONFERENCES_API_URL}/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  },

  uploadImage: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`${CONFERENCES_API_URL}/upload_image/`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw errorData;
    }
    return response.json();
  },

  getAnalytics: async (): Promise<ConferenceAnalytics> => {
    const response = await fetch(`${CONFERENCES_API_URL}/analytics/`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  addRegistration: async (conferenceId: number, data: Omit<Registration, 'id'>): Promise<Registration> => {
    const response = await fetch(`${CONFERENCES_API_URL}/${conferenceId}/add_registration/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  updateStatus: async (id: number, status: string): Promise<Conference> => {
    const response = await fetch(`${CONFERENCES_API_URL}/${id}/update_status/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },
};