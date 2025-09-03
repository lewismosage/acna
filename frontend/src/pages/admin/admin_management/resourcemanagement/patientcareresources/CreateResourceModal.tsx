import React, { useState, useEffect } from "react";
import {
  X,
  Upload,
  FileText,
  Play,
  Headphones,
  Globe,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Tag,
  Languages,
  Users,
  Target,
  Clock,
  Star,
  Eye,
  EyeOff,
  Link,
  Image as ImageIcon,
} from "lucide-react";
import { patientCareApi } from "../../../../../services/patientCareApi";

import {
  PatientResource,
  ResourceAnalytics,
  ResourceType,
  ResourceStatus,
} from "./patientCare";

interface CreatePatientCareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (resource: PatientResource & { imageFile?: File | null }) => void;
  editingResource?: PatientResource;
}

interface FormData {
  title: string;
  description: string;
  full_description: string;
  category: string;
  type: ResourceType;
  condition: string;
  languages: string[];
  status: ResourceStatus;
  isFeatured: boolean;
  isFree: boolean;
  imageFile: File | null;
  fileUrl: string;
  externalUrl: string;
  tags: string[];
  targetAudience: string[];
  ageGroup: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  author: string;
  reviewedBy: string;
}

interface FormErrors {
  [key: string]: string;
}

