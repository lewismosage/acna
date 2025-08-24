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
import type { 
  Conference,
  Speaker,
  Session,
  ConferenceCreateUpdateData,
  SpeakerCreateData,
  SessionCreateData
} from '../../../../services/conferenceApi';
import { conferencesApi } from '../../../../services/conferenceApi';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (conference: ConferenceCreateUpdateData) => void;
  editingConference?: Conference | null;
}

// Extended Speaker interface to include imageFile property for preview
interface ExtendedSpeaker extends Speaker {
  imageFile?: {
    file: File;
    preview: string;
  };
}

interface FormData {
  title: string;
  date: string;
  time: string;
  location: string;
  venue: string;
  type: 'in_person' | 'virtual' | 'hybrid';
  status: 'planning' | 'registration_open' | 'coming_soon' | 'completed' | 'cancelled';
  theme: string;
  description: string;
  fullDescription: string;
  imageUrl: string;
  imageFile?: {
    file: File;
    preview: string;
  };
  capacity: string;
  earlyBirdFee: string;
  regularFee: string;
  earlyBirdDeadline: string;
  expectedAttendees: string;
  countriesRepresented: string;
  organizer: {
    name: string;
    email: string;
    phone: string;
    website: string;
  };
  highlights: string[];
}

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
    type: 'in_person',
    status: 'planning',
    theme: '',
    description: '',
    fullDescription: '',
    imageUrl: '',
    imageFile: undefined,
    capacity: '',
    earlyBirdFee: '',
    regularFee: '',
    earlyBirdDeadline: '',
    expectedAttendees: '',
    countriesRepresented: '',
    organizer: {
      name: 'African Child Neurology Association (ACNA)',
      email: '',
      phone: '',
      website: ''
    },
    highlights: ['']
  });

  // Use ExtendedSpeaker instead of Speaker to include imageFile
  const [speakers, setSpeakers] = useState<ExtendedSpeaker[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageUploading, setImageUploading] = useState(false);
  const [speakerImageUploading, setSpeakerImageUploading] = useState<{ [key: number]: boolean }>({});
  
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
        time: editingConference.time || '',
        location: editingConference.location || '',
        venue: editingConference.venue || '',
        type: editingConference.type || 'in_person',
        status: editingConference.status || 'planning',
        theme: editingConference.theme || '',
        description: editingConference.description || '',
        fullDescription: editingConference.description || '',
        imageUrl: editingConference.image_url || editingConference.display_image_url || '',
        imageFile: undefined,
        capacity: editingConference.capacity?.toString() || '',
        earlyBirdFee: editingConference.early_bird_fee?.toString() || '',
        regularFee: editingConference.regular_fee?.toString() || '',
        earlyBirdDeadline: editingConference.early_bird_deadline || '',
        expectedAttendees: editingConference.expected_attendees?.toString() || '',
        countriesRepresented: editingConference.countries_represented?.toString() || '',
        organizer: {
          name: editingConference.organizer_name || 'African Child Neurology Association (ACNA)',
          email: editingConference.organizer_email || '',
          phone: editingConference.organizer_phone || '',
          website: editingConference.organizer_website || ''
        },
        highlights: Array.isArray(editingConference.highlights)
          ? editingConference.highlights
          : typeof editingConference.highlights === 'string'
            ? (() => {
                try {
                  return JSON.parse(editingConference.highlights);
                } catch {
                  return [editingConference.highlights];
                }
              })()
            : ['']
      });

      // Initialize speakers - handle both field names
      const speakersArray = editingConference.conference_speakers || editingConference.speakers || [];
      setSpeakers(speakersArray.map(speaker => ({
        ...speaker,
        expertise: speaker.expertise || [],
        is_keynote: speaker.is_keynote || false,
        imageFile: undefined
      })));

      // Initialize sessions - handle both field names  
      const sessionsArray = editingConference.conference_sessions || editingConference.sessions || [];
      setSessions(sessionsArray);
    } else {
      // Reset form for new conference
      setFormData({
        title: '',
        date: '',
        time: '',
        location: '',
        venue: '',
        type: 'in_person',
        status: 'planning',
        theme: '',
        description: '',
        fullDescription: '',
        imageUrl: '',
        imageFile: undefined,
        capacity: '',
        earlyBirdFee: '',
        regularFee: '',
        earlyBirdDeadline: '',
        expectedAttendees: '',
        countriesRepresented: '',
        organizer: {
          name: 'African Child Neurology Association (ACNA)',
          email: '',
          phone: '',
          website: ''
        },
        highlights: ['']
      });
      setSpeakers([]);
      setSessions([]);
    }

    setCurrentStep(1);
    setErrors({});
    setImageUploading(false);
    setSpeakerImageUploading({});
  }, [editingConference, isOpen]);

  if (!isOpen) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, speakerIndex?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      alert('Please select an image file (jpg, png, gif, etc.)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('Image size should be less than 10MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageDataUrl = event.target?.result as string;
      
      if (typeof speakerIndex === 'number') {
        updateSpeaker(speakerIndex, 'imageFile', {
          file,
          preview: imageDataUrl
        });
      } else {
        setFormData(prev => ({
          ...prev,
          imageFile: {
            file,
            preview: imageDataUrl
          },
          imageUrl: ''
        }));
      }
    };
    reader.readAsDataURL(file);

    // Upload the image immediately
    try {
      if (typeof speakerIndex === 'number') {
        setSpeakerImageUploading(prev => ({ ...prev, [speakerIndex]: true }));
        const uploadResult = await conferencesApi.uploadSpeakerImage(file);
        updateSpeaker(speakerIndex, 'image_url', uploadResult.url);
      } else {
        setImageUploading(true);
        const uploadResult = await conferencesApi.uploadImage(file);
        setFormData(prev => ({ ...prev, imageUrl: uploadResult.url }));
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      if (typeof speakerIndex === 'number') {
        setSpeakerImageUploading(prev => ({ ...prev, [speakerIndex]: false }));
      } else {
        setImageUploading(false);
      }
    }
  };

  const removeImage = (speakerIndex?: number) => {
    if (typeof speakerIndex === 'number') {
      updateSpeaker(speakerIndex, 'imageFile', undefined);
      updateSpeaker(speakerIndex, 'image_url', '');
    } else {
      setFormData(prev => ({ 
        ...prev, 
        imageFile: undefined, 
        imageUrl: '' 
      }));
    }
  };

  const triggerFileInput = (speakerIndex?: number) => {
    if (typeof speakerIndex === 'number') {
      speakerFileInputRefs.current[speakerIndex]?.click();
    } else {
      fileInputRef.current?.click();
    }
  };

  const renderImageUploadSection = (speakerIndex?: number) => {
    const isSpeaker = typeof speakerIndex === 'number';
    const uploading = isSpeaker 
      ? speakerImageUploading[speakerIndex!] 
      : imageUploading;
    const imageUrl = isSpeaker 
      ? speakers[speakerIndex!].image_url || speakers[speakerIndex!].display_image_url
      : formData.imageUrl;
    const imagePreview = isSpeaker 
      ? speakers[speakerIndex!].imageFile?.preview
      : formData.imageFile?.preview;

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {isSpeaker ? 'Speaker Photo' : 'Featured Image *'}
        </label>
        <div className="flex items-center gap-4">
          {(imagePreview || imageUrl) ? (
            <div className="relative">
              <img 
                src={imagePreview || imageUrl} 
                alt={isSpeaker ? `Speaker preview` : 'Event preview'} 
                className={isSpeaker ? "h-20 w-20 object-cover rounded-full" : "h-32 w-32 object-cover rounded-md"}
              />
              {!uploading && (
                <button
                  type="button"
                  onClick={() => removeImage(speakerIndex)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-md">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              )}
            </div>
          ) : (
            <div 
              className={`border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:border-blue-500 ${
                !isSpeaker && errors.image ? 'border-red-500' : ''
              }`}
              onClick={() => triggerFileInput(speakerIndex)}
            >
              {uploading ? (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
                  <p className="text-sm text-gray-600">Uploading...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Click to upload</p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                </div>
              )}
            </div>
          )}
          
          <input
            type="file"
            ref={isSpeaker ? el => speakerFileInputRefs.current[speakerIndex!] = el : fileInputRef}
            onChange={(e) => handleImageUpload(e, speakerIndex)}
            accept="image/*"
            className="hidden"
          />
        </div>
        {!isSpeaker && errors.image && (
          <p className="mt-1 text-sm text-red-600">{errors.image}</p>
        )}
      </div>
    );
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
    const newSpeaker: ExtendedSpeaker = {
      id: 0, 
      name: '',
      title: '',
      organization: '',
      bio: '',
      image_url: '',
      expertise: [''],
      is_keynote: false,
      email: '',
      linkedin: '',
      imageFile: undefined
    };
    
    setSpeakers(prev => [...prev, newSpeaker]);
  };

  const updateSpeaker = (index: number, field: string, value: any) => {
    setSpeakers(prev => prev.map((speaker, i) => 
      i === index ? { ...speaker, [field]: value } : speaker
    ));
  };

  const removeSpeaker = (index: number) => {
    setSpeakers(prev => prev.filter((_, i) => i !== index));
    speakerFileInputRefs.current = speakerFileInputRefs.current.filter((_, i) => i !== index);
  };

  const addSession = () => {
    const newSession: Session = {
      id: 0, 
      title: '',
      description: '',
      start_time: '',
      duration_minutes: 60,
      session_type: 'presentation',
      location: '',
      speaker_names: '',
      moderator: '',
      capacity: undefined,
      materials_required: ''
    };
    
    setSessions(prev => [...prev, newSession]);
  };

  const updateSession = (index: number, field: string, value: any) => {
    setSessions(prev => prev.map((session, i) => {
      if (i === index) {
        const updatedSession = { ...session, [field]: value };
        
        // Convert duration to minutes if needed
        if (field === 'duration_minutes' && typeof value === 'string') {
          const minutes = parseInt(value) || 60;
          updatedSession.duration_minutes = minutes;
        }
        
        return updatedSession;
      }
      return session;
    }));
  };

  const removeSession = (index: number) => {
    setSessions(prev => prev.filter((_, i) => i !== index));
  };

  const validateCurrentStep = () => {
    const stepErrors: Record<string, string> = {};
    
    switch (currentStep) {
      case 1:
        if (!formData.title.trim()) stepErrors.title = 'Title is required';
        if (!formData.date) stepErrors.date = 'Date is required';
        if (!formData.time) stepErrors.time = 'Time is required';
        if (!formData.location.trim()) stepErrors.location = 'Location is required';
        if (!formData.description.trim()) stepErrors.description = 'Description is required';
        if (!formData.imageFile?.preview && !formData.imageUrl.trim()) {
          stepErrors.image = 'Featured image is required';
        }
        break;
      case 2:
        if (!formData.capacity) stepErrors.capacity = 'Capacity is required';
        if (!formData.fullDescription.trim()) stepErrors.fullDescription = 'Full description is required';
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

  const prepareSpeakersData = (): SpeakerCreateData[] => {
    return speakers
      .filter(speaker => speaker.name.trim() !== '')
      .map(speaker => ({
        id: speaker.id || undefined,
        name: speaker.name.trim(),
        title: speaker.title?.trim() || undefined,
        organization: speaker.organization?.trim() || undefined,
        bio: speaker.bio?.trim() || undefined,
        // Use the uploaded image URL, not the File object
        image_url: speaker.image_url || undefined,
        expertise: Array.isArray(speaker.expertise) 
          ? speaker.expertise.filter(exp => exp.trim() !== '') 
          : [],
        is_keynote: Boolean(speaker.is_keynote),
        email: speaker.email?.trim() || undefined,
        linkedin: speaker.linkedin?.trim() || undefined
      }));
  };

  const prepareSessionsData = (): SessionCreateData[] => {
    return sessions
      .filter(session => session.title.trim() !== '')
      .map(session => ({
        title: session.title.trim(),
        description: session.description?.trim() || undefined,
        start_time: session.start_time,
        duration_minutes: session.duration_minutes || 60,
        session_type: session.session_type,
        location: session.location?.trim() || undefined,
        speaker_names: session.speaker_names?.trim() || undefined,
        moderator: session.moderator?.trim() || undefined,
        capacity: session.capacity || undefined,
        materials_required: session.materials_required?.trim() || undefined
      }));
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    try {
      const speakersData = prepareSpeakersData();
      const sessionsData = prepareSessionsData();

      const filteredHighlights = formData.highlights.filter(h => h.trim() !== '');

      // Ensure date is properly formatted as YYYY-MM-DD
      const formattedDate = formData.date ? formData.date : '';

      const conferenceData: ConferenceCreateUpdateData = {
        title: formData.title.trim(),
        theme: formData.theme.trim() || undefined,
        description: formData.fullDescription.trim() || formData.description.trim(),
        date: formattedDate,
        time: formData.time || undefined,
        location: formData.location.trim(),
        venue: formData.venue.trim() || undefined,
        type: formData.type,
        status: formData.status,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        regular_fee: formData.regularFee ? parseFloat(formData.regularFee) : undefined,
        early_bird_fee: formData.earlyBirdFee ? parseFloat(formData.earlyBirdFee) : undefined,
        early_bird_deadline: formData.earlyBirdDeadline || undefined,
        expected_attendees: formData.expectedAttendees ? parseInt(formData.expectedAttendees) : undefined,
        countries_represented: formData.countriesRepresented ? parseInt(formData.countriesRepresented) : undefined,
        highlights: filteredHighlights,
        organizer_name: formData.organizer.name.trim(),
        organizer_email: formData.organizer.email.trim() || undefined,
        organizer_phone: formData.organizer.phone.trim() || undefined,
        organizer_website: formData.organizer.website.trim() || undefined,
        
        // Only include image_url, not the File object
        image_url: formData.imageUrl || undefined,
        
        // Include related data for creation/update
        speakers_data: speakersData,
        sessions_data: sessionsData
      };

      console.log('Prepared conference data:', conferenceData);
      onSave(conferenceData);
    } catch (error) {
      console.error('Error preparing conference data:', error);
      setErrors(prev => ({ ...prev, general: 'Error preparing conference data. Please check all fields and try again.' }));
    }
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
                  <option value="in_person">In-person</option>
                  <option value="virtual">Virtual</option>
                  <option value="hybrid">Hybrid</option>
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
            
            {renderImageUploadSection()}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Attendees</label>
                <input
                  type="number"
                  value={formData.expectedAttendees}
                  onChange={(e) => handleInputChange('expectedAttendees', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g. 450"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Regular Fee ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.regularFee}
                  onChange={(e) => handleInputChange('regularFee', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g. 450"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Early Bird Fee ($)</label>
                <input
                  type="number"
                  step="0.01"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Countries Represented</label>
                <input
                  type="number"
                  value={formData.countriesRepresented}
                  onChange={(e) => handleInputChange('countriesRepresented', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g. 15"
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
                          value={speaker.title || ''}
                          onChange={(e) => updateSpeaker(index, 'title', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="Professor of Neurology"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
                        <input
                          type="text"
                          value={speaker.organization || ''}
                          onChange={(e) => updateSpeaker(index, 'organization', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="University of Rwanda"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={speaker.email || ''}
                          onChange={(e) => updateSpeaker(index, 'email', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="speaker@example.com"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                        <input
                          type="url"
                          value={speaker.linkedin || ''}
                          onChange={(e) => updateSpeaker(index, 'linkedin', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="https://linkedin.com/in/username"
                        />
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`keynote-${index}`}
                          checked={speaker.is_keynote}
                          onChange={(e) => updateSpeaker(index, 'is_keynote', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`keynote-${index}`} className="ml-2 block text-sm text-gray-700">
                          Keynote Speaker
                        </label>
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                        <textarea
                          value={speaker.bio || ''}
                          onChange={(e) => updateSpeaker(index, 'bio', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          rows={3}
                          placeholder="Speaker biography..."
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expertise Areas</label>
                        {(speaker.expertise || ['']).map((expertise, expIndex) => (
                          <div key={expIndex} className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={expertise}
                              onChange={(e) => {
                                const newExpertise = [...(speaker.expertise || [''])];
                                newExpertise[expIndex] = e.target.value;
                                updateSpeaker(index, 'expertise', newExpertise);
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                              placeholder="e.g. Pediatric Epilepsy"
                            />
                            {expIndex === 0 ? (
                              <button
                                type="button"
                                onClick={() => {
                                  const newExpertise = [...(speaker.expertise || ['']), ''];
                                  updateSpeaker(index, 'expertise', newExpertise);
                                }}
                                className="px-3 py-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  const newExpertise = (speaker.expertise || ['']).filter((_, i) => i !== expIndex);
                                  updateSpeaker(index, 'expertise', newExpertise);
                                }}
                                className="px-3 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      <div className="md:col-span-2">
                        {renderImageUploadSection(index)}
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
                        <input
                          type="time"
                          value={session.start_time}
                          onChange={(e) => updateSession(index, 'start_time', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                        <input
                          type="number"
                          value={session.duration_minutes}
                          onChange={(e) => updateSession(index, 'duration_minutes', parseInt(e.target.value) || 60)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="60"
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
                          value={session.session_type}
                          onChange={(e) => updateSession(index, 'session_type', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="presentation">Presentation</option>
                          <option value="workshop">Workshop</option>
                          <option value="panel">Panel Discussion</option>
                          <option value="keynote">Keynote</option>
                          <option value="break">Break</option>
                          <option value="registration">Registration</option>
                          <option value="social">Social Event</option>
                          <option value="networking">Networking</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Speaker(s)</label>
                        <input
                          type="text"
                          value={session.speaker_names || ''}
                          onChange={(e) => updateSession(index, 'speaker_names', e.target.value)}
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

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                        <input
                          type="number"
                          value={session.capacity || ''}
                          onChange={(e) => updateSession(index, 'capacity', parseInt(e.target.value) || undefined)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="Maximum attendees"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          value={session.description || ''}
                          onChange={(e) => updateSession(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          rows={2}
                          placeholder="Session description..."
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Materials Required</label>
                        <input
                          type="text"
                          value={session.materials_required || ''}
                          onChange={(e) => updateSession(index, 'materials_required', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="e.g. Laptop, notebooks, handouts"
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
                    value={formData.organizer.email}
                    onChange={(e) => handleInputChange('organizer.email', e.target.value)}
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
                    <option value="planning">Planning</option>
                    <option value="registration_open">Registration Open</option>
                    <option value="coming_soon">Coming Soon</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Review Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4">Review Your Conference</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Title:</strong> {formData.title}</div>
                <div><strong>Date:</strong> {formData.date} at {formData.time}</div>
                <div><strong>Location:</strong> {formData.location} {formData.venue && `(${formData.venue})`}</div>
                <div><strong>Type:</strong> {formData.type.replace('_', ' ').toUpperCase()}</div>
                <div><strong>Capacity:</strong> {formData.capacity} attendees</div>
                <div><strong>Speakers:</strong> {speakers.filter(s => s.name.trim()).length} added</div>
                <div><strong>Sessions:</strong> {sessions.filter(s => s.title.trim()).length} added</div>
                {formData.regularFee && <div><strong>Regular Fee:</strong> ${formData.regularFee}</div>}
                {formData.earlyBirdFee && <div><strong>Early Bird Fee:</strong> ${formData.earlyBirdFee}</div>}
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