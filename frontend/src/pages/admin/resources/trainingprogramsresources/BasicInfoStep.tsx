import React from "react";
import { Plus, Minus } from "lucide-react";

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

type ProgramStatus = "Published" | "Draft" | "Archived";
type ProgramType =
  | "Conference"
  | "Workshop"
  | "Fellowship"
  | "Online Course"
  | "Masterclass";
type ProgramFormat = "In-person" | "Virtual" | "Hybrid";

interface FormErrors {
  [key: string]: string;
}

interface BasicInfoStepProps {
  formData: FormData;
  errors: FormErrors;
  onInputChange: (field: keyof FormData, value: any) => void;
  onScheduleChange: (
    index: number,
    field: keyof ScheduleItem,
    value: string
  ) => void;
  onSpeakerChange: (index: number, field: keyof Speaker, value: string) => void;
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  formData,
  errors,
  onInputChange,
  onScheduleChange,
  onSpeakerChange,
}) => {
  const programTypes: ProgramType[] = [
    "Conference",
    "Workshop",
    "Fellowship",
    "Online Course",
    "Masterclass",
  ];
  const programFormats: ProgramFormat[] = ["In-person", "Virtual", "Hybrid"];
  const categories = [
    "Professional Development",
    "Clinical Training",
    "Research & Academia",
    "Leadership & Management",
    "Certification Programs",
    "Continuing Education",
    "Specialized Skills",
    "Assessment & Diagnosis",
  ];
  const currencies = ["USD", "EUR", "GBP", "KES", "NGN", "ZAR", "GHS"];
  const timezones = ["GMT", "CET", "EAT", "WAT", "CAT", "SAST"];
  const audienceOptions = [
    "Healthcare Providers",
    "Medical Students",
    "Nurses",
    "Therapists",
    "Researchers",
    "Administrators",
    "Parents & Caregivers",
    "Community Health Workers",
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">
        Basic Program Information
      </h3>

      {/* Program Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Program Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => onInputChange("title", e.target.value)}
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
            errors.title ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="e.g., Annual Pediatric Neurology Conference"
          maxLength={150}
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title}</p>
        )}
        <p className="text-gray-500 text-sm mt-1">
          {formData.title.length}/150 characters
        </p>
      </div>

      {/* Program Type and Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Program Type
          </label>
          <select
            value={formData.type}
            onChange={(e) =>
              onInputChange("type", e.target.value as ProgramType)
            }
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {programTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            value={formData.category}
            onChange={(e) => onInputChange("category", e.target.value)}
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
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Program Description *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => onInputChange("description", e.target.value)}
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
            errors.description ? "border-red-500" : "border-gray-300"
          }`}
          rows={4}
          placeholder="Detailed description of the program, its objectives, and what participants will gain"
          maxLength={1000}
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description}</p>
        )}
        <p className="text-gray-500 text-sm mt-1">
          {formData.description.length}/1000 characters
        </p>
      </div>

      {/* Instructor and Duration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lead Instructor *
          </label>
          <input
            type="text"
            value={formData.instructor}
            onChange={(e) => onInputChange("instructor", e.target.value)}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
              errors.instructor ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Dr. Sarah Mbeki, Prof. John Okoye"
          />
          {errors.instructor && (
            <p className="text-red-500 text-sm mt-1">{errors.instructor}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration *
          </label>
          <input
            type="text"
            value={formData.duration}
            onChange={(e) => onInputChange("duration", e.target.value)}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
              errors.duration ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="e.g., 3 Days, 6 Weeks, 12 Months"
          />
          {errors.duration && (
            <p className="text-red-500 text-sm mt-1">{errors.duration}</p>
          )}
        </div>
      </div>

      {/* Format and Location */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Format
          </label>
          <select
            value={formData.format}
            onChange={(e) =>
              onInputChange("format", e.target.value as ProgramFormat)
            }
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {programFormats.map((format) => (
              <option key={format} value={format}>
                {format}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => onInputChange("location", e.target.value)}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
              errors.location ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="e.g., Accra, Ghana / Virtual Platform"
          />
          {errors.location && (
            <p className="mt-1 text-sm text-red-600">{errors.location}</p>
          )}
        </div>
      </div>

      {/* Participants and Pricing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Participants *
          </label>
          <input
            type="number"
            value={formData.maxParticipants}
            onChange={(e) => onInputChange("maxParticipants", e.target.value)}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
              errors.maxParticipants ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="500"
            min="1"
          />
          {errors.maxParticipants && (
            <p className="text-red-500 text-sm mt-1">
              {errors.maxParticipants}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price *
          </label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => onInputChange("price", e.target.value)}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
              errors.price ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="450"
            min="0"
            step="0.01"
          />
          {errors.price && (
            <p className="text-red-500 text-sm mt-1">{errors.price}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Currency
          </label>
          <select
            value={formData.currency}
            onChange={(e) => onInputChange("currency", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {currencies.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </div>
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
                    onInputChange("targetAudience", [
                      ...formData.targetAudience,
                      audience,
                    ]);
                  } else {
                    onInputChange(
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
    </div>
  );
};

export default BasicInfoStep;
