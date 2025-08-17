import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Heart, FileImage, FileVideo } from 'lucide-react';

interface GalleryItem {
  id: number;
  type: 'photo' | 'video';
  title: string;
  category: string;
  description: string;
  event_date: string;
  location: string;
  duration?: string;
  media_url?: string;
  thumbnail_url?: string;
  is_featured: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Story {
  id: number;
  title: string;
  patient_name: string;
  age: number;
  condition: string;
  story: string;
  story_date: string;
  location: string;
  image_url?: string;
  is_featured: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

interface CreateGalleryItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: any) => void;
  type: 'gallery' | 'stories';
  initialData?: GalleryItem | Story;
}

const CreateGalleryItemModal: React.FC<CreateGalleryItemModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  type,
  initialData 
}) => {
  // Determine if we're in edit mode
  const isEditMode = !!initialData;

  // Common fields
  const [title, setTitle] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  // Gallery item fields
  const [itemType, setItemType] = useState<'photo' | 'video'>('photo');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');

  // Story fields
  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState('');
  const [condition, setCondition] = useState('');
  const [story, setStory] = useState('');

  // File input refs
  const imageInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  // Populate form when editing
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setIsFeatured(initialData.is_featured || false);
      
      if ('type' in initialData) {
        // Gallery item
        const galleryItem = initialData as GalleryItem;
        setItemType(galleryItem.type || 'photo');
        setCategory(galleryItem.category || '');
        setDate(galleryItem.event_date || '');
        setLocation(galleryItem.location || '');
        setDescription(galleryItem.description || '');
        setDuration(galleryItem.duration || '');
        
        // Set existing media preview
        if (galleryItem.media_url) {
          setImagePreview(galleryItem.media_url);
        }
        if (galleryItem.thumbnail_url) {
          setThumbnailPreview(galleryItem.thumbnail_url);
        }
      } else {
        // Story
        const storyItem = initialData as Story;
        setPatientName(storyItem.patient_name || '');
        setAge(String(storyItem.age || ''));
        setCondition(storyItem.condition || '');
        setStory(storyItem.story || '');
        setDate(storyItem.story_date || '');
        setLocation(storyItem.location || '');
        
        // Set existing image preview
        if (storyItem.image_url) {
          setImagePreview(storyItem.image_url);
        }
      }
    }
  }, [initialData]);

  const handleImageUpload = (file: File, isMain: boolean = true) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (isMain) {
          setImageFile(file);
          setImagePreview(result);
        } else {
          setThumbnailFile(file);
          setThumbnailPreview(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageInputChange = (e: React.ChangeEvent<HTMLInputElement>, isMain: boolean = true) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file, isMain);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent, isMain: boolean = true) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/') || file.type.startsWith('video/'));
    
    if (imageFile) {
      handleImageUpload(imageFile, isMain);
    }
  };

  const removeImage = (isMain: boolean = true) => {
    if (isMain) {
      setImageFile(null);
      setImagePreview('');
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    } else {
      setThumbnailFile(null);
      setThumbnailPreview('');
      if (thumbnailInputRef.current) {
        thumbnailInputRef.current.value = '';
      }
    }
  };

  const resetForm = () => {
    setTitle('');
    setImageFile(null);
    setThumbnailFile(null);
    setImagePreview('');
    setThumbnailPreview('');
    setIsFeatured(false);
    setItemType('photo');
    setCategory('');
    setDate('');
    setLocation('');
    setDescription('');
    setDuration('');
    setPatientName('');
    setAge('');
    setCondition('');
    setStory('');
  };

  const handleSubmit = () => {
    if (type === 'gallery') {
      const itemData = {
        type: itemType,
        title,
        category,
        event_date: date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        location,
        description,
        imageFile,
        thumbnailFile,
        duration: itemType === 'video' ? duration : undefined,
        is_featured: isFeatured
      };
      onSave(itemData);
    } else {
      const itemData = {
        title,
        patient_name: patientName,
        age: parseInt(age) || 0,
        condition,
        location,
        story_date: date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        story,
        imageFile,
        is_featured: isFeatured
      };
      onSave(itemData);
    }
    resetForm();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Validation for edit mode - don't require new files if existing media exists
  const isFormValid = () => {
    const hasTitle = !!title.trim();
    const hasRequiredImage = imageFile || (isEditMode && imagePreview);
    
    if (type === 'gallery') {
      return hasTitle && hasRequiredImage && category && description;
    } else {
      return hasTitle && hasRequiredImage && patientName && age && condition && story;
    }
  };

  if (!isOpen) return null;

  const FileUploadArea = ({ 
    file, 
    preview, 
    onUpload, 
    onRemove, 
    inputRef, 
    accept, 
    label, 
    isMain = true 
  }: {
    file: File | null;
    preview: string;
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemove: () => void;
    inputRef: React.RefObject<HTMLInputElement>;
    accept: string;
    label: string;
    isMain?: boolean;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}{(isMain && !isEditMode) && '*'}
        {isEditMode && isMain && (
          <span className="text-gray-500 text-xs ml-1">(Upload new file to replace existing)</span>
        )}
      </label>
      
      {!file && !preview ? (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors cursor-pointer"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, isMain)}
          onClick={() => inputRef.current?.click()}
        >
          <div className="space-y-2">
            <div className="flex justify-center">
              {accept.includes('video') ? (
                <FileVideo className="w-12 h-12 text-gray-400" />
              ) : (
                <FileImage className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">
                <span className="font-medium text-purple-600">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                {accept.includes('video') ? 'MP4, MOV, AVI' : 'PNG, JPG, JPEG'} (max 10MB)
              </p>
            </div>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={onUpload}
            className="hidden"
          />
        </div>
      ) : (
        <div className="relative">
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            {preview && (
              <div className="relative mb-3">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-md"
                />
                {!file && isEditMode && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">Current File</span>
                  </div>
                )}
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileImage className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-700 truncate">
                  {file ? file.name : (isEditMode ? 'Existing file' : 'No file')}
                </span>
                {file && (
                  <span className="text-xs text-gray-500">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {(preview && !file) && (
                  <button
                    onClick={() => inputRef.current?.click()}
                    className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                    type="button"
                  >
                    Replace
                  </button>
                )}
                <button
                  onClick={onRemove}
                  className="text-red-500 hover:text-red-700 p-1"
                  type="button"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={onUpload}
            className="hidden"
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center">
              {type === 'gallery' ? (
                <Camera className="w-6 h-6 mr-2 text-purple-600" />
              ) : (
                <Heart className="w-6 h-6 mr-2 text-purple-600" />
              )}
              {isEditMode ? 'Edit' : 'Create New'} {type === 'gallery' ? 'Gallery Item' : 'Story'}
            </h2>
            <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title*</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Featured toggle */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
              />
              <label htmlFor="featured" className="ml-2 text-sm font-medium text-gray-700">
                Feature this {type === 'gallery' ? 'item' : 'story'}
              </label>
            </div>

            {/* File Upload Areas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FileUploadArea
                file={imageFile}
                preview={imagePreview}
                onUpload={(e) => handleImageInputChange(e, true)}
                onRemove={() => removeImage(true)}
                inputRef={imageInputRef}
                accept={itemType === 'video' ? 'video/*' : 'image/*'}
                label={itemType === 'video' ? 'Video File' : 'Image File'}
                isMain={true}
              />
              
              {type === 'gallery' && (
                <FileUploadArea
                  file={thumbnailFile}
                  preview={thumbnailPreview}
                  onUpload={(e) => handleImageInputChange(e, false)}
                  onRemove={() => removeImage(false)}
                  inputRef={thumbnailInputRef}
                  accept="image/*"
                  label="Thumbnail (Optional)"
                  isMain={false}
                />
              )}
            </div>

            {type === 'gallery' ? (
              <>
                {/* Gallery Item Specific Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type*</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      value={itemType}
                      onChange={(e) => setItemType(e.target.value as 'photo' | 'video')}
                      required
                    >
                      <option value="photo">Photo</option>
                      <option value="video">Video</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category*
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      required
                    >
                      <option value="">Select a category</option>
                      <option value="conferences">Conferences</option>
                      <option value="training">Training</option>
                      <option value="community">Community</option>
                      <option value="events">Events</option>
                      <option value="outreach">Outreach</option>
                      <option value="medical">Medical</option>
                      <option value="education">Education</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      placeholder="e.g. July 10, 2025"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Kampala, Uganda"
                    />
                  </div>
                  {itemType === 'video' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        placeholder="e.g. 4:32"
                      />
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description*</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the gallery item..."
                    required
                  />
                </div>
              </>
            ) : (
              <>
                {/* Story Specific Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name*</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="Enter patient's name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age*</label>
                    <input
                      type="number"
                      min="0"
                      max="150"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="Age in years"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Medical Condition*</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                      placeholder="e.g., Epilepsy, Cerebral Palsy"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Nairobi, Kenya"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      placeholder="e.g. June 15, 2025"
                    />
                  </div>
                </div>

                {/* Story Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Story*</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={6}
                    value={story}
                    onChange={(e) => setStory(e.target.value)}
                    placeholder="Tell the story of how this person's life was changed..."
                    required
                  />
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={!isFormValid()}
              >
                {isEditMode ? 'Update' : 'Create'} {type === 'gallery' ? 'Gallery Item' : 'Story'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGalleryItemModal;