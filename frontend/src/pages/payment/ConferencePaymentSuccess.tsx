import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CheckCircle,
  Download,
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  Building,
} from "lucide-react";
import { conferencesApi } from "../../services/conferenceApi";
import LoadingSpinner from "../../components/common/LoadingSpinner";

interface PaymentData {
  status: string;
  payment_status: string;
  amount: number;
  currency: string;
  registration_type: string;
  conference: {
    id: number;
    title: string;
    date: string;
    location: string;
  };
  registration: {
    id: number;
    name: string;
    email: string;
    organization: string;
  };
  invoice_number: string;
}

const ConferencePaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get("session_id");

      if (!sessionId) {
        setError("No session ID found");
        setIsLoading(false);
        return;
      }

      try {
        const data = await conferencesApi.verifyPayment(sessionId);
        setPaymentData(data);
      } catch (err: any) {
        setError(err.message || "Failed to verify payment");
      } finally {
        setIsLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  const handleDownloadInvoice = async () => {
    // This would typically download a PDF invoice
    // For now, we'll just show a message
    alert("Invoice download feature will be implemented soon");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !paymentData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <svg
              className="h-12 w-12 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Verification Failed
          </h2>
          <p className="text-gray-600 mb-6">
            {error ||
              "Unable to verify your payment. Please contact support if you believe this is an error."}
          </p>
          <button
            onClick={() => navigate("/conferences")}
            className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Back to Conferences
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Header */}
        <div className="bg-white rounded-xl shadow-md p-8 text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Your conference registration has been confirmed. You will receive a
            confirmation email shortly.
          </p>

          {/* Payment Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Payment Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div>
                <span className="text-gray-600">Amount Paid:</span>
                <span className="ml-2 font-semibold text-green-600">
                  ${paymentData.amount} {paymentData.currency.toUpperCase()}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Registration Type:</span>
                <span className="ml-2 font-semibold">
                  {paymentData.registration_type
                    .replace("_", " ")
                    .toUpperCase()}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Payment Status:</span>
                <span className="ml-2 font-semibold text-green-600">
                  {paymentData.payment_status.toUpperCase()}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Invoice Number:</span>
                <span className="ml-2 font-semibold">
                  {paymentData.invoice_number}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleDownloadInvoice}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Download className="h-5 w-5" />
              Download Invoice
            </button>
            <button
              onClick={() => navigate("/conferences")}
              className="flex items-center justify-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Conferences
            </button>
          </div>
        </div>

        {/* Conference Details */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Conference Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-6 w-6 text-red-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Date</h3>
                  <p className="text-gray-600">
                    {new Date(paymentData.conference.date).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-6 w-6 text-red-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Location</h3>
                  <p className="text-gray-600">
                    {paymentData.conference.location}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="h-6 w-6 text-red-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Registered By</h3>
                  <p className="text-gray-600">
                    {paymentData.registration.name}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Building className="h-6 w-6 text-red-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Organization</h3>
                  <p className="text-gray-600">
                    {paymentData.registration.organization}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">What's Next?</h2>
          <div className="space-y-3 text-gray-700">
            <p>
              • You will receive a confirmation email with your registration
              details
            </p>
            <p>
              • Conference materials and agenda will be sent closer to the event
              date
            </p>
            <p>
              • If you have any questions, please contact us at info@acna.org
            </p>
            <p>• Keep this page for your records</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConferencePaymentSuccess;
