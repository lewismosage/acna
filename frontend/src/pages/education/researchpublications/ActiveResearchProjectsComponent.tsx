import React, { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import {
  researchProjectsApi,
  ResearchProject,
} from "../../../services/researchprojectsApi";
import LoadingSpinner from "../../../components/common/LoadingSpinner";

const ActiveResearchProjects = () => {
  const [activeResearchProjects, setActiveResearchProjects] = useState<
    ResearchProject[]
  >([]);
  const [isLoadingResearch, setIsLoadingResearch] = useState(true);
  const [researchError, setResearchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActiveResearch = async () => {
      try {
        setIsLoadingResearch(true);
        setResearchError(null);
        const data = await researchProjectsApi.getActive();
        setActiveResearchProjects(data.slice(0, 4)); // Show only first 4 active projects
      } catch (err) {
        setResearchError("Failed to load active research projects");
        console.error("Error fetching active research:", err);
      } finally {
        setIsLoadingResearch(false);
      }
    };

    fetchActiveResearch();
  }, []);

  const handleResearchProjectClick = (projectId: number) => {
    window.location.href = `/research-projects/${projectId}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-600 text-white";
      case "Recruiting":
        return "bg-blue-600 text-white";
      case "Data Collection":
        return "bg-yellow-600 text-white";
      case "Analysis":
        return "bg-purple-600 text-white";
      case "Completed":
        return "bg-gray-600 text-white";
      default:
        return "bg-orange-600 text-white";
    }
  };

  const getProjectTypeColor = (type: string) => {
    switch (type) {
      case "Clinical Trial":
        return "text-red-600";
      case "Observational Study":
        return "text-blue-600";
      case "Genetic Research":
        return "text-purple-600";
      case "Cohort Study":
        return "text-green-600";
      case "Epidemiological Study":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <section id="active-research" className="mb-16">
      <div className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
            Active Research Projects
          </h2>
          <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Ongoing research initiatives and studies currently being
            conducted across African institutions.
          </p>
        </div>

        {isLoadingResearch ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : researchError ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-red-600 mb-4">{researchError}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md font-medium transition-colors duration-300"
            >
              Try Again
            </button>
          </div>
        ) : activeResearchProjects.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {activeResearchProjects.map((project) => (
                <div
                  key={project.id}
                  className="group cursor-pointer hover:bg-gray-50 transition-colors duration-200 p-6 rounded-lg border border-gray-200"
                  onClick={() => handleResearchProjectClick(project.id)}
                >
                  <div className="relative mb-4 overflow-hidden rounded">
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="bg-red-600 text-white px-2 py-1 text-xs font-bold uppercase tracking-wide rounded">
                        {project.type}
                      </span>
                    </div>
                    <div className="absolute top-2 right-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(
                          project.status
                        )}`}
                      >
                        {project.status}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p
                      className={`font-medium text-xs uppercase ${getProjectTypeColor(
                        project.type
                      )}`}
                    >
                      {project.type}
                    </p>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-red-600 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      <span className="font-medium">
                        Principal Investigator:
                      </span>{" "}
                      {project.principalInvestigator}
                    </p>
                    <p className="text-gray-600 text-sm">
                      <span className="font-medium">Duration:</span>{" "}
                      {project.startDate} - {project.endDate}
                    </p>
                    {project.fundingSource && (
                      <p className="text-gray-600 text-sm">
                        <span className="font-medium">Funding:</span>{" "}
                        {project.fundingSource}
                      </p>
                    )}
                    {project.targetPopulation && (
                      <p className="text-gray-600 text-sm">
                        <span className="font-medium">
                          Target Population:
                        </span>{" "}
                        {project.targetPopulation}
                      </p>
                    )}
                    <a
                      className="text-red-600 text-sm font-medium inline-flex items-center hover:text-red-700 pt-2"
                    >
                      VIEW PROJECT DETAILS{" "}
                      <ArrowRight className="ml-1 w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={() =>
                  (window.location.href = "/research-projects")
                }
                className="border-2 border-orange-600 text-orange-600 px-6 py-2 sm:px-8 sm:py-3 font-medium hover:bg-orange-600 hover:text-white transition-all duration-300 uppercase tracking-wide rounded text-sm sm:text-base"
              >
                View All Active Research
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012-2"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Active Research Projects
            </h3>
            <p className="text-gray-600">
              No active research projects are available at this time.
              Please check back later.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ActiveResearchProjects;