// Payment.tsx
import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe, useElements } from "@stripe/react-stripe-js";
import { useState, useEffect } from "react";
import { CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { membershipCategories } from "../membershippages/types";


const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

interface PaymentProps {
  onBack?: () => void;
  onSuccess?: () => void;
}

const PaymentForm = ({ onBack, onSuccess }: PaymentProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<typeof membershipCategories[0]>();

  useEffect(() => {
    const createPaymentIntent = async () => {
      setLoading(true);
      try {
        const response = await api.post("/payments/create-intent/", {});
        setClientSecret(response.data.clientSecret);
        
        if (response.data.membership_type) {
          const category = membershipCategories.find(
            cat => cat.value === response.data.membership_type
          );
          if (category) {
            setSelectedCategory(category);
          } else {
            setError("Invalid membership type received");
          }
        }
      } catch (err) {
        setError("Failed to initialize payment. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    createPaymentIntent();
  }, []);

  useEffect(() => {
    if (!stripe || !clientSecret) return;

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent?.status) {
        case "succeeded":
          setSuccess(true);
          setLoading(false);
          onSuccess?.();
          break;
        case "processing":
          setLoading(true);
          break;
        case "requires_payment_method":
          setError("Payment failed. Please try another payment method.");
          setLoading(false);
          break;
        default:
          setError("Something went wrong.");
          setLoading(false);
          break;
      }
    });
  }, [stripe, clientSecret, onSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret || !selectedCategory) return;

    setLoading(true);
    setError(null);

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`,
        receipt_email: location.state?.email,
      },
    });

    if (stripeError) {
      setError(stripeError.message || "Payment failed");
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Error</h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={onBack}
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            <ArrowLeft className="inline mr-2" />
            Back
          </button>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Successful!
        </h3>
        <p className="text-gray-600 mb-6">
          Thank you for becoming an ACNA member. Your membership details will be
          emailed to you shortly.
        </p>
        <button
          onClick={() => navigate("/member-dashboard")}
          className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  if (!selectedCategory) {
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Loading Payment Information
        </h3>
        <p className="text-gray-600 mb-6">
          Please wait while we prepare your payment details...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedCategory.title} Membership
              </h2>
              <p className="text-gray-600">Annual Payment</p>
            </div>
            <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-lg font-bold">
              {selectedCategory.fee}
            </span>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
            <div className="border rounded-lg p-4">
              {/* Stripe Elements will be injected here */}
              <div className="my-4" id="card-element" />
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2">Membership Benefits</h3>
            <ul className="space-y-2">
              {selectedCategory.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <form onSubmit={handleSubmit}>
            <button
              type="submit"
              disabled={!stripe || loading}
              className={`w-full py-3 px-6 rounded-lg font-bold text-white transition-colors ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary hover:bg-primary-dark"
              }`}
            >
              {loading ? "Processing..." : `Pay ${selectedCategory.fee}`}
            </button>
          </form>

          <p className="text-sm text-gray-500 mt-4">
            By completing your payment, you agree to ACNA's Terms of Service and
            Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export const Payment = (props: PaymentProps) => {
  return (
    <Elements stripe={stripePromise} options={{ locale: "en" }}>
      <PaymentForm {...props} />
    </Elements>
  );
};

export default Payment;