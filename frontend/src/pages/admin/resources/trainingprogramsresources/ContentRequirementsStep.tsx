import React from "react";
import { Plus, Minus, X, Upload, Star } from "lucide-react";

interface FormData {
  imageFile: File | null;
  imageUrl: string;
  prerequisites: string[];
  learningOutcomes: string[];
  topics: string[];
  materials: string[];
  certificationType: string;
  cmeCredits: string;
  assessmentMethod: string;
  passingScore: string;
  status: "Published" | "Draft" | "Archived";
  isFeatured: boolean;
}

interface FormErrors {
  [key: string]: string;
}

interface ContentRequirementsStepProps {
  formData: FormData;
  errors: FormErrors;
  onInputChange: (field: string, value: any) => void;
  onArrayChange: (field: string, index: number, value: string) => void;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ContentRequirementsStep: React.FC<ContentRequirementsStepProps> = ({
  formData,
  errors,
  onInputChange,
  onArrayChange,
  onImageUpload,
}) => {
  const certificateTypes = [
    "CME Certificate", 
    "CPD Certificate", 
    "Completion Certificate", 
    "Professional Certificate", 
    "Fellowship Certificate"
  ];
  const assessmentMethods = [
    "None", 
    "Quiz", 
    "Assignment", 
    "Presentation", 
    "Practical Exam", 
    "Case Study"
  ];

  const addArrayItem = (field: string, defaultValue = "") => {
    const currentArray = formData[field as keyof FormData] as string[];
    onInputChange(field, [...currentArray, defaultValue]);
  };

  const removeArrayItem = (field: string, index: number) => {
    const currentArray = formData[field as keyof FormData] as string[];
    onInputChange(field, currentArray.filter((_, i) => i !== index));
  };

  const renderArrayField = (
    field: keyof FormData,
    label: string,
    placeholder: string,
    required: boolean = false
  ) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && "*"}
      </label>
      {(formData[field] as string[]).map((item, index) => (
        <div key={index} className="flex gap-2 mb-2">
          <input
            type="text"
            value={item}
            onChange={(e) => onArrayChange(field as string, index, e.target.value)}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder={placeholder}
          />
          {index === 0 ? (
            <button
              type="button"
              onClick={() => addArrayItem(field as string)}
              className="px-4 py-3 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200"
            >
              <Plus className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => removeArrayItem(field as string, index)}
              className="px-4 py-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
            >
              <Minus className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
      {required && errors[field as string] && (
        <p className="text-red-500 text-sm mt-1">{errors[field as string]}</p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Content & Requirements</h3>

      {/* Cover Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Program Cover Image</label>
        <div className="flex items-center gap-4">
          <label className="flex flex-col items-center justify-center w-32 h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 transition-colors">
            {formData.imageFile || formData.imageUrl ? (
              <div className="relative w-full h-full">
                <img
                  src={formData.imageFile ? URL.createObjectURL(formData.imageFile) : formData.imageUrl}
                  alt="Program cover"
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    onInputChange("imageFile", null);
                    onInputChange("imageUrl", "");
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600 text-center px-2">Upload Cover</span>
                <span className="text-xs text-gray-400 text-center px-2">JPEG, PNG, WebP</span>
              </>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={onImageUpload}
              className="hidden"
            />
          </label>
        </div>
        {errors.coverImage && <p className="text-red-500 text-sm mt-1">{errors.coverImage}</p>}
        <p className="text-gray-500 text-sm mt-1">Recommended: 400x600px, max 10MB</p>
      </div>

      {/* Prerequisites */}
      {renderArrayField("prerequisites", "Prerequisites", "Medical degree, 2+ years experience", true)}

      {/* Learning Outcomes */}
      {renderArrayField("learningOutcomes", "Learning Outcomes", "Latest advances in pediatric neurology", true)}

      {/* Topics Covered */}
      {renderArrayField("topics", "Main Topics Covered", "Epilepsy management, Cerebral palsy assessment")}

      {/* Materials Provided */}
      {renderArrayField("materials", "Materials Provided", "Course handbook, Video recordings, Assessment tools")}

      {/* Certification Information */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <h4 className="font-medium text-gray-900">Certification & Assessment</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Certificate Type</label>
            <select
              value={formData.certificationType}
              onChange={(e) => onInputChange("certificationType", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {certificateTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">CME Credits</label>
            <input
              type="number"
              value={formData.cmeCredits}
              onChange={(e) => onInputChange("cmeCredits", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="24"
              min="0"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assessment Method</label>
            <select
              value={formData.assessmentMethod}
              onChange={(e) => onInputChange("assessmentMethod", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {assessmentMethods.map((method) => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>

          {formData.assessmentMethod !== "None" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Passing Score (%)</label>
              <input
                type="number"
                value={formData.passingScore}
                onChange={(e) => onInputChange("passingScore", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="80"
                min="0"
                max="100"
              />
            </div>
          )}
        </div>
      </div>

      {/* Publication Settings */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <h4 className="font-medium text-gray-900">Publication Settings</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => onInputChange("status", e.target.value)}
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
                onChange={(e) => onInputChange("isFeatured", e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <div className="ml-3">
                <span className="text-sm font-medium text-gray-700 flex items-center">
                  <Star className="w-4 h-4 mr-1 text-yellow-500" />
                  Featured Program
                </span>
                <p className="text-xs text-gray-500">Display prominently in listings</p>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentRequirementsStep;