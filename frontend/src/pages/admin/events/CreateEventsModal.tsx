import React, { useState, useRef, useEffect } from 'react';
import { 
  Calendar, 
  BookOpen, 
  Mic, 
  Clock, 
  Settings, 
  CheckCircle,
  Plus,
  Minus,
  Trash2,
  X,
  Image as ImageIcon,
  Upload
} from 'lucide-react';
import { 
  Conference, 
  FormData, 
  CreateEventModalProps,
  Speaker,
  Session
} from './conferenceTypes';

const CreateEventModal: React.FC<CreateEventModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  editingConference 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    date: '',
    time: '',
    location: '',
    venue: '',
    type: 'In-person',
    status: 'Planning',
    category: 'CONFERENCE',
    theme: '',
    description: '',
    fullDescription: '',
    imageUrl: '',
    imageFile: undefined,
    isOnline: false,
    capacity: '',
    price: '',
    earlyBirdFee: '',
    regularFee: '',
    earlyBirdDeadline: '',
    languages: ['English'],
    targetAudience: [''],
    learningObjectives: [''],
    keyTopics: [''],
    technicalRequirements: [''],
    organizer: {
      name: 'African Child Neurology Association (ACNA)',
      contact: '',
      phone: '',
      website: ''
    },
    speakers: [],
    program: [],
    highlights: ['']
  });

  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const speakerFileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const steps = [
    { number: 1, title: 'Basic Info', icon: Calendar },
    { number: 2, title: 'Details', icon: BookOpen },
    { number: 3, title: 'Speakers', icon: Mic },
    { number: 4, title: 'Program', icon: Clock },
    { number: 5, title: 'Settings', icon: Settings }
  ];

  // Initialize form with editing conference data
  useEffect(() => {
    if (editingConference) {
      setFormData({
        title: editingConference.title || '',
        date: editingConference.date || '',
        time: '', // You might want to extract time from date if it's included
        location: editingConference.location || '',
        venue: editingConference.venue || '',
        type: editingConference.type || 'In-person',
        status: editingConference.status || 'Planning',
        category: 'CONFERENCE',
        theme: editingConference.theme || '',
        description: editingConference.description || '',
        fullDescription: editingConference.description || '', // Use description as fullDescription if not available
        imageUrl: editingConference.imageUrl || '',
        imageFile: undefined,
        isOnline: editingConference.type === 'Virtual' || editingConference.type === 'Hybrid',
        capacity: editingConference.capacity?.toString() || '',
        price: '',
        earlyBirdFee: editingConference.earlyBirdFee || '',
        regularFee: editingConference.regularFee || '',
        earlyBirdDeadline: editingConference.earlyBirdDeadline || '',
        languages: ['English'],
        targetAudience: [''],
        learningObjectives: [''],
        keyTopics: [''],
        technicalRequirements: [''],
        organizer: {
          name: 'African Child Neurology Association (ACNA)',
          contact: '',
          phone: '',
          website: ''
        },
        speakers: [],
        program: [],
        highlights: editingConference.highlights || ['']
      });

      // Initialize speakers if you have speaker data in the conference
      setSpeakers([]);
      setSessions([]);
    } else {
      // Reset form for new conference
      setFormData({
        title: '',
        date: '',
        time: '',
        location: '',
        venue: '',
        type: 'In-person',
        status: 'Planning',
        category: 'CONFERENCE',
        theme: '',
        description: '',
        fullDescription: '',
        imageUrl: '',
        imageFile: undefined,
        isOnline: false,
        capacity: '',
        price: '',
        earlyBirdFee: '',
        regularFee: '',
        earlyBirdDeadline: '',
        languages: ['English'],
        targetAudience: [''],
        learningObjectives: [''],
        keyTopics: [''],
        technicalRequirements: [''],
        organizer: {
          name: 'African Child Neurology Association (ACNA)',
          contact: '',
          phone: '',
          website: ''
        },
        speakers: [],
        program: [],
        highlights: ['']
      });
      setSpeakers([]);
      setSessions([]);
    }

    // Reset current step when modal opens
    setCurrentStep(1);
    setErrors({});
  }, [editingConference, isOpen]);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if the file is an image
    if (!file.type.match('image.*')) {
      alert('Please select an image file (jpg, png, gif, etc.)');
      return;
    }

    // Check file size (e.g., 5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageDataUrl = event.target?.result as string;
      
      if (typeof index === 'number') {
        // Update speaker image
        updateSpeaker(index, 'imageFile', {
          file,
          preview: imageDataUrl
        });
      } else {
        // Update event image
        setFormData(prev => ({
          ...prev,
          imageFile: {
            file,
            preview: imageDataUrl
          },
          imageUrl: '' // Clear URL if one was previously set
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = (index?: number) => {
    if (typeof index === 'number') {
      speakerFileInputRefs.current[index]?.click();
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as object),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleArrayChange = (field: keyof FormData, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).map((item, i) => 
        i === index ? value : item
      )
    }));
  };

  const addArrayItem = (field: keyof FormData) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[]), '']
    }));
  };

  const removeArrayItem = (field: keyof FormData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }));
  };

  const addSpeaker = () => {
    setSpeakers(prev => [...prev, {
      name: '',
      title: '',
      organization: '',
      bio: '',
      imageUrl: '',
      imageFile: undefined,
      expertise: [''],
      isKeynote: false
    }]);
  };

  const updateSpeaker = (index: number, field: string, value: any) => {
    setSpeakers(prev => prev.map((speaker, i) => 
      i === index ? { ...speaker, [field]: value } : speaker
    ));
  };

  const removeSpeaker = (index: number) => {
    setSpeakers(prev => prev.filter((_, i) => i !== index));
  };

  const addSession = () => {
    setSessions(prev => [...prev, {
      time: '',
      title: '',
      speaker: '',
      duration: '',
      type: 'presentation',
      location: ''
    }]);
  };

  const updateSession = (index: number, field: string, value: any) => {
    setSessions(prev => prev.map((session, i) => 
      i === index ? { ...session, [field]: value } : session
    ));
  };

  const removeSession = (index: number) => {
    setSessions(prev => prev.filter((_, i) => i !== index));
  };

  const validateCurrentStep = () => {
    const stepErrors: Record<string, string> = {};
    
    switch (currentStep) {
      case 1:
        if (!formData.title) stepErrors.title = 'Title is required';
        if (!formData.date) stepErrors.date = 'Date is required';
        if (!formData.time) stepErrors.time = 'Time is required';
        if (!formData.location) stepErrors.location = 'Location is required';
        if (!formData.description) stepErrors.description = 'Description is required';
        // Make featured image required
        if (!formData.imageFile?.preview && !formData.imageUrl) {
          stepErrors.image = 'Featured image is required';
        }
        break;
      case 2:
        if (!formData.capacity) stepErrors.capacity = 'Capacity is required';
        if (!formData.fullDescription) stepErrors.fullDescription = 'Full description is required';
        break;
    }
    
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    const conferenceData: Conference = {
      id: editingConference?.id || Math.floor(Math.random() * 10000) + 1,
      title: formData.title,
      date: formData.date,
      location: formData.location,
      venue: formData.venue,
      type: formData.type,
      status: formData.status,
      theme: formData.theme,
      description: formData.description,
      imageUrl: formData.imageFile?.preview || formData.imageUrl || '',
      attendees: editingConference?.attendees || '0',
      speakers: speakers.length.toString(),
      countries: editingConference?.countries || '1',
      earlyBirdDeadline: formData.earlyBirdDeadline,
      regularFee: formData.regularFee,
      earlyBirdFee: formData.earlyBirdFee,
      registrationCount: editingConference?.registrationCount || 0,
      capacity: parseInt(formData.capacity) || 0,
      highlights: formData.highlights.filter(h => h.trim() !== ''),
      createdAt: editingConference?.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    
    onSave(conferenceData);
    onClose();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="e.g. Annual Pediatric Neurology Conference"
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Date *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md ${errors.date ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Time *</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md ${errors.time ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.time && <p className="mt-1 text-sm text-red-600">{errors.time}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md ${errors.location ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="e.g. Kigali, Rwanda"
                />
                {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                <input
                  type="text"
                  value={formData.venue}
                  onChange={(e) => handleInputChange('venue', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g. Kigali Convention Centre"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="In-person">In-person</option>
                  <option value="Virtual">Virtual</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Short Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                rows={3}
                placeholder="Brief description that will appear in listings"
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
              <input
                type="text"
                value={formData.theme}
                onChange={(e) => handleInputChange('theme', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g. Innovations in Pediatric Neurology"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Featured Image *</label>
              <div className="mt-1 flex items-center">
                {(formData.imageFile?.preview || formData.imageUrl) ? (
                  <div className="relative">
                    <img 
                      src={formData.imageFile?.preview || formData.imageUrl} 
                      alt="Event preview" 
                      className="h-32 w-32 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ 
                        ...prev, 
                        imageFile: undefined, 
                        imageUrl: '' 
                      }))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div 
                    className={`border-2 border-dashed rounded-md p-4 text-center cursor-pointer hover:border-blue-500 ${
                      errors.image ? 'border-red-500' : 'border-gray-300'
                    }`}
                    onClick={() => triggerFileInput()}
                  >
                    <div className="flex flex-col items-center">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">Click to upload</p>
                      <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                    </div>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Description *</label>
              <textarea
                value={formData.fullDescription}
                onChange={(e) => handleInputChange('fullDescription', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${errors.fullDescription ? 'border-red-500' : 'border-gray-300'}`}
                rows={6}
                placeholder="Detailed description of the event"
              />
              {errors.fullDescription && <p className="mt-1 text-sm text-red-600">{errors.fullDescription}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity *</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => handleInputChange('capacity', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md ${errors.capacity ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="e.g. 500"
                />
                {errors.capacity && <p className="mt-1 text-sm text-red-600">{errors.capacity}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Regular Fee ($)</label>
                <input
                  type="text"
                  value={formData.regularFee}
                  onChange={(e) => handleInputChange('regularFee', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g. 450"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Early Bird Fee ($)</label>
                <input
                  type="text"
                  value={formData.earlyBirdFee}
                  onChange={(e) => handleInputChange('earlyBirdFee', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g. 350"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Early Bird Deadline</label>
                <input
                  type="date"
                  value={formData.earlyBirdDeadline}
                  onChange={(e) => handleInputChange('earlyBirdDeadline', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Highlights</label>
              {formData.highlights.map((highlight, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={highlight}
                    onChange={(e) => handleArrayChange('highlights', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="e.g. Keynote by Dr. Smith"
                  />
                  {index === 0 ? (
                    <button
                      type="button"
                      onClick={() => addArrayItem('highlights')}
                      className="px-3 py-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('highlights', index)}
                      className="px-3 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Speakers</h3>
              <button
                type="button"
                onClick={addSpeaker}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Speaker
              </button>
            </div>
            
            {speakers.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Mic className="w-12 h-12 mx-auto text-gray-400" />
                <p className="mt-2 text-gray-500">No speakers added yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {speakers.map((speaker, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium">Speaker #{index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeSpeaker(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                        <input
                          type="text"
                          value={speaker.name}
                          onChange={(e) => updateSpeaker(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="Dr. Jane Doe"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                          type="text"
                          value={speaker.title}
                          onChange={(e) => updateSpeaker(index, 'title', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="Professor of Neurology"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
                        <input
                          type="text"
                          value={speaker.organization}
                          onChange={(e) => updateSpeaker(index, 'organization', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="University of Rwanda"
                        />
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`keynote-${index}`}
                          checked={speaker.isKeynote}
                          onChange={(e) => updateSpeaker(index, 'isKeynote', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`keynote-${index}`} className="ml-2 block text-sm text-gray-700">
                          Keynote Speaker
                        </label>
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                        <textarea
                          value={speaker.bio}
                          onChange={(e) => updateSpeaker(index, 'bio', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          rows={3}
                          placeholder="Speaker biography..."
                        />
                      </div>
                      
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Speaker Photo</label>
                        <div className="flex items-center gap-4">
                          {speaker.imageFile?.preview ? (
                            <div className="relative">
                              <img 
                                src={speaker.imageFile.preview} 
                                alt={`Speaker ${index + 1} preview`} 
                                className="h-20 w-20 object-cover rounded-full"
                              />
                              <button
                                type="button"
                                onClick={() => updateSpeaker(index, 'imageFile', null)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div 
                              className="border-2 border-dashed border-gray-300 rounded-full p-2 cursor-pointer hover:border-blue-500"
                              onClick={() => triggerFileInput(index)}
                            >
                              <ImageIcon className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <button
                              type="button"
                              onClick={() => triggerFileInput(index)}
                              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200"
                            >
                              {speaker.imageFile ? 'Change' : 'Upload'} Photo
                            </button>
                            <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB</p>
                          </div>
                          <input
                            type="file"
                            ref={el => speakerFileInputRefs.current[index] = el}
                            onChange={(e) => handleImageUpload(e, index)}
                            accept="image/*"
                            className="hidden"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Program Schedule</h3>
              <button
                type="button"
                onClick={addSession}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Session
              </button>
            </div>
            
            {sessions.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Clock className="w-12 h-12 mx-auto text-gray-400" />
                <p className="mt-2 text-gray-500">No sessions added yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium">Session #{index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeSession(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
                        <input
                          type="time"
                          value={session.time}
                          onChange={(e) => updateSession(index, 'time', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                        <input
                          type="text"
                          value={session.duration}
                          onChange={(e) => updateSession(index, 'duration', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="e.g. 45 minutes"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                        <input
                          type="text"
                          value={session.title}
                          onChange={(e) => updateSession(index, 'title', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="Session title"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select
                          value={session.type}
                          onChange={(e) => updateSession(index, 'type', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="presentation">Presentation</option>
                          <option value="workshop">Workshop</option>
                          <option value="panel">Panel Discussion</option>
                          <option value="break">Break</option>
                          <option value="registration">Registration</option>
                          <option value="social">Social Event</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Speaker(s)</label>
                        <input
                          type="text"
                          value={session.speaker}
                          onChange={(e) => updateSession(index, 'speaker', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="Speaker name(s)"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <input
                          type="text"
                          value={session.location || ''}
                          onChange={(e) => updateSession(index, 'location', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="Room/venue"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Moderator</label>
                        <input
                          type="text"
                          value={session.moderator || ''}
                          onChange={(e) => updateSession(index, 'moderator', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="Moderator name"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Organizer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organizer Name</label>
                  <input
                    type="text"
                    value={formData.organizer.name}
                    onChange={(e) => handleInputChange('organizer.name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={formData.organizer.contact}
                    onChange={(e) => handleInputChange('organizer.contact', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.organizer.phone}
                    onChange={(e) => handleInputChange('organizer.phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input
                    type="url"
                    value={formData.organizer.website}
                    onChange={(e) => handleInputChange('organizer.website', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Additional Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="Planning">Planning</option>
                    <option value="Registration Open">Registration Open</option>
                    <option value="Coming Soon">Coming Soon</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Languages</label>
                  {formData.languages.map((language, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={language}
                        onChange={(e) => handleArrayChange('languages', index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="e.g. English"
                      />
                      {index === 0 ? (
                        <button
                          type="button"
                          onClick={() => addArrayItem('languages')}
                          className="px-3 py-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('languages', index)}
                          className="px-3 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[95vh] overflow-hidden">
        <div className="flex justify-between items-center border-b border-gray-200 p-4">
          <h2 className="text-xl font-semibold">
            {editingConference ? 'Edit Conference' : 'Create New Conference'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Progress Steps */}
        <div className="border-b border-gray-200 px-6 pt-4">
          <div className="flex justify-between">
            {steps.map((step) => (
              <div key={step.number} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    currentStep >= step.number
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {currentStep > step.number ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <span
                  className={`text-xs font-medium ${
                    currentStep >= step.number ? 'text-blue-600' : 'text-gray-500'
                  }`}
                >
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Form Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          {renderStepContent()}
        </div>
        
        {/* Navigation Buttons */}
        <div className="border-t border-gray-200 p-4 flex justify-between">
          <div>
            {currentStep > 1 && (
              <button
                onClick={handlePrevious}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Previous
              </button>
            )}
          </div>
          
          <div>
            {currentStep < 5 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                {editingConference ? 'Update Conference' : 'Create Conference'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEventModal;