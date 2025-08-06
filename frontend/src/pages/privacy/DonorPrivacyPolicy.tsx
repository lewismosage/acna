import React from 'react';

const DonorPrivacyPolicy = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-6">Donor Privacy Policy</h1>
          <p className="text-xl md:text-2xl text-gray-700 font-light max-w-3xl mx-auto">
            Our commitment to protecting the privacy of our donors
          </p>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
            ACNA Donor Privacy Commitment
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
            <h3 className="text-2xl font-bold text-gray-900 mb-4">1. Our Commitment</h3>
            <p className="mb-6">
              The African Child Neurology Association (ACNA) values and respects the privacy of our donors. We are committed to protecting the personal information you share with us through donations, and to using your contributions responsibly to advance pediatric neurology care across Africa.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h3>
            <p className="mb-6">
              When you make a donation, we may collect:
              <ul className="list-disc pl-6 mt-2">
                <li>Contact information (name, email, address, phone)</li>
                <li>Payment information (processed securely by our payment partners)</li>
                <li>Donation amount and frequency</li>
                <li>Communication preferences</li>
                <li>Tax deduction information where applicable</li>
                <li>Employer information for matching gift programs</li>
              </ul>
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Donor Information</h3>
            <p className="mb-6">
              We use donor information to:
              <ul className="list-disc pl-6 mt-2">
                <li>Process donations and provide receipts</li>
                <li>Communicate about ACNA's work and impact</li>
                <li>Recognize contributions (unless you prefer anonymity)</li>
                <li>Improve our fundraising strategies</li>
                <li>Comply with legal reporting requirements</li>
                <li>Facilitate recurring donations when authorized</li>
              </ul>
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">4. Donor Recognition & Anonymity</h3>
            <p className="mb-6">
              We may list donor names in annual reports and other publications unless you request anonymity. You may:
              <ul className="list-disc pl-6 mt-2">
                <li>Request to remain anonymous in all publications</li>
                <li>Opt out of donor recognition communications</li>
                <li>Specify how your name should appear in acknowledgments</li>
              </ul>
              All requests for anonymity will be honored.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">5. Information Sharing</h3>
            <p className="mb-6">
              ACNA does not sell, trade, or rent donor information. We may share information with:
              <ul className="list-disc pl-6 mt-2">
                <li>Payment processors to complete transactions</li>
                <li>Service providers who assist with donor communications</li>
                <li>Government agencies when required by law</li>
                <li>Auditors for financial reporting</li>
              </ul>
              All third parties must comply with strict confidentiality agreements.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">6. Data Security</h3>
            <p className="mb-6">
              We implement industry-standard security measures to protect donor information, including:
              <ul className="list-disc pl-6 mt-2">
                <li>Secure servers with encryption</li>
                <li>Limited access to donor information</li>
                <li>Regular security audits</li>
                <li>PCI compliance for payment processing</li>
              </ul>
              Credit card information is processed securely and not stored on our servers.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">7. Your Choices</h3>
            <p className="mb-6">
              You have the right to:
              <ul className="list-disc pl-6 mt-2">
                <li>Request access to your donor records</li>
                <li>Correct inaccuracies in your information</li>
                <li>Opt out of fundraising communications</li>
                <li>Request deletion of your information (subject to legal requirements)</li>
                <li>Set preferences for how we contact you</li>
              </ul>
              To exercise these rights, contact us at donors@acna-africa.org.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">8. Retention of Donor Information</h3>
            <p className="mb-6">
              We retain donor information as long as necessary to:
              <ul className="list-disc pl-6 mt-2">
                <li>Maintain accurate financial records</li>
                <li>Comply with tax and audit requirements</li>
                <li>Honor your donation preferences</li>
                <li>Maintain historical records of support</li>
              </ul>
              Typically, we retain donor records for 7 years after the last donation.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">9. Changes to This Policy</h3>
            <p className="mb-6">
              We may update this Donor Privacy Policy periodically. Significant changes will be communicated to current donors through email or mail. The updated policy will always be available on our website.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">10. Contact Us</h3>
            <p className="mb-6">
              For questions about donor privacy:
              <br />
              <span className="font-medium">African Child Neurology Association</span>
              <br />
              Development Office
              <br />
              Email: donors@acna-africa.org
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
          <h2 className="text-3xl font-bold text-white mb-8">Related Information</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-blue-50 rounded p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Terms and Conditions</h3>
              <p className="text-gray-600 mb-4">Learn about donation options and planned giving</p>
              <a href="/terms-and-conditions" className="text-orange-600 font-medium hover:underline">
                Terms and Conditions →
              </a>
            </div>
            
            <div className="bg-blue-50 rounded p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Financial Reports</h3>
              <p className="text-gray-600 mb-4">View our annual reports and financial statements</p>
              <a href="/financial-reports" className="text-orange-600 font-medium hover:underline">
                View Reports →
              </a>
            </div>
            
            <div className="bg-blue-50 rounded p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">General Privacy Policy</h3>
              <p className="text-gray-600 mb-4">Our comprehensive privacy practices</p>
              <a href="/privacy-policy" className="text-orange-600 font-medium hover:underline">
                Read Policy →
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DonorPrivacyPolicy;