import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Plus, 
  Trash2, 
  Check, 
  AlertCircle,
  Users,
  Calendar,
  FlaskConical,
  DollarSign,
  Target,
  Building
} from 'lucide-react';
import { researchProjectsApi } from '../../../../services/researchprojectsApi';

// Define types for research project
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

interface CreateResearchProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (project: ResearchProject) => void;
  onError: (error: string) => void;
  initialData?: ResearchProject;
}

// Static category options
const researchTypeOptions: ResearchProjectType[] = [
  'Clinical Trial',
  'Observational Study', 
  'Intervention Study',
  'Epidemiological Study',
  'Genetic Research',
  'Cohort Study',
  'Case-Control Study',
  'Systematic Review',
  'Meta-Analysis'
];

const statusOptions: ResearchProjectStatus[] = [
  'Planning',
  'Active',
  'Recruiting',
  'Data Collection',
  'Analysis',
  'Completed',
  'Suspended',
  'Terminated'
];

const CreateResearchProjectModal: React.FC<CreateResearchProjectModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  onError,
  initialData 
}) => {
  // Form state
  const [formData, setFormData] = useState<CreateResearchProjectInput>({
    title: '',
    description: '',
    type: 'Clinical Trial' as ResearchProjectType,
    status: 'Planning' as ResearchProjectStatus,
    principalInvestigator: '',
    investigators: [{ name: '', role: '', affiliation: '', email: '' }],
    institutions: [],
    startDate: '',
    endDate: '',
    fundingSource: '',
    fundingAmount: '',
    targetPopulation: '',
    sampleSize: undefined,
    objectives: [],
    methodology: '',
    ethicsApproval: false,
    registrationNumber: '',
    keywords: []
  });

  // UI state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newKeyword, setNewKeyword] = useState('');
  const [newObjective, setNewObjective] = useState('');
  const [newInstitution, setNewInstitution] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form with editing data
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        type: initialData.type || 'Clinical Trial',
        status: initialData.status || 'Planning',
        principalInvestigator: initialData.principalInvestigator || '',
        investigators: initialData.investigators?.length > 0 
          ? initialData.investigators 
          : [{ name: '', role: '', affiliation: '', email: '' }],
        institutions: initialData.institutions || [],
        startDate: initialData.startDate || '',
        endDate: initialData.endDate || '',
        fundingSource: initialData.fundingSource || '',
        fundingAmount: initialData.fundingAmount || '',
        targetPopulation: initialData.targetPopulation || '',
        sampleSize: initialData.sampleSize,
        objectives: initialData.objectives || [],
        methodology: initialData.methodology || '',
        ethicsApproval: initialData.ethicsApproval || false,
        registrationNumber: initialData.registrationNumber || '',
        keywords: initialData.keywords || []
      });
      
      // Set image preview if there's an existing image
      if (initialData.imageUrl) {
        setImagePreview(initialData.imageUrl);
      }
    } else {
      // Reset form for new project
      setFormData({
        title: '',
        description: '',
        type: 'Clinical Trial',
        status: 'Planning',
        principalInvestigator: '',
        investigators: [{ name: '', role: '', affiliation: '', email: '' }],
        institutions: [],
        startDate: '',
        endDate: '',
        fundingSource: '',
        fundingAmount: '',
        targetPopulation: '',
        sampleSize: undefined,
        objectives: [],
        methodology: '',
        ethicsApproval: false,
        registrationNumber: '',
        keywords: []
      });
      setImagePreview(null);
      setImageFile(null);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'sampleSize' ? (value ? parseInt(value) : undefined) : value)
    }));
  };

  const handleInvestigatorChange = (index: number, field: keyof Investigator, value: string) => {
    setFormData(prev => {
      const newInvestigators = [...prev.investigators];
      newInvestigators[index] = { ...newInvestigators[index], [field]: value };
      return { ...prev, investigators: newInvestigators };
    });
  };

  const addInvestigator = () => {
    setFormData(prev => ({
      ...prev,
      investigators: [...prev.investigators, { name: '', role: '', affiliation: '', email: '' }]
    }));
  };

  const removeInvestigator = (index: number) => {
    if (formData.investigators.length > 1) {
      setFormData(prev => ({
        ...prev,
        investigators: prev.investigators.filter((_, i) => i !== index)
      }));
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      setErrors(prev => ({ ...prev, image: '' }));
    }
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !formData.keywords.includes(newKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword.trim()]
      }));
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(keyword => keyword !== keywordToRemove)
    }));
  };

  const handleAddObjective = () => {
    if (newObjective.trim() && !formData.objectives.includes(newObjective.trim())) {
      setFormData(prev => ({
        ...prev,
        objectives: [...prev.objectives, newObjective.trim()]
      }));
      setNewObjective('');
    }
  };

  const handleRemoveObjective = (objectiveToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.filter(objective => objective !== objectiveToRemove)
    }));
  };

  const handleAddInstitution = () => {
    if (newInstitution.trim() && !formData.institutions.includes(newInstitution.trim())) {
      setFormData(prev => ({
        ...prev,
        institutions: [...prev.institutions, newInstitution.trim()]
      }));
      setNewInstitution('');
    }
  };

  const handleRemoveInstitution = (institutionToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      institutions: prev.institutions.filter(institution => institution !== institutionToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.principalInvestigator.trim()) newErrors.principalInvestigator = 'Principal Investigator is required';
    if (!formData.targetPopulation.trim()) newErrors.targetPopulation = 'Target Population is required';
    if (!formData.startDate) newErrors.startDate = 'Start Date is required';
    if (!formData.endDate) newErrors.endDate = 'End Date is required';
    
    // Check if at least one investigator has complete info
    const validInvestigators = formData.investigators.filter(inv => 
      inv.name.trim() && inv.role.trim() && inv.affiliation.trim()
    );
    if (validInvestigators.length === 0) {
      newErrors.investigators = 'At least one investigator with complete information is required';
    }
    
    if (!imageFile && !initialData?.imageUrl) {
      newErrors.image = 'Project image is required';
    }
    
    // Date validation
    if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
      newErrors.endDate = 'End date must be after start date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      // Filter out incomplete investigators
      const validInvestigators = formData.investigators.filter(inv => 
        inv.name.trim() && inv.role.trim() && inv.affiliation.trim()
      );
      
      // Prepare form data for API
      const submitData: CreateResearchProjectInput = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        status: formData.status,
        principalInvestigator: formData.principalInvestigator.trim(),
        investigators: validInvestigators,
        institutions: formData.institutions,
        startDate: formData.startDate,
        endDate: formData.endDate,
        fundingSource: formData.fundingSource?.trim() || undefined,
        fundingAmount: formData.fundingAmount?.trim() || undefined,
        targetPopulation: formData.targetPopulation.trim(),
        sampleSize: formData.sampleSize,
        objectives: formData.objectives,
        methodology: formData.methodology.trim(),
        ethicsApproval: formData.ethicsApproval,
        registrationNumber: formData.registrationNumber?.trim() || undefined,
        keywords: formData.keywords,
        imageFile: imageFile || undefined
      };
      
      let savedProject: ResearchProject;
      
      if (initialData) {
        // Update existing project
        savedProject = await researchProjectsApi.update(initialData.id, submitData);
      } else {
        // Create new project
        savedProject = await researchProjectsApi.create(submitData);
      }
      
      // Call the success callback with the saved project
      onSuccess(savedProject);
      
    } catch (error: any) {
      console.error('Error saving research project:', error);
      const errorMessage = error.message || 'Failed to save research project. Please try again.';
      
      // Call the error callback
      onError(errorMessage);
      
      // Also set local form error for immediate feedback
      setErrors({
        form: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center">
                <FlaskConical className="w-6 h-6 mr-2 text-blue-600" />
                {initialData ? 'Edit Research Project' : 'Create New Research Project'}
              </h2>
              <button 
                type="button"
                className="text-gray-500 hover:text-gray-700"
                onClick={onClose}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {errors.form && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md flex items-start">
                <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>{errors.form}</span>
              </div>
            )}

            <div className="space-y-8">
              {/* Basic Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FlaskConical className="w-5 h-5 mr-2 text-blue-600" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Title* {errors.title && <span className="text-red-500 text-xs"> - {errors.title}</span>}
                    </label>
                    <input
                      type="text"
                      name="title"
                      className={`w-full px-3 py-2 border ${errors.title ? 'border-red-300' : 'border-gray-300'} rounded-md focus:ring-blue-500 focus:border-blue-500`}
                      value={formData.title}
                      onChange={handleChange}
                      required
                      placeholder="Enter research project title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Research Type*</label>
                    <select
                      name="type"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={formData.type}
                      onChange={handleChange}
                      required
                    >
                      {researchTypeOptions.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status*</label>
                    <select
                      name="status"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={formData.status}
                      onChange={handleChange}
                      required
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Principal Investigator* {errors.principalInvestigator && <span className="text-red-500 text-xs"> - {errors.principalInvestigator}</span>}
                    </label>
                    <input
                      type="text"
                      name="principalInvestigator"
                      className={`w-full px-3 py-2 border ${errors.principalInvestigator ? 'border-red-300' : 'border-gray-300'} rounded-md focus:ring-blue-500 focus:border-blue-500`}
                      value={formData.principalInvestigator}
                      onChange={handleChange}
                      required
                      placeholder="Dr. John Smith"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
                    <input
                      type="text"
                      name="registrationNumber"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={formData.registrationNumber || ''}
                      onChange={handleChange}
                      placeholder="e.g., NCT12345678"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description* {errors.description && <span className="text-red-500 text-xs"> - {errors.description}</span>}
                    </label>
                    <textarea
                      name="description"
                      className={`w-full px-3 py-2 border ${errors.description ? 'border-red-300' : 'border-gray-300'} rounded-md focus:ring-blue-500 focus:border-blue-500`}
                      rows={4}
                      value={formData.description}
                      onChange={handleChange}
                      required
                      placeholder="Brief description of the research project"
                    />
                  </div>
                </div>
              </div>

              {/* Timeline and Funding */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                  Timeline & Funding
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date* {errors.startDate && <span className="text-red-500 text-xs"> - {errors.startDate}</span>}
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      className={`w-full px-3 py-2 border ${errors.startDate ? 'border-red-300' : 'border-gray-300'} rounded-md focus:ring-blue-500 focus:border-blue-500`}
                      value={formData.startDate}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date* {errors.endDate && <span className="text-red-500 text-xs"> - {errors.endDate}</span>}
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      className={`w-full px-3 py-2 border ${errors.endDate ? 'border-red-300' : 'border-gray-300'} rounded-md focus:ring-blue-500 focus:border-blue-500`}
                      value={formData.endDate}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Funding Source</label>
                    <input
                      type="text"
                      name="fundingSource"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={formData.fundingSource || ''}
                      onChange={handleChange}
                      placeholder="e.g., WHO, Gates Foundation, NIH"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Funding Amount</label>
                    <input
                      type="text"
                      name="fundingAmount"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={formData.fundingAmount || ''}
                      onChange={handleChange}
                      placeholder="e.g., $500,000, €1.2M"
                    />
                  </div>
                </div>
              </div>

              {/* Study Population */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-blue-600" />
                  Study Population
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Target Population* {errors.targetPopulation && <span className="text-red-500 text-xs"> - {errors.targetPopulation}</span>}
                    </label>
                    <input
                      type="text"
                      name="targetPopulation"
                      className={`w-full px-3 py-2 border ${errors.targetPopulation ? 'border-red-300' : 'border-gray-300'} rounded-md focus:ring-blue-500 focus:border-blue-500`}
                      value={formData.targetPopulation}
                      onChange={handleChange}
                      required
                      placeholder="e.g., Children aged 2-12 with epilepsy"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sample Size</label>
                    <input
                      type="number"
                      name="sampleSize"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={formData.sampleSize || ''}
                      onChange={handleChange}
                      placeholder="e.g., 500"
                      min="1"
                    />
                  </div>
                </div>
              </div>

              {/* Investigators Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-600" />
                  Research Team* {errors.investigators && <span className="text-red-500 text-xs ml-2"> - {errors.investigators}</span>}
                </h3>
                <div className="space-y-4">
                  {formData.investigators.map((investigator, index) => (
                    <div key={index} className="p-4 bg-white border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-medium text-gray-900">Investigator #{index + 1}</h4>
                        {formData.investigators.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeInvestigator(index)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Remove investigator"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Name*</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            value={investigator.name}
                            onChange={(e) => handleInvestigatorChange(index, 'name', e.target.value)}
                            placeholder="Dr. Jane Doe"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Role*</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            value={investigator.role}
                            onChange={(e) => handleInvestigatorChange(index, 'role', e.target.value)}
                            placeholder="Co-Investigator, Data Analyst"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Affiliation*</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            value={investigator.affiliation}
                            onChange={(e) => handleInvestigatorChange(index, 'affiliation', e.target.value)}
                            placeholder="University of Cape Town"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input
                            type="email"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            value={investigator.email || ''}
                            onChange={(e) => handleInvestigatorChange(index, 'email', e.target.value)}
                            placeholder="investigator@example.com"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addInvestigator}
                    className="w-full px-4 py-3 border border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 flex items-center justify-center text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Another Investigator
                  </button>
                </div>
              </div>

              {/* Institutions */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Building className="w-5 h-5 mr-2 text-blue-600" />
                  Participating Institutions
                </h3>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.institutions.map((institution, index) => (
                      <span
                        key={index}
                        className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center"
                      >
                        {institution}
                        <button 
                          type="button"
                          onClick={() => handleRemoveInstitution(institution)}
                          className="ml-2 text-purple-600 hover:text-purple-800 text-lg leading-none"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                      value={newInstitution}
                      onChange={(e) => setNewInstitution(e.target.value)}
                      placeholder="Add participating institution"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddInstitution();
                        }
                      }}
                    />
                    <button 
                      type="button"
                      onClick={handleAddInstitution}
                      className="px-4 py-2 bg-purple-600 text-white rounded-r-md hover:bg-purple-700 flex items-center"
                      disabled={!newInstitution.trim()}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Study Details */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Study Details</h3>
                <div className="space-y-6">
                  {/* Objectives */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Research Objectives</label>
                    <div className="space-y-2 mb-3">
                      {formData.objectives.map((objective, index) => (
                        <div
                          key={index}
                          className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded-md text-sm flex items-start justify-between"
                        >
                          <span className="flex-1">{objective}</span>
                          <button 
                            type="button"
                            onClick={() => handleRemoveObjective(objective)}
                            className="ml-2 text-yellow-600 hover:text-yellow-800 text-lg leading-none flex-shrink-0"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex">
                      <input
                        type="text"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                        value={newObjective}
                        onChange={(e) => setNewObjective(e.target.value)}
                        placeholder="Add research objective"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddObjective();
                          }
                        }}
                      />
                      <button 
                        type="button"
                        onClick={handleAddObjective}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-r-md hover:bg-yellow-700 flex items-center"
                        disabled={!newObjective.trim()}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Methodology</label>
                    <textarea
                      name="methodology"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      rows={4}
                      value={formData.methodology}
                      onChange={handleChange}
                      placeholder="Describe the research methodology and approach"
                    />
                  </div>
                </div>
              </div>

              {/* Keywords */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Keywords & Classification</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Keywords</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                      >
                        {keyword}
                        <button 
                          type="button"
                          onClick={() => handleRemoveKeyword(keyword)}
                          className="ml-2 text-blue-600 hover:text-blue-800 text-lg leading-none"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      placeholder="Add keyword for search optimization"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddKeyword();
                        }
                      }}
                    />
                    <button 
                      type="button"
                      onClick={handleAddKeyword}
                      className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 flex items-center"
                      disabled={!newKeyword.trim()}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Project Image Upload */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Project Image</h3>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image* {errors.image && <span className="text-red-500 text-xs"> - {errors.image}</span>}
                </label>
                
                <div className="space-y-4">
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-full px-4 py-3 border ${errors.image ? 'border-red-300' : 'border-gray-300'} rounded-md bg-white hover:bg-gray-50 flex items-center justify-center transition-colors`}
                    >
                      <Upload className="w-5 h-5 mr-2 text-gray-600" />
                      <span>{imageFile ? `Selected: ${imageFile.name}` : 'Choose Project Image'}</span>
                    </button>
                  </div>
                  
                  {imagePreview && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
                      <div className="relative w-full h-48 overflow-hidden rounded-md border border-gray-200">
                        <img
                          src={imagePreview}
                          alt="Project image preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Ethics Approval */}
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="ethicsApproval"
                    id="ethicsApproval"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={formData.ethicsApproval}
                    onChange={handleChange}
                  />
                  <label htmlFor="ethicsApproval" className="ml-2 block text-sm text-gray-900">
                    Ethics approval obtained
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">Check this box if ethics committee approval has been obtained for this research project.</p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center min-w-32 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {initialData ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      {initialData ? 'Update Project' : 'Create Project'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateResearchProjectModal;