import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Mail, ArrowLeft, AlertCircle, CheckCircle, Shield } from "lucide-react";
import Card, { CardContent } from "../../components/common/Card";
import ACNALogo from "../../assets/ACNA.jpg";
import ScrollToTop from "../../components/common/ScrollToTop";

const ForgotPassword = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.includes('/admin');
  
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Basic email validation
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      let data;
      
      if (isAdminRoute) {
        // Import admin API function dynamically
        const { sendAdminPasswordReset } = await import('../../services/adminApi');
        data = await sendAdminPasswordReset(email);
      } else {
        // Import regular user API function dynamically
        const { sendPasswordReset } = await import('../../services/api');
        data = await sendPasswordReset(email);
      }

      if (data.success) {
        setIsSuccess(true);
      } else {
        throw new Error(data.message || 'Failed to send reset email');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const themeClasses = {
    container: isAdminRoute 
      ? "min-h-screen flex items-center justify-center bg-gray-900 p-4"
      : "min-h-screen flex items-center justify-center bg-gray-100 p-4",
    card: isAdminRoute 
      ? "w-full max-w-md border border-gray-700 bg-gray-800"
      : "w-full max-w-md",
    cardContent: isAdminRoute ? "bg-gray-800" : "",
    title: isAdminRoute ? "text-white" : "text-gray-900",
    subtitle: isAdminRoute ? "text-gray-300" : "text-gray-600",
    label: isAdminRoute ? "text-gray-200" : "text-gray-700",
    input: isAdminRoute 
      ? "block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
      : "block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500",
    button: isAdminRoute
      ? "w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
      : "w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed",
    link: isAdminRoute ? "text-gray-400 hover:text-gray-300" : "text-gray-600 hover:text-gray-500",
    primaryLink: isAdminRoute ? "text-red-400 hover:text-red-300" : "text-orange-600 hover:text-orange-500",
    iconColor: isAdminRoute ? "text-gray-500" : "text-gray-400",
    errorBg: isAdminRoute ? "bg-red-900/50 border border-red-700" : "bg-red-50",
    errorText: isAdminRoute ? "text-red-300" : "text-red-700",
    errorIcon: isAdminRoute ? "text-red-400" : "text-red-500",
    successBg: isAdminRoute ? "bg-green-900/50 border border-green-700" : "bg-green-50",
    successText: isAdminRoute ? "text-green-300" : "text-green-700",
    successIcon: isAdminRoute ? "text-green-400" : "text-green-500"
  };

  const backLink = isAdminRoute ? "/admin/login" : "/login";
  const loginText = isAdminRoute ? "Back to Admin Login" : "Back to Login";

  return (
    <div className={themeClasses.container}>
      <ScrollToTop />
      <Card className={themeClasses.card}>
        <CardContent className={themeClasses.cardContent}>
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-lg relative">
                <img
                  src={ACNALogo}
                  alt="ACNA Logo"
                  className="w-full h-full object-cover rounded-lg"
                />
                {isAdminRoute && (
                  <div className="absolute -bottom-1 -right-1 bg-red-600 rounded-full p-1">
                    <Shield className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
            </div>
            <h1 className={`text-2xl font-bold ${themeClasses.title}`}>
              Reset Password
            </h1>
            <p className={`mt-2 ${themeClasses.subtitle}`}>
              {isAdminRoute 
                ? "Enter your admin email to reset your password"
                : "Enter your email to receive password reset instructions"
              }
            </p>
            {isAdminRoute && (
              <div className="mt-3 px-3 py-1 bg-red-900/50 rounded-full inline-block">
                <p className="text-xs text-red-300 flex items-center">
                  <Shield className="h-3 w-3 mr-1" />
                  Admin Password Reset
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className={`mb-6 p-4 ${themeClasses.errorBg} rounded-lg flex items-start`}>
              <AlertCircle className={`h-5 w-5 ${themeClasses.errorIcon} mr-3 flex-shrink-0`} />
              <p className={`text-sm ${themeClasses.errorText}`}>{error}</p>
            </div>
          )}

          {isSuccess && (
            <div className={`mb-6 p-4 ${themeClasses.successBg} rounded-lg flex items-start`}>
              <CheckCircle className={`h-5 w-5 ${themeClasses.successIcon} mr-3 flex-shrink-0`} />
              <div className={`text-sm ${themeClasses.successText}`}>
                <p className="font-medium">Reset email sent!</p>
                <p className="mt-1">
                  If an account with that email exists, you'll receive password reset instructions shortly.
                </p>
              </div>
            </div>
          )}

          {!isSuccess ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className={`block text-sm font-medium ${themeClasses.label} mb-1`}
                >
                  {isAdminRoute ? "Admin Email" : "Email address"}
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className={`h-5 w-5 ${themeClasses.iconColor}`} />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={themeClasses.input}
                    placeholder={isAdminRoute ? "admin@example.com" : "member@example.com"}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={themeClasses.button}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>Send Reset Link</>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <p className={`text-sm ${themeClasses.subtitle} mb-4`}>
                  Check your email and click the reset link to create a new password.
                </p>
                <button
                  onClick={() => {
                    setIsSuccess(false);
                    setEmail("");
                    setError("");
                  }}
                  className={`font-medium ${themeClasses.primaryLink}`}
                >
                  Send another email
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              to={backLink}
              className={`inline-flex items-center text-sm ${themeClasses.link}`}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              {loginText}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;