import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Home from "./pages/homepage/Home";
import About from "./pages/about/About";
import Events from "./pages/eventsandnews/Events";
import News from "./pages/eventsandnews/News";
import Awards from "./pages/eventsandnews/AwardsAndRecognition";
import Login from "./pages/membershippages/portal/Login";
import Donate from "./pages/donationpage/Donate";
import Gallery from "./pages/eventsandnews/Gallery";
import Contact from "./pages/support/ContactUs";
import GetInvolved from "./pages/support/GetInvolved";
import Careers from "./pages/careers/Careers";
import VolunteerInfoSection from "./pages/support/VolunteerInfoSection";
import WhatWeDo from "./pages/about/WhatWeDo";
import HowWeWork from "./pages/about/HowWeWork";
import OurStory from "./pages/about/OurStory";
import LeadershipTeam from "./pages/about/LeadershipTeam";
import Register from "./pages/membershippages/MembershipApplication";
import Categories from "./pages/membershippages/MembershipCategories";
import MembershipFAQs from "./pages/membershippages/MembershipFAQs";
import MembershipRenew from "./pages/membershippages/MembershipRenewal";
import MembershipUpgrade from "./pages/membershippages/MembershipUpgrade";
import MembershipDirectory from "./pages/membershippages/MembershipDirectory";
import ProfessionalNetwork from "./pages/homepage/keyfeaturespages/ProfessionalNetwork";
import ResearchPublications from "./pages/homepage/keyfeaturespages/ResearchPublications";
import EventsTraining from "./pages/homepage/keyfeaturespages/EventsTraining";
import RecognitionAwards from "./pages/homepage/keyfeaturespages/RecognitionAwards";
import AnnualConferenceAndMeetings from "./pages/eventsandnews/AnnualConferenceAndMeetings";
import CallForAbstracts from "./pages/eventsandnews/CallforAbstracts";
import ResearchPapersPage from "./pages/education/ResearchPapersPublications";
import TrainingPrograms from "./pages/education/TrainingPrograms";
import ACNAMemberDashboard from "./pages/membershippages/portal/ACNAMemberDashboard";
import NoLayout from "./components/layout/NoLayout";
import CultureAndValues from "./pages/careers/CultureValues";
import Benefits from "./pages/careers/Benefits";
import FactSheetsAndCaseStudies from "./pages/education/FactSheetsandCaseStudies";
import PositionStatements from "./pages/education/PositionStatements";
import PatientCaregiverResources from "./pages/education/PatientandCaregiverResources";
import PolicyBriefs from "./pages/education/PolicyBriefs";
import JournalWatch from "./pages/education/JournalWatch";
import EBooklets from "./pages/education/EBooklets";
import Webinars from "./pages/education/Webinars";
import WorkshopsSymposiums from "./pages/education/WorkshopsandSymposiums";
import GeneralACNAFAQs from "./pages/about/ACNAFAQs";
import TermsAndConditions from "./pages/privacy/TermsAndConditions";
import PrivacyPolicy from "./pages/privacy/PrivacyPolicy";
import CookiePolicy from "./pages/privacy/CookiePolicy";
import DonorPrivacyPolicy from "./pages/privacy/DonorPrivacyPolicy";
import ForumGuidelines from "./pages/membershippages/portal/forums/ForumGuidelines";
import ForumComponent from "./pages/membershippages/portal/forums/ForumThread";
import ForumThread from "./pages/membershippages/portal/forums/ForumThread";
import PostReply from "./pages/membershippages/portal/forums/PostReply";
import VerificationPage from "./pages/membershippages/register/VerificationPage";
import PaymentPage from "./pages/payment/PaymentPage";
import PaymentSuccess from "./pages/payment/payment-success";
import PaymentCanceled from "./pages/payment/PaymentCanceled";

