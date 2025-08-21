const API_BASE_URL = 'http://127.0.0.1:8000/api';

export interface AwardCategory {
  id: number;
  title: string;
  description: string;
  criteria: string;
  active: boolean;
  order: number;
}

export interface AwardWinner {
  id: number;
  name: string;
  title: string;
  location: string;
  achievement: string;
  category: number;
  categoryTitle: string;
  year: number;
  status: 'Active' | 'Draft' | 'Archived';
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface Nominee {
  id: number;
  name: string;
  institution: string;
  specialty: string;
  category: number;
  categoryTitle: string;
  achievement: string;
  email: string;
  phone: string;
  location: string;
  imageUrl: string;
  status: 'Approved' | 'Rejected' | 'Winner'; 
  suggestedBy: string;
  suggestedDate: string;
  createdAt: string;
  updatedAt: string;
  source: 'admin' | 'suggested'; 
}

export interface AwardNomination {
  id: number;
  nomineeName: string;
  nomineeEmail: string;
  nomineeInstitution: string;
  nomineeLocation: string;
  nomineeSpecialty: string;
  awardCategory: number;
  awardCategoryTitle: string;
  nominatorName: string;
  nominatorEmail: string;
  nominatorRelationship: string;
  achievementSummary: string;
  additionalInfo: string;
  supportingDocuments: string;
  status: 'Approved' | 'Rejected'; 
  submissionDate: string;
  createdAt: string;
  updatedAt: string;
  source: 'suggested'; 
}

export interface CreateAwardWinnerInput {
  name: string;
  title: string;
  location: string;
  achievement: string;
  category: number;
  year: number;
  status: 'Active' | 'Draft' | 'Archived';
  imageUrl: string;
}

export interface CreateNomineeInput {
  name: string;
  institution: string;
  specialty: string;
  category: number;
  achievement: string;
  email: string;
  phone: string;
  location: string;
  imageUrl: string;
  status: 'Approved' | 'Rejected' | 'Winner'; // Removed 'Pending' status
  suggestedBy: string;
  source: 'admin' | 'suggested'; // Removed 'new' and 'nomination' sources
}

export interface CreateAwardNominationInput {
  nomineeName: string;
  nomineeEmail: string;
  nomineeInstitution: string;
  nomineeLocation: string;
  nomineeSpecialty: string;
  awardCategory: number;
  nominatorName: string;
  nominatorEmail: string;
  nominatorRelationship: string;
  achievementSummary: string;
  additionalInfo: string;
  supportingDocuments?: File;
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

// Helper function to get headers without Content-Type (for FormData)
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
    let errorDetails = null;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
      errorDetails = errorData;
    } catch {
      // If we can't parse the error, use the default message
    }
    
    // Include the full error details in the error message
    const fullError = new Error(
      errorDetails 
        ? JSON.stringify({ message: errorMessage, details: errorDetails })
        : errorMessage
    );
    throw fullError;
  }
  
  if (response.status === 204) {
    return null;
  }
  
  return response.json();
};

// Helper functions to normalize data
const normalizeAwardCategory = (data: any): AwardCategory => ({
  id: data.id || 0,
  title: data.title || '',
  description: data.description || '',
  criteria: data.criteria || '',
  active: data.active || false,
  order: data.order || 0,
});

const normalizeAwardWinner = (data: any): AwardWinner => ({
  id: data.id || 0,
  name: data.name || '',
  title: data.title || '',
  location: data.location || '',
  achievement: data.achievement || '',
  category: data.category || 0,
  categoryTitle: data.categoryTitle || data.category_title || '',
  year: data.year || new Date().getFullYear(),
  status: data.status || 'Active',
  imageUrl: data.imageUrl || data.image_url || '',
  createdAt: data.createdAt || data.created_at || '',
  updatedAt: data.UpdatedAt || data.updated_at || '',
});

const normalizeNominee = (data: any): Nominee => ({
  id: data.id || 0,
  name: data.name || '',
  institution: data.institution || '',
  specialty: data.specialty || '',
  category: data.category || 0,
  categoryTitle: data.categoryTitle || data.category_title || '',
  achievement: data.achievement || '',
  email: data.email || '',
  phone: data.phone || '',
  location: data.location || '',
  imageUrl: data.imageUrl || data.image_url || '',
  status: data.status || 'Approved', // Default to 'Approved' instead of 'Pending'
  suggestedBy: data.suggestedBy || data.suggested_by || '',
  suggestedDate: data.suggestedDate || data.suggested_date || '',
  createdAt: data.createdAt || data.created_at || '',
  updatedAt: data.updatedAt || data.updated_at || '',
  source: data.source || 'admin'
});

