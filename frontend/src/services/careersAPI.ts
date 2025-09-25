// src/api/careersAPI.ts
const API_BASE_URL = 'http://127.0.0.1:8000/api';

export type JobStatus = 'Draft' | 'Active' | 'Closed';
export type JobType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Volunteer';
export type JobLevel = 'Entry-level' | 'Mid-level' | 'Senior' | 'Executive';
export type WorkArrangement = 'On-site' | 'Remote' | 'Hybrid';

export type ApplicationStatus = 'New' | 'Under Review' | 'Shortlisted' | 'Rejected';
export type VolunteerStatus = 'Pending Review' | 'Active' | 'Inactive';

export interface JobOpportunity {
  id: number;
  title: string;
  department: string;
  location: string;
  type: JobType;
  level: JobLevel;
  status: JobStatus;
  description: string;
  responsibilities: string[];
  requirements: string[];
  qualifications: string[];
  benefits: string[];
  salary: string;
  closingDate: string;
  contractDuration?: string;
  workArrangement: WorkArrangement;
  applicationsCount: number;
  postedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobOpportunityInput {
  title: string;
  department: string;
  location: string;
  type: JobType;
  level: JobLevel;
  status: JobStatus;
  description: string;
  responsibilities: string[];
  requirements: string[];
  qualifications: string[];
  benefits: string[];
  salary: string;
  closingDate: string;
  contractDuration?: string;
  workArrangement: WorkArrangement;
}

export interface JobApplication {
  id: number;
  opportunityId: number;
  opportunityTitle: string;
  applicantName: string;
  email: string;
  phone: string;
  location: string;
  experience: string;
  status: ApplicationStatus;
  appliedDate: string;
  resume: string;
  coverLetter: string;
  createdAt: string;
}

export interface CreateJobApplicationInput {
  opportunity: number;
  applicantName: string;
  email: string;
  phone: string;
  location: string;
  experience: string;
  resume: File;
  coverLetter: string;
}

export interface VolunteerSubmission {
  id: number;
  name: string;
  email: string;
  phone: string;
  location: string;
  interests: string[];
  skills: string[];
  availability: string;
  experience: string;
  motivation: string;
  status: VolunteerStatus;
  joinDate: string;
  hoursContributed: number;
  projects: string[];
  createdAt: string;
}

export interface CreateVolunteerSubmissionInput {
  name: string;
  email: string;
  phone: string;
  location: string;
  interests: string[];
  skills: string[];
  availability: string;
  experience: string;
  motivation: string;
}

export interface CareersAnalytics {
  totalOpportunities: number;
  activeOpportunities: number;
  draftOpportunities: number;
  closedOpportunities: number;
  totalApplications: number;
  newApplications: number;
  shortlistedApplications: number;
  totalVolunteers: number;
  activeVolunteers: number;
  monthlyApplications: number;
  opportunitiesByDepartment: Record<string, number>;
  applicationsByStatus: Record<string, number>;
  topOpportunities: Array<{
    id: number;
    title: string;
    applicationsCount: number;
  }>;
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

// Helper function to safely parse array fields
const parseArrayField = (field: any): string[] => {
  console.log('DEBUG: Parsing array field:', field);
  
  // If it's already an array, return it
  if (Array.isArray(field)) {
    return field.map(item => {
      if (typeof item === 'string') return item.trim();
      if (typeof item === 'object' && item !== null) {
        // Try to extract text from object
        return item.text || item.name || item.value || 
               item.responsibility || item.requirement || 
               item.qualification || item.benefit || 
               JSON.stringify(item);
      }
      return String(item || '').trim();
    }).filter(item => item !== '');
  }
  
  // If it's a string, try to parse as JSON
  if (typeof field === 'string') {
    try {
      const parsed = JSON.parse(field);
      if (Array.isArray(parsed)) {
        return parsed.map(item => {
          if (typeof item === 'string') return item.trim();
          if (typeof item === 'object' && item !== null) {
            return item.text || item.name || item.value || 
                   item.responsibility || item.requirement || 
                   item.qualification || item.benefit || 
                   JSON.stringify(item);
          }
          return String(item || '').trim();
        }).filter(item => item !== '');
      }
      // If it's a single object, wrap it in an array
      if (typeof parsed === 'object' && parsed !== null) {
        const value = parsed.text || parsed.name || parsed.value || 
                     parsed.responsibility || parsed.requirement || 
                     parsed.qualification || parsed.benefit || 
                     JSON.stringify(parsed);
        return value ? [value] : [];
      }
    } catch (e) {
      console.log('DEBUG: JSON parse failed, treating as string:', e);
      // If it's not valid JSON, treat it as a single item
      return field.trim() ? [field.trim()] : [];
    }
  }
  
  // If it's an object but not an array, try to extract values
  if (typeof field === 'object' && field !== null && !Array.isArray(field)) {
    const values = Object.values(field).map(value => String(value || '').trim()).filter(v => v);
    return values.length > 0 ? values : [];
  }
  
  return [];
};

// Helper function to safely convert backend data to frontend format
const normalizeJobOpportunity = (backendJob: any): JobOpportunity => {
  console.log('DEBUG: Raw backend job data:', backendJob);
  
  const responsibilities = parseArrayField(backendJob.responsibilities);
  const requirements = parseArrayField(backendJob.requirements);
  const qualifications = parseArrayField(backendJob.qualifications);
  const benefits = parseArrayField(backendJob.benefits);
  
  console.log('DEBUG: Parsed responsibilities:', responsibilities);
  console.log('DEBUG: Parsed requirements:', requirements);
  console.log('DEBUG: Parsed qualifications:', qualifications);
  console.log('DEBUG: Parsed benefits:', benefits);

  const normalized = {
    id: backendJob.id || 0,
    title: backendJob.title || '',
    department: backendJob.department || '',
    location: backendJob.location || '',
    type: backendJob.type || 'Full-time',
    level: backendJob.level || 'Mid-level',
    status: backendJob.status || 'Draft',
    description: backendJob.description || '',
    responsibilities: responsibilities,
    requirements: requirements,
    qualifications: qualifications,
    benefits: benefits,
    salary: backendJob.salary || '',
    closingDate: backendJob.closing_date || backendJob.closingDate || '',
    contractDuration: backendJob.contract_duration || backendJob.contractDuration || '',
    workArrangement: backendJob.work_arrangement || backendJob.workArrangement || 'On-site',
    applicationsCount: backendJob.applications_count || backendJob.applicationsCount || 0,
    postedDate: backendJob.posted_date || backendJob.postedDate,
    createdAt: backendJob.created_at?.split('T')[0] || backendJob.createdAt || new Date().toISOString().split('T')[0],
    updatedAt: backendJob.updated_at?.split('T')[0] || backendJob.updatedAt || new Date().toISOString().split('T')[0],
  };

  console.log('DEBUG: Normalized job opportunity:', normalized);
  return normalized;
};

const normalizeJobApplication = (backendApplication: any): JobApplication => {
  return {
    id: backendApplication.id || 0,
    opportunityId: backendApplication.opportunity || backendApplication.opportunityId || 0,
    opportunityTitle: backendApplication.opportunity_title || backendApplication.opportunityTitle || '',
    applicantName: backendApplication.applicant_name || backendApplication.applicantName || '',
    email: backendApplication.email || '',
    phone: backendApplication.phone || '',
    location: backendApplication.location || '',
    experience: backendApplication.experience || '',
    status: backendApplication.status || 'New',
    appliedDate: backendApplication.applied_date || backendApplication.appliedDate || backendApplication.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    resume: backendApplication.resume || '',
    coverLetter: backendApplication.cover_letter || backendApplication.coverLetter || '',
    createdAt: backendApplication.created_at || backendApplication.createdAt || new Date().toISOString(),
  };
};

const normalizeVolunteerSubmission = (backendVolunteer: any): VolunteerSubmission => {
  const parseArrayField = (field: any): string[] => {
    if (Array.isArray(field)) return field;
    if (typeof field === 'string') {
      try {
        const parsed = JSON.parse(field);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        return field.split(',').map(s => s.trim()).filter(Boolean);
      }
    }
    return [];
  };

  return {
    id: backendVolunteer.id || 0,
    name: backendVolunteer.name || '',
    email: backendVolunteer.email || '',
    phone: backendVolunteer.phone || '',
    location: backendVolunteer.location || '',
    interests: parseArrayField(backendVolunteer.interests),
    skills: parseArrayField(backendVolunteer.skills),
    availability: backendVolunteer.availability || '',
    experience: backendVolunteer.experience || '',
    motivation: backendVolunteer.motivation || '',
    status: backendVolunteer.status || 'Pending Review',
    joinDate: backendVolunteer.join_date || backendVolunteer.joinDate || backendVolunteer.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    hoursContributed: backendVolunteer.hours_contributed || backendVolunteer.hoursContributed || 0,
    projects: parseArrayField(backendVolunteer.projects),
    createdAt: backendVolunteer.created_at || backendVolunteer.createdAt || new Date().toISOString(),
  };
};

export const careersApi = {
  // ========== JOB OPPORTUNITIES CRUD OPERATIONS ==========
  
  getAllJobs: async (params?: {
    status?: string;
    department?: string;
    type?: string;
    search?: string;
  }): Promise<JobOpportunity[]> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/job-opportunities/?${searchParams.toString()}`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data.map(normalizeJobOpportunity) : [];
  },

  getJobById: async (id: number): Promise<JobOpportunity> => {
    const response = await fetch(`${API_BASE_URL}/job-opportunities/${id}/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return normalizeJobOpportunity(data);
  },

