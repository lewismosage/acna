import { useState, useEffect } from "react";
import {
  Home,
  FileText,
  BookOpen,
  Users,
  Award,
  Plus,
  Upload,
  Edit3,
  Eye,
  Trash2,
  Globe,
  Database,
  FileSearch,
  ClipboardList,
} from "lucide-react";
import PublicationResourcesTab from "../publicationresources/PublicationResourcesTab";
import EBookletsTab from "../ebooksresources/EBookletsTab";
import TrainingProgramsTab from "../trainingprogramsresources/TrainingProgramsTab";
import PatientCaregiverResourcesTab from "../patientcareresources/PatientCaregiverResourcesTab";
import EducationalResourcesTab from "../educationalresources/EducationalResourcesTab";
import JournalWatchTab from "../journal/JournalWatchTab";
import PositionStatementsTab from "../positionstatements/PolicyManagementTab";
import { publicationsApi, Publication } from "../../../../services/publicationsAPI";
import { ebookletsApi, EBooklet } from "../../../../services/ebookletsApi";
import { trainingProgramsApi, TrainingProgram } from "../../../../services/trainingProgramsApi";
import { journalArticlesApi, JournalArticle } from "../../../../services/journalWatchAPI";
import { policyManagementApi, ContentItem } from "../../../../services/policyManagementApi";
import LoadingSpinner from "../../../../components/common/LoadingSpinner";

