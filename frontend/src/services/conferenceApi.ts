// conferencesApi.ts
const API_BASE_URL = 'http://127.0.0.1:8000';
const CONFERENCES_API_URL = `${API_BASE_URL}/api/conferences`;

// ================== TYPES ==================

export interface Speaker {
  id: number;
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
  id: number;
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

export interface ConferenceDocument {
  id: number;
  title: string;
  document_type:
    | 'program'
    | 'abstract'
    | 'presentation'
    | 'certificate'
    | 'other';
  file: string;
  description?: string;
  is_public: boolean;
  requires_registration: boolean;
  uploaded_at: string;
}

export interface Conference {
  id: number;
  title: string;
  theme?: string;
  description: string;
  date: string;
  time?: string;
  location: string;
  venue?: string;
  type: 'in_person' | 'virtual' | 'hybrid';
  status: 'planning' | 'registration_open' | 'coming_soon' | 'completed' | 'cancelled';
  image_url?: string;
  display_image_url?: string;
  capacity?: number;
  registration_count: number;
  regular_fee?: number;
  early_bird_fee?: number;
  early_bird_deadline?: string;
  expected_attendees?: number;
  countries_represented?: number;
  highlights?: string[];
  organizer_name: string;
  organizer_email?: string;
  organizer_phone?: string;
  organizer_website?: string;
  created_at: string;
  updated_at: string;
  conference_speakers?: Speaker[];
  conference_sessions?: Session[];
  conference_registrations?: Registration[];
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

// ========= NEW CREATE/UPDATE TYPES =========

export interface SpeakerCreateData {
  name: string;
  title?: string;
  organization?: string;
  bio?: string;
  image?: File | string | null;
  image_url?: string | null;
  expertise?: string[];
  is_keynote?: boolean;
  email?: string;
  linkedin?: string;
}

export interface SessionCreateData {
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
  date: string;
  time?: string;
  location: string;
  venue?: string;
  type: 'in_person' | 'virtual' | 'hybrid';
  status: 'planning' | 'registration_open' | 'coming_soon' | 'completed' | 'cancelled';
  image?: File | string | null;
  image_url?: string | null;
  capacity?: number;
  regular_fee?: number;
  early_bird_fee?: number;
  early_bird_deadline?: string;
  expected_attendees?: number;
  countries_represented?: number;
  highlights?: string[];
  organizer_name: string;
  organizer_email?: string;
  organizer_phone?: string;
  organizer_website?: string;
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
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  getById: async (id: number): Promise<Conference> => {
    const response = await fetch(`${CONFERENCES_API_URL}/${id}/`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  // Create new conference with nested data
  create: async (data: ConferenceCreateUpdateData): Promise<Conference> => {
    const formData = new FormData();
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined || value === null) continue;
      if (key === 'image' && value instanceof File) {
        formData.append('image', value);
      } else if (
        key === 'speakers_data' ||
        key === 'sessions_data' ||
        key === 'highlights'
      ) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value.toString());
      }
    }
    const response = await fetch(`${CONFERENCES_API_URL}/`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw errorData;
    }
    return response.json();
  },


  update: async (
    id: number,
    data: Partial<ConferenceCreateUpdateData>
  ): Promise<Conference> => {
    const formData = new FormData();
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined || value === null) {
        // For highlights, speakers_data, sessions_data, always send at least an empty array
        if (key === 'highlights' || key === 'speakers_data' || key === 'sessions_data') {
          formData.append(key, JSON.stringify([]));
        }
        continue;
      }

      if (key === 'image' && value instanceof File) {
        formData.append('image', value);
      } else if (
        key === 'speakers_data' ||
        key === 'sessions_data' ||
        key === 'highlights'
      ) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value.toString());
      }
    }
    const response = await fetch(`${CONFERENCES_API_URL}/${id}/`, {
      method: 'PATCH',
      body: formData,
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
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  },

  uploadImage: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await fetch(`${CONFERENCES_API_URL}/upload_image/`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: 'Upload failed',
      }));
      throw errorData;
    }
    return response.json();
  },

  getAnalytics: async (): Promise<ConferenceAnalytics> => {
    const response = await fetch(`${CONFERENCES_API_URL}/analytics/`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  addRegistration: async (
    conferenceId: number,
    data: Omit<Registration, 'id' | 'full_name'>
  ): Promise<Registration> => {
    const response = await fetch(
      `${CONFERENCES_API_URL}/${conferenceId}/add_registration/`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  updateStatus: async (id: number, status: string): Promise<Conference> => {
    const response = await fetch(
      `${CONFERENCES_API_URL}/${id}/update_status/`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      }
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },
};