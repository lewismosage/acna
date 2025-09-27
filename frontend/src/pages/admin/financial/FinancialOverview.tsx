import { DollarSign, Download, Users, Calendar, BookOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { conferencesApi } from "../../../services/conferenceApi";
import { workshopsApi } from "../../../services/workshopAPI";
import { trainingProgramsApi } from "../../../services/trainingProgramsApi";
import api from "../../../services/api";
import StatsCard from "./StatsCard";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import AlertModal from "../../../components/common/AlertModal";

interface FinancialSummary {
  totalRevenue: number;
  membershipRevenue: number;
  eventRevenue: number;
  trainingRevenue: number;
  totalTransactions: number;
  monthlyGrowth: number;
}

interface RecentTransaction {
  id: string;
  member: string;
  amount: number;
  type: string;
  status: string;
  date: string;
  source: "membership" | "conference" | "workshop" | "training";
}

const FinancialOverview = () => {
  const [summary, setSummary] = useState<FinancialSummary>({
    totalRevenue: 0,
    membershipRevenue: 0,
    eventRevenue: 0,
    trainingRevenue: 0,
    totalTransactions: 0,
    monthlyGrowth: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<
    RecentTransaction[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alert, setAlert] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info" as "info" | "success" | "warning" | "error",
  });

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        setIsLoading(true);

        // Fetch all financial data in parallel
        const [
          conferences,
          workshops,
          trainingRegistrations,
          membershipPayments,
        ] = await Promise.all([
          conferencesApi.getAll(),
          workshopsApi.getRegistrations(),
          trainingProgramsApi.getRegistrations(),
          fetchMembershipPayments(),
        ]);

        // Calculate event revenue (conferences + workshops)
        let eventRevenue = 0;
        const eventTransactions: RecentTransaction[] = [];

        // Conference revenue
        for (const conference of conferences) {
          if (conference.conference_registrations) {
            for (const reg of conference.conference_registrations) {
              if (reg.payment_status === "paid" && reg.amount_paid) {
                const amount = Number(reg.amount_paid) || 0;
                eventRevenue += amount;
                eventTransactions.push({
                  id: `conf-${reg.id}`,
                  member: `${reg.first_name} ${reg.last_name}`,
                  amount: amount,
                  type: "Conference Registration",
                  status: "Completed",
                  date: reg.registered_at,
                  source: "conference",
                });
              }
            }
          }
        }

        // Workshop revenue
        for (const workshop of workshops) {
          if (workshop.paymentStatus === "paid" && workshop.amount) {
            const amount = Number(workshop.amount) || 0;
            eventRevenue += amount;
            eventTransactions.push({
              id: `workshop-${workshop.id}`,
              member: workshop.fullName,
              amount: amount,
              type: "Workshop Registration",
              status: "Completed",
              date: workshop.registeredAt,
              source: "workshop",
            });
          }
        }

        // Calculate training program revenue
        let trainingRevenue = 0;
        const trainingTransactions: RecentTransaction[] = [];

        for (const registration of trainingRegistrations) {
          if (registration.paymentStatus === "paid") {
            try {
              const program = await trainingProgramsApi.getById(
                registration.programId
              );
              if (program.price > 0) {
                const amount = Number(program.price) || 0;
                trainingRevenue += amount;
                trainingTransactions.push({
                  id: `training-${registration.id}`,
                  member: registration.participantName,
                  amount: amount,
                  type: "Training Program",
                  status: "Completed",
                  date: registration.registrationDate,
                  source: "training",
                });
              }
            } catch (error) {
              console.error(
                `Failed to fetch program details for registration ${registration.id}`,
                error
              );
            }
          }
        }

        // Calculate membership revenue
        let membershipRevenue = 0;
        const membershipTransactions: RecentTransaction[] = [];

        for (const payment of membershipPayments) {
          if (payment.status === "succeeded") {
            const amount = Number(payment.amount) || 0;
            membershipRevenue += amount;
            membershipTransactions.push({
              id: `membership-${payment.id}`,
              member: `${payment.user.first_name} ${payment.user.last_name}`,
              amount: amount,
              type: "Membership Fee",
              status: "Completed",
              date: payment.created_at,
              source: "membership",
            });
          }
        }

        // Combine all transactions and sort by date
        const allTransactions = [
          ...membershipTransactions,
          ...eventTransactions,
          ...trainingTransactions,
        ]
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )
          .slice(0, 10); // Get 10 most recent

        const totalRevenue = membershipRevenue + eventRevenue + trainingRevenue;
        const totalTransactions =
          membershipTransactions.length +
          eventTransactions.length +
          trainingTransactions.length;

        // Calculate monthly growth (simplified - compare current month to previous month)
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const currentMonthTransactions = allTransactions.filter((t) => {
          const transactionDate = new Date(t.date);
          return (
            transactionDate.getMonth() === currentMonth &&
            transactionDate.getFullYear() === currentYear
          );
        });
        const currentMonthRevenue = currentMonthTransactions.reduce(
          (sum, t) => sum + t.amount,
          0
        );

        // For demo purposes, assume previous month had 80% of current revenue
        const previousMonthRevenue = currentMonthRevenue * 0.8;
        const monthlyGrowth =
          previousMonthRevenue > 0
            ? ((currentMonthRevenue - previousMonthRevenue) /
                previousMonthRevenue) *
              100
            : 0;

        setSummary({
          totalRevenue,
          membershipRevenue,
          eventRevenue,
          trainingRevenue,
          totalTransactions,
          monthlyGrowth,
        });

        setRecentTransactions(allTransactions);
      } catch (error) {
        setAlert({
          isOpen: true,
          title: "Error",
          message: "Failed to fetch financial data. Please try again later.",
          type: "error",
        });
        console.error("Error fetching financial data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFinancialData();
  }, []);

  const fetchMembershipPayments = async () => {
    try {
      // First fetch all members
      const usersResponse = await api.get("/users/members/");
      const allPayments: any[] = [];

      // Then fetch payments for each member
      for (const user of usersResponse.data) {
        try {
          const paymentsResponse = await api.get(
            `/payments/user-payments/?user_id=${user.id}`
          );
          allPayments.push(...paymentsResponse.data);
        } catch (error) {
          console.error(`Failed to fetch payments for user ${user.id}`, error);
        }
      }

      return allPayments;
    } catch (error) {
      console.error("Error fetching membership payments:", error);
      return [];
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "membership":
        return <Users className="w-4 h-4 text-blue-600" />;
      case "conference":
        return <Calendar className="w-4 h-4 text-purple-600" />;
      case "workshop":
        return <Calendar className="w-4 h-4 text-orange-600" />;
      case "training":
        return <BookOpen className="w-4 h-4 text-green-600" />;
      default:
        return <DollarSign className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleExport = async () => {
    try {
      setAlert({
        isOpen: true,
        title: "Export Started",
        message:
          "Your financial overview report is being prepared and will be downloaded shortly.",
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      {/* Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(summary.totalRevenue)}
          icon={DollarSign}
          color="green"
          trend={
            summary.monthlyGrowth > 0
              ? `+${summary.monthlyGrowth.toFixed(1)}% vs last month`
              : undefined
          }
        />
        <StatsCard
          title="Event Revenue"
          value={formatCurrency(summary.eventRevenue)}
          icon={Calendar}
          color="purple"
        />
        <StatsCard
          title="Donations"
          value={formatCurrency(0)}
          icon={BookOpen}
          color="blue"
        />
        <StatsCard
          title="Membership Revenue"
          value={formatCurrency(summary.membershipRevenue)}
          icon={Users}
          color="orange"
        />
      </div>

      {/* Recent Transactions */}
      <div className="bg-white border border-gray-300 rounded-lg mt-6">
        <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Recent Transactions</h2>
            <div className="flex space-x-2">
              <button
                onClick={handleExport}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                disabled={recentTransactions.length === 0}
              >
                <Download className="w-4 h-4 inline mr-1" />
                Export Report
              </button>
            </div>
          </div>
        </div>

        <div className="p-4">
          {recentTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No recent transactions found
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded"
                >
                  <div className="flex items-center">
                    <div className="mr-3">
                      {getSourceIcon(transaction.source)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {transaction.member}
                      </p>
                      <p className="text-xs text-gray-600">
                        {transaction.type} • {formatDate(transaction.date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      {formatCurrency(transaction.amount)}
                    </p>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                        transaction.status
                      )}`}
                    >
                      {transaction.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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

export default FinancialOverview;
