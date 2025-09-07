import React, { useState } from 'react';
import { 
  Book, 
  BarChart3,
  X
} from 'lucide-react';
import FactSheetResourcesTab from './FactSheetResourcesTab';
import CaseStudySubmissionsTab from './CaseStudySubmissionsTab';
import CreateResourceModal from './CreateResourceModal';
import AnalyticsTab from './AnalyticsTab';

// Types
type ResourceType = 'Fact Sheet' | 'Case Study' | 'Video' | 'Document' | 'Slide Deck' | 'Interactive';
type ResourceStatus = 'Published' | 'Draft' | 'Under Review' | 'Archived';
type ResourceCategory = 'Epilepsy' | 'Cerebral Palsy' | 'Neurodevelopment' | 'Nutrition' | 'Seizures' | 'Rehabilitation' | 'General';

interface FactSheet {
  id: number;
  title: string;
  type: ResourceType;
  category: ResourceCategory;
  description: string;
  fullDescription?: string;
  status: ResourceStatus;
  author: string;
  dateCreated: string;
  datePublished?: string;
  downloads: number;
  views: number;
  fileSize: string;
  fileFormat: string;
  tags: string[];
  targetAudience: string[];
  isFeatured: boolean;
  imageUrl?: string;
  fileUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface CaseStudySubmission {
  id: number;
  title: string;
  submittedBy: string;
  institution: string;
  email: string;
  phone?: string;
  location: string;
  category: string;
  submissionDate: string;
  status: 'Pending Review' | 'Under Review' | 'Approved' | 'Published' | 'Rejected';
  excerpt: string;
  fullContent?: string;
  attachments: string[];
  reviewNotes?: string;
  reviewedBy?: string;
  reviewDate?: string;
  publishedDate?: string;
  impact?: string;
  imageUrl?: string;
}

const EducationalResourcesTab: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'resources' | 'submissions' | 'analytics'>('resources');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Mock data
  const [factSheets, setFactSheets] = useState<FactSheet[]>([
    {
      id: 1,
      title: 'Epilepsy in African Children: Understanding the Burden',
      type: 'Fact Sheet',
      category: 'Epilepsy',
      description: 'Comprehensive overview of epilepsy prevalence, causes, and treatment challenges in African pediatric populations.',
      fullDescription: 'This comprehensive fact sheet provides an in-depth analysis of epilepsy burden in African children, covering epidemiological data, genetic factors, environmental influences, and socioeconomic challenges.\n\nKey sections include:\n- Prevalence rates across different African regions\n- Common seizure types and their presentations\n- Treatment gaps and healthcare accessibility issues\n- Cultural beliefs and stigma surrounding epilepsy\n- Evidence-based management strategies\n- Case examples from various African healthcare settings',
      status: 'Published',
      author: 'Dr. Sarah Johnson',
      dateCreated: '2024-06-15',
      datePublished: '2024-07-01',
      downloads: 2400,
      views: 5600,
      fileSize: '1.2 MB',
      fileFormat: 'PDF',
      tags: ['Epilepsy', 'Statistics', 'Treatment', 'Africa'],
      targetAudience: ['Neurologists', 'Pediatricians', 'Medical Students'],
      isFeatured: true,
      imageUrl: 'https://images.pexels.com/photos/4260325/pexels-photo-4260325.jpeg?auto=compress&cs=tinysrgb&w=600',
      fileUrl: '/resources/epilepsy-african-children.pdf',
      createdAt: '2024-06-15',
      updatedAt: '2024-08-20'
    },
    {
      id: 2,
      title: 'Cerebral Palsy: Early Detection and Intervention',
      type: 'Fact Sheet',
      category: 'Cerebral Palsy',
      description: 'Evidence-based guidelines for early identification and comprehensive management of cerebral palsy.',
      status: 'Published',
      author: 'Dr. Michael Chen',
      dateCreated: '2024-05-20',
      datePublished: '2024-06-01',
      downloads: 1800,
      views: 3200,
      fileSize: '2.1 MB',
      fileFormat: 'PDF',
      tags: ['Cerebral Palsy', 'Early Detection', 'Intervention'],
      targetAudience: ['Physical Therapists', 'Occupational Therapists', 'Pediatricians'],
      isFeatured: false,
      fileUrl: '/resources/cerebral-palsy-early-detection.pdf',
      createdAt: '2024-05-20',
      updatedAt: '2024-08-15'
    },
    {
      id: 3,
      title: 'Neurodevelopmental Assessment Tools',
      type: 'Interactive',
      category: 'Neurodevelopment',
      description: 'Interactive screening tools for developmental delays in African healthcare settings.',
      status: 'Draft',
      author: 'Dr. Amina Hassan',
      dateCreated: '2024-08-10',
      downloads: 0,
      views: 45,
      fileSize: '850 KB',
      fileFormat: 'HTML',
      tags: ['Assessment', 'Tools', 'Screening'],
      targetAudience: ['Community Health Workers', 'Nurses'],
      isFeatured: false,
      fileUrl: '/tools/neurodev-assessment.html',
      createdAt: '2024-08-10',
      updatedAt: '2024-08-25'
    }
  ]);

  const [caseStudySubmissions, setCaseStudySubmissions] = useState<CaseStudySubmission[]>([
    {
      id: 1,
      title: 'Community-Based Epilepsy Care Program in Rural Ghana',
      submittedBy: 'Dr. Kwame Asante',
      institution: 'Korle-Bu Teaching Hospital',
      email: 'k.asante@korlebu.edu.gh',
      phone: '+233-50-123-4567',
      location: 'Ashanti Region, Ghana',
      category: 'Epilepsy Care',
      submissionDate: '2024-08-20',
      status: 'Pending Review',
      excerpt: 'Implementation of a community-based epilepsy care program that reduced treatment gaps and improved quality of life for 500+ patients in rural Ghana.',
      attachments: ['case-study-ghana.pdf', 'supporting-data.xlsx', 'patient-testimonials.mp4'],
      impact: '523 patients served, 78% seizure reduction'
    },
    {
      id: 2,
      title: 'Mobile Health Platform for Cerebral Palsy Management',
      submittedBy: 'Dr. Grace Mwangi',
      institution: 'University of Nairobi',
      email: 'g.mwangi@uonbi.ac.ke',
      location: 'Nairobi, Kenya',
      category: 'Mobile Health',
      submissionDate: '2024-08-15',
      status: 'Under Review',
      excerpt: 'Development and implementation of a mobile health platform connecting families, therapists, and healthcare providers for cerebral palsy management.',
      attachments: ['mobile-platform-case-study.pdf', 'app-screenshots.zip'],
      reviewNotes: 'Strong methodology, needs minor revisions in discussion section.',
      reviewedBy: 'Dr. Sarah Johnson',
      reviewDate: '2024-08-18',
      impact: '150 families engaged, 40% therapy adherence improvement'
    }
  ]);

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'resources':
        return (
          <FactSheetResourcesTab
            factSheets={factSheets}
            setFactSheets={setFactSheets}
            onCreateNew={() => setShowCreateModal(true)}
          />
        );
      case 'submissions':
        return (
          <CaseStudySubmissionsTab
            submissions={caseStudySubmissions}
            setSubmissions={setCaseStudySubmissions}
          />
        );
      case 'analytics':
        return <AnalyticsTab factSheets={factSheets} submissions={caseStudySubmissions} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white border border-gray-300 rounded-lg">
        <div className="bg-blue-50 px-6 py-4 border-b border-gray-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Book className="w-7 h-7 mr-3 text-blue-600" />
                Educational Resources Management
              </h2>
              <p className="text-gray-600 mt-1">Manage fact sheets, case studies, and educational content</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setSelectedTab('analytics')}
                className="border border-blue-600 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 flex items-center font-medium transition-colors"
              >
                <BarChart3 className="w-5 h-5 mr-2" />
                Analytics
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-4 border-b border-gray-200">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'resources', label: 'Fact Sheet Resources', count: factSheets.length },
              { id: 'submissions', label: 'Case Study Submissions', count: caseStudySubmissions.length },
              { id: 'analytics', label: 'Analytics', count: 0 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`py-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  selectedTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label} {tab.count > 0 && `(${tab.count})`}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>

      {/* Create Resource Modal */}
      {showCreateModal && (
        <CreateResourceModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
};

export default EducationalResourcesTab;