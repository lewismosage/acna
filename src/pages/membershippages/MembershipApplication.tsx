import { useState, ChangeEvent, FormEvent } from "react";
import { Link } from "react-router-dom";
import ScrollToTop from "../../components/common/ScrollToTop";
import IndividualForm from "./IndividualForm";
import OrganizationForm from "./OrganizationForm";
import { 
  CountryOption, 
  RegistrationFormData, 
} from "../membershippages/types";

const Register = () => {
  const [activeTab, setActiveTab] = useState<"individual" | "organization">("individual");
  
  const [formData, setFormData] = useState<RegistrationFormData>({
    // Individual fields
    membershipClass: "",
    firstName: "",
    lastName: "",
    mobileNumber: "",
    emailAddress: "",
    physicalAddress: "",
    country: "Kenya",
    county: "Baringo",
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
    organizationCounty: "Baringo",
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

  const handleCountryChange = (selected: CountryOption | null, field: 'country' | 'organizationCountry') => {
    if (selected) {
      setFormData({...formData, [field]: selected.value});
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Handle form submission logic here
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
                    <span className="text-blue-600 hover:underline cursor-pointer">
                      Terms and Conditions
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-yellow-500 hover:bg-green-600 text-black font-bold py-3 px-6 rounded-md transition-colors duration-300"
                >
                  SIGNUP & PAY
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
    </div>
  );
};

export default Register;