const CreatePatientCareModal: React.FC<CreatePatientCareModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingResource,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    full_description: "",
    category: "",
    type: "Guide",
    condition: "",
    languages: ["English"],
    status: "Draft",
    isFeatured: false,
    isFree: true,
    imageFile: null,
    fileUrl: "",
    externalUrl: "",
    tags: [],
    targetAudience: ["Parents"],
    ageGroup: "",
    difficulty: "Beginner",
    duration: "",
    author: "",
    reviewedBy: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // Form field options
  const categories = [
    "Educational Guides",
    "Therapy & Exercise",
    "Assessment Tools",
    "Emergency Care",
    "Nutrition & Diet",
    "Education Support",
    "Medication Management",
    "Inspiration & Stories",
  ];

  const resourceTypes: ResourceType[] = [
    "Guide",
    "Video",
    "Audio",
    "Checklist",
    "App",
    "Website",
    "Infographic",
    "Handbook",
  ];

  const conditions = [
    "Epilepsy",
    "Cerebral Palsy",
    "Developmental Delays",
    "Autism Spectrum Disorders",
    "All Conditions",
    "Rare Conditions",
  ];

  const languages = [
    "English",
    "French",
    "Swahili",
    "Hausa",
    "Arabic",
    "Portuguese",
    "Amharic",
    "Yoruba",
  ];

  const audienceOptions = [
    "Parents",
    "Caregivers",
    "Healthcare Providers",
    "Teachers",
    "Therapists",
    "Family Members",
  ];

  const ageGroups = [
    "0-2 years",
    "2-5 years",
    "5-12 years",
    "12-18 years",
    "0-18 years",
    "All Ages",
  ];

  // Initialize form data when editing
  useEffect(() => {
    if (editingResource) {
      setFormData({
        title: editingResource.title || "",
        description: editingResource.description || "",
        full_description: editingResource.full_description || "",
        category: editingResource.category || "",
        type: editingResource.type || "Guide",
        condition: editingResource.condition || "",
        languages: editingResource.language || ["English"],
        status: editingResource.status || "Draft",
        isFeatured: editingResource.isFeatured || false,
        isFree: editingResource.isFree || true,
        imageFile: null,
        fileUrl: editingResource.fileUrl || "",
        externalUrl: editingResource.externalUrl || "",
        tags: editingResource.tags || [],
        targetAudience: editingResource.targetAudience || ["Parents"],
        ageGroup: editingResource.ageGroup || "",
        difficulty: editingResource.difficulty || "Beginner",
        duration: editingResource.duration || "",
        author: editingResource.author || "",
        reviewedBy: editingResource.reviewedBy || "",
      });
    } else {
      // Reset form for new resource
      setFormData({
        title: "",
        description: "",
        full_description: "",
        category: "",
        type: "Guide",
        condition: "",
        languages: ["English"],
        status: "Draft",
        isFeatured: false,
        isFree: true,
        imageFile: null,
        fileUrl: "",
        externalUrl: "",
        tags: [],
        targetAudience: ["Parents"],
        ageGroup: "",
        difficulty: "Beginner",
        duration: "",
        author: "",
        reviewedBy: "",
      });
    }
    setCurrentStep(1);
    setErrors({});
    setShowPreview(false);
  }, [editingResource, isOpen]);

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = "Title is required";
      if (!formData.description.trim())
        newErrors.description = "Description is required";
      if (!formData.category) newErrors.category = "Category is required";
      if (!formData.condition) newErrors.condition = "Condition is required";
    } else if (step === 2) {
      if (!formData.ageGroup) newErrors.ageGroup = "Age group is required";
      if (!formData.author.trim()) newErrors.author = "Author is required";
      if (formData.languages.length === 0)
        newErrors.languages = "At least one language is required";
      if (formData.targetAudience.length === 0)
        newErrors.targetAudience = "At least one target audience is required";
    } else if (step === 3) {
      if (formData.type === "Video" || formData.type === "Audio") {
        if (!formData.duration.trim())
          newErrors.duration = "Duration is required for video/audio resources";
      }
      if (
        (formData.type === "App" || formData.type === "Website") &&
        !formData.externalUrl.trim()
      ) {
        newErrors.externalUrl =
          "External URL is required for apps and websites";
      }
      if (
        (formData.type === "Guide" ||
          formData.type === "Checklist" ||
          formData.type === "Handbook") &&
        !formData.fileUrl.trim()
      ) {
        newErrors.fileUrl = "File URL is required for downloadable resources";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        setErrors({
          ...errors,
          imageFile: "Please select a valid image file (JPEG, PNG, GIF, WEBP)",
        });
        return;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setErrors({ ...errors, imageFile: "Image must be less than 10MB" });
        return;
      }

      handleInputChange("imageFile", file);
    }
  };

  const handleArrayToggle = (
    field: "languages" | "targetAudience",
    value: string
  ) => {
    const currentArray = formData[field] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value];

    handleInputChange(field, newArray);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      handleInputChange("tags", [...formData.tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    handleInputChange(
      "tags",
      formData.tags.filter((tag) => tag !== tagToRemove)
    );
  };

  const getTypeIcon = (type: ResourceType) => {
    switch (type) {
      case "Guide":
        return <FileText className="w-4 h-4" />;
      case "Video":
        return <Play className="w-4 h-4" />;
      case "Audio":
        return <Headphones className="w-4 h-4" />;
      case "App":
        return <Globe className="w-4 h-4" />;
      case "Website":
        return <ExternalLink className="w-4 h-4" />;
      case "Checklist":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setIsSubmitting(true);

    try {
      // First upload image if there's a new one
      let imageUrl = editingResource?.imageUrl || "";

      if (formData.imageFile) {
        try {
          const uploadResponse = await patientCareApi.uploadImage(
            formData.imageFile
          );
          imageUrl = uploadResponse.url;
        } catch (error) {
          console.error("Error uploading image:", error);
          setErrors({
            ...errors,
            imageFile: "Failed to upload image. Please try again.",
          });
          setIsSubmitting(false);
          return;
        }
      }

      const resourceData: PatientResource = {
        id: editingResource?.id || Date.now(),
        ...formData,
        imageUrl,
        language: formData.languages,
        downloadCount: editingResource?.downloadCount || 0,
        viewCount: editingResource?.viewCount || 0,
        rating: editingResource?.rating,
        createdAt:
          editingResource?.createdAt || new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
        lastReviewDate: formData.reviewedBy
          ? new Date().toISOString().split("T")[0]
          : undefined,
      };

      await onSubmit(resourceData);
      onClose();
    } catch (error) {
      console.error("Error saving resource:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((step) => (
        <React.Fragment key={step}>
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
              currentStep >= step
                ? "bg-orange-600 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {step}
          </div>
          {step < 4 && (
            <div
              className={`w-12 h-1 mx-2 ${
                currentStep > step ? "bg-orange-600" : "bg-gray-200"
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">
        Basic Information
      </h3>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Resource Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleInputChange("title", e.target.value)}
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
            errors.title ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Enter a clear, descriptive title"
          maxLength={150}
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title}</p>
        )}
        <p className="text-gray-500 text-sm mt-1">
          {formData.title.length}/150 characters
        </p>
      </div>

      {/* Resource Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Resource Type *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {resourceTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => handleInputChange("type", type)}
              className={`p-3 border rounded-lg flex flex-col items-center gap-2 transition-colors ${
                formData.type === type
                  ? "border-orange-500 bg-orange-50 text-orange-700"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              {getTypeIcon(type)}
              <span className="text-sm font-medium">{type}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Category and Condition */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            value={formData.category}
            onChange={(e) => handleInputChange("category", e.target.value)}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
              errors.category ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-red-500 text-sm mt-1">{errors.category}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Condition *
          </label>
          <select
            value={formData.condition}
            onChange={(e) => handleInputChange("condition", e.target.value)}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
              errors.condition ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select a condition</option>
            {conditions.map((condition) => (
              <option key={condition} value={condition}>
                {condition}
              </option>
            ))}
          </select>
          {errors.condition && (
            <p className="text-red-500 text-sm mt-1">{errors.condition}</p>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Short Description *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
            errors.description ? "border-red-500" : "border-gray-300"
          }`}
          rows={3}
          placeholder="Brief description for listing pages (2-3 sentences)"
          maxLength={300}
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description}</p>
        )}
        <p className="text-gray-500 text-sm mt-1">
          {formData.description.length}/300 characters
        </p>
      </div>

      {/* Full Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Detailed Description
        </label>
        <textarea
          value={formData.full_description}
          onChange={(e) =>
            handleInputChange("full_description", e.target.value)
          }
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          rows={6}
          placeholder="Detailed description with sections, bullet points, and comprehensive information"
          maxLength={2000}
        />
        <p className="text-gray-500 text-sm mt-1">
          {formData.full_description.length}/2000 characters
        </p>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">
        Audience & Metadata
      </h3>

      {/* Age Group and Difficulty */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Age Group *
          </label>
          <select
            value={formData.ageGroup}
            onChange={(e) => handleInputChange("ageGroup", e.target.value)}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
              errors.ageGroup ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select age group</option>
            {ageGroups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
          {errors.ageGroup && (
            <p className="text-red-500 text-sm mt-1">{errors.ageGroup}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty Level
          </label>
          <select
            value={formData.difficulty}
            onChange={(e) =>
              handleInputChange(
                "difficulty",
                e.target.value as "Beginner" | "Intermediate" | "Advanced"
              )
            }
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Languages */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Available Languages *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {languages.map((lang) => (
            <label
              key={lang}
              className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={formData.languages.includes(lang)}
                onChange={() => handleArrayToggle("languages", lang)}
                className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm">{lang}</span>
            </label>
          ))}
        </div>
        {errors.language && (
          <p className="text-red-500 text-sm mt-1">{errors.language}</p>
        )}
      </div>

      {/* Target Audience */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Target Audience *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {audienceOptions.map((audience) => (
            <label
              key={audience}
              className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={formData.targetAudience.includes(audience)}
                onChange={() => handleArrayToggle("targetAudience", audience)}
                className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm">{audience}</span>
            </label>
          ))}
        </div>
        {errors.targetAudience && (
          <p className="text-red-500 text-sm mt-1">{errors.targetAudience}</p>
        )}
      </div>

      {/* Author and Reviewer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Author *
          </label>
          <input
            type="text"
            value={formData.author}
            onChange={(e) => handleInputChange("author", e.target.value)}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
              errors.author ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Dr. John Smith"
          />
          {errors.author && (
            <p className="text-red-500 text-sm mt-1">{errors.author}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reviewed By
          </label>
          <input
            type="text"
            value={formData.reviewedBy}
            onChange={(e) => handleInputChange("reviewedBy", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="ACNA Medical Board"
          />
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {formData.tags.map((tag, index) => (
            <span
              key={index}
              className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm flex items-center"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-2 text-orange-600 hover:text-orange-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) =>
              e.key === "Enter" && (e.preventDefault(), handleAddTag())
            }
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Add a tag"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            <Tag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Files & Links</h3>

      {/* Image URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cover Image *
        </label>
        <div className="flex items-center gap-4">
          <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-500 transition-colors">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-600 text-center px-2">
              {formData.imageFile ? "Change Image" : "Upload Image"}
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>

          {formData.imageFile && (
            <div className="flex flex-col items-center">
              <img
                src={URL.createObjectURL(formData.imageFile)}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-lg border border-gray-200"
              />
              <p className="text-xs text-gray-600 mt-2">
                {formData.imageFile.name}
              </p>
            </div>
          )}

          {editingResource?.imageUrl && !formData.imageFile && (
            <div className="flex flex-col items-center">
              <img
                src={editingResource.imageUrl}
                alt="Current"
                className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
              <p className="text-xs text-gray-600 mt-2">Current Image</p>
            </div>
          )}
        </div>
        {errors.imageFile && (
          <p className="text-red-500 text-sm mt-1">{errors.imageFile}</p>
        )}
        <p className="text-gray-500 text-sm mt-1">
          JPEG, PNG, GIF, or WEBP. Max 10MB.
        </p>
      </div>

      {/* Duration (for video/audio) */}
      {(formData.type === "Video" || formData.type === "Audio") && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration *
          </label>
          <input
            type="text"
            value={formData.duration}
            onChange={(e) => handleInputChange("duration", e.target.value)}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
              errors.duration ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="e.g., 15 min, 45 min series, 2 hours"
          />
          {errors.duration && (
            <p className="text-red-500 text-sm mt-1">{errors.duration}</p>
          )}
        </div>
      )}

      {/* File URL (for downloadable resources) */}
      {(formData.type === "Guide" ||
        formData.type === "Checklist" ||
        formData.type === "Handbook" ||
        formData.type === "Audio") && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            File URL{" "}
            {(formData.type === "Guide" ||
              formData.type === "Checklist" ||
              formData.type === "Handbook") &&
              "*"}
          </label>
          <div className="flex gap-3">
            <input
              type="url"
              value={formData.fileUrl}
              onChange={(e) => handleInputChange("fileUrl", e.target.value)}
              className={`flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                errors.fileUrl ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="https://example.com/file.pdf"
            />
            <button
              type="button"
              className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Upload className="w-4 h-4" />
            </button>
          </div>
          {errors.fileUrl && (
            <p className="text-red-500 text-sm mt-1">{errors.fileUrl}</p>
          )}
        </div>
      )}

      {/* External URL (for apps/websites) */}
      {(formData.type === "App" ||
        formData.type === "Website" ||
        formData.type === "Video") && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            External URL{" "}
            {(formData.type === "App" || formData.type === "Website") && "*"}
          </label>
          <input
            type="url"
            value={formData.externalUrl}
            onChange={(e) => handleInputChange("externalUrl", e.target.value)}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
              errors.externalUrl ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="https://example.com"
          />
          {errors.externalUrl && (
            <p className="text-red-500 text-sm mt-1">{errors.externalUrl}</p>
          )}
        </div>
      )}

      {/* Resource Settings */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <h4 className="font-medium text-gray-900">Resource Settings</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center p-3 border rounded-lg bg-white cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isFree}
              onChange={(e) => handleInputChange("isFree", e.target.checked)}
              className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
            />
            <span className="ml-2 text-sm font-medium">Free Resource</span>
          </label>

          <label className="flex items-center p-3 border rounded-lg bg-white cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isFeatured}
              onChange={(e) =>
                handleInputChange("isFeatured", e.target.checked)
              }
              className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
            />
            <div className="ml-2">
              <span className="text-sm font-medium flex items-center">
                <Star className="w-4 h-4 mr-1 text-yellow-500" />
                Featured Resource
              </span>
            </div>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Publication Status
          </label>
          <select
            value={formData.status}
            onChange={(e) =>
              handleInputChange("status", e.target.value as ResourceStatus)
            }
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="Draft">Draft</option>
            <option value="Under Review">Under Review</option>
            <option value="Published">Published</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Review & Publish</h3>

      {/* Preview Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <span className="font-medium text-gray-900">Preview Resource</span>
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
        >
          {showPreview ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
          {showPreview ? "Hide Preview" : "Show Preview"}
        </button>
      </div>

      {showPreview && (
        <div className="border border-gray-200 rounded-lg p-6 bg-white">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Preview Image */}
            <div className="lg:w-1/3">
              <div className="relative">
                {formData.imageFile ? (
                  <img
                    src={URL.createObjectURL(formData.imageFile)}
                    alt={formData.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ) : editingResource?.imageUrl ? (
                  <img
                    src={editingResource.imageUrl}
                    alt={formData.title}
                    className="w-full h-48 object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/api/placeholder/300/200";
                    }}
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className="bg-orange-600 text-white px-2 py-1 text-xs font-bold uppercase tracking-wide rounded flex items-center gap-1">
                    {getTypeIcon(formData.type)}
                    {formData.type}
                  </span>
                </div>
                {formData.isFree && (
                  <div className="absolute top-3 right-3">
                    <span className="bg-green-600 text-white px-2 py-1 text-xs font-bold rounded">
                      FREE
                    </span>
                  </div>
                )}
                {formData.isFeatured && (
                  <div className="absolute bottom-3 right-3">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  </div>
                )}
              </div>
            </div>

            {/* Preview Content */}
            <div className="lg:w-2/3">
              <h4 className="text-xl font-bold text-gray-900 mb-2">
                {formData.title}
              </h4>
              <div className="flex items-center text-gray-600 text-sm mb-3">
                <span>{formData.category}</span>
                <span className="mx-2">•</span>
                <span>{formData.condition}</span>
              </div>

              <p className="text-gray-600 text-sm mb-4">
                {formData.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {formData.languages.map((lang, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-600 px-2 py-1 text-xs rounded"
                  >
                    {lang}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Age Group:</span>{" "}
                  {formData.ageGroup}
                </div>
                <div>
                  <span className="font-medium">Difficulty:</span>{" "}
                  {formData.difficulty}
                </div>
                <div>
                  <span className="font-medium">Author:</span> {formData.author}
                </div>
                <div>
                  <span className="font-medium">Status:</span> {formData.status}
                </div>
              </div>

              {formData.tags.length > 0 && (
                <div className="mt-4">
                  <span className="font-medium text-gray-700 text-sm">
                    Tags:{" "}
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-orange-100 text-orange-800 px-2 py-1 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-medium text-blue-900 mb-3 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          Resource Summary
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-blue-800">Title:</span>
            <p className="text-blue-700">{formData.title}</p>
          </div>
          <div>
            <span className="font-medium text-blue-800">Type:</span>
            <p className="text-blue-700">{formData.type}</p>
          </div>
          <div>
            <span className="font-medium text-blue-800">Category:</span>
            <p className="text-blue-700">{formData.category}</p>
          </div>
          <div>
            <span className="font-medium text-blue-800">Condition:</span>
            <p className="text-blue-700">{formData.condition}</p>
          </div>
          <div>
            <span className="font-medium text-blue-800">Languages:</span>
            <p className="text-blue-700">{formData.languages.join(", ")}</p>
          </div>
          <div>
            <span className="font-medium text-blue-800">Target Audience:</span>
            <p className="text-blue-700">
              {formData.targetAudience.join(", ")}
            </p>
          </div>
          <div>
            <span className="font-medium text-blue-800">Age Group:</span>
            <p className="text-blue-700">{formData.ageGroup}</p>
          </div>
          <div>
            <span className="font-medium text-blue-800">Status:</span>
            <p className="text-blue-700">{formData.status}</p>
          </div>
        </div>
      </div>

      {/* Validation Warnings */}
      {(!formData.imageFile || !formData.full_description) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800 mb-2">
                Optional fields missing
              </h4>
              <ul className="text-yellow-700 text-sm space-y-1">
                {!formData.imageFile && (
                  <li>• Cover image URL - will use placeholder image</li>
                )}
                {!formData.full_description && (
                  <li>
                    • Detailed description - only short description will be
                    shown
                  </li>
                )}
              </ul>
              <p className="text-yellow-700 text-sm mt-2">
                You can add these later by editing the resource.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[99vh] overflow-hidden">
        {/* Header */}
        <div className="bg-orange-50 px-6 py-4 border-b border-orange-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-orange-900 flex items-center">
            <FileText className="w-6 h-6 mr-3" />
            {editingResource
              ? "Edit Patient Care Resource"
              : "Create Patient Care Resource"}
          </h2>
          <button
            onClick={onClose}
            className="text-orange-700 hover:text-orange-900 p-1 rounded-lg hover:bg-orange-100"
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
              ? "Audience & Metadata"
              : currentStep === 3
              ? "Files & Links"
              : "Review & Publish"}
          </div>
        </div>

        {/* Form Content */}
        <div className="px-6 py-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>

        {/* Footer Navigation */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevious}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium"
              >
                Previous
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium"
            >
              Cancel
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
              >
                Next Step
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-8 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium flex items-center ${
                  isSubmitting ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    {editingResource ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {editingResource ? "Update Resource" : "Create Resource"}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePatientCareModal;
