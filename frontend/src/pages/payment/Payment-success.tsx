import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, Download, ArrowRight, XCircle, Loader2 } from "lucide-react";
import api from "../../services/api";
import axios from "axios";

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError("No payment session found");
      setLoading(false);
      return;
    }

    const verifyPayment = async () => {
      try {
        const response = await api.get(`/payments/verify-payment/?session_id=${sessionId}`);
        
        if (response.data.error) {
          throw new Error(response.data.error);
        }

        setPaymentData(response.data);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        setError(
          axios.isAxiosError(err)
            ? err.response?.data?.error || "Payment verification failed"
            : "An error occurred while verifying your payment"
        );
        console.error("Payment verification error:", err);
      }
    };

    verifyPayment();
  }, [sessionId]);

  const handleDownloadInvoice = async () => {
    try {
      const response = await api.get(`/payments/download-invoice/?session_id=${sessionId}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${sessionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Invoice download error:", err);
      alert("Failed to download invoice. Please try again later.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Verifying Your Payment
          </h2>
          <p className="text-gray-600">
            Please wait while we confirm your payment details...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Verification Failed
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex flex-col gap-4">
            <button
              onClick={() => navigate("/member-dashboard")}
              className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-primary p-6 text-center">
            <CheckCircle className="h-16 w-16 text-white mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">
              Payment Successful!
            </h1>
            <p className="text-white/90">
              Thank you for becoming an ACNA member
            </p>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Membership Details */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Membership Details
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Membership Type</p>
                    <p className="font-medium">
                      {paymentData?.membership_type || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Valid Until</p>
                    <p className="font-medium">
                      {paymentData?.valid_until || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment Amount</p>
                    <p className="font-medium">
                      ${paymentData?.amount || '0.00'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Account Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">
                      {paymentData?.user?.name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">
                      {paymentData?.user?.email || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="font-medium">
                      {paymentData?.user?.join_date || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice Section */}
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Invoice</h2>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <p className="text-sm text-gray-500">Invoice Number</p>
                  <p className="font-medium">
                    {paymentData?.invoice_number || 'N/A'}
                  </p>
                </div>
                <button
                  onClick={handleDownloadInvoice}
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg transition-colors"
                >
                  <Download className="h-5 w-5" />
                  Download Invoice
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate("/member-dashboard")}
                className="flex-1 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                Go to Dashboard
                <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={() => navigate("/")}
                className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-8 bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Next Steps
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="flex-shrink-0 h-6 w-6 text-primary">
                  <CheckCircle className="h-full w-full" />
                </div>
                <span>
                  Access member-exclusive resources in your dashboard
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="flex-shrink-0 h-6 w-6 text-primary">
                  <CheckCircle className="h-full w-full" />
                </div>
                <span>
                  Check your email for membership confirmation and benefits guide
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="flex-shrink-0 h-6 w-6 text-primary">
                  <CheckCircle className="h-full w-full" />
                </div>
                <span>
                  Connect with our community through member forums and events
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;