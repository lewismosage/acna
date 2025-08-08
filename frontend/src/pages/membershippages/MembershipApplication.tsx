import { useState, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import ScrollToTop from "../../components/common/ScrollToTop";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import IndividualForm from "./register/IndividualForm";
import OrganizationForm from "./register/OrganizationForm";
import { CountryOption, RegistrationFormData } from "../membershippages/types";
import AlertModal from '../../components/common/AlertModal';
import { registerUser } from '../../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"individual" | "organization">(
    "individual"
  );
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'error' as 'info' | 'success' | 'warning' | 'error'
  });

  const [formData, setFormData] = useState<RegistrationFormData>({
    // Individual fields
    membershipClass: "",
    firstName: "",
    lastName: "",
    mobileNumber: "",
    emailAddress: "",
    physicalAddress: "",
    country: "Kenya",
    ageBracket: "",
    password: "",
    confirmPassword: "",
    gender: "",
    // Organization fields
    organizationName: "",
    organizationType: "",
    registrationNumber: "",
    contactPersonName: "",
    contactPersonTitle: "",
    organizationEmail: "",
    organizationPhone: "",
    organizationAddress: "",
    organizationCountry: "Kenya",
    website: "",
    termsAccepted: false,
  });

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCountryChange = (
    selected: CountryOption | null,
    field: "country" | "organizationCountry"
  ) => {
    if (selected) {
      setFormData({ ...formData, [field]: selected.value });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Prepare data for API - different structure for individuals vs organizations
      const userData = activeTab === "organization" ? {
        // Organization registration data
        username: formData.organizationEmail,
        email: formData.organizationEmail,
        password: formData.password,
        confirm_password: formData.confirmPassword,
        first_name: formData.contactPersonName, 
        last_name: '', 
        mobile_number: formData.organizationPhone,
        physical_address: formData.organizationAddress,
        country: formData.organizationCountry,
        gender: '', 
        age_bracket: '', 
        membership_class: formData.membershipClass || 'corporate',
        is_organization: true,
        organization_name: formData.organizationName,
        organization_type: formData.organizationType,
        registration_number: formData.registrationNumber,
        contact_person_title: formData.contactPersonTitle,
        organization_phone: formData.organizationPhone,
        organization_address: formData.organizationAddress,
        website: formData.website,
      } : {
        // Individual registration data
        username: formData.emailAddress,
        email: formData.emailAddress,
        password: formData.password,
        confirm_password: formData.confirmPassword,
        first_name: formData.firstName,
        last_name: formData.lastName,
        mobile_number: formData.mobileNumber,
        physical_address: formData.physicalAddress,
        country: formData.country,
        gender: formData.gender,
        age_bracket: formData.ageBracket,
        membership_class: formData.membershipClass,
        is_organization: false,
        organization_name: '',
        organization_type: '',
        registration_number: '',
        contact_person_title: '',
        organization_phone: '',
        organization_address: '',
        website: '',
      };
  
      // Email validation check
      const validateEmail = (email: string) => {
        return String(email)
          .toLowerCase()
          .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          );
      };

      if (!validateEmail(userData.email)) {
        setAlertModal({
          isOpen: true,
          title: 'Invalid Email',
          message: 'Please enter a valid email address',
          type: 'error'
        });
        return;
      }

      const response = await registerUser(userData);
      
      if (response.success) {
        navigate('/verification', { 
          state: { 
            email: activeTab === "organization" 
              ? formData.organizationEmail 
              : formData.emailAddress,
          } 
        });
      }
      setIsLoading(false);
    } catch (error: any) {
      console.error('Registration failed:', error.response?.data || error);
    
    // First check if we have error data in the response
    if (error.response?.data) {
      const responseData = error.response.data;
      
      // Check if we have errors object with email/username conflicts
      if (responseData.errors) {
        const { errors } = responseData;
        
        // Check for email conflict specifically
        if (errors.email) {
          setAlertModal({
            isOpen: true,
            title: 'Email Already Registered',
            message: 'The email address you entered is already registered. Please use a different email or login if you already have an account.',
            type: 'error'
          });
          return;
        }
        
        // Check for username conflict (which is also email in your case)
        if (errors.username) {
          setAlertModal({
            isOpen: true,
            title: 'Account Exists',
            message: 'This email is already registered as a username. Please use a different email or login if you already have an account.',
            type: 'error'
          });
          return;
        }
        
        // Handle other validation errors if any
        if (Object.keys(errors).length > 0) {
          let errorMessage = 'Please correct the following issues:\n\n';
          for (const [field, message] of Object.entries(errors)) {
            const friendlyFieldName = field
              .replace(/_/g, ' ')
              .replace(/\b\w/g, l => l.toUpperCase());
            errorMessage += `• ${friendlyFieldName}: ${message}\n\n`;
          }
          
          setAlertModal({
            isOpen: true,
            title: 'Registration Issues',
            message: errorMessage.trim(),
            type: 'error'
          });
          return;
        }
      }
      
      // Handle case where we have a message but no errors object
      if (responseData.message) {
        setAlertModal({
          isOpen: true,
          title: 'Registration Error',
          message: responseData.message,
          type: 'error'
        });
        return;
      }
    }
    
    // Fallback for any other errors
    setAlertModal({
      isOpen: true,
      title: 'Registration Error',
      message: 'The email address you entered is already registered. Please use a different email or login if you already have an account.',
      type: 'error'
    });
    setIsLoading(false);
  }
};

  return (
    <div className="bg-white min-h-screen">
      <ScrollToTop />
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-6">
            Membership Application
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 font-light max-w-3xl mx-auto">
            Join the African Child Neurology Association and be part of the
            movement to improve neurological care for children across Africa.
          </p>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="py-4 sm:py-8 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="bg-white rounded-lg p-1 shadow-md inline-flex">
              <button
                onClick={() => setActiveTab("individual")}
                className={`px-4 py-2 sm:px-6 sm:py-3 rounded-md font-medium text-sm sm:text-base transition-all duration-300 ${
                  activeTab === "individual"
                    ? "bg-orange-600 text-white shadow-md"
                    : "text-gray-600 hover:text-orange-600"
                }`}
              >
                Join as Individual
              </button>
              <button
                onClick={() => setActiveTab("organization")}
                className={`px-4 py-2 sm:px-6 sm:py-3 rounded-md font-medium text-sm sm:text-base transition-all duration-300 ${
                  activeTab === "organization"
                    ? "bg-orange-600 text-white shadow-md"
                    : "text-gray-600 hover:text-orange-600"
                }`}
              >
                Join as Organization
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-5 gap-8 items-start">
            {/* Left Side - Narrow Column */}
            <div className="lg:col-span-2 bg-gray-900 rounded-lg overflow-hidden h-100">
              <div className="p-6 text-white h-full flex flex-col">
                <h2 className="text-2xl font-bold text-yellow-400 mb-4">
                  Join our Movement!
                </h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Help create a world where every child has access to
                  life-changing neurological care.{" "}
                  <strong className="text-white">JOIN TODAY!</strong>
                </p>
                <p className="text-gray-300 leading-relaxed text-sm mb-6">
                  Membership is annual and runs for twelve months from the
                  enrollment date. To be eligible to receive the following
                  benefits and make use of the opportunities ACNA creates, your
                  membership has to be current and paid up.
                </p>
                <div className="mt-auto">
                  <div className="bg-yellow-500 bg-opacity-20 p-4 rounded-lg border border-yellow-500">
                    <h3 className="font-bold text-yellow-400 mb-2">
                      Membership Benefits:
                    </h3>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Access to exclusive resources</li>
                      <li>• Networking opportunities</li>
                      <li>• Professional development</li>
                      <li>• Conference discounts</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Form (Wider Column) */}
            <div className="lg:col-span-3 bg-white rounded-lg shadow-lg p-8">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-yellow-500 mb-2">
                  {activeTab === "individual" ? "Individual" : "Organization"}{" "}
                  Membership Application!
                </h2>
                <p className="text-gray-600">
                  Thank you for your interest in becoming an ACNA Member. For
                  more information about membership, including{" "}
                  <span className="text-blue-600">
                    benefits, types of membership and rates
                  </span>{" "}
                  please visit the{" "}
                  <Link
                    to="/membership-categories"
                    className="text-blue-600 hover:underline"
                  >
                    membership category section
                  </Link>{" "}
                  of our website.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {activeTab === "individual" ? (
                  <IndividualForm
                    formData={formData}
                    handleInputChange={handleInputChange}
                    handleCountryChange={handleCountryChange}
                  />
                ) : (
                  <OrganizationForm
                    formData={formData}
                    handleInputChange={handleInputChange}
                    handleCountryChange={handleCountryChange}
                  />
                )}

                {/* Terms and Conditions */}
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="terms"
                    name="termsAccepted"
                    checked={formData.termsAccepted}
                    onChange={handleInputChange}
                    className="mt-1 w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    required
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700">
                    I have read and agree to the ACNA{" "}
                    <Link
                      to="/terms-and-conditions"
                      className="text-blue-600 hover:underline cursor-pointer"
                    >
                      Terms and Conditions
                    </Link>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-yellow-500 hover:bg-green-600 text-black font-bold py-3 px-6 rounded-md transition-colors duration-300 flex justify-center items-center"
                  disabled={isLoading}
                >
                  {isLoading ? <LoadingSpinner /> : "SIGNUP & PAY"}
                </button>

                {/* Sign In Link */}
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-4 mb-4">
                    <div className="flex-1 h-px bg-gray-300"></div>
                    <span className="text-gray-500">OR</span>
                    <div className="flex-1 h-px bg-gray-300"></div>
                  </div>
                  <p className="text-gray-600">
                    Already a Member?{" "}
                    <Link
                      to="/login"
                      className="text-blue-600 hover:underline cursor-pointer font-medium"
                    >
                      Sign In
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
   
    {/* Alert Modal*/}
    <AlertModal
      isOpen={alertModal.isOpen}
      onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
      title={alertModal.title}
      message={alertModal.message}
      type={alertModal.type}
    />
  </div>
);
};

export default Register;
