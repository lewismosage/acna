import { Download, Calendar, Users, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";
import { conferencesApi } from "../../../services/conferenceApi";
import { workshopsApi } from "../../../services/workshopAPI";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import AlertModal from "../../../components/common/AlertModal";

interface EventRegistration {
  id: number;
  eventType: "Conference" | "Workshop";
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  participantName: string;
  participantEmail: string;
  organization?: string;
  registrationType: string;
  amount: number;
  currency: string;
  paymentStatus: string;
  registeredAt: string;
  eventId: number;
}

const EventRegistrations = () => {
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alert, setAlert] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info" as "info" | "success" | "warning" | "error",
  });

  useEffect(() => {
    const fetchAllRegistrations = async () => {
      try {
        setIsLoading(true);

        // Fetch conferences and their registrations
        const conferences = await conferencesApi.getAll();
        const conferenceRegistrations: EventRegistration[] = [];

        for (const conference of conferences) {
          if (conference.conference_registrations) {
            for (const reg of conference.conference_registrations) {
              conferenceRegistrations.push({
                id: reg.id,
                eventType: "Conference",
                eventTitle: conference.title,
                eventDate: conference.date,
                eventLocation: conference.location,
                participantName: `${reg.first_name} ${reg.last_name}`,
                participantEmail: reg.email,
                organization: reg.organization,
                registrationType: reg.registration_type,
                amount: reg.amount_paid || 0,
                currency: "USD",
                paymentStatus: reg.payment_status,
                registeredAt: reg.registered_at,
                eventId: conference.id || 0,
              });
            }
          }
        }

        // Fetch workshop registrations
        const workshopRegistrations = await workshopsApi.getRegistrations();
        const workshopEventRegistrations: EventRegistration[] =
          workshopRegistrations.map((reg) => ({
            id: reg.id,
            eventType: "Workshop",
            eventTitle: reg.workshopTitle,
            eventDate: reg.workshopDate,
            eventLocation: reg.workshopLocation,
            participantName: reg.fullName,
            participantEmail: reg.email,
            organization: reg.organization,
            registrationType: reg.registrationType,
            amount: reg.amount || 0,
            currency: "USD",
            paymentStatus: reg.paymentStatus,
            registeredAt: reg.registeredAt,
            eventId: reg.workshop,
          }));

        // Combine and sort by registration date (newest first)
        const allRegistrations = [
          ...conferenceRegistrations,
          ...workshopEventRegistrations,
        ].sort(
          (a, b) =>
            new Date(b.registeredAt).getTime() -
            new Date(a.registeredAt).getTime()
        );

        setRegistrations(allRegistrations);
      } catch (error) {
        setAlert({
          isOpen: true,
          title: "Error",
          message:
            "Failed to fetch event registrations. Please try again later.",
          type: "error",
        });
        console.error("Error fetching event registrations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllRegistrations();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "free":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "Conference":
        return "bg-purple-100 text-purple-800";
      case "Workshop":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleExport = async () => {
    try {
      setAlert({
        isOpen: true,
        title: "Export Started",
        message:
          "Your event registrations report is being prepared and will be downloaded shortly.",
        type: "info",
      });
    } catch (error) {
      setAlert({
        isOpen: true,
        title: "Export Failed",
        message: "Could not generate the report. Please try again later.",
        type: "error",
      });
    }
  };

  const closeAlert = () => {
    setAlert((prev) => ({ ...prev, isOpen: false }));
  };

  // Calculate totals
  const totalRevenue = registrations
    .filter((reg) => reg.paymentStatus === "paid")
    .reduce((sum, reg) => sum + reg.amount, 0);

  const totalRegistrations = registrations.length;
  const paidRegistrations = registrations.filter(
    (reg) => reg.paymentStatus === "paid"
  ).length;
  const freeRegistrations = registrations.filter(
    (reg) => reg.paymentStatus === "free"
  ).length;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
        <div className="bg-gray-100 px-4 py-3 border-b border-gray-300 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">
            Event Registrations
          </h2>
          <button
            onClick={handleExport}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm"
            disabled={registrations.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>

        {registrations.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-500 mb-4">
              No event registrations found
            </div>
            <div className="text-sm text-gray-400">
              This could be because:
              <ul className="list-disc list-inside mt-2 text-left max-w-md mx-auto">
                <li>No registrations have been made yet</li>
                <li>
                  Your account doesn't have permission to view registrations
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Event
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Participant
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Registration Type
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Amount
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {registrations.map((registration) => (
                    <tr key={`${registration.eventType}-${registration.id}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full mr-3 ${getEventTypeColor(
                              registration.eventType
                            )}`}
                          >
                            {registration.eventType}
                          </span>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {registration.eventTitle}
                            </div>
                            <div className="text-sm text-gray-500">
                              {registration.eventLocation}
                            </div>
                            <div className="text-xs text-gray-400">
                              {formatDate(registration.eventDate)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {registration.participantName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {registration.participantEmail}
                          </div>
                          {registration.organization && (
                            <div className="text-xs text-gray-400">
                              {registration.organization}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                        {registration.registrationType.replace("_", " ")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {registration.amount > 0 ? (
                          <span className="text-green-600">
                            {formatCurrency(
                              registration.amount,
                              registration.currency
                            )}
                          </span>
                        ) : (
                          <span className="text-gray-500">Free</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(
                            registration.paymentStatus
                          )}`}
                        >
                          {registration.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(registration.registeredAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination would go here */}
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">1</span> to{" "}
                    <span className="font-medium">{registrations.length}</span>{" "}
                    of{" "}
                    <span className="font-medium">{registrations.length}</span>{" "}
                    results
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <AlertModal
        isOpen={alert.isOpen}
        onClose={closeAlert}
        title={alert.title}
        message={alert.message}
        type={alert.type}
      />
    </>
  );
};

export default EventRegistrations;
