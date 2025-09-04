import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle,
  User,
  Calendar,
  Tag,
  Globe,
  Building,
  Mail,
  Phone,
  Users,
  Award,
  ExternalLink
} from 'lucide-react';
import { researchPapersApi, CreateResearchPaperInput, 
  ResearchPaperType, ResearchPaperCategory, StudyDesign } from '../../../services/researchprojectsApi';

interface Author {
  name: string;
  email: string;
  affiliation: string;
  isCorresponding: boolean;
}

interface ResearchPaperFormData {
  title: string;
  abstract: string;
  keywords: string[];
  authors: Author[];
  researchType: ResearchPaperType;
  studyDesign?: StudyDesign;
  participants: string;
  ethicsApproval: boolean;
  ethicsNumber: string;
  fundingSource: string;
  conflictOfInterest: string;
  acknowledgments: string;
  category: ResearchPaperCategory;
  targetJournal: string;
  manuscript: File | null;
  supplementaryFiles: File[];
  declaration: boolean;
}

interface ResearchPaperUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: ResearchPaperFormData) => void;
}

const ResearchPaperUploadModal: React.FC<ResearchPaperUploadModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [keywordInput, setKeywordInput] = useState('');
  
  const [formData, setFormData] = useState<ResearchPaperFormData>({
    title: '',
    abstract: '',
    keywords: [],
    authors: [{ name: '', email: '', affiliation: '', isCorresponding: true }],
    researchType: '' as ResearchPaperType,
    studyDesign: '' as StudyDesign,
    participants: '',
    ethicsApproval: false,
    ethicsNumber: '',
    fundingSource: '',
    conflictOfInterest: '',
    acknowledgments: '',
    category: '' as ResearchPaperCategory,
    targetJournal: '',
    manuscript: null,
    supplementaryFiles: [],
    declaration: false
  });

  const researchTypes: ResearchPaperType[] = [
    'Clinical Trial',
    'Observational Study',
    'Case Report',
    'Case Series',
    'Systematic Review',
    'Meta-Analysis',
    'Basic Science Research',
    'Epidemiological Study',
    'Other'
  ];

  const categories: ResearchPaperCategory[] = [
    'Pediatric Epilepsy',
    'Cerebral Palsy',
    'Neurodevelopmental Disorders',
    'Pediatric Stroke',
    'Infectious Diseases of CNS',
    'Genetic Neurological Disorders',
    'Neurooncology',
    'Other'
  ];

  const studyDesigns: StudyDesign[] = [
    'Randomized Controlled Trial',
    'Cohort Study',
    'Case-Control Study',
    'Cross-Sectional Study',
    'Qualitative Study',
    'Mixed Methods',
    'Other'
  ];

  if (!isOpen) return null;

  const handleInputChange = (field: keyof ResearchPaperFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()]
      }));
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const addAuthor = () => {
    setFormData(prev => ({
      ...prev,
      authors: [...prev.authors, { name: '', email: '', affiliation: '', isCorresponding: false }]
    }));
  };

  const updateAuthor = (index: number, field: keyof Author, value: any) => {
    setFormData(prev => ({
      ...prev,
      authors: prev.authors.map((author, i) => 
        i === index ? { ...author, [field]: value } : author
      )
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

  const handleFileUpload = (files: FileList | null, field: 'manuscript' | 'supplementaryFiles') => {
    if (!files) return;
    
    if (field === 'manuscript') {
      setFormData(prev => ({ ...prev, manuscript: files[0] }));
    } else {
      setFormData(prev => ({
        ...prev,
        supplementaryFiles: [...prev.supplementaryFiles, ...Array.from(files)]
      }));
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Prepare data for API
      const apiData: CreateResearchPaperInput = {
        title: formData.title,
        abstract: formData.abstract,
        keywords: formData.keywords,
        researchType: formData.researchType,
        category: formData.category,
        studyDesign: formData.studyDesign,
        participants: formData.participants,
        ethicsApproval: formData.ethicsApproval,
        ethicsNumber: formData.ethicsNumber,
        fundingSource: formData.fundingSource,
        conflictOfInterest: formData.conflictOfInterest,
        acknowledgments: formData.acknowledgments,
        targetJournal: formData.targetJournal,
        authors: formData.authors,
        manuscriptFile: formData.manuscript!,
        supplementaryFiles: formData.supplementaryFiles,
        declaration: formData.declaration
      };

      // Call the API
      const result = await researchPapersApi.create(apiData);
      
      setIsSubmitting(false);
      setSubmitSuccess(true);
      
      if (onSubmit) {
        onSubmit(formData);
      }
      
      // Auto close after 3 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
        setCurrentStep(1);
        setFormData({
          title: '',
          abstract: '',
          keywords: [],
          authors: [{ name: '', email: '', affiliation: '', isCorresponding: true }],
          researchType: '' as ResearchPaperType,
          studyDesign: '' as StudyDesign,
          participants: '',
          ethicsApproval: false,
          ethicsNumber: '',
          fundingSource: '',
          conflictOfInterest: '',
          acknowledgments: '',
          category: '' as ResearchPaperCategory,
          targetJournal: '',
          manuscript: null,
          supplementaryFiles: [],
          declaration: false
        });
        onClose();
      }, 3000);
    } catch (error: any) {
      setIsSubmitting(false);
      setSubmitError(error.message || 'Failed to submit research paper. Please try again.');
      console.error('Error submitting research paper:', error);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return formData.title.trim() !== '' && 
               formData.abstract.trim() !== '' && 
               formData.keywords.length >= 3; 
      case 2:
        return formData.authors.every(author => 
          author.name.trim() !== '' && 
          author.email.trim() !== '' && 
          author.affiliation.trim() !== ''
        ) && formData.authors.some(author => author.isCorresponding);
      case 3:
        return (formData.researchType as string) !== '' && (formData.category as string) !== '';
      case 4:
        return formData.manuscript !== null && formData.declaration;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (submitSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Submission Successful!</h2>
          <p className="text-gray-600 mb-4">
            Your research paper has been submitted for peer review.
          </p>
          <p className="text-sm text-gray-500">
            Review process typically takes 2-4 weeks. We'll keep you updated on the progress.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Submit Research Paper</h2>
            <p className="text-blue-100 text-sm">Step {currentStep} of 4</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-2 bg-gray-50">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span className={currentStep >= 1 ? 'text-blue-600 font-medium' : ''}>Basic Info</span>
            <span className={currentStep >= 2 ? 'text-blue-600 font-medium' : ''}>Authors</span>
            <span className={currentStep >= 3 ? 'text-blue-600 font-medium' : ''}>Study Details</span>
            <span className={currentStep >= 4 ? 'text-blue-600 font-medium' : ''}>Upload & Submit</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${(currentStep / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {submitError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded text-red-700">
              <AlertCircle className="inline w-4 h-4 mr-1" />
              {submitError}
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                Basic Information
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paper Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter the full title of your research paper"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Abstract *
                </label>
                <textarea
                  value={formData.abstract}
                  onChange={(e) => handleInputChange('abstract', e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Provide a comprehensive abstract including background, methods, results, and conclusions (250-300 words recommended)"
                />
                <p className="text-sm text-gray-500 mt-1">{formData.abstract.length} characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keywords * (Add 3-8 relevant keywords)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type keyword and press Enter"
                  />
                  <button
                    type="button"
                    onClick={addKeyword}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                    >
                      <Tag className="w-3 h-3" />
                      {keyword}
                      <button
                        type="button"
                        onClick={() => removeKeyword(keyword)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {formData.keywords.length < 3 && (
                  <p className="text-red-500 text-sm mt-2">
                    Please add at least 3 keywords to proceed
                  </p>
                )}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-600" />
                  Authors & Affiliations
                </h3>
                <button
                  type="button"
                  onClick={addAuthor}
                  className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                >
                  Add Author
                </button>
              </div>

              {formData.authors.map((author, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium text-gray-900">Author {index + 1}</h4>
                    {formData.authors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAuthor(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={author.name}
                        onChange={(e) => updateAuthor(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Dr. John Smith"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={author.email}
                        onChange={(e) => updateAuthor(index, 'email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="john.smith@hospital.com"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Institutional Affiliation *
                    </label>
                    <input
                      type="text"
                      value={author.affiliation}
                      onChange={(e) => updateAuthor(index, 'affiliation', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Department of Pediatric Neurology, University Hospital"
                    />
                  </div>
                  
                  <div className="mt-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={author.isCorresponding}
                        onChange={(e) => updateAuthor(index, 'isCorresponding', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Corresponding Author</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Award className="w-5 h-5 mr-2 text-blue-600" />
                Study Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Research Type *
                  </label>
                  <select
                    value={formData.researchType}
                    onChange={(e) => handleInputChange('researchType', e.target.value as ResearchPaperType)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select research type</option>
                    {researchTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value as ResearchPaperCategory)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Study Design
                </label>
                <select
                  value={formData.studyDesign}
                  onChange={(e) => handleInputChange('studyDesign', e.target.value as StudyDesign)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select study design</option>
                  {studyDesigns.map(design => (
                    <option key={design} value={design}>{design}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Study Participants/Sample
                </label>
                <textarea
                  value={formData.participants}
                  onChange={(e) => handleInputChange('participants', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your study population, sample size, inclusion/exclusion criteria"
                />
              </div>

              <div className="border border-gray-200 rounded-lg p-4 bg-yellow-50">
                <h4 className="font-medium text-gray-900 mb-3">Ethics & Compliance</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.ethicsApproval}
                      onChange={(e) => handleInputChange('ethicsApproval', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">This study has ethics approval</span>
                  </label>
                  
                  {formData.ethicsApproval && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ethics Approval Number
                      </label>
                      <input
                        type="text"
                        value={formData.ethicsNumber}
                        onChange={(e) => handleInputChange('ethicsNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ethics committee reference number"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Funding Source
                </label>
                <input
                  type="text"
                  value={formData.fundingSource}
                  onChange={(e) => handleInputChange('fundingSource', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Grant number, funding organization, or 'None'"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conflict of Interest Statement
                </label>
                <textarea
                  value={formData.conflictOfInterest}
                  onChange={(e) => handleInputChange('conflictOfInterest', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Declare any conflicts of interest or state 'None'"
                />
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Upload className="w-5 h-5 mr-2 text-blue-600" />
                File Upload & Final Submission
              </h3>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
                <h4 className="font-medium text-gray-900 mb-3">Manuscript File *</h4>
                <div className="text-center">
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <input
                    type="file"
                    onChange={(e) => handleFileUpload(e.target.files, 'manuscript')}
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    id="manuscript-upload"
                  />
                  <label
                    htmlFor="manuscript-upload"
                    className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 inline-block"
                  >
                    Choose Manuscript File
                  </label>
                  <p className="text-sm text-gray-500 mt-2">
                    Accepted formats: PDF, DOC, DOCX (Max 10MB)
                  </p>
                  {formData.manuscript && (
                    <div className="mt-3 text-sm text-green-600 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      {formData.manuscript.name}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Supplementary Files (Optional)</h4>
                <input
                  type="file"
                  onChange={(e) => handleFileUpload(e.target.files, 'supplementaryFiles')}
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Additional files such as datasets, figures, appendices
                </p>
                {formData.supplementaryFiles.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {formData.supplementaryFiles.map((file, index) => (
                      <div key={index} className="text-sm text-gray-600 flex items-center">
                        <FileText className="w-4 h-4 mr-1" />
                        {file.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Journal (Optional)
                </label>
                <input
                  type="text"
                  value={formData.targetJournal}
                  onChange={(e) => handleInputChange('targetJournal', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="If you have a specific journal in mind for publication"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Acknowledgments (Optional)
                </label>
                <textarea
                  value={formData.acknowledgments}
                  onChange={(e) => handleInputChange('acknowledgments', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Acknowledge contributors, funding sources, institutions"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <h4 className="font-medium mb-1">Declaration *</h4>
                    <label className="flex items-start">
                      <input
                        type="checkbox"
                        checked={formData.declaration}
                        onChange={(e) => handleInputChange('declaration', e.target.checked)}
                        className="mr-2 mt-0.5"
                      />
                      <span>
                        I certify that this work is original, has not been published elsewhere, 
                        and all authors have approved this submission. I understand that the 
                        manuscript will undergo peer review process and may be rejected or 
                        require revisions.
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {!validateStep(currentStep) && (
              <span className="text-red-600">Please complete all required fields</span>
            )}
          </div>
          <div className="flex space-x-3">
            {currentStep > 1 && (
              <button
                onClick={prevStep}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Previous
              </button>
            )}
            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                disabled={!validateStep(currentStep)}
                className={`px-4 py-2 rounded-md font-medium ${
                  validateStep(currentStep)
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!validateStep(currentStep) || isSubmitting}
                className={`px-6 py-2 rounded-md font-medium ${
                  validateStep(currentStep) && !isSubmitting
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Paper'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchPaperUploadModal;