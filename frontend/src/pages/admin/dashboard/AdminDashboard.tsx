import { useState, useEffect } from "react";
import {
  Settings,
  Users,
  Calendar,
  FileText,
  DollarSign,
  BarChart3,
  Shield,
  LogOut,
  Home,
  Mail,
  Menu,
  X,
  Plus,
  Clock,
  TrendingUp,
  UserCheck,
  Download,
  Newspaper,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import CommunicationTools from "../communication/communicationmanagement/CommunicationTools";
import MembersManagement from "../membermanagement/MembersManagement";
import ResourceManagement from "../resources/resourcemanagement/ResourceManagement";
import EventsManagement from "../events/eventsmanagement/EventsManagement";
import FinancialManagement from "../financial/FinancialManagement";
import AdminSettings from "../settings/AdminSettings";
import CareersAdminTab from "../careers/Careers";
import { SignOutModal } from "../settings/SignOutModal";
import { useAuth } from "../../../services/AuthContext";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import NewsManagement from "../newsupdates/newsmanagement/NewsManagement";
import AdminNotifications from "./AdminNotifications";
import adminApi from "../../../services/adminApi";
import { conferencesApi } from "../../../services/conferenceApi";
import { workshopsApi } from "../../../services/workshopAPI";
import { trainingProgramsApi } from "../../../services/trainingProgramsApi";
import { careersApi } from "../../../services/careersAPI";
import { abstractApi } from "../../../services/abstractApi";
import { educationalResourcesApi } from "../../../services/educationalResourcesApi";
import { publicationsApi } from "../../../services/publicationsAPI";

// Real data interface
interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  newThisMonth: number;
  pendingApprovals: number;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingPayments: number;
  donations: number;
  totalEvents: number;
  totalWorkshops: number;
  totalTrainingPrograms: number;
  totalJobApplications: number;
  totalVolunteerSubmissions: number;
  totalAbstracts: number;
  totalCaseStudies: number;
  totalPublications: number;
}

// Stats Card Component
const StatsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "blue",
  trend,
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
    {trend && (
      <div className="mt-2 flex items-center">
        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
        <span className="text-xs text-green-600">{trend}</span>
      </div>
    )}
  </div>
);

// Quick Actions Panel
const QuickActionsPanel = ({ setActiveTab }: any) => (
  <div className="bg-white border border-gray-300 rounded-lg">
    <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
      <h2 className="font-semibold text-gray-800">Quick Actions</h2>
    </div>
    <div className="p-4 space-y-3">
      {[
        {
          icon: Plus,
          label: "Collaboration Opportunities",
          color: "blue",
          action: () => setActiveTab("members"),
        },
        {
          icon: Calendar,
          label: "Create Event",
          color: "green",
          action: () => setActiveTab("events"),
        },
        {
          icon: Plus,
          label: "Career Opportunities",
          color: "blue",
          action: () => setActiveTab("members"),
        },
        {
          icon: FileText,
          label: "Publish Content",
          color: "purple",
          action: () => setActiveTab("content"),
        },
        {
          icon: Mail,
          label: "Send Newsletter",
          color: "orange",
          action: () => setActiveTab("communication"),
        },
        {
          icon: Download,
          label: "Export Reports",
          color: "red",
          action: () => setActiveTab("reports"),
        },
      ].map(({ icon: Icon, label, color, action }, index) => (
        <button
          key={index}
          onClick={action}
          className={`w-full flex items-center px-3 py-2 text-sm bg-${color}-50 hover:bg-${color}-100 border border-${color}-200 rounded transition-colors text-left`}
        >
          <Icon className={`w-4 h-4 mr-3 text-${color}-600`} />
          <span className={`text-${color}-700 font-medium`}>{label}</span>
        </button>
      ))}
    </div>
  </div>
);

