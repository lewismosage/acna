import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { XCircle, ArrowLeft, Home } from "lucide-react";

const TrainingProgramPaymentCanceled: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const programId = searchParams.get("program_id");

  const handleBackToProgram = () => {
    if (programId) {
      navigate(`/training-programs/${programId}`);
    } else {
      navigate("/training-programs");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Canceled Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center mb-6">
          <div className="text-orange-500 mb-4">
            <XCircle className="w-16 h-16 mx-auto" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Canceled
          </h1>
          <p className="text-lg text-gray-600">
            Your payment was canceled and no charges were made
          </p>
        </div>

        {/* Information Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            What happened?
          </h2>
          <div className="space-y-3 text-gray-600">
            <p>
              You canceled the payment process before completing your training
              program registration.
            </p>
            <p>
              No charges have been made to your account, and your registration
              has not been processed.
            </p>
            <p>
              You can try again anytime by returning to the training program
              page and completing the registration process.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleBackToProgram}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {programId ? "Back to Program" : "Back to Programs"}
          </button>
          <button
            onClick={() => navigate("/training-programs")}
            className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <Home className="w-5 h-5 mr-2" />
            Browse All Programs
          </button>
        </div>

        {/* Help Information */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-medium text-yellow-900 mb-2">Need Help?</h3>
          <ul className="text-yellow-800 text-sm space-y-1">
            <li>• If you experienced technical issues, please try again</li>
            <li>• Contact our support team if you continue to have problems</li>
            <li>
              • Check your internet connection and try a different payment
              method
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TrainingProgramPaymentCanceled;
