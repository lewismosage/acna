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

// Types matching your React components
export type ResearchProjectType = 
  | 'Clinical Trial' 
  | 'Observational Study' 
  | 'Intervention Study' 
  | 'Epidemiological Study' 
  | 'Genetic Research' 
  | 'Cohort Study' 
  | 'Case-Control Study'
  | 'Systematic Review'
  | 'Meta-Analysis';

export type ResearchProjectStatus = 
  | 'Planning' 
  | 'Active' 
  | 'Recruiting' 
  | 'Data Collection' 
  | 'Analysis' 
  | 'Completed' 
  | 'Suspended' 
  | 'Terminated';

export interface Investigator {
  name: string;
  role: string;
  affiliation: string;
  email?: string;
}

export interface ResearchProject {
  id: number;
  title: string;
  description: string;
  type: ResearchProjectType;
  status: ResearchProjectStatus;
  principalInvestigator: string;
  investigators: Investigator[];
  institutions: string[];
  startDate: string;
  endDate: string;
  fundingSource?: string;
  fundingAmount?: string;
  targetPopulation: string;
  sampleSize?: number;
  objectives: string[];
  methodology: string;
  ethicsApproval: boolean;
  registrationNumber?: string;
  keywords: string[];
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  investigatorCount?: number;
  durationDays?: number;
  isActive?: boolean;
}

export interface CreateResearchProjectInput {
  title: string;
  description: string;
  type: ResearchProjectType;
  status: ResearchProjectStatus;
  principalInvestigator: string;
  investigators: Investigator[];
  institutions: string[];
  startDate: string;
  endDate: string;
  fundingSource?: string;
  fundingAmount?: string;
  targetPopulation: string;
  sampleSize?: number;
  objectives: string[];
  methodology: string;
  ethicsApproval: boolean;
  registrationNumber?: string;
  keywords: string[];
  imageFile?: File;
}

export interface ResearchProjectAnalytics {
  total: number;
  planning: number;
  active: number;
  recruiting: number;
  dataCollection: number;
  analysis: number;
  completed: number;
  suspended: number;
  terminated: number;
  projectsByType: {
    [key: string]: number;
  };
  projectsByStatus: {
    [key: string]: number;
  };
  totalInvestigators: number;
  projectsWithEthicsApproval: number;
  avgDurationDays?: number;
}

export interface ResearchProjectUpdate {
  id: number;
  researchProject: number;
  title: string;
  description: string;
  updateType: 'Milestone' | 'Status Change' | 'Publication' | 'General Update';
  createdAt: string;
}

// NEW TYPES FOR RESEARCH PAPERS

export type ResearchPaperStatus = 
  | 'Submitted'
  | 'Under Review'
  | 'Revision Required'
  | 'Accepted'
  | 'Published'
  | 'Rejected';

export type ResearchPaperType = 
  | 'Clinical Trial'
  | 'Observational Study'
  | 'Case Report'
  | 'Case Series'
  | 'Systematic Review'
  | 'Meta-Analysis'
  | 'Basic Science Research'
  | 'Epidemiological Study'
  | 'Other';

export type ResearchPaperCategory = 
  | 'Pediatric Epilepsy'
  | 'Cerebral Palsy'
  | 'Neurodevelopmental Disorders'
  | 'Pediatric Stroke'
  | 'Infectious Diseases of CNS'
  | 'Genetic Neurological Disorders'
  | 'Neurooncology'
  | 'Other';

export type StudyDesign = 
  | 'Randomized Controlled Trial'
  | 'Cohort Study'
  | 'Case-Control Study'
  | 'Cross-Sectional Study'
  | 'Qualitative Study'
  | 'Mixed Methods'
  | 'Other';

export interface Author {
  name: string;
  email: string;
  affiliation: string;
  isCorresponding: boolean;
}

