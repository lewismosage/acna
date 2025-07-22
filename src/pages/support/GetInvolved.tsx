import React from "react";
import { Link } from "react-router-dom";
import {
  HeartHandshake,
  UserPlus,
  GraduationCap,
  HandCoins,
  Users,
  Globe,
  Megaphone,
  Monitor,
  Mail,
  ArrowRight,
  Handshake,
} from "lucide-react";

const heroMainImg =
  "https://images.pexels.com/photos/3952234/pexels-photo-3952234.jpeg?auto=compress&w=600";
const heroSideImg1 =
  "https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&w=600";
const heroSideImg2 =
  "https://images.pexels.com/photos/3184396/pexels-photo-3184396.jpeg?auto=compress&w=600";

const GetInvolved = () => {
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
                How you can help
              </h1>
              <h2 className="text-lg md:text-xl font-bold mb-4 text-left">
                Not everyone can treat children with neurological conditions. But everyone can do something.
              </h2>
              <p className="text-gray-200 text-left mb-0">
                Some neurological challenges in Africa receive attention, many do not. Your support enables ACNA to respond swiftly and effectively, advancing education, research, and care for children who need it most. Every donation brings us closer to a continent where every child has access to the neurological care they deserve.
              </p>
            </div>
          </div>
          
          {/* Center: Full-height Main Image with overlay */}
          <div className="flex-1 relative min-h-[400px] lg:min-h-full">
            <div className="absolute inset-0 h-full">
              <img
                src={heroMainImg}
                alt="Support"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-black/30" />
              <div className="absolute bottom-0 left-0 p-8">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white mb-6 max-w-xs">
                  We need your support to continue this lifesaving work
                </h2>
                <Link
                  to="/donate"
                  className="inline-block bg-red-600 text-white px-8 py-3 rounded font-bold text-lg shadow hover:bg-red-700 transition-colors duration-200"
                >
                  DONATE
                </Link>
              </div>
            </div>
          </div>
          
          {/* Right: Full-height stacked cards */}
          <div className="flex flex-col gap-4 w-full lg:w-auto lg:min-h-full lg:justify-between py-8 lg:py-0">
            {/* Card 1 */}
            <div className="relative h-48 lg:h-[calc(50%-8px)] rounded overflow-hidden flex items-end">
              <img
                src={heroSideImg1}
                alt="Event"
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-black/40" />
              <div className="relative z-10 p-6 w-full">
                <h3 className="text-lg font-bold text-white mb-4">
                  Hear from our medical staff and experts
                </h3>
                <Link
                  to="/events"
                  className="inline-block border-2 border-white text-white px-4 py-2 rounded font-semibold text-sm hover:bg-white hover:text-black transition-colors duration-200"
                >
                  ATTEND AN EVENT
                </Link>
              </div>
            </div>
            
            {/* Card 2 */}
            <div className="relative h-48 lg:h-[calc(50%-8px)] rounded overflow-hidden flex items-end">
              <img
                src={heroSideImg2}
                alt="Fundraising"
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-black/40" />
              <div className="relative z-10 p-6 w-full">
                <h3 className="text-lg font-bold text-white mb-4">
                  Raise funds with friends
                </h3>
                <Link
                  to="/fundraising"
                  className="inline-block border-2 border-white text-white px-4 py-2 rounded font-semibold text-sm hover:bg-white hover:text-black transition-colors duration-200"
                >
                  EXPLORE FUNDRAISING
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ways to Get Involved */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Ways to Get Involved
            </h2>
            <div className="h-2 w-16 bg-red-600 mb-6 mx-auto" />
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Make a difference by joining, volunteering, donating, or
              partnering with ACNA.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Become a Member */}
            <div className="bg-blue-50 rounded-xl p-8 border border-blue-100 hover:shadow-lg transition-shadow duration-200 flex flex-col">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserPlus className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                Become a Member
              </h3>
              <p className="text-gray-600 mb-6 text-center flex-1">
                Join our network of child neurology professionals across Africa
                and access exclusive resources.
              </p>
              <div className="text-center">
                <Link
                  to="/membership"
                  className="inline-flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-lg text-md font-medium hover:bg-blue-700 transition-colors duration-200"
                >
                  Join ACNA
                  <HeartHandshake className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </div>
            {/* Volunteer */}
            <div className="bg-green-50 rounded-xl p-8 border border-green-100 hover:shadow-lg transition-shadow duration-200 flex flex-col">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <HeartHandshake className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                Volunteer
              </h3>
              <p className="text-gray-600 mb-6 text-center flex-1">
                Offer your skills and time to support our programs, research,
                and advocacy efforts.
              </p>
              <div className="text-center">
                <Link
                  to="/volunteer"
                  className="inline-flex items-center justify-center bg-green-600 text-white px-6 py-3 rounded-lg text-md font-medium hover:bg-green-700 transition-colors duration-200"
                >
                  Volunteer Opportunities
                  <Users className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </div>
            {/* Donate */}
            <div className="bg-purple-50 rounded-xl p-8 border border-purple-100 hover:shadow-lg transition-shadow duration-200 flex flex-col">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <HandCoins className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                Donate
              </h3>
              <p className="text-gray-600 mb-6 text-center flex-1">
                Support our mission to improve child neurology care through
                financial contributions.
              </p>
              <div className="text-center">
                <Link
                  to="/donate"
                  className="inline-flex items-center justify-center bg-purple-600 text-white px-6 py-3 rounded-lg text-md font-medium hover:bg-purple-700 transition-colors duration-200"
                >
                  Make a Donation
                  <HandCoins className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </div>
            {/* Partner */}
            <div className="bg-yellow-50 rounded-xl p-8 border border-yellow-100 hover:shadow-lg transition-shadow duration-200 flex flex-col">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                Partner With Us
              </h3>
              <p className="text-gray-600 mb-6 text-center flex-1">
                Collaborate with ACNA through institutional partnerships and
                corporate sponsorships.
              </p>
              <div className="text-center">
                <Link
                  to="/partnerships"
                  className="inline-flex items-center justify-center bg-yellow-600 text-white px-6 py-3 rounded-lg text-md font-medium hover:bg-yellow-700 transition-colors duration-200"
                >
                  Partnership Info
                  <Handshake className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </div>
            {/* Advocate */}
            <div className="bg-red-50 rounded-xl p-8 border border-red-100 hover:shadow-lg transition-shadow duration-200 flex flex-col">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Megaphone className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                Become an Advocate
              </h3>
              <p className="text-gray-600 mb-6 text-center flex-1">
                Help raise awareness about childhood neurological disorders in
                your community.
              </p>
              <div className="text-center">
                <Link
                  to="/advocacy"
                  className="inline-flex items-center justify-center bg-red-600 text-white px-6 py-3 rounded-lg text-md font-medium hover:bg-red-700 transition-colors duration-200"
                >
                  Advocacy Resources
                  <Megaphone className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </div>
            {/* Train */}
            <div className="bg-indigo-50 rounded-xl p-8 border border-indigo-100 hover:shadow-lg transition-shadow duration-200 flex flex-col">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <GraduationCap className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                Training Programs
              </h3>
              <p className="text-gray-600 mb-6 text-center flex-1">
                Participate in our educational programs to enhance your skills
                in pediatric neurology.
              </p>
              <div className="text-center">
                <Link
                  to="/training"
                  className="inline-flex items-center justify-center bg-indigo-600 text-white px-6 py-3 rounded-lg text-md font-medium hover:bg-indigo-700 transition-colors duration-200"
                >
                  View Programs
                  <GraduationCap className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Current Initiatives */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Urgent Initiatives Needing Support
            </h2>
            <div className="h-2 w-16 bg-red-600 mb-6 mx-auto" />
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Support our most pressing projects to expand care and training
              across Africa.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Telemedicine Program */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-blue-100">
              <div className="p-8">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <Monitor className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Telemedicine Network Expansion
                  </h3>
                </div>
                <p className="text-gray-600 mb-6">
                  Help us expand our telemedicine program to reach rural areas
                  where specialist care is unavailable.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/telemedicine"
                    className="flex-1 text-center bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                  >
                    Learn More
                  </Link>
                  <Link
                    to="/donate?cause=telemedicine"
                    className="flex-1 text-center border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors duration-200"
                  >
                    Donate
                  </Link>
                </div>
              </div>
            </div>
            {/* Training Center */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-green-100">
              <div className="p-8">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <GraduationCap className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Regional Training Centers
                  </h3>
                </div>
                <p className="text-gray-600 mb-6">
                  Support the establishment of regional training centers to
                  increase the number of pediatric neurologists in Africa.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/training-centers"
                    className="flex-1 text-center bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200"
                  >
                    Learn More
                  </Link>
                  <Link
                    to="/donate?cause=training"
                    className="flex-1 text-center border-2 border-green-600 text-green-600 px-6 py-3 rounded-lg font-medium hover:bg-green-50 transition-colors duration-200"
                  >
                    Donate
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Stories of Changed Lives
            </h2>
            <div className="h-2 w-16 bg-red-600 mb-6 mx-auto" />
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See how your involvement is making a real impact for children and
              families.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Story 1 */}
            <div className="bg-white border border-gray-200 rounded overflow-hidden hover:shadow-lg transition-shadow duration-200">
              <img
                src="https://images.pexels.com/photos/7578801/pexels-photo-7578801.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Doctor with child"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Training Changed My Practice
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  "The ACNA training program transformed how I diagnose and
                  treat childhood epilepsy in my rural clinic."
                </p>
                <Link
                  to="/stories/training-impact"
                  className="text-blue-600 font-medium hover:text-blue-700 inline-flex items-center"
                >
                  Read Full Story
                  <ArrowRight className="ml-1 w-4 h-4" />
                </Link>
              </div>
            </div>
            {/* Story 2 */}
            <div className="bg-white border border-gray-200 rounded overflow-hidden hover:shadow-lg transition-shadow duration-200">
              <img
                src="https://images.pexels.com/photos/5722163/pexels-photo-5722163.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Happy child"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  A Second Chance at Life
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  "Thanks to ACNA's telemedicine program, my daughter received
                  the specialist care she needed."
                </p>
                <Link
                  to="/stories/patient-story"
                  className="text-blue-600 font-medium hover:text-blue-700 inline-flex items-center"
                >
                  Read Full Story
                  <ArrowRight className="ml-1 w-4 h-4" />
                </Link>
              </div>
            </div>
            {/* Story 3 */}
            <div className="bg-white border border-gray-200 rounded overflow-hidden hover:shadow-lg transition-shadow duration-200">
              <img
                src="https://images.pexels.com/photos/6646986/pexels-photo-6646986.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Medical team"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Building a Continental Network
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  "Through ACNA, I've connected with colleagues across Africa to
                  collaborate on groundbreaking research."
                </p>
                <Link
                  to="/stories/research-collaboration"
                  className="text-blue-600 font-medium hover:text-blue-700 inline-flex items-center"
                >
                  Read Full Story
                  <ArrowRight className="ml-1 w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GetInvolved;
