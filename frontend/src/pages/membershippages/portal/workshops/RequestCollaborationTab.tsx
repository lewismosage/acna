import { useState } from 'react';
import { 
  Users, BookOpen, Target, MessageCircle, CheckCircle, AlertCircle 
} from 'lucide-react';
import { workshopsApi, CreateCollaborationInput } from '../../../../services/workshopAPI';

const RequestCollaborationTab = () => {
  // Collaboration request state
  const [request, setRequest] = useState<CreateCollaborationInput>({
    projectTitle: '',
    projectDescription: '',
    institution: '',
    projectLead: '',
    contactEmail: '',
    skillsNeeded: [],
    commitmentLevel: 'Moderate',
    duration: '',
    additionalNotes: ''
  });

  const [currentSkill, setCurrentSkill] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Collaboration form handlers
  const handleRequestChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRequest(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleAddSkill = () => {
    if (currentSkill.trim() && !request.skillsNeeded.includes(currentSkill.trim())) {
      setRequest(prev => ({
        ...prev,
        skillsNeeded: [...prev.skillsNeeded, currentSkill.trim()]
      }));
      setCurrentSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setRequest(prev => ({
      ...prev,
      skillsNeeded: prev.skillsNeeded.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Submit the collaboration request to the backend
      await workshopsApi.createCollaboration(request);
      
      setSubmitSuccess(true);
      // Reset form
      setRequest({
        projectTitle: '',
        projectDescription: '',
        institution: '',
        projectLead: '',
        contactEmail: '',
        skillsNeeded: [],
        commitmentLevel: 'Moderate',
        duration: '',
        additionalNotes: ''
      });
    } catch (err) {
      console.error('Error submitting collaboration request:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Enter key press in skills input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  // Success state
  if (submitSuccess) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Request Submitted Successfully!</h3>
        <p className="text-gray-600 mb-6">
          Your collaboration request has been received. ACNA will review your submission and may contact you for additional details.
        </p>
        <button
          onClick={() => setSubmitSuccess(false)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Users className="w-6 h-6 text-blue-600 mr-3" />
          Request Collaboration Support
        </h2>
        <p className="text-gray-600 mt-2">
          Use this form to request collaboration support for your pediatric neurology project. 
          Your request will be reviewed and may be posted on our public collaboration opportunities page.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
          <button 
            onClick={() => setError(null)}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <title>Close</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
            </svg>
          </button>
        </div>
      )}

      <form onSubmit={handleSubmitRequest} className="space-y-6">
        {/* Project Information */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BookOpen className="w-5 h-5 text-blue-600 mr-2" />
            Project Information
          </h3>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="projectTitle" className="block text-sm font-medium text-gray-700 mb-1">
                Project Title *
              </label>
              <input
                type="text"
                id="projectTitle"
                name="projectTitle"
                value={request.projectTitle}
                onChange={handleRequestChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Project Description *
              </label>
              <textarea
                id="projectDescription"
                name="projectDescription"
                value={request.projectDescription}
                onChange={handleRequestChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Briefly describe your project, its goals, and why you're seeking collaboration..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="institution" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Institution *
                </label>
                <input
                  type="text"
                  id="institution"
                  name="institution"
                  value={request.institution}
                  onChange={handleRequestChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="projectLead" className="block text-sm font-medium text-gray-700 mb-1">
                  Project Lead *
                </label>
                <input
                  type="text"
                  id="projectLead"
                  name="projectLead"
                  value={request.projectLead}
                  onChange={handleRequestChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Email *
              </label>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                value={request.contactEmail}
                onChange={handleRequestChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Collaboration Details */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="w-5 h-5 text-blue-600 mr-2" />
            Collaboration Details
          </h3>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="skillsNeeded" className="block text-sm font-medium text-gray-700 mb-1">
                Skills/Expertise Needed
              </label>
              <div className="flex">
                <input
                  type="text"
                  id="skillsNeeded"
                  value={currentSkill}
                  onChange={(e) => setCurrentSkill(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add skills needed (e.g., Data Analysis, EEG Interpretation)"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="bg-gray-200 px-4 py-2 rounded-r-md hover:bg-gray-300 transition-colors"
                >
                  Add
                </button>
              </div>
              
              {request.skillsNeeded.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {request.skillsNeeded.map((skill, index) => (
                    <span key={index} className="inline-flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="ml-1 text-blue-600 hover:text-blue-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="commitmentLevel" className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Commitment Level *
                </label>
                <select
                  id="commitmentLevel"
                  name="commitmentLevel"
                  value={request.commitmentLevel}
                  onChange={handleRequestChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Minimal">Minimal (occasional consultation)</option>
                  <option value="Moderate">Moderate (regular meetings)</option>
                  <option value="High">High (active participation)</option>
                </select>
              </div>

              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                  Project Duration *
                </label>
                <input
                  type="text"
                  id="duration"
                  name="duration"
                  value={request.duration}
                  onChange={handleRequestChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 6 months, 1 year"
                />
              </div>
            </div>

            <div>
              <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes
              </label>
              <textarea
                id="additionalNotes"
                name="additionalNotes"
                value={request.additionalNotes}
                onChange={handleRequestChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any other information potential collaborators should know..."
              />
            </div>
          </div>
        </div>

        {/* Submission */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-500">
            * Required fields
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-3 rounded-md font-medium text-white ${
              isSubmitting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            } transition-colors flex items-center`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              <>
                <MessageCircle className="w-5 h-5 mr-2" />
                Submit Request
              </>
            )}
          </button>
        </div>
      </form>

      {/* Help Section */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <AlertCircle className="w-5 h-5 text-blue-600 mr-2" />
          About Collaboration Requests
        </h3>
        <div className="space-y-3 text-gray-700 text-sm">
          <p>
            <strong>Review Process:</strong> All requests are reviewed by the ACNA Collaboration Committee within 3-5 business days.
          </p>
          <p>
            <strong>Public Posting:</strong> Approved requests will be posted on our collaboration opportunities page where other members can view and respond.
          </p>
          <p>
            <strong>Need help?</strong> Contact <a href="mailto:collaborations@acna.org" className="text-blue-600 hover:underline">collaborations@acna.org</a> for assistance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RequestCollaborationTab;