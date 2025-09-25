import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Heart,
  Star,
  Calendar,
  FileText,
  MessageSquare,
  Plus,
  X,
  Loader,
  CheckCircle,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import {
  careersApi,
  CreateVolunteerSubmissionInput
} from '../../services/careersAPI';
import ScrollToTop from '../../components/common/ScrollToTop';

interface FormData {
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

interface FormErrors {
  [key: string]: string;
}

const VolunteerForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    location: '',
    interests: [''],
    skills: [''],
    availability: '',
    experience: '',
    motivation: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Predefined options
  const availabilityOptions = [
    'Weekdays (9AM-5PM)',
    'Weekends only',
    'Evenings (5PM-8PM)',
    'Flexible schedule',
    'One-time events only',
    'Monthly commitment',
    'Weekly commitment'
  ];

  const commonInterests = [
    'Child Health Education',
    'Community Outreach',
    'Healthcare Training',
    'Research Support',
    'Event Organization',
    'Social Media & Communications',
    'Translation Services',
    'Fundraising',
    'Administrative Support',
    'Website/Tech Support'
  ];

  const commonSkills = [
    'Communication',
    'Event Planning',
    'Writing',
    'Translation',
    'Social Media',
    'Photography',
    'Graphic Design',
    'Web Development',
    'Teaching/Training',
    'Research',
    'Administrative',
    'Healthcare Background',
    'Project Management',
    'Public Speaking'
  ];

