import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp, Linkedin } from "lucide-react";
import CareersHeroImg from "../../assets/happy-female-doctor.jpg";
import CareersCultureImg from "../../assets/medical-team-training.webp";
import CareersProgramsImg from "../../assets/how-we-work.jpg";
import NairobiHQ from "../../assets/Nairobi-HQ.webp"
import Abuja from "../../assets/Nigeria.jpg"

import Testimonials from "./Testimonials"

const Careers = () => {
  const [whyOpen, setWhyOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);
  const [lookForOpen, setLookForOpen] = useState([false, false]);

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
              Shape the Future of Child Health in Africa.
            </h1>
            <h4 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
              Every role at ACNA plays a part in transforming lives.
            </h4>
            <div className="flex items-center gap-4 mb-6">
              <Link
                to="#jobs"
                className="bg-orange-600 text-white px-6 py-2 rounded font-semibold hover:bg-orange-700 transition"
              >
                Search for jobs
              </Link>
              <a
                href="https://www.linkedin.com/company/acna-africa"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-gray-700 hover:text-blue-700 font-medium"
              >
                <Linkedin className="w-5 h-5 mr-1" />
                Follow us on LinkedIn
              </a>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <img
              src={CareersHeroImg}
              alt="ACNA Team"
              className="rounded shadow-lg w-full max-w-4xl object-cover"
            />
          </div>
        </div>
      </section>

      {/* Why Work Here Section */}
      <section className="py-8 bg-white">
        <div className="max-w-2xl mx-auto flex flex-col items-center">
          <button
            className="bg-gray-100 rounded-full px-8 py-3 font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2 focus:outline-none"
            onClick={() => setWhyOpen((v) => !v)}
          >
            Why work here? {whyOpen ? <ChevronUp /> : <ChevronDown />}
          </button>
          {whyOpen && (
            <div className="text-gray-700 text-center max-w-xl mb-4">
              <p>
                Creating a healthier future for Africa’s children starts with
                people like you. At ACNA, we harness the power of committed
                individuals from diverse professional backgrounds medicine,
                research, advocacy, communications, operations, and more united
                by one vision: improving neurological health and outcomes for
                children across Africa.
              </p>
              <p className="mt-2">
                Join a collaborative, mission-driven environment where your
                talents contribute to meaningful change. Whether you're helping
                streamline clinical initiatives, drive policy, amplify
                awareness, or support communities directly, your work at ACNA
                helps strengthen the systems that children and families depend
                on.
              </p>
              <p className="mt-2">
                We’re a growing, continent-wide network with opportunities to
                work on a wide range of impactful projects from childhood
                epilepsy care and neurodevelopment research to training programs
                and public engagement campaigns.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-8">
          {/* Left Nav Card */}
          <div className="bg-orange-600 text-white rounded p-8 w-full md:w-72 flex-shrink-0 mb-8 md:mb-0">
            <div className="mb-6">
              <span className="uppercase text-sm ">About</span>
              <h2 className="text-2xl font-extrabold mt-2 mb-4">CAREERS</h2>
            </div>
            <ul className="space-y-3">
              <li>
                <Link to="#culture" className="hover:underline">
                  Culture and values
                </Link>
              </li>
              <li>
                <Link to="#benefits" className="hover:underline">
                  Benefits
                </Link>
              </li>
              <li>
                <Link to="#programs" className="hover:underline">
                  Employee programs
                </Link>
              </li>
              <li>
                <Link to="#faq" className="hover:underline">
                  Careers FAQ
                </Link>
              </li>
            </ul>
          </div>
          {/* Right Content */}
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-4">Why work here?</h3>
            <p className="text-gray-700 mb-4">
              Put your skills to work in a dynamic, purpose-driven environment
              full of passionate collaborators. At ACNA, we bring together
              professionals from medical, scientific, academic, policy, and
              nonprofit backgrounds united by compassion, commitment, and a
              shared mission to improve neurological care and child health
              outcomes across Africa.
            </p>
            <p className="text-gray-700">
              Explore our current opportunities and discover how you can
              contribute to impactful work across a wide spectrum ranging from
              clinical research, public health education, and training, to
              advocacy, digital innovation, and operational support.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-8">
            <div>
              <h4 className="uppercase font-bold text-lg mb-2">
                OUR IMPACT, OUR PEOPLE
              </h4>
              <div className="flex flex-wrap gap-8 md:gap-16">
                <div>
                  <div className="text-3xl font-extrabold">1,250+</div>
                  <div className="text-sm">Staff & volunteers across Africa</div>
                </div>
                <div>
                  <div className="text-3xl font-extrabold">25+</div>
                  <div className="text-sm">Countries we operate in</div>
                </div>
                <div>
                  <div className="text-3xl font-extrabold">20</div>
                  <div className="text-sm">Regional and field offices</div>
                </div>
                <div>
                  <div className="text-3xl font-extrabold">500K+</div>
                  <div className="text-sm">Children reached annually</div>
                </div>
                <div>
                  <div className="text-3xl font-extrabold">96%</div>
                  <div className="text-sm">
                    Employees proud to be part of ACNA*
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-300 mt-2">
                * Based on internal employee engagement survey.
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* What we look for Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-6">What we look for</h2>
          <p className="text-gray-700 mb-8 max-w-2xl">
            Our employees come to us from many professional backgrounds from
            business and tech to academia, medicine, government, and nonprofits.
            They are drawn to our foundation by the opportunity to fund and
            shape pathbreaking approaches to alleviating poverty, disease, and
            inequity around the world. Many have never worked for a philanthropy
            before.
          </p>
          <div className="divide-y divide-gray-300 max-w-3xl">
            <div className="py-4 flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="font-semibold">
                We hire deep subject-matter experts as well as big-picture
                generalists.
              </div>
              <button
                className="flex items-center gap-2 text-orange-600 font-medium mt-2 md:mt-0"
                onClick={() =>
                  setLookForOpen([!lookForOpen[0], lookForOpen[1]])
                }
              >
                {lookForOpen[0] ? "Hide" : "Learn more"}{" "}
                {lookForOpen[0] ? <ChevronUp /> : <ChevronDown />}
              </button>
            </div>
            {lookForOpen[0] && (
              <div className="py-2 text-gray-700">
                We value people who understand the nuances of working with
                governments, multilateral organizations, corporations, public
                health agencies, universities, and other donors.
              </div>
            )}
            <div className="py-4 flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="font-semibold">
                Here are the typical steps in our hiring process.
              </div>
              <button
                className="flex items-center gap-2 text-orange-600 font-medium mt-2 md:mt-0"
                onClick={() =>
                  setLookForOpen([lookForOpen[0], !lookForOpen[1]])
                }
              >
                {lookForOpen[1] ? "Hide" : "Learn more"}{" "}
                {lookForOpen[1] ? <ChevronUp /> : <ChevronDown />}
              </button>
            </div>
            {lookForOpen[1] && (
              <div className="py-2 text-gray-700">
                Our hiring process allows us to understand your background and
                experience, as well as what interests you and inspires you about
                working here.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* View Job Opportunities CTA */}
      <section className="py-12 bg-blue-50 text-center">
        <h2 className="text-2xl md:text-3xl font-extrabold mb-4">
          VIEW JOB OPPORTUNITIES
        </h2>
        <p className="text-gray-700 mb-6">
          Join us in tackling some of the world's most urgent problems.
        </p>
        <Link
          to="#jobs"
          className="bg-orange-600 text-white px-6 py-2 rounded font-semibold hover:bg-orange-700 transition"
        >
          Search jobs
        </Link>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* Offices Section */}
      <section className="py-16 bg-gray-900  text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl text-yellow-400 font-bold mb-6">Our Presence Across Africa</h2>
          <p className="mb-12 max-w-2xl">
            We are proud to have a strong presence across Africa. Our teams collaborate with governments, local organizations, and communities to drive progress in health, education, agriculture, innovation, and inclusive economic growth.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {/* Nairobi Office */}
            <div className="group">
              <img
                src={NairobiHQ}
                alt="Nairobi Office"
                className="w-full h-48 object-cover rounded-lg mb-6 group-hover:opacity-90 transition-opacity"
              />
              <div className="font-bold text-yellow-400 text-xl mb-3">Nairobi, Kenya</div>
              <div className="text-gray-300 mb-4">
                Our Kenya office serves as a hub for East Africa, working with partners to enhance public health systems, improve agricultural outcomes, and promote youth employment and education initiatives.
              </div>
              <Link 
                to="#" 
                className="text-blue-300 hover:text-blue-200 transition-colors inline-flex items-center"
              >
                Learn more about our Kenya office
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Abuja Office */}
            <div className="group">
              <img
                src={Abuja}
                alt="Abuja Office"
                className="w-full h-48 object-cover rounded-lg mb-6 group-hover:opacity-90 transition-opacity"
              />
              <div className="font-bold text-yellow-400 text-xl mb-3">Abuja, Nigeria</div>
              <div className="text-gray-300 mb-4">
                Our Nigerian team works across sectors including maternal health, sanitation, digital innovation, and gender equality, partnering with communities and institutions to create sustainable impact.
              </div>
              <Link 
                to="#" 
                className="text-blue-300 hover:text-blue-200 transition-colors inline-flex items-center"
              >
                Learn more about our Nigeria office
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Addis Ababa Office */}
            <div className="group">
              <img
                src={CareersProgramsImg}
                alt="Addis Ababa Office"
                className="w-full h-48 object-cover rounded-lg mb-6 group-hover:opacity-90 transition-opacity"
              />
              <div className="font-bold text-yellow-400 text-xl mb-3">Addis Ababa, Ethiopia</div>
              <div className="text-gray-300 mb-4">
                Located near the African Union, our Ethiopia office helps foster regional collaboration and implements programs focused on nutrition, climate resilience, and economic development.
              </div>
              <Link 
                to="#" 
                className="text-blue-300 hover:text-blue-200 transition-colors inline-flex items-center"
              >
                Learn more about our Ethiopia office
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Dakar Office */}
            <div className="group">
              <img
                src={CareersHeroImg}
                alt="Dakar Office"
                className="w-full h-48 object-cover rounded-lg mb-6 group-hover:opacity-90 transition-opacity"
              />
              <div className="font-bold text-yellow-400 text-xl mb-3">Dakar, Senegal</div>
              <div className="text-gray-300 mb-4">
                Our Dakar team leads initiatives across Francophone West Africa, focusing on equitable education, early childhood development, and regional health systems strengthening.
              </div>
              <Link 
                to="#" 
                className="text-blue-300 hover:text-blue-200 transition-colors inline-flex items-center"
              >
                Learn more about our Senegal office
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Johannesburg Office */}
            <div className="group">
              <img
                src={CareersCultureImg}
                alt="Johannesburg Office"
                className="w-full h-48 object-cover rounded-lg mb-6 group-hover:opacity-90 transition-opacity"
              />
              <div className="font-bold text-yellow-400 text-xl mb-3">Johannesburg, South Africa</div>
              <div className="text-gray-300 mb-4">
                Our South Africa office focuses on inclusive economic growth, education, and innovation, working with national partners to drive policy reform and youth empowerment programs.
              </div>
              <Link 
                to="#" 
                className="text-blue-300 hover:text-blue-200 transition-colors inline-flex items-center"
              >
                Learn more about our South Africa office
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white text-center">
        <h2 className="text-2xl md:text-3xl font-extrabold mb-4">
          FREQUENTLY ASKED QUESTIONS
        </h2>
        <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
          Want to know more about joining the ACNA team? Our Careers FAQ answers
          questions about the application and interview process and more.
        </p>
        <button
          className="bg-orange-600 text-white px-6 py-2 rounded font-semibold hover:bg-orange-700 transition"
          onClick={() => setFaqOpen((v) => !v)}
        >
          View FAQ
        </button>
        {faqOpen && (
          <div className="mt-6 max-w-2xl mx-auto text-left bg-white rounded-xl shadow p-6">
            <h3 className="font-bold mb-2">
              How do I apply for a job at ACNA?
            </h3>
            <p className="mb-4">
              Visit our job portal and submit your application online. You can
              also sign up for job alerts to stay updated on new opportunities.
            </p>
            <h3 className="font-bold mb-2">
              What is the interview process like?
            </h3>
            <p className="mb-4">
              Our interview process typically includes an initial screening, one
              or more interviews with team members, and a final interview with
              leadership. We aim to make the process transparent and supportive.
            </p>
            <h3 className="font-bold mb-2">
              Do you offer internships or fellowships?
            </h3>
            <p>
              Yes, we offer a variety of internships and fellowships for
              students and early-career professionals. Check our programs page
              for more information.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Careers;