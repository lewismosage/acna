import { useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowLeft, RotateCw } from "lucide-react";

const ConferencePaymentError = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
          <AlertTriangle className="h-12 w-12 text-yellow-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Error</h2>
        <p className="text-gray-600 mb-6">
          There was an error processing your conference registration payment.
          Please try again or contact support if the problem persists.
        </p>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => navigate("/conferences")}
            className="flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Conferences
          </button>

          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            <RotateCw className="h-5 w-5" />
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConferencePaymentError;
