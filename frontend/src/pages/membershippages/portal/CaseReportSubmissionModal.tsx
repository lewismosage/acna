import React, { useState } from "react";
import {
  X,
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  User,
  Award,
  Heart,
} from "lucide-react";
import {
  educationalResourcesApi,
  CaseReportSubmissionInput,
} from "../../../services/educationalResourcesApi";

export interface CaseReportFormData {
  title: string;
  submittedBy: string;
  institution: string;
  email: string;
  phone: string;
  location: string;
  category: string;
  patientDemographics: {
    ageGroup: string;
    gender: string;
    location: string;
  };
  clinicalPresentation: string;
  diagnosticWorkup: string;
  management: string;
  outcome: string;
  lessonLearned: string;
  discussion: string;
  excerpt: string;
  impact: string;
  ethicsApproval: boolean;
  ethicsNumber: string;
  consentObtained: boolean;
  conflictOfInterest: string;
  acknowledgments: string;
  references: string;
  attachments: File[];
  images: File[];
  declaration: boolean;
}

interface CaseReportSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: CaseReportFormData) => void;
}

const CaseReportSubmissionModal: React.FC<CaseReportSubmissionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CaseReportFormData>({
    title: "",
    submittedBy: "",
    institution: "",
    email: "",
    phone: "",
    location: "",
    category: "",
    patientDemographics: {
      ageGroup: "",
      gender: "",
      location: "",
    },
    clinicalPresentation: "",
    diagnosticWorkup: "",
    management: "",
    outcome: "",
    lessonLearned: "",
    discussion: "",
    excerpt: "",
    impact: "",
    ethicsApproval: false,
    ethicsNumber: "",
    consentObtained: false,
    conflictOfInterest: "",
    acknowledgments: "",
    references: "",
    attachments: [],
    images: [],
    declaration: false,
  });

  const categories = [
    "Pediatric Epilepsy",
    "Cerebral Palsy",
    "Neurodevelopmental Disorders",
    "Pediatric Stroke",
    "Infectious Diseases of CNS",
    "Genetic Neurological Disorders",
    "Neurooncology",
    "Metabolic Disorders",
    "Neuromuscular Disorders",
    "Headache Disorders",
    "Other",
  ];

  const ageGroups = [
    "Neonatal (0-28 days)",
    "Infant (1 month - 2 years)",
    "Preschool (2-5 years)",
    "School age (6-12 years)",
    "Adolescent (13-18 years)",
    "Young Adult (19-25 years)",
  ];

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith("patientDemographics.")) {
      const subField = field.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        patientDemographics: {
          ...prev.patientDemographics,
          [subField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleFileUpload = (
    files: FileList | null,
    field: "attachments" | "images"
  ) => {
    if (!files) return;

    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ...Array.from(files)],
    }));
  };

  const removeFile = (index: number, field: "attachments" | "images") => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Prepare the data for API submission
      const submissionData: CaseReportSubmissionInput = {
        title: formData.title,
        submittedBy: formData.submittedBy,
        institution: formData.institution,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        category: formData.category,
        patientDemographics: formData.patientDemographics,
        clinicalPresentation: formData.clinicalPresentation,
        diagnosticWorkup: formData.diagnosticWorkup,
        management: formData.management,
        outcome: formData.outcome,
        lessonLearned: formData.lessonLearned,
        discussion: formData.discussion,
        excerpt: formData.excerpt,
        impact: formData.impact,
        ethicsApproval: formData.ethicsApproval,
        ethicsNumber: formData.ethicsNumber,
        consentObtained: formData.consentObtained,
        conflictOfInterest: formData.conflictOfInterest,
        acknowledgments: formData.acknowledgments,
        references: formData.references,
        attachments: formData.attachments,
        images: formData.images,
        declaration: formData.declaration,
      };

      // Submit the case report using the API
      const result = await educationalResourcesApi.submitCaseReport(
        submissionData
      );

      console.log("Case report submitted successfully:", result);

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
          title: "",
          submittedBy: "",
          institution: "",
          email: "",
          phone: "",
          location: "",
          category: "",
          patientDemographics: {
            ageGroup: "",
            gender: "",
            location: "",
          },
          clinicalPresentation: "",
          diagnosticWorkup: "",
          management: "",
          outcome: "",
          lessonLearned: "",
          discussion: "",
          excerpt: "",
          impact: "",
          ethicsApproval: false,
          ethicsNumber: "",
          consentObtained: false,
          conflictOfInterest: "",
          acknowledgments: "",
          references: "",
          attachments: [],
          images: [],
          declaration: false,
        });
        onClose();
      }, 3000);
    } catch (error: any) {
      setIsSubmitting(false);
      setSubmitError(
        error.message || "Failed to submit case report. Please try again."
      );
      console.error("Error submitting case report:", error);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return (
          formData.title.trim() !== "" &&
          formData.submittedBy.trim() !== "" &&
          formData.institution.trim() !== "" &&
          formData.email.trim() !== "" &&
          formData.location.trim() !== "" &&
          formData.category !== ""
        );
      case 2:
        return (
          formData.patientDemographics.ageGroup !== "" &&
          formData.patientDemographics.gender !== "" &&
          formData.clinicalPresentation.trim() !== "" &&
          formData.diagnosticWorkup.trim() !== "" &&
          formData.management.trim() !== ""
        );
      case 3:
        return (
          formData.outcome.trim() !== "" &&
          formData.lessonLearned.trim() !== "" &&
          formData.excerpt.trim() !== "" &&
          formData.consentObtained
        );
      case 4:
        return formData.declaration;
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Case Report Submitted!
          </h2>
          <p className="text-gray-600 mb-4">
            Your case report has been successfully submitted for review.
          </p>
          <p className="text-sm text-gray-500">
            Our editorial team will review your submission within 2-3 weeks.
            We'll keep you updated on the progress.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-green-600 text-white px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Submit Case Report</h2>
            <p className="text-green-100 text-sm">Step {currentStep} of 4</p>
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
            <span
              className={currentStep >= 1 ? "text-green-600 font-medium" : ""}
            >
              Basic Info
            </span>
            <span
              className={currentStep >= 2 ? "text-green-600 font-medium" : ""}
            >
              Case Details
            </span>
            <span
              className={currentStep >= 3 ? "text-green-600 font-medium" : ""}
            >
              Outcomes & Ethics
            </span>
            <span
              className={currentStep >= 4 ? "text-green-600 font-medium" : ""}
            >
              Files & Submit
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
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
                <User className="w-5 h-5 mr-2 text-green-600" />
                Basic Information
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Case Report Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter a descriptive title for your case report"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Submitted By *
                  </label>
                  <input
                    type="text"
                    value={formData.submittedBy}
                    onChange={(e) =>
                      handleInputChange("submittedBy", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Dr. Your Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Institution *
                  </label>
                  <input
                    type="text"
                    value={formData.institution}
                    onChange={(e) =>
                      handleInputChange("institution", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Hospital/University name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="your.email@hospital.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="+1234567890"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="City, Country"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      handleInputChange("category", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Heart className="w-5 h-5 mr-2 text-green-600" />
                Case Details
              </h3>

              <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
                <h4 className="font-medium text-gray-900 mb-3">
                  Patient Demographics
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Age Group *
                    </label>
                    <select
                      value={formData.patientDemographics.ageGroup}
                      onChange={(e) =>
                        handleInputChange(
                          "patientDemographics.ageGroup",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select age group</option>
                      {ageGroups.map((age) => (
                        <option key={age} value={age}>
                          {age}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender *
                    </label>
                    <select
                      value={formData.patientDemographics.gender}
                      onChange={(e) =>
                        handleInputChange(
                          "patientDemographics.gender",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Patient Location
                    </label>
                    <input
                      type="text"
                      value={formData.patientDemographics.location}
                      onChange={(e) =>
                        handleInputChange(
                          "patientDemographics.location",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="City, Country"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clinical Presentation *
                </label>
                <textarea
                  value={formData.clinicalPresentation}
                  onChange={(e) =>
                    handleInputChange("clinicalPresentation", e.target.value)
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Describe the patient's presenting symptoms, history, and initial clinical findings..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diagnostic Workup *
                </label>
                <textarea
                  value={formData.diagnosticWorkup}
                  onChange={(e) =>
                    handleInputChange("diagnosticWorkup", e.target.value)
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Describe investigations performed, results, and diagnostic process..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Management *
                </label>
                <textarea
                  value={formData.management}
                  onChange={(e) =>
                    handleInputChange("management", e.target.value)
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Describe treatment approach, interventions, and therapeutic decisions..."
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Award className="w-5 h-5 mr-2 text-green-600" />
                Outcomes & Ethics
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Outcome *
                </label>
                <textarea
                  value={formData.outcome}
                  onChange={(e) => handleInputChange("outcome", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Describe the patient's outcome and follow-up..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lesson Learned / Key Points *
                </label>
                <textarea
                  value={formData.lessonLearned}
                  onChange={(e) =>
                    handleInputChange("lessonLearned", e.target.value)
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="What are the key learning points from this case?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discussion (Optional)
                </label>
                <textarea
                  value={formData.discussion}
                  onChange={(e) =>
                    handleInputChange("discussion", e.target.value)
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Discuss the case in context of literature, differential diagnosis, or clinical significance..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Case Summary (Excerpt) *
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => handleInputChange("excerpt", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Brief summary of the case for listing purposes (150-200 words)"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.excerpt.length} characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Impact/Significance
                </label>
                <input
                  type="text"
                  value={formData.impact}
                  onChange={(e) => handleInputChange("impact", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Rare condition, Novel approach, Educational value, etc."
                />
              </div>

              <div className="border border-gray-200 rounded-lg p-4 bg-yellow-50">
                <h4 className="font-medium text-gray-900 mb-3">
                  Ethics & Consent
                </h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.ethicsApproval}
                      onChange={(e) =>
                        handleInputChange("ethicsApproval", e.target.checked)
                      }
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">
                      Ethics approval obtained for case report
                    </span>
                  </label>

                  {formData.ethicsApproval && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ethics Approval Number
                      </label>
                      <input
                        type="text"
                        value={formData.ethicsNumber}
                        onChange={(e) =>
                          handleInputChange("ethicsNumber", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Ethics committee reference number"
                      />
                    </div>
                  )}

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.consentObtained}
                      onChange={(e) =>
                        handleInputChange("consentObtained", e.target.checked)
                      }
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">
                      Patient/guardian consent obtained for publication *
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conflict of Interest
                </label>
                <textarea
                  value={formData.conflictOfInterest}
                  onChange={(e) =>
                    handleInputChange("conflictOfInterest", e.target.value)
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Declare any conflicts of interest or state 'None'"
                />
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Upload className="w-5 h-5 mr-2 text-green-600" />
                Files & Final Submission
              </h3>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Supporting Documents (Optional)
                </h4>
                <input
                  type="file"
                  onChange={(e) =>
                    handleFileUpload(e.target.files, "attachments")
                  }
                  multiple
                  accept=".pdf,.doc,.docx"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Lab reports, imaging studies, discharge summaries (PDF, DOC,
                  DOCX)
                </p>
                {formData.attachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {formData.attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded"
                      >
                        <span className="flex items-center">
                          <FileText className="w-4 h-4 mr-1" />
                          {file.name}
                        </span>
                        <button
                          onClick={() => removeFile(index, "attachments")}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Images (Optional)
                </h4>
                <input
                  type="file"
                  onChange={(e) => handleFileUpload(e.target.files, "images")}
                  multiple
                  accept=".jpg,.jpeg,.png,.gif"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Clinical photos, imaging studies (ensure patient privacy)
                </p>
                {formData.images.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {formData.images.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded"
                      >
                        <span className="flex items-center">
                          <FileText className="w-4 h-4 mr-1" />
                          {file.name}
                        </span>
                        <button
                          onClick={() => removeFile(index, "images")}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  References (Optional)
                </label>
                <textarea
                  value={formData.references}
                  onChange={(e) =>
                    handleInputChange("references", e.target.value)
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="List relevant references in standard format..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Acknowledgments (Optional)
                </label>
                <textarea
                  value={formData.acknowledgments}
                  onChange={(e) =>
                    handleInputChange("acknowledgments", e.target.value)
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Acknowledge contributors, mentors, or institutions..."
                />
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-green-800">
                    <h4 className="font-medium mb-1">Declaration *</h4>
                    <label className="flex items-start">
                      <input
                        type="checkbox"
                        checked={formData.declaration}
                        onChange={(e) =>
                          handleInputChange("declaration", e.target.checked)
                        }
                        className="mr-2 mt-0.5"
                      />
                      <span>
                        I certify that this case report is based on a real
                        patient encounter, all clinical information is accurate,
                        patient confidentiality has been maintained, and
                        appropriate consent has been obtained. I understand that
                        the submission will undergo editorial review.
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
              <span className="text-red-600">
                Please complete all required fields
              </span>
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
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
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
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? "Submitting..." : "Submit Case Report"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseReportSubmissionModal;
