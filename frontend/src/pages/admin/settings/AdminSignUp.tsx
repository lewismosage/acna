import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Eye,
  EyeOff,
  AlertCircle,
  Mail,
  Lock,
  Shield,
  User,
} from "lucide-react";
import Card, { CardContent } from "../../../components/common/Card";
import ACNALogo from "../../../assets/ACNA.jpg";
import { adminSignUpWithInvite } from "../../../services/adminApi";

const AdminSignUp = () => {
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [inviteToken, setInviteToken] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();

  // Check for invite token in URL
  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      setInviteToken(token);
      // You could also fetch invite details to pre-fill email
      // For now, we'll let the user enter their email
    } else {
      setError(
        "Invalid or missing invitation link. Please contact an administrator."
      );
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) setError("");
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError("First name is required");
      return false;
    }
    if (!formData.lastName.trim()) {
      setError("Last name is required");
      return false;
    }
    if (!formData.email || !formData.email.includes("@")) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!formData.password || formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    if (!inviteToken) {
      setError(
        "Invalid invitation. Please use the link provided in your invitation email."
      );
      setIsLoading(false);
      return;
    }

    try {
      const signUpData = {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        confirm_password: formData.confirmPassword,
        invite_token: inviteToken,
      };

      const response = await adminSignUpWithInvite(signUpData);
      console.log("Sign up response:", response);

      // Handle successful registration
      if (response && response.success) {
        // Store admin data and tokens
        localStorage.setItem("admin_token", response.access);
        localStorage.setItem("admin_refresh", response.refresh);
        localStorage.setItem("admin_data", JSON.stringify(response.admin));
        localStorage.setItem("is_admin", "true");

        // Redirect to admin dashboard
        navigate("/admin/dashboard", {
          state: { message: "Admin account created successfully. Welcome!" },
        });
      } else {
        setError(
          "Account creation successful but missing required data. Please try logging in."
        );
      }
    } catch (err: any) {
      console.error("Admin sign up error:", err);

      // Handle different types of errors
      let errorMessage = "An unexpected error occurred. Please try again.";

      if (err.response) {
        const { status, data } = err.response;

        switch (status) {
          case 400:
            if (data.errors?.email) {
              errorMessage = data.errors.email[0];
            } else if (data.errors?.invite_token) {
              errorMessage = data.errors.invite_token[0];
            } else {
              errorMessage =
                data.detail ||
                data.message ||
                "Please check your input and try again.";
            }
            break;
          case 409:
            errorMessage = "An admin account with this email already exists.";
            break;
          case 422:
            errorMessage =
              "Invalid input data. Please check your information and try again.";
            break;
          case 500:
            errorMessage =
              "Server error. Please try again later or contact support.";
            break;
          default:
            errorMessage =
              data.detail ||
              data.message ||
              "Admin registration failed. Please try again.";
        }
      } else if (err.request) {
        errorMessage =
          "Unable to connect to the server. Please check your internet connection and try again.";
      } else if (err.code === "NETWORK_ERROR") {
        errorMessage =
          "Network error. Please check your internet connection and try again.";
      } else {
        // Handle custom error messages
        if (err.message === "email_exists") {
          errorMessage = "An admin account with this email already exists.";
        } else if (err.message === "invalid_data") {
          errorMessage =
            "Invalid registration data. Please check your information.";
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
              Admin Registration
            </h1>
            <p className="mt-2 text-gray-300">
              Complete Your Administrator Account
            </p>
            <div className="mt-3 px-3 py-1 bg-green-900/50 rounded-full inline-block">
              <p className="text-xs text-green-300 flex items-center">
                <Shield className="h-3 w-3 mr-1" />
                Invitation Required
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-300 font-medium">{error}</p>
                {error.includes("already registered") && (
                  <p className="text-xs text-red-400 mt-1">
                    Try{" "}
                    <Link
                      to="/admin/login"
                      className="underline hover:no-underline"
                    >
                      logging in instead
                    </Link>{" "}
                    or{" "}
                    <Link
                      to="/admin/forgot-password"
                      className="underline hover:no-underline"
                    >
                      reset your password
                    </Link>
                  </p>
                )}
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-200 mb-1"
                >
                  First Name
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent ${
                      error && error.includes("First name")
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-600 focus:ring-red-500"
                    }`}
                    placeholder="John"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-200 mb-1"
                >
                  Last Name
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent ${
                      error && error.includes("Last name")
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-600 focus:ring-red-500"
                    }`}
                    placeholder="Doe"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

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
                    error &&
                    (error.includes("email") ||
                      error.includes("already registered"))
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-600 focus:ring-red-500"
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
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-10 py-2 border rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent ${
                    error && error.includes("Password")
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-600 focus:ring-red-500"
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

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-200 mb-1"
              >
                Confirm Password
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-10 py-2 border rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent ${
                    error && error.includes("match")
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-600 focus:ring-red-500"
                  }`}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 focus:outline-none disabled:opacity-50"
                  disabled={isLoading}
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
                    Creating Account...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Create Admin Account
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Already have an admin account?{" "}
              <Link
                to="/admin/login"
                className="font-medium text-red-400 hover:text-red-300"
              >
                Sign in here
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
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

export default AdminSignUp;
