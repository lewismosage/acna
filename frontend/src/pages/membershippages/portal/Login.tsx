import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, AlertCircle, Mail, Lock } from "lucide-react";
import Card, { CardContent } from "../../../components/common/Card";
import ACNALogo from "../../../assets/ACNA.jpg";
import ScrollToTop from "../../../components/common/ScrollToTop";
import { useAuth } from '../../../services/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
  
    // Local validation
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }
  
    try {
      await login(formData.email, formData.password);
      // On success go to member portal
      navigate('/memberportal');
    } catch (err: any) {
      console.log('Login error details:', err); // Debug log
      
      // Handle Axios error response structure
      if (err.response) {
        // The request was made and the server responded with a status code
        const { status, data } = err.response;
        
        if (status === 401) {
          setError(data.detail || 'Invalid email or password. Please check your credentials and try again.');
        } else if (status === 403) {
          if (data.error_code === 'membership_inactive' || data.detail?.includes('membership')) {
            setError(data.detail || 'Your membership is inactive. Please make a payment to continue to access membership benefits, or contact support.');
          } else if (data.error_code === 'account_deactivated') {
            setError(data.detail || 'Your account has been deactivated. Please contact support.');
          } else {
            setError(data.detail || 'Access denied. Please contact support if you believe this is an error.');
          }
        } else if (status === 400) {
          setError(data.detail || 'Please check your input and try again.');
        } else {
          setError(data.detail || data.message || 'An error occurred during login. Please try again.');
        }
      } else if (err.request) {
        // The request was made but no response was received (network error)
        setError('Unable to connect to the server. Please check your internet connection and try again.');
      } else {
        // Something else happened while setting up the request
        if (err.message === 'invalid_credentials') {
          setError('Invalid email or password. Please try again.');
        } else if (err.message === 'membership_inactive') {
          setError('Your membership is inactive. Please make a payment to continue to access membership benefits, or contact support.');
        } else {
          setError(err.message || 'An unexpected error occurred. Please try again.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <ScrollToTop />
      <Card className="w-full max-w-md">
        <CardContent>
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-lg ">
                <img
                  src={ACNALogo}
                  alt="ACNA Logo"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Sign in to ACNA
            </h1>
            <p className="mt-2 text-gray-600">
              Access member resources and benefits
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-orange-600 hover:text-orange-500"
              >
                apply for membership
              </Link>
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email address
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="member@example.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-orange-600 hover:text-orange-500"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    Signing in...
                  </>
                ) : (
                  <>Sign in</>
                )}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;