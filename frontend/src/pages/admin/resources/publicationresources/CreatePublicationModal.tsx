import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  BookOpen, 
  Upload, 
  Plus, 
  Trash2, 
  Check, 
  AlertCircle,
  FileText,
  User,
  Globe,
  Tag,
  Users
} from 'lucide-react';
import { publicationsApi, CreatePublicationInput, Publication, 
         PublicationType, PublicationStatus, AccessType, Author } from '../../../../services/publicationsAPI';

interface CreatePublicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (publication: Publication) => void;
  initialData?: Publication;
}

// Static category options
const categoryOptions = [
  'Epilepsy', 'Cerebral Palsy', 'Autism', 'Headache', 
  'Infectious Disease', 'Neuromuscular', 'Development', 
  'Genetic Disorders', 'General Neurology', 'Practice Guidelines',
  'Medical Education', 'Health Policy', 'Annual Report'
];

const CreatePublicationModal: React.FC<CreatePublicationModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData 
}) => {
  // Form state
  const [formData, setFormData] = useState<CreatePublicationInput>({
    title: '',
    authors: [{ name: '', credentials: '', affiliation: '', email: '' }],
    journal: '',
    excerpt: '',
    type: 'Research Paper' as PublicationType,
    status: 'Draft' as PublicationStatus,
    category: '',
    accessType: 'Open Access' as AccessType,
    isFeatured: false,
    abstract: '',
    fullContent: '',
    tags: [],
    targetAudience: [],
    keywords: [],
    downloadUrl: '',
    externalUrl: '',
    language: 'English'
  });

  // UI state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [newAudience, setNewAudience] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  // Dynamic data from API
  const [audienceOptions, setAudienceOptions] = useState<string[]>([]);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Static options
  const languageOptions = [
    'English', 'French', 'Arabic', 'Portuguese', 'Swahili',
    'Hausa', 'Amharic', 'Yoruba', 'Igbo', 'Afrikaans'
  ];

  // Load dynamic data from API
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const audiencesData = await publicationsApi.getTargetAudiences();
        
        // Set audiences with fallback to default options
        const defaultAudiences = [
          'Neurologists', 'Pediatricians', 'General Practitioners',
          'Community Health Workers', 'Physical Therapists', 
          'Occupational Therapists', 'Researchers', 'Educators',
          'Medical Students', 'Residents', 'Nurses', 'Policymakers'
        ];
        setAudienceOptions(audiencesData.length > 0 ? audiencesData : defaultAudiences);
      } catch (error) {
        console.error('Error loading metadata:', error);
        // Use default options on error
        setAudienceOptions([
          'Neurologists', 'Pediatricians', 'General Practitioners',
          'Community Health Workers', 'Physical Therapists', 
          'Occupational Therapists', 'Researchers', 'Educators',
          'Medical Students', 'Residents', 'Nurses', 'Policymakers'
        ]);
      }
    };

    if (isOpen) {
      loadMetadata();
    }
  }, [isOpen]);

  // Initialize form with editing data
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        authors: initialData.authors?.length > 0 
          ? initialData.authors 
          : [{ name: '', credentials: '', affiliation: '', email: '' }],
        journal: initialData.journal || '',
        excerpt: initialData.excerpt || '',
        type: initialData.type || 'Research Paper',
        status: initialData.status || 'Draft',
        category: initialData.category || '',
        accessType: initialData.accessType || 'Open Access',
        isFeatured: initialData.isFeatured || false,
        abstract: initialData.abstract || '',
        fullContent: initialData.fullContent || '',
        tags: initialData.tags || [],
        targetAudience: initialData.targetAudience || [],
        keywords: initialData.keywords || [],
        downloadUrl: initialData.downloadUrl || '',
        externalUrl: initialData.externalUrl || '',
        language: initialData.language || 'English'
      });
      
      // Set image preview if there's an existing image
      if (initialData.imageUrl) {
        setImagePreview(initialData.imageUrl);
      }
    } else {
      // Reset form for new publication
      setFormData({
        title: '',
        authors: [{ name: '', credentials: '', affiliation: '', email: '' }],
        journal: '',
        excerpt: '',
        type: 'Research Paper',
        status: 'Draft',
        category: '',
        accessType: 'Open Access',
        isFeatured: false,
        abstract: '',
        fullContent: '',
        tags: [],
        targetAudience: [],
        keywords: [],
        downloadUrl: '',
        externalUrl: '',
        language: 'English'
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
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAuthorChange = (index: number, field: keyof Author, value: string) => {
    setFormData(prev => {
      const newAuthors = [...prev.authors];
      newAuthors[index] = { ...newAuthors[index], [field]: value };
      return { ...prev, authors: newAuthors };
    });
  };

  const addAuthor = () => {
    setFormData(prev => ({
      ...prev,
      authors: [...prev.authors, { name: '', credentials: '', affiliation: '', email: '' }]
    }));
  };

  const removeAuthor = (index: number) => {
    if (formData.authors.length > 1) {
      setFormData(prev => ({
        ...prev,
        authors: prev.authors.filter((_, i) => i !== index)
      }));
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      // Upload image to backend
      setImageUploading(true);
      setErrors(prev => ({ ...prev, image: '' }));
      
      try {
        const uploadResult = await publicationsApi.uploadImage(file);
        console.log('Image uploaded successfully:', uploadResult);
        // The uploaded file will be handled during form submission
      } catch (error) {
        console.error('Error uploading image:', error);
        setErrors(prev => ({
          ...prev,
          image: 'Failed to upload image. Please try again.'
        }));
        setImageFile(null);
        setImagePreview(null);
      } finally {
        setImageUploading(false);
      }
    }
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.excerpt.trim()) newErrors.excerpt = 'Excerpt is required';
    if (!formData.category) newErrors.category = 'Category is required';
    
    // Check if at least one author has complete info
    const validAuthors = formData.authors.filter(author => 
      author.name.trim() && author.affiliation.trim()
    );
    if (validAuthors.length === 0) {
      newErrors.authors = 'At least one author with name and affiliation is required';
    }
    
    if (!imageFile && !initialData?.imageUrl) {
      newErrors.image = 'Featured image is required';
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
      // Filter out incomplete authors
      const validAuthors = formData.authors.filter(author => 
        author.name.trim() && author.affiliation.trim()
      );
      
      // Prepare the publication data
      const publicationData: CreatePublicationInput = {
        ...formData,
        title: formData.title.trim(),
        authors: validAuthors,
        journal: formData.journal?.trim() || undefined,
        excerpt: formData.excerpt.trim(),
        abstract: formData.abstract?.trim() || undefined,
        fullContent: formData.fullContent?.trim() || undefined,
        downloadUrl: formData.downloadUrl?.trim() || undefined,
        externalUrl: formData.externalUrl?.trim() || undefined,
        imageFile: imageFile || undefined
      };
      
      let savedPublication: Publication;
      
      if (initialData) {
        // Update existing publication
        savedPublication = await publicationsApi.update(initialData.id, publicationData);
        console.log('Publication updated:', savedPublication);
      } else {
        // Create new publication
        savedPublication = await publicationsApi.create(publicationData);
        console.log('Publication created:', savedPublication);
      }
      
      onSave(savedPublication);
      onClose();
      
    } catch (error: any) {
      console.error('Error saving publication:', error);
      setErrors({
        form: error.message || 'Failed to save publication. Please try again.'
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
                <BookOpen className="w-6 h-6 mr-2 text-blue-600" />
                {initialData ? 'Edit Publication' : 'Create New Publication'}
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
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Publication Title* {errors.title && <span className="text-red-500 text-xs"> - {errors.title}</span>}
                    </label>
                    <input
                      type="text"
                      name="title"
                      className={`w-full px-3 py-2 border ${errors.title ? 'border-red-300' : 'border-gray-300'} rounded-md focus:ring-blue-500 focus:border-blue-500`}
                      value={formData.title}
                      onChange={handleChange}
                      required
                      placeholder="Enter publication title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type*</label>
                    <select
                      name="type"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={formData.type}
                      onChange={handleChange}
                      required
                    >
                      <option value="Research Paper">Research Paper</option>
                      <option value="Clinical Guidelines">Clinical Guidelines</option>
                      <option value="Educational Resource">Educational Resource</option>
                      <option value="Policy Brief">Policy Brief</option>
                      <option value="Research Report">Research Report</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category* {errors.category && <span className="text-red-500 text-xs"> - {errors.category}</span>}
                    </label>
                    <select
                      name="category"
                      className={`w-full px-3 py-2 border ${errors.category ? 'border-red-300' : 'border-gray-300'} rounded-md focus:ring-blue-500 focus:border-blue-500`}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      name="status"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="Draft">Draft</option>
                      <option value="Published">Published</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Access Type</label>
                    <select
                      name="accessType"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={formData.accessType}
                      onChange={handleChange}
                    >
                      <option value="Open Access">Open Access</option>
                      <option value="Free Access">Free Access</option>
                      <option value="Member Access">Member Access</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                    <select
                      name="language"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={formData.language}
                      onChange={handleChange}
                    >
                      {languageOptions.map(language => (
                        <option key={language} value={language}>{language}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Journal Name</label>
                    <input
                      type="text"
                      name="journal"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={formData.journal || ''}
                      onChange={handleChange}
                      placeholder="e.g., African Journal of Neurological Sciences"
                    />
                  </div>
                </div>
              </div>

              {/* Authors Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  Authors* {errors.authors && <span className="text-red-500 text-xs ml-2"> - {errors.authors}</span>}
                </h3>
                <div className="space-y-4">
                  {formData.authors.map((author, index) => (
                    <div key={index} className="p-4 bg-white border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-medium text-gray-900">Author #{index + 1}</h4>
                        {formData.authors.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeAuthor(index)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Remove author"
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
                            value={author.name}
                            onChange={(e) => handleAuthorChange(index, 'name', e.target.value)}
                            placeholder="Dr. Jane Doe"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Credentials</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            value={author.credentials}
                            onChange={(e) => handleAuthorChange(index, 'credentials', e.target.value)}
                            placeholder="MD, PhD"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Affiliation*</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            value={author.affiliation}
                            onChange={(e) => handleAuthorChange(index, 'affiliation', e.target.value)}
                            placeholder="University of Rwanda"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input
                            type="email"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            value={author.email || ''}
                            onChange={(e) => handleAuthorChange(index, 'email', e.target.value)}
                            placeholder="author@example.com"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addAuthor}
                    className="w-full px-4 py-3 border border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 flex items-center justify-center text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Another Author
                  </button>
                </div>
              </div>

              {/* Description & Abstract */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Content</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Excerpt* {errors.excerpt && <span className="text-red-500 text-xs"> - {errors.excerpt}</span>}
                    </label>
                    <textarea
                      name="excerpt"
                      className={`w-full px-3 py-2 border ${errors.excerpt ? 'border-red-300' : 'border-gray-300'} rounded-md focus:ring-blue-500 focus:border-blue-500`}
                      rows={3}
                      value={formData.excerpt}
                      onChange={handleChange}
                      required
                      placeholder="Brief description that will appear in listings"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Abstract</label>
                    <textarea
                      name="abstract"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      rows={4}
                      value={formData.abstract || ''}
                      onChange={handleChange}
                      placeholder="Detailed abstract of the publication"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Content</label>
                    <textarea
                      name="fullContent"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      rows={6}
                      value={formData.fullContent || ''}
                      onChange={handleChange}
                      placeholder="Full content or detailed description"
                    />
                  </div>
                </div>
              </div>

              {/* Featured Image Upload */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Featured Image</h3>
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
                      disabled={imageUploading}
                    >
                      {imageUploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5 mr-2 text-gray-600" />
                          <span>{imageFile ? `Selected: ${imageFile.name}` : 'Choose Featured Image'}</span>
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
                          alt="Featured image preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Links */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-blue-600" />
                  Links & URLs
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Download URL</label>
                    <input
                      type="url"
                      name="downloadUrl"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={formData.downloadUrl || ''}
                      onChange={handleChange}
                      placeholder="https://example.com/download.pdf"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">External URL</label>
                    <input
                      type="url"
                      name="externalUrl"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={formData.externalUrl || ''}
                      onChange={(e) => handleChange(e)}
                      placeholder="https://journal.com/article"
                    />
                  </div>
                </div>
              </div>

              {/* Tags, Keywords, and Audience */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Tag className="w-5 h-5 mr-2 text-blue-600" />
                  Tags & Classification
                </h3>
                <div className="space-y-6">
                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                        >
                          {tag}
                          <button 
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
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
                        className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 flex items-center"
                        disabled={!newTag.trim()}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Keywords */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Keywords</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center"
                        >
                          {keyword}
                          <button 
                            type="button"
                            onClick={() => handleRemoveKeyword(keyword)}
                            className="ml-2 text-green-600 hover:text-green-800 text-lg leading-none"
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
                        className="px-4 py-2 bg-green-600 text-white rounded-r-md hover:bg-green-700 flex items-center"
                        disabled={!newKeyword.trim()}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Target Audience */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.targetAudience.map((audience, index) => (
                        <span
                          key={index}
                          className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center"
                        >
                          {audience}
                          <button 
                            type="button"
                            onClick={() => handleRemoveAudience(audience)}
                            className="ml-2 text-purple-600 hover:text-purple-800 text-lg leading-none"
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex">
                      <select
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
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
                        className="px-4 py-2 bg-purple-600 text-white rounded-r-md hover:bg-purple-700 flex items-center"
                        disabled={!newAudience}
                      >
                        <Users className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
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
                  disabled={isSubmitting || imageUploading}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {initialData ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      {initialData ? 'Update Publication' : 'Create Publication'}
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

export default CreatePublicationModal;