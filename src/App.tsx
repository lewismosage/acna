import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/homepage/Home';
import About from './pages/about/About';
import Membership from './pages/membershippages/Membership';
import Events from './pages/eventsandnews/Events';
import News from './pages/eventsandnews/News';
import Awards from './pages/eventsandnews/AwardsAndRecognition';
import Login from './pages/membershippages/Login'
import Donate from './pages/donationpage/Donate';
import Gallery from './pages/eventsandnews/Gallery';
import Contact from './pages/support/ContactUs';
import GetInvolved from './pages/support/GetInvolved';
import Careers from './pages/careers/Careers';
import VolunteerInfoSection from './pages/support/VolunteerInfoSection';
import WhatWeDo from './pages/about/WhatWeDo';
import HowWeWork from './pages/about/HowWeWork'
import OurStory from './pages/about/OurStory';
import LeadershipTeam from './pages/about/LeadershipTeam';
import Register from './pages/membershippages/Register';
import Categories from './pages/membershippages/CategoriesPage'
import MembershipFAQs from './pages/membershippages/MembershipFAQs';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Events />} />
            <Route path="/news" element={<News />} />
            <Route path="/awards" element={<Awards />} />
            <Route path="/donate" element={<Donate />} />
            {/*About Pages */}
            <Route path="/about" element={<About />} />
            <Route path="/about/what-we-do" element={<WhatWeDo />} />
            <Route path="/about/how-we-work" element={<HowWeWork/>} />
            <Route path="/about/our-story" element={<OurStory />} />
            <Route path="/about/leadership" element={<LeadershipTeam />} />
            {/*Support Pages*/}
            <Route path="/get-involved" element={<GetInvolved />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/volunteer" element={<VolunteerInfoSection />} />
            {/*Education Pages*/}
            <Route path="/news" element={<News />} />
            <Route path="/e-resources" element={<Membership />} />
            <Route path="/neurology-resources" element={<Membership />} />
            <Route path="/acna-portal" element={<Membership />} />    
            {/*Membership Pages*/}
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
           
            <Route path="/membership-categories" element={<Categories />} /> 
            <Route path="/membership-application" element={<Membership />} />
            <Route path="/membership-renewal" element={<Membership />} />
            <Route path="/membership-upgrade" element={<Membership />} />
            <Route path="/membership-directory" element={<Membership />} />
            <Route path="/membership-faqs" element={<MembershipFAQs />} />
            {/*Events Pages*/}
            <Route path="/events" element={<Events />} />
            <Route path="/past-events" element={<Events />} /> 
            <Route path="/gallery" element={<Gallery />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;