// pages/About.tsx
import React from "react";
import { Users, Target, Eye, Map, BookOpen, BarChart2 } from "lucide-react";
import ContinentalReach from "./ContinentalReach";
import Governance from "./Governance";
import LeadershipTeam from "./LeadershipTeam";
import CoreValues from "./CoreValues";
import Pediatrics from "../../assets/Pediatric-Doc.jpg";
import HappyDoctor from "../../assets/happy-female-doctor.jpg";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="bg-white">
      {/* Hero Section - Custom Layout */}
      <section className="relative bg-[#181617] text-white py-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-0 min-h-[480px]">
          {/* Left: Text */}
          <div className="flex-1 flex flex-col justify-center py-16 pr-0 lg:pr-12">
            <div className="max-w-lg">
              <div className="h-2 w-16 bg-red-600 mb-6" />
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-left">
                About Us
              </h1>
              <h2 className="text-lg md:text-xl font-bold mb-4 text-left">
                A continent-wide community shaping the future of child neurology
                in Africa.
              </h2>
              <p className="text-gray-200 text-left mb-0">
                The African Child Neurology Association (ACNA) unites pediatric
                neurologists, healthcare workers, researchers, and advocates
                from across Africa. Together, we are dedicated to improving
                neurological care for children through education, research, and
                advocacy.
              </p>
            </div>
          </div>
          {/* Center: Main Image with overlay */}
          <div className="flex-1 flex flex-col justify-center relative min-h-[400px]">
            <div className="relative h-full min-h-[400px] flex items-end">
              <img
                src={Pediatrics}
                alt="Pediatric neurologist with child patient"
                className="w-full h-[400px] object-cover object-center rounded-none"
              />
              <div className="absolute inset-0 bg-black/30 rounded-none" />
              <div className="absolute bottom-0 left-0 p-8">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white mb-6 max-w-xs">
                  Join a network dedicated to every child's neurological health
                </h2>
                <Link
                  to="/membership"
                  className="inline-block bg-blue-600 text-white px-8 py-3 rounded font-bold text-lg shadow hover:bg-blue-700 transition-colors duration-200"
                >
                  JOIN ACNA
                </Link>
              </div>
            </div>
          </div>
          {/* Right: Two stacked cards */}
          <div className="flex flex-col gap-4 flex-1 min-w-[260px] max-w-xs justify-center py-8">
            {/* Card 1 */}
            <div className="relative h-48 rounded-lg overflow-hidden flex items-end">
              <img
                src="https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&w=600"
                alt="Events"
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-black/40" />
              <div className="relative z-10 p-6 w-full">
                <h3 className="text-lg font-bold text-white mb-4">
                  See our latest events and news
                </h3>
                <Link
                  to="/events"
                  className="inline-block border-2 border-white text-white px-4 py-2 rounded font-semibold text-sm hover:bg-white hover:text-black transition-colors duration-200"
                >
                  VIEW EVENTS
                </Link>
              </div>
            </div>
            {/* Card 2 */}
            <div className="relative h-48 rounded-lg overflow-hidden flex items-end">
              <img
                src={HappyDoctor}
                alt="Get Involved"
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-black/40" />
              <div className="relative z-10 p-6 w-full">
                <h3 className="text-lg font-bold text-white mb-4">
                  Get involved with ACNA
                </h3>
                <Link
                  to="/get-involved"
                  className="inline-block border-2 border-white text-white px-4 py-2 rounded font-semibold text-sm hover:bg-white hover:text-black transition-colors duration-200"
                >
                  EXPLORE WHAT WE DO
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-16">
            <h2 className="text-base font-semibold tracking-wide text-blue-600 uppercase">
              Who We Are
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Our Purpose and Aspiration
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-xl border border-blue-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">
                  Our Mission
                </h2>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                To promote excellence in child neurology care across Africa
                through professional development, collaborative research, and
                advocacy for equitable access to neurological services for all
                children.
              </p>
              <div className="bg-white p-6 rounded-lg border border-blue-50">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Key Objectives
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                    <span className="text-gray-600">
                      Develop and implement Africa-specific clinical guidelines
                      and training programs
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                    <span className="text-gray-600">
                      Foster collaborative research addressing Africa's unique
                      neurological challenges
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                    <span className="text-gray-600">
                      Advocate for policies improving access to neurological
                      care
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-white p-8 rounded-xl border border-purple-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <Eye className="w-6 h-6 text-purple-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Our Vision</h2>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                An Africa where every child with neurological disorders receives
                timely, culturally appropriate, and evidence-based care
                regardless of geographic or socioeconomic barriers.
              </p>
              <div className="bg-white p-6 rounded-lg border border-purple-50">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Strategic Priorities (2023-2028)
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3"></div>
                    <span className="text-gray-600">
                      Establish regional centers of excellence across all
                      African subregions
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3"></div>
                    <span className="text-gray-600">
                      Double the number of trained child neurologists in Africa
                      by 2028
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3"></div>
                    <span className="text-gray-600">
                      Develop telemedicine networks to expand access to
                      specialist care
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3"></div>
                    <span className="text-gray-600">
                      Strengthen partnerships with ministries of health across
                      the continent
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <CoreValues />

      {/* Governance */}
      <Governance />

      {/* Leadership Team */}
      <LeadershipTeam />

      {/* Member Countries */}
      <ContinentalReach />
    </div>
  );
};

export default About;