//Layout component that includes header and footer
const Layout = ({ children }: { children: React.ReactNode }) => (
  <>
    <Header />
    <main className="flex-1">{children}</main>
    <Footer />
  </>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Routes with standard layout (header + footer) */}
        <Route
          element={
            <Layout>
              <Outlet />
            </Layout>
          }
        >
          <Route path="/" element={<Home />} />
          <Route path="/donate" element={<Donate />} />
          {/* About Pages */}
          <Route path="/about" element={<About />} />
          <Route path="/about/what-we-do" element={<WhatWeDo />} />
          <Route path="/about/how-we-work" element={<HowWeWork />} />
          <Route path="/about/our-story" element={<OurStory />} />
          <Route path="/about/leadership" element={<LeadershipTeam />} />
          <Route path="faqs" element={<GeneralACNAFAQs />} />
          {/* Key Features Pages */}
          <Route
            path="/professional-network"
            element={<ProfessionalNetwork />}
          />
          <Route
            path="/research-publications"
            element={<ResearchPublications />}
          />
          <Route path="/events-training" element={<EventsTraining />} />
          <Route path="/recogination-awards" element={<RecognitionAwards />} />
          {/* Support Pages */}
          <Route path="/get-involved" element={<GetInvolved />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/careers/culture" element={<CultureAndValues />} />
          <Route path="/careers/benefits" element={<Benefits />} />
          <Route path="/volunteer" element={<VolunteerInfoSection />} />
          {/* Education Pages */}
          <Route
            path="/research-papers-and-publications"
            element={<ResearchPapersPage />}
          />
          <Route path="/training-programs" element={<TrainingPrograms />} />
          <Route path="/e-resources" element={<Register />} />
          <Route path="/neurology-resources" element={<Register />} />
          <Route path="/acna-portal" element={<Register />} />
          <Route
            path="/case-studies-and-fact-sheets"
            element={<FactSheetsAndCaseStudies />}
          />
          <Route path="/position-statement" element={<PositionStatements />} />
          <Route
            path="/patient-caregiver-resources"
            element={<PatientCaregiverResources />}
          />
          <Route path="/policy-briefs" element={<PolicyBriefs />} />
          <Route path="/journal-watch" element={<JournalWatch />} />
          <Route path="/e-booklets" element={<EBooklets />} />
          <Route path="/webinars" element={<Webinars />} />
          <Route
            path="/collaboration-opportunities"
            element={<WorkshopsSymposiums />}
          />
          {/* Membership Pages */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/membership-categories" element={<Categories />} />
          <Route path="/membership-application" element={<Register />} />
          <Route path="/membership-renewal" element={<MembershipRenew />} />
          <Route path="/membership-upgrade" element={<MembershipUpgrade />} />
          <Route
            path="/membership-directory"
            element={<MembershipDirectory />}
          />
          <Route path="/membership-faqs" element={<MembershipFAQs />} />
          {/* Privacy Pages */}
          <Route
            path="/terms-and-conditions"
            element={<TermsAndConditions />}
          />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
          <Route
            path="/donor-privacy-policy"
            element={<DonorPrivacyPolicy />}
          />
          {/* Events Pages */}
          <Route
            path="/annual-conference"
            element={<AnnualConferenceAndMeetings />}
          />
          <Route path="/call-for-abstracts" element={<CallForAbstracts />} />
          <Route path="/news" element={<News />} />
          <Route path="/awards" element={<Awards />} />
          <Route path="/events" element={<Events />} />
          <Route path="/gallery" element={<Gallery />} />
        </Route>

        {/* Route without layout (no header/footer) */}
        <Route
          element={
            <NoLayout>
              <Outlet />
            </NoLayout>
          }
        >
          <Route path="/memberportal" element={<ACNAMemberDashboard />} />
          {/* Forum Pages */}
          <Route path="/forum" element={<ForumComponent />} />        
          <Route path="/forum/:forumId" element={<ForumThread />} />
          <Route path="/forum/:forumId/post/:postId" element={<PostReply />} />
          <Route path="forum-guidelines" element={<ForumGuidelines />} />
          {/* Payment Pages */}
          <Route path="/verification" element={<VerificationPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-canceled" element={<PaymentCanceled />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
