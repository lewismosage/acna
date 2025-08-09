import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe, useElements } from "@stripe/react-stripe-js";
import { useState, useEffect } from "react";
import { CheckCircle, XCircle, ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../services/api";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!, {
  locale: "en",
});

interface PaymentProps {
  onBack?: () => void;
  onSuccess?: () => void;
  paymentType?: PaymentType;
  membershipType?: string;
}

type PaymentType = "initial" | "renewal" | "upgrade";

interface PaymentLocationState {
  paymentType?: PaymentType;
  membershipType?: string;
  membershipData?: {
    id: string;
    email: string;
    name: string;
    amount: number;
    membershipId: string;
  };
}

// Payment form
const PaymentForm = ({ onBack, onSuccess }: PaymentProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stripeInitialized, setStripeInitialized] = useState(false);

  // Get payment data from navigation state
  const paymentType: PaymentType = 
    (location.state as PaymentLocationState)?.paymentType || "initial";
  const membershipType = (location.state as PaymentLocationState)?.membershipType;
  const membershipData = (location.state as any)?.membershipData;

  // Check when Stripe is ready
  useEffect(() => {
    if (stripe) {
      setStripeInitialized(true);
    }
  }, [stripe]);

  useEffect(() => {
    const initiateCheckout = async () => {
      if (!stripeInitialized || error) return;

      try {
        // For renewals, we need the user's current membership class
        if (paymentType === "renewal" && !membershipType) {
          throw new Error("Membership type is required for renewal");
        }

        const response = await api.post("/payments/create-checkout-session/", {
          payment_type: paymentType,
          membership_type: membershipType,
          email: membershipData?.email,
          user_id: membershipData?.id,
          membership_id: membershipData?.membershipId
        });

        if (!response.data?.sessionId) {
          throw new Error("Payment session could not be created");
        }

        const { error: stripeError } = await stripe!.redirectToCheckout({
          sessionId: response.data.sessionId,
        });

        if (stripeError) {
          throw new Error(stripeError.message);
        }
      } catch (err) {
        setLoading(false);
        setError(
          err instanceof Error ? err.message : "Payment initialization failed"
        );
      }
    };

    initiateCheckout();
  }, [stripe, navigate, paymentType, membershipType, stripeInitialized, error, membershipData]);

  // Stripe loading state
  if (!stripeInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Loading Payment Processor
          </h3>
          <p className="text-gray-600 mb-6">
            Please wait while we initialize our secure payment system.
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Error
          </h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={onBack || (() => navigate(-1))}
            className="mt-4 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            <ArrowLeft className="inline mr-2" />
            Return to Previous Page
          </button>
        </div>
      </div>
    );
  }

  // Default processing state
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center p-8 max-w-md">
        <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {paymentType === "initial"
            ? "Processing New Membership"
            : paymentType === "renewal"
            ? "Processing Membership Renewal"
            : "Processing Membership Upgrade"}
        </h3>
        <p className="text-gray-600 mb-6">
          Please wait while we connect to our payment processor.
        </p>
      </div>
    </div>
  );
};

// Wrapper with Stripe Elements
export const Payment = (props: PaymentProps) => {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        fonts: [
          {
            cssSrc:
              "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap",
          },
        ],
      }}
    >
      <PaymentForm {...props} />
    </Elements>
  );
};

export default Payment;