import React from "react";
import { Plus, Minus } from "lucide-react";

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

interface FormData {
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  language: string;
  timezone: string;
  schedule: ScheduleItem[];
  speakers: Speaker[];
}

interface FormErrors {
  [key: string]: string;
}

interface ScheduleLogisticsStepProps {
  formData: FormData;
  errors: FormErrors;
  onInputChange: (field: string, value: any) => void;
  onScheduleChange: (
    index: number,
    field: keyof ScheduleItem,
    value: string
  ) => void;
  onSpeakerChange: (index: number, field: keyof Speaker, value: string) => void;
}

const ScheduleLogisticsStep: React.FC<ScheduleLogisticsStepProps> = ({
  formData,
  errors,
  onInputChange,
  onScheduleChange,
  onSpeakerChange,
}) => {
  const languages = [
    "English",
    "French",
    "Swahili",
    "Arabic",
    "Portuguese",
    "Hausa",
    "Amharic",
  ];
  const timezones = ["GMT", "CET", "EAT", "WAT", "CAT", "SAST"];

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">
        Schedule & Logistics
      </h3>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date *
          </label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => onInputChange("startDate", e.target.value)}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
              errors.startDate ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.startDate && (
            <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date *
          </label>
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => onInputChange("endDate", e.target.value)}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
              errors.endDate ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.endDate && (
            <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Registration Deadline *
          </label>
          <input
            type="date"
            value={formData.registrationDeadline}
            onChange={(e) =>
              onInputChange("registrationDeadline", e.target.value)
            }
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
              errors.registrationDeadline ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.registrationDeadline && (
            <p className="text-red-500 text-sm mt-1">
              {errors.registrationDeadline}
            </p>
          )}
        </div>
      </div>

      {/* Language and Timezone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Language
          </label>
          <select
            value={formData.language}
            onChange={(e) => onInputChange("language", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {languages.map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <select
            value={formData.timezone}
            onChange={(e) => onInputChange("timezone", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {timezones.map((timezone) => (
              <option key={timezone} value={timezone}>
                {timezone}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Program Schedule */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Program Schedule
        </label>
        {formData.schedule.length === 0 && (
          <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500 mb-2">No schedule items added yet</p>
            <button
              type="button"
              onClick={() =>
                onInputChange("schedule", [
                  { day: "Day 1", time: "", activity: "", speaker: "" },
                ])
              }
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Add Schedule Item
            </button>
          </div>
        )}
        {formData.schedule.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3 p-4 border border-gray-200 rounded-lg"
          >
            <input
              type="text"
              value={item.day}
              onChange={(e) => onScheduleChange(index, "day", e.target.value)}
              className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
              placeholder="Day 1"
            />
            <input
              type="time"
              value={item.time}
              onChange={(e) => onScheduleChange(index, "time", e.target.value)}
              className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="text"
              value={item.activity}
              onChange={(e) =>
                onScheduleChange(index, "activity", e.target.value)
              }
              className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
              placeholder="Opening Ceremony"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={item.speaker}
                onChange={(e) =>
                  onScheduleChange(index, "speaker", e.target.value)
                }
                className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                placeholder="Speaker Name"
              />
              {index === 0 ? (
                <button
                  type="button"
                  onClick={() =>
                    onInputChange("schedule", [
                      ...formData.schedule,
                      {
                        day: `Day ${formData.schedule.length + 1}`,
                        time: "",
                        activity: "",
                        speaker: "",
                      },
                    ])
                  }
                  className="px-3 py-2 bg-indigo-100 text-indigo-600 rounded hover:bg-indigo-200"
                >
                  <Plus className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    onInputChange(
                      "schedule",
                      formData.schedule.filter((_, i) => i !== index)
                    )
                  }
                  className="px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                >
                  <Minus className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Speakers */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Featured Speakers
        </label>
        {formData.speakers.length === 0 && (
          <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500 mb-2">No speakers added yet</p>
            <button
              type="button"
              onClick={() =>
                onInputChange("speakers", [
                  { name: "", title: "", organization: "", bio: "" },
                ])
              }
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Add Speaker
            </button>
          </div>
        )}
        {formData.speakers.map((speaker, index) => (
          <div
            key={index}
            className="p-4 border border-gray-200 rounded-lg mb-3 space-y-3"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                value={speaker.name}
                onChange={(e) => onSpeakerChange(index, "name", e.target.value)}
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Dr. Sarah Mbeki"
              />
              <input
                type="text"
                value={speaker.title}
                onChange={(e) =>
                  onSpeakerChange(index, "title", e.target.value)
                }
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Chief of Pediatric Neurology"
              />
            </div>
            <input
              type="text"
              value={speaker.organization}
              onChange={(e) =>
                onSpeakerChange(index, "organization", e.target.value)
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Kenyatta National Hospital"
            />
            <div className="flex gap-2">
              <textarea
                value={speaker.bio}
                onChange={(e) => onSpeakerChange(index, "bio", e.target.value)}
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                rows={2}
                placeholder="Brief biography and expertise..."
              />
              {index === 0 ? (
                <button
                  type="button"
                  onClick={() =>
                    onInputChange("speakers", [
                      ...formData.speakers,
                      { name: "", title: "", organization: "", bio: "" },
                    ])
                  }
                  className="px-4 py-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 self-start"
                >
                  <Plus className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    onInputChange(
                      "speakers",
                      formData.speakers.filter((_, i) => i !== index)
                    )
                  }
                  className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 self-start"
                >
                  <Minus className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScheduleLogisticsStep;
