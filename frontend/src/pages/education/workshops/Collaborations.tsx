import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  AlertCircle,
  Mail,
  Phone,
  RefreshCw,
  Search,
  Calendar,
  AlertTriangle,
  Users
} from "lucide-react";
import { workshopsApi, CollaborationSubmission } from '../../../services/workshopAPI';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

interface CollaborationOpportunity {
  id: number;
  title: string;
  description: string;
  projectLead: string;
  institution: string;
  skillsNeeded: string[];
  commitmentLevel: string;
  duration: string;
  isActive: boolean;
  contactEmail: string;
  createdAt: string;
}

const CollaborationsTab = () => {
  const [collaborationOpportunities, setCollaborationOpportunities] = useState<CollaborationSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch approved collaboration opportunities when component mounts
  useEffect(() => {
    fetchApprovedCollaborations();
  }, []);

  const fetchApprovedCollaborations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch only approved collaborations
      const submissions = await workshopsApi.getCollaborations({ status: 'Approved' });
      setCollaborationOpportunities(submissions);
    } catch (err) {
      setError('Failed to load collaboration opportunities. Please try again later.');
      console.error('Error fetching collaboration opportunities:', err);
    } finally {
      setIsLoading(false);
    }
  };

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

  // Filter opportunities based on search term
  const filteredOpportunities = collaborationOpportunities.filter(opportunity =>
    opportunity.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opportunity.projectDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opportunity.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opportunity.projectLead.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opportunity.contactEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opportunity.skillsNeeded.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Error Card Component
  const ErrorCard = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center max-w-md mx-auto">
      <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Content</h3>
      <p className="text-red-600 mb-6">{message}</p>
      <button
        onClick={onRetry}
        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md font-medium transition-colors duration-300"
      >
        Try Again
      </button>
    </div>
  );

  // No Content Card Component
  const NoContentCard = ({ type, searchTerm }: { type: 'opportunities' | 'search'; searchTerm?: string }) => (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center max-w-md mx-auto">
      <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {type === 'search' && searchTerm ? 'No Matching Opportunities Found' : 'No Active Opportunities'}
      </h3>
      <p className="text-gray-600 mb-4">
        {type === 'search' && searchTerm 
          ? 'Try adjusting your search terms or browse all opportunities.' 
          : 'Check back later for new collaboration opportunities or submit your own project.'}
      </p>
      {type === 'search' && searchTerm && (
        <button
          onClick={() => setSearchTerm('')}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Clear search
        </button>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      <div id="opportunities" className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
          Collaboration Opportunities
        </h2>
        <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Connect with researchers and clinicians across Africa working on pediatric neurology projects.
          ACNA members can request collaboration support for their active projects.
        </p>
      </div>

      {/* Search and Refresh */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <UserPlus className="w-6 h-6 text-red-600 mr-2" />
          Current Opportunities
        </h2>
        
        <div className="flex gap-3">
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search opportunities..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button
            onClick={fetchApprovedCollaborations}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Current Opportunities */}
      <div className="mb-12">
        {error ? (
          <ErrorCard 
            message={error} 
            onRetry={fetchApprovedCollaborations} 
          />
        ) : filteredOpportunities.length > 0 ? (
          <div className="space-y-6">
            {filteredOpportunities.map((opportunity) => (
              <div key={opportunity.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-200 p-6">
                <div className="flex flex-col md:flex-row md:justify-between gap-6">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{opportunity.projectTitle}</h3>
                    <p className="text-gray-600 mb-4">{opportunity.projectDescription}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">Project Lead:</h4>
                        <p className="text-gray-600 text-sm">{opportunity.projectLead}, {opportunity.institution}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">Duration:</h4>
                        <p className="text-gray-600 text-sm">{opportunity.duration} • {opportunity.commitmentLevel} commitment</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">Skills Needed:</h4>
                      <div className="flex flex-wrap gap-1">
                        {opportunity.skillsNeeded.map((skill, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {opportunity.additionalNotes && (
                      <div className="mt-4">
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">Additional Notes:</h4>
                        <p className="text-gray-600 text-sm">{opportunity.additionalNotes}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="md:w-64 flex-shrink-0">
                    <div className="space-y-3">
                      <a
                        href={`mailto:${opportunity.contactEmail}`}
                        className="block bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors font-medium text-center"
                      >
                        Contact Project Lead
                      </a>
                      <div className="flex items-center text-xs text-gray-500 justify-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        Posted: {formatDate(opportunity.submittedAt)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <NoContentCard 
            type={searchTerm ? 'search' : 'opportunities'} 
            searchTerm={searchTerm} 
          />
        )}
      </div>

      {/* Request Collaboration */}
      <div className="bg-blue-50 rounded-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Have an Active Project?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            ACNA members can request collaboration support for their pediatric neurology projects.
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <AlertCircle className="w-6 h-6 text-red-600 mr-2" />
              Request Collaboration Support
            </h3>
            <p className="text-gray-600 mb-6">
              To request collaboration assistance for your project, please log in to your ACNA Members Account
              and submit a Collaboration Request form in the Workshop & Collaboration Hub. Our team will help connect you with potential partners
              and resources.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/login"
                className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition text-center"
              >
                Log In to Your Account
              </a>
              <a
                href="/register"
                className="flex-1 border border-red-600 text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-red-50 transition text-center"
              >
                Become a Member
              </a>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              What You Can Request
            </h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="text-red-600 mr-2">•</span>
                <span>
                  <strong>Expert Consultation:</strong> Connect with specialists in specific neurological conditions
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-red-600 mr-2">•</span>
                <span>
                  <strong>Research Collaboration:</strong> Find partners for multicenter studies or data sharing
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-red-600 mr-2">•</span>
                <span>
                  <strong>Training Support:</strong> Request workshop facilitators or training materials
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-red-600 mr-2">•</span>
                <span>
                  <strong>Program Implementation:</strong> Get help launching community programs
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-red-600 mr-2">•</span>
                <span>
                  <strong>Technical Assistance:</strong> Access support for grant writing or protocol development
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaborationsTab;