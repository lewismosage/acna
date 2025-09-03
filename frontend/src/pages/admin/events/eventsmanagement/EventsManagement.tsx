import { useState } from "react";
import {
  BookOpen,
  Video,
  Users,
  Award,
  FileText,
  Plus,
  Calendar,
  Clock,
  User,
  MapPin,
  Edit3,
  Eye,
  Download,
  Upload,
} from "lucide-react";

// Import components with proper typing
import WorkshopsTab from "../workshop/WorkshopsTab";
import WebinarsTab from "../webinars/WebinarsTab";
import ConferencesTab from "../conferences/ConferencesTab";
import AwardsTab from "../awards/AwardsTab";
import AbstractsTab from "../abstracts/AbstractsTab";

const EventsManagement = () => {
  const [activeTab, setActiveTab] = useState<string>("conferences");

  // Typed mock data
  const mockWorkshops = [
    {
      id: 1,
      name: "Advanced EEG Techniques",
      date: "2025-09-15",
      duration: "2 days",
      capacity: 50,
      registered: 42,
    },
    {
      id: 2,
      name: "Cerebral Palsy Management",
      date: "2025-10-20",
      duration: "1 day",
      capacity: 30,
      registered: 28,
    },
    {
      id: 3,
      name: "Epilepsy Research Symposium",
      date: "2025-11-08",
      duration: "3 days",
      capacity: 100,
      registered: 87,
    },
  ];

  const mockWebinars = [
    {
      id: 1,
      name: "Pediatric Stroke Prevention",
      date: "2025-10-12",
      time: "2:00 PM",
      presenter: "Dr. Jane Smith",
      attendees: 156,
    },
    {
      id: 2,
      name: "Latest in Neurodevelopment",
      date: "2025-10-25",
      time: "3:00 PM",
      presenter: "Prof. John Doe",
      attendees: 203,
    },
    {
      id: 3,
      name: "Case Studies Discussion",
      date: "2025-11-02",
      time: "1:00 PM",
      presenter: "Dr. Sarah Wilson",
      attendees: 98,
    },
  ];

  const mockAwards = [
    {
      id: 1,
      name: "Research Excellence Award",
      nominations: 25,
      deadline: "2025-12-01",
      category: "Research",
    },
    {
      id: 2,
      name: "Outstanding Clinician Award",
      nominations: 18,
      deadline: "2025-11-15",
      category: "Clinical Practice",
    },
    {
      id: 3,
      name: "Young Investigator Award",
      nominations: 32,
      deadline: "2025-10-30",
      category: "Early Career",
    },
  ];

  const mockAbstracts = [
    {
      id: 1,
      title: "Novel Approaches to Pediatric Epilepsy",
      author: "Dr. Mary Johnson",
      status: "Under Review",
      submitted: "2025-09-15",
    },
    {
      id: 2,
      title: "Cerebral Palsy Rehabilitation Outcomes",
      author: "Prof. David Wilson",
      status: "Accepted",
      submitted: "2025-09-10",
    },
    {
      id: 3,
      title: "EEG Pattern Analysis in Children",
      author: "Dr. Alice Brown",
      status: "Revision Required",
      submitted: "2025-09-18",
    },
  ];

  const tabs = [
    { id: "conferences", label: "ANNUAL CONFERENCES & MEETINGS", icon: Users },
    { id: "webinars", label: "WEBINARS", icon: Video },
    { id: "workshops", label: "WORKSHOPS & SYMPOSIUMS", icon: BookOpen },
    { id: "awards", label: "AWARDS AND RECOGNITIONS", icon: Award },
    { id: "abstracts", label: "ABSTRACTS SUBMISSIONS", icon: FileText },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "workshops":
        return <WorkshopsTab />;
      case "webinars":
        return <WebinarsTab />;
      case "conferences":
        return <ConferencesTab />;
      case "awards":
        return <AwardsTab />;
      case "abstracts":
        return <AbstractsTab />;
      default:
        return <WorkshopsTab />;
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

export default EventsManagement;
