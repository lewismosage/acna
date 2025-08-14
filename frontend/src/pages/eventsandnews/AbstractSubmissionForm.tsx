import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  FileText,
  Plus,
  Trash2,
  AlertCircle,
  Upload,
  Check,
} from "lucide-react";
import ScrollToTop from "../../components/common/ScrollToTop";

type FileField = "abstractFile" | "ethicalApproval" | "supplementary";

type Author = {
  firstName: string;
  lastName: string;
  email: string;
  institution: string;
  country: string;
  isPresenter: boolean;
  isCorresponding: boolean;
};

type FormData = {
  title: string;
  category: string;
  presentationPreference: string;
  keywords: string;
  background: string;
  methods: string;
  results: string;
  conclusions: string;
  authors: Author[];
  conflictOfInterest: string;
  consent: boolean;
};

const AbstractSubmissionForm = () => {
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<boolean>(false);
  const [fileNames, setFileNames] = useState<{
    abstractFile: string | null;
    ethicalApproval: string | null;
    supplementary: string | null;
  }>({
    abstractFile: null,
    ethicalApproval: null,
    supplementary: null,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<FormData>({
    defaultValues: {
      title: "",
      category: "",
      presentationPreference: "",
      keywords: "",
      background: "",
      methods: "",
      results: "",
      conclusions: "",
      authors: [
        {
          firstName: "",
          lastName: "",
          email: "",
          institution: "",
          country: "",
          isPresenter: false,
          isCorresponding: false,
        },
      ],
      conflictOfInterest: "",
      consent: false,
    },
  });

  const categories = [
    "Clinical Research",
    "Basic Science & Translational Research",
    "Healthcare Technology & Innovation",
    "Medical Education & Training",
    "Public Health & Policy",
    "Case Reports",
  ];

  const presentationTypes = [
    "Oral Presentation",
    "Poster Presentation",
    "E-Poster",
    "No Preference",
  ];

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: FileField
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileNames((prev) => ({
        ...prev,
        [fieldName]: e.target.files?.[0]?.name || null,
      }));
    }
  };

  const onSubmit = (data: FormData) => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      console.log("Submitted data:", data);
      setIsSubmitting(false);
      setSubmissionSuccess(true);
      reset();
      setFileNames({
        abstractFile: null,
        ethicalApproval: null,
        supplementary: null,
      });
    }, 2000);
  };

  const addAuthor = () => {
    const currentAuthors = watch("authors");
    reset({
      ...watch(),
      authors: [
        ...currentAuthors,
        {
          firstName: "",
          lastName: "",
          email: "",
          institution: "",
          country: "",
          isPresenter: false,
          isCorresponding: false,
        },
      ],
    });
  };

  const removeAuthor = (index: number) => {
    const currentAuthors = [...watch("authors")];
    currentAuthors.splice(index, 1);
    reset({
      ...watch(),
      authors: currentAuthors,
    });
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleNext = () => {
    setStep(step + 1);
  };

  if (submissionSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Submission Successful!
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Thank you for submitting your abstract to ACNA 2026. Your submission
            has been received and is currently under review.
          </p>
          <p className="text-gray-600 mb-8">
            You will receive a confirmation email with your submission details
            and reference number shortly. If you don't receive it within 24
            hours, please contact{" "}
            <a
              href="mailto:abstracts@acna.org"
              className="text-orange-600 hover:underline"
            >
              abstracts@acna.org
            </a>
            .
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setSubmissionSuccess(false)}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors"
            >
              Submit Another Abstract
            </button>
            <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              View Submission Status
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <ScrollToTop />
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {/* Form Header */}
        <div className="bg-orange-600 p-6 sm:p-8 text-white">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                Abstract Submission
              </h1>
              <p className="opacity-90">
                ACNA Annual Conference 2026 | Deadline: April 30, 2026
              </p>
            </div>
            <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm font-medium">
              Step {step} of 4
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-gray-50 px-6 py-4 border-b">
          <div className="flex justify-between relative">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`flex flex-col items-center z-10 ${
                  stepNumber <= step ? "text-orange-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                    stepNumber <= step
                      ? "bg-orange-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {stepNumber}
                </div>
                <span className="text-xs font-medium">
                  {stepNumber === 1 && "Abstract"}
                  {stepNumber === 2 && "Authors"}
                  {stepNumber === 3 && "Files"}
                  {stepNumber === 4 && "Review"}
                </span>
              </div>
            ))}
            <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 mx-8">
              <div
                className="h-full bg-orange-600 transition-all duration-300"
                style={{ width: `${(step - 1) * 33.33}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Abstract Details
              </h2>

              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Abstract Title *
                </label>
                <input
                  id="title"
                  type="text"
                  {...register("title", { required: "Title is required" })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500 ${
                    errors.title ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter your abstract title (max 20 words)"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Category *
                </label>
                <select
                  id="category"
                  {...register("category", { required: "Category is required" })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500 ${
                    errors.category ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.category.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="presentationPreference"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Presentation Preference *
                </label>
                <select
                  id="presentationPreference"
                  {...register("presentationPreference", {
                    required: "Presentation preference is required",
                  })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500 ${
                    errors.presentationPreference
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                >
                  <option value="">Select your preference</option>
                  {presentationTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {errors.presentationPreference && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.presentationPreference.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="keywords"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Keywords (3-5) *
                </label>
                <input
                  id="keywords"
                  type="text"
                  {...register("keywords", {
                    required: "Keywords are required",
                  })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500 ${
                    errors.keywords ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Comma-separated keywords (e.g., epilepsy, pediatric, treatment)"
                />
                {errors.keywords && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.keywords.message}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Abstract Content (max 300 words each section) *
                </h3>

                <div>
                  <label
                    htmlFor="background"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Background/Objectives
                  </label>
                  <textarea
                    id="background"
                    rows={4}
                    {...register("background", {
                      required: "Background is required",
                    })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500 ${
                      errors.background ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="State the study objectives, hypothesis, or purpose"
                  />
                  {errors.background && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.background.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="methods"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Methods
                  </label>
                  <textarea
                    id="methods"
                    rows={4}
                    {...register("methods", {
                      required: "Methods are required",
                    })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500 ${
                      errors.methods ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Describe study design, setting, participants, interventions, and analysis"
                  />
                  {errors.methods && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.methods.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="results"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Results
                  </label>
                  <textarea
                    id="results"
                    rows={4}
                    {...register("results", {
                      required: "Results are required",
                    })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500 ${
                      errors.results ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Present key findings with supporting data"
                  />
                  {errors.results && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.results.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="conclusions"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Conclusions
                  </label>
                  <textarea
                    id="conclusions"
                    rows={4}
                    {...register("conclusions", {
                      required: "Conclusions are required",
                    })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500 ${
                      errors.conclusions ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="State conclusions and implications for practice or research"
                  />
                  {errors.conclusions && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.conclusions.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Author Information
              </h2>

              <div className="space-y-4">
                {watch("authors").map((_, index: number) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 relative"
                  >
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeAuthor(index)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}

                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Author {index + 1}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor={`authors[${index}].firstName`}
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          First Name *
                        </label>
                        <input
                          id={`authors[${index}].firstName`}
                          type="text"
                          {...register(`authors.${index}.firstName`, {
                            required: "First name is required",
                          })}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500 ${
                            errors.authors?.[index]?.firstName
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        />
                        {errors.authors?.[index]?.firstName && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.authors[index].firstName.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor={`authors[${index}].lastName`}
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Last Name *
                        </label>
                        <input
                          id={`authors[${index}].lastName`}
                          type="text"
                          {...register(`authors.${index}.lastName`, {
                            required: "Last name is required",
                          })}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500 ${
                            errors.authors?.[index]?.lastName
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        />
                        {errors.authors?.[index]?.lastName && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.authors[index].lastName.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <label
                        htmlFor={`authors[${index}].email`}
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Email *
                      </label>
                      <input
                        id={`authors[${index}].email`}
                        type="email"
                        {...register(`authors.${index}.email`, {
                          required: "Email is required",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid email address",
                          },
                        })}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500 ${
                          errors.authors?.[index]?.email
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {errors.authors?.[index]?.email && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.authors[index].email.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label
                          htmlFor={`authors[${index}].institution`}
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Institution *
                        </label>
                        <input
                          id={`authors[${index}].institution`}
                          type="text"
                          {...register(`authors.${index}.institution`, {
                            required: "Institution is required",
                          })}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500 ${
                            errors.authors?.[index]?.institution
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        />
                        {errors.authors?.[index]?.institution && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.authors[index].institution.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor={`authors[${index}].country`}
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Country *
                        </label>
                        <input
                          id={`authors[${index}].country`}
                          type="text"
                          {...register(`authors.${index}.country`, {
                            required: "Country is required",
                          })}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500 ${
                            errors.authors?.[index]?.country
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        />
                        {errors.authors?.[index]?.country && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.authors[index].country.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-6">
                      <div className="flex items-center">
                        <input
                          id={`authors[${index}].isPresenter`}
                          type="checkbox"
                          {...register(`authors.${index}.isPresenter`)}
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor={`authors[${index}].isPresenter`}
                          className="ml-2 block text-sm text-gray-700"
                        >
                          Presenting Author
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          id={`authors[${index}].isCorresponding`}
                          type="checkbox"
                          {...register(`authors.${index}.isCorresponding`)}
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor={`authors[${index}].isCorresponding`}
                          className="ml-2 block text-sm text-gray-700"
                        >
                          Corresponding Author
                        </label>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addAuthor}
                  className="flex items-center text-orange-600 hover:text-orange-700 font-medium"
                >
                  <Plus className="w-5 h-5 mr-1" />
                  Add Another Author
                </button>
              </div>

              <div className="mt-6">
                <label
                  htmlFor="conflictOfInterest"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Conflict of Interest Disclosure *
                </label>
                <textarea
                  id="conflictOfInterest"
                  rows={3}
                  {...register("conflictOfInterest", {
                    required: "Disclosure is required",
                  })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500 ${
                    errors.conflictOfInterest
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Disclose any potential conflicts of interest for all authors. If none, state 'None'."
                />
                {errors.conflictOfInterest && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.conflictOfInterest.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Upload Required Files
              </h2>

              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <div className="flex flex-col items-center">
                    <Upload className="w-10 h-10 text-gray-400 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      Abstract Document
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Upload your abstract in Word or PDF format (max 5MB)
                    </p>
                    <label className="cursor-pointer bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
                      <input
                        type="file"
                        className="hidden"
                        accept=".doc,.docx,.pdf"
                        onChange={(e) => handleFileChange(e, "abstractFile")}
                      />
                      Choose File
                    </label>
                    {fileNames.abstractFile && (
                      <p className="mt-2 text-sm text-gray-600">
                        Selected: {fileNames.abstractFile}
                      </p>
                    )}
                  </div>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <div className="flex flex-col items-center">
                    <FileText className="w-10 h-10 text-gray-400 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      Ethical Approval Document
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Upload IRB/ethics committee approval (PDF, max 5MB)
                    </p>
                    <label className="cursor-pointer bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf"
                        onChange={(e) => handleFileChange(e, "ethicalApproval")}
                      />
                      Choose File
                    </label>
                    {fileNames.ethicalApproval && (
                      <p className="mt-2 text-sm text-gray-600">
                        Selected: {fileNames.ethicalApproval}
                      </p>
                    )}
                  </div>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <div className="flex flex-col items-center">
                    <Plus className="w-10 h-10 text-gray-400 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      Supplementary Materials (Optional)
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Tables, figures, or additional documents (ZIP, max 10MB)
                    </p>
                    <label className="cursor-pointer bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
                      <input
                        type="file"
                        className="hidden"
                        accept=".zip,.pdf,.doc,.docx,.xls,.xlsx"
                        onChange={(e) => handleFileChange(e, "supplementary")}
                      />
                      Choose File
                    </label>
                    {fileNames.supplementary && (
                      <p className="mt-2 text-sm text-gray-600">
                        Selected: {fileNames.supplementary}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="consent"
                      type="checkbox"
                      {...register("consent", {
                        required:
                          "You must agree to the terms to submit your abstract",
                      })}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label
                      htmlFor="consent"
                      className={`font-medium ${
                        errors.consent ? "text-red-600" : "text-gray-700"
                      }`}
                    >
                      I confirm that all authors have approved this abstract and
                      consent to its submission. I understand that accepted
                      abstracts will be published in the conference proceedings.
                    </label>
                    {errors.consent && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.consent.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Review Your Submission
              </h2>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Abstract Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Title:
                    </span>{" "}
                    <span className="text-gray-900">{watch("title")}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Category:
                    </span>{" "}
                    <span className="text-gray-900">{watch("category")}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Presentation Preference:
                    </span>{" "}
                    <span className="text-gray-900">
                      {watch("presentationPreference")}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Keywords:
                    </span>{" "}
                    <span className="text-gray-900">{watch("keywords")}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Authors
                </h3>
                <div className="space-y-4">
                  {watch("authors").map((author: Author, index: number) => (
                    <div key={index} className="border-b pb-4 last:border-0">
                      <div className="font-medium text-gray-900">
                        {author.firstName} {author.lastName}
                      </div>
                      <div className="text-sm text-gray-600">
                        {author.institution}, {author.country}
                      </div>
                      <div className="text-sm text-gray-600">{author.email}</div>
                      <div className="flex gap-4 mt-1">
                        {author.isPresenter && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            Presenting Author
                          </span>
                        )}
                        {author.isCorresponding && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Corresponding Author
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Abstract Content
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">
                      Background/Objectives
                    </h4>
                    <p className="text-gray-700 whitespace-pre-line">
                      {watch("background")}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Methods</h4>
                    <p className="text-gray-700 whitespace-pre-line">
                      {watch("methods")}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Results</h4>
                    <p className="text-gray-700 whitespace-pre-line">
                      {watch("results")}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">
                      Conclusions
                    </h4>
                    <p className="text-gray-700 whitespace-pre-line">
                      {watch("conclusions")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Files to Upload
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-gray-700">
                      {fileNames.abstractFile || "No file selected"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-gray-700">
                      {fileNames.ethicalApproval || "No file selected"}
                    </span>
                  </div>
                  {fileNames.supplementary && (
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-gray-400 mr-2" />
                      <span className="text-gray-700">
                        {fileNames.supplementary}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Conflict of Interest
                </h3>
                <p className="text-gray-700 whitespace-pre-line">
                  {watch("conflictOfInterest")}
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            {step > 1 && (
              <button
                type="button"
                onClick={handlePrevious}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
            )}
            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="ml-auto px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="ml-auto px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  "Submit Abstract"
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AbstractSubmissionForm;