  createJob: async (data: CreateJobOpportunityInput): Promise<JobOpportunity> => {
    // Convert camelCase to snake_case for backend
    const requestData = {
      title: data.title,
      department: data.department,
      location: data.location,
      type: data.type,
      level: data.level,
      status: data.status,
      description: data.description,
      salary: data.salary,
      closing_date: data.closingDate,
      contract_duration: data.contractDuration,
      work_arrangement: data.workArrangement,
      responsibilities: data.responsibilities || [],
      requirements: data.requirements || [],
      qualifications: data.qualifications || [],
      benefits: data.benefits || [],
    };

    console.log('Sending job opportunity data:', requestData);

    const response = await fetch(`${API_BASE_URL}/job-opportunities/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(requestData),
    });
    
    const result = await handleResponse(response);
    return normalizeJobOpportunity(result);
  },

  updateJob: async (id: number, data: Partial<CreateJobOpportunityInput>): Promise<JobOpportunity> => {
    // Convert camelCase to snake_case for backend
    const requestData: any = { ...data };
    if (data.closingDate !== undefined) {
      requestData.closing_date = data.closingDate;
      delete requestData.closingDate;
    }
    if (data.contractDuration !== undefined) {
      requestData.contract_duration = data.contractDuration;
      delete requestData.contractDuration;
    }
    if (data.workArrangement !== undefined) {
      requestData.work_arrangement = data.workArrangement;
      delete requestData.workArrangement;
    }

    const response = await fetch(`${API_BASE_URL}/job-opportunities/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(requestData),
    });
    
