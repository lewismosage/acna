import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Newspaper,
  Tag,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Upload,
  Check,
  AlertCircle,
} from "lucide-react";
import { NewsItem, CreateNewsInput } from "../types/types";
import {
  newsApi,
  CreateNewsInput as ApiCreateNewsInput,
} from "../../../../services/newsApi";

interface CreateNewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newsItem: NewsItem) => void;
  initialData?: NewsItem; // For edit mode
}

const CreateNewsModal: React.FC<CreateNewsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  // Form state
  const [formData, setFormData] = useState<CreateNewsInput>({
    title: "",
    subtitle: "",
    type: "News Article",
    status: "Draft",
    category: "",
    date: new Date().toISOString().split("T")[0],
    readTime: "5 min",
    imageUrl: "", // Will be populated after upload
    content: {
      introduction: "",
      sections: [],
      conclusion: "",
    },
    tags: [],
    isFeatured: false,
  });

  // UI state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [authorImageFile, setAuthorImageFile] = useState<File | null>(null);
  const [authorImagePreview, setAuthorImagePreview] = useState<string | null>(
    null
  );
  const [expandedSections, setExpandedSections] = useState<number[]>([]);
  const [newTag, setNewTag] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const authorFileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form with data when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        subtitle: initialData.subtitle,
        type: initialData.type,
        status: initialData.status,
        category: initialData.category,
        date: initialData.date,
        readTime: initialData.readTime,
        imageUrl: initialData.imageUrl || "",
        content: initialData.content,
        author: initialData.author,
        tags: initialData.tags,
        source: initialData.source,
        contact: initialData.contact,
        isFeatured: initialData.isFeatured || false,
      });

      if (initialData.imageUrl) {
        setImagePreview(initialData.imageUrl);
      }
      if (initialData.author?.imageUrl) {
        setAuthorImagePreview(initialData.author.imageUrl);
      }
      if (initialData.content?.sections?.length) {
        setExpandedSections(initialData.content.sections.map((_, i) => i));
      }
    } else {
      // Reset form for new news item
      setFormData({
        title: "",
        subtitle: "",
        type: "News Article",
        status: "Draft",
        category: "",
        date: new Date().toISOString().split("T")[0],
        readTime: "5 min",
        imageUrl: "",
        content: {
          introduction: "",
          sections: [],
          conclusion: "",
        },
        tags: [],
        isFeatured: false,
      });
      setImageFile(null);
      setImagePreview(null);
      setAuthorImageFile(null);
      setAuthorImagePreview(null);
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleContentChange = (
    field: keyof CreateNewsInput["content"],
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        [field]: value,
      },
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const addSection = () => {
    const newIndex = formData.content.sections.length;
    setFormData((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        sections: [...prev.content.sections, { heading: "", content: "" }],
      },
    }));
    setExpandedSections([...expandedSections, newIndex]);
  };

  const removeSection = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        sections: prev.content.sections.filter((_, i) => i !== index),
      },
    }));
    setExpandedSections(
      expandedSections
        .filter((i) => i !== index)
        .map((i) => (i > index ? i - 1 : i))
    );
  };

  const updateSection = (
    index: number,
    field: "heading" | "content",
    value: string
  ) => {
    setFormData((prev) => {
      const newSections = [...prev.content.sections];
      newSections[index][field] = value;
      return {
        ...prev,
        content: {
          ...prev.content,
          sections: newSections,
        },
      };
    });
  };

  const toggleExpandSection = (index: number) => {
    setExpandedSections((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAuthorImageFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setAuthorImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setAuthorImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title) newErrors.title = "Title is required";
    if (!formData.type) newErrors.type = "Type is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.content.introduction)
      newErrors.introduction = "Introduction is required";

    // For new items, require image file. For edits, require either file or existing URL
    if (!initialData) {
      if (!imageFile) newErrors.image = "Featured image is required";
    } else {
      if (!imageFile && !formData.imageUrl)
        newErrors.image = "Featured image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadImages = async (): Promise<{
    imageUrl?: string;
    authorImageUrl?: string;
  }> => {
    const uploads: { imageUrl?: string; authorImageUrl?: string } = {};

    try {
      // Upload main image if new file selected
      if (imageFile) {
        const imageUpload = await newsApi.uploadImage(imageFile);
        uploads.imageUrl = imageUpload.url;
      }

      // Upload author image if new file selected
      if (authorImageFile) {
        const authorImageUpload = await newsApi.uploadImage(authorImageFile);
        uploads.authorImageUrl = authorImageUpload.url;
      }

      return uploads;
    } catch (error) {
      console.error("Error uploading images:", error);
      throw new Error("Failed to upload images");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload images if any
      const uploadedImages = await uploadImages();

      // Prepare the news item data for API - ensure proper structure
      const newsItemData: ApiCreateNewsInput = {
        title: formData.title,
        subtitle: formData.subtitle,
        type: formData.type,
        status: formData.status,
        category: formData.category,
        date: formData.date,
        readTime: formData.readTime,
        imageUrl: uploadedImages.imageUrl || formData.imageUrl,
        content: {
          ...formData.content,
          sections: formData.content.sections.filter(
            (s) => s.heading || s.content
          ),
        },
        author: formData.author
          ? {
              ...formData.author,
              imageUrl:
                uploadedImages.authorImageUrl || formData.author.imageUrl || "",
            }
          : undefined,
        tags: formData.tags,
        source: formData.source || undefined,
        contact: formData.contact || undefined,
        isFeatured: formData.isFeatured,
      };

      // Clean up empty objects
      if (
        newsItemData.author &&
        Object.values(newsItemData.author).every((val) => !val)
      ) {
        delete newsItemData.author;
      }

      if (
        newsItemData.source &&
        Object.values(newsItemData.source).every((val) => !val)
      ) {
        delete newsItemData.source;
      }

      if (
        newsItemData.contact &&
        Object.values(newsItemData.contact).every((val) => !val)
      ) {
        delete newsItemData.contact;
      }

      // Create or update news item
      let savedNews: NewsItem;
      if (initialData) {
        savedNews = await newsApi.update(initialData.id, newsItemData);
      } else {
        savedNews = await newsApi.create(newsItemData);
      }

      onSave(savedNews);
      handleClose();
    } catch (error: any) {
      console.error("Error saving news item:", error);

      // Handle validation errors from backend
      if (error && typeof error === "object") {
        const backendErrors: Record<string, string> = {};

        // Handle different error formats
        if (error.imageUrl) {
          backendErrors.image = Array.isArray(error.imageUrl)
            ? error.imageUrl[0]
            : error.imageUrl;
        }
        if (error.title) {
          backendErrors.title = Array.isArray(error.title)
            ? error.title[0]
            : error.title;
        }
        if (error.category) {
          backendErrors.category = Array.isArray(error.category)
            ? error.category[0]
            : error.category;
        }
        if (error.content) {
          backendErrors.introduction = Array.isArray(error.content)
            ? error.content[0]
            : error.content;
        }

        setErrors({
          ...errors,
          ...backendErrors,
          form: "Please fix the errors above and try again.",
        });
      } else {
        setErrors({
          ...errors,
          form: "Failed to save news item. Please try again.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setFormData({
      title: "",
      subtitle: "",
      type: "News Article",
      status: "Draft",
      category: "",
      date: new Date().toISOString().split("T")[0],
      readTime: "5 min",
      imageUrl: "",
      content: {
        introduction: "",
        sections: [],
        conclusion: "",
      },
      tags: [],
      isFeatured: false,
    });
    setImageFile(null);
    setImagePreview(null);
    setAuthorImageFile(null);
    setAuthorImagePreview(null);
    setExpandedSections([]);
    setErrors({});
    onClose();
  };

  const handleAuthorChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      author: {
        name: prev.author?.name || "",
        title: prev.author?.title || "",
        organization: prev.author?.organization || "",
        bio: prev.author?.bio || "",
        imageUrl: prev.author?.imageUrl || "",
        ...prev.author,
        [field]: value,
      },
    }));
  };

  const handleSourceChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      source: {
        name: prev.source?.name || "",
        url: prev.source?.url || "",
        ...prev.source,
        [field]: value,
      },
    }));
  };

  const handleContactChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      contact: {
        name: prev.contact?.name || "",
        email: prev.contact?.email || "",
        phone: prev.contact?.phone || "",
        ...prev.contact,
        [field]: value,
      },
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center">
                <Newspaper className="w-6 h-6 mr-2 text-blue-600" />
                {initialData ? "Edit News Item" : "Create New News Item"}
              </h2>
              <button
                type="button"
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {errors.form && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md flex items-start">
                <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>{errors.form}</span>
              </div>
            )}

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title*{" "}
                    {errors.title && (
                      <span className="text-red-500 text-xs">
                        {" "}
                        - {errors.title}
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    name="title"
                    className={`w-full px-3 py-2 border ${
                      errors.title ? "border-red-300" : "border-gray-300"
                    } rounded-md`}
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    name="subtitle"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.subtitle}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type*{" "}
                    {errors.type && (
                      <span className="text-red-500 text-xs">
                        {" "}
                        - {errors.type}
                      </span>
                    )}
                  </label>
                  <select
                    name="type"
                    className={`w-full px-3 py-2 border ${
                      errors.type ? "border-red-300" : "border-gray-300"
                    } rounded-md`}
                    value={formData.type}
                    onChange={handleChange}
                    required
                  >
                    <option value="News Article">News Article</option>
                    <option value="Press Release">Press Release</option>
                    <option value="Announcement">Announcement</option>
                    <option value="Research Update">Research Update</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category*{" "}
                    {errors.category && (
                      <span className="text-red-500 text-xs">
                        {" "}
                        - {errors.category}
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    name="category"
                    className={`w-full px-3 py-2 border ${
                      errors.category ? "border-red-300" : "border-gray-300"
                    } rounded-md`}
                    value={formData.category}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Publication Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.date}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Read Time
                  </label>
                  <input
                    type="text"
                    name="readTime"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.readTime}
                    onChange={handleChange}
                    placeholder="e.g., 5 min"
                  />
                </div>
              </div>

              {/* Featured Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Featured Image*{" "}
                  {errors.image && (
                    <span className="text-red-500 text-xs">
                      {" "}
                      - {errors.image}
                    </span>
                  )}
                </label>

                <div className="space-y-4">
                  {/* File Upload */}
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-full px-4 py-3 border ${
                        errors.image ? "border-red-300" : "border-gray-300"
                      } rounded-md bg-white hover:bg-gray-50 flex items-center justify-center transition-colors`}
                    >
                      <Upload className="w-5 h-5 mr-2 text-gray-600" />
                      <span>
                        {imageFile
                          ? `Selected: ${imageFile.name}`
                          : initialData
                          ? "Change Featured Image"
                          : "Choose Featured Image"}
                      </span>
                    </button>
                    {imageFile && (
                      <p className="mt-1 text-xs text-gray-500 truncate">
                        File: {imageFile.name} (
                        {(imageFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>

                  {/* Image Preview */}
                  {(imagePreview || formData.imageUrl) && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Preview
                      </h4>
                      <div className="relative w-full h-48 overflow-hidden rounded-md border border-gray-200">
                        <img
                          src={imagePreview || formData.imageUrl}
                          alt="Featured image preview"
                          className="w-full h-full object-contain bg-gray-100"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                            const errorDiv = document.createElement("div");
                            errorDiv.className =
                              "w-full h-full flex items-center justify-center bg-gray-100 text-gray-500";
                            errorDiv.textContent = "Image failed to load";
                            (
                              e.target as HTMLImageElement
                            ).parentNode?.appendChild(errorDiv);
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Status and Featured toggle */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
                <div className="flex items-center pt-6">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.isFeatured}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isFeatured: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="featured"
                    className="ml-2 text-sm font-medium text-gray-700"
                  >
                    Feature this news item
                  </label>
                </div>
              </div>

              {/* Introduction */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Introduction*{" "}
                  {errors.introduction && (
                    <span className="text-red-500 text-xs">
                      {" "}
                      - {errors.introduction}
                    </span>
                  )}
                </label>
                <textarea
                  className={`w-full px-3 py-2 border ${
                    errors.introduction ? "border-red-300" : "border-gray-300"
                  } rounded-md`}
                  rows={4}
                  value={formData.content.introduction}
                  onChange={(e) =>
                    handleContentChange("introduction", e.target.value)
                  }
                  required
                />
              </div>

              {/* Sections */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Content Sections
                  </label>
                  <button
                    type="button"
                    onClick={addSection}
                    className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Section
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.content.sections.map((section, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <div
                        className="flex justify-between items-center bg-gray-50 px-4 py-3 cursor-pointer"
                        onClick={() => toggleExpandSection(index)}
                      >
                        <div className="flex items-center">
                          <span className="text-sm font-medium">
                            {section.heading || `Section ${index + 1}`}
                          </span>
                          {!section.heading && !section.content && (
                            <span className="ml-2 text-xs text-red-500">
                              (empty)
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeSection(index);
                            }}
                            className="text-gray-500 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {expandedSections.includes(index) ? (
                            <ChevronUp className="w-4 h-4 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          )}
                        </div>
                      </div>

                      {expandedSections.includes(index) && (
                        <div className="p-4 space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Heading
                            </label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                              value={section.heading}
                              onChange={(e) =>
                                updateSection(index, "heading", e.target.value)
                              }
                              placeholder="Section heading"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Content
                            </label>
                            <textarea
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                              rows={4}
                              value={section.content}
                              onChange={(e) =>
                                updateSection(index, "content", e.target.value)
                              }
                              placeholder="Section content"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Conclusion */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Conclusion
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={4}
                  value={formData.content.conclusion}
                  onChange={(e) =>
                    handleContentChange("conclusion", e.target.value)
                  }
                  placeholder="Optional conclusion paragraph"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex">
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add tag"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                  >
                    <Tag className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Author Information */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Author Information (Optional)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Author Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={formData.author?.name || ""}
                      onChange={(e) =>
                        handleAuthorChange("name", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={formData.author?.title || ""}
                      onChange={(e) =>
                        handleAuthorChange("title", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Organization
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={formData.author?.organization || ""}
                      onChange={(e) =>
                        handleAuthorChange("organization", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      rows={3}
                      value={formData.author?.bio || ""}
                      onChange={(e) =>
                        handleAuthorChange("bio", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Author Image Upload */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Author Image
                  </label>
                  <div className="space-y-4">
                    {/* File Upload */}
                    <div>
                      <input
                        type="file"
                        ref={authorFileInputRef}
                        onChange={handleAuthorImageFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => authorFileInputRef.current?.click()}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 flex items-center justify-center"
                      >
                        <Upload className="w-5 h-5 mr-2 text-gray-600" />
                        <span>
                          {authorImageFile
                            ? `Selected: ${authorImageFile.name}`
                            : "Choose Author Image"}
                        </span>
                      </button>
                      {authorImageFile && (
                        <p className="mt-1 text-xs text-gray-500 truncate">
                          File: {authorImageFile.name}
                        </p>
                      )}
                    </div>

                    {/* Author Image Preview */}
                    {(authorImagePreview || formData.author?.imageUrl) && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Preview
                        </h4>
                        <div className="relative w-24 h-24 overflow-hidden rounded-full border border-gray-200">
                          <img
                            src={
                              authorImagePreview || formData.author?.imageUrl
                            }
                            alt="Author preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Source Information */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Source Information (Optional)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Source Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={formData.source?.name || ""}
                      onChange={(e) =>
                        handleSourceChange("name", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Source URL
                    </label>
                    <input
                      type="url"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={formData.source?.url || ""}
                      onChange={(e) =>
                        handleSourceChange("url", e.target.value)
                      }
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information (for press releases) */}
              {formData.type === "Press Release" && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={formData.contact?.name || ""}
                        onChange={(e) =>
                          handleContactChange("name", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={formData.contact?.email || ""}
                        onChange={(e) =>
                          handleContactChange("email", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={formData.contact?.phone || ""}
                        onChange={(e) =>
                          handleContactChange("phone", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 flex items-center justify-center min-w-32 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={
                    isSubmitting ||
                    !formData.title ||
                    !formData.type ||
                    !formData.category ||
                    !formData.content.introduction ||
                    (!imageFile && !initialData)
                  }
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      {initialData ? "Update" : "Create"} News Item
                    </>
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

export default CreateNewsModal;
