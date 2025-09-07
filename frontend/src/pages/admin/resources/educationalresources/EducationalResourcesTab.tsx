import React, { useState, useEffect } from 'react';
import { 
  Book, 
  Video, 
  FileText, 
  Plus, 
  Search, 
  Eye, 
  Edit3, 
  Trash2, 
  Download, 
  Upload,
  Calendar,
  User,
  Tag,
  Filter,
  BarChart3,
  Users,
  TrendingUp,
  Star,
  CheckCircle,
  AlertCircle,
  Clock,
  Archive,
  X,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  ExternalLink,
  Settings
} from 'lucide-react';

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

interface ResourceAnalytics {
  totalResources: number;
  publishedResources: number;
  draftResources: number;
  underReviewResources: number;
  archivedResources: number;
  totalDownloads: number;
  totalViews: number;
  monthlyDownloads: number;
  monthlyViews: number;
  pendingSubmissions: number;
  featuredResources: number;
  topCategories: Array<{
    category: string;
    count: number;
    downloads: number;
  }>;
  topResources: Array<{
    id: number;
    title: string;
    category: string;
    downloads: number;
    views: number;
  }>;
  recentActivity: Array<{
    type: 'download' | 'view' | 'submission' | 'publish';
    resource: string;
    count?: number;
    date: string;
    user?: string;
  }>;
}

