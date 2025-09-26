import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, Download, ArrowLeft, Home } from "lucide-react";
import { trainingProgramsApi } from "../../services/trainingProgramsApi";
import LoadingSpinner from "../../components/common/LoadingSpinner";

interface PaymentDetails {
  program: {
    id: number;
    title: string;
    startDate: string;
    endDate: string;
    location: string;
  };
  registration: {
    id: number;
    participantName: string;
    participantEmail: string;
    organization: string;
    registrationType: string;
  };
  payment: {
    amount: number | string;
    currency: string;
    status: string;
    paymentId: string;
  };
}

const TrainingProgramPaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setError("No session ID provided");
        setLoading(false);
        return;
      }

      try {
        const details = await trainingProgramsApi.verifyPayment(sessionId);

        // Map the backend response to the expected frontend structure
        const mappedDetails = {
          program: {
            id: details.program.id,
            title: details.program.title,
            startDate: details.program.start_date,
            endDate: details.program.end_date,
            location: details.program.location,
          },
          registration: {
            id: details.registration.id,
            participantName: details.registration.participant_name,
            participantEmail: details.registration.participant_email,
            organization: details.registration.organization,
            registrationType: details.payment.registration_type || "Paid",
          },
          payment: {
            amount: details.payment.amount,
            currency: details.payment.currency,
            status: details.payment.status,
            paymentId: details.payment.stripe_checkout_session_id,
          },
        };

        setPaymentDetails(mappedDetails);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to verify payment"
        );
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

  const handleDownloadInvoice = async () => {
    if (!sessionId) return;

    setDownloading(true);
    try {
      await trainingProgramsApi.downloadInvoice(sessionId);
    } catch (err) {
      console.error("Failed to download invoice:", err);
    } finally {
      setDownloading(false);
    }
  };

  const handleBackToProgram = () => {
    if (paymentDetails?.program.id) {
      navigate(`/training-programs/${paymentDetails.program.id}`);
    } else {
      navigate("/training-programs");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Payment Verification Failed
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/training-programs")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Training Programs
          </button>
        </div>
      </div>
    );
  }

  if (!paymentDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            No Payment Details Found
          </h2>
          <p className="text-gray-600 mb-4">
            Unable to retrieve payment information.
          </p>
          <button
            onClick={() => navigate("/training-programs")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Training Programs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center mb-6">
          <div className="text-green-500 mb-4">
            <CheckCircle className="w-16 h-16 mx-auto" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-lg text-gray-600">
            Your training program registration has been confirmed
          </p>
        </div>

        {/* Program Details */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Training Program Details
          </h2>
          <div className="space-y-3">
            <div>
              <span className="font-medium text-gray-700">Program:</span>
              <span className="ml-2 text-gray-900">
                {paymentDetails.program.title}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Start Date:</span>
              <span className="ml-2 text-gray-900">
                {new Date(
                  paymentDetails.program.startDate
                ).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">End Date:</span>
              <span className="ml-2 text-gray-900">
                {new Date(paymentDetails.program.endDate).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Location:</span>
              <span className="ml-2 text-gray-900">
                {paymentDetails.program.location}
              </span>
            </div>
          </div>
        </div>

        {/* Registration Details */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Registration Details
          </h2>
          <div className="space-y-3">
            <div>
              <span className="font-medium text-gray-700">Name:</span>
              <span className="ml-2 text-gray-900">
                {paymentDetails.registration.participantName}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Email:</span>
              <span className="ml-2 text-gray-900">
                {paymentDetails.registration.participantEmail}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Organization:</span>
              <span className="ml-2 text-gray-900">
                {paymentDetails.registration.organization}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">
                Registration Type:
              </span>
              <span className="ml-2 text-gray-900">
                {paymentDetails.registration.registrationType}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Payment Details
          </h2>
          <div className="space-y-3">
            <div>
              <span className="font-medium text-gray-700">Amount Paid:</span>
              <span className="ml-2 text-gray-900">
                {paymentDetails.payment.currency}{" "}
                {typeof paymentDetails.payment.amount === "number"
                  ? paymentDetails.payment.amount.toFixed(2)
                  : parseFloat(paymentDetails.payment.amount).toFixed(2)}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Payment Status:</span>
              <span className="ml-2 text-green-600 font-medium capitalize">
                {paymentDetails.payment.status}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Payment ID:</span>
              <span className="ml-2 text-gray-900 font-mono text-sm">
                {paymentDetails.payment.paymentId}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleDownloadInvoice}
            disabled={downloading}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            {downloading ? (
              <LoadingSpinner />
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                Download Invoice
              </>
            )}
          </button>
          <button
            onClick={handleBackToProgram}
            className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Program
          </button>
          <button
            onClick={() => navigate("/training-programs")}
            className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <Home className="w-5 h-5 mr-2" />
            Browse Programs
          </button>
        </div>

        {/* Additional Information */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">What's Next?</h3>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>
              • You will receive a confirmation email with program details
            </li>
            <li>• Program materials will be shared closer to the start date</li>
            <li>• Contact us if you have any questions about the program</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TrainingProgramPaymentSuccess;
