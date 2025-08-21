const API_BASE_URL = 'http://127.0.0.1:8000';

export interface Author {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  institution: string;
  country: string;
  isPresenter: boolean;
  isCorresponding: boolean;
  order?: number;
}

export type AbstractStatus = 'Under Review' | 'Accepted' | 'Revision Required' | 'Rejected';
export type PresentationType = 'Oral Presentation' | 'Poster Presentation' | 'E-Poster' | 'No Preference';
export type AbstractCategory = 'Clinical Research' | 'Basic Science & Translational Research' | 'Healthcare Technology & Innovation' | 'Medical Education & Training' | 'Public Health & Policy' | 'Case Reports';

export interface Abstract {
  id: number;
  title: string;
  authors: Author[];
  category: AbstractCategory;
  presentationPreference: PresentationType;
  keywords: string[];
  background: string;
  methods: string;
  results: string;
  conclusions: string;
  conflictOfInterest: string;
  status: AbstractStatus;
  submittedDate: string;
  lastUpdated: string;
  abstractFileUrl?: string;
  ethicalApprovalUrl?: string;
  supplementaryFilesUrl?: string;
  reviewerComments?: string;
  assignedReviewer?: string;
  isFeatured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAbstractInput {
  title: string;
  authors: Omit<Author, 'id'>[];
  category: AbstractCategory;
  presentationPreference: PresentationType;
  keywords: string[];
  background: string;
  methods: string;
  results: string;
  conclusions: string;
  conflictOfInterest: string;
  abstractFile?: File;
  ethicalApprovalFile?: File;
  supplementaryFiles?: File[];
}

export interface UpdateAbstractInput {
  title?: string;
  authors?: Author[];
  category?: AbstractCategory;
  presentationPreference?: PresentationType;
  keywords?: string[];
  background?: string;
  methods?: string;
  results?: string;
  conclusions?: string;
  conflictOfInterest?: string;
  status?: AbstractStatus;
  reviewerComments?: string;
  assignedReviewer?: string;
  isFeatured?: boolean;
  abstractFile?: File;
  ethicalApprovalFile?: File;
  supplementaryFiles?: File[];
}

export interface AbstractAnalytics {
  total: number;
  underReview: number;
  accepted: number;
  revisionRequired: number;
  rejected: number;
  byCategory: Record<AbstractCategory, number>;
  byPresentationType: Record<PresentationType, number>;
  featured: number;
  totalAuthors: number;
  countries: string[];
}

export interface ImportantDates {
  id?: number;
  year: number;
  abstractSubmissionOpens: string;
  abstractSubmissionDeadline: string;
  abstractReviewCompletion: string;
  acceptanceNotifications: string;
  finalAbstractSubmission: string;
  conferencePresentation: string;
  isActive?: boolean;
}

export interface CreateImportantDatesInput {
  year: number;
  abstractSubmissionOpens: string;
  abstractSubmissionDeadline: string;
  abstractReviewCompletion: string;
  acceptanceNotifications: string;
  finalAbstractSubmission: string;
  conferencePresentation: string;
  isActive?: boolean;
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

// Helper function to normalize abstract data
const normalizeAbstract = (data: any): Abstract => ({
  id: data.id || 0,
  title: data.title || '',
  authors: Array.isArray(data.authors) 
    ? data.authors.map((author: any) => ({
        id: author.id,
        firstName: author.firstName || author.first_name || '',
        lastName: author.lastName || author.last_name || '',
        email: author.email || '',
        institution: author.institution || '',
        country: author.country || '',
        isPresenter: author.isPresenter || author.is_presenter || false,
        isCorresponding: author.isCorresponding || author.is_corresponding || false,
        order: author.order || 0,
      }))
    : [],
  category: data.category || 'Clinical Research',
  presentationPreference: data.presentationPreference || data.presentation_preference || 'No Preference',
  keywords: Array.isArray(data.keywords) ? data.keywords : [],
  background: data.background || '',
  methods: data.methods || '',
  results: data.results || '',
  conclusions: data.conclusions || '',
  conflictOfInterest: data.conflictOfInterest || data.conflict_of_interest || '',
  status: data.status || 'Under Review',
  submittedDate: data.submittedDate || data.submitted_date || '',
  lastUpdated: data.lastUpdated || data.last_updated || '',
  abstractFileUrl: data.abstractFileUrl || data.abstract_file_url,
  ethicalApprovalUrl: data.ethicalApprovalUrl || data.ethical_approval_url,
  supplementaryFilesUrl: data.supplementaryFilesUrl || data.supplementary_files_url,
  reviewerComments: data.reviewerComments || data.reviewer_comments,
  assignedReviewer: data.assignedReviewer || data.assigned_reviewer,
  isFeatured: data.isFeatured || data.is_featured || false,
  createdAt: data.createdAt || data.created_at || '',
  updatedAt: data.updatedAt || data.updated_at || '',
});

export const abstractApi = {
  // ========== ABSTRACT OPERATIONS ==========
  getAbstracts: async (params?: {
    status?: AbstractStatus;
    category?: AbstractCategory;
    presentationType?: PresentationType;
    featured?: boolean;
    search?: string;
  }): Promise<Abstract[]> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Convert camelCase to snake_case for backend
          let backendKey = key;
          if (key === 'presentationType') backendKey = 'presentation_type';
          
          searchParams.append(backendKey, value.toString());
        }
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/api/abstracts/?${searchParams.toString()}`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data.map(normalizeAbstract) : [];
  },

  getAbstractById: async (id: number): Promise<Abstract> => {
    const response = await fetch(`${API_BASE_URL}/api/abstracts/${id}/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return normalizeAbstract(data);
  },

