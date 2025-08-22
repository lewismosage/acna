import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, 
  BookOpen, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Upload, 
  Check, 
  AlertCircle,
  Users,
  FileText,
  Settings
} from 'lucide-react';
import { workshopsApi, Workshop, WorkshopStatus, CreateWorkshopInput } from '../../../../services/workshopAPI';

type WorkshopType = 'Online' | 'In-Person' | 'Hybrid';

interface CreateWorkshopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (workshop: CreateWorkshopInput) => void;
  initialData?: Workshop;
}

const CreateWorkshopModal: React.FC<CreateWorkshopModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData 
}) => {
  // Form state
  const [formData, setFormData] = useState<CreateWorkshopInput>({
    title: '',
    instructor: '',
    date: new Date().toISOString().split('T')[0],
    time: '14:00',
    duration: '3 hours',
    location: '',
    venue: '',
    type: 'In-Person',
    status: 'Planning',
    description: '',
    imageUrl: '',
    capacity: 30,
    price: undefined,
    prerequisites: [''],
    materials: ['']
  });

  // UI state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    basic: true,
    details: false,
    requirements: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Predefined options
  const durationOptions = [
    '1 hour', '2 hours', '3 hours', '4 hours', '5 hours', '6 hours', '7 hours', '8 hours'
  ];

  const instructorOptions = [
    'Dr. Sarah Johnson', 'Prof. Michael Chen', 'Dr. Emma Williams', 'Dr. James Ochieng',
    'Dr. Mary Kamau', 'Prof. David Mwangi', 'Dr. Grace Wanjiku', 'Dr. Peter Otieno'
  ];

  const locationOptions = [
    'Virtual Meeting Room', 'Kenyatta National Hospital', 'Aga Khan University Hospital',
    'University of Nairobi', 'Moi Teaching Hospital', 'TBD'
  ];

  // Initialize form with data when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        instructor: initialData.instructor,
        date: initialData.date,
        time: initialData.time,
        duration: initialData.duration,
        location: initialData.location,
        venue: initialData.venue || '',
        type: initialData.type,
        status: initialData.status,
        description: initialData.description,
        imageUrl: initialData.imageUrl || '',
        capacity: initialData.capacity,
        price: initialData.price,
        prerequisites: initialData.prerequisites.length > 0 ? initialData.prerequisites : [''],
        materials: initialData.materials.length > 0 ? initialData.materials : ['']
      });

      if (initialData.imageUrl) {
        setImagePreview(initialData.imageUrl);
      }
    }
  }, [initialData]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacity' || name === 'price' ? 
        (value ? parseInt(value) : undefined) : value
    }));
  }, []);

  const handleImageFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      // Clear any existing image URL
      setFormData(prev => ({ ...prev, imageUrl: '' }));
    }
  }, []);

  const addPrerequisite = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      prerequisites: [...prev.prerequisites, '']
    }));
  }, []);

  const removePrerequisite = useCallback((index: number) => {
    if (formData.prerequisites.length > 1) {
      setFormData(prev => ({
        ...prev,
        prerequisites: prev.prerequisites.filter((_, i) => i !== index)
      }));
    }
  }, [formData.prerequisites.length]);

  const updatePrerequisite = useCallback((index: number, value: string) => {
    setFormData(prev => {
      const newPrerequisites = [...prev.prerequisites];
      newPrerequisites[index] = value;
      return { ...prev, prerequisites: newPrerequisites };
    });
  }, []);

  const addMaterial = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      materials: [...prev.materials, '']
    }));
  }, []);

  const removeMaterial = useCallback((index: number) => {
    if (formData.materials.length > 1) {
      setFormData(prev => ({
        ...prev,
        materials: prev.materials.filter((_, i) => i !== index)
      }));
    }
  }, [formData.materials.length]);

  const updateMaterial = useCallback((index: number, value: string) => {
    setFormData(prev => {
      const newMaterials = [...prev.materials];
      newMaterials[index] = value;
      return { ...prev, materials: newMaterials };
    });
  }, []);

  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.instructor) newErrors.instructor = 'Instructor is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.time) newErrors.time = 'Time is required';
    if (!formData.location) newErrors.location = 'Location is required';
    if (!formData.capacity || formData.capacity < 1) newErrors.capacity = 'Capacity must be at least 1';
    
    // Check if at least one valid prerequisite exists
    const validPrerequisites = formData.prerequisites.filter(req => req.trim());
    if (validPrerequisites.length === 0) {
      newErrors.prerequisites = 'At least one prerequisite is required';
    }

    // Check if at least one valid material exists
    const validMaterials = formData.materials.filter(mat => mat.trim());
    if (validMaterials.length === 0) {
      newErrors.materials = 'At least one material is required';
    }
    
    if (!imageFile && !formData.imageUrl) {
      newErrors.image = 'Workshop image is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, imageFile]);

  const uploadImage = useCallback(async (): Promise<string> => {
    if (!imageFile) return formData.imageUrl;

    setImageUploading(true);
    try {
      // Pass the file directly, not FormData
      const response = await workshopsApi.uploadImage(imageFile);
      // Use 'url' property from the response
      return response.url;
    } catch (error) {
      console.error('Image upload failed:', error);
      setErrors(prev => ({
        ...prev,
        image: 'Image upload failed. Please try again.'
      }));
      throw error;
    } finally {
      setImageUploading(false);
    }
  }, [imageFile, formData.imageUrl]);

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
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
      
      // Filter out empty prerequisites and materials
      const validPrerequisites = formData.prerequisites.filter(req => req.trim());
      const validMaterials = formData.materials.filter(mat => mat.trim());
      
      // Prepare the workshop data
      const workshopData: CreateWorkshopInput = {
        title: formData.title,
        instructor: formData.instructor,
        date: formData.date,
        time: formData.time,
        duration: formData.duration,
        location: formData.location,
        venue: formData.venue || undefined,
        type: formData.type,
        status: formData.status,
        description: formData.description,
        imageUrl: uploadedImageUrl,
        capacity: formData.capacity,
        price: formData.price,
        prerequisites: validPrerequisites,
        materials: validMaterials,
      };
      
      onSave(workshopData);
      handleClose();
      
    } catch (error: any) {
      console.error('Error saving workshop:', error);
      setErrors({
        ...errors,
        form: error.message || 'Failed to save workshop. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, imageFile, validateForm, uploadImage, onSave, errors]);

  const handleClose = useCallback(() => {
    // Reset form
    setFormData({
      title: '',
      instructor: '',
      date: new Date().toISOString().split('T')[0],
      time: '14:00',
      duration: '3 hours',
      location: '',
      venue: '',
      type: 'In-Person',
      status: 'Planning',
      description: '',
      imageUrl: '',
      capacity: 30,
      price: undefined,
      prerequisites: [''],
      materials: ['']
    });
    setImageFile(null);
    setImagePreview(null);
    setErrors({});
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center">
                <BookOpen className="w-6 h-6 mr-2 text-green-600" />
                {initialData ? 'Edit Workshop' : 'Create New Workshop'}
              </h2>
              <button 
                type="button"
                className="text-gray-500 hover:text-gray-700"
                onClick={handleClose}
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
              <div className="border border-gray-200 rounded-lg">
                <button
                  type="button"
                  onClick={() => toggleSection('basic')}
                  className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <Settings className="w-5 h-5 mr-2 text-green-600" />
                    Basic Information
                  </h3>
                  {expandedSections.basic ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                
                {expandedSections.basic && (
                  <div className="p-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Workshop Title* {errors.title && <span className="text-red-500 text-xs"> - {errors.title}</span>}
                      </label>
                      <input
                        type="text"
                        name="title"
                        className={`w-full px-3 py-2 border ${errors.title ? 'border-red-300' : 'border-gray-300'} rounded-md`}
                        value={formData.title}
                        onChange={handleChange}
                        required
                        placeholder="Enter workshop title"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Instructor* {errors.instructor && <span className="text-red-500 text-xs"> - {errors.instructor}</span>}
                        </label>
                        <select
                          name="instructor"
                          className={`w-full px-3 py-2 border ${errors.instructor ? 'border-red-300' : 'border-gray-300'} rounded-md`}
                          value={formData.instructor}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select Instructor</option>
                          {instructorOptions.map(instructor => (
                            <option key={instructor} value={instructor}>{instructor}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Workshop Type</label>
                        <select
                          name="type"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          value={formData.type}
                          onChange={handleChange}
                        >
                          <option value="In-Person">In-Person</option>
                          <option value="Online">Online</option>
                          <option value="Hybrid">Hybrid</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        <select
                          name="duration"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          value={formData.duration}
                          onChange={handleChange}
                        >
                          {durationOptions.map(duration => (
                            <option key={duration} value={duration}>{duration}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Location* {errors.location && <span className="text-red-500 text-xs"> - {errors.location}</span>}
                        </label>
                        <select
                          name="location"
                          className={`w-full px-3 py-2 border ${errors.location ? 'border-red-300' : 'border-gray-300'} rounded-md`}
                          value={formData.location}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select Location</option>
                          {locationOptions.map(location => (
                            <option key={location} value={location}>{location}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Venue/Room (Optional)</label>
                        <input
                          type="text"
                          name="venue"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          value={formData.venue}
                          onChange={handleChange}
                          placeholder="Conference Hall A"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Capacity* {errors.capacity && <span className="text-red-500 text-xs"> - {errors.capacity}</span>}
                        </label>
                        <input
                          type="number"
                          name="capacity"
                          className={`w-full px-3 py-2 border ${errors.capacity ? 'border-red-300' : 'border-gray-300'} rounded-md`}
                          value={formData.capacity || ''}
                          onChange={handleChange}
                          required
                          min="1"
                          placeholder="Maximum participants"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price (Optional)</label>
                        <input
                          type="number"
                          name="price"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          value={formData.price || ''}
                          onChange={handleChange}
                          min="0"
                          placeholder="Enter price in USD"
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
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Workshop Details */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  type="button"
                  onClick={() => toggleSection('details')}
                  className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-green-600" />
                    Workshop Details
                  </h3>
                  {expandedSections.details ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                
                {expandedSections.details && (
                  <div className="p-4 space-y-4">
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
                        placeholder="Describe what this workshop covers"
                      />
                    </div>

                    {/* Workshop Image Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Workshop Image* {errors.image && <span className="text-red-500 text-xs"> - {errors.image}</span>}
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
                            disabled={imageUploading}
                          >
                            {imageUploading ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="w-5 h-5 mr-2 text-gray-600" />
                                <span>{imageFile ? `Selected: ${imageFile.name}` : 'Choose Workshop Image'}</span>
                              </>
                            )}
                          </button>
                        </div>
                        
                        {imagePreview && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
                            <div className="relative w-full h-48 overflow-hidden rounded-md border border-gray-200">
                              <img
                                src={imagePreview}
                                alt="Workshop image preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Prerequisites and Materials */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  type="button"
                  onClick={() => toggleSection('requirements')}
                  className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-green-600" />
                    Prerequisites & Materials
                  </h3>
                  {expandedSections.requirements ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                
                {expandedSections.requirements && (
                  <div className="p-4 space-y-6">
                    {/* Prerequisites */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Prerequisites* {errors.prerequisites && <span className="text-red-500 text-xs"> - {errors.prerequisites}</span>}
                        </label>
                        <button
                          type="button"
                          onClick={addPrerequisite}
                          className="flex items-center text-sm text-green-600 hover:text-green-800"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Prerequisite
                        </button>
                      </div>
                      <div className="space-y-3">
                        {formData.prerequisites.map((prerequisite, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                              value={prerequisite}
                              onChange={(e) => updatePrerequisite(index, e.target.value)}
                              placeholder="e.g., Medical degree, Clinical experience"
                            />
                            {formData.prerequisites.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removePrerequisite(index)}
                                className="p-2 text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Materials */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Materials Provided* {errors.materials && <span className="text-red-500 text-xs"> - {errors.materials}</span>}
                        </label>
                        <button
                          type="button"
                          onClick={addMaterial}
                          className="flex items-center text-sm text-green-600 hover:text-green-800"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Material
                        </button>
                      </div>
                      <div className="space-y-3">
                        {formData.materials.map((material, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                              value={material}
                              onChange={(e) => updateMaterial(index, e.target.value)}
                              placeholder="e.g., Course handbook, Practice cases, Assessment tools"
                            />
                            {formData.materials.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeMaterial(index)}
                                className="p-2 text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
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
                  className="px-6 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 flex items-center justify-center min-w-32 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting || imageUploading}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      {initialData ? 'Update' : 'Create'} Workshop
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

export default CreateWorkshopModal;