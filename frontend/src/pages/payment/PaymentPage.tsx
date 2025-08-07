import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from "./CheckoutForm";

// Load Stripe.js with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

const PaymentPage = () => {
  const amount = 5000; // Example amount in cents ($50.00)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          ACNA - Complete Your Membership
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Secure payment processing
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900">Payment Details</h3>
            <p className="mt-1 text-sm text-gray-600">
              Membership fee: ${(amount / 100).toFixed(2)}
            </p>
          </div>

          <Elements stripe={stripePromise}>
            <CheckoutForm amount={amount} />
          </Elements>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Your payment is securely processed by Stripe. ACNA does not store your payment details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;