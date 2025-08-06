import React from 'react';

const CookiePolicy = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-6">Cookie Policy</h1>
          <p className="text-xl md:text-2xl text-gray-700 font-light max-w-3xl mx-auto">
            How we use cookies and similar technologies on our website
          </p>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
            ACNA Cookie Usage
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
            <h3 className="text-2xl font-bold text-gray-900 mb-4">1. What Are Cookies?</h3>
            <p className="mb-6">
              Cookies are small text files placed on your device when you visit websites. They help the site remember information about your visit, which can make it easier to visit again and make the site more useful to you.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Cookies</h3>
            <p className="mb-6">
              ACNA uses cookies and similar tracking technologies to:
              <ul className="list-disc pl-6 mt-2">
                <li>Enable essential website functionality</li>
                <li>Remember your preferences</li>
                <li>Analyze how our site is used to improve performance</li>
                <li>Support our marketing and communication efforts</li>
                <li>Personalize content for members</li>
              </ul>
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">3. Types of Cookies We Use</h3>
            <h4 className="text-xl font-semibold mb-2">3.1 Strictly Necessary Cookies</h4>
            <p className="mb-4">
              These are essential for the website to function properly and cannot be switched off. They are usually set in response to actions you take such as logging in or filling forms.
            </p>
            
            <h4 className="text-xl font-semibold mb-2">3.2 Performance Cookies</h4>
            <p className="mb-4">
              These help us understand how visitors interact with our website by collecting and reporting information anonymously. They help us improve how the website works.
            </p>

            <h4 className="text-xl font-semibold mb-2">3.3 Functional Cookies</h4>
            <p className="mb-4">
              These enable the website to provide enhanced functionality and personalization for members. They may be set by us or by third-party providers whose services we use.
            </p>

            <h4 className="text-xl font-semibold mb-2">3.4 Targeting Cookies</h4>
            <p className="mb-6">
              These cookies may be set through our site by our advertising partners to build a profile of your interests and show you relevant content on other sites.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">4. Third-Party Cookies</h3>
            <p className="mb-6">
              We use some third-party services that may set cookies, including:
              <ul className="list-disc pl-6 mt-2">
                <li>Google Analytics for website analytics</li>
                <li>Payment processors for membership transactions</li>
                <li>Social media platforms for sharing content</li>
                <li>Event registration platforms</li>
              </ul>
              These third parties have their own privacy policies.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">5. Managing Cookies</h3>
            <p className="mb-6">
              You can control and/or delete cookies as you wish. Most web browsers allow some control through browser settings. You can:
              <ul className="list-disc pl-6 mt-2">
                <li>Delete all cookies from your browser</li>
                <li>Block all cookies from being set</li>
                <li>Set preferences for certain websites</li>
              </ul>
              Note that blocking all cookies may affect your ability to use some features of our website.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">6. Cookie Consent</h3>
            <p className="mb-6">
              When you first visit our website, we ask for your consent to use non-essential cookies. You can change your cookie preferences at any time through our <a href="#cookie-settings" className="text-orange-600 hover:underline">Cookie Settings</a> tool.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">7. Changes to This Policy</h3>
            <p className="mb-6">
              We may update this Cookie Policy from time to time. We will notify you of any significant changes through our website or member communications.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">8. Contact Us</h3>
            <p className="mb-6">
              For questions about our use of cookies:
              <br />
              <span className="font-medium">African Child Neurology Association</span>
              <br />
              Email: privacy@acna-africa.org
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
              <p className="text-gray-600 mb-4">How we collect and protect your personal information</p>
              <a href="/privacy-policy" className="text-orange-600 font-medium hover:underline">
                Read Policy →
              </a>
            </div>
            
            <div className="bg-blue-50 rounded p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Terms and Conditions</h3>
              <p className="text-gray-600 mb-4">Our general terms of service</p>
              <a href="/terms-and-conditions" className="text-orange-600 font-medium hover:underline">
                View Terms →
              </a>
            </div>
            
            <div className="bg-blue-50 rounded p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Donor Privacy Policy</h3>
              <p className="text-gray-600 mb-4">Our commitment to protecting the privacy of our donors</p>
              <a href="/donor-privacy-policy" className="text-orange-600 font-medium hover:underline">
                Donor Privacy Policy →
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CookiePolicy;