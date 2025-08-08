import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe, useElements } from "@stripe/react-stripe-js";
import { useState, useEffect } from "react";
import { CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import axios from "axios";

// Move stripePromise outside the component
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!, {
  locale: "en",
});

interface PaymentProps {
  onBack?: () => void;
  onSuccess?: () => void;
}

const PaymentForm = ({ onBack, onSuccess }: PaymentProps) => {
  const stripe = useStripe();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initiateCheckout = async () => {
      if (!stripe) {
        setError("Payment system not ready. Please refresh the page.");
        setLoading(false);
        return;
      }

      try {
        const response = await api.post("/payments/create-checkout-session/", {
          membership_type: "student" 
        });

        if (response.data?.error) {
          throw new Error(response.data.error);
        }

        if (!response.data?.sessionId) {
          throw new Error("Payment session could not be created");
        }

        const { error: stripeError } = await stripe.redirectToCheckout({
          sessionId: response.data.sessionId,
        });

        if (stripeError) {
          throw stripeError;
        }
      } catch (err) {
        setLoading(false);
        setError(
          err instanceof Error ? err.message : "Payment initialization failed"
        );
        console.error("Payment error:", err);
      }
    };

    initiateCheckout();
  }, [stripe]);


  if (loading) {
    return (
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Initializing Payment System...
        </h3>
        <p className="text-gray-600 mb-6">
          Please wait while we connect to our payment processor.
        </p>
      </div>
    );
  }

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

  return (
    <div className="text-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        Redirecting to Secure Checkout...
      </h3>
      <p className="text-gray-600 mb-6">
        Please wait while we prepare your payment details.
      </p>
    </div>
  );
};

export const Payment = (props: PaymentProps) => {
  return (
    <Elements stripe={stripePromise} options={{
      fonts: [{
        cssSrc: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
      }]
    }}>
      <PaymentForm {...props} />
    </Elements>
  );
};

export default Payment;