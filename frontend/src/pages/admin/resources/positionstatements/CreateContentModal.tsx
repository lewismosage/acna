import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Save,
  Plus,
  Minus,
  FileText,
  Globe,
  Hash,
  AlertCircle,
  Target,
  MapPin,
  Tag,
  BookOpen,
  BarChart3,
  Upload,
  Trash2,
} from "lucide-react";

// Hardcoded arrays for frontend - moved to top
const defaultCategories = [
  "Epilepsy & Seizures",
  "Early Detection & Prevention",
  "Healthcare Access",
  "Nutrition & Development",
  "Social Inclusion & Rights",
  "Emergency & Crisis Response",
  "Technology & Innovation",
  "Mental Health",
  "Education & Inclusion"
];

const defaultRegions = [
  "North Africa",
  "East Africa",
  "West Africa",
  "Central Africa",
  "Southern Africa",
  "All Regions"
];

const defaultCountries = [
  "Nigeria", "Ethiopia", "Egypt", "DR Congo", "Tanzania",
  "South Africa", "Kenya", "Uganda", "Algeria", "Sudan",
  "Morocco", "Angola", "Mozambique", "Ghana", "Madagascar",
  "Cameroon", "Côte d'Ivoire", "Niger", "Burkina Faso", "Mali",
  "Malawi", "Zambia", "Senegal", "Chad", "Somalia",
  "Zimbabwe", "Guinea", "Rwanda", "Benin", "Burundi",
  "Tunisia", "South Sudan", "Togo", "Sierra Leone", "Libya",
  "Congo", "Liberia", "Central African Republic", "Mauritania", "Eritrea",
  "Namibia", "Gambia", "Botswana", "Gabon", "Lesotho",
  "Guinea-Bissau", "Equatorial Guinea", "Mauritius", "Eswatini", "Djibouti",
  "Comoros", "Cabo Verde", "Sao Tome & Principe", "Seychelles"
];

const targetAudienceOptionsList = [
  "Policy Makers", "Health Ministers", "WHO Regional Offices", "Pharmaceutical Companies",
  "Pediatricians", "Midwives", "Health System Administrators", "UNICEF", "NGOs",
  "International Donors", "Nutrition Program Directors", "Public Health Officials",
  "Food Security Organizations", "Education Ministers", "School Administrators",
  "Teachers Associations", "Parent Groups", "Rehabilitation Specialists",
  "Community Health Workers", "Disability Organizations", "Health Technology Officers",
  "Hospital Administrators", "Innovation Hubs", "Medical Schools"
];

interface BaseContentItem {
  id?: number;
  title: string;
  category: string;
  summary: string;
  status: "Published" | "Draft" | "Archived";
  tags: string[];
  imageUrl: string;
  imageFile?: File;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  downloadCount: number;
}

interface PolicyBelief extends BaseContentItem {
  type: "PolicyBelief";
  priority: "High" | "Medium" | "Low";
  targetAudience: string[];
  keyRecommendations: string[];
  region: string[];
}

interface PositionalStatement extends BaseContentItem {
  type: "PositionalStatement";
  keyPoints: string[];
  pageCount: number;
  countryFocus: string[];
  relatedPolicies: string[];
}

type ContentItem = PolicyBelief | PositionalStatement;

interface CreateContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<ContentItem, "id"> & { imageFile?: File }) => Promise<void>;
  editingItem?: ContentItem;
  contentType: "PolicyBelief" | "PositionalStatement";
}

