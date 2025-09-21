import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, AlertCircle, Mail, Lock, Shield } from "lucide-react";
import Card, { CardContent } from "../../../components/common/Card";
import ACNALogo from "../../../assets/ACNA.jpg";
import { useAuth } from '../../../services/AuthContext';

const AdminLogin = () => {
  const { adminLogin } = useAuth();
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
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Local validation
    if (!formData.email || !formData.email.includes('@')) {
      setError('Please enter a valid admin email address');
      setIsLoading(false);
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await adminLogin(formData.email, formData.password);
      console.log('Login response:', response);
      
      // Verify we have the required data
      if (response && response.access && response.admin) {
        navigate('/admin/dashboard');
      } else {
        setError('Login successful but missing required data. Please try again.');
      }
    } catch (err: any) {
      console.error('Admin login error:', err);
      
      // Handle different types of errors
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (err.response) {
        // The request was made and the server responded with a status code
        const { status, data } = err.response;
        
        switch (status) {
          case 400:
            errorMessage = data.detail || data.message || 'Please check your input and try again.';
            break;
          case 401:
            errorMessage = 'Invalid admin credentials. Please check your email and password.';
            break;
          case 403:
            if (data.detail?.includes('admin privileges')) {
              errorMessage = 'You do not have admin privileges. Please contact the system administrator.';
            } else {
              errorMessage = 'Access denied. Admin privileges required.';
            }
            break;
          case 404:
            errorMessage = 'Admin account not found. Please check your email address.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later or contact support.';
            break;
          default:
            errorMessage = data.detail || data.message || 'Admin login failed. Please try again.';
        }
      } else if (err.request) {
        // The request was made but no response was received (network error)
        errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
      } else if (err.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else {
        // Handle custom error messages from auth context
        if (err.message === 'invalid_credentials') {
          errorMessage = 'Invalid admin credentials. Please check your email and password.';
        } else if (err.message === 'access_denied') {
          errorMessage = 'You do not have admin privileges. Please contact the system administrator.';
        } else if (err.message) {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <Card className="w-full max-w-md border border-gray-700 bg-gray-800">
        <CardContent className="bg-gray-800">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-lg relative">
                <img
                  src={ACNALogo}
                  alt="ACNA Logo"
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="absolute -bottom-1 -right-1 bg-red-600 rounded-full p-1">
                  <Shield className="h-3 w-3 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white">
              Admin Portal
            </h1>
            <p className="mt-2 text-gray-300">
              Site Administration Access
            </p>
            <div className="mt-3 px-3 py-1 bg-red-900/50 rounded-full inline-block">
              <p className="text-xs text-red-300 flex items-center">
                <Shield className="h-3 w-3 mr-1" />
                Authorized Personnel Only
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-300 font-medium">{error}</p>
                {error.includes('Invalid admin credentials') && (
                  <p className="text-xs text-red-400 mt-1">
                    Ensure you're using your admin account credentials, or{" "}
                    <Link to="/admin/forgot-password" className="underline hover:no-underline">
                      reset your password
                    </Link>
                  </p>
                )}
                {error.includes('admin privileges') && (
                  <p className="text-xs text-red-400 mt-1">
                    Only users with admin privileges can access this portal.
                  </p>
                )}
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-200 mb-1"
              >
                Admin Email
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent ${
                    error && error.includes('email') 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-600 focus:ring-red-500'
                  }`}
                  placeholder="admin@example.com"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-200 mb-1"
              >
                Password
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-10 py-2 border rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent ${
                    error && error.includes('password') 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-600 focus:ring-red-500'
                  }`}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 focus:outline-none disabled:opacity-50"
                  disabled={isLoading}
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
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-600 rounded bg-gray-700"
                  disabled={isLoading}
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-300"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/admin/forgot-password"
                  className="font-medium text-red-400 hover:text-red-300"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
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
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Access Admin Panel
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm text-gray-400 hover:text-gray-300"
            >
              ← Back to Member Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;