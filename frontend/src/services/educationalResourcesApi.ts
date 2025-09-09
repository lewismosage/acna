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

export interface EducationalResource {
  id: number;
  title: string;
  description: string;
  fullDescription?: string;
  category: string;
  type: string;
  condition?: string;
  status: 'Published' | 'Draft' | 'Under Review' | 'Archived';
  isFeatured: boolean;
  isFree: boolean;
  imageUrl?: string;
  fileUrl?: string;
  videoUrl?: string;
  externalUrl?: string;
  languages: string[];
  tags: string[];
  targetAudience: string[];
  relatedConditions: string[];
  learningObjectives: string[];
  prerequisites: string[];
  references: string[];
  ageGroup?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration?: string;
  fileSize?: string;
  fileFormat?: string;
  author: string;
  reviewedBy?: string;
  institution?: string;
  location?: string;
  impactStatement?: string;
  accreditation?: string;
  downloadCount: number;
  viewCount: number;
  rating?: number;
  publicationDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CaseStudySubmission {
  id: number;
  title: string;
  submittedBy: string;
  institution: string;
  email: string;
  phone?: string;
  location: string;
  category: string;
  excerpt: string;
  fullContent?: string;
  impact?: string;
  status: 'Pending Review' | 'Under Review' | 'Approved' | 'Published' | 'Rejected';
  reviewNotes?: string;
  reviewedBy?: string;
  attachments: string[];
  imageUrl?: string;
  submissionDate: string;
  reviewDate?: string;
  publishedDate?: string;
}

export interface CaseReportSubmissionInput {
  title: string;
  submittedBy: string;
  institution: string;
  email: string;
  phone?: string;
  location: string;
  category: string;
  patientDemographics: {
    ageGroup: string;
    gender: string;
    location: string;
  };
  clinicalPresentation: string;
  diagnosticWorkup: string;
  management: string;
  outcome: string;
  lessonLearned: string;
  discussion?: string;
  excerpt: string;
  impact?: string;
  ethicsApproval: boolean;
  ethicsNumber?: string;
  consentObtained: boolean;
  conflictOfInterest?: string;
  acknowledgments?: string;
  references?: string;
  attachments: File[];
  images: File[];
  declaration: boolean;
}

export interface ResourceAnalytics {
  total: number;
  published: number;
  draft: number;
  underReview: number;
  archived: number;
  featured: number;
  totalDownloads: number;
  monthlyDownloads: number;
  totalViews: number;
  monthlyViews: number;
  pendingSubmissions: number;
  resourcesByCategory: {
    [key: string]: number;
  };
  topResources: Array<{
    id: number;
    title: string;
    category: string;
    downloadCount: number;
    viewCount: number;
  }>;
  recentActivity: Array<{
    type: string;
    resource: string;
    count?: number;
    date: string;
    user?: string;
  }>;
}

const normalizeResource = (backendResource: any): EducationalResource => {
  const safeArray = (arr: any): string[] => {
    if (!Array.isArray(arr)) return [];
    return arr.filter((item: any) => typeof item === 'string' && item.trim());
  };

  return {
    id: backendResource.id || 0,
    title: backendResource.title || '',
    description: backendResource.description || '',
    fullDescription: backendResource.full_description || backendResource.fullDescription,
    category: backendResource.category || '',
    type: backendResource.resource_type || backendResource.type || 'Fact Sheet',
    condition: backendResource.condition,
    status: backendResource.status || 'Draft',
    isFeatured: backendResource.is_featured || backendResource.isFeatured || false,
    isFree: backendResource.is_free !== undefined ? backendResource.is_free : (backendResource.isFree !== undefined ? backendResource.isFree : true),
    imageUrl: backendResource.image_url_display || backendResource.image_url || backendResource.imageUrl,
    fileUrl: backendResource.file_url_display || backendResource.file_url || backendResource.fileUrl,
    videoUrl: backendResource.video_url || backendResource.videoUrl,
    externalUrl: backendResource.external_url || backendResource.externalUrl,
    languages: safeArray(backendResource.languages),
    tags: safeArray(backendResource.tags),
    targetAudience: safeArray(backendResource.target_audience || backendResource.targetAudience),
    relatedConditions: safeArray(backendResource.related_conditions || backendResource.relatedConditions),
    learningObjectives: safeArray(backendResource.learning_objectives || backendResource.learningObjectives),
    prerequisites: safeArray(backendResource.prerequisites),
    references: safeArray(backendResource.references),
    ageGroup: backendResource.age_group || backendResource.ageGroup,
    difficulty: backendResource.difficulty || 'Beginner',
    duration: backendResource.duration,
    fileSize: backendResource.file_size || backendResource.fileSize,
    fileFormat: backendResource.file_format || backendResource.fileFormat,
    author: backendResource.author || '',
    reviewedBy: backendResource.reviewed_by || backendResource.reviewedBy,
    institution: backendResource.institution,
    location: backendResource.location,
    impactStatement: backendResource.impact_statement || backendResource.impactStatement,
    accreditation: backendResource.accreditation,
    downloadCount: backendResource.download_count || backendResource.downloadCount || 0,
    viewCount: backendResource.view_count || backendResource.viewCount || 0,
    rating: backendResource.rating,
    publicationDate: backendResource.publication_date || backendResource.publicationDate || '',
    createdAt: backendResource.created_at?.split('T')[0] || backendResource.createdAt || new Date().toISOString().split('T')[0],
    updatedAt: backendResource.updated_at?.split('T')[0] || backendResource.updatedAt || new Date().toISOString().split('T')[0],
  };
};

const normalizeCaseStudySubmission = (backendSubmission: any): CaseStudySubmission => {
  const safeArray = (arr: any): string[] => {
    if (!Array.isArray(arr)) return [];
    return arr.filter((item: any) => typeof item === 'string' && item.trim());
  };

  return {
    id: backendSubmission.id || 0,
    title: backendSubmission.title || '',
    submittedBy: backendSubmission.submittedBy || backendSubmission.submitted_by || '',
    institution: backendSubmission.institution || '',
    email: backendSubmission.email || '',
    phone: backendSubmission.phone,
    location: backendSubmission.location || '',
    category: backendSubmission.category || '',
    excerpt: backendSubmission.excerpt || '',
    fullContent: backendSubmission.fullContent || backendSubmission.full_content,
    impact: backendSubmission.impact,
    status: backendSubmission.status || 'Pending Review',
    reviewNotes: backendSubmission.reviewNotes || backendSubmission.review_notes,
    reviewedBy: backendSubmission.reviewedBy || backendSubmission.reviewed_by,
    attachments: safeArray(backendSubmission.attachments),
    imageUrl: backendSubmission.imageUrl || backendSubmission.image_url,
    submissionDate: backendSubmission.submissionDate || 
                   (backendSubmission.submission_date?.split('T')[0]) || 
                   new Date().toISOString().split('T')[0],
    reviewDate: backendSubmission.reviewDate || 
                (backendSubmission.review_date?.split('T')[0]),
    publishedDate: backendSubmission.publishedDate || 
                   (backendSubmission.published_date?.split('T')[0]),
  };
};

export const educationalResourcesApi = {
  // ========== RESOURCE CRUD OPERATIONS ==========
  
  getAll: async (params?: {
    status?: string;
    category?: string;
    type?: string;
    featured?: boolean;
    free?: boolean;
    search?: string;
  }): Promise<EducationalResource[]> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/resources/?${searchParams.toString()}`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data.map(normalizeResource) : [];
  },

  getById: async (id: number): Promise<EducationalResource> => {
    const response = await fetch(`${API_BASE_URL}/resources/${id}/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return normalizeResource(data);
  },

