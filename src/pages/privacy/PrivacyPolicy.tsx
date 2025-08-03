import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-6">Privacy Policy</h1>
          <p className="text-xl md:text-2xl text-gray-700 font-light max-w-3xl mx-auto">
            How we collect, use, and protect your personal information
          </p>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
            ACNA Privacy Commitment
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
              The African Child Neurology Association ("ACNA", "we", "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you visit our website, become a member, or use our services.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h3>
            <h4 className="text-xl font-semibold mb-2">2.1 Personal Information</h4>
            <p className="mb-4">
              We may collect personal information including:
              <ul className="list-disc pl-6 mt-2">
                <li>Contact details (name, email, phone, address)</li>
                <li>Professional information (qualifications, specialty, institution)</li>
                <li>Payment information for membership fees</li>
                <li>Event registration details</li>
                <li>Communication preferences</li>
              </ul>
            </p>
            
            <h4 className="text-xl font-semibold mb-2">2.2 Automatic Data Collection</h4>
            <p className="mb-6">
              We automatically collect certain information when you visit our website, including IP address, browser type, operating system, and usage data through cookies and similar technologies.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h3>
            <p className="mb-6">
              We use your information to:
              <ul className="list-disc pl-6 mt-2">
                <li>Process memberships and provide member services</li>
                <li>Communicate about ACNA activities and events</li>
                <li>Improve our website and services</li>
                <li>Conduct research and analysis to advance pediatric neurology</li>
                <li>Comply with legal obligations</li>
                <li>Protect against fraudulent or unauthorized activity</li>
              </ul>
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">4. Information Sharing</h3>
            <h4 className="text-xl font-semibold mb-2">4.1 With Third Parties</h4>
            <p className="mb-4">
              We may share information with:
              <ul className="list-disc pl-6 mt-2">
                <li>Service providers who assist with operations (payment processors, IT services)</li>
                <li>Research partners (in anonymized form)</li>
                <li>Other members through our professional directories (with consent)</li>
                <li>Legal authorities when required by law</li>
              </ul>
            </p>
            
            <h4 className="text-xl font-semibold mb-2">4.2 International Transfers</h4>
            <p className="mb-6">
              As an international organization, your information may be transferred to and processed in countries outside your residence. We implement appropriate safeguards for such transfers.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">5. Data Security</h3>
            <p className="mb-6">
              We implement technical and organizational measures to protect your personal information, including encryption, access controls, and regular security assessments. However, no system is completely secure, and we cannot guarantee absolute security.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">6. Your Rights</h3>
            <p className="mb-6">
              Depending on your jurisdiction, you may have rights to:
              <ul className="list-disc pl-6 mt-2">
                <li>Access, correct, or delete your personal information</li>
                <li>Restrict or object to processing</li>
                <li>Data portability</li>
                <li>Withdraw consent (where applicable)</li>
                <li>Lodge complaints with data protection authorities</li>
              </ul>
              To exercise these rights, contact us at privacy@acna-africa.org.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">7. Retention Period</h3>
            <p className="mb-6">
              We retain personal information only as long as necessary for the purposes outlined in this policy, unless a longer retention period is required by law. Member data is typically retained for 5 years after membership lapses for historical and reactivation purposes.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">8. Children's Privacy</h3>
            <p className="mb-6">
              Our services are directed to healthcare professionals and not intended for children under 16. We do not knowingly collect personal information from children without parental consent.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">9. Changes to This Policy</h3>
            <p className="mb-6">
              We may update this Privacy Policy periodically. We will notify members of significant changes through email or our website. Your continued use of our services constitutes acceptance of the updated policy.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">10. Contact Us</h3>
            <p className="mb-6">
              For questions about this Privacy Policy or our data practices:
              <br />
              <span className="font-medium">African Child Neurology Association</span>
              <br />
              Data Protection Officer
              <br />
              Email: privacy@acna-africa.org
              <br />
              Phone: +254 700 000000
              <br />
              Address: [ACNA Headquarters Address]
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
              <h3 className="text-xl font-bold text-gray-900 mb-2">Terms and Conditions</h3>
              <p className="text-gray-600 mb-4">Our general terms of service and membership</p>
              <a href="/terms-and-conditions" className="text-orange-600 font-medium hover:underline">
                View Terms →
              </a>
            </div>
            
            <div className="bg-blue-50 rounded p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Cookie Policy</h3>
              <p className="text-gray-600 mb-4">How we use cookies and tracking technologies</p>
              <a href="/cookie-policy" className="text-orange-600 font-medium hover:underline">
                Learn More →
              </a>
            </div>
            
            <div className="bg-blue-50 rounded p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Donor Privacy Policy</h3>
              <p className="text-gray-600 mb-4">Our commitment to protecting the privacy of our donors</p>
              <a href="/membership-faqs" className="text-orange-600 font-medium hover:underline">
                Donor Privacy Policy →
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;