export interface ResearchPaper {
  id: number;
  title: string;
  abstract: string;
  keywords: string[];
  researchType: ResearchPaperType;
  category: ResearchPaperCategory;
  studyDesign?: StudyDesign;
  participants?: string;
  ethicsApproval: boolean;
  ethicsNumber?: string;
  fundingSource?: string;
  conflictOfInterest?: string;
  acknowledgments?: string;
  targetJournal?: string;
  status: ResearchPaperStatus;
  manuscriptFile: string;
  manuscriptUrl?: string;
  authors: Author[];
  researchProject?: number;
  submissionDate: string;
  lastModified: string;
  reviewDeadline?: string;
  correspondingAuthor?: Author;
  authorCount: number;
  isUnderReview: boolean;
  supplementaryFiles: ResearchPaperFile[];
}

export interface ResearchPaperFile {
  id: number;
  file: string;
  fileUrl?: string;
  fileType: 'supplementary' | 'figure' | 'dataset' | 'appendix' | 'other';
  description?: string;
  uploadedAt: string;
  fileSize?: number;
}

export interface CreateResearchPaperInput {
  title: string;
  abstract: string;
  keywords: string[];
  researchType: ResearchPaperType;
  category: ResearchPaperCategory;
  studyDesign?: StudyDesign;
  participants?: string;
  ethicsApproval: boolean;
  ethicsNumber?: string;
  fundingSource?: string;
  conflictOfInterest?: string;
  acknowledgments?: string;
  targetJournal?: string;
  authors: Author[];
  researchProject?: number;
  manuscriptFile: File;
  supplementaryFiles?: File[];
  declaration: boolean;
}

export interface ResearchPaperAnalytics {
  totalPapers: number;
  submitted: number;
  underReview: number;
  revisionRequired: number;
  accepted: number;
  published: number;
  rejected: number;
  papersByCategory: {
    [key: string]: number;
  };
  papersByResearchType: {
    [key: string]: number;
  };
  papersByStatus: {
    [key: string]: number;
  };
  totalAuthors: number;
  papersWithEthicsApproval: number;
  avgReviewTimeDays?: number;
}

export interface ResearchPaperReview {
  id: number;
  researchPaper: number;
  reviewerName: string;
  reviewerEmail: string;
  reviewStatus: 'Pending' | 'In Progress' | 'Completed';
  recommendation?: 'Accept' | 'Minor Revisions' | 'Major Revisions' | 'Reject';
  comments?: string;
  assignedAt: string;
  completedAt?: string;
}

export interface ResearchPaperComment {
  id: number;
  researchPaper: number;
  commenterName: string;
  commenterEmail: string;
  comment: string;
  isInternal: boolean;
  createdAt: string;
}

const normalizeResearchProject = (backendProject: any): ResearchProject => {
  const safeArray = (arr: any): string[] => {
    if (!Array.isArray(arr)) return [];
    return arr.filter((item: any) => typeof item === 'string' && item.trim());
  };

  const safeInvestigatorArray = (arr: any): Investigator[] => {
    if (!Array.isArray(arr)) return [];
    return arr.filter((item: any) => 
      typeof item === 'object' && item.name && item.role && item.affiliation
    );
  };

  return {
    id: backendProject.id || 0,
    title: backendProject.title || '',
    description: backendProject.description || '',
    type: backendProject.type || 'Clinical Trial',
    status: backendProject.status || 'Planning',
    principalInvestigator: backendProject.principalInvestigator || backendProject.principal_investigator || '',
    investigators: safeInvestigatorArray(backendProject.investigators),
    institutions: safeArray(backendProject.institutions),
    startDate: backendProject.startDate || backendProject.start_date || '',
    endDate: backendProject.endDate || backendProject.end_date || '',
    fundingSource: backendProject.fundingSource || backendProject.funding_source,
    fundingAmount: backendProject.fundingAmount || backendProject.funding_amount,
    targetPopulation: backendProject.targetPopulation || backendProject.target_population || '',
    sampleSize: backendProject.sampleSize || backendProject.sample_size,
    objectives: safeArray(backendProject.objectives),
    methodology: backendProject.methodology || '',
    ethicsApproval: backendProject.ethicsApproval || backendProject.ethics_approval || false,
    registrationNumber: backendProject.registrationNumber || backendProject.registration_number,
    keywords: safeArray(backendProject.keywords),
    imageUrl: backendProject.imageUrl || backendProject.image_url || 'https://images.pexels.com/photos/3985163/pexels-photo-3985163.jpeg?auto=compress&cs=tinysrgb&w=400',
    createdAt: backendProject.createdAt || backendProject.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    updatedAt: backendProject.updatedAt || backendProject.updated_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    investigatorCount: backendProject.investigatorCount || backendProject.investigator_count,
    durationDays: backendProject.durationDays || backendProject.duration_days,
    isActive: backendProject.isActive || backendProject.is_active,
  };
};

