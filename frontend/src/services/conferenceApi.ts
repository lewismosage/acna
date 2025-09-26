// conferencesApi.ts - Updated with complete interface
const API_BASE_URL = 'http://127.0.0.1:8000';
const CONFERENCES_API_URL = `${API_BASE_URL}/api/conferences`;

// ================== TYPES ==================

export interface Speaker {
  id?: number;
  name: string;
  title?: string;
  organization?: string;
  bio?: string;
  image_url?: string;
  display_image_url?: string;
  expertise?: string[];
  is_keynote: boolean;
  email?: string;
  linkedin?: string;
}

export interface Session {
  id?: number;
  title: string;
  description?: string;
  start_time: string;
  duration_minutes: number;
  end_time?: string;
  duration_display?: string;
  session_type: string;
  location?: string;
  speaker_names?: string;
  moderator?: string;
  capacity?: number;
  materials_required?: string;
}

export interface Registration {
  id: number;
  first_name: string;
  last_name: string;
  full_name?: string;
  email: string;
  phone?: string;
  organization?: string;
  job_title?: string;
  country?: string;
  registration_type:
    | 'early_bird'
    | 'regular'
    | 'student'
    | 'speaker'
    | 'sponsor';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  amount_paid?: number;
  dietary_requirements?: string;
  accessibility_needs?: string;
  registered_at: string;
}

export interface RegistrationResponse {
  success: boolean;
  message: string;
  data?: Registration;
  registration_data?: any;
  payment_required?: boolean;
  amount?: number;
  registration_id?: number;
  conference_id?: number;
}

export interface Conference {
  id?: number;
  title: string;
  theme?: string;
  description: string;
  full_description?: string;
  date: string;
  time?: string;
  start_date?: string;
  end_date?: string;
  duration?: string;
  location: string;
  venue?: string;
  type: 'in_person' | 'virtual' | 'hybrid';
  status: 'planning' | 'registration_open' | 'coming_soon' | 'completed' | 'cancelled';
  image_url?: string;
  display_image_url?: string;
  website?: string;
  capacity?: number;
  registration_count: number;
  regular_fee?: number;
  registration_fee?: number;
  early_bird_fee?: number;
  early_bird_deadline?: string;
  expected_attendees?: number;
  countries_represented?: number;
  highlights?: string[];
  organizer_name: string;
  organizer_email?: string;
  organizer_phone?: string;
  organizer_website?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_person?: string;
  objectives?: string;
  target_audience?: string;
  agenda?: string;
  created_at?: string;
  updated_at?: string;
  conference_speakers?: Speaker[];
  conference_sessions?: Session[];
  conference_registrations?: Registration[];
  // For API responses, these might be named differently
  speakers?: Speaker[];
  sessions?: Session[];
  registrations?: Registration[];
}

export interface ConferenceAnalytics {
  total_conferences: number;
  conferences_by_status: { [key: string]: number };
  conferences_by_type: { [key: string]: number };
  total_registrations: number;
  total_revenue: number;
  average_attendance: number;
  upcoming_conferences: number;
  completed_conferences: number;
  monthly_registrations: Array<{ month: string; registrations: number }>;
  top_conferences: Array<{
    id: number;
    title: string;
    registration_count: number;
    date: string;
  }>;
}

// ========= CREATE/UPDATE TYPES =========

export interface SpeakerCreateData {
  id?: number;
  name: string;
  title?: string;
  organization?: string;
  bio?: string;
  expertise?: string[];
  is_keynote?: boolean;
  email?: string;
  linkedin?: string;
  image_url?: string;
}

export interface SessionCreateData {
  id?: number;
  title: string;
  description?: string;
  start_time: string;
  duration_minutes: number;
  session_type: string;
  location?: string;
  speaker_names?: string;
  moderator?: string;
  capacity?: number;
  materials_required?: string;
}

export interface ConferenceCreateUpdateData {
  title: string;
  theme?: string;
  description: string;
  full_description?: string;
  date: string;
  time?: string;
  start_date?: string;
  end_date?: string;
  duration?: string;
  location: string;
  venue?: string;
  type: 'in_person' | 'virtual' | 'hybrid';
  status: 'planning' | 'registration_open' | 'coming_soon' | 'completed' | 'cancelled';
  image?: File | null;
  image_url?: string;
  website?: string;
  capacity?: number;
  regular_fee?: number;
  registration_fee?: number;
  early_bird_fee?: number;
  early_bird_deadline?: string;
  expected_attendees?: number;
  countries_represented?: number;
  highlights?: string[];
  organizer_name: string;
  organizer_email?: string;
  organizer_phone?: string;
  organizer_website?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_person?: string;
  objectives?: string;
  target_audience?: string;
  agenda?: string;
  speakers_data?: SpeakerCreateData[];
  sessions_data?: SessionCreateData[];
}

// ================== API ==================