    const result = await handleResponse(response);
    return normalizeJobOpportunity(result);
  },

  deleteJob: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/job-opportunities/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeadersWithoutContentType(),
    });
    
    return handleResponse(response);
  },

  updateJobStatus: async (id: number, status: JobStatus): Promise<JobOpportunity> => {
    const response = await fetch(`${API_BASE_URL}/job-opportunities/${id}/update_status/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    
    const result = await handleResponse(response);
    return normalizeJobOpportunity(result);
  },

  // ========== JOB APPLICATIONS CRUD OPERATIONS ==========
  
  getAllApplications: async (params?: {
    opportunityId?: number;
    status?: string;
    search?: string;
  }): Promise<JobApplication[]> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Convert camelCase to snake_case for backend
          let backendKey = key;
          if (key === 'opportunityId') backendKey = 'opportunity_id';
          
          searchParams.append(backendKey, value.toString());
        }
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/job-applications/?${searchParams.toString()}`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data.map(normalizeJobApplication) : [];
  },

  getApplicationById: async (id: number): Promise<JobApplication> => {
    const response = await fetch(`${API_BASE_URL}/job-applications/${id}/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return normalizeJobApplication(data);
  },

  createApplication: async (data: CreateJobApplicationInput): Promise<JobApplication> => {
    const formData = new FormData();
    formData.append('opportunity', data.opportunity.toString());
    formData.append('applicant_name', data.applicantName);
    formData.append('email', data.email);
    formData.append('phone', data.phone);
    formData.append('location', data.location);
    formData.append('experience', data.experience);
    formData.append('cover_letter', data.coverLetter);
    formData.append('resume', data.resume);

    const response = await fetch(`${API_BASE_URL}/job-applications/`, {
      method: 'POST',
      headers: getAuthHeadersWithoutContentType(),
      body: formData,
    });
    
    const result = await handleResponse(response);
    return normalizeJobApplication(result);
  },

  updateApplicationStatus: async (id: number, status: ApplicationStatus): Promise<JobApplication> => {
    const response = await fetch(`${API_BASE_URL}/job-applications/${id}/update_status/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    
    const result = await handleResponse(response);
    return normalizeJobApplication(result);
  },

  deleteApplication: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/job-applications/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeadersWithoutContentType(),
    });
    
    return handleResponse(response);
  },

  // ========== VOLUNTEER SUBMISSIONS CRUD OPERATIONS ==========
  
  getAllVolunteers: async (params?: {
    status?: string;
    search?: string;
  }): Promise<VolunteerSubmission[]> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/volunteer-submissions/?${searchParams.toString()}`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data.map(normalizeVolunteerSubmission) : [];
  },

  getVolunteerById: async (id: number): Promise<VolunteerSubmission> => {
    const response = await fetch(`${API_BASE_URL}/volunteer-submissions/${id}/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return normalizeVolunteerSubmission(data);
  },

  createVolunteerSubmission: async (data: CreateVolunteerSubmissionInput): Promise<VolunteerSubmission> => {
    const response = await fetch(`${API_BASE_URL}/volunteer-submissions/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    const result = await handleResponse(response);
    return normalizeVolunteerSubmission(result);
  },

  updateVolunteerStatus: async (id: number, status: VolunteerStatus): Promise<VolunteerSubmission> => {
    const response = await fetch(`${API_BASE_URL}/volunteer-submissions/${id}/update_status/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    
    const result = await handleResponse(response);
    return normalizeVolunteerSubmission(result);
  },

  deleteVolunteer: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/volunteer-submissions/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeadersWithoutContentType(),
    });
    
    return handleResponse(response);
  },

  // ========== ANALYTICS OPERATIONS ==========
  
  getAnalytics: async (): Promise<CareersAnalytics> => {
    const response = await fetch(`${API_BASE_URL}/job-opportunities/analytics/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    
    return {
      totalOpportunities: data.total_opportunities || 0,
      activeOpportunities: data.active_opportunities || 0,
      draftOpportunities: data.draft_opportunities || 0,
      closedOpportunities: data.closed_opportunities || 0,
      totalApplications: data.total_applications || 0,
      newApplications: data.new_applications || 0,
      shortlistedApplications: data.shortlisted_applications || 0,
      totalVolunteers: data.total_volunteers || 0,
      activeVolunteers: data.active_volunteers || 0,
      monthlyApplications: data.monthly_applications || 0,
      opportunitiesByDepartment: data.opportunities_by_department || {},
      applicationsByStatus: data.applications_by_status || {},
      topOpportunities: data.top_opportunities || [],
    };
  },

  // ========== METADATA OPERATIONS ==========
  
  getDepartments: async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/job-opportunities/departments/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  },

  getLocations: async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/job-opportunities/locations/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  },

  // ========== EXPORT OPERATIONS ==========
  
  exportJobs: async (format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> => {
    const response = await fetch(`${API_BASE_URL}/job-opportunities/export/?format=${format}`, {
      headers: getAuthHeadersWithoutContentType(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.blob();
  },

  exportApplications: async (format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> => {
    const response = await fetch(`${API_BASE_URL}/job-applications/export/?format=${format}`, {
      headers: getAuthHeadersWithoutContentType(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.blob();
  },

  exportVolunteers: async (format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> => {
    const response = await fetch(`${API_BASE_URL}/volunteer-submissions/export/?format=${format}`, {
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
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  updateJobStatus,
  getAllApplications,
  getApplicationById,
  createApplication,
  updateApplicationStatus,
  deleteApplication,
  getAllVolunteers,
  getVolunteerById,
  createVolunteerSubmission,
  updateVolunteerStatus,
  deleteVolunteer,
  getAnalytics: getCareersAnalytics,
  getDepartments,
  getLocations,
  exportJobs,
  exportApplications,
  exportVolunteers,
} = careersApi;