const EducationalResourcesTab: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'resources' | 'submissions' | 'analytics'>('resources');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingResource, setEditingResource] = useState<FactSheet | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [expandedSubmissions, setExpandedSubmissions] = useState<number[]>([]);
  const [expandedResources, setExpandedResources] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

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

  const analyticsData: ResourceAnalytics = {
    totalResources: factSheets.length,
    publishedResources: factSheets.filter(r => r.status === 'Published').length,
    draftResources: factSheets.filter(r => r.status === 'Draft').length,
    underReviewResources: factSheets.filter(r => r.status === 'Under Review').length,
    archivedResources: factSheets.filter(r => r.status === 'Archived').length,
    totalDownloads: factSheets.reduce((sum, r) => sum + r.downloads, 0),
    totalViews: factSheets.reduce((sum, r) => sum + r.views, 0),
    monthlyDownloads: 1250,
    monthlyViews: 2890,
    pendingSubmissions: caseStudySubmissions.filter(s => s.status === 'Pending Review').length,
    featuredResources: factSheets.filter(r => r.isFeatured).length,
    topCategories: [
      { category: 'Epilepsy', count: 12, downloads: 5200 },
      { category: 'Cerebral Palsy', count: 8, downloads: 3800 },
      { category: 'Neurodevelopment', count: 6, downloads: 2100 }
    ],
    topResources: [
      { id: 1, title: 'Epilepsy in African Children', category: 'Epilepsy', downloads: 2400, views: 5600 },
      { id: 2, title: 'Cerebral Palsy Early Detection', category: 'Cerebral Palsy', downloads: 1800, views: 3200 }
    ],
    recentActivity: [
      { type: 'download', resource: 'Epilepsy Fact Sheet', count: 45, date: '2024-08-25' },
      { type: 'submission', resource: 'Ghana Epilepsy Program', date: '2024-08-20', user: 'Dr. Kwame Asante' }
    ]
  };

  const categories = ['Epilepsy', 'Cerebral Palsy', 'Neurodevelopment', 'Nutrition', 'Seizures', 'Rehabilitation', 'General'];
  const statuses = ['Published', 'Draft', 'Under Review', 'Archived'];
  const resourceTypes = ['Fact Sheet', 'Case Study', 'Video', 'Document', 'Slide Deck', 'Interactive'];

  const filteredResources = factSheets.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || resource.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || resource.status === filterStatus;
    const matchesType = filterType === 'all' || resource.type === filterType;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesType;
  });

  const getStatusColor = (status: ResourceStatus) => {
    switch (status) {
      case 'Published':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Under Review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Archived':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSubmissionStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
      case 'Published':
        return 'bg-green-100 text-green-800';
      case 'Pending Review':
        return 'bg-yellow-100 text-yellow-800';
      case 'Under Review':
        return 'bg-blue-100 text-blue-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: ResourceType) => {
    switch (type) {
      case 'Video':
        return <Video className="w-5 h-5" />;
      case 'Fact Sheet':
      case 'Document':
        return <FileText className="w-5 h-5" />;
      case 'Interactive':
        return <Book className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const toggleSubmissionExpansion = (id: number) => {
    setExpandedSubmissions(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const toggleResourceExpansion = (id: number) => {
    setExpandedResources(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleStatusChange = (submissionId: number, newStatus: string) => {
    setCaseStudySubmissions(prev =>
      prev.map(submission =>
        submission.id === submissionId
          ? { ...submission, status: newStatus as CaseStudySubmission['status'] }
          : submission
      )
    );
  };

  const handleResourceStatusChange = (resourceId: number, newStatus: ResourceStatus) => {
    setFactSheets(prev =>
      prev.map(resource =>
        resource.id === resourceId
          ? { ...resource, status: newStatus }
          : resource
      )
    );
  };

  const handleToggleFeatured = (resourceId: number) => {
    setFactSheets(prev =>
      prev.map(resource =>
        resource.id === resourceId
          ? { ...resource, isFeatured: !resource.isFeatured }
          : resource
      )
    );
  };

  const renderResourcesTab = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col md:flex-row gap-3 flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            {resourceTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center font-medium transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Resource
        </button>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => (
          <div key={resource.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
            <div className="relative">
              {resource.imageUrl ? (
                <img
                  src={resource.imageUrl}
                  alt={resource.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 rounded-t-lg flex items-center justify-center">
                  {getTypeIcon(resource.type)}
                </div>
              )}
              
              <div className="absolute top-3 left-3 flex gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(resource.status)}`}>
                  {resource.status}
                </span>
                {resource.isFeatured && (
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                )}
              </div>
              
              <div className="absolute top-3 right-3">
                <span className="bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                  {resource.type}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{resource.title}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-3">{resource.description}</p>
              
              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span>By {resource.author}</span>
                <span>{resource.dateCreated}</span>
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span>{resource.fileSize} • {resource.fileFormat}</span>
                <div className="flex gap-3">
                  <span>{resource.downloads} downloads</span>
                  <span>{resource.views} views</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1 mb-4">
                {resource.tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 text-xs rounded">
                    {tag}
                  </span>
                ))}
                {resource.tags.length > 3 && (
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 text-xs rounded">
                    +{resource.tags.length - 3}
                  </span>
                )}
              </div>
              
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs text-blue-600 font-medium">{resource.category}</span>
                <div className="flex gap-2">
                  <button className="text-blue-600 hover:text-blue-800 p-1">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="text-green-600 hover:text-green-800 p-1">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button className="text-purple-600 hover:text-purple-800 p-1">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-800 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Admin Actions */}
              <div className="space-y-2">
                <select
                  value={resource.status}
                  onChange={(e) => handleResourceStatusChange(resource.id, e.target.value as ResourceStatus)}
                  className="w-full px-3 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Draft">Draft</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Published">Published</option>
                  <option value="Archived">Archived</option>
                </select>
                
                <button 
                  onClick={() => handleToggleFeatured(resource.id)}
                  className={`w-full px-3 py-1 rounded text-xs font-medium transition-colors ${
                    resource.isFeatured 
                      ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {resource.isFeatured ? 'Unfeature' : 'Feature'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <Book className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
          <p className="text-gray-500">
            {searchTerm || filterCategory !== 'all' || filterStatus !== 'all' || filterType !== 'all'
              ? "Try adjusting your search or filter criteria."
              : "Get started by creating your first educational resource."}
          </p>
        </div>
      )}
    </div>
  );

  const renderSubmissionsTab = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">Case Study Submissions</h3>
        <p className="text-blue-700 text-sm">
          Review and manage case study submissions from healthcare professionals across Africa.
          Approved submissions will be published in the public case studies section.
        </p>
      </div>

      <div className="space-y-4">
        {caseStudySubmissions.map((submission) => {
          const isExpanded = expandedSubmissions.includes(submission.id);
          
          return (
            <div key={submission.id} className="bg-white border border-gray-200 rounded-lg">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-900">{submission.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSubmissionStatusColor(submission.status)}`}>
                        {submission.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="font-medium">{submission.submittedBy}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{submission.submissionDate}</span>
                        </div>
                        {submission.phone && (
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-2 text-gray-400" />
                            <span>{submission.phone}</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Tag className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{submission.category}</span>
                        </div>
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{submission.email}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">{submission.location}</span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{submission.excerpt}</p>
                    
                    {submission.impact && (
                      <div className="mb-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Impact: {submission.impact}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                          {submission.attachments.length} attachment{submission.attachments.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <button
                        onClick={() => toggleSubmissionExpansion(submission.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        {isExpanded ? 'Collapse Details' : 'View Details'}
                      </button>
                    </div>
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                        <div className="space-y-2 text-sm">
                          <div><span className="font-medium">Institution:</span> {submission.institution}</div>
                          <div><span className="font-medium">Email:</span> {submission.email}</div>
                          {submission.phone && (
                            <div><span className="font-medium">Phone:</span> {submission.phone}</div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Attachments</h4>
                        <div className="space-y-2">
                          {submission.attachments.map((attachment, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">{attachment}</span>
                              <button className="text-blue-600 hover:text-blue-800">
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {submission.reviewNotes && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Review Notes</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{submission.reviewNotes}</p>
                      </div>
                    )}
                    
                    <div className="flex gap-3 pt-4">
                      <select
                        value={submission.status}
                        onChange={(e) => handleStatusChange(submission.id, e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Pending Review">Pending Review</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Approved">Approved</option>
                        <option value="Published">Published</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                      
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                        Add Review Notes
                      </button>
                      
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                        Contact Submitter
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {caseStudySubmissions.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
          <p className="text-gray-500">Case study submissions will appear here for review.</p>
        </div>
      )}
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Resources</p>
              <p className="text-3xl font-bold text-blue-900">{analyticsData.totalResources}</p>
            </div>
            <Book className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Total Downloads</p>
              <p className="text-3xl font-bold text-green-900">{analyticsData.totalDownloads.toLocaleString()}</p>
            </div>
            <Download className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-green-600 text-sm mt-2">+{analyticsData.monthlyDownloads} this month</p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Total Views</p>
              <p className="text-3xl font-bold text-purple-900">{analyticsData.totalViews.toLocaleString()}</p>
            </div>
            <Eye className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-purple-600 text-sm mt-2">+{analyticsData.monthlyViews} this month</p>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Pending Submissions</p>
              <p className="text-3xl font-bold text-orange-900">{analyticsData.pendingSubmissions}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Status Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-lg bg-green-50">
            <div className="text-2xl font-bold text-green-800">{analyticsData.publishedResources}</div>
            <div className="text-sm text-green-600">Published</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-yellow-50">
            <div className="text-2xl font-bold text-yellow-800">{analyticsData.draftResources}</div>
            <div className="text-sm text-yellow-600">Draft</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-blue-50">
            <div className="text-2xl font-bold text-blue-800">{analyticsData.underReviewResources}</div>
            <div className="text-sm text-blue-600">Under Review</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-gray-50">
            <div className="text-2xl font-bold text-gray-800">{analyticsData.archivedResources}</div>
            <div className="text-sm text-gray-600">Archived</div>
          </div>
        </div>
      </div>

      {/* Top Categories and Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Categories</h3>
          <div className="space-y-3">
            {analyticsData.topCategories.map((category) => (
              <div key={category.category} className="flex items-center justify-between">
                <span className="text-gray-600">{category.category}</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(category.count / analyticsData.topCategories[0].count) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{category.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {analyticsData.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg mr-3 ${
                    activity.type === 'download' ? 'bg-green-100' :
                    activity.type === 'submission' ? 'bg-blue-100' :
                    activity.type === 'publish' ? 'bg-purple-100' : 'bg-orange-100'
                  }`}>
                    {activity.type === 'download' ? <Download className="w-4 h-4 text-green-600" /> :
                     activity.type === 'submission' ? <Upload className="w-4 h-4 text-blue-600" /> :
                     activity.type === 'publish' ? <CheckCircle className="w-4 h-4 text-purple-600" /> :
                     <Eye className="w-4 h-4 text-orange-600" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.resource}</p>
                    <p className="text-xs text-gray-500">{activity.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">
                    {activity.count ? `${activity.count} ${activity.type}` : activity.type}
                  </p>
                  {activity.user && <p className="text-xs text-gray-500">{activity.user}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Mock Create Resource Modal Component (placeholder)
  const CreateResourceModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center">
              <Plus className="w-6 h-6 mr-2 text-blue-600" />
              Create Educational Resource
            </h2>
            <button 
              type="button"
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setShowCreateModal(false)}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resource Title</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter resource title"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="Fact Sheet">Fact Sheet</option>
                  <option value="Video">Video</option>
                  <option value="Document">Document</option>
                  <option value="Interactive">Interactive</option>
                  <option value="Slide Deck">Slide Deck</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Describe the resource content"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Neurologists, Pediatricians, Medical Students"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Separate tags with commas"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload File</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Drag and drop your file here, or click to browse</p>
                <input type="file" className="hidden" />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" />
                <span className="ml-2 text-sm font-medium text-gray-700">Feature this resource</span>
              </label>
              
              <label className="flex items-center">
                <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" />
                <span className="ml-2 text-sm font-medium text-gray-700">Publish immediately</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Create Resource
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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
              { id: 'resources', label: 'Resources', count: factSheets.length },
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
          {selectedTab === 'resources' && renderResourcesTab()}
          {selectedTab === 'submissions' && renderSubmissionsTab()}
          {selectedTab === 'analytics' && renderAnalyticsTab()}
        </div>
      </div>

      {/* Create Resource Modal */}
      {showCreateModal && <CreateResourceModal />}
    </div>
  );
};

export default EducationalResourcesTab;