import { useState } from 'react';
import { 
  Users, BookOpen, Target, MessageCircle, CheckCircle, AlertCircle 
} from 'lucide-react';

interface CollaborationRequest {
  projectTitle: string;
  projectDescription: string;
  institution: string;
  projectLead: string;
  contactEmail: string;
  skillsNeeded: string[];
  commitmentLevel: string;
  duration: string;
  additionalNotes: string;
}

const RequestCollaborationTab = () => {
  // Collaboration request state
  const [request, setRequest] = useState<CollaborationRequest>({
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

  // Collaboration form handlers
  const handleRequestChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRequest(prev => ({
      ...prev,
      [name]: value
    }));
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

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      console.log('Submitted request:', request);
      setIsSubmitting(false);
      setSubmitSuccess(true);
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
    }, 1500);
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