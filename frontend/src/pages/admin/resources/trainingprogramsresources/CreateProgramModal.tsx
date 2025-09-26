import React, { useState, useEffect } from "react";
import {
  X,
  Upload,
  BookOpen,
  CheckCircle,
  Calendar,
  FileText,
  Eye,
} from "lucide-react";

// Import step components
import BasicInfoStep from "./BasicInfoStep";
import ScheduleLogisticsStep from "./ScheduleLogisticsStep";
import ContentRequirementsStep from "./ContentRequirementsStep";
import ReviewStep from "./ReviewStep";
import AlertModal from "../../../../components/common/AlertModal";

// Import API and types
import {
  TrainingProgram,
  CreateTrainingProgramInput,
} from "../../../../services/trainingProgramsApi";

// Types
type ProgramStatus = "Published" | "Draft" | "Archived";
type ProgramType =
  | "Conference"
  | "Workshop"
  | "Fellowship"
  | "Online Course"
  | "Masterclass";
type ProgramFormat = "In-person" | "Virtual" | "Hybrid";

interface CreateProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (programData: CreateTrainingProgramInput) => void;
  editingProgram?: TrainingProgram;
}

interface FormData {
  title: string;
  description: string;
  type: ProgramType;
  category: string;
  status: ProgramStatus;
  isFeatured: boolean;
  duration: string;
  format: ProgramFormat;
  location: string;
  maxParticipants: string;
  instructor: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  price: string;
  currency: string;
  imageFile: File | null;
  imageUrl: string;
  prerequisites: string[];
  learningOutcomes: string[];
  certificationType: string;
  cmeCredits: string;
  schedule: ScheduleItem[];
  speakers: Speaker[];
  topics: string[];
  targetAudience: string[];
  language: string;
  timezone: string;
  materials: string[];
  assessmentMethod: string;
  passingScore: string;
}

interface ScheduleItem {
  day: string;
  time: string;
  activity: string;
  speaker: string;
}

interface Speaker {
  name: string;
  title: string;
  organization: string;
  bio: string;
}

interface FormErrors {
  [key: string]: string;
}