const normalizeAwardNomination = (data: any): AwardNomination => ({
  id: data.id || 0,
  nomineeName: data.nomineeName || data.nominee_name || '',
  nomineeEmail: data.nomineeEmail || data.nominee_email || '',
  nomineeInstitution: data.nomineeInstitution || data.nominee_institution || '',
  nomineeLocation: data.nomineeLocation || data.nominee_location || '',
  nomineeSpecialty: data.nomineeSpecialty || data.nominee_specialty || '',
  awardCategory: data.awardCategory || data.award_category || 0,
  awardCategoryTitle: data.awardCategoryTitle || data.award_category_title || '',
  nominatorName: data.nominatorName || data.nominator_name || '',
  nominatorEmail: data.nominatorEmail || data.nominator_email || '',
  nominatorRelationship: data.nominatorRelationship || data.nominator_relationship || '',
  achievementSummary: data.achievementSummary || data.achievement_summary || '',
  additionalInfo: data.additionalInfo || data.additional_info || '',
  supportingDocuments: data.supportingDocuments || data.supporting_documents || '',
  status: data.status || 'Approved', // Default to 'Approved' instead of 'Pending'
  submissionDate: data.submissionDate || data.submission_date || '',
  createdAt: data.createdAt || data.created_at || '',
  updatedAt: data.updatedAt || data.updated_at || '',
  source: data.source || 'suggested', // Default to 'suggested' instead of 'admin'
});