const normalizeResearchPaper = (backendPaper: any): ResearchPaper => {
  const safeArray = (arr: any): string[] => {
    if (!Array.isArray(arr)) return [];
    return arr.filter((item: any) => typeof item === 'string' && item.trim());
  };

  const safeAuthorArray = (arr: any): Author[] => {
    if (!Array.isArray(arr)) return [];
    return arr.filter((item: any) => 
      typeof item === 'object' && item.name && item.email && item.affiliation
    );
  };

  return {
    id: backendPaper.id || 0,
    title: backendPaper.title || '',
    abstract: backendPaper.abstract || '',
    keywords: safeArray(backendPaper.keywords),
    researchType: backendPaper.researchType || backendPaper.research_type || 'Clinical Trial',
    category: backendPaper.category || 'Other',
    studyDesign: backendPaper.studyDesign || backendPaper.study_design,
    participants: backendPaper.participants,
    ethicsApproval: backendPaper.ethicsApproval || backendPaper.ethics_approval || false,
    ethicsNumber: backendPaper.ethicsNumber || backendPaper.ethics_number,
    fundingSource: backendPaper.fundingSource || backendPaper.funding_source,
    conflictOfInterest: backendPaper.conflictOfInterest || backendPaper.conflict_of_interest,
    acknowledgments: backendPaper.acknowledgments,
    targetJournal: backendPaper.targetJournal || backendPaper.target_journal,
    status: backendPaper.status || 'Submitted',
    manuscriptFile: backendPaper.manuscriptFile || backendPaper.manuscript_file || '',
    manuscriptUrl: backendPaper.manuscriptUrl || backendPaper.manuscript_url,
    authors: safeAuthorArray(backendPaper.authors),
    researchProject: backendPaper.researchProject || backendPaper.research_project,
    submissionDate: backendPaper.submissionDate || backendPaper.submission_date?.split('T')[0] || new Date().toISOString().split('T')[0],
    lastModified: backendPaper.lastModified || backendPaper.last_modified?.split('T')[0] || new Date().toISOString().split('T')[0],
    reviewDeadline: backendPaper.reviewDeadline || backendPaper.review_deadline,
    correspondingAuthor: backendPaper.correspondingAuthor || backendPaper.corresponding_author,
    authorCount: backendPaper.authorCount || backendPaper.author_count || 0,
    isUnderReview: backendPaper.isUnderReview || backendPaper.is_under_review || false,
    supplementaryFiles: backendPaper.supplementaryFiles || backendPaper.supplementary_files || [],
  };
};