const CreateContentModal: React.FC<CreateContentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
  contentType,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    summary: "",
    status: "Draft" as "Published" | "Draft" | "Archived",
    imageUrl: "",
  });

  const [policySpecificData, setPolicySpecificData] = useState({
    priority: "Medium" as "High" | "Medium" | "Low",
    targetAudience: [""],
    keyRecommendations: [""],
    region: [""],
  });

  const [statementSpecificData, setStatementSpecificData] = useState({
    keyPoints: [""],
    pageCount: 0,
    countryFocus: [""],
    relatedPolicies: [""],
  });

  const [tags, setTags] = useState<string[]>([""]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use hardcoded arrays directly
  const categories = defaultCategories;
  const regions = defaultRegions;
  const countries = defaultCountries;
  const targetAudienceOptions = targetAudienceOptionsList;

  // Load editing data when modal opens
  useEffect(() => {
    if (isOpen && editingItem) {
      setFormData({
        title: editingItem.title,
        category: editingItem.category,
        summary: editingItem.summary,
        status: editingItem.status,
        imageUrl: editingItem.imageUrl,
      });

      setTags(editingItem.tags.length > 0 ? editingItem.tags : [""]);
      setImagePreview(editingItem.imageUrl || null);

      if (editingItem.type === "PolicyBelief") {
        setPolicySpecificData({
          priority: editingItem.priority,
          targetAudience: editingItem.targetAudience.length > 0 ? editingItem.targetAudience : [""],
          keyRecommendations: editingItem.keyRecommendations.length > 0 ? editingItem.keyRecommendations : [""],
          region: editingItem.region.length > 0 ? editingItem.region : [""],
        });
      } else {
        setStatementSpecificData({
          keyPoints: editingItem.keyPoints.length > 0 ? editingItem.keyPoints : [""],
          pageCount: editingItem.pageCount,
          countryFocus: editingItem.countryFocus.length > 0 ? editingItem.countryFocus : [""],
          relatedPolicies: editingItem.relatedPolicies.length > 0 ? editingItem.relatedPolicies : [""],
        });
      }
    } else if (isOpen && !editingItem) {
      // Reset form for new item
      setFormData({
        title: "",
        category: "",
        summary: "",
        status: "Draft",
        imageUrl: "",
      });

      setPolicySpecificData({
        priority: "Medium",
        targetAudience: [""],
        keyRecommendations: [""],
        region: [""],
      });

      setStatementSpecificData({
        keyPoints: [""],
        pageCount: 0,
        countryFocus: [""],
        relatedPolicies: [""],
      });

      setTags([""]);
      setImagePreview(null);
      setImageFile(null);
      setErrors({});
    }
  }, [isOpen, editingItem, contentType]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handlePolicyDataChange = (field: keyof typeof policySpecificData, value: any) => {
    setPolicySpecificData(prev => ({ ...prev, [field]: value }));
  };

  const handleStatementDataChange = (field: keyof typeof statementSpecificData, value: any) => {
    setStatementSpecificData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (
    array: string[],
    setArray: React.Dispatch<React.SetStateAction<string[]>>,
    index: number,
    value: string
  ) => {
    const newArray = [...array];
    newArray[index] = value;
    setArray(newArray);
  };

  const addArrayItem = (
    array: string[],
    setArray: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setArray([...array, ""]);
  };

  const removeArrayItem = (
    array: string[],
    setArray: React.Dispatch<React.SetStateAction<string[]>>,
    index: number
  ) => {
    if (array.length > 1) {
      const newArray = array.filter((_, i) => i !== index);
      setArray(newArray);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: "Please select an image file" }));
        return;
      }
  
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: "Image must be less than 5MB" }));
        return;
      }
  
      setImageFile(file);
      setErrors(prev => ({ ...prev, image: "" }));
  
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Also clear any existing image URL when uploading a new file
      handleInputChange("imageUrl", "");
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.category.trim()) newErrors.category = "Category is required";
    if (!formData.summary.trim()) newErrors.summary = "Summary is required";
    if (!imagePreview && !imageFile && !formData.imageUrl) newErrors.image = "Image is required";

    if (contentType === "PolicyBelief") {
      const validRecommendations = policySpecificData.keyRecommendations.filter(rec => rec.trim());
      if (validRecommendations.length === 0) newErrors.keyRecommendations = "At least one key recommendation is required";

      const validAudience = policySpecificData.targetAudience.filter(aud => aud.trim());
      if (validAudience.length === 0) newErrors.targetAudience = "At least one target audience is required";

      const validRegions = policySpecificData.region.filter(region => region.trim());
      if (validRegions.length === 0) newErrors.region = "At least one region is required";
    } else {
      const validKeyPoints = statementSpecificData.keyPoints.filter(point => point.trim());
      if (validKeyPoints.length === 0) newErrors.keyPoints = "At least one key point is required";

      const validCountries = statementSpecificData.countryFocus.filter(country => country.trim());
      if (validCountries.length === 0) newErrors.countryFocus = "At least one country is required";

      if (statementSpecificData.pageCount <= 0) newErrors.pageCount = "Page count must be greater than 0";
    }

    const validTags = tags.filter(tag => tag.trim());
    if (validTags.length === 0) newErrors.tags = "At least one tag is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
  
    setIsSubmitting(true);
    
    try {
      // Prepare the data for onSave (parent component will handle API call)
      const itemData = {
        ...formData,
        type: contentType,
        tags: tags.filter(tag => tag.trim()),
        imageFile: imageFile || undefined,
      } as any;
  
      // Add type-specific data
      if (contentType === "PolicyBelief") {
        itemData.priority = policySpecificData.priority;
        itemData.targetAudience = policySpecificData.targetAudience.filter(aud => aud.trim());
        itemData.keyRecommendations = policySpecificData.keyRecommendations.filter(rec => rec.trim());
        itemData.region = policySpecificData.region.filter(region => region.trim());
      } else {
        itemData.keyPoints = statementSpecificData.keyPoints.filter(point => point.trim());
        itemData.pageCount = statementSpecificData.pageCount;
        itemData.countryFocus = statementSpecificData.countryFocus.filter(country => country.trim());
        itemData.relatedPolicies = statementSpecificData.relatedPolicies.filter(policy => policy.trim());
      }
  
      // Call parent's onSave function - this should handle the API call
      await onSave(itemData);
      
      // Close modal on success
      handleClose();
      
    } catch (error) {
      console.error("Error saving item:", error);
      setErrors({...errors, submit: error instanceof Error ? error.message : "Failed to save content"});
      
      // Re-throw the error so the form can stay open with validation errors
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    setImagePreview(null);
    setImageFile(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-red-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="w-6 h-6 text-red-600 mr-3" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingItem ? `Edit ${contentType === "PolicyBelief" ? "Policy Belief" : "Positional Statement"}` : `Add New ${contentType === "PolicyBelief" ? "Policy Belief" : "Positional Statement"}`}
                </h2>
                <p className="text-sm text-gray-600">
                  {editingItem ? "Update content information" : "Create a new content entry"}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-160px)] p-6 space-y-6">
          {/* Basic Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-red-600" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.title ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Enter the content title"
                />
                {errors.title && (
                  <p className="text-red-600 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.title}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.category ? "border-red-300" : "border-gray-300"
                  }`}
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-600 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.category}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              {contentType === "PolicyBelief" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={policySpecificData.priority}
                    onChange={(e) => handlePolicyDataChange("priority", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              )}

              {contentType === "PositionalStatement" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Page Count *
                  </label>
                  <input
                    type="number"
                    value={statementSpecificData.pageCount}
                    onChange={(e) => handleStatementDataChange("pageCount", parseInt(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      errors.pageCount ? "border-red-300" : "border-gray-300"
                    }`}
                    min="1"
                  />
                  {errors.pageCount && (
                    <p className="text-red-600 text-xs mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.pageCount}
                    </p>
                  )}
                </div>
              )}

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image *
                </label>
                <div className="flex flex-col gap-3">
                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Upload Area */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-red-300 transition-colors ${
                      errors.image ? "border-red-300" : "border-gray-300"
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Click to upload an image or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                  
                  {errors.image && (
                    <p className="text-red-600 text-xs flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.image}
                    </p>
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Summary *
                </label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => handleInputChange("summary", e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.summary ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Brief summary of the content"
                />
                                {errors.summary && (
                  <p className="text-red-600 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.summary}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Content Specific Sections */}
          {contentType === "PolicyBelief" ? (
            <>
              {/* Key Recommendations */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-red-600" />
                    Key Recommendations *
                  </h3>
                  <button
                    type="button"
                    onClick={() => addArrayItem(policySpecificData.keyRecommendations, 
                      (newArray) => handlePolicyDataChange("keyRecommendations", newArray))}
                    className="flex items-center text-sm text-red-600 hover:text-red-800"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Recommendation
                  </button>
                </div>
                
                <div className="space-y-3">
                  {policySpecificData.keyRecommendations.map((recommendation, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={recommendation}
                        onChange={(e) => {
                          const newArray = [...policySpecificData.keyRecommendations];
                          newArray[index] = e.target.value;
                          handlePolicyDataChange("keyRecommendations", newArray);
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder={`Recommendation ${index + 1}`}
                      />
                      {policySpecificData.keyRecommendations.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newArray = policySpecificData.keyRecommendations.filter((_, i) => i !== index);
                            handlePolicyDataChange("keyRecommendations", newArray);
                          }}
                          className="px-2 py-2 text-red-600 hover:text-red-800"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {errors.keyRecommendations && (
                  <p className="text-red-600 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.keyRecommendations}
                  </p>
                )}
              </div>

              {/* Target Audience */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-red-600" />
                    Target Audience *
                  </h3>
                  <button
                    type="button"
                    onClick={() => addArrayItem(policySpecificData.targetAudience, 
                      (newArray) => handlePolicyDataChange("targetAudience", newArray))}
                    className="flex items-center text-sm text-red-600 hover:text-red-800"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Audience
                  </button>
                </div>
                
                <div className="space-y-3">
                  {policySpecificData.targetAudience.map((audience, index) => (
                    <div key={index} className="flex gap-2">
                      <select
                        value={audience}
                        onChange={(e) => {
                          const newArray = [...policySpecificData.targetAudience];
                          newArray[index] = e.target.value;
                          handlePolicyDataChange("targetAudience", newArray);
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="">Select target audience</option>
                        {targetAudienceOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      {policySpecificData.targetAudience.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newArray = policySpecificData.targetAudience.filter((_, i) => i !== index);
                            handlePolicyDataChange("targetAudience", newArray);
                          }}
                          className="px-2 py-2 text-red-600 hover:text-red-800"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {errors.targetAudience && (
                  <p className="text-red-600 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.targetAudience}
                  </p>
                )}
              </div>

              {/* Region Focus */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-red-600" />
                    Region Focus *
                  </h3>
                  <button
                    type="button"
                    onClick={() => addArrayItem(policySpecificData.region, 
                      (newArray) => handlePolicyDataChange("region", newArray))}
                    className="flex items-center text-sm text-red-600 hover:text-red-800"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Region
                  </button>
                </div>
                
                <div className="space-y-3">
                  {policySpecificData.region.map((region, index) => (
                    <div key={index} className="flex gap-2">
                      <select
                        value={region}
                        onChange={(e) => {
                          const newArray = [...policySpecificData.region];
                          newArray[index] = e.target.value;
                          handlePolicyDataChange("region", newArray);
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="">Select region</option>
                        {regions.map((regionOption) => (
                          <option key={regionOption} value={regionOption}>
                            {regionOption}
                          </option>
                        ))}
                      </select>
                      {policySpecificData.region.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newArray = policySpecificData.region.filter((_, i) => i !== index);
                            handlePolicyDataChange("region", newArray);
                          }}
                          className="px-2 py-2 text-red-600 hover:text-red-800"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {errors.region && (
                  <p className="text-red-600 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.region}
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Key Points */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Hash className="w-5 h-5 mr-2 text-red-600" />
                    Key Points *
                  </h3>
                  <button
                    type="button"
                    onClick={() => addArrayItem(statementSpecificData.keyPoints, 
                      (newArray) => handleStatementDataChange("keyPoints", newArray))}
                    className="flex items-center text-sm text-red-600 hover:text-red-800"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Key Point
                  </button>
                </div>
                
                <div className="space-y-3">
                  {statementSpecificData.keyPoints.map((point, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={point}
                        onChange={(e) => {
                          const newArray = [...statementSpecificData.keyPoints];
                          newArray[index] = e.target.value;
                          handleStatementDataChange("keyPoints", newArray);
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder={`Key point ${index + 1}`}
                      />
                      {statementSpecificData.keyPoints.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newArray = statementSpecificData.keyPoints.filter((_, i) => i !== index);
                            handleStatementDataChange("keyPoints", newArray);
                          }}
                          className="px-2 py-2 text-red-600 hover:text-red-800"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {errors.keyPoints && (
                  <p className="text-red-600 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.keyPoints}
                  </p>
                )}
              </div>

              {/* Country Focus */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Globe className="w-5 h-5 mr-2 text-red-600" />
                    Country Focus *
                  </h3>
                  <button
                    type="button"
                    onClick={() => addArrayItem(statementSpecificData.countryFocus, 
                      (newArray) => handleStatementDataChange("countryFocus", newArray))}
                    className="flex items-center text-sm text-red-600 hover:text-red-800"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Country
                  </button>
                </div>
                
                <div className="space-y-3">
                  {statementSpecificData.countryFocus.map((country, index) => (
                    <div key={index} className="flex gap-2">
                      <select
                        value={country}
                        onChange={(e) => {
                          const newArray = [...statementSpecificData.countryFocus];
                          newArray[index] = e.target.value;
                          handleStatementDataChange("countryFocus", newArray);
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="">Select country</option>
                        {countries.map((countryOption) => (
                          <option key={countryOption} value={countryOption}>
                            {countryOption}
                          </option>
                        ))}
                      </select>
                      {statementSpecificData.countryFocus.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newArray = statementSpecificData.countryFocus.filter((_, i) => i !== index);
                            handleStatementDataChange("countryFocus", newArray);
                          }}
                          className="px-2 py-2 text-red-600 hover:text-red-800"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {errors.countryFocus && (
                  <p className="text-red-600 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.countryFocus}
                  </p>
                )}
              </div>

              {/* Related Policies */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-red-600" />
                    Related Policies
                  </h3>
                  <button
                    type="button"
                    onClick={() => addArrayItem(statementSpecificData.relatedPolicies, 
                      (newArray) => handleStatementDataChange("relatedPolicies", newArray))}
                    className="flex items-center text-sm text-red-600 hover:text-red-800"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Policy
                  </button>
                </div>
                
                <div className="space-y-3">
                  {statementSpecificData.relatedPolicies.map((policy, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={policy}
                        onChange={(e) => {
                          const newArray = [...statementSpecificData.relatedPolicies];
                          newArray[index] = e.target.value;
                          handleStatementDataChange("relatedPolicies", newArray);
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder={`Related policy ${index + 1}`}
                      />
                      {statementSpecificData.relatedPolicies.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newArray = statementSpecificData.relatedPolicies.filter((_, i) => i !== index);
                            handleStatementDataChange("relatedPolicies", newArray);
                          }}
                          className="px-2 py-2 text-red-600 hover:text-red-800"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Tags */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Tag className="w-5 h-5 mr-2 text-red-600" />
                Tags *
              </h3>
              <button
                type="button"
                onClick={() => addArrayItem(tags, setTags)}
                className="flex items-center text-sm text-red-600 hover:text-red-800"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Tag
              </button>
            </div>
            
            <div className="space-y-3">
              {tags.map((tag, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) =>
                      handleArrayChange(tags, setTags, index, e.target.value)
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder={`Tag ${index + 1}`}
                  />
                  {tags.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem(tags, setTags, index)}
                      className="px-2 py-2 text-red-600 hover:text-red-800"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {errors.tags && (
              <p className="text-red-600 text-xs mt-1 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.tags}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-medium flex items-center disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {editingItem ? "Update Content" : "Create Content"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateContentModal;