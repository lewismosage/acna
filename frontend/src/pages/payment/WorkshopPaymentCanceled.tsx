import { useSearchParams, useNavigate } from "react-router-dom";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";

const WorkshopPaymentCanceled = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const workshopId = searchParams.get("workshop_id");

  const handleTryAgain = () => {
    if (workshopId) {
      navigate(`/workshops/${workshopId}`);
    } else {
      navigate("/workshops");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Canceled Header */}
          <div className="mb-8">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Payment Canceled
            </h1>
            <p className="text-gray-600">
              Your workshop registration payment was canceled. No charges have
              been made.
            </p>
          </div>

          {/* Information */}
          <div className="bg-yellow-50 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              What happened?
            </h2>
            <p className="text-gray-700">
              You canceled the payment process before completing your workshop
              registration. Your registration details were not saved and no
              payment was processed.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleTryAgain}
              className="flex items-center justify-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Try Again
            </button>

            <button
              onClick={() => navigate("/workshops")}
              className="flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Workshops
            </button>
          </div>

          {/* Contact Information */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Need help? Contact us at{" "}
              <a
                href="mailto:workshops@acna.org"
                className="text-blue-600 hover:underline"
              >
                workshops@acna.org
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkshopPaymentCanceled;