export const researchProjectsApi = {
  // ========== RESEARCH PROJECT CRUD OPERATIONS ==========

  getAll: async (params?: {
    status?: string;
    type?: string;
    ethics_approval?: boolean;
    active_only?: boolean;
    search?: string;
  }): Promise<ResearchProject[]> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${API_BASE_URL}/research-projects/?${searchParams.toString()}`, {
      headers: getAuthHeaders(),
    });

    const data = await handleResponse(response);
    return Array.isArray(data) ? data.map(normalizeResearchProject) : [];
  },

  getById: async (id: number): Promise<ResearchProject> => {
    const response = await fetch(`${API_BASE_URL}/research-projects/${id}/`, {
      headers: getAuthHeaders(),
    });

    const data = await handleResponse(response);
    return normalizeResearchProject(data);
  },

  create: async (data: CreateResearchProjectInput): Promise<ResearchProject> => {
    const formData = new FormData();

    // Append all fields to formData
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'imageFile' && value instanceof File) {
        formData.append('image', value);
      } else if (Array.isArray(value)) {
        // Handle array fields by stringifying them
        formData.append(key, JSON.stringify(value));
      } else if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}/research-projects/`, {
      method: 'POST',
      headers: getAuthHeadersWithoutContentType(), 
      body: formData,
    });

    const result = await handleResponse(response);
    return normalizeResearchProject(result);
  },

  update: async (id: number, data: Partial<CreateResearchProjectInput>): Promise<ResearchProject> => {
    const formData = new FormData();

    // Handle array fields by stringifying them
    const arrayFields = ['investigators', 'institutions', 'objectives', 'keywords'];
    Object.entries(data).forEach(([key, value]) => {
      if (arrayFields.includes(key) && Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else if (key === 'imageFile' && value instanceof File) {
        formData.append('image', value);
      } else if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}/research-projects/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeadersWithoutContentType(),
      body: formData,
    });

    const result = await handleResponse(response);
    return normalizeResearchProject(result);
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/research-projects/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeadersWithoutContentType(),
    });

    return handleResponse(response);
  },

  // ========== RESEARCH PROJECT-SPECIFIC OPERATIONS ==========

  getActive: async (): Promise<ResearchProject[]> => {
    const response = await fetch(`${API_BASE_URL}/research-projects/?active_only=true`, {
      headers: getAuthHeaders(),
    });
  
    const data = await handleResponse(response);
    return Array.isArray(data) ? data.map(normalizeResearchProject) : [];
  },

  getByStatus: async (): Promise<{[key: string]: ResearchProject[]}> => {
    const response = await fetch(`${API_BASE_URL}/research-projects/by_status/`, {
      headers: getAuthHeaders(),
    });

    const data = await handleResponse(response);
    const result: {[key: string]: ResearchProject[]} = {};

    for (const [status, projects] of Object.entries(data)) {
      result[status] = Array.isArray(projects) ? 
        (projects as any[]).map(normalizeResearchProject) : [];
    }

    return result;
  },

  getAnalytics: async (): Promise<ResearchProjectAnalytics> => {
    const response = await fetch(`${API_BASE_URL}/research-projects/analytics/`, {
      headers: getAuthHeaders(),
    });

    const data = await handleResponse(response);

    // Normalize the analytics data
    return {
      total: data.total || 0,
      planning: data.planning || 0,
      active: data.active || 0,
      recruiting: data.recruiting || 0,
      dataCollection: data.dataCollection || data.data_collection || 0,
      analysis: data.analysis || 0,
      completed: data.completed || 0,
      suspended: data.suspended || 0,
      terminated: data.terminated || 0,
      projectsByType: data.projectsByType || data.projects_by_type || {},
      projectsByStatus: data.projectsByStatus || data.projects_by_status || {},
      totalInvestigators: data.totalInvestigators || data.total_investigators || 0,
      projectsWithEthicsApproval: data.projectsWithEthicsApproval || data.projects_with_ethics_approval || 0,
      avgDurationDays: data.avgDurationDays || data.avg_duration_days,
    };
  },

  updateStatus: async (id: number, status: ResearchProjectStatus): Promise<ResearchProject> => {
    const response = await fetch(`${API_BASE_URL}/research-projects/${id}/update_status/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });

    const result = await handleResponse(response);
    return normalizeResearchProject(result);
  },

  incrementView: async (id: number): Promise<void> => {
    await fetch(`${API_BASE_URL}/research-projects/${id}/increment_view/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  },

  // ========== FILE UPLOAD OPERATIONS ==========

  uploadImage: async (file: File): Promise<{ url: string; filename: string; path: string }> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE_URL}/research-projects/upload_image/`, {
      method: 'POST',
      headers: getAuthHeadersWithoutContentType(),
      body: formData,
    });

    return handleResponse(response);
  },

  // ========== METADATA OPERATIONS ==========

  getInvestigators: async (): Promise<Investigator[]> => {
    const response = await fetch(`${API_BASE_URL}/research-projects/investigators/`, {
      headers: getAuthHeaders(),
    });

    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  },

  getInstitutions: async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/research-projects/institutions/`, {
      headers: getAuthHeaders(),
    });

    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  },

  getTypes: async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/research-projects/types/`, {
      headers: getAuthHeaders(),
    });

    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  },

  getStatuses: async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/research-projects/statuses/`, {
      headers: getAuthHeaders(),
    });

    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  },

  // ========== PROJECT UPDATES OPERATIONS ==========

  getUpdates: async (projectId: number): Promise<ResearchProjectUpdate[]> => {
    const response = await fetch(`${API_BASE_URL}/research-projects/${projectId}/updates/`, {
      headers: getAuthHeaders(),
    });

    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  },

  addUpdate: async (projectId: number, updateData: {
    title: string;
    description: string;
    updateType: 'Milestone' | 'Status Change' | 'Publication' | 'General Update';
  }): Promise<ResearchProjectUpdate> => {
    const response = await fetch(`${API_BASE_URL}/research-projects/${projectId}/add_update/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData),
    });

    return handleResponse(response);
  },

  // ========== RESEARCH PAPERS RELATED TO PROJECT ==========

  getResearchPapers: async (projectId: number): Promise<ResearchPaper[]> => {
    const response = await fetch(`${API_BASE_URL}/research-projects/${projectId}/research_papers/`, {
      headers: getAuthHeaders(),
    });

    const data = await handleResponse(response);
    return Array.isArray(data) ? data.map(normalizeResearchPaper) : [];
  },
};

// NEW API FOR RESEARCH PAPERS

export const researchPapersApi = {
  // ========== RESEARCH PAPER CRUD OPERATIONS ==========

  getAll: async (params?: {
    status?: string;
    research_type?: string;
    category?: string;
    ethics_approval?: boolean;
    under_review?: boolean;
    search?: string;
  }): Promise<ResearchPaper[]> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${API_BASE_URL}/research-papers/?${searchParams.toString()}`, {
      headers: getAuthHeaders(),
    });

    const data = await handleResponse(response);
    return Array.isArray(data) ? data.map(normalizeResearchPaper) : [];
  },

  getById: async (id: number): Promise<ResearchPaper> => {
    const response = await fetch(`${API_BASE_URL}/research-papers/${id}/`, {
      headers: getAuthHeaders(),
    });

    const data = await handleResponse(response);
    return normalizeResearchPaper(data);
  },

  create: async (data: CreateResearchPaperInput): Promise<ResearchPaper> => {
    const formData = new FormData();

    // Append all fields to formData
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'manuscriptFile' && value instanceof File) {
        formData.append('manuscriptFile', value);
      } else if (key === 'supplementaryFiles' && Array.isArray(value)) {
        // Handle supplementary files separately
        value.forEach((file: File) => {
          formData.append('supplementaryFiles', file);
        });
      } else if (Array.isArray(value)) {
        // Handle array fields by stringifying them
        formData.append(key, JSON.stringify(value));
      } else if (typeof value === 'boolean') {
        formData.append(key, value.toString());
      } else if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}/research-papers/`, {
      method: 'POST',
      headers: getAuthHeadersWithoutContentType(),
      body: formData,
    });

    const result = await handleResponse(response);
    return normalizeResearchPaper(result);
  },

  update: async (id: number, data: Partial<CreateResearchPaperInput>): Promise<ResearchPaper> => {
    const formData = new FormData();

    // Handle array fields by stringifying them
    const arrayFields = ['authors', 'keywords'];
    Object.entries(data).forEach(([key, value]) => {
      if (arrayFields.includes(key) && Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else if (key === 'manuscriptFile' && value instanceof File) {
        formData.append('manuscriptFile', value);
      } else if (typeof value === 'boolean') {
        formData.append(key, value.toString());
      } else if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}/research-papers/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeadersWithoutContentType(),
      body: formData,
    });

    const result = await handleResponse(response);
    return normalizeResearchPaper(result);
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/research-papers/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeadersWithoutContentType(),
    });

    return handleResponse(response);
  },

  // ========== RESEARCH PAPER-SPECIFIC OPERATIONS ==========

  updateStatus: async (id: number, status: ResearchPaperStatus): Promise<ResearchPaper> => {
    const response = await fetch(`${API_BASE_URL}/research-papers/${id}/update_status/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });

    const result = await handleResponse(response);
    return normalizeResearchPaper(result);
  },

  getAnalytics: async (): Promise<ResearchPaperAnalytics> => {
    const response = await fetch(`${API_BASE_URL}/research-papers/analytics/`, {
      headers: getAuthHeaders(),
    });

    const data = await handleResponse(response);

    // Normalize the analytics data
    return {
      totalPapers: data.totalPapers || data.total_papers || 0,
      submitted: data.submitted || 0,
      underReview: data.underReview || data.under_review || 0,
      revisionRequired: data.revisionRequired || data.revision_required || 0,
      accepted: data.accepted || 0,
      published: data.published || 0,
      rejected: data.rejected || 0,
      papersByCategory: data.papersByCategory || data.papers_by_category || {},
      papersByResearchType: data.papersByResearchType || data.papers_by_research_type || {},
      papersByStatus: data.papersByStatus || data.papers_by_status || {},
      totalAuthors: data.totalAuthors || data.total_authors || 0,
      papersWithEthicsApproval: data.papersWithEthicsApproval || data.papers_with_ethics_approval || 0,
      avgReviewTimeDays: data.avgReviewTimeDays || data.avg_review_time_days,
    };
  },

  // ========== METADATA OPERATIONS ==========

  getCategories: async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/research-papers/categories/`, {
      headers: getAuthHeaders(),
    });

    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  },

  getResearchTypes: async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/research-papers/research_types/`, {
      headers: getAuthHeaders(),
    });

    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  },

  getStudyDesigns: async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/research-papers/study_designs/`, {
      headers: getAuthHeaders(),
    });

    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  },

  // ========== REVIEW OPERATIONS ==========

  getReviews: async (paperId: number): Promise<ResearchPaperReview[]> => {
    const response = await fetch(`${API_BASE_URL}/research-papers/${paperId}/reviews/`, {
      headers: getAuthHeaders(),
    });

    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  },

  addReview: async (paperId: number, reviewData: {
    reviewerName: string;
    reviewerEmail: string;
    reviewStatus: 'Pending' | 'In Progress' | 'Completed';
    recommendation?: 'Accept' | 'Minor Revisions' | 'Major Revisions' | 'Reject';
    comments?: string;
  }): Promise<ResearchPaperReview> => {
    const response = await fetch(`${API_BASE_URL}/research-papers/${paperId}/add_review/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(reviewData),
    });

    return handleResponse(response);
  },

  // ========== COMMENT OPERATIONS ==========

  getComments: async (paperId: number): Promise<ResearchPaperComment[]> => {
    const response = await fetch(`${API_BASE_URL}/research-papers/${paperId}/comments/`, {
      headers: getAuthHeaders(),
    });

    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  },

  addComment: async (paperId: number, commentData: {
    commenterName: string;
    commenterEmail: string;
    comment: string;
    isInternal?: boolean;
  }): Promise<ResearchPaperComment> => {
    const response = await fetch(`${API_BASE_URL}/research-papers/${paperId}/add_comment/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(commentData),
    });

    return handleResponse(response);
  },

  // ========== FILE OPERATIONS ==========

  uploadSupplementaryFile: async (paperId: number, file: File, fileType?: string, description?: string): Promise<ResearchPaperFile> => {
    const formData = new FormData();
    formData.append('file', file);
    if (fileType) formData.append('file_type', fileType);
    if (description) formData.append('description', description);

    const response = await fetch(`${API_BASE_URL}/research-papers/${paperId}/upload_supplementary_file/`, {
      method: 'POST',
      headers: getAuthHeadersWithoutContentType(),
      body: formData,
    });

    return handleResponse(response);
  },
};

// Export individual functions for convenience
export const {
  getAll,
  getById,
  create,
  update,
  delete: deleteResearchProject,
  getActive,
  getByStatus,
  getAnalytics,
  updateStatus,
  incrementView,
  uploadImage,
  getInvestigators,
  getInstitutions,
  getTypes,
  getStatuses,
  getUpdates,
  addUpdate,
  getResearchPapers,
} = researchProjectsApi;

export const {
  getAll: getAllResearchPapers,
  getById: getResearchPaperById,
  create: createResearchPaper,
  update: updateResearchPaper,
  delete: deleteResearchPaper,
  updateStatus: updateResearchPaperStatus,
  getAnalytics: getResearchPaperAnalytics,
  getCategories,
  getResearchTypes,
  getStudyDesigns,
  getReviews,
  addReview,
  getComments,
  addComment,
  uploadSupplementaryFile,
} = researchPapersApi;