export const awardsApi = {
  // ========== CATEGORY OPERATIONS ==========
  getCategories: async (params?: {
    active?: boolean;
    search?: string;
  }): Promise<AwardCategory[]> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/awards/categories/?${searchParams.toString()}`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data.map(normalizeAwardCategory) : [];
  },

  getCategoryById: async (id: number): Promise<AwardCategory> => {
    const response = await fetch(`${API_BASE_URL}/awards/categories/${id}/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return normalizeAwardCategory(data);
  },

  createCategory: async (data: Partial<AwardCategory>): Promise<AwardCategory> => {
    const response = await fetch(`${API_BASE_URL}/awards/categories/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    const result = await handleResponse(response);
    return normalizeAwardCategory(result);
  },

  updateCategory: async (id: number, data: Partial<AwardCategory>): Promise<AwardCategory> => {
    const response = await fetch(`${API_BASE_URL}/awards/categories/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    const result = await handleResponse(response);
    return normalizeAwardCategory(result);
  },

  deleteCategory: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/awards/categories/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeadersWithoutContentType(),
    });
    
    return handleResponse(response);
  },

  toggleCategoryActive: async (id: number): Promise<AwardCategory> => {
    const response = await fetch(`${API_BASE_URL}/awards/categories/${id}/toggle_active/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    
    const result = await handleResponse(response);
    return normalizeAwardCategory(result);
  },

  // ========== AWARD WINNER OPERATIONS ==========
  getWinners: async (params?: {
    status?: string;
    category?: number;
    year?: number;
    search?: string;
  }): Promise<AwardWinner[]> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/awards/winners/?${searchParams.toString()}`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data.map(normalizeAwardWinner) : [];
  },

  getWinnerById: async (id: number): Promise<AwardWinner> => {
    const response = await fetch(`${API_BASE_URL}/awards/winners/${id}/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return normalizeAwardWinner(data);
  },

  createWinner: async (data: CreateAwardWinnerInput): Promise<AwardWinner> => {
    const response = await fetch(`${API_BASE_URL}/awards/winners/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    const result = await handleResponse(response);
    return normalizeAwardWinner(result);
  },

  updateWinner: async (id: number, data: Partial<CreateAwardWinnerInput>): Promise<AwardWinner> => {
    const response = await fetch(`${API_BASE_URL}/awards/winners/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    const result = await handleResponse(response);
    return normalizeAwardWinner(result);
  },

  deleteWinner: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/awards/winners/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeadersWithoutContentType(),
    });
    
    return handleResponse(response);
  },

  updateWinnerStatus: async (id: number, status: string): Promise<AwardWinner> => {
    const response = await fetch(`${API_BASE_URL}/awards/winners/${id}/update_status/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    
    const result = await handleResponse(response);
    return normalizeAwardWinner(result);
  },

  getWinnerYears: async (): Promise<number[]> => {
    const response = await fetch(`${API_BASE_URL}/awards/winners/years/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  },

  // ========== NOMINEE OPERATIONS ==========
  getNominees: async (params?: {
    status?: string;
    category?: number;
    search?: string;
    source?: string;
  }): Promise<Nominee[]> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/awards/nominees/?${searchParams.toString()}`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data.map(normalizeNominee) : [];
  },

  getNomineeById: async (id: number): Promise<Nominee> => {
    const response = await fetch(`${API_BASE_URL}/awards/nominees/${id}/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return normalizeNominee(data);
  },

  createNominee: async (data: CreateNomineeInput): Promise<Nominee> => {
    const response = await fetch(`${API_BASE_URL}/awards/nominees/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    const result = await handleResponse(response);
    return normalizeNominee(result);
  },

  updateNominee: async (id: number, data: Partial<CreateNomineeInput>): Promise<Nominee> => {
    const response = await fetch(`${API_BASE_URL}/awards/nominees/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    const result = await handleResponse(response);
    return normalizeNominee(result);
  },

  deleteNominee: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/awards/nominees/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeadersWithoutContentType(),
    });
    
    return handleResponse(response);
  },

  updateNomineeStatus: async (id: number, status: string): Promise<Nominee> => {
    const response = await fetch(`${API_BASE_URL}/awards/nominees/${id}/update_status/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    
    const result = await handleResponse(response);
    return normalizeNominee(result);
  },

  uploadNomineeImage: async (file: File): Promise<{ url: string; filename: string; path: string }> => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`${API_BASE_URL}/awards/nominees/upload_image/`, {
      method: 'POST',
      headers: getAuthHeadersWithoutContentType(),
      body: formData,
    });
    
    return handleResponse(response);
  },

  // ========== NOMINATION OPERATIONS ==========
  getNominations: async (params?: {
    status?: string;
    category?: number;
    search?: string;
  }): Promise<AwardNomination[]> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/awards/nominations/?${searchParams.toString()}`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data.map(normalizeAwardNomination) : [];
  },

  getNominationById: async (id: number): Promise<AwardNomination> => {
    const response = await fetch(`${API_BASE_URL}/awards/nominations/${id}/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return normalizeAwardNomination(data);
  },

  createNomination: async (data: CreateAwardNominationInput): Promise<AwardNomination> => {
    const formData = new FormData();
    
    // Convert camelCase to snake_case for Django backend
    const fieldMapping: Record<string, string> = {
      nomineeName: 'nominee_name',
      nomineeEmail: 'nominee_email',
      nomineeInstitution: 'nominee_institution',
      nomineeLocation: 'nominee_location',
      nomineeSpecialty: 'nominee_specialty',
      awardCategory: 'award_category',
      nominatorName: 'nominator_name',
      nominatorEmail: 'nominator_email',
      nominatorRelationship: 'nominator_relationship',
      achievementSummary: 'achievement_summary',
      additionalInfo: 'additional_info',
      supportingDocuments: 'supporting_documents',
    };
    
    // Append all fields to formData with correct field names
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        const fieldName = fieldMapping[key] || key;
        
        if (fieldName === 'supporting_documents' && value instanceof File) {
          formData.append(fieldName, value);
        } else if (fieldName === 'award_category') {
          formData.append(fieldName, value.toString());
        } else {
          formData.append(fieldName, value.toString());
        }
      }
    });
    
    const response = await fetch(`${API_BASE_URL}/awards/nominations/`, {
      method: 'POST',
      headers: getAuthHeadersWithoutContentType(),
      body: formData,
    });
    
    const result = await handleResponse(response);
    return normalizeAwardNomination(result);
  },

  updateNomination: async (id: number, data: Partial<CreateAwardNominationInput>): Promise<AwardNomination> => {
    const response = await fetch(`${API_BASE_URL}/awards/nominations/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    const result = await handleResponse(response);
    return normalizeAwardNomination(result);
  },

  deleteNomination: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/awards/nominations/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeadersWithoutContentType(),
    });
    
    return handleResponse(response);
  },

  updateNominationStatus: async (id: number, status: string): Promise<AwardNomination> => {
    const response = await fetch(`${API_BASE_URL}/awards/nominations/${id}/update_status/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    
    const result = await handleResponse(response);
    return normalizeAwardNomination(result);
  },

  sendNominationConfirmation: async (nominationId: number): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/awards/nominations/${nominationId}/send_confirmation/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },
};

// Export individual functions for convenience
export const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryActive,
  getWinners,
  getWinnerById,
  createWinner,
  updateWinner,
  deleteWinner,
  updateWinnerStatus,
  getWinnerYears,
  getNominees,
  getNomineeById,
  createNominee,
  updateNominee,
  deleteNominee,
  updateNomineeStatus,
  uploadNomineeImage,
  getNominations,
  getNominationById,
  createNomination,
  updateNomination,
  deleteNomination,
  updateNominationStatus,
  sendNominationConfirmation,
} = awardsApi;