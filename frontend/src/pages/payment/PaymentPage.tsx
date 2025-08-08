import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe, useElements } from "@stripe/react-stripe-js";
import { useState, useEffect } from "react";
import { CheckCircle, XCircle, ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import axios from "axios";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initiateCheckout = async () => {
      if (!stripe) {
        // Instead of showing error, just keep showing loading state
        return;
      }

      try {
        const response = await api.post("/payments/create-checkout-session/", {
          membership_type: "student" 
        });

        if (!response.data?.sessionId) {
          throw new Error("Payment session could not be created");
        }

        const { error: stripeError } = await stripe.redirectToCheckout({
          sessionId: response.data.sessionId,
        });

        if (stripeError) {
          // Redirect to a proper error page instead
          navigate("/payment-error", { state: { error: stripeError.message } });
        }
      } catch (err) {
        setLoading(false);
        // Redirect to error page instead of showing inline error
        navigate("/payment-error", { 
          state: { 
            error: err instanceof Error ? err.message : "Payment initialization failed" 
          } 
        });
      }
    };

    initiateCheckout();
  }, [stripe, navigate]);

  // Only show loading state - errors will redirect
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center p-8 max-w-md">
        <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {loading ? "Preparing Secure Checkout..." : "Completing Payment..."}
        </h3>
        <p className="text-gray-600 mb-6">
          Please wait while we connect to our payment processor.
        </p>
        {!loading && (
          <button
            onClick={onBack}
            className="mt-4 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            <ArrowLeft className="inline mr-2" />
            Return to Previous Page
          </button>
        )}
      </div>
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