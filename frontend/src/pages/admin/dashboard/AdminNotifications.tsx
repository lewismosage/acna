import React, { useState, useEffect } from "react";
import {
  Bell,
  Clock,
  FileText,
  Award,
  Calendar,
  Mail,
  Briefcase,
  BookOpen,
  GraduationCap,
  Users,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react";
import { abstractApi } from "../../../services/abstractApi";
import { workshopsApi } from "../../../services/workshopAPI";
import { webinarsApi } from "../../../services/webinarsApi";
import { conferencesApi } from "../../../services/conferenceApi";
import api from "../../../services/api";
import { careersApi } from "../../../services/careersAPI";
import { publicationsApi } from "../../../services/publicationsAPI";
import { trainingProgramsApi } from "../../../services/trainingProgramsApi";
import { educationalResourcesApi } from "../../../services/educationalResourcesApi";
import adminApi from "../../../services/adminApi";

interface Notification {
  id: string;
  type:
    | "abstract"
    | "award"
    | "workshop"
    | "webinar"
    | "conference"
    | "contact"
    | "career"
    | "publication"
    | "training"
    | "educational"
    | "membership";
  title: string;
  message: string;
  timestamp: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  isRead: boolean;
}

const AdminNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const markAsRead = (notificationId: string) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter(
        (notification) => notification.id !== notificationId
      )
    );
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getIconAndColor = (type: string) => {
    switch (type) {
      case "abstract":
        return { icon: FileText, color: "text-blue-600 bg-blue-100" };
      case "award":
        return { icon: Award, color: "text-yellow-600 bg-yellow-100" };
      case "workshop":
        return { icon: Calendar, color: "text-orange-600 bg-orange-100" };
      case "webinar":
        return { icon: Calendar, color: "text-purple-600 bg-purple-100" };
      case "conference":
        return { icon: Calendar, color: "text-indigo-600 bg-indigo-100" };
      case "contact":
        return { icon: Mail, color: "text-green-600 bg-green-100" };
      case "career":
        return { icon: Briefcase, color: "text-red-600 bg-red-100" };
      case "publication":
        return { icon: BookOpen, color: "text-teal-600 bg-teal-100" };
      case "training":
        return { icon: GraduationCap, color: "text-pink-600 bg-pink-100" };
      case "educational":
        return { icon: BookOpen, color: "text-cyan-600 bg-cyan-100" };
      case "membership":
        return { icon: Users, color: "text-emerald-600 bg-emerald-100" };
      default:
        return { icon: Bell, color: "text-gray-600 bg-gray-100" };
    }
  };

  const fetchAllNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const allNotifications: Notification[] = [];

      // 1. Abstracts - submissions
      try {
        const abstracts = await abstractApi.getAbstracts();
        abstracts.forEach((abstract: any) => {
          allNotifications.push({
            id: `abstract-${abstract.id}`,
            type: "abstract",
            title: "New Abstract Submission",
            message: `${abstract.author_name} has submitted an abstract titled "${abstract.title}"`,
            timestamp: abstract.submitted_at,
            icon: FileText,
            color: "text-blue-600 bg-blue-100",
            isRead: false,
          });
        });
      } catch (error) {
        console.error("Error fetching abstracts:", error);
      }

      // 2. Awards - votes (we'll need to add this endpoint to awardsApi)
      try {
        // This would need to be implemented in the backend
        // const votes = await awardsApi.getRecentVotes();
        // votes.forEach(vote => {
        //   allNotifications.push({
        //     id: `award-vote-${vote.id}`,
        //     type: 'award',
        //     title: 'New Award Vote',
        //     message: `${vote.voter_name} has voted for ${vote.nominee_name} in ${vote.category}`,
        //     timestamp: vote.voted_at,
        //     icon: Award,
        //     color: 'text-yellow-600 bg-yellow-100',
        //     isRead: false
        //   });
        // });
      } catch (error) {
        console.error("Error fetching award votes:", error);
      }

      // 3. Workshops - collaboration requests and registrations
      try {
        const workshops = await workshopsApi.getAll();
        const registrations = await workshopsApi.getRegistrations();

        // Workshop registrations
        registrations.forEach((registration) => {
          allNotifications.push({
            id: `workshop-reg-${registration.id}`,
            type: "workshop",
            title: "New Workshop Registration",
            message: `${registration.fullName} has registered for "${registration.workshopTitle}"`,
            timestamp: registration.registeredAt,
            icon: Calendar,
            color: "text-orange-600 bg-orange-100",
            isRead: false,
          });
        });

        // Workshop collaboration requests (if available)
        workshops.forEach((workshop: any) => {
          if (workshop.collaboration_requests) {
            workshop.collaboration_requests.forEach((request: any) => {
              allNotifications.push({
                id: `workshop-collab-${request.id}`,
                type: "workshop",
                title: "New Collaboration Request",
                message: `${request.name} has submitted a collaboration request for "${workshop.title}"`,
                timestamp: request.submitted_at,
                icon: Calendar,
                color: "text-orange-600 bg-orange-100",
                isRead: false,
              });
            });
          }
        });
      } catch (error) {
        console.error("Error fetching workshop data:", error);
      }

      // 4. Webinars - registrations
      try {
        const webinars = await webinarsApi.getAll();
        webinars.forEach((webinar: any) => {
          if (webinar.registrations) {
            webinar.registrations.forEach((registration: any) => {
              allNotifications.push({
                id: `webinar-reg-${registration.id}`,
                type: "webinar",
                title: "New Webinar Registration",
                message: `${registration.name} has registered for "${webinar.title}"`,
                timestamp: registration.registered_at,
                icon: Calendar,
                color: "text-purple-600 bg-purple-100",
                isRead: false,
              });
            });
          }
        });
      } catch (error) {
        console.error("Error fetching webinar data:", error);
      }

      // 5. Conferences - registrations
      try {
        const conferences = await conferencesApi.getAll();
        conferences.forEach((conference) => {
          if (conference.conference_registrations) {
            conference.conference_registrations.forEach((registration: any) => {
              allNotifications.push({
                id: `conference-reg-${registration.id}`,
                type: "conference",
                title: "New Conference Registration",
                message: `${registration.first_name} ${registration.last_name} has registered for "${conference.title}"`,
                timestamp: registration.registered_at,
                icon: Calendar,
                color: "text-indigo-600 bg-indigo-100",
                isRead: false,
              });
            });
          }
        });
      } catch (error) {
        console.error("Error fetching conference data:", error);
      }

      // 6. Contact Messages and Newsletter Subscriptions
      try {
        const contactMessages = await api.get("/newsletter/messages/");
        contactMessages.data.forEach((message: any) => {
          allNotifications.push({
            id: `contact-${message.id}`,
            type: "contact",
            title: "New Contact Message",
            message: `${message.first_name} ${message.last_name} has sent a message: "${message.subject}"`,
            timestamp: message.created_at,
            icon: Mail,
            color: "text-green-600 bg-green-100",
            isRead: false,
          });
        });

        // Newsletter subscriptions
        const subscriptions = await api.get("/newsletter/subscribers/");
        subscriptions.data.forEach((subscription: any) => {
          allNotifications.push({
            id: `newsletter-${subscription.id}`,
            type: "contact",
            title: "New Newsletter Subscription",
            message: `${subscription.email} has subscribed to the newsletter`,
            timestamp: subscription.subscribed_at,
            icon: Mail,
            color: "text-green-600 bg-green-100",
            isRead: false,
          });
        });
      } catch (error) {
        console.error("Error fetching contact data:", error);
      }

      // 7. Careers - job applications and volunteer submissions
      try {
        const jobApplications = await careersApi.getAllApplications();
        jobApplications.forEach((application: any) => {
          allNotifications.push({
            id: `job-app-${application.id}`,
            type: "career",
            title: "New Job Application",
            message: `${application.applicant_name} has applied for "${application.opportunity_title}"`,
            timestamp: application.applied_date,
            icon: Briefcase,
            color: "text-red-600 bg-red-100",
            isRead: false,
          });
        });

        const volunteerSubmissions = await careersApi.getAllVolunteers();
        volunteerSubmissions.forEach((volunteer: any) => {
          allNotifications.push({
            id: `volunteer-${volunteer.id}`,
            type: "career",
            title: "New Volunteer Submission",
            message: `${volunteer.name} has submitted a volunteer application`,
            timestamp: volunteer.submitted_at,
            icon: Briefcase,
            color: "text-red-600 bg-red-100",
            isRead: false,
          });
        });
      } catch (error) {
        console.error("Error fetching career data:", error);
      }

      // 8. Publications - research submissions
      try {
        const publications = await publicationsApi.getAll();
        publications.forEach((publication: any) => {
          allNotifications.push({
            id: `publication-${publication.id}`,
            type: "publication",
            title: "New Research Submission",
            message: `${publication.author_name} has submitted a research paper titled "${publication.title}"`,
            timestamp: publication.submitted_at,
            icon: BookOpen,
            color: "text-teal-600 bg-teal-100",
            isRead: false,
          });
        });
      } catch (error) {
        console.error("Error fetching publication data:", error);
      }

      // 9. Training Programs - registrations
      try {
        const trainingRegistrations =
          await trainingProgramsApi.getRegistrations();
        trainingRegistrations.forEach((registration) => {
          allNotifications.push({
            id: `training-reg-${registration.id}`,
            type: "training",
            title: "New Training Program Registration",
            message: `${registration.participantName} has registered for "${registration.programTitle}"`,
            timestamp: registration.registrationDate,
            icon: GraduationCap,
            color: "text-pink-600 bg-pink-100",
            isRead: false,
          });
        });
      } catch (error) {
        console.error("Error fetching training data:", error);
      }

      // 10. Educational Resources - case study submissions
      try {
        const caseStudies = await educationalResourcesApi.getAll();
        caseStudies.forEach((caseStudy: any) => {
          allNotifications.push({
            id: `case-study-${caseStudy.id}`,
            type: "educational",
            title: "New Case Study Submission",
            message: `${caseStudy.submitter_name} has submitted a case study titled "${caseStudy.title}"`,
            timestamp: caseStudy.submitted_at,
            icon: BookOpen,
            color: "text-cyan-600 bg-cyan-100",
            isRead: false,
          });
        });
      } catch (error) {
        console.error("Error fetching educational data:", error);
      }

      // 11. Memberships - new member registrations
      try {
        const members = await adminApi.get("/users/members/");
        members.data.forEach((member: any) => {
          allNotifications.push({
            id: `membership-${member.id}`,
            type: "membership",
            title: "New Member Registration",
            message: `${member.first_name} ${member.last_name} has registered for ACNA membership (${member.membership_type})`,
            timestamp: member.created_at,
            icon: Users,
            color: "text-emerald-600 bg-emerald-100",
            isRead: false,
          });
        });
      } catch (error) {
        console.error("Error fetching membership data:", error);
      }

      // Sort notifications by timestamp (newest first) and limit to 20
      const sortedNotifications = allNotifications
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        .slice(0, 20);

      setNotifications(sortedNotifications);
    } catch (error) {
      setError("Failed to fetch notifications");
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllNotifications();
  }, []);

  if (loading) {
    return (
      <div className="bg-white border border-gray-300 rounded-lg p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-300 rounded-lg p-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-red-600 text-center">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p>{error}</p>
            <button
              onClick={fetchAllNotifications}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-300 rounded-lg">
      <div className="bg-red-50 px-6 py-4 border-b border-gray-300">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <Bell className="w-6 h-6 mr-3 text-red-600" />
            Recent Activity
          </h2>
          <button
            onClick={fetchAllNotifications}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="p-6">
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => {
              const { icon: Icon, color } = getIconAndColor(notification.type);
              return (
                <div
                  key={notification.id}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className={`p-2 rounded-full ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {notification.title}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-2 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatTimestamp(notification.timestamp)}
                    </p>
                  </div>
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600"
                    title="Mark as read"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNotifications;