// Dashboard Overview Tab
const DashboardOverview = ({ stats }: any) => (
  <>
    {/* Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatsCard
        title="Total Members"
        value={stats.totalMembers}
        subtitle={`${stats.activeMembers} active`}
        icon={Users}
        color="blue"
        trend="+8% this month"
      />
      <StatsCard
        title="Monthly Revenue"
        value={`$${stats.monthlyRevenue.toLocaleString()}`}
        subtitle={`$${stats.totalRevenue.toLocaleString()} total`}
        icon={DollarSign}
        color="green"
        trend="+12% from last month"
      />
      <StatsCard
        title="Pending Approvals"
        value={stats.pendingApprovals}
        subtitle="New registrations"
        icon={Clock}
        color="orange"
      />
      <StatsCard
        title="This Month"
        value={stats.newThisMonth}
        subtitle="New members"
        icon={UserCheck}
        color="purple"
        trend="+15% vs last month"
      />
    </div>

    {/* Additional Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatsCard
        title="Total Events"
        value={stats.totalEvents}
        subtitle="Conferences & Workshops"
        icon={Calendar}
        color="indigo"
      />
      <StatsCard
        title="Training Programs"
        value={stats.totalTrainingPrograms}
        subtitle="Active programs"
        icon={FileText}
        color="purple"
      />
      <StatsCard
        title="Job Applications"
        value={stats.totalJobApplications}
        subtitle="This month"
        icon={BarChart3}
        color="red"
      />
      <StatsCard
        title="Research Submissions"
        value={
          stats.totalAbstracts +
          stats.totalCaseStudies +
          stats.totalPublications
        }
        subtitle="Abstracts, cases, publications"
        icon={Newspaper}
        color="teal"
      />
    </div>

    {/* Recent Activity - Now using AdminNotifications component */}
    <AdminNotifications />
  </>
);

