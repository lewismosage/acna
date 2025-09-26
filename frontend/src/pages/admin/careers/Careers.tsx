import React, { useState, useEffect } from "react";
import {
  Briefcase,
  Plus,
  Search,
  Edit3,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  Users,
  FileText,
  Calendar,
  MapPin,
  Filter,
  Mail,
  Phone,
  ChevronDown,
  ChevronUp,
  Settings,
  Loader,
} from "lucide-react";
import AlertModal from "../../../components/common/AlertModal";
import {
  careersApi,
  JobOpportunity,
  JobApplication,
  VolunteerSubmission,
  CreateJobOpportunityInput,
  JobStatus,
  JobType,
  JobLevel,
  WorkArrangement,
  ApplicationStatus,
  VolunteerStatus,
} from "../../../services/careersAPI";

// TypeScript interfaces
interface JobFormData {
  title: string;
  department: string;
  location: string;
  type: JobType;
  level: JobLevel;
  status: JobStatus;
  description: string;
  requirements: string[];
  responsibilities: string[];
  qualifications: string[];
  benefits: string[];
  salary: string;
  closingDate: string;
  contractDuration: string;
  workArrangement: WorkArrangement;
}

interface JobCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (jobData: JobFormData) => Promise<void>;
  editingItem: JobOpportunity | null;
}

interface AlertModalState {
  isOpen: boolean;
  title: string;
  message: string;
  type: "info" | "success" | "error" | "confirm";
  onConfirm?: () => void;
}

