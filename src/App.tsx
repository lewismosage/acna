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


function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/membership" element={<Membership />} />
            <Route path="/events" element={<Events />} />
            <Route path="/news" element={<News />} />
            <Route path="/awards" element={<Awards />} />
            <Route path="/donate" element={<Donate />} />
            {/*Support Pages*/}
            <Route path="/get-involved" element={<GetInvolved />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/careers" element={<Careers />} />
            {/*Education Pages*/}
            <Route path="/news" element={<News />} />
            <Route path="/e-resources" element={<Membership />} />
            <Route path="/neurology-resources" element={<Membership />} />
            <Route path="/acna-portal" element={<Membership />} />    
            {/*Membership Pages*/}
            <Route path="/login" element={<Login />} />
            <Route path="/membership-benefits" element={<Membership />} />
            <Route path="/membership-categories" element={<Membership />} />
            <Route path="/membership-fees" element={<Membership />} />
            <Route path="/membership-application" element={<Membership />} />
            <Route path="/membership-renewal" element={<Membership />} />
            <Route path="/membership-upgrade" element={<Membership />} />
            <Route path="/membership-directory" element={<Membership />} />
            <Route path="/membership-faqs" element={<Membership />} />
            {/*Events Pages*/}
            <Route path="/upcoming-events" element={<Events />} />
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