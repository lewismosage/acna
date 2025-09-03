import { useState } from "react";
import {
  Home,
  FileText,
  BookOpen,
  Users,
  Award,
  Plus,
  Download,
  Upload,
  Edit3,
  Eye,
  Trash2,
  Globe,
  Database,
} from "lucide-react";
import PublicationResourcesTab from "../resourcemanagement/PublicationResourcesTab";
import EBookletsTab from "../resourcemanagement/EBookletsTab";  
import TrainingProgramsTab from "../resourcemanagement/TrainingProgramsTab";
import PatientCaregiverResourcesTab from "../../resources/patientcareresources/PatientCaregiverResourcesTab";
import EducationalResourcesTab from "../resourcemanagement/EducationalResourcesTab";

const ResourceManagement = () => {
  const [activeTab, setActiveTab] = useState<string>("home");

  // Mock data for the home tab stats
  const mockResourceStats = {
    totalResources: 856,
    publications: 245,
    eBooks: 187,
    trainingPrograms: 42,
    patientResources: 382,
  };

  const mockRecentResources = [
    {
      id: 1,
      title: "Pediatric Neurology Guidelines 2025",
      type: "Publication",
      date: "2025-08-10",
      views: 124,
    },
    {
      id: 2,
      title: "Epilepsy Management Handbook",
      type: "E-Booklet",
      date: "2025-08-05",
      views: 87,
    },
    {
      id: 3,
      title: "Neurodevelopmental Assessment Course",
      type: "Training Program",
      date: "2025-07-28",
      views: 56,
    },
    {
      id: 4,
      title: "Cerebral Palsy Caregiver Guide",
      type: "Patient Resource",
      date: "2025-07-15",
      views: 203,
    },
  ];

  const tabs = [
    { id: "home", label: "HOME", icon: Home },
    { id: "publications", label: "PUBLICATION RESOURCES", icon: FileText },
    { id: "ebooks", label: "E-BOOKLETS", icon: BookOpen },
    { id: "training", label: "TRAINING PROGRAMS", icon: Users },
    { id: "patient", label: "PATIENT & CAREGIVER RESOURCES", icon: Award },
    { id: "educational", label: "EDUCATIONAL RESOURCES", icon: Globe },
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
                      label: "Upload E-Booklet",
                      color: "green",
                      action: () => setActiveTab("ebooks"),
                    },
                    {
                      icon: Plus,
                      label: "Create Training",
                      color: "purple",
                      action: () => setActiveTab("training"),
                    },
                    {
                      icon: Upload,
                      label: "Upload Resource",
                      color: "orange",
                      action: () => setActiveTab("patient"),
                    },
                    {
                      icon: Download,
                      label: "Export Resources",
                      color: "red",
                      action: () => {},
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
                  value={mockResourceStats.totalResources}
                  icon={Database}
                  color="blue"
                />
                <StatsCard
                  title="Publications"
                  value={mockResourceStats.publications}
                  icon={FileText}
                  color="green"
                />
                <StatsCard
                  title="E-Booklets"
                  value={mockResourceStats.eBooks}
                  icon={BookOpen}
                  color="purple"
                />
                <StatsCard
                  title="Training Programs"
                  value={mockResourceStats.trainingPrograms}
                  icon={Users}
                  color="orange"
                />
              </div>

              {/* Recent Resources */}
              <div className="bg-white border border-gray-300 rounded-lg">
                <div className="bg-gray-100 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
                  <h2 className="font-semibold text-gray-800">
                    Recently Added Resources
                  </h2>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View All →
                  </button>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    {mockRecentResources.map((resource, index) => (
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
                              {resource.type} • {resource.date} •{" "}
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