  const locations = [
    'Nairobi, Kenya',
    'Abuja, Nigeria',
    'Lagos, Nigeria',
    'Accra, Ghana',
    'Cape Town, South Africa',
    'Addis Ababa, Ethiopia',
    'Kampala, Uganda',
    'Dar es Salaam, Tanzania',
    'Dakar, Senegal',
    'Johannesburg, South Africa',
    'Other - Please specify in motivation'
  ];

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleArrayChange = (field: 'interests' | 'skills', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field: 'interests' | 'skills') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field: 'interests' | 'skills', index: number) => {
    if (formData[field].length > 1) {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required field validation
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.availability.trim()) newErrors.availability = 'Availability is required';
    if (!formData.experience.trim()) newErrors.experience = 'Experience is required';
    if (!formData.motivation.trim()) newErrors.motivation = 'Motivation is required';

    // Array validation
    const hasValidInterests = formData.interests.some(interest => interest.trim());
    if (!hasValidInterests) newErrors.interests = 'At least one interest is required';

    const hasValidSkills = formData.skills.some(skill => skill.trim());
    if (!hasValidSkills) newErrors.skills = 'At least one skill is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSubmitError(null);

    try {
      // Clean up the data before sending
      const cleanedData: CreateVolunteerSubmissionInput = {
        ...formData,
        interests: formData.interests.filter(interest => interest.trim()),
        skills: formData.skills.filter(skill => skill.trim())
      };

      await careersApi.createVolunteerSubmission(cleanedData);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting volunteer application:', error);
      setSubmitError('Failed to submit your application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for your interest in volunteering with ACNA. We've received your application 
              and will review it shortly. Our team will be in touch with you soon.
            </p>
            <div className="space-y-3">
              <Link
                to="/volunteer"
                className="block w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors"
              >
                Learn More About Volunteering
              </Link>
              <Link
                to="/jobs"
                className="block w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                View Job Opportunities
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ScrollToTop />
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <Link
              to="/volunteer"
              className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              Back
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Volunteer Application</h1>
              <p className="text-gray-600">Join our mission to improve child health across Africa</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 sm:p-8">
            {/* Error Alert */}
            {submitError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
                <div className="text-red-700 text-sm">{submitError}</div>
              </div>
            )}

            {/* Personal Information */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-orange-600" />
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your email address"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your phone number"
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <select
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 ${
                      errors.location ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select your location</option>
                    {locations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                  {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
                </div>
              </div>
            </div>

            {/* Interests */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Heart className="w-5 h-5 mr-2 text-orange-600" />
                Areas of Interest *
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Select or enter the areas where you'd like to volunteer. You can choose from common options or add your own.
              </p>
              
              {/* Quick select buttons */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Quick select:</p>
                <div className="flex flex-wrap gap-2">
                  {commonInterests.map(interest => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => {
                        const hasEmpty = formData.interests.some(item => item.trim() === '');
                        if (hasEmpty) {
                          const emptyIndex = formData.interests.findIndex(item => item.trim() === '');
                          handleArrayChange('interests', emptyIndex, interest);
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            interests: [...prev.interests, interest]
                          }));
                        }
                      }}
                      className="px-3 py-1 text-xs bg-orange-50 text-orange-700 border border-orange-200 rounded-full hover:bg-orange-100 transition-colors"
                    >
                      + {interest}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                {formData.interests.map((interest, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={interest}
                      onChange={(e) => handleArrayChange('interests', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                      placeholder={`Interest ${index + 1}`}
                    />
                    {formData.interests.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('interests', index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('interests')}
                  className="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Another Interest
                </button>
              </div>
              {errors.interests && <p className="text-red-500 text-xs mt-1">{errors.interests}</p>}
            </div>

            {/* Skills */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Star className="w-5 h-5 mr-2 text-orange-600" />
                Skills & Expertise *
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Tell us about your skills and expertise that could benefit our mission.
              </p>
              
              {/* Quick select buttons */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Quick select:</p>
                <div className="flex flex-wrap gap-2">
                  {commonSkills.map(skill => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => {
                        const hasEmpty = formData.skills.some(item => item.trim() === '');
                        if (hasEmpty) {
                          const emptyIndex = formData.skills.findIndex(item => item.trim() === '');
                          handleArrayChange('skills', emptyIndex, skill);
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            skills: [...prev.skills, skill]
                          }));
                        }
                      }}
                      className="px-3 py-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full hover:bg-blue-100 transition-colors"
                    >
                      + {skill}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                {formData.skills.map((skill, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => handleArrayChange('skills', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                      placeholder={`Skill ${index + 1}`}
                    />
                    {formData.skills.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('skills', index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('skills')}
                  className="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Another Skill
                </button>
              </div>
              {errors.skills && <p className="text-red-500 text-xs mt-1">{errors.skills}</p>}
            </div>

            {/* Availability */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-orange-600" />
                Availability *
              </h2>
              <div className="space-y-2">
                {availabilityOptions.map(option => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="availability"
                      value={option}
                      checked={formData.availability === option}
                      onChange={(e) => handleInputChange('availability', e.target.value)}
                      className="text-orange-600 focus:ring-orange-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
              {errors.availability && <p className="text-red-500 text-xs mt-1">{errors.availability}</p>}
            </div>

            {/* Experience */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-orange-600" />
                Relevant Experience *
              </h2>
              <textarea
                value={formData.experience}
                onChange={(e) => handleInputChange('experience', e.target.value)}
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 ${
                  errors.experience ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Tell us about your relevant experience, education, or background that makes you a good fit for volunteering with ACNA..."
              />
              {errors.experience && <p className="text-red-500 text-xs mt-1">{errors.experience}</p>}
            </div>

            {/* Motivation */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-orange-600" />
                Why do you want to volunteer with ACNA? *
              </h2>
              <textarea
                value={formData.motivation}
                onChange={(e) => handleInputChange('motivation', e.target.value)}
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 ${
                  errors.motivation ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Share your motivation for wanting to volunteer with ACNA and how you hope to contribute to our mission of improving child health across Africa..."
              />
              {errors.motivation && <p className="text-red-500 text-xs mt-1">{errors.motivation}</p>}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 sm:px-8 py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
              <p className="text-xs text-gray-500">
                * Required fields. Your information will be kept confidential and used only for volunteer coordination purposes.
              </p>
              <div className="flex gap-3">
                <Link
                  to="/volunteer"
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Application'
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

export default VolunteerForm;