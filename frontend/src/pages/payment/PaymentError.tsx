// Create this at src/pages/payment/PaymentError.tsx
import { useLocation, useNavigate } from "react-router-dom";
import { XCircle, ArrowLeft } from "lucide-react";

const PaymentError = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const error = state?.error || "An unknown payment error occurred";

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
          <XCircle className="h-12 w-12 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Error
        </h2>
        <p className="text-gray-600 mb-6">{error}</p>
        
        <div className="flex flex-col gap-4">
          <button
            onClick={() => navigate(-1)} // Go back to previous page
            className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentError;