import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Upload,
  FileText,
  BookOpen,
  Image as ImageIcon,
  Tag,
  Star,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Plus,
  Minus,
} from "lucide-react";
import { EBooklet as ApiEBooklet, ebookletsApi } from "../../../../services/ebookletsApi";

type EBookletStatus = "Published" | "Draft" | "Archived";
type FileFormat = "PDF" | "EPUB" | "MOBI" | string;

// Local preview/build object type is inferred at use sites; we rely on ApiEBooklet for editing

interface UploadEBookletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ebooklet: any) => void;
  editingEBooklet?: ApiEBooklet;
}

interface FormData {
  title: string;
  description: string;
  category: string;
  authors: string[];
  targetAudience: string[];
  status: EBookletStatus;
  isFeatured: boolean;
  pages: string;
  publicationDate: string;
  imageFile: File | null;
  imageUrl: string;
  bookletFiles: File[];
  fileFormats: FileFormat[];
  tags: string[];
  language: string;
  isbn: string;
  publisher: string;
  edition: string;
  abstract: string;
  tableOfContents: string[];
  keywords: string[];
}

interface FormErrors {
  [key: string]: string;
}

const UploadEBookletModal: React.FC<UploadEBookletModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingEBooklet,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    category: "",
    authors: [""],
    targetAudience: ["Parents"],
    status: "Draft",
    isFeatured: false,
    pages: "",
    publicationDate: "",
    imageFile: null,
    imageUrl: "",
    bookletFiles: [],
    fileFormats: [],
    tags: [],
    language: "English",
    isbn: "",
    publisher: "",
    edition: "",
    abstract: "",
    tableOfContents: [""],
    keywords: [],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [newKeyword, setNewKeyword] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    "Educational Guides",
    "Medical Handbooks",
    "Therapy Manuals",
    "Assessment Tools",
    "Parent Resources",
    "Training Materials",
    "Research Papers",
    "Case Studies",
  ];

  const audienceOptions = [
    "Parents",
    "Caregivers",
    "Healthcare Providers",
    "Teachers",
    "Therapists",
    "Medical Students",
    "Researchers",
    "General Public",
  ];

  const languageOptions = [
    "English",
    "French",
    "Swahili",
    "Arabic",
    "Portuguese",
    "Hausa",
    "Amharic",
    "Yoruba",
  ];

  const steps = [
    { number: 1, title: "Basic Info", icon: BookOpen },
    { number: 2, title: "Content", icon: FileText },
    { number: 3, title: "Files", icon: Upload },
    { number: 4, title: "Review", icon: Eye },
  ];

  // Initialize form when editing
  useEffect(() => {
    if (editingEBooklet) {
      setFormData({
        title: editingEBooklet.title || "",
        description: editingEBooklet.description || "",
        category: editingEBooklet.category || "",
        authors:
          editingEBooklet.authors && editingEBooklet.authors.length > 0
            ? editingEBooklet.authors
            : [""],
        targetAudience: editingEBooklet.targetAudience || ["Parents"],
        status: editingEBooklet.status || "Draft",
        isFeatured: editingEBooklet.isFeatured || false,
        pages: editingEBooklet.pages?.toString() || "",
        publicationDate: editingEBooklet.publicationDate || "",
        imageFile: null,
        imageUrl: editingEBooklet.imageUrl || "",
        bookletFiles: [],
        fileFormats: (editingEBooklet.fileFormats || []) as FileFormat[],
        tags: [],
        language: "English",
        isbn: "",
        publisher: "",
        edition: "",
        abstract: "",
        tableOfContents: [""],
        keywords: [],
      });
    } else {
      // Reset form for new e-booklet
      setFormData({
        title: "",
        description: "",
        category: "",
        authors: [""],
        targetAudience: ["Parents"],
        status: "Draft",
        isFeatured: false,
        pages: "",
        publicationDate: "",
        imageFile: null,
        imageUrl: "",
        bookletFiles: [],
        fileFormats: [],
        tags: [],
        language: "English",
        isbn: "",
        publisher: "",
        edition: "",
        abstract: "",
        tableOfContents: [""],
        keywords: [],
      });
    }

    setCurrentStep(1);
    setErrors({});
    setShowPreview(false);
    setUploadProgress(0);
  }, [editingEBooklet, isOpen]);

  if (!isOpen) return null;

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = "Title is required";
      if (!formData.description.trim())
        newErrors.description = "Description is required";
      if (!formData.category) newErrors.category = "Category is required";
      if (formData.authors.filter((author) => author.trim()).length === 0) {
        newErrors.authors = "At least one author is required";
      }
      if (!formData.pages.trim())
        newErrors.pages = "Number of pages is required";
    }

    if (step === 2) {
      if (!formData.abstract.trim())
        newErrors.abstract = "Abstract is required";
      if (formData.tableOfContents.filter((item) => item.trim()).length === 0) {
        newErrors.tableOfContents = "Table of contents is required";
      }
    }

    if (step === 3) {
      if (formData.bookletFiles.length === 0 && !editingEBooklet) {
        newErrors.bookletFiles = "At least one booklet file is required";
      }
      if (!formData.imageFile && !formData.imageUrl) {
        newErrors.coverImage = "Cover image is required";
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

  const handleArrayChange = (
    field: keyof FormData,
    index: number,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).map((item, i) =>
        i === index ? value : item
      ),
    }));
  };

  const addArrayItem = (field: keyof FormData) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...(prev[field] as string[]), ""],
    }));
  };

  const removeArrayItem = (field: keyof FormData, index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index),
    }));
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
          coverImage: "Please select a valid image file (JPEG, PNG, GIF, WEBP)",
        });
        return;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setErrors({ ...errors, coverImage: "Image must be less than 10MB" });
        return;
      }

      handleInputChange("imageFile", file);
      handleInputChange("imageUrl", ""); // Clear URL when file is uploaded
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const allowedTypes = [
        "application/pdf",
        "application/epub+zip",
        "application/x-mobipocket-ebook",
      ];
      const newFiles: File[] = [];
      const newFormats: FileFormat[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file type
        if (
          !allowedTypes.includes(file.type) &&
          !file.name.toLowerCase().endsWith(".pdf") &&
          !file.name.toLowerCase().endsWith(".epub") &&
          !file.name.toLowerCase().endsWith(".mobi")
        ) {
          setErrors({
            ...errors,
            bookletFiles: "Please select valid e-book files (PDF, EPUB, MOBI)",
          });
          continue;
        }

        // Validate file size (50MB max per file)
        if (file.size > 50 * 1024 * 1024) {
          setErrors({
            ...errors,
            bookletFiles: "Each file must be less than 50MB",
          });
          continue;
        }

        newFiles.push(file);

        // Determine format based on file extension
        const fileName = file.name.toLowerCase();
        if (fileName.endsWith(".pdf")) newFormats.push("PDF");
        else if (fileName.endsWith(".epub")) newFormats.push("EPUB");
        else if (fileName.endsWith(".mobi")) newFormats.push("MOBI");
      }

      handleInputChange("bookletFiles", [
        ...formData.bookletFiles,
        ...newFiles,
      ]);
      handleInputChange("fileFormats", [
        ...new Set([...formData.fileFormats, ...newFormats]),
      ]);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = formData.bookletFiles.filter((_, i) => i !== index);
    handleInputChange("bookletFiles", newFiles);

    // Update file formats based on remaining files
    const remainingFormats: FileFormat[] = [];
    newFiles.forEach((file) => {
      const fileName = file.name.toLowerCase();
      if (fileName.endsWith(".pdf") && !remainingFormats.includes("PDF")) {
        remainingFormats.push("PDF");
      } else if (
        fileName.endsWith(".epub") &&
        !remainingFormats.includes("EPUB")
      ) {
        remainingFormats.push("EPUB");
      } else if (
        fileName.endsWith(".mobi") &&
        !remainingFormats.includes("MOBI")
      ) {
        remainingFormats.push("MOBI");
      }
    });
    handleInputChange("fileFormats", remainingFormats);
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

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !formData.keywords.includes(newKeyword.trim())) {
      handleInputChange("keywords", [...formData.keywords, newKeyword.trim()]);
      setNewKeyword("");
    }
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    handleInputChange(
      "keywords",
      formData.keywords.filter((keyword) => keyword !== keywordToRemove)
    );
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
  
    setIsSubmitting(true);
    setUploadProgress(10);
  
    try {
      // Prepare the data for submission
      const submissionData = {
        title: formData.title,
        description: formData.description,
        abstract: formData.abstract,
        category: formData.category,
        status: formData.status,
        isFeatured: formData.isFeatured,
        authors: formData.authors.filter(author => author.trim()),
        targetAudience: formData.targetAudience,
        pages: parseInt(formData.pages) || 0,
        fileFormats: formData.fileFormats,
        language: formData.language,
        isbn: formData.isbn,
        publisher: formData.publisher,
        edition: formData.edition,
        tableOfContents: formData.tableOfContents.filter(item => item.trim()),
        keywords: formData.keywords,
        tags: formData.tags,
        imageFile: formData.imageFile,
        ebookletFile: formData.bookletFiles.length > 0 ? formData.bookletFiles[0] : null,
      };
  
      // Call the API
      if (editingEBooklet) {
        await ebookletsApi.update(editingEBooklet.id, submissionData);
      } else {
        await ebookletsApi.create(submissionData);
      }
  
      setUploadProgress(100);
      setTimeout(() => {
        onClose();
        // Refresh the list
        window.location.reload();
      }, 500);
  
    } catch (error) {
      console.error('Error uploading e-booklet:', error);
      setErrors({ general: 'Failed to upload e-booklet. Please try again.' });
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

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">
        Basic Information
      </h3>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          E-Booklet Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleInputChange("title", e.target.value)}
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
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

      {/* Category and Language */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            value={formData.category}
            onChange={(e) => handleInputChange("category", e.target.value)}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
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
            Language
          </label>
          <select
            value={formData.language}
            onChange={(e) => handleInputChange("language", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {languageOptions.map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Authors */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Authors *
        </label>
        {formData.authors.map((author, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={author}
              onChange={(e) =>
                handleArrayChange("authors", index, e.target.value)
              }
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Dr. John Smith"
            />
            {index === 0 ? (
              <button
                type="button"
                onClick={() => addArrayItem("authors")}
                className="px-4 py-3 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200"
              >
                <Plus className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => removeArrayItem("authors", index)}
                className="px-4 py-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
              >
                <Minus className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        {errors.authors && (
          <p className="text-red-500 text-sm mt-1">{errors.authors}</p>
        )}
      </div>

      {/* Target Audience */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Target Audience
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {audienceOptions.map((audience) => (
            <label
              key={audience}
              className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={formData.targetAudience.includes(audience)}
                onChange={(e) => {
                  if (e.target.checked) {
                    handleInputChange("targetAudience", [
                      ...formData.targetAudience,
                      audience,
                    ]);
                  } else {
                    handleInputChange(
                      "targetAudience",
                      formData.targetAudience.filter(
                        (item) => item !== audience
                      )
                    );
                  }
                }}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm">{audience}</span>
            </label>
          ))}
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
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
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

      {/* Pages and Publication Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Pages *
          </label>
          <input
            type="number"
            value={formData.pages}
            onChange={(e) => handleInputChange("pages", e.target.value)}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
              errors.pages ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="e.g. 36"
            min="1"
          />
          {errors.pages && (
            <p className="text-red-500 text-sm mt-1">{errors.pages}</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Content Details</h3>

      {/* Abstract */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Abstract *
        </label>
        <textarea
          value={formData.abstract}
          onChange={(e) => handleInputChange("abstract", e.target.value)}
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
            errors.abstract ? "border-red-500" : "border-gray-300"
          }`}
          rows={6}
          placeholder="Detailed abstract describing the content and purpose of the e-booklet"
          maxLength={2000}
        />
        {errors.abstract && (
          <p className="text-red-500 text-sm mt-1">{errors.abstract}</p>
        )}
        <p className="text-gray-500 text-sm mt-1">
          {formData.abstract.length}/2000 characters
        </p>
      </div>

      {/* Table of Contents */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Table of Contents *
        </label>
        {formData.tableOfContents.map((item, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={item}
              onChange={(e) =>
                handleArrayChange("tableOfContents", index, e.target.value)
              }
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder={`Chapter ${index + 1} title`}
            />
            {index === 0 ? (
              <button
                type="button"
                onClick={() => addArrayItem("tableOfContents")}
                className="px-4 py-3 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200"
              >
                <Plus className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => removeArrayItem("tableOfContents", index)}
                className="px-4 py-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
              >
                <Minus className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        {errors.tableOfContents && (
          <p className="text-red-500 text-sm mt-1">{errors.tableOfContents}</p>
        )}
      </div>

      {/* Additional metadata */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ISBN
          </label>
          <input
            type="text"
            value={formData.isbn}
            onChange={(e) => handleInputChange("isbn", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="978-3-16-148410-0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Publisher
          </label>
          <input
            type="text"
            value={formData.publisher}
            onChange={(e) => handleInputChange("publisher", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Publisher name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Edition
          </label>
          <input
            type="text"
            value={formData.edition}
            onChange={(e) => handleInputChange("edition", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="1st Edition"
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
              className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm flex items-center"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-2 text-indigo-600 hover:text-indigo-800"
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
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Add a tag"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Tag className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Keywords */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Keywords
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {formData.keywords.map((keyword, index) => (
            <span
              key={index}
              className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center"
            >
              {keyword}
              <button
                type="button"
                onClick={() => handleRemoveKeyword(keyword)}
                className="ml-2 text-green-600 hover:text-green-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyPress={(e) =>
              e.key === "Enter" && (e.preventDefault(), handleAddKeyword())
            }
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Add a keyword"
          />
          <button
            type="button"
            onClick={handleAddKeyword}
            className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Files & Media</h3>

      {/* Cover Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cover Image *
        </label>
        <div className="flex items-center gap-4">
          <label className="flex flex-col items-center justify-center w-32 h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 transition-colors">
            {formData.imageFile || formData.imageUrl ? (
              <div className="relative w-full h-full">
                <img
                  src={
                    formData.imageFile
                      ? URL.createObjectURL(formData.imageFile)
                      : formData.imageUrl
                  }
                  alt="Cover preview"
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleInputChange("imageFile", null);
                    handleInputChange("imageUrl", "");
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600 text-center px-2">
                  Upload Cover
                </span>
                <span className="text-xs text-gray-400 text-center px-2">
                  JPEG, PNG, WebP
                </span>
              </>
            )}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>
        {errors.coverImage && (
          <p className="text-red-500 text-sm mt-1">{errors.coverImage}</p>
        )}
        <p className="text-gray-500 text-sm mt-1">
          Recommended: 400x600px, max 10MB
        </p>
      </div>

      {/* E-Booklet Files */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          E-Booklet Files *
        </label>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.epub,.mobi,application/pdf,application/epub+zip"
            onChange={handleFileUpload}
            className="hidden"
          />

          <div className="mb-4">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium"
            >
              Select Files
            </button>
            <p className="text-sm text-gray-500 mt-2">
              Select PDF, EPUB, or MOBI files (max 50MB each)
            </p>
          </div>
        </div>

        {/* File List */}
        {formData.bookletFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="font-medium text-gray-900">Selected Files:</h4>
            {formData.bookletFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-gray-500 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / (1024 * 1024)).toFixed(1)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-red-600 hover:text-red-800 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {errors.bookletFiles && (
          <p className="text-red-500 text-sm mt-1">{errors.bookletFiles}</p>
        )}
      </div>

      {/* File Formats Display */}
      {formData.fileFormats.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Available Formats
          </label>
          <div className="flex flex-wrap gap-2">
            {formData.fileFormats.map((format, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
              >
                {format}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Publication Settings */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <h4 className="font-medium text-gray-900">Publication Settings</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                handleInputChange("status", e.target.value as EBookletStatus)
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) =>
                  handleInputChange("isFeatured", e.target.checked)
                }
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <div className="ml-3">
                <span className="text-sm font-medium text-gray-700 flex items-center">
                  <Star className="w-4 h-4 mr-1 text-yellow-500" />
                  Featured E-Booklet
                </span>
                <p className="text-xs text-gray-500">
                  Display prominently in listings
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Review & Publish</h3>

      {/* Preview Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <span className="font-medium text-gray-900">Preview E-Booklet</span>
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
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
            <div className="lg:w-1/4">
              <div className="relative">
                {formData.imageFile || formData.imageUrl ? (
                  <img
                    src={
                      formData.imageFile
                        ? URL.createObjectURL(formData.imageFile)
                        : formData.imageUrl
                    }
                    alt={formData.title}
                    className="w-full h-48 lg:h-64 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-48 lg:h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold border ${
                      formData.status === "Published"
                        ? "bg-green-100 text-green-800 border-green-200"
                        : formData.status === "Draft"
                        ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                        : "bg-gray-100 text-gray-800 border-gray-200"
                    }`}
                  >
                    {formData.status}
                  </span>
                </div>
                {formData.isFeatured && (
                  <div className="absolute top-3 right-3">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  </div>
                )}
              </div>
            </div>

            {/* Preview Content */}
            <div className="lg:w-3/4">
              <h4 className="text-xl font-bold text-gray-900 mb-2">
                {formData.title}
              </h4>
              <div className="flex items-center text-gray-600 text-sm mb-3">
                <span>{formData.category}</span>
                <span className="mx-2">•</span>
                <span>{formData.language}</span>
              </div>

              <p className="text-gray-600 text-sm mb-4">
                {formData.description}
              </p>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                <div>
                  <span className="font-medium">Authors:</span>{" "}
                  {formData.authors.filter((a) => a.trim()).join(", ")}
                </div>
                <div>
                  <span className="font-medium">Pages:</span> {formData.pages}
                </div>
                <div>
                  <span className="font-medium">Publication:</span>{" "}
                  {formData.publicationDate || "Not specified"}
                </div>
                <div>
                  <span className="font-medium">Target Audience:</span>{" "}
                  {formData.targetAudience.join(", ")}
                </div>
              </div>

              {formData.fileFormats.length > 0 && (
                <div className="mb-4">
                  <span className="font-medium text-gray-700 text-sm">
                    Formats:{" "}
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.fileFormats.map((format, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded"
                      >
                        {format}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {formData.tags.length > 0 && (
                <div className="mb-4">
                  <span className="font-medium text-gray-700 text-sm">
                    Tags:{" "}
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-indigo-100 text-indigo-800 px-2 py-1 text-xs rounded"
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

      {/* Upload Progress */}
      {isSubmitting && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-blue-900">
              Uploading E-Booklet...
            </span>
            <span className="text-blue-700 font-medium">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-medium text-blue-900 mb-3 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          E-Booklet Summary
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-blue-800">Title:</span>
            <p className="text-blue-700">{formData.title}</p>
          </div>
          <div>
            <span className="font-medium text-blue-800">Category:</span>
            <p className="text-blue-700">{formData.category}</p>
          </div>
          <div>
            <span className="font-medium text-blue-800">Authors:</span>
            <p className="text-blue-700">
              {formData.authors.filter((a) => a.trim()).join(", ")}
            </p>
          </div>
          <div>
            <span className="font-medium text-blue-800">Pages:</span>
            <p className="text-blue-700">{formData.pages}</p>
          </div>
          <div>
            <span className="font-medium text-blue-800">Language:</span>
            <p className="text-blue-700">{formData.language}</p>
          </div>
          <div>
            <span className="font-medium text-blue-800">Status:</span>
            <p className="text-blue-700">{formData.status}</p>
          </div>
          <div>
            <span className="font-medium text-blue-800">Files:</span>
            <p className="text-blue-700">
              {formData.bookletFiles.length} file(s) selected
            </p>
          </div>
          <div>
            <span className="font-medium text-blue-800">Cover Image:</span>
            <p className="text-blue-700">
              {formData.imageFile || formData.imageUrl ? "Provided" : "Missing"}
            </p>
          </div>
        </div>
      </div>
      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{errors.general}</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[99vh] overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-50 px-3  border-b border-indigo-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-indigo-900 flex items-center">
            <BookOpen className="w-6 h-5 mr-3" />
            {editingEBooklet ? "Edit E-Booklet" : "Upload E-Booklet"}
          </h2>
          <button
            onClick={onClose}
            className="text-indigo-700 hover:text-indigo-900 p-1 rounded-lg hover:bg-indigo-100"
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
              ? "Content Details"
              : currentStep === 3
              ? "Files & Media"
              : "Review & Publish"}
          </div>
        </div>

        {/* Form Content */}
        <div className="px-6 py-6 overflow-y-auto max-h-[calc(95vh-200px)]">
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
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
              >
                Next Step
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-8 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center ${
                  isSubmitting ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    {editingEBooklet ? "Update E-Booklet" : "Upload E-Booklet"}
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

export default UploadEBookletModal;
