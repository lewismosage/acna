// pages/Home.tsx
import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Play } from "lucide-react";
import heroVideo from "../../assets/hero.video.mp4";
import pediatricVisit from "../../assets/pediatric-visit.jpg";
import LatestNews from "./LatestNews";
import KeyFeatures from "./KeyFeatures";

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <video
          className="absolute inset-0 w-full h-full object-cover z-0"
          src={heroVideo}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        />
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 via-blue-800/40 to-transparent z-10" />
        {/* Hero Content */}
        <div className="relative z-20 w-full flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-6 drop-shadow-lg">
            Advancing Child <span className="text-yellow-300">Neurology</span>{" "}
            Across Africa
          </h1>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed drop-shadow max-w-2xl mx-auto">
            Join the Africa Child Neurology Association and be part of a
            pan-African community dedicated to improving neurological care for
            children across the continent.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center">
            <Link
              to="#"
              className="inline-flex items-center justify-center bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all duration-200 transform hover:scale-105"
            >
              Join ACNA Today
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center justify-center border-2 border-yellow-300 text-yellow-300 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-300 hover:text-blue-900 transition-all duration-200"
            >
              Explore Our Work
              <Play className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Impact Across Africa
            </h2>
            <p className="text-xl text-gray-600">
              Key statistics highlighting our reach and the need for child
              neurology care
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">300+</div>
              <div className="text-gray-600">Medical Professionals</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">25+</div>
              <div className="text-gray-600">Countries Represented</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">19.2</div>
              <div className="text-gray-600">Median Age in Africa (Years)</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">15.4M</div>
              <div className="text-gray-600">Children with Epilepsy</div>
            </div>
          </div>
          
          <div className="mt-12 bg-gray-50 p-8 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-red-600 mb-2">
                  0.8-10 per 1000
                </div>
                <div className="text-gray-600">
                  Children have Cerebral Palsy
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  Growing Need
                </div>
                <div className="text-gray-600">
                  For specialized neurological care across Africa
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Component */}
      <KeyFeatures />

      {/* Latest News Component */}
      <LatestNews />

      {/* CTA Section */}
      <section className="w-full min-h-[400px] flex flex-col lg:flex-row items-stretch">
        {/* Left: Image */}
        <div className="flex-1 min-h-[400px] bg-black flex items-center justify-center">
          <img
            src={pediatricVisit} 
            alt="Pediatric visit"
            className="w-full h-full object-cover object-left"
            style={{ maxHeight: "500px" }}
          />
        </div>
        {/* Right: Orange content */}
        <div className="flex-1 bg-orange-700 flex items-center justify-center p-12">
          <div className="max-w-md mx-auto text-left">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
              Together we can create a better world for every child
            </h2>
            <p className="text-base md:text-lg text-orange-100 mb-6">
              Even the smallest actions can add up to a big difference. Let's
              work together to protect every child's health and future.
            </p>
            <Link
              to="/join"
              className="inline-block bg-white text-orange-700 px-6 py-2 rounded font-semibold shadow hover:bg-orange-50 transition-colors duration-200"
            >
              Join us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
