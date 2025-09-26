import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  AlertCircle,
  CheckCircle,
  Loader,
  X,
  Eye,
} from "lucide-react";
import {
  careersApi,
  JobOpportunity,
  CreateJobApplicationInput,
} from "../../services/careersAPI";
import ScrollToTop from "../../components/common/ScrollToTop";

interface JobApplicationPageProps {}

interface FormData {
  applicantName: string;
  email: string;
  phone: string;
  location: string;
  coverLetter: string;
  coverLetterFile: File | null;
  resume: File | null;
}

interface FormErrors {
  applicantName?: string;
  email?: string;
  phone?: string;
  location?: string;
  coverLetter?: string;
  coverLetterFile?: string;
  resume?: string;
}

const JobApplication: React.FC<JobApplicationPageProps> = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [job, setJob] = useState<JobOpportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    applicantName: "",
    email: "",
    phone: "",
    location: "",
    coverLetter: "",
    coverLetterFile: null,
    resume: null,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (id) {
      fetchJob(parseInt(id));
    }
  }, [id]);

  const fetchJob = async (jobId: number) => {
    try {
      setLoading(true);
      setError(null);
      const jobData = await careersApi.getJobById(jobId);
      setJob(jobData);

      // Check if job applications are still open
      const daysUntilClosing = getDaysUntilClosing(jobData.closingDate);
      if (daysUntilClosing !== null && daysUntilClosing < 0) {
        setError("Applications for this position are now closed.");
      }
    } catch (err) {
      console.error("Error fetching job:", err);
      setError("Failed to load job details. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntilClosing = (dateString: string): number | null => {
    if (!dateString) return null;
    try {
      const closingDate = new Date(dateString);
      const today = new Date();
      const timeDiff = closingDate.getTime() - today.getTime();
      return Math.ceil(timeDiff / (1000 * 3600 * 24));
    } catch {
      return null;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required fields validation
    if (!formData.applicantName.trim()) {
      newErrors.applicantName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    // Cover letter validation - either text or file is required
    if (!formData.coverLetter.trim() && !formData.coverLetterFile) {
      newErrors.coverLetter =
        "Cover letter is required - either write one or upload a file";
    } else if (
      formData.coverLetter.trim() &&
      formData.coverLetter.trim().length < 100
    ) {
      newErrors.coverLetter = "Cover letter should be at least 100 characters";
    }

    // Cover letter file validation
    if (formData.coverLetterFile) {
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(formData.coverLetterFile.type)) {
        newErrors.coverLetterFile =
          "Cover letter must be a PDF or Word document";
      } else if (formData.coverLetterFile.size > 5 * 1024 * 1024) {
        // 5MB limit
        newErrors.coverLetterFile =
          "Cover letter file size must be less than 5MB";
      }
    }

    if (!formData.resume) {
      newErrors.resume = "Resume is required";
    } else {
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(formData.resume.type)) {
        newErrors.resume = "Resume must be a PDF or Word document";
      } else if (formData.resume.size > 5 * 1024 * 1024) {
        // 5MB limit
        newErrors.resume = "Resume file size must be less than 5MB";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, resume: file }));
      if (errors.resume) {
        setErrors((prev) => ({ ...prev, resume: undefined }));
      }
    }
  };

  const handleCoverLetterFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        coverLetterFile: file,
        coverLetter: "",
      }));
      if (errors.coverLetterFile) {
        setErrors((prev) => ({ ...prev, coverLetterFile: undefined }));
      }
      if (errors.coverLetter) {
        setErrors((prev) => ({ ...prev, coverLetter: undefined }));
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, resume: file }));
      if (errors.resume) {
        setErrors((prev) => ({ ...prev, resume: undefined }));
      }
    }
  };

  const removeFile = () => {
    setFormData((prev) => ({ ...prev, resume: null }));
  };

  const removeCoverLetterFile = () => {
    setFormData((prev) => ({ ...prev, coverLetterFile: null }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !job) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const applicationData: CreateJobApplicationInput = {
        opportunity: job.id,
        applicantName: formData.applicantName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        location: formData.location.trim(),
        coverLetter: formData.coverLetter.trim(),
        coverLetterFile: formData.coverLetterFile,
        resume: formData.resume!,
      };

      await careersApi.createApplication(applicationData);
      setSubmitted(true);
    } catch (err: any) {
      console.error("Error submitting application:", err);

      // Handle duplicate application error
      if (err.response?.status === 409) {
        const errorData = err.response.data;
        setError(
          errorData.message || "You have already applied for this job position."
        );
      } else {
        setError(
          err.message || "Failed to submit application. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading application form...</p>
        </div>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Unable to Load Application
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/careers/jobs")}
            className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Browse Jobs
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Application Submitted!
          </h2>
          <p className="text-gray-600 mb-6">
            Thank you for your interest in the {job?.title} position. We have
            received your application and will review it carefully. You should
            receive a confirmation email at <strong>{formData.email}</strong>{" "}
            shortly.
          </p>
          <div className="space-y-3">
            <Link
              to={`/careers/jobs/${job?.id}`}
              className="block w-full bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium"
            >
              View Job Details
            </Link>
            <Link
              to="/careers/jobs"
              className="block w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Browse More Jobs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ScrollToTop />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center mb-4">
            <Link
              to={`/careers/jobs/${job?.id}`}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Job Details
            </Link>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Apply for {job?.title}
            </h1>
            <p className="text-gray-600">
              {job?.department} • {job?.location}
            </p>
          </div>
        </div>
      </div>

      {/* Application Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {error && (
            <div className="border-b border-gray-200 p-4">
              <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Personal Information */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-orange-600" />
                Personal Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="applicantName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="applicantName"
                    name="applicantName"
                    value={formData.applicantName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent ${
                      errors.applicantName
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors.applicantName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.applicantName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent ${
                      errors.email ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="your.email@example.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent ${
                      errors.phone ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="+254 700 000 000"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="location"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Current Location *
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent ${
                      errors.location ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="City, Country"
                  />
                  {errors.location && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.location}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Cover Letter */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-orange-600" />
                Cover Letter
              </h2>

              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  You can either write your cover letter below or upload a file.
                  Choose one option.
                </p>

                {/* Option 1: Write Cover Letter */}
                <div>
                  <label
                    htmlFor="coverLetter"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Write your cover letter *
                  </label>
                  <textarea
                    id="coverLetter"
                    name="coverLetter"
                    rows={6}
                    value={formData.coverLetter}
                    onChange={handleInputChange}
                    disabled={!!formData.coverLetterFile}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent resize-vertical ${
                      errors.coverLetter ? "border-red-300" : "border-gray-300"
                    } ${
                      formData.coverLetterFile
                        ? "bg-gray-100 cursor-not-allowed"
                        : ""
                    }`}
                    placeholder="Tell us why you want to join ACNA and how you can contribute to our mission of transforming child health across Africa. What motivates you about this specific role?"
                  />
                  <div className="flex items-center justify-between mt-2">
                    {errors.coverLetter && (
                      <p className="text-red-500 text-sm">
                        {errors.coverLetter}
                      </p>
                    )}
                    <p className="text-gray-500 text-sm ml-auto">
                      {formData.coverLetter.length} characters (minimum 100)
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">OR</span>
                  </div>
                </div>

                {/* Option 2: Upload Cover Letter File */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload cover letter file *
                  </label>

                  {!formData.coverLetterFile ? (
                    <div
                      className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        errors.coverLetterFile
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                    >
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 mb-2">
                        Drag and drop your cover letter here, or{" "}
                        <label className="text-orange-600 hover:text-orange-700 cursor-pointer font-medium">
                          browse files
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx"
                            onChange={handleCoverLetterFileChange}
                          />
                        </label>
                      </p>
                      <p className="text-gray-500 text-sm">
                        Supported formats: PDF, DOC, DOCX (max 5MB)
                      </p>
                    </div>
                  ) : (
                    <div className="border border-gray-300 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FileText className="w-6 h-6 text-gray-400 mr-3" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {formData.coverLetterFile.name}
                            </p>
                            <p className="text-gray-500 text-sm">
                              {formatFileSize(formData.coverLetterFile.size)}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={removeCoverLetterFile}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {errors.coverLetterFile && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.coverLetterFile}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Resume Upload */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Upload className="w-5 h-5 mr-2 text-orange-600" />
                Resume/CV
              </h2>

              <div className="space-y-4">
                {!formData.resume ? (
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      dragActive
                        ? "border-orange-400 bg-orange-50"
                        : "border-gray-300"
                    } ${errors.resume ? "border-red-300" : ""}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">
                      Drag and drop your resume here, or{" "}
                      <label className="text-orange-600 hover:text-orange-700 cursor-pointer font-medium">
                        browse files
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                        />
                      </label>
                    </p>
                    <p className="text-gray-500 text-sm">
                      Supported formats: PDF, DOC, DOCX (max 5MB)
                    </p>
                  </div>
                ) : (
                  <div className="border border-gray-300 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="w-8 h-8 text-gray-400 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {formData.resume.name}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {formatFileSize(formData.resume.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}

                {errors.resume && (
                  <p className="text-red-500 text-sm">{errors.resume}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {submitting ? (
                    <>
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                      Submitting Application...
                    </>
                  ) : (
                    <>
                      <Briefcase className="w-5 h-5 mr-2" />
                      Submit Application
                    </>
                  )}
                </button>

                <Link
                  to={`/careers/jobs/${job?.id}`}
                  className="flex-1 flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  <Eye className="w-5 h-5 mr-2" />
                  Review Job Details
                </Link>
              </div>

              <p className="text-gray-500 text-sm mt-4 text-center">
                By submitting this application, you agree to our terms and
                conditions and privacy policy.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JobApplication;