  createAbstract: async (data: CreateAbstractInput): Promise<Abstract> => {
    const formData = new FormData();
    
    // Append all fields to formData with correct field names
    const fieldMapping: Record<string, string> = {
      title: 'title',
      category: 'category',
      presentationPreference: 'presentation_preference',
      background: 'background',
      methods: 'methods',
      results: 'results',
      conclusions: 'conclusions',
      conflictOfInterest: 'conflict_of_interest',
    };
    
    // Append basic fields
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && key !== 'authors' && key !== 'keywords' && 
          key !== 'abstractFile' && key !== 'ethicalApprovalFile' && key !== 'supplementaryFiles') {
        const fieldName = fieldMapping[key] || key;
        formData.append(fieldName, value.toString());
      }
    });
    
    // Append authors as JSON
    if (data.authors && data.authors.length > 0) {
      const authorsData = data.authors.map(author => ({
        first_name: author.firstName,
        last_name: author.lastName,
        email: author.email,
        institution: author.institution,
        country: author.country,
        is_presenter: author.isPresenter,
        is_corresponding: author.isCorresponding,
        order: author.order || 0,
      }));
      formData.append('authors', JSON.stringify(authorsData));
    }
    
    // Append keywords as JSON
    if (data.keywords && data.keywords.length > 0) {
      formData.append('keywords', JSON.stringify(data.keywords));
    }
    
    // Append files
    if (data.abstractFile) {
      formData.append('abstract_file', data.abstractFile);
    }
    
    if (data.ethicalApprovalFile) {
      formData.append('ethical_approval_file', data.ethicalApprovalFile);
    }
    
    if (data.supplementaryFiles && data.supplementaryFiles.length > 0) {
      data.supplementaryFiles.forEach((file) => {
        formData.append(`supplementary_files`, file);
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/api/abstracts/`, {
      method: 'POST',
      headers: getAuthHeadersWithoutContentType(),
      body: formData,
    });
    
    const result = await handleResponse(response);
    return normalizeAbstract(result);
  },

  updateAbstract: async (id: number, data: Partial<UpdateAbstractInput>): Promise<Abstract> => {
    const formData = new FormData();
    
    // Append all fields to formData with correct field names
    const fieldMapping: Record<string, string> = {
      title: 'title',
      category: 'category',
      presentationPreference: 'presentation_preference',
      background: 'background',
      methods: 'methods',
      results: 'results',
      conclusions: 'conclusions',
      conflictOfInterest: 'conflict_of_interest',
      status: 'status',
      reviewerComments: 'reviewer_comments',
      assignedReviewer: 'assigned_reviewer',
      isFeatured: 'is_featured',
    };
    
    // Append basic fields
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && key !== 'authors' && key !== 'keywords' && 
          key !== 'abstractFile' && key !== 'ethicalApprovalFile' && key !== 'supplementaryFiles') {
        const fieldName = fieldMapping[key] || key;
        formData.append(fieldName, value.toString());
      }
    });
    
    // Append authors as JSON if provided
    if (data.authors) {
      const authorsData = data.authors.map(author => ({
        id: author.id,
        first_name: author.firstName,
        last_name: author.lastName,
        email: author.email,
        institution: author.institution,
        country: author.country,
        is_presenter: author.isPresenter,
        is_corresponding: author.isCorresponding,
        order: author.order || 0,
      }));
      formData.append('authors', JSON.stringify(authorsData));
    }
    
    // Append keywords as JSON if provided
    if (data.keywords) {
      formData.append('keywords', JSON.stringify(data.keywords));
    }
    
    // Append files if provided
    if (data.abstractFile) {
      formData.append('abstract_file', data.abstractFile);
    }
    
    if (data.ethicalApprovalFile) {
      formData.append('ethical_approval_file', data.ethicalApprovalFile);
    }
    
    if (data.supplementaryFiles && data.supplementaryFiles.length > 0) {
      data.supplementaryFiles.forEach((file) => {
        formData.append(`supplementary_files`, file);
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/api/abstracts/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeadersWithoutContentType(),
      body: formData,
    });
    
    const result = await handleResponse(response);
    return normalizeAbstract(result);
  },

  deleteAbstract: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/abstracts/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeadersWithoutContentType(),
    });
    
    return handleResponse(response);
  },

  updateAbstractStatus: async (id: number, status: AbstractStatus): Promise<Abstract> => {
    const response = await fetch(`${API_BASE_URL}/api/abstracts/${id}/update_status/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    
    const result = await handleResponse(response);
    return normalizeAbstract(result);
  },

  toggleFeatured: async (id: number): Promise<Abstract> => {
    const response = await fetch(`${API_BASE_URL}/api/abstracts/${id}/toggle_featured/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    
    const result = await handleResponse(response);
    return normalizeAbstract(result);
  },

  // ========== FILE UPLOAD OPERATIONS ==========
  uploadAbstractFile: async (file: File): Promise<{ url: string; filename: string; path: string }> => {
    const formData = new FormData();
    formData.append('abstract_file', file);
    
    const response = await fetch(`${API_BASE_URL}/api/abstracts/upload_abstract_file/`, {
      method: 'POST',
      headers: getAuthHeadersWithoutContentType(),
      body: formData,
    });
    
    return handleResponse(response);
  },

  uploadEthicalApproval: async (file: File): Promise<{ url: string; filename: string; path: string }> => {
    const formData = new FormData();
    formData.append('ethical_approval_file', file);
    
    const response = await fetch(`${API_BASE_URL}/api/abstracts/upload_ethical_approval/`, {
      method: 'POST',
      headers: getAuthHeadersWithoutContentType(),
      body: formData,
    });
    
    return handleResponse(response);
  },

  uploadSupplementaryFile: async (file: File): Promise<{ url: string; filename: string; path: string }> => {
    const formData = new FormData();
    formData.append('supplementary_file', file);
    
    const response = await fetch(`${API_BASE_URL}/api/abstracts/upload_supplementary_file/`, {
      method: 'POST',
      headers: getAuthHeadersWithoutContentType(),
      body: formData,
    });
    
    return handleResponse(response);
  },

  // ========== ANALYTICS AND METADATA ==========
  getAnalytics: async (): Promise<AbstractAnalytics> => {
    const response = await fetch(`${API_BASE_URL}/api/abstracts/analytics/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return data;
  },

  getCategories: async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/api/abstracts/categories/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  },

  getPresentationTypes: async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/api/abstracts/presentation_types/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  },

  // ========== EMAIL OPERATIONS ==========
  sendStatusNotification: async (abstractId: number): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/api/abstracts/${abstractId}/send_status_notification/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  addCommentsAndNotify: async (abstractId: number, reviewerComments: string): Promise<{ success: boolean; message: string; abstract: Abstract }> => {
    const response = await fetch(`${API_BASE_URL}/api/abstracts/${abstractId}/add_comments_and_notify/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        reviewer_comments: reviewerComments
      })
    });

    return handleResponse(response);
  },

  updateComments: async (abstractId: number, reviewerComments: string): Promise<Abstract> => {
    const response = await fetch(`${API_BASE_URL}/api/abstracts/${abstractId}/update_comments/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        reviewer_comments: reviewerComments
      })
    });

    const result = await handleResponse(response);
    return normalizeAbstract(result);
  },

  // ========== IMPORTANT DATES OPERATIONS ==========
  getImportantDates: async (): Promise<ImportantDates> => {
    const response = await fetch(`${API_BASE_URL}/api/abstracts/important_dates/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return data;
  },

  getCurrentImportantDates: async (): Promise<ImportantDates> => {
    const response = await fetch(`${API_BASE_URL}/api/important-dates/current/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return data;
  },

  updateImportantDates: async (dates: Partial<ImportantDates>): Promise<ImportantDates> => {
    const response = await fetch(`${API_BASE_URL}/api/abstracts/update_important_dates/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(dates),
    });
    
    const result = await handleResponse(response);
    return result.data || result;
  },

  createImportantDates: async (dates: CreateImportantDatesInput): Promise<ImportantDates> => {
    const response = await fetch(`${API_BASE_URL}/api/important-dates/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        year: dates.year,
        abstract_submission_opens: dates.abstractSubmissionOpens.replace(`, ${dates.year}`, ''),
        abstract_submission_deadline: dates.abstractSubmissionDeadline.replace(`, ${dates.year}`, ''),
        abstract_review_completion: dates.abstractReviewCompletion.replace(`, ${dates.year}`, ''),
        acceptance_notifications: dates.acceptanceNotifications.replace(`, ${dates.year}`, ''),
        final_abstract_submission: dates.finalAbstractSubmission.replace(`, ${dates.year}`, ''),
        conference_presentation: dates.conferencePresentation.replace(`, ${dates.year}`, ''),
        is_active: dates.isActive || true,
      }),
    });
    
    const result = await handleResponse(response);
    return result.data || result;
  },

  setActiveImportantDates: async (id: number): Promise<ImportantDates> => {
    const response = await fetch(`${API_BASE_URL}/api/important-dates/${id}/set_active/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    
    const result = await handleResponse(response);
    return result.data || result;
  },
  
  // ========== EXPORT OPERATIONS ==========
  exportAbstracts: async (format: 'csv' | 'xlsx' = 'csv', params?: {
    status?: AbstractStatus;
    category?: AbstractCategory;
    presentationType?: PresentationType;
  }): Promise<Blob> => {
    const searchParams = new URLSearchParams();
    searchParams.append('format', format);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          let backendKey = key;
          if (key === 'presentationType') backendKey = 'presentation_type';
          
          searchParams.append(backendKey, value.toString());
        }
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/api/abstracts/export/?${searchParams.toString()}`, {
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
  getAbstracts,
  getAbstractById,
  createAbstract,
  updateAbstract,
  deleteAbstract,
  updateAbstractStatus,
  toggleFeatured,
  uploadAbstractFile,
  uploadEthicalApproval,
  uploadSupplementaryFile,
  getAnalytics,
  getCategories,
  getPresentationTypes,
  sendStatusNotification,
  getImportantDates,
  getCurrentImportantDates,
  updateImportantDates,
  createImportantDates,
  setActiveImportantDates,
  exportAbstracts,
} = abstractApi;