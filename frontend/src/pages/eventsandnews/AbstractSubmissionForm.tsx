import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  FileText,
  Plus,
  Trash2,
  AlertCircle,
  Upload,
  Check,
  Loader,
} from "lucide-react";
import ScrollToTop from "../../components/common/ScrollToTop";
import { abstractApi,
   CreateAbstractInput,
   AbstractCategory, 
   PresentationType } from '../../services/abstractApi';
import { getCurrentImportantDates, ImportantDates } from "../../services/abstractApi";

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
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [importantDates, setImportantDates] = useState<ImportantDates | null>(null);
  const [datesLoading, setDatesLoading] = useState<boolean>(true);
  const [datesError, setDatesError] = useState<string | null>(null);
  const [files, setFiles] = useState<{
    abstractFile: File | null;
    ethicalApproval: File | null;
    supplementary: File | null;
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
    setValue,
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
          isPresenter: true,
          isCorresponding: true,
        },
      ],
      conflictOfInterest: "",
      consent: false,
    },
  });

  // Fetch important dates on component mount
  useEffect(() => {
    const fetchImportantDates = async () => {
      try {
        setDatesLoading(true);
        setDatesError(null);
        const dates = await getCurrentImportantDates();
        setImportantDates(dates);
      } catch (err) {
        console.error("Failed to fetch important dates:", err);
        setDatesError("Failed to load important dates");
        // Fallback to hardcoded dates if API fails
        setImportantDates({
          year: 2026,
          abstractSubmissionOpens: "January 15, 2026",
          abstractSubmissionDeadline: "April 30, 2026",
          abstractReviewCompletion: "June 15, 2026",
          acceptanceNotifications: "July 1, 2026",
          finalAbstractSubmission: "August 15, 2026",
          conferencePresentation: "March 15-17, 2026",
        });
      } finally {
        setDatesLoading(false);
      }
    };

    fetchImportantDates();
  }, []);

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
      const file = e.target.files[0];
      setFiles(prev => ({
        ...prev,
        [fieldName]: file
      }));
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      // Prepare authors data with order
      const authorsWithOrder = data.authors.map((author, index) => ({
        firstName: author.firstName,
        lastName: author.lastName,
        email: author.email,
        institution: author.institution,
        country: author.country,
        isPresenter: author.isPresenter,
        isCorresponding: author.isCorresponding,
        order: index
      }));

      // Prepare the abstract data for API
      const abstractData: CreateAbstractInput = {
        title: data.title,
        category: data.category as AbstractCategory,
        presentationPreference: data.presentationPreference as PresentationType,
        keywords: data.keywords.split(',').map(k => k.trim()).filter(k => k.length > 0),
        background: data.background,
        methods: data.methods,
        results: data.results,
        conclusions: data.conclusions,
        conflictOfInterest: data.conflictOfInterest,
        authors: authorsWithOrder,
        abstractFile: files.abstractFile || undefined,
        ethicalApprovalFile: files.ethicalApproval || undefined,
        supplementaryFiles: files.supplementary ? [files.supplementary] : undefined
      };

      // Submit to API
      const result = await abstractApi.createAbstract(abstractData);
      
      setSubmissionSuccess(true);
      reset();
      setFiles({
        abstractFile: null,
        ethicalApproval: null,
        supplementary: null,
      });

    } catch (error: any) {
      console.error('Submission failed:', error);
      setSubmissionError(
        error.message || 'Failed to submit abstract. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const addAuthor = () => {
    const currentAuthors = watch("authors");
    const newAuthors = [
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
    ];
    setValue("authors", newAuthors);
  };

  const removeAuthor = (index: number) => {
    const currentAuthors = [...watch("authors")];
    
    // Don't remove the last author
    if (currentAuthors.length <= 1) return;
    
    currentAuthors.splice(index, 1);
    
    // Ensure at least one author is presenter and corresponding
    if (!currentAuthors.some(a => a.isPresenter)) {
      currentAuthors[0].isPresenter = true;
    }
    if (!currentAuthors.some(a => a.isCorresponding)) {
      currentAuthors[0].isCorresponding = true;
    }
    
    setValue("authors", currentAuthors);
  };

  const handleAuthorFieldChange = (index: number, field: keyof Author, value: any) => {
    const currentAuthors = [...watch("authors")];
    currentAuthors[index] = { ...currentAuthors[index], [field]: value };
    setValue("authors", currentAuthors);
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
            Thank you for submitting your abstract to ACNA {importantDates?.year || 2026}. Your submission
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
              onClick={() => {
                setSubmissionSuccess(false);
                setStep(1);
              }}
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
              {datesLoading ? (
                <div className="flex items-center opacity-90">
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  <p className="text-sm">Loading submission details...</p>
                </div>
              ) : (
                <p className="opacity-90">
                  ACNA Annual Conference {importantDates?.year || 2026} | Deadline: {importantDates?.abstractSubmissionDeadline || "April 30, 2026"}
                </p>
              )}
              {datesError && (
                <p className="text-xs text-orange-200 mt-1">
                  <AlertCircle className="w-3 h-3 inline mr-1" />
                  {datesError} - Using fallback dates
                </p>
              )}
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
          {submissionError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-red-600">{submissionError}</p>
              </div>
            </div>
          )}

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
                    <p className="mt-1 text-sm text red-600 flex items-center">
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
                {watch("authors").map((author, index: number) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 relative"
                  >
                    {watch("authors").length > 1 && (
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          First Name *
                        </label>
                        <input
                          type="text"
                          value={author.firstName}
                          onChange={(e) => handleAuthorFieldChange(index, 'firstName', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          value={author.lastName}
                          onChange={(e) => handleAuthorFieldChange(index, 'lastName', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={author.email}
                        onChange={(e) => handleAuthorFieldChange(index, 'email', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Institution *
                        </label>
                        <input
                          type="text"
                          value={author.institution}
                          onChange={(e) => handleAuthorFieldChange(index, 'institution', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Country *
                        </label>
                        <input
                          type="text"
                          value={author.country}
                          onChange={(e) => handleAuthorFieldChange(index, 'country', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-6">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={author.isPresenter}
                          onChange={(e) => handleAuthorFieldChange(index, 'isPresenter', e.target.checked)}
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-700">
                          Presenting Author
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={author.isCorresponding}
                          onChange={(e) => handleAuthorFieldChange(index, 'isCorresponding', e.target.checked)}
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-700">
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
                      Upload your abstract in Word or PDF format (max 10MB)
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
                    {files.abstractFile && (
                      <p className="mt-2 text-sm text-gray-600">
                        Selected: {files.abstractFile.name}
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
                      Upload IRB/ethics committee approval (PDF, max 10MB)
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
                    {files.ethicalApproval && (
                      <p className="mt-2 text-sm text-gray-600">
                        Selected: {files.ethicalApproval.name}
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
                      Tables, figures, or additional documents (ZIP, PDF, DOCX - max 10MB)
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
                    {files.supplementary && (
                      <p className="mt-2 text-sm text-gray-600">
                        Selected: {files.supplementary.name}
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
                      {files.abstractFile ? files.abstractFile.name : "No file selected"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-gray-700">
                      {files.ethicalApproval ? files.ethicalApproval.name : "No file selected"}
                    </span>
                  </div>
                  {files.supplementary && (
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-gray-400 mr-2" />
                      <span className="text-gray-700">
                        {files.supplementary.name}
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
              className="bg-orange-600 text-white px-6 py-2 rounded-md font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin inline" />
                  Submitting...
                </>
              ) : (
                'Submit Abstract'
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