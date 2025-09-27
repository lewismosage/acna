import { Download, BookOpen, Users, DollarSign, Award } from "lucide-react";
import { useEffect, useState } from "react";
import { trainingProgramsApi } from "../../../services/trainingProgramsApi";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import AlertModal from "../../../components/common/AlertModal";

interface TrainingProgramPayment {
  id: number;
  programTitle: string;
  programType: string;
  programCategory: string;
  programDate: string;
  programLocation: string;
  participantName: string;
  participantEmail: string;
  organization?: string;
  profession?: string;
  experience?: string;
  amount: number;
  currency: string;
  paymentStatus: string;
  registrationDate: string;
  programId: number;
  cmeCredits?: number;
}

const TrainingPrograms = () => {
  const [payments, setPayments] = useState<TrainingProgramPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alert, setAlert] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info" as "info" | "success" | "warning" | "error",
  });

  useEffect(() => {
    const fetchAllPayments = async () => {
      try {
        setIsLoading(true);

        // Fetch all training program registrations
        const registrations = await trainingProgramsApi.getRegistrations();

        // Fetch program details for each registration
        const paymentsWithDetails: TrainingProgramPayment[] = [];

        for (const registration of registrations) {
          try {
            // Get program details
            const program = await trainingProgramsApi.getById(
              registration.programId
            );

            paymentsWithDetails.push({
              id: registration.id,
              programTitle: program.title,
              programType: program.type,
              programCategory: program.category,
              programDate: program.startDate,
              programLocation: program.location,
              participantName: registration.participantName,
              participantEmail: registration.participantEmail,
              organization: registration.organization,
              profession: registration.profession,
              experience: registration.experience,
              amount: program.price,
              currency: program.currency,
              paymentStatus: registration.paymentStatus,
              registrationDate: registration.registrationDate,
              programId: registration.programId,
              cmeCredits: program.cmeCredits,
            });
          } catch (error) {
            console.error(
              `Failed to fetch program details for registration ${registration.id}`,
              error
            );
            // Add registration without program details
            paymentsWithDetails.push({
              id: registration.id,
              programTitle: registration.programTitle || "Unknown Program",
              programType: "Unknown",
              programCategory: "Unknown",
              programDate: "",
              programLocation: "",
              participantName: registration.participantName,
              participantEmail: registration.participantEmail,
              organization: registration.organization,
              profession: registration.profession,
              experience: registration.experience,
              amount: 0,
              currency: "USD",
              paymentStatus: registration.paymentStatus,
              registrationDate: registration.registrationDate,
              programId: registration.programId,
            });
          }
        }

        // Sort by registration date (newest first)
        paymentsWithDetails.sort(
          (a, b) =>
            new Date(b.registrationDate).getTime() -
            new Date(a.registrationDate).getTime()
        );

        setPayments(paymentsWithDetails);
      } catch (error) {
        setAlert({
          isOpen: true,
          title: "Error",
          message:
            "Failed to fetch training program payments. Please try again later.",
          type: "error",
        });
        console.error("Error fetching training program payments:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllPayments();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "TBD";
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

  const getProgramTypeColor = (type: string) => {
    switch (type) {
      case "Conference":
        return "bg-purple-100 text-purple-800";
      case "Workshop":
        return "bg-orange-100 text-orange-800";
      case "Fellowship":
        return "bg-blue-100 text-blue-800";
      case "Online Course":
        return "bg-green-100 text-green-800";
      case "Masterclass":
        return "bg-red-100 text-red-800";
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
          "Your training program payments report is being prepared and will be downloaded shortly.",
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
  const totalRevenue = payments
    .filter((payment) => payment.paymentStatus === "paid")
    .reduce((sum, payment) => sum + payment.amount, 0);

  const totalRegistrations = payments.length;
  const paidRegistrations = payments.filter(
    (payment) => payment.paymentStatus === "paid"
  ).length;
  const totalCMECredits = payments
    .filter((payment) => payment.paymentStatus === "paid" && payment.cmeCredits)
    .reduce((sum, payment) => sum + (payment.cmeCredits || 0), 0);

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
            Training Program Payments
          </h2>
          <button
            onClick={handleExport}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm"
            disabled={payments.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>

        {payments.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-500 mb-4">
              No training program payments found
            </div>
            <div className="text-sm text-gray-400">
              This could be because:
              <ul className="list-disc list-inside mt-2 text-left max-w-md mx-auto">
                <li>No registrations have been made yet</li>
                <li>Your account doesn't have permission to view payments</li>
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
                      Program
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
                      Professional Info
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
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full mr-3 ${getProgramTypeColor(
                              payment.programType
                            )}`}
                          >
                            {payment.programType}
                          </span>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {payment.programTitle}
                            </div>
                            <div className="text-sm text-gray-500">
                              {payment.programCategory}
                            </div>
                            <div className="text-xs text-gray-400">
                              {formatDate(payment.programDate)}
                            </div>
                            {payment.cmeCredits && (
                              <div className="text-xs text-blue-600">
                                {payment.cmeCredits} CME Credits
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {payment.participantName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {payment.participantEmail}
                          </div>
                          {payment.organization && (
                            <div className="text-xs text-gray-400">
                              {payment.organization}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          {payment.profession && (
                            <div className="text-sm text-gray-900">
                              {payment.profession}
                            </div>
                          )}
                          {payment.experience && (
                            <div className="text-xs text-gray-500">
                              {payment.experience}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {payment.amount > 0 ? (
                          <span className="text-green-600">
                            {formatCurrency(payment.amount, payment.currency)}
                          </span>
                        ) : (
                          <span className="text-gray-500">Free</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(
                            payment.paymentStatus
                          )}`}
                        >
                          {payment.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(payment.registrationDate)}
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
                    <span className="font-medium">{payments.length}</span> of{" "}
                    <span className="font-medium">{payments.length}</span>{" "}
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

export default TrainingPrograms;