// Job Creation Component
const JobCreationModal: React.FC<JobCreationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
}) => {
  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    department: "",
    location: "",
    type: "Full-time",
    level: "Mid-level",
    status: "Draft",
    description: "",
    requirements: [""],
    responsibilities: [""],
    qualifications: [""],
    benefits: [""],
    salary: "",
    closingDate: "",
    contractDuration: "",
    workArrangement: "On-site",
  });

  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setFormData({
        title: editingItem.title || "",
        department: editingItem.department || "",
        location: editingItem.location || "",
        type: editingItem.type || "Full-time",
        level: editingItem.level || "Mid-level",
        status: editingItem.status || "Draft",
        description: editingItem.description || "",
        requirements: editingItem.requirements || [""],
        responsibilities: editingItem.responsibilities || [""],
        qualifications: editingItem.qualifications || [""],
        benefits: editingItem.benefits || [""],
        salary: editingItem.salary || "",
        closingDate: editingItem.closingDate || "",
        contractDuration: editingItem.contractDuration || "",
        workArrangement: editingItem.workArrangement || "On-site",
      });
    } else {
      // Reset form for new job
      setFormData({
        title: "",
        department: "",
        location: "",
        type: "Full-time",
        level: "Mid-level",
        status: "Draft",
        description: "",
        requirements: [""],
        responsibilities: [""],
        qualifications: [""],
        benefits: [""],
        salary: "",
        closingDate: "",
        contractDuration: "",
        workArrangement: "On-site",
      });
    }
    setErrors({});
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (field: keyof JobFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleArrayChange = (
    field: keyof Pick<
      JobFormData,
      "requirements" | "responsibilities" | "qualifications" | "benefits"
    >,
    index: number,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const addArrayItem = (
    field: keyof Pick<
      JobFormData,
      "requirements" | "responsibilities" | "qualifications" | "benefits"
    >
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const removeArrayItem = (
    field: keyof Pick<
      JobFormData,
      "requirements" | "responsibilities" | "qualifications" | "benefits"
    >,
    index: number
  ) => {
    if (formData[field].length > 1) {
      setFormData((prev) => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index),
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "Job title is required";
    if (!formData.department.trim())
      newErrors.department = "Department is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.description.trim())
      newErrors.description = "Job description is required";
    if (!formData.salary.trim()) newErrors.salary = "Salary range is required";
    if (!formData.closingDate)
      newErrors.closingDate = "Closing date is required";

    // Validate that array fields have at least one non-empty item
    if (!formData.requirements.some((req) => req.trim())) {
      newErrors.requirements = "At least one requirement is needed";
    }
    if (!formData.responsibilities.some((resp) => resp.trim())) {
      newErrors.responsibilities = "At least one responsibility is needed";
    }
    if (!formData.qualifications.some((qual) => qual.trim())) {
      newErrors.qualifications = "At least one qualification is needed";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      try {
        // Filter out empty strings from arrays
        const cleanedData = {
          ...formData,
          requirements: formData.requirements.filter((req) => req.trim()),
          responsibilities: formData.responsibilities.filter((resp) =>
            resp.trim()
          ),
          qualifications: formData.qualifications.filter((qual) => qual.trim()),
          benefits: formData.benefits.filter((ben) => ben.trim()),
        };

        await onSave(cleanedData);
        onClose();
      } catch (error) {
        console.error("Error saving job:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const departments = [
    "Clinical Services",
    "Research",
    "Technology",
    "Operations",
    "Administration",
    "Finance",
    "Human Resources",
    "Marketing",
    "Education & Training",
  ];

  const locations = [
    "Nairobi, Kenya",
    "Abuja, Nigeria",
    "Lagos, Nigeria",
    "Accra, Ghana",
    "Cape Town, South Africa",
    "Addis Ababa, Ethiopia",
    "Kampala, Uganda",
    "Dar es Salaam, Tanzania",
    "Remote",
    "Multiple Locations",
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {editingItem
                ? "Edit Job Opportunity"
                : "Create New Job Opportunity"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              disabled={loading}
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 ${
                  errors.title ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="e.g., Senior Pediatric Neurologist"
                disabled={loading}
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department *
              </label>
              <select
                value={formData.department}
                onChange={(e) =>
                  handleInputChange("department", e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 ${
                  errors.department ? "border-red-300" : "border-gray-300"
                }`}
                disabled={loading}
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              {errors.department && (
                <p className="text-red-500 text-xs mt-1">{errors.department}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <select
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 ${
                  errors.location ? "border-red-300" : "border-gray-300"
                }`}
                disabled={loading}
              >
                <option value="">Select Location</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
              {errors.location && (
                <p className="text-red-500 text-xs mt-1">{errors.location}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employment Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange("type", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                disabled={loading}
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
                <option value="Volunteer">Volunteer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience Level
              </label>
              <select
                value={formData.level}
                onChange={(e) => handleInputChange("level", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                disabled={loading}
              >
                <option value="Entry-level">Entry-level</option>
                <option value="Mid-level">Mid-level</option>
                <option value="Senior">Senior</option>
                <option value="Executive">Executive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Work Arrangement
              </label>
              <select
                value={formData.workArrangement}
                onChange={(e) =>
                  handleInputChange("workArrangement", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                disabled={loading}
              >
                <option value="On-site">On-site</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          {/* Salary and Dates */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salary Range *
              </label>
              <input
                type="text"
                value={formData.salary}
                onChange={(e) => handleInputChange("salary", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 ${
                  errors.salary ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="e.g., $45,000 - $65,000"
                disabled={loading}
              />
              {errors.salary && (
                <p className="text-red-500 text-xs mt-1">{errors.salary}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Application Closing Date *
              </label>
              <input
                type="date"
                value={formData.closingDate}
                onChange={(e) =>
                  handleInputChange("closingDate", e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 ${
                  errors.closingDate ? "border-red-300" : "border-gray-300"
                }`}
                disabled={loading}
              />
              {errors.closingDate && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.closingDate}
                </p>
              )}
            </div>

            {formData.type === "Contract" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contract Duration
                </label>
                <input
                  type="text"
                  value={formData.contractDuration}
                  onChange={(e) =>
                    handleInputChange("contractDuration", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                  placeholder="e.g., 6 months, 1 year"
                  disabled={loading}
                />
              </div>
            )}
          </div>

          {/* Job Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 ${
                errors.description ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Provide a comprehensive description of the role, its purpose, and how it fits within the organization..."
              disabled={loading}
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
            )}
          </div>

          {/* Dynamic Arrays */}
          {[
            {
              field: "responsibilities" as const,
              label: "Key Responsibilities",
              placeholder:
                "e.g., Lead clinical services for pediatric neurology programs",
            },
            {
              field: "requirements" as const,
              label: "Requirements",
              placeholder: "e.g., MD with neurology specialization",
            },
            {
              field: "qualifications" as const,
              label: "Qualifications",
              placeholder: "e.g., 5+ years pediatric experience",
            },
            {
              field: "benefits" as const,
              label: "Benefits & Perks",
              placeholder:
                "e.g., Health insurance, Professional development opportunities",
            },
          ].map(({ field, label, placeholder }) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}{" "}
                {(field === "responsibilities" ||
                  field === "requirements" ||
                  field === "qualifications") &&
                  "*"}
              </label>
              <div className="space-y-2">
                {formData[field].map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) =>
                        handleArrayChange(field, index, e.target.value)
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                      placeholder={placeholder}
                      disabled={loading}
                    />
                    {formData[field].length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem(field, index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-300"
                        disabled={loading}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem(field)}
                  className="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center"
                  disabled={loading}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add {label.slice(0, -1)}
                </button>
              </div>
              {errors[field] && (
                <p className="text-red-500 text-xs mt-1">{errors[field]}</p>
              )}
            </div>
          ))}

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Publication Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange("status", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
              disabled={loading}
            >
              <option value="Draft">Draft</option>
              <option value="Active">Active</option>
              <option value="Closed">Closed</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Draft: Not visible to applicants | Active: Open for applications |
              Closed: No longer accepting applications
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  {editingItem ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  {editingItem
                    ? "Update Job Opportunity"
                    : "Create Job Opportunity"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CareersAdminTab = () => {
  const [selectedTab, setSelectedTab] = useState("opportunities");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [expandedOpportunity, setExpandedOpportunity] = useState<number | null>(
    null
  );
  const [expandedApplication, setExpandedApplication] = useState<number | null>(
    null
  );
  const [expandedVolunteer, setExpandedVolunteer] = useState<number | null>(
    null
  );
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingItem, setEditingItem] = useState<JobOpportunity | null>(null);
  const [alertModal, setAlertModal] = useState<AlertModalState>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  // Data state
  const [opportunities, setOpportunities] = useState<JobOpportunity[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [volunteers, setVolunteers] = useState<VolunteerSubmission[]>([]);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<Record<number, boolean>>(
    {}
  );

  // Fetch all data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // Fetch specific data when tab changes
  useEffect(() => {
    if (selectedTab === "opportunities" && opportunities.length === 0) {
      fetchOpportunities();
    } else if (selectedTab === "applications" && applications.length === 0) {
      fetchApplications();
    } else if (selectedTab === "volunteers" && volunteers.length === 0) {
      fetchVolunteers();
    }
  }, [selectedTab]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [jobsData, applicationsData, volunteersData] = await Promise.all([
        careersApi.getAllJobs(),
        careersApi.getAllApplications(),
        careersApi.getAllVolunteers(),
      ]);

      setOpportunities(jobsData);
      setApplications(applicationsData);
      setVolunteers(volunteersData);
    } catch (error) {
      console.error("Error fetching all data:", error);
      showAlert(
        "Error",
        "Failed to load some data. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchOpportunities = async () => {
    try {
      const data = await careersApi.getAllJobs();
      setOpportunities(data);
    } catch (error) {
      console.error("Error fetching opportunities:", error);
      showAlert(
        "Error",
        "Failed to load opportunities. Please try again.",
        "error"
      );
    }
  };

  const fetchApplications = async () => {
    try {
      const data = await careersApi.getAllApplications();
      setApplications(data);
    } catch (error) {
      console.error("Error fetching applications:", error);
      showAlert(
        "Error",
        "Failed to load applications. Please try again.",
        "error"
      );
    }
  };

  const fetchVolunteers = async () => {
    try {
      const data = await careersApi.getAllVolunteers();
      setVolunteers(data);
    } catch (error) {
      console.error("Error fetching volunteers:", error);
      showAlert(
        "Error",
        "Failed to load volunteers. Please try again.",
        "error"
      );
    }
  };

  const showAlert = (
    title: string,
    message: string,
    type: "info" | "success" | "error" | "confirm" = "info"
  ) => {
    setAlertModal({ isOpen: true, title, message, type });
  };

  const setItemLoading = (id: number, isLoading: boolean) => {
    setActionLoading((prev) => ({
      ...prev,
      [id]: isLoading,
    }));
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "Active":
      case "Shortlisted":
        return "bg-green-100 text-green-800 border-green-200";
      case "Draft":
      case "Under Review":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Closed":
      case "Rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "New":
      case "Pending Review":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string): React.ReactElement => {
    switch (status) {
      case "Active":
      case "Shortlisted":
        return <CheckCircle className="w-4 h-4" />;
      case "Draft":
      case "Under Review":
        return <Clock className="w-4 h-4" />;
      case "Closed":
      case "Rejected":
        return <XCircle className="w-4 h-4" />;
      case "New":
      case "Pending Review":
        return <Settings className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const toggleExpandOpportunity = async (id: number) => {
    if (expandedOpportunity === id) {
      setExpandedOpportunity(null);
    } else {
      setExpandedOpportunity(id);
      // Fetch full job data when expanding
      try {
        const fullJobData = await careersApi.getJobById(id);
        setOpportunities((prev) =>
          prev.map((job) => (job.id === id ? fullJobData : job))
        );
      } catch (error) {
        console.error("Error fetching full job data:", error);
      }
    }
  };

  const toggleExpandApplication = (id: number) => {
    setExpandedApplication((prev) => (prev === id ? null : id));
  };

  const toggleExpandVolunteer = (id: number) => {
    setExpandedVolunteer((prev) => (prev === id ? null : id));
  };

  const handleDelete = (id: number) => {
    setAlertModal({
      isOpen: true,
      title: "Confirm Deletion",
      message:
        "Are you sure you want to delete this item? This action cannot be undone.",
      type: "confirm",
      onConfirm: async () => {
        setItemLoading(id, true);
        try {
          if (selectedTab === "opportunities") {
            await careersApi.deleteJob(id);
            setOpportunities((prev) => prev.filter((item) => item.id !== id));
          } else if (selectedTab === "applications") {
            await careersApi.deleteApplication(id);
            setApplications((prev) => prev.filter((item) => item.id !== id));
          } else if (selectedTab === "volunteers") {
            await careersApi.deleteVolunteer(id);
            setVolunteers((prev) => prev.filter((item) => item.id !== id));
          }
          showAlert("Success", "Item deleted successfully", "success");
        } catch (error) {
          console.error("Error deleting item:", error);
          showAlert(
            "Error",
            "Failed to delete item. Please try again.",
            "error"
          );
        } finally {
          setItemLoading(id, false);
        }
      },
    });
  };

  const handleSaveJob = async (jobData: JobFormData) => {
    try {
      if (editingItem) {
        // Update existing job
        const updatedJob = await careersApi.updateJob(
          editingItem.id,
          jobData as CreateJobOpportunityInput
        );
        setOpportunities((prev) =>
          prev.map((job) => (job.id === editingItem.id ? updatedJob : job))
        );
        showAlert("Success", "Job opportunity updated successfully", "success");
      } else {
        // Create new job
        const newJob = await careersApi.createJob(
          jobData as CreateJobOpportunityInput
        );
        setOpportunities((prev) => [newJob, ...prev]);
        showAlert("Success", "Job opportunity created successfully", "success");
      }
      setEditingItem(null);
    } catch (error) {
      console.error("Error saving job:", error);
      showAlert(
        "Error",
        "Failed to save job opportunity. Please try again.",
        "error"
      );
      throw error; // Re-throw to prevent modal from closing
    }
  };

  const handleStatusUpdate = async (
    id: number,
    newStatus: string,
    type: string
  ) => {
    setItemLoading(id, true);
    try {
      if (type === "opportunities") {
        const updatedJob = await careersApi.updateJobStatus(
          id,
          newStatus as JobStatus
        );
        setOpportunities((prev) =>
          prev.map((job) => (job.id === id ? updatedJob : job))
        );
      } else if (type === "applications") {
        const updatedApp = await careersApi.updateApplicationStatus(
          id,
          newStatus as ApplicationStatus
        );
        setApplications((prev) =>
          prev.map((app) => (app.id === id ? updatedApp : app))
        );
      } else if (type === "volunteers") {
        const updatedVol = await careersApi.updateVolunteerStatus(
          id,
          newStatus as VolunteerStatus
        );
        setVolunteers((prev) =>
          prev.map((vol) => (vol.id === id ? updatedVol : vol))
        );
      }
      showAlert("Success", "Status updated successfully", "success");
    } catch (error) {
      console.error("Error updating status:", error);
      showAlert("Error", "Failed to update status. Please try again.", "error");
    } finally {
      setItemLoading(id, false);
    }
  };

  const renderOpportunities = () => {
    const filteredOpportunities = opportunities.filter((opp) => {
      const matchesSearch =
        opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "all" || opp.status === filterStatus;
      const matchesDepartment =
        filterDepartment === "all" || opp.department === filterDepartment;
      return matchesSearch && matchesStatus && matchesDepartment;
    });

    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader className="w-8 h-8 animate-spin text-orange-600" />
          <span className="ml-2 text-gray-600">Loading opportunities...</span>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {filteredOpportunities.map((opportunity) => {
          const isExpanded = expandedOpportunity === opportunity.id;
          const itemLoading = actionLoading[opportunity.id];

          return (
            <div
              key={opportunity.id}
              className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                          opportunity.status
                        )} flex items-center`}
                      >
                        {getStatusIcon(opportunity.status)}
                        <span className="ml-1">{opportunity.status}</span>
                      </span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs font-medium rounded border border-blue-200">
                        {opportunity.type}
                      </span>
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 text-xs font-medium rounded border border-purple-200">
                        {opportunity.level}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {opportunity.title}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center text-gray-600 text-sm">
                        <Briefcase className="w-4 h-4 mr-2 text-orange-600" />
                        <span>{opportunity.department}</span>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <MapPin className="w-4 h-4 mr-2 text-orange-600" />
                        <span>{opportunity.location}</span>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <Calendar className="w-4 h-4 mr-2 text-orange-600" />
                        <span>Posted: {opportunity.postedDate || "Draft"}</span>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <Users className="w-4 h-4 mr-2 text-orange-600" />
                        <span>
                          {opportunity.applicationsCount || 0} applications
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {opportunity.description}
                    </p>
                    <p className="text-gray-800 font-medium text-sm">
                      Salary: {opportunity.salary}
                    </p>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                    {/* Safely get array fields with fallback */}
                    {(() => {
                      const responsibilities = Array.isArray(
                        opportunity.responsibilities
                      )
                        ? opportunity.responsibilities
                        : [];
                      const requirements = Array.isArray(
                        opportunity.requirements
                      )
                        ? opportunity.requirements
                        : [];
                      const qualifications = Array.isArray(
                        opportunity.qualifications
                      )
                        ? opportunity.qualifications
                        : [];
                      const benefits = Array.isArray(opportunity.benefits)
                        ? opportunity.benefits
                        : [];

                      return (
                        <>
                          {/* Job Description */}
                          {opportunity.description && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">
                                Job Description
                              </h4>
                              <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded">
                                {opportunity.description}
                              </p>
                            </div>
                          )}

                          {responsibilities.length > 0 && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">
                                Key Responsibilities
                              </h4>
                              <ul className="space-y-2">
                                {responsibilities.map((resp, index) => (
                                  <li
                                    key={index}
                                    className="text-gray-600 text-sm flex items-start"
                                  >
                                    <span className="w-2 h-2 bg-orange-600 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                                    <span className="flex-1">{resp}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {requirements.length > 0 && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">
                                Requirements
                              </h4>
                              <ul className="space-y-2">
                                {requirements.map((req, index) => (
                                  <li
                                    key={index}
                                    className="text-gray-600 text-sm flex items-start"
                                  >
                                    <span className="w-2 h-2 bg-orange-600 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                                    <span className="flex-1">{req}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {qualifications.length > 0 && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">
                                Qualifications
                              </h4>
                              <ul className="space-y-2">
                                {qualifications.map((qual, index) => (
                                  <li
                                    key={index}
                                    className="text-gray-600 text-sm flex items-start"
                                  >
                                    <span className="w-2 h-2 bg-orange-600 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                                    <span className="flex-1">{qual}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {benefits.length > 0 && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">
                                Benefits & Perks
                              </h4>
                              <ul className="space-y-2">
                                {benefits.map((benefit, index) => (
                                  <li
                                    key={index}
                                    className="text-gray-600 text-sm flex items-start"
                                  >
                                    <span className="w-2 h-2 bg-orange-600 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                                    <span className="flex-1">{benefit}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Additional job details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">
                                Contract Details
                              </h4>
                              <div className="space-y-1 text-sm text-gray-600">
                                <p>
                                  <span className="font-medium">
                                    Work Arrangement:
                                  </span>{" "}
                                  {opportunity.workArrangement}
                                </p>
                                {opportunity.contractDuration && (
                                  <p>
                                    <span className="font-medium">
                                      Contract Duration:
                                    </span>{" "}
                                    {opportunity.contractDuration}
                                  </p>
                                )}
                                <p>
                                  <span className="font-medium">
                                    Closing Date:
                                  </span>{" "}
                                  {opportunity.closingDate}
                                </p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">
                                Salary Information
                              </h4>
                              <div className="space-y-1 text-sm text-gray-600">
                                <p>
                                  <span className="font-medium">
                                    Salary Range:
                                  </span>{" "}
                                  {opportunity.salary}
                                </p>
                                <p>
                                  <span className="font-medium">
                                    Experience Level:
                                  </span>{" "}
                                  {opportunity.level}
                                </p>
                                <p>
                                  <span className="font-medium">Job Type:</span>{" "}
                                  {opportunity.type}
                                </p>
                              </div>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}

                <div className="flex flex-wrap gap-3 mb-4">
                  <button
                    onClick={() => toggleExpandOpportunity(opportunity.id)}
                    className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center text-sm font-medium transition-colors"
                    disabled={itemLoading}
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-4 h-4 mr-2" />
                        Collapse
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-2" />
                        Expand
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setEditingItem(opportunity);
                      setShowJobModal(true);
                    }}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center text-sm font-medium transition-colors"
                    disabled={itemLoading}
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </button>

                  <select
                    value={opportunity.status}
                    onChange={(e) =>
                      handleStatusUpdate(
                        opportunity.id,
                        e.target.value,
                        "opportunities"
                      )
                    }
                    className="border border-gray-300 px-3 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                    disabled={itemLoading}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Active">Active</option>
                    <option value="Closed">Closed</option>
                  </select>

                  <button
                    onClick={() => handleDelete(opportunity.id)}
                    className="border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 flex items-center text-sm font-medium transition-colors"
                    disabled={itemLoading}
                  >
                    {itemLoading ? (
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-2" />
                    )}
                    Delete
                  </button>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    <span>Created: {opportunity.createdAt}</span>
                    <span>Last Updated: {opportunity.updatedAt}</span>
                    <span>ID: #{opportunity.id}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderApplications = () => {
    const filteredApplications = applications.filter((app) => {
      const matchesSearch =
        app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.opportunityTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "all" || app.status === filterStatus;
      return matchesSearch && matchesStatus;
    });

    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader className="w-8 h-8 animate-spin text-orange-600" />
          <span className="ml-2 text-gray-600">Loading applications...</span>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {filteredApplications.map((application) => {
          const isExpanded = expandedApplication === application.id;
          const itemLoading = actionLoading[application.id];

          return (
            <div
              key={application.id}
              className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                          application.status
                        )} flex items-center`}
                      >
                        {getStatusIcon(application.status)}
                        <span className="ml-1">{application.status}</span>
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {application.applicantName}
                    </h3>
                    <p className="text-lg text-gray-700 mb-3">
                      {application.opportunityTitle}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center text-gray-600 text-sm">
                        <Mail className="w-4 h-4 mr-2 text-orange-600" />
                        <span>{application.email}</span>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <Phone className="w-4 h-4 mr-2 text-orange-600" />
                        <span>{application.phone}</span>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <MapPin className="w-4 h-4 mr-2 text-orange-600" />
                        <span>{application.location}</span>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <Calendar className="w-4 h-4 mr-2 text-orange-600" />
                        <span>Applied: {application.appliedDate}</span>
                      </div>
                    </div>

                    {application.coverLetter && (
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                        Cover Letter: {application.coverLetter}
                      </p>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                    {/* Cover Letter Section */}
                    {application.coverLetter && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Cover Letter
                        </h4>
                        <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded whitespace-pre-wrap">
                          {application.coverLetter}
                        </p>
                      </div>
                    )}

                    {/* Documents Section */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Documents
                      </h4>
                      <div className="space-y-2">
                        {/* Resume */}
                        {application.resume && (
                          <div className="flex items-center text-blue-600 text-sm">
                            <FileText className="w-4 h-4 mr-2" />
                            <a
                              href={application.resume}
                              className="hover:underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View Resume
                            </a>
                          </div>
                        )}

                        {/* Cover Letter File */}
                        {application.coverLetterFile && (
                          <div className="flex items-center text-blue-600 text-sm">
                            <FileText className="w-4 h-4 mr-2" />
                            <a
                              href={application.coverLetterFile}
                              className="hover:underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View Cover Letter File
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-3 mb-4">
                  <button
                    onClick={() => toggleExpandApplication(application.id)}
                    className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center text-sm font-medium transition-colors"
                    disabled={itemLoading}
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-4 h-4 mr-2" />
                        Collapse
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-2" />
                        Expand
                      </>
                    )}
                  </button>

                  <select
                    value={application.status}
                    onChange={(e) =>
                      handleStatusUpdate(
                        application.id,
                        e.target.value,
                        "applications"
                      )
                    }
                    className="border border-gray-300 px-3 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                    disabled={itemLoading}
                  >
                    <option value="New">New</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Rejected">Rejected</option>
                  </select>

                  <button
                    onClick={() => handleDelete(application.id)}
                    className="border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 flex items-center text-sm font-medium transition-colors"
                    disabled={itemLoading}
                  >
                    {itemLoading ? (
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-2" />
                    )}
                    Delete
                  </button>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    <span>Applied: {application.createdAt}</span>
                    <span>ID: #{application.id}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderVolunteers = () => {
    const filteredVolunteers = volunteers.filter((volunteer) => {
      const matchesSearch =
        volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        volunteer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (volunteer.skills &&
          volunteer.skills.some &&
          volunteer.skills.some((skill) =>
            skill.toLowerCase().includes(searchTerm.toLowerCase())
          ));
      const matchesStatus =
        filterStatus === "all" || volunteer.status === filterStatus;
      return matchesSearch && matchesStatus;
    });

    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader className="w-8 h-8 animate-spin text-orange-600" />
          <span className="ml-2 text-gray-600">Loading volunteers...</span>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {filteredVolunteers.map((volunteer) => {
          const isExpanded = expandedVolunteer === volunteer.id;
          const itemLoading = actionLoading[volunteer.id];

          return (
            <div
              key={volunteer.id}
              className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                          volunteer.status
                        )} flex items-center`}
                      >
                        {getStatusIcon(volunteer.status)}
                        <span className="ml-1">{volunteer.status}</span>
                      </span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 text-xs font-medium rounded border border-green-200">
                        {volunteer.hoursContributed || 0}h contributed
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {volunteer.name}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center text-gray-600 text-sm">
                        <Mail className="w-4 h-4 mr-2 text-orange-600" />
                        <span>{volunteer.email}</span>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <Phone className="w-4 h-4 mr-2 text-orange-600" />
                        <span>{volunteer.phone}</span>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <MapPin className="w-4 h-4 mr-2 text-orange-600" />
                        <span>{volunteer.location}</span>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <Calendar className="w-4 h-4 mr-2 text-orange-600" />
                        <span>Joined: {volunteer.joinDate || "N/A"}</span>
                      </div>
                    </div>

                    {volunteer.interests && volunteer.interests.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-1">
                          Interests:
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {volunteer.interests.map(
                            (interest: string, index: number) => (
                              <span
                                key={index}
                                className="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded"
                              >
                                {interest}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {volunteer.skills && volunteer.skills.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-1">
                          Skills:
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {volunteer.skills.map(
                            (skill: string, index: number) => (
                              <span
                                key={index}
                                className="bg-purple-100 text-purple-800 px-2 py-1 text-xs rounded"
                              >
                                {skill}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    <p className="text-gray-600 text-sm">
                      Availability: {volunteer.availability}
                    </p>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                    {/* Experience */}
                    {volunteer.experience && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Experience
                        </h4>
                        <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded whitespace-pre-wrap">
                          {volunteer.experience}
                        </p>
                      </div>
                    )}

                    {/* Motivation */}
                    {volunteer.motivation && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Motivation
                        </h4>
                        <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded whitespace-pre-wrap">
                          {volunteer.motivation}
                        </p>
                      </div>
                    )}

                    {/* Availability */}
                    {volunteer.availability && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Availability
                        </h4>
                        <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded">
                          {volunteer.availability}
                        </p>
                      </div>
                    )}

                    {/* Projects */}
                    {volunteer.projects && volunteer.projects.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Projects
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {volunteer.projects.map(
                            (project: string, index: number) => (
                              <span
                                key={index}
                                className="bg-green-100 text-green-800 px-3 py-1 text-sm rounded border border-green-200"
                              >
                                {project}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {/* Additional Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Contact Information
                        </h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>
                            <span className="font-medium">Email:</span>{" "}
                            {volunteer.email}
                          </p>
                          <p>
                            <span className="font-medium">Phone:</span>{" "}
                            {volunteer.phone}
                          </p>
                          <p>
                            <span className="font-medium">Location:</span>{" "}
                            {volunteer.location}
                          </p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Volunteer Details
                        </h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>
                            <span className="font-medium">Status:</span>{" "}
                            {volunteer.status}
                          </p>
                          <p>
                            <span className="font-medium">
                              Hours Contributed:
                            </span>{" "}
                            {volunteer.hoursContributed || 0}
                          </p>
                          <p>
                            <span className="font-medium">Join Date:</span>{" "}
                            {volunteer.joinDate || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-3 mb-4">
                  <button
                    onClick={() => toggleExpandVolunteer(volunteer.id)}
                    className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center text-sm font-medium transition-colors"
                    disabled={itemLoading}
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-4 h-4 mr-2" />
                        Collapse
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-2" />
                        Expand
                      </>
                    )}
                  </button>

                  <select
                    value={volunteer.status}
                    onChange={(e) =>
                      handleStatusUpdate(
                        volunteer.id,
                        e.target.value,
                        "volunteers"
                      )
                    }
                    className="border border-gray-300 px-3 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                    disabled={itemLoading}
                  >
                    <option value="Pending Review">Pending Review</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>

                  <button
                    onClick={() => handleDelete(volunteer.id)}
                    className="border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 flex items-center text-sm font-medium transition-colors"
                    disabled={itemLoading}
                  >
                    {itemLoading ? (
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-2" />
                    )}
                    Delete
                  </button>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    <span>Registered: {volunteer.createdAt}</span>
                    <span>ID: #{volunteer.id}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderEmptyState = (type: string) => {
    const configs: Record<
      string,
      {
        icon: React.ReactElement;
        title: string;
        description: string;
        buttonText: string | null;
      }
    > = {
      opportunities: {
        icon: <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />,
        title: "No career opportunities found",
        description: searchTerm
          ? "No opportunities match your search criteria."
          : "No opportunities have been created yet.",
        buttonText: "Create First Opportunity",
      },
      applications: {
        icon: <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />,
        title: "No applications found",
        description: searchTerm
          ? "No applications match your search criteria."
          : "No applications have been received yet.",
        buttonText: null,
      },
      volunteers: {
        icon: <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />,
        title: "No volunteer submissions found",
        description: searchTerm
          ? "No volunteers match your search criteria."
          : "No volunteer submissions have been received yet.",
        buttonText: null,
      },
    };

    const config = configs[type];

    return (
      <div className="text-center py-12">
        {config.icon}
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {config.title}
        </h3>
        <p className="text-gray-500 mb-4">{config.description}</p>
        {config.buttonText && (
          <button
            onClick={() => {
              setEditingItem(null);
              setShowJobModal(true);
            }}
            className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 font-medium"
          >
            {config.buttonText}
          </button>
        )}
      </div>
    );
  };

  const getTabCounts = () => {
    return {
      opportunities: opportunities.length,
      applications: applications.length,
      volunteers: volunteers.length,
    };
  };

  const getFilteredData = () => {
    if (selectedTab === "opportunities") {
      return opportunities.filter((opp) => {
        const matchesSearch =
          opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          opp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
          opp.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
          filterStatus === "all" || opp.status === filterStatus;
        const matchesDepartment =
          filterDepartment === "all" || opp.department === filterDepartment;
        return matchesSearch && matchesStatus && matchesDepartment;
      });
    } else if (selectedTab === "applications") {
      return applications.filter((app) => {
        const matchesSearch =
          app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.opportunityTitle
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          app.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
          filterStatus === "all" || app.status === filterStatus;
        return matchesSearch && matchesStatus;
      });
    } else if (selectedTab === "volunteers") {
      return volunteers.filter((volunteer) => {
        const matchesSearch =
          volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          volunteer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (volunteer.skills &&
            volunteer.skills.some((skill: string) =>
              skill.toLowerCase().includes(searchTerm.toLowerCase())
            ));
        const matchesStatus =
          filterStatus === "all" || volunteer.status === filterStatus;
        return matchesSearch && matchesStatus;
      });
    }
    return [];
  };

  const tabCounts = getTabCounts();
  const filteredData = getFilteredData();

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white border border-gray-300 rounded-lg">
        <div className="bg-orange-50 px-6 py-4 border-b border-gray-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Briefcase className="w-7 h-7 mr-3 text-orange-600" />
                Careers Management
              </h2>
              <p className="text-gray-600 mt-1">
                Manage career opportunities, applications, and volunteer
                submissions
              </p>
            </div>
            <div className="flex gap-3">
              {selectedTab === "opportunities" && (
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setShowJobModal(true);
                  }}
                  className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 flex items-center font-medium transition-colors"
                  disabled={loading}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Opportunity
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-4 border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              {
                id: "opportunities",
                label: "Career Opportunities",
                count: tabCounts.opportunities,
              },
              {
                id: "applications",
                label: "Applications",
                count: tabCounts.applications,
              },
              {
                id: "volunteers",
                label: "Volunteer Submissions",
                count: tabCounts.volunteers,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedTab(tab.id);
                  setSearchTerm("");
                  setFilterStatus("all");
                  setFilterDepartment("all");
                  setExpandedOpportunity(null);
                  setExpandedApplication(null);
                  setExpandedVolunteer(null);
                }}
                className={`py-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  selectedTab === tab.id
                    ? "border-orange-600 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                disabled={loading}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {/* Search and Filter Bar */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${selectedTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                disabled={loading}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600" />
              {selectedTab === "opportunities" && (
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                  disabled={loading}
                >
                  <option value="all">All Departments</option>
                  <option value="Clinical Services">Clinical Services</option>
                  <option value="Research">Research</option>
                  <option value="Technology">Technology</option>
                  <option value="Operations">Operations</option>
                  <option value="Administration">Administration</option>
                  <option value="Finance">Finance</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Education & Training">
                    Education & Training
                  </option>
                </select>
              )}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                disabled={loading}
              >
                <option value="all">All Status</option>
                {selectedTab === "opportunities" && (
                  <>
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                    <option value="Closed">Closed</option>
                  </>
                )}
                {selectedTab === "applications" && (
                  <>
                    <option value="New">New</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Rejected">Rejected</option>
                  </>
                )}
                {selectedTab === "volunteers" && (
                  <>
                    <option value="Pending Review">Pending Review</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </>
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {filteredData.length > 0 ? (
            <>
              {selectedTab === "opportunities" && renderOpportunities()}
              {selectedTab === "applications" && renderApplications()}
              {selectedTab === "volunteers" && renderVolunteers()}
            </>
          ) : (
            renderEmptyState(selectedTab)
          )}
        </div>
      </div>

      {/* Job Creation Modal */}
      <JobCreationModal
        isOpen={showJobModal}
        onClose={() => {
          setShowJobModal(false);
          setEditingItem(null);
        }}
        onSave={handleSaveJob}
        editingItem={editingItem}
      />

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        onConfirm={alertModal.onConfirm}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        showCancel={!!alertModal.onConfirm}
      />
    </div>
  );
};

export default CareersAdminTab;
