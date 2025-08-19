import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Video, 
  Tag, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Upload, 
  Check, 
  AlertCircle,
  Users,
  Globe,
  Languages,
  Target,
  User
} from 'lucide-react';
import { webinarsApi } from '../../../services/webinarsApi'; // Import your API

type WebinarStatus = 'Planning' | 'Registration Open' | 'Live' | 'Completed' | 'Cancelled';
type WebinarType = 'Live' | 'Recorded' | 'Hybrid';

interface Speaker {
  name: string;
  credentials: string;
  affiliation: string;
}

interface CreateWebinarInput {
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  duration: string;
  speakers: Speaker[];
  status: WebinarStatus;
  type: WebinarType;
  isFeatured?: boolean;
  capacity?: number;
  registrationLink?: string;
  recordingLink?: string;
  slidesLink?: string;
  imageUrl: string;
  tags: string[];
  languages: string[];
  targetAudience: string[];
  learningObjectives: string[];
}

export interface Webinar extends CreateWebinarInput {
  id: number;
  isUpcoming: boolean;
  registrationCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface CreateWebinarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (webinar: Webinar) => void;
  initialData?: Webinar; // For edit mode
}

const CreateWebinarModal: React.FC<CreateWebinarModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData 
}) => {
  // Form state
  const [formData, setFormData] = useState<CreateWebinarInput>({
    title: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    time: '14:00',
    duration: '60 min',
    speakers: [{ name: '', credentials: '', affiliation: '' }],
    status: 'Planning',
    type: 'Live',
    isFeatured: false,
    capacity: 200,
    imageUrl: '',
    tags: [],
    languages: ['English'],
    targetAudience: [],
    learningObjectives: ['']
  });

  // UI state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    speakers: true,
    objectives: false,
    advanced: false
  });
  const [newTag, setNewTag] = useState('');
  const [newAudience, setNewAudience] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Predefined options
  const categoryOptions = [
    'Epilepsy', 'Cerebral Palsy', 'Autism', 'Headache', 
    'Infectious Disease', 'Neuromuscular', 'Development', 
    'Genetic Disorders', 'General Neurology'
  ];

  const audienceOptions = [
    'Neurologists', 'Pediatricians', 'General Practitioners',
    'Community Health Workers', 'Physical Therapists', 
    'Occupational Therapists', 'Researchers', 'Educators',
    'Medical Students', 'Residents', 'Nurses'
  ];

  const languageOptions = [
    'English', 'French', 'Arabic', 'Portuguese', 'Swahili',
    'Hausa', 'Amharic', 'Yoruba', 'Igbo', 'Afrikaans'
  ];

  // Initialize form with data when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description,
        category: initialData.category,
        date: initialData.date,
        time: initialData.time,
        duration: initialData.duration,
        speakers: initialData.speakers,
        status: initialData.status,
        type: initialData.type,
        isFeatured: initialData.isFeatured,
        capacity: initialData.capacity,
        registrationLink: initialData.registrationLink,
        recordingLink: initialData.recordingLink,
        slidesLink: initialData.slidesLink,
        imageUrl: initialData.imageUrl || '',
        tags: initialData.tags,
        languages: initialData.languages,
        targetAudience: initialData.targetAudience,
        learningObjectives: initialData.learningObjectives
      });

      if (initialData.imageUrl) {
        setImagePreview(initialData.imageUrl);
      }
    } else {
      // Reset form for new webinar
      setFormData({
        title: '',
        description: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        time: '14:00',
        duration: '60 min',
        speakers: [{ name: '', credentials: '', affiliation: '' }],
        status: 'Planning',
        type: 'Live',
        isFeatured: false,
        capacity: 200,
        imageUrl: '',
        tags: [],
        languages: ['English'],
        targetAudience: [],
        learningObjectives: ['']
      });
      setImageFile(null);
      setImagePreview(null);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSpeakerChange = (index: number, field: keyof Speaker, value: string) => {
    setFormData(prev => {
      const newSpeakers = [...prev.speakers];
      newSpeakers[index] = { ...newSpeakers[index], [field]: value };
      return { ...prev, speakers: newSpeakers };
    });
  };

  const addSpeaker = () => {
    setFormData(prev => ({
      ...prev,
      speakers: [...prev.speakers, { name: '', credentials: '', affiliation: '' }]
    }));
  };

  const removeSpeaker = (index: number) => {
    if (formData.speakers.length > 1) {
      setFormData(prev => ({
        ...prev,
        speakers: prev.speakers.filter((_, i) => i !== index)
      }));
    }
  };

  const addObjective = () => {
    setFormData(prev => ({
      ...prev,
      learningObjectives: [...prev.learningObjectives, '']
    }));
  };

  const removeObjective = (index: number) => {
    if (formData.learningObjectives.length > 1) {
      setFormData(prev => ({
        ...prev,
        learningObjectives: prev.learningObjectives.filter((_, i) => i !== index)
      }));
    }
  };

  const updateObjective = (index: number, value: string) => {
    setFormData(prev => {
      const newObjectives = [...prev.learningObjectives];
      newObjectives[index] = value;
      return { ...prev, learningObjectives: newObjectives };
    });
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddAudience = () => {
    if (newAudience.trim() && !formData.targetAudience.includes(newAudience.trim())) {
      setFormData(prev => ({
        ...prev,
        targetAudience: [...prev.targetAudience, newAudience.trim()]
      }));
      setNewAudience('');
    }
  };

  const handleRemoveAudience = (audienceToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      targetAudience: prev.targetAudience.filter(audience => audience !== audienceToRemove)
    }));
  };

  const handleAddLanguage = () => {
    if (newLanguage.trim() && !formData.languages.includes(newLanguage.trim())) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, newLanguage.trim()]
      }));
      setNewLanguage('');
    }
  };

  const handleRemoveLanguage = (languageToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(lang => lang !== languageToRemove)
    }));
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      // Clear any existing image URL
      setFormData(prev => ({ ...prev, imageUrl: '' }));
    }
  };
  
  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.time) newErrors.time = 'Time is required';
    
    // Check if at least one speaker has complete info
    const validSpeakers = formData.speakers.filter(speaker => 
      speaker.name && speaker.credentials && speaker.affiliation
    );
    if (validSpeakers.length === 0) {
      newErrors.speakers = 'At least one complete speaker is required';
    }

    // Check if at least one learning objective is provided
    const validObjectives = formData.learningObjectives.filter(obj => obj.trim());
    if (validObjectives.length === 0) {
      newErrors.objectives = 'At least one learning objective is required';
    }
    
    // For new items, require image file. For edits, require either file or existing URL
    if (!initialData) {
      if (!imageFile) newErrors.image = 'Featured image is required';
    } else {
      if (!imageFile && !formData.imageUrl) newErrors.image = 'Featured image is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadImage = async (): Promise<string> => {
    if (!imageFile) return formData.imageUrl;
    
    try {
      const uploadResult = await webinarsApi.uploadImage(imageFile);
      return uploadResult.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let uploadedImageUrl = formData.imageUrl;
      
      // Only upload new image if one was selected
      if (imageFile) {
        uploadedImageUrl = await uploadImage();
      }
      
      // Filter out empty speakers and objectives
      const validSpeakers = formData.speakers.filter(speaker => 
        speaker.name && speaker.credentials && speaker.affiliation
      );
      const validObjectives = formData.learningObjectives.filter(obj => obj.trim());
      
      // Prepare the webinar data
      const webinarData: Webinar = {
        ...(initialData || {}),
        id: initialData?.id || Date.now(), // Mock ID generation
        title: formData.title,
        description: formData.description,
        category: formData.category,
        date: formData.date,
        time: formData.time,
        duration: formData.duration,
        speakers: validSpeakers,
        status: formData.status,
        type: formData.type,
        isFeatured: formData.isFeatured,
        capacity: formData.capacity,
        registrationLink: formData.registrationLink,
        recordingLink: formData.recordingLink,
        slidesLink: formData.slidesLink,
        imageUrl: uploadedImageUrl,
        tags: formData.tags,
        languages: formData.languages,
        targetAudience: formData.targetAudience,
        learningObjectives: validObjectives,
        isUpcoming: ['Planning', 'Registration Open', 'Live'].includes(formData.status),
        registrationCount: initialData?.registrationCount || 0,
        createdAt: initialData?.createdAt || new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      
      onSave(webinarData);
      handleClose();
    } catch (error: any) {
      console.error('Error saving webinar:', error);
      setErrors({
        ...errors,
        form: 'Failed to save webinar. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setFormData({
      title: '',
      description: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      time: '14:00',
      duration: '60 min',
      speakers: [{ name: '', credentials: '', affiliation: '' }],
      status: 'Planning',
      type: 'Live',
      isFeatured: false,
      capacity: 200,
      imageUrl: '',
      tags: [],
      languages: ['English'],
      targetAudience: [],
      learningObjectives: ['']
    });
    setImageFile(null);
    setImagePreview(null);
    setExpandedSections({ speakers: true, objectives: false, advanced: false });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center">
                <Video className="w-6 h-6 mr-2 text-purple-600" />
                {initialData ? 'Edit Webinar' : 'Create New Webinar'}
              </h2>
              <button 
                type="button"
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700"
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

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Webinar Title* {errors.title && <span className="text-red-500 text-xs"> - {errors.title}</span>}
                  </label>
                  <input
                    type="text"
                    name="title"
                    className={`w-full px-3 py-2 border ${errors.title ? 'border-red-300' : 'border-gray-300'} rounded-md`}
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Enter webinar title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category* {errors.category && <span className="text-red-500 text-xs"> - {errors.category}</span>}
                  </label>
                  <select
                    name="category"
                    className={`w-full px-3 py-2 border ${errors.category ? 'border-red-300' : 'border-gray-300'} rounded-md`}
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {categoryOptions.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Webinar Type</label>
                  <select
                    name="type"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.type}
                    onChange={handleChange}
                  >
                    <option value="Live">Live</option>
                    <option value="Recorded">Recorded</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date* {errors.date && <span className="text-red-500 text-xs"> - {errors.date}</span>}
                  </label>
                  <input
                    type="date"
                    name="date"
                    className={`w-full px-3 py-2 border ${errors.date ? 'border-red-300' : 'border-gray-300'} rounded-md`}
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time* {errors.time && <span className="text-red-500 text-xs"> - {errors.time}</span>}
                  </label>
                  <input
                    type="time"
                    name="time"
                    className={`w-full px-3 py-2 border ${errors.time ? 'border-red-300' : 'border-gray-300'} rounded-md`}
                    value={formData.time}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <input
                    type="text"
                    name="duration"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.duration}
                    onChange={handleChange}
                    placeholder="e.g., 60 min, 1.5 hours"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                  <input
                    type="number"
                    name="capacity"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.capacity || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) || undefined }))}
                    placeholder="Maximum attendees"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="Planning">Planning</option>
                    <option value="Registration Open">Registration Open</option>
                    <option value="Live">Live</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description* {errors.description && <span className="text-red-500 text-xs"> - {errors.description}</span>}
                </label>
                <textarea
                  name="description"
                  className={`w-full px-3 py-2 border ${errors.description ? 'border-red-300' : 'border-gray-300'} rounded-md`}
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  required
                  placeholder="Describe what this webinar covers"
                />
              </div>

              {/* Featured Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Featured Image* {errors.image && <span className="text-red-500 text-xs"> - {errors.image}</span>}
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
                      <span>{imageFile ? `Selected: ${imageFile.name}` : initialData ? 'Change Featured Image' : 'Choose Featured Image'}</span>
                    </button>
                  </div>
                  
                  {(imagePreview || formData.imageUrl) && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
                      <div className="relative w-full h-48 overflow-hidden rounded-md border border-gray-200">
                        <img
                          src={imagePreview || formData.imageUrl}
                          alt="Featured image preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Speakers Section */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  type="button"
                  onClick={() => toggleSection('speakers')}
                  className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <User className="w-5 h-5 mr-2 text-purple-600" />
                    Speakers* {errors.speakers && <span className="text-red-500 text-xs ml-2"> - {errors.speakers}</span>}
                  </h3>
                  {expandedSections.speakers ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                
                {expandedSections.speakers && (
                  <div className="p-4 space-y-4">
                    {formData.speakers.map((speaker, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-200 rounded-lg">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Speaker Name</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            value={speaker.name}
                            onChange={(e) => handleSpeakerChange(index, 'name', e.target.value)}
                            placeholder="Dr. Jane Smith"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Credentials</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            value={speaker.credentials}
                            onChange={(e) => handleSpeakerChange(index, 'credentials', e.target.value)}
                            placeholder="MD, PhD"
                          />
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Affiliation</label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                              value={speaker.affiliation}
                              onChange={(e) => handleSpeakerChange(index, 'affiliation', e.target.value)}
                              placeholder="University Hospital"
                            />
                          </div>
                          {formData.speakers.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSpeaker(index)}
                              className="mt-6 p-2 text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addSpeaker}
                      className="w-full px-4 py-2 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 flex items-center justify-center text-gray-600 hover:text-gray-800"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Another Speaker
                    </button>
                  </div>
                )}
              </div>

              {/* Learning Objectives */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  type="button"
                  onClick={() => toggleSection('objectives')}
                  className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-purple-600" />
                    Learning Objectives* {errors.objectives && <span className="text-red-500 text-xs ml-2"> - {errors.objectives}</span>}
                  </h3>
                  {expandedSections.objectives ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                
                {expandedSections.objectives && (
                  <div className="p-4 space-y-3">
                    {formData.learningObjectives.map((objective, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                          value={objective}
                          onChange={(e) => updateObjective(index, e.target.value)}
                          placeholder="What will participants learn?"
                        />
                        {formData.learningObjectives.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeObjective(index)}
                            className="p-2 text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addObjective}
                      className="w-full px-4 py-2 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 flex items-center justify-center text-gray-600 hover:text-gray-800"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Learning Objective
                    </button>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs flex items-center"
                    >
                      {tag}
                      <button 
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-purple-600 hover:text-purple-800"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex">
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add tag (e.g., Epilepsy, Treatment)"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <button 
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-2 bg-purple-600 text-white rounded-r-md hover:bg-purple-700"
                  >
                    <Tag className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Target Audience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.targetAudience.map((audience, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center"
                    >
                      {audience}
                      <button 
                        type="button"
                        onClick={() => handleRemoveAudience(audience)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex">
                  <select
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md"
                    value={newAudience}
                    onChange={(e) => setNewAudience(e.target.value)}
                  >
                    <option value="">Select audience type</option>
                    {audienceOptions
                      .filter(option => !formData.targetAudience.includes(option))
                      .map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                  </select>
                  <button 
                    type="button"
                    onClick={handleAddAudience}
                    className="px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                    disabled={!newAudience}
                  >
                    <Users className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Languages */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Languages</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.languages.map((language, index) => (
                    <span
                      key={index}
                      className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center"
                    >
                      {language}
                      {formData.languages.length > 1 && (
                        <button 
                          type="button"
                          onClick={() => handleRemoveLanguage(language)}
                          className="ml-1 text-green-600 hover:text-green-800"
                        >
                          &times;
                        </button>
                      )}
                    </span>
                  ))}
                </div>
                <div className="flex">
                  <select
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md"
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                  >
                    <option value="">Add language</option>
                    {languageOptions
                      .filter(option => !formData.languages.includes(option))
                      .map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                  </select>
                  <button 
                    type="button"
                    onClick={handleAddLanguage}
                    className="px-3 py-2 bg-green-600 text-white rounded-r-md hover:bg-green-700"
                    disabled={!newLanguage}
                  >
                    <Languages className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  type="button"
                  onClick={() => toggleSection('advanced')}
                  className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <Globe className="w-5 h-5 mr-2 text-purple-600" />
                    Links & Settings (Optional)
                  </h3>
                  {expandedSections.advanced ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                
                {expandedSections.advanced && (
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Registration Link</label>
                        <input
                          type="url"
                          name="registrationLink"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          value={formData.registrationLink || ''}
                          onChange={handleChange}
                          placeholder="https://example.com/register"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Recording Link</label>
                        <input
                          type="url"
                          name="recordingLink"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          value={formData.recordingLink || ''}
                          onChange={handleChange}
                          placeholder="https://example.com/recording"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Slides Link</label>
                        <input
                          type="url"
                          name="slidesLink"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          value={formData.slidesLink || ''}
                          onChange={handleChange}
                          placeholder="https://example.com/slides"
                        />
                      </div>
                      <div className="flex items-center pt-6">
                        <input
                          type="checkbox"
                          id="featured"
                          checked={formData.isFeatured}
                          onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                          className="h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                        />
                        <label htmlFor="featured" className="ml-2 text-sm font-medium text-gray-700">
                          Feature this webinar
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 flex items-center justify-center min-w-32 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting || !formData.title || !formData.category || !formData.description || (!imageFile && !initialData)}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      {initialData ? 'Update' : 'Create'} Webinar
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

export default CreateWebinarModal;