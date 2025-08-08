import { useNavigate } from "react-router-dom";
import { XCircle, ArrowLeft, RotateCw } from "lucide-react";

const PaymentCanceled = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
          <XCircle className="h-12 w-12 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Canceled
        </h2>
        <p className="text-gray-600 mb-6">
          Your payment was not completed. You can try again or return to your dashboard.
        </p>
        
        <div className="flex flex-col gap-4">
          <button
            onClick={() => navigate("/member-dashboard")}
            className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Return to Dashboard
          </button>
          
          <button
            onClick={() => navigate("/payment")}  // Changed from window.location.reload()
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

export default PaymentCanceled;