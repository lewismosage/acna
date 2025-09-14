import React from "react";
import { Eye, EyeOff, CheckCircle, AlertCircle, Star, ImageIcon } from "lucide-react";

interface FormData {
  title: string;
  description: string;
  type: string;
  category: string;
  format: string;
  duration: string;
  instructor: string;
  location: string;
  maxParticipants: string;
  price: string;
  currency: string;
  startDate: string;
  endDate: string;
  imageFile: File | null;
  imageUrl: string;
  targetAudience: string[];
  status: "Published" | "Draft" | "Archived";
  isFeatured: boolean;
}

interface FormErrors {
  [key: string]: string;
}

interface ReviewStepProps {
  formData: FormData;
  errors: FormErrors;
  showPreview: boolean;
  isSubmitting: boolean;
  uploadProgress: number;
  onTogglePreview: () => void;
}

const ReviewStep: React.FC<ReviewStepProps> = ({
  formData,
  errors,
  showPreview,
  isSubmitting,
  uploadProgress,
  onTogglePreview,
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Review & Publish</h3>

      {/* Preview Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <span className="font-medium text-gray-900">Preview Program</span>
        <button
          type="button"
          onClick={onTogglePreview}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                    src={formData.imageFile ? URL.createObjectURL(formData.imageFile) : formData.imageUrl}
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
                <div className="absolute bottom-3 left-3">
                  <span className="bg-indigo-600 text-white px-2 py-1 text-xs font-bold rounded">
                    {formData.type}
                  </span>
                </div>
              </div>
            </div>

            {/* Preview Content */}
            <div className="lg:w-3/4">
              <h4 className="text-xl font-bold text-gray-900 mb-2">{formData.title}</h4>
              <div className="flex items-center text-gray-600 text-sm mb-3">
                <span>{formData.category}</span>
                <span className="mx-2">•</span>
                <span>{formData.format}</span>
                <span className="mx-2">•</span>
                <span>{formData.duration}</span>
              </div>

              <p className="text-gray-600 text-sm mb-4">{formData.description}</p>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                <div><span className="font-medium">Instructor:</span> {formData.instructor}</div>
                <div><span className="font-medium">Location:</span> {formData.location}</div>
                <div><span className="font-medium">Max Participants:</span> {formData.maxParticipants}</div>
                <div><span className="font-medium">Price:</span> {formData.currency} ${formData.price}</div>
                <div><span className="font-medium">Start Date:</span> {formData.startDate}</div>
                <div><span className="font-medium">End Date:</span> {formData.endDate}</div>
              </div>

              {formData.targetAudience.length > 0 && (
                <div className="mb-4">
                  <span className="font-medium text-gray-700 text-sm">Target Audience: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.targetAudience.map((audience, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded">
                        {audience}
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
            <span className="font-medium text-blue-900">Creating Program...</span>
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
          Program Summary
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
            <span className="font-medium text-blue-800">Duration:</span>
            <p className="text-blue-700">{formData.duration}</p>
          </div>
          <div>
            <span className="font-medium text-blue-800">Instructor:</span>
            <p className="text-blue-700">{formData.instructor}</p>
          </div>
          <div>
            <span className="font-medium text-blue-800">Max Participants:</span>
            <p className="text-blue-700">{formData.maxParticipants}</p>
          </div>
          <div>
            <span className="font-medium text-blue-800">Price:</span>
            <p className="text-blue-700">{formData.currency} ${formData.price}</p>
          </div>
          <div>
            <span className="font-medium text-blue-800">Status:</span>
            <p className="text-blue-700">{formData.status}</p>
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
};

export default ReviewStep;