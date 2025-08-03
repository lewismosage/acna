import React from 'react';
import ScrollToTop from '../../components/common/ScrollToTop';

const TermsAndConditions = () => {
  return (
    <div className="bg-white">
      <ScrollToTop />
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-6">Terms and Conditions</h1>
          <p className="text-xl md:text-2xl text-gray-700 font-light max-w-3xl mx-auto">
            Please read these terms carefully before using our services or becoming a member.
          </p>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
            ACNA Terms of Service
          </h2>
          <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
          <p className="text-lg text-gray-700 leading-relaxed">
            Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="prose prose-lg text-gray-700">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h3>
            <p className="mb-6">
              Welcome to the African Child Neurology Association ("ACNA", "we", "our", or "us"). These Terms and Conditions ("Terms") govern your use of our website, services, and membership programs. By accessing or using our services, you agree to be bound by these Terms.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">2. Membership</h3>
            <h4 className="text-xl font-semibold mb-2">2.1 Eligibility</h4>
            <p className="mb-4">
              Membership is open to qualified healthcare professionals, students, institutions, and organizations that support our mission. You must provide accurate information during registration and maintain the confidentiality of your account credentials.
            </p>
            
            <h4 className="text-xl font-semibold mb-2">2.2 Membership Types</h4>
            <p className="mb-4">
              ACNA offers several membership categories with varying benefits and obligations. Membership fees are non-refundable except as required by law or at our discretion.
            </p>

            <h4 className="text-xl font-semibold mb-2">2.3 Conduct</h4>
            <p className="mb-6">
              Members must adhere to professional ethical standards. ACNA reserves the right to suspend or terminate membership for conduct we determine to be harmful to our mission or community.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">3. Intellectual Property</h3>
            <p className="mb-6">
              All content on our platforms, including text, graphics, logos, and software, is our property or licensed to us and protected by intellectual property laws. Members may use resources for personal, non-commercial purposes only.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">4. Privacy</h3>
            <p className="mb-6">
              Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your personal information. By using our services, you consent to such processing.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">5. Events and Programs</h3>
            <h4 className="text-xl font-semibold mb-2">5.1 Registration</h4>
            <p className="mb-4">
              Event registration may require additional fees. Cancellation policies vary by event and will be communicated during registration.
            </p>
            
            <h4 className="text-xl font-semibold mb-2">5.2 Conduct</h4>
            <p className="mb-6">
              Participants must adhere to our Code of Conduct during events. We reserve the right to remove attendees who violate these standards without refund.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">6. Disclaimer of Warranties</h3>
            <p className="mb-6">
              Our services are provided "as is" without warranties of any kind. ACNA does not guarantee the accuracy of information provided through our platforms or by third parties.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">7. Limitation of Liability</h3>
            <p className="mb-6">
              To the fullest extent permitted by law, ACNA shall not be liable for any indirect, incidental, or consequential damages resulting from your use of our services.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">8. Modifications</h3>
            <p className="mb-6">
              We may modify these Terms at any time. Continued use of our services after changes constitutes acceptance of the new Terms. We will notify members of significant changes.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">9. Governing Law</h3>
            <p className="mb-6">
              These Terms shall be governed by the laws of Kenya, where ACNA is headquartered. Any disputes shall be resolved in the courts of Nairobi.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">10. Contact Information</h3>
            <p className="mb-6">
              For questions about these Terms, please contact us at:
              <br />
              <span className="font-medium">African Child Neurology Association</span>
              <br />
              Email: legal@acna-africa.org
              <br />
              Phone: +254 700 000000
            </p>
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-16 bg-orange-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">Related Policies</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-blue-50 rounded p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Privacy Policy</h3>
              <p className="text-gray-600 mb-4">Learn how we collect and protect your personal information</p>
              <a href="/privacy-policy" className="text-orange-600 font-medium hover:underline">
                Read Policy →
              </a>
            </div>
            
            <div className="bg-blue-50 rounded p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Cookie Policy</h3>
              <p className="text-gray-600 mb-4">How we use cookies and similar technologies on our website</p>
              <a href="/code-of-conduct" className="text-orange-600 font-medium hover:underline">
                View Cookie Policy →
              </a>
            </div>
            
            <div className="bg-blue-50 rounded p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Donor Privacy Policy</h3>
              <p className="text-gray-600 mb-4">Our commitment to protecting the privacy of our donors</p>
              <a href="/membership-policy" className="text-orange-600 font-medium hover:underline">
                Donor Privacy Policy →
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TermsAndConditions;