// Main Admin Dashboard Component
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    activeMembers: 0,
    newThisMonth: 0,
    pendingApprovals: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingPayments: 0,
    donations: 0,
    totalEvents: 0,
    totalWorkshops: 0,
    totalTrainingPrograms: 0,
    totalJobApplications: 0,
    totalVolunteerSubmissions: 0,
    totalAbstracts: 0,
    totalCaseStudies: 0,
    totalPublications: 0,
  });
  const [adminName, setAdminName] = useState({
    firstName: "Admin",
    lastName: "User",
  });
  const { admin, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const fetchDashboardStats = async () => {
    try {
      // Fetch all data in parallel
      const [
        members,
        conferences,
        workshops,
        trainingPrograms,
        jobApplications,
        volunteerSubmissions,
        abstracts,
        caseStudies,
        publications,
      ] = await Promise.all([
        adminApi.get("/users/members/"),
        conferencesApi.getAll(),
        workshopsApi.getAll(),
        trainingProgramsApi.getAll(),
        careersApi.getAllApplications(),
        careersApi.getAllVolunteers(),
        abstractApi.getAbstracts(),
        educationalResourcesApi.getAll(),
        publicationsApi.getAll(),
      ]);

      // Calculate current month stats
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const newMembersThisMonth = members.data.filter((member: any) => {
        const memberDate = new Date(member.created_at);
        return (
          memberDate.getMonth() === currentMonth &&
          memberDate.getFullYear() === currentYear
        );
      }).length;

      const activeMembers = members.data.filter(
        (member: any) => member.is_active
      ).length;
      const pendingApprovals = members.data.filter(
        (member: any) => !member.is_verified
      ).length;

      // Calculate revenue (simplified - you might want to fetch from financial APIs)
      const totalRevenue = 0; // This would come from financial APIs
      const monthlyRevenue = 0; // This would come from financial APIs

      setStats({
        totalMembers: members.data.length,
        activeMembers,
        newThisMonth: newMembersThisMonth,
        pendingApprovals,
        totalRevenue,
        monthlyRevenue,
        pendingPayments: 0, // This would come from financial APIs
        donations: 0, // This would come from financial APIs
        totalEvents: conferences.length + workshops.length,
        totalWorkshops: workshops.length,
        totalTrainingPrograms: trainingPrograms.length,
        totalJobApplications: jobApplications.length,
        totalVolunteerSubmissions: volunteerSubmissions.length,
        totalAbstracts: abstracts.length,
        totalCaseStudies: caseStudies.length,
        totalPublications: publications.length,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    }
  };

  useEffect(() => {
    if (isAdmin === undefined) return;

    if (!isAdmin) {
      navigate("/admin/login");
    } else {
      setAdminName({
        firstName: admin?.first_name || "Admin",
        lastName: admin?.last_name || "User",
      });
      fetchDashboardStats();
    }
    setIsLoading(false);
  }, [isAdmin, admin, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "dashboard", label: "DASHBOARD", icon: Home },
    { id: "members", label: "MEMBERS", icon: Users },
    { id: "resources", label: "RESOURCES", icon: FileText },
    { id: "events", label: "EVENTS", icon: Calendar },
    { id: "news", label: "NEWS & PRESS RELEASES", icon: Newspaper },
    { id: "financial", label: "FINANCIAL", icon: DollarSign },
    { id: "communication", label: "COMMUNICATION", icon: Mail },
    { id: "careers", label: "CAREERS", icon: FileText },
    { id: "settings", label: "SETTINGS", icon: Settings },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview stats={stats} />;
      case "members":
        return <MembersManagement />;
      case "resources":
        return <ResourceManagement />;
      case "events":
        return <EventsManagement />;
      case "news":
        return <NewsManagement />;
      case "financial":
        return <FinancialManagement />;
      case "communication":
        return <CommunicationTools />;
      case "careers":
        return <CareersAdminTab />;
      case "settings":
        return <AdminSettings />;
      default:
        return <DashboardOverview setActiveTab={setActiveTab} />;
    }
  };

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    setShowMobileSidebar(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <SignOutModal
        isOpen={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        onConfirm={() => {
          logout();
          navigate("/admin/login");
        }}
      />
      {/* Mobile Header */}
      <div className="md:hidden bg-blue-800 text-white p-3 flex items-center justify-between">
        <button
          onClick={() => setShowMobileSidebar(!showMobileSidebar)}
          className="p-2 rounded-full hover:bg-blue-700"
        >
          {showMobileSidebar ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
        <h1 className="text-lg font-semibold">Admin Portal</h1>
        <div className="w-8"></div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`md:hidden fixed inset-y-0 left-0 w-64 bg-blue-800 text-white transform z-40 transition-transform duration-300 ease-in-out ${
          showMobileSidebar ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-blue-700">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
                <Shield className="w-5 h-5 text-blue-800" />
              </div>
              <h1 className="text-lg font-semibold">Admin Portal</h1>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleTabClick(id)}
                className={`w-full text-left px-4 py-3 flex items-center ${
                  activeTab === id ? "bg-blue-700" : "hover:bg-blue-700"
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span>{label}</span>
              </button>
            ))}
            <button
              onClick={() => setShowSignOutModal(true)}
              className="w-full text-left px-4 py-3 flex items-center hover:bg-blue-700"
            >
              <LogOut className="w-5 h-5 mr-3" />
              <span>SIGN OUT</span>
            </button>
          </nav>

          <div className="p-4 border-t border-blue-700">
            <Link
              to="/"
              className="flex items-center text-sm hover:text-blue-200"
            >
              <Home className="w-4 h-4 mr-2" />
              Return to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {showMobileSidebar && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}

      {/* Main Content */}
      <div className="md:ml-0 transition-all duration-300">
        {/* Desktop Header */}
        <div className="bg-white border-b-2 border-gray-200 hidden md:block">
          <div className="bg-blue-800 text-white px-4 py-3 md:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link
                  to="/"
                  className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center mr-3 md:mr-4 hover:bg-gray-100 transition-colors duration-200"
                  title="Back to Home"
                >
                  <ArrowLeftIcon className="w-5 h-5 text-blue-800" />
                </Link>
                <div className="flex items-center">
                  <h1 className="text-lg md:text-xl font-semibold">
                    African Child Neurology Association - Site administration
                  </h1>
                </div>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <div className="text-white">
                  Welcome, {adminName.firstName} {adminName.lastName}
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="bg-blue-700 overflow-x-auto">
            <nav className="px-4 md:px-6">
              <div className="flex space-x-0 min-w-max">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => handleTabClick(id)}
                    className={`px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm font-medium border-r border-blue-600 last:border-r-0 hover:bg-blue-600 transition-colors whitespace-nowrap ${
                      activeTab === id
                        ? "bg-blue-600 text-white"
                        : "text-blue-100"
                    }`}
                  >
                    <span className="hidden md:inline">{label}</span>
                    <span className="md:hidden">
                      <Icon className="w-4 h-4 mx-auto" />
                    </span>
                  </button>
                ))}
                <button
                  onClick={() => setShowSignOutModal(true)}
                  className="px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm font-medium border-r border-blue-600 last:border-r-0 hover:bg-blue-600 transition-colors whitespace-nowrap text-blue-100"
                >
                  <span className="hidden md:inline">SIGN OUT</span>
                  <span className="md:hidden">
                    <LogOut className="w-4 h-4 mx-auto" />
                  </span>
                </button>
              </div>
            </nav>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="max-w-7xl mx-auto px-4 py-4 md:px-6 md:py-6">
          {activeTab === "dashboard" ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
              {/* Left Column - Quick Actions */}
              <div className="lg:col-span-1">
                <QuickActionsPanel setActiveTab={setActiveTab} />
              </div>

              {/* Right Column - Dashboard Content */}
              <div className="lg:col-span-3 space-y-4 md:space-y-6">
                {renderTabContent()}
              </div>
            </div>
          ) : (
            <div className="space-y-4 md:space-y-6">{renderTabContent()}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