export const conferencesApi = {
  getAll: async (params?: {
    status?: string;
    type?: string;
    search?: string;
  }): Promise<Conference[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value);
          }
        });
      }
      const response = await fetch(
        `${CONFERENCES_API_URL}/?${queryParams.toString()}`
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      return response.json(); 
    } catch (error) {
      console.error('Error fetching conferences:', error);
      throw error;
    }
  },

  getById: async (id: number): Promise<Conference> => {
    try {
      const response = await fetch(`${CONFERENCES_API_URL}/${id}/`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      return response.json();
    } catch (error) {
      console.error(`Error fetching conference ${id}:`, error);
      throw error;
    }
  },

  create: async (data: ConferenceCreateUpdateData): Promise<Conference> => {
    try {
      const formData = new FormData();
      
      // Add basic fields
      Object.entries(data).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        
        if (key === 'image' && value instanceof File) {
          formData.append('image', value);
        } else if (key === 'speakers_data' || key === 'sessions_data' || key === 'highlights') {
          formData.append(key, JSON.stringify(value));
        } else if (typeof value === 'string' || typeof value === 'number') {
          formData.append(key, value.toString());
        }
      });

      // Debug: Log what we're sending
      console.log('Sending conference data:');
      for (let [key, value] of formData.entries()) {
        if (key.includes('_data')) {
          console.log(`${key}:`, JSON.parse(value as string));
        } else {
          console.log(`${key}:`, value);
        }
      }

      const response = await fetch(`${CONFERENCES_API_URL}/`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: await response.text() };
        }
        console.error('Server error response:', errorData);
        throw { ...errorData, status: response.status };
      }

      const result = await response.json();
      console.log('Conference created successfully:', result);
      return result;
    } catch (error) {
      console.error('Error creating conference:', error);
      throw error;
    }
  },

  update: async (
    id: number,
    data: Partial<ConferenceCreateUpdateData>
  ): Promise<Conference> => {
    try {
      const formData = new FormData();
      
      Object.entries(data).forEach(([key, value]) => {
        if (value === undefined || value === null) {
          if (key === 'highlights' || key === 'speakers_data' || key === 'sessions_data') {
            formData.append(key, JSON.stringify([]));
          }
          return;
        }

        if (key === 'image' && value instanceof File) {
          formData.append('image', value);
        } else if (key === 'speakers_data' || key === 'sessions_data' || key === 'highlights') {
          formData.append(key, JSON.stringify(value));
        } else if (typeof value === 'string' || typeof value === 'number') {
          formData.append(key, value.toString());
        }
      });

      const response = await fetch(`${CONFERENCES_API_URL}/${id}/`, {
        method: 'PATCH',
        body: formData,
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: await response.text() };
        }
        throw { ...errorData, status: response.status };
      }

      return response.json();
    } catch (error) {
      console.error(`Error updating conference ${id}:`, error);
      throw error;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      const response = await fetch(`${CONFERENCES_API_URL}/${id}/`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error(`Error deleting conference ${id}:`, error);
      throw error;
    }
  },

  uploadImage: async (file: File): Promise<{ url: string; filename: string; path: string }> => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch(`${CONFERENCES_API_URL}/upload_image/`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: 'Upload failed' };
        }
        throw errorData;
      }
      return response.json();
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },

  uploadSpeakerImage: async (file: File): Promise<{ url: string; filename: string; path: string }> => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch(`${CONFERENCES_API_URL}/upload_speaker_image/`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: 'Upload failed' };
        }
        throw errorData;
      }
      return response.json();
    } catch (error) {
      console.error('Error uploading speaker image:', error);
      throw error;
    }
  },

  getAnalytics: async (): Promise<ConferenceAnalytics> => {
    try {
      const response = await fetch(`${CONFERENCES_API_URL}/analytics/`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  },

  addRegistration: async (
  conferenceId: number,
  data: Omit<Registration, 'id' | 'full_name'>
): Promise<RegistrationResponse> => {
  try {
    // Include conference ID in the payload
    const payload = {
      ...data,
      conference: conferenceId 
    };
    
    const response = await fetch(
      `${CONFERENCES_API_URL}/${conferenceId}/add_registration/`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error(`Error adding registration to conference ${conferenceId}:`, error);
    throw error;
  }
},

  updateStatus: async (id: number, status: string): Promise<Conference> => {
    try {
      const response = await fetch(
        `${CONFERENCES_API_URL}/${id}/update_status/`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        }
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      return response.json();
    } catch (error) {
      console.error(`Error updating conference ${id} status:`, error);
      throw error;
    }
  },

  // Conference Payment API
  createPaymentSession: async (conferenceId: number, registrationData: any): Promise<{ sessionId: string }> => {
    try {
      const response = await fetch(`${CONFERENCES_API_URL}/payment/create-checkout-session/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conference_id: conferenceId,
          registration_data: registrationData,
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error creating conference payment session:', error);
      throw error;
    }
  },

  verifyPayment: async (sessionId: string): Promise<{
    status: string;
    payment_status: string;
    amount: number;
    currency: string;
    registration_type: string;
    conference: {
      id: number;
      title: string;
      date: string;
      location: string;
    };
    registration: {
      id: number;
      name: string;
      email: string;
      organization: string;
    };
    invoice_number: string;
  }> => {
    try {
      const response = await fetch(`${CONFERENCES_API_URL}/payment/verify/?session_id=${sessionId}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error verifying conference payment:', error);
      throw error;
    }
  },
};