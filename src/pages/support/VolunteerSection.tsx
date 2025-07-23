import React from 'react';
import { Link } from 'react-router-dom';
import Volunteer from "../../assets/Volunteer.jpg"

const VolunteerSection = () => {
  return (
    <section className="py-20 bg-orange-600">
      <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center">
        
        {/* Left Content */}
        <div className="lg:w-1/2 text-left text-white px-6 lg:px-20">
          <div className="h-0.5 w-16 bg-white mb-8"></div>
          <h2 className="text-5xl font-serif font-light mb-6">Volunteer</h2>
          <p className="text-lg leading-relaxed text-white mb-10 max-w-md">
            Explore our many volunteer opportunities and become part of our mission.
          </p>
          <Link
            to="/volunteer"
           className="border-2 border-white text-white px-8 py-3 text-sm font-bold tracking-wider hover:bg-white hover:text-[#B45525] transition-all duration-300">
            VOLUNTEER NOW
          </Link>
        </div>
        
        {/* Right Image with yellow border */}
        <div className="lg:w-1/2 mt-12 lg:mt-0 relative px-8">
          <div className="border-4 border-yellow-400 relative">
            <img
              src={Volunteer}
              alt="Volunteers"
              className="w-full h-80 object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default VolunteerSection;