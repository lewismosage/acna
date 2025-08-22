import { Mail, ArrowRight } from 'lucide-react';

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
  // Collaboration opportunities
  const collaborationOpportunities: CollaborationOpportunity[] = [
    {
      id: 1,
      projectTitle: "Multi-center Study on Pediatric Epilepsy Outcomes",
      institution: "University of Nairobi",
      projectLead: "Dr. James Kiprotich",
      description: "Looking for collaborators to participate in a longitudinal study examining treatment outcomes in pediatric epilepsy patients across East Africa.",
      skillsNeeded: ["Clinical Research", "Data Analysis", "Patient Recruitment"],
      duration: "18 months",
      commitmentLevel: "Moderate",
      contactEmail: "j.kiprotich@uon.ac.ke",
      posted: "2025-10-08"
    },
    {
      id: 2,
      projectTitle: "Developing AI Tools for EEG Analysis",
      institution: "Aga Khan University Hospital",
      projectLead: "Dr. Fatima Al-Rashid",
      description: "Seeking collaborators with machine learning expertise to develop automated EEG analysis tools for pediatric patients.",
      skillsNeeded: ["Machine Learning", "EEG Expertise", "Software Development"],
      duration: "12 months",
      commitmentLevel: "High",
      contactEmail: "f.alrashid@aku.edu",
      posted: "2025-10-05"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Current Collaboration Opportunities</h2>
        <p className="text-gray-600 mb-6">
          Connect with fellow researchers and clinicians on exciting projects in pediatric neurology.
        </p>
        
        <div className="space-y-6">
          {collaborationOpportunities.map((opportunity) => (
            <div key={opportunity.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{opportunity.projectTitle}</h3>
                <span className="text-xs text-gray-500">Posted: {opportunity.posted}</span>
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
                </div>
              </div>

              <p className="text-gray-700 mb-4">{opportunity.description}</p>

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

              <div className="flex items-center justify-between">
                <a 
                  href={`mailto:${opportunity.contactEmail}`}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
                >
                  <Mail className="w-4 h-4 mr-1" />
                  Contact Project Lead
                </a>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm flex items-center">
                  <ArrowRight className="w-4 h-4 mr-1" />
                  Express Interest
                </button>
              </div>
            </div>
          ))}
        </div>

        {collaborationOpportunities.length === 0 && (
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