import { useState, useEffect } from 'react';
import { Mail } from 'lucide-react';
import { workshopsApi } from '../../../../services/workshopAPI';
import LoadingSpinner from '../../../../components/common/LoadingSpinner';

interface CollaborationOpportunity {
  id: number;
  projectTitle: string;
  institution: string;
  projectLead: string;
  description: string;
  skillsNeeded: string[];
  duration: string;
  commitmentLevel: string;
  contactEmail: string;
  posted: string;
}

const CollaborationOpportunitiesTab = () => {
  const [opportunities, setOpportunities] = useState<CollaborationOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch approved collaboration opportunities from backend
  useEffect(() => {
    const fetchOpportunities = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch only approved collaborations
        const submissions = await workshopsApi.getCollaborations({ status: 'Approved' });
        
        // Transform the API data to match our frontend interface
        const transformedOpportunities: CollaborationOpportunity[] = submissions.map(submission => ({
          id: submission.id,
          projectTitle: submission.projectTitle,
          institution: submission.institution,
          projectLead: submission.projectLead,
          description: submission.projectDescription,
          skillsNeeded: submission.skillsNeeded,
          duration: submission.duration,
          commitmentLevel: submission.commitmentLevel,
          contactEmail: submission.contactEmail,
          posted: submission.submittedAt
        }));
        
        setOpportunities(transformedOpportunities);
      } catch (err) {
        setError('Failed to load collaboration opportunities. Please try again later.');
        console.error('Error fetching collaboration opportunities:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Current Collaboration Opportunities</h2>
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Current Collaboration Opportunities</h2>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
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
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Current Collaboration Opportunities</h2>
        <p className="text-gray-600 mb-6">
          Connect with fellow researchers and clinicians on exciting projects in pediatric neurology.
        </p>
        
        <div className="space-y-6">
          {opportunities.map((opportunity) => (
            <div key={opportunity.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{opportunity.projectTitle}</h3>
                <span className="text-xs text-gray-500">Posted: {formatDate(opportunity.posted)}</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Institution:</strong> {opportunity.institution}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Project Lead:</strong> {opportunity.projectLead}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Duration:</strong> {opportunity.duration}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Commitment Level:</strong> {opportunity.commitmentLevel}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Contact:</strong> {opportunity.contactEmail}
                  </p>
                </div>
              </div>

              <p className="text-gray-700 mb-4">{opportunity.description}</p>

              {opportunity.skillsNeeded && opportunity.skillsNeeded.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Skills Needed:</p>
                  <div className="flex flex-wrap gap-2">
                    {opportunity.skillsNeeded.map((skill, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center">
                <a 
                  href={`mailto:${opportunity.contactEmail}?subject=Collaboration Interest: ${opportunity.projectTitle}`}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
                >
                  <Mail className="w-4 h-4 mr-1" />
                  Contact Project Lead
                </a>
              </div>
            </div>
          ))}
        </div>

        {opportunities.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>No collaboration opportunities available at the moment.</p>
            <p className="mt-2">Check back later or submit your own collaboration request!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollaborationOpportunitiesTab;