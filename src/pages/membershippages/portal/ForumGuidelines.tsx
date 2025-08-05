import React from 'react';
import { useNavigate } from 'react-router-dom';

const ForumGuidelines = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50 relative">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <button 
            onClick={() => navigate(-1)}
            className="absolute left-4 top-6 md:left-10 md:top-10 flex items-center text-blue-700 hover:text-blue-900 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-6">Forum Guidelines</h1>
          <p className="text-xl md:text-2xl text-gray-700 font-light max-w-3xl mx-auto">
            Creating a welcoming, respectful community for child neurology professionals across Africa
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="space-y-8 text-gray-700 leading-relaxed">
            <h2 className="text-3xl font-light text-gray-900 mb-4">ACNA Code of Conduct</h2>
            
            <p>
              The ACNA forum brings together child neurology professionals from across Africa and beyond, representing diverse backgrounds, religions, and cultural norms. This diversity strengthens our community but also requires thoughtful communication.
            </p>
            
            <p>
              Our Code of Conduct ensures the ACNA forum remains a welcoming, professional space for all members - regardless of their color, religion, national origin, sex, age, sexual orientation, gender identity or expression, personal appearance, political affiliation, marital status, family responsibilities/parenthood, veteran status, education, disability, genetic information, or any other legally protected class.
            </p>
            
            <p>
              These guidelines were developed in consultation with ACNA members to represent our diverse community. They reflect the ethics and values of ACNA as a professional medical association. The code will be reviewed annually by the ACNA leadership committee.
            </p>
            
            <p>
              This is not an exhaustive list but serves as a guide for professional interactions on our platform. The ACNA moderation team reserves final judgment on acceptable behavior.
            </p>

            <h3 className="text-2xl font-light text-gray-900 mt-8 mb-4">ACNA Forum Guidelines</h3>
            
            <p>
              This Code of Conduct applies to all forum posts and private messages on the ACNA platform. We expect all activity to follow these guidelines. Violations may result in content removal or account restrictions.
            </p>
            
            <p>
              While ACNA administrators may provide information within the forum, we cannot respond to every post. Peer responses, while valuable, do not represent official ACNA communications.
            </p>
            
            <p>
              You retain rights to content you post, but by posting you grant ACNA a perpetual, worldwide license to use your content within the association's activities. ACNA will request permission before using your name or image alongside any content.
            </p>
            
            <p>
              Forum content is visible to all ACNA members. If you delete your account, your posts will be anonymized.
            </p>

            <h3 className="text-2xl font-light text-gray-900 mt-8 mb-4">Member Responsibilities</h3>
            
            <p>
              As ACNA members, we all share responsibility for maintaining our professional community:
            </p>
            
            <ul className="list-disc pl-6 space-y-2">
              <li>Contribute to a professional, supportive learning environment</li>
              <li>Show respect to all members and their perspectives</li>
              <li>Abide by all ACNA policies and guidelines</li>
              <li>Respond professionally to direction from moderators</li>
              <li>Maintain behavior free from harassment and discrimination</li>
              <li>Ask questions when clarification is needed</li>
              <li>Accept responsibility for your actions</li>
            </ul>

            <h3 className="text-2xl font-light text-gray-900 mt-8 mb-4">Inappropriate Behavior</h3>
            
            <p>
              To maintain our professional standards, the following behaviors are unacceptable:
            </p>
            
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Dangerous speech:</strong> Any expression that could incite violence against groups</li>
              <li><strong>Harassment:</strong> Offensive comments related to personal characteristics</li>
              <li><strong>Threats:</strong> Violence or threats of violence, including doxxing</li>
              <li><strong>Discriminatory language:</strong> Sexist, racist, homophobic, transphobic, or ableist remarks</li>
              <li><strong>Sexual misconduct:</strong> Unwelcome sexual attention or creating a sexualized environment</li>
              <li><strong>Disruption:</strong> Sustained disruption of discussions or events</li>
              <li><strong>Retaliation:</strong> Punishing members for raising concerns</li>
            </ul>

            <h3 className="text-2xl font-light text-gray-900 mt-8 mb-4">Community Guidelines</h3>
            
            <h4 className="text-xl font-medium mt-6 mb-2">Respect</h4>
            <p>
              Remember that text communication lacks context, especially when participants use non-native languages. Strive for clarity and professionalism.
            </p>
            
            <h4 className="text-xl font-medium mt-6 mb-2">Sensitivity</h4>
            <p>
              Our discussions often involve complex medical and ethical topics. Maintain academic, respectful dialogue open to diverse perspectives.
            </p>
            
            <h4 className="text-xl font-medium mt-6 mb-2">Constructive Feedback</h4>
            <p>
              We welcome professional feedback to improve our community. Focus on constructive criticism of ideas, not individuals.
            </p>
            
            <h4 className="text-xl font-medium mt-6 mb-2">Privacy</h4>
            <p>
              Protect patient confidentiality and your personal information. Never share identifiable patient details or your private contact information.
            </p>

            <h3 className="text-2xl font-light text-gray-900 mt-8 mb-4">Consequences</h3>
            
            <p>
              ACNA reserves the right to take appropriate action for violations. Potential responses include:
            </p>
            
            <ul className="list-disc pl-6 space-y-2">
              <li>Warning for first-time minor violations</li>
              <li>Temporary suspension for repeated or serious violations</li>
              <li>Permanent removal for severe or persistent misconduct</li>
              <li>Content removal or editing</li>
              <li>Restricted access to certain forum areas</li>
            </ul>

            <h3 className="text-2xl font-light text-gray-900 mt-8 mb-4">Reporting</h3>
            
            <p>
              To report violations, contact ACNA moderators with:
            </p>
            
            <ul className="list-disc pl-6 space-y-2">
              <li>Link to the problematic content</li>
              <li>Screenshot of the violation</li>
              <li>Username of the member involved</li>
            </ul>
            
            <p className="mt-6">
              ACNA will maintain confidentiality during investigations while working toward fair resolutions.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ForumGuidelines;