import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, UserPlus, Users, Award, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import ScrollToTop from '../../components/common/ScrollToTop';
import { awardsApi, AwardCategory, Nominee } from '../../services/awardsApi';

type FormData = {
  awardCategory: string;
  nomineeName: string;
  nomineeEmail: string;
  nomineeInstitution: string;
  nomineeLocation: string;
  nomineeSpecialty: string;
  nominatorName: string;
  nominatorEmail: string;
  nominatorRelationship: string;
  achievementSummary: string;
  supportingDocuments: File | null;
  additionalInfo: string;
};

const AwardNominationPage = () => {
  const [formData, setFormData] = useState<FormData>({
    awardCategory: '',
    nomineeName: '',
    nomineeEmail: '',
    nomineeInstitution: '',
    nomineeLocation: '',
    nomineeSpecialty: '',
    nominatorName: '',
    nominatorEmail: '',
    nominatorRelationship: '',
    achievementSummary: '',
    supportingDocuments: null,
    additionalInfo: ''
  });

  const [step, setStep] = useState(1);
  const [selectedNominee, setSelectedNominee] = useState<Nominee | null>(null);
  const [isCustomNominee, setIsCustomNominee] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [awardCategories, setAwardCategories] = useState<AwardCategory[]>([]);
  const [suggestedNominees, setSuggestedNominees] = useState<Nominee[]>([]);

  // Fetch award categories and suggested nominees
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [categoriesData, nomineesData] = await Promise.all([
          awardsApi.getCategories({ active: true }),
          awardsApi.getNominees({ status: 'Approved' })
        ]);
        setAwardCategories(categoriesData);
        setSuggestedNominees(nomineesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        supportingDocuments: e.target.files![0]
      }));
    }
  };

  const handleNominateNew = () => {
    if (!formData.awardCategory) {
      setError('Please select an award category first');
      return;
    }
    setStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
  
    if (!formData.awardCategory) {
      setError('Please select an award category');
      setSubmitting(false);
      return;
    }
  
    try {
      // Determine the source based on whether it's a suggested nominee or new nomination
      const source = selectedNominee ? 'suggested' : 'new';
      
      await awardsApi.createNomination({
        nomineeName: formData.nomineeName,
        nomineeEmail: formData.nomineeEmail,
        nomineeInstitution: formData.nomineeInstitution,
        nomineeLocation: formData.nomineeLocation,
        nomineeSpecialty: formData.nomineeSpecialty,
        awardCategory: parseInt(formData.awardCategory),
        nominatorName: formData.nominatorName,
        nominatorEmail: formData.nominatorEmail,
        nominatorRelationship: formData.nominatorRelationship,
        achievementSummary: formData.achievementSummary,
        additionalInfo: formData.additionalInfo,
        supportingDocuments: formData.supportingDocuments || undefined,
        source: source  // Make sure this is included
      });
  
      setStep(4);
    } catch (err) {
      console.error('Nomination submission error:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit nomination');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNomineeSelect = (nominee: Nominee) => {
    setSelectedNominee(nominee);
    setFormData(prev => ({
      ...prev,
      awardCategory: nominee.category.toString(),
      nomineeName: nominee.name,
      nomineeInstitution: nominee.institution,
      nomineeSpecialty: nominee.specialty,
      nomineeEmail: nominee.email || '',
      nomineeLocation: nominee.location || ''
    }));
    setStep(3); // Skip to details step since we have nominee info
  };

  const filteredNominees = formData.awardCategory 
    ? suggestedNominees.filter(nominee => nominee.category.toString() === formData.awardCategory)
    : suggestedNominees;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <ScrollToTop />
      
      {/* Back to Awards Link */}
      <div className="py-12 px-4 sm:px-6 pt-6 bg-gradient-to-r from-blue-50 to-indigo-50">
        <Link 
          to="/awards" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Awards
        </Link>
      </div>

      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-gray-900 mb-4 md:mb-6">
            Submit a Nomination
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 font-light max-w-3xl mx-auto">
            Help us recognize outstanding contributions to child neurology in Africa
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="text-red-600 font-medium">{error}</div>
              <button 
                onClick={() => setError(null)}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex justify-between relative">
            {/* Progress line */}
            <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 z-0"></div>
            <div 
              className="absolute top-4 left-0 h-1 bg-orange-600 z-10 transition-all duration-300" 
              style={{ width: `${(step - 1) * 33.33}%` }}
            ></div>
            
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex flex-col items-center z-20">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                  step >= stepNumber ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNumber}
                </div>
                <span className={`text-xs font-medium ${
                  step >= stepNumber ? 'text-orange-600' : 'text-gray-500'
                }`}>
                  {stepNumber === 1 && 'Category'}
                  {stepNumber === 2 && 'Nominee'}
                  {stepNumber === 3 && 'Details'}
                  {stepNumber === 4 && 'Complete'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Award Category Selection */}
        {step === 1 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Award Category</h2>
            
            <div className="space-y-4 mb-8">
              {awardCategories.map((category) => (
                <div 
                  key={category.id}
                  onClick={() => {
                    setFormData(prev => ({ ...prev, awardCategory: category.id.toString() }));
                    setStep(2);
                  }}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    formData.awardCategory === category.id.toString() 
                      ? 'border-orange-500 bg-orange-50' 
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <div className="flex items-start">
                    <Award className={`w-6 h-6 mt-1 mr-4 ${
                      formData.awardCategory === category.id.toString() ? 'text-orange-600' : 'text-gray-500'
                    }`} />
                    <div>
                      <h3 className="font-bold text-gray-900">{category.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                      {category.criteria && (
                        <p className="text-xs text-gray-500 mt-2">
                          <strong>Criteria:</strong> {category.criteria}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Nominee Selection */}
        {step === 2 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Nominee</h2>
            <p className="text-gray-600 mb-6">
              You can either select from our suggested nominees or nominate someone new.
            </p>

            <div className="mb-6">
              <div className="flex space-x-4 mb-6">
                <button
                  onClick={() => setIsCustomNominee(false)}
                  className={`px-4 py-2 rounded-md font-medium ${
                    !isCustomNominee 
                      ? 'bg-orange-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Suggested Nominees
                </button>
                <button
                  onClick={() => setIsCustomNominee(true)}
                  className={`px-4 py-2 rounded-md font-medium ${
                    isCustomNominee 
                      ? 'bg-orange-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Nominate Someone New
                </button>
              </div>

              {!isCustomNominee ? (
                <div className="space-y-4">
                  {filteredNominees.length > 0 ? (
                    filteredNominees.map(nominee => (
                      <div 
                        key={nominee.id}
                        onClick={() => handleNomineeSelect(nominee)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                          selectedNominee?.id === nominee.id 
                            ? 'border-orange-500 bg-orange-50' 
                            : 'border-gray-200 hover:border-orange-300'
                        }`}
                      >
                        <div className="flex items-start">
                          <Users className="w-5 h-5 mt-1 mr-4 text-gray-500" />
                          <div>
                            <h3 className="font-bold text-gray-900">{nominee.name}</h3>
                            <p className="text-sm text-gray-600">{nominee.institution}</p>
                            <p className="text-xs text-gray-500 mt-1">{nominee.specialty}</p>
                            {nominee.location && (
                              <p className="text-xs text-gray-500">{nominee.location}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No suggested nominees available for this category.</p>
                      <button 
                        onClick={() => setIsCustomNominee(true)}
                        className="mt-4 text-orange-600 font-medium"
                      >
                        Nominate someone new instead
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                    <UserPlus className="w-10 h-10 mx-auto text-gray-400 mb-4" />
                    <h3 className="font-bold text-gray-900 mb-2">Nominate Someone New</h3>
                    <p className="text-gray-600 mb-4">
                      Know someone deserving who isn't on our list? Tell us about them!
                    </p>
                    <button
                      onClick={handleNominateNew}
                      className="bg-orange-600 text-white px-6 py-2 rounded-md font-medium hover:bg-orange-700"
                    >
                      Continue with New Nominee
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Back
              </button>
              {selectedNominee && (
                <button
                  onClick={() => setStep(3)}
                  className="bg-orange-600 text-white px-6 py-2 rounded-md font-medium hover:bg-orange-700"
                >
                  Continue
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Nomination Details */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 md:p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Nomination Details</h2>
            
            <div className="space-y-6">
              {/* Award Category (display only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Award Category</label>
                <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                  {awardCategories.find(c => c.id.toString() === formData.awardCategory)?.title}
                </div>
              </div>

              {/* Nominee Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Nominee Information</h3>
                
                <div>
                  <label htmlFor="nomineeName" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="nomineeName"
                    name="nomineeName"
                    value={formData.nomineeName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="nomineeEmail" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="nomineeEmail"
                      name="nomineeEmail"
                      value={formData.nomineeEmail}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="nomineeInstitution" className="block text-sm font-medium text-gray-700 mb-1">
                      Institution/Organization <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      id="nomineeInstitution"
                      name="nomineeInstitution"
                      value={formData.nomineeInstitution}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="nomineeSpecialty" className="block text-sm font-medium text-gray-700 mb-1">
                      Specialty <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      id="nomineeSpecialty"
                      name="nomineeSpecialty"
                      value={formData.nomineeSpecialty}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="nomineeLocation" className="block text-sm font-medium text-gray-700 mb-1">
                      Location (City, Country)
                    </label>
                    <input
                      type="text"
                      id="nomineeLocation"
                      name="nomineeLocation"
                      value={formData.nomineeLocation}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Nominator Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Your Information</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="nominatorName" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      id="nominatorName"
                      name="nominatorName"
                      value={formData.nominatorName}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="nominatorEmail" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Email <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="email"
                      id="nominatorEmail"
                      name="nominatorEmail"
                      value={formData.nominatorEmail}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="nominatorRelationship" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Relationship to Nominee
                  </label>
                  <input
                    type="text"
                    id="nominatorRelationship"
                    name="nominatorRelationship"
                    value={formData.nominatorRelationship}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Achievement Summary */}
              <div>
                <label htmlFor="achievementSummary" className="block text-sm font-medium text-gray-700 mb-1">
                  Summary of Achievements <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="achievementSummary"
                  name="achievementSummary"
                  value={formData.achievementSummary}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Describe why this person deserves the award, including specific accomplishments, impact, and any measurable outcomes..."
                ></textarea>
              </div>

              {/* Supporting Documents */}
              <div>
                <label htmlFor="supportingDocuments" className="block text-sm font-medium text-gray-700 mb-1">
                  Supporting Documents (Optional)
                </label>
                <div className="mt-1 flex items-center">
                  <input
                    type="file"
                    id="supportingDocuments"
                    name="supportingDocuments"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-orange-50 file:text-orange-700
                      hover:file:bg-orange-100"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  You may upload a CV, publication list, or other supporting materials (PDF, DOC, max 5MB)
                </p>
              </div>

              {/* Additional Information */}
              <div>
                <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Information
                </label>
                <textarea
                  id="additionalInfo"
                  name="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Any other information that might help the selection committee evaluate this nomination..."
                ></textarea>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-orange-600 text-white px-6 py-2 rounded-md font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin inline" />
                    Submitting...
                  </>
                ) : (
                  'Submit Nomination'
                )}
              </button>
            </div>
          </form>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8 shadow-sm text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Nomination Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for submitting your nomination for the ACNA Awards. We've sent a confirmation to your email.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-medium text-gray-900 mb-2">Next Steps:</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                <li>Our committee will review all nominations</li>
                <li>You may be contacted for additional information</li>
                <li>Winners will be announced at our annual conference</li>
              </ul>
            </div>
            <Link 
              to="/awards" 
              className="inline-flex items-center bg-orange-600 text-white px-6 py-2 rounded-md font-medium hover:bg-orange-700"
            >
              Back to Awards
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AwardNominationPage;