  create: async (data: any): Promise<EducationalResource> => {
    // Create FormData for file uploads
    const formData = new FormData();
    
    // Field mapping from frontend camelCase to backend snake_case
    const fieldMapping: Record<string, string> = {
      'type': 'resource_type',
      'fullDescription': 'full_description',
      'isFeatured': 'is_featured',
      'isFree': 'is_free',
      'imageUrl': 'image_url',
      'fileUrl': 'file_url',
      'videoUrl': 'video_url',
      'externalUrl': 'external_url',
      'targetAudience': 'target_audience',
      'relatedConditions': 'related_conditions',
      'learningObjectives': 'learning_objectives',
      'ageGroup': 'age_group',
      'fileSize': 'file_size',
      'fileFormat': 'file_format',
      'reviewedBy': 'reviewed_by',
      'impactStatement': 'impact_statement',
      'downloadCount': 'download_count',
      'viewCount': 'view_count',
      'publicationDate': 'publication_date',
    };

    // Handle array fields by stringifying them
    const arrayFields = [
      'languages', 'tags', 'targetAudience', 'relatedConditions', 
      'learningObjectives', 'prerequisites', 'references'
    ];

    Object.entries(data).forEach(([key, value]) => {
      const backendKey = fieldMapping[key] || key;
      
      if (arrayFields.includes(key) && Array.isArray(value)) {
        formData.append(backendKey, JSON.stringify(value));
      } else if (key === 'imageFile' && value instanceof File) {
        formData.append('image', value);
      } else if (key === 'resourceFile' && value instanceof File) {
        formData.append('file', value);
      } else if (value !== null && value !== undefined && key !== 'imageFile' && key !== 'resourceFile') {
        formData.append(backendKey, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}/resources/`, {
      method: 'POST',
      headers: getAuthHeadersWithoutContentType(),
      body: formData,
    });
    
    const result = await handleResponse(response);
    return normalizeResource(result);
  },

  update: async (id: number, data: any): Promise<EducationalResource> => {
    // Create FormData for file uploads
    const formData = new FormData();
    
    // Field mapping from frontend camelCase to backend snake_case
    const fieldMapping: Record<string, string> = {
      'type': 'resource_type',
      'fullDescription': 'full_description',
      'isFeatured': 'is_featured',
      'isFree': 'is_free',
      'imageUrl': 'image_url',
      'fileUrl': 'file_url',
      'videoUrl': 'video_url',
      'externalUrl': 'external_url',
      'targetAudience': 'target_audience',
      'relatedConditions': 'related_conditions',
      'learningObjectives': 'learning_objectives',
      'ageGroup': 'age_group',
      'fileSize': 'file_size',
      'fileFormat': 'file_format',
      'reviewedBy': 'reviewed_by',
      'impactStatement': 'impact_statement',
      'downloadCount': 'download_count',
      'viewCount': 'view_count',
      'publicationDate': 'publication_date',
    };

    // Handle array fields by stringifying them
    const arrayFields = [
      'languages', 'tags', 'targetAudience', 'relatedConditions', 
      'learningObjectives', 'prerequisites', 'references'
    ];

    Object.entries(data).forEach(([key, value]) => {
      const backendKey = fieldMapping[key] || key;
      
      if (arrayFields.includes(key) && Array.isArray(value)) {
        formData.append(backendKey, JSON.stringify(value));
      } else if (key === 'imageFile' && value instanceof File) {
        formData.append('image', value);
      } else if (key === 'resourceFile' && value instanceof File) {
        formData.append('file', value);
      } else if (value !== null && value !== undefined && key !== 'imageFile' && key !== 'resourceFile') {
        formData.append(backendKey, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}/resources/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeadersWithoutContentType(),
      body: formData,
    });
    
    const result = await handleResponse(response);
    return normalizeResource(result);
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/resources/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeadersWithoutContentType(),
    });
    
    return handleResponse(response);
  },

  // ========== RESOURCE-SPECIFIC OPERATIONS ==========
  
  getFeatured: async (): Promise<EducationalResource[]> => {
    const response = await fetch(`${API_BASE_URL}/resources/featured/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data.map(normalizeResource) : [];
  },

  getByStatus: async (status: string): Promise<EducationalResource[]> => {
    const response = await fetch(`${API_BASE_URL}/resources/?status=${status}`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data.map(normalizeResource) : [];
  },

  getAnalytics: async (): Promise<ResourceAnalytics> => {
    const response = await fetch(`${API_BASE_URL}/resources/analytics/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return data;
  },

  toggleFeatured: async (id: number): Promise<EducationalResource> => {
    const response = await fetch(`${API_BASE_URL}/resources/${id}/toggle_featured/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    const result = await handleResponse(response);
    return normalizeResource(result);
  },

  updateStatus: async (id: number, status: string): Promise<EducationalResource> => {
    const response = await fetch(`${API_BASE_URL}/resources/${id}/update_status/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    
    const result = await handleResponse(response);
    return normalizeResource(result);
  },

  incrementDownload: async (id: number): Promise<void> => {
    await fetch(`${API_BASE_URL}/resources/${id}/increment_download/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  },

  incrementView: async (id: number): Promise<void> => {
    await fetch(`${API_BASE_URL}/resources/${id}/increment_view/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  },

  // ========== FILE UPLOAD OPERATIONS ==========
  
  uploadImage: async (file: File): Promise<{ url: string; filename: string; path: string }> => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`${API_BASE_URL}/resources/upload_image/`, {
      method: 'POST',
      headers: getAuthHeadersWithoutContentType(),
      body: formData,
    });
    
    return handleResponse(response);
  },

  uploadFile: async (file: File): Promise<{ url: string; filename: string; path: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/resources/upload_file/`, {
      method: 'POST',
      headers: getAuthHeadersWithoutContentType(),
      body: formData,
    });
    
    return handleResponse(response);
  },

  // ========== METADATA OPERATIONS ==========
  
  getCategories: async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/resources/categories/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  },

  getTargetAudiences: async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/resources/target_audiences/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  },

  getAuthors: async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/resources/authors/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  },

  // ========== CASE STUDY SUBMISSIONS ==========
  
  getSubmissions: async (params?: {
    status?: string;
    category?: string;
    search?: string;
  }): Promise<CaseStudySubmission[]> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/case-study-submissions/?${searchParams.toString()}`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data.map(normalizeCaseStudySubmission) : [];
  },

  getSubmissionById: async (id: number): Promise<CaseStudySubmission> => {
    const response = await fetch(`${API_BASE_URL}/case-study-submissions/${id}/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return normalizeCaseStudySubmission(data);
  },

  createSubmission: async (data: Partial<CaseStudySubmission>): Promise<CaseStudySubmission> => {
    const response = await fetch(`${API_BASE_URL}/case-study-submissions/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    const result = await handleResponse(response);
    return normalizeCaseStudySubmission(result);
  },

  updateSubmission: async (id: number, data: Partial<CaseStudySubmission>): Promise<CaseStudySubmission> => {
    const response = await fetch(`${API_BASE_URL}/case-study-submissions/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    const result = await handleResponse(response);
    return normalizeCaseStudySubmission(result);
  },

  deleteSubmission: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/case-study-submissions/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  updateSubmissionStatus: async (id: number, status: string, reviewNotes?: string, reviewedBy?: string): Promise<CaseStudySubmission> => {
    const body: any = { status };
    if (reviewNotes) body.reviewNotes = reviewNotes;
    if (reviewedBy) body.reviewedBy = reviewedBy;
    
    const response = await fetch(`${API_BASE_URL}/case-study-submissions/${id}/update_status/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    
    const result = await handleResponse(response);
    return normalizeCaseStudySubmission(result);
  },

  getPendingSubmissions: async (): Promise<CaseStudySubmission[]> => {
    const response = await fetch(`${API_BASE_URL}/case-study-submissions/pending/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data.map(normalizeCaseStudySubmission) : [];
  },

  // ========== CASE REPORT SUBMISSIONS ==========
  
  submitCaseReport: async (data: CaseReportSubmissionInput): Promise<any> => {
    try {
      // Prepare the case study submission data in the format backend expects (snake_case)
      const submissionData = {
        title: data.title,
        submitted_by: data.submittedBy,  // Convert to snake_case
        institution: data.institution,
        email: data.email,
        phone: data.phone || '',
        location: data.location,
        category: data.category,
        excerpt: data.excerpt,
        full_content: JSON.stringify({
          patient_demographics: {  // Convert to snake_case
            age_group: data.patientDemographics.ageGroup,
            gender: data.patientDemographics.gender,
            location: data.patientDemographics.location
          },
          clinical_presentation: data.clinicalPresentation,
          diagnostic_workup: data.diagnosticWorkup,
          management: data.management,
          outcome: data.outcome,
          lesson_learned: data.lessonLearned,
          discussion: data.discussion || '',
          ethics_approval: data.ethicsApproval,
          ethics_number: data.ethicsNumber || '',
          consent_obtained: data.consentObtained,
          conflict_of_interest: data.conflictOfInterest || '',
          acknowledgments: data.acknowledgments || '',
          references: data.references || '',
          declaration: data.declaration,
          impact: data.impact || ''
        }),
        impact: data.impact || '',
        attachments: data.attachments.map(file => file.name),
        status: 'Pending Review'
      };
  
      console.log('Submitting case report:', submissionData);
      console.log('Data being sent to backend:', submissionData);
      console.log('Specifically submitted_by:', submissionData.submitted_by);
  
      const response = await fetch(`${API_BASE_URL}/case-study-submissions/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(submissionData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Backend error response:', errorData);
        throw new Error(errorData.error || errorData.detail || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error('Error in submitCaseReport:', error);
      throw new Error(error.message || 'Failed to submit case report');
    }
  },

  getCaseReportSubmissions: async (params?: {
    status?: string;
    category?: string;
    search?: string;
  }): Promise<any[]> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/case-study-submissions/?${searchParams.toString()}`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  },

  updateCaseReportStatus: async (
    id: number, 
    status: string, 
    reviewNotes?: string, 
    reviewedBy?: string
  ): Promise<any> => {
    const body: any = { status };
    if (reviewNotes) body.reviewNotes = reviewNotes;
    if (reviewedBy) body.reviewedBy = reviewedBy;
    
    const response = await fetch(`${API_BASE_URL}/case-study-submissions/${id}/update_status/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    
    const result = await handleResponse(response);
    return result;
  },

  getPendingCaseReports: async (): Promise<any[]> => {
    const response = await fetch(`${API_BASE_URL}/case-study-submissions/pending/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  },

  uploadCaseReportFiles: async (files: File[], type: 'attachments' | 'images'): Promise<string[]> => {
    const uploadedPaths: string[] = [];
    
    for (const file of files) {
      const formData = new FormData();
      formData.append(type === 'images' ? 'image' : 'file', file);
      
      const endpoint = type === 'images' ? 'upload_image' : 'upload_file';
      
      const response = await fetch(`${API_BASE_URL}/resources/${endpoint}/`, {
        method: 'POST',
        headers: getAuthHeadersWithoutContentType(),
        body: formData,
      });
      
      const result = await handleResponse(response);
      uploadedPaths.push(result.path || result.url);
    }
    
    return uploadedPaths;
  },
};

// Export individual functions for convenience
export const {
  getAll,
  getById,
  create,
  update,
  delete: deleteResource,
  getFeatured,
  getByStatus,
  getAnalytics,
  toggleFeatured,
  updateStatus,
  incrementDownload,
  incrementView,
  uploadImage,
  uploadFile,
  getCategories,
  getTargetAudiences,
  getAuthors,
  getSubmissions,
  getSubmissionById,
  createSubmission,
  updateSubmission,
  deleteSubmission,
  updateSubmissionStatus,
  getPendingSubmissions,
  submitCaseReport,
  getCaseReportSubmissions,
  updateCaseReportStatus,
  getPendingCaseReports,
  uploadCaseReportFiles,
} = educationalResourcesApi;