const ResourceManagement = () => {
  const [activeTab, setActiveTab] = useState<string>("home");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resourceStats, setResourceStats] = useState({
    totalResources: 0,
    publications: 0,
    eBooks: 0,
    trainingPrograms: 0,
    patientResources: 0,
    journalWatch: 0,
    positionStatements: 0,
    policyBeliefs: 0,
  });
  const [recentResources, setRecentResources] = useState<any[]>([]);

  useEffect(() => {
    if (activeTab === "home") {
      fetchResourceData();
    }
  }, [activeTab]);

  const fetchResourceData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [
        publicationsData,
        ebookletsData,
        trainingProgramsData,
        journalArticlesData,
        policyContentData,
      ] = await Promise.all([
        publicationsApi.getAll(),
        ebookletsApi.getAll(),
        trainingProgramsApi.getAll(),
        journalArticlesApi.getAll(),
        policyManagementApi.getAll(),
      ]);

      // Calculate statistics
      const publications = publicationsData.length;
      const eBooks = ebookletsData.length;
      const trainingPrograms = trainingProgramsData.length;
      const journalWatch = journalArticlesData.length;
      
      // Separate policy content into statements and beliefs
      const positionStatements = policyContentData.filter(
        (item: ContentItem) => item.type === "PositionalStatement"
      ).length;
      
      const policyBeliefs = policyContentData.filter(
        (item: ContentItem) => item.type === "PolicyBelief"
      ).length;

      const totalResources = publications + eBooks + trainingPrograms + journalWatch + positionStatements + policyBeliefs;

      setResourceStats({
        totalResources,
        publications,
        eBooks,
        trainingPrograms,
        patientResources: 0, 
        journalWatch,
        positionStatements,
        policyBeliefs,
      });

      
      const allResources = [
        ...publicationsData.map((pub: Publication) => ({
          id: pub.id,
          title: pub.title,
          type: "Publication",
          date: pub.updatedAt,
          views: pub.viewCount,
        })),
        ...ebookletsData.map((ebook: EBooklet) => ({
          id: ebook.id,
          title: ebook.title,
          type: "E-Booklet",
          date: ebook.updatedAt,
          views: ebook.viewCount,
        })),
        ...trainingProgramsData.map((program: TrainingProgram) => ({
          id: program.id,
          title: program.title,
          type: "Training Program",
          date: program.updatedAt,
          views: program.currentEnrollments,
        })),
        ...journalArticlesData.map((article: JournalArticle) => ({
          id: article.id,
          title: article.title,
          type: "Journal Watch",
          date: article.updatedAt,
          views: article.viewCount,
        })),
        ...policyContentData.filter((item: ContentItem) => item.type === "PositionalStatement")
          .map((statement: ContentItem) => ({
            id: statement.id,
            title: statement.title,
            type: "Position Statement",
            date: statement.updatedAt,
            views: statement.viewCount,
          })),
        ...policyContentData.filter((item: ContentItem) => item.type === "PolicyBelief")
          .map((belief: ContentItem) => ({
            id: belief.id,
            title: belief.title,
            type: "Policy Belief",
            date: belief.updatedAt,
            views: belief.viewCount,
          })),
      ];

      
      const sortedResources = allResources.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ).slice(0, 7);

      setRecentResources(sortedResources);

    } catch (err) {
      console.error("Error fetching resource data:", err);
      setError("Failed to load resource data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "home", label: "HOME", icon: Home },
    { id: "publications", label: "PUBLICATION RESOURCES", icon: FileText },
    { id: "ebooks", label: "E-BOOKLETS", icon: BookOpen },
    { id: "training", label: "TRAINING PROGRAMS", icon: Users },
    { id: "patient", label: "PATIENT & CAREGIVER RESOURCES", icon: Award },
    { id: "educational", label: "EDUCATIONAL RESOURCES", icon: Globe },
    { id: "journal", label: "JOURNAL WATCH", icon: FileSearch },
    { id: "positions", label: "POSITION STATEMENTS & POLICY BELIEFS", icon: ClipboardList },
  ];

  // Stats Card Component
  const StatsCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    color = "blue",
  }: any) => (
    <div className="bg-white border border-gray-300 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
        <div className={`p-3 bg-${color}-100 rounded-full`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "home":
        if (loading) {
          return (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner />
            </div>
          );
        }

        if (error) {
          return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <div className="text-red-600 mb-4">{error}</div>
              <button
                onClick={fetchResourceData}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          );
        }

        return (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
            {/* Left Column - Quick Actions */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-300 rounded-lg">
                <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
                  <h2 className="font-semibold text-gray-800">Quick Actions</h2>
                </div>
                <div className="p-4 space-y-3">
                  {[
                    {
                      icon: Plus,
                      label: "Add Publication",
                      color: "blue",
                      action: () => setActiveTab("publications"),
                    },
                    {
                      icon: Plus,
                      label: "E-Booklet Management",
                      color: "green",
                      action: () => setActiveTab("ebooks"),
                    },
                    {
                      icon: Plus,
                      label: "Training Programs Management",
                      color: "purple",
                      action: () => setActiveTab("training"),
                    },
                    {
                      icon: Upload,
                      label: "Patient & Caregiver Resources",
                      color: "orange",
                      action: () => setActiveTab("patient"),
                    },
                    {
                      icon: Plus,
                      label: "Journal Watch Management",
                      color: "teal",
                      action: () => setActiveTab("journal"),
                    },
                    {
                      icon: Plus,
                      label: "Create Position Statement",
                      color: "indigo",
                      action: () => setActiveTab("positions"),
                    },
                  ].map(({ icon: Icon, label, color, action }, index) => (
                    <button
                      key={index}
                      onClick={action}
                      className={`w-full flex items-center px-3 py-2 text-sm bg-${color}-50 hover:bg-${color}-100 border border-${color}-200 rounded transition-colors text-left`}
                    >
                      <Icon className={`w-4 h-4 mr-3 text-${color}-600`} />
                      <span className={`text-${color}-700 font-medium`}>
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Dashboard Content */}
            <div className="lg:col-span-3 space-y-4 md:space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatsCard
                  title="Total Resources"
                  value={resourceStats.totalResources}
                  icon={Database}
                  color="blue"
                />
                <StatsCard
                  title="Publications"
                  value={resourceStats.publications}
                  icon={FileText}
                  color="green"
                />
                <StatsCard
                  title="E-Booklets"
                  value={resourceStats.eBooks}
                  icon={BookOpen}
                  color="purple"
                />
                <StatsCard
                  title="Training Programs"
                  value={resourceStats.trainingPrograms}
                  icon={Users}
                  color="orange"
                />
                <StatsCard
                  title="Journal Watch"
                  value={resourceStats.journalWatch}
                  icon={FileSearch}
                  color="teal"
                />
                <StatsCard
                  title="Position Statements"
                  value={resourceStats.positionStatements}
                  icon={ClipboardList}
                  color="indigo"
                />
                <StatsCard
                  title="Policy Beliefs"
                  value={resourceStats.policyBeliefs}
                  icon={ClipboardList}
                  color="red"
                />
              </div>

              {/* Recent Resources */}
              <div className="bg-white border border-gray-300 rounded-lg">
                <div className="bg-gray-100 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
                  <h2 className="font-semibold text-gray-800">
                    Recently Updated Resources
                  </h2>
                  <button
                    onClick={fetchResourceData}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Refresh
                  </button>
                </div>
                <div className="p-4">
                  {recentResources.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No resources found
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentResources.map((resource, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded"
                        >
                          <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-blue-400 mr-3" />
                            <div>
                              <p className="font-medium text-sm">
                                {resource.title}
                              </p>
                              <p className="text-xs text-gray-600">
                                {resource.type} • {new Date(resource.date).toLocaleDateString()} •{" "}
                                {resource.views} views
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button className="p-1 text-blue-600 hover:text-blue-800">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-green-600 hover:text-green-800">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-red-600 hover:text-red-800">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      case "publications":
        return <PublicationResourcesTab />;
      case "ebooks":
        return <EBookletsTab />;
      case "training":
        return <TrainingProgramsTab />;
      case "patient":
        return <PatientCaregiverResourcesTab />;
      case "educational":
        return <EducationalResourcesTab />;
      case "journal":
        return <JournalWatchTab />;
      case "positions":
        return <PositionStatementsTab />;
      default:
        return (
          <div className="bg-white border border-gray-300 rounded-lg p-6 text-center">
            <h3 className="text-lg font-medium text-gray-700">
              Select a resource category to manage
            </h3>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b-2 border-gray-200">
        <div className="bg-blue-700 overflow-x-auto">
          <nav className="px-4 md:px-6">
            <div className="flex space-x-0 min-w-max">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`px-3 py-3 md:px-4 md:py-4 text-xs md:text-sm font-medium border-r border-blue-600 last:border-r-0 hover:bg-blue-600 transition-colors whitespace-nowrap flex items-center ${
                    activeTab === id
                      ? "bg-blue-600 text-white"
                      : "text-blue-100"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2 md:mr-2" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 md:px-6 md:py-8">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ResourceManagement;