const CreateProgramModal: React.FC<CreateProgramModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingProgram,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    type: "Conference",
    category: "",
    status: "Draft",
    isFeatured: false,
    duration: "",
    format: "In-person",
    location: "",
    maxParticipants: "",
    instructor: "",
    startDate: "",
    endDate: "",
    registrationDeadline: "",
    price: "",
    currency: "USD",
    imageFile: null,
    imageUrl: "",
    prerequisites: [""],
    learningOutcomes: [""],
    certificationType: "CME Certificate",
    cmeCredits: "",
    schedule: [],
    speakers: [],
    topics: [""],
    targetAudience: ["Healthcare Providers"],
    language: "English",
    timezone: "GMT",
    materials: [""],
    assessmentMethod: "None",
    passingScore: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type?: "success" | "error" | "warning" | "info";
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const steps = [
    { number: 1, title: "Basic Info", icon: BookOpen },
    { number: 2, title: "Schedule", icon: Calendar },
    { number: 3, title: "Content", icon: FileText },
    { number: 4, title: "Review", icon: Eye },
  ];

  // Initialize form when editing
  useEffect(() => {
    if (editingProgram) {
      setFormData({
        title: editingProgram.title || "",
        description: editingProgram.description || "",
        type: editingProgram.type || "Conference",
        category: editingProgram.category || "",
        status: editingProgram.status || "Draft",
        isFeatured: editingProgram.isFeatured || false,
        duration: editingProgram.duration || "",
        format: editingProgram.format || "In-person",
        location: editingProgram.location || "",
        maxParticipants: editingProgram.maxParticipants?.toString() || "",
        instructor: editingProgram.instructor || "",
        startDate: editingProgram.startDate || "",
        endDate: editingProgram.endDate || "",
        registrationDeadline: editingProgram.registrationDeadline || "",
        price: editingProgram.price?.toString() || "",
        currency: editingProgram.currency || "USD",
        imageFile: null,
        imageUrl: editingProgram.imageUrl || "",
        prerequisites:
          editingProgram.prerequisites &&
          editingProgram.prerequisites.length > 0
            ? editingProgram.prerequisites
            : [""],
        learningOutcomes:
          editingProgram.learningOutcomes &&
          editingProgram.learningOutcomes.length > 0
            ? editingProgram.learningOutcomes
            : [""],
        certificationType:
          editingProgram.certificationType || "CME Certificate",
        cmeCredits: editingProgram.cmeCredits?.toString() || "",
        schedule:
          editingProgram.schedule && editingProgram.schedule.length > 0
            ? editingProgram.schedule
            : [],
        speakers:
          editingProgram.speakers && editingProgram.speakers.length > 0
            ? editingProgram.speakers
            : [],
        topics:
          editingProgram.topics && editingProgram.topics.length > 0
            ? editingProgram.topics
            : [""],
        targetAudience:
          editingProgram.targetAudience &&
          editingProgram.targetAudience.length > 0
            ? editingProgram.targetAudience
            : ["Healthcare Providers"],
        language: editingProgram.language || "English",
        timezone: editingProgram.timezone || "GMT",
        materials:
          editingProgram.materials && editingProgram.materials.length > 0
            ? editingProgram.materials
            : [""],
        assessmentMethod: editingProgram.assessmentMethod || "None",
        passingScore: editingProgram.passingScore?.toString() || "",
      });
    } else {
      // Reset form for new program
      setFormData({
        title: "",
        description: "",
        type: "Conference",
        category: "",
        status: "Draft",
        isFeatured: false,
        duration: "",
        format: "In-person",
        location: "",
        maxParticipants: "",
        instructor: "",
        startDate: "",
        endDate: "",
        registrationDeadline: "",
        price: "",
        currency: "USD",
        imageFile: null,
        imageUrl: "",
        prerequisites: [""],
        learningOutcomes: [""],
        certificationType: "CME Certificate",
        cmeCredits: "",
        schedule: [],
        speakers: [],
        topics: [""],
        targetAudience: ["Healthcare Providers"],
        language: "English",
        timezone: "GMT",
        materials: [""],
        assessmentMethod: "None",
        passingScore: "",
      });
    }

    setCurrentStep(1);
    setErrors({});
    setShowPreview(false);
    setUploadProgress(0);
  }, [editingProgram, isOpen]);

  if (!isOpen) return null;

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = "Program title is required";
      if (!formData.description.trim())
        newErrors.description = "Description is required";
      if (!formData.category) newErrors.category = "Category is required";
      if (!formData.instructor.trim())
        newErrors.instructor = "Instructor is required";
      if (!formData.duration.trim())
        newErrors.duration = "Duration is required";
      if (!formData.location.trim())
        newErrors.location = "Location is required";
      if (!formData.maxParticipants.trim())
        newErrors.maxParticipants = "Maximum participants is required";
      if (!formData.price.trim()) newErrors.price = "Price is required";
    }

    if (step === 2) {
      if (!formData.startDate) newErrors.startDate = "Start date is required";
      if (!formData.endDate) newErrors.endDate = "End date is required";
      if (!formData.registrationDeadline)
        newErrors.registrationDeadline = "Registration deadline is required";
      if (
        formData.startDate &&
        formData.endDate &&
        new Date(formData.startDate) > new Date(formData.endDate)
      ) {
        newErrors.endDate = "End date must be after start date";
      }
      if (
        formData.registrationDeadline &&
        formData.startDate &&
        new Date(formData.registrationDeadline) > new Date(formData.startDate)
      ) {
        newErrors.registrationDeadline =
          "Registration deadline must be before start date";
      }
    }

    if (step === 3) {
      if (formData.prerequisites.filter((p) => p.trim()).length === 0) {
        newErrors.prerequisites = "At least one prerequisite is required";
      }
      if (formData.learningOutcomes.filter((o) => o.trim()).length === 0) {
        newErrors.learningOutcomes =
          "At least one learning outcome is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleArrayChange = (field: string, index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field as keyof FormData] as string[]).map((item, i) =>
        i === index ? value : item
      ),
    }));
  };

  const handleScheduleChange = (
    index: number,
    field: keyof ScheduleItem,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      schedule: prev.schedule.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleSpeakerChange = (
    index: number,
    field: keyof Speaker,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      speakers: prev.speakers.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        setErrors({
          ...errors,
          coverImage: "Please select a valid image file (JPEG, PNG, GIF, WEBP)",
        });
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setErrors({ ...errors, coverImage: "Image must be less than 10MB" });
        return;
      }

      handleInputChange("imageFile", file);
      handleInputChange("imageUrl", "");
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const showAlert = (
    title: string,
    message: string,
    type: "success" | "error" | "warning" | "info" = "info"
  ) => {
    setAlertModal({ isOpen: true, title, message, type });
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    // Prevent double submission
    if (isSubmitting) return;

    setIsSubmitting(true);
    setUploadProgress(10);

    try {
      // Prepare data for API
      const submissionData: CreateTrainingProgramInput = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        category: formData.category,
        status: formData.status,
        isFeatured: formData.isFeatured,
        duration: formData.duration,
        format: formData.format,
        location: formData.location,
        maxParticipants: parseInt(formData.maxParticipants) || 0,
        instructor: formData.instructor,
        startDate: formData.startDate,
        endDate: formData.endDate,
        registrationDeadline: formData.registrationDeadline,
        price: parseFloat(formData.price) || 0,
        currency: formData.currency,
        prerequisites: formData.prerequisites.filter((p) => p.trim()),
        learningOutcomes: formData.learningOutcomes.filter((o) => o.trim()),
        certificationType: formData.certificationType,
        cmeCredits: parseInt(formData.cmeCredits) || 0,
        imageFile: formData.imageFile,
        schedule: formData.schedule.filter(
          (s) => s.activity.trim() && s.time.trim()
        ),
        speakers: formData.speakers.filter(
          (s) => s.name.trim() && s.bio.trim()
        ),
        topics: formData.topics.filter((t) => t.trim()),
        targetAudience: formData.targetAudience,
        language: formData.language,
        timezone: formData.timezone,
        materials: formData.materials.filter((m) => m.trim()),
        assessmentMethod: formData.assessmentMethod,
        passingScore: formData.passingScore
          ? parseInt(formData.passingScore)
          : undefined,
      };

      setUploadProgress(50);

      setUploadProgress(100);

      // Call the parent's onSubmit callback with the submission data
      // The parent component will handle the actual API call and modal closing
      onSubmit(submissionData);
    } catch (error) {
      console.error("Error preparing program data:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      showAlert(
        "Error",
        `Failed to prepare program data: ${errorMessage}`,
        "error"
      );
      setUploadProgress(0);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold ${
              currentStep >= step.number
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {currentStep > step.number ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <step.icon className="w-5 h-5" />
            )}
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-12 h-1 mx-2 ${
                currentStep > step.number ? "bg-indigo-600" : "bg-gray-200"
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep
            formData={formData}
            errors={errors}
            onInputChange={handleInputChange}
            onScheduleChange={handleScheduleChange}
            onSpeakerChange={handleSpeakerChange}
          />
        );
      case 2:
        return (
          <ScheduleLogisticsStep
            formData={formData}
            errors={errors}
            onInputChange={handleInputChange}
            onScheduleChange={handleScheduleChange}
            onSpeakerChange={handleSpeakerChange}
          />
        );
      case 3:
        return (
          <ContentRequirementsStep
            formData={formData}
            errors={errors}
            onInputChange={handleInputChange}
            onArrayChange={handleArrayChange}
            onImageUpload={handleImageUpload}
          />
        );
      case 4:
        return (
          <ReviewStep
            formData={formData}
            errors={errors}
            showPreview={showPreview}
            isSubmitting={isSubmitting}
            uploadProgress={uploadProgress}
            onTogglePreview={() => setShowPreview(!showPreview)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-200 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-indigo-900 flex items-center">
              <BookOpen className="w-6 h-6 mr-3" />
              {editingProgram
                ? "Edit Training Program"
                : "Create Training Program"}
            </h2>
            <button
              onClick={onClose}
              className="text-indigo-700 hover:text-indigo-900 p-1 rounded-lg hover:bg-indigo-100"
              disabled={isSubmitting}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Step Indicator */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            {renderStepIndicator()}
            <div className="text-center text-sm text-gray-600">
              Step {currentStep} of 4:{" "}
              {currentStep === 1
                ? "Basic Information"
                : currentStep === 2
                ? "Schedule & Logistics"
                : currentStep === 3
                ? "Content & Requirements"
                : "Review & Publish"}
            </div>
          </div>

          {/* Form Content */}
          <div className="px-6 py-6 overflow-y-auto max-h-[calc(95vh-200px)]">
            {renderCurrentStep()}
          </div>

          {/* Footer Navigation */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={isSubmitting}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium disabled:opacity-50"
                >
                  Previous
                </button>
              )}
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium disabled:opacity-50"
              >
                Cancel
              </button>

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSubmit();
                  }}
                  disabled={isSubmitting}
                  className={`px-8 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center ${
                    isSubmitting ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      {editingProgram ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      {editingProgram ? "Update Program" : "Create Program"}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </>
  );
};

export default CreateProgramModal;
