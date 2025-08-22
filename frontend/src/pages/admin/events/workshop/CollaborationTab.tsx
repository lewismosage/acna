// src/pages/admin/events/workshop/CollaborationTab.tsx
import React, { useState } from 'react';
import { 
  Calendar, User, Target, MessageCircle, FileCheck, 
  XCircle, Mail, Phone
} from 'lucide-react';

interface CollaborationSubmission {
  id: number;
  projectTitle: string;
  projectDescription: string;
  institution: string;
  projectLead: string;
  contactEmail: string;
  skillsNeeded: string[];
  commitmentLevel: string;
  duration: string;
  additionalNotes: string;
  submittedAt: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Needs Info';
}

const CollaborationTab: React.FC = () => {
  const [collaborationSubmissions, setCollaborationSubmissions] = useState<CollaborationSubmission[]>([
    {
      id: 1,
      projectTitle: "Multi-center Study on Pediatric Epilepsy Outcomes",
      projectDescription: "Looking for collaborators to participate in a longitudinal study examining treatment outcomes in pediatric epilepsy patients across East Africa. This study aims to analyze seizure control rates, medication adherence, and quality of life measures.",
      institution: "University of Nairobi",
      projectLead: "Dr. James Kiprotich",
      contactEmail: "j.kiprotich@uon.ac.ke",
      skillsNeeded: ["Clinical Research", "Data Analysis", "Patient Recruitment"],
      commitmentLevel: "Moderate",
      duration: "18 months",
      additionalNotes: "Seeking partners with access to pediatric epilepsy patients and research infrastructure.",
      submittedAt: "2025-01-15",
      status: "Pending"
    },
    {
      id: 2,
      projectTitle: "Developing AI Tools for EEG Analysis",
      projectDescription: "Seeking collaborators with machine learning expertise to develop automated EEG analysis tools for pediatric patients. The goal is to create diagnostic aids for under-resourced settings.",
      institution: "Aga Khan University Hospital",
      projectLead: "Dr. Fatima Al-Rashid",
      contactEmail: "f.alrashid@aku.edu",
      skillsNeeded: ["Machine Learning", "EEG Expertise", "Software Development"],
      commitmentLevel: "High",
      duration: "12 months",
      additionalNotes: "We have preliminary datasets and are looking for technical partners.",
      submittedAt: "2025-01-10",
      status: "Approved"
    },
    {
      id: 3,
      projectTitle: "Community-based Cerebral Palsy Intervention Program",
      projectDescription: "Developing community-based intervention strategies for children with cerebral palsy in rural areas. Looking for rehabilitation specialists and community health experts.",
      institution: "Muhimbili University of Health",
      projectLead: "Dr. Grace Mwangi",
      contactEmail: "g.mwangi@muhas.ac.tz",
      skillsNeeded: ["Physiotherapy", "Community Health", "Program Management"],
      commitmentLevel: "Moderate",
      duration: "24 months",
      additionalNotes: "Project funded by local government with extension possibilities.",
      submittedAt: "2025-01-08",
      status: "Needs Info"
    }
  ]);

  const getCollaborationStatusColor = (status: CollaborationSubmission['status']) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Needs Info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleCollaborationStatusChange = (submissionId: number, newStatus: CollaborationSubmission['status']) => {
    setCollaborationSubmissions(prev =>
      prev.map(submission =>
        submission.id === submissionId
          ? { ...submission, status: newStatus }
          : submission
      )
    );
  };

  return (
    <div className="space-y-6">
      {collaborationSubmissions.map((submission) => (
        <div key={submission.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{submission.projectTitle}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {submission.projectLead}
                </div>
                <div className="flex items-center">
                  <Target className="w-4 h-4 mr-1" />
                  {submission.institution}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Submitted: {submission.submittedAt}
                </div>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCollaborationStatusColor(submission.status)}`}>
              {submission.status}
            </span>
          </div>

          <p className="text-gray-600 mb-4">{submission.projectDescription}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Duration:</strong> {submission.duration}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Commitment Level:</strong> {submission.commitmentLevel}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Contact:</strong> {submission.contactEmail}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Skills Needed:</p>
              <div className="flex flex-wrap gap-2">
                {submission.skillsNeeded.map((skill, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {submission.additionalNotes && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-1">Additional Notes:</p>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{submission.additionalNotes}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => handleCollaborationStatusChange(submission.id, 'Approved')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center text-sm font-medium transition-colors"
            >
              <FileCheck className="w-4 h-4 mr-2" />
              Approve & Post
            </button>
            
            <button 
              onClick={() => handleCollaborationStatusChange(submission.id, 'Rejected')}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center text-sm font-medium transition-colors"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </button>

            <button 
              onClick={() => handleCollaborationStatusChange(submission.id, 'Needs Info')}
              className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 flex items-center text-sm font-medium transition-colors"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Request More Info
            </button>

            <a 
              href={`mailto:${submission.contactEmail}`}
              className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center text-sm font-medium transition-colors"
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact Submitter
            </a>

            <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center text-sm font-medium transition-colors">
              <Phone className="w-4 h-4 mr-2" />
              Schedule Call
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
              <span>Submission ID: #{submission.id}</span>
              <span>Status: {submission.status}</span>
            </div>
          </div>
        </div>
      ))}

      {collaborationSubmissions.length === 0 && (
        <div className="text-center py-12">
          <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No collaboration submissions</h3>
          <p className="text-gray-500">No collaboration requests have been submitted yet.</p>
        </div>
      )}
    </div>
  );
};

export default CollaborationTab;