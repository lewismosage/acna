import React, { useState, useEffect } from 'react';
import { Plus, X, Upload, AlertCircle, Edit3 } from 'lucide-react';
import { educationalResourcesApi, EducationalResource } from '../../../../services/educationalResourcesApi';

interface CreateResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResourceCreated: (resource: EducationalResource) => void;
  editingResource?: EducationalResource | null;
}

// Define status type to match the API
type ResourceStatus = 'Published' | 'Draft' | 'Under Review' | 'Archived';
type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

// Extended interface for form data that includes file fields
interface CreateResourceFormData extends Omit<Partial<EducationalResource>, 'status' | 'difficulty'> {
  status?: ResourceStatus;
  difficulty?: DifficultyLevel;
  imageFile?: File;
  resourceFile?: File;
}

// Hard-coded categories
const CATEGORIES = [
  'Neurology',
  'Pediatric Neurology', 
  'Epilepsy',
  'Developmental Disorders',
  'Research',
  'Treatment Guidelines',
  'Case Studies',
  'Educational Materials'
];

const CreateResourceModal: React.FC<CreateResourceModalProps> = ({ 
  isOpen, 
  onClose, 
  onResourceCreated,
  editingResource = null
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isEditing = Boolean(editingResource);
  
  // Form state with proper status typing
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    fullDescription: string;
    category: string;
    type: string;
    condition: string;
    status: ResourceStatus;
    isFeatured: boolean;
    isFree: boolean;
    imageUrl: string;
    fileUrl: string;
    videoUrl: string;
    externalUrl: string;
    languages: string[];
    tags: string[];
    targetAudience: string[];
    relatedConditions: string[];
    learningObjectives: string[];
    prerequisites: string[];
    references: string[];
    ageGroup: string;
    difficulty: DifficultyLevel;
    duration: string;
    author: string;
    reviewedBy: string;
    institution: string;
    location: string;
    impactStatement: string;
    accreditation: string;
    publicationDate: string;
  }>({
    title: '',
    description: '',
    fullDescription: '',
    category: CATEGORIES[0],
    type: 'Fact Sheet',
    condition: '',
    status: 'Draft',
    isFeatured: false,
    isFree: true,
    imageUrl: '',
    fileUrl: '',
    videoUrl: '',
    externalUrl: '',
    languages: [],
    tags: [],
    targetAudience: [],
    relatedConditions: [],
    learningObjectives: [],
    prerequisites: [],
    references: [],
    ageGroup: '',
    difficulty: 'Beginner',
    duration: '',
    author: '',
    reviewedBy: '',
    institution: '',
    location: '',
    impactStatement: '',
    accreditation: '',
    publicationDate: new Date().toISOString().split('T')[0]
  });

  // File uploads
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [resourceFile, setResourceFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  
  // Array input helpers
  const [languageInput, setLanguageInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [audienceInput, setAudienceInput] = useState('');
  const [objectiveInput, setObjectiveInput] = useState('');
  const [prerequisiteInput, setPrerequisiteInput] = useState('');

  // Populate form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (isEditing && editingResource) {
        populateFormWithEditData();
      } else {
        resetForm();
      }
    }
  }, [isOpen, isEditing, editingResource]);

  const populateFormWithEditData = () => {
    if (!editingResource) return;

    const publicationDate = editingResource.publicationDate 
      ? new Date(editingResource.publicationDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    setFormData({
      title: editingResource.title || '',
      description: editingResource.description || '',
      fullDescription: editingResource.fullDescription || '',
      category: editingResource.category || CATEGORIES[0],
      type: editingResource.type || 'Fact Sheet',
      condition: editingResource.condition || '',
      status: (editingResource.status as ResourceStatus) || 'Draft',
      isFeatured: editingResource.isFeatured || false,
      isFree: editingResource.isFree !== undefined ? editingResource.isFree : true,
      imageUrl: editingResource.imageUrl || '',
      fileUrl: editingResource.fileUrl || '',
      videoUrl: editingResource.videoUrl || '',
      externalUrl: editingResource.externalUrl || '',
      languages: editingResource.languages || [],
      tags: editingResource.tags || [],
      targetAudience: editingResource.targetAudience || [],
      relatedConditions: editingResource.relatedConditions || [],
      learningObjectives: editingResource.learningObjectives || [],
      prerequisites: editingResource.prerequisites || [],
      references: editingResource.references || [],
      ageGroup: editingResource.ageGroup || '',
      difficulty: (editingResource.difficulty as DifficultyLevel) || 'Beginner',
      duration: editingResource.duration || '',
      author: editingResource.author || '',
      reviewedBy: editingResource.reviewedBy || '',
      institution: editingResource.institution || '',
      location: editingResource.location || '',
      impactStatement: editingResource.impactStatement || '',
      accreditation: editingResource.accreditation || '',
      publicationDate: publicationDate
    });

    // Set image preview if editing resource has an image
    if (editingResource.imageUrl) {
      setImagePreview(editingResource.imageUrl);
    }

    // Clear any previous errors
    setError(null);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      fullDescription: '',
      category: CATEGORIES[0],
      type: 'Fact Sheet',
      condition: '',
      status: 'Draft',
      isFeatured: false,
      isFree: true,
      imageUrl: '',
      fileUrl: '',
      videoUrl: '',
      externalUrl: '',
      languages: [],
      tags: [],
      targetAudience: [],
      relatedConditions: [],
      learningObjectives: [],
      prerequisites: [],
      references: [],
      ageGroup: '',
      difficulty: 'Beginner',
      duration: '',
      author: '',
      reviewedBy: '',
      institution: '',
      location: '',
      impactStatement: '',
      accreditation: '',
      publicationDate: new Date().toISOString().split('T')[0]
    });
    setImageFile(null);
    setResourceFile(null);
    setImagePreview('');
    setError(null);
    
    // Reset array inputs
    setLanguageInput('');
    setTagInput('');
    setAudienceInput('');
    setObjectiveInput('');
    setPrerequisiteInput('');
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResourceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResourceFile(file);
    }
  };

  // Array helper functions
  const addToArray = (field: keyof typeof formData, input: string, setInput: (value: string) => void) => {
    if (!input.trim()) return;
    
    const currentArray = formData[field] as string[];
    const items = input.split(',').map(item => item.trim()).filter(item => item);
    const newArray = [...currentArray, ...items].filter((item, index, arr) => arr.indexOf(item) === index);
    
    handleInputChange(field, newArray);
    setInput('');
  };

  const removeFromArray = (field: keyof typeof formData, index: number) => {
    const currentArray = formData[field] as string[];
    const newArray = currentArray.filter((_, i) => i !== index);
    handleInputChange(field, newArray);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }
    
    if (!formData.author.trim()) {
      setError('Author is required');
      return;
    }

    if (!formData.category) {
      setError('Category is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Prepare submission data with proper typing
      const submissionData: CreateResourceFormData = {
        ...formData,
        // Add files for FormData submission
        imageFile: imageFile || undefined,
        resourceFile: resourceFile || undefined
      };

      let updatedResource: EducationalResource;

      if (isEditing && editingResource) {
        // Update existing resource
        updatedResource = await educationalResourcesApi.update(editingResource.id, submissionData);
      } else {
        // Create new resource
        updatedResource = await educationalResourcesApi.create(submissionData);
      }
      
      onResourceCreated(updatedResource);
      onClose();
    } catch (err) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} resource:`, err);
      setError(err instanceof Error ? err.message : `Failed to ${isEditing ? 'update' : 'create'} resource`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center">
              {isEditing ? (
                <>
                  <Edit3 className="w-6 h-6 mr-2 text-blue-600" />
                  Edit Educational Resource
                </>
              ) : (
                <>
                  <Plus className="w-6 h-6 mr-2 text-blue-600" />
                  Create Educational Resource
                </>
              )}
            </h2>
            <button 
              type="button"
              className="text-gray-500 hover:text-gray-700"
              onClick={onClose}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
              <span className="text-red-800">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resource Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter resource title"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Fact Sheet">Fact Sheet</option>
                    <option value="Case Study">Case Study</option>
                    <option value="Video">Video</option>
                    <option value="Document">Document</option>
                    <option value="Slide Deck">Slide Deck</option>
                    <option value="Interactive">Interactive</option>
                    <option value="Webinar">Webinar</option>
                    <option value="Toolkit">Toolkit</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                  <select 
                    value={formData.difficulty}
                    onChange={(e) => handleInputChange('difficulty', e.target.value as DifficultyLevel)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Brief description of the resource"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Description
                </label>
                <textarea
                  value={formData.fullDescription}
                  onChange={(e) => handleInputChange('fullDescription', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={5}
                  placeholder="Detailed description with sections and formatting"
                />
              </div>
            </div>

            {/* Media Files */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Media & Files</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cover Image
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {imagePreview ? (
                      <div>
                        <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded mb-2" />
                        <button
                          type="button"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview('');
                            if (isEditing) {
                              handleInputChange('imageUrl', '');
                            }
                          }}
                          className="text-red-600 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">Upload cover image</p>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleImageFileChange}
                          className="hidden" 
                          id="image-upload"
                        />
                        <label 
                          htmlFor="image-upload"
                          className="mt-2 inline-block bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700"
                        >
                          Choose File
                        </label>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Resource File
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {resourceFile ? (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">{resourceFile.name}</p>
                        <button
                          type="button"
                          onClick={() => setResourceFile(null)}
                          className="text-red-600 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ) : isEditing && formData.fileUrl ? (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Current file available</p>
                        <input 
                          type="file" 
                          accept=".pdf,.doc,.docx,.ppt,.pptx"
                          onChange={handleResourceFileChange}
                          className="hidden" 
                          id="file-upload"
                        />
                        <label 
                          htmlFor="file-upload"
                          className="mt-2 inline-block bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700"
                        >
                          Replace File
                        </label>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">Upload resource file</p>
                        <input 
                          type="file" 
                          accept=".pdf,.doc,.docx,.ppt,.pptx"
                          onChange={handleResourceFileChange}
                          className="hidden" 
                          id="file-upload"
                        />
                        <label 
                          htmlFor="file-upload"
                          className="mt-2 inline-block bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700"
                        >
                          Choose File
                        </label>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Video URL</label>
                  <input
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">External URL</label>
                  <input
                    type="url"
                    value={formData.externalUrl}
                    onChange={(e) => handleInputChange('externalUrl', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://external-resource.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 30 minutes, 2 hours"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age Group</label>
                  <input
                    type="text"
                    value={formData.ageGroup}
                    onChange={(e) => handleInputChange('ageGroup', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 0-18 years, Adults"
                  />
                </div>
              </div>
            </div>

            {/* Content Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Content Details</h3>
              
              {/* Languages */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Languages</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={languageInput}
                    onChange={(e) => setLanguageInput(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter languages (comma separated)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addToArray('languages', languageInput, setLanguageInput);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => addToArray('languages', languageInput, setLanguageInput)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.languages.map((lang, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center">
                      {lang}
                      <button
                        type="button"
                        onClick={() => removeFromArray('languages', index)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter tags (comma separated)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addToArray('tags', tagInput, setTagInput);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => addToArray('tags', tagInput, setTagInput)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm flex items-center">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeFromArray('tags', index)}
                        className="ml-2 text-green-600 hover:text-green-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Target Audience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={audienceInput}
                    onChange={(e) => setAudienceInput(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Neurologists, Pediatricians (comma separated)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addToArray('targetAudience', audienceInput, setAudienceInput);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => addToArray('targetAudience', audienceInput, setAudienceInput)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.targetAudience.map((audience, index) => (
                    <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm flex items-center">
                      {audience}
                      <button
                        type="button"
                        onClick={() => removeFromArray('targetAudience', index)}
                        className="ml-2 text-purple-600 hover:text-purple-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Learning Objectives */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Learning Objectives</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={objectiveInput}
                    onChange={(e) => setObjectiveInput(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter learning objectives (comma separated)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addToArray('learningObjectives', objectiveInput, setObjectiveInput);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => addToArray('learningObjectives', objectiveInput, setObjectiveInput)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.learningObjectives.map((objective, index) => (
                    <span key={index} className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-sm flex items-center">
                      {objective}
                      <button
                        type="button"
                        onClick={() => removeFromArray('learningObjectives', index)}
                        className="ml-2 text-indigo-600 hover:text-indigo-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Prerequisites */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prerequisites</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={prerequisiteInput}
                    onChange={(e) => setPrerequisiteInput(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter prerequisites (comma separated)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addToArray('prerequisites', prerequisiteInput, setPrerequisiteInput);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => addToArray('prerequisites', prerequisiteInput, setPrerequisiteInput)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.prerequisites.map((prereq, index) => (
                    <span key={index} className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm flex items-center">
                      {prereq}
                      <button
                        type="button"
                        onClick={() => removeFromArray('prerequisites', index)}
                        className="ml-2 text-orange-600 hover:text-orange-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Author Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Author & Publication</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Author *
                  </label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => handleInputChange('author', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Author name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                  <input
                    type="text"
                    value={formData.institution}
                    onChange={(e) => handleInputChange('institution', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Institution or organization"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="City, Country"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Publication Date</label>
                  <input
                    type="date"
                    value={formData.publicationDate}
                    onChange={(e) => handleInputChange('publicationDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reviewed By</label>
                  <input
                    type="text"
                    value={formData.reviewedBy}
                    onChange={(e) => handleInputChange('reviewedBy', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Reviewer name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Accreditation</label>
                  <input
                    type="text"
                    value={formData.accreditation}
                    onChange={(e) => handleInputChange('accreditation', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Accreditation details"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Impact Statement</label>
                <textarea
                  value={formData.impactStatement}
                  onChange={(e) => handleInputChange('impactStatement', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Describe the impact or outcomes of this resource"
                />
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value as ResourceStatus)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Published">Published</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                  <input
                    type="text"
                    value={formData.condition}
                    onChange={(e) => handleInputChange('condition', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Related medical condition"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={formData.isFeatured}
                    onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded" 
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">Feature this resource</span>
                </label>
                
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={formData.isFree}
                    onChange={(e) => handleInputChange('isFree', e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded" 
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">Free resource</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  isEditing ? 'Update Resource' : 'Create Resource'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateResourceModal;