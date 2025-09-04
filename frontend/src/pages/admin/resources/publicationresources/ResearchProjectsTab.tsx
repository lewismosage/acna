import React, { useState, useEffect } from "react";
import {
  Search,
  Edit3,
  Trash2,
  FlaskConical,
  Calendar,
  Users,
  Building,
  Target,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import CreateResearchProjectModal from "./CreateResearchProjectModal";
import {
  ResearchProject,
  ResearchProjectStatus,
} from "./CreateResearchProjectModal";
import LoadingSpinner from "../../../../components/common/LoadingSpinner";
import AlertModal from "../../../../components/common/AlertModal";
import { researchProjectsApi } from "../../../../services/researchprojectsApi";

interface ResearchProjectsTabProps {
  showCreateModal?: boolean;
  onShowCreateModalChange?: (show: boolean) => void;
}

const ResearchProjectsTab: React.FC<ResearchProjectsTabProps> = ({
  showCreateModal: externalShowCreateModal,
  onShowCreateModalChange,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [internalShowCreateModal, setInternalShowCreateModal] = useState(false);
  const [expandedProject, setExpandedProject] = useState<number | null>(null);
  const [allProjects, setAllProjects] = useState<ResearchProject[]>([]);
  const [editingProject, setEditingProject] = useState<ResearchProject | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  // Alert modal state
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    type: "info" | "warning" | "error" | "success" | "confirm";
    title: string;
    message: string;
    onConfirm?: () => void;
    showCancel?: boolean;
    confirmText?: string;
    cancelText?: string;
  }>({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
  });

  // Determine which modal state to use
  const showCreateModal =
    externalShowCreateModal !== undefined
      ? externalShowCreateModal
      : internalShowCreateModal;

  const setShowCreateModal = (show: boolean) => {
    if (onShowCreateModalChange) {
      onShowCreateModalChange(show);
    } else {
      setInternalShowCreateModal(show);
    }
  };

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);

        // Use the API to fetch research projects
        const projects = await researchProjectsApi.getAll();
        setAllProjects(projects);
      } catch (error: any) {
        console.error("Error fetching research projects:", error);
        setAlertModal({
          isOpen: true,
          type: "error",
          title: "Error Loading Projects",
          message:
            error.message ||
            "Failed to load research projects. Please refresh the page or try again later.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const getStatusColor = (status: ResearchProjectStatus) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 border-green-200";
      case "Recruiting":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Planning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Data Collection":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Analysis":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Completed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "Suspended":
        return "bg-red-100 text-red-800 border-red-200";
      case "Terminated":
        return "bg-red-200 text-red-900 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleStatusChange = async (
    projectId: number,
    newStatus: ResearchProjectStatus
  ) => {
    try {
      // Use the API to update project status
      const updatedProject = await researchProjectsApi.updateStatus(
        projectId,
        newStatus
      );

      setAllProjects((prev) =>
        prev.map((project) =>
          project.id === projectId ? updatedProject : project
        )
      );

      setAlertModal({
        isOpen: true,
        type: "success",
        title: "Status Updated",
        message: `Project status has been successfully updated to "${newStatus}".`,
      });
    } catch (error: any) {
      console.error("Error updating project status:", error);
      setAlertModal({
        isOpen: true,
        type: "error",
        title: "Error Updating Status",
        message:
          error.message || "Failed to update project status. Please try again.",
      });
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedProject(expandedProject === id ? null : id);
  };

  const handleProjectSaved = (savedProject: ResearchProject) => {
    if (editingProject) {
      // Update existing project in the list
      setAllProjects(prev => 
        prev.map(p => p.id === savedProject.id ? savedProject : p)
      );
      setEditingProject(null);
      
      setAlertModal({
        isOpen: true,
        type: "success",
        title: "Project Updated",
        message: `"${savedProject.title}" has been successfully updated.`
      });
    } else {
      // Add new project to the beginning of the list
      setAllProjects(prev => [savedProject, ...prev]);
      
      setAlertModal({
        isOpen: true,
        type: "success",
        title: "Project Created",
        message: `"${savedProject.title}" has been successfully created.`
      });
    }
    
    setShowCreateModal(false);
  };

  const handleProjectError = (error: string) => {
    setAlertModal({
      isOpen: true,
      type: "error",
      title: "Error Saving Project",
      message: error,
    });
  };

  const handleEditProject = (project: ResearchProject) => {
    setEditingProject(project);
    setShowCreateModal(true);
  };

  const handleDeleteProject = (project: ResearchProject) => {
    setAlertModal({
      isOpen: true,
      type: "confirm",
      title: "Delete Research Project",
      message: `Are you sure you want to delete "${project.title}"? This action cannot be undone.`,
      showCancel: true,
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: () => confirmDeleteProject(project.id, project.title),
    });
  };

  const confirmDeleteProject = async (
    projectId: number,
    projectTitle: string
  ) => {
    try {
      // Use the API to delete project
      await researchProjectsApi.delete(projectId);

      setAllProjects((prev) => prev.filter((p) => p.id !== projectId));

      setAlertModal({
        isOpen: true,
        type: "success",
        title: "Project Deleted",
        message: `"${projectTitle}" has been successfully deleted.`,
      });
    } catch (error: any) {
      console.error("Error deleting project:", error);
      setAlertModal({
        isOpen: true,
        type: "error",
        title: "Error Deleting Project",
        message: error.message || "Failed to delete project. Please try again.",
      });
    }
  };

  const filteredProjects = allProjects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.principalInvestigator
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.type.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search research projects..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Research Projects List */}
      <div className="space-y-6">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => {
            const isExpanded = expandedProject === project.id;

            return (
              <div
                key={project.id}
                className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col lg:flex-row">
                  {/* Project Image */}
                  <div className="lg:w-1/4">
                    <div className="relative">
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="w-full h-48 lg:h-full object-cover rounded-t-lg lg:rounded-l-lg lg:rounded-t-none"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src =
                            "https://images.pexels.com/photos/3985163/pexels-photo-3985163.jpeg?auto=compress&cs=tinysrgb&w=400";
                        }}
                      />
                      <div className="absolute top-3 left-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                            project.status
                          )}`}
                        >
                          {project.status}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                          {project.type}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="lg:w-3/4 p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                          {project.title}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                          <div className="space-y-2">
                            <div className="flex items-center text-gray-600 text-sm">
                              <Users className="w-4 h-4 mr-2 text-blue-600" />
                              <span>
                                <strong>PI:</strong>{" "}
                                {project.principalInvestigator}
                              </span>
                            </div>
                            <div className="flex items-center text-gray-600 text-sm">
                              <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                              <span>
                                {project.startDate} - {project.endDate}
                              </span>
                            </div>
                            {project.fundingSource && (
                              <div className="flex items-center text-gray-600 text-sm">
                                <Building className="w-4 h-4 mr-2 text-blue-600" />
                                <span>
                                  {project.fundingSource}{" "}
                                  {project.fundingAmount &&
                                    `(${project.fundingAmount})`}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center text-gray-600 text-sm">
                              <Target className="w-4 h-4 mr-2 text-blue-600" />
                              <span>{project.targetPopulation}</span>
                            </div>
                            {project.sampleSize && (
                              <div className="flex items-center text-gray-600 text-sm">
                                <span className="font-medium">
                                  Sample Size: {project.sampleSize}
                                </span>
                              </div>
                            )}
                            {project.registrationNumber && (
                              <div className="flex items-center text-gray-600 text-sm">
                                <span className="font-medium">
                                  ID: {project.registrationNumber}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                          {project.description}
                        </p>

                        {/* Expandable Content */}
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                            {project.objectives.length > 0 && (
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-2">
                                  Research Objectives
                                </h4>
                                <ul className="text-gray-600 text-sm space-y-1">
                                  {project.objectives.map(
                                    (objective, index) => (
                                      <li
                                        key={index}
                                        className="flex items-start"
                                      >
                                        <span className="text-blue-600 mr-2">
                                          •
                                        </span>
                                        {objective}
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}

                            {project.methodology && (
                              <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <h4 className="font-medium text-gray-900 mb-2">
                                  Methodology
                                </h4>
                                <p className="text-gray-600 text-sm">
                                  {project.methodology}
                                </p>
                              </div>
                            )}

                            {project.investigators.length > 0 && (
                              <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-2">
                                  Research Team
                                </h4>
                                <div className="space-y-2">
                                  {project.investigators.map((inv, index) => (
                                    <div key={index} className="text-sm">
                                      <span className="font-medium text-gray-900">
                                        {inv.name}
                                      </span>
                                      <span className="text-gray-600">
                                        {" "}
                                        - {inv.role}, {inv.affiliation}
                                      </span>
                                      {inv.email && (
                                        <div className="text-blue-600 text-xs">
                                          {inv.email}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {project.institutions.length > 0 && (
                              <div className="bg-purple-50 p-4 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-2">
                                  Participating Institutions
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {project.institutions.map(
                                    (institution, index) => (
                                      <span
                                        key={index}
                                        className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs"
                                      >
                                        {institution}
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                            )}

                            {project.keywords.length > 0 && (
                              <div className="bg-green-50 p-4 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-2">
                                  Keywords
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {project.keywords.map((keyword, index) => (
                                    <span
                                      key={index}
                                      className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs"
                                    >
                                      {keyword}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Admin Actions */}
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => toggleExpand(project.id)}
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
                        onClick={() => handleEditProject(project)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center text-sm font-medium transition-colors"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit Details
                      </button>

                      <div className="relative">
                        <select
                          value={project.status}
                          onChange={(e) =>
                            handleStatusChange(
                              project.id,
                              e.target.value as ResearchProjectStatus
                            )
                          }
                          className="border border-gray-300 px-3 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="Planning">Planning</option>
                          <option value="Active">Active</option>
                          <option value="Recruiting">Recruiting</option>
                          <option value="Data Collection">
                            Data Collection
                          </option>
                          <option value="Analysis">Analysis</option>
                          <option value="Completed">Completed</option>
                          <option value="Suspended">Suspended</option>
                          <option value="Terminated">Terminated</option>
                        </select>
                      </div>

                      <button
                        onClick={() => handleDeleteProject(project)}
                        className="border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 flex items-center text-sm font-medium transition-colors"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </button>
                    </div>

                    {/* Metadata */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                        <span>Created: {project.createdAt}</span>
                        <span>Last Updated: {project.updatedAt}</span>
                        <span>ID: #{project.id}</span>
                        {project.ethicsApproval && (
                          <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded">
                            Ethics Approved
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <FlaskConical className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No research projects found
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm
                ? "No research projects match your search criteria."
                : "No research projects available yet."}
            </p>
            <button
              onClick={() => {
                setEditingProject(null);
                setShowCreateModal(true);
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
            >
              Add Your First Research Project
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Research Project Modal */}
      {showCreateModal && (
        <CreateResearchProjectModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setEditingProject(null);
          }}
          onSuccess={handleProjectSaved}
          onError={handleProjectError}
          initialData={editingProject || undefined}
        />
      )}

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={alertModal.onConfirm}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        showCancel={alertModal.showCancel}
        confirmText={alertModal.confirmText}
        cancelText={alertModal.cancelText}
      />
    </div>
  );
};

export default ResearchProjectsTab;
