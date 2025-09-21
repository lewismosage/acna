import React, { useState, useEffect } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle, Shield } from "lucide-react";
import Card, { CardContent } from "../../components/common/Card";
import ACNALogo from "../../assets/ACNA.jpg";
import ScrollToTop from "../../components/common/ScrollToTop";

const ResetPassword = () => {
  const { token } = useParams<{ token: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminRoute = location.pathname.includes('/admin');
  
  const [formData, setFormData] = useState({
    new_password: "",
    confirm_password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isValidToken, setIsValidToken] = useState(true);
  const [isCheckingToken, setIsCheckingToken] = useState(true);

  useEffect(() => {
    // Check if token is provided
    if (!token) {
      setError("Invalid password reset link");
      setIsValidToken(false);
      setIsCheckingToken(false);
      return;
    }

    // Token exists, mark as valid for now (will be validated on submit)
    setIsCheckingToken(false);
  }, [token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) setError("");
  };

  const validateForm = () => {
    if (!formData.new_password) {
      setError("Please enter a new password");
      return false;
    }
    if (formData.new_password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    if (!formData.confirm_password) {
      setError("Please confirm your password");
      return false;
    }
    if (formData.new_password !== formData.confirm_password) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      let data;
      
      if (isAdminRoute) {
        // Import admin API function dynamically
        const { resetAdminPassword } = await import('../../services/adminApi');
        data = await resetAdminPassword(token!, formData.new_password, formData.confirm_password);
      } else {
        // Import regular user API function dynamically
        const { resetPassword } = await import('../../services/api');
        data = await resetPassword(token!, formData.new_password, formData.confirm_password);
      }

      if (data.success) {
        setIsSuccess(true);
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          navigate(isAdminRoute ? '/admin/login' : '/login');
        }, 3000);
      } else {
        if (data.message.includes('expired') || data.message.includes('used')) {
          setIsValidToken(false);
        }
        throw new Error(data.message || 'Failed to reset password');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please try again.');
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
      ? "block w-full pl-10 pr-10 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
      : "block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500",
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

  if (isCheckingToken) {
    return (
      <div className={themeClasses.container}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className={`mt-2 ${themeClasses.subtitle}`}>Validating reset link...</p>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className={themeClasses.container}>
        <ScrollToTop />
        <Card className={themeClasses.card}>
          <CardContent className={themeClasses.cardContent}>
            <div className="text-center">
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
              
              <h1 className={`text-2xl font-bold ${themeClasses.title} mb-4`}>
                Invalid Reset Link
              </h1>
              
              <div className={`p-4 ${themeClasses.errorBg} rounded-lg flex items-start mb-6`}>
                <AlertCircle className={`h-5 w-5 ${themeClasses.errorIcon} mr-3 flex-shrink-0`} />
                <div className={`text-sm ${themeClasses.errorText} text-left`}>
                  <p className="font-medium">This password reset link is invalid or has expired.</p>
                  <p className="mt-1">Please request a new password reset link.</p>
                </div>
              </div>

              <Link
                to={isAdminRoute ? "/admin/forgot-password" : "/forgot-password"}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium ${themeClasses.primaryLink} hover:underline`}
              >
                Request New Reset Link
              </Link>

              <div className="mt-4">
                <Link
                  to={backLink}
                  className={`text-sm ${themeClasses.link}`}
                >
                  {loginText}
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              Set New Password
            </h1>
            <p className={`mt-2 ${themeClasses.subtitle}`}>
              {isAdminRoute 
                ? "Enter your new admin password"
                : "Enter your new password"
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

          {isSuccess ? (
            <div className={`mb-6 p-4 ${themeClasses.successBg} rounded-lg flex items-start`}>
              <CheckCircle className={`h-5 w-5 ${themeClasses.successIcon} mr-3 flex-shrink-0`} />
              <div className={`text-sm ${themeClasses.successText}`}>
                <p className="font-medium">Password Reset Successfully!</p>
                <p className="mt-1">
                  Your password has been updated. You will be redirected to the login page shortly.
                </p>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="new_password"
                  className={`block text-sm font-medium ${themeClasses.label} mb-1`}
                >
                  New Password
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className={`h-5 w-5 ${themeClasses.iconColor}`} />
                  </div>
                  <input
                    id="new_password"
                    name="new_password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.new_password}
                    onChange={handleInputChange}
                    className={themeClasses.input}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute inset-y-0 right-0 pr-3 flex items-center ${themeClasses.iconColor} hover:text-gray-500 focus:outline-none`}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <p className={`mt-1 text-xs ${themeClasses.subtitle}`}>
                  Must be at least 8 characters long
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirm_password"
                  className={`block text-sm font-medium ${themeClasses.label} mb-1`}
                >
                  Confirm New Password
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className={`h-5 w-5 ${themeClasses.iconColor}`} />
                  </div>
                  <input
                    id="confirm_password"
                    name="confirm_password"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={formData.confirm_password}
                    onChange={handleInputChange}
                    className={themeClasses.input}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={`absolute inset-y-0 right-0 pr-3 flex items-center ${themeClasses.iconColor} hover:text-gray-500 focus:outline-none`}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
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
                      Resetting Password...
                    </>
                  ) : (
                    <>Reset Password</>
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              to={backLink}
              className={`text-sm ${themeClasses.link}`}
            >
              {loginText}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;