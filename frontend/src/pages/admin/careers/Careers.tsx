import React, { useState, useEffect } from "react";
import {
  Briefcase,
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Users,
  FileText,
  Calendar,
  MapPin,
  Filter,
  Download,
  Mail,
  Phone,
  User,
  ChevronDown,
  ChevronUp,
  Archive,
  Settings,
  TrendingUp,
  BarChart3
} from "lucide-react";

// Mock data - in real app this would come from API
const mockCareerOpportunities = [
  {
    id: 1,
    title: "Senior Pediatric Neurologist",
    department: "Clinical Services",
    location: "Nairobi, Kenya",
    type: "Full-time",
    level: "Senior",
    status: "Active",
    postedDate: "2025-01-15",
    closingDate: "2025-02-15",
    applicationsCount: 12,
    description: "Lead clinical services for pediatric neurology programs across East Africa...",
    requirements: ["MD with neurology specialization", "5+ years pediatric experience", "Research background preferred"],
    salary: "$45,000 - $65,000",
    createdAt: "2025-01-15",
    updatedAt: "2025-01-20"
  },
  {
    id: 2,
    title: "Research Coordinator - Epilepsy Program",
    department: "Research",
    location: "Abuja, Nigeria",
    type: "Contract",
    level: "Mid-level",
    status: "Active",
    postedDate: "2025-01-10",
    closingDate: "2025-02-10",
    applicationsCount: 8,
    description: "Coordinate multi-site epilepsy research studies across West Africa...",
    requirements: ["Masters in Public Health", "Clinical research experience", "Fluent in English and local languages"],
    salary: "$35,000 - $45,000",
    createdAt: "2025-01-10",
    updatedAt: "2025-01-18"
  },
  {
    id: 3,
    title: "Digital Health Program Manager",
    department: "Technology",
    location: "Remote",
    type: "Full-time",
    level: "Mid-level",
    status: "Draft",
    postedDate: null,
    closingDate: "2025-03-01",
    applicationsCount: 0,
    description: "Lead development and implementation of digital health solutions...",
    requirements: ["Project management experience", "Healthcare technology background", "Agile methodology knowledge"],
    salary: "$40,000 - $55,000",
    createdAt: "2025-01-12",
    updatedAt: "2025-01-19"
  }
];

const mockApplications = [
  {
    id: 1,
    opportunityId: 1,
    opportunityTitle: "Senior Pediatric Neurologist",
    applicantName: "Dr. Amara Johnson",
    email: "amara.johnson@email.com",
    phone: "+254712345678",
    location: "Nairobi, Kenya",
    experience: "8 years",
    status: "Under Review",
    appliedDate: "2025-01-18",
    resume: "amara_johnson_resume.pdf",
    coverLetter: "Passionate about improving pediatric neurology care in Africa...",
    notes: "Strong candidate with excellent references",
    rating: 4.5,
    createdAt: "2025-01-18"
  },
  {
    id: 2,
    opportunityId: 1,
    opportunityTitle: "Senior Pediatric Neurologist",
    applicantName: "Dr. Michael Okonkwo",
    email: "m.okonkwo@email.com",
    phone: "+2348012345678",
    location: "Lagos, Nigeria",
    experience: "6 years",
    status: "Shortlisted",
    appliedDate: "2025-01-16",
    resume: "michael_okonkwo_resume.pdf",
    coverLetter: "Experienced in pediatric care with research background...",
    notes: "Good fit for research components",
    rating: 4.0,
    createdAt: "2025-01-16"
  },
  {
    id: 3,
    opportunityId: 2,
    opportunityTitle: "Research Coordinator - Epilepsy Program",
    applicantName: "Sarah Adebayo",
    email: "sarah.adebayo@email.com",
    phone: "+2349087654321",
    location: "Abuja, Nigeria",
    experience: "4 years",
    status: "New",
    appliedDate: "2025-01-20",
    resume: "sarah_adebayo_resume.pdf",
    coverLetter: "MPH graduate with focus on epilepsy research...",
    notes: "",
    rating: null,
    createdAt: "2025-01-20"
  }
];

const mockVolunteers = [
  {
    id: 1,
    name: "Grace Mwangi",
    email: "grace.mwangi@email.com",
    phone: "+254701234567",
    location: "Nairobi, Kenya",
    interests: ["Community Outreach", "Event Organization", "Translation"],
    skills: ["Swahili", "Event Planning", "Social Media"],
    availability: "Weekends",
    experience: "2 years volunteer experience with local NGOs",
    motivation: "Passionate about improving child health outcomes in my community",
    status: "Active",
    joinDate: "2025-01-10",
    hoursContributed: 24,
    projects: ["Community Health Fair", "Awareness Campaign"],
    createdAt: "2025-01-10"
  },
  {
    id: 2,
    name: "Dr. James Kimani",
    email: "j.kimani@email.com",
    phone: "+254722345678",
    location: "Mombasa, Kenya",
    interests: ["Medical Training", "Research Support", "Mentorship"],
    skills: ["Clinical Training", "Research", "Mentorship"],
    availability: "Flexible",
    experience: "15 years medical practice, 5 years training experience",
    motivation: "Want to share knowledge and train next generation of healthcare workers",
    status: "Active",
    joinDate: "2024-12-15",
    hoursContributed: 48,
    projects: ["Training Program", "Mentorship Initiative"],
    createdAt: "2024-12-15"
  },
  {
    id: 3,
    name: "Maria Santos",
    email: "maria.santos@email.com",
    phone: "+27821234567",
    location: "Cape Town, South Africa",
    interests: ["Digital Advocacy", "Content Creation", "Fundraising"],
    skills: ["Graphic Design", "Social Media", "Content Writing"],
    availability: "Evenings and Weekends",
    experience: "Marketing professional with nonprofit experience",
    motivation: "Using my marketing skills to amplify ACNA's mission",
    status: "Pending Review",
    joinDate: "2025-01-22",
    hoursContributed: 0,
    projects: [],
    createdAt: "2025-01-22"
  }
];

const CareersAdminTab = () => {
  const [selectedTab, setSelectedTab] = useState("opportunities");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [expandedItems, setExpandedItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Sample data state
  const [opportunities, setOpportunities] = useState(mockCareerOpportunities);
  const [applications, setApplications] = useState(mockApplications);
  const [volunteers, setVolunteers] = useState(mockVolunteers);

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
      case "Shortlisted":
        return "bg-green-100 text-green-800 border-green-200";
      case "Draft":
      case "Under Review":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Closed":
      case "Rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "New":
      case "Pending Review":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Active":
      case "Shortlisted":
        return <CheckCircle className="w-4 h-4" />;
      case "Draft":
      case "Under Review":
        return <Clock className="w-4 h-4" />;
      case "Closed":
      case "Rejected":
        return <XCircle className="w-4 h-4" />;
      case "New":
      case "Pending Review":
        return <Settings className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const toggleExpand = (id) => {
    setExpandedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      if (selectedTab === "opportunities") {
        setOpportunities(prev => prev.filter(item => item.id !== id));
      } else if (selectedTab === "applications") {
        setApplications(prev => prev.filter(item => item.id !== id));
      } else if (selectedTab === "volunteers") {
        setVolunteers(prev => prev.filter(item => item.id !== id));
      }
    }
  };

  const renderOpportunities = () => {
    const filteredOpportunities = opportunities.filter(opp => {
      const matchesSearch = opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           opp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           opp.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || opp.status === filterStatus;
      const matchesDepartment = filterDepartment === "all" || opp.department === filterDepartment;
      return matchesSearch && matchesStatus && matchesDepartment;
    });

    return (
      <div className="space-y-6">
        {filteredOpportunities.map((opportunity) => {
          const isExpanded = expandedItems.includes(opportunity.id);
          
          return (
            <div key={opportunity.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(opportunity.status)} flex items-center`}>
                        {getStatusIcon(opportunity.status)}
                        <span className="ml-1">{opportunity.status}</span>
                      </span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs font-medium rounded border border-blue-200">
                        {opportunity.type}
                      </span>
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 text-xs font-medium rounded border border-purple-200">
                        {opportunity.level}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">{opportunity.title}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center text-gray-600 text-sm">
                        <Briefcase className="w-4 h-4 mr-2 text-orange-600" />
                        <span>{opportunity.department}</span>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <MapPin className="w-4 h-4 mr-2 text-orange-600" />
                        <span>{opportunity.location}</span>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <Calendar className="w-4 h-4 mr-2 text-orange-600" />
                        <span>Posted: {opportunity.postedDate || 'Draft'}</span>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <Users className="w-4 h-4 mr-2 text-orange-600" />
                        <span>{opportunity.applicationsCount} applications</span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4">{opportunity.description}</p>
                    <p className="text-gray-800 font-medium text-sm">Salary: {opportunity.salary}</p>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Requirements</h4>
                      <ul className="space-y-1">
                        {opportunity.requirements.map((req, index) => (
                          <li key={index} className="text-gray-600 text-sm flex items-start">
                            <span className="w-2 h-2 bg-orange-600 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-3 mb-4">
                  <button
                    onClick={() => toggleExpand(opportunity.id)}
                    className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center text-sm font-medium transition-colors"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-4 h-4 mr-2" />
                        Collapse
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-2" />
                        Expand
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setEditingItem(opportunity);
                      setShowModal(true);
                    }}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center text-sm font-medium transition-colors"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(opportunity.id)}
                    className="border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 flex items-center text-sm font-medium transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    <span>Created: {opportunity.createdAt}</span>
                    <span>Last Updated: {opportunity.updatedAt}</span>
                    <span>ID: #{opportunity.id}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderApplications = () => {
    const filteredApplications = applications.filter(app => {
      const matchesSearch = app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           app.opportunityTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           app.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || app.status === filterStatus;
      return matchesSearch && matchesStatus;
    });

    return (
      <div className="space-y-6">
        {filteredApplications.map((application) => {
          const isExpanded = expandedItems.includes(application.id);
          
          return (
            <div key={application.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(application.status)} flex items-center`}>
                        {getStatusIcon(application.status)}
                        <span className="ml-1">{application.status}</span>
                      </span>
                      {application.rating && (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 text-xs font-medium rounded border border-yellow-200">
                          ⭐ {application.rating}/5
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">{application.applicantName}</h3>
                    <p className="text-lg text-gray-700 mb-3">{application.opportunityTitle}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center text-gray-600 text-sm">
                        <Mail className="w-4 h-4 mr-2 text-orange-600" />
                        <span>{application.email}</span>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <Phone className="w-4 h-4 mr-2 text-orange-600" />
                        <span>{application.phone}</span>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <MapPin className="w-4 h-4 mr-2 text-orange-600" />
                        <span>{application.location}</span>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <Calendar className="w-4 h-4 mr-2 text-orange-600" />
                        <span>Applied: {application.appliedDate}</span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-2">Experience: {application.experience}</p>
                    {application.notes && (
                      <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded">
                        <strong>Notes:</strong> {application.notes}
                      </p>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Cover Letter</h4>
                      <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded">
                        {application.coverLetter}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Documents</h4>
                      <div className="flex items-center text-blue-600 text-sm">
                        <FileText className="w-4 h-4 mr-2" />
                        <a href="#" className="hover:underline">{application.resume}</a>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-3 mb-4">
                  <button
                    onClick={() => toggleExpand(application.id)}
                    className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center text-sm font-medium transition-colors"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-4 h-4 mr-2" />
                        Collapse
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-2" />
                        Expand
                      </>
                    )}
                  </button>

                  <select
                    value={application.status}
                    onChange={(e) => {
                      const updatedApplications = applications.map(app =>
                        app.id === application.id ? { ...app, status: e.target.value } : app
                      );
                      setApplications(updatedApplications);
                    }}
                    className="border border-gray-300 px-3 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="New">New</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Rejected">Rejected</option>
                  </select>

                  <button
                    onClick={() => handleDelete(application.id)}
                    className="border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 flex items-center text-sm font-medium transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    <span>Applied: {application.createdAt}</span>
                    <span>ID: #{application.id}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderVolunteers = () => {
    const filteredVolunteers = volunteers.filter(volunteer => {
      const matchesSearch = volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           volunteer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           volunteer.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = filterStatus === "all" || volunteer.status === filterStatus;
      return matchesSearch && matchesStatus;
    });

    return (
      <div className="space-y-6">
        {filteredVolunteers.map((volunteer) => {
          const isExpanded = expandedItems.includes(volunteer.id);
          
          return (
            <div key={volunteer.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(volunteer.status)} flex items-center`}>
                        {getStatusIcon(volunteer.status)}
                        <span className="ml-1">{volunteer.status}</span>
                      </span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 text-xs font-medium rounded border border-green-200">
                        {volunteer.hoursContributed}h contributed
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">{volunteer.name}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center text-gray-600 text-sm">
                        <Mail className="w-4 h-4 mr-2 text-orange-600" />
                        <span>{volunteer.email}</span>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <Phone className="w-4 h-4 mr-2 text-orange-600" />
                        <span>{volunteer.phone}</span>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <MapPin className="w-4 h-4 mr-2 text-orange-600" />
                        <span>{volunteer.location}</span>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <Calendar className="w-4 h-4 mr-2 text-orange-600" />
                        <span>Joined: {volunteer.joinDate}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-1">Interests:</h4>
                      <div className="flex flex-wrap gap-1">
                        {volunteer.interests.map((interest, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded">
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-1">Skills:</h4>
                      <div className="flex flex-wrap gap-1">
                        {volunteer.skills.map((skill, index) => (
                          <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 text-xs rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm">Availability: {volunteer.availability}</p>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Experience</h4>
                      <p className="text-gray-600 text-sm">{volunteer.experience}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Motivation</h4>
                      <p className="text-gray-600 text-sm">{volunteer.motivation}</p>
                    </div>
                    {volunteer.projects.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Projects</h4>
                        <div className="flex flex-wrap gap-1">
                          {volunteer.projects.map((project, index) => (
                            <span key={index} className="bg-green-100 text-green-800 px-2 py-1 text-xs rounded">
                              {project}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-3 mb-4">
                  <button
                    onClick={() => toggleExpand(volunteer.id)}
                    className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center text-sm font-medium transition-colors"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-4 h-4 mr-2" />
                        Collapse
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-2" />
                        Expand
                      </>
                    )}
                  </button>

                  <select
                    value={volunteer.status}
                    onChange={(e) => {
                      const updatedVolunteers = volunteers.map(vol =>
                        vol.id === volunteer.id ? { ...vol, status: e.target.value } : vol
                      );
                      setVolunteers(updatedVolunteers);
                    }}
                    className="border border-gray-300 px-3 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="Pending Review">Pending Review</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>

                  <button
                    onClick={() => handleDelete(volunteer.id)}
                    className="border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 flex items-center text-sm font-medium transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    <span>Registered: {volunteer.createdAt}</span>
                    <span>ID: #{volunteer.id}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderEmptyState = (type) => {
    const configs = {
      opportunities: {
        icon: <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />,
        title: "No career opportunities found",
        description: searchTerm ? "No opportunities match your search criteria." : "No opportunities have been created yet.",
        buttonText: "Create First Opportunity"
      },
      applications: {
        icon: <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />,
        title: "No applications found",
        description: searchTerm ? "No applications match your search criteria." : "No applications have been received yet.",
        buttonText: null
      },
      volunteers: {
        icon: <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />,
        title: "No volunteer submissions found",
        description: searchTerm ? "No volunteers match your search criteria." : "No volunteer submissions have been received yet.",
        buttonText: null
      }
    };

    const config = configs[type];

    return (
      <div className="text-center py-12">
        {config.icon}
        <h3 className="text-lg font-medium text-gray-900 mb-2">{config.title}</h3>
        <p className="text-gray-500 mb-4">{config.description}</p>
        {config.buttonText && (
          <button
            onClick={() => {
              setEditingItem(null);
              setShowModal(true);
            }}
            className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 font-medium"
          >
            {config.buttonText}
          </button>
        )}
      </div>
    );
  };

  const getTabCounts = () => {
    return {
      opportunities: opportunities.length,
      applications: applications.length,
      volunteers: volunteers.length
    };
  };

  const getFilteredData = () => {
    if (selectedTab === "opportunities") {
      return opportunities.filter(opp => {
        const matchesSearch = opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             opp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             opp.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === "all" || opp.status === filterStatus;
        const matchesDepartment = filterDepartment === "all" || opp.department === filterDepartment;
        return matchesSearch && matchesStatus && matchesDepartment;
      });
    } else if (selectedTab === "applications") {
      return applications.filter(app => {
        const matchesSearch = app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             app.opportunityTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             app.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === "all" || app.status === filterStatus;
        return matchesSearch && matchesStatus;
      });
    } else if (selectedTab === "volunteers") {
      return volunteers.filter(volunteer => {
        const matchesSearch = volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             volunteer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             volunteer.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = filterStatus === "all" || volunteer.status === filterStatus;
        return matchesSearch && matchesStatus;
      });
    }
    return [];
  };

  const tabCounts = getTabCounts();
  const filteredData = getFilteredData();

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white border border-gray-300 rounded-lg">
        <div className="bg-orange-50 px-6 py-4 border-b border-gray-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Briefcase className="w-7 h-7 mr-3 text-orange-600" />
                Careers Management
              </h2>
              <p className="text-gray-600 mt-1">
                Manage career opportunities, applications, and volunteer submissions
              </p>
            </div>
            <div className="flex gap-3">
              {selectedTab === "opportunities" && (
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setShowModal(true);
                  }}
                  className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 flex items-center font-medium transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Opportunity
                </button>
              )}
              <button className="border border-orange-600 text-orange-600 px-6 py-2 rounded-lg hover:bg-orange-50 flex items-center font-medium transition-colors">
                <BarChart3 className="w-5 h-5 mr-2" />
                Analytics
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-4 border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { id: "opportunities", label: "Career Opportunities", count: tabCounts.opportunities },
              { id: "applications", label: "Applications", count: tabCounts.applications },
              { id: "volunteers", label: "Volunteer Submissions", count: tabCounts.volunteers }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedTab(tab.id);
                  setSearchTerm("");
                  setFilterStatus("all");
                  setFilterDepartment("all");
                  setExpandedItems([]);
                }}
                className={`py-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  selectedTab === tab.id
                    ? "border-orange-600 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {/* Search and Filter Bar */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${selectedTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600" />
              {selectedTab === "opportunities" && (
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                >
                  <option value="all">All Departments</option>
                  <option value="Clinical Services">Clinical Services</option>
                  <option value="Research">Research</option>
                  <option value="Technology">Technology</option>
                  <option value="Operations">Operations</option>
                </select>
              )}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
              >
                <option value="all">All Status</option>
                {selectedTab === "opportunities" && (
                  <>
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                    <option value="Closed">Closed</option>
                  </>
                )}
                {selectedTab === "applications" && (
                  <>
                    <option value="New">New</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Rejected">Rejected</option>
                  </>
                )}
                {selectedTab === "volunteers" && (
                  <>
                    <option value="Pending Review">Pending Review</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </>
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {filteredData.length > 0 ? (
            <>
              {selectedTab === "opportunities" && renderOpportunities()}
              {selectedTab === "applications" && renderApplications()}
              {selectedTab === "volunteers" && renderVolunteers()}
            </>
          ) : (
            renderEmptyState(selectedTab)
          )}
        </div>
      </div>

      {/* Simple Modal Placeholder */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">
                {editingItem ? 'Edit' : 'Create'} Career Opportunity
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingItem(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Job Title"
                defaultValue={editingItem?.title || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
              />
              <input
                type="text"
                placeholder="Department"
                defaultValue={editingItem?.department || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
              />
              <input
                type="text"
                placeholder="Location"
                defaultValue={editingItem?.location || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
              />
              <textarea
                placeholder="Job Description"
                defaultValue={editingItem?.description || ''}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Handle save logic here
                    setShowModal(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  {editingItem ? 'Update' : 'Create'} Opportunity
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareersAdminTab;