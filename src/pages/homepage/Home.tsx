import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, BookOpen, Calendar, Award, Search, Play, ChevronRight } from 'lucide-react';
import heroVideo from '../../assets/hero.video.mp4';

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
            Advancing Child <span className="text-yellow-300">Neurology</span> Across Africa
          </h1>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed drop-shadow max-w-2xl mx-auto">
            Join the Africa Child Neurology Association and be part of a pan-African community 
            dedicated to improving neurological care for children across the continent.
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Impact Across Africa</h2>
            <p className="text-xl text-gray-600">Key statistics highlighting our reach and the need for child neurology care</p>
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
                <div className="text-3xl font-bold text-red-600 mb-2">0.8-10 per 1000</div>
                <div className="text-gray-600">Children have Cerebral Palsy</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">Growing Need</div>
                <div className="text-gray-600">For specialized neurological care across Africa</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Empowering Child Neurology Excellence
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              ACNA provides comprehensive resources, networking opportunities, and professional development 
              for neurologists, researchers, and healthcare advocates across Africa.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Professional Network</h3>
              <p className="text-gray-600 mb-4">
                Connect with leading child neurologists and researchers across the African continent.
              </p>
              <Link to="#" className="text-blue-600 font-medium hover:text-blue-700 inline-flex items-center">
                Join Network <ChevronRight className="ml-1 w-4 h-4" />
              </Link>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-200">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Research & Publications</h3>
              <p className="text-gray-600 mb-4">
                Access cutting-edge research, clinical guidelines, and educational resources.
              </p>
              <Link to="#" className="text-blue-600 font-medium hover:text-blue-700 inline-flex items-center">
                Explore Research <ChevronRight className="ml-1 w-4 h-4" />
              </Link>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-200">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Events & Training</h3>
              <p className="text-gray-600 mb-4">
                Participate in conferences, workshops, and professional development programs.
              </p>
              <Link to="#" className="text-blue-600 font-medium hover:text-blue-700 inline-flex items-center">
                View Events <ChevronRight className="ml-1 w-4 h-4" />
              </Link>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-200">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-6">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Recognition & Awards</h3>
              <p className="text-gray-600 mb-4">
                Celebrate excellence in child neurology research, clinical care, and advocacy.
              </p>
              <Link to="#" className="text-blue-600 font-medium hover:text-blue-700 inline-flex items-center">
                Learn More <ChevronRight className="ml-1 w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Latest News */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Latest News & Updates</h2>
              <p className="text-xl text-gray-600">Stay informed about the latest developments in child neurology</p>
            </div>
            <Link to="#" className="text-blue-600 font-medium hover:text-blue-700 inline-flex items-center">
              View All News <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <article className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-200">
              <img
                src="https://images.pexels.com/photos/4021775/pexels-photo-4021775.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Conference"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="text-sm text-blue-600 font-medium mb-2">Conference Update</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  ACNA 2024 Annual Conference: Registration Now Open
                </h3>
                <p className="text-gray-600 mb-4">
                  Join us in Cape Town for three days of cutting-edge research presentations and networking.
                </p>
                <div className="text-sm text-gray-500">December 15, 2024</div>
              </div>
            </article>

            <article className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-200">
              <img
                src="https://images.pexels.com/photos/3825583/pexels-photo-3825583.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Research"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="text-sm text-green-600 font-medium mb-2">Research Publication</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  New Guidelines for Pediatric Epilepsy Management
                </h3>
                <p className="text-gray-600 mb-4">
                  ACNA releases updated clinical guidelines based on latest research and African context.
                </p>
                <div className="text-sm text-gray-500">December 10, 2024</div>
              </div>
            </article>

            <article className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-200">
              <img
                src="https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Award"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="text-sm text-yellow-600 font-medium mb-2">Award Announcement</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Dr. Sarah Mwaniki Receives Excellence Award
                </h3>
                <p className="text-gray-600 mb-4">
                  Recognizing outstanding contributions to pediatric neuroscience research in East Africa.
                </p>
                <div className="text-sm text-gray-500">December 5, 2024</div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Join Our Association?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Become part of Africa's leading professional association for child neurology. 
            Access exclusive resources, networking opportunities, and make a lasting impact.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="#"
              className="inline-flex items-center justify-center bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors duration-200"
            >
              Become a Member
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center justify-center border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-200"
            >
              Learn About ACNA
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;