import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  Plus,
  Minus,
  BookOpen,
  User,
  Globe,
  Hash,
  FileText,
  AlertCircle,
} from "lucide-react";
import { CreateJournalArticleInput } from "../../../../services/journalWatchAPI";

interface JournalArticle {
  id: number;
  title: string;
  authors: string;
  journal: string;
  publicationDate: string;
  summary: string;
  abstract?: string;
  keyFindings: string[];
  relevance: "High" | "Medium" | "Low";
  studyType: string;
  population: string;
  countryFocus: string[];
  tags: string[];
  access: "Open" | "Subscription";
  commentary?: string;
  status: "Published" | "Draft" | "Archived";
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  downloadCount: number;
}

interface CreateJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (article: CreateJournalArticleInput) => Promise<void>;
  editingArticle?: JournalArticle;
}

const CreateJournalModal: React.FC<CreateJournalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingArticle,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    authors: "",
    journal: "",
    summary: "",
    abstract: "",
    relevance: "Medium" as "High" | "Medium" | "Low",
    studyType: "",
    population: "",
    access: "Open" as "Open" | "Subscription",
    commentary: "",
    status: "Draft" as "Published" | "Draft" | "Archived",
  });

  const [keyFindings, setKeyFindings] = useState<string[]>([""]);
  const [countryFocus, setCountryFocus] = useState<string[]>([""]);
  const [tags, setTags] = useState<string[]>([""]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const studyTypes = [
    "Epidemiology",
    "Intervention",
    "Genetics",
    "Clinical Trial",
    "Systematic Review",
    "Meta-Analysis",
    "Case Study",
    "Cross-Sectional",
    "Cohort Study",
    "Randomized Controlled Trial",
    "Qualitative Research",
  ];

  const countries = [
    "Kenya",
    "Uganda",
    "Tanzania",
    "Rwanda",
    "South Africa",
    "Nigeria",
    "Ghana",
    "Ethiopia",
    "Democratic Republic of Congo",
    "Zambia",
    "Zimbabwe",
    "Botswana",
    "Malawi",
    "Madagascar",
    "Mozambique",
  ];

  // Load editing data when modal opens
  useEffect(() => {
    if (isOpen && editingArticle) {
      setFormData({
        title: editingArticle.title,
        authors: editingArticle.authors,
        journal: editingArticle.journal,
        summary: editingArticle.summary,
        abstract: editingArticle.abstract || "",
        relevance: editingArticle.relevance,
        studyType: editingArticle.studyType,
        population: editingArticle.population,
        access: editingArticle.access,
        commentary: editingArticle.commentary || "",
        status: editingArticle.status,
      });
      setKeyFindings(editingArticle.keyFindings.length > 0 ? editingArticle.keyFindings : [""]);
      setCountryFocus(editingArticle.countryFocus.length > 0 ? editingArticle.countryFocus : [""]);
      setTags(editingArticle.tags.length > 0 ? editingArticle.tags : [""]);
    } else if (isOpen && !editingArticle) {
      // Reset form for new article
      setFormData({
        title: "",
        authors: "",
        journal: "",
        summary: "",
        abstract: "",
        relevance: "Medium",
        studyType: "",
        population: "",
        access: "Open",
        commentary: "",
        status: "Draft",
      });
      setKeyFindings([""]);
      setCountryFocus([""]);
      setTags([""]);
      setErrors({});
    }
  }, [isOpen, editingArticle]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.authors.trim()) newErrors.authors = "Authors are required";
    if (!formData.journal.trim()) newErrors.journal = "Journal is required";
    if (!formData.summary.trim()) newErrors.summary = "Summary is required";
    if (!formData.studyType.trim()) newErrors.studyType = "Study type is required";
    if (!formData.population.trim()) newErrors.population = "Population is required";

    const validKeyFindings = keyFindings.filter(finding => finding.trim());
    if (validKeyFindings.length === 0) newErrors.keyFindings = "At least one key finding is required";

    const validCountries = countryFocus.filter(country => country.trim());
    if (validCountries.length === 0) newErrors.countryFocus = "At least one country focus is required";

    const validTags = tags.filter(tag => tag.trim());
    if (validTags.length === 0) newErrors.tags = "At least one tag is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const cleanedData: CreateJournalArticleInput = {
        ...formData,
        keyFindings: keyFindings.filter(finding => finding.trim()),
        countryFocus: countryFocus.filter(country => country.trim()),
        tags: tags.filter(tag => tag.trim()),
      };

      await onSave(cleanedData);
      onClose();
    } catch (error) {
      console.error("Error saving article:", error);
      // The error will be handled by the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setErrors({});
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
              <BookOpen className="w-6 h-6 text-red-600 mr-3" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingArticle ? "Edit Journal Article" : "Add New Journal Article"}
                </h2>
                <p className="text-sm text-gray-600">
                  {editingArticle ? "Update article information" : "Create a new journal article entry"}
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
              <FileText className="w-5 h-5 mr-2 text-red-600" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Article Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.title ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Enter the full article title"
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
                  Authors *
                </label>
                <input
                  type="text"
                  value={formData.authors}
                  onChange={(e) => handleInputChange("authors", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.authors ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="e.g., Smith et al."
                />
                {errors.authors && (
                  <p className="text-red-600 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.authors}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Journal *
                </label>
                <input
                  type="text"
                  value={formData.journal}
                  onChange={(e) => handleInputChange("journal", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.journal ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Journal name"
                />
                {errors.journal && (
                  <p className="text-red-600 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.journal}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Study Type *
                </label>
                <select
                  value={formData.studyType}
                  onChange={(e) => handleInputChange("studyType", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.studyType ? "border-red-300" : "border-gray-300"
                  }`}
                >
                  <option value="">Select study type</option>
                  {studyTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {errors.studyType && (
                  <p className="text-red-600 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.studyType}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relevance
                </label>
                <select
                  value={formData.relevance}
                  onChange={(e) => handleInputChange("relevance", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Access Type
                </label>
                <select
                  value={formData.access}
                  onChange={(e) => handleInputChange("access", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="Open">Open Access</option>
                  <option value="Subscription">Subscription Required</option>
                </select>
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

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Population *
                </label>
                <input
                  type="text"
                  value={formData.population}
                  onChange={(e) => handleInputChange("population", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.population ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="e.g., Children aged 2-15 years"
                />
                {errors.population && (
                  <p className="text-red-600 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.population}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-red-600" />
              Content
            </h3>

            <div className="space-y-4">
              <div>
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
                  placeholder="Brief summary of the article's main points"
                />
                {errors.summary && (
                  <p className="text-red-600 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.summary}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Abstract
                </label>
                <textarea
                  value={formData.abstract}
                  onChange={(e) => handleInputChange("abstract", e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Full abstract (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ACNA Commentary
                </label>
                <textarea
                  value={formData.commentary}
                  onChange={(e) => handleInputChange("commentary", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="ACNA's commentary on the article (optional)"
                />
              </div>
            </div>
          </div>

          {/* Key Findings */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Hash className="w-5 h-5 mr-2 text-red-600" />
                Key Findings *
              </h3>
              <button
                type="button"
                onClick={() => addArrayItem(keyFindings, setKeyFindings)}
                className="flex items-center text-sm text-red-600 hover:text-red-800"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Finding
              </button>
            </div>
            
            <div className="space-y-3">
              {keyFindings.map((finding, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={finding}
                    onChange={(e) =>
                      handleArrayChange(keyFindings, setKeyFindings, index, e.target.value)
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder={`Key finding ${index + 1}`}
                  />
                  {keyFindings.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        removeArrayItem(keyFindings, setKeyFindings, index)
                      }
                      className="px-2 py-2 text-red-600 hover:text-red-800"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {errors.keyFindings && (
              <p className="text-red-600 text-xs mt-1 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.keyFindings}
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
                onClick={() => addArrayItem(countryFocus, setCountryFocus)}
                className="flex items-center text-sm text-red-600 hover:text-red-800"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Country
              </button>
            </div>
            
            <div className="space-y-3">
              {countryFocus.map((country, index) => (
                <div key={index} className="flex gap-2">
                  <select
                    value={country}
                    onChange={(e) =>
                      handleArrayChange(countryFocus, setCountryFocus, index, e.target.value)
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Select country</option>
                    {countries.map((countryOption) => (
                      <option key={countryOption} value={countryOption}>
                        {countryOption}
                      </option>
                    ))}
                  </select>
                  {countryFocus.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        removeArrayItem(countryFocus, setCountryFocus, index)
                      }
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

          {/* Tags */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Hash className="w-5 h-5 mr-2 text-red-600" />
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
                {editingArticle ? "Update Article" : "Create Article"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateJournalModal;