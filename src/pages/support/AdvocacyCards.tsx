import React from 'react';
import { Link } from 'react-router-dom';
import { Megaphone, BookOpen } from 'lucide-react';

const AdvocacyCards = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Become an Advocate */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
              <Megaphone className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Become an Advocate
            </h3>
            <p className="text-gray-600 mb-6">
              Help raise awareness about childhood neurological disorders in your community.
            </p>
            <Link
              to="/advocacy"
              className="inline-flex items-center text-orange-600 font-medium hover:text-orange-700"
            >
              Advocacy Resources
              <BookOpen className="ml-2 w-5 h-5" />
            </Link>
          </div>
          
          {/* Training Programs */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
              <BookOpen className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Training Programs
            </h3>
            <p className="text-gray-600 mb-6">
              Participate in our educational programs to enhance your skills in pediatric neurology.
            </p>
            <Link
              to="/training-programs"
              className="inline-flex items-center text-orange-600 font-medium hover:text-orange-700"
            >
              View Programs
              <Megaphone className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdvocacyCards;